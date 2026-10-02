// THE MÜTEAHHİT — arayüz akışı.
import { ekDuzelt as ek } from './ek.js';
import * as E from './engine.js';
import * as S3 from './scene3d.js';
import { REHBER, KAYNAKLAR } from './data/rehber.js';
import { reactionFor } from './data/dialect.js';
import { FIRMA_ADLARI } from './data/lux.js';
import * as SFX from './sfx.js';
import * as PHONE from './phone.js';
import * as MINI from './mini.js';
import * as ISCI from './data/isci.js';
import { DIALECT_LABEL } from './data/dialect.js';
import * as ROZ from './rozet.js';
import { sonKarti } from './kart.js';
import * as KAY from './kaydir.js';
import { yuzKoy } from './yuz.js';
import * as GZ from './gazete.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let state = null, card = null, mode = 'choose', sceneOk = false, bekleyenManset = null, sonOdak = null;

const STATS = [
  ['i', 'İtibar', '#46a758', false], ['g', 'Yatırımcı', '#3e8ed0', false], ['e', 'Ekip', '#f4c20d', false],
  ['r', 'Hukuki risk', '#e5484d', true], ['v', 'Vicdan', '#b48ce0', false],
];
const LBL = { n: 'Kasa', b: 'Borç', i: 'İtibar', g: 'Yatırımcı güveni', e: 'Ekip', r: 'Hukuki risk', v: 'Vicdan', k: 'Kalite', p: 'İlerleme', m: 'Mağdur', d: 'Gecikme', s: 'Arsa sahibi memnuniyeti', h: 'Arsa sahibi payı', o: 'Ön satış', x: 'Vergiden kaçırılan', y: 'Yatırımcı parası', a: 'Piyasa' };
const KISA = { g: 'Yatırımcı', s: 'Arsa sahibi', h: 'Arsa payı', x: 'Vergi kaçağı', y: 'Yatırımcı parası' };
const IKON = { n: '💰', b: '🏦', i: '⭐', g: '🤝', e: '👷', r: '⚖️', v: '😇', k: '🧱', p: '🏗️', m: '😢', d: '⏳', s: '🧓', h: '📐', o: '🔑', x: '🧾', y: '💼', a: '📈' };
const INVERT = new Set(['b', 'r', 'm', 'd', 'h']);
const NEUTRAL = new Set(['y', 'x', 'o']);
const BANNER = { genel: 'SON DAKİKA', kacis: 'ŞOK', cark: 'ALARM', hayat: 'MAGAZİN', teslim: 'ANAHTAR GÜNÜ' };
const PHASE_TXT = { arsa: 'Arsa pazarlığı', yatirim: 'Yatırımcı arayışı', insaat: 'İnşaat', satis: 'Satış', teslim: 'Teslim', bitti: 'Teslim edildi' };
const FACTS = [
  'Satış vaadi sözleşmesini noterde yapın ve tapuya şerh ettirin',
  'Müteahhide verdiğiniz vekaleti ruhsat ve proje işleriyle sınırlayın',
  'Tapuda düşük değer göstermek, sorun çıktığında alıcının aleyhine işler',
  'Ev alırken iskan, yapı denetim raporu ve beton test sonuçlarını sorun',
  'Kolonlara yapılan her müdahale can kaybı demektir: bildirin',
  'Taşeron işçilerinin ücretinden ana işveren de sorumludur — ALO 170',
  'Piyasanın çok üzerinde getiri vaadi bir alarm işaretidir',
];

// ---------- Başlangıç ----------
function boot() {
  $('scCount').textContent = E.TOTAL_SCENARIOS.toLocaleString('tr-TR');
  try { S3.init($('scene')); sceneOk = true; } catch (e) { console.warn('3D başlatılamadı', e); }
  $('loading').classList.add('hidden');
  if (E.load()) $('devamKariyerBtn').classList.remove('hidden');
  try { $('firmaInput').value = localStorage.getItem('muteahhit-firma') || ''; } catch { /* yok say */ }
  $('firmaInput').placeholder = FIRMA_ADLARI[Math.floor(Math.random() * FIRMA_ADLARI.length)];
  $('muteBtn').textContent = SFX.isMuted() ? '🔇' : '🔊';
  $('muteBtn').onclick = () => { $('muteBtn').textContent = SFX.toggleMute() ? '🔇' : '🔊'; };
  if ($('baslaSec')) baslaSecCiz();
  $('yeniBtn').onclick = () => startGame(false);
  if ($('kartBtn')) $('kartBtn').onclick = kartIndir;
  $('devamKariyerBtn').onclick = () => startGame(true);
  $('yenidenBtn').onclick = () => { $('ending').classList.add('hidden'); startGame(false); };
  document.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => openModal(b.dataset.open)));
  $('modalClose').onclick = () => $('modal').classList.add('hidden');
  $('modal').onclick = (e) => { if (e.target.id === 'modal') $('modal').classList.add('hidden'); };
  $('menuBtn').onclick = () => { E.save(state); $('start').classList.remove('hidden'); $('devamKariyerBtn').classList.remove('hidden'); };
  $('devamBtn').onclick = () => { if (!KAY.yeniKaydirildi()) next(); };
  KAY.kur($('card'), { mod: () => mode, sec: (i) => choose(i), devam: () => next() });
  $('yeniProjeBtn').onclick = askNewProject;
  $('kacBtn').onclick = askFlee;
  $('sideToggle').onclick = () => $('side').classList.toggle('closed');
  if (window.innerWidth <= 860) $('side').classList.add('closed');
  // Ekran daralınca (telefonu çevirme, pencere küçültme) panel kartın üstünde açık kalmasın
  matchMedia('(max-width: 860px)').addEventListener?.('change', (e) => { if (e.matches) $('side').classList.add('closed'); });
  window.addEventListener('resize', () => { clearTimeout(sahneAlani._t); sahneAlani._t = setTimeout(sahneAlani, 150); });
  document.querySelectorAll('.side-tabs button').forEach((b) => (b.onclick = () => {
    document.querySelectorAll('.side-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    for (const t of ['projeler', 'hayat', 'gunluk']) $(t).classList.toggle('hidden', b.dataset.tab !== t);
  }));
  document.addEventListener('keydown', onKey);
  MINI.init({ sfx: (n) => SFX.play(n) });
  if (sceneOk) S3.onPick(showPick);
  PHONE.init({ state: () => state, afterChange, toast, floatMoney, deltaChips, eventLine, sfx: (n) => SFX.play(n) });
}

function startGame(resume) {
  bekleyenManset = null; GZ.kapat(false);
  $('start').classList.add('hidden');
  $('hud').classList.remove('hidden');
  const saved = resume ? E.load() : null;
  if (saved && !saved.ending) {
    state = saved;
    Object.assign(state, { owned: state.owned || {}, sins: state.sins || [], arcs: state.arcs || {}, arcT: state.arcT || {}, goals: state.goals || {}, dovizBorc: state.dovizBorc || 0, firma: state.firma || 'Güven Yapı' });
    state.queue = (state.queue || []).map((c) => (c.quake ? E.quakeCard(state, c.quake, c.big) : c));
    card = E.drawCard(state);
  } else {
    E.clearSave();
    state = E.newGame(baslaSecili());
    const f = $('firmaInput').value.trim() || $('firmaInput').placeholder;
    state.firma = f;
    try { localStorage.setItem('muteahhit-firma', $('firmaInput').value.trim()); } catch { /* yok say */ }
    card = introCard();
  }
  if (sceneOk) S3.sync(state);
  render();
  showCard(card);
}

