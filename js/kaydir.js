// Telefonda kartı parmakla kaydırarak seçme.
// Seçeneği tut, sağa ya da sola kaydır: kart da onunla birlikte eğilir, eşiği geçince o seçenek seçilir.
// Sonuç ekranında kartı yana atmak "Devam" demektir. Masaüstünde fare ve tuşlar eskisi gibi çalışır.
const IPUCU_KEY = 'muteahhit-kaydir-ipucu';
let son = 0;

// Kaydırma bittikten hemen sonra gelen "tıklama"yı yok saymak için
export const yeniKaydirildi = () => performance.now() - son < 450;

export function ipucuGoster() {
  if (!matchMedia('(pointer: coarse)').matches) return false;
  try { const n = +(localStorage.getItem(IPUCU_KEY) || 0); return n < 4; } catch { return false; }
}
function ipucuSay() {
  try { localStorage.setItem(IPUCU_KEY, String(+(localStorage.getItem(IPUCU_KEY) || 0) + 1)); } catch { /* yok say */ }
}
export function ipucuBitti() { try { localStorage.setItem(IPUCU_KEY, '9'); } catch { /* yok say */ } }

export function kur(card, { mod, sec, devam }) {
  let p = null; // { id, x0, y0, eksen, btn, i, w }
  const sifirla = (anim = true) => {
    card.style.transition = anim ? 'transform .25s cubic-bezier(.2,1.4,.4,1), opacity .2s' : 'none';
    card.style.transform = '';
    card.style.opacity = '';
    card.querySelectorAll('.choices button').forEach((b) => { b.classList.remove('kayan', 'hazir'); b.style.removeProperty('--k'); });
    card.classList.remove('kayiyor');
  };
  const at = (yon, sonra) => {
    son = performance.now();
    card.style.transition = 'transform .2s ease-in, opacity .2s ease-in';
    card.style.transform = `translateX(${yon * 115}%) rotate(${yon * 14}deg)`;
    card.style.opacity = '0';
    if (navigator.vibrate) try { navigator.vibrate(12); } catch { /* yok say */ }
    setTimeout(() => {
      sonra();
      // Kart karşı taraftan geri gelir
      card.style.transition = 'none';
      card.style.transform = `translateX(${-yon * 30}px)`;
      card.style.opacity = '0';
      void card.offsetWidth;
      sifirla(true);
      setTimeout(() => (card.style.transition = ''), 300);
    }, 190);
  };

  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || p) return;
    const m = mod();
    if (m !== 'choose' && m !== 'result') return;
    if (e.target.closest('details, summary, a, input')) return;
    const btn = m === 'choose' ? e.target.closest('.choices button') : null;
    p = { id: e.pointerId, x0: e.clientX, y0: e.clientY, eksen: null, btn, i: btn ? [...btn.parentNode.children].indexOf(btn) : -1, w: card.offsetWidth, m };
  });
  card.addEventListener('pointermove', (e) => {
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
    if (!p.eksen) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { p = null; return; }
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        p.eksen = 'x';
        try { card.setPointerCapture(e.pointerId); } catch { /* yok say */ }
        card.style.transition = 'none';
        card.classList.add('kayiyor');
        if (p.btn) p.btn.classList.add('kayan');
      } else return;
    }
    const esik = Math.max(80, p.w * 0.28);
    const k = Math.min(1, Math.abs(dx) / esik);
    // Seçeneğe dokunmadan kaydırırsan kart biraz direnir
    const x = p.btn || p.m === 'result' ? dx : dx * 0.35;
    card.style.transform = `translateX(${x}px) rotate(${x * 0.025}deg)`;
    if (p.btn) {
      p.btn.style.setProperty('--k', k.toFixed(2));
      const h = k >= 1;
      if (h !== p.btn.classList.contains('hazir')) {
        p.btn.classList.toggle('hazir', h);
        if (h && navigator.vibrate) try { navigator.vibrate(8); } catch { /* yok say */ }
      }
    }
  });
  const bitir = (e) => {
    if (!p || e.pointerId !== p.id) return;
    const q = p; p = null;
    if (q.eksen !== 'x') return;
    son = performance.now();
    const dx = e.clientX - q.x0, yon = Math.sign(dx) || 1;
    const esik = Math.max(80, q.w * 0.28);
    if (e.type === 'pointerup' && Math.abs(dx) >= esik && mod() === q.m) {
      if (q.m === 'choose' && q.i >= 0) { ipucuSay(); return at(yon, () => sec(q.i)); }
      if (q.m === 'result') return at(yon, devam);
    }
    sifirla(true);
    if (q.m === 'choose' && q.i < 0) {
      // Boş yerden kaydırdı: hangi şeyi kaydıracağını göster
      const ilk = card.querySelector('.choices button');
      if (ilk) { ilk.classList.remove('durt'); void ilk.offsetWidth; ilk.classList.add('durt'); }
    }
  };
  card.addEventListener('pointerup', bitir);
  card.addEventListener('pointercancel', bitir);
}
