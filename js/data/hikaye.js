// HİKÂYELER — oyun boyunca geri dönen karakterler, geçmişten patlayan dosyalar, kaçış operasyonu ve son perde.
// Bütün kartlar düz veri döner (kayda yazılabilsin diye içinde fonksiyon yok).
import { sp } from './dialect.js';
import { havalimaniChoice } from './mini.js';

const sys = (o) => ({ kind: "sys", phase: "hikaye", ...o });
const flag = (s, f) => !!s.flags[f];

// ---------- Hikâye zincirleri ----------
// Her adım: when(s) koşulu sağlanınca, hikâyenin sıradaki kartı gelir.
export const ARCS = [
  { id: "cevdet", ad: "Çakal Cevdet", steps: [
    { when: (s) => s.completed >= 1, card: () => sys({
      banner: "RAKİP", title: "Çakal Cevdet'in Teklifi",
      speaker: sp("Çakal Cevdet", "karadeniz", "Rakip müteahhit", "Uşağum, Fikirtepe'de bir teyze var, arsası köşe başı. Vekaleti bir alalum, gerisini ben bilürüm. Yarı yarıya, ha?", "🦊"),
      text: "Semtin en bilinen 'yapsatçısı' Çakal Cevdet, rakı masasında sana ortaklık teklif etti. Adı üç ayrı mağdur dosyasında geçiyor ama hiç içeri girmedi.",
      ders: "Yaşlı ve yalnız arsa sahiplerinden alınan geniş kapsamlı vekaletlerle yapılan satışlar, müteahhit dolandırıcılığının en bilinen yöntemlerindendir.",
      choices: [
        { label: "Kalk git masadan", fx: "v+4 F:cevdetDusman", result: "Cevdet arkandan güldü: 'Sen bu işte aç kalursun uşağum.'" },
        { label: "Ortak ol", fx: "n+3 v-10 r+6 m+2 F:cevdetOrtak", result: "Teyze vekaleti imzaladı. Payını nakit aldın." },
        { label: "Teyzeyi ara, uyar", fx: "v+8 i+4 F:cevdetDusman", result: "Teyze ağladı, sana dua etti. Cevdet'in sana bakışı değişti." },
      ] }) },
    { when: (s) => s.flags.cevdetOrtak || s.flags.cevdetDusman, card: (s) => flag(s, "cevdetOrtak") ? sys({
      banner: "ŞOK", title: "Cevdet Seni de Yaktı",
      speaker: sp("Çakal Cevdet", "karadeniz", "Rakip müteahhit", "Uşağum ben bi süre Batum'a gidiyrum. Dosyada senun da imzan var, haberun olsun. Allah'a emanet!", "🦊"),
      text: "Cevdet, ortak işin bütün parasını alıp sırra kadem bastı. Teyzenin avukatı dosyada senin adını da buldu.",
      ders: "Ortak yürütülen dolandırıcılıklarda her ortak ayrı ayrı sorumlu tutulur; 'ben sadece aracıydım' savunması çoğu zaman işe yaramaz.",
      choices: [
        { label: "Teyzeye parasını kendi cebinden öde", fx: "n-3 v+10 r-6 m-2", result: "Teyze kapıda seni öptü. Dosya kapandı." },
        { label: "Her şeyi Cevdet'in üstüne at", fx: "r+6 v-4", result: "Savcı ikinizi de arıyor. Biri Batum'da, biri burada." },
        { label: "Cevdet'in yarım kalan inşaatını ucuza kap", fx: "n+2 r+8 v-6 m+3", result: "Mağdurların yarısı artık senin mağdurun." },
      ] }) : sys({
      banner: "RAKİP", title: "Cevdet Kahvede Konuşuyor",
      speaker: sp("Çakal Cevdet", "karadeniz", "Rakip müteahhit", "Bu adamun betonu kum, demiri çürük, bilesunuz! Ben söyledum, siz bilürsünuz!", "🦊"),
      text: "Cevdet, senin yeni projenin arsa sahiplerine gidip hakkında dedikodu yaymış. Bir arsa sahibi imzayı erteledi.",
      ders: "Karalama kampanyaları sektörde sık görülür; en iyi savunma şeffaflıktır: beton test raporları, yapı denetim belgeleri ve teslim edilmiş eski projeler.",
      choices: [
        { label: "Arsa sahiplerini eski binalarına götür, raporları göster", fx: "i+6 d+1", result: "Arsa sahibi betonuna vurdu: 'Bu sağlam.' İmza atıldı." },
        { label: "Sen de onun hakkında konuş", fx: "i-2 v-3", result: "Kahve iki kampa bölündü." },
        { label: "Cevdet'in eski mağdurlarını bul, dava açmalarına yardım et", fx: "n-0.5 v+5 i+3 F:cevdetDava", result: "Mağdurlar ilk kez bir avukata ulaştı." },
      ] }) },
    { when: (s) => s.completed >= 4, card: (s) => flag(s, "cevdetOrtak") ? sys({
      banner: "SON DAKİKA", title: "Çakal Cevdet Yakalandı",
      speaker: sp("TV muhabiri Kerem", "istanbul", "Basın", "Son dakika! Yüzlerce kişiyi mağdur eden müteahhit Batum'da yakalandı. İfadesinde bazı isimler verdiği öğrenildi!", "🎤"),
      text: "Cevdet iade edildi. Savcılıkta konuşuyor. Senin adını verip vermeyeceği yarın belli olacak.",
      ders: "Kırmızı bültenle aranan kişiler, iade anlaşması olan ülkelerde yakalanıp Türkiye'ye teslim edilebilir.",
      choices: [
        { label: "Beklemeden savcılığa git, ifade ver", fx: "r-10 v+6 i-3", result: "Etkin pişmanlık dosyana not düştü." },
        { label: "Cevdet'in avukatına 'hediye' gönder", fx: "n-1", act: { type: "gamble", p: 0.55, win: "r-5", lose: "r+25 i-10", winText: "Cevdet adını vermedi. Şimdilik.", loseText: "Cevdet hem adını verdi hem de hediyeyi anlattı!" }, result: "" },
        { label: "Dua et", fx: "", act: { type: "gamble", p: 0.4, win: "", lose: "r+20 i-8", winText: "Cevdet adını vermedi.", loseText: "Manşet: 'Cevdet'in ortağı da ortaya çıktı'." }, result: "" },
      ] }) : sys({
      banner: "SON DAKİKA", title: "Çakal Cevdet Tutuklandı",
      speaker: sp("TV muhabiri Kerem", "istanbul", "Basın", "Mağdurların yıllardır süren mücadelesi sonuç verdi! Müteahhit Cevdet tutuklandı!", "🎤"),
      text: "Cevdet'in yarım kalan üç inşaatı ortada kaldı. Mağdurlar sana geliyor: 'Bu binaları sen bitir.'",
      ders: "Yarım kalan projelerde alıcılar ve arsa sahipleri bir araya gelip yeni bir müteahhitle anlaşabilir; bu süreçte tapu şerhleri ve sözleşmeler hayati önem taşır.",
      choices: [
        { label: "Binaları maliyetine bitirmeyi üstlen", fx: "n-2 i+12 v+8 m-5", result: "Bir teyze sana 'oğlum' dedi. Mahalle seni konuşuyor." },
        { label: "Arsaları icradan ucuza topla", fx: "n+3 v-6 i-3", result: "Mağdurların evleri senin arsan oldu." },
        { label: "Uzak dur", fx: "", result: "Başkasının derdi." },
      ] }) },
  ] },

  { id: "pinar", ad: "Gazeteci Pınar", steps: [
    { when: (s) => (s.sins || []).length >= 2 || s.m >= 20, card: () => sys({
      banner: "BASIN", title: "Pınar Seni Arıyor",
      speaker: sp("araştırmacı gazeteci Pınar", "istanbul", "Basın", "Merhaba, projelerinizle ilgili bir dosya hazırlıyorum. Mağdurlarınızla konuştum. Sizin de söyleyeceklerinizi yayınlamak isterim.", "🎤"),
      text: "Araştırmacı gazeteci Pınar, senin hakkında kapsamlı bir haber dosyası hazırlıyor. Elinde tapu kayıtları ve ses kayıtları var.",
      ders: "Araştırmacı gazetecilik, müteahhit dolandırıcılıklarının ortaya çıkmasında büyük rol oynar. Basına baskı yapmak çoğu zaman haberin etkisini büyütür.",
      choices: [
        { label: "Röportaj ver, hatalarını kabul et", fx: "i-3 v+6 r-4 F:pinarDurust", result: "Pınar şaşırdı. Notlarına 'ilk kez biri kabul etti' yazdı." },
        { label: "Gazetesine yüklü reklam teklif et", fx: "n-0.5 F:pinarRusvet", result: "Pınar telefonu kapattı. Teklifini kaydetmişti." },
        { label: "Avukatınla tehdit mektubu gönder", fx: "r+4 v-6 F:pinarTehdit", result: "Mektup gitti. Pınar geri adım atmadı." },
      ] }) },
    { when: (s) => s.flags.pinarDurust || s.flags.pinarRusvet || s.flags.pinarTehdit, card: (s) => {
      const dur = flag(s, "pinarDurust"), rus = flag(s, "pinarRusvet"), tv = !!(s.owned && s.owned.tv);
      return sys({
        banner: "MANŞET", title: dur ? "Manşet: 'Müteahhit İlk Kez Konuştu'" : rus ? "Manşet: 'Susması İçin Reklam Teklif Etti'" : "Manşet: 'Gazeteciyi Tehdit Eden Müteahhit'",
        speaker: sp("araştırmacı gazeteci Pınar", "istanbul", "Basın", dur ? "Haberi adil yazdım. Ama mağdurlarınız hâlâ bekliyor." : "Söylediğim gibi: her şeyi yayınladım. Ses kaydı dahil.", "🎤"),
        text: dur ? "Haber yayımlandı. Hatalarını kabul etmen okuyucuların dikkatini çekti; mağdurlar ise 'sözler değil tapular' diyor."
          : "Haber bütün sosyal medyayı sardı. Ses kaydın akşam haberlerinde çalındı. Telefonun susmuyor.",
        ders: "Yayınlanan haberler savcılıkların re'sen soruşturma başlatmasına yol açabilir.",
        choices: [
          { label: "Mağdurlara ödeme takvimi açıkla", fx: "n-2 i+6 v+6 m-3 r-4", result: "Takvim yayımlandı. Pınar takip edeceğini yazdı." },
          ...(tv ? [{ label: "Kendi kanalında 'karalama kampanyası' programı yaptır", fx: "i+3 v-6 r+2", result: "Kanalın seni savundu. İzleyiciler kanal değiştirdi." }] : []),
          { label: dur ? "Teşekkür et, işine dön" : "Pınar'ı dava et", fx: dur ? "i+2" : "r+6 i-8 v-4", result: dur ? "Hayat devam ediyor." : "Dava haberi, asıl haberden daha çok okundu." },
        ] });
    } },
  ] },

  { id: "aile", ad: "Aile", steps: [
    { when: (s) => s.completed >= 1 && !(s.owned && s.owned.mercedes) && s.n > 5, card: () => sys({
      banner: "EV", title: "Eşin Mercedes İstiyor",
      speaker: sp("eşin Nermin", "istanbul", "Eşin", "Komşunun kocası müteahhit bile değil, adam Mercedes almış! Ben pazara hâlâ kamyonetle mi gideceğim?", "💁‍♀️"),
      text: "Akşam yemeğinde eşin masaya bir Mercedes kataloğu koydu. Çocuklar da heyecanlı. Oysa şantiyede hakediş bekleyen ustalar var.",
      ders: "Müteahhitlik sektöründe 'görünüş' güven satar; ama nakit akışı sıkışıkken yapılan lüks harcamalar çarkın bozulmasını hızlandırır.",
      choices: [
        { label: "Al gitsin! (4 M₺)", act: { type: "buy", key: "mercedes" }, fx: "v-1", result: "Siyah Mercedes kapıda. Eşin mahalleye bir tur attı." },
        { label: "'Önce ustaların parası' de", fx: "v+4 e+3", result: "Eşin iki gün konuşmadı. Ustalar hakedişini aldı." },
        { label: "Arsa sahibinin payından 'ayarla'", act: { type: "buy", key: "mercedes" }, fx: "v-8 s-10 m+1", result: "Araba geldi. Arsa sahibinin payı biraz küçüldü." },
      ] }) },
    { when: (s) => s.t >= 30, card: () => sys({
      banner: "EV", title: "Oğlun Emre Üniversiteyi Kazanamadı",
      speaker: sp("oğlun Emre", "istanbul", "Oğlun", "Baba, puanım yetmedi. Ama arkadaşlar Londra'da okuyor, ben de gidebilir miyim? Bir de araba lazım.", "🧑"),
      text: "Emre sınavı kazanamadı. Seçenekler ortada: pahalı bir özel üniversite, yurt dışı ya da şantiyede çalışıp işi öğrenmek.",
      ders: "Kayıt dışı kazançlarla yapılan büyük aile harcamaları, mal varlığı incelemelerinde 'gelirle uyumsuz yaşam' olarak ilk bakılan kalemlerdendir.",
      choices: [
        { label: "Londra'ya gönder", fx: "n-2.5 v-1 F:ogulYurtdisi", result: "Emre Londra'da. Her ay 'para bitti' mesajı atıyor." },
        { label: "Özel üniversite", fx: "n-1", result: "Emre okulda. Arabayı da aldı sayılır." },
        { label: "Şantiyede çalışsın, işi baştan öğrensin", fx: "e+6 v+3 F:ogulSantiye", result: "Emre ilk gün elleri su topladı. Ustalar onu sevdi." },
      ] }) },
    { when: (s) => s.owned && s.owned.mercedes && s.t >= 40, card: (s) => sys({
      banner: "ŞOK", title: "Emre Mercedes'i Çarptı",
      speaker: sp("oğlun Emre", "istanbul", "Oğlun", "Baba… gece bir şey oldu. Araba… adam yerde kaldı. Ne yapacağım?", "🧑"),
      text: `Gece saat 03.00. Emre, Mercedes'le bir motosikletliye çarptı. Motosikletli yoğun bakımda. Kavşakta kamera var, yanında da şoförün.`,
      ders: "Trafik kazalarında suçun başkasına üstlendirilmesi, delil karartma ve yalan tanıklık ağır suçlardır. Mağdurun hakları ve adalet, paradan önce gelir.",
      choices: [
        { label: "Emre'yi karakola götür, yaralının ailesine sahip çık", fx: "n-1 v+10 i+2", result: "Emre ifade verdi. Yaralının annesi 'Allah razı olsun, kaçmadınız' dedi." },
        { label: "Şoför suçu üstlensin, ailesine para ver", fx: "n-1.5 v-12 r+8", result: "Şoför ifade verdi. Emre o gece hiç uyumadı." },
        { label: "Kamerayı sildir", fx: "n-0.5 v-15", act: { type: "gamble", p: 0.5, win: "r+4", lose: "r+25 i-15", winText: "Kayıt kayboldu. Kimse bir şey sormadı.", loseText: "Kamerayı silen memur konuştu. Manşet: 'Müteahhidin oğlu için delil kararttılar'." }, result: "" },
      ] }) },
    { when: (s) => s.v < 35 && s.t >= 24, card: () => sys({
      banner: "EV", title: "Eşin Bavulunu Topladı",
      speaker: sp("eşin Nermin", "istanbul", "Eşin", "Artık seni tanıyamıyorum. Televizyonda adın geçiyor, komşular yüzüme bakmıyor. Ya değiş ya ben gidiyorum.", "💁‍♀️"),
      text: "Eşin kapının önünde, elinde bavul. Çocuklar merdivende ağlıyor. Avukatı da mal paylaşımını konuşmaya hazır.",
      ders: "Boşanma öncesi mal kaçırmak için yapılan muvazaalı devirler mahkemece iptal edilebilir.",
      choices: [
        { label: "Değişeceğine söz ver, mağdurlarla görüşmeye başla", fx: "v+15 i+2", result: "Eşin bavulu indirdi. 'Görelim' dedi." },
        { label: "Malları kardeşinin üstüne geçir, sonra boşan", fx: "r+8 v-8 F:muvazaa", result: "Kâğıt üstünde fakirsin. Kardeşin artık zengin." },
        { label: "Yarı yarıya paylaş, yollarınızı ayırın", fx: "n-4 v+3", result: "Ev sessiz. Çok sessiz." },
      ] }) },
    { when: (s) => s.owned && s.owned.villa, card: () => sys({
      banner: "EV", title: "Villada Aile Yemeği",
      speaker: sp("kayınvaliden Hayriye Hanım", "ic", "Kayınvaliden", "Maşallah oğlum, ne güzel ev. Ama televizyonda bir kadın ağlıyordu, 'evimi müteahhit aldı' diye… Sen değilsin inşallah?", "👵"),
      text: "Yeni villandaki ilk bayram yemeği. Masada herkes var. Kayınvaliden haberlerde gördüğü bir mağdurdan bahsediyor.",
      ders: "Mağduriyetler bireyseldir; her dosyanın arkasında bir aile vardır.",
      choices: [
        { label: "'O bendim' de, o kadını bul, borcunu öde", fx: "n-1 v+12 m-1", result: "Sofrada sessizlik oldu. Sonra kayınvaliden elini tuttu." },
        { label: "'Televizyon abartıyor' de", fx: "v-3", result: "Tatlılar geldi. Konu kapandı." },
        { label: "Konuyu futbola çevir", fx: "", result: "Kayınvaliden sana uzun uzun baktı." },
      ] }) },
  ] },

  { id: "dernek", ad: "Mağdurlar Derneği", steps: [
    { when: (s) => s.m >= 40, card: (s) => sys({
      banner: "EYLEM", title: "Mağdurlar Derneği Kuruldu",
      speaker: sp("dernek başkanı Hatice Hanım", "dogu", "Mağdur", "Bıra, biz senden sadaka istemiyoruz. Evimizi istiyoruz! Çocuklarım kirada büyüdü!", "✊"),
      text: `Senin projelerinden mağdur olan ${s.m} kişi bir araya gelip dernek kurdu. Başkanları Hatice Hanım her gün ofisinin önünde.`,
      ders: "Mağdur dernekleri toplu dava açabilir, basının ve siyasetin dikkatini çekebilir. Hak arama örgütlü olunca daha güçlüdür.",
      choices: [
        { label: "Dernekle masaya otur, protokol imzala", fx: "n-3 v+10 i+6 m-10 r-5", result: "Hatice Hanım ilk kez gülümsedi. Protokol noterde." },
        { label: "Başkana ayrıca bir daire teklif et, dernek dağılsın", fx: "r+6 v-10", act: { type: "gamble", p: 0.4, win: "m-5", lose: "i-10 r+10", winText: "Başkan teklifi kabul etti. Dernek bölündü.", loseText: "Hatice Hanım teklifini canlı yayında anlattı!" }, result: "" },
        { label: "Güvenlik tut, ofisin önünü kapat", fx: "i-8 v-6", result: "Pankartlar bu sefer güvenlik bariyerine asıldı." },
      ] }) },
    { when: (s) => s.m >= 60, card: (s) => sys({
      banner: "SON DAKİKA", title: "Mağdurlar Villanın Önünde",
      speaker: sp("dernek başkanı Hatice Hanım", "dogu", "Mağdur", "Senin çocukların havuzda yüzerken benim çocuklarım soğuk evde! Vallahi billahi buradan gitmeyeceğiz!", "✊"),
      text: `Yüzlerce mağdur ${s.owned && s.owned.villa ? "villanın" : "evinin"} önünde oturma eylemi yapıyor. Kameralar canlı yayında.`,
      ders: "Toplu mağduriyetlerde kamuoyu baskısı, soruşturmaların hızlanmasında etkili olabilir.",
      choices: [
        { label: "Dışarı çık, onlarla konuş", fx: "i+4 v+6 r-3", result: "Bağırdılar, sonra dinlediler. Bir tarih verdin." },
        { label: "Polisi çağır", fx: "i-12 v-8 r+6", result: "Görüntüler bütün kanallarda." },
        { label: "Arka kapıdan çık, helikopterle git", fx: "i-6 v-4", result: "Helikopterin sesi eylemcilerin sloganlarını bastıramadı." },
      ] }) },
  ] },

  { id: "sabri", ad: "İmar Müdürü Sabri", steps: [
    { when: (s) => s.completed >= 2, card: () => sys({
      banner: "BELEDİYE", title: "Sabri Bey'in Çayı",
      speaker: sp("imar müdürü Sabri Bey", "ankara", "Belediye", "Yav kardeşim, bu parselde emsal 1,5. Ama plan tadilatıyla 2,5 da olur. Olur mu? Olur. Nasıl olur? Onu konuşalım bak.", "🏛️"),
      text: "Belediyede imar müdürü Sabri Bey seni odasına çağırdı. Kapıyı kapattı, çayını karıştırıyor.",
      ders: "İmar planı değişikliklerinde oluşan değer artışları, rüşvet ve yolsuzluk soruşturmalarının en sık konusudur.",
      choices: [
        { label: "'Yönetmelik neyse o' de, kalk", fx: "v+3 d+1", result: "Sabri Bey gülümsedi: 'Sen bilirsin.' Dosyan en alta kondu." },
        { label: "Anlaş: iki kat fazlası, bir daire onun", fx: "n+4 r+8 v-10 F:sabri", result: "Plan tadilatı üç haftada geçti." },
        { label: "Konuşmayı kaydet, savcılığa götür", fx: "v+8 r-2 i+3 F:sabriIhbar", result: "Savcı kaydı dinledi. 'Bir süre sessiz kalın' dedi." },
      ] }) },
    { when: (s) => s.flags.sabri || s.flags.sabriIhbar, card: (s) => flag(s, "sabri") ? sys({
      banner: "BELEDİYE", title: "Sabri Daha Fazlasını İstiyor",
      speaker: sp("imar müdürü Sabri Bey", "ankara", "Belediye", "Kardeşim, oğlan evleniyor. Bir daire daha olsa ne güzel olur, di mi? Yoksa geçen dosya tekrar açılır, bilemem.", "🏛️"),
      text: "Sabri Bey artık her projende pay istiyor. Ağzından 'geçen dosya' lafı düşmüyor.",
      ders: "Rüşvet ilişkileri çoğu zaman tek seferlik kalmaz; taraflar birbirini sürekli 'rehin' tutar.",
      choices: [
        { label: "Ver", fx: "n-1.5 r+6 v-6", result: "Sabri'nin oğlu evlendi. Düğün senin salonunda oldu." },
        { label: "Reddet", fx: "v+4", act: { type: "gamble", p: 0.5, win: "d+1", lose: "d+4 r+8", winText: "Sabri sadece dosyalarını beklettti.", loseText: "Sabri eski ruhsatına 'usulsüzlük' diye iptal davası açtırdı!" }, result: "" },
        { label: "Artık sen de onu kaydet", fx: "r-2 v+2 F:sabriKoz", result: "Cebinde bir koz var artık." },
      ] }) : sys({
      banner: "SON DAKİKA", title: "Belediyeye Rüşvet Operasyonu",
      speaker: sp("TV muhabiri Kerem", "istanbul", "Basın", "İmar müdürü dahil 14 kişi gözaltında! Operasyonu başlatan ihbarın bir müteahhitten geldiği öğrenildi!", "🎤"),
      text: "Kaydın operasyonu başlattı. Sabri Bey gözaltında. Sektörde bazıları sana düşman oldu, bazıları gizlice teşekkür ediyor.",
      ders: "Yolsuzluk ihbarları kamu yararınadır; ihbarcıların korunması önemlidir.",
      choices: [
        { label: "Tanık ol, ifadeni ver", fx: "i+8 v+6", result: "Mahkemede başın dik." },
        { label: "Sessiz kal", fx: "i+2", result: "Adın haberde geçmedi." },
      ] }) },
    { when: (s) => s.flags.sabri && s.completed >= 5, card: (s) => sys({
      banner: "SON DAKİKA", title: "Sabri Gözaltında",
      speaker: sp("imar müdürü Sabri Bey", "ankara", "Belediye", "Yav ben ne yaptım ki? Herkes yapıyordu! Bak isimleri veririm ha!", "🏛️"),
      text: "Belediyeye operasyon yapıldı. Sabri Bey gözaltında ve pazarlık yapmaya hazır.",
      ders: "Rüşvet soruşturmalarında rüşveti veren de alan kadar sorumludur. Etkin pişmanlık cezayı azaltabilir.",
      choices: [
        { label: "Savcılığa önce sen git", fx: "r-8 v+6 i-4", result: "Etkin pişmanlık. Sabri'den önce konuştun." },
        { label: "Sabri'nin avukatını sen tut", fx: "n-1", act: { type: "gamble", p: s.flags.sabriKoz ? 0.75 : 0.5, win: "r-4", lose: "r+30 i-12", winText: "Sabri adını vermedi.", loseText: "Sabri her şeyi anlattı. İlk isim sensin." }, result: "" },
        { label: s.owned && s.owned.tv ? "Kanalında operasyonu 'siyasi' diye yayınla" : "Hiçbir şey yapma", fx: s.owned && s.owned.tv ? "i-2 v-4 r-4" : "", act: { type: "gamble", p: 0.55, win: "", lose: "r+22", winText: "Adın dosyada geçmedi.", loseText: "Adın iddianamede." }, result: "" },
      ] }) },
  ] },
];

