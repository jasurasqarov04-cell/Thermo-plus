// THERMO PLUS — Calculator v3 — Full EN/RU/UZ

const CALC_ZONES = [
  { key:'TAS', uz:"Toshkent / Samarqand / Jizzax", ru:"Ташкент / Самарканд / Джизак", en:"Tashkent / Samarkand / Jizzakh", R_wall:2.5,R_roof:3.8,R_floor:2.2 },
  { key:'AND', uz:"Farg'ona / Andijon / Namangan",  ru:"Фергана / Андижан / Наманган",  en:"Fergana / Andijan / Namangan",   R_wall:2.3,R_roof:3.5,R_floor:2.0 },
  { key:'KHZ', uz:"Xorazm / Qoraqalpog'iston",      ru:"Хорезм / Каракалпакстан",       en:"Khorezm / Karakalpakstan",       R_wall:2.8,R_roof:4.2,R_floor:2.5 },
  { key:'SUR', uz:"Surxandaryo / Qashqadaryo",       ru:"Сурхандарья / Кашкадарья",      en:"Surkhandarya / Kashkadarya",     R_wall:2.0,R_roof:3.2,R_floor:1.8 },
  { key:'BUK', uz:"Buxoro / Navoiy",                 ru:"Бухара / Навои",                en:"Bukhara / Navoi",                R_wall:2.2,R_roof:3.5,R_floor:2.0 },
];
const CALC_AREAS = [
  { key:'facade_wet',   uz:"Fasad (ho'l usul)",  ru:"Фасад (мокрый способ)", en:"Wet plaster facade",   icon:"🧱", cat:"facade",    zone:"wall",
    desc_uz:"Plitalar devorga yopishtiriladi, ustiga shtukaturka",
    desc_ru:"Плиты клеятся к стене, армировочная штукатурка",
    desc_en:"Boards glued to wall, plaster finish" },
  { key:'facade_vent',  uz:"Vent. fasad",         ru:"Вент. фасад",          en:"Ventilated facade",    icon:"🌬️", cat:"vent",      zone:"wall",
    desc_uz:"Qoplama va izolyatsiya orasida havo bo'shlig'i",
    desc_ru:"Воздушный зазор между утеплителем и облицовкой",
    desc_en:"Air gap between insulation and cladding" },
  { key:'roof_pitch',   uz:"Qiya tom",            ru:"Скатная кровля",       en:"Pitched roof",         icon:"🏘️", cat:"roof",      zone:"roof",
    desc_uz:"Qiya tom — marralari orasiga o'rnatiladi",
    desc_ru:"Скатная кровля — монтаж между стропилами",
    desc_en:"Pitched roof — fitted between rafters" },
  { key:'roof_flat',    uz:"Tekis tom",            ru:"Плоская кровля",       en:"Flat roof",            icon:"🏢", cat:"roof",      zone:"roof",
    desc_uz:"Tekis tom — stяжka ostida, yuqori siqish bardoshliligi",
    desc_ru:"Плоская кровля — под стяжку, высокая прочность",
    desc_en:"Flat roof — under screed, high compressive strength" },
  { key:'floor_screed', uz:"Pol (stяжka ostida)",  ru:"Пол (под стяжку)",     en:"Floor under screed",   icon:"🔲", cat:"floor",     zone:"floor",
    desc_uz:"Pol izolyatsiyasi tsement stяжkasi ostida",
    desc_ru:"Утепление пола под цементную стяжку",
    desc_en:"Floor insulation under cement screed" },
  { key:'floor_float',  uz:"Suzuvchi pol",          ru:"Плавающий пол",        en:"Floating floor",       icon:"🏠", cat:"floor",     zone:"floor",
    desc_uz:"Konstruktsiyaga bog'liq bo'lmagan pol",
    desc_ru:"Звукоизоляция плавающего пола",
    desc_en:"Sound insulation for floating floor" },
  { key:'wall_inner',   uz:"Ichki devor / Bo'lim", ru:"Внутренние стены",     en:"Interior walls",       icon:"🔇", cat:"universal", zone:"wall",
    desc_uz:"Ichki bo'limlar ovoz izolyatsiyasi",
    desc_ru:"Звукоизоляция перегородок",
    desc_en:"Sound insulation for partitions" },
  { key:'attic',        uz:"Cherdak / Mansarda",    ru:"Чердак / Мансарда",    en:"Attic / Mansard",      icon:"🏡", cat:"roof",      zone:"roof",
    desc_uz:"Cherdak to'sini issiqlik izolyatsiyasi",
    desc_ru:"Утепление чердачного перекрытия",
    desc_en:"Thermal insulation of attic floor" },
];

