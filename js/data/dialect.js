// Şiveler: her karakter semtine ve memleketine göre konuşur. Sevgiyle yazılmıştır; kimseyi küçümsemek amacı yoktur.
export const DIALECT_LABEL = {
  karadeniz: "Karadenizli", dogu: "Doğulu", ege: "Egeli", adana: "Adanalı", ic: "Orta Anadolulu",
  ankara: "Ankaralı", istanbul: "İstanbullu", antep: "Antepli", gurbetci: "Gurbetçi",
};

const SEMT_DIALECT = {
  Fikirtepe: ["istanbul", "karadeniz", "dogu", "ic"], Esenyurt: ["dogu", "karadeniz", "istanbul", "ic"],
  Kartal: ["istanbul", "karadeniz", "ic"], Ataşehir: ["istanbul", "karadeniz"], Beylikdüzü: ["istanbul", "karadeniz", "dogu"],
  Pendik: ["karadeniz", "istanbul", "ic"], Avcılar: ["istanbul", "dogu", "karadeniz"], Bağcılar: ["dogu", "karadeniz", "ic"],
  Sancaktepe: ["karadeniz", "dogu", "ic"], Çankaya: ["ankara"], Etimesgut: ["ankara", "ic"], Yenimahalle: ["ankara", "ic"],
  Keçiören: ["ankara", "ic"], Karşıyaka: ["ege"], Bornova: ["ege"], Buca: ["ege", "dogu"], Efeler: ["ege"], Merkezefendi: ["ege"],
  Nilüfer: ["istanbul", "karadeniz"], İzmit: ["istanbul", "karadeniz"], Kepez: ["adana"], Seyhan: ["adana"], Mezitli: ["adana"],
  Talas: ["ic"], Meram: ["ic"], Odunpazarı: ["ic"], Atakum: ["karadeniz"], Şahinbey: ["antep"],
};