// ---------- Geçmişten gelen dosyalar (saatli bombalar) ----------
const GHOSTS = [
  { who: sp("eski ustan", "karadeniz", "Eski usta", "Beni hatırladun mi patron? Ödemediğun hakedişler için avukata gittum. Her şeyi anlattum!", "👷"),
    txt: "Yıllar önce hakkını yediğin usta, elindeki fotoğraflarla ortaya çıktı: kesilen kolonlar, eksik demir, sahte irsaliyeler.",
    ozel: { label: "Ustanın hakkını faiziyle öde, fotoğraflardaki binaya güçlendirme yaptır", fx: "n-3 v+8 r-6 i+2 e+4", result: "Usta parayı saydı, sonra ağladı. 'Ben de o binada oturan çocukları düşünüyordum' dedi." } },
  { who: sp("araştırmacı gazeteci Pınar", "istanbul", "Basın", "Belgeler elimde. Yarın sabah yayındayız. Açıklama yapmak ister misiniz?", "🎤"),
    txt: "Bir gazeteci, yıllar önceki bir kararının bütün belgelerine ulaştı.",
    ozel: { label: "Röportaj ver: hatanı kabul et, ne yapacağını anlat", fx: "i-3 v+7 r-4", result: "Haber yine çıktı, ama başlığı 'Müteahhit ilk kez konuştu' oldu. Yorumların yarısı sana kızgın, yarısı şaşkın." } },
  { who: sp("eski alıcın", "dogu", "Alıcı", "Bıra, beş yıldır bekliyorum! Avukatım dosyayı savcılığa verdi, sen de gör bakalım!", "👨‍👩‍👧"),
    txt: "Yıllar önce kandırdığın bir alıcı, bu sefer yanında avukat ve bilirkişi raporuyla geldi.",
    ozel: { label: "Arabulucuya git, bilirkişinin bulduğu zararı öde", fx: "n-2 r-7 v+6 m-1", result: "Arabuluculuk tutanağı imzalandı. Alıcı dosyayı çekti, ama selamını da kesti." } },
  { who: sp("vergi müfettişi", "ankara", "Müfettiş", "Yav kardeşim, dosyanız masama geldi. Eski yıllara da bakacağız, haberiniz olsun.", "🧾"),
    txt: "Maliye, yıllar önceki bir işini yeniden incelemeye aldı. Zamanaşımı henüz dolmamış.",
    ozel: { label: "Müfettiş gelmeden pişmanlıkla beyan ver, vergiyi faiziyle öde", fx: "n-2.5 r-9 v+5", result: "Pişmanlık zammıyla ödedin. Ceza yerine faiz ödemek, bu dosyada en ucuz yoldu." } },
  { who: sp("eski muhasebecin", "ege", "Eski muhasebeci", "Ne güzel işler yaptık beraber, di mi gari? Ben de sustum yıllarca. Şimdi biraz yardıma ihtiyacım var…", "📒"),
    txt: "İşten çıkardığın muhasebeci, bütün kayıtların bir kopyasını saklamış. Şantaj mı, ihbar mı, henüz belli değil.",
    ozel: { label: "Şantajı kayda al, avukatınla birlikte savcılığa kendin git", fx: "r-5 v+6 i-2", act: { type: "gamble", p: 0.6, win: "r-6", lose: "r+8", winText: "Şantaj ayrı bir dosya oldu; senin eski işin etkin pişmanlıkla hafifledi.", loseText: "Savcı iki dosyayı birleştirdi. Kendi gelmen cezanı hafifletecek, ama yargılanacaksın." }, result: "" } },
];

