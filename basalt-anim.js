/**
 * THERMO PLUS — FIRE TEST hero animation.
 *
 * Live demonstration of the brand promise:
 *   1. A real gas torch (PNG) is on the left.
 *   2. A real basalt-wool slab (PNG) is on the right.
 *   3. Between them, this script draws an animated blue propane flame jet
 *      that originates at the torch nozzle and impacts the slab edge.
 *   4. The slab glows orange where the flame hits, sparks bounce back…
 *      but the slab itself never catches fire.
 *
 * Anchors are taken from invisible <span data-flame-source/> and
 * <span data-flame-target/> markers placed inside the torch and slab
 * containers, so layout changes don't break the alignment.
 *
 * Implementation notes:
 *   • DPR-aware HiDPI canvas
 *   • delta-time game loop via requestAnimationFrame
 *   • IntersectionObserver + Page Visibility API for pause off-screen
 *   • ResizeObserver to keep anchors aligned
 *   • prefers-reduced-motion → single static frame
 */
(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const canvas = document.getElementById('basaltCanvas');
    if (!canvas) return;
    const scene = canvas.closest('.shield-scene') || canvas.parentElement;
    const srcEl = scene.querySelector('[data-flame-source]');
    const tgtEl = scene.querySelector('[data-flame-target]');
    if (!srcEl || !tgtEl) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let last = performance.now();
    const t0 = last;
    let onScreen = true;

    const src = { x: 0, y: 0 };
    const tgt = { x: 0, y: 0 };
    const sparks = [];
    const smoke = [];

    function updateAnchors() {
      const cRect = canvas.getBoundingClientRect();
      const sR = srcEl.getBoundingClientRect();
      const tR = tgtEl.getBoundingClientRect();
      src.x = (sR.left + sR.width  / 2) - cRect.left;
      src.y = (sR.top  + sR.height / 2) - cRect.top;
      tgt.x = (tR.left + tR.width  / 2) - cRect.left;
      tgt.y = (tR.top  + tR.height / 2) - cRect.top;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      updateAnchors();
    }

    // ─── FLAME BODY ─────────────────────────────────────────────────
    // Drawn as 4 stacked shapes (outer→core) along the source→target axis.
    // We rotate the coordinate system so the flame travels along +X.
    function drawFlame(time) {
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;
      const ang = Math.atan2(dy, dx);

      // Build flame contour points along the flame axis
      const steps = 28;
      const pts = new Array(steps + 1);
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const x = u * dist;
        // Width profile: thin at nozzle, fat in middle, flares at impact
        //   base 4 → up to 18 in middle, +6 flare at u=1
        const profile = 4 + Math.sin(u * Math.PI) * 14 + Math.pow(u, 4) * 6;
        // High-frequency flicker along length + low-freq breathing
        const flick = Math.sin(time * 0.012 + u * 8) * 1.4
                    + Math.sin(time * 0.007 + u * 3.2) * 1.1;
        // Slight vertical drift (only away from endpoints)
        const driftMask = Math.sin(u * Math.PI); // 0 at ends, 1 in middle
        const drift = Math.sin(time * 0.006 + u * 4) * 1.6 * driftMask;
        pts[i] = { x, w: profile + flick, y: drift };
      }

      ctx.save();
      ctx.translate(src.x, src.y);
      ctx.rotate(ang);
      ctx.globalCompositeOperation = 'lighter';

      // Outer halo — soft cyan/blue glow
      ctx.shadowColor = 'rgba(80, 160, 255, 0.55)';
      ctx.shadowBlur = 16;
      drawContour(pts, 1.30, 'rgba(100, 170, 255, 0.40)');
      ctx.shadowBlur = 0;

      // Outer flame — pale blue
      drawContour(pts, 1.00, 'rgba(140, 195, 255, 0.65)');
      // Mid flame — deeper blue
      drawContour(pts, 0.72, 'rgba(70, 135, 255, 0.85)');
      // Inner cone — bright cyan/white
      drawContour(pts, 0.45, 'rgba(210, 240, 255, 0.95)');
      // White-hot core — narrow
      drawContour(pts, 0.22, 'rgba(255, 255, 255, 1.0)');

      // Tip flare — slight yellow/orange at impact (incomplete combustion zone)
      ctx.fillStyle = 'rgba(255, 200, 110, 0.45)';
      const tipR = 14 + Math.sin(time * 0.011) * 2;
      const gTip = ctx.createRadialGradient(dist, 0, 0, dist, 0, tipR);
      gTip.addColorStop(0, 'rgba(255, 230, 160, 0.85)');
      gTip.addColorStop(1, 'rgba(255, 130, 50, 0)');
      ctx.fillStyle = gTip;
      ctx.beginPath();
      ctx.arc(dist, 0, tipR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawContour(pts, scale, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y - pts[0].w * scale);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y - pts[i].w * scale);
      }
      for (let i = pts.length - 1; i >= 0; i--) {
        ctx.lineTo(pts[i].x, pts[i].y + pts[i].w * scale);
      }
      ctx.closePath();
      ctx.fill();
    }

    // ─── IMPACT GLOW ────────────────────────────────────────────────
    // Hot spot on the slab where the flame hits — pulsing orange halo
    function drawImpact(time) {
      const pulse = 0.85 + 0.15 * Math.sin(time * 0.008);
      const r = 60 * pulse;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Outer warm halo
      const halo = ctx.createRadialGradient(tgt.x, tgt.y, 0, tgt.x, tgt.y, r);
      halo.addColorStop(0.00, 'rgba(255, 180, 80, 0.55)');
      halo.addColorStop(0.45, 'rgba(255, 90, 40, 0.30)');
      halo.addColorStop(1.00, 'rgba(255, 60, 20, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Bright orange core
      const coreR = 22 * pulse;
      const core = ctx.createRadialGradient(tgt.x, tgt.y, 0, tgt.x, tgt.y, coreR);
      core.addColorStop(0, 'rgba(255, 240, 200, 0.95)');
      core.addColorStop(1, 'rgba(255, 130, 50, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(tgt.x, tgt.y, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ─── SPARKS (bouncing back from the slab — wool deflects fire) ──
    function spawnSpark() {
      // Sparks originate near the impact point, bounce back to the left
      const dx = src.x - tgt.x;
      const dy = src.y - tgt.y;
      const ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.4;
      const speed = 0.10 + Math.random() * 0.18;
      sparks.push({
        x: tgt.x + (Math.random() - 0.5) * 8,
        y: tgt.y + (Math.random() - 0.5) * 8,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 1,
        size: 0.6 + Math.random() * 1.7,
        decay: 0.0012 + Math.random() * 0.0010,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    function drawSparks(dt) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // mild gravity
        s.vy += 0.00010 * dt;
        s.life -= s.decay * dt;
        s.twinkle += dt * 0.005;
        if (s.life <= 0 || s.x < -20 || s.y > H + 30) { sparks.splice(i, 1); continue; }
        const a = s.life * (0.6 + 0.4 * Math.sin(s.twinkle));

        const rg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 6);
        rg.addColorStop(0,    `rgba(255, 220, 150, ${a})`);
        rg.addColorStop(0.45, `rgba(255, 110, 45, ${a * 0.55})`);
        rg.addColorStop(1,    'rgba(255, 60, 20, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 245, 215, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── SMOKE WISPS rising from the impact point ──────────────────
    function spawnSmoke() {
      smoke.push({
        x: tgt.x + (Math.random() - 0.5) * 6,
        y: tgt.y,
        vx: -0.005 - Math.random() * 0.010,
        vy: -0.020 - Math.random() * 0.025,
        r: 4 + Math.random() * 4,
        grow: 0.012 + Math.random() * 0.014,
        life: 1,
        decay: 0.00055 + Math.random() * 0.00040
      });
    }
    function drawSmoke(dt) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.grow * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) { smoke.splice(i, 1); continue; }
        const a = Math.max(0, p.life) * 0.35;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(200, 200, 210, ${a})`);
        g.addColorStop(1, 'rgba(180, 180, 195, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ─── FRAME LOOP ─────────────────────────────────────────────────
    let sparkClock = 0;
    let smokeClock = 0;
    function frame(now) {
      const dt = Math.min(50, now - last);
      last = now;
      const time = now - t0;

      if (onScreen && document.visibilityState !== 'hidden') {
        ctx.clearRect(0, 0, W, H);

        // Glow from torch nozzle (subtle blue halo at source)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const srcGlow = ctx.createRadialGradient(src.x, src.y, 0, src.x, src.y, 26);
        srcGlow.addColorStop(0, 'rgba(120, 190, 255, 0.55)');
        srcGlow.addColorStop(1, 'rgba(80, 140, 255, 0)');
        ctx.fillStyle = srcGlow;
        ctx.beginPath();
        ctx.arc(src.x, src.y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        drawFlame(time);
        drawImpact(time);
        drawSmoke(dt);
        drawSparks(dt);

        // Spawn sparks at ~120 ms intervals
        sparkClock += dt;
        if (sparkClock > 90 + Math.random() * 90) {
          for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) spawnSpark();
          sparkClock = 0;
        }
        // Spawn smoke puffs at ~280 ms intervals
        smokeClock += dt;
        if (smokeClock > 260 + Math.random() * 220) {
          spawnSmoke();
          smokeClock = 0;
        }
      }
      requestAnimationFrame(frame);
    }

    // ─── OBSERVERS ──────────────────────────────────────────────────
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(canvas);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => resize()).observe(scene);
    } else {
      window.addEventListener('resize', resize);
    }
    window.addEventListener('load', resize);
    document.addEventListener('visibilitychange', () => {
      last = performance.now();
    });

    // Re-anchor once images finish loading (their layout will shift)
    scene.querySelectorAll('img').forEach(img => {
      if (!img.complete) img.addEventListener('load', updateAnchors, { once: true });
    });

    // ─── BOOT ───────────────────────────────────────────────────────
    resize();
    if (reduced) {
      ctx.clearRect(0, 0, W, H);
      drawFlame(0);
      drawImpact(0);
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
