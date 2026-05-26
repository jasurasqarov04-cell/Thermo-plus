// ═══════════════════════════════════════════════════════════════
// THERMO PLUS — Calculator v5 — System-type aware
// ═══════════════════════════════════════════════════════════════
//
// Flow: Region → Surface → System type → Area → Budget → Result
//
// Density / thickness recommendations follow:
//   • ГОСТ Р 56707-2023 (СФТК / wet plaster facade)
//   • ROCKWOOL / TECHNONICOL / Эковер application guides
//   • SP 50.13330 thermal protection norms
//
// Density cheat-sheet (kg/m³):
//   skat (pitched roof, mansard) ........ 30–50   → THERMO LITE / ACOUSTIC / UNIVERSAL
//   internal partitions ................. 30–50   → THERMO LITE / ACOUSTIC
//   ventilated facade (single layer) .... 70–90   → THERMO VENT FACADE / VENT PRO
//   three-layer brick masonry ........... 50–80   → THERMO UNIVERSAL / STANDART / VENT
//   wet plaster facade (low-rise) ....... 90–120  → THERMO FACADE EXTRA / FACADE / COMFORT
//   wet plaster facade (high-rise) ...... 140–160 → THERMO FACADE PRO / PREMIUM
//   flat roof (bottom layer) ............ 100–140 → THERMO ROOF L / L PROF / STANDART
//   flat roof (top / exploited) ......... 140–190 → THERMO ROOF STANDART / U / U PROF
//   floor under screed .................. 140–170 → THERMO FLOOR / STANDART / PRO
// ═══════════════════════════════════════════════════════════════

let calcState = {
  step: 1,
  region: null,
  surface: null,
  systemType: null,
  area: null,
  goal: null,
};

const TOTAL_STEPS = 5;

// ─── REGIONS ──────────────────────────────────────────────────────
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

// ─── SURFACES (step 2) ────────────────────────────────────────────
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

