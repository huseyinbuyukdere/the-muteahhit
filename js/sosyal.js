// SOSYAL MEDYA — "Harç" adlı kurgusal şehir uygulaması: paylaşımlar, yorumlar, takipçiler, ifşa ve linç.
// Motor tarafı: DOM yok, sadece durum (s.sosyal) üzerinde çalışır. Kayıtlı eski oyunlarda alan yoksa ensure() tamamlar.

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pick = (a, r = Math.random) => a[Math.floor(r() * a.length)];
const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export const APP = "Harç";

export function ensure(s) {
  if (!s.sosyal) s.sosyal = { takipci: 320, sahte: 0, posts: [], seq: 1, lastPost: -9, hype: 0, tapu: 0, tapuSeviye: 0, lastLinc: -99, okunmadi: 0, reklamT: -99, gecmis: [] };
  const so = s.sosyal;
  so.posts = so.posts || []; so.gecmis = so.gecmis || [];
  return so;
}

// ---------- Kısa yardımcılar ----------
const act = (s) => s.projects.filter((p) => !p.done && !p.collapsed);
const ms = (s) => Math.max(1, ...act(s).map((p) => p.scale), 1);
export const toplamTakipci = (s) => { const so = ensure(s); return Math.round(so.takipci + so.sahte); };
export const sahteOran = (s) => { const so = ensure(s); const t = so.takipci + so.sahte; return t ? so.sahte / t : 0; };
export const canPost = (s) => ensure(s).lastPost < s.t && !s.ending && !s.escape;
export function fmtK(n) {
  n = Math.round(n);
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + " Mn";
  if (n >= 1e4) return (n / 1e3).toFixed(1).replace('.', ',') + " B";
  return n.toLocaleString('tr-TR');
}
const has = (s, k) => !!(s.owned && s.owned[k]);
const yalanDurum = (s) => s.m >= 5 || !!s.flags.cark || s.n < -3 * ms(s) || act(s).some((p) => p.gecikme > 6);