const BASLA_KEY = 'muteahhit-basla';
function baslaSecili() { try { const k = localStorage.getItem(BASLA_KEY); if (E.BASLANGIC && E.BASLANGIC[k]) return k; } catch { /* yok say */ } return 'kalfa'; }
function baslaSecCiz() {
  const sec = baslaSecili();
  $('baslaSec').innerHTML = Object.entries(E.BASLANGIC || {}).map(([k, b]) =>
    `<button class="basla-kart${k === sec ? ' secili' : ''}" role="radio" aria-checked="${k === sec}" data-k="${k}"><span class="be">${b.emoji}</span><b>${esc(b.ad)}</b><small>${esc(b.kisa)}</small></button>`).join('');
  $('baslaSec').querySelectorAll('button').forEach((b) => (b.onclick = () => {
    try { localStorage.setItem(BASLA_KEY, b.dataset.k); } catch { /* yok say */ }
    if ($('baslaSec')) baslaSecCiz();
  }));
}
const INTRO = {
  kalfa: { who: ['👴', 'Ustabaşı Hasan Usta', 'Lawo, artık kendi binanı dik. Ama betona su kattırma, hakkımı helal etmem!'],
    text: '15 yıl kalfalık yaptın, şimdi kendi firman var: 4 milyon lira, eski bir kamyonet ve sadık ustalar.' },
  aile: { who: ['👴', 'Rahmetli babanın sözü', 'Oğlum, parayı kazanırsın; adını bir kere kaybedersen bulamazsın.'],
    text: 'Babandan tanınan bir tabela kaldı: 13 milyon kasa, 7 milyon banka borcu. Eski binaları sağlam mı, bilmiyorsun.' },
  damat: { who: ['🎩', 'Kayınpeder Zeki Bey', 'Abe damat, sen işini yap, belediyede ben varım.'],
    text: 'Kayınpederin firmanın kapısını açtı: 9 milyon lira ve belediyede tanıdık bir yüz. Herkes kimin damadı olduğunu biliyor.' },
};
function introCard() {
  const I = E.BASLANGIC && INTRO[state.baslangic];
  if (I) return {
    kind: 'sys', phase: 'sistem', title: E.BASLANGIC[state.baslangic].ad, noStep: true,
    speaker: { emoji: I.who[0], name: I.who[1], label: '', roleLabel: '', quote: I.who[2] },
    text: I.text + ' Arsa bul, binanı dik, sat. Sözünü tutup tutmamak sana kalmış.',
    ders: 'Her senaryo gerçekte yaşanmış bir yöntemden esinlenir. Her seçimden sonra nasıl korunacağını göreceksin.',
    choices: [{ label: 'Kolları sıva', fx: '', result: `Kartvizitlerin basıldı: "${state.firma} — Güvenin Adresi".` }],
  };
  return {
    kind: 'sys', phase: 'sistem', title: 'Kariyerin Başlıyor', noStep: true,
    speaker: { emoji: '👴', name: 'Rahmetli babanın sözü', label: '', roleLabel: '', quote: 'Oğlum, bina dediğin içinde insan yaşayacak yerdir. Parayı kazanırsın, adını bir kere kaybedersen bulamazsın.' },
    text: 'Elinde eski bir kamyonet ve 8 milyon lira var. Arsa bul, binanı dik, sat. Sözünü tutup tutmamak sana kalmış.',
    ders: 'Her senaryo gerçekte yaşanmış bir yöntemden esinlenir. Her seçimden sonra nasıl korunacağını göreceksin.',
    choices: [{ label: 'Kolları sıva', fx: '', result: `Kartvizitlerin basıldı: "${state.firma} — Güvenin Adresi".` }],
  };
}

// ---------- Arayüz ----------
function render() {
  const s = state;
  $('unvan').textContent = `${E.unvan(s)} · ${s.completed} proje`;
  $('tarih').textContent = E.dateLabel(s.t);
  setMoney('nakit', s.n); setMoney('borc', -s.b, true); setMoney('net', E.netWorth(s));
  $('piyasa').textContent = `${s.market >= 1 ? '▲' : '▼'} ${Math.round(s.market * 100)}`;
  $('magdur').textContent = s.m.toLocaleString('tr-TR');
  $('magdur').className = s.m > 0 ? 'neg' : '';
  $('dosya').textContent = `🗄️ ${(s.sins || []).length}`;
  $('dosya').className = (s.sins || []).length ? 'neg' : '';
  const a = E.ahlak(s);
  $('ahlakPin').style.top = `${100 - a}%`; $('ahlakPin').style.setProperty('--ahlak', `${a}%`);
  $('ahlakPin').style.background = a >= 60 ? '#46a758' : a >= 35 ? '#f4a20d' : '#e5484d';
  $('ahlakLbl').textContent = E.ahlakEtiket(a);
  $('ahlakLbl').style.color = a >= 60 ? '#9be3a6' : a >= 35 ? '#ffd27a' : '#ff9ea1';
  const g = E.nextGoal(s);
  $('goal').innerHTML = g ? `🎯 <b>Hedef:</b> ${esc(g.ad)} <small>(${Object.keys(s.goals || {}).length}/${E.GOALS.length})</small>` : '🏆 Bütün hedefler tamam!';
  renderHayat();
  if (!$('st-i')) $('stats').innerHTML = STATS.map(([k, l]) => `<div class="stat" id="st-${k}"><div class="lbl"><span>${l}</span><b></b></div><div class="bar"><i></i></div></div>`).join('');
  for (const [k, , c, inv] of STATS) {
    const v = Math.round(s[k]), el = $(`st-${k}`);
    const col = inv ? (v > 70 ? '#e5484d' : v > 40 ? '#f4a20d' : '#46a758') : c;
    el.querySelector('b').textContent = v;
    Object.assign(el.querySelector('i').style, { width: `${v}%`, background: col });
  }
  renderProjects();
  PHONE.badge();
  $('gunluk').innerHTML = s.log.map((l) => `<div class="log-line">${esc(ek(l))}</div>`).join('') || '<p class="log-line">Henüz bir şey olmadı.</p>';
  const news = [...s.news, ...FACTS];
  const tt = news.map((n) => `● ${ek(n)}`).join('     ');
  if ($('tickerText').textContent !== tt) $('tickerText').textContent = tt;
  $('kacBtn').classList.toggle('hidden', !E.canFlee(s));
  $('yeniProjeBtn').disabled = !E.canStartProject(s);
  $('yeniProjeBtn').title = E.canStartProject(s) ? '' : `Aynı anda en fazla ${E.maxConcurrent(s)} proje yürütebilirsin (bitirdikçe artar).`;
}

