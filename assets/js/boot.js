/* mark JS available + failsafe so content can never stay hidden */
document.documentElement.classList.add('js');
window.__revealTimer = setTimeout(function () { document.documentElement.classList.add('reveal-all'); }, 2600);
/* small (960px) versions of project pictures live in .../sm/ — used for cards and lists.
   If one is missing (e.g. a project just added), the full picture is used instead. */
window.WABI_SM = function (src) { return String(src || '').replace(/(assets\/img\/projects\/[^\/]+\/)([^\/]+\.jpg)$/, '$1sm/$2'); };
document.addEventListener('error', function (e) {
  var t = e.target;
  if (t && t.tagName === 'IMG' && /\/sm\//.test(t.src) && !t.dataset.full) { t.dataset.full = 1; t.src = t.src.replace('/sm/', '/'); }
}, true);
