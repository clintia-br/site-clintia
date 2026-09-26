/* clintia.com.br | JS minimo, sem dependencias: menu mobile, reveal de entrada (IntersectionObserver; o CSS decide o quanto
   anima e respeita prefers-reduced-motion), hairline do cabecalho ao rolar, linha das 4 etapas que se desenha na rolagem,
   contadores dos numeros, progresso de leitura, TOC ativo, copiar link, dica de tabela com rolagem, formulario via mailto.
   Se qualquer trecho falhar, a classe .js sai do <html> e todo o conteudo fica visivel. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = w.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var mostrarTudo = function () { d.documentElement.classList.remove('js'); };

  /* Menu mobile */
  var btn = d.querySelector('.menu-btn'), drawer = d.getElementById('menu-drawer');
  if (btn && drawer) {
    var open = false;
    var setMenu = function (on) {
      open = on;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Fechar menu' : 'Abrir menu');
      drawer.hidden = !on;
      d.body.classList.toggle('menu-open', on);
      if (on) { var first = drawer.querySelector('a'); if (first) first.focus(); } else { btn.focus(); }
    };
    btn.addEventListener('click', function () { setMenu(!open); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setMenu(false); });
    w.addEventListener('resize', function () { if (open && w.innerWidth >= 1024) setMenu(false); });
  }

  /* Reveal de entrada. O que esta na primeira dobra entra na hora; o resto entra quando aparece. Sem IntersectionObserver, tudo visivel. */
  try {
    var reveals = d.querySelectorAll('.reveal');
    if (reveals.length) {
      if (!('IntersectionObserver' in w)) {
        reveals.forEach(function (el) { el.classList.add('is-in'); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
        }, { threshold: 0.01, rootMargin: '0px' });
        reveals.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < w.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } /* qualquer secao que toque a dobra ja entra visivel */
        });
      }
    }
  } catch (e) { mostrarTudo(); }

  /* Video do hero: toca por cima da foto (poster) e entra em fade quando comeca; pausa fora da tela. Com movimento
     reduzido continua tocando (e lento, sem corte). */
  var hv = d.querySelector('[data-hero-video]');
  if (hv) {
    /* Toca tambem com movimento reduzido: e um plano lento em ida e volta, sem corte (decisao do Bernardo, 26/09). */
    {
      hv.muted = true;
      hv.addEventListener('playing', function () { hv.classList.add('is-playing'); });
      var tentar = function () { var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {}); };
      if ('IntersectionObserver' in w) {
        new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) tentar(); else hv.pause(); }); }, { threshold: 0.05 }).observe(hv);
      } else { tentar(); }
    }
  }

  /* Cabecalho: hairline so depois de rolar */
  var header = d.querySelector('.site-header');
  if (header) {
    var hs = function () { header.classList.toggle('is-scrolled', (w.scrollY || w.pageYOffset) > 4); };
    w.addEventListener('scroll', hs, { passive: true });
    hs();
  }

  /* As 4 etapas: a linha (--p, de 0 a 1) se desenha conforme a lista entra na tela; cada numero acende quando a linha passa por ele.
     Com movimento reduzido a linha nasce pronta e os quatro numeros ja acesos. */
  var etapas = d.querySelectorAll('[data-etapas]');
  if (etapas.length) {
    var updEtapas = function () {
      etapas.forEach(function (ol) {
        var r = ol.getBoundingClientRect(), items = ol.querySelectorAll('.etapa-item');
        var p = Math.max(0, Math.min(1, (w.innerHeight * 0.85 - r.top) / Math.max(1, r.height)));
        ol.style.setProperty('--p', p.toFixed(3));
        items.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.5) / items.length); });
      });
    };
    var etTick = false;
    w.addEventListener('scroll', function () { if (!etTick) { etTick = true; raf(function () { updEtapas(); etTick = false; }); } }, { passive: true });
    w.addEventListener('resize', updEtapas);
    updEtapas();
  }

  /* Contadores: o numero sobe de 0 ao valor quando entra na tela (mantem prefixo, separador decimal e sufixo do texto original) */
  var nums = d.querySelectorAll('.stat-n');
  if (nums.length && 'IntersectionObserver' in w) {
    var contar = function (el) {
      var txt = el.textContent.trim(), m = txt.match(/^([^0-9]*)(\d+)(?:([.,])(\d+))?(.*)$/);
      if (!m) return;
      var pre = m[1], sep = m[3] || '', dec = m[4] ? m[4].length : 0, suf = m[5];
      var fim = parseFloat(m[2] + (m[4] ? '.' + m[4] : '')), dur = reduce ? 500 : 1100, t0 = null;
      var fmt = function (v) { var s = v.toFixed(dec); if (sep) s = s.replace('.', sep); return pre + s + suf; };
      var passo = function (ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        k = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? fmt(fim * k) : txt;
        if (k < 1) raf(passo);
      };
      el.textContent = fmt(0);
      raf(passo);
    };
    var ioN = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { ioN.unobserve(en.target); contar(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { ioN.observe(n); });
  }

  /* Barra de progresso de leitura (scroll-linked, sem transicao) */
  var bar = d.querySelector('.reading-progress'), article = d.querySelector('.article-body');
  if (bar && article) {
    var ticking = false;
    var update = function () {
      var top = article.offsetTop, h = article.offsetHeight, y = w.scrollY || w.pageYOffset;
      var total = top + h - w.innerHeight, p = total > 0 ? (y / total) * 100 : 100;
      bar.style.width = Math.max(0, Math.min(100, p)) + '%';
      ticking = false;
    };
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    update();
  }

  /* TOC ativo: calculo no scroll (dentro do requestAnimationFrame), sem IntersectionObserver. Ativo = o ultimo titulo
     cujo topo ja passou de 120 px (um heading parado em scroll-margin-top, 96 px, depois do clique conta; ao rolar
     para cima volta ao anterior). O clique fixa o item por 1,2 s para o scroll suave nao piscar. */
  var tocLinks = d.querySelectorAll('.article-toc a[href^="#"]');
  if (tocLinks.length) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var heads = Object.keys(map).map(function (id) { return d.getElementById(id); }).filter(Boolean);
    var current = null, pinned = null, pinnedUntil = 0, pinTimer = null;
    var setActive = function (id) {
      if (current === id) return;
      current = id;
      tocLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
    };
    var pick = function () {
      if (!heads.length) return;
      if (pinned && Date.now() < pinnedUntil) { setActive(pinned); return; }
      pinned = null;
      var chosen = heads[0].id;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top <= 120) { chosen = heads[i].id; } else { break; }
      }
      var y = w.scrollY || w.pageYOffset;
      if (y + w.innerHeight >= d.documentElement.scrollHeight - 2) { chosen = heads[heads.length - 1].id; }
      setActive(chosen);
    };
    var tocTick = false;
    w.addEventListener('scroll', function () { if (!tocTick) { tocTick = true; raf(function () { pick(); tocTick = false; }); } }, { passive: true });
    w.addEventListener('resize', pick);
    tocLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        pinned = a.getAttribute('href').slice(1); pinnedUntil = Date.now() + 1200; setActive(pinned);
        clearTimeout(pinTimer); pinTimer = setTimeout(function () { pinned = null; pick(); }, 1250);
      });
    });
    pick();
  }

  /* Copiar link */
  d.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-copy'), fb = b.parentNode.querySelector('.share-feedback');
      var done = function (ok) { if (fb) { fb.textContent = ok ? 'Link copiado' : 'Copie o endereço da barra do navegador'; setTimeout(function () { fb.textContent = ''; }, 2500); } };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); }
      else { done(false); }
    });
  });

  /* Tabelas com rolagem horizontal: marca a dica so quando precisa */
  var tables = d.querySelectorAll('.table-scroll');
  var checkTables = function () { tables.forEach(function (t) { if (t.scrollWidth > t.clientWidth + 2) t.setAttribute('data-scroll', ''); else t.removeAttribute('data-scroll'); }); };
  if (tables.length) { checkTables(); w.addEventListener('resize', checkTables); }

  /* Formulario de contato: monta um mailto com os campos (sem backend no v1) */
  var form = d.querySelector('form[data-mailto]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg'), get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      if (get('site')) return; /* honeypot */
      if (!get('nome') || !get('email')) { if (msg) { msg.textContent = 'Preencha pelo menos nome e e-mail.'; msg.classList.add('is-error'); } return; }
      var body = ['Nome: ' + get('nome'), 'E-mail: ' + get('email'), 'WhatsApp: ' + get('whatsapp'), 'Clínica: ' + get('clinica'), '', get('mensagem')].join('\n');
      var href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent('Contato pelo site: ' + get('clinica') || 'Contato pelo site') + '&body=' + encodeURIComponent(body);
      if (msg) { msg.classList.remove('is-error'); msg.textContent = 'Abrindo o seu aplicativo de e-mail. Se nada acontecer, escreva para ' + form.getAttribute('data-mailto') + '.'; }
      w.location.href = href;
    });
  }

  /* Cliques em house-ad (GA4, se existir) */
  d.querySelectorAll('.house-ad').forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof w.gtag === 'function') { w.gtag('event', 'house_ad_click', { ad: a.getAttribute('data-ad'), format: a.getAttribute('data-format'), page: location.pathname }); }
    });
  });
})();
