// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Checkout v4
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
    del:'Удалить', mm:'мм',
    deliveryMethod:'Способ получения', addrPlaceholder:'Улица, дом, квартира',
    namePlaceholder:'Иван Иванов', cityPlaceholder:'Ташкент',
    callMgr:'Заказ будет обработан менеджером. Точная стоимость и сроки уточняются при подтверждении.',
    err:'Ошибка отправки. Позвоните нам.',
  },
  uz: {
    cartTitle:'Savat', formTitle:"Ma'lumotlaringiz", doneTitle:'Bajarildi',
    empty:"Savat bo'sh", emptyText:"Katalogdan mahsulot qo'shing", toCatalog:'Katalog',
    total:'Jami', pcs:'dona', cartNext:'Buyurtma berish',
    name:'Ism va familiya', nameReq:'Ism majburiy',
    phone:'Telefon raqami', phoneReq:'Telefon majburiy',
    city:'Shahar', addr:'Yetkazib berish manzili',
    delivery:'Yetkazib berish', pickup:"O'zi olish",
    submit:'Buyurtmani tasdiqlash', loading:'Yuborilmoqda...',
    successTitle:'Buyurtma qabul qilindi',
    successText:"Menejerimiz 2 soat ichida siz bilan bog'lanadi.",
    orderLabel:'Buyurtma',
    successActions:['Katalog','Bosh sahifa'],
    tab:['Savat',"Ma'lumot",'Tayyor'],
    del:"O'chirish", mm:'mm',
    deliveryMethod:'Yetkazib berish usuli', addrPlaceholder:"Ko'cha, uy, xonadon",
    namePlaceholder:'Ali Valiyev', cityPlaceholder:'Toshkent',
    callMgr:"Buyurtmani menejer ko'rib chiqadi. Narx va muddatlar tasdiqlanishida aniqlanadi.",
    err:"Yuborish xatosi. Bizga qo'ng'iroq qiling.",
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
    del:'Delete', mm:'mm',
    deliveryMethod:'Delivery method', addrPlaceholder:'Street, house, apartment',
    namePlaceholder:'John Smith', cityPlaceholder:'Tashkent',
    callMgr:'The order will be processed by a manager. Exact cost and timing will be confirmed.',
    err:'Error sending. Please call us.',
  }
};

function tx(key) {
  const lang = getCurrentLang();
  return (TX_CO[lang] && TX_CO[lang][key]) ? TX_CO[lang][key] : (TX_CO.ru[key] || key);
}

function goStep(s) {
  if (s > checkoutStep) return;
  checkoutStep = s;
  if (window.hap) window.hap('selection');
  renderStep();
}

function renderStep() {
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

  document.getElementById('page-sub').textContent = tx('tab')[checkoutStep] || '';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  switch(checkoutStep) {
    case 0: renderCart(); break;
    case 1: renderForm(); break;
    case 2: renderSuccess(); break;
  }

  if (typeof injectIcons === 'function') injectIcons();
  if (window.TPAnim) window.TPAnim.refreshAll();
}

