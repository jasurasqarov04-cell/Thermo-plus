/**
 * BASALT FORGE — hero animation for Thermo Plus
 *
 * Sophisticated multi-layered canvas animation:
 *  • Layer 0: Breathing heat haze (gradient)
 *  • Layer 1: Hexagonal basalt columns rising from bottom (the rock)
 *  • Layer 2: Flowing molten fibers — basalt spun into wool (the brand)
 *  • Layer 3: Embers & sparks drifting upward (the heat)
 *  • Pointer interaction — strands bend, columns glow, embers attract
 *
 * Tech:
 *  - DPR-aware HiDPI rendering
 *  - delta-time game loop via requestAnimationFrame
 *  - IntersectionObserver + Page Visibility API for pause when off-screen
 *  - ResizeObserver for layout-aware resize
 *  - prefers-reduced-motion respected (single frame, no loop)
 */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const canvas = document.getElementById('basaltCanvas');
    if (!canvas) return;
    const host = canvas.parentElement;
    // Wide interaction area: catch pointer over the whole hero, not just the bg layer
    const interactHost = canvas.closest('.hero') || host;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let running = true;
    let onScreen = true;
    let last = performance.now();
    let t0 = last;

    const pointer = { x: -1, y: -1, vx: 0, vy: 0, intensity: 0 };
    let prevPx = -1, prevPy = -1;

    // ─── COLOR PALETTE ─────────────────────────────────────────────
    const C = {
      bgTop:    'rgba(20, 12, 8, 0)',
      bgBottom: 'rgba(199, 18, 25, 0.10)',
      column:   'rgba(31, 24, 20, 0.55)',
      columnEdge: 'rgba(255, 107, 53, 0.18)',
      coreFiber: [255, 196, 122],
      hotFiber:  [255, 107, 53],
      deepFiber: [199, 18, 25],
      ember:     [255, 196, 122]
    };

    // ─── HEX COLUMNS (basalt rock formations) ──────────────────────
    let columns = [];
    function makeColumns() {
      columns = [];
      const target = Math.max(7, Math.round(W / 78));
      for (let i = 0; i < target; i++) {
        const cx = (i + 0.5) * (W / target) + rand(-12, 12);
        const baseW = rand(28, 52);
        const baseH = rand(H * 0.22, H * 0.62);
        columns.push({
          x: cx,
          w: baseW,
          h: baseH,
          phase: rand(0, Math.PI * 2),
          breathe: rand(0.0005, 0.0011),
          amp: rand(2, 5),
          hueShift: rand(-12, 12)
        });
      }
    }

    // ─── MOLTEN FIBERS (the wool strands) ───────────────────────────
    let strands = [];
    function makeStrands() {
      strands = [];
      const count = 7;
      for (let i = 0; i < count; i++) {
        const k = i / (count - 1);
        strands.push({
          baseY: H * (0.18 + k * 0.55),
          amp: rand(10, 28),
          freq: rand(1.4, 2.6),
          speed: rand(0.00035, 0.00085),
          phase: rand(0, Math.PI * 2),
          thickness: rand(1.4, 2.6) * (1 + (1 - Math.abs(k - 0.5)) * 0.4),
          opacity: rand(0.55, 0.92),
          twist: rand(-0.18, 0.18)
        });
      }
    }

    // ─── EMBERS (drifting sparks) ───────────────────────────────────
    let embers = [];
    function makeEmbers() {
      embers = [];
      const target = Math.max(22, Math.min(48, Math.round(W * H / 18000)));
      for (let i = 0; i < target; i++) {
        embers.push(spawnEmber(true));
      }
    }
    function spawnEmber(initial) {
      return {
        x: rand(0, W),
        y: initial ? rand(0, H) : H + rand(8, 80),
        vy: -rand(14, 46) / 1000,
        vx: rand(-14, 14) / 1000,
        size: rand(0.7, 2.8),
        life: initial ? rand(0.2, 1) : 1,
        decay: rand(0.00028, 0.00065),
        twinkle: rand(0, Math.PI * 2),
        tspeed: rand(0.002, 0.005)
      };
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    // ─── RESIZE ─────────────────────────────────────────────────────
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
      makeColumns();
      makeStrands();
      makeEmbers();
    }

    // ─── DRAW: heat haze ────────────────────────────────────────────
    function drawHaze(time) {
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.0006);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,    C.bgTop);
      g.addColorStop(0.55, 'rgba(199,18,25,' + (0.04 + breathe * 0.05) + ')');
      g.addColorStop(1,    'rgba(255,107,53,' + (0.10 + breathe * 0.08) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // pointer hot spot
      if (pointer.x >= 0 && pointer.intensity > 0.01) {
        const rg = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180);
        rg.addColorStop(0, 'rgba(255,180,80,' + (0.25 * pointer.intensity) + ')');
        rg.addColorStop(0.5, 'rgba(199,18,25,' + (0.10 * pointer.intensity) + ')');
        rg.addColorStop(1, 'rgba(199,18,25,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // ─── DRAW: basalt hexagonal columns ─────────────────────────────
    function hexTop(cx, baseY, w) {
      // hex top: a small chevron — gives that distinctive basalt-column silhouette
      const halfW = w / 2;
      const peak = w * 0.18;
      ctx.beginPath();
      ctx.moveTo(cx - halfW, baseY);
      ctx.lineTo(cx - halfW * 0.6, baseY - peak);
      ctx.lineTo(cx,               baseY - peak * 1.35);
      ctx.lineTo(cx + halfW * 0.6, baseY - peak);
      ctx.lineTo(cx + halfW, baseY);
      ctx.closePath();
    }
    function drawColumns(time) {
      const groundY = H + 4;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      columns.forEach(col => {
        const breathe = Math.sin(col.phase + time * col.breathe) * col.amp;
        const topY = groundY - col.h + breathe;
        const halfW = col.w / 2;

        // pointer glow influence — columns near pointer light up at top
        let glow = 0;
        if (pointer.x >= 0) {
          const dx = col.x - pointer.x;
          const dy = topY - pointer.y;
          const d = Math.hypot(dx, dy);
          glow = Math.max(0, 1 - d / 240) * pointer.intensity;
        }

        // body fill — vertical gradient (dark stone → faintly hot at top edge)
        const g = ctx.createLinearGradient(0, topY, 0, groundY);
        g.addColorStop(0,    `rgba(255,107,53,${0.18 + glow * 0.35})`);
        g.addColorStop(0.08, `rgba(60,32,22,${0.65 + glow * 0.20})`);
        g.addColorStop(0.55, `rgba(31,24,20,0.55)`);
        g.addColorStop(1,    `rgba(15,11,9,0.92)`);
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.moveTo(col.x - halfW, topY);
        // hex top
        ctx.lineTo(col.x - halfW * 0.6, topY - col.w * 0.18);
        ctx.lineTo(col.x,               topY - col.w * 0.27);
        ctx.lineTo(col.x + halfW * 0.6, topY - col.w * 0.18);
        ctx.lineTo(col.x + halfW, topY);
        // sides
        ctx.lineTo(col.x + halfW, groundY);
        ctx.lineTo(col.x - halfW, groundY);
        ctx.closePath();
        ctx.fill();

        // hot edge highlight on top chevron
        ctx.strokeStyle = `rgba(255,107,53,${0.25 + glow * 0.55})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(col.x - halfW * 0.6, topY - col.w * 0.18);
        ctx.lineTo(col.x,               topY - col.w * 0.27);
        ctx.lineTo(col.x + halfW * 0.6, topY - col.w * 0.18);
        ctx.stroke();

        // subtle inner vertical seam — basalt has cracks
        ctx.strokeStyle = `rgba(0,0,0,0.35)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(col.x - halfW * 0.4, topY + 4);
        ctx.lineTo(col.x - halfW * 0.4, groundY);
        ctx.moveTo(col.x + halfW * 0.4, topY + 4);
        ctx.lineTo(col.x + halfW * 0.4, groundY);
        ctx.stroke();
      });
      ctx.restore();
    }

    // ─── DRAW: molten fiber strands ─────────────────────────────────
    function drawStrands(time) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // additive — fire-like
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      strands.forEach((s, idx) => {
        const phase = s.phase + time * s.speed;
        const baseY = s.baseY;

        // Build path through computed points
        const pts = [];
        const step = Math.max(10, W / 80);
        for (let x = -20; x <= W + 20; x += step) {
          const u = x / W;
          // double sine + cross-modulation gives organic strand shape
          let y = baseY
                + Math.sin(u * Math.PI * 2 * s.freq + phase) * s.amp
                + Math.sin(u * Math.PI * 5 + phase * 0.6) * s.amp * 0.35
                + Math.cos(u * Math.PI * 3 + phase * 0.3 + idx) * s.amp * 0.18;

          // pointer bend — strands repel away from pointer
          if (pointer.x >= 0 && pointer.intensity > 0.02) {
            const dx = x - pointer.x;
            const dy = baseY - pointer.y;
            const dist = Math.hypot(dx, dy);
            const reach = 220;
            if (dist < reach) {
              const f = (1 - dist / reach) * pointer.intensity * 32;
              y += Math.sign(dy || 1) * f;
            }
          }
          pts.push([x, y]);
        }

        // outer glow (deep red)
        ctx.shadowColor = `rgba(199,18,25,${s.opacity * 0.55})`;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = `rgba(${C.deepFiber.join(',')},${s.opacity * 0.6})`;
        ctx.lineWidth = s.thickness * 2.6;
        strokeSmooth(pts);

        // mid (hot orange)
        ctx.shadowBlur = 6;
        ctx.strokeStyle = `rgba(${C.hotFiber.join(',')},${s.opacity * 0.85})`;
        ctx.lineWidth = s.thickness * 1.6;
        strokeSmooth(pts);

        // bright core
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${C.coreFiber.join(',')},${s.opacity})`;
        ctx.lineWidth = s.thickness * 0.7;
        strokeSmooth(pts);
      });
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function strokeSmooth(pts) {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[i + 1];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.quadraticCurveTo(x1, y1, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last[0], last[1]);
      ctx.stroke();
    }

    // ─── DRAW: embers ───────────────────────────────────────────────
    function drawEmbers(dt, time) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];

        // pointer attraction — embers veer slightly toward pointer
        if (pointer.x >= 0 && pointer.intensity > 0.02) {
          const dx = pointer.x - e.x;
          const dy = pointer.y - e.y;
          const d = Math.hypot(dx, dy);
          if (d < 180) {
            const pull = (1 - d / 180) * pointer.intensity * 0.00005;
            e.vx += dx * pull;
            e.vy += dy * pull;
          }
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.life -= e.decay * dt;
        e.twinkle += e.tspeed * dt;

        if (e.life <= 0 || e.y < -12 || e.x < -12 || e.x > W + 12) {
          embers[i] = spawnEmber(false);
          continue;
        }

        const alpha = Math.max(0, e.life) * (0.55 + 0.45 * Math.sin(e.twinkle));
        const r = e.size;

        // outer halo
        const rg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 7);
        rg.addColorStop(0,    `rgba(255,220,160,${alpha})`);
        rg.addColorStop(0.35, `rgba(255,107,53,${alpha * 0.65})`);
        rg.addColorStop(1,    `rgba(199,18,25,0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 7, 0, Math.PI * 2);
        ctx.fill();

        // bright core
        ctx.fillStyle = `rgba(255,240,210,${alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── FRAME LOOP ─────────────────────────────────────────────────
    function frame(now) {
      if (!running) return;
      const dt = Math.min(50, now - last);
      last = now;
      const time = now - t0;

      if (onScreen && document.visibilityState !== 'hidden') {
        ctx.clearRect(0, 0, W, H);
        drawHaze(time);
        drawColumns(time);
        drawStrands(time);
        drawEmbers(dt, time);

        // gentle decay of pointer intensity
        pointer.intensity *= 0.965;
        if (pointer.intensity < 0.005) pointer.intensity = 0;
      }
      requestAnimationFrame(frame);
    }

    // ─── POINTER INTERACTION ────────────────────────────────────────
    function onPointer(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (prevPx >= 0) {
        pointer.vx = x - prevPx;
        pointer.vy = y - prevPy;
      }
      prevPx = x; prevPy = y;
      pointer.x = x; pointer.y = y;
      pointer.intensity = Math.min(1, pointer.intensity + 0.55);
    }
    function onLeave() {
      pointer.x = pointer.y = -1;
      prevPx = prevPy = -1;
    }
    interactHost.addEventListener('pointermove', onPointer, { passive: true });
    interactHost.addEventListener('pointerleave', onLeave, { passive: true });

    // ─── VISIBILITY OBSERVERS ───────────────────────────────────────
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
      }, { threshold: 0 });
      io.observe(canvas);
    }
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => resize());
      ro.observe(host);
    } else {
      window.addEventListener('resize', resize);
    }
    document.addEventListener('visibilitychange', () => { last = performance.now(); });

    // ─── BOOT ───────────────────────────────────────────────────────
    resize();
    if (reduced) {
      const now = performance.now();
      ctx.clearRect(0, 0, W, H);
      drawHaze(now);
      drawColumns(now);
      drawStrands(now);
      // single static frame, no loop
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
