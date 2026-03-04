// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Smart Calculator
// Formulas:
//   d_min = R_req × λ × 1000  (mm)
//   Packs = ⌈S × 1.10 / packArea⌉
//   Volume = S × d/1000  (m³)
//   Weight = Volume × density  (kg)
//   R_actual = d/1000 / λ  (m²·K/W)
// ═══════════════════════════════════════════════════════════════

const CALC_ZONES = [
  { key:'TAS', uz:"Toshkent / Samarqand / Jizzax",   ru:"Ташкент / Самарканд / Джизак",   R_wall:2.5,R_roof:3.8,R_floor:2.2 },
  { key:'AND', uz:"Farg'ona / Andijon / Namangan",    ru:"Фергана / Андижан / Наманган",    R_wall:2.3,R_roof:3.5,R_floor:2.0 },
  { key:'KHZ', uz:"Xorazm / Qoraqalpog'iston",        ru:"Хорезм / Каракалпакстан",          R_wall:2.8,R_roof:4.2,R_floor:2.5 },
  { key:'SUR', uz:"Surxandaryo / Qashqadaryo",         ru:"Сурхандарья / Кашкадарья",         R_wall:2.0,R_roof:3.2,R_floor:1.8 },
  { key:'BUK', uz:"Buxoro / Navoiy",                   ru:"Бухара / Навои",                   R_wall:2.2,R_roof:3.5,R_floor:2.0 },
];

const CALC_AREAS = [
  { key:'facade_wet',  uz:"Fasad (ho'l usul)",    ru:"Фасад (мокрый способ)",  icon:"🧱", cat:"facade",    zone:"wall",  desc_uz:"Plitalar devorga yopishtiriladi, ustiga armaturali shtukaturka",    desc_ru:"Плиты клеятся к стене, сверху армировочная штукатурка" },
  { key:'facade_vent', uz:"Vent. fasad",           ru:"Вент. фасад",            icon:"🌬️", cat:"vent",      zone:"wall",  desc_uz:"Qoplamа va issiqlik izolyatsiyasi orasida havo bo'shlig'i bor",     desc_ru:"Воздушный зазор между утеплителем и облицовкой" },
  { key:'roof_pitch',  uz:"Qiya tom",              ru:"Скатная кровля",         icon:"🏘️", cat:"roof",      zone:"roof",  desc_uz:"Qiya tom — marralari orasida yoki ustida o'rnatiladi",             desc_ru:"Скатная кровля — между стропилами или над/под ними" },
  { key:'roof_flat',   uz:"Tekis tom (flat roof)", ru:"Плоская кровля",         icon:"🏢", cat:"roof",      zone:"roof",  desc_uz:"Tekis tom — stяжka ostida yuqori siqilishga bardoshli plitalar",   desc_ru:"Плоская кровля — под стяжку, высокая прочность на сжатие" },
  { key:'floor_screed',uz:"Pol (stяжka ostida)",   ru:"Пол (под стяжку)",       icon:"🔲", cat:"floor",     zone:"floor", desc_uz:"Pol issiqlik izolyatsiyasi tsement stяжkasi ostida",               desc_ru:"Утепление пола под цементную стяжку" },
  { key:'floor_float', uz:"Suzuvchi pol",           ru:"Плавающий пол",          icon:"🏠", cat:"floor",     zone:"floor", desc_uz:"Qo'shimcha konstruktsiyaga bog'liq bo'lmagan pol",                 desc_ru:"Звукоизоляция пола, не связанного с несущей плитой" },
  { key:'wall_inner',  uz:"Ichki devor / Bo'lim",  ru:"Внутренние стены",       icon:"🔇", cat:"universal", zone:"wall",  desc_uz:"Kadrli konstruktsiyalarda ichki bo'limlar ovoz izolyatsiyasi",     desc_ru:"Звукоизоляция перегородок и внутренних стен" },
  { key:'attic',       uz:"Cherdak / Mansarda",     ru:"Чердак / Мансарда",      icon:"🏡", cat:"roof",      zone:"roof",  desc_uz:"Gorizontal plita bo'ylab cherdak to'sinini issiqlik izolyatsiyasi",desc_ru:"Утепление чердачного перекрытия по горизонтальной плите" },
];

