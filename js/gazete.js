// Önemli olaylarda kısa "gazete manşeti" ekranı: deprem, ifşa, proje teslimi ve oyun sonları.
// Gazete adı uydurmadır. Kötü haberlerde kısa bir "Gerçek hayatta" korunma notu da çıkar.
import { ekDuzelt } from './ek.js';
const AD = 'ŞANTİYE POSTASI';
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const BUYUK = (t) => ekDuzelt(t).toLocaleUpperCase('tr-TR');

const SON = {
  kacak: ['ÜNLÜ MÜTEAHHİT YURT DIŞINA KAÇTI', 'Yüzlerce aile ne evine ne parasına kavuşabildi', 'kotu', 'Daire alırken parayı tapu devriyle aynı anda öde; tapusu verilmeyen projeye toplu para yatırma.'],
  iade: ['KAÇAK MÜTEAHHİT HAVALİMANINDA YAKALANDI', 'Kırmızı bültenle aranıyordu; mağdurlar adliye önünde', 'kotu', 'Mağdursan hemen avukatla suç duyurusu yap; dosya ne kadar erken açılırsa mal kaçırmak o kadar zorlaşır.'],
  hapis: ['MÜTEAHHİDE MAĞDUR BAŞINA AYRI CEZA', 'Mükerrer satış, sahte belge ve dolandırıcılık dosyaları birleşti', 'kotu', 'Tapu kaydını e-Devlet\'ten kendin kontrol et; aynı daire başkasına da satılmış olabilir.'],
  deprem: ['ENKAZIN HESABI SORULUYOR', 'Bilirkişi: kolon kesilmiş, beton zayıf, denetim kâğıt üstünde', 'kotu', 'Ev alırken yapı denetim raporunu, zemin etüdünü ve beton test sonuçlarını iste.'],
  iflas: ['İNŞAAT FİRMASI İFLAS ETTİ', 'Yarım kalan binaların alıcıları ortada kaldı', 'kotu', 'Kaba inşaatı bitmemiş projede, ödemeyi işin ilerlemesine bağlayan sözleşme yap.'],
  baron: ['"DOKUNULMAZ" MÜTEAHHİT YİNE ÖDÜL ALDI', 'Mağdurların sesi haberlere çıkamıyor', 'kotu', 'Reklam ve ödül güven belgesi değildir; firmanın eski projelerini ve davalarını araştır.'],
  patron: ['SÖZÜNÜ TUTAN MÜTEAHHİT BÜYÜDÜ', 'Binaları depremde ayakta kaldı, alıcılar tapusunu zamanında aldı', 'iyi'],
  emekli: ['USTA MÜTEAHHİT EMEKLİYE AYRILDI', 'Arkasında yıllarca ayakta kalacak binalar bıraktı', 'iyi'],
};

// Sonuçtan manşet çıkar; yoksa null
export function manset(s, c, res) {
  if (s.ending && SON[s.ending]) {
    const [b, a, ton, ders] = SON[s.ending];
    return { baslik: b, alt: a, ton, ders };
  }
  if (c.quake) {
    const q = s.lastQuake || { collapsed: [], damaged: [] };
    if (q.collapsed.length) {
      const olu = q.collapsed.reduce((t, p) => t + (p.olu || 0), 0);
      const p = q.collapsed[0];
      return { baslik: BUYUK(`${p.semt}'da bina çöktü: ${olu} ölü`), alt: `Binayı ${s.firma || 'aynı müteahhit'} yaptı. Savcılık soruşturma başlattı.`, ton: 'kotu', ders: 'Ev alırken yapı denetim raporunu, zemin etüdünü ve beton test sonuçlarını iste.', foto: 'enkaz' };
    }
    if (q.damaged.length) {
      const p = q.damaged[0];
      return { baslik: BUYUK(`${p.semt}'da bina hasar aldı`), alt: 'Sakinler tahliye edildi; binada çatlaklar var', ton: 'kotu', ders: 'Binanda çatlak varsa belediyeden ya da üniversiteden bağımsız inceleme iste.', foto: 'catlak' };
    }
    if (s.projects.some((p) => p.done && !p.collapsed)) return { baslik: 'DEPREMDE AYAKTA KALDI', alt: `${s.firma || 'Firmanın'} binalarında tek çatlak yok. Sağlam yapmanın karşılığı.`, ton: 'iyi', foto: 'bina' };
    return null;
  }
  const ifsa = res.events.find((e) => e[0] === 'linc' && e[1].startsWith('📸'));
  if (ifsa) {
    const bot = /bot çıktı/.test(ifsa[1]);
    return bot
      ? { baslik: 'TAKİPÇİLERİN ÇOĞU BOT ÇIKTI', alt: `${s.firma || 'Müteahhit'} sosyal medyada satın alınmış hesaplarla büyümüş`, ton: 'kotu', ders: 'Takipçi sayısı güven göstermez; firmanın teslim ettiği binaları gidip gör.', foto: 'telefon' }
      : { baslik: 'MÜTEAHHİDİN YALANI İFŞA OLDU', alt: 'Paylaşımı ile belgeler yan yana kondu', ton: 'kotu', ders: 'Reklamdaki vaadi ruhsat, iskân ve tapu belgeleriyle karşılaştır.', foto: 'telefon' };
  }
  const tamam = res.events.find((e) => e[0] === 'info' && /tamamlandı!/.test(e[1]));
  if (tamam) {
    const p = s.projects.filter((x) => x.done && !x.collapsed).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))[0];
    if (!p) return null;
    const gec = Math.round(p.gecikme || 0);
    if (p.kalite < 45) return { baslik: BUYUK(`${p.semt}'daki yeni binada çatlaklar`), alt: `Teslimden hemen sonra şikâyetler başladı${gec > 3 ? `; ${gec} ay da gecikti` : ''}`, ton: 'kotu', ders: 'Teslimde iskân belgesini ve yapı denetim raporunu iste; eksikleri tutanağa yazdır.', foto: 'catlak' };
    return { baslik: BUYUK(`${p.name} teslim edildi`), alt: `${p.daire} aile anahtarını aldı${gec > 3 ? `, ${gec} ay gecikmeyle` : ', üstelik zamanında'}`, ton: gec > 6 ? 'gri' : 'iyi', foto: 'bina' };
  }
  return null;
}

