// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — SVG Icon Library
// All icons are 24x24 strokes (Lucide-style) with subtle brand twists.
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  // Brand category icons (Stroke = currentColor, fill nothing)
  facade: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M3 21V8.5L12 3l9 5.5V21"/>
    <path d="M3 21h18"/>
    <rect x="6.5" y="11" width="3" height="3.5" rx=".5"/>
    <rect x="14.5" y="11" width="3" height="3.5" rx=".5"/>
    <rect x="6.5" y="16.5" width="3" height="4.5" rx=".5"/>
    <rect x="14.5" y="16.5" width="3" height="4.5" rx=".5"/>
    <path d="M10.5 16.5h3v4.5h-3z"/>
  </svg>`,
  vent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
    <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>`,
  roof: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M2 12L12 4l10 8"/>
    <path d="M4 11v9h16v-9"/>
    <path d="M10 20v-5h4v5"/>
  </svg>`,
  floor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M3 8h18M3 13h18M3 18h18"/>
    <path d="M7 8v10M12 8v10M17 8v10"/>
  </svg>`,
  universal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M12 2l2.4 6h6l-5 3.7L17.5 18 12 14.5 6.5 18l2.1-6.3L3.6 8h6z"/>
  </svg>`,
  sandwich: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <rect x="3" y="5" width="18" height="3" rx="1"/>
    <rect x="3" y="10.5" width="18" height="3" rx="1"/>
    <rect x="3" y="16" width="18" height="3" rx="1"/>
  </svg>`,
  wall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <rect x="3" y="4" width="18" height="16" rx="1"/>
    <path d="M3 9h7M14 9h7M3 14h11M16 14h5M3 19h4M11 19h10M3 4h6M13 4h8M11 4v5M14 9v5M11 14v5"/>
  </svg>`,
  tech: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M3 21V8a2 2 0 0 1 2-2h2V3h4v3h6a2 2 0 0 1 2 2v13"/>
    <path d="M3 21h18M9 12h.01M13 12h.01M9 16h.01M13 16h.01M17 12h.01M17 16h.01"/>
  </svg>`,

  // Feature icons
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c0 1.7-1.5 2-1.5 3.5 1.3-.4 2-1.5 2-3 0-1 1-1 1-1.5 0 0 .5 1 1.5 1.5.4-2 .5-3.7-.5-5 0 1-1 1.5-1.5 1.5s-1-.5-1.5-1c-1.5-1.5-1.5-3.5 0-5 0 1 1.5 2 2.5 2 1.5 0 2.5-1 2.5-3-.5.6-1.5 1-2.5 1-1.5 0-2.5-1.5-2.5-3-1.5 0-3 1.5-3 3 0 1 .5 1.5 1 2-1 .5-2 1.5-2 3.5 0 1.5 1 3 3 3z"/>
  </svg>`,
  sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
    <path d="M19 5a9 9 0 0 1 0 14"/>
  </svg>`,
  thermo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    <circle cx="11.5" cy="18" r="1.2" fill="currentColor"/>
  </svg>`,
  eco: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M21 3c0 9.5-9 18-18 18 0-9.5 9-18 18-18z"/>
    <path d="M9 14C12 12 15 8 18 5"/>
  </svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>`,
  factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M2 20h20"/>
    <path d="M3 20V11l5 3V9l5 3V7l5 3-1 10"/>
    <rect x="6" y="15" width="2" height="2"/>
    <rect x="11" y="15" width="2" height="2"/>
    <rect x="16" y="15" width="2" height="2"/>
  </svg>`,
  cert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <circle cx="12" cy="9" r="6"/>
    <path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.12"/>
    <path d="M9 9l2 2 4-4"/>
  </svg>`,

  // Nav icons
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 3h3l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
  </svg>`,
  calc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <path d="M8 6h8M8 10h8M8 14h2M12 14h.01M16 14h.01M8 18h2M12 18h.01M16 18h.01"/>
  </svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.5 19.5 0 0 1 4.7 12 19.8 19.8 0 0 1 1.6 3.4 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L7.9 8.7a16 16 0 0 0 5.4 5.4l1-1a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 21 15.9z"/>
  </svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>`,
  heartFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>`,

  // Misc
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="7"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
    <polyline points="15 18 9 12 15 6"/>
  </svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
    <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>
  </svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
    <rect x="1" y="5" width="14" height="11" rx="1"/>
    <path d="M15 9h4l3 4v3h-7V9z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
    <path d="M3 9l1.5-5h15L21 9"/>
    <path d="M3 9v12h18V9"/>
    <path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3 1.3 3 3 3 3-1.3 3-3 1.3 3 3 3 3-1.3 3-3"/>
    <path d="M9 21v-6h6v6"/>
  </svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2c2.7 3 4 6.5 4 10s-1.3 7-4 10c-2.7-3-4-6.5-4-10s1.3-7 4-10z"/>
  </svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M21.5 4.5L2 11l6 2 2 6 3-3 4 3 4.5-14.5z"/>
    <path d="M8 13l8-5-4 7"/>
  </svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.2-4.5A9 9 0 1 1 21 12z"/>
    <path d="M9 9c.5 0 1 .5 1.5 1.5s.5 1 0 1.5 .5 1.5 1.5 2.5 2 1.5 2.5 1 1-1 1.5-1 1 0 1.5.5"/>
  </svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
    <path d="M3 6h18M19 6l-1.3 14a2 2 0 0 1-2 1.8h-7.4a2 2 0 0 1-2-1.8L5 6"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
  package: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M3.3 7L12 12l8.7-5M12 22V12"/>
  </svg>`,
  region: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
    <path d="M2 22l5-3 5 3 5-3 5 3V8l-5-3-5 3-5-3-5 3z"/>
    <path d="M7 8v11M12 6v11M17 8v11"/>
  </svg>`,
};

// Inject icons into elements with data-icon attribute
function injectIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    if (ICONS[name] && !el.dataset.injected) {
      el.innerHTML = ICONS[name];
      el.dataset.injected = '1';
    }
  });
}

// Auto-inject on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => injectIcons());
  } else {
    injectIcons();
  }
}

// Helper for inline use
function ic(name) { return ICONS[name] || ''; }
