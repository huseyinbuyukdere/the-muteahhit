// YENİ SENARYOLAR — kentsel dönüşüm, kat karşılığı hileleri, mükerrer satış, sahte iskân, sosyal medya
// dolandırıcılığı, kur şoku, kamu ihalesi, taşeron zinciri ve şehre özgü karakterler.
// Bütün karakterler kurgusaldır. Gerçek kişi ya da firmalarla benzerlik tesadüftür.
// q: koşul. "R:ege" projenin bölgesi, "F:x" oyuncu bayrağı, "P:x" proje bayrağı, "Y:2018-2019" yıl aralığı, "&" ile birleşir.
// sp: [ad, şive, rol, söz, emoji] — kartın kendi konuşanı.
const S = (t, x, d, ...c) => ({ t, x, d, c });
const W = (o, s) => ({ ...s, ...o });

// Semt → bölge (şehre özgü kartlar için)
export const REGION = {
  Fikirtepe: "istanbul", Esenyurt: "istanbul", Kartal: "istanbul", Ataşehir: "istanbul", Beylikdüzü: "istanbul", Pendik: "istanbul",
  Avcılar: "istanbul", Bağcılar: "istanbul", Sancaktepe: "istanbul", Çankaya: "ankara", Etimesgut: "ankara", Yenimahalle: "ankara",
  Keçiören: "ankara", Karşıyaka: "ege", Bornova: "ege", Buca: "ege", Efeler: "ege", Merkezefendi: "ege", Nilüfer: "marmara",
  İzmit: "marmara", Kepez: "akdeniz", Seyhan: "akdeniz", Mezitli: "akdeniz", Talas: "kayseri", Meram: "konya", Odunpazarı: "eskisehir",
  Atakum: "karadeniz", Şahinbey: "antep",
};