export function ghostCard(s, sin, seed) {
  const g = GHOSTS[seed % GHOSTS.length];
  return sys({
    phase: "hesap", banner: "DOSYA PATLADI", title: `Geçmiş Kapını Çaldı: "${sin.title}"`,
    speaker: g.who,
    text: `${g.txt} Konu: ${sin.proj ? sin.proj + " — " : ""}"${sin.title}". Yıllar önce verdiğin o karar bugün önüne geldi.`,
    ders: "Birçok suçta zamanaşımı yıllarca sürer. Dolandırıcılık, belgede sahtecilik ve vergi kaçakçılığı dosyaları yıllar sonra açılabilir.",
    choices: [
      { label: "Sus payı ver 🎲", fx: "n-1", act: { type: "gamble", p: 0.55, win: "", lose: "r+14 i-8", winText: "Para alındı, dosya kapandı. Şimdilik.", loseText: "Parayı aldı… ve yine de konuştu. Bir de rüşvet teklifi eklendi." }, result: "" },
      { label: "Avukat ordusu tut", fx: "n-2 r-3", result: "Dosya uzadıkça uzuyor." },
      { label: "Her şeyi inkâr et 🎲", fx: "", act: { type: "gamble", p: 0.4, win: "i-2", lose: "r+20 i-12 m+2", winText: "Belgeler yetersiz bulundu.", loseText: "Belgeler ortaya çıktı. İnkârın da haber oldu." }, result: "" },
      g.ozel || { label: "Mağduru bul, zararını öde, özür dile", fx: "n-2.5 v+10 r-8 i+3 m-1", result: "Karşındaki şaşırdı. Sonra elini sıktı." },
    ],
  });
}