// Rol başına 4 replik: AS arsa sahibi, YT yatırımcı, US usta, AL alıcı.
const Q = {
  karadeniz: {
    AS: ["Uşağum, bu arsa dedemden kaldi. Bana dört daire vermezsen gideyrum başka müteahhide, haberun olsun!",
      "Ha bu işi yapacaksan düzgün yap da, sonra peşuni bırakmam ha!",
      "Hemşerum, sözleşmeyi bi okuyayum da imzalarum. Acele eden denize düşer.",
      "Da ne diyorsun sen? Kat dediğun denize nazır olacak, yoksa olmaz!"],
    YT: ["Paramu sana veriyrum, bak! Kaybolursan Rize'nin her taşını kaldırup bulurum seni.",
      "Uşağum, faizi bırak da ben sana ortak olayum.",
      "Hamsi gibi sıkıştırma beni, parayı ne zaman geri alurum?",
      "Bu iş kazandırur mi kazandırmaz mi, onu söyle bana!"],
    US: ["Usta dediğun benum! Ama paramu cumadan önce vermezsen beton da dökülmez, bilesun.",
      "Ula bu demir az geldi bana, kim kısti bunu?",
      "Hakedişi bu hafta vermezsen gideyrum memlekete, fındık toplarum daha iyi.",
      "Patron, kalıbu ben kurarum ama iskele sağlam değil, söyleyeyum."],
    AL: ["Bütün birikimumuzu bu eve koyduk uşağum, bizi yakma!",
      "Deniz manzarası dedun, pencereden duvar görünüyor ha!",
      "Ev güzel da, tapuyu ne zaman alacağuz?",
      "Kiradan kurtulacağuz diye sevindik, sakın bizi mahkemelik etme."],
    good: ["Ha şöyle! Sen adam imişsun!", "Allah razı olsun uşağum, helal olsun!", "Sözünün eri çıktun, böylesi az bulunur.", "Da bu adam başka, bilesun!"],
    bad: ["Ula sen bizu kandirdun mi?!", "Allah'ından bulasun emi! Hakkumu helal etmeyrum!", "Senun gibisune güvenen kendune yazuk etsun!", "Bu iş burada bitmez, haberun olsun!"],
  },
  dogu: {
    AS: ["Bıra, bu toprak babamın babasından kalmış. Namusumuz gibidir, ona göre!",
      "Haval, sen bize söz ver. Biz sözden dönmeyiz, sen de dönme.",
      "Lo, bu vekaleti imzalarım amma gözüm üstünde olacak ha.",
      "Wallah bu evde doğdum, yıkılırken ağlarım. Bana güzel bir daire yap."],
    YT: ["Kekê, paramı sana emanet ediyorum. Emanete hıyanet olmaz!",
      "Wallah bu işte bir bit yeniği var ama sana güveniyorum bıra.",
      "Haval, kâr falan bir yana, paramı yakarsan bütün akraba duyar ha!",
      "Lo, bu parayı toplamak için yıllarca inşaatta çalıştım, bil bunu."],
    US: ["Usta, amele kardeşlerim üç aydır para almamış, wallah bu böyle gitmez!",
      "Bıra, betonu bu havada dökersen çatlar, benden söylemesi.",
      "Lo patron, sigorta yok, baret yok. Bir şey olursa kim bakacak çocuklarıma?",
      "Haval, paramı ver gideyim, memlekette düğün var."],
    AL: ["Bıra, çocuklarım artık kirada oturmasın diye bu evi alıyorum.",
      "Wallah bütün altınları bozdurduk, bu ev bizim her şeyimiz.",
      "Lo kardeş, daireyi gördük amma tapuyu görmedik!",
      "Anam babam da gelecek bu eve, sağlam olsun ha."],
    good: ["Wallah adamsın bıra, eline sağlık!", "Haval, sen bizdensin artık!", "Allah ne muradın varsa versin!", "Lo, böyle müteahhit görmedim, helal olsun."],
    bad: ["Wallah hakkımı helal etmem sana!", "Bıra, bu yaptığın yanına kalmaz!", "Lo, sen bizi sattın ha?!", "Çocuklarımın ahı tutsun seni!"],
  },
  ege: {
    AS: ["Aha da bizim arsa! Bütün mahallede böylesi yok gari!",
      "Naapıyon sen? Bu yüzdeye ebemi bile ikna edemezsin!",
      "Gözünü sevdiğim, sözleşmeye denize bakan daireyi yaz da içim rahat etsin.",
      "Ben emekliyim gız, bu evden başka bir şeyim yok, ona göre."],
    YT: ["Kuzum, param zeytin dalında yetişmiyor, dikkat et!",
      "Naapıcaz şimdi, param ne zaman katlanacak?",
      "Aha da bak, kâr gelmezse boyunun ölçüsünü alırsın gari.",
      "Ben bu işe gönlümü koydum, sen de koy."],
    US: ["Ustam naapıyon, harç bitti, kum bitti, para da bitti!",
      "Gari bu kalıbı böyle bırakamam, yamuk gidiyo.",
      "Patron bi çay koy da konuşalım, hakedişim nerde?",
      "Aha bu demir az, ben imzamı atmam buna."],
    AL: ["Gız bu evin balkonunda rakı içicez diye hayal ettik!",
      "Naapıyon, bu dairenin fayansı başka, gösterdiğin başka!",
      "Denize yakın dedin, yarım saat yürüyoz!",
      "Emekli ikramiyemin hepsi burda gari."],
    good: ["Aha, helal olsun sana!", "Gözünü sevdiğim, adam gibi adamsın!", "Ebemin yanında bile böyle dürüst görmedim!", "Hadi eyvallah, rakılar benden!"],
    bad: ["Naapıyon sen?! Utan gari!", "Gız, bu adam dolandırıcı çıktı!", "Aha da gidiyorum savcıya!", "Hakkımı yedin, boğazında kalsın!"],
  },
  adana: {
    AS: ["Bebe, bu arsa şehrin en güzel yeri, ucuza yok!",
      "Gardaş, bana dört daire ver, sana şalgam ısmarlayayım.",
      "Ne diyon sen? Yüzde kırk mı? Bi daha de de duyayım!",
      "Hee, anlaştık diyelim. Ama sözünden dönersen kebap da yok, dostluk da."],
    YT: ["Gardaş, parayı koyarım ama bana yarısını üç ayda getireceksin.",
      "Bebe, benim param cebimde durmaz, çalışacak!",
      "Ne diyon, faiz mi, ortaklık mı? Açık konuş.",
      "Hee, sana güveniyoruz, mahcup etme."],
    US: ["Bebe bu sıcakta kim çalışır, paramı ver de çalışayım!",
      "Gardaş, kalıpçılar birbirine girdi, gel ayır şunları.",
      "Ne diyon abi, betonu sulandır mı diyon?",
      "Hakediş yine mi yarın? Yarın hiç gelmiyo!"],
    AL: ["Gardaş, klima yeri var mı? Burada klimasız yaşanmaz.",
      "Bebe, bu ev bizim yuvamız olacak, sağlam yap.",
      "Ne diyon, tapuya düşük mü yazalım? Sonra başım yanmaz mı?",
      "Hee güzel ev ama asansör ne zaman gelecek?"],
    good: ["Helal olsun gardaş, kebaplar benden!", "Bebe sen adamsın!", "Hee, böyle olur işte!", "Anam babam sana dua etsin!"],
    bad: ["Ne diyon sen, bizi kazıkladın mı?!", "Bebe bunun hesabını verirsin!", "Gardaş dediğim adama bak!", "Yav sen ne biçim adamsın!"],
  },
  ic: {
    AS: ["Oğlum, gine mi pazarlık? Bize pazarlık öğretilmez!",
      "Hee, anladık da bize kaç daire düşecek onu söyle.",
      "Bu arsa atalarımızdan kaldı, kıymetini bilen gelsin.",
      "Gelecen mi imzaya yoksa gidecen mi, bir karar ver!"],
    YT: ["Parayı veririm ama faizine faiz isterim, ona göre.",
      "Ben bu paranın her kuruşunu dükkânda biriktirdim oğlum.",
      "Hee, ortak olalım ama defteri ben tutarım.",
      "Napcan bu parayla, bir anlat bakayım."],
    US: ["Usta dediğin gine ben, ama para yoksa iş de yok.",
      "Bu betonu kim karmış? Gine sulandırmışlar!",
      "Hee patron, işçiler aç, bir kazan yemek getir bari.",
      "Napcan, iskeleyi söktürecen mi yoksa ben mi sökeyim?"],
    AL: ["Oğlum, bu evi taksitle alıyoz, bizi mahkemelere düşürme.",
      "Hee güzel ama bu fiyata eskiden üç ev alınırdı.",
      "Gine mi gecikme? Kiraya ne verecez?",
      "Tapuyu elimize almadan bir kuruş daha vermem!"],
    good: ["Hee, işte adam dediğin böyle olur!", "Allah razı olsun, helal olsun!", "Gözümüzün önünde büyüdün, yüzümüzü kara çıkarmadın.", "Aferin oğlum, sağ ol."],
    bad: ["Gine mi kazık?! Bu yapılır mı?", "Hakkımı helal etmem!", "Senin gibisine güvenen utansın!", "Mahkemede görüşecez!"],
  },
  ankara: {
    AS: ["Abe ne diyon, burada arsa altın değerinde!",
      "Hacı, ben memurdum emekli oldum, bu arsa tek varlığım.",
      "Gardaşım, vekaleti veririm ama notere ben de gelecem.",
      "Napıyon, önce projeyi görek, sonra konuşak."],
    YT: ["Abe, bu para devletten değil, benim emeğim.",
      "Hacı, borsa mı senin apartman mı, karar veremedim.",
      "Gardaşım, bana her ay rapor getirecen.",
      "Ula bu iş batarsa bende ne olur?"],
    US: ["Abe hakediş nerde? Ayazda çalışıyoz burada!",
      "Hacı, müfettiş gelirse ben bu iskeleye imza atmam.",
      "Gardaşım, bu tuğla çürük, bunu kim aldı?",
      "Napıyon patron, işçileri sigortasız mı çalıştıracan?"],
    AL: ["Abe, çocuğun okulu yakın diye bu daireyi alıyoz.",
      "Hacı, kredi çektik, yirmi yıl ödeyecez, sağlam olsun.",
      "Gardaşım, kombiyi göster bakayım, markası ne?",
      "Ula bu duvardaki çatlaklar ne?"],
    good: ["Abe helal olsun sana!", "Gardaşım, sen adamsın!", "Hacı, sen bu işi biliyon!", "Şehrin en dürüst müteahhidi sensin abe!"],
    bad: ["Abe utanmıyon mu?!", "Hacı sen bizi dolandırdın!", "Gardaşım dediğim adama bak!", "Ula, bunun hesabını soracaz!"],
  },
  istanbul: {
    AS: ["Abi bak, burada metrekare uçtu, bana masal anlatma.",
      "Reis, önce kira yardımını konuşalım, sonra kat.",
      "Abicim, vekaleti avukatım okumadan imza yok, kusura bakma.",
      "Bu mahallede herkes birbirini tanır, ona göre."],
    YT: ["Abi, param borsada da dururdu, sana güvendim.",
      "Reis, bu iş kaç ayda döner, net söyle.",
      "Kardeşim, çek senet yok, nakit istiyorum.",
      "Abi bu iş olmazsa aramız bozulur, bil."],
    US: ["Abi, ekip sabaha kadar bekledi, hakediş yok!",
      "Reis, belediyeden adam geldi, 'bunu kim imzaladı' diyor.",
      "Abi, bu malzeme proje dışı, ben sorumluluk almam.",
      "Kardeşim, yarın gelmezsek iş durur, bilesin."],
    AL: ["Abi, iki çocukla kirada oturmaktan bıktık.",
      "Reis, bu metrekare net mi brüt mü?",
      "Abi, arkadaşım aynı daireyi aldığını söylüyor, bu ne iş?",
      "Kardeşim, deprem yönetmeliğine uygun mu, onu söyle."],
    good: ["Eyvallah abi, adamsın!", "Reis, helal olsun!", "Abi sen başkasın!", "Sözünün eri çıktın kardeşim!"],
    bad: ["Abi bu yaptığın ayıp!", "Reis, sen bizi yaktın!", "Kardeşim, görüşürüz mahkemede!", "Abi, bunun hesabını Allah'a verirsin!"],
  },
  antep: {
    AS: ["Gardaş, bu arsa şehrin göbeği, gadasını alım!",
      "Hele bir dur, bize kaç daire düşüyor onu söyle.",
      "Len, baklavasız sözleşme mi olur? Gel otur.",
      "Gardaş, benim babam da çok müteahhit gördü, kandırılmayız."],
    YT: ["Gardaş, paramı veriyorum ama fıstık gibi geri getireceksin.",
      "Hele bir hesap yap, kâr ne kadar?",
      "Len, bu para tezgâhtan geldi, alın teri.",
      "Gadasını alım, batırma bizi."],
    US: ["Gardaş, işçiler yevmiye istiyor, ne diyeyim?",
      "Len bu kalıp yamuk, kim kurdu bunu?",
      "Hele bir gel şantiyeye, gör ne haldeyiz.",
      "Ustan benim, ama para yoksa ben de yokum."],
    AL: ["Gardaş, düğün evi burası olacak, sağlam olsun.",
      "Hele bir göster, mutfak nerde?",
      "Len bu daire gösterdiğinden küçük!",
      "Gadasını alım, bizi mağdur etme."],
    good: ["Gadasını alım, helal olsun!", "Gardaş, sen bizim adamımızsın!", "Len, baklavalar benden!", "Hele şükür, dürüst adam varmış!"],
    bad: ["Len sen bizi kandırdın!", "Gardaş, bunun hesabını vereceksin!", "Hele bir bak şu yaptığına!", "Ahım tutsun seni!"],
  },
  gurbetci: {
    ALL: ["Abi, Almanya'da böyle işler olmaz, alles klar?",
      "Ich sage dir, bu para Mark zamanından beri birikti!",
      "Kardeşim, genau! Ama sözleşme lazım, Vertrag!",
      "Abi ben emekli olunca bu eve yerleşeceğim, sağlam yap bitte."],
    good: ["Super abi, sehr gut!", "Wunderbar, adam gibi adamsın!", "Danke kardeşim, helal olsun!", "Almanya'da bile böyle dürüst yok!"],
    bad: ["Scheiße! Böyle olmaz abi!", "Almanya'da seni hapse atarlar, weißt du?", "Ich glaube es nicht! Dolandırıldık!", "Abi, avukatım Frankfurt'tan geliyor!"],
  },
};

