// THE MÜTEAHHİT — oyun motoru: durum, senaryo havuzu, etkiler, projeler, sonlar.
import ARSA from './data/arsa.js';
import YATIRIM from './data/yatirim.js';
import INSAAT from './data/insaat.js';
import SATIS from './data/satis.js';
import GENEL from './data/genel.js';
import { CARK, KACIS, TESLIM } from './data/cark.js';
import HAYAT from './data/hayat.js';
import { INSAAT_EK, YATIRIM_EK, ARSA_EK, SATIS_EK, CARK_EK } from './data/ek.js';
import { NAMES, SEMTLER, PROJE_ADLARI, TWISTS } from './data/names.js';
import { LUX } from './data/lux.js';
import { speakerFor, sp as spk, dialectFor } from './data/dialect.js';
import { ARSA_OZ, ARSA_KIM } from './data/arsaoz.js';
import { BASLANGIC, BASLA_ARCS } from './data/basla.js';
import { YENI_ARSA, YENI_YATIRIM, YENI_INSAAT, YENI_SATIS, YENI_TESLIM, YENI_GENEL, YENI_ARCS, REGION, kurSokuCard } from './data/yeni.js';
import { ARCS as ESKI_ARCS, ghostCard, escapeCard, hesapCard, mirasCard, GOALS, LEGACY, DEST } from './data/hikaye.js';
import * as SOS from './sosyal.js';
import { betonCard, denetimCard, pazarlikCard, tapuCard as tapuMiniCard } from './data/mini.js';
const ARCS = [...ESKI_ARCS, ...YENI_ARCS, ...BASLA_ARCS];
export { LUX, GOALS, LEGACY, DEST, ARCS, REGION, BASLANGIC };

export const TEMPLATES = {
  arsa: [...ARSA, ...ARSA_EK, ...YENI_ARSA], yatirim: [...YATIRIM, ...YATIRIM_EK, ...YENI_YATIRIM], insaat: [...INSAAT, ...INSAAT_EK, ...YENI_INSAAT],
  satis: [...SATIS, ...SATIS_EK, ...YENI_SATIS], teslim: [...TESLIM, ...YENI_TESLIM], cark: [...CARK, ...CARK_EK], kacis: KACIS, genel: [...GENEL, ...YENI_GENEL], hayat: HAYAT,
};
export const VARIANTS = 5;
export const PHASE_LABEL = { arsa: "Arsa Sahipleri", yatirim: "Yatırımcı", insaat: "İnşaat", satis: "Satış", teslim: "Teslim", cark: "Çark", kacis: "Kaçış", genel: "Gündem", sistem: "Karar", bitti: "Teslim Edildi", hayat: "Hayatın", hikaye: "Hikâye", hesap: "Hesap", sosyal: "Sosyal Medya" };
const STEPS = { arsa: 3, yatirim: 2, insaat: 7, satis: 3 };
export const START_YEAR = 2012;
export const END_YEAR = 2036;
export const MAX_SLOTS = 12;

export const TIERS = [
  { ad: "Apartman", ek: "Apartmanı", daire: 8, scale: 1, floors: 5, fee: 0.5 },
  { ad: "Site", ek: "Sitesi", daire: 36, scale: 4.5, floors: 9, fee: 2 },
  { ad: "Rezidans", ek: "Rezidans", daire: 120, scale: 15, floors: 22, fee: 6 },
];

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export const dateLabel = (t) => `${AYLAR[t % 12]} ${START_YEAR + Math.floor(t / 12)}`;
export const yearOf = (t) => START_YEAR + Math.floor(t / 12);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rnd = Math.random;
const pick = (a) => a[Math.floor(rnd() * a.length)];

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---------- Senaryo havuzu: her şablon × 5 varyasyon (karakter + durum farkı) ----------
export const POOL = {};
for (const [ph, list] of Object.entries(TEMPLATES)) {
  POOL[ph] = [];
  const tw = TWISTS[ph] || TWISTS.genel;
  list.forEach((tpl, idx) => {
    for (let v = 0; v < VARIANTS; v++) {
      const r = mulberry32(hashStr(`${ph}:${idx}:${v}`));
      const p = (a) => a[Math.floor(r() * a.length)];
      const names = {};
      for (const k of Object.keys(NAMES)) names[k] = p(NAMES[k]);
      POOL[ph].push({ id: `${ph}-${idx}-${v}`, ph, idx, v, tpl, names, twist: tw[v % tw.length] });
    }
  });
}
export const SCRIPTED = buildScripted();
export const TOTAL_SCENARIOS = Object.values(POOL).reduce((a, l) => a + l.length, 0) + SCRIPTED.length;

// ---------- Durum ----------
export function newGame(kind) {
  const s = {
    t: 0, n: 8, b: 0, i: 55, g: 50, e: 55, r: 5, v: 70, m: 0,
    vergi: 0, market: 1, projects: [], completed: 0, daireTeslim: 0, cokme: 0, olu: 0,
    flags: {}, recent: [], used: {}, seq: 1, queue: [], log: [], news: [], maxTier: 0,
    scriptedDone: {}, lastKacis: -99, lastWarn: -99, ending: null,
    owned: {}, sins: [], arcs: {}, arcT: {}, arcsLast: 0, goals: {}, firma: "", dovizBorc: 0, baslangic: null,
  };
  const B = BASLANGIC[kind];
  if (B) { Object.assign(s, B.set); s.baslangic = kind; }
  return s;
}

export const activeProjects = (s) => s.projects.filter((p) => !p.done && !p.collapsed);
export const maxScale = (s) => Math.max(1, ...activeProjects(s).map((p) => p.scale), TIERS[s.maxTier].scale * 0.5);
export const assetValue = (s) => Object.keys(s.owned || {}).reduce((a, k) => a + (LUX[k] ? LUX[k].fiyat * 0.6 : 0), 0);
export const netWorth = (s) => s.n - s.b + assetValue(s);
const lifeScale = (s) => 1 + (maxScale(s) - 1) * 0.3;

// Genel ahlak göstergesi: 0 = dolandırıcı müteahhit, 100 = ahlaklı müteahhit
export function ahlak(s) {
  const x = s.v * 0.55 + (100 - s.r) * 0.15 + s.i * 0.1 + 20 - Math.min(35, s.m / 4) - Math.min(15, s.vergi / 3) - Math.min(15, (s.sins || []).length * 3) - Math.min(30, s.olu / 2);
  return clamp(Math.round(x), 0, 100);
}
export function ahlakEtiket(a) {
  if (a >= 85) return "Mahallenin Güvencesi";
  if (a >= 70) return "Ahlaklı Müteahhit";
  if (a >= 55) return "İdare Eder";
  if (a >= 40) return "Kıvırtan Müteahhit";
  if (a >= 25) return "Yapsatçı Çakal";
  if (a >= 10) return "Dolandırıcı Müteahhit";
  return "Kırmızı Bültenlik";
}
export const contractorUnits = (p) => Math.round((p.daire * (100 - p.pay)) / 100);
// Güvenilir firma primi: temiz sicilli müteahhidin dairesi daha pahalıya satılır
export const unitPrice = (s, p) => 7.8 * s.market * (0.7 + p.kalite / 350 + s.i / 350) * (1 + (s.sosyal ? s.sosyal.hype : 0) + Math.max(0, ahlak(s) - 60) / 250);
const costPerStep = (p, s) => (p.daire * 2.0 * (0.55 + p.kalite / 220)) / STEPS.insaat * (s && s.owned && s.owned.beton ? 0.88 : 1);

