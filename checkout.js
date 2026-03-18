// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Checkout v3
// ═══════════════════════════════════════════════════════════════

let checkoutStep = 0;
let orderNum = null;

const TX_CO = {
  ru: {
    cartTitle:'Корзина', formTitle:'Ваши данные', doneTitle:'Оформлено',
    empty:'Корзина пуста', emptyText:'Добавьте товары из каталога', toCatalog:'В каталог',
    total:'Итого', pcs:'шт', cartNext:'Оформить заказ',
    name:'Имя и фамилия', nameReq:'Имя обязательно',
    phone:'Номер телефона', phoneReq:'Телефон обязателен',
    city:'Город', addr:'Адрес доставки',
    delivery:'Доставка', pickup:'Самовывоз',
    submit:'Подтвердить заказ', loading:'Отправляем...',
    successTitle:'Заказ принят',
    successText:'Наш менеджер свяжется с вами в течение 2 часов.',
    orderLabel:'Заказ',
    successActions:['Перейти в каталог','На главную'],
    tab:['Корзина','Данные','Готово'],
    del:'Удалить',
    mm:'мм',
  },
  uz: {
    cartTitle:'Savat', formTitle:'Ma\'lumotlaringiz', doneTitle:'Bajarildi',
    empty:'Savat bo\'sh', emptyText:'Katalogdan mahsulot qo\'shing', toCatalog:'Katalog',
    total:'Jami', pcs:'dona', cartNext:'Buyurtma berish',
    name:'Ism va familiya', nameReq:'Ism majburiy',
    phone:'Telefon raqami', phoneReq:'Telefon majburiy',
    city:'Shahar', addr:'Yetkazib berish manzili',
    delivery:'Yetkazib berish', pickup:'O\'zi olish',
    submit:'Buyurtmani tasdiqlash', loading:'Yuborilmoqda...',
    successTitle:'Buyurtma qabul qilindi',
    successText:'Menejerimiz 2 soat ichida siz bilan bog\'lanadi.',
    orderLabel:'Buyurtma',
    successActions:['Katalog','Bosh sahifa'],
    tab:['Savat','Ma\'lumot','Tayyor'],
    del:'O\'chirish',
    mm:'mm',
  },
  en: {
    cartTitle:'Cart', formTitle:'Your details', doneTitle:'Done',
    empty:'Cart is empty', emptyText:'Add products from the catalog', toCatalog:'Go to catalog',
    total:'Total', pcs:'pcs', cartNext:'Place order',
    name:'Full name', nameReq:'Name is required',
    phone:'Phone number', phoneReq:'Phone is required',
    city:'City', addr:'Delivery address',
    delivery:'Delivery', pickup:'Pickup',
    submit:'Confirm order', loading:'Sending...',
    successTitle:'Order received',
    successText:'Our manager will contact you within 2 hours.',
    orderLabel:'Order',
    successActions:['Browse catalog','Go home'],
    tab:['Cart','Details','Done'],
    del:'Delete',
    mm:'mm',
  }
};

function tx(key) {
  const lang = getCurrentLang();
  return (TX_CO[lang] && TX_CO[lang][key]) ? TX_CO[lang][key] : (TX_CO.ru[key] || key);
}

function goStep(s) {
  if (s > checkoutStep) return; // can only go back
  checkoutStep = s;
  renderStep();
}

function renderStep() {
  // Update tabs
  const tabLabels = tx('tab');
  for (let i = 0; i <= 2; i++) {
    const tab = document.getElementById(`tab-${i}`);
    const label = document.getElementById(`tab-label-${i}`);
    if (!tab) continue;
    if (label) label.textContent = tabLabels[i];
    tab.classList.remove('active','done');
    if (i === checkoutStep) tab.classList.add('active');
    else if (i < checkoutStep) tab.classList.add('done');
  }

  const lang = getCurrentLang();
  document.getElementById('page-sub').textContent = tx('tab')[checkoutStep] || '';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  switch(checkoutStep) {
    case 0: renderCart(); break;
    case 1: renderForm(); break;
    case 2: renderSuccess(); break;
  }
}

function renderCart() {
  const items = Cart.items();
  const content = document.getElementById('step-content');
  const lang = getCurrentLang();

  if (items.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" style="color:var(--text-3)">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <div class="empty-title">${tx('empty')}</div>
        <div class="empty-text">${tx('emptyText')}</div>
        <a href="index.html" style="margin-top:20px" class="btn-red" style="text-decoration:none">
          ${tx('toCatalog')}
        </a>
      </div>`;
    return;
  }

  const itemsHtml = items.map(item => `
    <div class="cart-item" id="ci-${item.key.replace('-','_')}">
      <div class="cart-thumb">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-3)"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/></svg>
      </div>
      <div class="cart-info">
        <div class="cart-name">${item.name}</div>
        <div class="cart-sub">${item.thick} ${tx('mm')} · ${item.price.toLocaleString()} ${lang === 'uz' ? 'so\'m/м²' : lang === 'en' ? 'sum/m²' : 'сум/м²'}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
          <div class="qty-ctrl" style="height:32px">
            <button class="qty-btn" onclick="cartDelta('${item.key}', -1)" style="font-size:16px">−</button>
            <span style="width:28px;text-align:center;font-size:13px;font-weight:700">${item.qty}</span>
            <button class="qty-btn" onclick="cartDelta('${item.key}', 1)" style="font-size:16px">+</button>
          </div>
          <span style="font-size:12px;color:var(--text-2)">${tx('pcs')}</span>
        </div>
      </div>
      <div class="cart-right">
        <div class="cart-total">${(item.price * item.qty).toLocaleString()}</div>
        <button class="cart-del" onclick="Cart.remove('${item.key}');renderCart()" title="${tx('del')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>`).join('');

  const total = Cart.total();
  const sumLabel = lang === 'uz' ? 'so\'m' : lang === 'en' ? 'sum' : 'сум';

  content.innerHTML = `
    ${itemsHtml}
    <div class="cart-sum-row">
      <span class="cart-sum-label">${tx('total')}</span>
      <span class="cart-sum-val">${total.toLocaleString()} ${sumLabel}</span>
    </div>
    <button class="btn-red full" style="margin-top:12px" onclick="checkoutStep=1;renderStep()">
      ${tx('cartNext')}
    </button>
    <a href="index.html" class="btn-outline full" style="margin-top:8px;text-decoration:none;text-align:center">
      + ${lang === 'uz' ? 'Yana qo\'shish' : lang === 'en' ? 'Add more' : 'Добавить ещё'}
    </a>`;

  Cart.updateBadge();
}

