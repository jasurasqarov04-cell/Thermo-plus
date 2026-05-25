// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Shared App Logic v4
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
      items.push({ key, id: productId, name: prod.name, thick: thickness, price, qty, category: prod.category, image: prod.image });
    }
    Store.set(Cart._key, items);
    Cart.updateBadge();
    if (window.hap) window.hap('light');
  },
  remove(key) {
    Store.set(Cart._key, Cart.items().filter(i => i.key !== key));
    Cart.updateBadge();
    if (window.hap) window.hap('warning');
  },
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
    if (window.hap) window.hap(isFav ? 'soft' : 'medium');
    updateHeaderFavBadge(!isFav);
    return !isFav;
  },
  has: (productId) => Favs.ids().includes(productId),
  count: () => Favs.ids().length,
  products: () => (window.PRODUCTS_DATA || []).filter(p => Favs.ids().includes(p.id))
};

// ─── HEADER FAVORITES BUTTON (auto-injected) ──────────────────────
function injectHeaderFavBtn() {
  const header = document.querySelector('.header');
  if (!header || header.querySelector('.header-fav-btn')) return;
  const isOnFavPage = /favorites\.html/.test(location.pathname);
  const langWrap = header.querySelector('.lang-wrap');
  const btn = document.createElement('a');
  btn.className = 'header-fav-btn';
  btn.href = 'favorites.html';
  btn.setAttribute('aria-label', 'Favorites');
  if (isOnFavPage) btn.setAttribute('aria-current', 'page');
  btn.innerHTML = `<span class="header-fav-icon" data-icon="heart"></span><span class="header-fav-count" id="header-fav-count">0</span>`;
  if (langWrap) header.insertBefore(btn, langWrap);
  else header.appendChild(btn);
  if (typeof injectIcons === 'function') injectIcons();
  updateHeaderFavBadge(false);
}

function updateHeaderFavBadge(animate) {
  const count = (typeof Favs !== 'undefined') ? Favs.count() : 0;
  const btn = document.querySelector('.header-fav-btn');
  const badge = document.getElementById('header-fav-count');
  if (!btn || !badge) return;
  badge.textContent = count;
  btn.classList.toggle('has-favs', count > 0);
  if (animate) {
    btn.classList.remove('bump');
    void btn.offsetWidth;
    btn.classList.add('bump');
  }
}

// ─── PRICE CALC ───────────────────────────────────────────────────
// Linear scaling against the base (50mm) price.
function getPrice(prod, thick) {
  const base = prod.pricePerM2;
  const ref = (prod.thicknesses && prod.thicknesses[0]) || 50;
  // Round to nearest 10 sum
  const v = base * (thick / ref);
  return Math.round(v / 10) * 10;
}

function getPackArea(prod, thick) {
  // Pack area shrinks as slabs get thicker (fixed pack volume)
  const ref = (prod.thicknesses && prod.thicknesses[0]) || 50;
  const slabsRef = prod.packSlabs || 9;
  const slabs = Math.max(1, Math.round(slabsRef * ref / thick));
  const area = 1.2 * 0.6 * slabs;
  return Math.round(area * 100) / 100;
}

