// Mini oyunlu kartlar: seçim yapınca 10-30 saniyelik küçük bir oyun açılır, puana göre sonuç değişir.
// act: { type: "mini", game, tiers: [[enAzPuan, fx, sonuçMetni], ...] } — tiers büyükten küçüğe sıralı.
import { sp, dialectFor } from './dialect.js';

const AS_ADLARI = ["Hacı Rıza Amca", "Fatma Teyze", "emekli öğretmen Nuri Bey", "Kemal Usta", "Nazmiye Hanım", "Yusuf Ağa", "Müzeyyen Hanım", "Ramazan Amca"];
const pickSeed = (a, n) => a[Math.abs(n) % a.length];

const BETON_KIM = [
  () => sp("şantiye şefi Rıfat", "karadeniz", "US", "Mikser kapıda, pompa hazır. Uşağum, su oranını sen ayarla; şoför de 'su katayım mı' deyi duruyor.", "👷"),
  () => sp("şantiye şefi Serkan", "istanbul", "US", "Abi pompacı acele ediyor, öğlene başka şantiyesi varmış. Şoför de hortumu miksere uzattı bile.", "👷"),
  () => sp("Mehmet Ali Usta", "dogu", "US", "Bıra, beton katı gelmiş, pompa zorlanıyor. Şoför 'iki kova su katarım, yağ gibi akar' diyor.", "👷"),
  () => sp("kalıpçı Nihat Usta", "ege", "US", "Gari bu beton ağır akıyo. Şoför 'biraz su verek' diyo, ben karışmam, sen bilin.", "👷"),
  () => sp("demirci Bekir Usta", "adana", "US", "Gardaş demir bağlandı, mikser kapıda. Şoför 'suyu ben ayarlarım' diyo, ağam sen bi bak.", "👷"),
];
const BETON_X = [
  "Hazır beton şoförü akıcı olsun diye mikserin içine gizlice su katmaya meraklı.",
  "Pompa operatörü acele ediyor; mikserler sırada bekliyor, şoför hortumu suya bağlamış.",
  "Hava sıcak, beton çabuk katılaşıyor. Herkes 'biraz su' diyor; kimse numune kabına bakmıyor.",
  "Yapı denetimci geç kalacakmış; şoför 'o gelene kadar dökeriz' diyor.",
];
const DENETIM = [
  { sp: () => sp("bekçi Hüsnü", "ic", "US", "Beyim! Aşağıdan beyaz bir araba geliyo, üstünde 'Çalışma ve Sosyal Güvenlik' yazıyo. Yirmi dakkaya burdalar!", "🚨"),
    x: (p) => `${p.name} şantiyesine habersiz iş güvenliği denetimi geliyor. Baretsiz işçiler, korumasız boşluklar, eksik iskele… Toparlamak için az vaktin var.` },
  { sp: () => sp("formen Erol", "istanbul", "US", "Abi belediyeden yapı kontrol geliyor, telefonla haber verdiler. Kat boşlukları açık, iskele yarım!", "🚨"),
    x: (p) => `Belediyenin yapı kontrol ekibi ${p.name}'a geliyor. Şikâyet varmış: 'şantiyeden sokağa malzeme düşüyor'. Toparlamak için az vaktin var.` },
  { sp: () => sp("İSG uzmanı Derya Hanım", "ege", "ME", "Size kaç kere söyledim gari: kemer, korkuluk, filet. Müfettiş kapıda, ben de sorumluyum!", "🦺"),
    x: (p) => `${p.name}'a iş müfettişi geldi; önceki hafta başka bir şantiyede yaşanan düşme kazasından sonra bölgedeki bütün şantiyeler geziliyor.` },
];
const TAPU_KIM = [
  { ad: "Cemil", e: "e", sp: () => sp("tapu takipçisi Cemil", "istanbul", "ME", "Abi sıra uzun, sistem yavaş. Yüz lira ver, seni öne alayım. Kimse bilmez.", "🧾") },
  { ad: "Sadık", e: "a", sp: () => sp("arzuhalci Sadık", "ic", "ME", "Evladım, bu evrak işi zor. Bir ikramiye ver, içerideki tanıdık sırayı hallederi.", "🧾") },
  { ad: "Tuncay", e: "a", sp: () => sp("'danışman' Tuncay", "ankara", "ME", "Yav kardeşim sen hiç yorulma. Şu kadar ver, randevuyu da harcı da ben hallederim.", "🧾") },
];