// ─── STATE ─────────────────────────────────────────────────────
let calcStep = 0; // 0=zone 1=useArea 2=dims 3=thick 4=result
let selectedZone = null;
let selectedUse = null;
let dimMode = 'lw'; // 'lw' or 'direct'
let dimL = '', dimW = '', dimA = '';
let selectedThickCalc = null;
let calcResult = null;

function getArea() {
  if (dimMode === 'lw') {
    const a = (parseFloat(dimL)||0) * (parseFloat(dimW)||0);
    return a > 0 ? a : null;
  } else {
    const a = parseFloat(dimA)||0;
    return a > 0 ? a : null;
  }
}

// ─── STEP LABELS ───────────────────────────────────────────────
function getStepHeader(stepN, labelKey, subKey) {
  return `
    <div class="calc-step-hd">
      <div class="step-num">${stepN}</div>
      <div>
        <div class="step-label" id="step-lbl">${t(labelKey)}</div>
        <div class="step-sub" id="step-sub">${t(subKey)}</div>
      </div>
    </div>`;
}

// ─── MAIN RENDER ───────────────────────────────────────────────
function renderCalcStep() {
  const lang = getCurrentLang();
  const body = document.getElementById('calc-body');
  const progress = document.getElementById('progress-bar');
  const backBtn = document.getElementById('back-btn');
  const backLabel = document.getElementById('back-label');
  if (backLabel) backLabel.textContent = t('back').replace('← ','');

  const pct = [0,25,50,75,100,100][calcStep] || 0;
  if (progress) progress.style.width = pct + '%';
  if (backBtn) backBtn.style.display = calcStep > 0 && calcStep < 4 ? 'inline-flex' : 'none';

  switch(calcStep) {
    case 0: renderZoneStep(body, lang); break;
    case 1: renderUseStep(body, lang); break;
    case 2: renderDimStep(body, lang); break;
    case 3: renderThickStep(body, lang); break;
    case 4: renderResult(body, lang); break;
  }
}

function prevStep() {
  if (calcStep > 0) { calcStep--; renderCalcStep(); }
}

// ─── STEP 0: ZONE ──────────────────────────────────────────────
const ZONE_ICONS = { TAS:'🌆', AND:'🌿', KHZ:'🏜️', SUR:'☀️', BUK:'🏛️' };
const ZONE_EN = { TAS:'Tashkent / Samarkand / Jizzakh', AND:'Fergana / Andijan / Namangan', KHZ:'Khorezm / Karakalpakstan', SUR:'Surkhandarya / Kashkadarya', BUK:'Bukhara / Navoi' };

function renderZoneStep(body, lang) {
  const names = { uz: z => z.uz, ru: z => z.ru, en: z => ZONE_EN[z.key] };
  const getName = names[lang] || names.uz;
  body.innerHTML = getStepHeader(1,'calcStep1','calcStep1sub') +
    '<div style="display:flex;flex-direction:column;gap:9px;margin-bottom:8px">' +
    CALC_ZONES.map(z => {
      const isSel = selectedZone === z.key;
      return '<button class="zone-btn' + (isSel ? ' sel' : '') + '" onclick="selectZone(\'' + z.key + '\')">' +
        '<span class="zone-btn-icon">' + ZONE_ICONS[z.key] + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="zone-btn-name">' + getName(z) + '</div>' +
          '<div class="zone-btn-sub">' +
            '<span>Wall ' + z.R_wall + '</span>' +
            '<span>Roof ' + z.R_roof + '</span>' +
            '<span>Floor ' + z.R_floor + ' m²·K/W</span>' +
          '</div>' +
        '</div>' +
        (isSel ? '<span class="zone-btn-check">✓</span>' : '') +
      '</button>';
    }).join('') +
    '</div>';
}

function selectZone(key) {
  selectedZone = key;
  calcStep = 1;
  renderCalcStep();
}

// ─── STEP 1: USE AREA ──────────────────────────────────────────
function renderUseStep(body, lang) {
  body.innerHTML = getStepHeader(2,'calcStep2','calcStep2sub') + `
    <div class="area-grid">
      ${CALC_AREAS.map(u => `
        <div class="area-card ${selectedUse===u.key?'sel':''}" onclick="selectUse('${u.key}')">
          <div class="area-card-icon">${u.icon}</div>
          <div class="area-card-label">${lang==='uz'?u.uz:u.ru}</div>
          <div class="area-card-sub">${(lang==='uz'?u.desc_uz:u.desc_ru).substring(0,40)}...</div>
        </div>`).join('')}
    </div>`;
}

