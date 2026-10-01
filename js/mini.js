// MİNİ OYUNLAR — 10-30 saniyelik etkileşimli anlar. run(oyun, bağlam) → Promise<{score 0..1, extraFx?}>
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
import { yuzKoy } from './yuz.js';
let sfx = () => {};
let timers = [];
const every = (ms, f) => { const id = setInterval(f, ms); timers.push(id); return id; };
const later = (ms, f) => { const id = setTimeout(f, ms); timers.push(id); return id; };
const stopAll = () => { timers.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers = []; };

export function init(o) { sfx = o.sfx || sfx; }

export function run(game, ctx = {}) {
  const G = GAMES[game];
  if (!G) return Promise.resolve({ score: 0.5 });
  return new Promise((resolve) => {
    const box = $('mini');
    box.classList.remove('hidden');
    box.innerHTML = `<div class="mini-card"><div class="mini-head"><span class="mini-tag">⏱ MİNİ OYUN</span><h3>${esc(G.title)}</h3><p>${esc(G.how)}</p></div><div class="mini-body" id="miniBody"></div><div class="mini-foot" id="miniFoot"></div></div>`;
    let done = false;
    const finish = (score, extra = {}) => {
      if (done) return; done = true; stopAll();
      score = clamp(score, 0, 1);
      sfx(score >= 0.75 ? 'goal' : score >= 0.4 ? 'coin' : 'bad');
      const verdict = score >= 0.75 ? ['Harika!', 'ok'] : score >= 0.4 ? ['Fena değil', 'mid'] : ['Olmadı…', 'bad'];
      $('miniFoot').innerHTML = `<div class="mini-score ${verdict[1]}"><b>${verdict[0]}</b><span>Puan: ${Math.round(score * 100)}/100</span>${extra.note ? `<small>${esc(extra.note)}</small>` : ''}</div>`;
      later(1300, () => { box.classList.add('hidden'); box.innerHTML = ''; resolve({ score, extraFx: extra.fx }); });
    };
    G.start($('miniBody'), ctx, finish);
  });
}

// Zaman çubuğu
function timerBar(el, sec, onEnd, label = '') {
  el.insertAdjacentHTML('afterbegin', `<div class="mini-time"><i></i><span>${label}</span></div>`);
  const bar = el.querySelector('.mini-time i');
  const t0 = performance.now();
  every(100, () => {
    const f = (performance.now() - t0) / (sec * 1000);
    bar.style.width = `${Math.max(0, 100 - f * 100)}%`;
    bar.style.background = f > 0.75 ? '#e5484d' : f > 0.5 ? '#f4a20d' : '#46a758';
    if (f >= 1) onEnd();
  });
}