let calcStep=0, selectedZone=null, selectedUse=null;
let dimMode='lw', dimL='', dimW='', dimA='';
let selectedThickCalc=null, calcResult=null;

function gl(){return getCurrentLang();}
function getArea(){
  if(dimMode==='lw'){const a=(parseFloat(dimL)||0)*(parseFloat(dimW)||0);return a>0?a:null;}
  const a=parseFloat(dimA)||0;return a>0?a:null;
}
function zn(z){const l=gl();return l==='ru'?z.ru:l==='en'?z.en:z.uz;}
function un(u){const l=gl();return l==='ru'?u.ru:l==='en'?u.en:u.uz;}
function ud(u){const l=gl();return l==='ru'?u.desc_ru:l==='en'?u.desc_en:u.desc_uz;}
function tx3(uz,ru,en){const l=gl();return l==='ru'?ru:l==='en'?en:uz;}

function stepHdr(n,lk,sk){
  return '<div class="calc-step-hd"><div class="step-num">'+n+'</div><div>'+
    '<div class="step-label">'+t(lk)+'</div><div class="step-sub">'+t(sk)+'</div></div></div>';
}

function renderCalcStep(){
  const body=document.getElementById('calc-body');
  const progress=document.getElementById('progress-bar');
  const backBtn=document.getElementById('back-btn');
  const backLabel=document.getElementById('back-label');
  if(backLabel)backLabel.textContent=tx3('Orqaga','Назад','Back');
  const pct=[0,25,50,75,100,100][calcStep]||0;
  if(progress)progress.style.width=pct+'%';
  if(backBtn)backBtn.style.display=calcStep>0&&calcStep<4?'inline-flex':'none';
  switch(calcStep){
    case 0:renderZoneStep(body);break;
    case 1:renderUseStep(body);break;
    case 2:renderDimStep(body);break;
    case 3:renderThickStep(body);break;
    case 4:renderResult(body);break;
  }
}
function prevStep(){if(calcStep>0){calcStep--;renderCalcStep();}}

// STEP 0: ZONE
const ZONE_ICONS={TAS:'🌆',AND:'🌿',KHZ:'🏜️',SUR:'☀️',BUK:'🏛️'};
function renderZoneStep(body){
  body.innerHTML=stepHdr(1,'calcStep1','calcStep1sub')+
    '<div style="display:flex;flex-direction:column;gap:9px;margin-bottom:8px">'+
    CALC_ZONES.map(z=>{
      const s=selectedZone===z.key;
      return '<button class="zone-btn'+(s?' sel':'')+'" onclick="selectZone(\''+z.key+'\')">'+
        '<span class="zone-btn-icon">'+ZONE_ICONS[z.key]+'</span>'+
        '<div style="flex:1;min-width:0"><div class="zone-btn-name">'+zn(z)+'</div>'+
        '<div class="zone-btn-sub"><span>Wall '+z.R_wall+'</span><span>Roof '+z.R_roof+'</span><span>Floor '+z.R_floor+' m²·K/W</span></div></div>'+
        (s?'<span class="zone-btn-check">✓</span>':'')+
        '</button>';
    }).join('')+'</div>';
}
function selectZone(key){selectedZone=key;calcStep=1;renderCalcStep();}

