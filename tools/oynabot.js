// Tarayıcıda oyunu baştan sona otomatik oynayan test botu.
// Kullanım (konsolda): const B = await import('/tools/oynabot.js'); B.oyna(600, 'rnd'); sonra window.__sonuc'a bak.
// strat: 'rnd' rastgele seçer, 'ilk' hep ilk seçeneği seçer. Gazeteleri kapatır, mini oyunlarda rastgele düğmeye basar.
export async function oyna(maxK = 600, strat = 'rnd') {
  const S = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = []; let stuck = 0, last = '', gz = 0, mini = 0;
  for (let k = 0; k < maxK; k++) {
    const g = document.querySelector('.gazete-ort:not(.gidiyor)');
    if (g) { gz++; log.push('GAZETE: ' + g.querySelector('.gz-baslik').textContent); await S(500); g.click(); await S(400); continue; }
    if (!document.getElementById('ending').classList.contains('hidden')) { log.push('SON: ' + document.querySelector('#endingBody h2').textContent); break; }
    const m = document.getElementById('mini');
    if (m && m.offsetWidth > 0 && !m.classList.contains('hidden')) { mini++; const b = [...m.querySelectorAll('button')].filter((b) => b.offsetParent); if (b.length) b[Math.floor(Math.random() * b.length)].click(); await S(400); continue; }
    const ch = [...document.querySelectorAll('#choices button')].filter((b) => b.offsetParent);
    const dv = document.getElementById('devamBtn');
    if (ch.length) {
      const t = document.getElementById('cardTitle').textContent;
      if (t === last) stuck++; else stuck = 0;
      last = t;
      const i = strat === 'ilk' ? 0 : Math.floor(Math.random() * ch.length);
      ch[i].click(); await S(150); log.push(window.muteahhit.state.t + ' ' + t);
    } else if (dv && dv.offsetParent) { dv.click(); await S(150); } else { await S(500); stuck++; }
    if (stuck > 20) { log.push('TAKILDI: ' + last); break; }
  }
  const kart = log.filter((l) => /^\d/.test(l)).map((l) => l.replace(/^\d+ /, ''));
  const say = kart.reduce((a, t) => ((a[t] = (a[t] || 0) + 1), a), {});
  const s = window.muteahhit.state;
  window.__sonuc = { gz, mini, ay: s.t, kart: kart.length, farkli: Object.keys(say).length, tekrar: Object.entries(say).filter((e) => e[1] > 2).sort((a, b) => b[1] - a[1]).slice(0, 15), son: log.slice(-3), gazeteler: log.filter((l) => l.startsWith('GAZETE')) };
  return window.__sonuc;
}
