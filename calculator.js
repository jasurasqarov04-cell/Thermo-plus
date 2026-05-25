// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Calculator v4 — Guided Step Flow
// ═══════════════════════════════════════════════════════════════

let calcState = {
  step: 1,
  region: null,
  surface: null,
  construction: null,
  area: null,
  goal: null,
};

const TOTAL_STEPS = 5;

// ─── DATA ─────────────────────────────────────────────────────────
const REGIONS = {
  uz: [
    { id:'tashkent', label:'Тошкент', sub:'Зона 3' },
    { id:'samarkand', label:'Самарқанд', sub:'Зона 3' },
    { id:'urgench', label:'Урганч / Хоразм', sub:'Зона 4' },
    { id:'namangan', label:'Наманган', sub:'Зона 3' },
    { id:'fergana',  label:'Фарғона', sub:'Зона 3' },
    { id:'nukus',    label:'Нукус', sub:'Зона 4' },
    { id:'termez',   label:'Термиз', sub:'Зона 2' },
    { id:'other',    label:'Бошқа', sub:'—' },
  ],
  ru: [
    { id:'tashkent', label:'Ташкент', sub:'Зона 3' },
    { id:'samarkand', label:'Самарканд', sub:'Зона 3' },
    { id:'urgench', label:'Ургенч / Хорезм', sub:'Зона 4' },
    { id:'namangan', label:'Наманган', sub:'Зона 3' },
    { id:'fergana',  label:'Фергана', sub:'Зона 3' },
    { id:'nukus',    label:'Нукус', sub:'Зона 4' },
    { id:'termez',   label:'Термез', sub:'Зона 2' },
    { id:'other',    label:'Другой', sub:'—' },
  ],
  en: [
    { id:'tashkent', label:'Tashkent', sub:'Zone 3' },
    { id:'samarkand', label:'Samarkand', sub:'Zone 3' },
    { id:'urgench', label:'Urgench / Khorezm', sub:'Zone 4' },
    { id:'namangan', label:'Namangan', sub:'Zone 3' },
    { id:'fergana',  label:'Fergana', sub:'Zone 3' },
    { id:'nukus',    label:'Nukus', sub:'Zone 4' },
    { id:'termez',   label:'Termez', sub:'Zone 2' },
    { id:'other',    label:'Other', sub:'—' },
  ]
};

const SURFACES = {
  ru: [
    { id:'facade', icon:'facade', label:'Фасад', sub:'Внешние стены здания' },
    { id:'roof',   icon:'roof',   label:'Кровля', sub:'Скатная или плоская крыша' },
    { id:'floor',  icon:'floor',  label:'Пол',    sub:'Межэтажные перекрытия' },
    { id:'wall',   icon:'wall',   label:'Перегородки', sub:'Внутренние стены' },
    { id:'tech',   icon:'tech',   label:'Технический', sub:'Трубы, оборудование' },
  ],
  uz: [
    { id:'facade', icon:'facade', label:'Fasad', sub:'Binoning tashqi devori' },
    { id:'roof',   icon:'roof',   label:'Tom', sub:'Qiyalik yoki tekis tom' },
    { id:'floor',  icon:'floor',  label:'Pol', sub:"Qavat oralig'i" },
    { id:'wall',   icon:'wall',   label:"Bo'lim", sub:'Ichki devorlar' },
    { id:'tech',   icon:'tech',   label:'Texnik', sub:'Trubalar, uskunalar' },
  ],
  en: [
    { id:'facade', icon:'facade', label:'Facade', sub:'External building walls' },
    { id:'roof',   icon:'roof',   label:'Roof', sub:'Pitched or flat roof' },
    { id:'floor',  icon:'floor',  label:'Floor', sub:'Floor slabs' },
    { id:'wall',   icon:'wall',   label:'Partition', sub:'Internal walls' },
    { id:'tech',   icon:'tech',   label:'Technical', sub:'Pipes, equipment' },
  ]
};

