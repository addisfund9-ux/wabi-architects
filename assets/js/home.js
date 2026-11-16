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
      for (var i = els.length - 1; i >= 0; i--) {
        var r = els[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) { els[i].classList.add('in'); els.splice(i, 1); }
      }
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

  /* ---------- HERO depth: layered scroll + pointer parallax ----------
     background drifts slower than the page, each headline line rises at
     its own speed, the gold tower outline sits in between. Works on the
     homepage hero and on every inner page hero. */
  (function () {
    var hero = document.querySelector('.hero') || document.querySelector('.page-hero');
    if (!hero || reduce) return;
    var media = hero.querySelector('.hero-media, .ph-media, .ph-split, .ph-tri');
    var lines = [].slice.call(hero.querySelectorAll('h1 .line'));
    var h1 = hero.querySelector('h1'), top = hero.querySelector('.hero-top, .ph-top');
    var sub = hero.querySelector('.hero-sub, .ph-sub'), frame = hero.querySelector('.hero-frame');
    var sky = hero.querySelector('.hero-sky');
    var H = hero.offsetHeight, px = 0, py = 0, tx = 0, ty = 0, queued = false;
    function set(el, tr, op) { if (!el) return; el.style.transform = tr; if (op !== undefined) el.style.opacity = op; }
    function frameTick() {
      queued = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > H * 1.2) return;
      tx += (px - tx) * .08; ty += (py - ty) * .08;
      var p = Math.min(Math.max(y / H, 0), 1);
      set(media, 'translate3d(' + (-tx * 22).toFixed(1) + 'px,' + (y * .45 - ty * 14).toFixed(1) + 'px,0) scale(' + (1.05 + p * .1).toFixed(3) + ')');
      set(sky, 'translate3d(' + (tx * 34).toFixed(1) + 'px,' + (y * .2).toFixed(1) + 'px,0)', (0.9 - p * .9).toFixed(3));
      set(frame, 'scale(' + (1 + p * .07).toFixed(3) + ')', (1 - p * 1.4).toFixed(3));
      if (y > 2) {
        if (lines.length) lines.forEach(function (l, i) { l.style.transform = 'translate3d(' + (tx * (6 + i * 5)).toFixed(1) + 'px,' + (-y * (.06 + i * .07)).toFixed(1) + 'px,0)'; });
        else set(h1, 'translate3d(' + (tx * 8).toFixed(1) + 'px,' + (-y * .16).toFixed(1) + 'px,0)');
        if (h1) h1.style.opacity = (1 - p * 1.15).toFixed(3);
        set(top, 'translate3d(0,' + (-y * .32).toFixed(1) + 'px,0)', (1 - p * 1.9).toFixed(3));
        set(sub, 'translate3d(0,' + (-y * .16).toFixed(1) + 'px,0)', (1 - p * 1.7).toFixed(3));
      } else {
        lines.forEach(function (l) { l.style.transform = 'translate3d(' + (tx * 8).toFixed(1) + 'px,0,0)'; });
        [h1, top, sub].forEach(function (el) { if (el) { el.style.opacity = ''; if (!lines.length || el !== h1) el.style.transform = ''; } });
      }
      if (Math.abs(px - tx) > .002 || Math.abs(py - ty) > .002) queue();
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(frameTick); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', function () { H = hero.offsetHeight; queue(); });
    if (fine) {
      hero.addEventListener('mousemove', function (e) { px = e.clientX / window.innerWidth - .5; py = e.clientY / window.innerHeight - .5; queue(); });
      hero.addEventListener('mouseleave', function () { px = 0; py = 0; queue(); });
    }
    frameTick();
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
    if (!fine) return;
    var rows = document.querySelectorAll('.wi-row[data-img]');
    var preview = document.querySelector('.wi-preview');
    if (!rows.length || !preview) return;
    var img = preview.querySelector('img');
    var tx = 0, ty = 0, px = 0, py = 0, active = false;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      px += (tx - px) * 0.14; py += (ty - py) * 0.14;
      preview.style.left = px + 'px'; preview.style.top = py + 'px';
      requestAnimationFrame(loop);
    })();
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        img.src = row.dataset.img; preview.classList.add('show'); active = true;
      });
      row.addEventListener('mouseleave', function () {
        preview.classList.remove('show'); active = false;
      });
    });
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
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
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
        line.style.top = ''; line.style.height = ''; line.style.bottom = '';
        var stage = flow.querySelector('.flow-stage');
        var pin = flow.querySelector('.flow-pin');
        var r = stage.getBoundingClientRect();
        var topOff = parseFloat(getComputedStyle(pin).top) || 0;
        var total = r.height - pin.offsetHeight;
        p = (topOff - r.top) / Math.max(1, total);
      }
      p = Math.max(0, Math.min(1, p));
      setFill(p);
      setActive(Math.min(last, Math.max(0, Math.floor(p * last + 0.05))));
    }

    if (reduce) {               // no scroll-driven motion: full line, tap to switch
      setFill(1); setActive(0);
    } else {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }
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