// ---------- Paylaşım türleri ----------
// lie(s,p): paylaşım gerçeği yansıtmıyor mu? fx: dürüstken, lieFx: yalanken hemen gelen etki. flex: gösteriş (tepki çekebilir).
export const POSTS = [
  { id: "insaat", ad: "Şantiyeden kare", ikon: "🏗️", img: "insaat",
    need: (s) => act(s).some((p) => p.phase === "insaat"),
    proj: (s) => act(s).filter((p) => p.phase === "insaat").sort((a, b) => b.progress - a.progress)[0],
    text: (s, p) => `Yeni projemiz ${p.name} yükseliyor 🏗️ Kat kat, sağlam sağlam. ${p.semt} hayırlı olsun! #${p.semt.replace(/\s/g, "")} #${slug(s.firma)}`,
    lie: (s, p) => p.gecikme > 5 || p.kalite < 45,
    fx: "i+1", lieFx: "i+2 g+1", hype: 0.02,
    ders: "Sosyal medyadaki şantiye fotoğrafı, binanın ruhsatlı ve sağlam olduğunu göstermez. Ev almadan önce yapı ruhsatını, yapı denetim firmasını ve e-Devlet'teki tapu kaydını kendiniz kontrol edin." },
  { id: "olmedik", ad: "\"Biz daha ölmedik\"", ikon: "💪", img: "olmedik",
    need: (s) => s.t >= 6,
    text: (s) => pick(["Bazıları batacağımızı sandı. Biz daha ölmedik! 💪 Bütün projelerimiz takvimde, tıkır tıkır.",
      "Dedikodulara kulak asmayın. Biz daha ölmedik! 🦁 Teslim tarihlerimiz aynen geçerli.",
      "Rakiplerimiz üzülecek ama… Biz daha ölmedik! 🔥 Yeni projeler yolda."]),
    lie: (s) => yalanDurum(s),
    fx: "g+1", lieFx: "g+4 i+2", hype: 0.01,
    ders: "Batmak üzere olan firmaların 'her şey yolunda' paylaşımları, ödeme sıkıntısının en tipik işaretlerindendir. Firma hakkında icra takibi, konkordato ilanı ve dava kayıtlarını araştırmak paylaşımlardan daha güvenilirdir." },
  { id: "araba", ad: "Makam aracıyla poz", ikon: "🚘", img: "araba", flex: true,
    need: (s) => has(s, "mercedes") || has(s, "range"),
    text: () => pick(["Emeğin karşılığı 🚘 Sabah 6'da şantiyede, akşam 11'de ofiste. #başarı #müteahhit",
      "Yeni yol arkadaşım 🖤 Çalışan kazanır. #motivasyon", "Bugün şantiyeye biraz farklı geldim 😎 #pazartesi"]),
    lie: () => false, fx: "i+1 g+2", hype: 0.015,
    ders: "Lüks araç ve saat pozları 'güven' satmak için kullanılır. Bir müteahhidin sağlamlığı arabasıyla değil; teslim ettiği binalar, iskânlar ve ödediği hakedişlerle ölçülür." },
  { id: "villa", ad: "Villadan sabah pozu", ikon: "🏡", img: "villa", flex: true,
    need: (s) => has(s, "villa"),
    text: () => pick(["Yeni yuvamızda ilk sabah ☀️🏡 Şükürler olsun. #aile #huzur", "Havuz başında kahve ☕ Pazartesi sendromu nedir bilmem. #villalife"]),
    lie: () => false, fx: "i+1 g+3", hype: 0.02,
    ders: "Mağdurların yıllarca beklediği dosyalarda, müteahhidin sosyal medyadaki lüks yaşam paylaşımları mahkemeye ve savcılığa delil olarak sunulabiliyor; 'mal kaçırma' şüphesini de güçlendiriyor." },
  { id: "yat", ad: "Yattan tatil karesi", ikon: "🛥️", img: "yat", flex: true,
    need: (s) => has(s, "yat"),
    text: () => pick(["Mavi tur 🌊 Bir yıllık yorgunluğu denize bıraktık.", "Bodrum akşamları 🥂 İş konuşmak yasak (ama konuştuk 😉)"]),
    lie: () => false, fx: "g+3", hype: 0.02,
    ders: "Vergi idaresi, beyan edilen gelirle yaşam standardı arasındaki uyumsuzluğu inceleyebilir; sosyal medya paylaşımları da bu incelemelerde kullanılabilen açık kaynaklardır." },
  { id: "bayram", ad: "Bayram / özel gün mesajı", ikon: "🌙", img: "bayram",
    need: () => true,
    text: (s) => ozelGun(s),
    lie: () => false, fx: "i+1", hype: 0.005,
    ders: "Kurumsal kutlama mesajları masum görünür; ama mağdurların 'bayramda evimde olmak istiyordum' yorumları, bir firmanın gerçek durumunu çoğu zaman en iyi anlatan şeydir." },
  { id: "teslim", ad: "Anahtar teslim fotoğrafı", ikon: "🔑", img: "teslim",
    need: (s) => s.projects.some((p) => p.done && !p.collapsed && p.doneAt >= s.t - 8),
    proj: (s) => s.projects.filter((p) => p.done && !p.collapsed).sort((a, b) => b.doneAt - a.doneAt)[0],
    text: (s, p) => `Anahtar teslim! 🔑 ${p.name} ailelerine hayırlı olsun. Sözümüzü tuttuk. #${slug(s.firma)}`,
    lie: (s, p) => p.gecikme > 8 || p.kalite < 45,
    fx: "i+3 g+1", lieFx: "i+2", hype: 0.03,
    ders: "Teslim töreni fotoğrafı, iskân (yapı kullanma izni) alındığı anlamına gelmez. İskânsız binada abonelikler, kredi ve sigorta sorun çıkarabilir; anahtarı alırken iskân belgesini isteyin." },
  { id: "rapor", ad: "Beton test raporunu paylaş", ikon: "📄", img: "rapor",
    need: (s) => s.projects.some((p) => !p.collapsed && (p.phase === "insaat" || p.done)),
    text: () => "Şeffaflık bizim işimiz: bütün projelerimizin beton test raporları ve yapı denetim belgeleri bu gönderide 📄 Sorusu olan DM atsın.",
    lie: () => false, dynamicFx: (s) => (ortKalite(s) >= 60 ? "i+4 g+2 v+2" : "i-3 v+6"),
    hype: 0.02,
    ders: "Beton numuneleri yapı denetim gözetiminde alınıp akredite laboratuvarda kırılır. Alıcı ve arsa sahipleri bu raporları isteyebilir; 'rapor yok' ya da 'sonra veririz' cevabı bir alarm işaretidir." },
  { id: "sahteRapor", ad: "Rötuşlu rapor paylaş", ikon: "🖨️", img: "rapor",
    need: (s) => s.projects.some((p) => !p.collapsed && (p.phase === "insaat" || p.done) && p.kalite < 60),
    text: () => "Beton dayanımımız yönetmeliğin çok üstünde! 💯 Raporlarımız ortada. Kıskananlar çatlasın. 📄",
    lie: () => true, fx: "", lieFx: "i+4 g+3", hype: 0.03, agir: true,
    ders: "Beton test raporunda sahtecilik 'resmi belgede sahtecilik' ve deprem sonrası davalarda 'olası kastla öldürme' suçlamalarının parçası olabilir. Raporun aslını laboratuvardan ve yapı denetim firmasından doğrulayın." },
  { id: "kampanya", ad: "\"Kampanyalı daire\" ilanı", ikon: "🔥", img: "kampanya",
    need: (s) => act(s).some(kampanyaOk),
    proj: (s) => act(s).filter(kampanyaOk)[0],
    text: (s, p) => `🔥 SON ${Math.min(3, satilabilir(p))} DAİRE! ${p.name}'da peşin alana %35 indirim + tapu masrafı bizden! Fırsat 48 saat 👉 DM #fırsat #konut`,
    lie: () => true, fx: "", lieFx: "o+18 v-8 m+2 P:kampanya", hype: 0.05, agir: true, projFx: true,
    ders: "Sosyal medyada 'son 3 daire, %35 indirim, 48 saat' gibi baskı kuran ilanlar, henüz ruhsatı bile olmayan projelere para toplamanın en bilinen yoludur. Kapora vermeden önce tapuda kat irtifakı olup olmadığına bakın, sözleşmeyi noterde yapın ve tapuya şerh ettirin; parayı şahıs hesabına göndermeyin." },
  { id: "iftira", ad: "\"Asılsız iddialar\" açıklaması", ikon: "⚖️", img: "aciklama",
    need: (s) => s.m >= 3 || ensure(s).tapu > 50,
    text: (s) => `Kamuoyuna duyuru: ${s.firma} hakkında sosyal medyada yayılan asılsız iddialara itibar etmeyiniz. Hukuki süreç başlatılmıştır. ⚖️`,
    lie: () => true, fx: "", lieFx: "i+1 g+1", hype: 0, agir: false,
    ders: "Gerçek mağduriyetleri 'asılsız iddia' diye geçiştirmek çoğu zaman ters teper (Streisand etkisi). Mağdursanız şikâyetlerinizi belgeyle yapın: sözleşme, dekont, tapu kaydı ve yazışmalar; hakaret içeren paylaşımlardan kaçının." },
  { id: "ozur", ad: "Özür + ödeme takvimi", ikon: "🤝", img: "ozur",
    need: (s) => s.m >= 3,
    text: (s) => `Hatalarımız oldu. Mağdur ettiğimiz her aile için ödeme ve teslim takvimimizi noter onaylı olarak açıklıyoruz. Özür dileriz. 🤝`,
    lie: () => false, fx: "n-1.2 i+3 v+6 m-3 r-2", hype: 0.02,
    ders: "Yarım kalan projelerde noter onaylı protokol ve ödeme takvimi, mağdurlar için sözlü vaatten çok daha güçlü bir güvencedir. Takvime uyulmazsa protokol icra ve dava sürecinde delil olarak kullanılabilir." },
];