// Para değişince sayı akarak değişir
function setMoney(id, v, debt) {
  const el = $(id), from = el._v ?? v;
  el._v = v;
  el.className = v < 0 ? 'neg' : '';
  const show = (x) => (el.textContent = debt ? E.fmt(-x) : E.fmt(x));
  cancelAnimationFrame(el._raf);
  if (Math.abs(from - v) < 0.005) return show(v);
  el.classList.add(v > from ? 'money-up' : 'money-down');
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - k, 3);
    show(from + (v - from) * e);
    if (k < 1) el._raf = requestAnimationFrame(step);
    else el.classList.remove('money-up', 'money-down');
  };
  el._raf = requestAnimationFrame(step);
}

function renderProjects() {
  const act = E.activeProjects(state);
  const past = state.projects.filter((p) => p.done || p.collapsed).slice(-8).reverse();
  const html = [...act, ...past].map((p) => {
    const cu = E.contractorUnits(p);
    const ph = p.collapsed ? 'YIKILDI' : p.phase === 'insaat' ? `İnşaat %${Math.round(p.progress)}` : PHASE_TXT[p.phase];
    const prog = p.phase === 'insaat' ? p.progress : { arsa: 5, yatirim: 12, satis: 100, teslim: 100, bitti: 100 }[p.phase] ?? 100;
    const extra = p.collapsed ? `${p.olu} can kaybı` : `Kalite ${Math.round(p.kalite)} · Satılan ${p.onSatis + p.satilan}/${cu}${p.gecikme > 0 ? ` · ${Math.round(p.gecikme)} ay gecikme` : ''}`;
    return `<div class="pcard ${p.done ? 'done' : ''} ${p.collapsed ? 'collapsed' : ''}" data-id="${p.id}">
      <h4>${esc(p.name)}</h4><div class="meta"><span class="phase">${ph}</span>${esc(p.semt)} · ${p.daire} daire · Arsa sahibi %${Math.round(p.pay)}</div>
      ${p.done ? '' : `<div class="pbar"><i style="width:${prog}%"></i></div>`}<div class="meta">${extra}</div></div>`;
  }).join('');
  $('projeler').innerHTML = html || '<p class="log-line">Henüz projen yok.</p>';
  $('projeler').querySelectorAll('.pcard').forEach((el) => (el.onclick = () => {
    const p = state.projects.find((x) => x.id === +el.dataset.id);
    if (sceneOk) S3.focus(p);
    if (window.innerWidth <= 860) $('side').classList.add('closed');
  }));
}

function renderHayat() {
  const s = state;
  const inc = E.luxMonthly(s);
  const rows = Object.entries(E.LUX).map(([k, it]) => {
    const own = s.owned && s.owned[k];
    const locked = s.completed < it.min;
    const para = [it.gelir ? `+${E.fmt(it.gelir)}/ay` : '', it.gider ? `−${E.fmt(it.gider)}/ay` : ''].filter(Boolean).join(' · ');
    const btn = own ? `<button data-sell="${k}">Sat (${E.fmt(it.fiyat / 2)})</button>`
      : locked ? `<button disabled>🔒 ${it.min} proje bitir</button>`
      : `<button data-buy="${k}" class="${E.canBuy(s, k) ? 'primary' : ''}" ${E.canBuy(s, k) ? '' : 'disabled'}>Al · ${E.fmt(it.fiyat)}</button>`;
    return `<div class="lux ${own ? 'own' : ''} ${locked ? 'locked' : ''}"><div class="lux-ic">${it.ikon}</div><div class="lux-b"><b>${esc(it.ad)}</b><small>${it.tur === 'is' ? 'Yan iş' : 'Lüks'}${para ? ' · ' + para : ''}</small><p>${esc(it.a)}</p>${btn}</div></div>`;
  }).join('');
  $('hayat').innerHTML = `<p class="log-line">Aylık yan gelir/gider: <b class="${inc >= 0 ? 'pos' : 'neg'}">${E.fmt(inc)}</b></p>${rows}`;
  $('hayat').querySelectorAll('[data-buy]').forEach((b) => (b.onclick = () => {
    const r = E.buyLux(state, b.dataset.buy);
    if (!r) return;
    SFX.play('coin');
    floatMoney(-E.LUX[b.dataset.buy].fiyat);
    toast(`${E.LUX[b.dataset.buy].ikon} ${E.LUX[b.dataset.buy].ad} artık senin!`);
    for (const e of r.events) if (e[0] === 'goal') { toast(`🎯 Hedef tamam: ${e[1]}`, 'goal'); SFX.play('goal'); }
    afterChange();
  }));
  $('hayat').querySelectorAll('[data-sell]').forEach((b) => (b.onclick = () => {
    const v = E.sellLux(state, b.dataset.sell);
    if (v == null) return;
    SFX.play('coin'); floatMoney(v);
    afterChange();
  }));
}

// ---------- 3B sahnede tıklama ----------
function kesitSvg(p) {
  const W = 230, H = 150, fl = p.phase === 'insaat' ? Math.max(1, Math.ceil((p.progress / 100) * p.floors)) : p.floors;
  const n = Math.min(fl, 12), fh = (H - 30) / Math.max(n, 6), bw = 150, x0 = 40, gy = H - 14;
  const k = p.kalite, kolon = k >= 70 ? 7 : k >= 50 ? 5 : k >= 35 ? 3.5 : 2.5;
  const beton = k >= 70 ? '#c9c6bf' : k >= 50 ? '#bdb8ad' : '#b3a58f';
  const tilt = p.hasar ? 'rotate(3 115 136)' : '';
  let g = `<rect x="0" y="${gy}" width="${W}" height="14" fill="#6b5234"/>`;
  if (p.collapsed) {
    g += `<path d="M30 ${gy} L60 ${gy - 30} L85 ${gy - 12} L120 ${gy - 40} L150 ${gy - 18} L190 ${gy - 26} L205 ${gy} Z" fill="#8a8378"/>`;
    g += `<text x="115" y="30" fill="#ff7b7b" font-size="13" text-anchor="middle" font-weight="700">ENKAZ</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="kesit">${g}</svg>`;
  }
  if (p.phase === 'arsa' || p.phase === 'yatirim') {
    g += p.phase === 'arsa' ? `<rect x="70" y="${gy - 40}" width="70" height="40" fill="#c49a6c"/><path d="M62 ${gy - 40} L105 ${gy - 68} L148 ${gy - 40} Z" fill="#9b3b2a"/><text x="115" y="22" fill="#ddd" font-size="12" text-anchor="middle">Eski ev · yıkılmayı bekliyor</text>`
      : `<rect x="40" y="${gy}" width="150" height="10" fill="#4a3a26"/><text x="115" y="22" fill="#ddd" font-size="12" text-anchor="middle">Temel kazısı</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="kesit">${g}</svg>`;
  }
  let b = '';
  for (let f = 0; f < n; f++) {
    const y = gy - (f + 1) * fh;
    b += `<rect x="${x0}" y="${y}" width="${bw}" height="3" fill="${beton}"/>`;
    for (let c = 0; c < 4; c++) {
      const cx = x0 + 4 + c * (bw - 8 - kolon) / 3;
      b += `<rect x="${cx}" y="${y + 3}" width="${kolon}" height="${fh - 3}" fill="${beton}" stroke="#555" stroke-width="0.4"/>`;
      if (k < 50 && (f + c) % 3 === 0) b += `<path d="M${cx + kolon / 2} ${y + 5} l2 4 l-3 4 l2 4" stroke="#e5484d" stroke-width="1" fill="none"/>`;
    }
    if (p.phase !== 'insaat' && k >= 45) for (let w = 0; w < 3; w++) b += `<rect x="${x0 + 18 + w * 45}" y="${y + fh * 0.3}" width="22" height="${fh * 0.4}" fill="#6fa8c9" opacity="0.8"/>`;
  }
  g += `<g transform="${tilt}">${b}</g>`;
  if (fl > n) g += `<text x="${x0 + bw / 2}" y="12" fill="#aaa" font-size="10" text-anchor="middle">(+${fl - n} kat daha)</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="kesit">${g}</svg>`;
}

