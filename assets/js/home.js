/* ============================================================
   WABI Architects — Homepage interactions (self-contained)
   Vanilla JS · no dependencies · respects reduced-motion
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- PRELOADER ---------- */
  (function () {
    var pl = document.getElementById('preloader');
    if (!pl) return;
    if (reduce) { pl.remove(); startHero(); return; }
    var fill = pl.querySelector('.pl-fill');
    var num = pl.querySelector('.pl-num');
    var p = 0;
    var t = setInterval(function () {
      p += Math.random() * 14 + 4;
      if (p >= 100) { p = 100; clearInterval(t); finish(); }
      if (fill) fill.style.right = (100 - p) + '%';
      if (num) num.textContent = String(Math.floor(p)).padStart(3, '0');
    }, 90);
    function finish() {
      setTimeout(function () {
        pl.classList.add('done');
        startHero();
        setTimeout(function () { if (pl.parentNode) pl.remove(); }, 1100);
      }, 260);
    }
    // safety: never let the preloader trap the page
    setTimeout(function () { if (pl.parentNode) { pl.classList.add('done'); startHero(); } }, 4000);
  })();

  function startHero() {
    var hero = document.querySelector('.hero');
    if (hero) requestAnimationFrame(function () { hero.classList.add('reveal-in'); });
  }
  if (!document.getElementById('preloader')) startHero();

  /* ---------- CUSTOM CURSOR ---------- */
  (function () {
    if (!fine) return;
    var cur = document.getElementById('cursor');
    if (!cur) return;
    var x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; });
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    var grow = 'a,button,.wi-row,.work-media,.btn,.burger,input,textarea';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(grow)) cur.classList.add('grow');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(grow)) cur.classList.remove('grow');
    });
  })();

  /* ---------- HEADER scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  (function () {
    var burger = document.querySelector('.burger');
    var overlay = document.querySelector('.menu-overlay');
    if (!burger || !overlay) return;
    function toggle(force) {
      var open = force !== undefined ? force : !overlay.classList.contains('open');
      overlay.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.classList.toggle('no-scroll', open);
      burger.setAttribute('aria-expanded', String(open));
      if (window.__lenis) { open ? window.__lenis.stop() : window.__lenis.start(); }
    }
    burger.addEventListener('click', function () { toggle(); });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
  })();

  /* ---------- REVEAL on scroll (rect-based — reliable in every browser) ---------- */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal,.reveal-img'));
    /* JS is handling reveals now — cancel the head failsafe */
    if (window.__revealTimer) { clearTimeout(window.__revealTimer); window.__revealTimer = null; }
    if (reduce) { els.forEach(function (el) { el.classList.add('in'); }); return; }

    var ticking = false;
    function check() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var show = [];   // read every position first, then change classes (no layout thrashing)
      for (var i = els.length - 1; i >= 0; i--) {
        var r = els[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { show.push(els[i]); els.splice(i, 1); }
      }
      for (var k = 0; k < show.length; k++) show[k].classList.add('in');
      if (!els.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', check);
    check(); // reveal whatever is already in view
  })();

  /* ---------- Recent projects gallery: arrows, progress line, drag on desktop ---------- */
  (function () {
    var gal = document.querySelector('.gal'); if (!gal) return;
    var rail = gal.querySelector('.gal-rail'), bar = gal.querySelector('.gal-bar span');
    var btns = [].slice.call(document.querySelectorAll('.gal-btn'));
    var n = document.querySelector('[data-total="projects"]');
    if (n && window.WABI_PROJECTS) n.textContent = window.WABI_PROJECTS.length + ' projects · design & finishing';
    function step() { var c = rail.querySelector('.gal-card'); return c ? c.getBoundingClientRect().width + 20 : 300; }
    btns.forEach(function (b) { b.addEventListener('click', function () { rail.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' }); }); });
    var q = false;
    function sync() {
      q = false;
      var max = rail.scrollWidth - rail.clientWidth, x = rail.scrollLeft, vis = rail.clientWidth / rail.scrollWidth;
      if (bar) { bar.style.width = (vis * 100).toFixed(1) + '%'; bar.style.transform = 'translateX(' + (max > 0 ? x / max * (1 / vis - 1) * 100 : 0).toFixed(1) + '%)'; }
      if (btns[0]) btns[0].disabled = x < 4;
      if (btns[1]) btns[1].disabled = x > max - 4;
    }
    rail.addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(sync); } }, { passive: true });
    window.addEventListener('resize', sync); sync();
    if (fine) {   // click-and-drag with the mouse
      var down = false, sx = 0, sl = 0, moved = false;
      rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
      window.addEventListener('pointermove', function (e) { if (!down) return; var d = e.clientX - sx; if (Math.abs(d) > 5) moved = true; rail.scrollLeft = sl - d; });
      window.addEventListener('pointerup', function () { if (!down) return; down = false; rail.style.scrollSnapType = ''; });
      rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
      rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }
    var go = function () { gal.classList.add('in'); };
    if (!('IntersectionObserver' in window)) return go();
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { go(); io.disconnect(); } }, { threshold: .2 });
    io.observe(gal);
  })();

  /* ---------- atmosphere: stars + drawings that take over from the grid as you scroll ----------
     Every layer is a fixed, full-screen picture whose opacity follows how far down the page you
     are, so the work is only cross-fading (cheap on any phone). Pictures load after the page. */
  (function () {
    var root = document.createElement('div'); root.className = 'atmo'; root.setAttribute('aria-hidden', 'true');
    var defs = [   // [class, picture, fade in from, full from, full until, fade out by, max opacity]
      ['stars', 'stars-a.svg', -1, 0, 1, 2, .55],
      ['stars2', 'stars-b.svg', -1, 0, 1, 2, 1],
      ['d-a', 'plan-a.webp', .10, .22, .40, .52, .13],
      ['d-b', 'plan-b.webp', .46, .58, .70, .80, .13],
      ['d-s', 'section.webp', .72, .84, 1, 2, .14]
    ];
    var layers = defs.map(function (d) { var el = document.createElement('i'); el.className = d[0]; root.appendChild(el); return el; });
    document.body.insertBefore(root, document.body.firstChild);
    var base = 'assets/img/atmo/', loaded = false;
    function loadAll() {
      if (loaded) return; loaded = true;
      defs.forEach(function (d, k) { layers[k].style.backgroundImage = 'url(' + base + d[1] + ')'; });
    }
    if (document.readyState === 'complete') setTimeout(loadAll, 600); else window.addEventListener('load', function () { setTimeout(loadAll, 600); });
    var gridEl = document.documentElement, q = false, max = 1;
    function measure() { max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
    function amt(p, a, b, c, d) { return p < a || p > d ? 0 : p < b ? (p - a) / (b - a) : p <= c ? 1 : 1 - (p - c) / (d - c); }
    function paint() {
      q = false;
      var p = Math.min(1, window.pageYOffset / max);
      defs.forEach(function (d, k) {
        if (k < 2) return;
        var v = amt(p, d[2], d[3], d[4], d[5]);
        layers[k].style.opacity = (v * d[6]).toFixed(3);
        layers[k].style.transform = 'scale(' + (1.06 - v * .06).toFixed(3) + ') rotate(' + ((1 - v) * (k % 2 ? -2 : 2)).toFixed(2) + 'deg)';
      });
      gridEl.style.setProperty('--grid', Math.max(.2, 1 - p * 4).toFixed(3));   // the grid gives way to the drawings
    }
    window.addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', function () { measure(); paint(); });
    window.addEventListener('load', function () { measure(); paint(); });
    measure(); paint();
  })();

  /* ---------- word-by-word text (studio line) ---------- */
  (function () {
    [].forEach.call(document.querySelectorAll('.words'), function (el) {
      var i = 0;
      (function split(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'), inner = document.createElement('span');
              w.className = 'w'; inner.textContent = part; inner.style.setProperty('--i', i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) split(n);
        });
      })(el);
      var go = function () { el.classList.add('in'); setTimeout(function () { el.classList.add('lit'); }, i * 70 + 700); };
      if (!('IntersectionObserver' in window)) return go();
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { go(); io.disconnect(); } }, { threshold: .35 });
      io.observe(el);
    });
  })();

  /* ---------- HERO film: the city model goes from day to night as you scroll ----------
     Scroll down = forward, scroll up = back; it never plays on its own. 61 stills are
     decoded off the main thread (ImageBitmap) and drawn on a canvas, blending the two
     nearest frames, with an eased follow so the motion glides instead of stepping.
     Only frames near the current position are kept decoded, to spare memory on phones.
     Reduced-motion and data-saver visitors keep the daytime still. */
  (function () {
    var cv = document.querySelector('.hero-film'), hero = document.querySelector('.hero');
    if (!cv || !hero) return;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save || !cv.getContext) { cv.remove(); return; }
    var N = 61, set = (window.innerWidth / window.innerHeight < 0.8) ? 'p' : 'l';
    var base = 'assets/media/hero-seq/' + set + '/', ctx = cv.getContext('2d', { alpha: false });
    var raw = new Array(N), bmp = {}, pend = {}, canBmp = !!window.createImageBitmap;
    var target = 0, cur = 0, raf = 0, H = hero.offsetHeight, lastKey = -1, sized = false;
    cv.parentNode.classList.add('has-video');

    function pad(i) { return (i < 10 ? '0' : '') + i; }
    function load(i, done) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { raw[i] = im; if (!sized) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; sized = true; } if (done) done(); kick(); };
      im.onerror = function () { if (done) done(); };
      im.src = base + pad(i) + '.webp';
    }
    function want(i) {
      if (i < 0 || i >= N || !raw[i] || bmp[i] || pend[i]) return;
      if (!canBmp) { bmp[i] = raw[i]; return; }
      pend[i] = true;
      createImageBitmap(raw[i]).then(function (b) { pend[i] = false; bmp[i] = b; lastKey = -1; kick(); },
        function () { pend[i] = false; bmp[i] = raw[i]; });
    }
    function near(i) { for (var d = 0; d < N; d++) { if (bmp[i - d]) return i - d; if (bmp[i + d]) return i + d; } return -1; }
    function draw(f) {
      var c = Math.floor(f);
      for (var k = -3; k <= 6; k++) want(c + k);
      for (var key in bmp) if ((key < c - 8 || key > c + 10) && +key !== 0) { if (bmp[key].close) bmp[key].close(); delete bmp[key]; }
      var a = bmp[c] ? c : near(c); if (a < 0) return false;
      var t = (a === c && bmp[c + 1]) ? f - c : 0;
      var k2 = Math.round(f * 200); if (k2 === lastKey) return true; lastKey = k2;
      ctx.globalAlpha = 1; ctx.drawImage(bmp[a], 0, 0, cv.width, cv.height);
      if (t > .01) { ctx.globalAlpha = t; ctx.drawImage(bmp[c + 1], 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
      return true;
    }
    function tick() {
      raf = 0;
      var d = target - cur;
      cur = Math.abs(d) < .0004 ? target : cur + d * .12;   // eased follow: glides to the scroll position
      var ok = draw(cur * (N - 1));
      if (ok && !cv.classList.contains('on')) cv.classList.add('on');
      if (cur !== target) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function onScroll() {
      var y = window.pageYOffset; if (y > H * 1.4 && target === 1 && cur === 1) return;
      target = Math.min(1, Math.max(0, y / (H * (fine ? 1 : .7))));
      kick();
    }
    load(0, function () {
      onScroll(); cur = target; lastKey = -1; want(0);
      var i = 1, began = false;
      var rest = function () {                 // the other frames: once the visitor scrolls,
        if (began) return; began = true;       // or (desktop) a few seconds after the page has settled
        window.removeEventListener('scroll', rest);
        (function next() { for (var k = 0; k < 4 && i < N; k++, i++) load(i, k === 3 || i === N - 1 ? next : null); })();
      };
      window.addEventListener('scroll', rest, { passive: true });
      var idle = function () { setTimeout(rest, 2500); };
      if (fine) { if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle); }
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { H = hero.offsetHeight; });
  })();

  /* ---------- HERO depth ----------
     Scroll parallax is pure CSS (scroll-driven animations, see home.css) so it moves exactly
     with the scroll. Here: a gentle pointer drift on desktop (uses the separate `translate`
     property, so it never fights the scroll transforms), and a JS scroll fallback for
     desktop browsers without scroll-driven animations. Touch screens without support get a
     still hero rather than a laggy one. */
  (function () {
    var hero = document.querySelector('.hero') || document.querySelector('.page-hero');
    if (!hero || reduce) return;
    var media = hero.querySelector('.hero-media, .ph-media, .ph-split, .ph-tri');
    var lines = [].slice.call(hero.querySelectorAll('h1 .line'));
    var sky = hero.querySelector('.hero-sky');
    var cssScroll = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');

    if (fine) {   // pointer drift
      var px = 0, py = 0, tx = 0, ty = 0, raf = 0;
      var step = function () {
        tx += (px - tx) * .08; ty += (py - ty) * .08;
        if (media) media.style.translate = (-tx * 20).toFixed(1) + 'px ' + (-ty * 12).toFixed(1) + 'px';
        if (sky) sky.style.translate = (tx * 30).toFixed(1) + 'px 0';
        lines.forEach(function (l, i) { l.style.translate = (tx * (6 + i * 5)).toFixed(1) + 'px 0'; });
        raf = (Math.abs(px - tx) > .002 || Math.abs(py - ty) > .002) ? requestAnimationFrame(step) : 0;
      };
      hero.addEventListener('mousemove', function (e) {
        px = e.clientX / window.innerWidth - .5; py = e.clientY / window.innerHeight - .5;
        if (!raf) raf = requestAnimationFrame(step);
      });
      hero.addEventListener('mouseleave', function () { px = 0; py = 0; if (!raf) raf = requestAnimationFrame(step); });
    }

    if (cssScroll || !fine) return;   // compositor handles it, or a touch screen: done

    /* fallback (desktop Firefox / older Safari): same motion in JS, transforms only */
    var h1 = hero.querySelector('h1'), top = hero.querySelector('.hero-top, .ph-top');
    var sub = hero.querySelector('.hero-sub, .ph-sub'), frame = hero.querySelector('.hero-frame');
    var H = window.innerHeight, queued = false;
    function set(el, tr, op) { if (el) { el.style.transform = tr; el.style.opacity = op; } }
    function tick() {
      queued = false;
      var y = window.pageYOffset; if (y > H * 1.1) return;
      var p = Math.min(Math.max(y / H, 0), 1);
      if (media) media.style.transform = 'translate3d(0,' + (y * .42).toFixed(1) + 'px,0) scale(' + (1 + p * .14).toFixed(3) + ')';
      if (y < 2) { [h1, top, sub, frame, sky].concat(lines).forEach(function (el) { if (el) { el.style.transform = ''; el.style.opacity = ''; } }); return; }
      if (lines.length) lines.forEach(function (l, i) { set(l, 'translate3d(0,' + (-y * (.06 + i * .07)).toFixed(1) + 'px,0)', (1 - p).toFixed(3)); });
      else set(h1, 'translate3d(0,' + (-y * .06).toFixed(1) + 'px,0)', (1 - p).toFixed(3));
      set(top, 'translate3d(0,' + (-y * .33).toFixed(1) + 'px,0)', Math.max(0, 1 - p / .6).toFixed(3));
      set(sub, 'translate3d(0,' + (-y * .17).toFixed(1) + 'px,0)', Math.max(0, 1 - p / .65).toFixed(3));
      set(frame, 'scale(' + (1 + p * .06).toFixed(3) + ')', Math.max(0, 1 - p / .75).toFixed(3));
      set(sky, 'translate3d(0,' + (y * .2).toFixed(1) + 'px,0)', (1 - p).toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(tick); } }, { passive: true });
    window.addEventListener('resize', function () { H = window.innerHeight; });
    tick();
  })();

  /* ---------- COUNT-UP stats ---------- */
  (function () {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) {
        el.querySelector('.val').textContent = el.dataset.count;
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, val = el.querySelector('.val');
        var target = +el.dataset.count, cur = 0;
        var step = Math.max(1, Math.round(target / 46));
        var t = setInterval(function () {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(t); }
          val.textContent = cur;
        }, 30);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- WORKS INDEX hover preview ---------- */
  (function () {
    var rows = [].slice.call(document.querySelectorAll('.wi-row[data-img]'));
    var preview = document.querySelector('.wi-preview');
    if (!rows.length) return;
    /* phones / touch: no hover, so each row carries its own small picture */
    if (!fine || !preview) {
      rows.forEach(function (row) {
        if (row.querySelector('.wi-thumb')) return;
        var t = document.createElement('img');
        t.className = 'wi-thumb'; t.src = row.dataset.img; t.alt = ''; t.loading = 'lazy'; t.decoding = 'async';
        row.appendChild(t);
      });
      return;
    }
    /* desktop: picture follows the pointer, beside it (not on top of the title) */
    var img = preview.querySelector('img'), cache = {};
    function load(src) {
      if (!cache[src]) cache[src] = new Promise(function (ok) {
        var i = new Image(); i.decoding = 'async';
        i.onload = function () { ok(src); };
        i.onerror = function () { var n = src.indexOf('/xs/') > -1 ? src.replace('/xs/', '/sm/') : src.replace('/sm/', '/'); if (n === src) return ok(src); src = n; i.src = n; };
        i.src = src;
      });
      return cache[src];
    }
    if ('IntersectionObserver' in window) {   // fetch the pictures as the list comes into view
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { rows.forEach(function (r) { load(r.dataset.img); }); io.disconnect(); }
      }, { rootMargin: '600px 0px' });
      io.observe(rows[0].parentNode);
    }
    var tx = 0, ty = 0, px = 0, py = 0, on = false, raf = 0, cur = null, W = 320, H = 240;
    function place() {
      var x = px + 28, y = py - H / 2;
      if (x + W > window.innerWidth - 16) x = px - W - 28;          // flip to the left near the edge
      y = Math.max(76, Math.min(y, window.innerHeight - H - 16));
      preview.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
    }
    function loop() {
      px += (tx - px) * 0.2; py += (ty - py) * 0.2; place();
      raf = (on || Math.abs(tx - px) > .5 || Math.abs(ty - py) > .5) ? requestAnimationFrame(loop) : 0;
    }
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; if (on && !raf) raf = requestAnimationFrame(loop); }, { passive: true });
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!on) { px = tx; py = ty; }                              // appear where the pointer is
        var r = preview.getBoundingClientRect(); W = r.width || W; H = r.height || H;
        on = true; cur = row.dataset.img; place();
        preview.classList.add('show');
        if (img.getAttribute('src') !== cur) {
          preview.classList.add('loading'); img.style.opacity = 0;
          load(cur).then(function (src) {
            if (src !== cur || !on) return;
            img.onload = function () { img.style.opacity = 1; preview.classList.remove('loading'); };
            img.src = src; if (img.complete && img.naturalWidth) img.onload();
          });
        }
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener('mouseleave', function () { on = false; cur = null; preview.classList.remove('show'); });
    });
    window.addEventListener('scroll', function () { if (on) { on = false; cur = null; preview.classList.remove('show'); } }, { passive: true });
  })();

  /* ---------- CONTACT-independent: current year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- SCROLL PROGRESS BAR ---------- */
  (function () {
    var bar = document.getElementById('scrollProg');
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    var max = 0;
    function measure() { max = document.documentElement.scrollHeight - window.innerHeight; }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', measure); window.addEventListener('load', function () { measure(); update(); });
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
    measure(); update();
  })();

  /* ---------- DESIGN & FINISHING process line ---------- */
  (function () {
    var flow = document.getElementById('flow');
    if (!flow) return;
    var track = flow.querySelector('.flow-track');
    var line = flow.querySelector('.ft-line');
    var fill = flow.querySelector('.ft-fill');
    var steps = Array.prototype.slice.call(flow.querySelectorAll('.ft-step'));
    var imgs = Array.prototype.slice.call(flow.querySelectorAll('.flow-media img'));
    var capN = flow.querySelector('.fc-num'), capT = flow.querySelector('.fc-name');
    var last = steps.length - 1, current = -1;
    /* phones: a copy of each step's picture sits inside the step (the big picture is hidden there) */
    imgs.forEach(function (im) {
      var st = steps[+im.dataset.step]; if (!st || st.querySelector('.ft-img')) return;
      var t = document.createElement('img');
      t.className = 'ft-img' + (im.classList.contains('fit') ? ' fit' : ''); t.src = im.getAttribute('src');
      t.alt = im.alt; t.loading = 'lazy'; t.decoding = 'async'; st.appendChild(t);
    });
    var mq = window.matchMedia('(max-width:820px)');
    var stage = flow.querySelector('.flow-stage'), pin = flow.querySelector('.flow-pin');
    var pinTop = pin ? (parseFloat(getComputedStyle(pin).top) || 0) : 0, pinH = pin ? pin.offsetHeight : 0;
    window.addEventListener('resize', function () { if (pin) { pinTop = parseFloat(getComputedStyle(pin).top) || 0; pinH = pin.offsetHeight; } });

    function setActive(i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, k) {
        s.classList.toggle('on', k === i);
        s.classList.toggle('done', k < i);
      });
      imgs.forEach(function (im) { im.classList.toggle('on', +im.dataset.step === i); });
      if (capN) capN.textContent = ('0' + (i + 1)).slice(-2);
      if (capT) capT.textContent = steps[i].querySelector('.ft-t').textContent;
    }
    function setFill(p) {
      p = Math.max(0, Math.min(1, p));
      if (mq.matches) { fill.style.width = ''; fill.style.height = (p * 100) + '%'; }
      else { fill.style.height = ''; fill.style.width = (p * 100) + '%'; }
    }
    function dotCenterY(s) {
      var r = s.querySelector('.ft-dot').getBoundingClientRect();
      return r.top + r.height / 2;
    }
    function update() {
      var vh = window.innerHeight, p;
      if (mq.matches) {
        var y0 = dotCenterY(steps[0]), y1 = dotCenterY(steps[last]);
        var tTop = track.getBoundingClientRect().top;
        line.style.top = (y0 - tTop) + 'px'; line.style.height = (y1 - y0) + 'px'; line.style.bottom = 'auto';
        var trig = vh * 0.6;
        p = (trig - y0) / Math.max(1, (y1 - y0));
      } else {
        if (line.style.top) { line.style.top = ''; line.style.height = ''; line.style.bottom = ''; }
        var r = stage.getBoundingClientRect();
        var topOff = pinTop;
        var total = r.height - pinH;
        p = (topOff - r.top) / Math.max(1, total);
      }
      p = Math.max(0, Math.min(1, p));
      setFill(p);
      setActive(Math.min(last, Math.max(0, Math.floor(p * last + 0.05))));
    }

    if (reduce) {               // no scroll-driven motion: full line, tap to switch
      setFill(1); setActive(0);
    } else {
      var ticking = false, near = true;
      if ('IntersectionObserver' in window) {   // only track the scroll while the section is near the screen
        new IntersectionObserver(function (e) { near = e[0].isIntersecting; if (near) update(); },
          { rootMargin: '200px 0px' }).observe(flow);
      }
      window.addEventListener('scroll', function () {
        if (near && !ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }
      }, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      update();
    }
    steps.forEach(function (s, k) {
      s.querySelector('button').addEventListener('click', function () {
        setActive(k); setFill(k / last);
      });
    });
  })();

  /* ---------- MAGNETIC BUTTONS (fine pointer, motion ok) ---------- */
  (function () {
    if (reduce || !fine) return;
    var mags = document.querySelectorAll('.btn, .nav .cta');
    mags.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (mx * 0.22) + 'px,' + (my * 0.3) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();
})();