export function betonCard(s, p) {
  return {
    kind: "sys", phase: "insaat", projId: p.id, title: "Beton Dökümü",
    speaker: pickSeed(BETON_KIM, p.id + Math.round(p.progress / 15))(),
    text: `${p.name}'da ${Math.max(1, Math.round(p.progress / 15))}. kat döşemesi dökülecek. ${pickSeed(BETON_X, p.id + s.t)} Su fazla olursa beton kolay akar ama dayanımı düşer.`,
    ders: "Betona şantiyede su katmak, dökümü kolaylaştırır ama dayanımı ciddi biçimde düşürür; deprem sonrası incelemelerde en sık rastlanan kusurlardan biridir. Döküm sırasında yapı denetim gözetiminde numune alınır; alıcılar ve arsa sahipleri bu test raporlarını isteyebilir.",
    choices: [
      { label: "Mikserin başına geç, oranı kendin tut (mini oyun)", act: { type: "mini", game: "beton", tiers: [
        [0.8, "k+8 p+10 v+2 e+2", "Su/çimento oranı şartnamede. Numuneler 28 günde hedefi geçti."],
        [0.45, "k+2 p+10", "Beton biraz sulu ama sınırın içinde kaldı."],
        [0, "k-8 p+12", "Şoför suyu fazla kaçırdı. Beton çorba gibi aktı; numunelerin sonucu kötü çıkacak."]] }, result: "" },
      { label: "Ustaya bırak: 'Bol su kat, çabuk aksın'", fx: "k-10 p+15 n+0.3 v-4", result: "Döküm iki saat erken bitti. Ekip memnun, kolonlar değil." },
      { label: "Pompayı durdur, sertifikalı tesisten yeni mikser iste", fx: "n-0.25 k+10 d+1 v+3", result: "Bir gün kaybettin. Beton raporu tertemiz." },
    ],
  };
}

export function denetimCard(s, p) {
  const d = pickSeed(DENETIM, p.id);
  return {
    kind: "sys", phase: "insaat", projId: p.id, title: "Müfettiş Yolda",
    speaker: d.sp(),
    text: d.x(p),
    ders: "İş sağlığı ve güvenliği denetimleri habersiz yapılabilir; inşaat, iş kazalarının en sık yaşandığı sektörlerdendir. Çalışanlar güvensiz durumu ALO 170'e bildirebilir. Denetimden önce 'göstermelik düzen' kurmak, kazayı sadece erteler: iskele, korkuluk ve kemer her gün gerekir.",
    choices: [
      { label: "Şantiyeyi koş koş toparla (mini oyun)", act: { type: "mini", game: "temizlik", tiers: [
        [0.8, "r-4 e+3 i+1", "Müfettiş dolaştı, not defterini boş kapattı. Ustalar ilk defa baret takmanın rahatlığını gördü."],
        [0.5, "r+1 n-0.2", "Birkaç eksik yakalandı. Tutanak ve idari para cezası geldi."],
        [0, "r+6 n-0.5 d+1 e-3", "Korkuluksuz boşluk görüldü. Şantiyede ilgili bölüm durduruldu, ceza kesildi."]] }, result: "" },
      { label: "Kapıyı kilitle: 'Bugün çalışma yok' de", fx: "r+3 d+1 e-2", result: "Müfettiş kapıya not bıraktı. Tekrar gelecek, bu sefer polisle." },
      { label: "Zarfı hazırla 🎲", fx: "v-6", act: { type: "gamble", p: 0.5, win: "n-0.3", lose: "n-0.3 r+12 i-4", winText: "Zarf alındı, rapor temiz.", loseText: "Müfettiş zarfı tutanağa ekledi. Rüşvet teklifi ayrı bir dosya oldu." }, result: "" },
    ],
  };
}