function slug(t) { return String(t || "Firma").replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/g, ""); }
const kampanyaOk = (p) => ["arsa", "yatirim", "insaat"].includes(p.phase) && satilabilir(p) > 0 && !(p.flags && p.flags.kampanya);
const satilabilir = (p) => Math.round((p.daire * (100 - p.pay)) / 100) - p.onSatis - p.satilan;
function ortKalite(s) { const l = s.projects.filter((p) => !p.collapsed && (p.phase === "insaat" || p.done)); return l.length ? l.reduce((a, p) => a + p.kalite, 0) / l.length : 65; }

function ozelGun(s) {
  const ay = s.t % 12;
  const g = { 0: "Yeni yılınız kutlu olsun! 🎆 Yeni yılda yeni yuvalar!", 2: "8 Mart Dünya Kadınlar Günü kutlu olsun 🌷", 3: "Mübarek Ramazan Bayramınız kutlu olsun 🌙",
    4: "Tüm annelerimizin Anneler Günü kutlu olsun 💐", 5: "Kurban Bayramınız mübarek olsun 🐑", 7: "30 Ağustos Zafer Bayramımız kutlu olsun 🇹🇷",
    9: "Cumhuriyetimizin yıl dönümü kutlu olsun 🇹🇷", 10: "10 Kasım'da Ata'mızı saygı ve rahmetle anıyoruz.", 11: "Mutlu yıllar! 🎄 Yeni evinizde geçirin diye çalışıyoruz." };
  return `${g[ay] || "Hayırlı Cumalar 🌿"} — ${s.firma || "Firmamız"} ailesi`;
}

export function available(s) {
  ensure(s);
  return POSTS.filter((p) => p.need(s)).map((p) => {
    const proj = p.proj ? p.proj(s) : null;
    const yalan = !!p.lie(s, proj);
    return { id: p.id, ad: p.ad, ikon: p.ikon, img: p.img, flex: !!p.flex, yalan, preview: p.text(s, proj || {}), ders: p.ders };
  });
}

// ---------- Paylaşım yapma ----------
// applyFx: engine'deki etki uygulayıcı (bağımlılığı tersine çevirmemek için dışarıdan verilir)
export function post(s, id, applyFx) {
  const so = ensure(s);
  if (!canPost(s)) return null;
  const P = POSTS.find((p) => p.id === id);
  if (!P || !P.need(s)) return null;
  const proj = P.proj ? P.proj(s) : null;
  const yalan = !!P.lie(s, proj);
  const text = P.text(s, proj || {});
  const deltas = [];
  const fx = P.dynamicFx ? P.dynamicFx(s) : yalan ? P.lieFx : P.fx;
  applyFx(s, fx, P.projFx ? proj : null, deltas);
  // Gösteriş paylaşımları: ustalar ve mağdurlar kızgınsa ters teper
  let tepki = 0;
  if (P.flex) {
    tepki = (s.e < 45 ? 1 : 0) + (s.m >= 5 ? 1 : 0) + (s.n < 0 ? 1 : 0);
    if (tepki) applyFx(s, `i-${2 * tepki} e-${3 * tepki}`, null, deltas);
  }
  so.hype = clamp(so.hype + P.hype * (yalan ? 1.3 : 1), 0, 0.12);
  const kitle = so.takipci + so.sahte;
  const oran = 0.03 + (P.flex ? 0.02 : 0) + (tepki ? 0.04 : 0) + (yalan && s.m > 10 ? 0.03 : 0);
  const likes = Math.round(so.takipci * oran * (0.6 + Math.random() * 0.8) + so.sahte * 0.002);
  const p = { id: so.seq++, t: s.t, tur: P.id, ikon: P.ikon, img: P.img, text, yalan, agir: !!P.agir, flex: !!P.flex, tepki,
    likes, paylas: Math.round(likes * (0.05 + Math.random() * 0.1)), proj: proj ? proj.name : null, ifsa: false, viral: false,
    yorumlar: yorumlar(s, P, yalan, tepki, proj) };
  // Dürüst ve samimi paylaşımlar bazen viral olur
  if (!yalan && !tepki && Math.random() < (P.id === "ozur" ? 0.35 : P.id === "rapor" ? 0.2 : 0.06)) {
    p.viral = true; p.likes *= 12; p.paylas *= 20;
    const art = Math.round(kitle * 0.4 + 800);
    so.takipci += art; applyFx(s, "i+3", null, deltas);
    p.yorumlar.unshift(yorum("fan", s, "🔥 Bu paylaşım keşfette! Böyle müteahhit görmedim."));
  } else if (tepki >= 2 && Math.random() < 0.5) {
    p.viral = true; p.linc = true; p.likes *= 3; p.paylas *= 30;
  }
  so.takipci += Math.round(so.takipci * (0.01 + P.hype) + 20);
  so.posts.unshift(p);
  if (so.posts.length > 40) so.posts.length = 40;
  so.lastPost = s.t;
  const events = [];
  if (p.linc) events.push(["linc", "Paylaşımın tepki topladı: yorumlar mağdur ve usta dolu, ekran görüntüleri dolaşıyor."]);
  if (p.viral && !p.linc) events.push(["viral", "Paylaşımın viral oldu! Takipçilerin katlandı."]);
  if (p.linc && s.t - so.lastLinc > 5) { so.lastLinc = s.t; s.queue.unshift(lincCard(s, p)); }
  return { post: p, deltas, events, ders: P.ders };
}

