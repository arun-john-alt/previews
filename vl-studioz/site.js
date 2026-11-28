(function () {
  'use strict';
  var D = document.documentElement;
  var calm = D.classList.contains('calm');
  var PHONE = '918072646924';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function waLink(t) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t); }

  /* ================= The VL Studioz wordmark, rebuilt as vector (sharp at any size) ================= */
  (function () {
    var NS = 'http://www.w3.org/2000/svg', defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('width', '0'); defs.setAttribute('height', '0'); defs.setAttribute('aria-hidden', 'true'); defs.style.cssText = 'position:absolute;width:0;height:0';
    defs.innerHTML = '<defs>' +
      '<linearGradient id="vlGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".38" stop-color="#f1cf74"/><stop offset=".72" stop-color="#d9a940"/><stop offset="1" stop-color="#f4d888"/></linearGradient>' +
      '<linearGradient id="vlShineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '</defs>';
    document.body.appendChild(defs);
    var n = 0;
    $$('.logo').forEach(function (el) {
      var id = 'vlc' + (++n);
      var t = '<text class="vl-t vl-main" x="500" y="168" text-anchor="middle" textLength="980" lengthAdjust="spacingAndGlyphs">VL STUDIOZ</text>' +
              '<text class="vl-t vl-sub" x="500" y="240" text-anchor="middle" textLength="760" lengthAdjust="spacingAndGlyphs">PHOTOGRAPHY &amp; VIDEOGRAPHY</text>';
      el.innerHTML = '<svg class="vlogo" viewBox="0 0 1000 256" role="img" aria-label="VL Studioz, photography and videography">' +
        '<clipPath id="' + id + '">' + t + '</clipPath>' + t +
        '<g clip-path="url(#' + id + ')"><rect class="vl-shine" x="-260" y="0" width="240" height="256" fill="url(#vlShineG)"/></g></svg>';
    });
  })();

  /* ================= Content: recent work ================= */
  // [file, category, shape]  shape: '' normal, 't' tall, 'w' wide
  var WORK = [
    ['bride-moon_1', 'bride'], ['j-gal-44', 'bride'], ['dark-a_4', 'couple'], ['j-gal-38', 'day'],
    ['silhouette-arch_1', 'bride'], ['j-gal-46', 'bride'], ['j-gal-43', 'day'], ['dark-a_1', 'couple'],
    ['bride-timeless_1', 'couple'], ['bride-orange_2', 'bride'], ['reception-grace_2', 'day'],
    ['j-gal-48', 'bride'], ['bride-moon_3', 'bride']
  ];
  var LBL = { bride: 'Bride', couple: 'Couple', day: 'Wedding day' };
  var DIMS = {'bride-dance_1':[1600,1067],'bride-jewellery_1':[1080,608],'bride-jewellery_2':[1080,608],'bride-moon_1':[1080,1350],'bride-moon_2':[1080,1350],'bride-moon_3':[1080,1350],'bride-moon_5':[1080,1350],'bride-orange_1':[1080,1350],'bride-orange_2':[1080,1350],'bride-timeless_1':[1080,1350],'bride-timeless_2':[1080,1350],'bride-timeless_3':[1080,1350],'couple-red_1':[1600,1067],'couple-red_2':[1600,1067],'couple-terrace_3':[1080,1350],'dark-a_1':[1080,1350],'dark-a_2':[1080,1350],'dark-a_3':[1080,1350],'dark-a_4':[1080,1350],'j-gal-22':[1067,1600],'j-gal-24':[1080,1350],'j-gal-25':[1067,1600],'j-gal-28':[1067,1600],'j-gal-32':[1067,1600],'j-gal-34':[1600,1067],'j-gal-36':[1067,1600],'j-gal-37':[1600,1067],'j-gal-38':[1600,1067],'j-gal-39':[1067,1600],'j-gal-40':[1600,1067],'j-gal-41':[1600,1067],'j-gal-43':[1600,1067],'j-gal-44':[1600,1067],'j-gal-46':[1600,1067],'j-gal-47':[1600,1067],'j-gal-48':[1600,1067],'j-gal-49':[1067,1600],'j-gal-53':[1067,1600],'j-home-01':[1067,1600],'j-home-02':[1600,1067],'j-home-03':[1600,1067],'old-07_1':[1600,1067],'old-11_1':[1080,1350],'old-11_2':[1080,1350],'old-12_1':[1080,1350],'old-12_2':[1080,1350],'old-16_1':[1440,1440],'reception-grace_1':[1080,1350],'reception-grace_2':[1080,1350],'reception-grace_3':[896,1350],'reception-lanterns_1':[1080,1350],'reception-lanterns_2':[1080,1350],'silhouette-arch_1':[1080,1350],'silhouette-white_2':[1080,1350],'silhouette-white_3':[1080,1350],'silhouette-white_4':[1080,1350],'wedding-garlands_2':[1080,1350],'wedding-garlands_3':[1080,1350],'wedding-vazhithunaiye_1':[1080,1350]};
  var grid = $('#grid');
  WORK.forEach(function (w, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tile'; b.setAttribute('data-c', w[1]); b.setAttribute('data-cursor', 'View');
    b.setAttribute('aria-label', 'Open photo: ' + LBL[w[1]].toLowerCase() + ', ' + (i + 1) + ' of ' + WORK.length);
    var dm = DIMS[w[0]] || [4, 5];
    b.innerHTML = '<img src="img/s/' + w[0] + '.jpg" data-full="img/' + w[0] + '.jpg" width="' + dm[0] + '" height="' + dm[1] + '" alt="' + LBL[w[1]] + ' photo by VL Studioz" loading="lazy" decoding="async">';
    grid.appendChild(b);
  });
  var tiles = $$('.tile', grid);

  // Wedding-day frames: keep each photo whole, with a blurred copy of itself filling the frame.
  $$('#dayStage figure').forEach(function (f, k) { f.style.zIndex = k + 1; f.style.isolation = 'isolate'; var im = $('img', f); var b = im.cloneNode(); b.setAttribute('data-src', im.getAttribute('data-src').replace('img/', 'img/s/')); b.className = 'dbg'; b.alt = ''; b.setAttribute('aria-hidden', 'true'); f.appendChild(b); });
  // Photos below the first screen load only when they are about to be needed.
  var loadHC = function () { $$('.hc img[data-src]').forEach(function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }); };
  if (calm) loadHC(); else { window.addEventListener('scroll', loadHC, { once: true, passive: true }); setTimeout(loadHC, 3500); }
  if ('IntersectionObserver' in window) {
    var dayIO = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { $$('#dayStage img[data-src]').forEach(function (im) { im.loading = 'eager'; im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }); dayIO.disconnect(); } }, { rootMargin: '200% 0px' });
    dayIO.observe($('.day'));
  } else $$('#dayStage img[data-src]').forEach(function (im) { im.src = im.getAttribute('data-src'); });
  if (calm) $$('#dayStage img[data-src]').forEach(function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); });

  /* ================= Liquid glass: real refraction at the rim (Chromium), lit edges everywhere =================
     For each glass control, at its exact size:
     - a displacement map from a convex-squircle bevel, bent by Snell's law (glass index 1.5),
       encoded in R/G around 128 and fed to feDisplacementMap through backdrop-filter;
     - a specular rim from a fixed top-left light, painted as the element's ::after. */
  var LG = (function () {
    var chromium = /Chrome\/|Edg\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent);
    var svgNS = 'http://www.w3.org/2000/svg', defs = document.createElementNS(svgNS, 'svg'), seq = 0;
    defs.setAttribute('width', '0'); defs.setAttribute('height', '0'); defs.setAttribute('aria-hidden', 'true');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    document.body.appendChild(defs);
    // refraction magnitude across the bevel: t = 0 at the outer edge, 1 where the glass turns flat
    var N = 128, prof = [], maxM = 0;
    function h(t) { t = Math.min(1, Math.max(0, t)); return Math.pow(1 - Math.pow(1 - t, 4), .25); }
    for (var i = 0; i < N; i++) {
      var t = (i + .5) / N, d = .001, slope = (h(t + d) - h(t - d)) / (2 * d);
      var a1 = Math.atan(slope), a2 = Math.asin(Math.sin(a1) / 1.5), m = Math.tan(a1 - a2);
      prof.push(m); if (m > maxM) maxM = m;
    }
    prof = prof.map(function (m) { return m / maxM; });
    var L = { x: -.5, y: -.866 };                                   // light from the top left, -60deg
    function build(el, o) {
      var r = el.getBoundingClientRect(), W = Math.round(o.w || r.width), H = Math.round(o.h || r.height);
      if (W < 8 || H < 8) return;
      if (el._lgSize === W + 'x' + H) return; el._lgSize = W + 'x' + H;
      var cs = getComputedStyle(el), R = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, W / 2, H / 2);
      var B = Math.max(4, Math.min(o.bezel || 18, Math.min(W, H) * .36));
      var mapC = document.createElement('canvas'), spC = document.createElement('canvas');
      mapC.width = spC.width = W; mapC.height = spC.height = H;
      var mx = mapC.getContext('2d'), sx = spC.getContext('2d'), md = mx.createImageData(W, H), sd = sx.createImageData(W, H);
      var hx = W / 2, hy = H / 2, cx = hx - R, cy = hy - R;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var px = x + .5 - hx, py = y + .5 - hy, qx = Math.abs(px) - cx, qy = Math.abs(py) - cy;
        var outD = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - R, din = -outD;
        var k = (y * W + x) * 4, nx = 0, ny = 0, mag = 0;
        if (din > 0 && din < B) {
          if (qx > 0 && qy > 0) { var ln = Math.hypot(qx, qy) || 1; nx = qx / ln * Math.sign(px); ny = qy / ln * Math.sign(py); }
          else if (qx > qy) nx = Math.sign(px); else ny = Math.sign(py);
          mag = prof[Math.min(N - 1, Math.floor(din / B * N))];
          var rim = Math.pow(1 - din / B, 1.6);
          var lit = Math.max(0, nx * L.x + ny * L.y), back = Math.max(0, -(nx * L.x + ny * L.y)) * .45;
          sd.data[k] = sd.data[k + 1] = sd.data[k + 2] = 255; sd.data[k + 3] = Math.round(255 * Math.min(1, (lit + back) * rim * (o.spec || .75)));
        }
        // sample from just inside the edge, so the rim magnifies what is behind it
        md.data[k] = Math.round(128 - nx * mag * 127); md.data[k + 1] = Math.round(128 - ny * mag * 127); md.data[k + 2] = 128; md.data[k + 3] = 255;
      }
      mx.putImageData(md, 0, 0); sx.putImageData(sd, 0, 0);
      el.style.setProperty('--lg-spec', 'url(' + spC.toDataURL() + ')');
      if (!chromium) return;
      var id = el._lgId || (el._lgId = 'lg' + (++seq)), f = document.getElementById(id);
      if (!f) { f = document.createElementNS(svgNS, 'filter'); f.id = id; defs.appendChild(f); }
      f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', W); f.setAttribute('height', H);
      f.setAttribute('filterUnits', 'userSpaceOnUse'); f.setAttribute('color-interpolation-filters', 'sRGB');
      f.innerHTML = '<feImage href="' + mapC.toDataURL() + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none" result="map"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + (o.scale || 30) + '" xChannelSelector="R" yChannelSelector="G"/>';
      el.style.setProperty('--lg-bf', 'url(#' + id + ') blur(' + (o.blur == null ? 6 : o.blur) + 'px) saturate(' + (o.sat || 180) + '%)');
    }
    var items = [];
    function add(sel, o) { $$(sel).forEach(function (el) { el.setAttribute('data-lg', ''); items.push([el, o]); build(el, o); }); }
    var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { items.forEach(function (it) { if (it[0] === e.target) build(it[0], it[1]); }); }); }) : null;
    return { add: function (sel, o) { add(sel, o); if (ro) $$(sel).forEach(function (el) { ro.observe(el); }); }, build: build };
  })();
  (window.requestIdleCallback || function (f) { return setTimeout(f, 200); })(function () {
  LG.add('.hdr', { bezel: 22, scale: 34, blur: 5, spec: .85 });
  LG.add('.menu-btn, .lb button', { bezel: 16, scale: 26, blur: 2, spec: .9 });
  LG.add('.btn', { bezel: 14, scale: 22, blur: 3, spec: .9 });
  LG.add('.filters button', { bezel: 14, scale: 18, blur: 4, spec: .7 });
  // the cursor lens: clear glass, strong bend, almost no frost
  (function () { var c = $('#cursor'); if (!c) return; LG.build(c, { w: 92, h: 92, bezel: 30, scale: 46, blur: .5, sat: 150, spec: 1 }); })();
  });


  /* ================= WhatsApp links ================= */
  $$('[data-msg]').forEach(function (a) {
    var k = a.getAttribute('data-msg');
    var m = 'Hi VL Studioz, I saw your website. ' + (k === 'general' ? '' : 'I\'m interested in the ' + k + ' package. ') + 'I\'d like to check availability for my wedding on [your date].';
    a.href = waLink(m); a.target = '_blank'; a.rel = 'noopener';
  });

  /* ================= Date form ================= */
  var form = $('#ask'), send = $('#send'), err = $('#err'), bubble = $('#bubble'), fDate = $('#fDate');
  function fmtDate(v) { if (!v) return '[your date]'; return new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
  function buildMsg() {
    var ev = $$('input[name=ev]:checked', form).map(function (x) { return x.value; });
    var area = $('#fArea').value, pk = ($('input[name=pk]:checked', form) || {}).value, name = $('#fName').value.trim();
    var m = 'Hi VL Studioz, I saw your website. Our wedding is on ' + fmtDate(fDate.value);
    if (ev.length) m += ' (' + ev.join(' and ') + ')';
    if (area && area !== 'other') m += ' in ' + area;
    m += '. ' + (pk ? 'I\'m interested in the ' + pk + ' package (' + (pk === 'Premium' ? '₹1,39,999' : '₹45,000') + '). ' : 'We haven\'t picked a package yet. ') + 'Is the date available?';
    if (name) m += '\n– ' + name;
    return m;
  }
  function upd() { var m = buildMsg(); bubble.textContent = m; send.href = waLink(m); if (fDate.value) { err.hidden = true; fDate.closest('.fld').classList.remove('bad'); } }
  form.addEventListener('input', upd); form.addEventListener('change', upd); form.addEventListener('submit', function (e) { e.preventDefault(); }); upd();
  send.addEventListener('click', function (e) {
    if (fDate.value) return;
    e.preventDefault(); err.hidden = false; fDate.closest('.fld').classList.add('bad'); fDate.focus();
    if (window.gsap && !calm) gsap.fromTo(fDate, { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1,.3)' });
  });

  /* ================= Menu ================= */
  var sheet = $('#sheet'), mb = $('#menuBtn'), lenis = null;
  function setSheet(o) {
    sheet.classList.toggle('open', o); sheet.setAttribute('aria-hidden', !o); if (o) sheet.removeAttribute('inert'); else sheet.setAttribute('inert', '');
    document.body.classList.toggle('menu-open', o); mb.setAttribute('aria-expanded', o);
    if (lenis) { if (o) lenis.stop(); else lenis.start(); } else document.body.style.overflow = o ? 'hidden' : '';
    if (o) $('a', sheet).focus(); else mb.focus();
  }
  mb.addEventListener('click', function () { setSheet(!sheet.classList.contains('open')); });
  $$('a', sheet).forEach(function (a) { a.addEventListener('click', function () { setSheet(false); }); });
  document.addEventListener('keydown', function (e) {
    if (!sheet.classList.contains('open')) return;
    if (e.key === 'Escape') setSheet(false);
    if (e.key === 'Tab') { var f = [mb].concat($$('a', sheet)), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  /* ================= Lightbox ================= */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbI = 0, lbFrom = null;
  function visTiles() { return tiles.filter(function (t) { return !t.hidden; }); }
  function showLb(i, fromEl) {
    var v = visTiles(); lbI = (i + v.length) % v.length; var t = v[lbI], im = $('img', t);
    lbImg.src = im.getAttribute('data-full') || im.src; lbImg.alt = im.alt; lbCap.textContent = LBL[t.getAttribute('data-c')] + ' · ' + (lbI + 1) + ' / ' + v.length;
    var wasOpen = !lb.hidden; lb.hidden = false; lbFrom = t;
    if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    if (!window.gsap || calm) { $('#lbX').focus(); return; }
    var go = function () {
      if (fromEl && !wasOpen) {
        var a = fromEl.getBoundingClientRect(), b = lbImg.getBoundingClientRect();
        gsap.fromTo(lbImg, { x: (a.left + a.width / 2) - (b.left + b.width / 2), y: (a.top + a.height / 2) - (b.top + b.height / 2), scale: a.width / b.width }, { x: 0, y: 0, scale: 1, duration: .8, ease: 'expo.out' });
        gsap.fromTo(lb, { backgroundColor: 'rgba(18,8,10,0)' }, { backgroundColor: 'rgba(18,8,10,.94)', duration: .5 });
        gsap.from('.lb button, .lb-cap', { opacity: 0, duration: .4, delay: .3 });
      } else gsap.fromTo(lbImg, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .5, ease: 'expo.out' });
    };
    if (lbImg.complete && lbImg.naturalWidth) go(); else lbImg.onload = function () { lbImg.onload = null; go(); };
    $('#lbX').focus();
  }
  function closeLb() {
    if (lb.hidden) return;
    var done = function () { lb.hidden = true; if (lenis) lenis.start(); else document.body.style.overflow = ''; gsap.set && gsap.set(lbImg, { clearProps: 'all' }); if (lbFrom) lbFrom.focus({ preventScroll: true }); };
    if (window.gsap && !calm) gsap.to(lb, { opacity: 0, duration: .35, onComplete: function () { lb.style.opacity = ''; done(); } }); else done();
  }
  tiles.forEach(function (t) { t.addEventListener('click', function () { showLb(visTiles().indexOf(t), $('img', t)); }); });
  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', function () { showLb(lbI - 1); });
  $('#lbN').addEventListener('click', function () { showLb(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') showLb(lbI + 1); if (e.key === 'ArrowLeft') showLb(lbI - 1);
    if (e.key === 'Tab') { var f = $$('button', lb), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  var sx = 0; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLb(lbI + (dx < 0 ? 1 : -1)); });

  /* ================= Filters ================= */
  var fBtns = $$('#filters button');
  fBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var state = (window.Flip && !calm) ? Flip.getState(tiles) : null;
      tiles.forEach(function (t) { t.hidden = f !== 'all' && t.getAttribute('data-c') !== f; });
      if (state) {
        Flip.from(state, { duration: .8, ease: 'expo.inOut', absolute: true, scale: true, nested: true,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .7, ease: 'expo.out' }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, scale: .85, duration: .4 }); },
          onComplete: function () { ScrollTrigger.refresh(); } });
      }
    });
  });

  /* ================= FAQ height animation ================= */
  $$('details').forEach(function (d) {
    var s = $('summary', d), ans = $('.ans', d);
    s.addEventListener('click', function (e) {
      if (!window.gsap || calm) return;
      e.preventDefault();
      if (d.open) gsap.to(ans, { height: 0, duration: .5, ease: 'expo.inOut', onComplete: function () { d.open = false; ans.style.height = ''; } });
      else { d.open = true; gsap.fromTo(ans, { height: 0 }, { height: 'auto', duration: .7, ease: 'expo.out' }); gsap.from($('p', ans), { y: -14, opacity: 0, duration: .6, ease: 'expo.out' }); }
    });
  });

  /* ================= Hero slides: fill the screen only when the photo's shape is close; otherwise show it whole ================= */
  var SL = $$('#slides .sl');
  function fitSlide(s) {
    var im = $('.fg', s); if (!im.naturalWidth) return;
    var r = (im.naturalWidth / im.naturalHeight) / (innerWidth / innerHeight);
    var cover = r > .8 && r < 1.28;
    s.classList.toggle('cover', cover);
    im.style.objectPosition = cover ? s.getAttribute('data-pos') : '';
  }
  SL.forEach(function (s) { var im = $('.fg', s); if (im.complete) fitSlide(s); im.addEventListener('load', function () { fitSlide(s); }); });
  window.addEventListener('resize', function () { SL.forEach(fitSlide); });

  /* ================= Calm path: no motion ================= */
  var mbar = $('#mbar');
  if (calm || !window.gsap || !window.ScrollTrigger) {
    D.classList.remove('loading'); D.classList.remove('motion'); D.classList.add('calm');
    var hdr0 = $('#hdr'), bk0 = $('#book'), st0 = $('.statement');
    var calmScroll = function () {
      hdr0.classList.toggle('solid', window.scrollY > window.innerHeight * .8);
      var b = bk0.getBoundingClientRect(), s = st0.getBoundingClientRect();
      mbar.classList.toggle('show', s.top < innerHeight * .6 && !(b.top < innerHeight * .9 && b.bottom > 0));
    };
    window.addEventListener('scroll', calmScroll, { passive: true }); calmScroll();
    return;
  }

  /* ================= Motion ================= */
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.Flip) gsap.registerPlugin(Flip);
  var EX = 'expo.out';
  var fine = matchMedia('(pointer: fine)').matches;

  // Smooth scroll on mouse/trackpad only; touch keeps native scrolling.
  if (fine && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length < 2) return; var t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.6 }); });
    });
  }

  function split(el, type) { return window.SplitText ? SplitText.create(el, { type: type, mask: type.indexOf('lines') > -1 ? 'lines' : undefined, linesClass: 'ln', wordsClass: 'word', charsClass: 'ch' }) : null; }

  /* ---------- Loader → hero intro ---------- */
  var heroSplit = split('.h1', 'lines,chars');
  if (heroSplit) gsap.set(heroSplit.chars, { yPercent: 115 });
  gsap.set('.h-foot, .h-cue, .hdr', { opacity: 0 });
  gsap.set('#slides', { filter: 'brightness(.35) saturate(.5)' });
  if (lenis) lenis.stop();
  var count = { v: 0 }, num = $('#ldNum'), frames = $$('.ld-frames img');
  // Full loader on the first visit of a session (about 1.5 s); a quick curtain after that.
  var seen = false; try { seen = sessionStorage.getItem('vl-seen') === '1'; sessionStorage.setItem('vl-seen', '1'); } catch (e) {}
  // First visit of a session: a quick "VL" moment (~1 s). Repeat visits: no loader at all, so the photo shows at once.
  var L = seen ? 0 : .55;
  var ldL = $('.ld-logo .vlogo'); if (ldL) ldL.classList.add('drawing');
  var lt = gsap.timeline({ defaults: { ease: EX } });
  if (!seen) {
    // The first photo shows through a giant "VL", then the camera flies through the letters into the hero.
    lt.to(count, { v: 100, duration: .6, ease: 'power2.inOut', onUpdate: function () { num.textContent = Math.round(count.v); } }, 0)
      .fromTo('#ldVl span', { scale: .9, backgroundPosition: '38% 40%' }, { scale: 1, backgroundPosition: '60% 48%', duration: .7, ease: 'power2.out' }, 0)
      .to('.ld-count, .ld-logo', { yPercent: -60, opacity: 0, duration: .35, ease: 'power3.in' }, L - .05)
      .to('#ldVl span', { scale: 7, duration: .7, ease: 'expo.in' }, L)
      .to('#loader', { opacity: 0, duration: .35, ease: 'power1.in' }, L + .4);
    L += .4;
  } else {
    gsap.set('#loader', { display: 'none' }); D.classList.remove('loading');
  }
  lt.add(function () { D.classList.remove('loading'); gsap.set('#loader', { display: 'none' }); if (lenis) lenis.start(); var hl = $('.hdr .vlogo'); if (hl) hl.classList.add('drawing', 'shine'); }, L + .35)
    .to('#slides', { filter: 'brightness(1) saturate(1)', duration: 1.6, ease: 'power2.out', clearProps: 'filter' }, L + .1)
    .to(heroSplit ? heroSplit.chars : '.h1', { yPercent: 0, duration: 1.2, stagger: .016, ease: EX }, L + .55)
    .to('.h-foot', { opacity: 1, duration: .9 }, L + 1)
    .from('.h-foot', { y: 30, duration: 1.1 }, L + 1)
    .to('.hdr, .h-cue', { opacity: 1, duration: .8 }, L + .9);
  gsap.set('#loader', { clipPath: 'inset(0% 0% 0% 0%)' });

  var mm = gsap.matchMedia();

  /* ---------- Hero: the photo shrinks into a collage of the day (signature) ---------- */
  mm.add({ desk: '(min-aspect-ratio: 4/5)', phone: '(max-aspect-ratio: 4/5)' }, function (ctx) {
    var desk = ctx.conditions.desk;
    var frame = desk ? 'inset(13% 31% 13% 31% round 24px)' : 'inset(26% 11% 26% 11% round 18px)';
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: desk ? '+=170%' : '+=140%', pin: true, scrub: .9, anticipatePin: 1 } });
    tl.to('.h-copy', { y: -90, opacity: 0, duration: .32, ease: 'power2.in' }, 0)
      .to('.h-cue', { opacity: 0, duration: .15 }, 0)
      .to('#hMain', { clipPath: frame, duration: 1, ease: 'power2.inOut' }, .05)
      .fromTo('#hMain', { '--scrim': 1 }, { '--scrim': 0, duration: .5 }, .05)
      .to('#slides', { scale: desk ? .62 : .8, duration: 1, ease: 'power2.inOut' }, .05)
      .to('#slides .sl:not(.cover) .fg', { objectPosition: '50% 50%', duration: .6, ease: 'power2.inOut' }, .05)
      .fromTo('.hc1', { opacity: 0, x: -140, y: -80, rotation: -4 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: .6, ease: 'power3.out' }, .45)
      .fromTo('.hc3', { opacity: 0, x: 140, y: -100, rotation: 4 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: .6, ease: 'power3.out' }, .52)
      .fromTo('.hc2', { opacity: 0, x: -120, y: 120, rotation: 3 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: .6, ease: 'power3.out' }, .6)
      .fromTo('.hc4', { opacity: 0, x: 140, y: 120, rotation: -3 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: .6, ease: 'power3.out' }, .66)
      .fromTo('.hc img', { scale: 1.15 }, { scale: 1, duration: .7, ease: 'power2.out' }, .45)
      .to({}, { duration: .25 });
  });

  /* ---------- Header, progress, phone bar ---------- */
  var hdr = $('#hdr'), lastY = 0;
  var bookEl = $('#book'), stEl = $('.statement');
  function barState() {
    var b = bookEl.getBoundingClientRect(), s = stEl.getBoundingClientRect();
    mbar.classList.toggle('show', s.top < innerHeight * .6 && !(b.top < innerHeight * .9 && b.bottom > 0));
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    gsap.set('#progress', { scaleX: s.progress }); barState();
    var y = s.scroll(); hdr.classList.toggle('solid', y > innerHeight * .12); lastY = y;
  } });

  /* ---------- Section headings: masked line reveal ---------- */
  $$('.split').forEach(function (h) {
    var s = split(h, 'lines,words');
    if (!s) return;
    gsap.from(s.words, { yPercent: 110, duration: 1.3, stagger: .06, ease: EX, scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
  });

  /* ---------- Statement: words fill in as you read ---------- */
  var st = split('#stText', 'words');
  if (st) {
    gsap.fromTo(st.words, { color: '#d9cfd2' }, { color: '#1c1416', stagger: .12, ease: 'none', scrollTrigger: { trigger: '#stText', start: 'top 78%', end: 'bottom 50%', scrub: true } });
  }
  $$('.pill').forEach(function (p) {
    gsap.fromTo(p, { width: 0 }, { width: '1.9em', ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 55%', scrub: true } });
  });
  gsap.from('.st-meta', { y: 30, opacity: 0, duration: 1, ease: EX, scrollTrigger: { trigger: '.st-meta', start: 'top 92%', once: true } });

  /* ---------- Marquee: speeds up with your scroll ---------- */
  var loops = [];
  $$('.mq-row').forEach(function (row) {
    var tr = $('.mq-track', row); row.appendChild(tr.cloneNode(true)); row.lastChild.setAttribute('aria-hidden', 'true');
    var dir = +row.getAttribute('data-dir');
    var t = dir < 0 ? gsap.to(row.children, { xPercent: -100, duration: 34, ease: 'none', repeat: -1 }) : gsap.fromTo(row.children, { xPercent: -100 }, { xPercent: 0, duration: 34, ease: 'none', repeat: -1 });
    loops.push(t);
  });
  var skew = gsap.quickTo('.mq-track span', 'skewX', { duration: .6, ease: 'power3' });
  ScrollTrigger.create({ trigger: '.mq', start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
    var v = s.getVelocity(); var k = 1 + Math.min(Math.abs(v) / 220, 6);
    loops.forEach(function (t) { gsap.to(t, { timeScale: k * (v < 0 ? -1 : 1), duration: .2, overwrite: true }); gsap.to(t, { timeScale: v < 0 ? -1 : 1, duration: 1.4, delay: .25 }); });
    skew(gsap.utils.clamp(-10, 10, v / -160));
  } });

  /* ---------- Services: horizontal track on desktop, reveals on phone ---------- */
  mm.add({ desk: '(min-width: 760px)', phone: '(max-width: 759px)' }, function (ctx) {
    var track = $('#svcTrack');
    if (ctx.conditions.desk) {
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '.svc', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true } });
      $$('.panel', track).forEach(function (p) {
        var im = $('.p-img img', p);
        if (im) gsap.fromTo(im, { xPercent: -3.5 }, { xPercent: 3.5, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        gsap.from($('.p-txt', p).children, { y: 40, opacity: 0, stagger: .08, duration: 1, ease: EX, scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 80%', toggleActions: 'play none none reverse' } });
        gsap.from(p.firstElementChild, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: p, containerAnimation: tw, start: 'left 95%', toggleActions: 'play none none reverse' } });
      });
    } else {
      $$('.panel', track).forEach(function (p) {
        var box = p.firstElementChild, im = $('img', box);
        gsap.fromTo(box, { clipPath: 'inset(18% 10% 18% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: p, start: 'top 95%', end: 'top 35%', scrub: true } });
        if (im) gsap.fromTo(im, { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from($('.p-txt', p).children, { y: 30, opacity: 0, stagger: .08, duration: 1, ease: EX, scrollTrigger: { trigger: $('.p-txt', p), start: 'top 90%', once: true } });
      });
    }
  });

  /* ---------- The wedding day: pinned, each moment wipes in over the last ---------- */
  var figs = $$('#dayStage figure'), items = $$('#dayList li'), dayBar = $('#dayBar'), n = figs.length, cur = -1;
  gsap.set(figs.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
  var dayTl = gsap.timeline({ scrollTrigger: { trigger: '.day', start: 'top top', end: '+=' + (n * 85) + '%', pin: true, scrub: .8,
    onUpdate: function (s) {
      var i = Math.min(n - 1, Math.floor(s.progress * n));
      if (i !== cur) { items.forEach(function (li, k) { li.classList.toggle('on', k === i); }); cur = i; }
      gsap.set(dayBar, { scaleX: s.progress });
    } } });
  dayTl.fromTo($('img', figs[0]), { scale: 1.08 }, { scale: 1, duration: 1, ease: 'none' }, 0);
  figs.forEach(function (f, i) {
    if (!i) return;
    var at = i - .35;
    dayTl.to(f, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power3.inOut' }, at)
      .fromTo($('img', f), { scale: 1.12, yPercent: 4 }, { scale: 1, yPercent: 0, duration: 1, ease: 'power2.out' }, at)
      .to($('img', figs[i - 1]), { scale: .95, yPercent: -2, duration: .7, ease: 'power3.inOut' }, at);
  });
  dayTl.to({}, { duration: .4 });

  /* ---------- Recent work: tiles open like shutters, photos drift inside ---------- */
  tiles.forEach(function (t, i) {
    gsap.from(t, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', delay: (i % 3) * .08, scrollTrigger: { trigger: t, start: 'top 94%', once: true } });
    gsap.fromTo($('img', t), { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'center center', scrub: true } });
  });

  /* ---------- Packages ---------- */
  gsap.from('.pkc', { y: 140, opacity: 0, duration: 1.5, stagger: .16, ease: EX, scrollTrigger: { trigger: '.pk-grid', start: 'top 85%', once: true } });
  $$('.pkc').forEach(function (c) { gsap.from($$('li', c), { x: -20, opacity: 0, duration: .8, stagger: .04, ease: EX, scrollTrigger: { trigger: c, start: 'top 70%', once: true } }); });
  // Prices never show an in-between number: the real figure rises into place.
  $$('.price').forEach(function (el) { gsap.from(el, { yPercent: 40, opacity: 0, duration: 1.4, ease: EX, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });

  /* ---------- Reviews ---------- */
  var sc = { v: 0 }, scoreEl = $('#score');
  var rvt = gsap.timeline({ scrollTrigger: { trigger: '.rev', start: 'top 70%', once: true } });
  rvt.from(scoreEl, { yPercent: 50, opacity: 0, duration: 1.4, ease: EX }, 0)
     .fromTo('#starFill', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut' }, .2)
     .from('.rev-h', { y: 30, opacity: 0, duration: 1, ease: EX }, .5);
  var q = split('#quote', 'lines');
  if (q) gsap.from(q.lines, { yPercent: 100, duration: 1.2, stagger: .08, ease: EX, scrollTrigger: { trigger: '#quote', start: 'top 85%', once: true } });
  gsap.from('.snips li', { y: 50, opacity: 0, duration: 1.1, stagger: .12, ease: EX, scrollTrigger: { trigger: '.snips', start: 'top 88%', once: true } });

  /* ---------- How booking works: the line draws through the steps ---------- */
  mm.add({ desk: '(min-width: 760px)', phone: '(max-width: 759px)' }, function (ctx) {
    var path = $('#stepsPath');
    path.setAttribute('d', ctx.conditions.desk ? 'M0 10 H1000' : 'M500 0 V20');
    gsap.fromTo(path, { strokeDasharray: 1000, strokeDashoffset: 1000 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.steps-wrap', start: 'top 75%', end: 'bottom 55%', scrub: true } });
    $$('.steps-list li').forEach(function (li) {
      gsap.from(li.children, { y: 30, opacity: 0, stagger: .08, duration: 1, ease: EX, scrollTrigger: { trigger: li, start: 'top 85%', once: true } });
      gsap.to($('.dot', li), { backgroundColor: '#c8921e', scale: 1.25, duration: .4, scrollTrigger: { trigger: li, start: ctx.conditions.desk ? 'top 62%' : 'top 60%', toggleActions: 'play none none reverse' } });
    });
    path.setAttribute('pathLength', '1000');
  });

  /* ---------- Book ---------- */
  var bk = split('.book-h', 'lines,chars');
  if (bk) gsap.from(bk.chars, { yPercent: 120, rotation: 8, duration: 1.2, stagger: .025, ease: EX, scrollTrigger: { trigger: '.book', start: 'top 70%', once: true } });
  gsap.from('.book-copy p, .phone', { y: 30, opacity: 0, duration: 1, stagger: .1, ease: EX, scrollTrigger: { trigger: '.book-copy p', start: 'top 90%', once: true } });
  gsap.from('.ask', { y: 120, rotation: 2, opacity: 0, duration: 1.4, ease: EX, scrollTrigger: { trigger: '.ask', start: 'top 92%', once: true } });

  /* ---------- Footer wordmark rises, traces itself in gold, then catches the light ---------- */
  var fl = $('.ftr-logo .vlogo');
  if (fl) new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { fl.classList.add('drawing', 'shine'); o.disconnect(); } }); }, { threshold: .35 }).observe(fl);
  gsap.fromTo('#ftrLogo', { yPercent: 70, scale: .82, opacity: .15 }, { yPercent: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* ---------- Cursor + magnetic button (mouse only) ---------- */
  if (fine) {
    var cur$ = $('#cursor'), lbl = $('#cursorLbl');
    var cx = gsap.quickTo(cur$, 'x', { duration: .45, ease: 'power3' }), cy = gsap.quickTo(cur$, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); });
    $$('[data-cursor]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { lbl.textContent = el.getAttribute('data-cursor'); cur$.classList.add('big'); });
      el.addEventListener('pointerleave', function () { cur$.classList.remove('big'); });
    });
    $$('.magnet').forEach(function (b) {
      var mx = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), my = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .18); my((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('pointerleave', function () { mx(0); my(0); });
    });
  }

  /* ---------- Hero film: brides and couples crossfade, each photo whole and centred ---------- */
  (function () {
    var i = 0;
    function warm(k) { var s = SL[k % SL.length]; $$('img[data-src]', s).forEach(function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }); }
    gsap.set(SL, { opacity: 0 }); gsap.set(SL[0], { opacity: 1 });
    setTimeout(function () { warm(1); }, 2000);
    setTimeout(function () { setInterval(function () {
      // Hold still once the visitor starts scrolling, so the collage shrinks one photo.
      if (window.scrollY > 4 || document.hidden) return;
      var prev = SL[i]; i = (i + 1) % SL.length; var next = SL[i]; warm(i + 1);
      gsap.set(next, { zIndex: 1 }); gsap.set(prev, { zIndex: 0 });
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.inOut' });
      gsap.fromTo($('.fg', next), { scale: 1.05 }, { scale: 1, duration: 6, ease: 'none' });
      gsap.fromTo($('.bg', next), { scale: 1.15 }, { scale: 1.05, duration: 6, ease: 'none' });
      gsap.to(prev, { opacity: 0, duration: 1, delay: .6 });
    }, 5200); }, 1800);
  })();

  /* ---------- Falling petals: marigold, rose and jasmine, tumbling in 3D at three depths ---------- */
  var KINDS = [
    { shape: 'marigold', base: '#ffcf4d', mid: '#f59a12', tip: '#e2700a', edge: '#b85406' },
    { shape: 'marigold', base: '#ffe58a', mid: '#f9c22b', tip: '#f0a313', edge: '#c47f05' },
    { shape: 'rose', base: '#f6d3c9', mid: '#d6243f', tip: '#a90e2a', edge: '#6e0618' },
    { shape: 'rose', base: '#fde4e4', mid: '#ee6f8c', tip: '#d23f66', edge: '#9c1d42' },
    { shape: 'jasmine', base: '#f1ead8', mid: '#fffdf6', tip: '#ffffff', edge: '#cfc3a6' }
  ];
  function petalPath(x, k, w, h) {
    x.beginPath();
    if (k.shape === 'rose') {
      x.moveTo(0, h * .5);
      x.bezierCurveTo(w * .42, h * .38, w * .56, -h * .05, w * .46, -h * .32);
      x.quadraticCurveTo(w * .3, -h * .5, w * .12, -h * .42);
      x.quadraticCurveTo(0, -h * .5, -w * .14, -h * .43);
      x.quadraticCurveTo(-w * .34, -h * .52, -w * .47, -h * .3);
      x.bezierCurveTo(-w * .56, -h * .04, -w * .42, h * .38, 0, h * .5);
    } else if (k.shape === 'marigold') {
      x.moveTo(-w * .08, h * .5); x.lineTo(w * .08, h * .5);
      x.bezierCurveTo(w * .3, h * .2, w * .5, -h * .1, w * .48, -h * .34);
      var lobes = 5;
      for (var i = 0; i < lobes; i++) {
        var a = w * .48 - (i + .5) * (w * .96 / lobes), b = w * .48 - (i + 1) * (w * .96 / lobes);
        x.quadraticCurveTo(a, -h * .56 + (i % 2) * h * .04, b, -h * .38);
      }
      x.bezierCurveTo(-w * .5, -h * .1, -w * .3, h * .2, -w * .08, h * .5);
    } else {
      x.moveTo(0, h * .5);
      x.bezierCurveTo(w * .5, h * .25, w * .55, -h * .2, 0, -h * .5);
      x.bezierCurveTo(-w * .55, -h * .2, -w * .5, h * .25, 0, h * .5);
    }
    x.closePath();
  }
  function petalSprite(k, blur) {
    var S = 96, c = document.createElement('canvas'); c.width = c.height = S; var x = c.getContext('2d');
    var h = S * .8, w = h * (k.shape === 'rose' ? .86 : k.shape === 'marigold' ? .62 : .42);
    x.translate(S / 2, S / 2);
    if (blur) x.filter = 'blur(' + blur + 'px)';
    petalPath(x, k, w, h);
    var g = x.createLinearGradient(0, h * .5, 0, -h * .5);                      // pale base to deep tip
    g.addColorStop(0, k.base); g.addColorStop(.45, k.mid); g.addColorStop(1, k.tip);
    x.fillStyle = g; x.fill();
    x.save(); x.clip(); x.filter = 'none';
    var cur = x.createLinearGradient(-w / 2, 0, w / 2, 0);                       // the curl: one side in shadow
    cur.addColorStop(0, 'rgba(60,10,0,.28)'); cur.addColorStop(.45, 'rgba(0,0,0,0)'); cur.addColorStop(1, 'rgba(255,255,255,.14)');
    x.fillStyle = cur; x.fillRect(-w, -h, w * 2, h * 2);
    x.strokeStyle = k.edge; x.globalAlpha = .16; x.lineWidth = .7;              // fine veins fanning from the base
    for (var v = -3; v <= 3; v++) { x.beginPath(); x.moveTo(v * w * .02, h * .48); x.quadraticCurveTo(v * w * .08, 0, v * w * .14, -h * .48); x.stroke(); }
    for (var n = 0; n < 160; n++) {                                              // a little texture
      x.globalAlpha = .05 + Math.random() * .06; x.fillStyle = Math.random() < .5 ? '#000' : '#fff';
      x.fillRect((Math.random() - .5) * w, (Math.random() - .5) * h, 1.2, 1.2);
    }
    x.restore();
    x.globalAlpha = .45; x.strokeStyle = k.edge; x.lineWidth = .8; petalPath(x, k, w, h); x.stroke();
    return c;
  }
  var SPR = KINDS.map(function (k) { return [petalSprite(k, 0), petalSprite(k, 2.2)]; });
  function petals(cv) {
    var cx = cv.getContext('2d'), W = 0, H = 0, small = innerWidth < 760, dpr = small ? 1 : Math.min(2, window.devicePixelRatio || 1);
    var parts = [], on = false, raf = 0, wind = 0, t0 = 0;
    var N = small ? 10 : 20;
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function mk(p, top) {
      var d = Math.random(); p.depth = d < .55 ? 0 : d < .9 ? 1 : 2;               // far, mid, near
      p.k = Math.random() < .45 ? 0 : Math.random() < .5 ? 1 : Math.random() < .6 ? 2 : Math.random() < .5 ? 3 : 4;
      p.size = [12, 20, 34][p.depth] * (.8 + Math.random() * .4);
      p.x = Math.random() * W; p.y = top ? -40 - Math.random() * 80 : Math.random() * H;
      p.vy = [.35, .6, 1.05][p.depth] * (.8 + Math.random() * .4);
      p.flip = Math.random() * 6.28; p.vflip = .02 + Math.random() * .035;
      p.rot = Math.random() * 6.28; p.vrot = (Math.random() - .5) * .025;
      p.sw = Math.random() * 6.28; p.vsw = .008 + Math.random() * .012; p.amp = .5 + Math.random() * 1.1;
      p.a = [.55, .85, .95][p.depth];
      return p;
    }
    size(); for (var n = 0; n < N; n++) parts.push(mk({}, false));
    parts.sort(function (a, b) { return a.depth - b.depth; });
    function frame(t) {
      if (!t0) t0 = t; var dt = Math.min(2.5, (t - t0) / 16.7); t0 = t;
      wind = Math.sin(t / 3200) * .5 + Math.sin(t / 1300) * .25;
      cx.clearRect(0, 0, W, H);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.y += p.vy * dt; p.sw += p.vsw * dt; p.x += (Math.sin(p.sw) * p.amp + wind * (p.depth + 1) * .5) * dt;
        p.flip += p.vflip * dt; p.rot += p.vrot * dt;
        if (p.y > H + 50 || p.x < -60 || p.x > W + 60) { mk(p, true); continue; }
        var fx = Math.cos(p.flip), sx = Math.max(.12, Math.abs(fx));
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.scale(sx, 1);
        cx.globalAlpha = p.a * (fx < 0 ? .78 : 1);                                // the back of a petal reads darker
        var spr = SPR[p.k][p.depth === 2 ? 1 : 0], s = p.size;
        cx.drawImage(spr, -s / 2, -s / 2, s, s);
        cx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (e.isIntersecting && !on) { on = true; size(); t0 = 0; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
    }); }).observe(cv);
    window.addEventListener('resize', size);
  }
  $$('canvas[data-petals]').forEach(petals);

  /* ---------- The page changes colour as you move through it ---------- */
  // Each change of colour is blended over a long stretch of scroll, so white, gold and wine melt into each other.
  var THEMES = {
    light: { '--bg': '#ffffff', '--ink': '#1c1416', '--mute': '#6b5d61', '--line': 'rgba(28,20,22,0.12)', '--soft': 'rgba(246,241,239,1)' },
    gold:  { '--bg': '#f5e8cf', '--ink': '#1c1416', '--mute': '#6b5d61', '--line': 'rgba(28,20,22,0.12)', '--soft': 'rgba(246,241,239,1)' },
    wine:  { '--bg': '#5a0c1c', '--ink': '#fbeef0', '--mute': '#e6c0c7', '--line': 'rgba(251,238,240,0.2)', '--soft': 'rgba(255,255,255,0.07)' }
  };
  gsap.set(document.body, THEMES.light);
  var secs = $$('section[data-theme]'), prevT = 'light';
  secs.forEach(function (sec) {
    var t = sec.getAttribute('data-theme');
    if (t !== prevT) {
      gsap.fromTo(document.body, THEMES[prevT], Object.assign({}, THEMES[t], { ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: sec, start: 'top 170%', end: 'top 88%', scrub: true } }));
    }
    prevT = t;
  });
  document.body.setAttribute('data-theme', 'blend');

  /* ---------- 3D photo ring: turns on its own, with your scroll, and when dragged ---------- */
  var RING = ['bride-moon_5', 'j-gal-28', 'j-gal-49', 'j-gal-25', 'bride-moon_1', 'dark-a_4', 'silhouette-arch_1', 'bride-orange_2', 'bride-timeless_1', 'j-gal-36', 'reception-grace_2', 'j-gal-22'];
  var ring = $('#ring'), rWrap = $('#ringWrap');
  RING.forEach(function (f) { var fig = document.createElement('figure'); fig.innerHTML = '<img src="img/s/' + f + '.jpg" alt="" loading="lazy" decoding="async" draggable="false">'; ring.appendChild(fig); });
  var rFigs = $$('figure', ring), rot = 0, vel = .12, drag = false, lx = 0, rOn = false, scrollKick = 0;
  function layRing() {
    var w = rFigs[0].offsetWidth, n = rFigs.length, R = (w * n) / (2 * Math.PI) * 1.06;
    rFigs.forEach(function (f, k) { f.style.transform = 'rotateY(' + (k * 360 / n) + 'deg) translateZ(' + R + 'px)'; });
    ring.style.setProperty('--R', R + 'px');
  }
  layRing(); window.addEventListener('resize', layRing);
  rWrap.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; rWrap.setPointerCapture(e.pointerId); });
  rWrap.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - lx; lx = e.clientX; rot += dx * .25; vel = dx * .25; });
  rWrap.addEventListener('pointerup', function () { drag = false; });
  rWrap.addEventListener('pointercancel', function () { drag = false; });
  ScrollTrigger.create({ trigger: rWrap, start: 'top bottom', end: 'bottom top', onToggle: function (s) { rOn = s.isActive; }, onUpdate: function (s) { scrollKick = s.getVelocity() / 900; } });
  gsap.ticker.add(function () {
    if (!rOn) return;
    if (!drag) { vel += (.12 - vel) * .03; rot += vel + scrollKick; scrollKick *= .9; }
    ring.style.transform = 'translateZ(calc(var(--R) * -1)) rotateX(-6deg) rotateY(' + rot + 'deg)';
  });
  gsap.from('#ringWrap', { opacity: 0, scale: .85, duration: 1.6, ease: EX, scrollTrigger: { trigger: '#ringWrap', start: 'top 85%', once: true } });

  /* ---------- Album: the cover swings open to reveal the packages (desktop) ---------- */
  mm.add('(min-width: 900px)', function () {
    gsap.fromTo('.album-cover', { rotateY: 0 }, { rotateY: -176, ease: 'power2.inOut', scrollTrigger: { trigger: '#album', start: 'top 78%', end: 'top 12%', scrub: 1 } });
    gsap.fromTo('.ac-front', { filter: 'brightness(1)' }, { filter: 'brightness(.55)', ease: 'none', scrollTrigger: { trigger: '#album', start: 'top 60%', end: 'top 12%', scrub: 1 } });
  });

  /* ---------- Photos react: a ripple on hover, a lean with scroll speed ---------- */
  if (fine) {
    var rMap = $('#rippleMap'), rNoise = $('#rippleNoise');
    tiles.forEach(function (t) {
      var im = $('img', t);
      t.addEventListener('pointerenter', function () {
        im.style.filter = 'url(#ripple)';
        gsap.fromTo(rMap, { attr: { scale: 0 } }, { attr: { scale: 16 }, duration: .45, yoyo: true, repeat: 1, ease: 'sine.inOut', onComplete: function () { im.style.filter = ''; } });
        gsap.fromTo(rNoise, { attr: { baseFrequency: '0.006 0.014' } }, { attr: { baseFrequency: '0.012 0.024' }, duration: .9, ease: 'none' });
        gsap.to(im, { scale: 1.06, duration: .9, ease: EX });
      });
      t.addEventListener('pointerleave', function () { gsap.to(im, { scale: 1, duration: .9, ease: EX }); });
    });
  }
  if (fine) {
    var lean = gsap.quickTo(tiles, 'skewY', { duration: .5, ease: 'power3' });
    ScrollTrigger.create({ trigger: '#grid', start: 'top bottom', end: 'bottom top', onUpdate: function (s) { lean(gsap.utils.clamp(-2, 2, s.getVelocity() / -700)); } });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  // Photos arriving later change the page height; re-measure so pinned sections never drift out of place.
  var rfT = 0;
  document.addEventListener('load', function (e) {
    if (e.target && e.target.tagName === 'IMG') { clearTimeout(rfT); rfT = setTimeout(function () { ScrollTrigger.refresh(); }, 300); }
  }, true);
  if (window.ResizeObserver) { var lastH = 0; new ResizeObserver(function () { var h = document.body.scrollHeight; if (Math.abs(h - lastH) > 40) { lastH = h; clearTimeout(rfT); rfT = setTimeout(function () { ScrollTrigger.refresh(); }, 300); } }).observe(document.body); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
