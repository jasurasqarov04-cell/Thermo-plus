// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Shared App Logic v2
// ═══════════════════════════════════════════════════════════════

// ─── STORAGE ────────────────────────────────────────────────────
const Store = {
  get: (key, def = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
};

// ─── CART ────────────────────────────────────────────────────────
const Cart = {
  _key: 'tp_cart',
  items: () => Store.get(Cart._key, []),
  add(productId, thickness, qty = 1) {
    const items = Cart.items();
    const key = `${productId}-${thickness}`;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) { items[idx].qty += qty; }
    else {
      const prod = PRODUCTS_DATA.find(p => p.id === productId);
      if (!prod) return;
      const price = getPrice(prod, thickness);
      items.push({ key, id: productId, name: prod.name, thick: thickness, price, qty, category: prod.category });
    }
    Store.set(Cart._key, items);
    Cart.updateBadge();
  },
  remove(key) { Store.set(Cart._key, Cart.items().filter(i => i.key !== key)); Cart.updateBadge(); },
  updateQty(key, delta) {
    Store.set(Cart._key, Cart.items().map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
    Cart.updateBadge();
  },
  clear() { Store.set(Cart._key, []); Cart.updateBadge(); },
  count() { return Cart.items().reduce((s, i) => s + i.qty, 0); },
  total() { return Cart.items().reduce((s, i) => s + i.price * i.qty, 0); },
  updateBadge() {
    const count = Cart.count();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    const floatBtn = document.querySelector('#float-cart-btn');
    if (floatBtn) floatBtn.style.display = count > 0 ? 'flex' : 'none';
  }
};

// ─── FAVORITES ───────────────────────────────────────────────────
const Favs = {
  _key: 'tp_favs',
  ids: () => Store.get(Favs._key, []),
  toggle(productId) {
    let ids = Favs.ids();
    const isFav = ids.includes(productId);
    if (isFav) ids = ids.filter(id => id !== productId);
    else ids.push(productId);
    Store.set(Favs._key, ids);
    return !isFav;
  },
  has: (productId) => Favs.ids().includes(productId),
  count: () => Favs.ids().length,
  products: () => (window.PRODUCTS_DATA || []).filter(p => Favs.ids().includes(p.id))
};

// ─── PRICE CALC ──────────────────────────────────────────────────
function getPrice(prod, thick) {
  if (thick <= 50)  return prod.pricePerM2;
  if (thick <= 80)  return Math.round(prod.pricePerM2 * 1.60);
  if (thick <= 100) return Math.round(prod.pricePerM2 * 2.00);
  if (thick <= 120) return Math.round(prod.pricePerM2 * 2.40);
  if (thick <= 150) return Math.round(prod.pricePerM2 * 3.00);
  return Math.round(prod.pricePerM2 * (thick / 50));
}

// ─── TOAST ───────────────────────────────────────────────────────
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ─── CATEGORY MAPS ───────────────────────────────────────────────
const CAT_EMOJI = {
  facade: '🧱', vent: '🌬️', roof: '🏗️',
  floor: '🔲', universal: '⭐', sandwich: '🏭'
};

const CAT_LABELS = {
  uz: { facade:'Fasad', vent:'Vent. fasad', roof:'Tom', floor:'Pol', universal:'Universal', sandwich:'Sandwich' },
  ru: { facade:'Фасад', vent:'Вент. фасад', roof:'Кровля', floor:'Пол', universal:'Универсал', sandwich:'Сэндвич' },
  en: { facade:'Facade', vent:'Vent. facade', roof:'Roof', floor:'Floor', universal:'Universal', sandwich:'Sandwich' }
};

// ─── PRODUCT IMAGE HTML ──────────────────────────────────────────
function buildProductImgHtml(prod) {
  if (prod.image) {
    return `<img src="${prod.image}" alt="${prod.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="prod-img-placeholder" style="display:none">${CAT_EMOJI[prod.category]}</span>`;
  }
  return `<span class="prod-img-placeholder">${CAT_EMOJI[prod.category]}</span>`;
}

// ─── PRODUCT CARD BUILDER ─────────────────────────────────────────
function buildProductCard(prod, selectedThick) {
  const lang = getCurrentLang();
  const th = selectedThick || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  const price = getPrice(prod, th);
  const isFav = Favs.has(prod.id);
  const catLabels = CAT_LABELS[lang] || CAT_LABELS['en'];
  const catLabel = catLabels[prod.category] || prod.category;

  const badgesHtml = `
    <div class="prod-badges">
      <span class="badge badge-fire">НГ</span>
      ${prod.badge ? `<span class="badge badge-pro">${prod.badge}</span>` : ''}
    </div>`;

  const thickChips = prod.thicknesses.slice(0, 5).map(t2 => `
    <button class="thick-chip-s ${t2 === th ? 'active' : ''}"
      onclick="selectThick(${prod.id}, ${t2})" data-id="${prod.id}" data-thick="${t2}">
      ${t2}
    </button>`).join('');

  return `
    <div class="prod-card" id="pcard-${prod.id}">
      <div class="prod-img" onclick="openDetail(${prod.id})">
        ${buildProductImgHtml(prod)}
        ${badgesHtml}
        <button class="fav-btn ${isFav ? 'fav-active' : ''}" onclick="toggleFavCard(event, ${prod.id})" id="fav-${prod.id}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="prod-body">
        <div class="prod-category">${catLabel}</div>
        <div class="prod-name">${prod.name}</div>
        <div class="thick-chips-row" id="thick-row-${prod.id}">${thickChips}</div>
        <div class="prod-price" id="price-${prod.id}">
          ${price.toLocaleString()} <small>${t('currency')}</small>
        </div>
        <div class="prod-actions">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="changeQty(${prod.id}, -1)">−</button>
            <span class="qty-val" id="qty-${prod.id}">1</span>
            <button class="qty-btn" onclick="changeQty(${prod.id}, 1)">+</button>
          </div>
          <button class="detail-btn" onclick="openDetail(${prod.id})">${t('detail')}</button>
        </div>
      </div>
    </div>`;
}

// ─── QUANTITY ─────────────────────────────────────────────────────
const qtyState = {};
function changeQty(id, delta) {
  qtyState[id] = Math.max(1, (qtyState[id] || 1) + delta);
  const el = document.querySelector(`#qty-${id}`);
  if (el) el.textContent = qtyState[id];
}

// ─── THICKNESS ───────────────────────────────────────────────────
const thickState = {};
function selectThick(id, thick) {
  thickState[id] = thick;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const price = getPrice(prod, thick);
  document.querySelectorAll(`[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.thick) === thick);
  });
  const priceEl = document.querySelector(`#price-${id}`);
  if (priceEl) priceEl.innerHTML = `${price.toLocaleString()} <small>${t('currency')}</small>`;
}

// ─── ADD TO CART ─────────────────────────────────────────────────
function addToCartFromCard(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  Cart.add(productId, thick, qtyState[productId] || 1);
  showToast(`✅ ${prod.name} ${thick}mm — ${t('inCart')}`);
}

// ─── FAVORITES ───────────────────────────────────────────────────
function toggleFavCard(e, id) {
  e.stopPropagation();
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const isNowFav = Favs.toggle(id);
  const btn = document.querySelector(`#fav-${id}`);
  if (btn) { btn.textContent = isNowFav ? '❤️' : '🤍'; btn.classList.toggle('fav-active', isNowFav); }
  showToast(isNowFav ? `❤️ ${prod.name}` : `💔 Removed`);
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────
function openDetail(id) {
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const lang = getCurrentLang();
  const th = thickState[id] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  const price = getPrice(prod, th);

  const descKey = lang === 'ru' ? 'desc_ru' : lang === 'en' ? 'desc_en' : 'desc_uz';
  const desc = prod[descKey] || prod.desc_uz;

  const thickBtns = prod.thicknesses.map(t2 => `
    <button class="thick-sel-btn ${t2 === th ? 'active' : ''}"
      onclick="selectDetailThick(${id}, ${t2})" id="dthick-${id}-${t2}">
      ${t2} mm
    </button>`).join('');

  const specRows = [
    [t('fireRes'),  prod.fire],
    [t('maxTemp'),  `≤ ${prod.temp}°C`],
    [t('density'),  `${prod.density} kg/m³`],
    [t('size'),     `${prod.size} mm`],
    [t('lambda'),   `${prod.lambda} W/m·K`],
    [t('packArea'), `${prod.packArea} m²`],
    [t('packSlabs'),`${prod.packSlabs} pcs`],
  ].map(([k, v]) =>
    `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
  ).join('');

  const imgHtml = prod.image
    ? `<img src="${prod.image}" alt="${prod.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;"
         onerror="this.parentElement.innerHTML='<span style=font-size:72px>${CAT_EMOJI[prod.category]}</span>'">`
    : `<span style="font-size:72px">${CAT_EMOJI[prod.category]}</span>`;

  const html = `
    <div class="overlay" id="detail-overlay" onclick="if(event.target===this)closeDetail()">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">${prod.name}</span>
          <button class="sheet-close" onclick="closeDetail()">✕</button>
        </div>
        <div class="sheet-body">
          <div style="background:var(--bg2);border-radius:12px;height:180px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:14px;">
            ${imgHtml}
          </div>
          <p style="font-size:12px;color:var(--gray);line-height:1.6;margin-bottom:14px;">${desc}</p>
          <div style="background:var(--bg);border-radius:10px;padding:0 12px;margin-bottom:14px;">${specRows}</div>
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:var(--mid);margin-bottom:8px;">${t('thickness')} (mm):</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;" id="detail-thick-wrap-${id}">${thickBtns}</div>
          </div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:14px;" id="detail-price-${id}">
            ${t('price')}: <b style="color:var(--orange);font-family:var(--f-display);font-size:17px;letter-spacing:.3px;">${price.toLocaleString()} ${t('currency')}</b>
          </div>
          <button class="btn-orange full large" onclick="addToCartFromDetail(${id});closeDetail()">
            🛒 ${t('addCart')}
          </button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
}

function closeDetail() {
  const el = document.querySelector('#detail-overlay');
  if (el) el.remove();
}

function selectDetailThick(id, thick) {
  thickState[id] = thick;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const price = getPrice(prod, thick);
  document.querySelectorAll(`#detail-thick-wrap-${id} .thick-sel-btn`).forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().startsWith(thick.toString()));
  });
  const priceEl = document.querySelector(`#detail-price-${id}`);
  if (priceEl) priceEl.innerHTML = `${t('price')}: <b style="color:var(--orange);font-family:var(--f-display);font-size:17px;letter-spacing:.3px;">${price.toLocaleString()} ${t('currency')}</b>`;
}

function addToCartFromDetail(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  Cart.add(productId, thick, 1);
  showToast(`✅ ${prod.name} ${thick}mm — ${t('inCart')}`);
}

// ─── LANG BUTTONS ────────────────────────────────────────────────
function initLangButtons() {
  const lang = getCurrentLang();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      if (typeof onLangChange === 'function') onLangChange();
    });
  });
}

