// THE MÜTEAHHİT — arayüz akışı.
import * as E from './engine.js';
import * as S3 from './scene3d.js';
import { REHBER, KAYNAKLAR } from './data/rehber.js';
import { reactionFor } from './data/dialect.js';
import { FIRMA_ADLARI } from './data/lux.js';
import * as SFX from './sfx.js';
import * as PHONE from './phone.js';
import * as MINI from './mini.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let state = null, card = null, mode = 'choose', sceneOk = false;

const STATS = [
  ['i', 'İtibar', '#46a758', false], ['g', 'Yatırımcı', '#3e8ed0', false], ['e', 'Ekip', '#f4c20d', false],
  ['r', 'Hukuki risk', '#e5484d', true], ['v', 'Vicdan', '#b48ce0', false],
];
const LBL = { n: 'Kasa', b: 'Borç', i: 'İtibar', g: 'Yatırımcı güveni', e: 'Ekip', r: 'Hukuki risk', v: 'Vicdan', k: 'Kalite', p: 'İlerleme', m: 'Mağdur', d: 'Gecikme', s: 'Arsa sahibi memnuniyeti', h: 'Arsa sahibi payı', o: 'Ön satış', x: 'Vergiden kaçırılan', y: 'Yatırımcı parası', a: 'Piyasa' };
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
  $('yeniBtn').onclick = () => startGame(false);
  $('devamKariyerBtn').onclick = () => startGame(true);
  $('yenidenBtn').onclick = () => { $('ending').classList.add('hidden'); startGame(false); };
  document.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => openModal(b.dataset.open)));
  $('modalClose').onclick = () => $('modal').classList.add('hidden');
  $('modal').onclick = (e) => { if (e.target.id === 'modal') $('modal').classList.add('hidden'); };
  $('menuBtn').onclick = () => { E.save(state); $('start').classList.remove('hidden'); $('devamKariyerBtn').classList.remove('hidden'); };
  $('devamBtn').onclick = next;
  $('yeniProjeBtn').onclick = askNewProject;
  $('kacBtn').onclick = askFlee;
  $('sideToggle').onclick = () => $('side').classList.toggle('closed');
  if (window.innerWidth <= 860) $('side').classList.add('closed');
  document.querySelectorAll('.side-tabs button').forEach((b) => (b.onclick = () => {
    document.querySelectorAll('.side-tabs button').forEach((x) => x.classList.toggle('active', x === b));
    for (const t of ['projeler', 'hayat', 'gunluk']) $(t).classList.toggle('hidden', b.dataset.tab !== t);
  }));
  document.addEventListener('keydown', onKey);
  MINI.init({ sfx: (n) => SFX.play(n) });
  PHONE.init({ state: () => state, afterChange, toast, floatMoney, deltaChips, eventLine, sfx: (n) => SFX.play(n) });
}

function startGame(resume) {
  $('start').classList.add('hidden');
  $('hud').classList.remove('hidden');
  const saved = resume ? E.load() : null;
  if (saved && !saved.ending) {
    state = saved;
    Object.assign(state, { owned: state.owned || {}, sins: state.sins || [], arcs: state.arcs || {}, arcT: state.arcT || {}, goals: state.goals || {}, firma: state.firma || 'Güven Yapı' });
    state.queue = (state.queue || []).map((c) => (c.quake ? E.quakeCard(state, c.quake, c.big) : c));
    card = E.drawCard(state);
  } else {
    E.clearSave();
    state = E.newGame();
    const f = $('firmaInput').value.trim() || $('firmaInput').placeholder;
    state.firma = f;
    try { localStorage.setItem('muteahhit-firma', $('firmaInput').value.trim()); } catch { /* yok say */ }
    card = introCard();
  }
  if (sceneOk) S3.sync(state);
  render();
  showCard(card);
}

