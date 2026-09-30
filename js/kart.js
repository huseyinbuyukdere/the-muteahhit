// Oyun sonu paylaşım kartı: 1080×1350 PNG (Instagram dikey boyutu). Tamamen tuval üzerinde çizilir.
const W = 1080, H = 1350;
const SARI = '#f4c20d', KOYU = '#15171c', PANEL = '#20242c', ACIK = '#eceae4', SOLUK = '#9aa0aa';
const TON = { iyi: '#7fd48b', kotu: '#ff6369', gri: '#d0d0d0' };
const SITE = 'huseyinbuyukdere.github.io/the-muteahhit';

function sar(ctx, text, x, y, maxW, lh, maxLines) {
  const words = String(text).split(/\s+/);
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const t = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(t).width > maxW && line) {
      if (++n === maxLines) { ctx.fillText(`${line}…`, x, y); return y + lh; }
      ctx.fillText(line, x, y); y += lh; line = words[i];
    } else line = t;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

function yuvarlak(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function silüet(ctx, seed, tone) {
  let r = seed || 7;
  const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  ctx.save();
  for (let x = 0; x < W; ) {
    const w = 50 + rnd() * 90, h = 90 + rnd() * 240;
    ctx.fillStyle = '#1d2129'; ctx.fillRect(x, H - 150 - h, w - 6, h);
    ctx.fillStyle = tone === 'kotu' ? 'rgba(255,99,105,0.35)' : 'rgba(244,194,13,0.45)';
    for (let wy = H - 140 - h; wy < H - 170; wy += 26) for (let wx = x + 10; wx < x + w - 20; wx += 20) if (rnd() < 0.45) ctx.fillRect(wx, wy, 8, 12);
    x += w;
  }
  ctx.restore();
}

export async function sonKarti(s, o) {
  try { await document.fonts.ready; } catch { /* yok say */ }
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const tone = o.en.tone || 'gri';
  // Zemin
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0f1115'); g.addColorStop(1, '#1a1d24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  silüet(ctx, (s.firma || 'x').length * 977 + s.t, tone);
  ctx.fillStyle = 'rgba(15,17,21,0.55)'; ctx.fillRect(0, 0, W, H - 150);
  // Şerit
  ctx.fillStyle = SARI; ctx.fillRect(0, 0, W, 16);
  for (let x = -40; x < W; x += 60) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(x, 16); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 20, 16); ctx.fill(); }
  // Başlık
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillStyle = SARI; ctx.font = '96px Anton, Impact, sans-serif'; ctx.fillText('THE MÜTEAHHİT', 64, 140);
  ctx.fillStyle = SOLUK; ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText([s.firma, o.unvan, o.basla].filter(Boolean).join(' · '), 64, 192);
  // Son
  ctx.fillStyle = TON[tone] || ACIK; ctx.font = '76px Anton, Impact, sans-serif';
  let y = sar(ctx, o.en.title.toLocaleUpperCase('tr-TR'), 64, 300, W - 128, 84, 2);
  ctx.fillStyle = ACIK; ctx.font = '30px system-ui, sans-serif';
  y = sar(ctx, o.en.text, 64, y + 6, W - 128, 42, 3);
  // Ahlak karnesi
  y += 24;
  ctx.fillStyle = SOLUK; ctx.font = '600 26px system-ui, sans-serif'; ctx.fillText('AHLAK KARNESİ', 64, y);
  ctx.textAlign = 'right'; ctx.fillStyle = ACIK; ctx.fillText(`${o.etiket} · ${o.ahlak}/100`, W - 64, y); ctx.textAlign = 'left';
  y += 18;
  const bg = ctx.createLinearGradient(64, 0, W - 64, 0);
  bg.addColorStop(0, '#e5484d'); bg.addColorStop(0.5, '#f4c20d'); bg.addColorStop(1, '#46a758');
  yuvarlak(ctx, 64, y, W - 128, 22, 11); ctx.fillStyle = bg; ctx.fill();
  const px = 64 + (W - 128) * (o.ahlak / 100);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, y + 11, 18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.stroke();
  // İstatistikler
  y += 64;
  const st = [[o.tarih, 'Kariyerin sonu'], [s.completed, 'Tamamlanan proje'], [s.daireTeslim, 'Teslim edilen daire'],
    [o.net, 'Net servet'], [s.m.toLocaleString('tr-TR'), 'Mağdur'], [s.olu, 'Can kaybı']];
  const cw = (W - 128 - 2 * 20) / 3, ch = 118;
  st.forEach(([v, l], i) => {
    const x = 64 + (i % 3) * (cw + 20), yy = y + Math.floor(i / 3) * (ch + 18);
    yuvarlak(ctx, x, yy, cw, ch, 18); ctx.fillStyle = PANEL; ctx.fill();
    ctx.fillStyle = (l === 'Mağdur' || l === 'Can kaybı') && +String(v).replace(/\D/g, '') > 0 ? '#ff6369' : ACIK;
    ctx.font = '700 42px system-ui, sans-serif'; ctx.fillText(String(v), x + 22, yy + 58);
    ctx.fillStyle = SOLUK; ctx.font = '24px system-ui, sans-serif'; ctx.fillText(l, x + 22, yy + 96);
  });
  y += 2 * (ch + 18) + 20;
  // Rozetler
  if (o.rozetler && o.rozetler.length) {
    ctx.fillStyle = SOLUK; ctx.font = '600 26px system-ui, sans-serif'; ctx.fillText('KAZANILAN ROZETLER', 64, y); y += 44;
    ctx.font = '600 28px system-ui, sans-serif';
    let x = 64;
    for (const r of o.rozetler.slice(0, 6)) {
      const t = `${r.emoji} ${r.ad}`, w = ctx.measureText(t).width + 36;
      if (x + w > W - 64) { x = 64; y += 58; }
      yuvarlak(ctx, x, y - 34, w, 48, 24); ctx.fillStyle = 'rgba(244,194,13,0.16)'; ctx.fill();
      ctx.fillStyle = SARI; ctx.fillText(t, x + 18, y); x += w + 12;
    }
    y += 40;
  }
  // Alt bilgi
  ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, H - 150, W, 150);
  ctx.fillStyle = ACIK; ctx.font = '600 30px system-ui, sans-serif';
  ctx.fillText('Sen olsan ne yapardın?', 64, H - 92);
  ctx.fillStyle = SARI; ctx.font = '600 28px system-ui, sans-serif'; ctx.fillText(SITE, 64, H - 50);
  ctx.textAlign = 'right'; ctx.fillStyle = SOLUK; ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Ev alırken: iskân, yapı denetim raporu,', W - 64, H - 92);
  ctx.fillText('tapu şerhi ve beton test sonucu sor.', W - 64, H - 60);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'));
}
