// Kurgusal karakter havuzları. Gerçek kişilerle benzerlik tesadüftür.
export const NAMES = {
  AS: ["Hacı Rıza Amca", "Fatma Teyze", "Karagöz Kardeşler", "emekli öğretmen Nuri Bey", "dul Hatice Hanım",
    "Kemal Usta'nın varisleri", "Aysel ve Cemil çifti", "Şükrü Dede", "yedi kardeş Aydınlar", "gurbetçi Mehmet Abi",
    "muhtarın kayınbiraderi Sabri", "Nazmiye Nine", "emekli albay Turgut Bey", "bakkal Hüsnü", "Demirtaş ailesi",
    "üç kız kardeş Özkanlar", "Kıbrıs gazisi Veli Amca", "terzi Müzeyyen Hanım"],
  YT: ["kuyumcu Selim", "Doktor Leyla Hanım", "emlakçı Burak", "Almanya'dan Hüseyin Abi", "kasap Zeki",
    "tekstilci Orhan Bey", "esnaf kooperatifi", "eniştesi Ferit", "emekli pilot Cengiz", "yatırım danışmanı Sinan",
    "halı tüccarı Nihat", "diş hekimi Gül Hanım", "nakliyeci Tahsin", "benzinci Kadir Bey", "emekli hakim Suat Bey"],
  US: ["kalıpçı Rıfat", "demirci Bekir Usta", "sıvacı Hasan", "elektrikçi Tayfun", "tesisatçı Ramazan",
    "şantiye şefi Gökhan", "betoncu Yusuf", "fayansçı Erdal", "boyacı İsmail", "taşeron Kenan", "duvarcı Cafer",
    "iskele ustası Musa", "mimar Deniz Hanım", "statikçi Emre Bey"],
  AL: ["genç çift Ece ve Mert", "emekli memur Ahmet Bey", "öğretmen Selin", "gurbetçi Yılmaz ailesi", "körfezli bir yatırımcı",
    "Doktor Can", "üniversiteli kızına ev arayan Şerife Hanım", "taksici Recep", "hemşire Nur", "yeni evli Zehra ve Oğuz",
    "polis memuru Harun", "üç çocuklu Kaya ailesi", "emekli işçi Bayram Amca", "yazılımcı Tolga"],
  ME: ["belediye imar müdürü", "yapı denetim mühendisi", "tapu memuru", "vergi müfettişi", "zabıta amiri",
    "belediye meclis üyesi", "SGK müfettişi", "Çevre ve Şehircilik uzmanı", "fen işleri şefi"],
  GZ: ["yerel gazeteci Barış", "sosyal medya fenomeni Ayça", "TV muhabiri Kerem", "mahallenin Facebook grubu",
    "köşe yazarı Nevzat", "araştırmacı gazeteci Pınar"],
};

export const SEMTLER = ["Fikirtepe", "Esenyurt", "Kartal", "Çankaya", "Karşıyaka", "Bornova", "Nilüfer", "Kepez",
  "Seyhan", "Ataşehir", "Beylikdüzü", "Etimesgut", "Buca", "Pendik", "Merkezefendi", "Talas", "Odunpazarı", "Atakum",
  "Meram", "Yenimahalle", "Avcılar", "Bağcılar", "Sancaktepe", "Keçiören", "Mezitli", "Şahinbey", "Efeler", "İzmit"];

export const PROJE_ADLARI = ["Güneş", "Yıldız", "Mavi", "Huzur", "Vadi", "Lale", "Bosfor Vista", "Prestij", "Cennet Bahçe",
  "Gold Life", "Nirvana", "Elit", "Asil", "Şehir Rüyası", "Palmiye", "Zümrüt", "Park Avenue", "Sultan", "Loft Yaşam",
  "Mavi Kordon", "Deniz Yıldızı", "Yeşil Vadi", "Royal", "Karanfil", "Bereket", "Serenity", "Aile Yuvası"];