export function unlockedTiers(s) {
  const t = [0];
  if (s.completed >= 2 || (s.completed >= 1 && s.i >= 70)) t.push(1);
  if (s.completed >= 4 && s.maxTier >= 1) t.push(2);
  return t;
}
export const maxConcurrent = (s) => Math.min(4, 1 + Math.floor(s.completed / 2));
export const canStartProject = (s) => activeProjects(s).length < maxConcurrent(s) && s.i >= 15 && !s.ending && !s.escape && !s.finalStarted;
export const canFlee = (s) => !s.ending && !s.escape && !s.finalStarted && (s.r >= 50 || netWorth(s) < -12 * maxScale(s) || s.flags.kacisHazir);

export function unvan(s) {
  const w = netWorth(s);
  if (s.completed === 0) return { aile: "Babasının Oğlu", damat: "Torpilli Damat" }[s.baslangic] || "Kalfa Bozuntusu";
  if (w < 25) return "Mahalle Müteahhidi";
  if (w < 70) return "Semt Yapsatçısı";
  if (w < 160) return "İlçe Baronu";
  if (w < 300) return "Rezidans Kralı";
  return "İnşaat Patronu";
}

function freeSlot(s) {
  const used = new Set(s.projects.filter((p) => p.slot >= 0).map((p) => p.slot));
  for (let i = 0; i < MAX_SLOTS; i++) if (!used.has(i)) return i;
  // doluysa en eski biten/çöken projenin yerini al
  const old = s.projects.filter((p) => (p.done || p.collapsed) && p.slot >= 0).sort((a, b) => (a.doneAt ?? 0) - (b.doneAt ?? 0))[0];
  if (old) { const sl = old.slot; old.slot = -1; return sl; }
  return -1;
}

export function createProject(s, tier, semt, ad) {
  const T = TIERS[tier];
  const used = new Set(s.projects.map((p) => p.name));
  let name = `${ad || pick(PROJE_ADLARI)} ${T.ek}`;
  if (used.has(name)) name = `${name} ${s.seq}`;
  const p = {
    id: s.seq++, name, semt: semt || pick(SEMTLER), tier, scale: T.scale, daire: T.daire, floors: T.floors,
    phase: "arsa", step: 0, progress: 0, kalite: s.baslangic === "kalfa" ? 73 : 65, pay: 50, onSatis: 0, satilan: 0, gecikme: 0, sahip: 60,
    yatirim: 0, flags: {}, slot: freeSlot(s), start: s.t, lastTurn: s.t, collapsed: false, hasar: false, done: false,
  };
  s.n -= T.fee;
  s.projects.push(p);
  s.maxTier = Math.max(s.maxTier, tier);
  pushLog(s, `${p.semt}'da ${p.name} için arsa arayışı başladı.`);
  return p;
}

function pushLog(s, txt) { s.log.unshift(`${dateLabel(s.t)} — ${txt}`); s.log.length = Math.min(s.log.length, 40); }
const MANSET = ["SON DAKİKA", "ŞOK", "FLAŞ", "BOMBA İDDİA", "SKANDAL"];
function pushNews(s, txt) { txt = `${pick(MANSET)}: ${txt}`; s.news.unshift(txt); s.news.length = Math.min(s.news.length, 12); }

// ---------- Kart üretimi ----------
function qOk(s, q, proj) {
  if (!q) return true;
  if (q.includes("&")) return q.split("&").every((x) => qOk(s, x.trim(), proj));
  if (q.startsWith("R:")) return !!(proj && REGION[proj.semt] === q.slice(2));
  if (q.startsWith("Y:")) { const [a, b] = q.slice(2).split("-").map(Number); const y = yearOf(s.t); return y >= a && y <= (b || a); }
  if (q.startsWith("F:")) return !!s.flags[q.slice(2)];
  if (q.startsWith("P:")) return !!(proj && proj.flags[q.slice(2)]);
  if (q === "onsatis") return !!(proj && proj.onSatis > 0);
  if (q === "nosatis") return !!(proj && proj.onSatis === 0 && proj.phase === "insaat");
  return true;
}

function pickVariant(s, ph, proj) {
  const all = POOL[ph].filter((e) => qOk(s, e.tpl.q, proj));
  if (!all.length) return null;
  const recent = new Set(s.recent);
  let c = all.filter((e) => !s.used[e.id] && !recent.has(`${e.ph}-${e.idx}`));
  if (!c.length) c = all.filter((e) => !s.used[e.id]);
  if (!c.length) { for (const e of POOL[ph]) delete s.used[e.id]; c = all; }
  return pick(c);
}

function fill(str, names, proj, s) {
  if (!str) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => {
    if (k === "PR") return proj ? proj.name : "yeni projen";
    if (k === "SM") return proj ? proj.semt : pick(SEMTLER);
    if (k === "YIL") return String(yearOf(s.t));
    return names[k] ?? m;
  });
}

function tplCard(s, ph, proj) {
  const e = pickVariant(s, ph, proj);
  if (!e) return null;
  const t = e.tpl;
  const semt = proj ? proj.semt : SEMTLER[hashStr(e.id) % SEMTLER.length];
  return {
    kind: "tpl", phase: ph, id: e.id, key: `${e.ph}-${e.idx}`, projId: proj ? proj.id : null,
    speaker: t.sp ? spk(t.sp[0], t.sp[4] || dialectFor(t.sp[0], semt), t.sp[1], t.sp[2], t.sp[3]) : speakerFor(t, e.names, semt, hashStr(e.id + s.t), ph),
    scale: ph === "hayat" ? lifeScale(s) : undefined,
    title: fill(t.t, e.names, proj, s), text: fill(t.x, e.names, proj, s), twist: e.twist.t, twistM: e.twist.m, ders: t.d,
    choices: t.c.map(([label, fx, result]) => ({ label: fill(label, e.names, proj, s), fx, result: fill(result, e.names, proj, s) })),
  };
}

export function newProjectCard(s, forced) {
  const tiers = unlockedTiers(s);
  const ozler = ARSA_OZ.slice().sort(() => rnd() - 0.5);
  const secenek = tiers.slice(-3).reverse();
  while (secenek.length < 3) secenek.push(secenek[secenek.length - 1]);
  const choices = secenek.map((tier, i) => {
    const T = TIERS[tier];
    const semt = pick(SEMTLER), ad = pick(PROJE_ADLARI), oz = ozler[i];
    return {
      label: `${semt}'da ${T.ad} (${T.daire} daire) — ${fmt(T.fee)} ön masraf · ${oz.emoji} ${oz.ad}: ${oz.not}`,
      act: { type: "newProject", tier, semt, ad, oz: oz.fx },
      result: `${semt}'da yeni bir ${T.ad.toLowerCase()} işi için arsa sahipleriyle görüşmeler başlıyor. ${oz.emoji} ${oz.ad}: ${oz.not}.`,
    };
  });
  choices.push(forced
    ? { label: "Bir ay dinlen, piyasayı izle", fx: "v+2", result: "Bir ay boyunca hiçbir şey yapmadın. Faizler işlemeye devam etti." }
    : { label: "Şimdilik vazgeç", fx: "", result: "Eldeki işlere odaklanıyorsun.", act: { type: "cancel" } });
  const riskli = ozler.slice(0, choices.length - 1).find((o) => o.ders);
  const ders = riskli ? riskli.ders : "Müteahhitler aynı anda çok fazla projeye girdiğinde, bir projenin parası diğerine aktarılır; bu zincir koptuğunda yarım binalar ve mağdurlar ortaya çıkar.";
  if (forced) {
    const k = ARSA_KIM[(s.arsaN || 0) % ARSA_KIM.length];
    s.arsaN = (s.arsaN || 0) + 1;
    return { kind: "sys", phase: "sistem", title: k.t, speaker: k.sp(), text: `${k.x} Hangisine gireceksin?`, ders, choices };
  }
  return {
    kind: "sys", phase: "sistem", title: "Yeni Proje",
    text: "Yeni bir işe girmek nakit getirir ama eldeki işleri yavaşlatır. Çok fazla işe girmek, çarkın bozulmasının ilk adımıdır.",
    ders: `Müteahhitler aynı anda çok fazla projeye girdiğinde, bir projenin parası diğerine aktarılır; bu zincir koptuğunda yarım binalar ve mağdurlar ortaya çıkar. ${riskli ? riskli.ders : ""}`.trim(),
    choices, noStep: true,
  };
}

