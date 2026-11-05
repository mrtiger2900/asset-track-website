// ─── Theme (dark / light) ───
(function () {
  var root = document.documentElement;
  try {
    var p = (location.search + location.hash).toLowerCase();
    var forced = /light/.test(p) ? 'light' : (/dark/.test(p) ? 'dark' : null);
    var saved = forced || localStorage.getItem('at-theme') || 'light';
    root.setAttribute('data-theme', saved);
    if (forced) { try { localStorage.setItem('at-theme', forced); } catch (e) {} }
  } catch (e) {}
  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  var SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
  function iconFor() { return current() === 'light' ? MOON : SUN; }
  function makeToggle() {
    var b = document.createElement('button');
    b.className = 'theme-toggle'; b.type = 'button';
    b.setAttribute('aria-label', 'Toggle light / dark theme');
    b.innerHTML = iconFor();
    b.addEventListener('click', function () {
      var next = current() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('at-theme', next); } catch (e) {}
      document.querySelectorAll('.theme-toggle').forEach(function (t) { t.innerHTML = iconFor(); });
    });
    return b;
  }
  document.addEventListener('DOMContentLoaded', function () {
    var cta = document.querySelector('.nav-links .nav-cta');
    if (cta) cta.parentNode.insertBefore(makeToggle(), cta);
    // Nav tagline
    var logo = document.querySelector('.nav-logo');
    if (logo && !logo.querySelector('.nav-tagline')) {
      var t = document.createElement('span');
      t.className = 'nav-tagline'; t.textContent = 'Visibility That Matters';
      logo.appendChild(t);
    }
    // Footer tagline
    var fb = document.querySelector('.footer-brand');
    if (fb && !fb.querySelector('.footer-tagline')) {
      var ft = document.createElement('div');
      ft.className = 'footer-tagline'; ft.innerHTML = 'Visibility That <span>Matters</span>';
      var img = fb.querySelector('img');
      if (img && img.nextSibling) fb.insertBefore(ft, img.nextSibling); else fb.appendChild(ft);
    }
  });
})();

// ─── Nav scroll state ───
var nav = document.getElementById('navbar');
if (nav) window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 40); });

// ─── Mobile menu ───
function toggleMenu() { var l = document.querySelector('.nav-links'); if (l) l.classList.toggle('open'); }

// ─── Fade-in on scroll ───
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(function (el) { io.observe(el); });

// ─── Homepage video slideshow ───
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var caps = Array.prototype.slice.call(document.querySelectorAll('.slide-cap'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.slide-dot'));
  if (!slides.length) return;
  var i = 0, DURATION = 5500, timer;
  function show(n) {
    slides.forEach(function (s, k) { s.classList.toggle('active', k === n); });
    caps.forEach(function (c, k) { c.classList.toggle('active', k === n); });
    dots.forEach(function (d, k) { d.classList.toggle('active', k === n); });
    var v = slides[n].querySelector('video');
    if (v) { try { v.currentTime = 0; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
    i = n;
  }
  function next() { show((i + 1) % slides.length); }
  function start() { timer = setInterval(next, DURATION); }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); clearInterval(timer); start(); }); });
  show(0); start();
  // Fallback: some mobile browsers block programmatic autoplay until the first touch
  function kick() { var a = document.querySelector('.slide.active video'); if (a) { var p = a.play(); if (p && p.catch) p.catch(function () {}); } }
  ['touchstart', 'click', 'scroll'].forEach(function (evt) {
    window.addEventListener(evt, kick, { once: true, passive: true });
  });
})();

// ─── Contact form (demo) ───
document.querySelectorAll('form[data-contact]').forEach(function (f) {
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = f.querySelector('.form-submit');
    btn.textContent = 'Message Sent  ✓'; btn.style.background = '#16a34a';
    f.querySelectorAll('input,textarea,select').forEach(function (el) { el.value = ''; });
  });
});

// ─── Active nav link ───
(function () {
  var path = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-item').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
})();