function selectUse(key) {
  selectedUse = key;
  calcStep = 2;
  renderCalcStep();
}

// ─── STEP 2: DIMS ──────────────────────────────────────────────
function renderDimStep(body, lang) {
  const area = getArea();
  const modeToggle = `
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button onclick="switchDimMode('lw')" style="flex:1;padding:9px 6px;border:2px solid ${dimMode==='lw'?'#E85D04':'#e5e7eb'};border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;background:${dimMode==='lw'?'#fff5f0':'white'};color:${dimMode==='lw'?'#E85D04':'#6B7280'};font-family:Inter,sans-serif">
        ${t('lxw')}
      </button>
      <button onclick="switchDimMode('direct')" style="flex:1;padding:9px 6px;border:2px solid ${dimMode==='direct'?'#E85D04':'#e5e7eb'};border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;background:${dimMode==='direct'?'#fff5f0':'white'};color:${dimMode==='direct'?'#E85D04':'#6B7280'};font-family:Inter,sans-serif">
        ${t('directArea')}
      </button>
    </div>`;

  const inputs = dimMode === 'lw' ? `
    <div class="dim-grid">
      <div>
        <label class="dim-label">${t('length')}</label>
        <input class="dim-input" type="number" inputmode="decimal" placeholder="10.5"
          value="${dimL}" oninput="dimL=this.value;updateDimArea()" id="dim-l"/>
      </div>
      <div>
        <label class="dim-label">${t('width')}</label>
        <input class="dim-input" type="number" inputmode="decimal" placeholder="8.0"
          value="${dimW}" oninput="dimW=this.value;updateDimArea()" id="dim-w"/>
      </div>
    </div>` : `
    <div class="dim-grid">
      <div class="dim-full">
        <label class="dim-label">${t('areaLabel')}</label>
        <input class="dim-input" type="number" inputmode="decimal" placeholder="84.0"
          value="${dimA}" oninput="dimA=this.value;updateDimArea()" id="dim-a"/>
      </div>
    </div>`;

  const areaDisplay = area ? `
    <div class="dim-result">
      <span class="dim-result-label">${t('calcArea')}:</span>
      <span class="dim-result-val">${area.toFixed(2)} ${t('m2')}</span>
    </div>` : `<div style="height:14px"></div>`;

  const nextBtn = area ? `
    <button class="btn-orange full large" onclick="calcStep=3;renderCalcStep()">${t('next')}</button>` : '';

  body.innerHTML = getStepHeader(3,'calcStep3','calcStep3sub') + modeToggle + inputs + areaDisplay + nextBtn;
}

function switchDimMode(mode) { dimMode = mode; renderCalcStep(); }
function updateDimArea() {
  const area = getArea();
  const res = document.querySelector('.dim-result');
  const lang = getCurrentLang();
  if (res) {
    res.innerHTML = area ? `
      <span class="dim-result-label">${t('calcArea')}:</span>
      <span class="dim-result-val">${area.toFixed(2)} ${t('m2')}</span>` : '';
  }
  // show/hide next btn
  const old = document.querySelector('#dim-next-btn');
  if (area && !old) {
    document.getElementById('calc-body').insertAdjacentHTML('beforeend',
      `<button id="dim-next-btn" class="btn-orange full large" onclick="calcStep=3;renderCalcStep()">${t('next')}</button>`);
  } else if (!area && old) {
    old.remove();
  }
}

