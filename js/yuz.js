// Konuşan kişiler için küçük, animasyonlu çizim yüzler (emoji yerine).
// Aynı isim hep aynı yüzü alır. İfadeler: konuş (ağız oynar), mutlu, kızgın. Gözler arada bir kırpar.
// İnsan olmayan konuşmacılarda (evrak, telefon, bina…) eski emoji kalır.

const INSAN = new Set(['🧓', '👴', '👵', '👩‍🦳', '👷', '🦺', '💼', '🤵', '🎩', '🏛️', '👨‍👩‍👧', '👨‍👩‍👦', '🎤', '📰', '🧑', '💁‍♀️', '🕶️', '👮', '🚨', '🛂', '⚖️', '✊', '🦊', '💍', '🗣️', '👨', '👩', '🧔', '👨‍💼', '👩‍💼']);
const KADIN = /(Teyze|Hanım|Nine|Abla|Fatma|Hatice|Nazmiye|Müzeyyen|Leyla|Gül\b|Selin|Nur\b|Şerife|Zehra|Ayça|Pınar|Aysel|Ece\b|Emine|Ayşe|Zeynep|Elif|Merve|Sevgi|Hülya|Sibel|Derya|Esra|Dilek|Songül|Melek|Necla|Filiz|Yasemin|Hacer|Gülsüm|Sultan|Kader|Sevim|Nermin|Meryem|Cemile|Fadime|Hanife|Zübeyde|Saadet|kız kardeş)/;
const YASLI = /(Amca|Dede|Nine|Teyze|emekli|Hacı|gazisi|Rahmetli|babanın|Kayınpeder|varis|dul )/i;
const TEN = [['#f1c7a5', '#d9a07c'], ['#e7b58f', '#c98e66'], ['#d39b70', '#b07a52'], ['#b27a52', '#8e5c3a'], ['#f6d3b8', '#dcae8c']];
const SAC = ['#2a1d16', '#3b2a1f', '#4a3424', '#1c1c1c', '#6b4a2e', '#8a5a33'];
const GOMLEK = ['#3e8ed0', '#7a5bbf', '#2e7d5b', '#c0573a', '#4b5563', '#8b6b3e', '#2f4f7f'];
const ESARP = ['#9b3b5a', '#3b6b9b', '#7a6a2f', '#5b3b8b', '#2f7a5b', '#a0522d'];

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Konuşmacının görünümünü belirler (her zaman aynı isim → aynı yüz)
function tarif(sp) {
  const ad = sp.name || '', em = sp.emoji || '';
  if (ad.startsWith('@') || (em && !INSAN.has(em))) return null;
  const h = hash(ad + '|' + (sp.role || ''));
  const r = (n, k = 0) => ((h >>> (k * 3)) % n);
  const kadin = /👵|👩‍🦳|💁‍♀️|💍/.test(em) || KADIN.test(ad) || (sp.role === 'ME' && r(10, 5) < 3) || (em === '🎤' && r(2, 6) === 0);
  const yasli = /🧓|👴|👵|👩‍🦳/.test(em) || YASLI.test(ad);
  const t = {
    kadin, yasli, ten: TEN[r(TEN.length, 1)], sac: yasli ? (r(3, 2) ? '#cfcac2' : '#9a958d') : SAC[r(SAC.length, 2)],
    gomlek: GOMLEK[r(GOMLEK.length, 3)], esarp: ESARP[r(ESARP.length, 4)], sapka: null, takim: false, yelek: false,
    gozluk: /⚖️/.test(em) || /(öğretmen|Doktor|hakim|müfettiş|mühendis|statikçi|uzman|yazar|danışman)/i.test(ad) || r(10, 7) < 2,
    gunes: em === '🕶️', biyik: !kadin && (yasli ? r(10, 8) < 8 : r(10, 8) < 5), sakal: !kadin && !yasli && r(10, 9) < 3,
    mik: em === '🎤' || /(muhabir|gazeteci|fenomen)/i.test(ad), cocuk: /👨‍👩‍👧|👨‍👩‍👦/.test(em) || /(ailesi|çift|Ece ve|Zehra ve)/.test(ad),
    tilki: em === '🦊', basortu: false, kel: false,
  };
  if (sp.role === 'US' || /👷|🦺/.test(em)) { t.sapka = /(mimar|statikçi|şef)/i.test(ad) ? 'baret-b' : 'baret'; t.yelek = true; }
  else if (/👮|🚨|🛂/.test(em) || /(polis|komiser)/i.test(ad)) t.sapka = 'polis';
  else if (t.yasli && !kadin && r(2, 10)) t.sapka = 'kasket';
  if (/💼|🤵|🎩|🏛️|⚖️|🦊/.test(em) || ['YT', 'ME'].includes(sp.role)) t.takim = true;
  if (kadin && (t.yasli ? r(10, 11) < 8 : r(10, 11) < 3)) t.basortu = true;
  if (!kadin && t.yasli && !t.sapka && r(2, 12)) t.kel = true;
  return t;
}