// ---------- Kaçış operasyonu ----------
export const DEST = {
  dubai: "Dubai", batum: "Batum", kktc: "Kuzey Kıbrıs", brezilya: "Rio de Janeiro", hazir: "önceden hazırladığın ev",
};

export function escapeCard(s, stage) {
  const es = s.escape;
  const heat = Math.round(es.heat);
  const h = `Takip riski: %${heat}`;
  if (stage === 0) return sys({
    phase: "kacis", banner: "KAÇIŞ OPERASYONU · 1/4", title: "Son Hasat", noStep: true,
    speaker: sp("sağ kolun Kenan", "karadeniz", "Sağ kol", "Abi, gidiyorsak son bir hasat yapalum. Ama ne kadar çok para toplarsak o kadar çok gürültü olur, bilesun.", "🕶️"),
    text: `Karar verildi: gidiyorsun. Önce kasa. Arkanda kalanlar henüz bir şey bilmiyor. ${h}`,
    ders: "Kaçmadan önce 'son kampanya' ile peşin para toplamak, müteahhit dolandırıcılığı haberlerinde sık görülen bir örüntüdür; mağdur sayısı son haftalarda katlanır.",
    choices: [
      { label: "Kalan daireleri yarı fiyatına peşin sat", act: { type: "esc", cash: 6, heat: 12, m: 25 }, result: "Kuyruk oluştu. Herkes 'fırsat' sandı." },
      { label: "Yatırımcılardan 'son tur' para topla", act: { type: "esc", cash: 4, heat: 8, m: 10 }, result: "Kuyumcu Selim bile ikinci kez para verdi." },
      { label: "Olanla yetin, sessizce çık", act: { type: "esc", heat: -10 }, result: "Kimseye bir şey söylemedin." },
    ] });
  if (stage === 1) return sys({
    phase: "kacis", banner: "KAÇIŞ OPERASYONU · 2/4", title: "Para Nasıl Çıkacak?", noStep: true,
    speaker: sp("sağ kolun Kenan", "karadeniz", "Sağ kol", "Bavula sığmaz bu para abi. Ya altına çevirelum ya da başka bir yol bulalum.", "🕶️"),
    text: `Yanında ${es.money.toFixed(1).replace(".", ",")} M₺ var. Bunu sınırdan geçirmek gerekiyor. ${h}`,
    ders: "Yurt dışına izinsiz ve beyansız para çıkarmak kaçakçılık ve suç gelirlerinin aklanması kapsamında değerlendirilir; MASAK şüpheli işlemleri takip eder.",
    choices: [
      { label: "Nakit bavul", act: { type: "esc", heat: 10 }, result: "Bavul kapanmıyor. Üstüne oturdun." },
      { label: "Kuyumcudan altına çevir", act: { type: "esc", heat: 6, keep: 0.9 }, result: "Kuyumcu %10 komisyon aldı ve hiçbir şey sormadı." },
      { label: "Kripto borsasına aktar 🎲", act: { type: "esc", heat: -4, risk: { p: 0.35, keep: 0.6 } }, result: "Parayı dijital cüzdana aktardın." },
      ...(s.owned && s.owned.galeri ? [{ label: "Galeriden lüks araçları yurt dışına 'ihraç' et", act: { type: "esc", heat: -8, keep: 0.85 }, result: "Tır dolusu araba sınırı geçti. Faturalar tertemiz." }] : []),
      ...(s.flags.yurtdisiPara ? [{ label: "Paravan şirket hesabına gönder", act: { type: "esc", heat: -14, keep: 0.95 }, result: "Para zaten yolu biliyordu." }] : []),
    ] });
  if (stage === 2) return sys({
    phase: "kacis", banner: "KAÇIŞ OPERASYONU · 3/4", title: "Nereye?", noStep: true,
    speaker: sp("sahte pasaportçu", "istanbul", "Aracı", "Abi, iade anlaşması olmayan yer az. Olan yere gidersen kırmızı bülten seni bulur. Seç bakalım.", "🛂"),
    text: `Rota seçme zamanı. ${h}`,
    ders: "Türkiye'nin pek çok ülkeyle suçluların iadesi anlaşması vardır. Kırmızı bülten, Interpol üyesi ülkelerde yakalama talebi anlamına gelir.",
    choices: [
      { label: "Dubai: lüks otel, eski tanıdıklar", act: { type: "esc", heat: 4, dest: "dubai" }, result: "Business class bileti aldın." },
      { label: "Batum: kara yoluyla, sessizce", act: { type: "esc", heat: -5, dest: "batum", keep: 0.95 }, result: "Sarp sınır kapısına doğru yola çıktın." },
      { label: "Rio de Janeiro: çok uzak, çok pahalı", act: { type: "esc", heat: -10, dest: "brezilya", keep: 0.8 }, result: "Üç aktarmalı bir bilet." },
      ...(s.owned && s.owned.yat ? [{ label: "Yatla gece Kuzey Kıbrıs'a", act: { type: "esc", heat: -16, dest: "kktc" }, result: "Işıklar kapalı, motor sessiz." }] : []),
      ...(s.flags.kacisHazir ? [{ label: "Önceden hazırladığın eve", act: { type: "esc", heat: -20, dest: "hazir" }, result: "Anahtar cebinde." }] : []),
    ] });
  const yat = es.dest === "kktc";
  return sys({
    phase: "kacis", banner: "KAÇIŞ OPERASYONU · 4/4", title: yat ? "Marinada Sahil Güvenlik" : "Pasaport Kontrolü", noStep: true,
    speaker: yat ? sp("sahil güvenlik astsubayı", "ege", "Sahil güvenlik", "Kaptan, bu saatte nereye böyle gari? Bi evraklara bakalım.", "⚓")
      : sp("polis memuru Harun", "ic", "Polis", "Beyefendi, bir dakika bekler misiniz? Sistemde bir şey görünüyor.", "👮"),
    text: `Kalbin küt küt atıyor. Yanında ${es.money.toFixed(1).replace(".", ",")} M₺. ${h}. Bir adım kaldı.`,
    ders: "Havalimanlarında yurt dışı çıkış yasağı ve arama kayıtları anlık kontrol edilir. Kaçmaya çalışan pek çok müteahhit son anda yakalanmıştır.",
    choices: [
      ...(yat ? [] : [havalimaniChoice]),
      { label: "Sakin ol, gülümse, bekle 🎲", act: { type: "esc", heat: 0, end: true }, result: "" },
      { label: "Görevliye zarf uzat 🎲", act: { type: "esc", heat: 0, bribe: true, end: true }, result: "" },
      { label: "Son anda vazgeç, savcılığa git", fx: "E:itiraf", result: "Geri döndün. Kelepçeler takıldı; ama kaçak değilsin." },
    ] });
}