export function drawCard(s) {
  if (s.queue.length) return s.queue.shift();
  const act = activeProjects(s);
  if (!act.length) return newProjectCard(s, true);
  const ms = maxScale(s);
  const w = netWorth(s);
  if ((s.r > 70 || w < -22 * ms || s.flags.kacisHazir) && s.t - s.lastKacis > 6 && rnd() < 0.35) {
    s.lastKacis = s.t;
    return tplCard(s, "kacis", pick(act));
  }
  if ((s.n < -10 * ms || (act.length > 1 && s.flags.cark)) && rnd() < 0.4) return tplCard(s, "cark", pick(act));
  // Hikâye zincirleri
  if (s.t - (s.arcsLast || 0) >= 3 && rnd() < 0.3) {
    const ready = ARCS.filter((a) => {
      const st = (s.arcs || {})[a.id] || 0;
      return st < a.steps.length && s.t - ((s.arcT || {})[a.id] ?? -99) >= 5 && a.steps[st].when(s);
    });
    if (ready.length) {
      const a = pick(ready), st = (s.arcs || {})[a.id] || 0;
      return { ...a.steps[st].card(s), arc: a.id, arcStep: st, scale: lifeScale(s) };
    }
  }
  if (Object.keys(s.owned || {}).length && rnd() < 0.12) { const c = tplCard(s, "hayat", pick(act)); if (c) return c; }
  if (rnd() < 0.16) return tplCard(s, "genel", pick(act));
  // en uzun süredir ilgilenilmeyen projeye öncelik
  const proj = act.slice().sort((a, b) => a.lastTurn - b.lastTurn)[0];
  const mc = miniFor(s, proj);
  if (mc) return mc;
  const ph = proj.phase === "teslim" ? "satis" : proj.phase;
  return tplCard(s, ph, proj);
}

// Her projede bir kez: beton dökümü, habersiz denetim, arsa pazarlığı, tapu günü (mini oyunlu)
function miniFor(s, p) {
  const f = p.flags;
  // Aynı mini oyun her projede gelmesin: oynadıkça seyrekleşir (ilk 2'de tam, sonra yarı, 5'ten sonra dörtte bir)
  const mn = (s.miniN = s.miniN || {});
  const w = (k) => ((mn[k] || 0) < 2 ? 1 : (mn[k] || 0) < 5 ? 0.5 : 0.25);
  let c = null, k = null;
  if (p.phase === "arsa" && !f.miniPazarlik && rnd() < 0.5) { f.miniPazarlik = true; if (rnd() < w(k = "pazarlik")) c = pazarlikCard(s, p, p.id * 7 + s.t); }
  else if (p.phase === "insaat" && p.progress >= 15 && !f.miniBeton && rnd() < 0.5) { f.miniBeton = true; if (rnd() < w(k = "beton")) c = betonCard(s, p); }
  else if (p.phase === "insaat" && p.progress >= 45 && !f.miniDenetim && rnd() < 0.4) { f.miniDenetim = true; if (rnd() < w(k = "denetim")) c = denetimCard(s, p); }
  else if (p.phase === "satis" && !f.miniTapu && rnd() < 0.4) { f.miniTapu = true; if (rnd() < w(k = "tapu")) c = tapuMiniCard(s, p); }
  if (c) { c.scale = p.scale; mn[k] = (mn[k] || 0) + 1; }
  return c;
}

export function fleeCard(s) {
  s.lastKacis = s.t;
  const act = activeProjects(s);
  return tplCard(s, "kacis", act.length ? pick(act) : null);
}

// ---------- Etkiler ----------
const SCALED = new Set(["n", "b", "x", "y"]);
function applyFx(s, fx, proj, twistM, scale, out) {
  if (!fx) return;
  for (const tok of fx.trim().split(/\s+/)) {
    if (!tok) continue;
    if (tok.startsWith("F:")) { s.flags[tok.slice(2)] = true; continue; }
    if (tok.startsWith("P:")) { if (proj) proj.flags[tok.slice(2)] = true; continue; }
    if (tok.startsWith("E:")) { s.pendingEnding = tok.slice(2); continue; }
    const m = tok.match(/^([a-z])([+-]\d+(?:\.\d+)?)$/);
    if (!m) continue;
    const k = m[1];
    let val = parseFloat(m[2]);
    if (twistM && twistM[k]) val *= twistM[k];
    if (SCALED.has(k)) val *= scale;
    switch (k) {
      case "n": s.n += val; out.push(["n", val]); break;
      case "b": s.b = Math.max(0, s.b + val); out.push(["b", val]); break;
      case "i": case "g": case "e": case "r": case "v": {
        const before = s[k]; s[k] = clamp(s[k] + val, 0, 100); out.push([k, s[k] - before]); break;
      }
      case "m": { const add = Math.max(val < 0 ? val : 0, Math.round(val * Math.sqrt(scale))); s.m = Math.max(0, s.m + add); out.push(["m", add]); break; }
      case "x": s.n += val; s.vergi += Math.max(0, val); out.push(["x", val]); break;
      case "y": s.n += val; s.b += val; if (proj) proj.yatirim += val; out.push(["y", val]); break;
      case "a": s.market = clamp(s.market * (1 + val / 100), 0.5, 3); out.push(["a", val]); break;
      default:
        if (!proj) break;
        if (k === "k") { const b0 = proj.kalite; proj.kalite = clamp(proj.kalite + val, 0, 100); out.push(["k", proj.kalite - b0]); }
        else if (k === "p") { if (proj.phase === "insaat") { proj.progress = clamp(proj.progress + val, 0, 100); out.push(["p", val]); } }
        else if (k === "d") { proj.gecikme = Math.max(0, proj.gecikme + val); out.push(["d", val]); }
        else if (k === "s") { const b0 = proj.sahip; proj.sahip = clamp(proj.sahip + val, 0, 100); out.push(["s", proj.sahip - b0]); }
        else if (k === "h") { const b0 = proj.pay; proj.pay = clamp(proj.pay + val, 25, 70); out.push(["h", proj.pay - b0]); }
        else if (k === "o") presale(s, proj, val, out);
    }
  }
}

function presale(s, p, pct, out) {
  const avail = contractorUnits(p) - p.onSatis - p.satilan;
  if (avail <= 0 || pct <= 0) return;
  const units = Math.max(1, Math.min(avail, Math.round((contractorUnits(p) * pct) / 100)));
  const rev = units * unitPrice(s, p) * 0.75;
  s.n += rev; p.onSatis += units;
  out.push(["o", units], ["n", rev]);
}

