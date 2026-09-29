// TELEFON — müteahhidin cebindeki kurgusal sosyal medya uygulaması "Harç".
import * as E from './engine.js';
import * as SOS from './sosyal.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let api = null, tab = 'akis', sonuc = null;

// Fotoğraf yerine kullanılan sahneler: arka plan + büyük emoji + küçük yazı
const IMG = {
  insaat: ['linear-gradient(160deg,#6aa7d8,#c9dcef 60%,#8a7458 61%)', '🏗️', 'şantiye · bugün'],
  olmedik: ['linear-gradient(160deg,#1b1b1b,#3a2a12)', '🦁', 'BİZ DAHA ÖLMEDİK'],
  araba: ['linear-gradient(160deg,#20252e,#5b6475 70%,#2a2f38 71%)', '🚘', '#başarı'],
  villa: ['linear-gradient(160deg,#79c6f2,#e8f6ff 55%,#4cb3d9 56%)', '🏡', '#villalife'],
  yat: ['linear-gradient(180deg,#ffb36b,#ff7a59 40%,#1d6fa5 41%)', '🛥️', 'mavi tur'],
  bayram: ['linear-gradient(160deg,#0e2a47,#1f4f7a)', '🌙', 'iyi bayramlar'],
  teslim: ['linear-gradient(160deg,#f7d774,#f4a20d)', '🔑', 'anahtar teslim'],
  rapor: ['linear-gradient(160deg,#f3f4f6,#d9dde3)', '📄', 'beton test raporu'],
  kampanya: ['linear-gradient(160deg,#e5484d,#ff9a3c)', '🔥', 'SON 3 DAİRE · %35'],
  aciklama: ['linear-gradient(160deg,#1f2530,#394355)', '⚖️', 'KAMUOYUNA DUYURU'],
  ozur: ['linear-gradient(160deg,#2f5d46,#46a758)', '🤝', 'ödeme takvimi'],
  fenomen: ['linear-gradient(160deg,#ff8fc7,#b48ce0)', '🤳', '#işbirliği'],
  haber: ['linear-gradient(160deg,#2a0f10,#7a1c20)', '📰', 'SON DAKİKA'],
};