const FOTO = {
  bina: '<rect x="30" y="18" width="40" height="52" fill="#555"/><g fill="#ddd">' + [0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((k) => `<rect x="${35 + k * 12}" y="${23 + r * 9}" width="6" height="5"/>`).join('')).join('') + '</g><rect x="10" y="70" width="80" height="4" fill="#333"/><path d="M18 70v-8M82 70v-10" stroke="#333" stroke-width="3"/><circle cx="18" cy="58" r="5" fill="#666"/><circle cx="82" cy="56" r="6" fill="#666"/>',
  catlak: '<rect x="30" y="18" width="40" height="52" fill="#555"/><g fill="#ddd">' + [0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((k) => `<rect x="${35 + k * 12}" y="${23 + r * 9}" width="6" height="5"/>`).join('')).join('') + '</g><path d="M52 18l-5 12 7 8-6 11 5 9-4 12" stroke="#111" stroke-width="2.5" fill="none"/><rect x="10" y="70" width="80" height="4" fill="#333"/>',
  enkaz: '<path d="M14 70l10-16 14 6 8-14 16 10 10-8 14 22z" fill="#555"/><path d="M30 56l18-4M52 48l6 14M64 52l12 6" stroke="#222" stroke-width="3"/><rect x="10" y="70" width="80" height="4" fill="#333"/><path d="M22 34q6-10 14-4q8-12 18-2q10-8 18 4" stroke="#888" stroke-width="3" fill="none" opacity=".7"/>',
  telefon: '<rect x="34" y="12" width="32" height="58" rx="5" fill="#333"/><rect x="38" y="18" width="24" height="44" fill="#ccc"/><path d="M41 26h18M41 32h14M41 38h18M41 44h10" stroke="#555" stroke-width="2.5"/><circle cx="50" cy="66" r="2" fill="#888"/><path d="M70 22l8-6M72 32h10M70 42l8 6" stroke="#333" stroke-width="2.5"/>',
};

let acik = null;
// Gazeteyi göster; kapanınca sonra() çalışır
export function goster(m, tarih, sonra) {
  kapat(false);
  const el = document.createElement('div');
  el.className = `gazete-ort ton-${m.ton}`;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Gazete manşeti');
  el.innerHTML = `<div class="gazete">
    <div class="gz-ust"><span>${tarih}</span><b>${AD}</b><span>Fiyatı: 10 TL</span></div>
    <h2 class="gz-baslik">${esc(m.baslik)}</h2>
    <div class="gz-govde">${m.foto ? `<svg viewBox="0 0 100 80" class="gz-foto" aria-hidden="true">${FOTO[m.foto]}</svg>` : ''}<p class="gz-alt">${esc(m.alt)}</p></div>
    ${m.ders ? `<p class="gz-ders">⚠️ <b>Gerçek hayatta:</b> ${esc(m.ders)}</p>` : ''}
    <small class="gz-kapat">Devam etmek için dokun ▸</small>
  </div>`;
  document.body.appendChild(el);
  acik = { el, sonra, t: performance.now() };
  const kapa = () => { if (performance.now() - acik.t > 450) kapat(true); };
  el.addEventListener('click', kapa);
  return true;
}
export const acikMi = () => !!acik;
export function kapat(calistir = true) {
  if (!acik) return;
  const { el, sonra } = acik; acik = null;
  el.classList.add('gidiyor');
  setTimeout(() => el.remove(), 260);
  if (calistir && sonra) sonra();
}
// Tuşla kapatma (Enter, Space, Esc)
export function tus(e) {
  if (!acik) return false;
  if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); if (performance.now() - acik.t > 450) kapat(true); }
  return true;
}