// ---------- Kart çözümleme ----------
export function resolve(s, card, idx, opts = {}) {
  const ch = card.choices[idx];
  const proj = card.projId != null ? s.projects.find((p) => p.id === card.projId) : null;
  const scale = card.scale ?? (proj ? proj.scale : maxScale(s));
  const deltas = [];
  const events = [];
  let newProj = null, result = ch.result, gamble = null;
  s.owned = s.owned || {}; s.sins = s.sins || []; s.arcs = s.arcs || {}; s.arcT = s.arcT || {}; s.goals = s.goals || {};

  if (card.kind === "tpl") { s.used[card.id] = true; s.recent.push(card.key); if (s.recent.length > 30) s.recent.shift(); }
  const act = ch.act || {};
  if (act.type === "newProject") {
    newProj = createProject(s, act.tier, act.semt, act.ad);
    if (act.oz) applyFx(s, act.oz, newProj, null, newProj.scale, deltas);
  }
  if (act.type === "cancel") return { result: ch.result, deltas, events, ders: card.ders, noTime: true };
  if (act.type === "quakeFx") applyFx(s, ch.fx, null, null, maxScale(s), deltas);
  else applyFx(s, ch.fx, proj, card.twistM, scale, deltas);
  if (card.onResolve) card.onResolve(s, idx, events);

  if (act.type === "buy") {
    const it = LUX[act.key];
    if (it && !s.owned[act.key]) {
      s.n -= it.fiyat; deltas.push(["n", -it.fiyat]);
      ownLux(s, act.key, deltas);
    }
  }
  if (act.type === "gamble") {
    const win = rnd() < act.p;
    applyFx(s, win ? act.win : act.lose, proj, null, scale, deltas);
    result = win ? act.winText : act.loseText;
    gamble = win;
  }
  if (act.type === "mini") {
    const sc = opts.score ?? rnd();
    const tier = act.tiers.find((t) => sc >= t[0]) || act.tiers[act.tiers.length - 1];
    applyFx(s, tier[1], proj, null, scale, deltas);
    result = tier[2];
  }
  if (opts.extraFx) applyFx(s, opts.extraFx, proj, null, scale, deltas);
  if (/F:dovizBorcu?\b/.test(ch.fx || "")) s.dovizBorc = (s.dovizBorc || 0) + deltas.filter((d) => d[0] === "b" || d[0] === "y").reduce((a, d) => a + Math.max(0, d[1]), 0);
  if (act.type === "dovizKapat") s.dovizBorc = 0;
  if (act.type === "yapilandir") s.faizT = s.t + 48;
  if (act.type === "devret") {
    const p = s.projects.find((x) => x.id === act.id);
    if (p && !p.done) {
      const bedel = (1.5 + p.progress / 25) * p.scale + p.yatirim * 0.8;
      s.n += bedel; deltas.push(["n", bedel]);
      p.done = true; p.devir = true; p.phase = "bitti"; p.doneAt = s.t;
      pushLog(s, `${p.name} devredildi.`);
      events.push(["info", `${p.name} yeni firmaya devredildi (${fmt(bedel)}).`]);
    }
  }
  if (act.type === "esc") { if (act.mini && s.escape) s.escape.heat = clamp(s.escape.heat + (0.5 - (opts.score ?? rnd())) * 50, 3, 95); escStep(s, act, events, deltas); }
  if (act.type === "redeem") { if (s.olu > 0) s.pendingEnding = "itiraf"; else s.finalEnding = "patron"; }
  if (act.type === "legacy") { s.legacy = act.key; s.pendingEnding = act.key === "siyaset" && s.finalEnding !== "patron" ? "siyaset" : s.finalEnding; }

  // Kaçış kararı: doğrudan son değil, kaçış operasyonu başlar
  if (s.pendingEnding === "kacak" && !s.escape) { s.pendingEnding = null; startEscape(s, events); }

  // Hikâye zinciri ilerler
  if (card.arc) { s.arcs[card.arc] = (card.arcStep || 0) + 1; s.arcT[card.arc] = s.t; s.arcsLast = s.t; }
  // Son perde: hesap gününden sağ çıktıysan miras kararı gelir
  if (card.finalStage === "hesap" && !s.pendingEnding && !s.escape) s.queue.unshift(mirasCard(s));

  // Saatli bomba: kirli kararlar dosyaya girer, yıllar sonra patlayabilir
  const dv = deltas.filter((d) => d[0] === "v").reduce((a, d) => a + d[1], 0);
  if (dv <= -8 && card.phase !== "hesap" && rnd() < (s.owned.tv ? 0.35 : 0.5)) {
    s.sins.push({ title: card.title, proj: proj ? proj.name : null, due: s.t + 8 + Math.floor(rnd() * 26) });
    events.push(["sin", card.title]);
  }

  // Faz ilerlemesi: kart, projenin o anki fazına aitse proje bir adım ilerler.
  if (proj && card.phase === proj.phase && !proj.done) stepProject(s, proj, events);
  if (card.phase === "teslim" && proj && !proj.done) finalizeProject(s, proj, events);

  // Kartın ait olmadığı fazdaki proje de ilgilenildi sayılır (çark/genel)
  if (proj) proj.lastTurn = s.t;

  // Mükerrer satış / genel vekalet gibi kararlar haber olarak düşer
  newsFromChoice(s, card, ch, proj);

  if (!card.noStep) monthly(s, proj, events);
  if (newProj) events.push(["info", `${newProj.name} (${newProj.semt}) portföye eklendi.`]);
  checkGoals(s, events);
  let end = checkEnding(s);
  if (end && ["patron", "baron", "emekli"].includes(end) && !s.finalStarted) {
    s.finalStarted = true; s.finalEnding = end; end = null;
    const needHesap = s.sins.length >= 2 || s.m >= 30 || s.vergi > 20;
    s.queue.unshift(needHesap ? hesapCard(s) : mirasCard(s));
    events.push(["info", "Kariyerinin son perdesi açılıyor…"]);
  }
  s.ending = end;
  return { result, deltas, events, ders: card.ders, gamble };
}

// ---------- Lüks ve yan işler ----------
function ownLux(s, key, deltas) {
  const it = LUX[key];
  s.owned[key] = true; s.flags[key] = true;
  applyFx(s, it.fx, null, null, 1, deltas);
  pushLog(s, `${it.ikon} ${it.ad} alındı.`);
  const hab = {
    mercedes: "Müteahhit yeni Mercedes'iyle şantiyede görüntülendi, ustalar hâlâ hakediş bekliyor",
    villa: "Müteahhidin havuzlu villası mahallede konuşuluyor",
    yat: "Bodrum'da yeni bir yat: sahibi müteahhit çıktı",
    helikopter: "Şantiyeye helikopterle inen müteahhit sosyal medyada gündem oldu",
    galeri: "İnşaatçıdan oto galeri hamlesi", tv: "Yerel TV kanalı bir müteahhide satıldı",
    otel: "Bodrum'daki butik otelin yeni sahibi müteahhit", kulup: "Amatör kulübe müteahhit başkan",
  }[key];
  if (hab) pushNews(s, hab);
}

export function canBuy(s, key) {
  const it = LUX[key];
  return !!it && !(s.owned || {})[key] && s.completed >= it.min && s.n >= it.fiyat && !s.ending;
}
export function buyLux(s, key) {
  if (!canBuy(s, key)) return null;
  s.owned = s.owned || {};
  const deltas = [];
  s.n -= LUX[key].fiyat; deltas.push(["n", -LUX[key].fiyat]);
  ownLux(s, key, deltas);
  const events = [];
  checkGoals(s, events);
  return { deltas, events };
}
export function sellLux(s, key) {
  if (!(s.owned || {})[key] || s.ending) return null;
  const v = LUX[key].fiyat * 0.5;
  s.n += v; delete s.owned[key]; delete s.flags[key];
  pushLog(s, `${LUX[key].ikon} ${LUX[key].ad} yarı fiyatına satıldı.`);
  if (["mercedes", "villa", "yat", "helikopter"].includes(key)) pushNews(s, `Müteahhit ${LUX[key].ad.toLowerCase()} elden çıkardı: işler kötü mü gidiyor?`);
  return v;
}
export function luxMonthly(s) {
  let net = 0;
  for (const k of Object.keys(s.owned || {})) { const it = LUX[k]; if (!it) continue; net += (it.gelir || 0) * (0.8 + 0.2 * s.market) - (it.gider || 0); }
  return net;
}

// ---------- Kaçış operasyonu ----------
function startEscape(s, events) {
  const heat = s.r * 0.4 + (s.olu > 0 ? 25 : 0) + (s.m > 150 ? 8 : 0) - (s.owned && s.owned.tv ? 8 : 0) + 5;
  s.escape = { heat: clamp(heat, 5, 95), stage: 0, money: Math.max(0, s.n), dest: null };
  s.queue.unshift(escapeCard(s, 0));
  events.push(["info", "✈️ Kaçış operasyonu başladı. Her adım seni ya kurtaracak ya yakalatacak."]);
}