function renderCart() {
  const items = Cart.items();
  const content = document.getElementById('step-content');
  const lang = getCurrentLang();

  if (items.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon" data-icon="cart"></div>
        <div class="empty-title">${tx('empty')}</div>
        <div class="empty-text">${tx('emptyText')}</div>
        <a href="index.html" style="margin-top:24px;text-decoration:none">
          <button class="btn-red">
            <span data-icon="grid"></span> ${tx('toCatalog')}
          </button>
        </a>
      </div>`;
    if (typeof injectIcons === 'function') injectIcons();
    return;
  }

  const itemsHtml = items.map((item, idx) => `
    <div class="cart-item" id="ci-${item.key.replace('-','_')}" style="animation-delay:${idx * 50}ms">
      <div class="cart-thumb">
        ${item.image
          ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.outerHTML='<span data-icon=package></span>'">`
          : `<span data-icon="package"></span>`}
      </div>
      <div class="cart-info">
        <div class="cart-name">${item.name}</div>
        <div class="cart-sub">${item.thick} ${tx('mm')} · ${item.price.toLocaleString('ru-RU')} ${lang === 'uz' ? "so'm/м²" : lang === 'en' ? 'sum/m²' : 'сум/м²'}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
          <div class="qty-ctrl" style="height:34px">
            <button class="qty-btn" onclick="cartDelta('${item.key}', -1)" style="font-size:16px;width:32px">−</button>
            <span style="width:30px;text-align:center;font-size:13px;font-weight:700;font-family:var(--font-display)">${item.qty}</span>
            <button class="qty-btn" onclick="cartDelta('${item.key}', 1)" style="font-size:16px;width:32px">+</button>
          </div>
          <span style="font-size:11.5px;color:var(--text-3)">${tx('pcs')}</span>
        </div>
      </div>
      <div class="cart-right">
        <div class="cart-total">${(item.price * item.qty).toLocaleString('ru-RU')}</div>
        <button class="cart-del" onclick="Cart.remove('${item.key}');renderCart()" title="${tx('del')}" data-icon="trash"></button>
      </div>
    </div>`).join('');

  const total = Cart.total();
  const sumLabel = lang === 'uz' ? "so'm" : lang === 'en' ? 'sum' : 'сум';

  content.innerHTML = `
    ${itemsHtml}
    <div class="cart-sum-row">
      <span class="cart-sum-label">${tx('total')}</span>
      <span class="cart-sum-val">${total.toLocaleString('ru-RU')} ${sumLabel}</span>
    </div>
    <button class="btn-red full" style="margin-top:14px" onclick="checkoutStep=1;renderStep()">
      ${tx('cartNext')}
      <span data-icon="arrowRight"></span>
    </button>
    <a href="index.html" class="btn-outline full" style="margin-top:10px;text-decoration:none;justify-content:center">
      + ${lang === 'uz' ? "Yana qo'shish" : lang === 'en' ? 'Add more' : 'Добавить ещё'}
    </a>`;

  if (typeof injectIcons === 'function') injectIcons();
  Cart.updateBadge();
}

function cartDelta(key, delta) {
  Cart.updateQty(key, delta);
  if (window.hap) window.hap('selection');
  renderCart();
}

let formData = { name:'', phone:'', city:'', address:'', delivery:'delivery' };

function renderForm() {
  const content = document.getElementById('step-content');

  content.innerHTML = `
    <div class="form-field">
      <label class="form-label">${tx('name')} <em>*</em></label>
      <input class="form-input" id="f-name" type="text" autocomplete="name"
        placeholder="${tx('namePlaceholder')}"
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
        placeholder="${tx('cityPlaceholder')}"
        value="${formData.city}" oninput="formData.city=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${tx('deliveryMethod')}</label>
      <div class="del-opts">
        <div class="del-opt ${formData.delivery==='delivery'?'sel':''}" onclick="setDelivery('delivery')">
          <div class="del-opt-icon" data-icon="truck"></div>
          <div class="del-opt-label">${tx('delivery')}</div>
        </div>
        <div class="del-opt ${formData.delivery==='pickup'?'sel':''}" onclick="setDelivery('pickup')">
          <div class="del-opt-icon" data-icon="store"></div>
          <div class="del-opt-label">${tx('pickup')}</div>
        </div>
      </div>
    </div>
    ${formData.delivery === 'delivery' ? `
    <div class="form-field">
      <label class="form-label">${tx('addr')}</label>
      <input class="form-input" id="f-addr" type="text"
        placeholder="${tx('addrPlaceholder')}"
        value="${formData.address}" oninput="formData.address=this.value"/>
    </div>` : ''}

    <div style="background:var(--bg);border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--text-2);line-height:1.6;border-left:3px solid var(--red)">
      ${tx('callMgr')}
    </div>

    <button class="btn-red full" id="submit-btn" onclick="submitOrder()">
      ${tx('submit')}
    </button>`;

  if (typeof injectIcons === 'function') injectIcons();
}

function setDelivery(val) {
  formData.delivery = val;
  if (window.hap) window.hap('selection');
  renderForm();
}

async function submitOrder() {
  if (!formData.name.trim()) {
    showToast(tx('nameReq'), 'warning');
    if (window.hap) window.hap('error');
    return;
  }
  if (!formData.phone.trim()) {
    showToast(tx('phoneReq'), 'warning');
    if (window.hap) window.hap('error');
    return;
  }

  const btn = document.getElementById('submit-btn');
  if (btn) { btn.textContent = tx('loading'); btn.disabled = true; btn.style.opacity = '0.7'; }

  const result = await sendToB24(formData, Cart.items());

  if (result.ok) {
    orderNum = '#' + Math.floor(10000 + Math.random() * 90000);
    Cart.clear();
    checkoutStep = 2;
    if (window.hap) window.hap('success');
    renderStep();
  } else {
    if (btn) { btn.textContent = tx('submit'); btn.disabled = false; btn.style.opacity = ''; }
    if (window.hap) window.hap('error');
    showToast(tx('err'), 'error');
  }
}

function renderSuccess() {
  const acts = tx('successActions');
  document.getElementById('step-content').innerHTML = `
    <div class="success-wrap">
      <div class="success-icon-wrap">
        <span style="color:var(--green)" data-icon="check"></span>
      </div>
      <div class="success-h">${tx('successTitle')}</div>
      <div class="order-num-badge">${tx('orderLabel')} ${orderNum}</div>
      <div class="success-t">${tx('successText')}</div>
    </div>
    <a href="index.html" class="btn-red full" style="text-decoration:none;text-align:center;justify-content:center;margin-bottom:10px">
      <span data-icon="grid"></span> ${acts[0]}
    </a>
    <a href="about.html" class="btn-outline full" style="text-decoration:none;text-align:center;justify-content:center">
      <span data-icon="home"></span> ${acts[1]}
    </a>`;
  if (typeof injectIcons === 'function') injectIcons();
}
