/* =====================================================================
   WABI — building sketches, drawn from a project's floor counts
   (storeys.above = floors above ground, basements, mezzanine).
   WABI.sketch.elevation(p, opts)  big drawing with dimensions
   WABI.sketch.mini(p, scale)      small glyph for cards and lists
   WABI.sketch.scale(list)         shared scale so towers compare honestly
   ===================================================================== */
(function (w) {
  var GOLD = '#c9a96a', INK = 'rgba(242,241,236,.62)', FAINT = 'rgba(242,241,236,.16)';
  var uid = 0;

  function lv(p) {
    var s = p.storeys || {};
    return { g: s.above || 0, b: s.basements || 0, m: s.mezzanine || 0 };
  }
  function label(p) {
    if (p.venue) return 'Open-air venue';
    if (!p.storeys) return 'Interior';
    var s = lv(p), t = [];
    if (s.b) t.push(s.b + 'B');
    t.push('G');
    if (s.m) t.push('M');
    var str = t.join('+') + '+' + s.g;
    return str;
  }
  function height(s) { return s.g + 1.25 + s.m * 0.6; }        // in "floor units"
  function scale(list) {
    var mx = 1, mb = 0;
    list.forEach(function (p) { if (p.storeys) { var s = lv(p); mx = Math.max(mx, height(s)); mb = Math.max(mb, s.b); } });
    return { maxH: mx, maxB: mb };
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- big elevation ---------- */
  function elevation(p, o) {
    o = o || {};
    if (p.venue) return venue(p);
    if (!p.storeys) return plan(p);
    var s = lv(p), W = 210, base = 238, room = 214;
    var fp = o.shared ? room / o.shared.maxH : Math.min(30, room / height(s));
    var bp = Math.min(fp, 9, s.b ? 56 / Math.max(s.b, o.shared ? o.shared.maxB : s.b) : 9);
    var bx = 34, bw = 112, hot = p.highlight, stroke = hot ? GOLD : INK;
    var H = base + Math.max(s.b * bp, 10) + 30;
    var out = [], id = 'sk' + (++uid);
    var gH = fp * 1.25, mH = fp * 0.6 * s.m, top = base - gH - mH - s.g * fp;

    out.push('<defs><clipPath id="' + id + '"><rect x="' + bx + '" y="' + top.toFixed(1) + '" width="' + bw + '" height="' + (base - top).toFixed(1) + '"/></clipPath></defs>');
    // body
    out.push('<rect x="' + bx + '" y="' + top.toFixed(1) + '" width="' + bw + '" height="' + (base - top).toFixed(1) +
      '" fill="' + (hot ? 'rgba(201,169,106,.13)' : 'rgba(242,241,236,.035)') + '" stroke="' + stroke + '" stroke-width="1"/>');
    // curtain-wall mullions
    var bays = 6, g = ['<g clip-path="url(#' + id + ')" stroke="' + stroke + '" stroke-width=".45" opacity=".55">'];
    for (var i = 1; i < bays; i++) { var x = bx + bw * i / bays; g.push('<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + top.toFixed(1) + '" y2="' + (base - gH).toFixed(1) + '"/>'); }
    // floor slabs
    for (var f = 1; f <= s.g; f++) { var y = base - gH - mH - f * fp + fp; if (fp >= 3) g.push('<line x1="' + bx + '" x2="' + (bx + bw) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>'); }
    g.push('</g>');
    out.push(g.join(''));
    // ground floor + mezzanine + entrance
    out.push('<line x1="' + bx + '" x2="' + (bx + bw) + '" y1="' + (base - gH).toFixed(1) + '" y2="' + (base - gH).toFixed(1) + '" stroke="' + stroke + '" stroke-width=".9"/>');
    if (s.m) out.push('<line x1="' + bx + '" x2="' + (bx + bw) + '" y1="' + (base - gH - mH).toFixed(1) + '" y2="' + (base - gH - mH).toFixed(1) + '" stroke="' + stroke + '" stroke-width=".6" stroke-dasharray="3 2"/>');
    var dw = Math.min(28, bw * .26), dh = gH * .72;
    out.push('<rect x="' + (bx + bw / 2 - dw / 2).toFixed(1) + '" y="' + (base - dh).toFixed(1) + '" width="' + dw.toFixed(1) + '" height="' + dh.toFixed(1) + '" fill="rgba(201,169,106,.22)" stroke="' + GOLD + '" stroke-width=".7"/>');
    // roof: parapet + core
    out.push('<rect x="' + (bx - 3) + '" y="' + (top - 3).toFixed(1) + '" width="' + (bw + 6) + '" height="3" fill="' + stroke + '"/>');
    var ch = Math.max(5, Math.min(12, fp * .9));
    out.push('<rect x="' + (bx + bw * .58) + '" y="' + (top - 3 - ch).toFixed(1) + '" width="' + (bw * .22).toFixed(1) + '" height="' + ch.toFixed(1) + '" fill="none" stroke="' + stroke + '" stroke-width=".7"/>');
    // basements
    if (s.b) {
      out.push('<rect x="' + bx + '" y="' + (base + 1) + '" width="' + bw + '" height="' + (s.b * bp).toFixed(1) + '" fill="rgba(201,169,106,.09)" stroke="rgba(201,169,106,.65)" stroke-width=".8" stroke-dasharray="3 2"/>');
      for (var k = 1; k < s.b; k++) { var yb = base + 1 + k * bp; out.push('<line x1="' + bx + '" x2="' + (bx + bw) + '" y1="' + yb.toFixed(1) + '" y2="' + yb.toFixed(1) + '" stroke="rgba(201,169,106,.45)" stroke-width=".45"/>'); }
    }
    // dimensions
    var dx = bx + bw + 14, mono = 'font-family="ui-monospace,Menlo,monospace" font-size="9"';
    out.push('<g stroke="' + GOLD + '" stroke-width=".7"><line x1="' + dx + '" x2="' + dx + '" y1="' + top.toFixed(1) + '" y2="' + base + '"/>' +
      '<line x1="' + (dx - 3) + '" x2="' + (dx + 3) + '" y1="' + top.toFixed(1) + '" y2="' + top.toFixed(1) + '"/>' +
      '<line x1="' + (dx - 3) + '" x2="' + (dx + 3) + '" y1="' + base + '" y2="' + base + '"/></g>');
    out.push('<text x="' + (dx + 6) + '" y="' + ((top + base) / 2 + 3).toFixed(1) + '" fill="' + GOLD + '" ' + mono + '>' + (s.m ? 'G+M+' : 'G+') + s.g + '</text>');
    if (s.b) {
      var by = base + 1 + s.b * bp;
      out.push('<g stroke="' + INK + '" stroke-width=".7"><line x1="' + dx + '" x2="' + dx + '" y1="' + base + '" y2="' + by.toFixed(1) + '"/>' +
        '<line x1="' + (dx - 3) + '" x2="' + (dx + 3) + '" y1="' + by.toFixed(1) + '" y2="' + by.toFixed(1) + '"/></g>');
      out.push('<text x="' + (dx + 6) + '" y="' + ((base + by) / 2 + 3.5).toFixed(1) + '" fill="' + INK + '" ' + mono + '>B-' + s.b + '</text>');
    }
    // ground
    out.push('<line x1="4" x2="' + (W - 4) + '" y1="' + base + '" y2="' + base + '" stroke="rgba(242,241,236,.7)" stroke-width="1"/>');
    var h = ['<g stroke="' + FAINT + '" stroke-width=".6">'];
    for (var hx = 6; hx < W - 4; hx += 7) { if (hx > bx - 2 && hx < bx + bw + 6 && s.b) continue; h.push('<line x1="' + hx + '" x2="' + (hx - 5) + '" y1="' + (base + 1) + '" y2="' + (base + 6) + '"/>'); }
    h.push('</g>'); out.push(h.join(''));
    return '<svg viewBox="0 0 ' + W + ' ' + H.toFixed(0) + '" role="img" aria-label="' + esc(p.title) + ' — elevation, ' + label(p) + '">' + out.join('') + '</svg>';
  }

  /* ---------- open-air venue (tiered seating) ---------- */
  function venue(p) {
    var W = 210, base = 200, out = [];
    for (var r = 0; r < 5; r++) {
      var y = base - 6 - r * 15;
      out.push('<path d="M' + (20 + r * 4) + ' ' + y + ' Q105 ' + (y - 46 + r * 2) + ' ' + (190 - r * 4) + ' ' + y + '" fill="none" stroke="rgba(201,169,106,' + (.3 + r * .15).toFixed(2) + ')" stroke-width="2"/>');
    }
    out.push('<rect x="88" y="' + (base - 14) + '" width="34" height="14" fill="none" stroke="' + INK + '" stroke-width=".8"/>');
    out.push('<line x1="4" x2="' + (W - 4) + '" y1="' + base + '" y2="' + base + '" stroke="rgba(242,241,236,.7)"/>');
    return '<svg viewBox="0 0 ' + W + ' 230" role="img" aria-label="' + esc(p.title) + ' — tiered seating section">' + out.join('') + '</svg>';
  }

  /* ---------- interior projects: indicative plan ---------- */
  function plan(p) {
    var out = [], c = p.category || '';
    var X = 22, Y = 30, PW = 166, PH = 120;
    out.push('<rect x="' + X + '" y="' + Y + '" width="' + PW + '" height="' + PH + '" fill="rgba(242,241,236,.03)" stroke="' + INK + '" stroke-width="3.2"/>');
    // window band (top wall) and door (bottom wall)
    out.push('<rect x="' + (X + 30) + '" y="' + (Y - 2.2) + '" width="70" height="4.4" fill="#141418" stroke="' + INK + '" stroke-width=".6"/>');
    out.push('<line x1="' + (X + 30) + '" x2="' + (X + 100) + '" y1="' + Y + '" y2="' + Y + '" stroke="' + INK + '" stroke-width=".5"/>');
    var dx = X + PW - 46, dy = Y + PH;
    out.push('<rect x="' + dx + '" y="' + (dy - 2) + '" width="26" height="4" fill="#141418"/>');
    out.push('<path d="M' + dx + ' ' + dy + ' L' + dx + ' ' + (dy - 26) + ' A26 26 0 0 1 ' + (dx + 26) + ' ' + dy + '" fill="none" stroke="' + GOLD + '" stroke-width=".8"/>');
    var f = [];
    if (/Hospitality/.test(c)) {
      [[60, 70], [110, 70], [60, 112], [110, 112]].forEach(function (t) {
        f.push('<circle cx="' + t[0] + '" cy="' + t[1] + '" r="9" fill="none" stroke="' + GOLD + '" stroke-width=".9"/>');
        [[-14, 0], [14, 0], [0, -14], [0, 14]].forEach(function (d) { f.push('<circle cx="' + (t[0] + d[0]) + '" cy="' + (t[1] + d[1]) + '" r="3.2" fill="none" stroke="' + INK + '" stroke-width=".7"/>'); });
      });
      f.push('<rect x="150" y="42" width="30" height="64" fill="none" stroke="' + INK + '" stroke-width=".9"/>');
    } else if (/Commercial/.test(c)) {
      f.push('<rect x="' + (X + 8) + '" y="' + (Y + 8) + '" width="10" height="' + (PH - 16) + '" fill="none" stroke="' + INK + '" stroke-width=".9"/>');
      [[60, 62], [60, 100], [104, 62], [104, 100]].forEach(function (t) {
        f.push('<rect x="' + t[0] + '" y="' + t[1] + '" width="32" height="16" fill="none" stroke="' + GOLD + '" stroke-width=".9"/>');
        f.push('<circle cx="' + (t[0] + 16) + '" cy="' + (t[1] + 23) + '" r="4" fill="none" stroke="' + INK + '" stroke-width=".7"/>');
      });
    } else {
      f.push('<path d="M50 60 h56 v12 h-44 v30 h-12 z" fill="none" stroke="' + GOLD + '" stroke-width=".9"/>');
      f.push('<rect x="70" y="80" width="30" height="20" rx="2" fill="none" stroke="' + INK + '" stroke-width=".7"/>');
      f.push('<rect x="128" y="50" width="44" height="52" fill="none" stroke="' + INK + '" stroke-width=".9"/>');
      f.push('<line x1="128" x2="172" y1="62" y2="62" stroke="' + INK + '" stroke-width=".7"/>');
    }
    out.push(f.join(''));
    // dimension ticks
    out.push('<g stroke="' + GOLD + '" stroke-width=".6"><line x1="' + X + '" x2="' + (X + PW) + '" y1="' + (Y + PH + 16) + '" y2="' + (Y + PH + 16) + '"/>' +
      '<line x1="' + X + '" x2="' + X + '" y1="' + (Y + PH + 12) + '" y2="' + (Y + PH + 20) + '"/><line x1="' + (X + PW) + '" x2="' + (X + PW) + '" y1="' + (Y + PH + 12) + '" y2="' + (Y + PH + 20) + '"/></g>');
    out.push('<text x="' + (X + PW / 2) + '" y="' + (Y + PH + 30) + '" text-anchor="middle" fill="' + GOLD + '" font-family="ui-monospace,Menlo,monospace" font-size="8.5" letter-spacing="1.2">INDICATIVE PLAN</text>');
    return '<svg viewBox="0 0 210 196" role="img" aria-label="' + esc(p.title) + ' — indicative interior plan">' + out.join('') + '</svg>';
  }

  /* ---------- mini glyph (cards, lists) — shared scale ---------- */
  function mini(p, sc) {
    var W = 34, base = 52, room = 46;
    if (p.venue) {
      return '<svg class="mini" viewBox="0 0 ' + W + ' 66" aria-hidden="true"><path d="M3 49 Q17 32 31 49 M6 43 Q17 29 28 43" fill="none" stroke="' + GOLD + '" stroke-width="1.4"/><line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '" stroke="' + INK + '"/></svg>';
    }
    if (!p.storeys) {
      return '<svg class="mini" viewBox="0 0 ' + W + ' 66" aria-hidden="true"><rect x="5" y="22" width="24" height="24" fill="none" stroke="' + INK + '" stroke-width="1.6"/><path d="M21 46 L21 38 A8 8 0 0 1 29 46" fill="none" stroke="' + GOLD + '" stroke-width=".9"/></svg>';
    }
    var s = lv(p), sh = sc || scale([p]);
    var fp = room / sh.maxH, h = height(s) * fp, top = base - h;
    var bp = Math.min(2.2, sh.maxB ? 12 / sh.maxB : 2.2);
    var o = ['<rect x="9" y="' + top.toFixed(1) + '" width="16" height="' + h.toFixed(1) + '" fill="' + (p.highlight ? 'rgba(201,169,106,.45)' : 'rgba(242,241,236,.10)') + '" stroke="' + (p.highlight ? GOLD : INK) + '" stroke-width="1"/>'];
    if (fp >= 2.6) for (var f = 1; f <= s.g; f++) { var y = base - fp * 1.25 - s.m * fp * .6 - f * fp + fp; o.push('<line x1="9" x2="25" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + INK + '" stroke-width=".35"/>'); }
    if (s.b) o.push('<rect x="9" y="' + (base + 1) + '" width="16" height="' + (s.b * bp).toFixed(1) + '" fill="rgba(201,169,106,.25)" stroke="' + GOLD + '" stroke-width=".6" stroke-dasharray="2 1.4"/>');
    o.push('<line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '" stroke="' + INK + '" stroke-width="1"/>');
    return '<svg class="mini" viewBox="0 0 ' + W + ' 66" aria-hidden="true">' + o.join('') + '</svg>';
  }

  /* ---------- outline skyline (homepage hero depth layer) ----------
     every project with storeys, one scale, in a stable but irregular
     order (seeded by the project id) so it reads as a skyline. */
  function seed(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function outline(list) {
    var t = list.filter(function (p) { return p.storeys && !p.venue; });
    if (!t.length) return '';
    var row = t.slice().sort(function (a, b) { return seed(a.id) % 97 - seed(b.id) % 97; });
    var sc = scale(t), base = 300, room = 286, fp = room / sc.maxH, x = 6, out = [];
    row.forEach(function (p) {
      var s = lv(p), k = seed(p.id), bw = 22 + (k % 4) * 7 + (s.g < 6 ? 10 : 0);
      var h = height(s) * fp, top = base - h, X = x.toFixed(1);
      out.push('<rect x="' + X + '" y="' + top.toFixed(1) + '" width="' + bw + '" height="' + h.toFixed(1) + '"/>');
      if (fp >= 3.2) for (var f = 1; f <= s.g; f++) {
        var y = base - 1.25 * fp - s.m * fp * .6 - (f - 1) * fp;
        out.push('<line class="sl" x1="' + X + '" x2="' + (x + bw).toFixed(1) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>');
      }
      for (var m = 1; m < (bw > 34 ? 3 : 2); m++) { var mx = (x + bw * m / (bw > 34 ? 3 : 2)).toFixed(1); out.push('<line class="sl" x1="' + mx + '" x2="' + mx + '" y1="' + top.toFixed(1) + '" y2="' + base + '"/>'); }
      if (s.g >= 10) { var cw = bw * .4, cx = x + (bw - cw) / 2; out.push('<rect x="' + cx.toFixed(1) + '" y="' + (top - fp * .9).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + (fp * .9).toFixed(1) + '"/>'); }
      if (p.highlight) out.push('<line x1="' + (x + bw / 2).toFixed(1) + '" x2="' + (x + bw / 2).toFixed(1) + '" y1="' + (top - fp * .9).toFixed(1) + '" y2="' + (top - fp * 3).toFixed(1) + '"/>');
      x += bw + 4 + (k % 3) * 4;
    });
    var W = Math.ceil(x + 2);
    return '<svg viewBox="0 0 ' + W + ' ' + (base + 1) + '" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '"/>' + out.join('') + '</svg>';
  }

  w.WABI = w.WABI || {};
  w.WABI.sketch = { elevation: elevation, mini: mini, scale: scale, label: label, levels: lv, esc: esc, outline: outline };
})(window);
