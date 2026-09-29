// Sahnede tıklanan işçinin, mağdurun ve muhabirin ağzından kısa sözler. Duruma ve şiveye göre değişir.
import { dialectFor } from './dialect.js';

const ADLAR = {
  karadeniz: ["Temel Usta", "Cemal Kalfa", "Hasan Usta"], dogu: ["Bawer Usta", "Mehmet Kalfa", "Şiyar"], ege: ["Mustafa Usta", "Halil Kalfa", "Ege'li Rıza"],
  adana: ["Kadir Usta", "Mahmut Kalfa", "Bebe Ali"], ic: ["Veli Usta", "Durmuş Kalfa", "Osman"], ankara: ["Hüseyin Usta", "Abdullah Kalfa", "Sami"],
  istanbul: ["Tayfun Usta", "Erkan Kalfa", "Selim"], antep: ["Halil İbrahim Usta", "Mahmut Kalfa", "Cuma"], gurbetci: ["Hans Ali", "Kemal Usta", "Yılmaz"],
};

// [durum] → şive → sözler
const S = {
  maas: {
    karadeniz: "Uşağum üç aydur yevmiye yok. Fındık zamanı gelirse gideyrum, haberun olsun.",
    dogu: "Bıra, çocuklara ekmek götüremiyorum. Hakedişi ne zaman vereceksin?",
    ege: "Gari maaş yok, çay yok, simit yok. Naapıcaz biz?",
    adana: "Ağam iki aydır para görmedik, bu iş böyle yürümez gardaş!",
    ic: "Beyim, ev kirası birikti. Hiç olmazsa yarısını verseydin.",
    ankara: "Abe patron, maaş ne oldu? Evde hanım beni kapıdan sokmuyor.",
    istanbul: "Abi taşeron parayı almış, bize bir kuruş gelmedi. Kimden isteyelim?",
    antep: "Len patron, cebimde bir dürüm parası yok, ne iş bu?",
    gurbetci: "Abi Almanya'da maaş ayın birinde yatar, burda ne zaman yatar?",
  },
  baret: {
    karadeniz: "Baret mi? Başum ağrıyor diye çıkardum. Hem kimse takmayi.",
    dogu: "Lo, baret yok, emniyet kemeri yok. İskele sallanıyor, wallah korkuyorum.",
    ege: "Gari baret sıcakta kafayı pişiriyo. Kemer de yok zaten, naapalım.",
    adana: "Bebe bu iskeleye köpek çıkmaz, biz çıkıyoz. Baret de yok!",
    ic: "Beyim korkuluk yok, bir kayan olursa üç kattan aşağı. Söyleyeyim dedim.",
    ankara: "Abe baret dağıtmadılar ki takalım. Müfettiş gelince veriyorlar, sonra topluyorlar.",
    istanbul: "Abi sigortam yok, baretim yok. Bir şey olursa 'iş kazası değil düştü' diyecekler.",
    antep: "Len bu iskelede halay çekiyoruz resmen, baret yok kemer yok!",
    gurbetci: "Abi Almanya'da böyle çalışsak ertesi gün kapatırlar, burda normal!",
  },
  kalite: {
    karadeniz: "Uşağum demir az geliyi, etriyeyi seyrek bağlayun dediler. Ben de bağladum.",
    dogu: "Bıra, betona su kattılar. Bu kolon bir sarsıntıda ne yapar bilmiyorum.",
    ege: "Gari kalıp yamuk, 'sıva kapatır' diyolar. Kapatır ama tutmaz.",
    adana: "Ağam bu demir ince, bu çimento kuru. Bina değil bu, karton!",
    ic: "Beyim kum deniz kumu gibi, tuzlu. Paslanır bu demirler.",
    ankara: "Abe patron bu etriyeler seyrek. Ben dediydim, kimse dinlemedi.",
    istanbul: "Abi şef 'hızlı olsun' dedi, vibratörü çalıştırmadık. Beton boşluklu.",
    antep: "Len bu kolon benim kolumdan ince, deprem olursa ne olacak?",
    gurbetci: "Abi bu betonu Almanya'da çöpe atarlar. Genau, çöpe!",
  },
  iyi: {
    karadeniz: "Ha böyle patron! Maaş vaktinde, baret kafada. Bu binaya torunumu koyarum.",
    dogu: "Wallah patron, ilk defa sigortalı çalışıyorum. Eline sağlık.",
    ege: "Gari bu betonu gönül rahatlığıyla döktük, çayı da demlendi.",
    adana: "Gardaş bu bina sağlam, ben üstüne yemin ederim!",
    ic: "Beyim işler yolunda. Demir tam, beton tam, hakediş tam.",
    ankara: "Abe patron böyle devam, ustalar senden memnun.",
    istanbul: "Abi temiz iş yapıyoruz, müfettiş gelse bile korkmayız.",
    antep: "Len patron, ağzına sağlık, maaş da vaktinde yattı!",
    gurbetci: "Abi Almanya kalitesi, sehr gut! Ciddiyim.",
  },
};