// ---------- ARSA ----------
export const YENI_ARSA = [
  S("Riskli Yapı Raporu",
    "{SM}'daki 40 daireli eski blok kentsel dönüşüme girecek. Bina riskli sayılmazsa hak sahipleri anlaşmaya yanaşmıyor. Laboratuvar sahibi göz kırpıyor: 'Karot sonucu istediğin gibi çıkar.'",
    "Riskli yapı tespiti lisanslı kuruluşlarca yapılır ve hak sahipleri rapora itiraz edebilir. Sağlam bir binayı 'riskli' göstermek de, çürük bir binayı 'sağlam' göstermek de suçtur. Hak sahipleri raporun karot sonuçlarını mutlaka istemelidir.",
    ["Gerçek karot testi yaptır, sonucu kabul et", "n-0.3 d+1 v+4 i+2", "Bina gerçekten riskli çıktı. Hak sahipleri raporu kendi gözleriyle gördü, masaya oturdu."],
    ["Laboratuvarla anlaş, raporu 'riskli' yazdır", "n-0.2 s+6 v-12 r+7 F:sahteRiskli", "Rapor çıktı. Komşular korkup imzaladı. Karotun nereden alındığını kimse sormadı."],
    ["Hak sahiplerine 'rapor gelmeden bir şey imzalamayın' de", "d+1 s+8 i+3 v+3", "Yöneticiler seni ilk kez dinledi. Süreç yavaş ama temiz."]),

  S("Tek Direnen Komşu",
    "Kentsel dönüşümde 40 hak sahibinden 39'u imzaladı. Beşinci kattaki {AS} imzalamıyor: 'Bu evde kocamla kırk yıl oturdum, beni bir sokağa atmayın.'",
    "Riskli yapılarda üçte iki çoğunluk kararı alınabilir; kalan payların satışı yasal süreçle yapılır. Ama baskı, tehdit, su-elektrik kesme gibi yöntemler suçtur. Direnen hak sahibinin dertleri çoğu zaman taşınma ve kira masrafıdır; dinlemek çözümü hızlandırır.",
    ["Oturup dinle: taşınma ve kira masrafını üstlen", "n-0.4 s+10 v+6 i+3", "Teyze çayını koydu. 'Oğlum, beni bir soran olmadı ki' dedi. Ertesi gün imzaladı."],
    ["Üçte iki kararıyla payının satışını başlat", "d+2 s-4 r+1", "Yasal yol. Uzun sürecek, mahallede de konuşulacak."],
    ["Binanın suyunu ve elektriğini kestir, 'teknik arıza' de", "d-1 s-10 v-14 r+8 m+1 F:baski", "Teyze mum ışığında oturuyor. Torunu olanları telefonla çekti."]),

  S("Kira Yardımı Bitti",
    "Dönüşüm projesinde hak sahiplerine söz verdiğin kira yardımı 18 aydır ödeniyor. Proje gecikti; bütçeden 'kira kalemi' kısılmak isteniyor. {AS} kapıda: 'Kirayı kesersen biz nerede oturacağız?'",
    "Kentsel dönüşüm sözleşmelerinde kira yardımının süresi ve gecikmede ne olacağı açıkça yazılmalıdır. Hak sahipleri, gecikme halinde kira kaybını müteahhitten talep edebilir.",
    ["Kira yardımını teslim gününe kadar sürdür", "n-0.8 s+8 v+4", "Hak sahipleri içerlemedi, bekliyor."],
    ["Yarıya düşür, 'kriz var' de", "n+0.4 s-8 v-4", "Ev sahipleri artık her ay 'ne zaman bitecek' diye arıyor."],
    ["Tamamen kes, 'sözleşmede 12 ay yazıyordu' de", "n+0.8 s-15 v-8 m+3 r+2", "Sözleşmeyi okuyan avukat, maddenin çok farklı yazdığını gösterdi."]),

  S("Net mi Brüt mü?",
    "{AS} ile kat karşılığı sözleşme masasındasın. Ona '120 metrekare daire' diyorsun. Avukatın kulağına fısıldıyor: 'Brüt yazalım, ortak alan payını da ekleriz; net 85 çıkar.'",
    "Brüt metrekareye merdiven, duvar ve ortak alan payı da girer; net kullanım alanı çok daha küçüktür. Sözleşmede 'net kullanım alanı' açıkça yazılmalı, daire planı ve kat numarası belirtilmelidir.",
    ["Sözleşmeye net metrekareyi ve planı yaz", "h+2 s+8 v+3", "Arsa sahibi planı katlayıp cebine koydu. 'İlk defa biri anlattı' dedi."],
    ["'Brüt 120' yaz, sormazsa anlatma", "h-3 s+2 v-8 F:brutHile", "İmza atıldı. Anahtar gününe kadar kimse metreyi ölçmeyecek."],
    ["Daireyi 'müteahhit tarafından belirlenir' diye bırak", "h-2 s-2 v-5", "Arsa sahibi en alttaki, güneş görmeyen daireyi alacak ama henüz bilmiyor."]),

  S("Tapuyu Peşin İste",
    "Kat karşılığı anlaşmada {AS}'e 'arsanın tapusunun tamamını şimdi üzerime al, dairelerin tapusunu bitince veririm' demeyi düşünüyorsun. Bankaya teminat gösterip kredi çekebilirsin.",
    "Arsa sahipleri tapuyu tek seferde müteahhide devretmemelidir. Kademeli devir (inşaat ilerledikçe pay devri), teminat mektubu ve tapuya şerh edilen noter sözleşmesi arsa sahibini korur. Müteahhit iflas ederse tapusunu vermiş arsa sahibi elinde hiçbir şey kalmayabilir.",
    ["Kademeli devir öner: her kat bitince pay devredilsin", "s+10 v+4 i+2", "Arsa sahibinin avukatı 'bu müteahhit işini biliyor' dedi."],
    ["Tapunun tamamını al, bankaya ipotek et", "n+2 b+2 s+2 v-8 r+3 F:arsaIpotek", "Kredi geldi. Arsa sahibinin evi artık bankanın teminatı."],
    ["Teminat mektubu ver, tapuyu sonra al", "n-0.3 s+8 v+2", "Arsa sahibi rahatladı. Sen biraz daha az nakitle devam ediyorsun."]),

  S("Gecikme Cezası Maddesi",
    "Sözleşme taslağında gecikme cezası 'aylık 1.000 TL' yazıyor. {AS}'in yeğeni hukuk okuyor, maddeyi işaretlemiş: 'Bu ceza, kiranın onda biri bile değil.'",
    "Kat karşılığı sözleşmelerde gecikme cezası, arsa sahibinin kira kaybını karşılayacak düzeyde olmalıdır. Sembolik cezalar müteahhidi teslim için zorlamaz.",
    ["Cezayı piyasa kirası kadar yap", "s+10 v+3 h+1", "Yeğen başını salladı. Masadaki hava değişti."],
    ["'Hep böyle yazılır' diye sembolik bırak", "s-4 v-5", "İmza atıldı. Yeğen ise telefonuna bir not düştü."],
    ["Cezayı kaldır, yerine 'mücbir sebep' maddesini genişlet", "s-8 v-7 F:mucbir", "Artık yağmur yağsa bile gecikme 'mücbir sebep' sayılıyor."]),

  W({ q: "R:ege" }, S("Zeytinlik Arsası",
    "{SM} yakınında {AS} sana bir zeytinlik gösteriyor: 'Belediyede tanıdık var, imar çıkar, yazlık site yaparsın.' Ağaçlar yüz yaşında.",
    "Zeytinlik alanlarda ve yakınında zeytinciliğe zarar verecek yapılaşma yasaktır. 'İmarı sonra çıkarırız' diye satılan tarım arazileri, alıcıları yıllarca süren davalara sokabilir. Hisseli tarla alırken imar durumu belediyeden yazılı olarak sorulmalıdır.",
    ["Reddet, imarlı arsa ara", "d+1 v+5 i+2", "{AS} söylendi: 'Sen bilirsin gari.' Başka biri alıp hisse hisse satmaya başladı."],
    ["Hisselere bölüp 'villa arsası' diye sat", "n+2 v-15 r+10 m+4 F:hisseliTarla", "İnternet ilanında 'deniz manzaralı villa imarlı' yazıyordu. İkisi de doğru değildi."],
    ["Zeytinliğin kenarındaki imarlı parçayı al", "n-0.4 v+2", "Ağaçlar yerinde. Proje küçüldü ama tertemiz."])),

  W({ q: "R:karadeniz" }, S("Dere Kenarında Arsa",
    "{SM}'da {AS} dere kenarındaki arsasını ucuza veriyor. 'Otuz yıldır taşmadi uşağum' diyor. Harita mühendisi haritada mavi çizgiyi gösteriyor: dere koruma bandı.",
    "Karadeniz'de dere yataklarına ve taşkın alanlarına yapılan binalar, sel felaketlerinde can kaybının başlıca nedenlerindendir. Dere koruma bantlarına yapı izni verilmemesi gerekir; alıcılar taşkın riskini belediyeden ve afet haritalarından sorgulamalıdır.",
    ["Arsayı alma", "d+1 v+5", "{AS} 'kaybedersun' dedi. İki yıl sonraki selde o arsa haberlerdeydi."],
    ["Al, istinat duvarı ve taşkın önlemiyle yap", "n-1 k+4 v+1 r+2", "Masraflı ama bina yüksekte ve korunaklı."],
    ["Al, imar planında 'düzeltme' yaptır", "n+1.5 v-12 r+8 k-4 F:dereYatagi", "Plan değişti. Dere değişmedi."])),

  W({ q: "R:istanbul" }, S("Fay Hattı Tartışması",
    "{SM}'da arsa için zemin etüdü geldi: zemin yumuşak, yeraltı suyu yüksek. {AS} 'bizim evler hep burada durdu' diyor. Statikçi 'fore kazık şart' diyor, maliyet %15 artıyor.",
    "İstanbul'un deprem riski yüksektir; zayıf zeminlerde zemin iyileştirme ve derin temel hayati önemdedir. Ev alırken zemin etüdü raporu istenmeli, raporun gerçekten o parsel için yapıldığı kontrol edilmelidir.",
    ["Fore kazıkla doğru temel yap", "n-1 k+12 v+3", "Temel pahalı ama bina zemine çivilendi."],
    ["Başka parselin zemin raporunu kopyala", "n+0.8 k-15 v-12 r+6 F:sahteZemin", "Rapor mükemmel. Parsel numarası da yeni yazıldı."],
    ["Katı azalt, radye temelle yetin", "n-0.3 k+5 h-2", "Daire sayısı düştü ama hesap tutuyor."])),

  W({ q: "R:ankara", sp: ["Nevzat Bey", "YT", "Evladım, üyeler bana güvenir. Sen inşaatı yap, gerisini biz kurulda hallederiz.", "🧑‍💼", "ankara"] }, S("Kooperatif Teklifi",
    "{SM}'da emekli daire başkanı Nevzat Bey, 300 üyeli bir yapı kooperatifinin yönetiminde. 'İnşaatı sen yap, aidatlar senin hesabına aksın. Yönetim kurulunu da biz hallederiz' diyor.",
    "Yapı kooperatiflerinde üyeler yıllarca aidat öder; yönetim ve müteahhit arasındaki kontrolsüz ilişkiler, 'bitmeyen kooperatif' mağduriyetlerinin başlıca sebebidir. Üyeler genel kurullara katılmalı, harcama belgelerini istemeli, denetim kurulunu işletmelidir.",
    ["Şeffaf sözleşme: hakediş karşılığı, bağımsız denetimle", "n+1 i+5 v+4", "Genel kurulda ilk kez harcama tablosu gösterildi. Üyeler alkışladı."],
    ["Aidatları doğrudan kendi hesabına al", "n+3 y+2 v-12 r+6 m+4 F:kooperatif", "Para her ay akıyor. İnşaat ise temelde bekliyor."],
    ["Nevzat Bey'e 'danışmanlık' ücreti öde, işi al", "n+1.5 v-8 r+5", "Kooperatif başkanı yeni bir cip aldı. Üyeler bunu konuşuyor."])),

  W({ q: "R:konya" }, S("Faizsiz Ev Vaadi",
    "{SM}'da bir grup esnaf sana ortaklık teklif ediyor: 'Faizsiz ev sistemi' kuralım; insanlar her ay taksit yatırır, kura çıkana ev verilir. 'Hem sevap hem kazanç' diyorlar.",
    "Lisanssız 'faizsiz ev sistemi', 'eminevim' benzeri çekilişli tasarruf modelleri yıllarca denetimsiz çalıştı; batan şirketlerde binlerce kişi birikimini kaybetti. Bu tür sistemlere girmeden önce şirketin yasal izni ve denetim durumu sorgulanmalıdır.",
    ["Reddet: 'Bu bir sistem değil, zincir'", "v+5 i+2", "Esnaflar başka bir müteahhide gitti. İki yıl sonra adları bir haberdeydi."],
    ["Kur, ilk kuraları hızlı çıkar, gerisini sonra düşünürsün", "n+3 y+3 v-15 r+10 m+6 F:faizsizEv", "İlk on kişi evini aldı ve herkese anlattı. Sırada 800 kişi var."],
    ["Sadece yasal izinli bir finansman kuruluşuyla çalış", "n+0.5 i+3", "Daha az para, daha çok uyku."])),

  W({ q: "R:kayseri", sp: ["pastırmacı Abdullah Bey", "AS", "Hee, yüzde elli beş, dükkânlar benim, faiz senin. Hesap tamam mı, gılıbık?", "🥩", "ic"] }, S("Pastırmacının Pazarlığı",
    "{SM}'da arsa sahibi pastırmacı Abdullah Bey. Kayseri pazarlığının hakkını veriyor: 'Yüzde elli beş ver, ama dükkânlar da benim olsun, bir de sana kefil olayım, faizini sen öde.'",
    "Pazarlıkta her maddenin karşılığı yazılı olmalıdır: dükkân payı, kefalet, faiz yükü. Sözlü 'hallederiz'ler sonradan anlaşmazlık çıkarır.",
    ["Her maddeyi tek tek yaz, dengeli bir oran bul", "h+2 s+8 v+2", "Abdullah Bey eline pastırma tutuşturdu: 'Adam gibi pazarlık ettin.'"],
    ["Her şeye 'tamam' de, sözleşmeye yazmadan", "h-2 s+4 v-5 F:sozluAnlasma", "Masadan kalktınız. Kim neyi kabul etti, kimse tam hatırlamıyor."],
    ["Dükkânları ver ama daireleri en alta koy", "h+1 s-4 v-3", "Abdullah Bey bir sonraki ziyarette fark edecek."])),

  W({ q: "R:eskisehir" }, S("Öğrenciye Stüdyo",
    "{SM}'da üniversiteye yakın arsa. Yatırımcılar 1+0 stüdyo istiyor. Mimar diyor ki: 'Onaylı projede 3+1; teslimden sonra ikiye bölersin, kimse bilmez.'",
    "Onaylı projeye aykırı daire bölme, yangın kaçışı, havalandırma ve taşıyıcı sistem açısından risk oluşturur; iskan alınamaz, kaçak yapı sayılır. Kiracılar ve alıcılar dairenin tapudaki niteliğini kontrol etmelidir.",
    ["Projeyi baştan stüdyo olarak ruhsatlandır", "n-0.4 d+1 v+3 k+3", "Ruhsat uzadı ama her dairenin kendi kaçış yolu var."],
    ["3+1 ruhsatla yap, sonra böl", "n+1.2 v-10 r+6 k-5 F:kacakBolme", "Her daireden üç tapusuz stüdyo çıkacak. Yangın merdiveni tek."],
    ["3+1 yap, aileye sat", "n+0.3", "Öğrenciler başka yere, aileler bu binaya."])),
];

