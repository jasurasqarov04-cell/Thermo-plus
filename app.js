// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Shared App Logic v3
// ═══════════════════════════════════════════════════════════════

// ─── STORAGE ─────────────────────────────────────────────────────
const Store = {
  get: (key, def = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
};

// ─── CART ─────────────────────────────────────────────────────────
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
  setQty(key, qty) {
    const n = Math.max(1, parseInt(qty) || 1);
    Store.set(Cart._key, Cart.items().map(i => i.key === key ? { ...i, qty: n } : i));
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

// ─── FAVORITES ────────────────────────────────────────────────────
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

// ─── PRICE CALC ───────────────────────────────────────────────────
function getPrice(prod, thick) {
  if (thick <= 50) return prod.pricePerM2;
  return Math.round(prod.pricePerM2 * (thick / 50));
}

function getPackArea(prod, thick) {
  const slabs = thick <= 50 ? prod.packSlabs : Math.max(1, Math.floor(prod.packSlabs / 2));
  return Math.round(1.2 * 0.6 * slabs * 100) / 100;
}

// ─── TOAST ────────────────────────────────────────────────────────
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ─── CATEGORY MAPS ────────────────────────────────────────────────
const CAT_ICON_SVG = {
  facade:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>`,
  vent:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3l-3 9 3 9 3-9z"/></svg>`,
  roof:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5L12 3l9 7.5V21H3z"/></svg>`,
  floor:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="14" width="20" height="6" rx="1"/><line x1="6" y1="14" x2="6" y2="4"/><line x1="12" y1="14" x2="12" y2="8"/><line x1="18" y1="14" x2="18" y2="6"/></svg>`,
  universal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9"/></svg>`,
  sandwich:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="4"/><rect x="2" y="11" width="20" height="4"/><rect x="2" y="17" width="20" height="2"/></svg>`,
};

// Heart SVG
function heartSvg(filled) {
  return filled
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="#C71219" stroke="#C71219" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// ─── PRODUCT IMAGE HTML ───────────────────────────────────────────
function buildProductImgHtml(prod) {
  const placeholder = CAT_ICON_SVG[prod.category] || '';
  if (prod.image) {
    return `<img src="${prod.image}" alt="${prod.name}" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="prod-img-placeholder" style="display:none;color:var(--text-3)">${placeholder}</span>`;
  }
  return `<span class="prod-img-placeholder" style="color:var(--text-3)">${placeholder}</span>`;
}

// ─── PRODUCT CARD BUILDER (horizontal layout) ─────────────────────
function buildProductCard(prod, selectedThick) {
  const lang = getCurrentLang();
  const th = selectedThick || prod.thicknesses[0];
  const price = getPrice(prod, th);
  const isFav = Favs.has(prod.id);
  const catLabels = CAT_LABELS[lang] || CAT_LABELS['ru'];
  const catLabel = catLabels[prod.category] || prod.category;

  const thickChips = prod.thicknesses.slice(0, 4).map(t2 => `
    <button class="thick-chip-s ${t2 === th ? 'active' : ''}"
      onclick="selectThick(${prod.id}, ${t2})" data-id="${prod.id}" data-thick="${t2}">
      ${t2}
    </button>`).join('');

  const addLabel = lang === 'uz' ? 'Savatga' : lang === 'en' ? 'Add to cart' : 'В корзину';

  return `
    <div class="prod-card" id="pcard-${prod.id}">
      <div class="prod-card-top">
        <div class="prod-info">
          <div class="prod-category">${catLabel}</div>
          <div class="prod-name" onclick="openDetail(${prod.id})">${prod.name}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
            <div class="prod-badges">
              <span class="badge badge-fire">НГ</span>
              ${prod.badge ? `<span class="badge badge-pro">${prod.badge}</span>` : ''}
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div class="prod-img-wrap" onclick="openDetail(${prod.id})">
            ${buildProductImgHtml(prod)}
          </div>
          <button class="fav-btn-card ${isFav ? 'fav-active' : ''}" onclick="toggleFavCard(event, ${prod.id})" id="fav-${prod.id}">
            ${heartSvg(isFav)}
          </button>
        </div>
      </div>

      <div class="thick-chips-row" id="thick-row-${prod.id}">${thickChips}</div>

      <div class="prod-price-row">
        <div class="prod-price" id="price-${prod.id}">
          ${price.toLocaleString()} <small>${t('currency')}</small>
        </div>
      </div>

      <div class="prod-actions-row">
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${prod.id}, -1)">−</button>
          <input class="qty-val" id="qty-${prod.id}" type="number" min="1" value="${qtyState[prod.id]||1}"
            onchange="setQtyAndCart(${prod.id}, this.value)"
            onfocus="this.select()"
            style="-moz-appearance:textfield;cursor:text"/>
          <button class="qty-btn" onclick="changeQty(${prod.id}, 1)">+</button>
        </div>
        <button class="add-cart-btn" onclick="addToCartFromCard(${prod.id})">${addLabel}</button>
      </div>

      <button class="detail-btn" onclick="openDetail(${prod.id})">${t('detail')}</button>
    </div>`;
}

// ─── QUANTITY ──────────────────────────────────────────────────────
const qtyState = {};
function changeQty(id, delta) {
  const el = document.querySelector(`#qty-${id}`);
  const current = parseInt(el ? el.value : qtyState[id]) || 1;
  const newVal = Math.max(1, current + delta);
  qtyState[id] = newVal;
  if (el) el.value = newVal;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const thick = thickState[id] || prod.thicknesses[0];
  const key = `${id}-${thick}`;
  const items = Cart.items();
  const idx = items.findIndex(i => i.key === key);
  if (delta > 0) { Cart.add(id, thick, 1); flyToCart(id); }
  else if (delta < 0 && idx >= 0) { Cart.updateQty(key, -1); }
}

function setQtyAndCart(id, val) {
  const n = Math.max(1, parseInt(val) || 1);
  qtyState[id] = n;
  const el = document.querySelector(`#qty-${id}`);
  if (el) el.value = n;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const thick = thickState[id] || prod.thicknesses[0];
  const key = `${id}-${thick}`;
  const items = Cart.items();
  const idx = items.findIndex(i => i.key === key);
  if (idx >= 0) { items[idx].qty = n; Store.set(Cart._key, items); Cart.updateBadge(); }
  else if (n > 0) { Cart.add(id, thick, n); flyToCart(id); }
}

// ─── CART FLY ANIMATION ───────────────────────────────────────────
function flyToCart(productId) {
  const card = document.getElementById(`pcard-${productId}`);
  const cartNavItem = document.querySelector('.nav-item-cart .nav-icon-wrap');
  if (!card || !cartNavItem) return;
  const srcRect = card.getBoundingClientRect();
  const dstRect = cartNavItem.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;width:8px;height:8px;border-radius:50%;
    background:var(--red);z-index:9999;pointer-events:none;
    left:${srcRect.left + srcRect.width / 2 - 4}px;
    top:${srcRect.top + srcRect.height / 2 - 4}px;
    transition:left .4s cubic-bezier(.4,0,.2,1),top .4s cubic-bezier(.4,0,.2,1),opacity .4s,transform .4s;
  `;
  document.body.appendChild(dot);
  requestAnimationFrame(() => {
    dot.style.left = `${dstRect.left + dstRect.width / 2 - 4}px`;
    dot.style.top  = `${dstRect.top + dstRect.height / 2 - 4}px`;
    dot.style.opacity = '0';
    dot.style.transform = 'scale(0.2)';
  });
  setTimeout(() => dot.remove(), 450);
  cartNavItem.classList.add('cart-bounce');
  setTimeout(() => cartNavItem.classList.remove('cart-bounce'), 400);
}

// ─── THICKNESS ────────────────────────────────────────────────────
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

// ─── ADD TO CART ──────────────────────────────────────────────────
function addToCartFromCard(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[0];
  const qtyEl = document.querySelector(`#qty-${productId}`);
  const qty = qtyEl ? (parseInt(qtyEl.value) || 1) : (qtyState[productId] || 1);
  Cart.add(productId, thick, qty);
  qtyState[productId] = 1;
  if (qtyEl) qtyEl.value = 1;
  const lang = getCurrentLang();
  const msg = lang === 'uz' ? `${prod.name} savatga qo'shildi` : lang === 'ru' ? `${prod.name} добавлен в корзину` : `${prod.name} added to cart`;
  showToast(msg);
  flyToCart(productId);
}

// ─── FAVORITES ────────────────────────────────────────────────────
function toggleFavCard(e, id) {
  e.stopPropagation();
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const isNowFav = Favs.toggle(id);
  const btn = document.querySelector(`#fav-${id}`);
  if (btn) {
    btn.innerHTML = heartSvg(isNowFav);
    btn.classList.toggle('fav-active', isNowFav);
  }
  const lang = getCurrentLang();
  const msg = isNowFav
    ? (lang === 'ru' ? `${prod.name} добавлен в избранное` : `${prod.name} added`)
    : (lang === 'ru' ? `${prod.name} удалён из избранного` : `${prod.name} removed`);
  showToast(msg);
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
  const catLabels = CAT_LABELS[lang] || CAT_LABELS['ru'];
  const catLabel = catLabels[prod.category] || prod.category;

  const thickBtns = prod.thicknesses.map(t2 => `
    <button class="thick-sel-btn ${t2 === th ? 'active' : ''}"
      onclick="selectDetailThick(${id}, ${t2})" id="dthick-${id}-${t2}">
      ${t2} мм
    </button>`).join('');

  const specRows = [
    [t('fireRes'),   prod.fire],
    [t('maxTemp'),   `≤ ${prod.temp}°C`],
    [t('density'),   `${prod.density} кг/м³`],
    [t('size'),      `${prod.size} мм`],
    [t('lambda'),    `${prod.lambda} Вт/м·К`],
    [t('packArea'),  `${prod.packArea} м²`],
    [t('packSlabs'), `${prod.packSlabs} шт`],
  ].map(([k, v]) =>
    `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
  ).join('');

  const addLabel = lang === 'uz' ? 'Savatga' : lang === 'en' ? 'Add to cart' : 'В корзину';

  const html = `
    <div class="overlay" id="detail-overlay" onclick="if(event.target===this)closeDetail()">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px">${catLabel}</div>
            <span class="sheet-title">${prod.name}</span>
          </div>
          <button class="sheet-close" onclick="closeDetail()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="sheet-body">
          <div style="background:var(--bg);border-radius:12px;height:180px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:14px;">
            ${prod.image
              ? `<img src="${prod.image}" alt="${prod.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" onerror="this.parentElement.innerHTML='<span style=font-size:64px;color:var(--text-3)>${CAT_ICON_SVG[prod.category]||""}</span>'">`
              : `<span style="color:var(--text-3)">${CAT_ICON_SVG[prod.category]||''}</span>`}
          </div>
          <p style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:16px;">${desc}</p>
          <div style="background:var(--bg);border-radius:10px;padding:0 12px;margin-bottom:16px;">${specRows}</div>
          <div style="margin-bottom:16px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);margin-bottom:8px;letter-spacing:0.3px;text-transform:uppercase;">${t('thickness')}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;" id="detail-thick-wrap-${id}">${thickBtns}</div>
          </div>
          <div style="margin-bottom:16px;" id="detail-price-${id}">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:4px;">${t('price')}</div>
            <div style="font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.5px;">${price.toLocaleString()} <span style="font-size:13px;font-weight:500;color:var(--text-2);">${t('currency')}</span></div>
          </div>
          <button class="btn-red full" onclick="addToCartFromDetail(${id});closeDetail()">
            ${addLabel}
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
  if (priceEl) priceEl.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:4px;">${t('price')}</div>
    <div style="font-size:24px;font-weight:900;color:var(--text);letter-spacing:-0.5px;">${price.toLocaleString()} <span style="font-size:13px;font-weight:500;color:var(--text-2);">${t('currency')}</span></div>`;
}

function addToCartFromDetail(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[0];
  Cart.add(productId, thick, 1);
  const lang = getCurrentLang();
  const msg = lang === 'ru' ? `${prod.name} добавлен в корзину` : `${prod.name} added`;
  showToast(msg);
}

// ─── LANG BUTTONS ─────────────────────────────────────────────────
function initLangButtons() {
  const lang = getCurrentLang();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      if (typeof onLangChange === 'function') onLangChange();
    });
  });
  Cart.updateBadge();
}

// ─── FLOAT CART ───────────────────────────────────────────────────
function initFloatCart() {
  const btn = document.querySelector('#float-cart-btn');
  if (btn) {
    const count = Cart.count();
    btn.style.display = count > 0 ? 'flex' : 'none';
    const badge = btn.querySelector('.float-badge');
    if (badge) badge.textContent = count;
  }
}

// ─── LOAD PRODUCTS ────────────────────────────────────────────────
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

// ─── BITRIX24 ─────────────────────────────────────────────────────
const BX_WEBHOOK = 'https://sagrroup.bitrix24.ru/rest/848/bqx4ulfna4gsrmpw/crm.lead.add.json';

async function sendToB24(formData, cartItems) {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const comment = [
    cartItems.map(i => `${i.name} ${i.thick}мм ×${i.qty} шт — ${(i.price * i.qty).toLocaleString('ru-RU')} сум`).join('\n'),
    '',
    `Город: ${formData.city || '—'}`,
    formData.address ? `Адрес: ${formData.address}` : '',
    `Доставка: ${formData.delivery === 'delivery' ? 'Доставка' : 'Самовывоз'}`,
    `Итого: ${total.toLocaleString('ru-RU')} сум`,
  ].filter(Boolean).join('\n');

  try {
    await fetch(BX_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          TITLE: `Thermo Plus — ${formData.name}`,
          NAME: formData.name,
          PHONE: [{ VALUE: formData.phone, VALUE_TYPE: 'WORK' }],
          COMMENTS: comment,
          SOURCE_ID: 'WEB',
          SOURCE_DESCRIPTION: 'Telegram Mini App v3',
          OPPORTUNITY: total,
          CURRENCY_ID: 'UZS',
        }
      })
    });
    return { ok: true };
  } catch (e) {
    console.error('Bitrix24 error:', e);
    return { ok: false };
  }
}
