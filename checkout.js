// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Checkout Logic
// ═══════════════════════════════════════════════════════════════

let checkoutStep = 0;
const ORDER_NUM = 100000 + Math.floor(Math.random() * 900000);
const CITIES_UZ = ['Toshkent','Samarqand','Buxoro','Urganch','Namangan','Andijon',"Farg'ona",'Nukus','Qarshi','Termiz'];
const CITIES_RU = ['Ташкент','Самарканд','Бухара','Ургенч','Наманган','Андижан','Фергана','Нукус','Карши','Термез'];

let orderForm = {
  name: '', phone: '', email: '', city: 'Toshkent', address: '', delivery: 'delivery'
};

function goStep(n) {
  const items = Cart.items();
  if (n === 1 && items.length === 0) {
    showToast('⚠️ ' + (getCurrentLang()==='uz'?'Savat bo\'sh':'Корзина пуста'));
    return;
  }
  checkoutStep = n;
  renderStep();
  updateTabs();
}

function updateTabs() {
  const lang = getCurrentLang();
  const labels = [
    ['🛒 '+( lang==='uz'?'Savat':'Корзина'), '📝 '+(lang==='uz'?'Ma\'lumot':'Данные'), '✅ '+(lang==='uz'?'Tayyor':'Готово')]
  ][0];
  for(let i=0;i<3;i++){
    const tab = document.getElementById(`tab-${i}`);
    const lbl = document.getElementById(`tab-label-${i}`);
    if(!tab||!lbl) continue;
    if(i===checkoutStep){
      tab.style.borderBottom='2px solid #E85D04';
      tab.style.opacity='1';
      lbl.style.color='#E85D04';
    } else {
      tab.style.borderBottom='2px solid transparent';
      tab.style.opacity= i < checkoutStep ? '1' : '0.5';
      lbl.style.color= i < checkoutStep ? '#374151' : '#9CA3AF';
    }
    lbl.textContent = labels[i];
  }
}

function renderStep() {
  updateTabs();
  switch(checkoutStep){
    case 0: renderCart(); break;
    case 1: renderForm(); break;
    case 2: renderSuccess(); break;
  }
}