// ---------- YATIRIM ----------
export const YENI_YATIRIM = [
  W({ sp: ["banka temsilcisi Tülay Hanım", "YT", "Euro kredide faiz çok cazip. Kur da sakin, içiniz rahat olsun.", "🏦", "istanbul"] }, S("Euro Kredi",
    "Banka temsilcisi Tülay Hanım teklif getirdi: TL kredide faiz %24, euro kredide %5. 'Kur zaten sabit gidiyor' diyor. Satışların tamamı TL.",
    "Geliri TL olan bir şirketin döviz cinsinden borçlanması 'kur riski' taşır; kur yükseldiğinde borç bir gecede katlanabilir. 2018 ve 2021'deki kur şoklarında birçok inşaat şirketi bu yüzden konkordato ilan etti.",
    ["TL kredi al, pahalı ama öngörülebilir", "n+2 b+2 g+2", "Faiz can yakıyor ama her ay ne ödeyeceğini biliyorsun."],
    ["Euro kredi al, farkı cebe koy", "n+3 b+2.5 F:dovizBorc", "Faiz düşük, nakit bol. Kur grafiğine bakmamaya karar verdin."],
    ["Krediye hiç girme, ön satışla ilerle", "o+10 d+1", "Daha yavaş ama borçsuz."])),

  S("Konkordato Söylentisi",
    "Piyasada büyük bir müteahhit firmanın konkordato ilan edeceği konuşuluyor. {YT} arıyor: 'Senin de adın geçiyor, paramı çekmek istiyorum.'",
    "Konkordato, borçlarını ödeyemeyen şirketin alacaklılarıyla uzlaşmasını sağlayan hukuki bir yoldur. Alıcı ve yatırımcılar, konkordato sürecinde alacaklarını süresi içinde bildirmezse hak kaybına uğrayabilir.",
    ["Hesapları aç, nakit durumunu göster", "g+8 i+2 v+2", "{YT} tabloya baktı: 'Tamam, sende kalsın.'"],
    ["'Kimseye söyleme, sana özel faiz veririm' de", "n+1 g+3 v-6 y+1 F:ozelFaiz", "{YT} kaldı. Diğer yatırımcılar bu 'özel' teklifi duymadı."],
    ["Parasını hemen öde", "n-1.5 g+4", "Kasadan para çıktı ama söylenti seni teğet geçti."]),

  W({ q: "R:antep", sp: ["baklavacı Halil Usta", "YT", "Gardaş, bu para temiz para, baklava parası. Banka mankaya gerek yok.", "🥮", "antep"] }, S("Baklavacının Doları",
    "{SM}'da baklavacı Halil Usta dükkânın arkasında seni bekliyor. Çantada dolar var: 'Gardaş, bankaya girmeyecek, senet de istemem. Bir kat bana, gerisi bizim aramızda.'",
    "Kayıt dışı nakitle yapılan yatırımlar, anlaşmazlık halinde ispatı zor alacaklar doğurur ve suç gelirlerinin aklanmasında kullanılabilir. Yatırım yapan kişi, parasını banka üzerinden göndermeli ve sözleşmeyi noterde yapmalıdır.",
    ["Parayı bankadan al, noterde sözleşme yap", "n+1.5 y+1.5 g+4 v+2", "Halil Usta söylendi ama noterde baklava ikram etti."],
    ["Çantayı al, kayda geçirme", "n+3 y+2 x+1 v-8 r+5", "Para kasada. Kimin parası olduğu sadece ikinizin arasında."],
    ["Teşekkür et, alma", "", "Halil Usta omuz silkti: 'Senin kısmetin değilmiş.'"])),

  W({ q: "R:akdeniz", sp: ["aracı Rüstem Bey", "AL", "Ağam, ekspertizi yüksek gösterek, herkes kazanır. Kimse sormaz.", "🕶️", "adana"] }, S("Vatandaşlık İçin Ekspertiz",
    "{SM}'da yabancı bir alıcı grubu var. Aracı Rüstem Bey: 'Vatandaşlık için daire değeri en az şu kadar görünmeli. Ekspertizi şişirelim, aradaki farkı bölüşürüz.'",
    "Yatırım yoluyla vatandaşlık başvurularında değerleme raporlarının şişirilmesi, hem alıcıyı hem piyasayı yanıltır; bu yöntem soruşturmalara konu olmuştur. Yabancı alıcılar da değerleme raporunu bağımsız bir kuruluşa kontrol ettirmelidir.",
    ["Gerçek değer üzerinden sat", "n+1 i+3 v+3", "Alıcılar az daire aldı ama tekrar gelecekler."],
    ["Ekspertizi şişir, farkı böl", "n+3 x+1 v-12 r+9 F:sisikEkspertiz", "Kâğıtta değer iki katı. Daire aynı daire."],
    ["Aracıyı devreden çıkar, alıcılarla doğrudan konuş", "n+1.5 v+1", "Rüstem Bey seni tehdit etti ama alıcılar memnun."])),

  S("Kamu İhalesi İlanı",
    "Kamu konut idaresi bir ilçede 300 konutluk ihaleye çıkıyor. Yaklaşık maliyet düşük. Rakipler 'bu fiyata yapılmaz' diyor. {ME} kahve içmeye çağırıyor.",
    "Kamu ihalelerinde aşırı düşük teklifle alınan işler çoğu zaman ya yarım kalır ya da kaliteden kısılarak bitirilir. İhaleye fesat karıştırmak ağır bir suçtur. Vatandaşlar, kamu ihalelerinin sonuçlarını ve sözleşme bedellerini kamuya açık kayıtlardan izleyebilir.",
    ["Maliyeti doğru hesapla, gerçekçi teklif ver", "g+4 i+3 v+2", "İhaleyi alamadın. Kazanan firma bir yıl sonra işi bıraktı."],
    ["Aşırı düşük teklifle ihaleyi kap", "n+2 k-6 g+2 F:dusukIhale", "İhale senin. Hesap tutmuyor ama önce iş, sonra hesap."],
    ["{ME} ile kahveye git, 'şartnameyi' konuş", "n+3 v-12 r+10 F:ihaleFesat", "Şartnamenin bir maddesi sadece sende olan bir belgeyi istiyor artık."]),

  S("Çinli Vinç, Alman Teminat",
    "Rezidans için vinç ve kalıp sistemini yurt dışından alacaksın. Tedarikçi akreditif istiyor. {YT} diyor ki: 'Faturayı yüksek kestir, farkı yurt dışında bir hesapta beklet.'",
    "İthalatta fatura şişirme, yurt dışına kaynak aktarmanın ve vergi kaçırmanın bilinen yöntemlerindendir; gümrük ve vergi incelemelerinde tespit edilir.",
    ["Gerçek faturayla al", "n-0.5 g+2", "Temiz iş. Muhasebeci derin bir nefes aldı."],
    ["Faturayı şişir, farkı dışarıda tut", "n+1 x+1.5 v-8 r+6 F:yurtdisiHesap", "Kaçış günü gelirse işe yarayacak bir hesap açıldı."],
    ["İkinci el yerli vinç kirala", "n+0.2 k-2", "Vinç eski ama periyodik kontrolü yapılmış."]),
];

