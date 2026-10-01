// Rozetler: oyunlar arasında kalıcıdır (bu tarayıcıda). Bir kez kazanılan rozet kaybolmaz.
// son: oyun sonu kontrolü (ending gerekir). Diğerleri oyun sırasında da kazanılabilir.
import * as E from './engine.js';

const at = (y, m) => (y - E.START_YEAR) * 12 + (m - 1);
const B = (s) => s.baslangic;

export const ROZETLER = [
  { id: "ilk", emoji: "🔑", ad: "İlk Anahtar", nasil: "İlk binanı teslim et.", test: (s) => s.completed >= 1 },
  { id: "yuz", emoji: "🏘️", ad: "Yüz Anahtar", nasil: "100 daire teslim et.", test: (s) => s.daireTeslim >= 100 },
  { id: "gok", emoji: "🏙️", ad: "Göğü Delen", nasil: "Bir rezidans projesine gir.", test: (s) => s.maxTier >= 2 },
  { id: "sifir", emoji: "🕊️", ad: "Sıfır Mağdur", nasil: "Hiç mağdur vermeden 5 proje tamamla.", test: (s) => s.completed >= 5 && s.m === 0 },
  { id: "deprem", emoji: "🧱", ad: "Deprem Sınavı", nasil: "2023 depremini tek bina kaybetmeden, en az 3 teslimle atlat.", test: (s) => s.t >= at(2023, 3) && s.cokme === 0 && s.completed >= 3 },
  { id: "kur", emoji: "💱", ad: "Kur Fırtınası", nasil: "Kur şokunda döviz borcunu kapat.", test: (s) => !!s.flags.dovizBitti },
  { id: "rusvet", emoji: "🎙️", ad: "Rüşvete Hayır", nasil: "Rüşvet düzenini savcılığa bildir.", test: (s) => !!s.flags.ihIhbar },
  { id: "cinar", emoji: "🌳", ad: "Çınar'ın Sözü", nasil: "Çınar Apartmanı'nı sözünü tutarak teslim et.", test: (s) => (s.arcs || {}).donusum >= 3 && s.flags.dnAdil && !s.flags.dnRehin },
  { id: "fenomen", emoji: "📱", ad: "Harç Fenomeni", nasil: "Harç'ta 20 bin gerçek takipçiye ulaş.", test: (s) => !!s.sosyal && s.sosyal.takipci >= 20000 },
  { id: "usta", emoji: "🛠️", ad: "Usta Okulu", nasil: "Kalfa olarak başla, ustan için okul kur.", test: (s) => !!s.flags.ustaOkulu },
  { id: "baba", emoji: "🏚️", ad: "Babanın Binası", nasil: "Babandan kalan eski binayı güçlendir.", test: (s) => !!s.flags.babaGuclendir },
  { id: "damat", emoji: "🤵", ad: "Kimsenin Damadı Değil", nasil: "Kayınpederin torpilini reddet.", test: (s) => !!s.flags.damatRed },
  // Oyun sonu rozetleri
  { id: "patron", emoji: "🏆", ad: "Saygın Patron", nasil: "Saygın patron olarak bitir.", son: true, test: (s, k) => k === "patron" },
  { id: "temiz", emoji: "✨", ad: "Mahallenin Güvencesi", nasil: "Ahlak karnesi 85 ve üstüyle bitir.", son: true, test: (s) => E.ahlak(s) >= 85 },
  { id: "kalfaPatron", emoji: "🧱", ad: "Kalfadan Patrona", nasil: "Sıfırdan kalfa olarak başla, saygın patron ol.", son: true, test: (s, k) => B(s) === "kalfa" && k === "patron" },
  { id: "onurlu", emoji: "🫡", ad: "Onurlu Batış", nasil: "Batsan bile tek mağdur vermeden batmak.", son: true, test: (s, k) => k === "iflas" && s.m === 0 },
  { id: "kacak", emoji: "✈️", ad: "Tek Yön Bilet", nasil: "Yurt dışına kaç. (Arkanda kalanları unutma.)", son: true, test: (s, k) => k === "kacak" },
  { id: "bulten", emoji: "🚨", ad: "Kırmızı Bülten", nasil: "Kaçarken yakalan.", son: true, test: (s, k) => k === "iade" },
  { id: "itiraf", emoji: "⚖️", ad: "Vicdanın Sesi", nasil: "Savcılığa kendi ayağınla git.", son: true, test: (s, k) => k === "itiraf" },
  { id: "koleksiyon", emoji: "🗂️", ad: "Koleksiyoncu", nasil: "6 farklı son gör.", son: true, test: (s, k, gorulen) => gorulen >= 6 },
];

const KEY = "muteahhit-rozet-v1";
export function kazanilan() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function yaz(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* yok say */ } }

// Yeni kazanılan rozetleri döndürür ve kaydeder
export function kontrol(s, ending = null, gorulen = 0) {
  const k = kazanilan(), yeni = [];
  for (const r of ROZETLER) {
    if (k[r.id] || (r.son && !ending)) continue;
    let ok = false;
    try { ok = r.test(s, ending, gorulen); } catch { ok = false; }
    if (ok) { k[r.id] = Date.now(); yeni.push(r); }
  }
  if (yeni.length) yaz(k);
  return yeni;
}

// "Bir tur daha" için: henüz kazanılmamış, ulaşılabilir bir sonraki hedef
export function oneri(s) {
  const k = kazanilan();
  const diger = ROZETLER.filter((r) => !k[r.id]);
  // Her oyun sonunda aynı rozeti önermemek için kariyer süresine göre sırayla seç
  return diger.length ? diger[(s?.t || 0) % diger.length] : null;
}
