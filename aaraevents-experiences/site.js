/* Aara Events & Experiences: plain JS, no library. WhatsApp links work without it (real hrefs in the HTML). */
(function () {
  'use strict';
  window.__aara = 1;
  var d = document, root = d.documentElement;
  var WA = 'https://wa.me/919677218580?text=';
  var motion = root.classList.contains('motion');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* ---------- menu sheet ---------- */
  var menuBtn = $('#menuBtn'), sheet = $('#sheet');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.classList.toggle('menu-open', open);
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add('open'); }); });
      $('a', sheet).focus({ preventScroll: true });
    } else {
      sheet.classList.remove('open');
      setTimeout(function () { if (!sheet.classList.contains('open')) sheet.hidden = true; }, 260);
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  d.addEventListener('keydown', function (e) {
    if (!d.body.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
    else if (e.key === 'Tab') { // keep focus in the menu and its close button
      var f = [menuBtn].concat($$('a', sheet)), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (f.indexOf(d.activeElement) < 0) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- scroll scenes: reveal once, never hide again ---------- */
  var rv = $$('[data-rv]');
  function stagger(el) {
    var kids = el.matches('[data-rv="grid"]') ? $$(':scope > li', el) : [];
    kids.forEach(function (k, i) { k.style.transitionDelay = Math.min(i * 80, 480) + 'ms'; });
  }
  function show(el) { if (!el.classList.contains('in')) { stagger(el); el.classList.add('in'); } }
  if (!motion || !('IntersectionObserver' in window)) { rv.forEach(show); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    rv.forEach(function (el) { io.observe(el); });
    // a fast flick can skip past a section: reveal anything already above the bottom of the screen
    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false;
        rv.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight * 0.92) show(el); });
      });
    }, { passive: true });
  }

  /* ---------- hero: pause the light wash off screen; phone bar after the hero ---------- */
  var hero = $('.hero'), mbar = $('#mbar'), contact = $('#contact');
  var heroOut = false, contactIn = false;
  function bar() { mbar.classList.toggle('on', heroOut && !contactIn && !d.body.classList.contains('menu-open')); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { heroOut = !e.isIntersecting; hero.classList.toggle('off', heroOut); bar(); });
    }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { contactIn = e.isIntersecting; bar(); });
    }, { threshold: 0.15 }).observe(contact);
  }
  d.addEventListener('visibilitychange', function () { hero.classList.toggle('off', d.hidden || heroOut); });

  /* ---------- lightbox ---------- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), shots = $$('.shot'), at = 0, opener = null;
  function load(i) {
    at = (i + shots.length) % shots.length;
    var s = shots[at], name = s.dataset.full, ws = s.dataset.fw.split(',');
    lbImg.removeAttribute('src');
    lbImg.srcset = ws.map(function (w) { return 'assets/img/' + name + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    lbImg.sizes = '(min-width: 900px) 70vw, 100vw';
    lbImg.src = 'assets/img/' + name + '-' + ws[ws.length - 1] + '.webp';
    lbImg.alt = $('img', s).alt;
    lbCap.textContent = s.dataset.cap + '  ·  ' + (at + 1) + ' / ' + shots.length;
  }
  function openLb(i) {
    opener = d.activeElement; load(i); lb.hidden = false; d.body.style.overflow = 'hidden'; $('#lbX').focus();
    mbar.classList.remove('on');
  }
  function closeLb() { lb.hidden = true; d.body.style.overflow = ''; bar(); if (opener) opener.focus(); }
  // the grid uses CSS columns, so follow what the eye reads (top to bottom, then left to right), not the DOM order
  function readingOrder() {
    var all = $$('.shot');
    return all.map(function (el) { var r = el.getBoundingClientRect(); return { el: el, t: Math.round(r.top / 40), l: r.left }; })
      .sort(function (a, b) { return a.t - b.t || a.l - b.l; }).map(function (x) { return x.el; });
  }
  $$('.shot').forEach(function (s) { s.addEventListener('click', function () { shots = readingOrder(); openLb(shots.indexOf(s)); }); });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', function () { load(at - 1); });
  $('#lbN').addEventListener('click', function () { load(at + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') load(at - 1);
    else if (e.key === 'ArrowRight') load(at + 1);
    else if (e.key === 'Tab') { // keep focus inside the dialog
      var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lb.addEventListener('pointercancel', function () { sx = null; });
  lb.addEventListener('pointerup', function (e) {
    if (sx === null) return; var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) load(at + (dx < 0 ? 1 : -1));
  });

  /* ---------- enquiry: builds the WhatsApp message ---------- */
  var fType = $('#fType'), fDate = $('#fDate'), fVenue = $('#fVenue'), fName = $('#fName'), bubble = $('#bubble'), send = $('#send');
  function niceDate(v) {
    if (!v) return '';
    var p = v.split('-'); if (p.length !== 3) return v;
    var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return (+p[2]) + ' ' + m[+p[1] - 1] + ' ' + p[0];
  }
  function msg() {
    var t = fType.value ? fType.value.toLowerCase() : '';
    var what = t && t !== 'something else' ? (/^[aeiou]/.test(t) ? 'an ' : 'a ') + t : 'an event';
    var s = "Hi Aara Events, I'd like to enquire about " + what;
    if (fDate.value) s += ' on ' + niceDate(fDate.value);
    if (fVenue.value.trim()) s += ' at ' + fVenue.value.trim();
    s += '.';
    if (fName.value.trim()) s += ' My name is ' + fName.value.trim() + '.';
    return s;
  }
  function update() { var m = msg(); bubble.textContent = m; send.href = WA + encodeURIComponent(m); }
  [fType, fDate, fVenue, fName].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
  update();
  // closing moment: a tick on the button while WhatsApp opens (never delays the link)
  send.addEventListener('click', function () {
    update(); send.classList.add('sent');
    setTimeout(function () { send.classList.remove('sent'); }, 1400);
  });
})();