// ---------- Son perde ----------
export function hesapCard(s) {
  const p = Math.max(0.2, Math.min(0.85, 0.8 - (s.sins || []).length * 0.06 - s.m / 500 - s.r / 300));
  return sys({
    phase: "hesap", banner: "HESAP GÜNÜ", title: "Kapıda Savcılık Var", noStep: true, finalStage: "hesap",
    speaker: sp("cumhuriyet savcısı", "ankara", "Savcı", "Beyefendi, hakkınızda birikmiş dosyalar var. Mağdurlar, belgeler, tanıklar… Bugün konuşmanın vakti.", "⚖️"),
    text: `Tam her şey bitti derken, ${s.m} mağdurun, ${(s.sins || []).length} saklı dosyan ve ${s.vergi.toFixed(0)} M₺'lik vergi farkı tek bir iddianamede birleşti. Sabah 06.00. Kapı çalıyor.`,
    ders: "Kariyer ne kadar parlak görünürse görünsün, belgelenmiş mağduriyetler zamanla hesap sorulmasına yol açabilir.",
    choices: [
      { label: "Her şeyi itiraf et, mağdurlara ödeme yap", fx: "n-10 v+25 m-20", act: { type: "redeem" }, result: "Avukatın şaşkın. Mağdurlar ilk kez umutlu." },
      { label: `En iyi avukatları tut (şans %${Math.round(p * 100)}) 🎲`, fx: "n-5", act: { type: "gamble", p, win: "r-20", lose: "E:hapis", winText: "Beraat. Adliye çıkışında kameralara el salladın.", loseText: "Hâkim kararı okudu. Kelepçeler takıldı." }, result: "" },
      { label: "Arka kapıdan kaç", fx: "E:kacak", result: "Pijamayla bahçe duvarından atladın." },
    ] });
}

