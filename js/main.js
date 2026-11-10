// ─── Brand taglines ───
(function () {
  document.addEventListener('DOMContentLoaded', function () {
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
  var vids = slides.map(function (s) { return s.querySelector('video'); });
  function playAll() {
    vids.forEach(function (v) {
      if (!v) return;
      v.muted = true;            // set as property too — iOS needs this for muted autoplay
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }
  function show(n) {
    slides.forEach(function (s, k) { s.classList.toggle('active', k === n); });
    caps.forEach(function (c, k) { c.classList.toggle('active', k === n); });
    dots.forEach(function (d, k) { d.classList.toggle('active', k === n); });
    i = n;
  }
  function next() { show((i + 1) % slides.length); }
  function start() { timer = setInterval(next, DURATION); }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); clearInterval(timer); start(); }); });
  show(0); playAll(); start();
  // All slides play underneath and crossfade; keep nudging playback for stubborn mobile browsers
  ['touchstart', 'click', 'scroll'].forEach(function (evt) {
    window.addEventListener(evt, playAll, { once: true, passive: true });
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) playAll(); });
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