const CONSTRUCTIONS = {
  ru: [
    { id:'brick',    label:'Кирпич' },
    { id:'gas',      label:'Газоблок' },
    { id:'concrete', label:'Бетон' },
    { id:'frame',    label:'Каркас' },
    { id:'mono',     label:'Монолит' },
    { id:'other',    label:'Другое' },
  ],
  uz: [
    { id:'brick',    label:"G'isht" },
    { id:'gas',      label:'Gaz blok' },
    { id:'concrete', label:'Beton' },
    { id:'frame',    label:'Karkas' },
    { id:'mono',     label:'Monolit' },
    { id:'other',    label:'Boshqa' },
  ],
  en: [
    { id:'brick',    label:'Brick' },
    { id:'gas',      label:'Aerated block' },
    { id:'concrete', label:'Concrete' },
    { id:'frame',    label:'Frame' },
    { id:'mono',     label:'Monolithic' },
    { id:'other',    label:'Other' },
  ]
};

const GOALS = {
  ru: [
    { id:'economy',  icon:'package', label:'Экономный', sub:'Минимальные требования' },
    { id:'optimal',  icon:'shield',  label:'Оптимальный', sub:'Рекомендуемый уровень' },
    { id:'maximum',  icon:'spark',   label:'Максимальный', sub:'Максимальная защита' },
  ],
  uz: [
    { id:'economy',  icon:'package', label:'Tejamkor', sub:'Minimal talablar' },
    { id:'optimal',  icon:'shield',  label:'Optimal', sub:'Tavsiya etiladigan' },
    { id:'maximum',  icon:'spark',   label:'Maksimal', sub:'Maksimal himoya' },
  ],
  en: [
    { id:'economy',  icon:'package', label:'Economy', sub:'Minimum requirements' },
    { id:'optimal',  icon:'shield',  label:'Optimal', sub:'Recommended level' },
    { id:'maximum',  icon:'spark',   label:'Maximum', sub:'Maximum protection' },
  ]
};

// R-values required by zone and surface
const R_REQUIRED = {
  facade: { 2: 2.0, 3: 2.8, 4: 3.5 },
  roof:   { 2: 2.5, 3: 3.5, 4: 4.5 },
  floor:  { 2: 2.0, 3: 2.8, 4: 3.5 },
  wall:   { 2: 1.5, 3: 2.0, 4: 2.5 },
  tech:   { 2: 1.0, 3: 1.5, 4: 2.0 },
};

const ZONE_BY_REGION = {
  tashkent: 3, samarkand: 3, urgench: 4,
  namangan: 3, fergana: 3, nukus: 4, termez: 2, other: 3
};

const PRODUCT_BY_SURFACE = {
  facade: [1, 3, 4],
  roof:   [5, 6, 7],
  floor:  [1, 2],
  wall:   [1, 2],
  tech:   [7, 8],
};

function getZone(regionId) { return ZONE_BY_REGION[regionId] || 3; }

function calcThickness(surface, zone, goalId, lambda = 0.036) {
  const rRequired = (R_REQUIRED[surface] || R_REQUIRED.facade)[zone] || 2.8;
  const goalMultiplier = goalId === 'economy' ? 0.85 : goalId === 'maximum' ? 1.2 : 1.0;
  const rTarget = rRequired * goalMultiplier;
  const thicknessMm = Math.ceil(rTarget * lambda * 1000 / 10) * 10;
  return Math.max(50, Math.min(200, thicknessMm));
}

function ico(name) {
  return (typeof ic === 'function') ? ic(name) : '';
}

// ─── RENDER ENGINE ────────────────────────────────────────────────
function renderCalcStep() {
  const lang = getCurrentLang();
  const step = calcState.step;

  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = `${(step / TOTAL_STEPS) * 100}%`;

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.style.display = step > 1 ? 'inline-flex' : 'none';
    const lbl = backBtn.querySelector('#back-label');
    if (lbl) lbl.textContent = t('back');
  }

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = t('calcTitle');

  const body = document.getElementById('calc-body');
  if (!body) return;

  const stepLabel = `${step} / ${TOTAL_STEPS}`;

  switch (step) {
    case 1: renderStep1(body, lang, stepLabel); break;
    case 2: renderStep2(body, lang, stepLabel); break;
    case 3: renderStep3(body, lang, stepLabel); break;
    case 4: renderStep4(body, lang, stepLabel); break;
    case 5: renderStep5(body, lang, stepLabel); break;
    case 6: renderResult(body, lang); break;
  }
  if (typeof injectIcons === 'function') injectIcons();
  if (window.TPAnim) window.TPAnim.refreshAll();
}

function stepHeader(stepLabel, titleKey, subKey) {
  return `
    <div style="margin-bottom:22px">
      <div class="calc-step-label">${stepLabel}</div>
      <div class="calc-step-title">${t(titleKey)}</div>
      <div class="calc-step-sub">${t(subKey)}</div>
    </div>`;
}