export const LEGACY = {
  vakif: { label: "Servetinin yarısıyla mağdurlar için vakıf kur", text: "Kurduğun vakıf, yıllarca yarım kalan binaların tamamlanmasına ve depremzede ailelere destek oldu." },
  siyaset: { label: "Siyasete gir", text: "Parti listesinde üst sıradasın. İmar komisyonundaki eski dostlar seni bekliyor." },
  ogul: { label: "Şirketi oğluna devret", text: "Şirket artık Emre'de. İlk işi ofisin tabelasını değiştirmek oldu. Senin yaptıklarını yapacak mı, yapmayacak mı? O da onun hikâyesi." },
  yurtdisi: { label: "Yurt dışına yerleş, sessizce yaşa", text: "Londra'da bir ev, Bodrum'da bir yazlık. Adın haberlerde artık geçmiyor." },
};

export function mirasCard(s) {
  return sys({
    phase: "hesap", banner: "SON PERDE", title: "Mirasın Ne Olacak?", noStep: true,
    speaker: sp("eşin Nermin", "istanbul", "Eşin", "Yıllar geçti. Çocuklar büyüdü. Arkanda ne bırakacaksın, hiç düşündün mü?", "💁‍♀️"),
    text: `${s.completed} proje, ${s.daireTeslim} daire, ${s.m} mağdur. Hayatının son büyük kararı.`,
    ders: "Bir müteahhidin gerçek mirası, yaptığı binaların yıllar sonra ayakta durup durmadığıdır.",
    choices: Object.entries(LEGACY).map(([k, l]) => ({ label: l.label, fx: k === "vakif" ? "v+20" : "", act: { type: "legacy", key: k }, result: l.text })),
  });
}

