// Başlangıç seçenekleri: her biri farklı bir kasa/itibar/ekip dengesiyle ve kendine özgü bir hikâye zinciriyle gelir.
// Karakterler kurgusaldır.
import { sp } from './dialect.js';

export const BASLANGIC = {
  kalfa: {
    ad: "Sıfırdan Kalfa", emoji: "🧱",
    kisa: "Cebin boş ama ustalar seni sever. Ekip ve vicdan yüksek, binaların sağlam başlar.",
    set: { n: 4, i: 48, g: 38, e: 72, v: 82, r: 3 },
  },
  aile: {
    ad: "Babadan Kalma Firma", emoji: "🏚️",
    kisa: "Tanınan bir tabela, dolu bir kasa. Ama babandan borç ve eski binalar da kaldı.",
    set: { n: 13, b: 7, i: 62, g: 56, e: 60, v: 66, r: 9 },
  },
  damat: {
    ad: "Torpilli Damat", emoji: "🤵",
    kisa: "Kayınpederin belediyede. Kapılar açılır, dosyalar yavaş ilerler. Her iyiliğin bir bedeli var.",
    set: { n: 9, i: 50, g: 62, e: 50, v: 62, r: 4 },
  },
};

const sys = (o) => ({ kind: "sys", phase: "hikaye", ...o });
const fl = (s, f) => !!s.flags[f];
const at = (y, m) => (y - 2012) * 12 + (m - 1);