// STEP 1: USE
function renderUseStep(body){
  body.innerHTML=stepHdr(2,'calcStep2','calcStep2sub')+
    '<div class="area-grid">'+
    CALC_AREAS.map(u=>{
      const s=selectedUse===u.key;
      return '<div class="area-card'+(s?' sel':'')+'" onclick="selectUse(\''+u.key+'\')">'+
        '<div class="area-card-icon">'+u.icon+'</div>'+
        '<div class="area-card-label">'+un(u)+'</div>'+
        '<div class="area-card-sub">'+ud(u).substring(0,42)+'...</div></div>';
    }).join('')+'</div>';
}
function selectUse(key){selectedUse=key;calcStep=2;renderCalcStep();}

// STEP 2: DIMS
function renderDimStep(body){
  const area=getArea();
  const mt='<div style="display:flex;gap:8px;margin-bottom:14px">'+
    '<button onclick="switchDimMode(\'lw\')" class="dim-mode-btn'+(dimMode==='lw'?' active':'')+'">'+ t('lxw')+'</button>'+
    '<button onclick="switchDimMode(\'direct\')" class="dim-mode-btn'+(dimMode==='direct'?' active':'')+'">'+ t('directArea')+'</button></div>';
  const inputs=dimMode==='lw'
    ?'<div class="dim-grid"><div><label class="dim-label">'+t('length')+'</label>'+
      '<input class="dim-input" type="number" inputmode="decimal" placeholder="10.5" value="'+dimL+'" oninput="dimL=this.value;updateDimArea()"/></div>'+
      '<div><label class="dim-label">'+t('width')+'</label>'+
      '<input class="dim-input" type="number" inputmode="decimal" placeholder="8.0" value="'+dimW+'" oninput="dimW=this.value;updateDimArea()"/></div></div>'
    :'<div class="dim-grid"><div class="dim-full"><label class="dim-label">'+t('areaLabel')+'</label>'+
      '<input class="dim-input" type="number" inputmode="decimal" placeholder="84.0" value="'+dimA+'" oninput="dimA=this.value;updateDimArea()"/></div></div>';
  const ad=area?'<div class="dim-result"><span class="dim-result-label">'+t('calcArea')+':</span><span class="dim-result-val">'+area.toFixed(2)+' '+t('m2')+'</span></div>':'<div style="height:14px"></div>';
  const nb=area?'<button class="btn-orange full large" onclick="calcStep=3;renderCalcStep()">'+t('next')+'</button>':'';
  body.innerHTML=stepHdr(3,'calcStep3','calcStep3sub')+mt+inputs+ad+nb;
}
function switchDimMode(m){dimMode=m;renderCalcStep();}
function updateDimArea(){
  const area=getArea();
  const res=document.querySelector('.dim-result');
  if(res)res.innerHTML=area?'<span class="dim-result-label">'+t('calcArea')+':</span><span class="dim-result-val">'+area.toFixed(2)+' '+t('m2')+'</span>':'';
  const old=document.querySelector('#dim-next-btn');
  if(area&&!old)document.getElementById('calc-body').insertAdjacentHTML('beforeend','<button id="dim-next-btn" class="btn-orange full large" onclick="calcStep=3;renderCalcStep()">'+t('next')+'</button>');
  else if(!area&&old)old.remove();
}