// ---------- Reklam ve takipçi ----------
export const REKLAM = [
  { id: "fenomen", ad: "Fenomen Ayça'ya reklam ver", ikon: "🤳", fiyat: (s) => 0.35 * ms(s),
    a: "Sosyal medya fenomeni Ayça, 'bu projeye bayıldım' videosu çekecek. 'Reklam' etiketi koymayacak.",
    ders: "Ticari ilişkisi olduğu hâlde bunu belirtmeyen fenomen paylaşımları gizli reklamdır; Ticaret Bakanlığı'nın sosyal medya etkileyicileri kılavuzu reklamın açıkça belirtilmesini ister. Fenomenin beğendiği daireye değil, tapu ve ruhsat kayıtlarına bakın." },
  { id: "bot", ad: "10 bin sahte takipçi al", ikon: "🤖", fiyat: () => 0.06,
    a: "Takipçi sayın büyük görünür, yatırımcılar etkilenir. Yorumların yarısı 'Nice pic 🔥' olur.",
    ders: "Takipçi, beğeni ve yorum satın almak bir firmanın güvenilirliği hakkında yanıltıcı bir izlenim yaratır. Takipçisi çok ama yorumları anlamsız ve etkileşimi düşük hesaplara şüpheyle yaklaşın." },
];

export function reklam(s, id, applyFx) {
  const so = ensure(s);
  const R = REKLAM.find((r) => r.id === id);
  if (!R || s.ending) return null;
  const f = R.fiyat(s);
  if (s.n < f) return { hata: "Kasada yeterli para yok." };
  const deltas = [["n", -f]]; s.n -= f;
  const events = [];
  if (id === "fenomen") {
    if (s.t - so.reklamT < 3) { s.n += f; return { hata: "Ayça 'bu ay doluyum canım' dedi. Birkaç ay sonra tekrar dene." }; }
    so.reklamT = s.t;
    so.takipci += Math.round(3000 + Math.random() * 9000 + so.takipci * 0.1);
    so.hype = clamp(so.hype + 0.05, 0, 0.12);
    applyFx(s, "i+2 g+2", null, deltas);
    const p = { id: so.seq++, t: s.t, tur: "fenomen", ikon: "🤳", img: "fenomen", yazar: "ayca", yalan: false, likes: Math.round(20000 + Math.random() * 40000), paylas: 900,
      text: `Canlarım bu projeye bayıldııım 😍 ${s.firma} gerçekten çok özenli çalışıyor. Link profilimde 💕 #keşfet`, yorumlar: [] };
    if (s.m >= 8 && Math.random() < 0.55) {
      p.ifsa = true; p.gizliReklam = true;
      p.yorumlar.push(yorum("magdur", s), yorum("pinar", s, "Bu işbirliğinin reklam olduğu belirtilmemiş. Ayrıca firmanın mağdurlarıyla konuştum; dosya yakında."), yorum("trol", s, "Ayça abla beton da mı tatlı 😂"));
      applyFx(s, "i-5", null, deltas);
      events.push(["linc", "Ayça'nın takipçileri yorumlarda mağdurlarını buldu. Video silindi ama ekran görüntüleri kaldı."]);
    } else {
      p.yorumlar.push(yorum("fan", s), yorum("alici", s), yorum("trol", s));
      events.push(["viral", "Ayça'nın videosu 1 milyon izlendi. DM'ler doldu."]);
    }
    so.posts.unshift(p);
  } else if (id === "bot") {
    so.sahte += 10000;
    applyFx(s, "g+1", null, deltas);
    events.push(["info", "Takipçi sayın bir gecede 10 bin arttı. Yorumlarda 'Nice 🔥' yağıyor."]);
  }
  return { deltas, events, ders: R.ders };
}

