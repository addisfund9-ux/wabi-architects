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

  /* ---------- HERO video: day-to-night city model, fades in over the still once it plays.
     Skipped for reduced motion and data-saver; paused when the hero is off screen. */
  (function () {
    var v = document.querySelector('.hero-video'); if (!v) return;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save) { v.removeAttribute('autoplay'); v.pause(); v.remove(); return; }
    v.parentNode.classList.add('has-video');
    var show = function () { v.classList.add('playing'); };
    v.addEventListener('playing', show); if (!v.paused && v.readyState > 2) show();
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause();
    }).observe(v);
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
        i.onload = i.onerror = function () { ok(src); }; i.src = src;
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
        load(cur).then(function (src) {
          if (src !== cur || !on) return;
          img.src = src; preview.classList.add('show');
        });
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
        var mediaBottom = flow.querySelector('.flow-media').getBoundingClientRect().bottom;
        var trig = Math.max(mediaBottom + 40, vh * 0.62);
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
