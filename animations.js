// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Animations & Parallax engine
// ═══════════════════════════════════════════════════════════════

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Haptic helper (Telegram)
  window.hap = function(kind = 'light') {
    try {
      const h = window.Telegram?.WebApp?.HapticFeedback;
      if (!h) return;
      if (kind === 'success') h.notificationOccurred('success');
      else if (kind === 'error') h.notificationOccurred('error');
      else if (kind === 'warning') h.notificationOccurred('warning');
      else h.impactOccurred(kind);
    } catch (_) {}
  };

  // ─── REVEAL ON SCROLL ─────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeReveals(root = document) {
    root.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // ─── PARALLAX (scroll-based) ──────────────────────────────────
  const parallaxItems = [];

  function registerParallax(el) {
    const speed = parseFloat(el.dataset.parallax) || 0.18;
    const dirX = el.dataset.parallaxX ? parseFloat(el.dataset.parallaxX) : 0;
    parallaxItems.push({ el, speed, dirX, baseY: 0, baseX: 0 });
  }

  function refreshParallax() {
    const y = window.scrollY || window.pageYOffset;
    for (const it of parallaxItems) {
      const offset = y * it.speed;
      const offsetX = y * it.dirX;
      it.el.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${(-offset).toFixed(1)}px, 0)`;
    }
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      refreshParallax();
      raf = 0;
    });
  }

  function observeParallax(root = document) {
    root.querySelectorAll('[data-parallax]').forEach(registerParallax);
    refreshParallax();
  }

  // ─── MOUSE / TOUCH PARALLAX ───────────────────────────────────
  function bindPointerParallax(container, depth = 14) {
    if (!container) return;
    const layers = container.querySelectorAll('[data-depth]');
    if (!layers.length) return;
    let rect = container.getBoundingClientRect();
    let active = false;
    const update = (x, y) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (x - cx) / rect.width;
      const dy = (y - cy) / rect.height;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth) || 1;
        const tx = dx * depth * d;
        const ty = dy * depth * d;
        l.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      });
    };
    const onMove = (e) => {
      if (!active) return;
      const t = e.touches ? e.touches[0] : e;
      update(t.clientX, t.clientY);
    };
    const onEnter = () => {
      active = true;
      rect = container.getBoundingClientRect();
    };
    const onLeave = () => {
      active = false;
      layers.forEach(l => { l.style.transform = ''; });
    };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mousemove', onMove);
    container.addEventListener('touchstart', onEnter, { passive: true });
    container.addEventListener('touchend', onLeave);
    container.addEventListener('touchmove', onMove, { passive: true });
    // Use deviceorientation for mobile tilt effect
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', (e) => {
        const rx = Math.max(-25, Math.min(25, (e.gamma || 0))) / 25;
        const ry = Math.max(-25, Math.min(25, (e.beta || 0))) / 25;
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth) || 1;
          l.style.transform = `translate3d(${(rx * 12 * d).toFixed(1)}px, ${(ry * 8 * d).toFixed(1)}px, 0)`;
        });
      });
    }
  }

  // ─── COUNT UP NUMBERS ─────────────────────────────────────────
  function countUp(el) {
    const target = parseFloat(el.dataset.count || el.textContent.replace(/[^\d.]/g, ''));
    if (isNaN(target)) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = parseInt(el.dataset.duration || '1400');
    const start = performance.now();
    const startVal = 0;
    const fmt = (n) => {
      if (target >= 1000) return Math.round(n).toLocaleString('ru-RU');
      if (target % 1 !== 0) return n.toFixed(1);
      return Math.round(n).toString();
    };
    el.textContent = prefix + fmt(startVal) + suffix;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = startVal + (target - startVal) * eased;
      el.textContent = prefix + fmt(val) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function observeCounters(root = document) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          countUp(e.target);
          counterIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    root.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));
  }

  // ─── HEADER SHADOW ON SCROLL ──────────────────────────────────
  function bindHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    let last = -1;
    const upd = () => {
      const s = window.scrollY > 10;
      if (s === last) return;
      last = s;
      header.classList.toggle('scrolled', s);
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  // ─── RIPPLE for tappable ──────────────────────────────────────
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn-red, .add-cart-btn, .choice-card, .cat-card, .feature-card');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      width:${size}px;height:${size}px;
      background: radial-gradient(circle, rgba(255,255,255,.35), rgba(255,255,255,0) 60%);
      border-radius:50%;
      pointer-events:none;
      transform:scale(0);
      opacity:.65;
      animation: rip .55s ease-out forwards;
      z-index:0;
    `;
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Inject ripple keyframes once
  if (!document.getElementById('rip-style')) {
    const s = document.createElement('style');
    s.id = 'rip-style';
    s.textContent = `@keyframes rip { to { transform: scale(2.6); opacity: 0; } }`;
    document.head.appendChild(s);
  }

  // ─── INIT (auto on DOM ready) ────────────────────────────────
  function initAll() {
    bindHeaderScroll();
    observeReveals();
    observeParallax();
    observeCounters();
    const heroParallax = document.querySelector('[data-parallax-container]');
    if (heroParallax) bindPointerParallax(heroParallax, 18);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose API for dynamic content
  window.TPAnim = {
    refreshAll: () => {
      observeReveals();
      observeParallax();
      observeCounters();
      refreshParallax();
    },
    observeReveals,
    observeParallax,
    countUp,
    hap: window.hap,
  };
})();