export function pazarlikCard(s, p, seed) {
  const name = pickSeed(AS_ADLARI, seed);
  const dia = dialectFor(name, p.semt);
  const ask = 50 + (seed % 4) * 2 + 2;
  const q = {
    karadeniz: `Uşağum, bu arsa dedemden kaldi. Yüzde ${ask} vermezsen hiç konuşmayalum.`,
    dogu: `Bıra, yüzde ${ask} benim hakkım. Eksiği olmaz, kusura bakma.`,
    ege: `Gari yüzde ${ask} isterim, komşuya da o kadar vermişler naapcan.`,
    adana: `Gardaş yüzde ${ask}, bir aşağı bir yukarı yok, ağam!`,
    ic: `Oğlum yüzde ${ask} deriz, gine de sen bilirsin.`,
    ankara: `Abe yüzde ${ask} olmazsa bu iş olmaz, ben bilirim.`,
    istanbul: `Abicim yüzde ${ask}, piyasa bu. Ben emlakçıya sordum.`,
    antep: `Len yüzde ${ask}, kebap parası değil bu!`,
    gurbetci: `Abi yüzde ${ask}, Almanya'da da böyle, genau!`,
  }[dia];
  return {
    kind: "sys", phase: "arsa", projId: p.id, title: "Kat Karşılığı Pazarlığı",
    speaker: sp(name, dia, "AS", q, "🧓"),
    text: `${p.semt}'daki arsa için masadasın. Arsa sahibi dairelerin %${ask}'ini istiyor. Karşı teklif verebilir, pazarlığı uzatabilir ya da hemen kabul edebilirsin. Sabrı sınırlı.`,
    miniCtx: { ask, name, dia },
    ders: "Kat karşılığı sözleşmelerde paylaşım oranı kadar, teslim tarihi, gecikme cezası, kullanılacak malzeme ve teminat da yazılmalıdır. Arsa sahipleri sözleşmeyi noterde düzenletmeli, tapuda kat irtifakı kurulmadan tüm payı devretmemeli; 'kademeli tapu devri' kendilerini korur.",
    choices: [
      { label: "Karşı teklif ver, pazarlık et (mini oyun)", act: { type: "mini", game: "pazarlik", tiers: [
        [0.8, "h-7 s+2", "El sıkıştınız. Arsa sahibi 'iyi pazarlıkçısın' deyip güldü."],
        [0.45, "h-3 s-2", "Ortada buluştunuz. İkiniz de biraz buruk."],
        [0, "h+4 s-10 d+1", "Arsa sahibi kalktı gitti. Bir ay sonra döndüğünde fiyatı artırmıştı."]] }, result: "" },
      { label: `İstediği %${ask}'i ver, işi bağla`, fx: "h+4 s+10 v+1", result: "Arsa sahibi çok memnun. Senin kârın biraz inceldi." },
      { label: "'Başka arsa çok' diye masadan kalk", fx: "h-4 s-15 v-2", result: "Hemen geri çağırdı. Ama sana bir daha güvenmeyecek." },
    ],
  };
}

export function tapuCard(s, p) {
  const tk = pickSeed(TAPU_KIM, p.id);
  return {
    kind: "sys", phase: "satis", projId: p.id, title: "Tapu Müdürlüğü",
    speaker: tk.sp(),
    text: `${p.name} dairelerinin tapu devri için randevu günü. Sıra numarası elinde; eksik evrak getiren işlemini baştan yapıyor. ${tk.ad} kapıda 'hızlandırma' teklif ediyor.`,
    ders: "Tapu işlemleri e-Devlet ve Web Tapu üzerinden randevuyla yapılır; kimlik, son 6 ayda çekilmiş fotoğraf, geçerli DASK poliçesi ve belediyeden emlak vergisi değer yazısı istenir. Harçlar resmi hesaba yatırılır. 'Sıra atlatan', 'işi hızlandıran' aracılara para vermek hem dolandırılma riski taşır hem de suçtur.",
    choices: [
      { label: "Evrakları kendin topla, sıranı bekle (mini oyun)", act: { type: "mini", game: "tapu", tiers: [
        [0.75, "i+2 s+2", "Evrak eksiksiz, işlem 10 dakikada bitti. Alıcılar 'bu kadar düzgün müteahhit görmedik' dedi."],
        [0.4, "d+0 i+0", "Bir evrak eksik çıktı, koşturup tamamladın. Akşam oldu ama bitti."],
        [0, "d+1 i-2", "Evrak eksik, sıran geçti. Alıcılar bir ay daha bekleyecek."]] }, result: "" },
      { label: `${tk.ad}'${tk.e} para ver, sırayı atla`, fx: "n-0.05 v-3 r+2", result: "Sıra atladın. Arkadaki yaşlı teyze seni gördü, telefonunu çıkardı." },
      { label: "Tapuda bedeli düşük göster, harçtan kıs", fx: "x+0.4 v-5 r+3 F:tapuDusuk", result: "Harç az çıktı. Alıcı ileride evi satarken ya da bir anlaşmazlıkta zararı görecek." },
    ],
  };
}

// Kaçışın son adımına eklenen mini oyunlu seçenek
export const havalimaniChoice = { label: "Sırada bekle, nabzını kontrol et (mini oyun)", act: { type: "esc", end: true, mini: "havalimani" }, result: "" };