// ─── STEP 3: THICKNESS ─────────────────────────────────────────
function renderThickStep(body, lang) {
  const zone = CALC_ZONES.find(z => z.key === selectedZone);
  const use  = CALC_AREAS.find(u => u.key === selectedUse);
  if (!zone || !use) return;

  const R = use.zone === 'wall' ? zone.R_wall : use.zone === 'roof' ? zone.R_roof : zone.R_floor;
  const prod = getRecommendedProduct(use.cat);
  if (!prod) return;

  const d_min_m = R * prod.lambda;
  const d_min_mm = Math.ceil(d_min_m * 100) * 10; // round up to nearest 10mm

  const formulaHtml = `
    <div style="background:#f9fafb;border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:11px;color:#6B7280;line-height:1.7">
      <b style="color:#1a1a1a;display:block;margin-bottom:4px">📐 ${lang==='uz'?'Hisoblash formulasi:':'Формула расчёта:'}</b>
      d<sub>min</sub> = R<sub>req</sub> × λ = ${R} × ${prod.lambda} = ${d_min_m.toFixed(3)} м = 
      <b style="color:#E85D04">${d_min_mm} мм</b><br/>
      ${lang==='uz'?`Bu ${use.zone==='wall'?'devor':'tom/pol'} uchun minimal tavsiya etilgan qalinlik`
                   :`Минимальная рекомендуемая толщина для ${use.zone==='wall'?'стены':'кровли/пола'}`}
    </div>`;

  const allThick = [50,80,100,120,150,200];
  const thickHtml = `
    <div class="thick-chips">
      ${allThick.map(th => {
        const isRec = th >= d_min_mm && th < d_min_mm + 30;
        const isSel = selectedThickCalc === th;
        return `<div class="thick-chip-b ${isSel?'sel':''}" onclick="selectThickCalc(${th})">
          ${isRec ? `<span class="rec-label">${t('recommended')}</span>` : ''}
          ${th} мм
        </div>`;
      }).join('')}
    </div>`;

  const calcBtn = selectedThickCalc ? `
    <button class="btn-orange full large" onclick="doCalculate()">
      🧮 ${lang==='uz'?'Hisoblash':'Рассчитать'}
    </button>` : `
    <button class="btn-orange full large" onclick="autoCalcThick(${d_min_mm})">
      ⚡ ${lang==='uz'?`${d_min_mm}мм — Tavsiya hisoblash`:`Рассчитать с ${d_min_mm}мм`}
    </button>`;

  body.innerHTML = getStepHeader(4,'calcStep4','calcStep4sub') + formulaHtml + thickHtml + calcBtn;
}

function selectThickCalc(th) {
  selectedThickCalc = th;
  renderCalcStep();
}

function autoCalcThick(th) {
  selectedThickCalc = th;
  doCalculate();
}

// ─── CALCULATE ─────────────────────────────────────────────────
function doCalculate() {
  const zone = CALC_ZONES.find(z => z.key === selectedZone);
  const use  = CALC_AREAS.find(u => u.key === selectedUse);
  const area = getArea();
  if (!zone || !use || !area || !selectedThickCalc) return;

  const R_req = use.zone === 'wall' ? zone.R_wall : use.zone === 'roof' ? zone.R_roof : zone.R_floor;
  const prod = getRecommendedProduct(use.cat);
  if (!prod) return;

  const d_min_m = R_req * prod.lambda;
  const d_min_mm = Math.ceil(d_min_m * 100) * 10;
  const finalThick = selectedThickCalc || d_min_mm;

  // Core formulas
  const packs   = Math.ceil(area * 1.10 / prod.packArea);    // +10% waste
  const vol     = area * finalThick / 1000;                    // m³
  const weight  = vol * prod.density;                          // kg
  const totalM2 = packs * prod.packArea;                       // total m² in packs
  const price   = prod.pricePerM2 + (finalThick > 100 ? (finalThick-100)*200 : 0);
  const totalPrice = area * price;
  const R_actual = (finalThick / 1000) / prod.lambda;

  calcResult = {
    prod, zone, use, area, finalThick, d_min_mm, R_req, R_actual,
    packs, vol, weight, totalM2, totalPrice, price,
    f1: `d_min = R × λ = ${R_req} × ${prod.lambda} = ${d_min_m.toFixed(3)} м → ${d_min_mm} мм`,
    f2: `Upak. = ⌈${area.toFixed(1)} × 1.1 / ${prod.packArea}⌉ = ${packs} шт`,
    f3: `V = ${area.toFixed(1)} × ${finalThick}/1000 = ${vol.toFixed(2)} м³`,
    f4: `R_fact = ${finalThick}/1000 / ${prod.lambda} = ${R_actual.toFixed(2)} м²·К/Вт`,
  };
  calcStep = 4;
  renderCalcStep();
}

