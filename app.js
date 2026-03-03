// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Shared App Logic
// ═══════════════════════════════════════════════════════════════

// ─── STORAGE HELPERS ────────────────────────────────────────────
const Store = {
  get: (key, def = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ─── CART ────────────────────────────────────────────────────────
const Cart = {
  _key: 'tp_cart',
  items: () => Store.get(Cart._key, []),

  add(productId, thickness, qty = 1) {
    const items = Cart.items();
    const key = `${productId}-${thickness}`;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) {
      items[idx].qty += qty;
    } else {
      const prod = PRODUCTS_DATA.find(p => p.id === productId);
      if (!prod) return;
      const price = prod.pricePerM2 + (thickness > 100 ? (thickness - 100) * 200 : 0);
      items.push({ key, id: productId, name: prod.name, thick: thickness, price, qty, category: prod.category });
    }
    Store.set(Cart._key, items);
    Cart.updateBadge();
  },

  remove(key) {
    const items = Cart.items().filter(i => i.key !== key);
    Store.set(Cart._key, items);
    Cart.updateBadge();
  },

  updateQty(key, delta) {
    const items = Cart.items().map(i => i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
    Store.set(Cart._key, items);
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

// ─── CATEGORY EMOJI MAP ──────────────────────────────────────────
const CAT_EMOJI = {
  facade: '🧱', vent: '🌬️', roof: '🏗️',
  floor: '🔲', universal: '⭐', sandwich: '🏭'
};

const CAT_LABELS = {
  uz: { facade:'Fasad', vent:'Vent. fasad', roof:'Tom', floor:'Pol', universal:'Universal', sandwich:'Sandwich' },
  ru: { facade:'Фасад', vent:'Вент. фасад', roof:'Кровля', floor:'Пол', universal:'Универсал', sandwich:'Сэндвич' }
};

// ─── PRODUCT CARD BUILDER ─────────────────────────────────────────
function buildProductCard(prod, selectedThick) {
  const lang = getCurrentLang();
  const th = selectedThick || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  const price = prod.pricePerM2 + (th > 100 ? (th - 100) * 200 : 0);
  const isFav = Favs.has(prod.id);
  const inCart = Cart.items().some(i => i.key === `${prod.id}-${th}`);
  const catLabel = CAT_LABELS[lang][prod.category] || prod.category;

  const badgesHtml = `
    <div class="prod-badges">
      <span class="badge badge-fire">НГ</span>
      <span class="badge badge-cat">${catLabel}</span>
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
        <span class="prod-img-placeholder">${CAT_EMOJI[prod.category]}</span>
        ${badgesHtml}
        <button class="fav-btn ${isFav ? 'fav-active' : ''}" onclick="toggleFavCard(event, ${prod.id})" id="fav-${prod.id}">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="prod-body">
        <div class="prod-category">${catLabel} KOMPOZIT</div>
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

// ─── QUANTITY MANAGEMENT ─────────────────────────────────────────
const qtyState = {};
function changeQty(id, delta) {
  qtyState[id] = Math.max(1, (qtyState[id] || 1) + delta);
  const el = document.querySelector(`#qty-${id}`);
  if (el) el.textContent = qtyState[id];
}

// ─── THICK SELECTION ─────────────────────────────────────────────
const thickState = {};
function selectThick(id, thick) {
  thickState[id] = thick;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const price = prod.pricePerM2 + (thick > 100 ? (thick - 100) * 200 : 0);
  // update chips
  document.querySelectorAll(`[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.thick) === thick);
  });
  // update price
  const priceEl = document.querySelector(`#price-${id}`);
  if (priceEl) priceEl.innerHTML = `${price.toLocaleString()} <small>${t('currency')}</small>`;
}

// ─── CART ADD FROM CATALOG ───────────────────────────────────────
function addToCartFromCard(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  const qty = qtyState[productId] || 1;
  Cart.add(productId, thick, qty);
  showToast(`✅ ${prod.name} ${thick}мм — ${t('inCart')}`);
}

// ─── FAV TOGGLE FROM CARD ────────────────────────────────────────
function toggleFavCard(e, id) {
  e.stopPropagation();
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const isNowFav = Favs.toggle(id);
  const btn = document.querySelector(`#fav-${id}`);
  if (btn) {
    btn.textContent = isNowFav ? '❤️' : '🤍';
    btn.classList.toggle('fav-active', isNowFav);
  }
  showToast(isNowFav ? `❤️ ${prod.name} — sevimlilar` : `💔 Olib tashlandi`);
}

// ─── PRODUCT DETAIL MODAL ─────────────────────────────────────────
function openDetail(id) {
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const lang = getCurrentLang();
  const th = thickState[id] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  const price = prod.pricePerM2 + (th > 100 ? (th - 100) * 200 : 0);

  const thickBtns = prod.thicknesses.map(t2 => `
    <button class="thick-sel-btn ${t2 === th ? 'active' : ''}"
      onclick="selectDetailThick(${id}, ${t2})"
      id="dthick-${id}-${t2}">
      ${t2} мм
    </button>`).join('');

  const specRows = [
    [t('fireRes'), `${prod.fire}`],
    [t('maxTemp'), `до ${prod.temp}°C`],
    [t('density'), `${prod.density} кг/м³`],
    [t('size'), `${prod.size} мм`],
    [t('lambda'), `${prod.lambda} Вт/м·К`],
    [t('packArea'), `${prod.packArea} м²`],
    [t('packSlabs'), `${prod.packSlabs} шт`],
  ].map(([k, v]) => `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('');

  const html = `
    <div class="overlay" id="detail-overlay" onclick="if(event.target===this)closeDetail()">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">${prod.name}</span>
          <button class="sheet-close" onclick="closeDetail()">✕</button>
        </div>
        <div class="sheet-body">
          <div style="background:linear-gradient(160deg,#1a1a1a,#2d2d2d);border-radius:12px;height:160px;display:flex;align-items:center;justify-content:center;font-size:72px;margin-bottom:16px;">
            ${CAT_EMOJI[prod.category]}
          </div>
          <p style="font-size:12px;color:#6B7280;line-height:1.6;margin-bottom:14px;">${lang === 'uz' ? prod.desc_uz : prod.desc_ru}</p>
          <div style="background:#f9f9f9;border-radius:12px;padding:0 12px;margin-bottom:14px;">${specRows}</div>
          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:8px;">${t('thickness')} (мм):</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;" id="detail-thick-wrap-${id}">${thickBtns}</div>
          </div>
          <div style="font-size:12px;color:#6B7280;margin-bottom:12px;" id="detail-price-${id}">
            ${t('price')}: <b style="color:#E85D04;font-family:Montserrat,sans-serif;font-size:14px;">${price.toLocaleString()} ${t('currency')}</b>
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
  const price = prod.pricePerM2 + (thick > 100 ? (thick - 100) * 200 : 0);
  document.querySelectorAll(`#detail-thick-wrap-${id} .thick-sel-btn`).forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().startsWith(thick.toString()));
  });
  const priceEl = document.querySelector(`#detail-price-${id}`);
  if (priceEl) priceEl.innerHTML = `${t('price')}: <b style="color:#E85D04;font-family:Montserrat,sans-serif;font-size:14px;">${price.toLocaleString()} ${t('currency')}</b>`;
}

function addToCartFromDetail(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[Math.floor(prod.thicknesses.length / 2)];
  Cart.add(productId, thick, 1);
  showToast(`✅ ${prod.name} ${thick}мм — ${t('inCart')}`);
}

// ─── THICK SEL BUTTON STYLE ──────────────────────────────────────
const thickSelStyle = `
  .thick-sel-btn {
    padding: 7px 12px; border: 1.5px solid var(--border);
    border-radius: 8px; font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 700; cursor: pointer;
    background: none; color: var(--dark); transition: .15s;
  }
  .thick-sel-btn.active { border-color: var(--orange); color: var(--orange); background: var(--orange-bg); }
`;

// ─── INIT LANG BUTTONS ───────────────────────────────────────────
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

// ─── INIT FLOAT CART BUTTON ──────────────────────────────────────
function initFloatCart() {
  const btn = document.querySelector('#float-cart-btn');
  if (btn) {
    const count = Cart.count();
    btn.style.display = count > 0 ? 'flex' : 'none';
    const badge = btn.querySelector('.float-badge');
    if (badge) badge.textContent = count;
  }
}

// ─── ACTIVE NAV ITEM ─────────────────────────────────────────────
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
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
    return [];
  }
}

// ─── BITRIX24 ─────────────────────────────────────────────────────
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
          COMMENTS: `Savat: ${cartItems.map(i => `${i.name} ${i.thick}мм × ${i.qty}`).join(', ')}\nShahar: ${formData.city}\nManzil: ${formData.address}\nYetkazish: ${formData.delivery}`,
          SOURCE_ID: 'WEB', SOURCE_DESCRIPTION: 'Telegram Mini App',
          ASSIGNED_BY_ID: B24_MANAGER,
          OPPORTUNITY: total, CURRENCY_ID: 'UZS',
          UF_CRM_LEAD_CITY: formData.city,
          UF_CRM_LEAD_ADDRESS: formData.address,
          UF_CRM_LEAD_DELIVERY_TYPE: formData.delivery,
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
          rows: cartItems.map(i => ({ PRODUCT_NAME: `${i.name} ${i.thick}мм`, QUANTITY: i.qty, PRICE: i.price, MEASURE_NAME: 'м²' }))
        })
      });
      const deadline = new Date(Date.now() + 2 * 3600000).toISOString();
      await fetch(`${B24_WEBHOOK}/tasks.task.add.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            TITLE: `Telegram buyurtma — ${formData.name} — ${formData.phone}`,
            DESCRIPTION: `Shahar: ${formData.city}\nSumma: ${total.toLocaleString()} so'm`,
            RESPONSIBLE_ID: B24_MANAGER, DEADLINE: deadline, PRIORITY: '2'
          }
        })
      });
    }
    return { ok: true, leadId };
  } catch (e) {
    console.error('B24 error:', e);
    return { ok: false };
  }
}