// Ek replikler: ustalar daha çok dert çıkarır, yatırımcılar parasının peşinde, alıcılar evinin.
const EK = {
  karadeniz: {
    US: ["Patron, üç aydur yevmiye yok! Ekip dağılayi, ben tutamayrum artuk!", "Ula bu betona su mi kattunuz? Ben bu kolona imza atmam!",
      "Akşama kadar para gelmezse vinci kilitlerum, anahtarı da cebume koyarum!", "Bak patron, demirciler kavga ettu, biri kafasını yardi. Ne yapacağuz?"],
    YT: ["Uşağum, paramu verdum, altı ay oldu, bir kuruş görmedum!", "Bana bak, parayi vermezsen kardeşlerumu toplar gelurum ha!"],
  },
  dogu: {
    US: ["Bıra, çocuklar aç, üç aydır para yok! Bu nasıl iş?", "Ağa, iskele sallanıyor, düşerse kim bakacak ailesine?",
      "Valla billa, bu hafta para gelmezse ekibi alıp gidiyorum!", "Bıra, demiri eksik getirmişler, kim imza atacak buna?"],
    YT: ["Bıra, paramı bana ver, yoksa aşiret seninle konuşur!", "Kurban olayım, bu para düğün parası, batırırsan yanarız!"],
  },
  ege: {
    US: ["Gari patron, iki aydır para yok, ekip kahvede oturuyo!", "Hee, betonu sen böyle dökersen ben karışmam gari!",
      "Napıyon patron? İskeleye korkuluk takmadan kimseyi yukarı çıkarmam!", "Hakediş yoksa yarın şantiye bomboş, haberin olsun!"],
    YT: ["Gari bu para zeytinlikten geldi, batırırsan yanarsın!", "Napıyon sen? Faiz dedin, bi kuruş görmedik daha!"],
  },
  adana: {
    US: ["Ağam, üç aydır para yok, çocuklar aç, ne diyeceğim ekibe?", "Bak bana, bu hafta para gelmezse şantiyeyi kilitlerim, ciğerini yakarım!",
      "Ağam bu iskele çürük, biri düşerse ben karışmam!", "Ula bu betonun rengi niye böyle, kim karıştırdı bunu?"],
    YT: ["Ağam, paramı ver, yoksa bizim oralarda işler başka çözülür!", "Bak bana, üç ay dedin, altı ay oldu!"],
  },
  ic: {
    US: ["Beyim, ekip iki aydır para almadı, köye dönecekler!", "Heç olmazsa yarısını ver de adamlar ekmek alsın!",
      "Beyim, iskeleden biri düşecek, ben demedi deme!", "Bu demirler projede yazanın yarısı, ben imzalamam!"],
    YT: ["Beyim, tarladan kalan parayıdı bu, batırma!", "Heç olmazsa faizini ver, anam hasta!"],
  },
  ankara: {
    US: ["Yav abi, iki aydır para yok, ekip isyan etti!", "Kardeşim bu betonu kim sipariş etti? Bu C20 bile değil!",
      "Yav bu iskele yönetmeliğe uymuyor, denetim gelirse kapatır!", "Abi para gelmezse cuma işi bırakıyoruz, net!"],
    YT: ["Yav kardeşim, param nerde? Her ay aynı hikâye!", "Abi ben emekli memurum, bu paranın başka yolu yok!"],
  },
  istanbul: {
    US: ["Abi, ekip üç aydır para almadı, sabah kapıyı tuttular!", "Reis, bu kolonu böyle bırakırsak, deprem olursa hepimiz içeri gireriz!",
      "Abi, vinççi alkollü geldi, ne yapayım?", "Kardeşim paramı vermezsen makineyi çıkarmam, bilesin!"],
    YT: ["Abi, param nerede? Bankadaki mevduat bile daha çok kazandırırdı!", "Reis, bu hafta param gelmezse avukatım arayacak."],
  },
  antep: {
    US: ["Gardaş, işçiler üç aydır yevmiye almadı, isyan var!", "Len bu beton sulu, kim karıştırdı?",
      "Hele bir gel, iskele çökecek gibi!", "Gardaş, para yoksa ben de yokum, gidiyorum!"],
    YT: ["Len paramı ver, baklava tezgâhını sattım bunun için!", "Gardaş, üç ay dedin, bak kaç ay oldu!"],
  },
};
for (const [d, roles] of Object.entries(EK)) for (const [r, lines] of Object.entries(roles)) Q[d][r] = [...lines, ...Q[d][r]];

