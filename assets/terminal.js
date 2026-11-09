(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  var rainCanvas = document.querySelector('.tp-rain');
  var rain = rainCanvas && window.gpRain ? window.gpRain(rainCanvas) : { start: function () {}, stop: function () {} };
  var fixedMood = '', chuvaImg = document.querySelector('.tp-scene-chuva');
  function loadChuva() { if (chuvaImg && chuvaImg.dataset.src) { chuvaImg.src = (window.innerWidth < 900 && chuvaImg.dataset.srcM) || chuvaImg.dataset.src; chuvaImg.removeAttribute('data-src'); } }
  function mood(m) {
    var on = m === 'chuva';
    if (on) loadChuva();
    body.classList.toggle('mood-chuva', on);
    on ? rain.start() : rain.stop();
  }
  function preview(m) { mood(m || fixedMood); }
  function settle() { mood(fixedMood); }

  var clock = document.getElementById('boardClock');
  function tick() {
    if (!clock) return;
    try { var t = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()); clock.textContent = t; clock.setAttribute('datetime', t); } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function prepFlap(el) {
    var txt = el.textContent; el.dataset.final = txt; el.textContent = '';
    for (var i = 0; i < txt.length; i++) { var s = document.createElement('span'); s.className = 'fc' + (txt[i] === ' ' ? ' sp' : ''); s.textContent = txt[i]; el.appendChild(s); }
  }
  function flip(el, delay) {
    if (reduce) return;
    var cells = [].slice.call(el.children), fin = el.dataset.final || '';
    cells.forEach(function (c, i) {
      if (fin[i] === ' ') return;
      var n = 4 + Math.floor(Math.random() * 6) + i;
      setTimeout(function step() {
        c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
        if (--n <= 0) { c.textContent = fin[i]; return; }
        c.textContent = CH[Math.floor(Math.random() * CH.length)];
        setTimeout(step, 70);
      }, delay + i * 22);
    });
  }

  var board = document.querySelector('[data-board]');
  if (board) {
    var items = [].slice.call(board.querySelectorAll('.board-rows > li'));
    var flaps = [].slice.call(board.querySelectorAll('.flap'));
    flaps.forEach(prepFlap);
    var per = window.matchMedia('(min-width: 760px)').matches ? 9 : 6;
    var pages = Math.ceil(items.length / per), page = 0, timer = null, paused = false;
    var dots = board.querySelector('.board-pages');
    function show(p, animate) {
      page = (p + pages) % pages;
      items.forEach(function (li, i) {
        var on = Math.floor(i / per) === page;
        li.classList.toggle('is-off', !on);
        if (on && animate) {
          var d = li.querySelector('.r-dest'); d.classList.add('is-swap');
          setTimeout(function () { d.classList.remove('is-swap'); }, 160 + (i % per) * 60);
          li.querySelectorAll('.flap').forEach(function (f) { flip(f, (i % per) * 90); });
        }
      });
      if (dots) [].forEach.call(dots.children, function (b, k) { b.setAttribute('aria-current', k === page ? 'true' : 'false'); });
    }
    if (!reduce && pages > 1) {
      board.classList.add('is-paged');
      if (dots) {
        for (var k = 0; k < pages; k++) {
          var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Página ' + (k + 1) + ' do painel');
          (function (k) { b.addEventListener('click', function () { show(k, true); }); })(k);
          dots.appendChild(b);
        }
      }
      show(0, false);
      var run = function () { if (!paused && !document.hidden) show(page + 1, true); };
      board.addEventListener('mouseenter', function () { paused = true; });
      board.addEventListener('mouseleave', function () { paused = false; });
      board.addEventListener('focusin', function () { paused = true; });
      board.addEventListener('focusout', function () { paused = false; });
      if ('IntersectionObserver' in window) {
        var first = true;
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              if (first) { first = false; show(0, true); }
              if (!timer) timer = setInterval(run, 6500);
            } else if (timer) { clearInterval(timer); timer = null; }
          });
        }, { threshold: .2 }).observe(board);
      } else { timer = setInterval(run, 6500); }
    }
    board.querySelectorAll('.board-row').forEach(function (a) {
      var m = a.getAttribute('data-mood');
      a.addEventListener('mouseenter', function () { preview(m); });
      a.addEventListener('focus', function () { preview(m); });
      a.addEventListener('mouseleave', settle);
      a.addEventListener('blur', settle);
    });
  }

  var dataEl = document.getElementById('tpSituacoes');
  var SITS = []; try { SITS = JSON.parse(dataEl.textContent); } catch (e) {}
  var input = document.getElementById('tpBusca'), list = document.getElementById('tpSugestoes'), result = document.getElementById('tpResult');
  var chips = [].slice.call(document.querySelectorAll('.tp-chip[data-sit]'));
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(id) {
    var s = SITS.filter(function (x) { return x.id === id; })[0];
    if (!s || !result) return;
    fixedMood = s.mood || ''; mood(fixedMood);
    chips.forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-sit') === id); });
    result.setAttribute('data-mood', s.mood || '');
    result.innerHTML = '<div class="tp-res-main"><div class="tp-res-top"><span>Voo ' + esc(s.voo) + '</span><span class="tp-res-st">' + esc(s.status) + '</span></div>' +
      '<p class="tp-res-t">' + esc(s.titulo) + '</p><p class="tp-res-d">' + esc(s.desc) + '</p>' +
      '<div class="tp-res-actions"><a class="gp-btn gp-btn-primary" href="' + esc(s.href) + '">Ler o artigo · ' + esc(s.min) + ' min</a>' +
      (s.agora ? '<a class="gp-btn gp-btn-ghost" href="' + esc(s.agora) + '">O que fazer agora</a>' : '') + '</div>' +
      '<button type="button" class="tp-res-close" data-reset>Escolher outra situação</button></div>' +
      '<div class="tp-res-stub" aria-hidden="true"><small>Portão</small>' + esc(s.portao) + '<small>' + esc(s.voo) + '</small></div>';
    result.hidden = false;
    result.querySelector('[data-reset]').addEventListener('click', function () {
      fixedMood = ''; mood(''); result.hidden = true; chips.forEach(function (c) { c.classList.remove('is-on'); });
      if (input) { input.value = ''; input.focus(); }
    });
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function (e) { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); pick(c.getAttribute('data-sit')); });
  });
  if (input && list) {
    var sel = -1;
    function render() {
      var q = norm(input.value).trim(), out = [];
      if (q) out = SITS.filter(function (s) { return norm(s.titulo + ' ' + s.busca + ' ' + s.status).indexOf(q) >= 0; });
      else out = SITS.slice(0, 6);
      list.innerHTML = out.map(function (s, i) { return '<li><a href="' + esc(s.href) + '" data-id="' + esc(s.id) + '" role="option" id="tpOpt' + i + '">' + esc(s.titulo) + '<small>' + esc(s.status) + '</small></a></li>'; }).join('') ||
        '<li><a href="artigos/" role="option">Ver todos os artigos<small>Biblioteca</small></a></li>';
      list.hidden = false; input.setAttribute('aria-expanded', 'true'); sel = -1;
    }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      var opts = [].slice.call(list.querySelectorAll('a'));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (list.hidden) render(); opts = [].slice.call(list.querySelectorAll('a'));
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === sel ? 'true' : 'false'); });
        if (opts[sel]) input.setAttribute('aria-activedescendant', opts[sel].id);
      } else if (e.key === 'Enter') {
        var o = opts[sel >= 0 ? sel : 0]; if (!o) return; e.preventDefault();
        if (o.dataset.id) { pick(o.dataset.id); close(); } else location.href = o.href;
      } else if (e.key === 'Escape') close();
    });
    list.addEventListener('click', function (e) { var a = e.target.closest('a[data-id]'); if (!a) return; e.preventDefault(); pick(a.dataset.id); close(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('.tp-search')) close(); });
  }

  /* ---------- Fileiras ---------- */
  document.querySelectorAll('[data-rail]').forEach(function (sec) {
    var rail = sec.querySelector('.tp-rail');
    sec.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: Number(b.getAttribute('data-dir')) * rail.clientWidth * .85, behavior: reduce ? 'auto' : 'smooth' }); });
    });
  });
})();