// ─── STEP 0: CART ─────────────────────────────────────────────
function renderCart() {
  const lang = getCurrentLang();
  const items = Cart.items();
  const content = document.getElementById('step-content');
  if (!content) return;

  if (items.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <div class="empty-title">${lang==='uz'?'Savat bo\'sh':'Корзина пуста'}</div>
        <div class="empty-text">${lang==='uz'?'Katalogdan mahsulot qo\'shing':'Добавьте товары из каталога'}</div>
        <a href="index.html" class="btn-orange mt12" style="margin:16px auto 0;text-decoration:none">
          📦 ${lang==='uz'?'Katalog':'Каталог'}
        </a>
      </div>`;
    return;
  }

  const itemsHtml = items.map(item => `
    <div class="cart-item">
      <div class="cart-thumb">${CAT_EMOJI[item.category]||'🧱'}</div>
      <div class="cart-info">
        <div class="cart-name">${item.name}</div>
        <div class="cart-sub">${item.thick}мм • ${item.price.toLocaleString()} ${t('currency')}</div>
        <div class="qty-ctrl" style="width:90px;margin-top:5px">
          <button class="qty-btn" onclick="Cart.updateQty('${item.key}',-1);renderCart()">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="Cart.updateQty('${item.key}',1);renderCart()">+</button>
        </div>
      </div>
      <div class="cart-right">
        <div class="cart-total">${(item.price*item.qty).toLocaleString()}</div>
        <button class="cart-del" onclick="Cart.remove('${item.key}');renderCart()">🗑️</button>
      </div>
    </div>`).join('');

  content.innerHTML = `
    ${itemsHtml}
    <div class="cart-sum-row">
      <span class="cart-sum-label">${t('total')}:</span>
      <span class="cart-sum-val">${Cart.total().toLocaleString()} so'm</span>
    </div>
    <button class="btn-orange full large mt12" onclick="goStep(1)">
      ${lang==='uz'?'Buyurtma berish →':'Оформить заказ →'}
    </button>
    <a href="index.html" class="btn-outline" style="width:100%;display:flex;justify-content:center;margin-top:8px;text-decoration:none;padding:11px">
      ${lang==='uz'?'← Katalogga qaytish':'← Вернуться в каталог'}
    </a>`;
}

// ─── STEP 1: FORM ─────────────────────────────────────────────
function renderForm() {
  const lang = getCurrentLang();
  const items = Cart.items();
  const cities = lang==='uz' ? CITIES_UZ : CITIES_RU;

  const orderSummary = items.map(i =>
    `<div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px">
      <span style="color:#6B7280">${i.name} ${i.thick}мм × ${i.qty}</span>
      <b style="color:#E85D04">${(i.price*i.qty).toLocaleString()}</b>
    </div>`).join('') +
    `<div style="border-top:1.5px solid #e5e7eb;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800;font-size:14px">
      <span>${t('total')}:</span>
      <span style="color:#E85D04">${Cart.total().toLocaleString()} so'm</span>
    </div>`;

  document.getElementById('step-content').innerHTML = `
    <div class="form-field">
      <label class="form-label">${t('name')} <em>*</em></label>
      <input class="form-input" id="f-name" type="text" placeholder="${lang==='uz'?'Ism va Familiya':'Имя и Фамилия'}"
        value="${orderForm.name}" oninput="orderForm.name=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${t('phone')} <em>*</em></label>
      <input class="form-input" id="f-phone" type="tel" placeholder="+998 90 000 00 00"
        value="${orderForm.phone}" oninput="orderForm.phone=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${t('email')}</label>
      <input class="form-input" id="f-email" type="email" placeholder="email@mail.uz"
        value="${orderForm.email}" oninput="orderForm.email=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${t('city')}</label>
      <select class="form-select" onchange="orderForm.city=this.value">
        ${cities.map(c=>`<option ${orderForm.city===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-field">
      <label class="form-label">${t('address')}</label>
      <input class="form-input" id="f-addr" type="text"
        placeholder="${lang==='uz'?'Ko\'cha, uy, xonadon...':'Улица, дом, квартира...'}"
        value="${orderForm.address}" oninput="orderForm.address=this.value"/>
    </div>
    <div class="form-field">
      <label class="form-label">${lang==='uz'?'Olish usuli':'Способ получения'}</label>
      <div class="del-opts">
        <div class="del-opt ${orderForm.delivery==='delivery'?'sel':''}" onclick="setDelivery('delivery')">
          <div class="del-opt-icon">🚛</div>
          <div class="del-opt-label">${t('delivery')}</div>
        </div>
        <div class="del-opt ${orderForm.delivery==='pickup'?'sel':''}" onclick="setDelivery('pickup')">
          <div class="del-opt-icon">🏭</div>
          <div class="del-opt-label">${t('pickup')}</div>
        </div>
      </div>
    </div>
    <div style="background:#f9fafb;border-radius:12px;padding:12px;margin-bottom:14px">${orderSummary}</div>
    <button class="btn-orange full large" id="confirm-btn" onclick="submitOrder()">
      ✅ ${t('confirm')}
    </button>`;
}

function setDelivery(type) {
  orderForm.delivery = type;
  renderForm();
}

async function submitOrder() {
  if (!orderForm.name || !orderForm.phone) {
    showToast('⚠️ ' + t('fieldRequired'));
    return;
  }
  const btn = document.getElementById('confirm-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ ' + t('loading'); }
  await sendToB24(orderForm, Cart.items());
  checkoutStep = 2;
  renderStep();
}

// ─── STEP 2: SUCCESS ──────────────────────────────────────────
function renderSuccess() {
  const lang = getCurrentLang();
  document.getElementById('step-content').innerHTML = `
    <div class="success-wrap">
      <div class="success-icon">🎉</div>
      <div class="success-h">${t('orderSuccess')}</div>
      <div class="order-num-badge">№ ${ORDER_NUM}</div>
      <div class="success-t">${t('orderSuccessText')}</div>
      <div style="margin-top:16px;background:#f9fafb;border-radius:12px;padding:14px;text-align:left">
        <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:8px">
          ${lang==='uz'?'Buyurtma ma\'lumotlari:':'Данные заказа:'}
        </div>
        <div style="font-size:12px;color:#6B7280;line-height:1.8">
          👤 ${orderForm.name}<br/>
          📞 ${orderForm.phone}<br/>
          📍 ${orderForm.city}${orderForm.address ? ', '+orderForm.address : ''}<br/>
          🚛 ${orderForm.delivery==='delivery'?t('delivery'):t('pickup')}
        </div>
      </div>
      <a href="index.html" class="btn-orange full large mt12" style="text-decoration:none;margin-top:14px"
        onclick="Cart.clear()">
        ${lang==='uz'?'Yana xarid qilish':'Продолжить покупки'}
      </a>
    </div>`;
}