// ---------- İNŞAAT ----------
export const YENI_INSAAT = [
  S("Taşeronun Taşeronu",
    "Kaba inşaatı {US}'a verdin. O da işi başka bir ekibe, o ekip de bir dayıbaşına devretmiş. Şantiyedeki işçiler kime çalıştığını bilmiyor; yevmiyeleri her el değiştirmede biraz kesilmiş.",
    "Alt işveren zincirleri uzadıkça ücretler düşer, sigorta ve iş güvenliği kaybolur. Ana işveren, alt işverenin işçilerine karşı ücret ve sigorta borçlarından birlikte sorumludur. İşçiler ALO 170'e başvurabilir.",
    ["Zinciri kır: işçileri doğrudan sigortalı işe al", "n-0.8 e+12 k+4 v+5", "İlk kez maaş bordrosu gören işçiler var. Hız da arttı."],
    ["Karışma, işi bitirsinler", "e-4 k-3 v-4 r+2", "Kimin kime borcu olduğu bilinmiyor. Sadece duvarlar yükseliyor."],
    ["Dayıbaşına 'ucuza bitir' diye prim teklif et", "n+0.5 e-8 k-6 v-8 r+3 m+1", "Dayıbaşı işçilerden bir yevmiye daha kesti."]),

  S("Ölümlü İş Kazası",
    "Asansör boşluğunda korkuluk yoktu. Genç bir işçi yedinci kattan düştü, hastaneye yetişemedi. Ailesi köyden yolda. {US} titreyerek soruyor: 'Ne diyeceğiz abi?'",
    "İnşaatta her yıl yüzlerce işçi hayatını kaybediyor; en sık sebep yüksekten düşme. Ölümlü kazalar mutlaka bildirilmeli, savcılık soruşturması yapılır. Kazayı 'kalp krizi' ya da 'şantiye dışında oldu' diye gizlemek hem suçtur hem de ailenin tazminat hakkını elinden alır.",
    ["Kazayı bildir, aileye destek ol, şantiyeyi güvenli hale getir", "n-1.5 r+6 i-3 v+6 e+6 d+2", "Savcılık dosya açtı. Aile seni suçladı, haklı olarak. Ama şantiyede bir daha korkuluksuz boşluk kalmadı."],
    ["'Şantiye dışında düştü' diye tutanak tutturt", "r+10 v-20 e-12 m+2 F:kazaOrtbas", "Tutanağı imzalayan işçilerin gözü yerde. Biri video çekmişti."],
    ["Aileye para ver, şikâyetçi olmasınlar", "n-1 r+5 v-15 e-8 F:kazaOrtbas", "Baba parayı almadı. Anne aldı, ağlayarak."]),

  S("Kayıt Dışı İşçi Baskını",
    "Sabah altıda şantiyeye SGK ve emniyet ortak denetim geldi. Otuz işçinin on dokuzu kayıtsız; bir kısmının çalışma izni yok.",
    "Kayıt dışı çalıştırma, işçiyi kaza ve hastalık halinde güvencesiz bırakır; işverene ağır idari para cezası getirir. Yabancı işçilerin de çalışma izniyle ve sigortalı çalıştırılması zorunludur.",
    ["Cezayı öde, herkesi kayda al", "n-1 e+6 r-2 v+4", "Pahalı bir sabah. Ama artık baskından korkmuyorsun."],
    ["'Hepsi bugün başlamıştı' de, geriye dönük giriş yap", "n-0.4 r+6 v-6", "Sistem saat damgasını tutuyor. Müfettiş not aldı."],
    ["Kayıtsızları arka kapıdan kaçır", "r+8 e-10 v-10 F:kacakIsci", "Kaçan işçilerden biri iskeleden atlarken bileğini kırdı."]),

  S("Kur Farkı: Demir Fiyatı",
    "İnşaat demirinin tonu bir ayda %30 arttı. Sözleşmede fiyat farkı maddesi yok. {US}: 'Ya kalan katlar için ince demir alacağız ya da para bulacağız abi.'",
    "Maliyet artışları, müteahhitleri kaliteden kısmaya iter. Projede yazan donatı çapı ve sayısı değiştirilemez; yapı denetim her döküm öncesi donatıyı kontrol etmelidir.",
    ["Farkı öz kaynaktan karşıla, projeye sadık kal", "n-1.2 k+4 v+3", "Kâr marjın eridi. Kolonlar projedeki gibi."],
    ["Bir çap ince demir kullan", "n+0.6 k-12 v-12 r+5 F:kotuBeton", "Demir ince, ağırlık hafif, vicdan ağır."],
    ["Alıcılara 'kur farkı' faturası kes", "n+0.8 i-4 m+2 v-4", "Alıcıların WhatsApp grubu alev aldı."]),

  S("Gece Dökümü",
    "Belediye gündüz beton dökümünü trafik yüzünden yasakladı. Gece dökümde denetçi yok. {US}: 'Gece kimse bakmaz, vibratörü de çalıştırmayız, çabuk biter.'",
    "Vibratörsüz dökülen betonda boşluklar (segregasyon) oluşur; dayanım ciddi düşer. Döküm saatinden bağımsız olarak yapı denetim gözetimi zorunludur.",
    ["Denetçiyi gece dökümüne çağır, masrafını öde", "n-0.3 k+6", "Denetçi söylendi ama geldi. Her kolon vibratörle sıkıştırıldı."],
    ["Denetimsiz, hızlı dök", "n+0.4 k-10 v-6 p+4", "Sabah kalıplar söküldüğünde kolonun dibinde çakıl yuvaları vardı. Sıvacı çağrıldı."],
    ["Dökümü bir hafta ertele", "d+1 k+2", "Takvim kaydı ama beton doğru."]),

  S("Yanıcı Cephe Paneli",
    "Cephe kaplaması için iki teklif var: yangına dayanıklı panel ve yarı fiyatına yanıcı dolgulu panel. {US}: 'Dışarıdan ikisi aynı görünüyor abi.'",
    "Yanıcı dolgulu cephe panelleri, dünyada ve ülkemizde yangının dakikalar içinde bütün binaya yayıldığı faciaların sebebi olmuştur. Yüksek binalarda cephe malzemesinin yangın sınıfı yönetmelikle belirlenir; alıcılar malzeme belgelerini sorabilir.",
    ["Yangına dayanıklı paneli al", "n-0.8 k+8 v+3", "Pahalı. Ama bir gün bir sigara izmariti balkonda sadece sönecek."],
    ["Yanıcı paneli al", "n+0.8 k-10 v-10 r+4 F:yaniciCephe", "Bina parlıyor. Güneşte güzel, yangında korkunç."],
    ["Cepheyi sadece mantolama ve boya ile bitir", "n-0.2 k+2", "Sade ama güvenli."]),

  W({ q: "R:marmara" }, S("Sıvılaşma Riski",
    "{SM}'da zemin kazısında su çıktı. Statikçi uyarıyor: 'Bu zeminde deprem sırasında sıvılaşma olur. 1999'da bu bölgede binalar böyle yan yattı.' Zemin iyileştirme bütçeyi sarsacak.",
    "Marmara depreminde gevşek, suya doygun zeminlerde sıvılaşma nedeniyle binalar devrildi ve battı. Zemin iyileştirme (jet grout, taş kolon) ve doğru temel tasarımı bu riski azaltır.",
    ["Jet grout ile zemini iyileştir", "n-1.2 k+12 d+1 v+3", "Makineler bir ay çalıştı. Bina artık kayaya basıyor gibi."],
    ["Temeli biraz kalınlaştır, yeter", "n-0.3 k+2", "Yarım önlem. Statikçi imzalamadan önce iki kez düşündü."],
    ["Raporu 'uygun' diye düzelttir", "n+0.5 k-15 v-14 r+7 F:sahteZemin", "Rapor düzeldi. Su hâlâ orada."])),

  W({ q: "R:antep" }, S("Suriyeli Usta Ekibi",
    "{SM}'da işi en hızlı yapan ekip, Suriyeli ustalar. {US}: 'Çok iyi taş işçisiler ama çalışma izinleri yok. Yarı yevmiyeye çalışırlar.'",
    "Geçici koruma altındakiler dahil yabancı işçilerin çalışma izniyle, sigortalı ve asgari ücretin altına inmeden çalıştırılması zorunludur. Kayıt dışı yabancı işçiler kazada en korumasız kalan gruptur.",
    ["Çalışma izinlerini çıkar, eşit yevmiye öde", "n-0.6 e+10 k+4 v+5", "Ekip başı Abu Ahmed, ilk sigorta kartını sana gösterdi."],
    ["Yarı yevmiyeye, kayıtsız çalıştır", "n+0.6 e-4 v-10 r+5 F:kacakIsci", "Ucuz ve hızlı. Kaza olursa kimse yok."],
    ["Yerel ekiple devam et", "d+1", "Daha yavaş ama tanıdık."])),

  W({ q: "R:akdeniz" }, S("Sıcakta Çalışma",
    "{SM}'da termometre 44 dereceyi gösteriyor. Öğle arası beton dökülmesi gerekiyor. {US}: 'Ustalar bayılıyor abi, iki kişi hastaneye gitti.'",
    "Aşırı sıcakta çalışma, sıcak çarpması ve ölümlere yol açabilir; iş güvenliği mevzuatı işverene önlem alma yükümlülüğü getirir. Yüksek sıcaklıkta beton dökümü de kür ve dayanım sorunları yaratır.",
    ["Mesaiyi sabah ve akşama kaydır, gölgelik ve su koy", "d+1 e+10 k+3 v+3", "Ustalar 'ilk kez insan yerine konduk' dedi."],
    ["Öğlen devam, döküm aksamasın", "p+4 e-10 k-5 v-6 r+3", "Beton kuruyarak döküldü. Bir usta hastanede serum alıyor."],
    ["Mikser sayısını artır, dökümü hızla bitir", "n-0.4 p+3 e-2", "İş bitti, ekip yorgun ama sağlam."])),
];

