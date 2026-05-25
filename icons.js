// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — SVG Icon Library
// Two-tone (stroke + faint fill) icons for cards/sections,
// crisp stroke-only icons for nav and utility.
// All paths are tuned to a 24×24 viewBox.
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  // ── BRAND / CATEGORY (two-tone) ─────────────────────────────────
  facade: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M4 21V8.6L12 4l8 4.6V21z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="7.5" y="11"   width="3" height="3" rx=".6" fill="currentColor" fill-opacity=".55"/>
    <rect x="13.5" y="11"  width="3" height="3" rx=".6" fill="currentColor" fill-opacity=".55"/>
    <rect x="7.5" y="15.5" width="3" height="3" rx=".6" fill="currentColor" fill-opacity=".55"/>
    <rect x="13.5" y="15.5" width="3" height="3" rx=".6" fill="currentColor" fill-opacity=".55"/>
    <path d="M11 21v-3.2h2V21z" fill="currentColor"/>
  </svg>`,
  vent: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.2"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M6.8 7.5h10.4M6.8 12h10.4M6.8 16.5h10.4"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="6.8" cy="7.5"  r=".9" fill="currentColor"/>
    <circle cx="17.2" cy="7.5" r=".9" fill="currentColor"/>
    <circle cx="6.8" cy="12"   r=".9" fill="currentColor"/>
    <circle cx="17.2" cy="12"  r=".9" fill="currentColor"/>
    <circle cx="6.8" cy="16.5" r=".9" fill="currentColor"/>
    <circle cx="17.2" cy="16.5" r=".9" fill="currentColor"/>
  </svg>`,
  roof: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M3 12 12 4l9 8v9H3z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M3 12 12 4l9 8"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 21v-5h4v5z" fill="currentColor"/>
  </svg>`,
  floor: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M2 14h20v6H2z"
      fill="currentColor" fill-opacity=".22"
      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M2 9.5h20V13H2z"
      fill="currentColor" fill-opacity=".10"
      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M6 14v6M11 14v6M16 14v6M21 14v6"
      stroke="currentColor" stroke-width="1.2" opacity=".55"/>
    <path d="M3 6.5c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0 2 1 3 0"
      stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
  </svg>`,
  universal: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M7.5 12.2l3 3 6-6.4"
      stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 3.2v1.8M12 19v1.8M3.2 12H5M19 12h1.8"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".55"/>
  </svg>`,
  sandwich: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <rect x="3" y="4"    width="18" height="3.4" rx="1"
      fill="currentColor" fill-opacity=".55"
      stroke="currentColor" stroke-width="1.4"/>
    <rect x="3" y="9.4"  width="18" height="5"   rx="1"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.4"/>
    <rect x="3" y="16.4" width="18" height="3.4" rx="1"
      fill="currentColor" fill-opacity=".55"
      stroke="currentColor" stroke-width="1.4"/>
    <path d="M5 11.8c1-.4 2 .4 3 0s2-.4 3 0 2 .4 3 0 2-.4 3 0 2 .4 3 0"
      stroke="currentColor" stroke-width="1" opacity=".7" fill="none" stroke-linecap="round"/>
  </svg>`,
  wall: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="1.5"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3 9h7M14 9h7M3 14h11M16 14h5M3 19h4M11 19h10M11 4v5M14 9v5M11 14v5"
      stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".70"/>
  </svg>`,
  tech: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M3 21V8.5a2 2 0 0 1 2-2h2V3h4v3.5h6a2 2 0 0 1 2 2V21z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="9" cy="12" r=".8" fill="currentColor"/>
    <circle cx="13" cy="12" r=".8" fill="currentColor"/>
    <circle cx="17" cy="12" r=".8" fill="currentColor"/>
    <circle cx="9" cy="16" r=".8" fill="currentColor"/>
    <circle cx="13" cy="16" r=".8" fill="currentColor"/>
    <circle cx="17" cy="16" r=".8" fill="currentColor"/>
  </svg>`,

  // ── FEATURE / INSULATION PROPERTIES (two-tone) ─────────────────
  fire: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M12 2.5c.6 2.2-.4 3.6-1.5 5.1-1.3 1.8-2.6 3.5-2.6 6.4a6 6 0 0 0 12 .2c0-2-.7-3.5-1.7-4.6-.1 1.4-.9 2.3-1.7 2.3-1.5 0-1.5-1.8-1-3.4.6-2.2-.3-4.6-3.5-6z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12 13.5c1.5 1.2 2.4 2.6 2.4 4.1a2.4 2.4 0 1 1-4.8 0c0-1.5.9-2.9 2.4-4.1z"
      fill="currentColor"/>
  </svg>`,
  sound: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M11 5 6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M15.2 8.4a4.6 4.6 0 0 1 0 7.2"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M18.4 5.6a8.6 8.6 0 0 1 0 12.8"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".6"/>
  </svg>`,
  thermo: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M14 13.5V4a2.5 2.5 0 0 0-5 0v9.5a4.5 4.5 0 1 0 5 0z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="11.5" cy="17.5" r="2.4" fill="currentColor"/>
    <line x1="11.5" y1="11.5" x2="11.5" y2="15.5"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M16 6h1.6M16 9h1.6M16 12h1.6"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
  </svg>`,
  eco: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
    <path d="M20.5 3.5C20 13 13 19.5 4 20.5c-.5-9 6-15.5 16.5-17z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M5 19.5C9.5 16 14 12 18.5 5.5"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9.5 14.5c1.4-.4 2.6-1.2 3.5-2.3M14 10.5c1-.7 1.9-1.6 2.6-2.6"
      stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
  </svg>`,
  shield: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M8.5 12.2l2.5 2.5 4.5-5"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  factory: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M3 21V11l5 3V9l5 3V7l6 3-1 11z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M2 21h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="6"  y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <rect x="11" y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <rect x="16" y="15" width="2" height="3" rx=".3" fill="currentColor"/>
    <path d="M7 5.5c0-1 .8-1 .8-2s-.8-1-.8-2M11 3.5c0-1 .8-1 .8-2"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
  </svg>`,
  cert: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <circle cx="12" cy="9" r="6"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M8.2 13.7 7 22l5-3 5 3-1.2-8.3"
      fill="currentColor" fill-opacity=".25"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12 6 13.2 8.4 16 8.8l-2 2 .5 2.7L12 12.2 9.5 13.5l.5-2.7-2-2 2.8-.4z"
      fill="currentColor"/>
  </svg>`,

  // ── COMMERCE / LOGISTICS (two-tone) ─────────────────────────────
  truck: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <rect x="1.5" y="6" width="13" height="10" rx="1.5"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M14.5 10h4l3 3.5V16h-7z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="6" cy="18.5" r="2.4" fill="currentColor"/>
    <circle cx="18" cy="18.5" r="2.4" fill="currentColor"/>
    <circle cx="6" cy="18.5" r=".9" fill="currentColor" fill-opacity=".25"/>
    <circle cx="18" cy="18.5" r=".9" fill="currentColor" fill-opacity=".25"/>
  </svg>`,
  store: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M4 21V10h16v11z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M3 10 4.5 5h15L21 10z"
      fill="currentColor" fill-opacity=".25"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M9 21v-6h6v6z" fill="currentColor"/>
  </svg>`,
  package: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M3.3 7 12 12l8.7-5M12 22V12"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M7.5 4.7l9 5.2"
      stroke="currentColor" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>
  </svg>`,
  region: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M2 21l5-3 5 3 5-3 5 3V8l-5-3-5 3-5-3-5 3z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M7 8v11M12 6v12M17 8v11"
      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
  </svg>`,

  // ── CONTACT (two-tone) ──────────────────────────────────────────
  mail: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <rect x="2.5" y="5.5" width="19" height="13" rx="2"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3.5 7 12 13l8.5-6"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  globe: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6"/>
    <path d="M3 12h18"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 3.2c2.7 2.7 4 6 4 8.8s-1.3 6.1-4 8.8c-2.7-2.7-4-6-4-8.8s1.3-6.1 4-8.8z"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  telegram: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="m21.5 4.5-19 7.3 6.2 2.5 1.8 5.7 3.2-3.4 5.3 3.9z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="m9.7 14.3 8-6.3-6.2 8 .7 4-2.5-5.7z" fill="currentColor"/>
  </svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M3 21l1.5-5A9 9 0 1 1 21 12 9 9 0 0 1 6.5 19.5L3 21z"
      fill="currentColor" fill-opacity=".18"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M9 9c.5-.6 1.1-.4 1.5.3l.7 1.4c.2.4.1.7-.2 1l-.4.4c.5 1.1 1.4 2 2.5 2.5l.4-.4c.3-.3.6-.4 1-.2l1.4.7c.7.4.9 1 .3 1.5l-.7.7c-.6.6-1.4.8-2.2.5-2.7-1.1-4.8-3.2-5.9-5.9-.3-.8-.1-1.6.5-2.2z"
      fill="currentColor"/>
  </svg>`,
  pin: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M12 22s9-7 9-13a9 9 0 1 0-18 0c0 6 9 13 9 13z"
      fill="currentColor" fill-opacity=".15"
      stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="2.8" fill="currentColor"/>
  </svg>`,

  // ── NAV ICONS (crisp strokes, optimized for ~22px) ──────────────
  home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>
  </svg>`,
  grid: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3"   width="7.5" height="7.5" rx="1.5"/>
    <rect x="13.5" y="3"   width="7.5" height="7.5" rx="1.5"/>
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/>
  </svg>`,
  cart: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2 3h2.5l.7 3h15.3l-2.2 9.4a2 2 0 0 1-1.9 1.6H8.6a2 2 0 0 1-1.9-1.5L4.2 6"/>
    <circle cx="9" cy="20" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="18" cy="20" r="1.6" fill="currentColor" stroke="none"/>
  </svg>`,
  calc: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4.5" y="2.5" width="15" height="19" rx="2.2"/>
    <rect x="7.5" y="5.5" width="9" height="3" rx=".8" fill="currentColor" fill-opacity=".22" stroke="none"/>
    <circle cx="8.5"  cy="12.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="12"   cy="12.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="12.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="8.5"  cy="16.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="12"   cy="16.5" r="1.1" fill="currentColor" stroke="none"/>
    <circle cx="15.5" cy="16.5" r="1.1" fill="currentColor" stroke="none"/>
  </svg>`,
  phone: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 3.5h3a1.5 1.5 0 0 1 1.5 1.2l.7 3.3a1.5 1.5 0 0 1-.4 1.4l-1.5 1.5a14 14 0 0 0 5.8 5.8l1.5-1.5a1.5 1.5 0 0 1 1.4-.4l3.3.7a1.5 1.5 0 0 1 1.2 1.5v3a1.5 1.5 0 0 1-1.7 1.5 18 18 0 0 1-16-16A1.5 1.5 0 0 1 5 3.5z"/>
  </svg>`,

  // ── FAV ─────────────────────────────────────────────────────────
  heart: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>`,
  heartFilled: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
  </svg>`,

  // ── MISC / UTILITY (strokes) ────────────────────────────────────
  search: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/>
    <path d="m20.5 20.5-4-4"/>
  </svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>`,
  spark: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12 2 13.6 9 21 10.5l-7.4 1.5L12 19l-1.6-7L3 10.5 10.4 9z"/>
  </svg>`,
  trash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 6h18"/>
    <path d="M8 6V4.2A2 2 0 0 1 10 2.2h4a2 2 0 0 1 2 2V6"/>
    <path d="M19 6 17.7 20a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
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