function escStep(s, act, events, deltas) {
  const es = s.escape;
  if (!es) return;
  const ms = maxScale(s);
  if (act.cash) { const c = act.cash * ms; es.money += c; s.n += c; deltas.push(["n", c]); }
  if (act.m) { const add = Math.round(act.m * Math.sqrt(ms)); s.m += add; deltas.push(["m", add]); }
  if (act.keep) es.money *= act.keep;
  if (act.risk && rnd() < act.risk.p) { es.money *= act.risk.keep; events.push(["info", "🎲 Kripto borsası 'bakım' moduna geçti. Paranın bir kısmı buharlaştı."]); }
  if (act.dest) es.dest = act.dest;
  es.heat = clamp(es.heat + (act.heat || 0), 3, 95);
  if (act.end) {
    let heat = es.heat;
    if (act.bribe) heat += rnd() < 0.5 ? -20 : 20;
    const caught = rnd() < clamp(heat / 100, 0.05, 0.92);
    s.kacirilan = es.money;
    s.pendingEnding = caught ? "iade" : "kacak";
    events.push(["info", caught ? "🚨 Sistemde kırmızı bülten kaydın çıktı!" : "🛫 Tekerlekler yerden kesildi."]);
  } else {
    es.stage++;
    s.queue.unshift(escapeCard(s, es.stage));
  }
}

// ---------- Hedefler ----------
function checkGoals(s, events) {
  s.goals = s.goals || {};
  for (const g of GOALS) {
    if (s.goals[g.id] || !g.test(s)) continue;
    s.goals[g.id] = s.t;
    const d = [];
    if (g.odul) applyFx(s, g.odul, null, null, 1, d);
    events.push(["goal", g.ad]);
  }
}
export const nextGoal = (s) => GOALS.find((g) => !(s.goals || {})[g.id]) || null;

function stepProject(s, p, events) {
  p.step++;
  if (p.phase === "arsa" && p.step >= STEPS.arsa) toPhase(s, p, "yatirim", events);
  else if (p.phase === "yatirim" && p.step >= STEPS.yatirim) toPhase(s, p, "insaat", events);
  else if (p.phase === "insaat") {
    const cost = costPerStep(p, s) * (s.flags.kurKalite ? 1.0 : 1) * (0.9 + s.market * 0.1);
    s.n -= cost;
    events.push(["maliyet", -cost]);
    p.progress = clamp(p.progress + 100 / STEPS.insaat, 0, 100);
    if (p.progress >= 99.5 || p.step >= STEPS.insaat + 3) toPhase(s, p, "satis", events);
  } else if (p.phase === "satis") {
    const remaining = contractorUnits(p) - p.onSatis - p.satilan;
    const left = Math.max(1, STEPS.satis - p.step + 1);
    const n = p.step >= STEPS.satis ? remaining : Math.ceil(remaining / left);
    if (n > 0) {
      const rev = n * unitPrice(s, p);
      const tax = p.flags.dusuk ? 0.05 : 0.15;
      s.n += rev * (1 - tax);
      if (p.flags.dusuk) s.vergi += rev * 0.1;
      p.satilan += n;
      events.push(["satis", rev * (1 - tax), n]);
    }
    if (p.step >= STEPS.satis) toPhase(s, p, "teslim", events);
  }
}

function toPhase(s, p, ph, events) {
  // inşaata geçerken, önceki aşamalarda proje ilerlemesi sıfırdan başlar
  if (p.phase === "insaat" && ph === "satis") p.progress = 100;
  p.phase = ph; p.step = 0;
  const msg = { yatirim: `${p.name}: arsa anlaşması tamam, sıra yatırımcılarda.`, insaat: `${p.name}: temel atıldı, inşaat başladı.`, satis: `${p.name}: kaba ve ince işler bitti, satışlar başladı.`, teslim: `${p.name}: anahtar teslim zamanı.` }[ph];
  if (msg) { events.push(["info", msg]); pushLog(s, msg); }
  if (ph === "teslim") s.queue.push(tplCard(s, "teslim", p));
}

function finalizeProject(s, p, events) {
  if (p.yatirim > 0) {
    if (p.flags.yatirimciKazik) {
      s.b = Math.max(0, s.b - p.yatirim);
      s.r = clamp(s.r + 8, 0, 100);
      events.push(["info", `Yatırımcılara ${fmt(p.yatirim)} ödenmedi. Dava dosyaları açılıyor.`]);
    } else {
      const pay = p.yatirim * 1.25;
      s.n -= pay; s.b = Math.max(0, s.b - p.yatirim); s.g = clamp(s.g + 5, 0, 100);
      events.push(["yatirimci", -pay]);
    }
  }
  const tolerans = p.flags.tarihsiz ? 12 : 6;
  if (p.gecikme > tolerans) p.sahip = clamp(p.sahip - (p.gecikme - tolerans) * 2, 0, 100);
  if (p.sahip < 25) {
    const sahipSayisi = Math.max(2, Math.round((p.daire * p.pay) / 200));
    s.m += sahipSayisi; s.r = clamp(s.r + 8, 0, 100); s.i = clamp(s.i - 6, 0, 100);
    events.push(["info", `Arsa sahipleri memnun değil (${Math.round(p.gecikme)} ay gecikme). Dava açtılar.`]);
  } else if (p.sahip > 70) { s.i = clamp(s.i + 4, 0, 100); }
  p.done = true; p.phase = "bitti"; p.doneAt = s.t;
  s.completed++; s.daireTeslim += p.daire;
  pushLog(s, `${p.name} teslim edildi. ${p.daire} daire, kalite ${Math.round(p.kalite)}/100.`);
  events.push(["info", `${p.name} tamamlandı! (${s.completed}. proje)`]);
}

function monthly(s, touched, events) {
  s.t++;
  if (s.b > 0) { const f = s.b * (s.faizT > s.t ? 0.004 : 0.012); s.n -= f; events.push(["faiz", -f]); }
  if (s.n < 0) { const f = -s.n * (s.faizT > s.t ? 0.006 : 0.015); s.n -= f; }
  // Kasada fazla para varsa banka borcunun bir kısmı otomatik kapanır
  const tampon = 4 * maxScale(s);
  if (s.b > 0 && s.n > tampon) { const od = Math.min(s.b, (s.n - tampon) * 0.4); s.n -= od; s.b -= od; }
  for (const p of activeProjects(s)) {
    if (p === touched) continue;
    if (p.phase === "insaat" && rnd() < 0.3) { p.gecikme += 1; p.sahip = clamp(p.sahip - 1, 0, 100); }
  }
  const lux = luxMonthly(s);
  if (lux) { s.n += lux; if (Math.abs(lux) >= 0.05) events.push(["lux", lux]); }
  // Dolaptaki iskeletler: vadesi gelen dosyalar patlar
  if (s.sins && s.sins.length) {
    const due = s.sins.filter((x) => x.due <= s.t);
    if (due.length) { const x = due[0]; s.sins = s.sins.filter((y) => y !== x); s.queue.push(ghostCard(s, x, hashStr(x.title + s.t))); }
  }
  s.market = clamp(s.market * (1 + (rnd() - 0.47) * 0.03), 0.5, 3);
  s.r = Math.max(0, s.r - (s.baslangic === "damat" && !s.flags.damatRed && s.t < at(2019, 4) ? 1.1 : 0.7));
  s.e += (55 - s.e) * 0.03;
  // Senaryolu olaylar (tarihe bağlı)
  for (const ev of SCRIPTED) {
    if (!s.scriptedDone[ev.id] && s.t >= ev.at) { s.scriptedDone[ev.id] = true; s.queue.push(ev.card(s)); }
  }
  // Kur şokları: döviz borcu bir gecede büyür (2018 yazı, 2021 sonu ve sonra seyrek)
  const kurAt = [at(2018, 8), at(2021, 12)];
  if (kurAt.includes(s.t) || (s.t > at(2022, 6) && rnd() < 1 / 150)) kurSoku(s, events);
  // Rastgele küçük/orta deprem
  if (s.t > 18 && rnd() < 1 / 110) s.queue.push(quakeCard(s, 0.35 + rnd() * 0.3, false));
  // Uyarılar
  const ms = maxScale(s);
  if (netWorth(s) < -28 * ms && s.t - s.lastWarn > 8) { s.lastWarn = s.t; s.lastKacis = s.t; s.queue.push(tplCard(s, "kacis", pick(activeProjects(s)) || null)); }
  // Temiz sicilli firmaya bankanın uzattığı el (bir kez)
  // (temiz sicilde 3 yılda bir tekrar gelebilir, en fazla 3 kez)
  if (netWorth(s) < -14 * ms && (s.kurtarmaN || 0) < 3 && s.t - (s.kurtarmaT ?? -99) >= 36 && ahlak(s) >= 55 && s.m < 8) { s.flags.kurtarma = true; s.kurtarmaN = (s.kurtarmaN || 0) + 1; s.kurtarmaT = s.t; s.queue.push(kurtarmaCard(s)); }
  if (s.v <= 0 && !s.flags.vicdanUyari) { s.flags.vicdanUyari = true; s.queue.push(mirrorCard()); }
  if (s.e <= 4 && activeProjects(s).some((p) => p.phase === "insaat")) s.queue.push(strikeCard(s));
  SOS.monthly(s, sosFx, events);
}