function cartDelta(key, delta) {
  Cart.updateQty(key, delta);
  renderCart();
}

let formData = { name:'', phone:'', city:'', address:'', delivery:'delivery' };

function renderForm() {
  const lang = getCurrentLang();
  const content = document.getElementById('step-content');

  content.innerHTML = `
    <div class="form-field">
      <label class="form-label">${tx('name')} <em>*</em></label>
      <input class="form-input" id="f-name" type="text" autocomplete="name"
        placeholder="${lang === 'ru' ? 'Иван Иванов' : lang === 'uz' ? 'Ali Valiyev' : 'John Smith'}"
        value="${formData.name}" oninput="formData.name=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${tx('phone')} <em>*</em></label>
      <input class="form-input" id="f-phone" type="tel" autocomplete="tel"
        placeholder="+998 90 000 00 00"
        value="${formData.phone}" oninput="formData.phone=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${tx('city')}</label>
      <input class="form-input" id="f-city" type="text"
        placeholder="${lang === 'ru' ? 'Ташкент' : lang === 'uz' ? 'Toshkent' : 'Tashkent'}"
        value="${formData.city}" oninput="formData.city=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${lang === 'uz' ? 'Yetkazib berish usuli' : lang === 'en' ? 'Delivery method' : 'Способ получения'}</label>
      <div class="del-opts">
        <div class="del-opt ${formData.delivery==='delivery'?'sel':''}" onclick="setDelivery('delivery')">
          <div style="font-size:20px;margin-bottom:4px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-2)"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="del-opt-label">${tx('delivery')}</div>
        </div>
        <div class="del-opt ${formData.delivery==='pickup'?'sel':''}" onclick="setDelivery('pickup')">
          <div style="font-size:20px;margin-bottom:4px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-2)"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
          </div>
          <div class="del-opt-label">${tx('pickup')}</div>
        </div>
      </div>
    </div>
    ${formData.delivery === 'delivery' ? `
    <div class="form-field">
      <label class="form-label">${tx('addr')}</label>
      <input class="form-input" id="f-addr" type="text"
        placeholder="${lang === 'ru' ? 'Улица, дом, квартира' : lang === 'uz' ? 'Ko\'cha, uy, xonadon' : 'Street, house, apartment'}"
        value="${formData.address}" oninput="formData.address=this.value"/>
    </div>` : ''}

    <div style="background:var(--bg);border-radius:var(--r-sm);padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--text-2);line-height:1.6">
      ${lang === 'ru' ? 'Заказ будет обработан менеджером. Точная стоимость и сроки уточняются при подтверждении.'
        : lang === 'uz' ? 'Buyurtma menejer tomonidan ko\'rib chiqiladi. Narx va muddatlar tasdiqlanishida aniqlanadi.'
        : 'The order will be processed by a manager. Exact cost and timing will be confirmed.'}
    </div>

    <button class="btn-red full" id="submit-btn" onclick="submitOrder()">
      ${tx('submit')}
    </button>`;
}

function setDelivery(val) {
  formData.delivery = val;
  renderForm();
}

async function submitOrder() {
  if (!formData.name.trim()) { showToast('⚠️ ' + tx('nameReq')); return; }
  if (!formData.phone.trim()) { showToast('⚠️ ' + tx('phoneReq')); return; }

  const btn = document.getElementById('submit-btn');
  if (btn) { btn.textContent = tx('loading'); btn.disabled = true; }

  const result = await sendToB24(formData, Cart.items());

  if (result.ok) {
    orderNum = '#' + Math.floor(10000 + Math.random() * 90000);
    Cart.clear();
    checkoutStep = 2;
    renderStep();
  } else {
    if (btn) { btn.textContent = tx('submit'); btn.disabled = false; }
    const lang = getCurrentLang();
    showToast(lang === 'ru' ? 'Ошибка отправки. Позвоните нам.' : 'Error. Please call us.');
  }
}

function renderSuccess() {
  const lang = getCurrentLang();
  const acts = tx('successActions');
  document.getElementById('step-content').innerHTML = `
    <div class="success-wrap">
      <div style="width:72px;height:72px;border-radius:50%;background:var(--green-bg);display:flex;align-items:center;justify-content:center;margin-bottom:20px">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="success-h">${tx('successTitle')}</div>
      <div class="order-num-badge">${tx('orderLabel')} ${orderNum}</div>
      <div class="success-t">${tx('successText')}</div>
    </div>
    <a href="index.html" class="btn-red full" style="text-decoration:none;text-align:center;display:flex;justify-content:center;align-items:center;margin-bottom:8px">
      ${acts[0]}
    </a>
    <a href="about.html" class="btn-outline full" style="text-decoration:none;text-align:center">
      ${acts[1]}
    </a>`;
}
