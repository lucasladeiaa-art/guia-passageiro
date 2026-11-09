(function () {
  'use strict';
  var sec = document.querySelector('[data-relacionados]');
  var slug = document.body.getAttribute('data-slug');
  if (!sec || !slug) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  fetch('artigos.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
    var inLoop = {};
    document.querySelectorAll('.loop-leitura a[href]').forEach(function (a) { inLoop[a.getAttribute('href').replace('.html', '')] = 1; });
    var items = (list || []).filter(function (a) { return a.slug !== slug && !inLoop[a.slug]; })
      .sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); }).slice(0, 6);
    if (!items.length) return;
    sec.querySelector('.row-track').innerHTML = items.map(function (a) {
      return '<li><a class="gp-card" href="' + esc(a.slug) + '.html"><img src="img/' + esc(a.slug) + '.webp" alt="" width="640" height="360" loading="lazy" decoding="async">' +
        '<span class="gp-card-body"><span class="gp-tag">Passageiro</span><h3>' + esc(a.title) + '</h3>' +
        '<span class="gp-card-meta"><span>' + esc(a.reading) + ' min de leitura</span></span></span></a></li>';
    }).join('');
    sec.hidden = false;
    var track = sec.querySelector('.row-track');
    sec.querySelectorAll('.row-nav button').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: Number(b.getAttribute('data-dir')) * track.clientWidth * 0.9, behavior: 'smooth' }); });
    });
  }).catch(function () {});
})();