function icerik(p) {
  if (p.collapsed) return `Bina yıkıldı. Enkazdan ${p.olu} kişi çıkarıldı. Bilirkişiler kolonlardaki demiri ve beton numunelerini inceliyor.`;
  const k = p.kalite;
  if (p.phase === 'arsa') return 'Arsa sahipleriyle pazarlık sürüyor. Eski evde hâlâ biri oturuyor.';
  if (p.phase === 'yatirim') return 'Temel kazılıyor. Zemin etüdü raporu dosyada' + (k < 50 ? '… ama sayfaları kimse okumadı.' : ', kazı ona göre yapılıyor.');
  if (k >= 75) return 'Kolonlar kalın, etriyeler sık bağlanmış. Beton numuneleri hedefi geçti. Depreme hazırlıklı.';
  if (k >= 55) return 'Genel olarak düzgün. Birkaç yerde kalıp izi ve ince sıva çatlağı var.';
  if (k >= 35) return 'Etriyeler seyrek, betonda çakıl yuvaları var. Sıva kusurları şimdilik kapatıyor.';
  return 'Kolonlar ince, demir az, beton sulu. Dışı boyalı ama içi çürük. Kırmızı çizgiler çatlak.';
}

function hidePick() { $('pickPop').classList.add('hidden'); }

function showPick(pk) {
  if (!state || state.ending || mode === 'mini' || PHONE.isOpen() || !$('start').classList.contains('hidden')) return;
  let html = '';
  const p = pk.id != null ? state.projects.find((x) => x.id === pk.id) : null;
  if (pk.kind === 'proje' && p) {
    const cu = E.contractorUnits(p);
    const ph = p.collapsed ? 'YIKILDI' : p.phase === 'insaat' ? `İnşaat %${Math.round(p.progress)}` : PHASE_TXT[p.phase];
    html = `<h4>🏗️ ${esc(p.name)}</h4><div class="pp-meta">${esc(p.semt)} · ${ph} · ${p.floors} kat · ${p.daire} daire</div>
      ${kesitSvg(p)}<p>${esc(icerik(p))}</p>
      <div class="pp-row"><span>Kalite <b>${Math.round(p.kalite)}</b></span><span>Satılan <b>${p.onSatis + p.satilan}/${cu}</b></span>${p.gecikme > 0 ? `<span class="neg">Gecikme <b>${Math.round(p.gecikme)} ay</b></span>` : ''}</div>`;
  } else if (pk.kind === 'isci' && p) {
    const w = ISCI.isciSozu(state, p, pk.n, pk.baret);
    html = `<h4>${w.durum === 'baret' ? '⛑️' : '👷'} ${esc(w.ad)}</h4><div class="pp-meta">${esc(p.name)} şantiyesi · ${esc(DIALECT_LABEL[w.dia] || '')}</div>
      <p class="pp-quote">“${esc(w.soz)}”</p><div class="pp-ders"><b>Gerçek hayatta:</b> ${esc(w.ders)}</div>`;
  } else if (pk.kind === 'magdur') {
    const m = ISCI.magdurSozu(pk.tema, Math.floor(Math.random() * 9));
    html = `<h4>📢 Mağdurlar</h4><div class="pp-meta">${p ? esc(p.name) + ' önünde' : 'Ofisinin önünde'} · ${state.m.toLocaleString('tr-TR')} mağdur</div>
      <p class="pp-quote">“${esc(m.soz)}”</p><div class="pp-ders"><b>Gerçek hayatta:</b> ${esc(m.ders)}</div>`;
  } else if (pk.kind === 'basin') {
    html = `<h4>🎥 Muhabir</h4><p class="pp-quote">“Canlı yayındayız. Müteahhit firma ${esc(state.firma)} hâlâ açıklama yapmadı. Mağdurlar sabahtan beri burada.”</p>
      <div class="pp-ders"><b>Gerçek hayatta:</b> Mağdurlar birlikte hareket edip avukat, basın ve tüketici örgütleriyle sesini duyurduğunda dosyalar hızlanır.</div>`;
  } else if (pk.kind === 'polis') {
    html = `<h4>🚓 Ekip otosu</h4><p class="pp-quote">“Savcılığın talimatıyla bekliyoruz. Beyefendi bir yere gitmesin.”</p><div class="pp-meta">Hukuki risk: <b class="neg">${Math.round(state.r)}</b></div>`;
  } else if (pk.kind === 'ofis') {
    html = `<h4>🏢 ${esc(state.firma)}</h4><div class="pp-meta">${esc(E.unvan(state))} · ${state.completed} proje · Net ${E.fmt(E.netWorth(state))}</div>
      <div class="pp-menu"><button data-pm="tel">📱 Harç'ı aç</button><button data-pm="yeni" ${E.canStartProject(state) && mode === 'choose' ? '' : 'disabled'}>🏗️ Yeni proje</button>
      <button data-pm="hayat">💎 Hayatım</button><button data-pm="gunluk">📜 Günlük</button></div>`;
  }
  if (!html) return;
  SFX.play('click');
  const el = $('pickPop');
  el.innerHTML = `<button class="pp-x" aria-label="Kapat">✕</button>${html}`;
  el.classList.remove('hidden');
  const mob = window.innerWidth <= 860;
  if (mob) { el.style.left = ''; el.style.top = ''; }
  else {
    const w = 300, h = el.offsetHeight || 260;
    el.style.left = `${Math.max(10, Math.min(window.innerWidth - w - 10, pk.x + 14))}px`;
    el.style.top = `${Math.max(60, Math.min(window.innerHeight - h - 10, pk.y - h / 2))}px`;
  }
  el.querySelector('.pp-x').onclick = hidePick;
  el.querySelectorAll('[data-pm]').forEach((b) => (b.onclick = () => {
    hidePick();
    const a = b.dataset.pm;
    if (a === 'tel') PHONE.open();
    else if (a === 'yeni') askNewProject();
    else {
      $('side').classList.remove('closed');
      document.querySelector(`.side-tabs button[data-tab="${a}"]`)?.click();
    }
  }));
  if (p && pk.kind === 'proje') S3.focus(p);
}