// ─── TOAST ────────────────────────────────────────────────────────
function showToast(msg, type = 'default') {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  const iconHtml =
    type === 'success' ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` :
    type === 'error'   ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>` :
    type === 'warning' ? `<span style="color:#FBBF24;font-weight:900">!</span>` : '';
  el.innerHTML = `${iconHtml}<span>${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ─── CATEGORY MAPS ────────────────────────────────────────────────
// Use new SVG icon library when available, fallback to inline.
function catIconSvg(category) {
  if (typeof ic === 'function') return ic(category) || '';
  return '';
}
const CAT_ICON_SVG = new Proxy({}, {
  get: (_, cat) => catIconSvg(cat)
});

// Heart SVG
function heartSvg(filled) {
  if (typeof ic === 'function') return filled ? ic('heartFilled') : ic('heart');
  return filled
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

// ─── PRODUCT IMAGE HTML ───────────────────────────────────────────
function buildProductImgHtml(prod) {
  const placeholder = catIconSvg(prod.category) || '';
  if (prod.image) {
    return `<img src="${prod.image}" alt="${prod.name}" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="prod-img-placeholder" style="display:none;color:var(--text-3)">${placeholder}</span>`;
  }
  return `<span class="prod-img-placeholder" style="color:var(--text-3)">${placeholder}</span>`;
}

// ─── PRODUCT CARD BUILDER ─────────────────────────────────────────
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
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <div class="prod-badges">
              <span class="badge badge-fire">НГ</span>
              ${prod.badge ? `<span class="badge badge-pro">${prod.badge}</span>` : ''}
              <span class="badge" style="background:var(--bg);color:var(--text-3)">${prod.density} кг/м³</span>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div class="prod-img-wrap" onclick="openDetail(${prod.id})">
            ${buildProductImgHtml(prod)}
          </div>
          <button class="fav-btn-card ${isFav ? 'fav-active' : ''}" onclick="toggleFavCard(event, ${prod.id})" id="fav-${prod.id}" aria-label="favorite">
            ${heartSvg(isFav)}
          </button>
        </div>
      </div>

      <div class="thick-chips-row" id="thick-row-${prod.id}">${thickChips}</div>

      <div class="prod-price-row">
        <div class="prod-price" id="price-${prod.id}">
          ${price.toLocaleString('ru-RU')} <small>${t('currency')}</small>
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
  if (!cartNavItem) return;

  const src = card ? card.getBoundingClientRect() : { left: window.innerWidth/2 - 12, top: window.innerHeight/2 - 12, width: 24, height: 24 };
  const dst = cartNavItem.getBoundingClientRect();

  const dot = document.createElement('div');
  dot.style.cssText = `
    position:fixed;width:14px;height:14px;border-radius:50%;
    background: var(--grad-red);
    box-shadow: 0 4px 12px rgba(199,18,25,.55);
    z-index:9999;pointer-events:none;
    left:${src.left + src.width / 2 - 7}px;
    top:${src.top + src.height / 2 - 7}px;
    transition:left .55s cubic-bezier(.4,0,.2,1),top .55s cubic-bezier(.4,0,.2,1),opacity .55s,transform .55s;
  `;
  document.body.appendChild(dot);
  requestAnimationFrame(() => {
    dot.style.left = `${dst.left + dst.width / 2 - 7}px`;
    dot.style.top  = `${dst.top + dst.height / 2 - 7}px`;
    dot.style.opacity = '0';
    dot.style.transform = 'scale(0.3)';
  });
  setTimeout(() => dot.remove(), 600);
  cartNavItem.classList.add('cart-bounce');
  setTimeout(() => cartNavItem.classList.remove('cart-bounce'), 500);
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
  if (priceEl) priceEl.innerHTML = `${price.toLocaleString('ru-RU')} <small>${t('currency')}</small>`;
  if (window.hap) window.hap('selection');
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
  const msg = lang === 'uz' ? `${prod.name} savatga qo'shildi`
            : lang === 'ru' ? `${prod.name} добавлен в корзину`
            : `${prod.name} added to cart`;
  showToast(msg, 'success');
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
  if (isNowFav) flyToFavorites(e.currentTarget || btn);
  const lang = getCurrentLang();
  const msg = isNowFav
    ? (lang === 'ru' ? `Добавлено в избранное` : lang === 'uz' ? "Sevimlilarga qo'shildi" : `Added to favorites`)
    : (lang === 'ru' ? `Удалено из избранного` : lang === 'uz' ? "Sevimlilardan olib tashlandi" : `Removed`);
  showToast(msg, isNowFav ? 'success' : 'default');
}