const DERS = {
  maas: "Taşeron işçisinin ödenmeyen ücretinden ana işveren de sorumludur. İşçiler ALO 170'i arayabilir, Çalışma ve Sosyal Güvenlik İl Müdürlüğüne şikâyette bulunabilir.",
  baret: "İnşaat, iş kazasında ölümlerin en çok yaşandığı sektörlerdendir; en sık sebep yüksekten düşmedir. Korkuluk, iskele ve emniyet kemeri her gün gerekir. Güvensiz şantiye ALO 170'e bildirilebilir.",
  kalite: "Kolonda eksik demir, seyrek etriye ve sulu beton depremde binanın çökmesine yol açabilir. Alıcılar beton test raporlarını ve yapı denetim raporunu istemelidir.",
  iyi: "Düzgün şantiye: sigortalı işçi, zamanında ödeme, yapı denetim gözetiminde döküm. Bunlar 'fazladan masraf' değil, binanın ve insanların güvencesidir.",
};

const pick = (a, n) => a[Math.abs(n) % a.length];

export function isciSozu(s, p, n, baret) {
  const dia = dialectFor(`isci${n}-${p.id}`, p.semt);
  const ad = pick(ADLAR[dia] || ADLAR.istanbul, n + p.id);
  let durum = 'iyi';
  if (!baret) durum = 'baret';
  else if (s.e < 40) durum = 'maas';
  else if (p.kalite < 50) durum = 'kalite';
  else if (n % 3 === 2 && s.e < 60) durum = 'maas';
  return { ad, dia, soz: S[durum][dia] || S[durum].istanbul, ders: DERS[durum], durum };
}

const MAGDUR = {
  cokme: ["Kızım o binadaydı. Beton raporunu kim imzaladı, onu istiyorum.", "Enkazdan paslı demir çıktı. Bunu herkes gördü.", "Bir daha kimse aynı acıyı yaşamasın diye buradayız."],
  tapu: ["Parayı peşin verdik, üç yıldır tapu yok. #TapumuVer diye bağırmaktan sesimiz kısıldı.", "Aynı daireyi iki kişiye satmışlar! Biz hangimiz ev sahibiyiz?", "Kredi çektik, taksit ödüyoruz; ev yok, tapu yok."],
  gecikme: ["Teslim tarihi geçeli aylar oldu. Hem kira hem kredi ödüyoruz.", "Maket çok güzeldi, şantiye bomboş.", "Sözleşmede gecikme cezası vardı, müteahhit telefonu açmıyor."],
};
const MAGDUR_DERS = {
  cokme: "Depremde yıkılan binalar için müteahhit, yapı denetim ve imza veren herkes yargılanabilir. Ev alırken yapı denetim raporu, zemin etüdü ve beton test sonuçlarını isteyin.",
  tapu: "Satış vaadi sözleşmesi noterde yapılmalı ve tapuya şerh ettirilmelidir. Şerh, aynı dairenin başkasına satılmasını engeller.",
  gecikme: "Gecikmede sözleşmedeki cezai şart ve kira kaybı talep edilebilir. Tüketici hakem heyeti ve tüketici mahkemesi yolları açıktır.",
};

export function magdurSozu(tema, seed) {
  return { soz: pick(MAGDUR[tema] || MAGDUR.gecikme, seed), ders: MAGDUR_DERS[tema] || MAGDUR_DERS.gecikme };
}
