/* Upgrade kit (plain JS, no library): scenes, counters, one ambient canvas, the closing moment, desktop parallax.
   Everything is optional: without this script (or with motion reduced) every section is visible and every link works. */
(function () {
  'use strict';
  window.__pw = 1;
  var D = document, R = D.documentElement;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var PW = window.PW = {};
  // Everything that is not the opening waits until the opening has played, then runs when the browser is idle.
  PW.later = function (fn) {
    var ran = 0;
    function go() { if (ran) return; ran = 1; (window.requestIdleCallback || function (f) { setTimeout(f, 60); })(fn, { timeout: 1200 }); }
    if (R.dataset.opening === 'done') { go(); return; }
    try { new MutationObserver(function (m, o) { if (R.dataset.opening === 'done') { o.disconnect(); go(); } }).observe(R, { attributes: true, attributeFilter: ['data-opening'] }); } catch (x) {}
    setTimeout(go, 3600);
  };

  /* ---- scenes: each element enters once, in its own way (data-sc), then the hook is removed so the page's own styles take over ---- */
  PW.scenes = function (list) {
    if (RM || !hasIO || R.classList.contains('rv-fail')) return;
    // Elements are only given their hidden starting state when they are within about two screens of the viewport, so
    // a long page does not pay for hundreds of hidden elements at load (it measured 0.3 s of main-thread time).
    var pending = [], armed = [];
    list.forEach(function (row) {
      var sel = row[0], kind = row[1], opt = row[2] || {};
      $$(sel).forEach(function (el, k) {
        if (el.__sc) return;
        // opt.of: the stagger follows the card the element belongs to (the card itself stays unclipped so it can always be tapped)
        var host = opt.of ? el.closest(opt.of) : el;
        var i = opt.group ? ((host && host.parentElement ? $$(opt.of || sel, host.parentElement).indexOf(host) : 0)) : (opt.seq ? k : 0);
        el.__sc = { kind: kind, i: Math.min(i, 8), st: opt.st || 0 };
        pending.push(el);
      });
    });
    var q = 0, io = null;
    function arm(el) {
      var s = el.__sc;
      el.classList.add('sc', 'sc-' + s.kind);
      el.style.setProperty('--i', s.i);
      if (s.st) el.style.setProperty('--st', s.st + 'ms');
    }
    function reveal(el) {
      el.classList.add('sc-in');
      var i = el.__sc.i;
      setTimeout(function () {
        [].slice.call(el.classList).forEach(function (c) { if (c === 'sc' || c.indexOf('sc-') === 0) el.classList.remove(c); });
        el.style.removeProperty('--i'); el.style.removeProperty('--st');
      }, 1500 + i * 90);
    }
    // Only the elements already armed are measured (a handful), never all of them at once: the first version read the
    // position of every target in one frame (99 elements, 135 ms on a throttled phone, most of it forced layout).
    // Not an IntersectionObserver for the reveal: the hidden state is a clip-path, and Chrome counts a fully clipped box as not visible.
    function check() {
      q = 0;
      var vh = innerHeight, show = [], i, el, r;
      for (i = armed.length - 1; i >= 0; i--) { el = armed[i]; r = el.getBoundingClientRect(); if (r.top < vh) { armed.splice(i, 1); show.push(el); } }   // also anything a fast scroll has already passed
      for (i = show.length - 1; i >= 0; i--) reveal(show[i]);
    }
    function queue() { if (!q) q = requestAnimationFrame(check); }
    // An element gets its hidden starting state only once it is within about a screen and a half below the viewport
    // (the observer knows this without anyone measuring), so a long page does not pay for hundreds of hidden elements at load.
    function start() {
      if (io) return;
      io = new IntersectionObserver(function (es) {
        var any = false;
        es.forEach(function (e) {
          // above the viewport (a jump or a fast scroll got past it): it stays as it is and is never hidden, so it cannot blank
          // and re-enter when the visitor scrolls back up
          if (!e.isIntersecting) { if (e.boundingClientRect.bottom <= 0) io.unobserve(e.target); return; }
          io.unobserve(e.target);
          // already on screen when first looked at (text that was readable during the opening): it stays as it is, never hidden and shown again
          if (e.boundingClientRect.top < innerHeight && e.boundingClientRect.bottom > 0) return;
          arm(e.target); armed.push(e.target); any = true;
        });
        if (any) setTimeout(queue, 70);   // the ones already on screen reveal one beat after they were hidden
      }, { rootMargin: '0px 0px 150% 0px' });
      pending.forEach(function (el) { io.observe(el); });
      addEventListener('scroll', queue, { passive: true });
    }
    // the first look waits until the opening has played and the browser is idle: reading positions while fonts are still arriving forces a full layout
    function idle() { setTimeout(function () { (window.requestIdleCallback || function (f) { setTimeout(f, 60); })(start, { timeout: 900 }); }, 500); }   // a beat after the other deferred work, so the two never share a task
    if (R.dataset.opening === 'done') idle();
    else {
      try { new MutationObserver(function (m, o) { if (R.dataset.opening === 'done') { o.disconnect(); idle(); } }).observe(R, { attributes: true, attributeFilter: ['data-opening'] }); } catch (x) {}
      setTimeout(idle, 3600);
    }
  };
  /* ---- numbers count once, from 35% of the real value over 1.9 s (power3.out); the real value stays in the page ---- */
  PW.count = function (sel) {
    if (RM || !hasIO) return;
    $$(sel).forEach(function (el) {
      var walker = D.createTreeWalker(el, NodeFilter.SHOW_TEXT), node = null, n;
      while ((n = walker.nextNode())) if (/\d/.test(n.nodeValue)) { node = n; break; }
      if (!node) return;
      var m = node.nodeValue.match(/^(\D*)([\d,]+)(.*)$/s);
      if (!m) return;
      var to = parseInt(m[2].replace(/,/g, ''), 10), from = Math.round(to * 0.35);
      if (!(to > 20)) return;
      var orig = node.nodeValue, comma = m[2].indexOf(',') >= 0, indian = /^\d{1,2}(,\d{2})+,\d{3}$/.test(m[2]);
      var fmt = function (v) {
        if (!comma) return String(v);
        if (!indian || v < 1000) return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        var last = String(v % 1000); while (last.length < 3) last = '0' + last;   // Indian grouping: 2,10,000
        return String(Math.floor(v / 1000)).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last;
      };
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          o.disconnect();
          var w = el.offsetWidth; el.style.display = el.style.display || 'inline-block'; el.style.minWidth = w + 'px';
          var t0 = performance.now();
          (function tick(now) {
            var k = Math.min(1, (now - t0) / 1900), x = 1 - Math.pow(1 - k, 3);
            node.nodeValue = m[1] + fmt(Math.round(from + (to - from) * x)) + m[3];
            if (k < 1) requestAnimationFrame(tick); else { node.nodeValue = orig; el.style.minWidth = ''; }
          })(t0);
        });
      }, { rootMargin: '0px 0px -10% 0px' }).observe(el);
    });
  };

  /* ---- ambient: one canvas per host, DPR 1, about 30 fps, at most 40 specks on a phone, paused off screen and in hidden tabs,
          a frame watchdog steps the density down (1, .6, .36, .2) and never switches the layer off ---- */
  PW.ambient = function (cfg) {
    var hosts = $$(cfg.host);
    if (!hosts.length) return;
    var small = matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    var N = small ? Math.min(cfg.phone || 24, 40) : Math.min(cfg.desk || 60, 100);
    var SCALE = [1, 0.6, 0.36, 0.2], level = 0;
    // a canvas is only made when its host first comes on screen, so nothing is built (or laid out) for sections nobody has reached
    var L = hosts.map(function (h) { return { h: h, cv: null, ctx: null, ps: [], W: 0, H: 0, on: false, t: 0 }; });
    function ensure(o) {
      if (o.cv) return !!o.ctx;
      var cv = D.createElement('canvas'); cv.className = 'pw-cv'; cv.setAttribute('aria-hidden', 'true');
      o.h.insertBefore(cv, o.h.firstChild);
      o.cv = cv; o.ctx = cv.getContext('2d');
      return !!o.ctx;
    }
    var raf = 0, last = 0, odd = 0, frames = 0, slow = 0, good = 0;
    var col = cfg.color || '255,255,255', al = cfg.alpha || 0.18, shape = cfg.shape || 'dot';
    function spawn(o, p, anywhere) {
      var s = cfg.speed || 1;
      p.x = Math.random() * o.W; p.y = Math.random() * o.H;
      if (!anywhere) {
        if (cfg.vx > 0) p.x = -8; else if (cfg.vx < 0) p.x = o.W + 8;
        if (cfg.vy > 0) p.y = -8; else if (cfg.vy < 0) p.y = o.H + 8;
      }
      p.s = (cfg.size || 1.6) * (0.6 + Math.random() * 1.1);
      p.vx = (cfg.vx || 0) * s * (0.6 + Math.random() * 0.8); p.vy = (cfg.vy || 0) * s * (0.6 + Math.random() * 0.8);
      p.ph = Math.random() * 6.28; p.tw = 0.5 + Math.random() * 1.4; p.a = 0.35 + Math.random() * 0.65; p.r = Math.random() * 6.28;
      p.sw = 3 + Math.random() * 8;
    }
    function fill(o) {
      var n = Math.max(6, Math.round(N * SCALE[level]));
      if (o.ps.length > n) o.ps.length = n;
      while (o.W && o.ps.length < n) { var p = {}; spawn(o, p, true); o.ps.push(p); }
    }
    function size(o) {
      var w = o.cv.clientWidth, h = o.cv.clientHeight;
      if (!w || !h) return;
      if (w === o.W && Math.abs(h - o.H) < 160) return;
      o.W = w; o.H = h; o.cv.width = Math.round(w * 0.5); o.cv.height = Math.round(h * 0.5); o.ctx.setTransform(0.5, 0, 0, 0.5, 0, 0); o.ps = []; fill(o);   // soft specks need only half the pixels
    }
    function draw(o) {
      var c = o.ctx, i, p;
      c.clearRect(0, 0, o.W, o.H);
      c.fillStyle = c.strokeStyle = 'rgb(' + col + ')';
      for (i = 0; i < o.ps.length; i++) {
        p = o.ps[i];
        var tw = cfg.twinkle ? (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(p.ph), 2)) : 1;
        c.globalAlpha = al * p.a * tw;
        if (shape === 'streak') { c.lineWidth = Math.max(1, p.s * 0.5); c.beginPath(); var dir = p.vx < 0 ? 1 : -1; c.moveTo(p.x, p.y); c.lineTo(p.x + dir * p.s * 9, p.y); c.stroke(); }
        else if (shape === 'diamond') { c.beginPath(); c.moveTo(p.x, p.y - p.s * 1.6); c.lineTo(p.x + p.s, p.y); c.lineTo(p.x, p.y + p.s * 1.6); c.lineTo(p.x - p.s, p.y); c.closePath(); c.fill(); }
        else if (shape === 'leaf') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.beginPath(); c.ellipse(0, 0, p.s * 2.2, p.s * 0.9, 0, 0, 6.283); c.fill(); c.restore(); }
        else if (shape === 'flake') { c.beginPath(); c.arc(p.x, p.y, p.s, 0, 6.283); c.fill(); }
        else { c.beginPath(); c.arc(p.x, p.y, p.s * 0.8, 0, 6.283); c.fill(); }
      }
      c.globalAlpha = 1;
    }
    function step(o, dt) {
      o.t += dt;
      for (var i = 0; i < o.ps.length; i++) {
        var p = o.ps[i];
        p.x += (p.vx + (cfg.vy ? Math.sin(o.t * 0.5 + p.ph) * p.sw : 0)) * dt;
        p.y += (p.vy + (cfg.vx && !cfg.vy ? Math.sin(o.t * 0.7 + p.ph) * p.sw * 0.4 : 0)) * dt;
        p.ph += p.tw * dt; p.r += dt * 0.6;
        if (p.x < -40 || p.x > o.W + 40 || p.y < -40 || p.y > o.H + 40) spawn(o, p, false);
      }
    }
    function any() { return L.some(function (o) { return o.on; }); }
    function run() { if (!raf && !D.hidden && any()) raf = requestAnimationFrame(frame); }
    function frame(now) {
      raf = 0;
      var gap = last ? now - last : 16.7; last = now;
      frames++; if (gap > 24) slow++;
      if (frames >= 90) {
        if (slow > 45) { good = 0; if (level < 3) { level++; L.forEach(fill); } }
        else if (slow < 9) { good += frames; if (good >= 600 && level > 0) { level--; L.forEach(fill); good = 0; } }
        else good = 0;
        frames = 0; slow = 0;
      }
      if ((odd ^= 1)) { run(); return; }
      var dt = Math.min(0.08, gap * 2 / 1000);
      L.forEach(function (o) { if (o.on) { step(o, dt); draw(o); } });
      run();
    }
    window.__glint = { level: function () { return level; }, count: function () { return L.reduce(function (s, o) { return s + (o.on ? o.ps.length : 0); }, 0); } };
    function setOn(o, v) {
      if (v && !ensure(o)) return;
      if (v && !o.on) { size(o); o.cv.classList.add('live'); }
      o.on = v;
      if (RM) { if (v) draw(o); return; }
      if (v) { last = 0; run(); } else if (!any() && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    // the layer arrives after the opening has played, so it is never in the opening's path
    PW.later(function () {
      L.forEach(function (o) {
        if (!hasIO) { setOn(o, true); return; }
        new IntersectionObserver(function (es) { es.forEach(function (e) { setOn(o, e.isIntersecting); }); }).observe(o.h);
      });
    });
    D.addEventListener('visibilitychange', function () { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = 0; frames = 0; slow = 0; run(); } });
    addEventListener('resize', function () { L.forEach(function (o) { if (o.on) { size(o); if (RM) draw(o); } }); });
  };

  /* ---- the main action's closing moment: a burst from the button, at most 1 s, never delaying the link ---- */
  PW.burst = function (sel, colors) {
    if (RM) return;
    var cs = colors || ['#ffc83d', '#ffffff'];
    $$(sel).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!b.animate) return;
        var r = b.getBoundingClientRect(), box = D.createElement('span');
        box.className = 'pw-burst'; box.setAttribute('aria-hidden', 'true');
        box.style.left = (r.left + r.width / 2) + 'px'; box.style.top = (r.top + r.height / 2) + 'px';
        for (var i = 0; i < 14; i++) {
          var s = D.createElement('i'), a = i / 14 * 6.2832 + Math.random() * 0.4, d = 50 + Math.random() * 70;
          s.style.background = cs[i % cs.length];
          box.appendChild(s);
          s.animate([
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: 'translate(' + (Math.cos(a) * d * 1.3 - 3).toFixed(0) + 'px,' + (Math.sin(a) * d * 0.7 - 3).toFixed(0) + 'px) scale(.4)', opacity: 0 }
          ], { duration: 520 + Math.random() * 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
        }
        D.body.appendChild(box);
        setTimeout(function () { box.remove(); }, 950);
      });
    });
  };

  /* ---- desktop only: slow parallax on marked photos (mouse and trackpad only, never touch) ---- */
  PW.parallax = function (sel) {
    if (RM || !matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;
    var els = $$(sel).map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par')) || 0.06, on: false }; });
    if (!els.length) return;
    var q = 0;
    function upd() {
      q = 0;
      var vh = innerHeight;
      els.forEach(function (o) {
        if (!o.on) return;
        var r = o.el.parentElement.getBoundingClientRect();
        o.el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -o.k).toFixed(1) + 'px';
      });
    }
    els.forEach(function (o) {
      if (!hasIO) return;
      new IntersectionObserver(function (es) { es.forEach(function (e) { o.on = e.isIntersecting; if (o.on) upd(); }); }).observe(o.el.parentElement);
    });
    addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(upd); }, { passive: true });
  };

  /* ---- a thin progress ribbon under the name bar (transform only) ---- */
  PW.progress = function (sel) {
    var el = D.querySelector(sel);
    if (!el) return;
    var q = 0;
    function upd() { q = 0; var m = R.scrollHeight - innerHeight; el.style.setProperty('--p', m > 0 ? Math.min(1, scrollY / m).toFixed(4) : 0); }
    addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(upd); }, { passive: true });
  };

  /* ---- keep the page reachable by keyboard and in-page links: anchors never land under the name bar (CSS handles it) ---- */
  PW.ready = function () { R.classList.add('pw-on'); };
})();