// ---------- Aylık akış: ifşa, #TapumuVer, takipçi değişimi ----------
export function monthly(s, applyFx, events) {
  const so = ensure(s);
  // Organik takipçi: itibarla büyür, kötü günlerde erir
  so.takipci = Math.max(50, so.takipci * (1 + (s.i - 45) / 3000) + (s.i > 50 ? 15 : -10));
  so.hype = Math.max(0, so.hype * 0.85 - 0.002);
  // Son paylaşımların altına yeni yorumlar düşer
  const son = so.posts.find((p) => !p.yazar && s.t - p.t <= 3);
  if (son && Math.random() < 0.6) {
    const rol = s.m >= 3 && Math.random() < 0.5 ? "magdur" : pick(["trol", "fan", "alici", s.e < 45 ? "usta" : "fan", so.sahte ? "bot" : "trol"]);
    son.yorumlar.push(yorum(rol, s)); if (son.yorumlar.length > 8) son.yorumlar.splice(1, 1);
    son.likes += Math.round(so.takipci * 0.004 * Math.random());
    so.okunmadi++;
  }
  // Yalanlar ekran görüntüsüyle ifşa olabilir
  for (const p of so.posts) {
    if (!p.yalan || p.ifsa || s.t - p.t > 30) continue;
    const ch = 0.06 + (p.agir ? 0.06 : 0) + Math.min(0.1, s.m / 300) + (s.flags.pinarTehdit || s.flags.pinarRusvet ? 0.05 : 0) - (has(s, "tv") ? 0.03 : 0);
    if (Math.random() < ch) { ifsa(s, p, applyFx, events); break; }
  }
  // Sahte takipçi ifşası
  const so2 = sahteOran(s);
  if (so.sahte > 0 && Math.random() < so2 * 0.07) {
    const d = [];
    applyFx(s, "i-5 g-4", null, d);
    events.push(["linc", `📸 "${s.firma}'in takipçilerinin %${Math.round(so2 * 100)}'i bot çıktı" ekran görüntüsü yayıldı.`]);
    news(s, `Takipçi analizine göre müteahhit firmasının takipçilerinin çoğu sahte hesap`);
    so.gecmis.push({ t: s.t, txt: "Sahte takipçiler ifşa oldu" });
    so.sahte = Math.round(so.sahte * 0.2);
  }
  // #TapumuVer: mağdurların kampanyası
  if (s.m >= 12) so.tapu += s.m * (6 + Math.random() * 8) + so.tapu * 0.05;
  else so.tapu *= 0.9;
  if (so.tapu > 150) {
    const kayip = Math.min(0.8, so.tapu / 30000 + 0.1);
    s.i = clamp(s.i - kayip, 0, 100);
    so.takipci = Math.max(50, so.takipci * 0.99);
  }
  const esik = [800, 5000, 25000];
  if (so.tapuSeviye < esik.length && so.tapu >= esik[so.tapuSeviye]) {
    so.tapuSeviye++; so.okunmadi += 2;
    s.queue.push(tapuCard(s, so.tapuSeviye));
    news(s, `#TapumuVer etiketi gündemde: mağdur aileler müteahhitten tapularını istiyor`);
  }
}

function ifsa(s, p, applyFx, events) {
  const so = ensure(s);
  p.ifsa = true; so.okunmadi += 3;
  const d = [];
  applyFx(s, p.agir ? "i-7 r+3 g-3" : "i-4 r+1 g-2", null, d);
  so.takipci = Math.max(50, so.takipci * 0.9);
  so.tapu += 400 + s.m * 20;
  p.not = notFor(s, p);
  p.yorumlar.unshift(yorum("pinar", s, "📸 Arşivledim. Bu paylaşımla aynı gün tarihli belgeler bende; haberi yarın yayında."));
  events.push(["linc", `📸 "${kisalt(p.text)}" paylaşımının ekran görüntüsü alındı ve gerçekler yan yana kondu.`]);
  news(s, `Müteahhidin "${kisalt(p.text, 34)}" paylaşımı ifşa oldu`);
  so.gecmis.push({ t: s.t, txt: "Paylaşım ifşa oldu" });
  if (s.t - so.lastLinc > 5) { so.lastLinc = s.t; s.queue.push(lincCard(s, p)); }
}

function notFor(s, p) {
  return {
    olmedik: (() => { const g = act(s).filter((x) => x.gecikme > 6).length; return `Bağlam: Firmanın ${s.m} mağduru var${g ? `; ${g} projede teslim tarihi geçmiş durumda` : ""}${s.n < 0 ? "; kasası ekside, ödemeler aksıyor" : ""}.`; })(),
    insaat: "Bağlam: Bu projede aylardır iş yok; fotoğraf eski tarihli.",
    teslim: "Bağlam: Binanın iskânı yok; aileler taşınamıyor.",
    sahteRapor: "Bağlam: Paylaşılan rapordaki laboratuvar adı ve numara uyuşmuyor. Laboratuvar böyle bir rapor düzenlemediğini açıkladı.",
    kampanya: "Bağlam: Bu projenin kat irtifakı yok. Aynı daireler başka alıcılara da satılmış olabilir.",
    iftira: "Bağlam: Firma hakkında açılmış çok sayıda dava ve icra takibi var.",
  }[p.tur] || "Bağlam: Okuyucular bu paylaşıma belgelerle itiraz etti.";
}