export function init(o) {
  api = o;
  $('phoneBtn').onclick = open;
  $('phoneClose').onclick = close;
  $('phone').onclick = (e) => { if (e.target.id === 'phone') close(); };
  document.querySelectorAll('#phone .ph-tabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.t; sonuc = null; draw(); }));
}

export function open() {
  const s = api.state(); if (!s) return;
  SOS.ensure(s).okunmadi = 0;
  $('phone').classList.remove('hidden');
  api.sfx && api.sfx('click');
  draw(); badge();
}
export function close() { $('phone').classList.add('hidden'); sonuc = null; badge(); }
export const isOpen = () => !$('phone').classList.contains('hidden');

export function badge() {
  const s = api && api.state(); if (!s) return;
  const so = SOS.ensure(s);
  const n = so.okunmadi + (SOS.canPost(s) && s.t > 0 ? 1 : 0);
  $('phoneBadge').textContent = so.okunmadi > 9 ? '9+' : so.okunmadi || '•';
  $('phoneBadge').classList.toggle('hidden', !n);
  $('phoneBadge').classList.toggle('dot', !so.okunmadi);
}

function draw() {
  const s = api.state(); const so = SOS.ensure(s);
  $('phClock').textContent = E.dateLabel(s.t);
  document.querySelectorAll('#phone .ph-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.t === tab));
  const body = $('phBody');
  if (sonuc) body.innerHTML = sonucHtml(s);
  else if (tab === 'akis') body.innerHTML = trends(s, so) + akis(s, so);
  else if (tab === 'paylas') body.innerHTML = paylas(s);
  else if (tab === 'profil') body.innerHTML = profil(s, so);
  else body.innerHTML = reklam(s, so);
  body.scrollTop = 0;
  body.querySelectorAll('[data-post]').forEach((b) => (b.onclick = () => doPost(b.dataset.post)));
  body.querySelectorAll('[data-ad]').forEach((b) => (b.onclick = () => doAd(b.dataset.ad)));
  body.querySelectorAll('[data-more]').forEach((b) => (b.onclick = () => { b.parentElement.classList.add('open'); b.remove(); }));
  const g = body.querySelector('[data-geri]'); if (g) g.onclick = () => { sonuc = null; tab = 'akis'; draw(); };
}

// ---------- Akış ----------
function trends(s, so) {
  const t = [];
  if (so.tapu > 150) t.push(['#TapumuVer', SOS.fmtK(so.tapu), true]);
  const y = E.yearOf(s.t);
  if (s.market > 1.15) t.push(['#KonutFiyatları', SOS.fmtK(12000 + s.t * 90)]);
  if (y >= 2018 && y <= 2019) t.push(['#Kur', SOS.fmtK(48000)]);
  if (y === 2020) t.push(['#EvdeKal', SOS.fmtK(210000)]);
  if (y >= 2023) t.push(['#DepremGerçeği', SOS.fmtK(91000)]);
  if (y === 2012 || y === 2013) t.push(['#KentselDönüşüm', SOS.fmtK(8200)]);
  t.push(['#' + slug(s.firma), SOS.fmtK(Math.max(40, so.takipci / 20))]);
  return `<div class="ph-trends">${t.map(([a, b, hot]) => `<span class="${hot ? 'hot' : ''}">${esc(a)} <small>${b}</small></span>`).join('')}</div>`;
}
const slug = (t) => String(t || 'Firma').replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/g, '');
const ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', i̇: 'i' };
const handle = (s) => '@' + slug(s.firma).toLocaleLowerCase('tr-TR').replace(/[çğıöşü]/g, (c) => ASCII[c]).replace(/[^a-z0-9]/g, '').replace(/insaat$/, '') + '.insaat';

function akis(s, so) {
  // Kendi paylaşımların + gündemdeki haberler (haber hesabından) tarihe göre karışık
  const list = so.posts.map((p) => ({ p, t: p.t, k: p.id }));
  (s.news || []).slice(0, 3).forEach((n, i) => list.push({ haber: n, t: s.t - i, k: -i }));
  list.sort((a, b) => b.t - a.t || b.k - a.k);
  if (!so.posts.length) list.unshift({ bos: true, t: s.t });
  return list.map((x) => x.bos ? bosHtml() : x.haber ? haberHtml(s, x.haber, x.t) : postHtml(s, x.p)).join('');
}

function bosHtml() {
  return `<div class="ph-empty">📭 Henüz hiç paylaşım yapmadın.<br><button class="primary" data-tabgo>Hemen paylaş ▸</button></div>`;
}

function haberHtml(s, n, t) {
  return `<article class="ph-post news">
    <header><span class="av">📰</span><div><b>Gündem Haber</b> <i class="tick">✔</i><small>@gundem_haber · ${SOS.tarihEtiket(s, t)}</small></div></header>
    <p>${esc(n)}</p></article>`;
}

function photo(img, cap) {
  const [bg, emo, txt] = IMG[img] || IMG.insaat;
  return `<div class="ph-photo" style="background:${bg}"><span>${emo}</span><em>${esc(cap || txt)}</em></div>`;
}

function postHtml(s, p) {
  const ayca = p.yazar === 'ayca';
  const name = ayca ? 'Ayça ✨' : esc(s.firma);
  const h = ayca ? '@ayca.yasam' : handle(s);
  const av = ayca ? '💁‍♀️' : '🏗️';
  const ym = p.yorumlar || [];
  const cm = ym.slice(0, 3).map(yorumHtml).join('');
  const rest = ym.slice(3).map(yorumHtml).join('');
  return `<article class="ph-post${p.ifsa ? ' ifsa' : ''}${p.viral ? ' viral' : ''}">
    <header><span class="av">${av}</span><div><b>${name}</b>${ayca ? ' <i class="tick">✔</i>' : ''}<small>${h} · ${SOS.tarihEtiket(s, p.t)}</small></div>
      ${p.viral && !p.linc ? '<span class="pill ok">🔥 Viral</span>' : ''}${p.linc ? '<span class="pill bad">😡 Linç</span>' : ''}${p.gizliReklam ? '<span class="pill bad">Gizli reklam</span>' : ''}</header>
    <div class="ph-media">${photo(p.img)}${p.ifsa ? '<div class="stamp">📸 EKRAN GÖRÜNTÜSÜ ALINDI</div>' : ''}</div>
    <div class="ph-acts"><span>❤️ ${SOS.fmtK(p.likes)}</span><span>💬 ${ym.length}</span><span>🔁 ${SOS.fmtK(p.paylas || 0)}</span></div>
    <p>${esc(p.text)}</p>
    ${p.not ? `<div class="ph-note"><b>👥 Mahalle Notu</b>${esc(p.not)}</div>` : ''}
    <div class="ph-cm">${cm}${rest ? `<button class="more" data-more>${ym.length - 3} yorum daha…</button><div class="rest">${rest}</div>` : ''}</div>
  </article>`;
}

function yorumHtml(c) {
  return `<div class="c ${c.rol}"><span>${c.emoji}</span><div><b>@${esc(c.h)}</b> ${esc(c.text)}${c.likes ? `<small>❤️ ${c.likes}</small>` : ''}</div></div>`;
}

// ---------- Paylaş ----------
function paylas(s) {
  const can = SOS.canPost(s);
  const av = SOS.available(s);
  const head = can ? `<div class="ph-hint">Bu ay <b>1 paylaşım</b> hakkın var. Seç, paylaş. <br><small>⚠ işaretliler gerçeği yansıtmıyor: ekran görüntüsü alınabilir.</small></div>`
    : `<div class="ph-hint">Bu ay zaten paylaştın. Yeni ay gelince tekrar paylaşabilirsin.</div>`;
  return head + av.map((a) => `<div class="ph-compose${a.yalan ? ' lie' : ''}">
    <div class="top"><span class="ic">${a.ikon}</span><b>${esc(a.ad)}</b>${a.yalan ? '<span class="pill bad">⚠ Gerçek değil</span>' : a.flex ? '<span class="pill warn">Gösteriş</span>' : ''}</div>
    <p>${esc(a.preview)}</p>
    <button class="${a.yalan ? 'danger' : 'primary'}" data-post="${a.id}" ${can ? '' : 'disabled'}>Paylaş</button></div>`).join('');
}

function doPost(id) {
  const s = api.state();
  const r = E.sosyalPost(s, id);
  if (!r) return;
  api.sfx && api.sfx(r.post.linc ? 'bad' : r.post.viral ? 'goal' : 'ping');
  sonuc = { r, kind: 'post' };
  api.afterChange();
  if (r.deltas.some((d) => d[0] === 'n')) api.floatMoney(r.deltas.filter((d) => d[0] === 'n').reduce((a, d) => a + d[1], 0));
  draw();
}

function sonucHtml(s) {
  const { r } = sonuc;
  const p = r.post;
  return `<div class="ph-hint">${p ? '✅ Paylaşıldı.' : '✅ Tamam.'}</div>
    ${p ? postHtml(s, p) : ''}
    ${r.deltas.length ? `<div class="deltas">${api.deltaChips(r.deltas)}</div>` : ''}
    ${r.events.length ? `<div class="events">${r.events.map(api.eventLine).join('')}</div>` : ''}
    ${r.ders ? `<div class="ders">💡 <b>Gerçek hayatta:</b> ${esc(r.ders)}</div>` : ''}
    <button class="primary wide" data-geri>Akışa dön ▸</button>`;
}

// ---------- Profil ----------
function profil(s, so) {
  const top = SOS.toplamTakipci(s);
  const oran = SOS.sahteOran(s);
  const ifsa = so.posts.filter((p) => p.ifsa).length;
  const grid = so.posts.filter((p) => !p.yazar).slice(0, 9).map((p) => {
    const [bg, emo] = IMG[p.img] || IMG.insaat;
    return `<div style="background:${bg}">${emo}${p.ifsa ? '<i>📸</i>' : ''}</div>`;
  }).join('');
  return `<div class="ph-prof">
    <div class="av big">🏗️</div><h3>${esc(s.firma)}</h3><small>${handle(s)} · ${esc(E.unvan(s))}</small>
    <div class="nums"><div><b>${so.posts.filter((p) => !p.yazar).length}</b><small>gönderi</small></div><div><b>${SOS.fmtK(top)}</b><small>takipçi</small></div><div><b>${Math.round(so.hype * 1000) / 10}%</b><small>satışa etki</small></div></div>
    <p class="bio">🏢 ${s.completed} proje teslim · 🏠 ${s.daireTeslim} daire<br>"Güvenin adresi" ${s.m > 10 ? '<span class="neg">· ' + s.m + ' mağdur</span>' : ''}</p>
    ${oran > 0.05 ? `<div class="ph-note"><b>🤖 Takipçi analizi</b>Takipçilerin tahminen %${Math.round(oran * 100)}'i sahte hesap.</div>` : ''}
    ${ifsa ? `<div class="ph-note bad"><b>📸 İfşa</b>${ifsa} paylaşımının ekran görüntüsü alınıp yalanlandı.</div>` : ''}
    ${so.tapu > 150 ? `<div class="ph-note bad"><b>✊ #TapumuVer</b>${SOS.fmtK(so.tapu)} gönderi. Mağdurlar her gün etiketliyor.</div>` : ''}
    <div class="ph-grid">${grid || '<small>Henüz gönderi yok.</small>'}</div></div>`;
}

// ---------- Reklam ----------
function reklam(s, so) {
  return `<div class="ph-hint">Takipçi ve reklam, satış fiyatına küçük bir itme verir. Ama sahte olanın bedeli ağır olabilir.</div>` +
    SOS.REKLAM.map((r) => `<div class="ph-compose ${r.id === 'bot' ? 'lie' : ''}"><div class="top"><span class="ic">${r.ikon}</span><b>${esc(r.ad)}</b><span class="pill warn">${E.fmt(r.fiyat(s))}</span></div>
      <p>${esc(r.a)}</p><button class="${r.id === 'bot' ? 'danger' : 'primary'}" data-ad="${r.id}" ${s.n < r.fiyat(s) ? 'disabled' : ''}>Satın al</button></div>`).join('');
}

function doAd(id) {
  const s = api.state();
  const r = E.sosyalReklam(s, id);
  if (!r) return;
  if (r.hata) { api.toast(r.hata); return; }
  api.sfx && api.sfx('coin');
  sonuc = { r: { ...r, post: id === 'fenomen' ? SOS.ensure(s).posts[0] : null }, kind: 'ad' };
  api.afterChange();
  api.floatMoney(r.deltas.filter((d) => d[0] === 'n').reduce((a, d) => a + d[1], 0));
  draw();
}

// "Hemen paylaş" düğmesi (boş akış)
document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-tabgo]')) { tab = 'paylas'; draw(); } });