function introCard() {
  return {
    kind: 'sys', phase: 'sistem', title: `${E.dateLabel(0)} — Kariyerin Başlıyor`, noStep: true,
    speaker: { emoji: '👴', name: 'Rahmetli babanın sözü', label: '', roleLabel: '', quote: 'Oğlum, bina dediğin içinde insan yaşayacak yerdir. Parayı kazanırsın, adını bir kere kaybedersen bulamazsın.' },
    text: 'Elinde babandan kalma bir kamyonet, bir kalfalık tecrübesi ve 8 milyon lira var. Şehir büyüyor, eski evler yıkılıyor, herkes müteahhit olmak istiyor. Arsa sahipleriyle anlaş, yatırımcı bul, binanı dik, sat. Sözünü tutabilirsin… ya da tutmayabilirsin.',
    ders: 'Bu oyundaki her senaryo, gerçek hayatta yaşanmış ya da haberlere yansımış bir yöntemden esinlenir. Her seçimden sonra, o yöntemin gerçek hayattaki karşılığını ve nasıl korunacağınızı göreceksiniz.',
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
  $('stats').innerHTML = STATS.map(([k, l, c, inv]) => {
    const v = Math.round(s[k]);
    const col = inv ? (v > 70 ? '#e5484d' : v > 40 ? '#f4a20d' : '#46a758') : c;
    return `<div class="stat" id="st-${k}"><div class="lbl"><span>${l}</span><b>${v}</b></div><div class="bar"><i style="width:${v}%;background:${col}"></i></div></div>`;
  }).join('');
  renderProjects();
  PHONE.badge();
  $('gunluk').innerHTML = s.log.map((l) => `<div class="log-line">${esc(l)}</div>`).join('') || '<p class="log-line">Henüz bir şey olmadı.</p>';
  const news = [...s.news, ...FACTS];
  const tt = news.map((n) => `● ${n}`).join('     ');
  if ($('tickerText').textContent !== tt) $('tickerText').textContent = tt;
  $('kacBtn').classList.toggle('hidden', !E.canFlee(s));
  $('yeniProjeBtn').disabled = !E.canStartProject(s);
  $('yeniProjeBtn').title = E.canStartProject(s) ? '' : `Aynı anda en fazla ${E.maxConcurrent(s)} proje yürütebilirsin (bitirdikçe artar).`;
}

function setMoney(id, v, debt) {
  $(id).textContent = debt ? E.fmt(-v) : E.fmt(v);
  $(id).className = v < 0 ? 'neg' : '';
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

function afterChange() {
  if (sceneOk) S3.sync(state);
  render();
  if (!state.ending) E.save(state);
}

function toast(txt, cls = '') {
  const d = document.createElement('div');
  d.className = `toast ${cls}`; d.textContent = txt;
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

function showCard(c) {
  card = c; mode = 'choose';
  const proj = c.projId != null ? state.projects.find((p) => p.id === c.projId) : null;
  $('card').style.animation = 'none'; void $('card').offsetWidth; $('card').style.animation = '';
  $('cardPhase').textContent = E.PHASE_LABEL[c.phase] || c.phase;
  $('cardPhase').className = `tag ${c.phase}`;
  $('cardProj').textContent = proj ? `${proj.name} · ${proj.semt}` : E.dateLabel(state.t);
  $('cardTitle').textContent = c.title;
  const ban = c.banner || BANNER[c.phase];
  $('cardBanner').textContent = ban ? `🔴 ${ban}` : '';
  $('cardBanner').classList.toggle('hidden', !ban);
  const sp = c.speaker;
  $('speaker').classList.toggle('hidden', !sp);
  if (sp) {
    $('spEmoji').textContent = sp.emoji || '🗣️';
    $('spName').textContent = sp.name;
    $('spMeta').textContent = [sp.roleLabel, sp.label].filter(Boolean).join(' · ');
    $('spQuote').textContent = `“${sp.quote}”`;
  }
  $('cardText').textContent = c.text;
  $('cardTwist').textContent = c.twist ? `⚠ ${c.twist}` : '';
  $('cardTwist').classList.toggle('hidden', !c.twist);
  $('choices').innerHTML = '';
  c.choices.forEach((ch, i) => {
    const b = document.createElement('button');
    const isMini = ch.act?.type === 'mini' || ch.act?.mini;
    const risky = !isMini && (ch.act?.type === 'gamble' || (ch.act?.type === 'esc' && (ch.act.end || ch.act.risk)));
    b.innerHTML = `<b>${i + 1}.</b> ${isMini ? '🎮 ' : ''}${esc(ch.label)}${risky && !/🎲/.test(ch.label) ? ' 🎲' : ''}`;
    if (risky) b.classList.add('risky');
    if (isMini) b.classList.add('minich');
    b.onclick = () => choose(i);
    $('choices').appendChild(b);
  });
  $('choices').classList.remove('hidden');
  $('resultBox').classList.add('hidden');
  $('card').scrollTop = 0;
  if (proj && sceneOk && window.innerWidth > 860) S3.focus(proj);
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
  $('reaction').classList.toggle('hidden', !rx);
  if (rx) { $('rxEmoji').textContent = c.speaker.emoji; $('rxQuote').innerHTML = `<b>${esc(c.speaker.name)}:</b> “${esc(rx)}”`; $('reaction').className = `speaker reaction ${mood >= 0 ? 'good' : 'bad'}`; }
  $('choices').classList.add('hidden');
  $('resultBox').classList.remove('hidden');
  $('resultText').textContent = (mini.score != null ? `🎮 ${Math.round(mini.score * 100)}/100 — ` : '') + (res.gamble === true ? '🎲 TUTTU! ' : res.gamble === false ? '🎲 TUTMADI! ' : '') + res.result;
  $('deltas').innerHTML = deltaChips(res.deltas);
  $('events').innerHTML = res.events.filter((e) => e[0] !== 'faiz').map(eventLine).join('');
  $('ders').innerHTML = c.ders ? `💡 <b>Gerçek hayatta:</b> ${esc(c.ders)}` : '';
  $('ders').classList.toggle('hidden', !c.ders);
  $('devamBtn').textContent = state.ending ? 'Sonu gör ▸' : 'Devam ▸';
  // Sıradaki ayın merak uyandıran fragmanı
  $('teaser').classList.add('hidden');
  if (!state.ending) {
    const nx = E.drawCard(state);
    state.queue.unshift(nx);
    const who = nx.speaker ? `${nx.speaker.emoji} ${nx.speaker.name}` : '📞 Telefon çalıyor';
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
  if (sceneOk && res.events.some((e) => e[0] === 'info' && /tamamlandı!/.test(e[1]))) S3.fireworks?.(state);
  if (sceneOk) {
    if (c.quake) {
      const col = (state.lastQuake?.collapsed || []).map((p) => p.id);
      S3.quake(c.quake, col, () => S3.sync(state));
    } else S3.sync(state);
    if (state.ending === 'kacak' || state.ending === 'iade') S3.flyPlane();
  }
  delete state.lastQuake;
  render();
  for (const [k] of STATS) if (Math.round(before[k]) !== Math.round(state[k])) $(`st-${k}`)?.classList.add('flash');
  if (state.ending) E.clearSave(); else E.save(state);
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
    out.push(`<span class="chip ${good === null ? '' : good ? 'good' : 'bad'}">${LBL[k]} ${k === 'o' ? '' : sign}${val}</span>`);
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

function next() {
  if (mode !== 'result') return;
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
  if (e.key === 'Escape' && PHONE.isOpen()) return PHONE.close();
  if (PHONE.isOpen()) return;
  if (!$('modal').classList.contains('hidden') || !$('start').classList.contains('hidden') || !state) return;
  if (mode === 'choose' && /^[1-9]$/.test(e.key)) { const i = +e.key - 1; if (card && i < card.choices.length) choose(i); }
  else if (mode === 'result' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
}

// ---------- Sonlar ----------
const END_KEY = 'muteahhit-endings-v1';
const readEndings = () => { try { return JSON.parse(localStorage.getItem(END_KEY) || '{}'); } catch { return {}; } };
function saveEnding(k) { try { const e = readEndings(); e[k] = (e[k] || 0) + 1; localStorage.setItem(END_KEY, JSON.stringify(e)); } catch { /* yok say */ } }

function showEnding() {
  const s = state, k = s.ending, en = E.ENDINGS[k];
  saveEnding(k);
  const net = E.netWorth(s);
  const stats = [
    [E.dateLabel(s.t), 'Kariyerin sonu'], [s.completed, 'Tamamlanan proje'], [s.daireTeslim, 'Teslim edilen daire'],
    [E.fmt(k === 'kacak' ? Math.max(net, s.kacirilan || 0) : net), k === 'kacak' ? 'Yanındaki para' : 'Net servet'],
    [s.m.toLocaleString('tr-TR'), 'Mağdur'], [E.fmt(s.vergi), 'Vergiden kaçırılan'],
    [s.cokme, 'Yıkılan bina'], [s.olu, 'Can kaybı'], [Math.round(s.v), 'Vicdan'],
    [Object.keys(s.owned || {}).length, 'Lüks ve yan iş'], [(s.sins || []).length, 'Patlamamış dosya'], [Object.keys(s.goals || {}).length + '/' + E.GOALS.length, 'Hedef'],
  ];
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
    <div class="stat-grid">${stats.map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join('')}</div>
    <p class="disclaimer">Oyundaki her yöntemin gerçek hayattaki karşılığını ve nasıl korunacağınızı Farkındalık Rehberi'nde bulabilirsiniz.</p></div>`;
  $('ending').classList.remove('hidden');
}

// ---------- Modaller ----------
function openModal(which) {
  let h = '';
  if (which === 'nasil') {
    h = `<h2>Nasıl Oynanır</h2>
    <p>2012'de küçük bir müteahhit olarak başlarsın. Her kart bir aydır. Seçimlerin kasanı, itibarını, yatırımcı güvenini, ekibini, hukuki riskini ve vicdanını değiştirir. Seçimlerin sonuçları seçmeden önce gösterilmez: tıpkı gerçek hayatta olduğu gibi.</p>
    <h3>Bir projenin yolculuğu</h3>
    <ol><li><b>Arsa sahipleri:</b> kat karşılığı pazarlık, vekalet, sözleşme maddeleri.</li>
    <li><b>Yatırımcı:</b> inşaatı finanse edecek parayı bul. Yatırımcılara verdiğin söz bir sonraki projede önüne gelir.</li>
    <li><b>İnşaat:</b> usta bul, hakedişleri öde (ya da ödeme), betonu seç. Ön satış yaptıysan kaliteyi düşürmek cazip gelir.</li>
    <li><b>Satış:</b> yağla, pulla, tapuda değeri düşük göster… ya da gösterme.</li>
    <li><b>Teslim:</b> anahtarlar, arsa sahipleri ve yatırımcılarla hesaplaşma.</li></ol>
    <h3>Çark</h3>
    <p>Projeler bittikçe aynı anda daha fazla işe girebilirsin (Yeni Proje). Kasa eksiye düşerse bir işin parasını diğerine aktarmaya başlarsın. Hukuki risk ya da borç çok yükselirse <b>Kaç</b> düğmesi belirir.</p>
    <h3>Hayatın</h3><p><b>Hayatım</b> sekmesinden Mercedes, villa, yat alabilir; galeri, düğün salonu, beton santrali, otel, TV kanalı gibi yan işler kurabilirsin. Her biri yeni olaylar ve yeni kirli fırsatlar getirir.</p>
    <h3>Dolaptaki iskeletler</h3><p>Vicdansız kararların bazıları dosyaya girer (🗄️). Yıllar sonra bir gazeteci, eski bir usta ya da müfettiş kapını çalabilir.</p>
    <h3>Kaçış ve son perde</h3><p>Kaçmaya karar verirsen dört adımlı bir kaçış operasyonu başlar: parayı topla, sınırdan geçir, rota seç, pasaport kontrolünden geç. Zengin olursan son perdede hesap günü ve miras kararı seni bekler.</p>
    <h3>Deprem</h3><p>Yaptığın binalar yıllar sonra bir depremde sınanır. Kalite düşükse, bunun bedelini insanlar öder; oyun da bunu hatırlatır.</p>
    <h3>Sonlar</h3><p>12 farklı son var: dürüst patron, dokunulmaz baron, kaçak, kırmızı bülten, cezaevi, iflas ve dahası. Kötü seçimler de kazanabilir. Kısayollar: 1-4 seçim, Enter devam.</p>`;
  } else if (which === 'rehber') {
    h = `<h2>Farkındalık Rehberi</h2><p>Oyundaki çakallıklar ve gerçek hayatta nasıl korunacağınız. Bu bilgiler genel bilgilendirme amaçlıdır; somut durumlarda bir avukata danışın.</p>
    ${REHBER.map((r) => `<div class="rehber-item"><h3>${esc(r.t)}</h3><p>${esc(r.x)}</p><p class="korun">🛡️ ${esc(r.k)}</p></div>`).join('')}
    <h3>Kaynaklar</h3><ul>${KAYNAKLAR.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>`;
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