// ─── STEP 4: RESULT ────────────────────────────────────────────
function renderResult(body, lang) {
  if (!calcResult) { calcStep = 0; renderCalcStep(); return; }
  const r = calcResult;

  const items = [
    { l: t('area'),    v: r.area.toFixed(1),       u: t('m2'),    accent: false },
    { l: t('thickness'),v: r.finalThick,            u: 'мм',       accent: true  },
    { l: lang==='uz'?'Paketlar':'Упаковок', v: r.packs, u: t('pieces'), accent: true  },
    { l: t('volume'),  v: r.vol.toFixed(2),         u: t('m3'),    accent: false },
    { l: t('weight'),  v: Math.round(r.weight),     u: t('kg'),    accent: false },
    { l: t('rActual'), v: r.R_actual.toFixed(2),    u: 'м²·К/Вт', accent: true  },
  ];

  const gridHtml = items.map(i => `
    <div class="result-item">
      <div class="result-lbl">${i.l}</div>
      <div class="result-val ${i.accent?'accent':''}">${i.v} <span class="result-unit">${i.u}</span></div>
    </div>`).join('');

  body.innerHTML = `
    <div style="font-family:'Montserrat',sans-serif;font-size:15px;font-weight:900;margin-bottom:14px">
      ✅ ${t('calcResult')}
    </div>
    <div class="result-card">
      <div class="result-title">📊 ${lang==='uz'?'Asosiy ko\'rsatkichlar':'Основные показатели'}</div>
      <div class="result-grid">${gridHtml}</div>
      <div class="result-prod">
        <div class="result-prod-icon">${CAT_EMOJI[r.prod.category]}</div>
        <div>
          <div class="result-prod-name">${r.prod.name} ${r.finalThick}мм</div>
          <div class="result-prod-sub">${r.prod.density}кг/м³ • λ=${r.prod.lambda} Вт/м·К • ${r.prod.fire}</div>
        </div>
      </div>
      <div class="result-price-box">
        <div class="result-price-lbl">💰 ${lang==='uz'?'TAXMINIY NARX':'ПРИМЕРНАЯ СТОИМОСТЬ'}</div>
        <div class="result-price-val">${r.totalPrice.toLocaleString()} <span style="font-size:12px;font-weight:500;color:rgba(255,255,255,.5)">${t('currency').split('/')[0]}</span></div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:3px">
          ${r.area.toFixed(1)} м² × ${r.price.toLocaleString()} ${t('currency')}
        </div>
      </div>
      <div class="formula-box">
        <div class="formula-title">📐 FORMULA</div>
        <div class="formula-text">${r.f1}<br/>${r.f2}<br/>${r.f3}<br/>${r.f4}</div>
      </div>
    </div>
    <div style="background:#fffbf5;border:1.5px solid #fde68a;border-radius:12px;padding:12px 14px;font-size:11px;color:#92400e;line-height:1.6;margin-bottom:14px">
      ⚠️ ${t('calcNote')}
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn-orange" style="flex:1;justify-content:center;padding:13px 0"
        onclick="addCalcToCart()">
        🛒 ${t('addToCartCalc')}
      </button>
      <button class="btn-outline" style="flex:1;padding:13px 0"
        onclick="resetCalc()">
        🔄 ${t('recalc')}
      </button>
    </div>`;
}

function addCalcToCart() {
  if (!calcResult) return;
  Cart.add(calcResult.prod.id, calcResult.finalThick, calcResult.packs);
  showToast(`✅ ${calcResult.prod.name} ${calcResult.finalThick}мм × ${calcResult.packs} — ${t('inCart')}`);
}

function resetCalc() {
  calcStep = 0;
  selectedZone = null;
  selectedUse = null;
  dimL = ''; dimW = ''; dimA = '';
  selectedThickCalc = null;
  calcResult = null;
  renderCalcStep();
}

// ─── HELPER ────────────────────────────────────────────────────
function getRecommendedProduct(category) {
  if (!window.PRODUCTS_DATA) return null;
  const candidates = PRODUCTS_DATA.filter(p => p.category === category);
  return candidates[0] || PRODUCTS_DATA[0];
}