// Kart açılınca sahnede küçük olay
function sceneEvent(c) {
  if (!sceneOk) return;
  const who = `${c.speaker?.name || ''} ${c.speaker?.roleLabel || ''}`;
  if (/Müfettiş|Denetim|denetçi/i.test(c.title) && c.projId != null) S3.event3d('denetim', c.projId);
  else if (/Gözaltı|Operasyon|Baskın/i.test(c.title)) S3.event3d('polis');
  if (/Pınar|muhabir|gazeteci|haber/i.test(who) || /Linç|İfşa/i.test(c.title)) S3.event3d('basin', c.projId);
}

function afterChange() {
  if (sceneOk) S3.sync(state);
  render();
  if (!state.ending) E.save(state);
}

function toast(txt, cls = '') {
  const d = document.createElement('div');
  d.className = `toast ${cls}`; d.textContent = ek(txt);
  $('toasts').appendChild(d);
  setTimeout(() => d.classList.add('out'), 3200);
  setTimeout(() => d.remove(), 3800);
}

function floatMoney(v) {
  if (Math.abs(v) < 0.01) return;
  const r = $('nakit').getBoundingClientRect();
  const d = document.createElement('div');
  d.className = `float ${v >= 0 ? 'pos' : 'neg'}`;
  d.textContent = `${v >= 0 ? '+' : ''}${E.fmt(v)}`;
  d.style.left = `${r.left + r.width / 2}px`; d.style.top = `${r.bottom + 4}px`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1800);
}

// Telefonda sahnenin görünen kısmı: üst bilgi çubuklarının altı ile kartın üstü arası
function sahneAlani() {
  if (!sceneOk || window.innerWidth > 860) return;
  setTimeout(() => {
    const ust = Math.max(...['hud', 'ahlak', 'sideToggle'].map((id) => { const r = $(id)?.getBoundingClientRect(); return r && r.height ? r.bottom : 0; }));
    const k = $('card').getBoundingClientRect();
    S3.bosAlan(ust, k.top);
  }, 30);
}

function showCard(c) {
  card = c; mode = 'choose';
  if ($('damga')) $('damga').className = 'damga hidden';
  $('card').classList.remove('secildi');
  const proj = c.projId != null ? state.projects.find((p) => p.id === c.projId) : null;
  $('card').style.animation = 'none'; void $('card').offsetWidth; $('card').style.animation = '';
  $('cardPhase').textContent = E.PHASE_LABEL[c.phase] || c.phase;
  $('cardPhase').className = `tag ${c.phase}`;
  $('cardProj').textContent = proj ? `${proj.name} · ${proj.semt}` : E.dateLabel(state.t);
  sahneAlani();
  // Kart başka bir binayla ilgiliyse kamera o binaya döner (boş sokak yerine)
  if (sceneOk && proj && !proj.collapsed && proj.slot >= 0 && proj.id !== sonOdak) { sonOdak = proj.id; S3.focus(proj); }
  $('cardTitle').textContent = ek(c.title);
  const ban = c.banner || BANNER[c.phase];
  $('cardBanner').textContent = ban ? `🔴 ${ban}` : '';
  $('cardBanner').classList.toggle('hidden', !ban);
  const sp = c.speaker;
  $('speaker').classList.toggle('hidden', !sp);
  if (sp) {
    yuzKoy($('spEmoji'), sp, 'konus');
    $('spName').textContent = sp.name;
    // Şive etiketi yazı kalabalığı yapıyor; sadece üzerine gelince görünür
    const rol = sp.roleLabel || '';
    // "Mehmet Ali Usta" + "Usta" tekrarını ve adında görevi yazanları ("bekçi Hüsnü") ayrıca etiketleme
    const gorevli = sp.role === 'US' && /^[a-zçğıöşü]/.test(sp.name || '');
    $('spMeta').textContent = gorevli || (rol && sp.name.toLocaleLowerCase('tr-TR').includes(rol.toLocaleLowerCase('tr-TR'))) ? '' : rol;
    $('spMeta').title = sp.label || '';
    $('spQuote').textContent = `“${ek(sp.quote)}”`;
  }
  $('cardText').textContent = ek(c.text);
  $('cardTwist').textContent = c.twist ? `⚠ ${ek(c.twist)}` : '';
  $('cardTwist').classList.toggle('hidden', !c.twist);
  $('choices').innerHTML = '';
  c.choices.forEach((ch, i) => {
    const b = document.createElement('button');
    const isMini = ch.act?.type === 'mini' || ch.act?.mini;
    const risky = !isMini && (ch.act?.type === 'gamble' || (ch.act?.type === 'esc' && (ch.act.end || ch.act.risk)));
    const biter = /(^|\s)E:/.test(ch.fx || '') && !c.finalStage;
    b.innerHTML = `<b>${i + 1}.</b> ${isMini ? '🎮 ' : ''}${etiket(ek(ch.label))}${risky && !/🎲/.test(ch.label) ? ' 🎲' : ''}${biter ? ' <span class="biter">🏁 kariyerin biter</span>' : ''}`;
    if (risky) b.classList.add('risky');
    if (isMini) b.classList.add('minich');
    b.onclick = () => { if (!KAY.yeniKaydirildi()) choose(i); };
    $('choices').appendChild(b);
  });
  if (KAY.ipucuGoster() && c.choices.length > 1) {
    const ip = document.createElement('div');
    ip.className = 'kaydir-ipucu'; ip.textContent = '👆 Dokun ya da seçeneği yana kaydır';
    $('choices').appendChild(ip);
    const ilk = $('choices').firstElementChild;
    setTimeout(() => { if (mode === 'choose') ilk.classList.add('durt'); }, 900);
  }
  $('choices').classList.remove('hidden');
  $('resultBox').classList.add('hidden');
  $('card').scrollTop = 0;
  if (proj && sceneOk && window.innerWidth > 860) S3.focus(proj);
  hidePick();
  sceneEvent(c);
}

function choose(i) {
  if (mode !== 'choose') return;
  const a = card.choices[i].act || {};
  const game = a.type === 'mini' ? a.game : a.mini;
  if (game) {
    mode = 'mini';
    MINI.run(game, card.miniCtx || {}).then((r) => { mode = 'choose'; doChoose(i, r); });
    return;
  }
  doChoose(i, {});
}

