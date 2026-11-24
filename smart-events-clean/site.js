/* Smart Events, clean version: behaviour. Plain script. GSAP and ScrollTrigger are optional: without them (blocked
   CDN, reduced motion) every section stays visible, the stages are a swipe row, and every WhatsApp link still works. */
(function () {
  'use strict';
  window.__se = 1;
  var D = document, root = D.documentElement;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var WA = '919159966611';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) {
    if (!el) return;
    if (!hasIO) { fn(true, el, null); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting, e.target, e); }); }, opt).observe(el);
  };
  var later = function (ms, fn) { setTimeout(fn, Math.max(0, ms - performance.now())); };

  // the opening marks itself done when its last line has drawn (the inline timer is the fallback)
  var rule = $('.nm-rule');
  if (rule) rule.addEventListener('animationend', function () { if (window.__openDone) window.__openDone(); });

  /* ---------- reveals: each runs once and never hides anything again ---------- */
  var rvs = $$('[data-rv]');
  var revealed = function (el) {
    // the planner's gold lines draw in, then hand back to the plain underline
    if (el.classList.contains('plan-form')) setTimeout(function () { $$('.line', el).forEach(function (l) { l.classList.add('done'); }); }, 1700);
  };
  if (RM || !hasIO) rvs.forEach(function (e) { e.classList.add('in'); revealed(e); });
  else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); rio.unobserve(e.target); revealed(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    rvs.forEach(function (e) { rio.observe(e); });
  }

  /* ---------- menu: a dialog, so focus, Escape and the backdrop behave natively ---------- */
  var sheet = $('[data-sheet]');
  if (sheet && sheet.showModal) {
    $$('[data-menu-open]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); sheet.showModal(); });
    });
    $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { sheet.close(); }); });
    sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
    $$('a[href^="#"]', sheet).forEach(function (a) { a.addEventListener('click', function () { sheet.close(); }); });
  }

  /* ---------- phone dock: takes over once the hero's buttons have gone, steps aside for the planner's and the footer's ---------- */
  var dock = $('[data-dock]'), heroGone = false, sendOn = false, footOn = false;
  function dockSet() {
    if (!dock) return;
    var show = heroGone && !sendOn && !footOn;
    dock.classList.toggle('on', show);
    if (show) { dock.removeAttribute('aria-hidden'); dock.removeAttribute('inert'); }
    else { dock.setAttribute('aria-hidden', 'true'); dock.setAttribute('inert', ''); }
  }
  watch($('[data-hero-acts]'), function (on, el, e) { heroGone = !on && !!e && e.boundingClientRect.top < 0; dockSet(); });
  watch($('[data-send]'), function (on) { sendOn = on; dockSet(); });
  watch($('[data-foot-cta] .foot-acts'), function (on) { footOn = on; dockSet(); });

  /* ---------- the main action's closing moment: a gold ring (and on the planner, a burst of sequins) ---------- */
  $$('.btn-wa').forEach(function (b) {
    b.addEventListener('click', function () {
      if (RM) return;
      b.classList.remove('sent'); void b.offsetWidth; b.classList.add('sent');
    });
    b.addEventListener('animationend', function (e) { if (e.target === b) b.classList.remove('sent'); });
  });
  function burst(btn) {
    if (RM || !btn.animate) return;
    var box = D.createElement('span'); box.className = 'burst'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) {
      var s = D.createElement('i'), a = i / 14 * Math.PI * 2 + Math.random() * 0.35, d = 70 + Math.random() * 80;
      box.appendChild(s);
      s.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d).toFixed(1) + 'px,' + (Math.sin(a) * d * 0.55).toFixed(1) + 'px) rotate(' + Math.round(Math.random() * 240 - 120) + 'deg) scale(.5)', opacity: 0 }
      ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    }
    btn.appendChild(box);
    setTimeout(function () { box.remove(); }, 1000);
  }

  /* ---------- hero loops pause off screen ---------- */
  var hero = $('[data-hero]');
  watch(hero, function (on) { if (hero) hero.classList.toggle('off', !on); });

  /* ---------- ambient: sequin glints drifting up through the stage light ---------- */
  // Two layers: over the hero photo, and one fixed layer seen through the dark sections (under 20% there, behind text).
  // DPR 1, about 30 fps, at most 40 specks on a phone at once. Paused off screen and in hidden tabs. A frame watchdog
  // steps the density down (1, .6, .36, .2) when frames run slow, and never switches the layer off.
  (function () {
    var cvs = $$('canvas[data-glint]');
    if (!cvs.length || !cvs[0].getContext) return;
    var small = matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    var KIND = {
      hero: { n: small ? 24 : 60, a: 0.9, flare: true, low: true, fixed: false },
      page: { n: small ? 16 : 40, a: 0.2, flare: false, low: false, fixed: true }
    };
    var SCALE = [1, 0.6, 0.36, 0.2], level = 0, lowest = 0;
    var L = cvs.map(function (cv) {
      return { cv: cv, ctx: cv.getContext('2d'), k: KIND[cv.getAttribute('data-glint')] || KIND.page, ps: [], W: 0, H: 0, on: false, t: 0 };
    });
    var B = [[], [], [], []], raf = 0, last = 0, odd = 0, frames = 0, slow = 0, good = 0;
    function spawn(o, p, anywhere) {
      p.x = Math.random() * o.W;
      p.y = anywhere ? Math.random() * o.H : o.H * (0.5 + Math.random() * 0.55);
      p.s = 1.1 + Math.random() * 2.1;
      p.vy = -(4 + Math.random() * 9);
      p.sw = Math.random() * 6.28; p.sa = 4 + Math.random() * 8;
      p.ph = Math.random() * 6.28; p.tw = 0.6 + Math.random() * 1.6;
      p.al = 0.35 + Math.random() * 0.65;
    }
    function fill(o) {
      var n = Math.max(6, Math.round(o.k.n * SCALE[level]));
      if (o.ps.length > n) o.ps.length = n;
      while (o.W && o.ps.length < n) { var p = {}; spawn(o, p, true); o.ps.push(p); }
    }
    function size(o) {
      var w = o.cv.clientWidth, h = o.cv.clientHeight;
      if (!w || !h) return;
      // a phone's address bar changes the height a little while scrolling: only a real resize respawns the specks
      if (w === o.W && Math.abs(h - o.H) < (o.k.fixed ? 160 : 2)) return;
      o.W = w; o.H = h; o.cv.width = w; o.cv.height = h; o.ps = []; fill(o);
    }
    function draw(o) {
      var c = o.ctx, i, b, p;
      c.clearRect(0, 0, o.W, o.H);
      c.fillStyle = 'rgb(238, 211, 150)';
      for (b = 0; b < 4; b++) B[b].length = 0;
      for (i = 0; i < o.ps.length; i++) {
        p = o.ps[i];
        var tw = Math.pow(0.5 + 0.5 * Math.sin(p.ph), 3);
        // over the hero, quieter low down where the name and the buttons sit
        var low = o.k.low && p.y > o.H * 0.55 ? Math.max(0.15, 1 - (p.y - o.H * 0.55) / (o.H * 0.3)) : 1;
        var v = (0.25 + 0.75 * tw) * p.al * low;
        if (v > 0.04) B[Math.min(3, (v * 4) | 0)].push(p);
      }
      for (b = 0; b < 4; b++) {
        var list = B[b]; if (!list.length) continue;
        c.globalAlpha = o.k.a * (b + 0.7) / 4;
        c.beginPath();
        for (i = 0; i < list.length; i++) {
          var q = list[i], s = q.s;
          c.moveTo(q.x, q.y - s * 1.6); c.lineTo(q.x + s, q.y); c.lineTo(q.x, q.y + s * 1.6); c.lineTo(q.x - s, q.y); c.closePath();
        }
        c.fill();
      }
      if (o.k.flare && B[3].length) {   // the brightest few flare, like a sequin catching the light
        c.globalAlpha = 0.5; c.strokeStyle = 'rgb(250, 232, 190)'; c.lineWidth = 0.8;
        c.beginPath();
        for (i = 0; i < B[3].length; i++) {
          var f = B[3][i], len = f.s * 4.2;
          c.moveTo(f.x - len, f.y); c.lineTo(f.x + len, f.y); c.moveTo(f.x, f.y - len); c.lineTo(f.x, f.y + len);
        }
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    function step(o, dt) {
      o.t += dt;
      for (var i = 0; i < o.ps.length; i++) {
        var p = o.ps[i];
        p.y += p.vy * dt; p.x += Math.sin(o.t * 0.4 + p.sw) * p.sa * dt * 0.5; p.ph += p.tw * dt;
        if (p.y < -10 || p.x < -10 || p.x > o.W + 10) spawn(o, p, false);
      }
    }
    function frame(now) {
      raf = 0;
      var gap = last ? now - last : 16.7; last = now;
      frames++; if (gap > 24) slow++;
      if (frames >= 90) {
        if (slow > 45) { good = 0; if (level < 3) { level++; lowest = Math.max(lowest, level); L.forEach(fill); } }
        else if (slow < 9) { good += frames; if (good >= 600 && level > 0) { level--; L.forEach(fill); good = 0; } }
        else good = 0;
        frames = 0; slow = 0;
      }
      if ((odd ^= 1)) { run(); return; }           // draw every second frame: about 30 fps
      var dt = Math.min(0.08, gap * 2 / 1000);
      L.forEach(function (o) { if (o.on) { step(o, dt); draw(o); } });
      run();
    }
    function any() { return L.some(function (o) { return o.on; }); }
    function run() { if (!raf && !D.hidden && any()) raf = requestAnimationFrame(frame); }
    window.__glint = {
      level: function () { return level; }, lowest: function () { return lowest; },
      count: function () { return L.reduce(function (s, o) { return s + (o.on ? o.ps.length : 0); }, 0); }
    };
    function setOn(o, v) {
      if (v && !o.on) { size(o); o.cv.classList.add('live'); }
      o.on = v;
      if (RM) { if (v) draw(o); return; }   // reduced motion: one still frame, no loop
      if (v) { last = 0; run(); } else if (!any() && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    // the hero's specks arrive at 1.4 s, as the name finishes setting; the page layer whenever a dark section shows
    later(1400, function () {
      L.forEach(function (o) {
        if (!o.k.fixed) { watch(hero, function (v) { setOn(o, v); }); return; }
        var seen = [];
        $$('.stages, .cater, .plan, .foot').forEach(function (sec) {
          watch(sec, function (v) {
            var k = seen.indexOf(sec);
            if (v && k < 0) seen.push(sec); else if (!v && k >= 0) seen.splice(k, 1);
            setOn(o, seen.length > 0);
          });
        });
      });
    });
    D.addEventListener('visibilitychange', function () { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = 0; frames = 0; slow = 0; run(); } });
    addEventListener('resize', function () { L.forEach(function (o) { if (o.on) { size(o); if (RM) draw(o); } }); });
  })();

  /* ---------- stages: a swipe row; the stage in the centre parts its drapes and its photo settles ---------- */
  var stEl = $('[data-stages]'), cards = stEl ? $$('.stage', stEl) : [];
  var stages = (function () {
    if (!stEl || !cards.length) return null;
    var vp = $('[data-stage-vp]', stEl), n = cards.length, cur = -1, seen = false, q = 0;
    var bPrev = $('[data-row-prev]', stEl), bNext = $('[data-row-next]', stEl);
    if (!RM) stEl.classList.add('live');
    if (bPrev) bPrev.disabled = true;
    function nearest() {
      var cx = innerWidth / 2, best = -1, bd = 1e9;
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        if (r.right < 0 || r.left > innerWidth) return;
        var d = Math.abs(r.left + r.width / 2 - cx); if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function setOn(i) {
      if (i < 0 || i === cur) return;
      cur = i;
      cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      if (bPrev) bPrev.disabled = i <= 0;
      if (bNext) bNext.disabled = i >= n - 1;
    }
    function check() { q = 0; if (seen) setOn(nearest()); }
    function queue() { if (!q) q = requestAnimationFrame(check); }
    vp.addEventListener('scroll', queue, { passive: true });
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    // the first stage opens as the section arrives: that is this section's entrance
    watch(stEl, function (on) { if (on && !seen) { seen = true; check(); } }, { rootMargin: '0px 0px -35% 0px' });
    var api = { queue: queue, jump: null, current: function () { return cur; } };
    api.centerOn = function (i, instant) {
      var c = cards[i]; if (!c) return;
      if (api.jump) { api.jump(i, instant); return; }
      vp.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - vp.clientWidth / 2, behavior: (instant || RM) ? 'auto' : 'smooth' });
    };
    if (bPrev) bPrev.addEventListener('click', function () { api.centerOn(Math.max(0, (cur < 0 ? 0 : cur) - 1)); });
    if (bNext) bNext.addEventListener('click', function () { api.centerOn(Math.min(n - 1, (cur < 0 ? 0 : cur) + 1)); });
    return api;
  })();

  /* ---------- full-screen viewer: grows from the card; swipe, drag, arrows, Escape ---------- */
  (function () {
    var dlg = $('[data-viewer]');
    if (!dlg || !dlg.showModal || !cards.length) return;
    var stage = $('[data-v-stage]', dlg), strip = $('[data-v-strip]', dlg), imgs = $$('.v-slide img', dlg);
    var cap = $('[data-v-cap]', dlg), cnt = $('[data-v-count]', dlg), n = cards.length, idx = 0, busy = false;
    var items = cards.map(function (c) {
      var im = $('img', c);
      return { src: c.getAttribute('data-full'), w: +c.getAttribute('data-full-w'), h: +c.getAttribute('data-full-h'), alt: im.alt,
        title: $('.stage-cap b', c).textContent, meta: $('.stage-cap span', c).textContent };
    });
    function put(img, i) { var it = items[(i + n) % n]; img.width = it.w; img.height = it.h; img.alt = it.alt; img.src = it.src; }
    function render() {
      put(imgs[1], idx); put(imgs[0], idx - 1); put(imgs[2], idx + 1);
      imgs[0].alt = ''; imgs[2].alt = '';   // only the stage on show is announced
      cap.innerHTML = '<b></b><span></span>';
      cap.firstChild.textContent = items[idx].title; cap.lastChild.textContent = items[idx].meta;
      cnt.textContent = 'Stage ' + (idx + 1) + ' of ' + n;
    }
    var EASE = 'cubic-bezier(.23,1,.32,1)', base = 'translate3d(-33.3333%,0,0)';
    function go(d) {
      if (busy) return;
      if (RM || !strip.animate) { idx = (idx + d + n) % n; render(); strip.style.transform = ''; return; }
      busy = true;
      var from = strip.style.transform || base, to = 'translate3d(' + (d > 0 ? '-66.6667%' : '0%') + ',0,0)';
      var a = strip.animate([{ transform: from }, { transform: to }], { duration: 380, easing: EASE, fill: 'forwards' });
      a.onfinish = function () { idx = (idx + d + n) % n; render(); strip.style.transform = ''; a.cancel(); busy = false; };
    }
    function snapBack() {
      var from = strip.style.transform; strip.style.transform = '';
      if (RM || !strip.animate || !from) return;
      strip.animate([{ transform: from }, { transform: base }], { duration: 300, easing: EASE });
    }
    function open(i) {
      idx = i; render(); strip.style.transform = '';
      dlg.showModal(); root.classList.add('v-open');
      if (RM || !stage.animate) return;
      // grow from the card the visitor tapped
      var r = $('.stage-ph', cards[i]).getBoundingClientRect(), s = stage.getBoundingClientRect();
      stage.style.transformOrigin = (r.left + r.width / 2 - s.left).toFixed(0) + 'px ' + (r.top + r.height / 2 - s.top).toFixed(0) + 'px';
      stage.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 440, easing: 'cubic-bezier(.16,1,.3,1)' });
      dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'linear' });
    }
    function close() {
      if (!dlg.open) return;
      // the row moves to the stage last shown, so it is the one in the centre with its drapes open
      if (stages) stages.centerOn(idx, true);
      if (RM || !dlg.animate) { dlg.close(); return; }
      var a = dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
      var done = function () { if (dlg.open) dlg.close(); a.cancel(); };
      a.onfinish = done;
      setTimeout(done, 350);   // a slow or throttled engine still closes it (and brings the name bar back)
    }
    dlg.addEventListener('close', function () {
      root.classList.remove('v-open');
      var b = $('.stage-btn', cards[idx]); if (b) b.focus({ preventScroll: true });
    });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    $('[data-v-close]', dlg).addEventListener('click', close);
    $('[data-v-prev]', dlg).addEventListener('click', function () { go(-1); });
    $('[data-v-next]', dlg).addEventListener('click', function () { go(1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // a sideways drag or swipe moves the strip with the finger; vertical moves are left alone (touch-action: pan-y)
    var ds = null;
    stage.addEventListener('pointerdown', function (e) { if (e.button || busy) return; ds = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false, t: performance.now() }; });
    stage.addEventListener('pointermove', function (e) {
      if (!ds || e.pointerId !== ds.id) return;
      var dx = e.clientX - ds.x, dy = e.clientY - ds.y;
      if (!ds.on) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) { ds.on = true; try { stage.setPointerCapture(e.pointerId); } catch (x) {} stage.classList.add('drag'); }
        else if (Math.abs(dy) > 14) { ds = null; return; }
        else return;
      }
      strip.style.transform = 'translate3d(calc(-33.3333% + ' + dx.toFixed(1) + 'px),0,0)';
    });
    var end = function (e) {
      if (!ds) return;
      var d = ds; ds = null; stage.classList.remove('drag');
      if (!d.on) return;
      var dx = e.clientX - d.x, v = dx / Math.max(1, performance.now() - d.t);
      if (Math.abs(dx) > stage.clientWidth * 0.18 || Math.abs(v) > 0.45) go(dx < 0 ? 1 : -1); else snapBack();
    };
    stage.addEventListener('pointerup', end);
    // a gesture the browser takes back (a call, a system swipe) never turns the page: the strip just settles back
    stage.addEventListener('pointercancel', function () { var d = ds; ds = null; stage.classList.remove('drag'); if (d && d.on) snapBack(); });
    cards.forEach(function (c, i) { $('.stage-btn', c).addEventListener('click', function () { open(i); }); });
    window.__viewer = { open: open, close: close, go: go, index: function () { return idx; } };
  })();

  /* ---------- what we do: the step nearest the middle of the screen (or the one tapped) drops its photo in ---------- */
  (function () {
    var svc = $('[data-svc]');
    if (!svc) return;
    var items = $$('.svc-item', svc), imgs = $$('.svc-frame img', svc), capEl = $('[data-svc-cap]', svc), act = 0, wasT = 0;
    function set(i) {
      if (i === act || i < 0) return;
      var old = act; act = i;
      items.forEach(function (it, k) { it.classList.toggle('on', k === i); $('.svc-btn', it).setAttribute('aria-pressed', String(k === i)); });
      imgs.forEach(function (im) { im.classList.remove('was'); });
      imgs[old].classList.remove('on', 'drop'); imgs[old].classList.add('was');
      var im = imgs[i]; im.classList.add('on');
      if (!RM) { im.classList.remove('drop'); void im.offsetWidth; im.classList.add('drop'); }
      if (capEl) capEl.textContent = $('.svc-t', items[i]).textContent;
      clearTimeout(wasT); wasT = setTimeout(function () { imgs[old].classList.remove('was'); }, 900);
    }
    items.forEach(function (it, i) { $('.svc-btn', it).addEventListener('click', function () { set(i); }); });
    // phones show one photo per row, so the step buttons only matter beside the sticky photo on desktop
    var desk = matchMedia('(min-width: 1024px)');
    function mode() {
      items.forEach(function (it) {
        var b = $('.svc-btn', it);
        if (desk.matches) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', '-1');
      });
    }
    mode(); if (desk.addEventListener) desk.addEventListener('change', mode);
    if (hasIO) {
      var io = new IntersectionObserver(function (es) {
        if (!desk.matches) return;
        es.forEach(function (e) { if (e.isIntersecting) set(items.indexOf(e.target)); });
      }, { rootMargin: '-48% 0px -48% 0px' });
      items.forEach(function (it) { io.observe(it); });
    }
  })();

  /* ---------- the planner: the answers become one WhatsApp message ---------- */
  (function () {
    var form = $('#planner');
    if (!form) return;
    var msgEl = $('[data-msg]', form), send = $('[data-send]', form), other = $('[data-other]', form), otherIn = $('#p-other');
    var date = $('#p-date'), guests = $('#p-guests'), where = $('#p-where'), dateBox = $('[data-date]', form);
    var OCC = { birthday: 'a birthday', wedding: 'a wedding', ear: 'an ear-piercing ceremony (காதணி விழா)', traditional: 'a traditional function', corporate: 'a corporate event' };
    try { var t = new Date(); date.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10); } catch (x) { /* old browser */ }
    var clean = function (s) { return (s || '').replace(/\s+/g, ' ').trim().replace(/[.\s]+$/, ''); };
    function fmtDate(v) {
      var p = (v || '').split('-'); if (p.length !== 3) return '';
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      try { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (x) { return v; }
    }
    var lastOcc = '';
    function build() {
      var occEl = $('input[name=occ]:checked', form), occ = occEl ? occEl.value : '';
      other.hidden = occ !== 'other';
      if (occ === 'other' && lastOcc !== 'other' && D.activeElement && D.activeElement.name === 'occ') otherIn.focus();
      lastOcc = occ;
      var o = clean(otherIn.value);
      var what = OCC[occ] || (occ === 'other' && o ? 'a function (' + o + ')' : 'a function');
      var msg = 'Hello Smart Events, I\'d like to plan ' + what;
      var dt = fmtDate(date.value); if (dt) msg += ' on ' + dt;
      dateBox.classList.toggle('has', !!date.value);
      // the first number typed counts ("150-200" reads as about 150, "1,500" as 1500)
      var m = (guests.value || '').match(/\d[\d,]*/), g = m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
      if (g > 0 && g <= 20000) msg += ' for about ' + g + (g === 1 ? ' guest' : ' guests');
      var w = clean(where.value); if (w) msg += ' at ' + w;
      msg += '.';
      var needs = $$('input[name=need]:checked', form).map(function (i) { return i.value; });
      if (needs.length) msg += ' I need: ' + needs.join(', ') + '.';
      msg += ' Could you share the details?';
      msgEl.textContent = msg;
      send.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    }
    form.addEventListener('input', build); form.addEventListener('change', build);
    form.addEventListener('submit', function (e) { e.preventDefault(); build(); window.open(send.href, '_blank', 'noopener'); });
    send.addEventListener('click', function () { build(); burst(send); });
    build();
  })();

  /* ---------- visit: today's row, and the map only when asked for ---------- */
  (function () {
    var hours = $('.hours');
    if (hours) {
      var day = '';
      try { day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date()); } catch (x) { day = ''; }
      $$('tr', hours).forEach(function (tr) {
        if (day && (tr.getAttribute('data-days') || '').split(' ').indexOf(day) >= 0) {
          tr.classList.add('today');
          var tag = D.createElement('span'); tag.className = 'now'; tag.textContent = 'Today';
          $('th', tr).appendChild(tag);
        }
      });
    }
    var map = $('[data-map]'), mb = map && $('[data-map-load]', map);
    if (mb) mb.addEventListener('click', function () {
      var f = D.createElement('iframe');
      // the pin from their listing's place link (an address search landed on a different spot)
      f.src = 'https://www.google.com/maps?q=11.0373671,77.0377434&z=16&output=embed';
      f.title = 'Map: Smart Events, Kumarasamy Nagar, Coimbatore';
      f.setAttribute('allowfullscreen', '');
      map.appendChild(f);
      mb.remove();
    });
  })();

  /* ---------- numbers count once, from 35% of the real value (power3.out, 1.9 s); the real value is in the page ---------- */
  $$('[data-count]').forEach(function (el) {
    if (RM) return;
    var to = +el.getAttribute('data-count'), suffix = el.textContent.replace(/[\d,]/g, ''), from = Math.round(to * 0.35);
    watch(el, function (on) {
      if (!on || el.__counted) return;
      el.__counted = true;
      el.style.display = 'inline-block'; el.style.minWidth = el.offsetWidth + 'px';   // the line never reflows while it counts
      var t0 = performance.now();
      (function tick(now) {
        var k = Math.min(1, (now - t0) / 1900), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { rootMargin: '0px 0px -12% 0px' });
  });

  /* ---------- GSAP layer (desktop only): the pinned stage track ---------- */
  // Loaded after the page is up, so it is never in the opening's path; if the CDN is blocked, the stages stay a row.
  // a mouse or trackpad only: touch tablets keep the swipe row
  var WIDE = '(min-width: 1024px) and (pointer: fine)', wide = matchMedia(WIDE);
  if (RM || !wide.matches) return;
  var LIBS = [
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js', 'sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc'],
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js', 'sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh']
  ];
  function loadLib(i) {
    if (i >= LIBS.length) { gsapLayer(); return; }
    var s = D.createElement('script');
    s.src = LIBS[i][0]; s.integrity = LIBS[i][1]; s.crossOrigin = 'anonymous';
    s.onload = function () { loadLib(i + 1); };
    D.head.appendChild(s);
  }
  if (D.readyState === 'complete') loadLib(0); else addEventListener('load', function () { loadLib(0); });

  function gsapLayer() {
  var g = window.gsap, ST = window.ScrollTrigger;
  if (!g || !ST) return;
  g.registerPlugin(ST);
  var mm = g.matchMedia();

  mm.add(WIDE, function () {
    if (!stEl || !stages) return;
    var vp = $('[data-stage-vp]', stEl), track = $('[data-stage-track]', stEl), n = cards.length;
    stEl.classList.add('is-pinned'); vp.scrollLeft = 0;
    var travel = function () { return Math.max(0, track.scrollWidth - vp.clientWidth); };
    var tw = g.to(track, {
      x: function () { return -travel(); }, ease: 'none', onUpdate: stages.queue,
      scrollTrigger: { trigger: stEl, start: 'top top', end: function () { return '+=' + Math.round(travel()); }, pin: true, scrub: 0.6, invalidateOnRefresh: true }
    });
    stages.jump = function (i, instant) {
      var s = tw.scrollTrigger;
      scrollTo({ top: s.start + (s.end - s.start) * (i / Math.max(1, n - 1)), behavior: instant ? 'auto' : 'smooth' });
    };
    return function () { stages.jump = null; stEl.classList.remove('is-pinned'); g.set(track, { clearProps: 'transform' }); };
  });
  ST.refresh();
  }
})();
