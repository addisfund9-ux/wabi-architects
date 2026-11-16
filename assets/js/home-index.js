/* homepage: newest projects in "More from the portfolio" + the gold tower outline in the hero.
   Both come from assets/js/projects-data.js — add a project there and it shows up here. */
(function () {
  var P = window.WABI_PROJECTS || [], S = window.WABI && window.WABI.sketch;
  var featured = [].map.call(document.querySelectorAll('a.work[href*="#"]'), function (a) { return a.getAttribute('href').split('#')[1]; });
  var list = P.filter(function (p) { return featured.indexOf(p.id) < 0 && (p.images || []).length && (p.work || []).indexOf('design') > -1; }).slice(0, 6);
  var box = document.getElementById('worksIndex');
  if (box && list.length) {
    var fin = box.innerHTML;
    box.innerHTML = list.map(function (p, i) {
      var cat = [p.type, p.location && p.location.indexOf('Addis') < 0 ? p.location : '', p.year].filter(Boolean).join(' · ');
      return '<a class="wi-row" href="projects.html#' + p.id + '" data-img="' + (p.cover || p.images[0]) + '">' +
        '<span class="wi-l"><span class="wi-num">' + ('0' + (i + 1 + featured.length)).slice(-2) + '</span><h4>' + S.esc(p.title) + '</h4></span>' +
        '<span class="wi-cat">' + S.esc(cat) + '</span></a>';
    }).join('') + fin.replace(/<span class="wi-num">\d+<\/span>/, '<span class="wi-num">' + ('0' + (list.length + 1 + featured.length)).slice(-2) + '</span>');
  }
  var sky = document.querySelector('.hero-sky');
  if (sky) {
    if (S && P.length) sky.innerHTML = S.outline(P);
    var hero = sky.parentNode, sub = hero.querySelector('.hero-sub');
    var seat = function () { if (sub) sky.style.bottom = (hero.clientHeight - sub.offsetTop) + 'px'; };
    seat(); window.addEventListener('resize', seat);
  }
})();
