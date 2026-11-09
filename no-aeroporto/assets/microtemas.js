(function () {
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = w.matchMedia && w.matchMedia('(hover: none)').matches;
  d.querySelectorAll('.mt').forEach(function (row) {
    var rail = row.querySelector('.mt-rail'), p = row.querySelector('.mt-prev'), n = row.querySelector('.mt-next');
    if (!rail) return;
    function upd() { if (p) p.disabled = rail.scrollLeft < 8; if (n) n.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8; }
    [p, n].forEach(function (b) { if (b) b.addEventListener('click', function () { rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' }); }); });
    rail.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true }); upd(); w.addEventListener('resize', upd);

    if (touch && !reduce && 'IntersectionObserver' in w) {
      var act = null;
      function pick() {
        var r = rail.getBoundingClientRect(), pl = parseFloat(getComputedStyle(rail).paddingLeft), best = null, bd = 1e9;
        rail.querySelectorAll('.poster').forEach(function (el) { var dd = Math.abs(el.getBoundingClientRect().left - r.left - pl); if (dd < bd) { bd = dd; best = el; } });
        if (best !== act) { if (act) act.classList.remove('is-on'); act = best; if (act) act.classList.add('is-on'); }
      }
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.intersectionRatio > .55) pick(); else if (act) { act.classList.remove('is-on'); act = null; } }); }, { threshold: [0, .55, 1] }).observe(rail);
      var t; rail.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(pick, 90); }, { passive: true });
    }
  });

  d.querySelectorAll('[data-trailer]').forEach(function (a) {
    var dlg = d.getElementById(a.getAttribute('data-trailer'));
    if (!dlg || typeof dlg.showModal !== 'function') return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      dlg.showModal();
      var img = dlg.querySelector('.tr-media img'); if (img) { img.style.animation = 'none'; void img.offsetWidth; img.style.animation = ''; }
      var go = dlg.querySelector('.tr-play'); if (go) go.focus({ preventScroll: true });
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.tr-close')) dlg.close(); });
  });
})();