export const BASLA_ARCS = [
  // ---------- Sıfırdan kalfa: ustabaşı Hasan ----------
  { id: "hasanUsta", ad: "Hasan Usta", steps: [
    { when: (s) => s.baslangic === "kalfa" && s.t >= 4, card: () => sys({
      banner: "USTAN", title: "Hasan Usta Kapıda",
      speaker: sp("Hasan Usta", "dogu", "US", "Lawo, sana mala tutmayı ben öğrettim. Şimdi patron olmuşsun. Oğlum işsiz, bir iş ver ona. Ama bak, betona su kattırma, hakkımı helal etmem.", "👴"),
      text: "Kalfalığını yaptığın ustabaşı Hasan Usta, yıllar sonra şantiyene geldi. Oğlu işsiz. Hasan Usta'nın kendisi de başka bir müteahhidin şantiyesinde sigortasız çalışıyor.",
      ders: "İnşaat işçilerinin önemli bir kısmı hâlâ kayıt dışı çalışıyor. Sigortasız çalışan işçi, iş kazasında tedavi ve tazminat haklarından yararlanamayabilir. SGK kaydınızı e-Devlet'ten kontrol edebilir, ALO 170'e başvurabilirsiniz.",
      choices: [
        { label: "Oğlunu da Hasan Usta'yı da sigortalı işe al", fx: "n-0.3 e+8 v+4 F:hasanYaninda", result: "Hasan Usta şantiyede gençlere mala tutmayı öğretiyor. Kolonlar dimdik." },
        { label: "Sadece oğlunu al, yevmiyeyle", fx: "e+2 v-2", result: "Hasan Usta teşekkür etti ama gözleri buruk." },
        { label: "'Kadro dolu usta' de", fx: "v-4 F:hasanGitti", result: "Hasan Usta başını sallayıp gitti. Başka bir şantiyede iskele kuruyor." },
      ] }) },
    { when: (s) => s.baslangic === "kalfa" && s.completed >= 1, card: (s) => fl(s, "hasanYaninda") ? sys({
      banner: "USTAN", title: "Usta Çırak",
      speaker: sp("Hasan Usta", "dogu", "US", "Bak lawo, bu gençler işi öğrenirse senin binaların yüz yıl durur. Ben gidersem de onlar kalır.", "👴"),
      text: "Hasan Usta şantiyede küçük bir usta okulu kurmak istiyor: gençlere demir bağlama, kalıp, beton kürü öğretecek.",
      ders: "Nitelikli işçilik, yapı güvenliğinin temelidir. Mesleki yeterlilik belgesi olmayan işçilerle yapılan işler hem risklidir hem de denetimlerde sorun çıkarır.",
      choices: [
        { label: "Okulu kur, masrafını üstlen", fx: "n-0.6 e+10 i+4 v+4 F:ustaOkulu", result: "İlk dönem 12 genç sertifika aldı. Binalarının kalitesi dilden dile dolaşıyor." },
        { label: "Güzel fikir ama şimdi değil", fx: "e-2", result: "Hasan Usta 'sen bilirsin' dedi." },
      ] }) : sys({
      banner: "HABER", title: "İskeleden Düştü",
      speaker: sp("Hasan Usta'nın oğlu", "dogu", "US", "Abê, babam başka bir şantiyede iskeleden düştü. Sigortası yokmuş. Hastane parası isteniyor.", "🧑"),
      text: "Hasan Usta, sigortasız çalıştığı şantiyede korkuluksuz iskeleden düştü. Müteahhit 'bizim işçimiz değil' diyor.",
      ders: "Kayıt dışı çalışırken kaza geçiren işçi, işverenin sigortasız çalıştırdığını ispatlayarak hizmet tespit davası açabilir. İş kazaları savcılığa bildirilmelidir.",
      choices: [
        { label: "Hastane masrafını öde, avukat bul", fx: "n-0.8 v+8 e+6 i+2", result: "Hasan Usta iyileşiyor. Avukat, diğer müteahhide hizmet tespit davası açtı." },
        { label: "Geçmiş olsun de, karışma", fx: "v-6 e-4", result: "Ustalar arasında 'kendi ustasını bile aramadı' sözü dolaştı." },
      ] }) },
  ] },

  // ---------- Babadan kalma firma: eski binalar ----------
  { id: "babaMiras", ad: "Babanın Mirası", steps: [
    { when: (s) => s.baslangic === "aile" && s.t >= 3, card: () => sys({
      banner: "MİRAS", title: "Babanın 1998 Binası",
      speaker: sp("apartman yöneticisi Nurten Hanım", "ege", "AS", "Babanız bu binayı 1998'de yaptı. Kolonlarda çatlak var. Bir mühendis 'deprem yönetmeliğine uymuyor' dedi. Ne yapacağız?", "👩‍🦳"),
      text: "Firmayı devraldığında babanın yaptığı eski bir apartman da geçmişinle birlikte geldi. Sakinler güçlendirme istiyor. Yasal olarak artık sorumlu değilsin; vicdanen?",
      ders: "Eski binalarda oturanlar, riskli yapı tespiti için lisanslı kuruluşlara başvurabilir. Güçlendirme ya da kentsel dönüşüm, deprem öncesinde yapılabilecek en önemli önlemdir.",
      choices: [
        { label: "Güçlendirmeyi maliyetine üstlen", fx: "n-2 i+6 v+8 F:babaGuclendir", result: "Kolonlar mantolandı, perde duvarlar eklendi. Nurten Hanım çay demledi." },
        { label: "Dönüşüm teklif et: yıkıp yeniden yap", fx: "n+0.5 i+2 F:babaDonusum", result: "Sakinler düşünüyor. Bazıları çok yaşlı, taşınmak istemiyor." },
        { label: "'Babamın işi, beni ilgilendirmez' de", fx: "v-8 F:babaInkar", result: "Nurten Hanım kapıyı yavaşça kapattı." },
      ] }) },
    { when: (s) => s.baslangic === "aile" && s.t >= at(2023, 3), card: (s) => fl(s, "babaInkar") ? sys({
      banner: "DEPREM SONRASI", title: "Babanın Binası",
      speaker: sp("Nurten Hanım", "ege", "AS", "Bina ayakta ama ağır hasarlı. Kimse ölmedi, Allah'a şükür. Ama evimiz yok artık. Size yıllar önce söylemiştik.", "👩‍🦳"),
      text: "Depremde babanın binası ağır hasar aldı. Sakinler çadırda. Firmanın adı tabelada hâlâ duruyor.",
      ders: "Deprem sonrası hasar tespiti sonrasında ağır hasarlı binalar yıkılır. Hak sahipleri yerinde dönüşüm ve kira yardımı haklarını araştırmalıdır.",
      choices: [
        { label: "Binayı maliyetine yeniden yap", fx: "n-3 i+4 v+10 m-2", result: "Geç kaldın ama geldin. Nurten Hanım bu kez kapıyı açık bıraktı." },
        { label: "Sessiz kal", fx: "i-6 v-6 m+3", result: "Tabeladaki soyadın her haberde görünüyor." },
      ] }) : sys({
      banner: "DEPREM SONRASI", title: "Babanın Binası Ayakta",
      speaker: sp("Nurten Hanım", "ege", "AS", "Deprem gecesi bina sallandı ama bir sıva bile düşmedi. O güçlendirme bizi kurtardı. Babanız da sizinle gurur duyardı.", "👩‍🦳"),
      text: "Güçlendirdiğin eski bina depremi hasarsız atlattı. Mahallede senin firmanın adı artık 'sağlam' demek.",
      ders: "Deprem öncesi güçlendirme, can kaybını önlemenin en etkili yoludur. Bina sakinleri güçlendirme projesinin yapı denetim onaylı olduğunu kontrol etmelidir.",
      choices: [
        { label: "Mahalledeki eski binalara da ücretsiz ön inceleme yap", fx: "n-0.8 i+10 v+6", result: "Kapında kuyruk var. Bu kez korkudan değil, güvenden." },
        { label: "Teşekkür et, işine dön", fx: "i+5", result: "Tabeladaki soyadın hiç bu kadar parlak durmamıştı." },
      ] }) },
  ] },

  // ---------- Torpilli damat: kayınpeder ----------
  { id: "kayinpeder", ad: "Kayınpeder", steps: [
    { when: (s) => s.baslangic === "damat" && s.t >= 5, card: () => sys({
      banner: "AİLE", title: "Kayınpederin İyiliği",
      speaker: sp("kayınpeder Zeki Bey", "ankara", "Kamu", "Abe damat, parkın olduğu o arsaya imar çıkaracağız. Sen yaparsın, kızım da rahat eder. Kimse bir şey demez, ben oradayım.", "🎩"),
      text: "Kayınpederin belediye meclisinde. Mahalle parkının imarını konuta çevirip işi sana vermek istiyor.",
      ders: "Kamuya ait yeşil alanların imar değişikliğiyle yapılaşmaya açılması, mahkemelerce sıkça iptal edilir; alıcılar yıllarca belirsizlik yaşar. İmar planı değişikliklerine vatandaşlar askı süresi içinde itiraz edebilir.",
      choices: [
        { label: "Teşekkür et, 'parka dokunmam' de", fx: "v+6 F:damatRed", result: "Zeki Bey kaşlarını kaldırdı. Akşam yemeği biraz sessiz geçti." },
        { label: "Kabul et, parka site yap", fx: "n+3 v-10 r+4 m+2 F:damatPark", result: "Ağaçlar kesildi. Mahalle sakinleri itiraz dilekçesi topluyor." },
        { label: "Park yerine boş bir arsa iste", fx: "n+1 v-2 F:damatArsa", result: "Zeki Bey 'akıllısın' dedi. Yine de bir iyilik borcun oldu." },
      ] }) },
    { when: (s) => s.baslangic === "damat" && (fl(s, "damatPark") || fl(s, "damatArsa") || fl(s, "damatRed")), card: (s) => fl(s, "damatRed") ? sys({
      banner: "AİLE", title: "Kendi Ayağının Üstünde",
      speaker: sp("eşin Elif", "ankara", "Aile", "Babam kızgın ama ben seninle gurur duyuyorum. Herkes 'damat' diyordu; artık firmanın adıyla anılıyorsun.", "💍"),
      text: "Kayınpederin iyiliğini reddettiğinden beri kapılar eskisi kadar kolay açılmıyor. Ama arsa sahipleri artık 'kimin damadı' diye değil, 'hangi binaları yaptı' diye soruyor.",
      ders: "Torpille alınan işler, torpili verenin gücü bittiğinde sorun olur. Kalıcı güven, teslim edilen sağlam binalarla kazanılır.",
      choices: [
        { label: "Devam et", fx: "i+6 v+4", result: "Kayınpederin bir akşam sessizce 'aferin' dedi." },
      ] }) : sys({
      banner: "SEÇİM", title: "Kayınpeder Seçimi Kaybetti",
      speaker: sp("muhabir Pınar", "istanbul", "Basın", "Yeni belediye yönetimi eski imar kararlarını tek tek inceliyor. Park alanına yapılan sitenin ruhsatı da incelemede!", "🎤"),
      text: "Kayınpederin seçimi kaybetti. Yeni yönetim eski imar değişikliklerini inceliyor. Arkandaki kalkan kalktı.",
      ders: "Siyasi ilişkilerle alınan imar kararları yönetim değiştiğinde yeniden incelenir; mahkemeler iptal ederse alıcılar tapularıyla birlikte belirsizliğe düşer.",
      choices: [
        { label: "Alıcılara açık ol, olası iptale karşı güvence ver", fx: "n-2 r-4 v+6 i+2", result: "Alıcılar kızgın ama kandırılmadıklarını biliyor." },
        { label: "Yeni yönetimle de 'anlaş' 🎲", fx: "n-1 v-6", act: { type: "gamble", p: 0.4, win: "r-3", lose: "r+18 i-8", winText: "Yeni yönetim de seninle iş yapmayı seçti. Kapı hep aynı kapı.", loseText: "Yeni başkan teklifini basına açıkladı." }, result: "" },
        { label: "Her şeyi kayınpederin üstüne at", fx: "r+2 v-8 i-4", result: "Evde soğuk rüzgârlar esiyor. Dosya ise ikinizi birlikte anıyor." },
      ] }) },
  ] },
];
