document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
(function () {
  var btn = document.getElementById('gpMenuBtn'), nav = document.getElementById('gp-nav-mobile');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
})();

window.gpRain = function (canvas, opts) {
  opts = opts || {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas && canvas.getContext && canvas.getContext('2d');
  var api = { start: function () {}, stop: function () {} };
  if (!ctx) return api;
  var host = canvas.parentNode, fxClass = opts.fxClass || '';
  function layer(cls) { var d = document.createElement('div'); d.className = cls + (fxClass ? ' ' + fxClass : ''); d.setAttribute('aria-hidden', 'true'); host.insertBefore(d, canvas.nextSibling); return d; }
  var fog = layer('gp-storm-fog'), flash = layer('gp-storm-flash');
  var glassC = document.createElement('canvas'); glassC.className = canvas.className + ' gp-storm-glass'; glassC.setAttribute('aria-hidden', 'true');
  host.insertBefore(glassC, fog);
  var gctx = glassC.getContext('2d');
  var mobile = window.matchMedia('(max-width: 899px)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  var W = 0, H = 0, raf = null, running = false, visible = true, last = 0, wind = -0.22, gust = 0;
  var streaks = [], splashes = [], beads = [], runners = [], flashT = null;

  var bead = document.createElement('canvas'); bead.width = bead.height = 64;
  (function () {
    var b = bead.getContext('2d'), g = b.createRadialGradient(26, 24, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.25, 'rgba(190,210,255,.22)');
    g.addColorStop(.7, 'rgba(20,30,60,.28)'); g.addColorStop(.92, 'rgba(230,240,255,.35)'); g.addColorStop(1, 'rgba(230,240,255,0)');
    b.fillStyle = g; b.beginPath(); b.arc(32, 32, 30, 0, Math.PI * 2); b.fill();
    b.fillStyle = 'rgba(255,255,255,.7)'; b.beginPath(); b.ellipse(24, 21, 5, 3.4, -.6, 0, Math.PI * 2); b.fill();
  })();

  var LAYERS = [
    { k: 'far', dens: mobile ? 2600 : 2200, w: .7, len: [10, 18], v: [13, 17], a: [.10, .18], col: '170,190,235' },
    { k: 'mid', dens: mobile ? 7000 : 5600, w: 1.1, len: [20, 34], v: [20, 26], a: [.18, .28], col: '195,210,245' },
    { k: 'near', dens: mobile ? 26000 : 20000, w: 2.1, len: [46, 80], v: [34, 44], a: [.22, .34], col: '220,230,255' }
  ];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function mk(L, y) { return { L: L, x: rnd(-60, W + 60), y: y == null ? rnd(-H, H) : y, len: rnd(L.len[0], L.len[1]), v: rnd(L.v[0], L.v[1]), a: rnd(L.a[0], L.a[1]) }; }
  function newBead() { return { x: Math.random() * W, y: Math.random() * H, r: Math.random() < .85 ? rnd(.8, 2.4) : rnd(2.6, 4.2) }; }
  function newRunner() { return { x: Math.random() * W, y: rnd(-20, H * .5), r: rnd(3.2, 5.6), v: 0, hold: rnd(10, 60), trail: 0 }; }

  function size() {
    var r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    [canvas, glassC].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    streaks = []; var area = W * H, cap = mobile ? 420 : 700;
    LAYERS.forEach(function (L) { var n = Math.min(Math.round(area / L.dens * 10), cap); for (var i = 0; i < n; i++) streaks.push(mk(L)); });
    beads = []; var nb = Math.min(Math.round(area / (mobile ? 900 : 1100)), mobile ? 260 : 420);
    for (var j = 0; j < nb; j++) beads.push(newBead());
    runners = []; var nr = mobile ? 7 : 12; for (var k = 0; k < nr; k++) runners.push(newRunner());
  }

  function drawRain(dt) {
    ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round';
    gust += (Math.random() - .5) * .02; gust *= .985;
    var wa = wind + gust;
    for (var i = 0; i < streaks.length; i++) {
      var d = streaks[i], L = d.L;
      ctx.strokeStyle = 'rgba(' + L.col + ',' + d.a + ')'; ctx.lineWidth = L.w;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + wa * d.len, d.y + d.len); ctx.stroke();
      d.y += d.v * dt; d.x += wa * d.v * dt;
      if (d.y > H) {
        if (L.k === 'near' && splashes.length < 60 && Math.random() < .55) splashes.push({ x: d.x, y: H - rnd(2, H * .12), t: 0 });
        var n = mk(L, -d.len - rnd(0, 80)); d.x = n.x; d.y = n.y;
      }
    }
    ctx.lineWidth = 1;
    for (var s = splashes.length - 1; s >= 0; s--) {
      var p = splashes[s]; p.t += dt;
      var k = p.t / 9; if (k >= 1) { splashes.splice(s, 1); continue; }
      ctx.strokeStyle = 'rgba(210,225,255,' + (.35 * (1 - k)) + ')';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 2 + k * 9, .8 + k * 2.4, 0, Math.PI, 0); ctx.stroke();
    }
  }

  function drawGlass(dt) {
    gctx.clearRect(0, 0, W, H);
    for (var i = 0; i < beads.length; i++) { var b = beads[i], s = b.r * 2; gctx.drawImage(bead, b.x - b.r, b.y - b.r, s, s); }
    for (var j = 0; j < runners.length; j++) {
      var r = runners[j];
      if (r.hold > 0) { r.hold -= dt; r.v = 0; } else { r.v = Math.min(r.v + .06 * dt, 2.6 + r.r * .3); if (Math.random() < .015) r.hold = rnd(4, 25); }
      var dy = r.v * dt; r.y += dy; r.x += Math.sin(r.y * .05) * .25 * dt;
      r.trail += dy;
      if (r.trail > 7 && beads.length < 520) { r.trail = 0; beads.push({ x: r.x + rnd(-1, 1), y: r.y - r.r * 1.6, r: rnd(.6, 1.4), life: 1 }); }
      for (var q = beads.length - 1; q >= 0; q--) {
        var o = beads[q]; if (o.life) continue;
        var dx = o.x - r.x, ddy = o.y - r.y;
        if (dx * dx + ddy * ddy < (r.r + o.r) * (r.r + o.r)) { r.r = Math.min(r.r + o.r * .08, 7); beads.splice(q, 1); }
      }
      var h = r.r * 2.6;
      gctx.drawImage(bead, r.x - r.r, r.y - h * .5, r.r * 2, h);
      if (r.y - r.r > H) { runners[j] = newRunner(); runners[j].y = -10; }
    }
    if (beads.length < (mobile ? 260 : 420) && Math.random() < .5 * dt) beads.push(newBead());
    for (var t = beads.length - 1; t >= 0; t--) { var bb = beads[t]; if (bb.life) { bb.life -= .002 * dt; if (bb.life <= 0) beads.splice(t, 1); } }
  }

  function frame(ts) {
    raf = null; if (!running || !visible || document.hidden) return;
    var dt = last ? Math.min((ts - last) / 16.67, 3) : 1; last = ts;
    drawRain(dt); drawGlass(dt);
    raf = requestAnimationFrame(frame);
  }
  function loop() { if (!raf && running && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }

  function bolt() {
    if (!running || reduce) return;
    flashT = setTimeout(function () {
      if (running && visible && !document.hidden) {
        flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on');
      }
      bolt();
    }, rnd(8000, 15000));
  }

  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; loop(); }).observe(canvas);
  document.addEventListener('visibilitychange', loop);
  var rt = null; window.addEventListener('resize', function () { if (!running) return; clearTimeout(rt); rt = setTimeout(function () { size(); if (reduce) { drawRain(0); drawGlass(0); } }, 150); });

  api.start = function () {
    if (running) return; running = true; host.classList.add('is-storm'); size();
    if (reduce) { drawRain(0); drawGlass(0); return; }
    loop(); bolt();
  };
  api.stop = function () {
    running = false; host.classList.remove('is-storm');
    if (raf) cancelAnimationFrame(raf); raf = null; clearTimeout(flashT);
    setTimeout(function () { if (!running) { ctx.clearRect(0, 0, W, H); gctx.clearRect(0, 0, W, H); } }, 1400);
  };
  return api;
};
(function () {
  if (document.body.getAttribute('data-mood') !== 'chuva') return;
  var cover = document.querySelector('.post-cover');
  if (!cover) return;
  var c = document.createElement('canvas'); c.className = 'gp-cover-rain'; c.setAttribute('aria-hidden', 'true');
  cover.appendChild(c);
  var r = window.gpRain(c, { fxClass: 'gp-cover-fx' });
  requestAnimationFrame(function () { r.start(); });
})();
