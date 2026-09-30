// Türkçe ek uyumu: "Kadıköy'da" → "Kadıköy'de", "Rıza Amca'a" → "Rıza Amca'ya", "%54'i" → "%54'ü".
// Kartlardaki {SM}, {AS} gibi yer tutucular farklı kelimelerle dolduğu için ekler sabit yazılmış; burada okunuşa göre düzeltilir.
const UNLU = 'aeıioöuüAEIİOÖUÜ';
const INCE = 'eiöüEİÖÜ', YUVARLAK = 'oöuüOÖUÜ';
const SERT = 'fstkçşhpFSTKÇŞHP';
const HARF = { B: 'be', C: 'ce', Ç: 'çe', D: 'de', F: 'fe', G: 'ge', Ğ: 'ge', H: 'he', J: 'je', K: 'ka', L: 'le', M: 'me', N: 'ne', P: 'pe', R: 're', S: 'se', Ş: 'şe', T: 'te', V: 've', Y: 'ye', Z: 'ze' };
const BIR = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
const ON = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
// Son hecesi ince okunan alıntı kelimeler
const ISTISNA = new Set(['kemal', 'cemal', 'celal', 'hilal', 'nihal', 'bilal', 'saat', 'harf', 'kalp', 'hayal', 'rol', 'gol', 'istiklal', 'petrol', 'alkol', 'dikkat', 'hakikat', 'kabul', 'meal', 'ideal', 'metal', 'otel', 'emsal']);

// Okunuşu yazılışından farklı olanlar: yazarın yazdığı eke dokunma
const DOKUNMA = new Set(['cm', 'km', 'm2', 'rover', 'range rover']);

function okunus(w) {
  if (/^\d[\d.]*(,\d+)?$/.test(w)) {
    const tam = w.includes(',') ? w.split(',')[1] : w.replace(/\./g, '');
    const n = parseInt(tam, 10);
    if (n === 0) return 'sıfır';
    if (n % 10) return BIR[n % 10];
    if (n % 100) return ON[(n % 100) / 10];
    if (n % 1000) return 'yüz';
    if (n % 1e6) return 'bin';
    return 'milyon';
  }
  const kisa = w.length <= 3 && w === w.toLocaleUpperCase('tr-TR') && ![...w.slice(-1)].some((c) => UNLU.includes(c));
  if (kisa || (w === w.toLocaleUpperCase('tr-TR') && ![...w].some((c) => UNLU.includes(c)))) return HARF[w.slice(-1)] || w;
  return w;
}

function uyum(w) {
  const o = okunus(w);
  const k = o.toLocaleLowerCase('tr-TR');
  let v = null;
  for (let i = o.length - 1; i >= 0; i--) if (UNLU.includes(o[i])) { v = o[i]; break; }
  let ince = v ? INCE.includes(v) : false;
  if (ISTISNA.has(k)) ince = true;
  const yuv = v ? YUVARLAK.includes(v) : false;
  const son = o[o.length - 1];
  return { ince, yuv, unluSon: UNLU.includes(son), sert: SERT.includes(son) };
}

const A2 = (u) => (u.ince ? 'e' : 'a');
const I4 = (u) => (u.ince ? (u.yuv ? 'ü' : 'i') : (u.yuv ? 'u' : 'ı'));

// Ek türünü yakala (uzundan kısaya); sonrasında harf gelmemeli
const EK = /([0-9A-Za-zÇĞİIÖŞÜçğıöşü.,%]*[0-9A-Za-zÇĞİIÖŞÜçğıöşü])'((?:[dt][ae]ki)|(?:[dt][ae]n)|(?:[dt][ae])|(?:l[ae]r)|(?:y?l[ae])|(?:n?[ıiuü]n)|(?:y?[ae])|(?:y?[ıiuü]))(?![A-Za-zÇĞİIÖŞÜçğıöşü])/g;

// İyelik ekiyle biten tamlamalar (Sultan Sitesi'nde, Odunpazarı'na): kaynaştırma n'si alır
const IYELIK = new Set(['sitesi', 'apartmanı', 'beylikdüzü', 'odunpazarı', 'ailesi', 'çifti', 'varisleri', 'konutları', 'evleri', 'kuleleri', 'rezidansı', 'yıldızı']);

function yeniEk(w, ek) {
  const u = uyum(w);
  const D = u.sert ? 't' : 'd';
  if (IYELIK.has(w.toLocaleLowerCase('tr-TR')) && ek !== 'lar' && ek !== 'ler' && !/^y?l[ae]$/.test(ek)) {
    if (/^[dt][ae]ki$/.test(ek)) return `nd${A2(u)}ki`;
    if (/^[dt][ae]n$/.test(ek)) return `nd${A2(u)}n`;
    if (/^[dt][ae]$/.test(ek)) return `nd${A2(u)}`;
    if (/^y?[ae]$/.test(ek)) return `n${A2(u)}`;
    if (/^n?[ıiuü]n$/.test(ek)) return `n${I4(u)}n`;
    return `n${I4(u)}`;
  }
  if (/^[dt][ae]ki$/.test(ek)) return `${D}${A2(u)}ki`;
  if (/^[dt][ae]n$/.test(ek)) return `${D}${A2(u)}n`;
  if (/^[dt][ae]$/.test(ek)) return `${D}${A2(u)}`;
  if (/^l[ae]r$/.test(ek)) return `l${A2(u)}r`;
  if (/^y?l[ae]$/.test(ek)) return `${u.unluSon ? 'y' : ''}l${A2(u)}`;
  if (/^n?[ıiuü]n$/.test(ek)) return `${u.unluSon ? 'n' : ''}${I4(u)}n`;
  if (/^y?[ae]$/.test(ek)) return `${u.unluSon ? 'y' : ''}${A2(u)}`;
  if (/^y?[ıiuü]$/.test(ek)) return `${u.unluSon ? 'y' : ''}${I4(u)}`;
  return ek;
}

export function ekDuzelt(str) {
  if (!str || typeof str !== 'string' || !str.includes("'")) return str;
  return str.replace(EK, (m, w, ek, i) => {
    if (str[i - 1] === ':' || DOKUNMA.has(w.toLocaleLowerCase('tr-TR'))) return m;
    const son = w.split(/[.,%]/).filter(Boolean).pop() || w;
    const kelime = /\d/.test(son) ? w.replace(/^%/, '') : son;
    return `${w}'${yeniEk(kelime, ek)}`;
  });
}