// STEP 1 — Region
function renderStep1(body, lang, stepLabel) {
  const regions = REGIONS[lang] || REGIONS.ru;
  const grid = regions.map(r => `
    <div class="choice-card ${calcState.region === r.id ? 'selected' : ''}"
      onclick="selectRegion('${r.id}')">
      <div class="choice-icon" data-icon="region"></div>
      <div class="choice-text">
        <div class="choice-title">${r.label}</div>
        <div class="choice-sub">${r.sub}</div>
      </div>
      <div class="choice-check"></div>
    </div>`).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep1', 'calcStep1sub')}
    <div class="choice-grid">${grid}</div>`;
}

function selectRegion(id) {
  calcState.region = id;
  calcState.step = 2;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// STEP 2 — Surface
function renderStep2(body, lang, stepLabel) {
  const surfaces = SURFACES[lang] || SURFACES.ru;
  const cards = surfaces.map(s => `
    <div class="choice-card ${calcState.surface === s.id ? 'selected' : ''}"
      onclick="selectSurface('${s.id}')">
      <div class="choice-icon" data-icon="${s.icon}"></div>
      <div class="choice-text">
        <div class="choice-title">${s.label}</div>
        <div class="choice-sub">${s.sub}</div>
      </div>
      <div class="choice-check"></div>
    </div>`).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep2', 'calcStep2sub')}
    <div class="choice-grid">${cards}</div>`;
}