// ---------- SATIŞ ----------
export const YENI_SATIS = [
  W({ sp: ["reklamcı Oğuz", "AL", "Abicim, aciliyet satar. 'Son 3 daire!' yazdın mı, herkes koşar.", "📣", "istanbul"] }, S("Harç'ta %40 İndirim",
    "Satışlar durgun. Reklamcı Oğuz fikir veriyor: 'Harç'ta reklam verelim: İlk 10 kişiye %40 indirim, sadece bugün! Kaporayı hemen IBAN'a yatırsınlar.' Oysa indirim yapacak durumun yok.",
    "Sosyal medyada 'son 3 daire', 'bugüne özel %40 indirim', 'hemen kapora yatırın' gibi baskı kuran ilanlar dolandırıcılığın klasik işaretidir. Kapora, noterde satış vaadi sözleşmesi yapılmadan ve firmanın resmi hesabı doğrulanmadan asla gönderilmemelidir.",
    ["Gerçek bir kampanya yap: şeffaf fiyat, noterde sözleşme", "o+6 i+2 v+2", "Satış yavaş ama iade talebi sıfır."],
    ["Sahte indirimle kapora topla", "n+1.5 o+12 v-12 r+6 m+3 F:sahteKampanya", "Bir günde 23 kapora geldi. İlk 10'u kim? Kimse bilmiyor."],
    ["Reklamı hiç verme", "", "Oğuz omuz silkti: 'Siz bilirsiniz, rakip veriyor.'"])),

  S("Sahte Hesap Senin Adına Satıyor",
    "Harç'ta firmanın logosunu kopyalayan sahte bir hesap, 'yarı fiyatına daire' diye kapora topluyor. {AL} arıyor: 'Kaporamı yatırdım, ne zaman sözleşme yapıyoruz?'",
    "Dolandırıcılar gerçek firmaların adını ve logosunu kullanarak sahte ilanlar açabilir. Alıcılar ödemeyi yalnızca firmanın resmi şirket hesabına, sözleşme karşılığında yapmalı; ilanı firmanın bilinen telefonundan teyit etmelidir. Kişisel IBAN'a kapora istenmesi büyük bir alarmdır.",
    ["Suç duyurusunda bulun, herkesi resmi kanaldan uyar", "n-0.2 i+5 v+3", "Savcılık hesabı kapattırdı. Uyarı paylaşımın binlerce kez paylaşıldı."],
    ["'Bizimle ilgisi yok' de, uğraşma", "i-3 v-2", "Sahte hesap iki hafta daha kapora topladı. Mağdurlar senin kapına geliyor."],
    ["Mağdurların kaporasını indirimle projene say", "n-0.5 o+4 i+6 v+5", "Mağdurlar gerçek müşteriye dönüştü. Pahalı ama zarif bir hamle."]),

  S("Aynı Daire, İki Alıcı",
    "{AL} elinde senetle kapıda: 'Bu daireyi ben aldım.' Arkasında başka bir aile, elinde tapu randevusu: 'Hayır, biz aldık.' Kasadaki para yetmiyor, ikisini de ödeyemezsin.",
    "Mükerrer satış (aynı dairenin birden fazla kişiye satılması) dolandırıcılık suçudur. Alıcılar satış vaadi sözleşmesini noterde yapıp tapuya şerh ettirmelidir; şerh, dairenin başkasına satılmasını engeller. Senetle, adi yazılı sözleşmeyle ev alınmamalıdır.",
    ["Dairelerden birini ikinci aileye ver, farkı sen öde", "n-1.5 i+4 v+8 m-1", "İki aile de ev sahibi oldu. Sen biraz fakirleştin."],
    ["'Tapuda kimin adı varsa onundur' de", "i-6 v-10 r+8 m+2 F:mukerrer", "Senetli aile mahkemeye gitti. Haber mahallenin grubuna düştü."],
    ["İki aileye de 'bir sonraki projeden' söz ver", "v-6 r+4 m+2 F:sozVerildi", "İki aile de bekliyor. Sonraki projede yine aynı daire mi?"]),

  S("Maket ile Gerçek",
    "Satış ofisinde maket çok güzel: havuz, çocuk parkı, yeşil alan. Gerçek vaziyet planında havuzun yerinde otopark var. {AL} maketin fotoğrafını çekiyor.",
    "Satış broşürü, maket ve reklamlar da sözleşmenin parçası sayılabilir; vaat edilenle teslim edilenin farklı olması 'ayıplı mal' sayılır. Alıcılar onaylı vaziyet planını ve mimari projeyi görmeden sözleşme imzalamamalıdır.",
    ["Maketi gerçek plana göre düzelt", "o-3 i+4 v+4", "Birkaç alıcı vazgeçti. Kalanlar ne aldığını biliyor."],
    ["Maket aynen kalsın, 'temsilidir' yazısını küçült", "o+8 v-8 m+2 F:maketYalani", "Satışlar arttı. Havuz ise hâlâ bir otopark."],
    ["Havuzu gerçekten yap, otoparkı bodruma al", "n-1 o+6 k+3 i+3", "Pahalı. Ama maket artık yalan söylemiyor."]),

  W({ q: "F:mukerrer" }, S("Mükerrer Satış Dosyası",
    "Aynı daireyi iki kişiye sattığın ortaya çıktı. Savcılık iki aileyi de dinledi. Avukatın: 'Birini tatmin edersen şikâyetten vazgeçebilir.'",
    "Mükerrer satışta şikâyetten vazgeçilse bile kamu davası sürebilir; zararın giderilmesi cezada indirim sağlayabilir. Mağdurlar hem ceza hem hukuk yoluna başvurabilir.",
    ["İki aileye de dairesini ya da parasını faiziyle ver", "n-2 r-6 v+10 m-2 i+2", "Aileler şikâyetini geri çekti. Savcı dosyaya 'zarar giderildi' yazdı."],
    ["Birini ödeyip diğerini oyala", "n-0.8 r+2 v-4", "Oyalanan aile çocuklarıyla ofisinin önünde bekliyor."],
    ["Daireyi üçüncü birine satıp parayı kasaya koy", "n+1.5 r+12 v-18 m+3 F:mukerrer", "Artık aynı dairenin üç sahibi var."])),

  S("Kredisiz Alıcı Kandırması",
    "{AL} bankadan kredi çıkmadı. 'Senetle alayım, tapuyu da ben borcumu bitirince verirsin' diyor. Kasaya hemen para lazım.",
    "Senetli satışlarda tapu müteahhitte kaldığı sürece daire müteahhidin borçlarından dolayı haczedilebilir. Senetle ev alan kişiler, dairenin tapusuna şerh koydurmalı ve ödemeleri banka üzerinden yapmalıdır.",
    ["Satış vaadini noterde yap, tapuya şerh koy", "n+0.6 o+4 i+2 v+2", "Alıcı sana sarıldı. Bankaların vermediği güveni sen verdin."],
    ["Senetle sat, şerh koyma", "n+1 o+5 v-6 F:serhsiz", "Alıcı her ay senet ödüyor. Tapu hâlâ senin üzerinde, haciz memurları için de."],
    ["Satma, krediye hazır olunca gelsin", "", "Alıcı üzüldü ama bir yıl sonra kredisiyle geri geldi."]),
];