/* Resort version: scenes, counters, ambient spray, planner flash, closing burst. */
(function () {
  var home = !!document.querySelector('.hero');
  PW.scenes(home ? [
    ['.sec h2', 'mask'],
    ['.sec .lead', 'slide-l'],
    // the cards and links keep their whole box (a clipped box cannot be tapped): only what is inside them is revealed
    ['.vcard > *', 'clip', { group: 1, of: '.vcard', st: 110 }],
    ['.ocard > *', 'clipr', { group: 1, of: '.ocard', st: 90 }],
    ['.wall a img', 'clip', { group: 1, of: 'a', st: 60 }],
    ['.dark .planner > *', 'rise', { group: 1, st: 70 }],
    ['.foot .wrap > div > *', 'clipx', { group: 1, of: '.foot .wrap > div', st: 120 }]
  ] : [
    ['.sub', 'mask'],
    ['.spec > div', 'print', { group: 1, st: 90 }],
    ['.ticks li', 'slide-l', { group: 1, st: 70 }],
    ['.small-note', 'clipx'],
    ['.dark h2', 'mask'],
    ['.dark .lead', 'slide-l'],
    ['.dark .planner > *', 'rise', { group: 1, st: 70 }],
    ['.ocard > *', 'clipr', { group: 1, of: '.ocard', st: 90 }],
    ['.more-head', 'mask'],
    ['.foot .wrap > div > *', 'clipx', { group: 1, of: '.foot .wrap > div', st: 120 }]
  ]);
  // none of this is part of the opening: it is wired when the opening has played and the browser is idle
  PW.later(function () {
    PW.ambient({ host: '.hero, .dark', color: '242,233,194', alpha: 0.2, vy: -9, vx: 0, size: 2.4, phone: 22, desk: 48, twinkle: true });
    // the waterfall's mist drifts over the hero photo (CSS, transform only); it rests while the hero is off screen
    var hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { hero.classList.toggle('mist-off', !e.isIntersecting); }); }).observe(hero);
    PW.burst('a[href*="wa.me"]', ['#ffffff', '#f2e9c2', '#8fb5ad']);
    PW.progress('.top');
    // a photo that failed to arrive (a dropped request on a poor connection) is asked for once more, never left as its alt text
    [].forEach.call(document.querySelectorAll('.wall img, .vcard img'), function (im) {
      var retry = function () { if (!im.__again) { im.__again = 1; var s = im.getAttribute('src'); im.removeAttribute('src'); im.setAttribute('src', s); } };
      im.addEventListener('error', retry);
      if (im.complete && !im.naturalWidth) retry();
    });
  });
  // the planner: the preview flashes each time the message is rewritten
  var pv = document.querySelector('[data-preview]'), pl = document.querySelector('[data-planner]');
  if (pv && pl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var flash = function () { pv.classList.remove('pw-flash'); void pv.offsetWidth; pv.classList.add('pw-flash'); };
    pl.addEventListener('change', flash);
    pl.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-step]')) flash(); });
    pv.addEventListener('animationend', function () { pv.classList.remove('pw-flash'); });
  }
})();