const EMOJI = { AS: "🧓", YT: "💼", US: "👷", AL: "👨‍👩‍👧", ME: "🏛️", GZ: "🎤" };
const ROLE_LABEL = { AS: "Arsa sahibi", YT: "Yatırımcı", US: "Usta", AL: "Alıcı", ME: "Yetkili", GZ: "Basın" };

function hash(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

export function dialectFor(name, semt) {
  if (/Almanya|gurbetçi/i.test(name)) return "gurbetci";
  const list = SEMT_DIALECT[semt] || ["istanbul", "karadeniz", "ic"];
  return list[hash(name) % list.length];
}

function emojiFor(role, name) {
  if (role === "AS" && /Teyze|Hanım|Nine|Fatma|Hatice|Nazmiye|Müzeyyen|kız kardeş/.test(name)) return "👵";
  if (role === "AS" && /Kardeşler|ailesi|varisleri|çifti|kardeş/.test(name)) return "👨‍👩‍👦";
  return EMOJI[role];
}

// Kartın metnindeki yer tutuculara bakıp konuşan kişiyi seçer.
export function speakerFor(tpl, names, semt, seed, phase) {
  const txt = `${tpl.t} ${tpl.x}`;
  let role = ["AS", "YT", "US", "AL"].find((r) => txt.includes(`{${r}}`));
  if (!role) role = { arsa: "AS", yatirim: "YT", insaat: "US", satis: "AL", teslim: "AS" }[phase];
  if (!role) return null;
  const name = names[role];
  const dia = dialectFor(name, semt);
  const bank = Q[dia][role] || Q[dia].ALL;
  return { role, name, dia, label: DIALECT_LABEL[dia], roleLabel: ROLE_LABEL[role], emoji: emojiFor(role, name), quote: bank[seed % bank.length] };
}

export function reactionFor(sp, mood, seed) {
  if (!sp || !Q[sp.dia]) return null;
  const bank = Q[sp.dia][mood > 0 ? "good" : "bad"];
  return bank[seed % bank.length];
}

// Hikâye kartlarında kullanılan kısa yardımcı
export function sp(name, dia, role, quote, emoji) {
  return { role, name, dia, label: DIALECT_LABEL[dia] || "", roleLabel: ROLE_LABEL[role] || role, emoji: emoji || EMOJI[role] || "🗣️", quote };
}