// ─── SYSTEM TYPES (step 3, depends on surface) ────────────────────
const SYSTEM_TYPES = {
  ru: {
    facade: [
      { id:'facade_wet',   icon:'facade', label:'Мокрый фасад',        sub:'Штукатурный фасад (СФТК)' },
      { id:'facade_vent',  icon:'wall',   label:'Вентилируемый фасад', sub:'Навесной с воздушным зазором' },
      { id:'facade_brick', icon:'wall',   label:'Облицовка кирпичом',  sub:'Трёхслойная кладка / сайдинг' },
    ],
    roof: [
      { id:'roof_pitch', icon:'roof', label:'Скатная кровля', sub:'Мансарда, чердак, стропила' },
      { id:'roof_flat',  icon:'roof', label:'Плоская кровля', sub:'Мембрана, битум, наплавление' },
    ],
    floor: [
      { id:'floor_screed', icon:'floor', label:'Пол под стяжку', sub:'Бетонная стяжка, тёплый пол' },
      { id:'floor_float',  icon:'floor', label:'Плавающий пол',  sub:'Между лагами, звукоизоляция' },
    ],
    wall: [
      { id:'wall_inner',  icon:'wall', label:'Перегородка',        sub:'Каркасная стена, ГКЛ' },
      { id:'wall_acoust', icon:'wall', label:'Звукоизоляция',      sub:'Усиленная акустика' },
    ],
    tech: [
      { id:'tech_pipe',  icon:'tech', label:'Трубопроводы',  sub:'Тепло- и паропроводы' },
      { id:'tech_equip', icon:'tech', label:'Оборудование',  sub:'Котлы, агрегаты, дымоходы' },
    ],
  },
  uz: {
    facade: [
      { id:'facade_wet',   icon:'facade', label:'Ho\'l fasad',           sub:'Shtukaturkali fasad (SFTK)' },
      { id:'facade_vent',  icon:'wall',   label:'Ventilyatsiyali fasad', sub:'Havo bo\'shliqli osma' },
      { id:'facade_brick', icon:'wall',   label:'G\'isht qoplama',       sub:'Uch qavatli devor / siding' },
    ],
    roof: [
      { id:'roof_pitch', icon:'roof', label:'Qiya tom',  sub:'Mansarda, cherdak' },
      { id:'roof_flat',  icon:'roof', label:'Tekis tom', sub:'Membrana, bitum' },
    ],
    floor: [
      { id:'floor_screed', icon:'floor', label:'Stяjka ostidagi pol', sub:'Beton stяjka, issiq pol' },
      { id:'floor_float',  icon:'floor', label:'Suzuvchi pol',         sub:'Lag\'lar orasi, akustika' },
    ],
    wall: [
      { id:'wall_inner',  icon:'wall', label:'Bo\'lim',           sub:'Karkasli devor, GKL' },
      { id:'wall_acoust', icon:'wall', label:'Ovoz izolyatsiyasi', sub:'Kuchaytirilgan akustika' },
    ],
    tech: [
      { id:'tech_pipe',  icon:'tech', label:'Trubalar',  sub:'Issiqlik va bug\' trubalari' },
      { id:'tech_equip', icon:'tech', label:'Uskunalar', sub:'Qozonlar, agregatlar' },
    ],
  },
  en: {
    facade: [
      { id:'facade_wet',   icon:'facade', label:'Wet (plaster) facade', sub:'ETICS / SFTK system' },
      { id:'facade_vent',  icon:'wall',   label:'Ventilated facade',    sub:'Curtain wall with air gap' },
      { id:'facade_brick', icon:'wall',   label:'Brick-clad facade',    sub:'Three-layer masonry / siding' },
    ],
    roof: [
      { id:'roof_pitch', icon:'roof', label:'Pitched roof', sub:'Attic / mansard / rafters' },
      { id:'roof_flat',  icon:'roof', label:'Flat roof',    sub:'Membrane / bitumen' },
    ],
    floor: [
      { id:'floor_screed', icon:'floor', label:'Floor under screed', sub:'Concrete screed, heated floor' },
      { id:'floor_float',  icon:'floor', label:'Floating floor',     sub:'Between joists, acoustic' },
    ],
    wall: [
      { id:'wall_inner',  icon:'wall', label:'Internal partition', sub:'Frame wall, drywall' },
      { id:'wall_acoust', icon:'wall', label:'Sound insulation',   sub:'Enhanced acoustics' },
    ],
    tech: [
      { id:'tech_pipe',  icon:'tech', label:'Pipework',  sub:'Heat / steam pipes' },
      { id:'tech_equip', icon:'tech', label:'Equipment', sub:'Boilers, units, flues' },
    ],
  },
};

// ─── BUDGET / GOAL (step 5) ───────────────────────────────────────
const GOALS = {
  ru: [
    { id:'economy', icon:'package', label:'Эконом',     sub:'Минимально допустимая плотность' },
    { id:'optimal', icon:'shield',  label:'Оптимальный', sub:'Рекомендуемый по нормам' },
    { id:'maximum', icon:'spark',   label:'Максимум',   sub:'Повышенная плотность и запас' },
  ],
  uz: [
    { id:'economy', icon:'package', label:'Tejamkor', sub:'Minimal ruxsat etilgan zichlik' },
    { id:'optimal', icon:'shield',  label:'Optimal',  sub:'Normalar bo\'yicha tavsiya etilgan' },
    { id:'maximum', icon:'spark',   label:'Maksimal', sub:'Yuqori zichlik va zaxira' },
  ],
  en: [
    { id:'economy', icon:'package', label:'Economy',  sub:'Minimum acceptable density' },
    { id:'optimal', icon:'shield',  label:'Optimal',  sub:'Code-recommended level' },
    { id:'maximum', icon:'spark',   label:'Maximum',  sub:'Higher density and margin' },
  ]
};

// ─── REQUIRED R-VALUES by zone (m²·K/W) ───────────────────────────
//   surface key + system can be more granular; we use the surface base.
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