const kisalt = (t, n = 40) => (t.length > n ? t.slice(0, n - 1) + "…" : t);
function news(s, txt) { s.news = s.news || []; s.news.unshift(`${pick(["GÜNDEM", "VİRAL", "SOSYAL MEDYA"])}: ${txt}`); s.news.length = Math.min(s.news.length, 12); }

// ---------- Kartlar ----------
function lincCard(s, p) {
  return {
    kind: "sys", phase: "sosyal", banner: "LİNÇ", noStep: true, title: "Sosyal Medyada Linç",
    speaker: { role: "GZ", name: "@beton_kafa_34", dia: "istanbul", label: "", roleLabel: "Harç'ta trol hesap", emoji: "📱", quote: pick(["Ekran görüntüsü bende, silsen de faydası yok 😂 #TapumuVer", "Mağdurlar kirada, patron havuzda. Paylaş paylaş paylaş!", "Bu adamın bütün gönderilerini arşivledim, sırayla paylaşıyorum."]) },
    text: `"${kisalt(p.text, 70)}" paylaşımın binlerce kez paylaşıldı. Yorumlar mağdurlar, ustalar ve trollerle dolu. Telefonun durmadan titriyor.`,
    ders: "Toplu sosyal medya tepkileri gerçek bir mağduriyete dikkat çekebilir; ama hakaret, tehdit ve kişisel bilgi paylaşımı suçtur. Mağdurlar için en etkili yol belgeli şikâyet, avukat ve örgütlü hak arayışıdır; firmalar için ise sorunu çözmek.",
    choices: [
      { label: "Canlı yayın aç, mağdurlara takvim ver", fx: "n-1 i+4 v+6 m-2 r-2", result: "Yayında sert sorular geldi. Ama kimse 'kaçtı' diyemedi." },
      { label: "Yorumları kapat, gönderiyi sil", fx: "i-3", result: "Gönderi silindi. Ekran görüntüleri silinmedi." },
      { label: "Avukatla herkese ihtarname çek", fx: "n-0.3 i-5 r+2 v-3", result: "İhtarname de ekran görüntüsüyle paylaşıldı. Etiket büyüdü." },
      { label: "Bot ordusu kirala, karşı kampanya başlat 🎲", fx: "n-0.4 v-5", act: { type: "gamble", p: 0.45, win: "i+3", lose: "i-8 r+2", winText: "#DestekleriniziBekliyoruz etiketi gündeme oturdu. Kimse bot olduğunu fark etmedi.", loseText: "Aynı cümleyi kuran 3 bin hesap yakalandı. 'Bot ordusu' haberi asıl haberden büyük oldu." }, result: "" },
    ],
  };
}

function tapuCard(s, lvl) {
  const sayi = fmtK(ensure(s).tapu);
  const kisi = [
    { name: "dernek başkanı Hatice Hanım", dia: "dogu", quote: "Bıra, biz sadaka istemiyoruz, tapumuzu istiyoruz! Etiketi herkes paylaşsın! #TapumuVer" },
    { name: "mağdur öğretmen Selin", dia: "ege", quote: "Beş yıldır kiradayım gari. Her ay hem kira hem kredi ödüyorum. #TapumuVer" },
    { name: "gurbetçi mağdur Yılmaz ailesi", dia: "gurbetci", quote: "Abi, Almanya'dan otuz yıl biriktirdik, bitte! Tapumuzu ver! #TapumuVer" },
  ][lvl - 1] || { name: "mağdurlar", dia: "istanbul", quote: "#TapumuVer" };
  return {
    kind: "sys", phase: "sosyal", banner: "#TAPUMUVER", noStep: true, title: lvl === 1 ? "#TapumuVer Başladı" : lvl === 2 ? "#TapumuVer Gündemde" : "#TapumuVer Ana Haberde",
    speaker: { role: "AL", name: kisi.name, dia: kisi.dia, label: "", roleLabel: "Mağdur", emoji: "✊", quote: kisi.quote },
    text: `Mağdurların başlattığı #TapumuVer etiketi ${sayi} gönderiye ulaştı. ${lvl >= 2 ? "Ulusal hesaplar da paylaşmaya başladı. " : ""}${lvl >= 3 ? "Akşam haberleri etiketle açıldı; milletvekilleri soru önergesi verdi." : "Her gönderide firmanın adı ve senin fotoğrafın var."}`,
    ders: "Mağdurların sosyal medyada örgütlenmesi, yıllarca süren dosyaların kamuoyunun gündemine girmesini sağlayabiliyor. Hak arayanlar için: belgeleri tek dosyada toplayın, toplu avukat tutun, tapuya şerh ve ihtiyati tedbir yollarını araştırın; paylaşımlarda hakaret ve tehditten kaçının.",
    choices: [
      { label: "Mağdurlarla noterde protokol imzala", fx: "n-2 i+6 v+8 m-6 r-3", result: "Protokol paylaşıldı. Etiket yavaşladı ama takip sürüyor." },
      { label: "Etikete erişim engeli getirtmeye çalış", fx: "n-0.5 i-4 r+2 v-4", act: { type: "gamble", p: 0.3, win: "i+2", lose: "i-6", winText: "Birkaç hesap kapandı. Etiket bir süre sustu.", loseText: "Erişim engeli talebi haber oldu. Etiket iki katına çıktı." }, result: "" },
      { label: "#TapularHazır diye karşı etiket başlat", fx: "i+1 v-6 F:tapuYalan", result: "Karşı etiket bir gün tuttu. Sonra mağdurlar tapusuz evlerinin fotoğraflarını altına eklemeye başladı." },
    ],
  };
}

