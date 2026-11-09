(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var clock = document.getElementById('boardClock');
  function tick() {
    if (!clock) return;
    try {
      var t = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date());
      clock.textContent = t; clock.setAttribute('datetime', t);
    } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var flaps = [].slice.call(document.querySelectorAll('.flap'));
  flaps.forEach(function (el) {
    var txt = el.textContent; el.dataset.final = txt; el.textContent = '';
    for (var i = 0; i < txt.length; i++) {
      var s = document.createElement('span'); s.className = 'fc' + (txt[i] === ' ' ? ' sp' : '');
      s.textContent = txt[i]; el.appendChild(s);
    }
  });
  function flip(el, delay) {
    var cells = [].slice.call(el.children), fin = el.dataset.final;
    cells.forEach(function (c, i) {
      if (fin[i] === ' ') return;
      var n = 4 + Math.floor(Math.random() * 6) + i;
      setTimeout(function step() {
        c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
        if (--n <= 0) { c.textContent = fin[i]; return; }
        c.textContent = CH[Math.floor(Math.random() * CH.length)];
        setTimeout(step, 70);
      }, delay + i * 25);
    });
  }
  var board = document.querySelector('.board');
  if (!reduce && board && flaps.length && 'IntersectionObserver' in window) {
    var done = false, timer = null;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !done) { done = true; flaps.forEach(function (f, k) { flip(f, k * 120); }); }
        if (e.isIntersecting && !timer) {
          timer = setInterval(function () { if (!document.hidden) flip(flaps[Math.floor(Math.random() * flaps.length)], 0); }, 7000);
        } else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }, { threshold: 0.25 }).observe(board);
  }

  var boxes = [].slice.call(document.querySelectorAll('.check input'));
  var cnt = document.getElementById('bpCount'), bar = document.getElementById('bpBar');
  function sync() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    if (cnt) cnt.textContent = n + '/' + boxes.length;
    if (bar) bar.style.width = (boxes.length ? n / boxes.length * 100 : 0) + '%';
  }
  boxes.forEach(function (b) { b.addEventListener('change', sync); });
  var rs = document.getElementById('reset'); if (rs) rs.addEventListener('click', function () { setTimeout(sync, 0); });
  sync();

  var cv = document.getElementById('rain');
  if (!cv || reduce || !cv.getContext) return;
  var ctx = cv.getContext('2d'), drops = [], beads = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), run = false, raf = 0;
  function size() {
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(120, Math.round(W * H / 11000)); drops = [];
    for (var i = 0; i < n; i++) drops.push(mk(true));
    beads = []; var b = Math.min(26, Math.round(W / 50));
    for (var j = 0; j < b; j++) beads.push({ x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 1.8, v: .15 + Math.random() * .5, w: Math.random() * 400 });
  }
  function mk(any) { return { x: Math.random() * (W + 80) - 40, y: any ? Math.random() * H : -20, l: 10 + Math.random() * 22, v: 7 + Math.random() * 8, a: .06 + Math.random() * .16 }; }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.lineCap = 'round';
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.strokeStyle = 'rgba(190,200,255,' + d.a + ')';
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * .12, d.y + d.l); ctx.stroke();
      d.y += d.v; d.x -= d.v * .12;
      if (d.y > H) drops[i] = mk(false);
    }
    for (var j = 0; j < beads.length; j++) {
      var b = beads[j];
      if (b.w > 0) b.w--; else { b.y += b.v; if (Math.random() < .01) b.w = 60 + Math.random() * 200; }
      if (b.y > H + 5) { b.y = -5; b.x = Math.random() * W; }
      ctx.fillStyle = 'rgba(210,220,255,.22)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - b.r * .3, b.r * .35, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!run) { run = true; raf = requestAnimationFrame(frame); } }
  function stop() { run = false; cancelAnimationFrame(raf); }
  size();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting && !document.hidden ? start() : stop(); }); }).observe(cv);
  } else start();
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
