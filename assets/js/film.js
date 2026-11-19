/* WABI hero film, kept apart from home.js so it can start as soon as it arrives
   (it is loaded async in <head>; boot.js has already requested the frames). */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  /* ---------- HERO film: the city model goes from day to night as you scroll ----------
     Scroll down = forward, scroll up = back; it never plays on its own.
     It only starts once a complete light set of frames is in, so it never jumps between
     whatever frames happen to have arrived; sharp frames replace the light ones as they land.
     Each draw blends the two neighbouring frames, with an eased follow, so it glides. */
  function start() {
    var cv = document.querySelector('.hero-film'), hero = document.querySelector('.hero');
    var F = window.__film;
    if (!cv || !hero) return;
    if (!F || reduce || !cv.getContext) { cv.remove(); return; }   // boot.js decided not to load it
    var N = F.hi.length, ctx = cv.getContext('2d', { alpha: false });
    var ready = function (im) { return im && im.complete && im.naturalWidth > 0; };
    var target = 0, cur = 0, raf = 0, H = hero.offsetHeight, live = false, lastKey = '';
    cv.parentNode.classList.add('has-video');

    function draw(f) {
      var c = Math.floor(f), t = f - c, A, B, k;
      if (ready(F.hi[c]) && (t < .02 || ready(F.hi[Math.min(N - 1, c + 1)]))) {      // sharp frames
        A = F.hi[c]; B = F.hi[Math.min(N - 1, c + 1)]; k = 'h' + c;
      } else {                                                                      // light set: every 2nd frame
        c = Math.min(N - 1, Math.floor(f / 2) * 2); t = (f - c) / 2;
        A = F.lo[c]; B = F.lo[Math.min(N - 1, c + 2)] || A; k = 'l' + c;
      }
      k += ':' + Math.round(t * 100); if (k === lastKey) return; lastKey = k;
      if (cv.width < 2) { cv.width = F.set === 'p' ? 640 : 1280; cv.height = Math.round(cv.width * A.naturalHeight / A.naturalWidth); }
      ctx.globalAlpha = 1; ctx.drawImage(A, 0, 0, cv.width, cv.height);
      if (t > .02 && B !== A) { ctx.globalAlpha = t; ctx.drawImage(B, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
    }
    function tick() {
      raf = 0;
      var d = target - cur;
      cur = Math.abs(d) < .0005 ? target : cur + d * .2;
      draw(cur * (N - 1));
      if (cur !== target) raf = requestAnimationFrame(tick);
    }
    function kick() { if (live && !raf) raf = requestAnimationFrame(tick); }
    function onScroll() {
      var y = window.pageYOffset;
      target = Math.min(1, Math.max(0, y / (H * (fine ? .55 : .42))));   // reaches night in about half a screen
      kick();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { H = hero.offsetHeight; });

    /* start once every light frame is in */
    var need = F.lo.filter(Boolean);
    var wait = need.filter(function (im) { return !ready(im); }).length;
    function go() {
      if (live) return;
      var bad = need.some(function (im) { return !ready(im); });
      if (bad) { cv.remove(); return; }          // something failed: keep the still picture
      live = true; onScroll(); cur = target; lastKey = ''; draw(cur * (N - 1));
      cv.classList.add('on');
    }
    need.forEach(function (im) {
      if (ready(im)) return;
      var done = function () { if (--wait === 0) go(); };
      im.addEventListener('load', done); im.addEventListener('error', done);
    });
    if (!wait) go();
    F.hi.forEach(function (im) { im.addEventListener('load', function () { lastKey = ''; kick(); }); });   // sharpen as they land
  }
  (function wait() {                      // the hero may not be parsed yet when this runs
    if (document.querySelector('.hero-film') && document.querySelector('.hero')) start();
    else if (document.readyState === 'loading') setTimeout(wait, 30);
  })();
})();
