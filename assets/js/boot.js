/* mark JS available + failsafe so content can never stay hidden */
document.documentElement.classList.add('js');
window.__revealTimer = setTimeout(function () { document.documentElement.classList.add('reveal-all'); }, 2600);
/* home page: the hero film is requested first, before anything else on the page.
   A light preview set (every other frame, ~12 KB each) comes first so the whole film
   can play almost at once; the sharp frames follow and replace it as they arrive. */
(function () {
  var n = +document.documentElement.getAttribute('data-film'); if (!n) return;
  var c = navigator.connection;
  if ((c && c.saveData) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var set = (window.innerWidth / window.innerHeight < 0.8) ? 'p' : 'l', lo = [], hi = [], i;
  function get(dir, k, pr) {
    var im = new Image(); im.decoding = 'async';
    if (pr && 'fetchPriority' in im) im.fetchPriority = pr;
    im.src = 'assets/media/hero-seq/' + dir + '/' + (k < 10 ? '0' : '') + k + '.webp';
    return im;
  }
  var left = 0;
  function more() {                       // sharp frames only once the light set is in, so they don't compete
    if (--left > 0) return;
    for (var k = 0; k < n; k++) { hi[k].src = 'assets/media/hero-seq/' + set + '/' + (k < 10 ? '0' : '') + k + '.webp'; }
  }
  for (i = 0; i < n; i += 2) { left++; lo[i] = get(set + '-lo', i, 'high'); lo[i].onload = lo[i].onerror = more; }
  for (i = 0; i < n; i++) { hi[i] = new Image(); hi[i].decoding = 'async'; }
  window.__film = { set: set, lo: lo, hi: hi };
})();
/* small (960px) versions of project pictures live in .../sm/ — used for cards and lists.
   If one is missing (e.g. a project just added), the full picture is used instead. */
window.WABI_SM = function (src) { return String(src || '').replace(/(assets\/img\/projects\/[^\/]+\/)([^\/]+\.jpg)$/, '$1sm/$2'); };
/* extra-small (480px) versions for tiny previews and thumbnail strips */
window.WABI_XS = function (src) { return String(src || '').replace(/(assets\/img\/projects\/[^\/]+\/)([^\/]+\.jpg)$/, '$1xs/$2'); };
document.addEventListener('error', function (e) {
  var t = e.target; if (!t || t.tagName !== 'IMG') return;
  if (/\/xs\//.test(t.src)) t.src = t.src.replace('/xs/', '/sm/');          // xs missing -> small
  else if (/\/sm\//.test(t.src) && !t.dataset.full) { t.dataset.full = 1; t.src = t.src.replace('/sm/', '/'); }  // small missing -> full
}, true);
/* web fonts load alongside the page instead of holding it up (text shows at once, then swaps) */
(function () {
  var l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@200;300;400;500&display=swap';
  document.head.appendChild(l);
})();
