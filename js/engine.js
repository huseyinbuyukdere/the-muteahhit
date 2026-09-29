// THE MÜTEAHHİT — oyun motoru: durum, senaryo havuzu, etkiler, projeler, sonlar.
import ARSA from './data/arsa.js';
import YATIRIM from './data/yatirim.js';
import INSAAT from './data/insaat.js';
import SATIS from './data/satis.js';
import GENEL from './data/genel.js';
import { CARK, KACIS, TESLIM } from './data/cark.js';
import { NAMES, SEMTLER, PROJE_ADLARI, TWISTS } from './data/names.js';

export const TEMPLATES = { arsa: ARSA, yatirim: YATIRIM, insaat: INSAAT, satis: SATIS, teslim: TESLIM, cark: CARK, kacis: KACIS, genel: GENEL };
export const VARIANTS = 5;
export const PHASE_LABEL = { arsa: "Arsa Sahipleri", yatirim: "Yatırımcı", insaat: "İnşaat", satis: "Satış", teslim: "Teslim", cark: "Çark", kacis: "Kaçış", genel: "Gündem", sistem: "Karar", bitti: "Teslim Edildi" };
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
export function newGame() {
  return {
    t: 0, n: 8, b: 0, i: 55, g: 50, e: 55, r: 5, v: 70, m: 0,
    vergi: 0, market: 1, projects: [], completed: 0, daireTeslim: 0, cokme: 0, olu: 0,
    flags: {}, recent: [], used: {}, seq: 1, queue: [], log: [], news: [], maxTier: 0,
    scriptedDone: {}, lastKacis: -99, lastWarn: -99, ending: null,
  };
}

export const activeProjects = (s) => s.projects.filter((p) => !p.done && !p.collapsed);
export const maxScale = (s) => Math.max(1, ...activeProjects(s).map((p) => p.scale), TIERS[s.maxTier].scale * 0.5);
export const netWorth = (s) => s.n - s.b;
export const contractorUnits = (p) => Math.round((p.daire * (100 - p.pay)) / 100);
export const unitPrice = (s, p) => 7.5 * s.market * (0.7 + p.kalite / 350 + s.i / 350);
const costPerStep = (p) => (p.daire * 2.0 * (0.55 + p.kalite / 220)) / STEPS.insaat;

export function unlockedTiers(s) {
  const t = [0];
  if (s.completed >= 2 || (s.completed >= 1 && s.i >= 70)) t.push(1);
  if (s.completed >= 4 && s.maxTier >= 1) t.push(2);
  return t;
}
export const maxConcurrent = (s) => Math.min(4, 1 + Math.floor(s.completed / 2));
export const canStartProject = (s) => activeProjects(s).length < maxConcurrent(s) && s.i >= 15 && !s.ending;
export const canFlee = (s) => !s.ending && (s.r >= 50 || netWorth(s) < -12 * maxScale(s) || s.flags.kacisHazir);

export function unvan(s) {
  const w = netWorth(s);
  if (s.completed === 0) return "Kalfa Bozuntusu";
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
    phase: "arsa", step: 0, progress: 0, kalite: 65, pay: 50, onSatis: 0, satilan: 0, gecikme: 0, sahip: 60,
    yatirim: 0, flags: {}, slot: freeSlot(s), start: s.t, lastTurn: s.t, collapsed: false, hasar: false, done: false,
  };
  s.n -= T.fee;
  s.projects.push(p);
  s.maxTier = Math.max(s.maxTier, tier);
  pushLog(s, `${p.semt}'da ${p.name} için arsa arayışı başladı.`);
  return p;
}

function pushLog(s, txt) { s.log.unshift(`${dateLabel(s.t)} — ${txt}`); s.log.length = Math.min(s.log.length, 40); }
function pushNews(s, txt) { s.news.unshift(txt); s.news.length = Math.min(s.news.length, 12); }