function selectSurface(id) {
  calcState.surface = id;
  calcState.step = 3;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// STEP 3 — Construction
function renderStep3(body, lang, stepLabel) {
  const constructions = CONSTRUCTIONS[lang] || CONSTRUCTIONS.ru;
  const chips = constructions.map(c => `
    <div class="choice-card-sm ${calcState.construction === c.id ? 'selected' : ''}"
      onclick="selectConstruction('${c.id}')">
      <div class="choice-icon" data-icon="wall"></div>
      <div class="choice-title">${c.label}</div>
    </div>`).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep3', 'calcStep3sub')}
    <div class="choice-grid-2">${chips}</div>`;
}

function selectConstruction(id) {
  calcState.construction = id;
  calcState.step = 4;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// STEP 4 — Area
function renderStep4(body, lang, stepLabel) {
  const areaLabel = lang === 'uz' ? 'Maydon (м²)' : lang === 'en' ? 'Area (m²)' : 'Площадь (м²)';
  const placeholder = lang === 'uz' ? 'Masalan: 120' : lang === 'en' ? 'e.g. 120' : 'Например: 120';
  const nextLabel = lang === 'uz' ? 'Keyingi' : lang === 'en' ? 'Next' : 'Далее';
  const helpText = lang === 'uz'
    ? 'Izolyatsiya qilinadigan sirtning taxminiy maydonini kiriting'
    : lang === 'en'
    ? 'Enter the approximate area of the surface to be insulated'
    : 'Введите приблизительную площадь поверхности для утепления';

  // Quick area chips
  const quick = [50, 100, 150, 200, 300];
  const quickHtml = quick.map(v => `
    <button class="thick-chip-s" type="button" onclick="setAreaQuick(${v})">${v} м²</button>
  `).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep4', 'calcStep4sub')}
    <div class="calc-input-wrap">
      <div class="calc-input-label">${areaLabel}</div>
      <div class="calc-input-field">
        <input class="calc-input" id="area-input" type="number" inputmode="numeric"
          placeholder="${placeholder}" min="1" max="99999"
          value="${calcState.area || ''}"
          oninput="calcState.area = parseFloat(this.value) || null"/>
        <span class="calc-unit">м²</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:14px" id="quick-area">
        ${quickHtml}
      </div>
    </div>
    <div style="font-size:12.5px;color:var(--text-2);line-height:1.6;margin-bottom:22px">${helpText}</div>
    <button class="btn-red full" onclick="submitArea()">${nextLabel} →</button>`;

  setTimeout(() => {
    const inp = document.getElementById('area-input');
    if (inp) inp.focus();
  }, 100);
}

function setAreaQuick(v) {
  calcState.area = v;
  const inp = document.getElementById('area-input');
  if (inp) inp.value = v;
  if (window.hap) window.hap('selection');
}

function submitArea() {
  const inp = document.getElementById('area-input');
  const val = parseFloat(inp ? inp.value : calcState.area);
  if (!val || val <= 0) {
    showToast(getCurrentLang() === 'ru' ? 'Введите площадь' : getCurrentLang() === 'uz' ? 'Maydonni kiriting' : 'Enter area', 'warning');
    if (window.hap) window.hap('error');
    return;
  }
  calcState.area = val;
  calcState.step = 5;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// STEP 5 — Goal
function renderStep5(body, lang, stepLabel) {
  const goals = GOALS[lang] || GOALS.ru;
  const cards = goals.map(g => `
    <div class="choice-card ${calcState.goal === g.id ? 'selected' : ''}"
      onclick="selectGoal('${g.id}')">
      <div class="choice-icon" data-icon="${g.icon}"></div>
      <div class="choice-text">
        <div class="choice-title">${g.label}</div>
        <div class="choice-sub">${g.sub}</div>
      </div>
      <div class="choice-check"></div>
    </div>`).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep5', 'calcStep5sub')}
    <div class="choice-grid">${cards}</div>`;
}

function selectGoal(id) {
  calcState.goal = id;
  calcState.step = 6;
  if (window.hap) window.hap('success');
  renderCalcStep();
}

// STEP 6 — Result
function renderResult(body, lang) {
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = '100%';

  const zone = getZone(calcState.region || 'tashkent');
  const surface = calcState.surface || 'facade';
  const goal = calcState.goal || 'optimal';
  const area = calcState.area || 100;
  const recThick = calcThickness(surface, zone, goal);

  const preferredIds = PRODUCT_BY_SURFACE[surface] || [1];
  let recProduct = null;
  if (window.PRODUCTS_DATA) {
    for (const pid of preferredIds) {
      const p = PRODUCTS_DATA.find(pr => pr.id === pid);
      if (p && p.thicknesses.some(t => t >= recThick || t === Math.max(...p.thicknesses))) {
        recProduct = p;
        break;
      }
    }
    if (!recProduct) recProduct = PRODUCTS_DATA[0];
  }

  const packArea = recProduct ? getPackArea(recProduct, recThick) : 6.48;
  const packsNeeded = Math.ceil(area / packArea);
  const totalArea = area * 1.05;
  const price = recProduct ? getPrice(recProduct, recThick) : 0;
  const totalCost = Math.round(price * totalArea);

  const regions_flat = (REGIONS[lang] || REGIONS.ru);
  const regionLabel = regions_flat.find(r => r.id === calcState.region)?.label || '—';
  const surfaces_flat = (SURFACES[lang] || SURFACES.ru);
  const surfaceLabel = surfaces_flat.find(s => s.id === surface)?.label || '—';
  const goals_flat = (GOALS[lang] || GOALS.ru);
  const goalLabel = goals_flat.find(g => g.id === goal)?.label || '—';

  const labels = {
    resultTitle: lang === 'uz' ? 'Hisoblash natijasi' : lang === 'en' ? 'Calculation result' : 'Результат расчёта',
    thickness: lang === 'uz' ? 'Qalinlik' : lang === 'en' ? 'Thickness' : 'Толщина',
    area: lang === 'uz' ? 'Maydon' : lang === 'en' ? 'Area' : 'Площадь',
    packs: lang === 'uz' ? 'Paket' : lang === 'en' ? 'Packs' : 'Упаковок',
    cost: lang === 'uz' ? 'Taxminiy narx' : lang === 'en' ? 'Est. cost' : 'Ориент. стоимость',
    recProd: lang === 'uz' ? 'Tavsiya etiladigan mahsulot' : lang === 'en' ? 'Recommended product' : 'Рекомендованный продукт',
    note: lang === 'uz'
      ? 'Bu taxminiy hisoblash. Aniq loyiha uchun muhandisimizga murojaat qiling.'
      : lang === 'en'
      ? 'This is an approximate calculation. Contact our engineer for a detailed project.'
      : 'Это приблизительный расчёт. Для точного проекта обратитесь к нашему инженеру.',
    viewProd: lang === 'uz' ? "Mahsulotni ko'rish" : lang === 'en' ? 'View product' : 'Смотреть продукт',
    recalc: lang === 'uz' ? 'Qayta hisoblash' : lang === 'en' ? 'Recalculate' : 'Пересчитать',
    contact: lang === 'uz' ? "Menejer bilan bog'lanish" : lang === 'en' ? 'Contact manager' : 'Связаться с менеджером',
    yourInput: lang === 'uz' ? 'Siz tanladingiz' : lang === 'en' ? 'Your selections' : 'Ваши параметры',
    addToCart: lang === 'uz' ? "Savatga qo'shish" : lang === 'en' ? 'Add to cart' : 'Добавить в корзину',
  };

  body.innerHTML = `
    <div style="margin-bottom:18px;display:flex;align-items:center;gap:10px">
      <div style="width:42px;height:42px;border-radius:12px;background:var(--grad-fire);display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 12px rgba(199,18,25,.35)" data-icon="check"></div>
      <div>
        <div class="calc-step-label">${labels.resultTitle}</div>
        <div style="font-family:var(--font-display);font-size:18px;font-weight:800;letter-spacing:-0.3px;color:var(--text)">${recProduct ? recProduct.name : '—'}</div>
      </div>
    </div>

    <div class="result-card">
      <div class="result-grid">
        <div class="result-item">
          <div class="result-item-label">${labels.thickness}</div>
          <div class="result-item-val red" data-count="${recThick}">${recThick}</div>
          <div class="result-item-unit">мм</div>
        </div>
        <div class="result-item">
          <div class="result-item-label">${labels.area}</div>
          <div class="result-item-val" data-count="${area}">${area}</div>
          <div class="result-item-unit">м²</div>
        </div>
        <div class="result-item">
          <div class="result-item-label">${labels.packs}</div>
          <div class="result-item-val" data-count="${packsNeeded}">${packsNeeded}</div>
          <div class="result-item-unit">${lang === 'uz' ? 'paket' : lang === 'en' ? 'packs' : 'упаковок'}</div>
        </div>
        <div class="result-item">
          <div class="result-item-label">${labels.cost}</div>
          <div class="result-item-val" style="font-size:20px" data-count="${(totalCost/1000000).toFixed(1)}">${(totalCost/1000000).toFixed(1)}</div>
          <div class="result-item-unit">${lang === 'uz' ? "mln so'm" : lang === 'en' ? 'mln sum' : 'млн сум'}</div>
        </div>
      </div>

      ${recProduct ? `
        <div class="result-product">
          <div class="result-product-label">${labels.recProd}</div>
          <div class="result-product-name">${recProduct.name}</div>
          <div class="result-product-desc">${recProduct['desc_' + (lang === 'en' ? 'en' : lang === 'uz' ? 'uz' : 'ru')] || ''}</div>
        </div>` : ''}
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">${labels.yourInput}</div>
      <div class="summary-chips">
        <span class="summary-chip">${regionLabel}</span>
        <span class="summary-chip">${surfaceLabel}</span>
        <span class="summary-chip">${goalLabel}</span>
        <span class="summary-chip">${area} м²</span>
      </div>
    </div>

    <div class="result-note">${labels.note}</div>

    ${recProduct ? `
      <button class="btn-red full" style="margin-bottom:8px"
        onclick="addCalcToCart(${recProduct.id}, ${recThick}, ${packsNeeded})">
        <span data-icon="cart"></span>
        ${labels.addToCart}
      </button>` : ''}
    <a href="contacts.html" class="btn-outline full" style="margin-bottom:8px">
      <span data-icon="phone"></span>
      ${labels.contact}
    </a>
    <button class="btn-ghost" style="display:block;width:100%;text-align:center" onclick="resetCalc()">↺ ${labels.recalc}</button>`;
}

function addCalcToCart(productId, thick, packs) {
  if (!window.PRODUCTS_DATA) return;
  const prod = PRODUCTS_DATA.find(p => p.id === productId);
  if (!prod) return;
  Cart.add(productId, thick, packs);
  const lang = getCurrentLang();
  const msg = lang === 'ru' ? `${prod.name} добавлен в корзину`
            : lang === 'uz' ? `${prod.name} savatga qo'shildi`
            : `${prod.name} added`;
  showToast(msg, 'success');
  setTimeout(() => location.href = 'checkout.html', 600);
}

function resetCalc() {
  calcState = { step: 1, region: null, surface: null, construction: null, area: null, goal: null };
  if (window.hap) window.hap('soft');
  renderCalcStep();
}

function prevStep() {
  if (calcState.step <= 1) return;
  calcState.step--;
  if (window.hap) window.hap('soft');
  renderCalcStep();
}