// ─── PRODUCT RECOMMENDATIONS by system type × budget ──────────────
// Mapping is based on THERMO PLUS official product catalog:
//
//   УНИВЕРСАЛЬНАЯ:  id 1  30  THERMO LITE
//                   id 2  40  THERMO ACOUSTIC
//                   id 3  50  THERMO UNIVERSAL
//                   id 4  60  THERMO STANDART
//   ВЕНТ-ФАСАД:     id 5  70  THERMO VENT-FACADE
//                   id 6  80  THERMO VENT PRO
//                   id 7  90  THERMO FACADE EXTRA
//   МОКРЫЙ ФАСАД:   id 8  100 THERMO FACADE
//                   id 9  120 THERMO FACADE COMFORT
//                   id 10 140 THERMO FACADE PRO
//                   id 11 160 THERMO FACADE PREMIUM
//   КРОВЛЯ:         id 12 100 THERMO ROOF L
//                   id 13 120 THERMO ROOF L PROF
//                   id 14 140 THERMO ROOF STANDART
//                   id 15 170 THERMO ROOF U
//                   id 16 190 THERMO ROOF U PROF
//   ПОЛ:            id 17 140 THERMO FLOOR
//                   id 18 150 THERMO FLOOR STANDART
//                   id 19 170 THERMO FLOOR PRO
//
// First id in each array = primary pick; rest are fallbacks.
const PRODUCT_RECOMMENDATIONS = {
  // ─── МОКРЫЙ фасад (штукатурный/СФТК) — серия THERMO FACADE ───
  facade_wet:   { economy: [8],         optimal: [9, 8],     maximum: [10, 11]  }, // 100 / 120 / 140-160
  // ─── ВЕНТИЛИРУЕМЫЙ фасад — серия VENT + FACADE EXTRA ───
  facade_vent:  { economy: [5],         optimal: [6, 5],     maximum: [7, 6]    }, //  70 /  80 /  90
  // ─── Облицовка кирпичом / трёхслойная кладка — универсал ───
  facade_brick: { economy: [3, 4],      optimal: [4, 5],     maximum: [5, 6]    }, //  50-60 / 60-70 / 70-80

  // ─── Скатная кровля (мансарда, чердак) — без нагрузки ───
  roof_pitch:   { economy: [1, 2],      optimal: [2, 3],     maximum: [3, 4]    }, //  30-40 / 40-50 / 50-60
  // ─── Плоская кровля — серия THERMO ROOF ───
  roof_flat:    { economy: [12, 13],    optimal: [14, 13],   maximum: [15, 16]  }, // 100-120 / 140 / 170-190

  // ─── Пол под стяжку — серия THERMO FLOOR ───
  floor_screed: { economy: [17],        optimal: [18, 17],   maximum: [19, 18]  }, // 140 / 150 / 170
  // ─── Плавающий пол / между лагами — лёгкая универсал ───
  floor_float:  { economy: [2, 1],      optimal: [3, 4],     maximum: [17, 4]   }, //  40 / 50-60 / 140

  // ─── Внутренняя перегородка — лёгкая универсал ───
  wall_inner:   { economy: [1],         optimal: [2, 1],     maximum: [3, 2]    }, //  30 / 40 / 50
  // ─── Звукоизоляция — серия THERMO ACOUSTIC ───
  wall_acoust:  { economy: [2],         optimal: [2, 3],     maximum: [3, 4]    }, //  40 / 40-50 / 50-60

  // ─── Трубопроводы — термостойкие средней плотности ───
  tech_pipe:    { economy: [4, 3],      optimal: [5, 6],     maximum: [6, 7]    }, //  60 / 70-80 / 80-90
  // ─── Оборудование, котлы — жёсткие плиты ───
  tech_equip:   { economy: [4, 5],      optimal: [7, 6],     maximum: [8, 9]    }, //  60-70 / 80-90 / 100-120
};

function getZone(regionId) { return ZONE_BY_REGION[regionId] || 3; }

// Surface key from systemType (e.g. 'facade_wet' → 'facade')
function surfaceFromSystem(systemType) {
  if (!systemType) return 'facade';
  if (systemType.startsWith('facade')) return 'facade';
  if (systemType.startsWith('roof'))   return 'roof';
  if (systemType.startsWith('floor'))  return 'floor';
  if (systemType.startsWith('wall'))   return 'wall';
  if (systemType.startsWith('tech'))   return 'tech';
  return 'facade';
}