// ---------- Yorum bankası ----------
// Rol: magdur, usta, rakip, pinar, trol, fan, bot, alici, arsa, ayca. Mağdur/usta/arsa şiveyle konuşur.
const HANDLE = {
  magdur: ["tapusuz_aile", "kirada_5_yil", "hatice.magdur", "magdur_ogretmen", "evimi_istiyorum", "selin_tapu"],
  usta: ["kalipci_rifat61", "demirci_bekir", "sivaci_hasan07", "tesisatci.ramazan", "betoncu_yusuf"],
  rakip: ["cakal.cevdet", "cevdet_insaat_resmi"],
  pinar: ["pinar.dosya"],
  trol: ["beton_kafa_34", "yorumcu_nuri", "kum_harc_tas", "iskan_nerde", "sulu_beton_", "zemin_etudu_yok"],
  fan: ["emlakci_burak", "insaat_sevdalisi", "girisimci_kaan", "basarili_insanlar"],
  bot: ["user8472910", "lovely.life.2231", "xx_nice_xx", "follow4follow_tr", "ahmet19283746"],
  alici: ["ev_arayan_ece", "ilk_evim_mert", "yazilimci_tolga", "hemsire_nur"],
  arsa: ["nuri_ogretmen_emekli", "fatma_teyze_torun", "hacirizaamca"],
};
const DIA_LINE = {
  magdur: {
    karadeniz: ["Uşağum, bizim tapu nerede? Üç yıldur kiradayuz! #TapumuVer", "Paylaşmaya vaktun var, bizim eve yok mi? #TapumuVer"],
    dogu: ["Bıra, çocuklarım kirada büyüdü, sen poz veriyorsun! #TapumuVer", "Wallah bu ahım seni bulur! #TapumuVer"],
    ege: ["Gari utanmıyon mu? Benim ikramiyem nerde? #TapumuVer", "Naapıyon sen, evimizi ver de öyle paylaş! #TapumuVer"],
    adana: ["Gardaş bizim ev nerde? Paylaşım yapacağına tapuyu ver! #TapumuVer"],
    ic: ["Gine mi paylaşım? Biz dört senedir bekliyoz! #TapumuVer"],
    ankara: ["Abe, kredi ödüyoz, ev yok! Bu ne iş? #TapumuVer"],
    istanbul: ["Abi bizim daire iki kişiye satılmış, cevap ver! #TapumuVer", "Kira + kredi = biz. Havuz = sen. #TapumuVer"],
    antep: ["Len, düğün evimizi yaktın, poz mu veriyon? #TapumuVer"],
    gurbetci: ["Abi, Almanya'dan geldik, ev yok, tapu yok, bitte! #TapumuVer"],
  },
  usta: {
    karadeniz: ["Patron, Mercedes'e para var da hakedişe yok mi? 🤔", "Ula o fotoğraftaki kalıbu ben kurdum, yevmiyem hâlâ yok!"],
    dogu: ["Bıra, üç aydır yevmiye yok, sen yat paylaşıyorsun!", "Ağa, o binada benim alın terim var, parası yok."],
    ege: ["Gari patron, hakedişi ne zaman paylaşıcan? 😅"],
    adana: ["Ağam, bu fotoğrafı ben çektim, param nerde? 😡"],
    ic: ["Beyim, poz güzel de ekip köye döndü, haberin olsun."],
    ankara: ["Yav abi, iki aydır para yok, burada villa paylaşıyon!"],
    istanbul: ["Reis, ustaların parası ne zaman? Soruyorum sadece 🙂"],
    antep: ["Gardaş, işçiler yevmiye bekliyor, sen Bodrum'dasın!"],
  },
  arsa: {
    karadeniz: ["Oğlum, fotoğrafu güzel çekmişsun, bizim daireler ne oldi?"],
    ic: ["Oğlum, bizim kat nerde? Fotoğrafta göremedim."],
    ege: ["Gız, benim denize bakan daire bu mu? Hiç benzemiyo!"],
    ankara: ["Abe oğlum, kira yardımı üç aydır yatmadı, haberin olsun."],
    istanbul: ["Abicim, sözleşmedeki tarih geçti, bir arasan?"],
  },
};
const GENEL = {
  rakip: ["Hayırlı olsun uşağum 😏 Betonu kaç sulandırdun?", "Maşallah maşallah. Ruhsat da çıktı mı bu arada? 🦊", "Güzel paylaşım. Mağdurların da yakında paylaşır 😉"],
  pinar: ["Bu paylaşımı arşivledim. Ruhsat tarihiyle teslim tarihinizi karşılaştırınca ilginç bir tablo çıkıyor.", "Firmanızın mağdurlarıyla görüştüm. Açıklama yapmak isterseniz DM'im açık.", "Tapu kayıtlarıyla bu paylaşım uyuşmuyor. Haberimde yer vereceğim."],
  trol: ["Müteahhit ve dürüst aynı cümlede 😂", "Beton mu sulu, açıklama mı? 🤡", "Bu binada oturacak olanlara şimdiden geçmiş olsun", "Kolonları sayan var mı? Bende 3 çıktı 😂", "Deprem gelince de böyle paylaşırsın herhalde", "Bi iskân göster, abone olacağım 😂"],
  fan: ["Maşallah abi, başarılarının devamını dilerim 👏", "Bu firmayı tanıyorum, çok düzgün çalışırlar 🙏", "Helal olsun, emek kokuyor 🔥", "Böyle girişimciler lazım bu memlekete 💪"],
  bot: ["Nice pic 🔥🔥", "Amazing 😍😍😍", "Follow me pls 🙏", "👏👏👏👏", "Harika paylaşım! Profilime de bakın 💰💰"],
  alici: ["Fiyat DM?", "İskânı var mı bu projenin?", "Tapuda gerçek bedel mi yazıyor, soruyorum.", "Kat irtifakı kurulmuş mu? Kapora vermeden önce sormak istedim.", "Yapı denetim firması hangisi?"],
  ayca: ["Canım benim 😍 Çok başarılısınız 💕"],
};
const EMO = { magdur: "✊", usta: "👷", rakip: "🦊", pinar: "🎤", trol: "🤡", fan: "😊", bot: "🤖", alici: "🏠", arsa: "🧓", ayca: "💁‍♀️" };
const DIAS = ["karadeniz", "dogu", "ege", "adana", "ic", "ankara", "istanbul", "antep", "gurbetci"];

