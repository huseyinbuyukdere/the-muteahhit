// Otomatik oyun simülasyonu: farklı oyuncu tiplerinin sonlarını ve servetini ölçer.
// Kullanım: node tools/sim.mjs [oyunSayısı]
import * as E from '../js/engine.js';

const N = +process.argv[2] || 300;
const tok = (fx) => {
  const o = {};
  for (const t of (fx || '').trim().split(/\s+/)) { const m = t.match(/^([a-z])([+-]\d+(?:\.\d+)?)$/); if (m) o[m[1]] = (o[m[1]] || 0) + parseFloat(m[2]); else if (t) o[t] = 1; }
  return o;
};
const W = {
  durust: { v: 2, i: 1.2, s: 0.5, r: -1, m: -4, n: 0.8, e: 0.4, k: 0.6, g: 0.4 },
  cakal: { n: 3, y: 1.5, o: 0.3, x: 2, v: 0, r: -0.6, i: 0.4, g: 0.5, m: 0 },
  karma: { n: 1.5, i: 1, v: 0.6, r: -0.8, m: -1, g: 0.5, e: 0.3, k: 0.3 },
};
function score(pol, ch, s, card) {
  if (pol === 'rastgele') return Math.random();
  const f = tok(ch.fx), w = W[pol];
  let sc = Math.random() * 0.5;
  const pj = card && card.projId != null ? s.projects.find((p) => p.id === card.projId) : null;
  const sca = (card && card.scale) || (pj ? pj.scale : E.maxScale(s));
  for (const [k, v] of Object.entries(f)) if (w[k] != null) sc += w[k] * v * ('nbxy'.includes(k) ? Math.sqrt(sca) : 1);
  if (f['E:itiraf'] || f['E:hapis']) sc -= pol === 'durust' && s.r > 60 ? 2 : 90;
  if (f['E:kacak']) sc += pol === 'cakal' && s.r > 60 ? 30 : -40;
  const a = ch.act || {};
  if (a.type === 'gamble') sc += pol === 'cakal' ? 3 : -1;
  if (a.type === 'newProject') sc += 5 + a.tier * (s.n > 20 ? 3 : -3);
  if (a.type === 'cancel') sc -= 3;
  if (a.type === 'esc') sc += (a.cash || 0) * (pol === 'cakal' ? 1 : 0) - (a.heat || 0) * 0.2 + (a.end ? 0 : 0);
  if (a.type === 'redeem') sc += pol === 'durust' ? 20 : -5;
  if (a.type === 'legacy') sc += Math.random() * 3;
  if (a.type === 'buy') sc += pol === 'cakal' ? 4 : -2;
  if (a.type === 'yapilandir') sc += 6;
  if (a.type === 'devret') sc += 3;
  if (a.type === 'mini') sc += pol === 'durust' ? 3 : pol === 'karma' ? 1.5 : 0;
  return sc;
}
function play(pol) {
  const s = E.newGame(process.env.START); s.firma = 'Test';
  let card = E.drawCard(s), guard = 0;
  while (!s.ending && guard++ < 2000) {
    if (E.canStartProject(s) && s.n > 6 && Math.random() < 0.08) { s.queue.unshift(card); card = E.newProjectCard(s, false); }
    if (pol === 'cakal' && E.canFlee(s) && s.r > 75 && Math.random() < 0.2 && card.phase !== 'kacis') { s.queue.unshift(card); card = E.fleeCard(s); }
    if (pol === 'cakal') for (const k of Object.keys(E.LUX)) if (E.canBuy(s, k) && s.n > E.LUX[k].fiyat * 2) E.buyLux(s, k);
    if (E.sosyalTurn && !process.env.NOSOS) E.sosyalTurn(s, pol);
    let best = 0, bs = -1e9;
    card.choices.forEach((ch, i) => { const v = score(pol, ch, s, card); if (v > bs) { bs = v; best = i; } });
    const skill = { durust: 0.35, karma: 0.2, cakal: 0.1, rastgele: 0 }[pol];
    E.resolve(s, card, best, { score: skill + Math.random() * (1 - skill) });
    if (s.ending) break;
    card = E.drawCard(s);
  }
  return s;
}
const out = {};
for (const pol of ['durust', 'karma', 'cakal', 'rastgele']) {
  const ends = {}; let nw = 0, yil = 0, comp = 0, mag = 0, olu = 0;
  for (let i = 0; i < N; i++) {
    const s = play(pol);
    ends[s.ending || 'yok'] = (ends[s.ending || 'yok'] || 0) + 1;
    nw += E.netWorth(s); yil += E.yearOf(s.t); comp += s.completed; mag += s.m; olu += s.olu;
  }
  const pct = Object.fromEntries(Object.entries(ends).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round((v / N) * 100) + '%']));
  out[pol] = { sonlar: pct, servet: Math.round(nw / N), yil: Math.round(yil / N), proje: +(comp / N).toFixed(1), magdur: Math.round(mag / N), olu: +(olu / N).toFixed(1) };
}
console.log(JSON.stringify(out, null, 1));