const at = (y, m) => (y - START_YEAR) * 12 + (m - 1);
function kurSoku(s, events) {
  s.dovizBorc = Math.min(s.dovizBorc || 0, s.b);
  const artis = s.dovizBorc * 0.45;
  if (artis > 0) { s.b += artis; s.dovizBorc += artis; events.push(["info", `Kur şoku: döviz borcun ${fmt(artis)} büyüdü.`]); }
  s.market = clamp(s.market * 0.93, 0.5, 3);
  // 2018 için ayrı senaryolu kart zaten var; borcu yoksa ikinci kart gelmesin
  if (artis > 0 || s.t !== at(2018, 8)) s.queue.push(kurSokuCard(s, fmt(artis)));
}

// ---------- Sosyal medya (Harç) ----------
const sosFx = (s, fx, proj, out) => applyFx(s, fx, proj, null, maxScale(s), out);
export const sosyalPost = (s, id) => { const r = SOS.post(s, id, sosFx); if (r) checkGoals(s, r.events); return r; };
export const sosyalReklam = (s, id) => SOS.reklam(s, id, sosFx);
export const sosyalTurn = (s, pol) => SOS.botTurn(s, pol, sosFx);

function newsFromChoice(s, card, ch, proj) {
  const fx = ch.fx || "";
  const sm = proj ? proj.semt : pick(SEMTLER);
  if (/F:mukerrer/.test(fx)) pushNews(s, `${sm}'da aynı daireyi birden fazla kişiye satan müteahhit hakkında şikayetler artıyor`);
  if (/F:genelVekalet/.test(fx)) pushNews(s, `Avukatlar uyarıyor: müteahhide sınırsız vekalet vermeyin`);
  if (/P:dusuk/.test(fx)) pushNews(s, `Maliye tapuda düşük beyan edilen konut satışlarını mercek altına aldı`);
  if (/F:kolonKesildi/.test(fx)) pushNews(s, `${sm}'da bir binada dükkan için kolon kesildiği iddiası`);
  if (/F:kotuBeton/.test(fx)) pushNews(s, `Uzmanlar: düşük dayanımlı beton deprem riskini katlıyor`);
  if (/F:ponzi/.test(fx)) pushNews(s, `'Yüksek getiri' vaadiyle para toplayan inşaat firmalarına dikkat`);
  if (/F:kooperatif/.test(fx)) pushNews(s, `Arsası olmayan kooperatife aidat ödeyen yüzlerce aile mağdur`);
  if (/F:sahteIskan/.test(fx)) pushNews(s, `${sm}'da sahte iskânla teslim edilen binada abonelikler iptal edildi`);
  if (/F:sahteKampanya/.test(fx)) pushNews(s, `'Bugüne özel %40 indirim' ilanıyla kapora toplayan firmaya şikayet yağıyor`);
  if (/F:kazaOrtbas/.test(fx)) pushNews(s, `${sm}'daki şantiyede işçinin ölümü 'kaza değil' iddiası`);
  if (/F:ihaleFesat|F:ihFesat/.test(fx)) pushNews(s, `Kamu konut ihalelerinde şartname iddiası: 'Tek firmaya göre yazıldı'`);
  if (/F:cark/.test(fx)) pushNews(s, `${sm}'da yarım kalan inşaatın arsa sahipleri eylemde`);
}

// ---------- Özel kartlar ----------
function kurtarmaCard(s) {
  const geri = activeProjects(s).filter((p) => ["arsa", "yatirim", "insaat"].includes(p.phase)).sort((a, b) => a.progress - b.progress)[0];
  return {
    kind: "sys", phase: "sistem", title: "Banka Masası", noStep: true,
    speaker: { role: "YT", name: "banka şube müdürü Leyla Hanım", dia: "ankara", label: "", roleLabel: "Banka", emoji: "🏦", quote: "Sicilinizi inceledik: mağdurunuz yok, çekleriniz karşılıksız çıkmamış. Size bir yol açabiliriz." },
    text: "Kasa eriyor, faizler büyüyor. Ama yıllardır sözünü tutmuş bir firmasın. Banka ve sektördeki büyük bir firma masaya iki teklif koydu.",
    ders: "Temiz ödeme geçmişi, zor günlerde yapılandırma ve konkordato gibi yasal yolları mümkün kılar. Bir proje başka firmaya devredilirken alıcılar ve arsa sahipleri devir sözleşmesini, yeni firmanın yükümlülükleri üstlendiğini ve tapu şerhlerini mutlaka kontrol etmelidir.",
    choices: [
      { label: "Kredileri yapılandır: 4 yıl düşük faiz", fx: "i-2", act: { type: "yapilandir" }, result: "İmzalar atıldı. Faiz yükün yarıdan aza indi; nefes aldın." },
      ...(geri ? [{ label: `${geri.name} projesini büyük firmaya devret`, fx: "i-3 v+2", act: { type: "devret", id: geri.id }, result: "Proje el değiştirdi. Alıcıların hakları devir sözleşmesiyle korundu." }] : []),
      { label: "Teşekkürler, kendi yolumla çıkarım", fx: "v+1", result: "Masadan kalktın. Umarım haklısındır." },
    ],
  };
}

function mirrorCard() {
  return {
    kind: "sys", phase: "sistem", title: "Aynadaki Yüz",
    text: "Gece yarısı. Uyuyamıyorsun. Aynaya baktığında tanımadığın biri var. Mağdurların yüzleri gözünün önünden gitmiyor.",
    ders: "Oyun kurgudur; ama gerçek hayatta her mağduriyetin arkasında bir ailenin birikimi, evi ve geleceği vardır.",
    choices: [
      { label: "Değişmeye karar ver", fx: "v+25 i+2", result: "Ertesi sabah avukatınla mağdurların listesini çıkardın." },
      { label: "Işığı kapat, uyu", fx: "v+2", result: "Uyku zor geldi. Ama geldi." },
    ],
  };
}