function doChoose(i, mini) {
  if (mode !== 'choose') return;
  mode = 'result';
  const c = card;
  const before = Object.fromEntries(STATS.map(([k]) => [k, state[k]]));
  const n0 = state.n;
  const res = E.resolve(state, c, i, mini);
  if (res.noTime) { render(); showCard(E.drawCard(state)); return; }
  // Konuşan kişinin tepkisi (şivesiyle)
  const mood = res.deltas.reduce((a, [k, v]) => a + (k === 'v' ? v : k === 's' ? v * 0.7 : k === 'e' && c.speaker?.role === 'US' ? v : k === 'm' ? -v * 3 : 0), 0);
  const rx = c.kind === 'tpl' && c.speaker ? reactionFor(c.speaker, mood >= 0 ? 1 : -1, state.t + i) : null;
  // Konuşan kişinin yüzü seçime göre güler ya da kızar (yazı olmasa da)
  const yuzVar = c.speaker && yuzKoy($('rxEmoji'), c.speaker, mood > 0.5 ? 'mutlu' : mood < -0.5 ? 'kizgin' : '');
  $('reaction').className = `speaker reaction ${mood >= 0 ? 'good' : 'bad'}${rx || yuzVar ? '' : ' hidden'}`;
  $('rxQuote').classList.toggle('hidden', !rx);
  if (rx) $('rxQuote').innerHTML = `<b>${esc(c.speaker.name)}:</b> “${esc(rx)}”`;
  $('choices').classList.add('hidden');
  $('card').classList.add('secildi');
  $('secim').textContent = `➜ ${ek(c.choices[i].label)}`;
  $('resultBox').classList.remove('hidden');
  $('resultText').textContent = (mini.score != null ? `🎮 ${Math.round(mini.score * 100)}/100 — ` : '') + (res.gamble === true ? '🎲 TUTTU! ' : res.gamble === false ? '🎲 TUTMADI! ' : '') + ek(res.result);
  $('deltas').innerHTML = deltaChips(res.deltas);
  if (!state.ending) for (const r of ROZ.kontrol(state)) { (state.rozetler ||= []).push(r.id); toast(`${r.emoji} Rozet kazandın: ${r.ad}`, 'rozetT'); SFX.play('goal'); }
  $('events').innerHTML = res.events.filter((e) => e[0] !== 'faiz').map(eventLine).join('');
  $('ders').innerHTML = dersHtml(c.ders, res.deltas);
  const dm = damga(res, mini);
  sahneTepki(c, dm);
  $('ders').classList.toggle('hidden', !c.ders);
  $('devamBtn').textContent = state.ending ? 'Sonu gör ▸' : 'Devam ▸';
  // Sıradaki ayın merak uyandıran fragmanı
  $('teaser').classList.add('hidden');
  if (!state.ending) {
    const nx = E.drawCard(state);
    state.queue.unshift(nx);
    const who = nx.speaker ? `${nx.speaker.emoji} ${nx.speaker.name.charAt(0).toLocaleUpperCase('tr-TR')}${nx.speaker.name.slice(1)}` : '📞 Telefon çalıyor';
    $('teaser').innerHTML = `<small>SIRADAKİ</small> ${esc(who)} — <b>${esc(nx.title)}</b>`;
    $('teaser').classList.remove('hidden');
  }
  const dn = state.n - n0;
  floatMoney(dn);
  if (res.gamble != null) SFX.play('dice');
  if (c.quake) SFX.play('rumble');
  else if (state.ending === 'iade') SFX.play('siren');
  else if (state.ending === 'kacak') SFX.play('plane');
  else if (state.ending) SFX.play(['patron', 'emekli'].includes(state.ending) ? 'win' : 'bad');
  else if (res.gamble === false || mood < -6) SFX.play('bad');
  else if (dn > 0.5) SFX.play('coin');
  else SFX.play('click');
  for (const e of res.events) {
    if (e[0] === 'goal') { toast(`🎯 Hedef tamam: ${e[1]}`, 'goal'); SFX.play('goal'); }
    if (e[0] === 'sin') toast('⏳ Bu karar dosyaya girdi…', 'sin');
  }
  if (sceneOk && res.events.some((e) => e[0] === 'info' && /tamamlandı!/.test(e[1]))) {
    S3.fireworks?.(state);
    const bitti = state.projects.filter((p) => p.done && !p.collapsed && p.slot >= 0).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))[0];
    if (bitti) S3.cinematic('bitis', bitti.id);
  }
  if (sceneOk) {
    if (c.quake) {
      const col = (state.lastQuake?.collapsed || []).map((p) => p.id);
      S3.quake(c.quake, col, () => S3.sync(state));
      S3.cinematic('deprem', col[0]);
    } else S3.sync(state);
    if (state.ending === 'kacak' || state.ending === 'iade') { S3.flyPlane(); S3.cinematic('kacis'); }
  }
  bekleyenManset = GZ.manset(state, c, res, c.choices?.[i]?.label);
  delete state.lastQuake;
  render();
  for (const [k] of STATS) if (Math.round(before[k]) !== Math.round(state[k])) { const el = $(`st-${k}`); if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } }
  sahneAlani();
  if (state.ending) E.clearSave(); else E.save(state);
}

// Uzun seçenek: " · " sonrası küçük satıra iner
function etiket(l) {
  const i = l.indexOf(' · ');
  return i < 0 ? esc(l) : `${esc(l.slice(0, i))}<span class="hint">${esc(l.slice(i + 3))}</span>`;
}

// Gerçek hayatta notu: kötü bir yola saptıysan kısa hali açık gelir, yoksa tıklayınca açılır (az yazı)
function dersHtml(ders, deltas) {
  if (!ders) return '';
  const kotu = deltas.some(([k, v]) => (k === 'v' && v < 0) || (k === 'm' && v > 0) || (k === 'x' && v > 0));
  const i = ders.search(/[.!?](\s|$)/);
  const ilk = i > 0 ? ders.slice(0, i + 1) : ders, kalan = i > 0 ? ders.slice(i + 1).trim() : '';
  if (kotu) return `<div class="ders-kotu">⚠️ <b>Gerçek hayatta:</b> ${esc(ilk)}${kalan ? ` <details><summary>devamı</summary>${esc(kalan)}</details>` : ''}</div>`;
  return `<details><summary>💡 Gerçek hayatta ne olur?</summary>${esc(ders)}</details>`;
}

// Seçimden sonra karta basılan mühür
function damga(res, mini) {
  const el = $('damga');
  if (!el) return;
  const d = {}; for (const [k, v] of res.deltas) d[k] = (d[k] || 0) + v;
  let t = null, cls = '';
  if (res.gamble === true) { t = 'TUTTU'; cls = 'sari'; }
  else if (res.gamble === false) { t = 'TUTMADI'; cls = 'kirmizi'; }
  else if ((d.v || 0) <= -4 || (d.m || 0) > 0) { t = 'KİRLİ İŞ'; cls = 'kirmizi'; }
  else if (mini.score != null && mini.score >= 0.8) { t = 'USTACA'; cls = 'yesil'; }
  else if ((d.v || 0) >= 3) { t = 'TEMİZ İŞ'; cls = 'yesil'; }
  else if ((d.n || 0) > 0.5) { t = 'KÂRLI'; cls = 'sari'; }
  el.className = 'damga hidden';
  if (!t) return null;
  el.textContent = t; void el.offsetWidth;
  el.className = `damga ${cls}`;
  // Ekran kenarında kısa bir renk parlaması
  const f = $('parilti');
  if (f && cls !== 'sari') { f.className = ''; void f.offsetWidth; f.className = cls; }
  return { t, cls };
}