// ─── FLOAT CART ──────────────────────────────────────────────────
function initFloatCart() {
  const btn = document.querySelector('#float-cart-btn');
  if (btn) {
    const count = Cart.count();
    btn.style.display = count > 0 ? 'flex' : 'none';
    const badge = btn.querySelector('.float-badge');
    if (badge) badge.textContent = count;
  }
}

// ─── LOAD PRODUCTS ───────────────────────────────────────────────
async function loadProducts() {
  if (window.PRODUCTS_DATA) return window.PRODUCTS_DATA;
  try {
    const res = await fetch('products.json');
    window.PRODUCTS_DATA = await res.json();
    return window.PRODUCTS_DATA;
  } catch (e) {
    console.error('Failed to load products.json', e);
    window.PRODUCTS_DATA = [];
    return [];
  }
}

// ─── BITRIX24 ────────────────────────────────────────────────────
const B24_WEBHOOK = 'https://YOUR_DOMAIN.bitrix24.ru/rest/1/YOUR_CODE';
const B24_MANAGER = 1;

async function sendToB24(formData, cartItems) {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  try {
    const leadRes = await fetch(`${B24_WEBHOOK}/crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          TITLE: `Telegram Mini App — ${formData.name}`,
          NAME: formData.name,
          PHONE: [{ VALUE: formData.phone, VALUE_TYPE: 'WORK' }],
          EMAIL: formData.email ? [{ VALUE: formData.email, VALUE_TYPE: 'WORK' }] : [],
          COMMENTS: `Cart: ${cartItems.map(i => `${i.name} ${i.thick}mm × ${i.qty}`).join(', ')}\nCity: ${formData.city}\nAddress: ${formData.address}\nDelivery: ${formData.delivery}`,
          SOURCE_ID: 'WEB', SOURCE_DESCRIPTION: 'Telegram Mini App',
          ASSIGNED_BY_ID: B24_MANAGER,
          OPPORTUNITY: total, CURRENCY_ID: 'UZS',
        }
      })
    });
    const leadData = await leadRes.json();
    const leadId = leadData.result;
    if (leadId && cartItems.length) {
      await fetch(`${B24_WEBHOOK}/crm.lead.productrows.set.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          rows: cartItems.map(i => ({ PRODUCT_NAME: `${i.name} ${i.thick}mm`, QUANTITY: i.qty, PRICE: i.price, MEASURE_NAME: 'm²' }))
        })
      });
    }
    return { ok: true, leadId };
  } catch (e) { console.error('B24 error:', e); return { ok: false }; }
}