// ---------- TESLİM ----------
export const YENI_TESLIM = [
  W({ sp: ["takipçi Cemil", "ME", "Abi bir tanıdık var, iskânı bir haftada çıkarır. Kimse kontrol etmez.", "🧾", "istanbul"] }, S("İskansız Anahtar: {PR}",
    "{PR} bitti ama iskân çıkmadı: otopark eksik, sığınak depoya çevrilmiş. Alıcılar kirada, anahtar istiyor. Takipçi Cemil 'bir tanıdık var, iskânı bir haftada çıkarır' diyor.",
    "İskânı (yapı kullanma izin belgesi) olmayan binada kalıcı su, elektrik ve doğalgaz aboneliği yapılamaz; ev sahipleri kredi kullanamaz, satışta zorlanır. Sahte iskân belgesi kullanmak resmi belgede sahtecilik suçudur. Alıcılar iskânı e-Devlet üzerinden sorgulayabilir.",
    ["Eksikleri tamamla, iskânı gerçek yoldan al", "n-1 d+1 i+6 v+4 s+4", "İki ay sürdü. Doğalgaz bağlandığında bir teyze peteğe sarıldı."],
    ["Cemil'in 'iskân'ını al, anahtarları dağıt", "n-0.3 i+2 v-14 r+10 F:sahteIskan", "Belge çok resmi görünüyor. Numarası sistemde yok."],
    ["İskânsız teslim et, şantiye elektriğiyle idare etsinler", "i-3 r+4 v-6 m+2", "Evler karanlıkta. Şantiye aboneliği her ay kesiliyor."])),

  W({ q: "F:sahteIskan" }, S("İskân Sorgusu",
    "Bir ev sahibi e-Devlet'ten sorguladı: belgenin numarası sistemde yok. Bütün apartmanın grubuna ekran görüntüsü düştü. Belediye inceleme başlattı.",
    "Sahte yapı kullanma izni tespit edildiğinde abonelikler iptal edilir, yapı kaçak sayılır ve sorumlular hakkında suç duyurusunda bulunulur. Ev sahiplerinin zararı müteahhitten tazmin edilebilir.",
    ["Kabul et, eksikleri tamamlayıp gerçek iskânı al", "n-1.5 r-4 v+8 i-2", "Ev sahipleri öfkeli ama en azından sonunda doğru belge geldi."],
    ["'Belediyenin sistem hatası' de", "r+8 i-6 v-6", "Belediye 'sistemimizde hata yok' diye açıklama yaptı."],
    ["Cemil'i ihbar et, 'beni de kandırdı' de", "r+2 v-4 i-2", "Cemil ifadesinde her şeyi anlattı. Sen de dahil."])),
];

// ---------- GÜNDEM ----------
export const YENI_GENEL = [
  W({ q: "Y:2018-2019" }, S("İmar Barışı",
    "Kaçak katlara ve projeye aykırı yapılara belge veren 'imar barışı' çıktı. Eski projelerinde çatıya eklediğin katlar var. Bir başvuruyla hepsi 'yasal' olacak.",
    "İmar affı belgesi, yapının depreme dayanıklı olduğu anlamına gelmez; yalnızca imar aykırılığını kayda alır. Alıcılar, 'imar barışından belge aldı' denen yapılarda mutlaka taşıyıcı sistemin incelenmesini istemelidir.",
    ["Başvur ama önce binaları güçlendir", "n-1 i+3 v+4 k+3", "Belge aldın; binalar da gerçekten sağlamlaştı."],
    ["Başvur, belgeyi al, güçlendirmeye gerek yok", "n-0.2 r-4 v-6", "Kâğıt temiz. Kolonlar aynı kolonlar."],
    ["Kaçak katları sat, alıcılara 'belgeli' de", "n+1.5 v-10 m+2 r+3", "Alıcılar 'belgeli' kelimesini 'sağlam' diye anladı."])),

  S("Konut Kredisi Faizleri Uçtu",
    "Merkez bankası faiz artırdı. Konut kredisi faizleri iki katına çıktı; alıcılar kredi çekemiyor. {AL} ön satış sözleşmesini iptal etmek istiyor.",
    "Faiz artışları konut satışlarını hızla düşürür. Ön satış yapan müteahhitler nakit sıkışıklığına girer; alıcılar sözleşmedeki cayma ve iade şartlarını okumalıdır.",
    ["Kaporayı iade et", "n-0.5 i+4 v+3", "Alıcı teşekkür etti. Sözün geçiyor."],
    ["Kaporayı yakacağını söyle", "n+0.3 i-4 v-5 m+1", "Alıcı tüketici hakem heyetine gitti."],
    ["Kendi senetli vade sistemini kur", "o+6 r+2 F:serhsiz", "Alıcı kaldı. Sen de bankacılığa soyundun."]),

  S("Deprem Tatbikatı Haberi",
    "Kanalda deprem uzmanı konuşuyor: 'Şehirdeki binaların büyük kısmı riskli.' Telefonlar susmuyor; alıcılar kendi dairelerinin beton raporunu istiyor.",
    "Bina sahipleri, riskli yapı tespiti yaptırabilir; yeni alınan dairelerde yapı denetim raporu, beton test sonuçları ve zemin etüdü istenebilir. Paniğe değil, belgeye bakmak gerekir.",
    ["Bütün raporları alıcılarla paylaş", "i+4 v+3", "Kalitesi yüksek binaların alıcıları rahatladı. Diğerlerinde yüzler asık."],
    ["'Bizim binalar en sağlamı' diye reklam ver", "i+2 v-4", "Reklam dolaştı. Ekranda uzman hâlâ konuşuyor."],
    ["Sessiz kal", "i-2", "Sessizlik, cevap olarak anlaşıldı."]),
];

// ---------- Kur şoku (tarihe bağlı, herkese gelir) ----------
export function kurSokuCard(s, artis) {
  const borc = s.dovizBorc > 0;
  return {
    kind: "sys", phase: "genel", title: "Kur Şoku", banner: "EKONOMİ",
    speaker: { emoji: "📉", name: "ekonomi muhabiri", label: "", roleLabel: "Basın", quote: "Döviz kuru bir haftada yüzde kırkın üzerinde yükseldi. İnşaat malzemesi fiyatları günlük değişiyor." },
    text: borc
      ? `Döviz bir gecede fırladı. Euro kredin yüzünden borcun bir hafta içinde ${artis} arttı. Demir, çimento ve asansör fiyatları da uçtu.`
      : "Döviz bir gecede fırladı. Borcun TL olduğu için kurtuldun ama demir, çimento ve asansör fiyatları uçtu; alıcılar da beklemeye geçti.",
    ders: "Geliri TL olan müteahhitlerin döviz borcu, kur şoklarında bir gecede katlanır. 2018 ve 2021'de birçok inşaat şirketi bu yüzden konkordato ilan etti; en çok da ön satıştan ev almış kişiler mağdur oldu. Alıcılar, müteahhidin mali durumunu ve tapuya şerh edilmiş sözleşmelerini kontrol etmelidir.",
    choices: [
      { label: "Kalan döviz borcunu TL'ye çevir, zararı kabul et", fx: borc ? "i+1 F:dovizBitti" : "i+1", act: { type: "dovizKapat" }, result: "Acı ama sabit. Artık kur grafiği uykunu kaçırmayacak." },
      { label: "Fiyatları dövize endeksle, farkı alıcılara yansıt", fx: "n+1 i-5 m+3 v-6", result: "Ön satıştan ev alanlara 'kur farkı' mektubu gitti. Mahallede öfke büyük." },
      { label: "İşleri yavaşlat, kurun düşmesini bekle 🎲", fx: "d+1", act: { type: "gamble", p: 0.4, win: "n+0.5", lose: "n-1 d+1", winText: "Kur biraz geri çekildi. Nefes aldın.", loseText: "Kur geri çekilmedi. Bekledikçe zarar büyüdü." }, result: "" },
    ],
  };
}