// Seçime göre 3B sahnede anlık tepki: kirli işte binada çatlak ve toz, temiz işte işçiler sevinir
function sahneTepki(c, dm) {
  if (!sceneOk || !dm || c.quake) return;
  const kind = dm.cls === 'kirmizi' ? 'kirli' : dm.cls === 'yesil' ? 'temiz' : dm.t === 'KÂRLI' || dm.t === 'TUTTU' ? 'para' : null;
  if (!kind) return;
  const proj = c.projId != null ? state.projects.find((p) => p.id === c.projId && !p.collapsed && p.slot >= 0) : null;
  if (proj) S3.focus(proj);
  setTimeout(() => S3.tepki(kind, proj ? proj.id : null), proj ? 350 : 0);
}

function deltaChips(deltas) {
  const agg = new Map();
  for (const [k, v] of deltas) agg.set(k, (agg.get(k) || 0) + v);
  const out = [];
  for (const [k, v] of agg) {
    if (Math.abs(v) < 0.005) continue;
    let val;
    if ('nbxy'.includes(k)) val = E.fmt(Math.abs(v));
    else if (k === 'o') val = `${Math.round(v)} daire`;
    else if (k === 'h' || k === 'a') val = `%${Math.round(Math.abs(v))}`;
    else if (k === 'd') val = `${Math.round(Math.abs(v))} ay`;
    else val = Math.round(Math.abs(v));
    if (val === 0) continue;
    const sign = v > 0 ? '+' : '−';
    const good = NEUTRAL.has(k) ? null : (v > 0) !== INVERT.has(k);
    out.push(`<span class="chip ${good === null ? '' : good ? 'good' : 'bad'}" title="${LBL[k]}" style="animation-delay:${out.length * 70}ms">${IKON[k] || ''} ${KISA[k] || LBL[k]} <b>${k === 'o' ? '' : sign}${val}</b></span>`);
  }
  return out.join('');
}

function eventLine(e) {
  const [t, v, n] = e;
  if (t === 'maliyet') return `<li>🧱 Bu ayın inşaat maliyeti: ${E.fmt(v)}</li>`;
  if (t === 'satis') return `<li>🔑 ${n} daire satıldı: +${E.fmt(v)}</li>`;
  if (t === 'yatirimci') return `<li>🤝 Yatırımcılara geri ödeme (kâr payıyla): ${E.fmt(v)}</li>`;
  if (t === 'olu') return `<li class="olu">🕯️ ${esc(v)}</li>`;
  if (t === 'sin') return `<li class="sin">⏳ Bu iş dosyaya girdi. Bir gün önüne gelecek…</li>`;
  if (t === 'goal') return `<li class="goal-li">🎯 Hedef tamamlandı: ${esc(v)}</li>`;
  if (t === 'linc') return `<li class="sin">📱 ${esc(v)}</li>`;
  if (t === 'viral') return `<li class="goal-li">📱 ${esc(v)}</li>`;
  if (t === 'lux') return `<li>${v >= 0 ? '💼 Yan işlerden gelir' : '💸 Lüks giderleri'}: ${E.fmt(v)}</li>`;
  return `<li>📌 ${esc(v)}</li>`;
}

// Önemli olayda Devam'a basınca önce gazete manşeti gelir
function next() {
  if (mode !== 'result' || GZ.acikMi()) return;
  if (bekleyenManset) {
    const m = bekleyenManset; bekleyenManset = null;
    GZ.goster(m, E.dateLabel(state.t), next);
    SFX.play('gazete');
    return;
  }
  if (state.ending) return showEnding();
  showCard(E.drawCard(state));
}

function askNewProject() {
  if (mode !== 'choose' || !E.canStartProject(state)) return;
  if (card && card.title === 'Yeni Proje') return;
  if (card) state.queue.unshift(card);
  showCard(E.newProjectCard(state, false));
}

function askFlee() {
  if (mode !== 'choose' || !E.canFlee(state)) return;
  if (card && card.phase === 'kacis') return;
  if (card) state.queue.unshift(card);
  showCard(E.fleeCard(state));
}

function onKey(e) {
  if (GZ.tus(e)) return;
  if (e.key === 'Escape' && PHONE.isOpen()) return PHONE.close();
  if (e.key === 'Escape') hidePick();
  if (PHONE.isOpen()) return;
  if (!$('modal').classList.contains('hidden') || !$('start').classList.contains('hidden') || !state) return;
  if (mode === 'choose' && /^[1-9]$/.test(e.key)) { const i = +e.key - 1; if (card && i < card.choices.length) choose(i); }
  else if (mode === 'result' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
}

// ---------- Sonlar ----------
let sonRozetler = [];
async function kartIndir() {
  if (!state || !state.ending) return;
  const btn = $('kartBtn'); btn.disabled = true;
  try {
    const blob = await sonKarti(state, { en: E.ENDINGS[state.ending], ahlak: E.ahlak(state), etiket: E.ahlakEtiket(E.ahlak(state)), unvan: E.unvan(state), rozetler: sonRozetler, net: E.fmt(E.netWorth(state)), vergi: E.fmt(state.vergi), tarih: E.dateLabel(state.t), basla: state.baslangic ? E.BASLANGIC[state.baslangic].ad : '' });
    const ad = `muteahhit-${(state.firma || 'kariyer').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '-')}.png`;
    const file = new File([blob], ad, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ files: [file], title: 'THE MÜTEAHHİT', text: 'Benim müteahhitlik kariyerim böyle bitti. Sen ne yapardın?' }).catch(() => {});
    } else {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }
    toast('📸 Kariyer kartın hazır');
  } catch (e) { console.warn(e); toast('Kart oluşturulamadı', 'bad'); }
  btn.disabled = false;
}
const END_KEY = 'muteahhit-endings-v1';
const readEndings = () => { try { return JSON.parse(localStorage.getItem(END_KEY) || '{}'); } catch { return {}; } };
function saveEnding(k) { try { const e = readEndings(); e[k] = (e[k] || 0) + 1; localStorage.setItem(END_KEY, JSON.stringify(e)); } catch { /* yok say */ } }