const AGIZ = '#5a1d17';
export function yuzSvg(sp) {
  const t = tarif(sp);
  if (!t) return null;
  const [ten, golge] = t.ten, s = t.sac;
  let g = '';
  // Gövde
  const govde = t.takim ? '#22293a' : t.yelek ? '#f28c28' : t.gomlek;
  g += `<path d="M12 104 C14 80 31 71 50 71 C69 71 86 80 88 104 Z" fill="${govde}"/>`;
  if (t.takim) g += `<path d="M42 71.5 L50 88 L58 71.5 Z" fill="#eef"/><path d="M48.3 75 L51.7 75 L53 90 L50 95 L47 90 Z" fill="${t.tilki ? '#c0392b' : '#8b1e2b'}"/>`;
  if (t.yelek) g += `<rect x="18" y="88" width="64" height="4" fill="#e8f0d0" opacity=".9"/><rect x="47" y="72" width="6" height="30" fill="#e8f0d0" opacity=".5"/>`;
  g += `<rect x="43" y="60" width="14" height="14" rx="3" fill="${golge}"/>`;
  // Arka saç / başörtüsü
  if (t.basortu) g += `<path d="M23 50 C20 15 80 15 77 50 C79 66 70 77 50 79 C30 77 21 66 23 50 Z" fill="${t.esarp}"/>`;
  else if (t.kadin) g += `<path d="M26 44 C23 18 77 18 74 44 L77 76 C66 81 34 81 23 76 Z" fill="${s}"/>`;
  // Kafa
  if (!t.basortu) g += `<circle cx="29.5" cy="49" r="4.5" fill="${ten}"/><circle cx="70.5" cy="49" r="4.5" fill="${ten}"/>`;
  g += `<ellipse cx="50" cy="47" rx="${t.basortu ? 19 : 21}" ry="${t.basortu ? 23 : 25}" fill="${ten}"/>`;
  if (t.sakal) g += `<path d="M30 54 Q32 76 50 74 Q68 76 70 54 Q66 68 50 69 Q34 68 30 54 Z" fill="${s}" opacity=".35"/>`;
  if (t.yasli) g += `<g stroke="${golge}" stroke-width="1" fill="none" opacity=".8"><path d="M40 36 Q50 34 60 36"/><path d="M36 58 Q37 62 40 64"/><path d="M64 58 Q63 62 60 64"/></g>`;
  // Ön saç
  if (t.basortu) g += `<path d="M30 42 C31 24 69 24 70 42 C61 34 39 34 30 42 Z" fill="${t.esarp}"/><g fill="#fff" opacity=".35"><circle cx="40" cy="31" r="1.4"/><circle cx="52" cy="27" r="1.4"/><circle cx="62" cy="32" r="1.4"/><circle cx="27" cy="60" r="1.4"/><circle cx="73" cy="60" r="1.4"/></g>`;
  else if (t.kadin) g += `<path d="M29 41 C29 21 71 21 71 41 C63 34 53 30 45 34 C39 37 34 39 29 41 Z" fill="${s}"/>`;
  else if (t.kel) g += `<path d="M29.5 46 C29 37 32 33 36 32 L35 41 C33 42 31 44 29.5 46 Z M70.5 46 C71 37 68 33 64 32 L65 41 C67 42 69 44 70.5 46 Z" fill="${s}"/>`;
  else if (t.tilki) g += `<path d="M29 43 C27 19 73 19 71 43 C70 31 56 27 34 33 C31 36 30 39 29 43 Z" fill="${s}"/><path d="M36 30 Q52 22 68 32" stroke="#fff" stroke-width="1" opacity=".3" fill="none"/>`;
  else if (!t.sapka || t.sapka === 'polis') g += `<path d="M29 43 C27 20 73 20 71 43 C66 32 58 28 50 29.5 C42 28 34 32 29 43 Z" fill="${s}"/>`;
  // Şapkalar
  if (t.sapka === 'baret' || t.sapka === 'baret-b') {
    const c = t.sapka === 'baret' ? '#f4c20d' : '#f2f2f2', k = t.sapka === 'baret' ? '#d39e00' : '#c9c9c9';
    g += `<path d="M27 37 C27 15 73 15 73 37 Z" fill="${c}"/><rect x="21" y="35" width="58" height="5.5" rx="2.7" fill="${k}"/><path d="M50 17 L50 36" stroke="${k}" stroke-width="3"/>`;
  } else if (t.sapka === 'kasket') g += `<path d="M28 36 C29 20 71 18 72 33 L80 38 C70 40 40 40 28 37 Z" fill="#5b5148"/><path d="M30 34 C40 30 62 29 72 33" stroke="#47403a" stroke-width="1.2" fill="none"/>`;
  else if (t.sapka === 'polis') g += `<path d="M27 31 L73 31 L71 21 C61 14 39 14 29 21 Z" fill="#1d2b4a"/><rect x="26" y="30" width="48" height="6" rx="2" fill="#111"/><circle cx="50" cy="24" r="3" fill="#f4c20d"/>`;
  // Kaşlar
  const kc = t.yasli ? '#8d877e' : '#2a1d16';
  g += `<g stroke="${kc}" stroke-width="${t.kadin ? 1.8 : 2.6}" stroke-linecap="round"><path class="ks-l" d="M36.5 41.5 L46 40.5"/><path class="ks-r" d="M54 40.5 L63.5 41.5"/></g>`;
  // Gözler (normal / mutlu)
  g += `<g class="gz" style="--kd:${(hash(sp.name || '') % 30) / 10}s"><ellipse cx="41.5" cy="48" rx="2.6" ry="3.1" fill="#1a1a1a"/><ellipse cx="58.5" cy="48" rx="2.6" ry="3.1" fill="#1a1a1a"/><circle cx="42.4" cy="47" r=".9" fill="#fff"/><circle cx="59.4" cy="47" r=".9" fill="#fff"/></g>`;
  g += `<g class="gz-m" stroke="#1a1a1a" stroke-width="2.2" fill="none" stroke-linecap="round"><path d="M38.3 49 Q41.5 44.5 44.7 49"/><path d="M55.3 49 Q58.5 44.5 61.7 49"/></g>`;
  if (t.gozluk && !t.gunes) g += `<g fill="none" stroke="#2a2a2a" stroke-width="1.6"><circle cx="41.5" cy="48" r="5.6"/><circle cx="58.5" cy="48" r="5.6"/><path d="M47.1 47.5 L52.9 47.5 M35.9 47 L30 45 M64.1 47 L70 45"/></g>`;
  if (t.gunes) g += `<g fill="#111"><rect x="34.5" y="43.5" width="13" height="8.5" rx="3.5"/><rect x="52.5" y="43.5" width="13" height="8.5" rx="3.5"/><rect x="46" y="45" width="8" height="2"/></g>`;
  // Burun, yanaklar, bıyık
  g += `<path d="M50 50 Q46.8 57 50.6 58" stroke="${golge}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  g += `<g class="yn" fill="#ff6f6f" opacity=".45"><circle cx="35.5" cy="57" r="4"/><circle cx="64.5" cy="57" r="4"/></g>`;
  // Ağız: normal / konuşma / gülüş / kızgın
  g += `<path class="ag-n" d="M44 65.5 Q50 ${t.tilki ? 69 : 67.8} 56 ${t.tilki ? 63.5 : 65.5}" stroke="${AGIZ}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`;
  g += `<ellipse class="ag-a" cx="50" cy="66" rx="4.2" ry="3.3" fill="${AGIZ}"/>`;
  g += `<g class="ag-g"><path d="M41.5 63 Q50 74 58.5 63 Z" fill="${AGIZ}"/><path d="M43 63.4 L57 63.4 L55.6 65.8 L44.4 65.8 Z" fill="#fff"/></g>`;
  g += `<path class="ag-k" d="M43 69 Q50 62.5 57 69" stroke="${AGIZ}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (t.biyik) g += `<path d="M41.5 61.5 Q50 57 58.5 61.5 Q54.5 64 50 62.5 Q45.5 64 41.5 61.5 Z" fill="${t.yasli ? '#bdb7ae' : s}"/>`;
  if (t.tilki) g += `<path d="M44 60.5 Q50 58.5 56 60.5" stroke="${s}" stroke-width="1.3" fill="none"/>`;
  // Kızgınlıkta yüz kızarır
  g += `<ellipse class="kz" cx="50" cy="47" rx="21" ry="25" fill="#ff2a1a" opacity=".22"/>`;
  // Çocuk (aile)
  if (t.cocuk) g += `<g transform="translate(73 73) scale(.85)"><circle r="12" fill="${TEN[(hash(sp.name || '') >>> 4) % TEN.length][0]}"/><path d="M-11 -3 C-11 -15 11 -15 11 -3 C6 -9 -6 -9 -11 -3 Z" fill="${s}"/><circle cx="-4" cy="1" r="1.6" fill="#1a1a1a"/><circle cx="4" cy="1" r="1.6" fill="#1a1a1a"/><path d="M-3.5 5.5 Q0 8.5 3.5 5.5" stroke="${AGIZ}" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`;
  if (t.mik) g += `<g transform="rotate(-18 80 84)"><rect x="77" y="80" width="5.5" height="22" rx="2" fill="#2b2b2b"/><circle cx="79.7" cy="77" r="7" fill="#555"/><path d="M74 75 L85.4 75 M73.5 78.5 L86 78.5" stroke="#777" stroke-width="1"/></g>`;
  // Tepki simgeleri
  g += `<text class="kzs" x="67" y="27" font-size="17">💢</text><text class="mts" x="67" y="27" font-size="15">✨</text>`;
  return `<svg class="yuz-svg" viewBox="13 10 74 74" aria-hidden="true">${g}</svg>`;
}

// el: .avatar kutusu. ifade: '' | 'konus' | 'mutlu' | 'kizgin'
export function yuzKoy(el, sp, ifade = '') {
  if (!el) return false;
  clearTimeout(el._yz);
  const svg = sp ? yuzSvg(sp) : null;
  if (!svg) { el.classList.remove('yuz', 'konus', 'mutlu', 'kizgin'); el.textContent = sp?.emoji || '🗣️'; return false; }
  el.innerHTML = svg;
  el.className = el.className.replace(/\b(yuz|konus|mutlu|kizgin)\b/g, '').trim() + ' yuz';
  ifadeVer(el, ifade);
  if (ifade === 'konus') {
    const sure = Math.min(3200, Math.max(1100, (sp.quote || '').length * 42));
    el._yz = setTimeout(() => el.classList.remove('konus'), sure);
  }
  return true;
}

export function ifadeVer(el, ifade) {
  el.classList.remove('konus', 'mutlu', 'kizgin');
  if (ifade) { void el.offsetWidth; el.classList.add(ifade); }
}
