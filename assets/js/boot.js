/* mark JS available + failsafe so content can never stay hidden */
document.documentElement.classList.add('js');
window.__revealTimer = setTimeout(function () { document.documentElement.classList.add('reveal-all'); }, 2600);
/* home page: the hero film frames are requested first, before anything else on the page */
(function () {
  var n = +document.documentElement.getAttribute('data-film'); if (!n) return;
  var c = navigator.connection;
  if ((c && c.saveData) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var set = (window.innerWidth / window.innerHeight < 0.8) ? 'p' : 'l', imgs = [];
  for (var i = 0; i < n; i++) {
    var im = new Image(); im.decoding = 'async';
    if ('fetchPriority' in im) im.fetchPriority = i < 16 ? 'high' : 'auto';
    im.src = 'assets/media/hero-seq/' + set + '/' + (i < 10 ? '0' : '') + i + '.webp';
    imgs.push(im);
  }
  window.__film = { set: set, imgs: imgs };
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
