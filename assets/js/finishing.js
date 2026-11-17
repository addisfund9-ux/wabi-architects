/* =====================================================================
   WABI — Finishing page: skyline, counts and project list are built
   from assets/js/projects-data.js (every project whose work includes
   'finishing'). Add a finishing project there and it appears here.
   ===================================================================== */
(function () {
  var S = window.WABI.sketch, esc = S.esc;
  var T = (window.WABI_PROJECTS || []).filter(function (p) { return (p.work || []).indexOf('finishing') > -1; });
  if (!T.length) return;
  var SC = S.scale(T);
  var done = T.filter(function (p) { return /complete/i.test(p.status || ''); }).length;
  var tall = T.reduce(function (m, p) { return p.storeys && p.storeys.above > m ? p.storeys.above : m; }, 0);
  var low = T.reduce(function (m, p) { return p.storeys && p.storeys.above < m ? p.storeys.above : m; }, 99);
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function q(id) { return document.getElementById(id); }

  // counts in hero + stats
  document.querySelectorAll('[data-fin="count"]').forEach(function (e) { e.textContent = T.length; });
  document.querySelectorAll('[data-fin="range"]').forEach(function (e) { e.textContent = 'G+' + low + ' to G+' + tall; });
  if (q('finStats')) q('finStats').innerHTML =
    '<div><div class="n">' + T.length + '</div><div class="l">Projects</div></div>' +
    '<div><div class="n">' + done + '</div><div class="l">Completed &amp; handed over</div></div>' +
    '<div><div class="n">' + (T.length - done) + '</div><div class="l">In progress</div></div>' +
    '<div><div class="n">G+' + tall + '</div><div class="l">Tallest scope</div></div>';

  /* ---------- skyline: every project side by side, one scale ---------- */
  if (q('finSky')) {
    var colW = 96, gap = 34, base = 214, room = 196, bh = 7, bg = 2;
    var fp = room / Math.max(tall + 1.25, 1), parts = [];
    T.forEach(function (t, i) {
      var x = 20 + i * (colW + gap), s = S.levels(t), g = ['<g class="col" tabindex="0" role="link" data-target="' + t.id + '" aria-label="' + esc(t.title) + ' — jump to project">'];
      if (t.venue) {
        for (var r = 0; r < 3; r++) { var y = base - 8 - r * 13; g.push('<path class="arc" d="M' + x + ' ' + y + ' Q' + (x + colW / 2) + ' ' + (y - 30) + ' ' + (x + colW) + ' ' + y + '" opacity="' + (.5 + r * .2) + '"/>'); }
      } else if (t.storeys) {
        for (var f = 0; f < s.g + 1; f++) { var yy = base - (f + 1) * fp; g.push('<rect class="fl' + (t.highlight ? ' flag' : '') + '" x="' + x + '" y="' + yy.toFixed(1) + '" width="' + colW + '" height="' + Math.max(fp - 2, 1).toFixed(1) + '"/>'); }
        for (var b = 0; b < s.b; b++) g.push('<rect class="bs" x="' + x + '" y="' + (base + 3 + b * (bh + bg)) + '" width="' + colW + '" height="' + bh + '" opacity="' + (1 - b * .13).toFixed(2) + '"/>');
      }
      var ty = base + 5 * (bh + bg) + 30;
      g.push('<text class="nm" x="' + x + '" y="' + ty + '">' + esc(t.title.replace(' Amphitheater', '')) + '</text>');
      g.push('<text class="sp" x="' + x + '" y="' + (ty + 17) + '">' + (t.venue ? 'Public venue' : 'G+' + s.g + ' · B-' + s.b) + '</text>');
      var dn = /complete/i.test(t.status || '');
      g.push('<text class="st ' + (dn ? 'done' : 'prog') + '" x="' + x + '" y="' + (ty + 33) + '">' + (dn ? 'COMPLETED' : 'IN PROGRESS') + '</text></g>');
      parts.push(g.join(''));
    });
    var W = 20 + T.length * (colW + gap);
    q('finSky').innerHTML = '<svg class="skyline" viewBox="0 0 ' + W + ' 330" role="img" aria-label="Elevation profile of every finishing project">' +
      '<line class="gr" x1="0" x2="' + W + '" y1="' + (base + 1) + '" y2="' + (base + 1) + '"/>' + parts.join('') + '</svg>';
    var hi = T.filter(function (t) { return t.highlight; })[0];
    if (q('finSkyHint')) q('finSkyHint').textContent = (hi ? 'Gold: ' + hi.title + ', our largest scope · ' : '') + 'shaded: basement levels';
  }

  /* ---------- project list ---------- */
  function media(t) {
    var both = (t.work || []).indexOf('design') > -1;
    var imgs = (t.images || []).slice(0, both ? 2 : 4);
    if (imgs.length) {
      return '<div class="t-photos' + (imgs.length === 2 ? ' n2' : '') + '">' + imgs.map(function (src, i) {
        var lab = both ? 'Design render' : ((t.captions && t.captions[i]) || 'Photo');
        return '<button type="button" data-src="' + src + '" data-cap="' + esc(lab) + '" aria-label="Open photo: ' + esc(t.title) + ' — ' + esc(lab) + '">' +
          '<img src="' + window.WABI_SM(src) + '" decoding="async" alt="' + esc(t.title) + ' — ' + esc(lab) + '" loading="lazy">' +
          '<span class="tag' + (/After|Finished/.test(lab) ? ' after' : '') + '">' + esc(lab) + '</span></button>';
      }).join('') + '</div>';
    }
    return elev(t, '');
  }
  /* the scale drawing with the key facts: on its own when there are no photos,
     inside the description when there are */
  function elev(t, cls) {
    var facts = t.venue ? '<div><dt>Type</dt><dd>Open-air venue</dd></div>' :
      '<div><dt>Floors above ground</dt><dd>' + S.levels(t).g + '</dd></div><div><dt>Basement levels</dt><dd>' + S.levels(t).b + '</dd></div>';
    facts += '<div><dt>Status</dt><dd>' + esc(t.status || '—') + '</dd></div>';
    var tags = ((t.finishing && t.finishing.tags) || t.scope || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    return '<div class="t-elev' + cls + '"><span class="ecap">Elevation · drawn to scale</span><div class="e-draw">' + S.elevation(t, cls ? {} : { shared: SC }) + '</div>' +
      '<div class="e-facts"><dl>' + facts + '</dl><p class="e-k">Our scope</p><ul>' + tags + '</ul></div></div>';
  }
  function tower(t, i) {
    var dn = /complete/i.test(t.status || ''), both = (t.work || []).indexOf('design') > -1, s = S.levels(t);
    var specs = [];
    if (both) specs.push('<span class="chip ds">Design + Finishing</span>');
    specs.push(t.venue ? '<span class="chip">Public venue</span>' : '<span class="chip">G+' + s.g + ' above ground</span><span class="chip">B-' + s.b + ' below</span>');
    if (t.highlight) specs.push('<span class="chip">Tallest scope</span>');
    var link = '<a class="t-link" href="projects.html#' + t.id + '">' + (both ? 'See the design' : 'Open in projects') + ' <span class="ar">→</span></a>';
    return '<article class="tower" id="' + t.id + '" data-status="' + (dn ? 'done' : 'prog') + '" style="--i:' + i + '">' +
      '<div><div class="t-top"><span class="t-num">' + pad(i + 1) + '</span><span class="t-type">' + esc(t.type || '') + '</span></div>' +
      '<h3>' + esc(t.title) + '</h3><p class="t-loc">' + esc(t.location || '') + '</p>' +
      '<div class="t-specs">' + (dn ? '<span class="chip done">Completed</span>' : '<span class="chip prog">In progress</span>') + specs.join('') + '</div>' +
      '<p class="scope">' + esc((t.finishing && t.finishing.scope) || t.description || '') + '</p>' +
      ((t.images || []).length && (t.storeys || t.venue) ? elev(t, ' in-desc') : '') + link + '</div>' +
      media(t) + '</article>';
  }
  var towers = q('finTowers'), bar = q('finFilter');
  if (towers) towers.innerHTML = T.map(tower).join('');
  if (bar) {
    bar.innerHTML = '<button class="active" data-filter="all">All <span>' + T.length + '</span></button>' +
      '<button data-filter="done">Completed <span>' + done + '</span></button>' +
      '<button data-filter="prog">In progress <span>' + (T.length - done) + '</span></button>';
  }
  var list = Array.prototype.slice.call(document.querySelectorAll('.tower'));
  function setFilter(f) {
    bar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.dataset.filter === f); });
    list.forEach(function (t) { t.classList.toggle('hidden', f !== 'all' && t.dataset.status !== f); });
  }
  if (bar) bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setFilter(b.dataset.filter); });

  function jump(id) {
    var t = document.getElementById(id); if (!t) return;
    if (t.classList.contains('hidden')) setFilter('all');
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    t.classList.add('flash'); setTimeout(function () { t.classList.remove('flash'); }, 1400);
  }
  document.querySelectorAll('.skyline .col').forEach(function (c) {
    c.addEventListener('click', function () { jump(c.dataset.target); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(c.dataset.target); } });
  });
  if (location.hash && document.getElementById(location.hash.slice(1))) setTimeout(function () { jump(location.hash.slice(1)); }, 300);

  /* ---------- photo viewer, scoped to one project ---------- */
  var lb = document.querySelector('.lightbox'); if (!lb) return;
  var img = lb.querySelector('img'), count = lb.querySelector('.lb-count'), items = [], idx = 0;
  function show(i) { idx = (i + items.length) % items.length; img.src = items[idx].src; img.alt = items[idx].alt; count.textContent = (idx + 1) + ' / ' + items.length + '  ·  ' + items[idx].cap; }
  function close() { lb.classList.remove('open'); document.body.classList.remove('no-scroll'); }
  document.querySelectorAll('.t-photos').forEach(function (g) {
    var btns = Array.prototype.slice.call(g.querySelectorAll('button'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        items = btns.map(function (x) { return { src: x.dataset.src, cap: x.dataset.cap, alt: x.querySelector('img').alt }; });
        lb.classList.toggle('single', items.length < 2); show(i);
        lb.classList.add('open'); document.body.classList.add('no-scroll'); lb.querySelector('.close').focus();
      });
    });
  });
  lb.querySelector('.close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  img.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(idx + 1); else if (e.key === 'ArrowLeft') show(idx - 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); });
})();