// ---------- Kart üretimi ----------
function qOk(s, q, proj) {
  if (!q) return true;
  if (q.startsWith("F:")) return !!s.flags[q.slice(2)];
  if (q.startsWith("P:")) return !!(proj && proj.flags[q.slice(2)]);
  if (q === "onsatis") return !!(proj && proj.onSatis > 0);
  if (q === "nosatis") return !!(proj && proj.onSatis === 0 && proj.phase === "insaat");
  return true;
}

function pickVariant(s, ph, proj) {
  const all = POOL[ph].filter((e) => qOk(s, e.tpl.q, proj));
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
  return {
    kind: "tpl", phase: ph, id: e.id, key: `${e.ph}-${e.idx}`, projId: proj ? proj.id : null,
    title: fill(t.t, e.names, proj, s), text: fill(t.x, e.names, proj, s), twist: e.twist.t, twistM: e.twist.m, ders: t.d,
    choices: t.c.map(([label, fx, result]) => ({ label: fill(label, e.names, proj, s), fx, result: fill(result, e.names, proj, s) })),
  };
}

export function newProjectCard(s, forced) {
  const tiers = unlockedTiers(s);
  const choices = tiers.slice(-3).reverse().map((tier) => {
    const T = TIERS[tier];
    const semt = pick(SEMTLER), ad = pick(PROJE_ADLARI);
    return {
      label: `${semt}'da ${T.ad} (${T.daire} daire) — ${fmt(T.fee)} ön masraf`,
      act: { type: "newProject", tier, semt, ad },
      result: `${semt}'da yeni bir ${T.ad.toLowerCase()} işi için arsa sahipleriyle görüşmeler başlıyor.`,
    };
  });
  choices.push(forced
    ? { label: "Bir ay dinlen, piyasayı izle", fx: "v+2", result: "Bir ay boyunca hiçbir şey yapmadın. Faizler işlemeye devam etti." }
    : { label: "Şimdilik vazgeç", fx: "", result: "Eldeki işlere odaklanıyorsun.", act: { type: "cancel" } });
  return {
    kind: "sys", phase: "sistem", title: forced ? "Yeni Bir Arsa Lazım" : "Yeni Proje",
    text: forced
      ? "Elinde yürüyen iş yok. Mahallede kulağına birkaç müsait arsa fısıldandı. Hangisine gireceksin?"
      : "Yeni bir işe girmek nakit getirir ama eldeki işleri yavaşlatır. Çok fazla işe girmek, çarkın bozulmasının ilk adımıdır.",
    ders: "Müteahhitler aynı anda çok fazla projeye girdiğinde, bir projenin parası diğerine aktarılır; bu zincir koptuğunda yarım binalar ve mağdurlar ortaya çıkar.",
    choices, noStep: !forced,
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
  if (rnd() < 0.16) return tplCard(s, "genel", pick(act));
  // en uzun süredir ilgilenilmeyen projeye öncelik
  const proj = act.slice().sort((a, b) => a.lastTurn - b.lastTurn)[0];
  const ph = proj.phase === "teslim" ? "satis" : proj.phase;
  return tplCard(s, ph, proj);
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
export function resolve(s, card, idx) {
  const ch = card.choices[idx];
  const proj = card.projId != null ? s.projects.find((p) => p.id === card.projId) : null;
  const scale = proj ? proj.scale : maxScale(s);
  const deltas = [];
  const events = [];
  let newProj = null;

  if (card.kind === "tpl") { s.used[card.id] = true; s.recent.push(card.key); if (s.recent.length > 30) s.recent.shift(); }
  if (ch.act?.type === "newProject") newProj = createProject(s, ch.act.tier, ch.act.semt, ch.act.ad);
  if (ch.act?.type === "cancel") return { result: ch.result, deltas, events, ders: card.ders, noTime: true };
  if (ch.act?.type === "quakeFx") applyFx(s, ch.fx, null, null, maxScale(s), deltas);
  else applyFx(s, ch.fx, proj, card.twistM, scale, deltas);
  if (card.onResolve) card.onResolve(s, idx, events);

  // Faz ilerlemesi: kart, projenin o anki fazına aitse proje bir adım ilerler.
  if (proj && card.phase === proj.phase && !proj.done) stepProject(s, proj, events);
  if (proj && card.phase === "satis" && proj.phase === "teslim") { /* teslim kartı kuyrukta */ }
  if (card.phase === "teslim" && proj && !proj.done) finalizeProject(s, proj, events);

  // Kartın ait olmadığı fazdaki proje de ilgilenildi sayılır (çark/genel)
  if (proj) proj.lastTurn = s.t;

  // Mükerrer satış / genel vekalet gibi kararlar haber olarak düşer
  newsFromChoice(s, card, ch, proj);

  if (!card.noStep) monthly(s, proj, events);
  if (newProj) events.push(["info", `${newProj.name} (${newProj.semt}) portföye eklendi.`]);
  s.ending = checkEnding(s);
  return { result: ch.result, deltas, events, ders: card.ders };
}

function stepProject(s, p, events) {
  p.step++;
  if (p.phase === "arsa" && p.step >= STEPS.arsa) toPhase(s, p, "yatirim", events);
  else if (p.phase === "yatirim" && p.step >= STEPS.yatirim) toPhase(s, p, "insaat", events);
  else if (p.phase === "insaat") {
    const cost = costPerStep(p) * (s.flags.kurKalite ? 1.0 : 1) * (0.9 + s.market * 0.1);
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
  if (s.b > 0) { const f = s.b * 0.012; s.n -= f; events.push(["faiz", -f]); }
  if (s.n < 0) { const f = -s.n * 0.015; s.n -= f; }
  // Kasada fazla para varsa banka borcunun bir kısmı otomatik kapanır
  const tampon = 4 * maxScale(s);
  if (s.b > 0 && s.n > tampon) { const od = Math.min(s.b, (s.n - tampon) * 0.4); s.n -= od; s.b -= od; }
  for (const p of activeProjects(s)) {
    if (p === touched) continue;
    if (p.phase === "insaat" && rnd() < 0.3) { p.gecikme += 1; p.sahip = clamp(p.sahip - 1, 0, 100); }
  }
  s.market = clamp(s.market * (1 + (rnd() - 0.47) * 0.03), 0.5, 3);
  s.r = Math.max(0, s.r - 0.7);
  s.e += (55 - s.e) * 0.03;
  // Senaryolu olaylar (tarihe bağlı)
  for (const ev of SCRIPTED) {
    if (!s.scriptedDone[ev.id] && s.t >= ev.at) { s.scriptedDone[ev.id] = true; s.queue.push(ev.card(s)); }
  }
  // Rastgele küçük/orta deprem
  if (s.t > 18 && rnd() < 1 / 110) s.queue.push(quakeCard(s, 0.35 + rnd() * 0.3, false));
  // Uyarılar
  const ms = maxScale(s);
  if (netWorth(s) < -28 * ms && s.t - s.lastWarn > 8) { s.lastWarn = s.t; s.lastKacis = s.t; s.queue.push(tplCard(s, "kacis", pick(activeProjects(s)) || null)); }
  if (s.v <= 0 && !s.flags.vicdanUyari) { s.flags.vicdanUyari = true; s.queue.push(mirrorCard()); }
  if (s.e <= 4 && activeProjects(s).some((p) => p.phase === "insaat")) s.queue.push(strikeCard(s));
}

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
  if (/F:cark/.test(fx)) pushNews(s, `${sm}'da yarım kalan inşaatın arsa sahipleri eylemde`);
}

// ---------- Özel kartlar ----------
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
    let e = s.pendingEnding;
    s.pendingEnding = null;
    if (e === "kacak") {
      const chance = Math.min(0.75, s.r / 180 + (s.olu > 0 ? 0.35 : 0) + (s.m > 150 ? 0.15 : 0));
      e = rnd() < chance ? "iade" : "kacak";
      s.kacirilan = Math.max(0, s.n);
    }
    return e;
  }
  if (s.r >= 100) return s.olu > 0 ? "deprem" : "hapis";
  if (netWorth(s) < -40 * maxScale(s)) return "iflas";
  if (s.i <= 0 && netWorth(s) < 150) return "kovuldun";
  if (s.g <= 0 && netWorth(s) < 150) return "yatirimci";
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
