/* Ygary Brides concept: plain script, no library. Everything here is optional: the booking sentence and the links work
   without it (they live in the page), and under reduced motion nothing here moves. The opening itself is CSS in the page;
   this marks it done and takes over from there. */
(function () {
  'use strict';
  window.__yg = 1;
  var D = document, root = D.documentElement;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------------- a swing: the thing hangs from its knot and settles ----------------
     Uses the separate `rotate` property, so it adds to the page's own transforms instead of replacing them. */
  function swing(el, amp, delay) {
    if (RM || !el || !el.animate) return;
    try {
      el.animate([
        { rotate: '0deg' },
        { rotate: amp + 'deg', offset: 0.2 },
        { rotate: (-amp * 0.62) + 'deg', offset: 0.46 },
        { rotate: (amp * 0.3) + 'deg', offset: 0.7 },
        { rotate: (-amp * 0.1) + 'deg', offset: 0.88 },
        { rotate: '0deg' }
      ], { duration: 1250, delay: delay || 0, easing: 'cubic-bezier(.3,.1,.4,1)' });
    } catch (e) { /* an older engine: the page simply stays still */ }
  }

  /* ---------------- the string: tap a bride and she swings, the ripple runs along the string ---------------- */
  var row = $('.string'), brides = $$('.string .bride');
  function pluck(i, amp) {
    brides.forEach(function (b, j) {
      var a = amp / (1 + Math.abs(j - i) * 0.8);
      if (a >= 0.7) swing(b, a, Math.abs(j - i) * 70);
    });
  }
  brides.forEach(function (b, i) {
    if (b.querySelector('.next')) return;            // the last knot is a link: it jumps to the booking, no swing needed
    b.addEventListener('click', function () { pluck(i, 4.5); });
  });

  /* swiping the string sways the brides against the direction of travel, then they settle */
  var lastX = row ? row.scrollLeft : 0, ang = 0, swayRaf = 0;
  function swayTick() {
    swayRaf = 0;
    ang *= 0.86;
    var live = Math.abs(ang) > 0.05;
    brides.forEach(function (b, j) { b.style.rotate = live ? (ang * (1 + j * 0.05)).toFixed(2) + 'deg' : ''; });
    if (live) swayRaf = requestAnimationFrame(swayTick);
  }
  if (row && !RM) {
    row.addEventListener('scroll', function () {
      var x = row.scrollLeft, dx = x - lastX; lastX = x;
      if (!dx) return;
      ang = clamp(ang - dx * 0.25, -5, 5);
      if (!swayRaf) swayRaf = requestAnimationFrame(swayTick);
    }, { passive: true });
  }

  /* desktop: with a mouse, the brides lean away from the pointer like a string in a draught */
  if (row && !RM && FINE) {
    var cur = brides.map(function () { return 0; }), tgt = brides.map(function () { return 0; }), leanRaf = 0;
    var lean = function () {
      leanRaf = 0;
      var moving = false;
      brides.forEach(function (b, j) {
        cur[j] += (tgt[j] - cur[j]) * 0.14;
        if (Math.abs(tgt[j] - cur[j]) > 0.02) moving = true;
        b.style.rotate = Math.abs(cur[j]) > 0.02 ? cur[j].toFixed(2) + 'deg' : '';
      });
      if (moving) leanRaf = requestAnimationFrame(lean);
    };
    row.addEventListener('pointermove', function (e) {
      if (row.scrollWidth > row.clientWidth + 1 || e.pointerType !== 'mouse') return;   // only when the whole string is on screen
      brides.forEach(function (b, j) {
        var r = b.getBoundingClientRect(), d = (r.left + r.width / 2 - e.clientX) / 240;
        tgt[j] = clamp(d, -1, 1) * 2.6 * (1 - Math.min(1, Math.abs(d)) * 0.35);
      });
      if (!leanRaf) leanRaf = requestAnimationFrame(lean);
    });
    row.addEventListener('pointerleave', function () {
      tgt = tgt.map(function () { return 0; });
      if (!leanRaf) leanRaf = requestAnimationFrame(lean);
    });
  }

  /* her tag swings when her name or date lands on it */
  var tag = $('.tag');
  var nameIn = $('#name'), dateIn = $('#date'), hadName = false;
  if (nameIn) nameIn.addEventListener('input', function () {
    var has = nameIn.value.trim().length > 0;
    if (has && !hadName) swing(tag, 4);
    hadName = has;
  });
  if (dateIn) dateIn.addEventListener('change', function () { if (dateIn.value) swing(tag, 4); });

  /* ---------------- the opening hands over ---------------- */
  function opened() {
    if (root.getAttribute('data-opening') === 'done') return;
    root.setAttribute('data-opening', 'done');
    after();
  }
  if (RM) opened();
  else {
    var fallback = setTimeout(opened, 2300);
    requestAnimationFrame(function () {
      var hero = $('.hero');
      var list = (hero && hero.getAnimations ? hero.getAnimations({ subtree: true }) : []).filter(function (a) {
        var t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        return !t || t.iterations !== Infinity;
      });
      if (!list.length) { clearTimeout(fallback); opened(); return; }
      Promise.all(list.map(function (a) { return a.finished.catch(function () {}); })).then(function () { clearTimeout(fallback); opened(); });
    });
  }

  function after() {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    idle(petals);
    // one ripple along the string when the opening ends: they are hanging, and they can be touched
    if (!RM) setTimeout(function () { pluck(0, 3.2); }, 250);
  }

  /* ---------------- scroll scenes: each section arrives its own way, once ---------------- */
  var pending = $$('.rv');
  function show(el) { if (!el.classList.contains('in')) el.classList.add('in'); }
  if (!hasIO || RM) pending.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    pending.forEach(function (el) { io.observe(el); });
    // a second net: a fast flick or a jump link can scroll past a section before its first intersection is reported,
    // so a light scroll check shows anything on screen or already scrolled past
    var sweepT = 0;
    var sweep = function () {
      sweepT = 0;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || (r.height && r.top < innerHeight * 0.88)) { show(el); io.unobserve(el); return false; }
        return true;
      });
      if (!pending.length) removeEventListener('scroll', onScroll);
    };
    var onScroll = function () { if (!sweepT) sweepT = setTimeout(sweep, 140); };
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- jasmine buds and kanakambaram florets drifting across the brides ----------------
     One canvas at pixel ratio 1, at most 30 frames a second, 22 pieces on a phone and 44 on a desktop. It sleeps when
     the string is off screen or the tab is hidden, and a watchdog thins it (60%, 36%, 20%) when frames run slow:
     it is never switched off. It is clipped out of every bride (photo, caption and the last frame), so it drifts in the garland band and the gaps only. */
  function petals() {
    var hero = $('.hero'), str = $('.string');
    if (RM || petals.on || !hero || !str) return;
    petals.on = 1;
    var cv = D.createElement('canvas');
    cv.className = 'petals'; cv.setAttribute('aria-hidden', 'true');
    hero.appendChild(cv);
    var ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }
    var small = matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    var N = small ? 22 : 44, W = 0, H = 0, parts = [], level = 0, LEVELS = [1, 0.6, 0.36, 0.2];
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var holes = [], dirty = true;
    // where the brides are, relative to the canvas: from the top of each photo (or the empty frame) down
    function measure() {
      dirty = false; holes = [];
      var c = cv.getBoundingClientRect();
      brides.forEach(function (b) {
        var br = b.getBoundingClientRect(), im = b.querySelector('img, .frame'), ir = im ? im.getBoundingClientRect() : br;
        var x = br.left - c.left, w = br.width, y = ir.top - c.top;
        if (x + w > 0 && x < W) holes.push([x, y, w]);
      });
    }
    function size() {
      var w = hero.clientWidth, h = Math.max(60, str.offsetHeight - 54);
      cv.style.top = str.offsetTop + 'px'; cv.style.height = h + 'px';
      if (w !== W || h !== H) { W = cv.width = w; H = cv.height = h; }
      dirty = true;
    }
    if (row) row.addEventListener('scroll', function () { dirty = true; }, { passive: true });
    addEventListener('load', function () { dirty = true; });
    function spawn(p, first) {
      p.x = rnd(0, W); p.y = first ? rnd(-20, H) : rnd(-30, -6);
      p.vy = rnd(14, 30); p.amp = rnd(8, 22); p.ph = rnd(0, 6.28); p.f = rnd(0.5, 1.1);
      p.r = rnd(0, 6.28); p.vr = rnd(-0.6, 0.6); p.s = rnd(0.7, 1.25); p.k = Math.random() < 0.28 ? 1 : 0; p.t = 0;
    }
    size();
    for (var i = 0; i < N; i++) { var p = {}; spawn(p, true); parts.push(p); }
    function bud(p) {
      ctx.save(); ctx.translate(p.x + Math.sin(p.ph) * p.amp, p.y); ctx.rotate(p.r); ctx.scale(p.s, p.s);
      if (p.k) {
        ctx.fillStyle = '#f2803a';
        for (var a = 0; a < 5; a++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.ellipse(0, -4.4, 2.5, 4.4, 0, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = '#c4561b'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, 6.2832); ctx.fill();
      } else {
        // a jasmine flower: five white petals round a small gold heart, like the knots on the string
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(58,13,23,.5)'; ctx.lineWidth = 0.9;
        for (var b = 0; b < 5; b++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.ellipse(0, -4.2, 2.3, 4.2, 0, 0, 6.2832); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#e9a23b'; ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    }
    var raf = 0, last = 0, frames = 0, slow = 0, onScreen = true;
    function frame(now) {
      raf = 0;
      if (!onScreen || D.hidden) return;
      raf = requestAnimationFrame(frame);
      var gap = last ? now - last : 33;
      if (gap < 32) return;                        // 30 frames a second at most
      last = now;
      frames++; if (gap > 48) slow++;              // a 30 fps frame that took over 24 ms of extra time
      if (frames >= 90) {
        if (slow > 45 && level < LEVELS.length - 1) level++;
        frames = 0; slow = 0;
      }
      var dt = Math.min(gap, 100) / 1000, live = Math.ceil(N * LEVELS[level]);
      ctx.clearRect(0, 0, W, H);
      if (dirty) measure();
      // draw everywhere except over the brides (photo and caption): petals live in the garland band and the gaps
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      for (var k = 0; k < holes.length; k++) ctx.rect(holes[k][0], holes[k][1], holes[k][2], H);
      ctx.clip('evenodd');
      for (var i = 0; i < live; i++) {
        var q = parts[i];
        q.y += q.vy * dt; q.ph += q.f * dt; q.r += q.vr * dt;
        if (q.y > H + 12) spawn(q, false);
        bud(q);
      }
      ctx.restore();
    }
    function wake() { if (!raf && onScreen && !D.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    if (hasIO) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; wake(); }, { rootMargin: '80px' }).observe(str);
    D.addEventListener('visibilitychange', wake);
    var rz = 0;
    addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 200); });
    window.__petals = { level: function () { return level; }, count: function () { return Math.ceil(N * LEVELS[level]); } };
    wake();
  }

  /* ---------------- sending throws a handful of jasmine buds (the link opens at once) ---------------- */
  function burst(btn) {
    if (RM || !btn.animate) return;
    var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, n = 20;
    var span = Math.min(280, innerWidth * 0.7);
    for (var i = 0; i < n; i++) {
      var g = D.createElement('i'), floret = i % 5 === 0;
      g.setAttribute('aria-hidden', 'true');
      g.style.cssText = 'position:fixed;left:0;top:0;z-index:60;pointer-events:none;border-radius:50%;' +
        (floret ? 'width:11px;height:11px;background:#f2803a;box-shadow:inset 0 0 0 1.5px rgba(58,13,23,.4)'
                : 'width:7px;height:17px;background:#fff;box-shadow:inset 0 0 0 1px rgba(58,13,23,.5)');
      D.body.appendChild(g);
      var x0 = cx + (Math.random() - 0.5) * r.width * 0.5, dx = (Math.random() - 0.5) * span, up = 70 + Math.random() * 130;
      var rot = (Math.random() - 0.5) * 540;
      var a = g.animate([
        { transform: 'translate(' + x0 + 'px,' + cy + 'px) rotate(0deg) scale(.6)', opacity: 1 },
        { transform: 'translate(' + (x0 + dx * 0.55) + 'px,' + (cy - up) + 'px) rotate(' + rot * 0.5 + 'deg) scale(1)', opacity: 1, offset: 0.4, easing: 'cubic-bezier(.3,0,.6,1)' },
        { transform: 'translate(' + (x0 + dx) + 'px,' + (cy - up * 0.3 + 70) + 'px) rotate(' + rot + 'deg) scale(1)', opacity: 0 }
      ], { duration: 700 + Math.random() * 250, easing: 'cubic-bezier(.15,.6,.35,1)', fill: 'forwards' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(g);
    }
  }
  var send = $('#send');
  if (send) send.addEventListener('click', function (e) { if (!e.defaultPrevented) burst(send); });
})();
