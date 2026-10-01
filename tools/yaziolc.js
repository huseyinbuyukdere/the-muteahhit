// Tarayıcı konsolunda: ekranda şu an görünen yazının harf sayısını ölçer (en kalabalık bölümleri de listeler).
// Kullanım: const m = await import('/tools/yaziolc.js'); m.olc()
export function olc() {
  const W = innerWidth, H = innerHeight, bolum = new Map();
  let top = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const b = r.getBoundingClientRect();
    if (!b.width || !b.height || b.bottom < 0 || b.top > H || b.right < 0 || b.left > W) continue;
    if (el.closest('.hidden,[hidden]')) continue;
    top += t.length;
    const kok = el.closest('[id]'); const k = kok ? kok.id : el.tagName;
    bolum.set(k, (bolum.get(k) || 0) + t.length);
  }
  return { toplam: top, en: [...bolum].sort((a, b) => b[1] - a[1]).slice(0, 8) };
}