// Required thickness in mm, given the chosen product's lambda
function calcThickness(surface, zone, goalId, lambda) {
  const lam = lambda || 0.036;
  const rRequired = (R_REQUIRED[surface] || R_REQUIRED.facade)[zone] || 2.8;
  const goalMultiplier = goalId === 'economy' ? 0.85 : goalId === 'maximum' ? 1.2 : 1.0;
  const rTarget = rRequired * goalMultiplier;
  // δ = R · λ (meters) → mm; round up to nearest 10 mm
  const thicknessMm = Math.ceil(rTarget * lam * 1000 / 10) * 10;
  return Math.max(50, Math.min(200, thicknessMm));
}

// Snap calculated thickness to one (or two) of the product's available
// slab sizes. If product offers [50, 100] and we need 130mm — we return
// 150 (= 100 + 50, two-layer install). Need 170mm → 200 (100+100).
function pickProductThickness(prod, recThick) {
  const sizes = (prod && prod.thicknesses) || [50, 100];
  // single slab is enough
  for (const s of sizes) if (s >= recThick) return s;
  // need 2 layers — combine largest + the smallest slab that still
  // covers the remainder (fall back to the largest slab if nothing fits)
  const max = Math.max(...sizes);
  const rest = recThick - max;
  let second = max;
  for (const s of sizes) if (s >= rest && s < second) second = s;
  return max + second;
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

  const stepLabel = `${Math.min(step, TOTAL_STEPS)} / ${TOTAL_STEPS}`;

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

// ─── STEP 1 — Region ──────────────────────────────────────────────
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

// ─── STEP 2 — Surface ─────────────────────────────────────────────
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
  if (calcState.surface !== id) calcState.systemType = null;
  calcState.surface = id;
  calcState.step = 3;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// ─── STEP 3 — System Type (depends on surface) ────────────────────
function renderStep3(body, lang, stepLabel) {
  const surface = calcState.surface || 'facade';
  const list = (SYSTEM_TYPES[lang] || SYSTEM_TYPES.ru)[surface] || [];
  const cards = list.map(s => `
    <div class="choice-card ${calcState.systemType === s.id ? 'selected' : ''}"
      onclick="selectSystemType('${s.id}')">
      <div class="choice-icon" data-icon="${s.icon}"></div>
      <div class="choice-text">
        <div class="choice-title">${s.label}</div>
        <div class="choice-sub">${s.sub}</div>
      </div>
      <div class="choice-check"></div>
    </div>`).join('');

  body.innerHTML = `
    ${stepHeader(stepLabel, 'calcStep3', 'calcStep3sub')}
    <div class="choice-grid">${cards}</div>`;
}

function selectSystemType(id) {
  calcState.systemType = id;
  calcState.step = 4;
  if (window.hap) window.hap('selection');
  renderCalcStep();
}

// ─── STEP 4 — Area ────────────────────────────────────────────────
function renderStep4(body, lang, stepLabel) {
  const areaLabel = lang === 'uz' ? 'Maydon (м²)' : lang === 'en' ? 'Area (m²)' : 'Площадь (м²)';
  const placeholder = lang === 'uz' ? 'Masalan: 120' : lang === 'en' ? 'e.g. 120' : 'Например: 120';
  const nextLabel = lang === 'uz' ? 'Keyingi' : lang === 'en' ? 'Next' : 'Далее';
  const helpText = lang === 'uz'
    ? 'Izolyatsiya qilinadigan sirtning taxminiy maydonini kiriting'
    : lang === 'en'
    ? 'Enter the approximate area of the surface to be insulated'
    : 'Введите приблизительную площадь поверхности для утепления';

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

// ─── STEP 5 — Goal / Budget ───────────────────────────────────────
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

// ─── STEP 6 — Result ──────────────────────────────────────────────
function pickRecommendedProduct(systemType, goalId) {
  const map = PRODUCT_RECOMMENDATIONS[systemType];
  if (!map || !window.PRODUCTS_DATA) return null;
  const ids = map[goalId] || map.optimal || [];
  for (const pid of ids) {
    const p = PRODUCTS_DATA.find(pr => pr.id === pid);
    if (p) return p;
  }
  return PRODUCTS_DATA[0] || null;
}

function renderResult(body, lang) {
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = '100%';

  const zone     = getZone(calcState.region || 'tashkent');
  const goal     = calcState.goal || 'optimal';
  const area     = calcState.area || 100;
  const systemType = calcState.systemType
    // fallback if user somehow lands on result without picking systemType
    || ((calcState.surface || 'facade') === 'facade' ? 'facade_wet'
      : (calcState.surface || 'facade') === 'roof'   ? 'roof_pitch'
      : (calcState.surface || 'facade') === 'floor'  ? 'floor_screed'
      : (calcState.surface || 'facade') === 'wall'   ? 'wall_inner'
      : 'tech_pipe');
  const surface  = surfaceFromSystem(systemType);

  const recProduct = pickRecommendedProduct(systemType, goal);
  const lam = (recProduct && recProduct.lambda) || 0.036;
  const reqThick = calcThickness(surface, zone, goal, lam);
  const recThick = recProduct ? pickProductThickness(recProduct, reqThick) : reqThick;

  const packArea    = recProduct ? getPackArea(recProduct, recThick) : 6.48;
  const packsNeeded = Math.ceil(area / packArea);
  const totalArea   = area * 1.05;
  const price       = recProduct ? getPrice(recProduct, recThick) : 0;
  const totalCost   = Math.round(price * totalArea);

  const regionLabel = (REGIONS[lang] || REGIONS.ru).find(r => r.id === calcState.region)?.label || '—';
  const surfaceLabel = (SURFACES[lang] || SURFACES.ru).find(s => s.id === surface)?.label || '—';
  const systemTypeLabel = ((SYSTEM_TYPES[lang] || SYSTEM_TYPES.ru)[surface] || [])
    .find(s => s.id === systemType)?.label || '—';
  const goalLabel = (GOALS[lang] || GOALS.ru).find(g => g.id === goal)?.label || '—';

  const labels = {
    resultTitle: lang === 'uz' ? 'Hisoblash natijasi' : lang === 'en' ? 'Calculation result' : 'Результат расчёта',
    thickness:   lang === 'uz' ? 'Qalinlik'           : lang === 'en' ? 'Thickness'         : 'Толщина',
    density:     lang === 'uz' ? 'Zichlik'            : lang === 'en' ? 'Density'           : 'Плотность',
    area:        lang === 'uz' ? 'Maydon'             : lang === 'en' ? 'Area'              : 'Площадь',
    packs:       lang === 'uz' ? 'Paket'              : lang === 'en' ? 'Packs'             : 'Упаковок',
    cost:        lang === 'uz' ? 'Taxminiy narx'      : lang === 'en' ? 'Est. cost'         : 'Ориент. стоимость',
    recProd:     lang === 'uz' ? 'Tavsiya etiladigan mahsulot' : lang === 'en' ? 'Recommended product' : 'Рекомендованный продукт',
    note:        lang === 'uz' ? 'Bu taxminiy hisoblash. Aniq loyiha uchun muhandisimizga murojaat qiling.'
              : lang === 'en'  ? 'This is an approximate calculation. Contact our engineer for a detailed project.'
              : 'Это приблизительный расчёт. Для точного проекта обратитесь к нашему инженеру.',
    recalc:      lang === 'uz' ? 'Qayta hisoblash'         : lang === 'en' ? 'Recalculate'      : 'Пересчитать',
    contact:     lang === 'uz' ? "Menejer bilan bog'lanish": lang === 'en' ? 'Contact manager' : 'Связаться с менеджером',
    yourInput:   lang === 'uz' ? 'Siz tanladingiz'         : lang === 'en' ? 'Your selections' : 'Ваши параметры',
    addToCart:   lang === 'uz' ? "Savatga qo'shish"        : lang === 'en' ? 'Add to cart'     : 'Добавить в корзину',
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
          <div class="result-item-label">${labels.density}</div>
          <div class="result-item-val" data-count="${recProduct ? recProduct.density : 0}">${recProduct ? recProduct.density : '—'}</div>
          <div class="result-item-unit">кг/м³</div>
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
        <span class="summary-chip">${systemTypeLabel}</span>
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
  calcState = { step: 1, region: null, surface: null, systemType: null, area: null, goal: null };
  if (window.hap) window.hap('soft');
  renderCalcStep();
}

function prevStep() {
  if (calcState.step <= 1) return;
  calcState.step--;
  if (window.hap) window.hap('soft');
  renderCalcStep();
}