// STEP 3: THICKNESS
function renderThickStep(body){
  const zone=CALC_ZONES.find(z=>z.key===selectedZone);
  const use=CALC_AREAS.find(u=>u.key===selectedUse);
  if(!zone||!use)return;
  const R=use.zone==='wall'?zone.R_wall:use.zone==='roof'?zone.R_roof:zone.R_floor;
  const prod=getRecommendedProduct(use.cat);
  if(!prod)return;
  const d_min_m=R*prod.lambda;
  const d_min_mm=Math.ceil(d_min_m*100)*10;
  const flabel=tx3('Hisoblash formulasi','Формула расчёта','Calculation formula');
  const mlabel=tx3(
    'Bu '+(use.zone==='wall'?'devor':'tom/pol')+' uchun minimal qalinlik',
    'Минимальная толщина для '+(use.zone==='wall'?'стены':'кровли/пола'),
    'Minimum thickness for '+(use.zone==='wall'?'wall':'roof/floor')
  );
  const fhtml='<div class="formula-preview"><b>'+flabel+':</b><br/>'+
    'd<sub>min</sub> = '+R+' × '+prod.lambda+' = '+d_min_m.toFixed(3)+' m → <b style="color:var(--orange)">'+d_min_mm+' mm</b><br/>'+
    '<span style="color:var(--gray)">'+mlabel+'</span></div>';
  const allT=[50,80,100,120,150,200];
  const thickHtml='<div class="thick-chips">'+
    allT.map(th=>{
      const isRec=th>=d_min_mm&&th<d_min_mm+30;
      const isSel=selectedThickCalc===th;
      return '<div class="thick-chip-b'+(isSel?' sel':'')+'" onclick="selectThickCalc('+th+')">'+
        (isRec?'<span class="rec-label">'+t('recommended')+'</span>':'')+th+' mm</div>';
    }).join('')+'</div>';
  const btnLabel=selectedThickCalc
    ?tx3('Hisoblash','Рассчитать','Calculate')
    :tx3(d_min_mm+'mm — Hisoblash','Рассчитать с '+d_min_mm+'мм','Calculate with '+d_min_mm+'mm');
  const btn='<button class="btn-orange full large" onclick="'+(selectedThickCalc?'doCalculate()':'autoCalcThick('+d_min_mm+')')+'">'+(selectedThickCalc?'🧮 ':'⚡ ')+btnLabel+'</button>';
  body.innerHTML=stepHdr(4,'calcStep4','calcStep4sub')+fhtml+thickHtml+btn;
}
function selectThickCalc(th){selectedThickCalc=th;renderCalcStep();}
function autoCalcThick(th){selectedThickCalc=th;doCalculate();}

// CALCULATE
function doCalculate(){
  const zone=CALC_ZONES.find(z=>z.key===selectedZone);
  const use=CALC_AREAS.find(u=>u.key===selectedUse);
  const area=getArea();
  if(!zone||!use||!area||!selectedThickCalc)return;
  const R_req=use.zone==='wall'?zone.R_wall:use.zone==='roof'?zone.R_roof:zone.R_floor;
  const prod=getRecommendedProduct(use.cat);
  if(!prod)return;
  const d_min_m=R_req*prod.lambda;
  const d_min_mm=Math.ceil(d_min_m*100)*10;
  const finalThick=selectedThickCalc;
  const packs=Math.ceil(area*1.10/prod.packArea);
  const vol=area*finalThick/1000;
  const weight=vol*prod.density;
  const price=prod.pricePerM2+(finalThick>100?(finalThick-100)*200:0);
  const totalPrice=area*price;
  const R_actual=(finalThick/1000)/prod.lambda;
  calcResult={prod,zone,use,area,finalThick,d_min_mm,R_req,R_actual,packs,vol,weight,totalPrice,price};
  calcStep=4;renderCalcStep();
}

