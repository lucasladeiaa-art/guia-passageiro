(function () {
  'use strict';
  try { iniciar(); } catch (erro) { fallback(erro); }

  function fallback() {
    var box = document.querySelector('[data-share]');
    if (!box) return;
    var url = location.href.split('#')[0];
    var titulo = document.title || url;
    var wa = 'https://wa.me/?text=' + encodeURIComponent(titulo + '\n' + url);
    box.innerHTML = '<p style="text-align:center;margin:1.5rem 0"><a href="' + wa + '">WhatsApp</a> · <button type="button" id="cmp-fb-copy" style="cursor:pointer">Copiar link</button></p>';
    var b = document.getElementById('cmp-fb-copy');
    if (b) b.onclick = function () { copiarTexto(url); };
  }

  function copiarTexto(texto) {
    var ok = false;
    try {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.setAttribute('aria-hidden', 'true');
      ta.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;z-index:1';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, texto.length);
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(texto);
        ok = true;
      }
    } catch (e2) {}
    return ok;
  }

  function iniciar() {
    if (!document.querySelector('article')) return;
    var host = location.hostname;
    var GUIA = /^consumidor\./.test(host) || document.body.classList.contains('gp');
    var T = GUIA ? {
      bg: '#0B0D1C', ink: '#EEF0FF', muted: '#A3A9CF', accent: '#F5C977',
      glow1: 'rgba(141,184,255,.22)', glow2: 'rgba(245,201,119,.10)', line: 'rgba(160,170,255,.30)',
      marca: 'Guia do Passageiro', dominio: 'consumidor.lucasladeia.com.br', kickerFont: 'ui-monospace, Menlo, monospace',
      logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="none" stroke="#F5C977" stroke-width="2"/><path d="M9 25c6-1 12-5 18-14" fill="none" stroke="#F5C977" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3.2"/><path fill="#F5C977" d="M27.6 9.2l3.6-1.1-1.1 3.6-2.2 1.2 1.4 5.2-1.5 1-2.6-4.3-2.6 1.5.3 1.9-1 .7-1.1-2.5-2.5-1.1.7-1 1.9.3 1.5-2.6-4.3-2.6 1-1.5 5.2 1.4z"/><circle cx="9" cy="25" r="2" fill="#F5C977"/></svg>'
    } : {
      bg: '#160F0B', ink: '#F6EFE3', muted: 'rgba(246,239,227,.70)', accent: '#E7D5B5',
      glow1: 'rgba(122,36,51,.42)', glow2: 'rgba(231,213,181,.08)', line: 'rgba(231,213,181,.32)',
      marca: 'Lucas Brito Ladeia', dominio: 'lucasladeia.com.br', kickerFont: '"Source Sans 3", system-ui, sans-serif',
      logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230"><defs><clipPath id="c"><path d="M100 12 L182 40 V112 C182 162 148 196 100 218 C52 196 18 162 18 112 V40 Z"/></clipPath></defs><path d="M100 12 L182 40 V112 C182 162 148 196 100 218 C52 196 18 162 18 112 V40 Z" fill="none" stroke="#E7D5B5" stroke-width="15" stroke-linejoin="round"/><g clip-path="url(#c)" stroke="#E7D5B5" stroke-width="9" fill="none"><path d="M-40 82 Q100 150 240 82"/><path d="M-40 140 Q100 208 240 140"/><path d="M58 -10 Q80 120 58 250"/><path d="M100 -10 V250"/><path d="M142 -10 Q120 120 142 250"/></g><circle cx="100" cy="116" r="13" fill="#E7D5B5"/></svg>'
    };

    var meta = function (p) {
      var m = document.querySelector('meta[property="' + p + '"]');
      return m ? m.content : '';
    };
    var canon = (document.querySelector('link[rel="canonical"]') || {}).href || location.href.split('#')[0];
    var h1 = document.querySelector('article h1, h1');
    var titulo = (meta('og:title') || (h1 && h1.textContent) || document.title).replace(/^\s+|\s+$/g, '');
    var leadEl = document.querySelector('.post-lead, .md-lead, .lead');
    var resumo = ((leadEl && leadEl.textContent) || meta('og:description') || '').replace(/^\s+|\s+$/g, '');
    var tagEl = document.querySelector('article .tag, .post-head .tag, .md-selo');
    var area = ((tagEl && tagEl.textContent) || '').replace(/^\s+|\s+$/g, '');
    var slug = document.body.getAttribute('data-slug') || (location.pathname.split('/').pop() || 'artigo').replace(/\.html?$/, '');
    var coverEl = document.querySelector('.post-cover img, article figure img, .md-capa img');
    var capaSrc = coverEl ? (coverEl.currentSrc || coverEl.src) : '';
    var posterEl = document.querySelector('.md-head-poster img');
    var posterSrc = posterEl ? (posterEl.currentSrc || posterEl.src) : '';
    var ua = navigator.userAgent || '';
    var interno = /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Instagram|Line\/|Twitter|TikTok|BytedanceWebview|musical_ly|Pinterest|Snapchat|LinkedInApp|GSA\/|\[FB|IABMV|webview|WebView|; wv\)/i.test(ua);
    var waHref = 'https://wa.me/?text=' + encodeURIComponent(titulo + '\n' + canon);

    function track(acao) {
      try { if (window.dataLayer) window.dataLayer.push({ event: 'share', share_action: acao, slug: slug }); } catch (e) {}
    }

    var css = GUIA
      ? '.cmp{--c-ink:#EEF0FF;--c-mut:#A3A9CF;--c-acc:#F5C977;--c-line:rgba(160,170,255,.28);--c-bg:rgba(255,255,255,.04);--c-sheet:#10132A;--c-wa:#25D366}'
      : '.cmp{--c-ink:#F6EFE3;--c-mut:rgba(246,239,227,.66);--c-acc:#E7D5B5;--c-line:rgba(231,213,181,.30);--c-bg:rgba(231,213,181,.05);--c-sheet:#1C130E;--c-wa:#25D366}';
    css += '.cmp{max-width:46rem;margin:2.6rem auto 2.2rem;padding:1.4rem 1.25rem 1.25rem;border-top:1px solid var(--c-line);border-bottom:1px solid var(--c-line);text-align:center;position:relative;z-index:2}' +
      '.cmp-eyebrow{margin:0 0 .9rem;font-size:.74rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--c-acc)}' +
      '.cmp-row{display:flex;flex-wrap:wrap;gap:.65rem;justify-content:center}' +
      '.cmp button,.cmp a.cmp-btn{-webkit-appearance:none;appearance:none;cursor:pointer}' +
      '.cmp-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;padding:.75rem 1.25rem;border-radius:999px;border:1px solid var(--c-line);background:var(--c-bg);color:var(--c-ink);font:600 1rem/1.1 "Source Sans 3",system-ui,-apple-system,sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;text-decoration:none;box-sizing:border-box}' +
      '.cmp-btn:hover{border-color:var(--c-acc)}.cmp-btn:active{transform:scale(.97)}' +
      '.cmp-btn svg{width:1.15em;height:1.15em;flex:none;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}' +
      '.cmp-btn span{pointer-events:none}' +
      '.cmp-btn.cmp-main{background:var(--c-acc);border-color:var(--c-acc);color:#14100c}' +
      '.cmp-btn.cmp-wa{background:var(--c-wa);border-color:var(--c-wa);color:#06210f}' +
      '.cmp-btn[aria-busy="true"]{opacity:.7}' +
      '.cmp-msg{min-height:1.2em;margin:.8rem 0 0;font-size:.92rem;color:var(--c-mut)}' +
      '.cmp-prev{display:block;margin:1rem auto 0;width:160px;max-width:42%;border-radius:12px;border:1px solid var(--c-line);box-shadow:0 12px 30px rgba(0,0,0,.4)}' +
      '.cmp-topo{display:flex;gap:.5rem;margin-top:1rem;flex-wrap:wrap}' +
      '.cmp-topo .cmp-btn{min-height:44px;padding:.5rem .95rem;font-size:.92rem}' +
      '.cmp-topo .cmp-btn.cmp-main{background:var(--c-bg);color:var(--c-ink);border-color:var(--c-line)}' +
      'body.cmp-aberto{overflow:hidden}' +
      '.cmp-folha{position:fixed;inset:0;z-index:400;display:flex;align-items:flex-end;justify-content:center}' +
      '.cmp-folha[hidden]{display:none}' +
      '.cmp-folha-bg{position:absolute;inset:0;background:rgba(0,0,0,.55);cursor:pointer}' +
      '.cmp-folha-card{position:relative;width:100%;max-width:32rem;max-height:88vh;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--c-sheet,#1C130E);color:var(--c-ink);border-radius:22px 22px 0 0;padding:1.15rem 1.25rem calc(1.4rem + env(safe-area-inset-bottom,0px));box-shadow:0 -16px 50px rgba(0,0,0,.45);font-family:"Source Sans 3",system-ui,-apple-system,sans-serif}' +
      '.cmp-folha-handle{width:42px;height:4px;border-radius:999px;background:var(--c-line);margin:0 auto .85rem}' +
      '.cmp-folha-fechar{position:absolute;top:.7rem;right:.7rem;width:44px;height:44px;border:0;border-radius:999px;background:transparent;color:var(--c-ink);font-size:1.6rem;line-height:1;cursor:pointer}' +
      '.cmp-folha-card h2{margin:0 2.2rem .35rem 0;font:600 1.25rem/1.25 Fraunces,Georgia,serif}' +
      '.cmp-inapp{margin:.2rem 0 1rem;padding:.75rem .9rem;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid var(--c-line);color:var(--c-ink);font-size:.95rem;text-align:left}' +
      '.cmp-inapp[hidden]{display:none}' +
      '.cmp-destaque{display:grid;gap:.7rem;margin:1rem 0}' +
      '.cmp-destaque .cmp-btn{width:100%;min-height:52px;font-size:1.05rem}' +
      '.cmp-mais{display:flex;flex-wrap:wrap;gap:.35rem 1rem;justify-content:center;margin:.4rem 0 0;font-size:.9rem}' +
      '.cmp-mais a{color:var(--c-mut);cursor:pointer;text-decoration:underline;text-underline-offset:3px}' +
      '.cmp-story-area{margin-top:1rem;text-align:center}' +
      '.cmp-story-area[hidden]{display:none}' +
      '.cmp-hint{margin:.7rem 0 0;font-size:.92rem;color:var(--c-mut);text-align:left}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var IC_SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
    var IC_STORY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><circle cx="12" cy="10.5" r="3"/><path d="M9 16.5h6"/></svg>';
    var IC_COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

    var box = document.querySelector('[data-share]');
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('data-share', '');
      var art = document.querySelector('article');
      var after = art.querySelector('.post-after, aside.author');
      if (after && after.parentNode === art) art.insertBefore(box, after);
      else art.appendChild(box);
    }
    box.className = 'compartilhar cmp';
    box.innerHTML =
      '<p class="cmp-eyebrow">Compartilhe este artigo</p>' +
      '<div class="cmp-row">' +
        '<button type="button" class="cmp-btn cmp-main" data-acao="abrir">' + IC_SHARE + '<span>Compartilhar</span></button>' +
        '<button type="button" class="cmp-btn" data-acao="story">' + IC_STORY + '<span>Story do Instagram</span></button>' +
      '</div>' +
      '<p class="cmp-msg" role="status" aria-live="polite"></p>';

    var head = document.querySelector('.post-head-inner, .post-head, .md-head');
    if (head && !head.querySelector('.cmp-topo')) {
      var topo = document.createElement('div');
      topo.className = 'cmp cmp-topo';
      topo.style.cssText = 'max-width:none;margin:1rem 0 0;padding:0;border:0;text-align:left';
      topo.innerHTML =
        '<button type="button" class="cmp-btn cmp-main" data-acao="abrir">' + IC_SHARE + '<span>Compartilhar</span></button>' +
        '<button type="button" class="cmp-btn" data-acao="story">' + IC_STORY + '<span>Story</span></button>';
      head.appendChild(topo);
    }

    var folha = document.createElement('div');
    folha.className = 'cmp cmp-folha';
    folha.setAttribute('hidden', '');
    folha.setAttribute('role', 'dialog');
    folha.setAttribute('aria-modal', 'true');
    folha.setAttribute('aria-labelledby', 'cmp-folha-t');
    folha.innerHTML =
      '<div class="cmp-folha-bg" data-acao="fechar"></div>' +
      '<div class="cmp-folha-card">' +
        '<div class="cmp-folha-handle"></div>' +
        '<button type="button" class="cmp-folha-fechar" data-acao="fechar" aria-label="Fechar">×</button>' +
        '<h2 id="cmp-folha-t">Compartilhar</h2>' +
        '<p class="cmp-inapp"' + (interno ? '' : ' hidden') + '>Para compartilhar, abra no navegador. Toque em ⋯ e depois em Abrir no navegador.</p>' +
        '<div class="cmp-destaque">' +
          '<a class="cmp-btn cmp-wa" data-rede="whatsapp" href="' + waHref + '" target="_blank" rel="noopener">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12.5A8.5 8.5 0 1 1 11 4"/><path d="M8.2 8.6c.2-.5.4-.6.8-.6h.6c.2 0 .4.1.5.4l.9 2.1c.1.3 0 .5-.2.7l-.6.6c-.1.1-.1.3 0 .5.4.7 1.1 1.4 1.8 1.8.2.1.4.1.5 0l.6-.6c.2-.2.4-.3.7-.2l2.1.9c.3.1.4.3.4.5v.6c0 .4-.1.6-.6.8A9 9 0 0 1 8.2 8.6z"/></svg>' +
            '<span>WhatsApp</span></a>' +
          '<button type="button" class="cmp-btn cmp-main" data-acao="story">' + IC_STORY + '<span>Story do Instagram</span></button>' +
          '<button type="button" class="cmp-btn" data-acao="copiar">' + IC_COPY + '<span>Copiar link</span></button>' +
        '</div>' +
        '<div class="cmp-mais">' +
          '<a data-rede="email" href="mailto:?subject=' + encodeURIComponent(titulo) + '&body=' + encodeURIComponent(titulo + '\n' + canon) + '">E-mail</a>' +
          '<a data-rede="facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(canon) + '">Facebook</a>' +
          '<a data-rede="telegram" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + encodeURIComponent(canon) + '&text=' + encodeURIComponent(titulo) + '">Telegram</a>' +
        '</div>' +
        '<div class="cmp-story-area" hidden>' +
          '<img class="cmp-prev" alt="Imagem do artigo para o story" width="160" height="284">' +
          '<p class="cmp-hint">Toque e segure a imagem para salvar. Depois abra o Instagram, publique no story e cole o link no adesivo. O link já foi copiado.</p>' +
          '<button type="button" class="cmp-btn" data-acao="abrir-img" style="margin-top:.8rem">Abrir imagem</button>' +
        '</div>' +
        '<p class="cmp-msg" role="status" aria-live="polite"></p>' +
      '</div>';
    document.body.appendChild(folha);

    var msgEl = folha.querySelector('.cmp-folha-card > .cmp-msg');
    var storyArea = folha.querySelector('.cmp-story-area');
    var storyImg = folha.querySelector('.cmp-prev');
    var ultimoFoco = null;

    function msg(t) {
      msgEl.textContent = t || '';
      var extra = box.querySelector('.cmp-msg');
      if (extra) extra.textContent = t || '';
    }

    function abrirFolha() {
      ultimoFoco = document.activeElement;
      folha.removeAttribute('hidden');
      document.body.classList.add('cmp-aberto');
      var first = folha.querySelector('.cmp-wa');
      if (first) first.focus();
    }

    function fecharFolha() {
      folha.setAttribute('hidden', '');
      document.body.classList.remove('cmp-aberto');
      msg('');
      if (ultimoFoco && ultimoFoco.focus) {
        try { ultimoFoco.focus(); } catch (e) {}
      }
    }

    var W = 1080, H = 1920, storyFile = null, storyBlob = null, storyUrl = null, gerando = null;

    function carregaImg(src) {
      return new Promise(function (ok) {
        if (!src) return ok(null);
        var im = new Image();
        im.decoding = 'async';
        im.onload = function () { ok(im); };
        im.onerror = function () { ok(null); };
        im.src = src;
      });
    }
    function linhas(ctx, texto, max) {
      var pal = texto.split(/\s+/), out = [], cur = '';
      for (var i = 0; i < pal.length; i++) {
        var t = cur ? cur + ' ' + pal[i] : pal[i];
        if (ctx.measureText(t).width > max && cur) { out.push(cur); cur = pal[i]; }
        else cur = t;
      }
      if (cur) out.push(cur);
      return out;
    }
    function corta(ctx, ls, n, max) {
      if (ls.length <= n) return ls;
      ls = ls.slice(0, n);
      var u = ls[n - 1];
      while (u && ctx.measureText(u + '…').width > max) u = u.replace(/\s*\S+$/, '');
      ls[n - 1] = u + '…';
      return ls;
    }
    function espacado(ctx, texto, x, y, esp) {
      for (var i = 0; i < texto.length; i++) {
        ctx.fillText(texto[i], x, y);
        x += ctx.measureText(texto[i]).width + esp;
      }
    }
    function gerar() {
      if (gerando) return gerando;
      gerando = Promise.all([
        document.fonts && document.fonts.load ? Promise.all([
          document.fonts.load('600 80px Fraunces'),
          document.fonts.load('400 40px "Source Sans 3"'),
          document.fonts.load('700 30px "Source Sans 3"')
        ]).catch(function () {}) : null,
        carregaImg(capaSrc),
        carregaImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.logo)),
        carregaImg(posterSrc)
      ]).then(function (r) {
        var capa = r[1], logo = r[2], poster = r[3];
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var x = c.getContext('2d');
        x.fillStyle = T.bg; x.fillRect(0, 0, W, H);
        var g = x.createRadialGradient(W * .85, 0, 0, W * .85, 0, W * 1.1);
        g.addColorStop(0, T.glow1); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        g = x.createRadialGradient(0, H, 0, 0, H, W);
        g.addColorStop(0, T.glow2); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        var capaH = poster ? 980 : 860;
        if (capa) {
          try {
            var s = Math.max(W / capa.naturalWidth, capaH / capa.naturalHeight);
            var cw = capa.naturalWidth * s, ch = capa.naturalHeight * s;
            x.save(); x.beginPath(); x.rect(0, 0, W, capaH); x.clip();
            if (poster) { x.filter = 'blur(22px)'; x.globalAlpha = .35; }
            else x.globalAlpha = .9;
            x.drawImage(capa, (W - cw) / 2, (capaH - ch) / 2, cw, ch);
            x.restore(); x.filter = 'none';
          } catch (e) {}
        }
        g = x.createLinearGradient(0, 0, 0, capaH);
        g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.28, 'rgba(0,0,0,0)');
        g.addColorStop(.62, 'rgba(0,0,0,.15)'); g.addColorStop(1, T.bg);
        x.fillStyle = g; x.fillRect(0, 0, W, capaH + 2);
        if (poster) {
          try {
            var ph = 640, pw = Math.round(ph * poster.naturalWidth / poster.naturalHeight);
            var px = (W - pw) / 2, py = 300;
            x.save(); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 50; x.shadowOffsetY = 20;
            x.fillStyle = '#000'; x.fillRect(px, py, pw, ph); x.restore();
            x.drawImage(poster, px, py, pw, ph);
            x.strokeStyle = T.line; x.lineWidth = 2; x.strokeRect(px, py, pw, ph);
          } catch (e) {}
        }
        var M = 96, y = 230;
        if (logo) {
          var lh = GUIA ? 76 : 86, lw = GUIA ? 76 : 75;
          x.drawImage(logo, M, y - lh + 14, lw, lh);
        }
        x.textBaseline = 'alphabetic';
        x.fillStyle = T.ink; x.font = '700 34px "Source Sans 3", system-ui, sans-serif';
        x.fillText(T.marca, M + 104, y - 22);
        x.fillStyle = T.muted; x.font = '400 28px "Source Sans 3", system-ui, sans-serif';
        x.fillText(GUIA ? 'Lucas Brito Ladeia · OAB/MA 16.091' : 'Advogado · OAB/MA 16.091', M + 104, y + 14);
        y = capaH + 10;
        if (area) {
          x.fillStyle = T.accent; x.font = '700 30px ' + T.kickerFont;
          x.fillRect(M, y - 11, 46, 3);
          espacado(x, area.toUpperCase(), M + 66, y, 5);
        }
        var max = W - M * 2, fs = 86, ls;
        for (; fs >= 54; fs -= 4) {
          x.font = '600 ' + fs + 'px Fraunces, Georgia, serif';
          ls = linhas(x, titulo, max);
          if (ls.length <= 5) break;
        }
        ls = corta(x, ls, 6, max);
        x.fillStyle = T.ink; y += 40 + fs;
        for (var i = 0; i < ls.length; i++) { x.fillText(ls[i], M, y); y += Math.round(fs * 1.14); }
        if (resumo && y < 1480) {
          x.font = '400 38px "Source Sans 3", system-ui, sans-serif';
          x.fillStyle = T.muted;
          var n = Math.max(1, Math.min(4, Math.floor((1560 - y) / 52)));
          var lr = corta(x, linhas(x, resumo, max), n, max);
          y += 22;
          for (i = 0; i < lr.length; i++) { x.fillText(lr[i], M, y + 14); y += 52; }
        }
        var fy = 1640;
        x.strokeStyle = T.line; x.lineWidth = 2;
        x.beginPath(); x.moveTo(M, fy - 70); x.lineTo(W - M, fy - 70); x.stroke();
        x.fillStyle = T.muted; x.font = '400 30px "Source Sans 3", system-ui, sans-serif';
        x.fillText('Leia o artigo completo em', M, fy - 12);
        x.fillStyle = T.accent; x.font = '700 44px "Source Sans 3", system-ui, sans-serif';
        x.fillText(T.dominio, M, fy + 44);
        return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, 'image/jpeg', 0.9); });
      }).then(function (b) {
        if (!b) throw new Error('sem imagem');
        storyBlob = b;
        try { storyFile = new File([b], 'story-' + slug + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }); }
        catch (e) { storyFile = null; }
        if (storyUrl) URL.revokeObjectURL(storyUrl);
        storyUrl = URL.createObjectURL(b);
        storyImg.src = storyUrl;
        return b;
      });
      gerando.then(function () {}, function () { gerando = null; });
      return gerando;
    }

    function podeArquivo() {
      try { return !!(storyFile && navigator.canShare && navigator.canShare({ files: [storyFile] })); }
      catch (e) { return false; }
    }

    function abrirImagem() {
      if (!storyUrl && storyBlob) {
        storyUrl = URL.createObjectURL(storyBlob);
        storyImg.src = storyUrl;
      }
      if (!storyUrl) return;
      var a = document.createElement('a');
      a.href = storyUrl;
      a.download = 'story-' + slug + '.jpg';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      try { window.open(storyUrl, '_blank'); } catch (e) {}
    }

    function tentarShareNativo(dados) {
      return new Promise(function (ok) {
        if (interno || typeof navigator.share !== 'function') { ok(false); return; }
        var acabou = false;
        var timer = setTimeout(function () {
          if (acabou) return;
          acabou = true;
          ok(false);
        }, 900);
        try {
          var ret = navigator.share(dados);
          if (!ret || typeof ret.then !== 'function') {
            clearTimeout(timer); acabou = true; ok(false); return;
          }
          ret.then(function () {
            if (acabou) return;
            clearTimeout(timer); acabou = true; ok(true);
          }, function (e) {
            if (acabou) return;
            clearTimeout(timer); acabou = true;
            ok(!!(e && e.name === 'AbortError'));
          });
        } catch (e) {
          clearTimeout(timer); acabou = true; ok(false);
        }
      });
    }

    function acaoStory() {
      track('story');
      abrirFolha();
      storyArea.removeAttribute('hidden');
      var copiou = copiarTexto(canon);
      msg(copiou ? 'Link copiado. Preparando a imagem…' : 'Preparando a imagem…');
      gerar().then(function () {
        storyArea.removeAttribute('hidden');
        if (podeArquivo() && !interno) {
          tentarShareNativo({ files: [storyFile], title: titulo }).then(function (nativo) {
            if (nativo) msg('Pronto. Se o story pedir o link, ele já está copiado.');
            else msg('Toque e segure a imagem para salvar, ou use Abrir imagem.');
          });
        } else {
          msg('Toque e segure a imagem para salvar, ou use Abrir imagem.');
        }
      }, function () {
        msg(copiou ? 'Não deu para montar a imagem agora. O link do artigo foi copiado.' : 'Não deu para montar a imagem agora. Use Copiar link.');
      });
    }

    function acaoAbrir() {
      track('share');
      abrirFolha();
      if (!interno && typeof navigator.share === 'function') {
        tentarShareNativo({ title: titulo, text: titulo, url: canon }).then(function () {});
      }
    }

    function acaoCopiar() {
      track('copiar');
      abrirFolha();
      msg(copiarTexto(canon) ? 'Link copiado.' : canon);
    }

    function noToque(el, fn) {
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        fn(ev);
      });
    }

    var botoes = document.querySelectorAll('.cmp [data-acao], .cmp [data-rede]');
    for (var i = 0; i < botoes.length; i++) {
      (function (el) {
        var acao = el.getAttribute('data-acao');
        var rede = el.getAttribute('data-rede');
        if (acao === 'abrir') noToque(el, acaoAbrir);
        else if (acao === 'story') noToque(el, acaoStory);
        else if (acao === 'copiar') noToque(el, acaoCopiar);
        else if (acao === 'fechar') noToque(el, fecharFolha);
        else if (acao === 'abrir-img') noToque(el, function () { abrirImagem(); });
        else if (rede) {
          el.addEventListener('click', function () { track(rede); });
        }
      })(botoes[i]);
    }

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !folha.hasAttribute('hidden')) fecharFolha();
    });

    if (document.readyState === 'complete') setTimeout(function () { gerar().then(function () {}, function () {}); }, 600);
    else window.addEventListener('load', function () { setTimeout(function () { gerar().then(function () {}, function () {}); }, 600); });
  }
})();
