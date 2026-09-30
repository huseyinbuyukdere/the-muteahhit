// Yeni arsa kartı çeşitliliği: her teklif edilen arsanın bir özelliği (artısı + eksisi) ve karta gelen kişiler.
// fx yeni projeye uygulanır (h pay, s memnuniyet, k kalite, d gecikme, n nakit×ölçek).
import { sp } from './dialect.js';

export const ARSA_OZ = [
  { emoji: "📐", ad: "Köşe parsel", not: "iki cephe, alıcı sever; sahibi yüksek pay ister", fx: "h+5 n+0.4 i+1" },
  { emoji: "🧾", ad: "Hisseli tapu", not: "7 varis; pay düşük ama imza toplamak aylar sürer", fx: "h-4 s-12 d+2",
    ders: "Hisseli tapularda tüm hissedarların noterde imzası gerekir. Bir varisin imzası eksikse inşaat yarıda kalabilir. Arsa sahipleri de müteahhitler de sözleşmeden önce tapudaki tüm hisseleri ve şerhleri kontrol etmeli." },
  { emoji: "🪨", ad: "Sağlam zemin", not: "etüt temiz, kaya zemin; hafriyat pahalı", fx: "n-0.3 k+6",
    ders: "Zemin etüdü binanın temelidir: sağlam zeminde bile etüt yapılmadan proje çizilmemelidir. Alıcılar zemin etüt raporunu belediyedeki yapı dosyasından isteyebilir." },
  { emoji: "🏚️", ad: "Yarım kalmış bina", not: "eski müteahhit batmış; iş hızlı başlar, betonu şüpheli", fx: "d-1 k-10 s+8 h-3",
    ders: "Yarım kalmış bir binayı devralan müteahhit, mevcut kolonlardan karot alıp beton dayanımını ölçtürmelidir. Önceki müteahhidin borçları ve alıcılara verdiği sözler de dosyayla birlikte gelir; hepsi yazılı olarak devralınmalıdır." },
  { emoji: "🚇", ad: "Metroya yakın", not: "değerli; sahibi bunu biliyor", fx: "h+3 s+4 i+1" },
  { emoji: "🌊", ad: "Dere kenarı", not: "ucuz, ama taşkın riski var", fx: "h-6 k-5 r+2",
    ders: "Dere yataklarına ve taşkın alanlarına yapılan binalar sel riski taşır. Gerçek hayatta: ev alırken belediyeden imar durumunu ve Devlet Su İşleri'nin taşkın görüşünü sor; 'dereyi ıslah ettik' sözüne yazılı belge olmadan güvenme." },
  { emoji: "💸", ad: "Borçlu arsa sahibi", not: "acelesi var, düşük paya razı; ama sıkışmış birini sıkıştırıyorsun", fx: "h-8 s-8 v-3",
    ders: "Gerçek hayatta: borç sıkıntısındaki arsa sahipleri çoğu zaman piyasanın çok altında paya razı edilir. Arsa sahibiysen acele etme: bağımsız bir ekspertiz yaptır, birden fazla müteahhitten teklif al, sözleşmeyi noterde ve avukatla imzala." },
  { emoji: "📜", ad: "İmar planı askıda", not: "pay ucuz, ama ruhsat beklemesi uzun", fx: "h-5 d+3",
    ders: "İmar planı iptal davası süren arsalarda ruhsat aylarca, bazen yıllarca beklenebilir. Alıcılar ve arsa sahipleri, belediyeden güncel imar durum belgesi almadan kaparo vermemeli." },
  { emoji: "👵", ad: "Yaşlı çift", not: "size güvendiler; pay makul, beklentileri yüksek", fx: "h+2 s+10" },
  { emoji: "🏛️", ad: "Tarihi doku", not: "koruma kurulu onayı gerekir; bina saygınlık getirir", fx: "d+2 k+3 i+3" },
  { emoji: "🏫", ad: "Okul karşısı", not: "aileler ister; şantiye gürültüsüne şikâyet çok", fx: "s+3 r+1 i+1" },
];

// Zorunlu "yeni arsa" kartında konuşan kişiler (sırayla döner)
export const ARSA_KIM = [
  { t: "Yeni Bir Arsa Lazım", x: "Elinde yürüyen iş yok. Emlakçı Selim, dosyalarla dolu çantasıyla ofisine geldi.",
    sp: () => sp("Selim", "istanbul", "Emlakçı", "Abicim üç tane arsam var, üçü de kelepir. Ama her birinin bir 'ama'sı var, baştan söyleyeyim.", "🏷️") },
  { t: "Kahvede Bir Fısıltı", x: "Elinde yürüyen iş yok. Mahalle kahvesinde, okey masasından kalkan biri yanına oturdu.",
    sp: () => sp("Rüstem Efendi", "ic", "Kahveci", "Oğlum, bu mahallede kim arsa satacak ben bilirim. Çayını iç, anlatayım.", "☕") },
  { t: "Muhtarın Listesi", x: "Elinde yürüyen iş yok. Muhtarlıktan telefon geldi: birkaç aile 'güvenilir bir müteahhit' arıyormuş.",
    sp: () => sp("Hikmet Bey", "ankara", "Muhtar", "Yav kardeşim, bu insanlar bana güvenip soruyor. Sen de bana güveni boşa çıkarma.", "📋") },
  { t: "Eski Ustandan Haber", x: "Elinde yürüyen iş yok. Eski ustalarından biri akşam arayıp birkaç arsa saydı.",
    sp: () => sp("Kadir Usta", "karadeniz", "Usta", "Patron, boş duramayuz. Ekip dağılır. Şu arsalardan birine girelum da.", "👷") },
  { t: "Gazetede İlan", x: "Elinde yürüyen iş yok. Pazar gazetesinin ilan sayfasında 'kat karşılığı verilecek arsa' ilanlarını daire içine aldın.",
    sp: () => sp("Pazar gazetesi", "istanbul", "İlan", "“Sahibinden, kat karşılığı, acil. Aracı istemez.”", "📰") },
];