// Her senaryo 5 varyasyonla oynanır: karakter, semt ve aşağıdaki durum farkı değişir.
// m: o varyasyonda etkilerin çarpanı (ör. r:1.5 → hukuki risk 1.5 kat).
export const TWISTS = {
  arsa: [
    { t: "Arsa sahibinin avukat damadı her kelimeyi tek tek okuyor.", m: { r: 1.5 } },
    { t: "Arsa sahibi yaşlı ve yalnız; sana oğlu gibi güveniyor.", m: { v: 1.5, m: 1.5 } },
    { t: "Köşe başı parsel; rakip müteahhit de kapıda bekliyor.", m: { n: 1.3, h: 1.2 } },
    { t: "Tapu hisseli, varislerin her biri ayrı telden çalıyor.", m: { d: 1.6, s: 1.2 } },
    { t: "Muhtar araya girmiş, bütün mahalle bu anlaşmayı konuşuyor.", m: { i: 1.6 } },
  ],
  yatirim: [
    { t: "Yatırımcı bu parayı emekli ikramiyesinden ayırmış.", m: { v: 1.5, g: 1.3, m: 1.5 } },
    { t: "Faizler tavan yapmış, bankalar kredi musluğunu kısmış.", m: { n: 1.3, y: 1.2 } },
    { t: "Yatırımcının kulağına senin hakkında dedikodular gelmiş.", m: { g: 1.5 } },
    { t: "Yatırımcı eski bir dostun; hatırını kırmak zor.", m: { g: 1.2, v: 1.3 } },
    { t: "Piyasa coşkulu, herkes inşaata para basmak istiyor.", m: { y: 1.3, n: 1.2 } },
  ],
  insaat: [
    { t: "Kış bastırmış, beton donmak üzere.", m: { k: 1.3, d: 1.3 } },
    { t: "Yapı denetimin bu hafta sürpriz ziyaret yapacağı konuşuluyor.", m: { r: 1.5 } },
    { t: "Demir fiyatı bir haftada %20 zamlandı.", m: { n: 1.4 } },
    { t: "Ekip üç aydır tam maaş alamadı, sinirler gergin.", m: { e: 1.5 } },
    { t: "Komşular şantiyeyi sürekli video çekip paylaşıyor.", m: { i: 1.4, r: 1.2 } },
  ],
  satis: [
    { t: "Faizler düştü, alıcılar kapıda kuyruk.", m: { n: 1.3 } },
    { t: "Vergi dairesi bölgede tapu harcı incelemesi başlattı.", m: { r: 1.6 } },
    { t: "Alıcı ilk evini alıyor; bütün birikimini bu daireye koyacak.", m: { v: 1.5, m: 1.5 } },
    { t: "Emlakçılar bölgede fiyatları kızıştırıyor.", m: { n: 1.2, x: 1.2 } },
    { t: "Sosyal medyada eski projen hakkında şikayetler dolaşıyor.", m: { i: 1.5 } },
  ],
  teslim: [
    { t: "Arsa sahipleri anahtar töreni için kurban bile ayarlamış.", m: { s: 1.3, v: 1.3 } },
    { t: "Belediyede iskan dosyaları aylardır bekliyor.", m: { d: 1.4 } },
    { t: "Bir alıcı avukatıyla birlikte geldi.", m: { r: 1.5 } },
    { t: "Kış geldi, kaloriferler hâlâ yanmıyor.", m: { i: 1.3 } },
    { t: "Yerel basın teslim gününü takip ediyor.", m: { i: 1.5 } },
  ],
  cark: [
    { t: "Bankadan üçüncü ihtarname geldi.", m: { r: 1.3 } },
    { t: "Yeni projenin arsa sahipleri, eski projenin mağdurlarıyla aynı kahvede oturuyor.", m: { i: 1.5 } },
    { t: "Eşin artık telefonlarını kapatmanı istiyor.", m: { v: 1.3 } },
    { t: "Muhasebecin istifa mektubunu masana bıraktı.", m: { r: 1.4 } },
    { t: "Çekler cumartesi karşılıksız çıkacak.", m: { n: 1.3 } },
  ],
  genel: [
    { t: "Haber bültenlerinde her akşam ekonomi konuşuluyor.", m: { n: 1.2 } },
    { t: "Seçim yaklaşıyor, herkes vaat peşinde.", m: { i: 1.3 } },
    { t: "Sektörde son aylarda iki büyük firma battı.", m: { g: 1.3 } },
    { t: "Bu ay işler şaşırtıcı derecede sakin.", m: {} },
    { t: "Kahvede herkes senin son projeni konuşuyor.", m: { i: 1.2, r: 1.1 } },
  ],
};
TWISTS.kacis = TWISTS.cark;