const GAMES = {
  // 1) Beton: su/çimento oranını şartnamede tut; şoför gizlice su katıyor
  beton: {
    title: 'Beton Dökümü: Su/Çimento Oranı',
    how: 'Kaydırıcıyla oranı 0,40–0,50 arasında tut. Şoför arada gizlice su katacak; düzelt ve doğru anda "DÖK!" de.',
    start(el, ctx, finish) {
      let w = 0.62;
      el.innerHTML = `
        <div class="beton">
          <div class="mixer"><span id="bMix">🚛</span><div class="drum" id="bDrum"></div></div>
          <div class="bubble-s" id="bSay">Şoför: "Abi biraz su katayım mı, kolay aksın?"</div>
          <label class="ratio">Su / çimento: <b id="bVal"></b></label>
          <input type="range" id="bSl" min="30" max="85" value="${w * 100}" step="1">
          <div class="zone"><i style="left:${(40 - 30) / 55 * 100}%;width:${10 / 55 * 100}%"><small>şartname</small></i></div>
          <div class="gauges">
            <div><small>💪 Dayanım</small><div class="g"><i id="bStr"></i></div></div>
            <div><small>🌊 Akışkanlık</small><div class="g"><i id="bFlow"></i></div></div>
          </div>
          <button class="primary big" id="bGo">DÖK! 🏗️</button>
        </div>`;
      const sl = $('bSl');
      const upd = () => {
        w = sl.value / 100;
        $('bVal').textContent = w.toFixed(2).replace('.', ',');
        const str = clamp(1.25 - (w - 0.3) * 2.2, 0.05, 1), flow = clamp((w - 0.28) * 2, 0.05, 1);
        $('bStr').style.width = `${str * 100}%`; $('bStr').style.background = str > 0.6 ? '#46a758' : str > 0.4 ? '#f4a20d' : '#e5484d';
        $('bFlow').style.width = `${flow * 100}%`;
        $('bSay').textContent = w < 0.38 ? 'Usta: "Uşağum bu beton pompadan geçmez, taş gibi!"' : w > 0.55 ? 'Usta: "Çorba gibi oldi, kolonun içinde ne kalacak?"' : 'Usta: "Hah, kıvamı bu. Vibratörü hazırlayun!"';
      };
      sl.oninput = upd; upd();
      // Şoför sinsice su katar
      every(1600, () => {
        if (Math.random() < 0.65) {
          sl.value = Math.min(85, +sl.value + 3 + Math.floor(Math.random() * 5)); upd();
          $('bMix').classList.remove('shake'); void $('bMix').offsetWidth; $('bMix').classList.add('shake');
          $('bSay').textContent = 'Şoför gizlice hortumu açtı! 💦';
          sfx('click');
        }
      });
      const score = () => { const d = w < 0.4 ? 0.4 - w : w > 0.5 ? w - 0.5 : 0; return clamp(1 - d * 7, 0, 1); };
      $('bGo').onclick = () => finish(score(), { note: w > 0.5 ? 'Fazla su dayanımı düşürdü.' : w < 0.4 ? 'Beton çok kuru; boşluklu döküm riski.' : 'Şartnameye uygun döküm.' });
      timerBar(el, 15, () => finish(score() * 0.9, { note: 'Süre doldu, beton kendiliğinden döküldü.' }), 'mikser bekliyor');
    },
  },

  // 2) Denetim: tehlikeleri müfettiş gelmeden düzelt
  temizlik: {
    title: 'Müfettiş Gelmeden Toparla',
    how: 'Tehlikeli durumlara (🟥 kırmızı çerçeveli) dokun ve düzelt. Sağlam şeylere dokunma, zaman kaybettirir.',
    start(el, ctx, finish) {
      const H = [['🧑‍🔧', 'Baretsiz işçi', '👷'], ['🕳️', 'Korkuluksuz boşluk', '🚧'], ['🔌', 'Açık kablo', '🔒'], ['🧗', 'Kemersiz iskele', '🦺'], ['🔥', 'Yangın tüpü yok', '🧯'], ['🚬', 'Malzeme yanında sigara', '🚭'], ['🪜', 'Kırık merdiven', '🪜']];
      const OK = ['🧱', '🪵', '👷', '🏗️', '🚜', '🪣'];
      const N = 12;
      el.innerHTML = `<div class="site"><div class="car-track"><span id="tCar">🚗</span><span>🏗️</span></div><div class="grid" id="tGrid"></div><div class="hint" id="tHint">Düzeltilen: 0</div></div>`;
      const grid = $('tGrid');
      const cells = [];
      for (let i = 0; i < N; i++) { const b = document.createElement('button'); b.className = 'cell'; b.textContent = OK[i % OK.length]; grid.appendChild(b); cells.push({ b, h: null }); }
      let spawned = 0, fixed = 0, penalty = 0;
      const spawn = () => {
        const free = cells.filter((c) => !c.h);
        if (!free.length) return;
        const c = free[Math.floor(Math.random() * free.length)];
        const h = H[Math.floor(Math.random() * H.length)];
        c.h = h; spawned++;
        c.b.textContent = h[0]; c.b.title = h[1]; c.b.classList.add('haz');
      };
      cells.forEach((c) => (c.b.onclick = () => {
        if (c.h) {
          fixed++; c.b.textContent = c.h[2]; c.b.classList.remove('haz'); c.b.classList.add('fixed'); sfx('click');
          const h = c.h; c.h = null; $('tHint').textContent = `Düzeltilen: ${fixed} · son: ${h[1]} ✔`;
          later(900, () => { c.b.classList.remove('fixed'); c.b.textContent = OK[Math.floor(Math.random() * OK.length)]; });
        } else { penalty++; c.b.classList.add('wrong'); later(300, () => c.b.classList.remove('wrong')); }
      }));
      for (let i = 0; i < 3; i++) spawn();
      every(900, () => { if (Math.random() < 0.8) spawn(); });
      const t0 = performance.now();
      every(100, () => { $('tCar').style.left = `${clamp((performance.now() - t0) / 16000, 0, 1) * 85}%`; });
      const end = () => {
        const left = cells.filter((c) => c.h).length;
        finish(clamp(fixed / Math.max(1, spawned) - penalty * 0.03, 0, 1), { note: left ? `Müfettiş ${left} eksik gördü.` : 'Şantiye tertemiz göründü.' });
      };
      timerBar(el, 16, end, 'müfettiş yaklaşıyor');
    },
  },

  // 3) Pazarlık: karşı teklif ver, arsa sahibinin sabrını tüketme
  pazarlik: {
    title: 'Kat Karşılığı Pazarlığı',
    how: 'Arsa sahibine verilecek daire payını teklif et. Çok düşük teklif sabrını tüketir. 3 turun var.',
    start(el, ctx, finish) {
      const ask0 = ctx.ask || 54;
      let ask = ask0, tur = 0, sabir = 100;
      const res = ask0 - 6 - Math.floor(Math.random() * 6); // gizli razı olma sınırı
      const nm0 = ctx.name || 'Arsa sahibi', nm = nm0.charAt(0).toLocaleUpperCase('tr-TR') + nm0.slice(1);
      const say = {
        karadeniz: ['Ula bu ne teklif!', 'Hade biraz daha yaklaş.', 'Tamam uşağum, olsun!'],
        dogu: ['Bıra bu olmaz!', 'Biraz daha, kardeşim.', 'Tamam, anlaştık wallah.'],
        ege: ['Gari bu ne böyle!', 'Biraz daha gel bakalım.', 'Tamam gari, olsun!'],
        adana: ['Gardaş dalga mı geçiyon!', 'Biraz daha gel ağam.', 'Tamam, yaz ağam!'],
        ic: ['Oğlum sen beni ne sandın?', 'Bir daha düşün bakıyım.', 'Eyi, olsun bakalım.'],
        ankara: ['Abe olmaz öyle şey!', 'Biraz daha, abe.', 'Tamam abe, hayırlısı.'],
        istanbul: ['Abicim ciddi olamazsın.', 'Biraz daha yaklaş abi.', 'Tamamdır abi, el sıkışalım.'],
        antep: ['Len bu ne pazarlık!', 'Biraz daha gel len.', 'Tamam len, hayırlı olsun!'],
        gurbetci: ['Abi nein, olmaz!', 'Biraz daha, bitte.', 'Tamam abi, gut!'],
      }[ctx.dia] || ['Olmaz!', 'Biraz daha.', 'Tamam!'];
      el.innerHTML = `<div class="pz">
        <div class="pz-man"><span id="pYuz" class="avatar">🧓</span><div><b>${esc(nm)}</b><div class="bubble-s" id="pSay">"Yüzde ${ask} isterim."</div></div></div>
        <div class="pz-row"><small>Onun istediği</small><b id="pAsk">%${ask}</b><small>Sabrı</small><div class="g"><i id="pPat" style="width:100%"></i></div></div>
        <label class="ratio">Senin teklifin: <b id="pVal"></b></label>
        <input type="range" id="pSl" min="30" max="${ask0}" value="${ask0 - 6}">
        <div class="pz-btns"><button class="primary" id="pOffer">Teklif ver</button><button id="pAccept">Onun istediğini kabul et</button></div>
        <div class="pz-log" id="pLog"></div></div>`;
      const kisi = { name: nm, role: 'AS', emoji: '🧓', dia: ctx.dia, quote: 'Yüzde isterim' };
      yuzKoy($('pYuz'), kisi, 'konus');
      const yz = (f) => { if ($('pYuz').classList.contains('yuz')) yuzKoy($('pYuz'), kisi, f); };
      const sl = $('pSl'); const upd = () => ($('pVal').textContent = `%${sl.value}`); sl.oninput = upd; upd();
      const scoreFor = (deal) => clamp((ask0 - deal) / (ask0 - res + 2), 0, 1) * 0.85 + 0.15;
      $('pAccept').onclick = () => finish(scoreFor(ask) * 0.9, { note: `%${ask} ile anlaştınız.` });
      $('pOffer').onclick = () => {
        const o = +sl.value; tur++;
        const log = (t) => $('pLog').insertAdjacentHTML('afterbegin', `<div>${t}</div>`);
        if (o >= res) { yz('mutlu'); $('pSay').textContent = `"${say[2]}"`; log(`Tur ${tur}: %${o} → kabul`); later(400, () => finish(scoreFor(o), { note: `%${o} ile anlaştınız (onun sınırı %${res} idi).` })); return; }
        const gap = res - o;
        sabir -= gap * 7 + 10;
        $('pPat').style.width = `${Math.max(0, sabir)}%`;
        $('pPat').style.background = sabir > 50 ? '#46a758' : sabir > 25 ? '#f4a20d' : '#e5484d';
        if (sabir <= 0) { yz('kizgin'); $('pSay').textContent = '"Kalk git! Başka müteahhit mi yok?"'; log(`Tur ${tur}: %${o} → masadan kalktı`); later(500, () => finish(0.05, { note: 'Arsa sahibi pazarlığı bıraktı.' })); return; }
        ask = Math.max(res, Math.round((ask + o) / 2 + 1));
        $('pAsk').textContent = `%${ask}`;
        yz(gap > 5 ? 'kizgin' : 'konus');
        $('pSay').textContent = `"${say[gap > 5 ? 0 : 1]} Yüzde ${ask} olur."`;
        log(`Tur ${tur}: %${o} → karşı teklif %${ask}`);
        sfx('click');
        if (tur >= 3) { later(600, () => finish(scoreFor(ask) * 0.85, { note: `Son teklifi %${ask}; mecburen kabul ettin.` })); }
      };
      timerBar(el, 30, () => finish(scoreFor(ask) * 0.8, { note: 'Uzun düşündün; son teklifi kabul ettin.' }), 'çay soğuyor');
    },
  },

  // 4) Tapu: doğru evrakları sıran gelmeden topla
  tapu: {
    title: 'Tapu Müdürlüğü: Evrak Sırası',
    how: 'Tapu satışı için gereken 5 evrakı dosyaya ekle. Yanlış evrak memuru kızdırır. Sıran gelmeden bitir!',
    start(el, ctx, finish) {
      const DOC = [['🪪', 'Kimlik', 1], ['📷', 'Son 6 ayın fotoğrafı', 1], ['🏠', 'Geçerli DASK poliçesi', 1], ['🏛️', 'Emlak vergisi değer yazısı', 1], ['💳', 'Harç dekontu', 1],
        ['📄', 'Süresi geçmiş DASK', 0], ['✍️', 'Boş imzalı kâğıt', 0], ['🧾', 'Market fişi', 0], ['✉️', '"Sıra atlatan" zarf', 2], ['📃', 'Kira kontratı', 0]];
      const docs = DOC.slice().sort(() => Math.random() - 0.5);
      let got = 0, wrong = 0, sira = 12;
      el.innerHTML = `<div class="tp"><div class="tp-q"><div><small>Ekrandaki numara</small><b id="tNow">A-0${49}</b></div><div><small>Senin numaran</small><b>A-061</b></div></div>
        <div class="tp-desk" id="tDesk"></div><div class="tp-folder" id="tFold">📁 Dosya: <b id="tGot">0</b>/5</div><div class="bubble-s" id="tSay">Memur: "Evraklar tam mı? Eksik varsa sıranız yanar."</div></div>`;
      docs.forEach(([ic, ad, ok]) => {
        const b = document.createElement('button'); b.className = 'doc'; b.innerHTML = `<span>${ic}</span><small>${esc(ad)}</small>`;
        b.onclick = () => {
          if (b.disabled) return;
          if (ok === 2) { b.disabled = true; $('tSay').textContent = 'Takipçi: "Tamam abi, seni hemen içeri alıyorum…" (Bu rüşvet.)'; later(700, () => finish(0.7, { fx: 'v-4 r+3', note: 'Zarfla sıra atladın. Bunun da bir kaydı var.' })); return; }
          if (ok === 1) { got++; b.disabled = true; b.classList.add('got'); $('tGot').textContent = got; sfx('click'); if (got >= 5) finish(clamp(1 - wrong * 0.12 - Math.max(0, 6 - sira) * 0.03, 0.4, 1), { note: 'Evrak tam, işlem tamam.' }); }
          else { wrong++; b.disabled = true; b.classList.add('bad'); $('tSay').textContent = `Memur: "${ad} mı? Bu olmaz, doğru evrakı getirin."`; sfx('bad'); sira = Math.max(0, sira - 2); }
        };
        $('tDesk').appendChild(b);
      });
      every(1500, () => { sira--; $('tNow').textContent = `A-0${61 - Math.max(0, sira)}`; if (sira <= 0) finish(clamp(got / 5 - wrong * 0.1, 0, 1) * 0.8, { note: `Sıran geldi; dosyada ${got}/5 evrak vardı.` }); });
      timerBar(el, 18, () => {}, 'sıra ilerliyor');
    },
  },

  // 5) Havalimanı: nabzını sakin tut, soruları düzgün cevapla
  havalimani: {
    title: 'Pasaport Kontrolü',
    how: '"Derin nefes" düğmesiyle nabzını yeşil bölgede tut. Polis soru sorarsa sakin bir cevap seç.',
    start(el, ctx, finish) {
      let bpm = 95, inZone = 0, ticks = 0, answered = 0, bad = 0;
      el.innerHTML = `<div class="hv"><div class="hv-line" id="hLine">🧍🧍🧍<b>🧍‍♂️</b>🧍 → 👮</div>
        <div class="hv-bpm"><small>Nabız</small><b id="hBpm">95</b><div class="g"><i id="hBar"></i><em></em></div></div>
        <div class="bubble-s" id="hSay">Sıra ilerliyor…</div><div class="hv-q" id="hQ"></div>
        <button class="primary big" id="hBreath">😮‍💨 Derin nefes</button></div>`;
      const draw = () => {
        $('hBpm').textContent = Math.round(bpm);
        const f = clamp((bpm - 50) / 110, 0, 1);
        $('hBar').style.width = `${f * 100}%`;
        $('hBar').style.background = bpm < 80 ? '#3e8ed0' : bpm <= 105 ? '#46a758' : bpm < 130 ? '#f4a20d' : '#e5484d';
      };
      $('hBreath').onclick = () => { bpm -= 7; draw(); };
      const EVT = ['Köpek yanından geçti 🐕', 'Anons: "Sayın yolcu, lütfen danışmaya…" 📢', 'Polis sana baktı 👀', 'Telefonun titredi: avukatın arıyor 📱', 'Arkandaki yolcu seni tanıdı mı? 🤨'];
      const Q = [
        ['"Nereye gidiyorsunuz?"', ['Kısa bir iş seyahati, pazartesi dönüyorum.', 'NEDEN SORDUNUZ?!', 'Şey… bilmem, belki bir yere…'], 0],
        ['"Bu kadar bagaj neden?"', ['Numune malzemeler, fuara götürüyorum.', 'Size ne!', 'Bagajda bir şey yok, yemin ederim!'], 0],
        ['"Hakkınızda bir şey var mı bilginiz?"', ['Bildiğim kadarıyla yok memur bey.', 'Avukatımı arayacağım!', 'Kim söyledi?!'], 0],
      ].sort(() => Math.random() - 0.5);
      every(200, () => {
        bpm += 1.1 + Math.random() * 1.4; ticks++;
        if (bpm >= 80 && bpm <= 105) inZone++;
        if (bpm < 60) bpm = 60;
        draw();
      });
      every(2600, () => { if (Math.random() < 0.7) { bpm += 10 + Math.random() * 10; $('hSay').textContent = EVT[Math.floor(Math.random() * EVT.length)]; } });
      const ask = (k) => {
        const [q, opts, right] = Q[k];
        $('hQ').innerHTML = `<b>👮 ${q}</b>` + opts.map((o, i) => `<button data-i="${i}">${esc(o)}</button>`).join('');
        $('hQ').querySelectorAll('button').forEach((b) => (b.onclick = () => { answered++; if (+b.dataset.i !== right) { bad++; bpm += 20; } else bpm -= 5; $('hQ').innerHTML = ''; draw(); }));
      };
      later(4500, () => ask(0));
      later(10000, () => ask(1));
      let step = 0;
      every(1500, () => { step++; const q = '🧍'.repeat(Math.max(0, 4 - step)); $('hLine').innerHTML = `${q}<b>🧍‍♂️</b> → 👮`; });
      timerBar(el, 15, () => finish(clamp(inZone / Math.max(1, ticks) * 1.15 - bad * 0.2 - (2 - answered) * 0.1, 0, 1), { note: bad ? 'Cevapların polisin dikkatini çekti.' : 'Soğukkanlı göründün.' }), 'sıra ilerliyor');
    },
  },
};