function strikeCard(s) {
  return {
    kind: "sys", phase: "sistem", title: "Şantiyeler Durdu",
    text: "Ekiplerin sabrı tükendi. Bütün şantiyelerde iş bırakıldı; ustalar ofisinin önünde.",
    ders: "Ücretleri ödenmeyen işçilerin iş bırakması hukuki bir haktır. Ana müteahhit, taşeron işçilerinin alacaklarından da sorumludur.",
    choices: [
      { label: "Bütün alacakları öde", fx: "n-2 e+45 v+5", result: "Makineler yeniden çalışıyor." },
      { label: "Yeni ekipler bul, eskileri kapıdan çevir", fx: "e+25 v-10 m+6 i-8", result: "Eski ekip alacaklarını mahkemede arayacak." },
    ],
  };
}

export function quakeCard(s, power, big) {
  return {
    kind: "sys", phase: "genel", title: big ? "Büyük Deprem" : "Deprem",
    text: big
      ? "Sabaha karşı çok büyük bir deprem oldu. Şehirler yıkıldı. Herkes tek bir soruyu soruyor: bu binaları kim, nasıl yaptı?"
      : `Şehirde ${(4.8 + power * 2.5).toFixed(1)} büyüklüğünde bir deprem oldu. Telefonun durmadan çalıyor.`,
    ders: "Depremde can kayıplarının büyük kısmı, yönetmeliğe aykırı yapılan binalardan kaynaklanır: düşük dayanımlı beton, eksik donatı, kesilen kolonlar, sahte zemin etüdü ve işlemeyen denetim. Deprem öldürmez, ihmal öldürür.",
    quake: power, big,
    choices: [
      { label: "Bütün binalarını bağımsız mühendislere incelet", fx: "v+3", act: { type: "quakeFx" }, result: "Raporlar gelmeye başladı." },
      { label: "Basına 'binalarımız sapasağlam' açıklaması yap", fx: "i+2 v-3", act: { type: "quakeFx" }, result: "Açıklaman yayında." },
    ],
    onResolve(st, idx, events) {
      const res = applyQuake(st, power);
      st.lastQuake = res;
      if (!res.collapsed.length && !res.damaged.length) events.push(["info", "Binalarının hiçbiri hasar almadı. Sağlam yapmanın karşılığı."]);
      for (const p of res.damaged) events.push(["info", `${p.name} hasar aldı; sakinler tahliye edildi.`]);
      for (const p of res.collapsed) events.push(["olu", `${p.name} (${p.semt}) yıkıldı. Enkazdan ${p.olu} kişinin cansız bedeni çıkarıldı.`]);
      if (res.collapsed.length) st.queue.unshift(afterQuakeCard(st, res));
    },
  };
}

function applyQuake(s, power) {
  const collapsed = [], damaged = [];
  for (const p of s.projects) {
    if (p.collapsed) continue;
    if (!p.done && !(p.phase === "insaat" && p.progress > 40) && p.phase !== "satis" && p.phase !== "teslim") continue;
    const weak = clamp((58 - p.kalite) / 58, 0, 1) + (p.flags.kolonKesildi || s.flags.kolonKesildi && rnd() < 0.3 ? 0.3 : 0);
    if (weak <= 0) continue;
    const roll = rnd();
    if (roll < weak * power * 1.1) {
      p.collapsed = true; p.done = true; p.phase = "bitti"; p.doneAt = s.t;
      p.olu = Math.max(1, Math.round(p.daire * (p.done ? 2.4 : 1) * power * (0.6 + rnd() * 0.6)));
      s.olu += p.olu; s.cokme++; s.m += p.olu * 3;
      s.r = clamp(s.r + 30 + Math.min(40, p.olu / 2), 0, 100); s.v = clamp(s.v - 30, 0, 100); s.i = clamp(s.i - 30, 0, 100);
      collapsed.push(p);
      pushLog(s, `${p.name} depremde yıkıldı. ${p.olu} kişi hayatını kaybetti.`);
    } else if (roll < weak * power * 2.2) {
      p.hasar = true; s.i = clamp(s.i - 6, 0, 100); s.r = clamp(s.r + 6, 0, 100);
      damaged.push(p);
    }
  }
  return { collapsed, damaged };
}

function afterQuakeCard(s, res) {
  const olu = res.collapsed.reduce((a, p) => a + p.olu, 0);
  return {
    kind: "sys", phase: "kacis", title: "Gözaltı Kararı",
    text: `Yaptığın ${res.collapsed.length} bina yıkıldı, ${olu} kişi hayatını kaybetti. Bilirkişiler enkazdan beton ve demir numunesi alıyor. Savcılık seni arıyor.`,
    ders: "Depremde yıkılan binalarla ilgili davalarda müteahhit, fenni mesul, yapı denetim ve bazen kamu görevlileri yargılanır. Kaçmaya çalışan müteahhitlerin havalimanlarında yakalandığı haberleri kamuoyunun hafızasındadır.",
    choices: [
      { label: "Teslim ol", fx: "E:itiraf", result: "Kelepçeler takıldı." },
      { label: "Avukat ordusu tut, suçu yapı denetime yık", fx: "n-8 r-12 v-15", result: "Dosya yıllar sürecek. Aileler adalet bekliyor." },
      { label: "Havalimanına git", fx: "E:kacak", result: "Pasaport kontrolüne yürüyorsun." },
    ],
  };
}

