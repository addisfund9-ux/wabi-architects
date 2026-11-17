/* =====================================================================
   WABI — Projects page
   Builds the register (cards / list) and the project view from
   assets/js/projects-data.js. Nothing to edit here to add a project.
   ===================================================================== */
(function () {
  var P = (window.WABI_PROJECTS || []).slice();
  var S = window.WABI.sketch, esc = S.esc;
  var grid = document.getElementById('regGrid');
  if (!grid || !P.length) return;

  var SC = S.scale(P);                                   // one scale for every mini sketch
  var CATS = ['Residential', 'Hospitality', 'Commercial', 'Mixed-use', 'Public'];
  var state = { work: 'all', cat: 'all', view: 'cards' };
  try { state.view = localStorage.getItem('wabi-view') || 'cards'; } catch (e) {}

  P.forEach(function (p, i) { p._n = i + 1; p._imgs = (p.images || []).slice(); p._dwg = (p.drawings || []).map(function (d) { return typeof d === 'string' ? { src: d, caption: 'Drawing' } : d; }); });

  function has(p, w) { return (p.work || []).indexOf(w) > -1; }
  function workLabel(p) { return has(p, 'design') && has(p, 'finishing') ? 'Design + Finishing' : has(p, 'finishing') ? 'Finishing' : 'Design'; }
  function cover(p) { return p.cover || p._imgs[0] || null; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function storeyText(p) {
    if (p.venue) return 'Open-air venue';
    if (!p.storeys) return 'Interior fit-out';
    return S.label(p);
  }
  function statusChip(p) {
    if (!p.status) return '';
    var done = /complete/i.test(p.status);
    return '<span class="pc-status ' + (done ? 'done' : 'prog') + '">' + esc(p.status) + '</span>';
  }
  function visible() {
    return P.filter(function (p) {
      return (state.work === 'all' || has(p, state.work)) && (state.cat === 'all' || p.category === state.cat);
    });
  }

  /* ---------- controls ---------- */
  var bar = document.getElementById('regBar');
  var cnt = function (w) { return P.filter(function (p) { return w === 'all' || has(p, w); }).length; };
  bar.innerHTML =
    '<div class="reg-filter" role="group" aria-label="Filter by work">' +
      [['all', 'All projects'], ['design', 'Design'], ['finishing', 'Finishing']].map(function (f) {
        return '<button type="button" data-work="' + f[0] + '" aria-pressed="' + (state.work === f[0]) + '">' + f[1] + ' <span>' + cnt(f[0]) + '</span></button>';
      }).join('') +
    '</div>' +
    '<label class="reg-type"><span>Type</span><select id="regType"><option value="all">All types</option>' +
      CATS.filter(function (c) { return P.some(function (p) { return p.category === c; }); }).map(function (c) { return '<option>' + c + '</option>'; }).join('') +
    '</select></label>' +
    '<div class="reg-view" role="group" aria-label="View">' +
      '<button type="button" data-view="cards" aria-pressed="' + (state.view === 'cards') + '"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg>Cards</button>' +
      '<button type="button" data-view="list" aria-pressed="' + (state.view === 'list') + '"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="2" width="14" height="2"/><rect x="1" y="7" width="14" height="2"/><rect x="1" y="12" width="14" height="2"/></svg>List</button>' +
    '</div>';
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.work) { state.work = b.dataset.work; bar.querySelectorAll('[data-work]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }
    if (b.dataset.view) {
      state.view = b.dataset.view; bar.querySelectorAll('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      try { localStorage.setItem('wabi-view', state.view); } catch (err) {}
    }
    render();
  });
  document.getElementById('regType').addEventListener('change', function (e) { state.cat = e.target.value; render(); });

  /* ---------- register ---------- */
  function card(p, i) {
    var c = cover(p), media;
    if (c) media = '<img src="' + window.WABI_SM(c) + '" decoding="async" alt="' + esc(p.title) + '" loading="lazy">';
    else media = '<div class="pc-sketch">' + S.elevation(p) + '</div>';
    var meta = [p.location, p.year].filter(Boolean).join(' · ');
    return '<a class="pc" href="#' + p.id + '" data-id="' + p.id + '" style="--i:' + i + '">' +
      '<div class="pc-media' + (c ? '' : ' is-sketch') + '">' + media +
        '<span class="pc-work">' + workLabel(p) + '</span>' + statusChip(p) + '</div>' +
      '<div class="pc-body">' +
        '<p class="pc-type"><span class="pc-num">' + pad(p._n) + '</span>' + esc(p.type || p.category || '') + '</p>' +
        '<h3>' + esc(p.title) + '</h3>' +
        (meta ? '<p class="pc-meta">' + esc(meta) + '</p>' : '') +
        '<div class="pc-foot"><span class="pc-mini">' + S.mini(p, SC) + '<span>' + storeyText(p) + '</span></span>' +
        '<span class="pc-open">Open <span class="ar">→</span></span></div>' +
      '</div></a>';
  }
  function row(p, i) {
    return '<a class="pr" href="#' + p.id + '" data-id="' + p.id + '" style="--i:' + i + '">' +
      '<span class="pr-num">' + pad(p._n) + '</span>' +
      '<span class="pr-mini">' + S.mini(p, SC) + '</span>' +
      '<span class="pr-title"><b>' + esc(p.title) + '</b><em>' + esc(p.type || '') + '</em></span>' +
      '<span class="pr-storeys">' + storeyText(p) + '</span>' +
      '<span class="pr-loc">' + esc(p.location || '—') + '</span>' +
      '<span class="pr-year">' + esc(p.year || '—') + '</span>' +
      '<span class="pr-work">' + workLabel(p) + (p.status ? '<small>' + esc(p.status) + '</small>' : '') + '</span>' +
      '<span class="pr-ar" aria-hidden="true">→</span></a>';
  }
  function render() {
    var list = visible();
    grid.className = 'reg-grid ' + (state.view === 'list' ? 'is-list' : 'is-cards');
    grid.innerHTML = !list.length ? '<p class="reg-empty">No projects match these filters.</p>' :
      state.view === 'list'
        ? '<div class="pr-head" aria-hidden="true"><span>No.</span><span></span><span>Project</span><span>Storeys</span><span>Location</span><span>Year</span><span>Work</span><span></span></div>' + list.map(row).join('')
        : list.map(card).join('');
    document.getElementById('regCount').textContent = 'Showing ' + list.length + ' of ' + P.length + ' projects';
  }
  render();

  /* ---------- stats ---------- */
  var st = document.getElementById('regStats');
  if (st) {
    var tall = P.reduce(function (m, p) { return p.storeys && p.storeys.above > (m.storeys ? m.storeys.above : 0) ? p : m; }, {});
    st.innerHTML =
      '<div><div class="n">' + P.length + '</div><div class="l">Projects</div></div>' +
      '<div><div class="n">' + cnt('design') + '</div><div class="l">Designed</div></div>' +
      '<div><div class="n">' + cnt('finishing') + '</div><div class="l">Finished on site</div></div>' +
      '<div><div class="n">G+' + (tall.storeys ? tall.storeys.above : 0) + '</div><div class="l">Tallest design</div></div>';
  }

  /* ---------- project view ---------- */
  var sheet = document.getElementById('psheet');
  var cur = -1, set = 'photos', idx = 0, lastFocus = null, order = P;

  function items() { return set === 'drawings' ? cur._dwg : cur._imgs.map(function (src, i) { return { src: src, caption: (cur.captions && cur.captions[i]) || '' }; }); }

  function fact(k, v, wide) { return v ? '<div' + (wide ? ' class="wide"' : '') + '><dt>' + k + '</dt><dd>' + v + '</dd></div>' : ''; }

  function build(p) {
    var s = p.storeys || {}, vis = order, pos = vis.indexOf(p);
    var facts =
      fact('Location', esc(p.location || ''), true) +
      fact('Client', esc(p.client || ''), (p.client || '').length > 22) +
      fact('Year', esc(p.date || p.year || '')) +
      (p.storeys ? fact('Above ground', 'G+' + (s.mezzanine ? 'M+' : '') + s.above) + fact('Basements', s.basements ? s.basements + ' levels' : 'None') : '') +
      fact('Site', esc(p.site || ''));
    var scope = (p.scope || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    var tabs = (p._imgs.length && p._dwg.length) ?
      '<div class="ps-tabs" role="tablist"><button role="tab" type="button" data-set="photos">Photos <span>' + p._imgs.length + '</span></button>' +
      '<button role="tab" type="button" data-set="drawings">Drawings <span>' + p._dwg.length + '</span></button></div>' : '';
    var hasMedia = p._imgs.length || p._dwg.length;
    var drawCap = p.venue ? 'Section · tiered seating' : (p.storeys ? 'Elevation · drawn to scale' : 'Interior · indicative plan');
    var fin = has(p, 'finishing') ? '<a class="t-link" href="finishing.html#' + p.id + '">See it on the Finishing page <span class="ar">→</span></a>' : '';

    sheet.innerHTML =
      '<div class="ps-backdrop" data-close></div>' +
      '<div class="ps-panel" role="document">' +
        '<header class="ps-head">' +
          '<span class="ps-count">' + pad(pos + 1) + ' <i>/</i> ' + pad(vis.length) + '</span>' +
          '<div class="ps-pn"><button type="button" class="ps-pp" aria-label="Previous project">← <span>Previous</span></button>' +
          '<button type="button" class="ps-np" aria-label="Next project"><span>Next</span> →</button></div>' +
          '<button type="button" class="ps-close" data-close aria-label="Close project">✕</button>' +
        '</header>' +
        '<div class="ps-body">' +
          '<div class="ps-gallery">' + tabs +
            (hasMedia ?
              '<figure class="ps-stage"><img alt=""><button type="button" class="ps-arrow ps-prev" aria-label="Previous picture">‹</button>' +
              '<button type="button" class="ps-arrow ps-next" aria-label="Next picture">›</button>' +
              '<button type="button" class="ps-full" aria-label="View full screen"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5"/></svg></button>' +
              '<figcaption><span class="ps-cap"></span><span class="ps-idx"></span></figcaption></figure>' +
              '<div class="ps-thumbs" role="list"></div>'
              : '<div class="ps-stage ps-stage-sketch">' + S.elevation(p) + '</div>') +
          '</div>' +
          '<aside class="ps-spec">' +
            '<div class="ps-chips"><span class="chip ds">' + workLabel(p) + '</span>' + (p.category ? '<span class="chip">' + esc(p.category) + '</span>' : '') + (p.status ? '<span class="chip ' + (/complete/i.test(p.status) ? 'done' : 'prog') + '">' + esc(p.status) + '</span>' : '') + '</div>' +
            '<h2 id="ps-title">' + esc(p.title) + '</h2>' +
            '<p class="ps-type">' + esc([p.type, p.location].filter(Boolean).join(' — ')) + '</p>' +
            (p.description ? '<p class="ps-desc">' + esc(p.description) + '</p>' : '') +
            '<div class="ps-draw"><span class="ecap">' + drawCap + '</span><div class="e-draw">' + S.elevation(p) + '</div>' +
              '<dl class="ps-facts">' + facts + '</dl></div>' +
            (scope ? '<p class="e-k">Scope</p><ul class="ps-scope">' + scope + '</ul>' : '') +
            '<div class="ps-cta"><a class="btn btn-solid" href="contact.html">Discuss a similar project <span class="ar">→</span></a>' + fin + '</div>' +
          '</aside>' +
        '</div>' +
      '</div>';

    set = p._imgs.length ? 'photos' : 'drawings'; idx = 0;
    if (hasMedia) { thumbs(); show(0); }
    sheet.querySelector('.ps-pp').disabled = vis.length < 2;
    sheet.querySelector('.ps-np').disabled = vis.length < 2;
  }

  function thumbs() {
    var list = items(), t = sheet.querySelector('.ps-thumbs');
    sheet.querySelectorAll('.ps-tabs [data-set]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.set === set); });
    t.innerHTML = list.map(function (it, i) {
      return '<button type="button" role="listitem" data-i="' + i + '" aria-label="Show picture ' + (i + 1) + (it.caption ? ': ' + esc(it.caption) : '') + '"><img src="' + window.WABI_SM(it.src) + '" decoding="async" alt="" loading="lazy"></button>';
    }).join('');
    t.style.display = list.length > 1 ? '' : 'none';
    sheet.querySelector('.ps-stage').classList.toggle('single', list.length < 2);
    sheet.querySelector('.ps-stage').classList.toggle('is-drawing', set === 'drawings');
  }

  function show(i) {
    var list = items(); if (!list.length) return;
    idx = (i + list.length) % list.length;
    var it = list[idx], img = sheet.querySelector('.ps-stage img');
    img.classList.remove('in');
    img.onload = function () { img.classList.add('in'); };
    img.src = it.src; img.alt = cur.title + (it.caption ? ' — ' + it.caption : '');
    if (img.complete) img.classList.add('in');
    sheet.querySelector('.ps-cap').textContent = it.caption || (set === 'drawings' ? 'Drawing' : '');
    sheet.querySelector('.ps-idx').textContent = (idx + 1) + ' / ' + list.length;
    sheet.querySelectorAll('.ps-thumbs button').forEach(function (b, k) {
      b.classList.toggle('on', k === idx);
      if (k === idx && b.scrollIntoView) { var t = b.parentNode; t.scrollTo({ left: b.offsetLeft - t.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' }); }
    });
    // preload neighbour
    var nx = list[(idx + 1) % list.length]; if (nx) { var pre = new Image(); pre.src = nx.src; }
  }

  /* keep the address bar in step with the open project (skipped inside the one-file copy, which has its own history) */
  function setURL(u) { if (window.__P) return; try { history.replaceState(history.state, '', u); } catch (e) {} }

  function open(id, fromHash) {
    var p = P.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    order = visible().indexOf(p) > -1 ? visible() : P;
    if (!sheet.classList.contains('open')) lastFocus = document.activeElement;
    cur = p; build(p);
    sheet.hidden = false;
    requestAnimationFrame(function () { sheet.classList.add('open'); });
    document.documentElement.classList.add('no-scroll'); document.body.classList.add('no-scroll');
    if (!fromHash) setURL('#' + id);
    var c = sheet.querySelector('.ps-close'); if (c) c.focus({ preventScroll: true });
    sheet.querySelector('.ps-body').scrollTop = 0;
  }
  function close() {
    sheet.classList.remove('open', 'is-full');
    document.documentElement.classList.remove('no-scroll'); document.body.classList.remove('no-scroll');
    setTimeout(function () { if (!sheet.classList.contains('open')) { sheet.hidden = true; sheet.innerHTML = ''; } }, 350);
    setURL(location.pathname + location.search);
    var back = grid.querySelector('[data-id="' + (cur && cur.id) + '"]') || lastFocus;
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  function step(d) {
    var pos = order.indexOf(cur); open(order[(pos + d + order.length) % order.length].id);
  }

  grid.addEventListener('click', function (e) {
    var a = e.target.closest('[data-id]'); if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); open(a.dataset.id);
  });
  sheet.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-close]')) { close(); return; }
    if (t.closest('.ps-pp')) { step(-1); return; }
    if (t.closest('.ps-np')) { step(1); return; }
    if (t.closest('.ps-prev')) { show(idx - 1); return; }
    if (t.closest('.ps-next')) { show(idx + 1); return; }
    if (t.closest('.ps-full')) { sheet.classList.toggle('is-full'); return; }
    var th = t.closest('.ps-thumbs button'); if (th) { show(+th.dataset.i); return; }
    var tab = t.closest('[data-set]'); if (tab) { set = tab.dataset.set; thumbs(); show(0); return; }
    if (t.closest('.ps-stage img')) { if (sheet.classList.contains('is-full')) show(idx + 1); else sheet.classList.add('is-full'); }
  });
  document.addEventListener('keydown', function (e) {
    if (!sheet.classList.contains('open')) return;
    if (e.key === 'Escape') { if (sheet.classList.contains('is-full')) sheet.classList.remove('is-full'); else close(); }
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'Tab') {               // keep focus inside the project view
      var f = sheet.querySelectorAll('button:not([disabled]),a[href],select');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null, ty = null;
  sheet.addEventListener('touchstart', function (e) { if (!e.target.closest('.ps-stage')) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  });

  function fromHash() {
    var id = (location.hash || '').slice(1);
    if (id && P.some(function (p) { return p.id === id; })) open(id, true);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