// STEP 4: RESULT
function renderResult(body){
  if(!calcResult){calcStep=0;renderCalcStep();return;}
  const r=calcResult;
  const packsLbl=tx3('Paketlar','Упаковок','Packs');
  const priceLbl=tx3('TAXMINIY NARX','ПРИМЕРНАЯ СТОИМОСТЬ','ESTIMATED COST');
  const metricsLbl=tx3("Asosiy ko'rsatkichlar",'Основные показатели','Key metrics');
  const addLbl=tx3("Savatga qo'shish",'В корзину','Add to cart');
  const recalcLbl=tx3('Qayta hisoblash','Пересчитать','Recalculate');
  const items=[
    {l:t('area'),      v:r.area.toFixed(1),    u:t('m2'),   a:false},
    {l:t('thickness'), v:r.finalThick,          u:'mm',      a:true},
    {l:packsLbl,       v:r.packs,               u:t('pieces'),a:true},
    {l:t('volume'),    v:r.vol.toFixed(2),      u:t('m3'),   a:false},
    {l:t('weight'),    v:Math.round(r.weight),  u:t('kg'),   a:false},
    {l:t('rActual'),   v:r.R_actual.toFixed(2), u:'m²·K/W',  a:true},
  ];
  const grid=items.map(i=>'<div class="result-item"><div class="result-lbl">'+i.l+'</div><div class="result-val'+(i.a?' accent':'')+'">'
    +i.v+' <span class="result-unit">'+i.u+'</span></div></div>').join('');
  const f1='d_min = '+r.R_req+' × '+r.prod.lambda+' = '+(r.R_req*r.prod.lambda).toFixed(3)+' m → '+r.d_min_mm+' mm';
  const f2='Packs = ⌈'+r.area.toFixed(1)+' × 1.1 / '+r.prod.packArea+'⌉ = '+r.packs;
  const f3='V = '+r.area.toFixed(1)+' × '+r.finalThick+'/1000 = '+r.vol.toFixed(2)+' m³';
  const f4='R = '+r.finalThick+'/1000 / '+r.prod.lambda+' = '+r.R_actual.toFixed(2)+' m²·K/W';
  const curUnit=tx3("so'm/m²",'сум/м²','sum/m²');
  const sumLbl=tx3("SO'M",'СУМ','SUM');
  body.innerHTML=
    '<div style="padding-top:14px;margin-bottom:14px;font-family:var(--f-display);font-size:19px;letter-spacing:.3px">✅ '+t('calcResult')+'</div>'+
    '<div class="result-card">'+
    '<div class="result-title">📊 '+metricsLbl+'</div>'+
    '<div class="result-grid">'+grid+'</div>'+
    '<div class="result-prod"><div class="result-prod-icon">'+CAT_EMOJI[r.prod.category]+'</div>'+
    '<div><div class="result-prod-name">'+r.prod.name+' '+r.finalThick+'mm</div>'+
    '<div class="result-prod-sub">'+r.prod.density+'kg/m³ · λ='+r.prod.lambda+' W/m·K · '+r.prod.fire+'</div></div></div>'+
    '<div class="result-price-box"><div class="result-price-lbl">💰 '+priceLbl+'</div>'+
    '<div class="result-price-val">'+r.totalPrice.toLocaleString()+' <span style="font-size:13px;opacity:.5">'+sumLbl+'</span></div>'+
    '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:3px">'+r.area.toFixed(1)+' m² × '+r.price.toLocaleString()+' '+curUnit+'</div></div>'+
    '<div class="formula-box"><div class="formula-title">📐 FORMULA</div>'+
    '<div class="formula-text">'+f1+'<br/>'+f2+'<br/>'+f3+'<br/>'+f4+'</div></div></div>'+
    '<div class="calc-warning">⚠️ '+t('calcNote')+'</div>'+
    '<div style="display:flex;gap:10px;margin-top:14px">'+
    '<button class="btn-orange" style="flex:1;justify-content:center;padding:13px 0" onclick="addCalcToCart()">🛒 '+addLbl+'</button>'+
    '<button class="btn-outline" style="flex:1;padding:13px 0" onclick="resetCalc()">🔄 '+recalcLbl+'</button></div>';
}
function addCalcToCart(){
  if(!calcResult)return;
  Cart.add(calcResult.prod.id,calcResult.finalThick,calcResult.packs);
  showToast('✅ '+calcResult.prod.name+' '+calcResult.finalThick+'mm × '+calcResult.packs+' — '+t('inCart'));
}
function resetCalc(){
  calcStep=0;selectedZone=null;selectedUse=null;dimL='';dimW='';dimA='';selectedThickCalc=null;calcResult=null;renderCalcStep();
}
function getRecommendedProduct(cat){
  if(!window.PRODUCTS_DATA)return null;
  return PRODUCTS_DATA.find(p=>p.category===cat)||PRODUCTS_DATA[0];
}
