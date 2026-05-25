/**
 * BASALT SHIELD — hero animation for Thermo Plus
 *
 * Tells the brand story visually:
 *   – Bottom of canvas:  raging fire (the threat)
 *   – Middle of canvas:  thick basalt-wool barrier (the product)
 *   – Top of canvas:     clean, cool, protected air (the promise)
 *
 * Flames lick upward but cannot pass the wool — embers that try to rise
 * are absorbed by the fibers and dissipate into small puffs.
 *
 * Implementation highlights:
 *   • Wool layer is pre-rendered ONCE to an offscreen canvas
 *     (hundreds of short curved fibers in tan/amber tones — real basalt-wool look)
 *   • Flames are drawn as 4-stack teardrop bezier shapes
 *     (deep red → orange → yellow → white-hot core, additive blending)
 *   • Embers physically rise; on entering the wool zone, life decays fast,
 *     velocity is damped, and small puffs spawn — visual "absorption"
 *   • DPR-aware, delta-time loop, IntersectionObserver + Visibility API,
 *     ResizeObserver, prefers-reduced-motion (single static frame)
 */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const canvas = document.getElementById('basaltCanvas');
    if (!canvas) return;
    const host = canvas.parentElement;
    const interactHost = canvas.closest('.hero') || host;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let running = true, onScreen = true;
    let last = performance.now();
    const t0 = last;

    // Offscreen wool texture
    const wool = document.createElement('canvas');
    const wctx = wool.getContext('2d');

    // Vertical layout (fractions of H)
    const layout = { coolEnd: 0, woolTop: 0, woolBottom: 0, fireTop: 0 };

    let flames = [];
    let embers = [];
    let puffs = [];
    const pointer = { x: -1, y: -1, intensity: 0 };

    const rand = (a, b) => a + Math.random() * (b - a);

    // ─── RESIZE / LAYOUT ────────────────────────────────────────────
    function resize() {
      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      layout.coolEnd    = H * 0.34;
      layout.woolTop    = H * 0.34;
      layout.woolBottom = H * 0.60;
      layout.fireTop    = H * 0.60;

      renderWoolTexture();
      makeFlames();
      makeEmbers();
      puffs = [];
    }

    // ─── WOOL TEXTURE (pre-rendered once per resize) ────────────────
    function renderWoolTexture() {
      const w = W;
      const h = Math.max(40, layout.woolBottom - layout.woolTop);
      wool.width  = Math.round(w * DPR);
      wool.height = Math.round(h * DPR);
      wctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      wctx.clearRect(0, 0, w, h);

      // Base band — warm amber/tan gradient (real basalt-wool color)
      const base = wctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0.00, '#704321');
      base.addColorStop(0.40, '#A07037');
      base.addColorStop(0.70, '#7A5022');
      base.addColorStop(1.00, '#4D2E11');
      wctx.fillStyle = base;
      wctx.fillRect(0, 0, w, h);

      // Tangled fibers — hundreds of short bezier strokes
      const fiberCount = Math.round(w * h / 26);
      wctx.lineCap = 'round';
      for (let i = 0; i < fiberCount; i++) {
        const x0 = Math.random() * w;
        const y0 = Math.random() * h;
        const len = 5 + Math.random() * 28;
        const ang = (Math.random() - 0.5) * 2.0; // mostly horizontal-ish
        const x1 = x0 + Math.cos(ang) * len;
        const y1 = y0 + Math.sin(ang) * len;
        const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 9;
        const my = (y0 + y1) / 2 + (Math.random() - 0.5) * 9;
        const shade = 0.30 + Math.random() * 0.55;
        const r = Math.random();
        if (r > 0.78) {
          wctx.strokeStyle = `rgba(240, 200, 130, ${shade})`;       // highlight
        } else if (r > 0.45) {
          wctx.strokeStyle = `rgba(170, 110, 50, ${shade * 0.9})`;  // mid tan
        } else {
          wctx.strokeStyle = `rgba(50, 26, 10, ${shade * 0.85})`;   // shadow
        }
        wctx.lineWidth = 0.5 + Math.random() * 1.6;
        wctx.beginPath();
        wctx.moveTo(x0, y0);
        wctx.quadraticCurveTo(mx, my, x1, y1);
        wctx.stroke();
      }

      // A few longer "stray" fibers poking out the top — gives that
      // fuzzy mineral-wool surface
      for (let i = 0; i < Math.round(w / 14); i++) {
        const x = Math.random() * w;
        const baseY = 6 + Math.random() * 4;
        const len = 10 + Math.random() * 18;
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const x1 = x + Math.cos(ang) * len;
        const y1 = baseY + Math.sin(ang) * len;
        wctx.strokeStyle = Math.random() > 0.5
          ? `rgba(220, 175, 110, ${0.55 + Math.random() * 0.35})`
          : `rgba(80, 48, 20, ${0.45 + Math.random() * 0.35})`;
        wctx.lineWidth = 0.6 + Math.random() * 1.1;
        wctx.beginPath();
        wctx.moveTo(x, baseY);
        wctx.quadraticCurveTo(x + (Math.random() - 0.5) * 6, (baseY + y1) / 2, x1, y1);
        wctx.stroke();
      }

      // Feathered alpha on edges so wool blends with cool air (top) and
      // bleeds slightly into the hot rim (bottom)
      wctx.globalCompositeOperation = 'destination-out';
      const gTop = wctx.createLinearGradient(0, 0, 0, 22);
      gTop.addColorStop(0, 'rgba(0,0,0,0.80)');
      gTop.addColorStop(1, 'rgba(0,0,0,0)');
      wctx.fillStyle = gTop;
      wctx.fillRect(0, 0, w, 22);

      const gBot = wctx.createLinearGradient(0, h - 16, 0, h);
      gBot.addColorStop(0, 'rgba(0,0,0,0)');
      gBot.addColorStop(1, 'rgba(0,0,0,0.55)');
      wctx.fillStyle = gBot;
      wctx.fillRect(0, h - 16, w, 16);
      wctx.globalCompositeOperation = 'source-over';
    }

    // ─── FLAMES ─────────────────────────────────────────────────────
    function makeFlames() {
      flames = [];
      const count = Math.max(7, Math.round(W / 78));
      for (let i = 0; i < count; i++) {
        flames.push({
          x: (i + 0.5) * (W / count) + rand(-12, 12),
          baseW: rand(28, 56),
          height: rand(0.55, 0.95),     // fraction of fire region height
          phase: rand(0, Math.PI * 2),
          speed: rand(0.0009, 0.0017),
          twist: rand(0.30, 0.85),
          flickerSeed: rand(0, 10)
        });
      }
    }

    function drawTeardrop(baseX, baseY, halfB, apexX, apexY, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(baseX - halfB, baseY);
      ctx.bezierCurveTo(
        baseX - halfB * 1.4, baseY - (baseY - apexY) * 0.35,
        apexX - halfB * 0.55, apexY + (baseY - apexY) * 0.25,
        apexX, apexY
      );
      ctx.bezierCurveTo(
        apexX + halfB * 0.55, apexY + (baseY - apexY) * 0.25,
        baseX + halfB * 1.4, baseY - (baseY - apexY) * 0.35,
        baseX + halfB, baseY
      );
      ctx.closePath();
      ctx.fill();
    }

    function drawFlames(time) {
      // Base orange glow filling the fire region
      const fireTop = layout.fireTop;
      const fireH = H - fireTop;
      const g = ctx.createLinearGradient(0, fireTop, 0, H);
      g.addColorStop(0.00, 'rgba(199, 18, 25, 0.06)');
      g.addColorStop(0.40, 'rgba(255, 80, 30, 0.28)');
      g.addColorStop(1.00, 'rgba(255, 130, 60, 0.65)');
      ctx.fillStyle = g;
      ctx.fillRect(0, fireTop, W, fireH);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const baseY = H + 2;
      flames.forEach(f => {
        const tt = time * f.speed + f.phase;
        const flicker = (0.82 + 0.18 * Math.sin(tt * 3.2 + f.flickerSeed))
                      * (0.92 + 0.08 * Math.sin(tt * 7.7));
        const flameH = fireH * f.height * flicker;
        const top = baseY - flameH;
        const halfB = f.baseW / 2;
        const apexX = f.x + Math.sin(tt * 1.4) * 14 * f.twist;

        drawTeardrop(f.x, baseY, halfB * 1.10, apexX, top - 6,
          'rgba(199, 18, 25, 0.55)');
        drawTeardrop(f.x, baseY, halfB * 0.78, apexX, top + flameH * 0.10,
          'rgba(255, 100, 40, 0.80)');
        drawTeardrop(f.x, baseY, halfB * 0.52, apexX, top + flameH * 0.28,
          'rgba(255, 195, 90, 0.95)');
        drawTeardrop(f.x, baseY, halfB * 0.26, apexX, top + flameH * 0.45,
          'rgba(255, 240, 200, 1.0)');
      });

      ctx.restore();
    }

    // ─── EMBERS ─────────────────────────────────────────────────────
    function makeEmbers() {
      embers = [];
      const target = Math.max(22, Math.min(48, Math.round(W / 22)));
      for (let i = 0; i < target; i++) embers.push(spawnEmber(true));
    }

    function spawnEmber(initial) {
      return {
        x: rand(0, W),
        y: initial ? rand(layout.fireTop + 20, H - 6) : H + rand(0, 30),
        vy: -rand(20, 56) / 1000,
        vx: rand(-18, 18) / 1000,
        size: rand(0.7, 2.4),
        life: 1,
        twinkle: rand(0, Math.PI * 2)
      };
    }

    function spawnPuff(x, y) {
      puffs.push({
        x, y,
        r: 1,
        life: 1,
        decay: rand(0.0018, 0.0028),
        grow: rand(0.05, 0.09)
      });
    }

    function drawEmbers(dt, time) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.twinkle += dt * 0.004;

        // Distance below wool bottom edge (positive when ember is still below)
        const distToBarrier = e.y - layout.woolBottom;
        let absorbing = false;

        if (distToBarrier < 14) {
          // Approaching/inside wool — accelerated decay + horizontal damping
          // (visually: the ember is being trapped by the fibers)
          const closeness = Math.max(0, 1 - distToBarrier / 14);
          e.life -= (0.0008 + 0.005 * closeness) * dt;
          e.vx *= 0.96;
          e.vy *= 0.985;
          absorbing = true;

          // Random small puff at the moment of absorption
          if (distToBarrier < 4 && Math.random() < 0.07) {
            spawnPuff(e.x, layout.woolBottom + rand(-2, 2));
          }
        } else {
          e.life -= 0.00045 * dt;
        }

        // Recycle if dead or out of bounds (above wool top = absorbed)
        if (e.life <= 0 || e.y < layout.woolTop + 4 || e.x < -6 || e.x > W + 6) {
          embers[i] = spawnEmber(false);
          continue;
        }

        const alpha = Math.max(0, e.life) * (0.55 + 0.45 * Math.sin(e.twinkle));
        const r = e.size * (absorbing ? 0.85 : 1);

        const rg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 7);
        rg.addColorStop(0.00, `rgba(255, 230, 170, ${alpha})`);
        rg.addColorStop(0.35, `rgba(255, 110, 45, ${alpha * 0.55})`);
        rg.addColorStop(1.00, `rgba(199, 18, 25, 0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 245, 215, ${alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawPuffs(dt) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.r += p.grow * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) { puffs.splice(i, 1); continue; }
        const a = Math.max(0, p.life);
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        rg.addColorStop(0.0, `rgba(255, 210, 140, ${a * 0.55})`);
        rg.addColorStop(1.0, `rgba(255, 100, 40, 0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── COOL SAFE ZONE (top) ───────────────────────────────────────
    function drawCool() {
      const g = ctx.createLinearGradient(0, 0, 0, layout.coolEnd);
      g.addColorStop(0.00, 'rgba(150, 195, 225, 0.20)');
      g.addColorStop(0.70, 'rgba(150, 195, 225, 0.05)');
      g.addColorStop(1.00, 'rgba(150, 195, 225, 0.00)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, layout.coolEnd);
    }

    // ─── WOOL LAYER (the shield) ────────────────────────────────────
    function drawWool(time) {
      // Hot rim immediately below wool — fire pressing against the barrier
      const rimY = layout.woolBottom - 4;
      const rimH = 36;
      const rim = ctx.createLinearGradient(0, rimY, 0, rimY + rimH);
      rim.addColorStop(0, 'rgba(255, 110, 45, 0.50)');
      rim.addColorStop(1, 'rgba(255, 110, 45, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rim;
      ctx.fillRect(0, rimY, W, rimH);

      // Subtle horizontal "heat wave" pulse on the rim
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.0028);
      ctx.fillStyle = `rgba(255, 80, 30, ${0.18 * pulse})`;
      ctx.fillRect(0, rimY + 2, W, 4);
      ctx.restore();

      // The wool texture itself (fully opaque except feathered edges)
      ctx.drawImage(wool, 0, layout.woolTop, W, layout.woolBottom - layout.woolTop);

      // Subtle warm tint on the wool's bottom 1/3 (heating up but not burning)
      const heat = ctx.createLinearGradient(0, layout.woolTop + (layout.woolBottom - layout.woolTop) * 0.6, 0, layout.woolBottom);
      heat.addColorStop(0, 'rgba(255, 90, 35, 0)');
      heat.addColorStop(1, 'rgba(255, 90, 35, 0.18)');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = heat;
      ctx.fillRect(0, layout.woolTop, W, layout.woolBottom - layout.woolTop);
      ctx.restore();
    }

    // ─── MAIN FRAME ─────────────────────────────────────────────────
    function frame(now) {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      const time = now - t0;

      if (onScreen && document.visibilityState !== 'hidden') {
        ctx.clearRect(0, 0, W, H);
        drawCool();
        drawFlames(time);
        drawEmbers(dt, time);
        drawPuffs(dt);
        drawWool(time);
        pointer.intensity *= 0.95;
      }
      requestAnimationFrame(frame);
    }

    // ─── INTERACTION ────────────────────────────────────────────────
    // Move pointer near the wool → fan the flames (slight burst)
    function onPointer(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.x = x; pointer.y = y;
      pointer.intensity = Math.min(1, pointer.intensity + 0.4);

      // Pointer near the wool boundary spawns a small puff (interactive feedback)
      if (Math.abs(y - layout.woolBottom) < 22 && Math.random() < 0.25) {
        spawnPuff(x, layout.woolBottom + rand(-3, 3));
      }
    }
    function onLeave() { pointer.x = pointer.y = -1; }
    interactHost.addEventListener('pointermove', onPointer, { passive: true });
    interactHost.addEventListener('pointerleave', onLeave, { passive: true });

    // ─── OBSERVERS ──────────────────────────────────────────────────
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(canvas);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => resize()).observe(host);
    } else {
      window.addEventListener('resize', resize);
    }
    document.addEventListener('visibilitychange', () => {
      last = performance.now();
    });

    // ─── BOOT ───────────────────────────────────────────────────────
    resize();
    if (reduced) {
      ctx.clearRect(0, 0, W, H);
      drawCool();
      drawFlames(0);
      drawWool(0);
    } else {
      requestAnimationFrame(frame);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