export function yorum(rol, s, txt) {
  let text = txt;
  if (!text) {
    if (DIA_LINE[rol]) { const bank = DIA_LINE[rol]; const d = pick(Object.keys(bank)); text = pick(bank[d]); }
    else text = pick(GENEL[rol] || GENEL.fan);
  }
  const h = pick(HANDLE[rol] || HANDLE.fan);
  const likes = Math.round((rol === "magdur" || rol === "pinar" ? 40 : rol === "bot" ? 0 : 8) * (0.5 + Math.random() * 3) + (rol === "magdur" ? s.m * 2 : 0));
  return { rol, h: rol === "bot" ? h : h, emoji: EMO[rol] || "🙂", text, likes };
}

function yorumlar(s, P, yalan, tepki, proj) {
  const so = ensure(s);
  const r = [];
  const add = (rol, txt) => r.push(yorum(rol, s, txt));
  if (s.m >= 3) add("magdur");
  if (s.m >= 15) add("magdur");
  if (P.flex && (s.e < 55 || tepki)) add("usta");
  if (P.id === "insaat" && proj && proj.gecikme > 3) add("arsa");
  if (s.flags.cevdetDusman || s.flags.cevdetOrtak || s.completed >= 1) if (Math.random() < 0.45) add("rakip");
  if ((yalan && Math.random() < 0.5) || s.m > 20 || (s.sins || []).length >= 2) if (Math.random() < 0.6) add("pinar");
  if (P.id === "kampanya" || P.id === "insaat" || P.id === "teslim") add("alici");
  if (Math.random() < 0.7) add("trol");
  add("fan");
  if (so.sahte > 0) { add("bot"); if (sahteOran(s) > 0.5) add("bot"); }
  if (P.id === "ozur") { r.length = 0; add("magdur", "Önce tapuyu görelim, sonra inanırız. Ama bu bir adım. #TapumuVer"); add("pinar", "Takvimi takip edeceğim. Her ay güncelleme bekliyoruz."); add("fan", "Hatasını kabul eden az kişi var, umarım sözünü tutarsınız."); }
  if (P.id === "rapor" && ortKalite(s) < 60) { r.length = 0; add("alici", "Raporda dayanım düşük görünüyor, güçlendirme yapılacak mı?"); add("trol", "Adam kendi raporunu paylaşıp kendini yaktı 😂 ama saygı duydum"); add("pinar", "Şeffaflık için teşekkürler. Takipteyim."); }
  return r.slice(0, 6);
}

// ---------- Simülasyon için basit politika ----------
export function botTurn(s, pol, applyFx) {
  if (!canPost(s) || Math.random() > 0.35) return;
  const av = available(s);
  if (!av.length) return;
  const pref = pol === "cakal" ? ["kampanya", "olmedik", "sahteRapor", "araba", "villa", "iftira"] : pol === "durust" ? ["ozur", "rapor", "teslim", "bayram", "insaat"] : av.map((a) => a.id);
  const durust = pol === "durust" || (pol === "karma" && Math.random() < 0.7);
  const c = av.find((a) => pref.includes(a.id) && (!durust || !a.yalan)) || av[0];
  if (durust && c.yalan) return;
  post(s, c.id, applyFx);
  if (pol === "cakal" && Math.random() < 0.1) reklam(s, Math.random() < 0.5 ? "bot" : "fenomen", applyFx);
}

export function tarihEtiket(s, t) {
  const d = s.t - t;
  if (d <= 0) return "bu ay";
  if (d < 12) return `${d} ay önce`;
  return `${AYLAR[t % 12]} ${2012 + Math.floor(t / 12)}`;
}
