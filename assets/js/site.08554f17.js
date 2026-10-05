(function () {
'use strict';
var d = document, w = window;
var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
var raf = w.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
var mostrarTudo = function () { d.documentElement.classList.remove('js'); };
var btn = d.querySelector('.menu-btn'), drawer = d.getElementById('menu-drawer');
if (btn && drawer) {
var open = false;
var setMenu = function (on, semFoco) {
open = on;
btn.setAttribute('aria-expanded', on ? 'true' : 'false');
btn.setAttribute('aria-label', on ? 'Fechar menu' : 'Abrir menu');
drawer.hidden = !on;
d.body.classList.toggle('menu-open', on);
if (on) { var first = drawer.querySelector('.menu-list a'); if (first) first.focus(); } else if (!semFoco) { btn.focus(); }
};
btn.addEventListener('click', function () { setMenu(!open); });
drawer.addEventListener('click', function (e) {
if (e.target === drawer || e.target.closest('[data-menu-close]')) { setMenu(false); return; }
if (e.target.closest('a')) setMenu(false, true);
});
d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setMenu(false); });
w.addEventListener('resize', function () { if (open && w.innerWidth >= 1024) setMenu(false, true); });
w.addEventListener('pageshow', function () { if (open) setMenu(false, true); });
}
try {
var reveals = d.querySelectorAll('.reveal');
if (reveals.length) {
if (!('IntersectionObserver' in w)) {
reveals.forEach(function (el) { el.classList.add('is-in'); });
} else {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
}, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });
reveals.forEach(function (el) {
var r = el.getBoundingClientRect();
if (r.top < w.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); }
});
var fimPagina = function () {
if ((w.scrollY || w.pageYOffset) + w.innerHeight >= d.documentElement.scrollHeight - 4) {
reveals.forEach(function (el) { if (!el.classList.contains('is-in')) { el.classList.add('is-in'); io.unobserve(el); } });
}
};
w.addEventListener('scroll', fimPagina, { passive: true });
}
}
} catch (e) { mostrarTudo(); }
d.querySelectorAll('[data-video]').forEach(function (fig) {
var a = fig.querySelector('.video-poster');
if (!a) return;
a.addEventListener('click', function (e) {
e.preventDefault();
var id = fig.getAttribute('data-video'), title = fig.getAttribute('data-video-title') || 'Vídeo';
var f = d.createElement('iframe');
f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
f.title = title; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.setAttribute('allowfullscreen', '');
f.width = '1600'; f.height = '900'; f.loading = 'eager';
a.replaceWith(f);
try { f.focus(); } catch (err) {}
});
});
var casos = d.querySelectorAll('video[data-caso]');
casos.forEach(function (v) {
v.addEventListener('play', function () { casos.forEach(function (o) { if (o !== v && !o.paused) o.pause(); }); });
});
var header = d.querySelector('.site-header');
if (header) {
var hs = function () { header.classList.toggle('is-scrolled', (w.scrollY || w.pageYOffset) > 4); };
w.addEventListener('scroll', hs, { passive: true });
hs();
}
var etapas = d.querySelectorAll('[data-etapas]');
if (etapas.length) {
var updEtapas = function () {
etapas.forEach(function (ol) {
var r = ol.getBoundingClientRect(), items = ol.querySelectorAll(ol.getAttribute('data-etapas-sel') || '.etapa-item');
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
var autos = d.querySelectorAll('video[data-autoplay]');
if (autos.length && 'IntersectionObserver' in w) {
var ioV = new IntersectionObserver(function (es) {
es.forEach(function (en) {
var v = en.target;
if (en.isIntersecting) { v.muted = true; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
else if (!v.paused) { v.pause(); }
});
}, { threshold: 0.25 });
autos.forEach(function (v) { ioV.observe(v); });
}
var mvs = d.querySelectorAll('[data-mv]');
if (mvs.length && 'IntersectionObserver' in w) {
var ioM = new IntersectionObserver(function (es) {
es.forEach(function (en) { en.target.classList.toggle('mv-on', en.isIntersecting); });
}, { threshold: 0.2 });
mvs.forEach(function (m) { ioM.observe(m); });
}
d.querySelectorAll('[data-pub]').forEach(function (trilho) {
var nav = trilho.parentNode.querySelector('[data-pub-nav]');
if (!nav) return;
var prev = nav.querySelector('[data-pub-prev]'), next = nav.querySelector('[data-pub-next]');
var upd = function () {
var sobra = trilho.scrollWidth - trilho.clientWidth;
nav.hidden = sobra < 8;
prev.disabled = trilho.scrollLeft < 8;
next.disabled = trilho.scrollLeft > sobra - 8;
};
var passo = function (dir) {
var c = trilho.querySelector('.pub-card'), gap = parseFloat(getComputedStyle(trilho).columnGap) || 16;
trilho.scrollBy({ left: dir * ((c ? c.offsetWidth : 280) + gap) });
};
prev.addEventListener('click', function () { passo(-1); });
next.addEventListener('click', function () { passo(1); });
trilho.addEventListener('scroll', function () { raf(upd); }, { passive: true });
w.addEventListener('resize', upd);
upd();
});
d.querySelectorAll('[data-mapa]').forEach(function (box) {
box.querySelectorAll('[data-pin-for]').forEach(function (li) {
var pin = box.querySelector('[data-pin="' + li.getAttribute('data-pin-for') + '"]');
if (!pin) return;
li.addEventListener('mouseenter', function () { pin.classList.add('is-hot'); });
li.addEventListener('mouseleave', function () { pin.classList.remove('is-hot'); });
});
});
var nums = d.querySelectorAll('.stat-n, [data-count]');
if (nums.length && 'IntersectionObserver' in w) {
var contar = function (el) {
var txt = el.textContent.trim(), m = txt.match(/^([^0-9]*)(\d+)(?:([.,])(\d+))?(.*)$/);
if (!m) return;
var pre = m[1], sep = m[3] || '', dec = m[4] ? m[4].length : 0, suf = m[5];
var fim = parseFloat(m[2] + (m[4] ? '.' + m[4] : '')), dur = reduce ? 1600 : 1400, t0 = null;
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
d.querySelectorAll('[data-copy]').forEach(function (b) {
b.addEventListener('click', function () {
var url = b.getAttribute('data-copy'), fb = b.parentNode.querySelector('.share-feedback');
var done = function (ok) { if (fb) { fb.textContent = ok ? 'Link copiado' : 'Copie o endereço da barra do navegador'; setTimeout(function () { fb.textContent = ''; }, 2500); } };
if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); }); }
else { done(false); }
});
});
var tables = d.querySelectorAll('.table-scroll');
var checkTables = function () { tables.forEach(function (t) { if (t.scrollWidth > t.clientWidth + 2) t.setAttribute('data-scroll', ''); else t.removeAttribute('data-scroll'); }); };
if (tables.length) { checkTables(); w.addEventListener('resize', checkTables); }
var form = d.querySelector('form[data-mailto]');
if (form) {
form.addEventListener('submit', function (e) {
e.preventDefault();
var msg = form.querySelector('.form-msg'), get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
if (get('site')) return;
if (!get('nome') || !get('email')) { if (msg) { msg.textContent = 'Preencha pelo menos nome e e-mail.'; msg.classList.add('is-error'); } return; }
var body = ['Nome: ' + get('nome'), 'E-mail: ' + get('email'), 'Telefone: ' + get('telefone'), 'Clínica: ' + get('clinica'), '', get('mensagem')].join('\n');
var href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent('Contato pelo site: ' + get('clinica') || 'Contato pelo site') + '&body=' + encodeURIComponent(body);
if (msg) { msg.classList.remove('is-error'); msg.textContent = 'Abrindo o seu aplicativo de e-mail. Se nada acontecer, escreva para ' + form.getAttribute('data-mailto') + '.'; }
w.location.href = href;
});
}
d.querySelectorAll('[data-parc]').forEach(function (box) {
var sl = box.querySelectorAll('.parc-slide'), nav = box.querySelector('[data-parc-nav]');
if (sl.length < 2 || !nav) return;
var dots = nav.querySelectorAll('[data-parc-dot]'), cur = 0, timer = null, vis = false, T = reduce ? 9000 : 6000;
var hold = { mouse: false, foco: false, toque: false }, tq = null, x0 = null;
var parado = function () { return hold.mouse || hold.foco || hold.toque || !vis; };
var go = function (i) {
cur = (i + sl.length) % sl.length;
sl.forEach(function (s, k) { s.classList.toggle('is-cur', k === cur); });
dots.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
};
var stop = function () { clearTimeout(timer); timer = null; box.classList.remove('parc-play'); };
var play = function () {
stop();
if (parado()) return;
void box.offsetWidth;
box.classList.add('parc-play');
timer = setTimeout(function () { go(cur + 1); play(); }, T);
};
box.style.setProperty('--t', T + 'ms');
box.classList.add('parc-on');
nav.hidden = false;
go(0);
nav.addEventListener('click', function (e) {
var b = e.target.closest('button');
if (!b) return;
if (b.hasAttribute('data-parc-dot')) go(+b.getAttribute('data-parc-dot')); else go(cur + (+b.getAttribute('data-parc-go')));
play();
});
box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hold.mouse = true; stop(); } });
box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hold.mouse = false; play(); } });
box.addEventListener('focusin', function () { hold.foco = true; stop(); });
box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) { hold.foco = false; play(); } });
box.addEventListener('touchstart', function (e) {
x0 = e.touches[0].clientX; hold.toque = true; stop();
clearTimeout(tq); tq = setTimeout(function () { hold.toque = false; play(); }, 8000);
}, { passive: true });
box.addEventListener('touchend', function (e) {
var dx = x0 === null ? 0 : e.changedTouches[0].clientX - x0; x0 = null;
if (Math.abs(dx) > 48) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });
if ('IntersectionObserver' in w) {
new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) play(); else stop(); }, { threshold: 0.3 }).observe(box);
} else { vis = true; play(); }
});
var capas = d.querySelectorAll('video[data-capa]');
if (capas.length && !reduce && 'IntersectionObserver' in w) {
var temHover = w.matchMedia && w.matchMedia('(hover: hover)').matches;
var tocar = function (v) { v.muted = true; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
var ioC = new IntersectionObserver(function (es) {
es.forEach(function (en) { if (en.isIntersecting) tocar(en.target); else if (!en.target.paused) en.target.pause(); });
}, { threshold: 0.6 });
capas.forEach(function (v) {
v.addEventListener('playing', function () { v.classList.add('is-on'); });
v.addEventListener('pause', function () { v.classList.remove('is-on'); });
if (v.getAttribute('data-capa') === 'hover' && temHover) {
var card = v.closest('article') || v.parentNode;
card.addEventListener('mouseenter', function () { tocar(v); });
card.addEventListener('mouseleave', function () { v.pause(); });
} else { ioC.observe(v); }
});
}
d.querySelectorAll('form[data-news]').forEach(function (f) {
var msg = f.querySelector('.news-msg'), inp = f.querySelector('input[type="email"]');
var dizer = function (t, erro) { msg.textContent = t; msg.classList.toggle('is-error', !!erro); };
var porEmail = function (email) {
var para = f.getAttribute('data-mail');
var corpo = 'Quero receber a newsletter semanal da ClintIA.\n\nMeu e-mail: ' + email;
dizer('Abrimos o seu aplicativo de e-mail com o pedido pronto. É só enviar: a inscrição é confirmada por e-mail. Se nada abriu, escreva para ' + para + '.');
var a = d.createElement('a');
a.href = 'mailto:' + para + '?subject=' + encodeURIComponent(f.getAttribute('data-assunto')) + '&body=' + encodeURIComponent(corpo);
a.hidden = true; d.body.appendChild(a); a.click(); d.body.removeChild(a);
};
f.addEventListener('submit', function (e) {
e.preventDefault();
var email = inp.value.trim(), url = f.getAttribute('data-endpoint');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { dizer('Confira o e-mail digitado.', true); inp.focus(); return; }
if (!url || !w.fetch) { porEmail(email); return; }
dizer('Enviando...');
w.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email: email }) })
.then(function (r) { if (!r.ok) throw new Error(r.status); dizer('Pedido recebido. Confira o seu e-mail para confirmar a inscrição.'); f.reset(); })
.catch(function () { porEmail(email); });
});
});
d.querySelectorAll('.house-ad').forEach(function (a) {
a.addEventListener('click', function () {
if (typeof w.gtag === 'function') { w.gtag('event', 'house_ad_click', { ad: a.getAttribute('data-ad'), format: a.getAttribute('data-format'), page: location.pathname }); }
});
});
})();