// ---------- Tarihli olaylar ----------
function buildScripted() {
  const at = (y, m) => (y - START_YEAR) * 12 + (m - 1);
  const sys = (title, text, ders, choices) => () => ({ kind: "sys", phase: "genel", title, text, ders, choices });
  return [
    { id: "kd2012", at: at(2012, 6), card: sys("Kentsel Dönüşüm Yasası", "Afet riski altındaki alanların dönüştürülmesine dair yasa yürürlüğe girdi. Eski binalar, yeni arsalar, yeni fırsatlar.", "6306 sayılı Kanun riskli yapıların yenilenmesini düzenler. Dönüşüm hak sahipleri, müteahhit seçerken sermaye, geçmiş işler ve teminat sormalıdır.", [
      { label: "Dönüşüme uzmanlaş, düzgün işler yap", fx: "i+5", result: "Mahallelerde adın duyuluyor." },
      { label: "Hızlı ve çok iş al", fx: "a+5 v-2", result: "Telefonun hiç susmuyor." }]) },
    { id: "af2018", at: at(2018, 6), card: sys("İmar Barışı İlan Edildi", "Kaçak yapılar ve ruhsata aykırı bölümler, bedel karşılığında 'Yapı Kayıt Belgesi' ile kayda alınabilecek.", "İmar afları kâğıttaki kaçağı temizler, betondaki zayıflığı değil. Aftan yararlanan binaların deprem güvenliği ayrıca incelenmelidir.", [
      { label: "Bütün kaçak bölümleri kayda al", fx: "n-1 r-20", result: "Dosyaların temizlendi." },
      { label: "Affa güvenip yeni kaçak katlar planla", fx: "r-10 v-8 F:kacakKat", result: "Nasıl olsa yine af çıkar." },
      { label: "Hiçbir şey yapma", fx: "", result: "Sessizce izledin." }]) },
    { id: "kur2018", at: at(2018, 8), card: sys("Kur Krizi", "Döviz kuru bir ayda rekor kırdı. Demir ve çimento fiyatları uçtu; döviz borcu olan müteahhitler konkordato kuyruğunda.", "Döviz borcu olan inşaat firmaları kur şoklarında hızla batabilir; bu da yarım kalan projeler ve mağdur alıcılar demektir.", [
      { label: "Maliyeti üstlen, söz verdiğin kaliteyi koru", fx: "n-3 i+5", result: "Zor ama onurlu." },
      { label: "Kaliteyi düşür", fx: "n+1 v-6 F:kurKalite", result: "Görünmeyen yerlerden kısıldı." },
      { label: "Konkordatoya başvur", fx: "b-4 i-10 g-10 r+3", result: "Alacaklılar bekleyecek." }],
    ), onlyIf: null },
    { id: "pandemi", at: at(2020, 3), card: sys("Salgın", "Küresel bir salgın başladı. Şantiyeler yavaşladı, satış ofisleri kapandı.", "Kriz dönemlerinde işçi hakları ve iş sağlığı önlemleri daha da önemlidir.", [
      { label: "Önlemleri al, maaşları öde", fx: "n-2 e+10", result: "Ekip seninle." },
      { label: "Ekibi ücretsiz izne çıkar", fx: "e-12 n+1", result: "Ustalar memlekete döndü." }]) },
    { id: "patlama2022", at: at(2022, 3), card: sys("Konut Fiyatları Patladı", "Enflasyon ve düşük faizle konut fiyatları rekor kırıyor. Herkes ev almak için sıraya girdi.", "Fiyat balonlarında ilk ev alıcıları ve kiracılar en çok zarar görenlerdir. Acele eden alıcılar yapı güvenliğini sorgulamayı unutabilir.", [
      { label: "Fırsattan makul faydalan", fx: "a+25 i+2", result: "Kasa dolmaya başladı." },
      { label: "Fiyatları haftalık artır", fx: "a+40 i-4", result: "Kâr marjı rekor." }]) },
    { id: "deprem2023", at: at(2023, 2), card: (s) => quakeCard(s, 1.0, true) },
    { id: "yargi2024", at: at(2024, 4), card: sys("Deprem Davaları", "Büyük depremin ardından yüzlerce müteahhit, yapı denetimci ve mühendis hakkında dava açıldı. Sektörde herkes geçmiş dosyalarını karıştırıyor.", "Deprem sonrası yargılamalar, kamuoyunun yapı güvenliğine dair farkındalığını artırdı. Alıcılar artık beton test raporlarını sorar oldu.", [
      { label: "Eski binalarını baştan incelet, gerekirse güçlendir", fx: "n-3 i+8 v+6", result: "Birkaç binada güçlendirme başlattın." },
      { label: "Arşivleri temizle", fx: "r+5 v-8", result: "Evrak kamyonla gitti." }]) },
    { id: "enf2025", at: at(2025, 9), card: sys("Maliyet Enflasyonu", "İnşaat maliyet endeksi yıllık %60'ın üstünde. Sabit fiyatla satılmış daireler zarar yazıyor.", "Yüksek enflasyonda müteahhitlerin 'fiyat farkı' talepleri ve yarım kalan projeler artar.", [
      { label: "Zararı üstlen", fx: "n-3 i+4", result: "Söz sözdür." },
      { label: "Alıcılardan fark iste", fx: "n+1 i-6 m+3", result: "Alıcılar öfkeli." }]) },
  ];
}

// ---------- Sonlar ----------
export const ENDINGS = {
  kacak: { title: "Yurt Dışına Kaçtın", tone: "gri", text: "Uçak kalktığında arkanda yarım binalar, satılmış ama teslim edilmemiş daireler, ödenmemiş hakedişler ve tapuda karşılaştığı sürprizle yıkılan arsa sahipleri kaldı. Oyun açısından 'kazandın': paralar seninle. Gerçek hayatta ise mağdurlar yıllarca kırmızı bülten, iade talebi ve dava dosyalarıyla uğraşır." },
  iade: { title: "Kırmızı Bülten", tone: "kotu", text: "Kaçtın ama uzağa gidemedin. Hakkında çıkarılan kırmızı bültenle yakalanıp Türkiye'ye iade edildin. Havalimanında kameralar seni bekliyordu." },
  hapis: { title: "Cezaevi", tone: "kotu", text: "Dosyalar birikti: mükerrer satış, sahte belge, vergi kaçakçılığı, nitelikli dolandırıcılık. Mahkeme her mağdur için ayrı ceza verdi." },
  deprem: { title: "Enkazın Hesabı", tone: "kotu", text: "Yaptığın binalar depremde yıkıldı. Bilirkişi raporları kesilen kolonları, yetersiz betonu, eksik etriyeleri tek tek sıraladı. Hiçbir ceza, kaybedilen hayatları geri getirmedi." },
  itiraf: { title: "Teslim Oldun", tone: "gri", text: "Savcılığa kendi ayağınla gittin ve her şeyi anlattın. Etkin pişmanlık, mağdurların bir kısmının alacaklarını alabilmesini sağladı. Hapis cezası kaçınılmaz ama en azından kaçmadın." },
  iflas: { title: "Konkordato ve İflas", tone: "kotu", text: "Çark durdu. Borçlar varlıkları aştı; bankalar, tedarikçiler, ustalar ve alıcılar kapında. Şirketin iflas etti; arkanda yarım binalar kaldı." },
  kovuldun: { title: "Mahallede Adın Çıktı", tone: "kotu", text: "İtibarın sıfırlandı. Hiçbir arsa sahibi seninle çalışmıyor, hiçbir emlakçı daireni satmıyor. Müteahhitlik kariyerin sessizce bitti." },
  yatirimci: { title: "Kasa Boş, Kapı Kapalı", tone: "kotu", text: "Yatırımcıların hepsi sana sırtını döndü. Sermaye olmadan tek bir temel bile atamıyorsun." },
  patron: { title: "Saygın İnşaat Patronu", tone: "iyi", text: "Yıllar süren emekle büyük bir inşaat şirketi kurdun. Binaların sağlam, sözlerin tutuldu. Zor yoldan ama gerçek bir başarı." },
  baron: { title: "Dokunulmaz Baron", tone: "gri", text: "Zengin oldun. Kimse sana dokunamadı. Ödüllerin, reklamların, siyasetçi dostların var. Mağdurlarının listesi de var; ama onlar haber bültenlerine çıkamıyor. Bu oyunda kötüler de kazanabilir; gerçek hayatta da bazen kazanıyorlar. Farkındalık, bunu değiştirmenin ilk adımı." },
  emekli: { title: "Emekli Müteahhit", tone: "iyi", text: "Uzun bir kariyerin sonunda emekli oldun. Arkanda bıraktığın binalar senin gerçek karnen." },
  siyaset: { title: "Siyasete Atıldın", tone: "gri", text: "Belediye meclisine girdin ve imar komisyonunda yerini aldın. Artık kuralları uygulayan değil, yazan taraftasın. Çıkar çatışması mı? O da ne?" },
};

export function checkEnding(s) {
  if (s.pendingEnding) {
    const e = s.pendingEnding;
    s.pendingEnding = null;
    return e;
  }
  if (s.escape) return null;
  if (s.r >= 100) return s.olu > 0 ? "deprem" : "hapis";
  // Temiz sicilli firmaya alacaklılar daha uzun süre tanır
  if (netWorth(s) < -(ahlak(s) >= 70 && s.m < 8 ? 46 : 40) * maxScale(s)) return "iflas";
  if (s.i <= 0 && netWorth(s) < 150) return "kovuldun";
  if (s.g <= 0 && netWorth(s) < 150) return "yatirimci";
  if (s.finalStarted) return null;
  if (netWorth(s) >= 600 && s.completed >= 5) return s.m > 30 || s.vergi > 25 || s.v < 30 ? "baron" : "patron";
  if (yearOf(s.t) >= END_YEAR) return "emekli";
  return null;
}

export function fmt(x) {
  const a = Math.abs(x);
  const str = a >= 100 ? a.toFixed(0) : a >= 10 ? a.toFixed(1) : a.toFixed(2);
  return `${x < 0 ? "−" : ""}${str.replace(".", ",")} M₺`;
}

// ---------- Kayıt ----------
const SAVE_KEY = "muteahhit-save-v1";
export function save(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* yok say */ } }
export function load() { try { const j = localStorage.getItem(SAVE_KEY); return j ? JSON.parse(j) : null; } catch (e) { return null; } }
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* yok say */ } }