// ---------- Yeni hikâye zincirleri ----------
import { sp } from './dialect.js';
const sys = (o) => ({ kind: "sys", phase: "hikaye", ...o });
const fl = (s, f) => !!s.flags[f];

export const YENI_ARCS = [
  { id: "donusum", ad: "Çınar Apartmanı", steps: [
    { when: (s) => s.completed >= 1 && s.t >= 14, card: () => sys({
      banner: "DÖNÜŞÜM", title: "Çınar Apartmanı",
      speaker: sp("yönetici Sevim Hanım", "istanbul", "AS", "1974 yapımı bir binayız evladım. 24 aile var. Çoğumuz emekli. Deprem korkusuyla uyuyamıyoruz ama kimseye de güvenemiyoruz.", "👵"),
      text: "Çınar Apartmanı kentsel dönüşüm için müteahhit arıyor. 24 hak sahibi var; kimi kirada oturamayacak kadar yaşlı, kimi evini tek varlığı olarak görüyor.",
      ders: "Kentsel dönüşümde hak sahipleri, müteahhidin teslim ettiği önceki binaları, mali gücünü ve teminat mektubu verip vermediğini sormalıdır. Sözleşmede kira yardımı, teslim süresi ve gecikme cezası açıkça yazılmalıdır.",
      choices: [
        { label: "Adil teklif: %50 pay, kira yardımı, teminat mektubu", fx: "n-1 i+5 v+6 F:dnAdil", result: "Toplantıda ilk kez kimse bağırmadı. Sevim Hanım 'hayırlı olsun' dedi." },
        { label: "Korkut: 'Bina her an çöker, %35'e razı olun'", fx: "n+1 v-10 r+3 F:dnKorku", result: "Yaşlılar korkudan imzaladı. İki genç aile avukat tuttu." },
        { label: "Girme, bu iş çok dertli", fx: "", result: "Çınar Apartmanı başka müteahhit aramaya devam ediyor." },
      ] }) },
    { when: (s) => fl(s, "dnAdil") || fl(s, "dnKorku"), card: (s) => fl(s, "dnAdil") ? sys({
      banner: "DÖNÜŞÜM", title: "Yıkım Günü",
      speaker: sp("Sevim Hanım", "istanbul", "AS", "Kırk yılım bu duvarlarda geçti. Yıkılırken bakamadım. Ama sana güveniyorum evladım.", "👵"),
      text: "Çınar Apartmanı yıkıldı. Hak sahipleri kirada. Kur yükseldi, maliyetler arttı; hesap tablosu artık %50 pay ile kâr bırakmıyor.",
      ders: "Maliyet artışlarında sözleşmeyi tek taraflı değiştirmek hukuken mümkün değildir. Taraflar ek protokolle ancak karşılıklı rızayla anlaşabilir.",
      choices: [
        { label: "Sözünde dur, zararı üstlen", fx: "n-2 i+6 v+6", result: "Kârın bitti. Ama Sevim Hanım her hafta şantiyeye börek getiriyor." },
        { label: "Hak sahipleriyle açık konuş, küçük bir ek protokol öner", fx: "n-0.8 i+2 v+2", result: "Uzun bir toplantı. Sonunda ortada buluştunuz." },
        { label: "İnşaatı durdur, 'pay düşmezse devam etmem' de", fx: "n+1 v-10 m+4 r+3 F:dnRehin", result: "24 aile kirada, inşaat durdu. Artık pazarlık değil, rehine durumu." },
      ] }) : sys({
      banner: "DAVA", title: "Genç Aileler Mahkemede",
      speaker: sp("avukat Deniz Hanım", "ankara", "Hukuk", "Müvekkillerim korkutularak imza verdi. Binanın riskli olduğuna dair rapor da tartışmalı. Sözleşmenin iptalini istiyoruz.", "⚖️"),
      text: "İki genç aile dava açtı. Mahkeme bilirkişi atadı. Yaşlı hak sahiplerinden biri, 'bizi korkuttular' diye ifade verdi.",
      ders: "İrade fesadıyla (korkutma, aldatma) imzalatılan sözleşmeler iptal edilebilir. Hak sahipleri, baskı altında imza atmamalı; önce bağımsız bir avukata danışmalıdır.",
      choices: [
        { label: "Sözleşmeyi herkes için %50'ye çıkar", fx: "n-2 r-4 v+8 m-2", result: "Dava geri çekildi. Yaşlılar da payını aldı." },
        { label: "Sadece dava açanlara daha fazla ver", fx: "n-0.8 v-4 m+2", result: "Yaşlılar sessizce öğrendi. Apartman ikiye bölündü." },
        { label: "Davayı sürdür, yılları geçsin", fx: "d+2 r+4 v-6 m+3 F:dnRehin", result: "Bina yıkık, dava sürüyor. Aileler kirada." },
      ] }) },
    { when: (s) => s.completed >= 3, card: (s) => fl(s, "dnRehin") ? sys({
      banner: "HABER", title: "Anahtarını Göremedi",
      speaker: sp("muhabir Pınar", "istanbul", "Basın", "Çınar Apartmanı'nın en yaşlı hak sahibi, yeni evinin anahtarını alamadan hayatını kaybetti. Ailesi müteahhidi suçluyor.", "🎤"),
      text: "Yıllarca kirada bekleyen Sevim Hanım'ın komşusu Rıza Amca, yeni evini göremeden öldü. Cenazede hak sahipleri pankart açtı.",
      ders: "Kentsel dönüşümde yarım kalan ya da uzayan projeler, en çok yaşlı hak sahiplerini vurur. Gecikmelerde hak sahipleri tahliye ve kira taleplerini mahkemeye taşıyabilir.",
      choices: [
        { label: "Taziyeye git, binayı hemen bitirme sözü ver", fx: "n-2 v+8 i+2 m-3", result: "Sevim Hanım elini sıktı ama gözlerinin içine bakmadı." },
        { label: "Açıklama yap: 'Gecikme hak sahiplerinden kaynaklı'", fx: "i-8 v-8 m+3", result: "Açıklama sosyal medyada yüz bin kez paylaşıldı. Hep yanlış sebeplerle." },
      ] }) : sys({
      banner: "DÖNÜŞÜM", title: "Çınar'a Dönüş",
      speaker: sp("Sevim Hanım", "istanbul", "AS", "Evladım, yeni evimin balkonunda çay içiyorum. Deprem haberi çıkınca artık korkmuyorum. Allah razı olsun.", "👵"),
      text: "Yeni Çınar Apartmanı teslim edildi. 24 aile evine döndü. Mahalledeki diğer eski binalar da seninle görüşmek istiyor.",
      ders: "Güven, dönüşümün en değerli sermayesidir. Başarılı bir dönüşüm projesi, mahalledeki diğer hak sahiplerinin kararını da etkiler.",
      choices: [
        { label: "Mahalledeki diğer binalarla da görüş", fx: "i+8 a+5 v+2", result: "Telefonun çalıyor. Bu sefer korkudan değil, güvenden." },
        { label: "Açılışa sessizce git, kurdele kesme", fx: "i+4 v+4", result: "Sevim Hanım herkese seni anlattı." },
      ] }) },
  ] },

  { id: "ihale", ad: "Deprem Konutları İhalesi", steps: [
    { when: (s) => s.completed >= 2 && s.t >= 30, card: () => sys({
      banner: "İHALE", title: "Deprem Konutları İhalesi",
      speaker: sp("idare müdürü Ferhat Bey", "ankara", "Kamu", "Abe 400 konut, deprem bölgesine. Yaklaşık maliyet düşük ama iş büyük. Şartnameyi konuşmak istersen, akşam yemeğe buyur.", "🏛️"),
      text: "Kamu konut idaresi, deprem bölgesi için 400 konutluk ihaleye çıkıyor. Kazanan, yılların işini alacak. Rakiplerin fiyatları kırıyor.",
      ders: "Kamu ihalelerinde şartnameyi belirli bir firmaya göre yazdırmak ya da teklifleri önceden paylaşmak 'ihaleye fesat karıştırma' suçudur. Aşırı düşük teklifler ise çoğu zaman kaliteden kısılarak telafi edilir.",
      choices: [
        { label: "Maliyeti doğru hesapla, gerçekçi teklif ver", fx: "g+3 F:ihDurust", result: "Teklifin zarfta. Rakiplerden yüksek ama tutarlı." },
        { label: "Aşırı düşük teklif ver, kazanınca bakarsın", fx: "n+3 F:ihDusuk", result: "İhaleyi kazandın! Avans hesaba yattı." },
        { label: "Ferhat Bey'le akşam yemeğine git", fx: "n+4 v-12 r+8 F:ihFesat", result: "Şartnameye bir 'deneyim belgesi' maddesi eklendi. Sadece sende var." },
      ] }) },
    { when: (s) => fl(s, "ihDurust") || fl(s, "ihDusuk") || fl(s, "ihFesat"), card: (s) => fl(s, "ihFesat") ? sys({
      banner: "İHALE", title: "Ferhat Bey Pay İstiyor",
      speaker: sp("Ferhat Bey", "ankara", "Kamu", "Abe iş büyüdü, masraflar büyüdü. Yukarıdakiler de pay istiyor. Hakedişlerden yüzde on, ona göre.", "🏛️"),
      text: "Hakediş ödemeleri Ferhat Bey'in imzasından geçiyor. Payı artık bir 'hediye' değil, düzenli bir kesinti.",
      ders: "Kamu görevlisine çıkar sağlamak rüşvet suçudur ve iki tarafı da sorumlu kılar. Rüşvet düzenleri çoğu zaman bir tarafın ifadesiyle çöker.",
      choices: [
        { label: "Öde, işler aksamasın", fx: "n-2 v-8 r+6 F:ihRusvet", result: "Hakedişler zamanında geliyor. Makbuzsuz." },
        { label: "Reddet, ne olursa olsun", fx: "d+2 r+2 v+4", result: "Hakedişlerin 'evrak eksiği' yüzünden üç aydır bekliyor." },
        { label: "Konuşmaları kaydet, savcılığa git", fx: "r-6 v+10 i+4 F:ihIhbar", result: "Etkin pişmanlık başvurun alındı. Ferhat Bey'in telefonu dinlemede." },
      ] }) : fl(s, "ihDusuk") ? sys({
      banner: "İHALE", title: "Hesap Tutmuyor",
      speaker: sp("şantiye şefi Rıfat", "karadeniz", "US", "Abi bu fiyata bu konutlar olmaz. Ya demiri azaltacağuz ya da cebinden koyacaksun.", "👷"),
      text: "Düşük teklifle aldığın deprem konutlarında maliyet teklifin %40 üstünde. Hak sahipleri çadır kentte, konutlarını bekliyor.",
      ders: "Deprem bölgesine yapılan konutlarda kaliteden kısmak, aynı felaketi bir daha yaşatmak demektir. Kamu idaresi de teslim alırken beton ve donatı testlerini yaptırmakla yükümlüdür.",
      choices: [
        { label: "Zararı üstlen, konutları doğru yap", fx: "n-4 i+8 v+8", result: "Kasa eridi. Ama çadırdaki aileler sağlam evlere girecek." },
        { label: "Demirden ve betondan kıs", fx: "n+1 v-15 r+6 m+4 F:ihKalite", result: "Konutlar yükseliyor. İnce demir, sulu beton." },
        { label: "İşi bırak, teminatını yak", fx: "n-2 i-6 g-6 m+3", result: "Yarım konutlar çadır kentin karşısında öylece duruyor." },
      ] }) : sys({
      banner: "İHALE", title: "Yarım Kalan İhale",
      speaker: sp("Ferhat Bey", "ankara", "Kamu", "Abe düşük teklifi veren firma işi bıraktı. Kalan işi tasfiye ihalesiyle size vermek istiyoruz. Fiyatınız gerçekçiydi.", "🏛️"),
      text: "İhaleyi kaybetmiştin; kazanan firma yarıda kaçtı. İdare kalan konutlar için sana geldi, bu kez doğru fiyatla.",
      ders: "Gerçekçi fiyat vermek kısa vadede kaybettirebilir; uzun vadede güvenilirlik kazandırır. Tasfiye ihaleleri, yarım kalan kamu işlerini tamamlamak için kullanılır.",
      choices: [
        { label: "Kabul et, konutları bitir", fx: "n+3 i+8 v+4", result: "Çadır kentten ilk aileler anahtar almaya başladı." },
        { label: "Teşekkür et, kapasiten dolu", fx: "i+2", result: "Ferhat Bey not aldı: 'Dürüst firma, bir dahakine.'" },
      ] }) },
    { when: (s) => fl(s, "ihRusvet") || fl(s, "ihKalite") || fl(s, "ihIhbar"), card: (s) => fl(s, "ihIhbar") ? sys({
      banner: "SON DAKİKA", title: "İhale Operasyonu",
      speaker: sp("muhabir Pınar", "istanbul", "Basın", "Kamu konut idaresine sabah operasyonu! Rüşvet çarkını bir müteahhidin ihbarı çözdü.", "🎤"),
      text: "Ferhat Bey ve dört kişi gözaltında. İhbarcı olarak adın gizli tutuldu ama sektör seni konuşuyor.",
      ders: "Rüşvet ve ihaleye fesat suçlarında etkin pişmanlık hükümleri, suçu ilk bildirene cezasızlık ya da indirim sağlayabilir.",
      choices: [
        { label: "Sessiz kal, işine bak", fx: "i+4 r-5 v+3", result: "Bazı firmalar seninle çalışmayı kesti. Bazıları ilk kez aradı." },
        { label: "Basına konuş, herkes bilsin", fx: "i+8 r-3 F:ihKahraman", result: "Manşette 'rüşvete hayır diyen müteahhit' var. Rakiplerin de seni izliyor." },
      ] }) : sys({
      banner: "SON DAKİKA", title: "İhale Operasyonu",
      speaker: sp("muhabir Pınar", "istanbul", "Basın", "Deprem konutlarında rüşvet ve çürük malzeme iddiası! Savcılık kamu konut idaresine operasyon başlattı.", "🎤"),
      text: fl(s, "ihKalite") ? "Teslim edilen deprem konutlarından alınan karot numuneleri düşük çıktı. Savcılık firmanın kayıtlarını istedi." : "Ferhat Bey gözaltında ve konuşuyor. Hakediş kayıtlarında senin firmanın adı var.",
      ders: "Deprem bölgesi konutlarında kusurlu yapım ve ihale yolsuzlukları, hem kamu zararı hem de can güvenliği suçu olarak yargılanır.",
      choices: [
        { label: "Savcılığa git, her şeyi anlat", fx: "r+6 v+8 i-6", result: "İfaden tutanağa geçti. Yıllarca sürecek bir dava başlıyor." },
        { label: "Avukat ordusu tut, inkâr et 🎲", fx: "n-2", act: { type: "gamble", p: 0.45, win: "r+4", lose: "r+25 i-12 m+4", winText: "Dosya zaman aşımına doğru yavaşça ilerliyor. Şimdilik.", loseText: "Ferhat Bey'in defterinde senin adın ve tutarlar vardı." }, result: "" },
      ] }) },
  ] },
];