function showEnding() {
  const s = state, k = s.ending, en = E.ENDINGS[k];
  saveEnding(k);
  const gorulen = Object.keys(readEndings()).length;
  sonRozetler = [...(s.rozetler || []).map((id) => ROZ.ROZETLER.find((r) => r.id === id)).filter(Boolean), ...ROZ.kontrol(s, k, gorulen)];
  const oner = ROZ.oneri(s);
  const net = E.netWorth(s);
  // Önce en önemli 6 rakam; gerisi "Bütün rakamlar" altında
  const stats = [
    [E.dateLabel(s.t), 'Kariyerin sonu'], [s.completed, 'Tamamlanan proje'],
    [E.fmt(k === 'kacak' ? Math.max(net, s.kacirilan || 0) : net), k === 'kacak' ? 'Yanındaki para' : 'Net servet'],
    [s.m.toLocaleString('tr-TR'), 'Mağdur'], s.olu ? [s.olu, 'Can kaybı'] : [s.daireTeslim, 'Teslim edilen daire'], [Math.round(s.v), 'Vicdan'],
  ];
  const digerStats = [
    s.olu ? [s.daireTeslim, 'Teslim edilen daire'] : [s.olu, 'Can kaybı'], [E.fmt(s.vergi), 'Vergiden kaçırılan'], [s.cokme, 'Yıkılan bina'],
    [Object.keys(s.owned || {}).length, 'Lüks ve yan iş'], [(s.sins || []).length, 'Patlamamış dosya'], [Object.keys(s.goals || {}).length + '/' + E.GOALS.length, 'Hedef'],
  ];
  const kutu = (l) => l.map(([v, t]) => `<div><b>${v}</b><small>${t}</small></div>`).join('');
  const yarim = E.activeProjects(s).length;
  const dest = s.escape?.dest ? E.DEST[s.escape.dest] : null;
  const extra = [
    k === 'kacak' && dest ? `✈️ Şu an ${dest}'dasın. Yanında ${E.fmt(s.kacirilan || 0)} var. Arkanda ${s.m} mağdur.` : '',
    k === 'iade' && dest ? `🚨 ${dest} yolunda yakalandın. Kaçırmaya çalıştığın ${E.fmt(s.kacirilan || 0)} el konuldu.` : '',
    s.legacy ? `🏛️ ${E.LEGACY[s.legacy].text}` : '',
  ].filter(Boolean).map((x) => `<p class="legacy">${esc(x)}</p>`).join('');
  const a = E.ahlak(s);
  $('endingBody').innerHTML = `<div class="tone-${en.tone}"><p class="count">${esc(s.firma || '')} · ${E.unvan(s)}</p><h2>${en.title}</h2><p>${esc(en.text)}</p>${extra}
    <p class="count">Karnen: <b>${E.ahlakEtiket(a)}</b> (${a}/100)</p>
    ${yarim && (k === 'kacak' || k === 'iade' || k === 'iflas' || k === 'hapis') ? `<p><b>${yarim} proje yarım kaldı.</b> O binalarda oturmayı bekleyen aileler var.</p>` : ''}
    ${GZ.sonDers(k) ? `<p class="son-ders">${GZ.sonIyi(k) ? '💡' : '⚠️'} <b>Gerçek hayatta:</b> ${esc(GZ.sonDers(k))}</p>` : ''}
    ${sonRozetler.length ? `<div class="rozet-yeni"><p>🏅 Bu kariyerde kazandığın rozetler</p>${sonRozetler.map((r) => `<span class="rozet">${r.emoji} ${esc(r.ad)}</span>`).join('')}</div>` : ''}
    <p class="bir-tur">Rozetler: <b>${Object.keys(ROZ.kazanilan()).length}/${ROZ.ROZETLER.length}</b> · Sonlar: <b>${gorulen}/${Object.keys(E.ENDINGS).length}</b>${oner ? `<br>Sıradaki rozet: ${oner.emoji} <b>${esc(oner.ad)}</b> — ${esc(oner.nasil)}` : ''}</p>
    <div class="stat-grid">${kutu(stats)}</div>
    <details class="stat-diger"><summary>Bütün rakamlar</summary><div class="stat-grid">${kutu(digerStats)}</div></details>
    <details class="stat-diger kontrol5"><summary>🏠 Ev alırken 5 kontrol</summary><ol>
      <li>Tapu kaydını e-Devlet'ten kendin bak: ipotek, haciz, şerh var mı?</li>
      <li>Yapı ruhsatını ve iskân belgesini belediyeden doğrula.</li>
      <li>Satış vaadi sözleşmesini noterde yap, tapuya şerh ettir.</li>
      <li>Parayı işin ilerlemesine göre öde; peşin toplu para verme.</li>
      <li>Müteahhidin eski binalarını gez, hakkındaki davaları araştır.</li></ol></details>
    <p class="disclaimer">Oyundaki her yöntemin gerçek hayattaki karşılığını ve nasıl korunacağınızı Farkındalık Rehberi'nde bulabilirsiniz.</p></div>`;
  $('ending').classList.remove('hidden');
}

// ---------- Modaller ----------
function openModal(which) {
  let h = '';
  if (which === 'nasil') {
    h = `<h2>Nasıl Oynanır</h2>
    <ul class="nasil-liste">
    <li>🃏 <b>Her kart bir ay.</b> Seç, sonra ne olduğunu gör. Sonuçlar önceden yazmaz.</li>
    <li>🏗️ <b>Bir bina:</b> arsa → yatırımcı → inşaat → satış → teslim.</li>
    <li>📊 <b>Üstteki çubuklar:</b> itibar, yatırımcı, ekip, hukuki risk, vicdan.</li>
    <li>🗄️ <b>Kirli işler dosyaya girer.</b> Yıllar sonra biri kapını çalabilir.</li>
    <li>🌍 <b>Deprem gelir.</b> Kötü yapılan bina yıkılır; bedelini insanlar öder.</li>
    <li>🛥️ <b>Hayatım:</b> araba, villa, yan işler. Her biri yeni fırsat ve yeni tuzak.</li>
    <li>✈️ <b>Risk büyürse "Kaç" düğmesi çıkar.</b></li>
    <li>🏁 <b>12 farklı son var.</b> Kötü yol da kazanabilir ama bedeli görünür.</li>
    </ul>
    <p class="count">⌨️ 1-4 seç, Enter devam · 📱 Seçeneği yana kaydır</p>`;
  } else if (which === 'rehber') {
    h = `<h2>Farkındalık Rehberi</h2><p class="count">Oyundaki hileler ve gerçek hayatta nasıl korunursun. Genel bilgidir; somut durumda avukata danış.</p>
    ${REHBER.map((r) => `<div class="rehber-item"><h3>${esc(r.t)}</h3><p class="korun">🛡️ ${esc(r.k)}</p><details><summary>Nasıl yapılıyor?</summary><p>${esc(r.x)}</p></details></div>`).join('')}
    <h3>Kaynaklar</h3><ul>${KAYNAKLAR.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>`;
  } else if (which === 'rozetler') {
    const k = ROZ.kazanilan();
    h = `<h2>Rozetler (${Object.keys(k).length}/${ROZ.ROZETLER.length})</h2><p class="count">Rozetler bu tarayıcıda saklanır; her yeni kariyerde birikir.</p><div class="endings-grid">${ROZ.ROZETLER.map((r) =>
      `<div class="end-card${k[r.id] ? '' : ' locked'}"><b>${k[r.id] ? r.emoji : '🔒'} ${esc(r.ad)}</b>${esc(r.nasil)}</div>`).join('')}</div>`;
  } else if (which === 'sonlar') {
    const got = readEndings();
    const n = Object.keys(E.ENDINGS).filter((k) => got[k]).length;
    h = `<h2>Sonlar (${n}/${Object.keys(E.ENDINGS).length})</h2><div class="endings-grid">${Object.entries(E.ENDINGS).map(([k, en]) =>
      got[k] ? `<div class="end-card"><b>${en.title}</b>${got[k]} kez</div>` : `<div class="end-card locked"><b>???</b>Henüz görülmedi</div>`).join('')}</div>`;
  }
  $('modalBody').innerHTML = h;
  $('modal').classList.remove('hidden');
  $('modal').scrollTop = 0;
}

window.muteahhit = { get state() { return state; }, show: (c) => showCard(c) };
boot();