// Tiny heart flying from card → header favorites button
function flyToFavorites(sourceEl) {
  const target = document.querySelector('.header-fav-btn');
  if (!sourceEl || !target) return;
  const a = sourceEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const ghost = document.createElement('span');
  ghost.innerHTML = (typeof ic === 'function')
    ? ic('heartFilled')
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="#C71219"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  ghost.style.cssText = `
    position:fixed; left:${a.left + a.width/2 - 11}px; top:${a.top + a.height/2 - 11}px;
    width:22px; height:22px; color:#C71219;
    pointer-events:none; z-index:9999;
    filter: drop-shadow(0 4px 12px rgba(199,18,25,.45));
    transition: transform .65s cubic-bezier(.5,-0.2,.25,1.2), opacity .65s ease;
  `;
  document.body.appendChild(ghost);
  const tx = b.left + b.width/2 - (a.left + a.width/2);
  const ty = b.top  + b.height/2 - (a.top + a.height/2);
  requestAnimationFrame(() => {
    ghost.style.transform = `translate(${tx}px, ${ty}px) scale(.55) rotate(-12deg)`;
    ghost.style.opacity = '0.2';
  });
  setTimeout(() => ghost.remove(), 700);
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
      onclick="selectDetailThick(${id}, ${t2})" data-detail-thick="${t2}" id="dthick-${id}-${t2}">
      ${t2} ${lang === 'uz' || lang === 'en' ? 'mm' : 'мм'}
    </button>`).join('');

  const specRows = [
    [t('fireRes'),   prod.fire],
    [t('maxTemp'),   `≤ ${prod.temp}°C`],
    [t('density'),   `${prod.density} кг/м³`],
    [t('size'),      `${prod.size} мм`],
    [t('lambda'),    `${prod.lambda} Вт/м·К`],
    [t('packArea'),  `${getPackArea(prod, th)} м²`],
    [t('packSlabs'), `${prod.packSlabs} шт`],
  ].map(([k, v]) =>
    `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`
  ).join('');

  const addLabel = lang === 'uz' ? 'Savatga' : lang === 'en' ? 'Add to cart' : 'В корзину';
  const placeholder = catIconSvg(prod.category) || '';

  // Related products — same category, up to 8 items
  const related = (window.PRODUCTS_DATA || []).filter(o => o.id !== id && o.category === prod.category).slice(0, 8);
  const relatedHtml = related.length ? `
    <div class="related-section">
      <div class="related-section-title">${t('related')}</div>
      <div class="related-rail">
        ${related.map(o => {
          const rCatLabel = (CAT_LABELS[lang] || CAT_LABELS['ru'])[o.category] || o.category;
          const rPlaceholder = catIconSvg(o.category) || '';
          return `
          <div class="related-card" onclick="closeDetail();setTimeout(()=>openDetail(${o.id}),260)">
            <div class="related-card-img">
              <span class="related-card-fallback">${rPlaceholder}</span>
              ${o.image ? `<img src="${o.image}" alt="${(o.name || '').replace(/"/g, '&quot;')}" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="related-card-body">
              <div class="related-card-cat">${rCatLabel}</div>
              <div class="related-card-name">${o.name}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  // Factory icon
  const factorySvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M3 20V11l5 3V9l5 3V7l5 3-1 10"/></svg>`;

  const html = `
    <div class="overlay" id="detail-overlay" onclick="if(event.target===this)closeDetail()">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <div>
            <div style="font-size:10px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px">${catLabel}</div>
            <span class="sheet-title">${prod.name}</span>
          </div>
          <button class="sheet-close" onclick="closeDetail()">
            ${typeof ic === 'function' ? ic('close') : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`}
          </button>
        </div>
        <div class="sheet-body">
          <div style="background:linear-gradient(135deg,var(--bg2),var(--bg3));border-radius:18px;height:200px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:16px;position:relative">
            ${prod.image
              ? `<img src="${prod.image}" alt="${prod.name}" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" onerror="this.parentElement.querySelector('.det-placeholder').style.display='flex';this.style.display='none'">
                 <span class="det-placeholder" style="display:none;color:var(--text-3);font-size:80px">${placeholder}</span>`
              : `<span style="color:var(--text-3);font-size:80px">${placeholder}</span>`}
          </div>
          <span class="made-badge"><span class="dot"></span>${factorySvg}<span>${t('madeInKhorezm')}</span></span>
          <p style="font-size:13.5px;color:var(--text-2);line-height:1.65;margin-bottom:18px;">${desc}</p>
          <div style="background:var(--bg);border-radius:14px;padding:4px 14px;margin-bottom:18px;border:1px solid var(--border)">${specRows}</div>
          <div style="margin-bottom:18px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);margin-bottom:10px;letter-spacing:0.5px;text-transform:uppercase;">${t('thickness')}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;" id="detail-thick-wrap-${id}">${thickBtns}</div>
          </div>
          <div style="margin-bottom:18px;" id="detail-price-${id}">
            <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${t('price')}</div>
            <div style="font-family:var(--font-display);font-size:28px;font-weight:900;color:var(--text);letter-spacing:-0.8px;line-height:1;">
              ${price.toLocaleString('ru-RU')}
              <span style="font-size:14px;font-weight:500;color:var(--text-2);margin-left:4px">${t('currency')}</span>
            </div>
          </div>
          <button class="btn-red full" onclick="addToCartFromDetail(${id});closeDetail()">
            ${addLabel}
          </button>
          ${relatedHtml}
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', html);
  if (window.hap) window.hap('light');
}

function closeDetail() {
  const el = document.querySelector('#detail-overlay');
  if (!el) return;
  el.style.animation = 'fadeIn .2s ease reverse';
  const sheet = el.querySelector('.sheet');
  if (sheet) sheet.style.animation = 'sheetIn .25s ease reverse';
  setTimeout(() => el.remove(), 220);
}

function selectDetailThick(id, thick) {
  thickState[id] = thick;
  const prod = PRODUCTS_DATA.find(p => p.id === id);
  if (!prod) return;
  const price = getPrice(prod, thick);
  document.querySelectorAll(`#detail-thick-wrap-${id} .thick-sel-btn`).forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.detailThick) === thick);
  });
  const priceEl = document.querySelector(`#detail-price-${id}`);
  if (priceEl) priceEl.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${t('price')}</div>
    <div style="font-family:var(--font-display);font-size:28px;font-weight:900;color:var(--text);letter-spacing:-0.8px;line-height:1;">
      ${price.toLocaleString('ru-RU')}
      <span style="font-size:14px;font-weight:500;color:var(--text-2);margin-left:4px">${t('currency')}</span>
    </div>`;
  if (window.hap) window.hap('selection');
}

function addToCartFromDetail(productId) {
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  const thick = thickState[productId] || prod.thicknesses[0];
  Cart.add(productId, thick, 1);
  const lang = getCurrentLang();
  const msg = lang === 'ru' ? `${prod.name} добавлен в корзину`
            : lang === 'uz' ? `${prod.name} savatga qo'shildi`
            : `${prod.name} added`;
  showToast(msg, 'success');
  flyToCart(productId);
}

// ─── LANG BUTTONS ─────────────────────────────────────────────────
function initLangButtons() {
  const lang = getCurrentLang();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.addEventListener('click', () => {
      if (window.hap) window.hap('selection');
      setLang(btn.dataset.lang);
      if (typeof onLangChange === 'function') onLangChange();
    });
  });
  Cart.updateBadge();
  injectHeaderFavBtn();
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
          SOURCE_DESCRIPTION: 'Telegram Mini App v4',
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