// ---------- Hedefler ----------
export const GOALS = [
  { id: "arsa", ad: "İlk arsa anlaşmanı yap", test: (s) => s.projects.some((p) => p.phase !== "arsa"), odul: "i+3" },
  { id: "teslim", ad: "İlk binanı teslim et", test: (s) => s.completed >= 1, odul: "g+5" },
  { id: "mercedes", ad: "Bir Mercedes al", test: (s) => s.owned && s.owned.mercedes, odul: "i+2" },
  { id: "is", ad: "Bir yan iş kur (galeri, düğün salonu…)", test: (s) => s.owned && ["galeri", "dugun", "beton", "kulup", "tv", "otel"].some((k) => s.owned[k]), odul: "g+3" },
  { id: "uc", ad: "Aynı anda 3 proje yürüt", test: (s) => s.projects.filter((p) => !p.done && !p.collapsed).length >= 3, odul: "e+5" },
  { id: "site", ad: "İlk siteni başlat", test: (s) => s.maxTier >= 1, odul: "i+3" },
  { id: "villa", ad: "Havuzlu villaya taşın", test: (s) => s.owned && s.owned.villa, odul: "i+2" },
  { id: "yuz", ad: "100 daire teslim et", test: (s) => s.daireTeslim >= 100, odul: "i+5" },
  { id: "rezidans", ad: "Bir rezidans projesine gir", test: (s) => s.maxTier >= 2, odul: "g+5" },
  { id: "yat", ad: "Bodrum'da yat sahibi ol", test: (s) => s.owned && s.owned.yat, odul: "" },
  { id: "servet", ad: "300 M₺ net servete ulaş", test: (s) => s.n - s.b >= 300, odul: "i+3" },
  { id: "on", ad: "10 proje tamamla", test: (s) => s.completed >= 10, odul: "" },
];
