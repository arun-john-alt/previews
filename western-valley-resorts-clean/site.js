/* Western Valley Resorts, clean version: behaviour. Plain script, no libraries. Without it (or with reduced motion)
   every section stays visible and every WhatsApp link still works. The page never states availability or a tariff. */
(function () {
  'use strict';
  window.__wv = 1;
  var D = document, root = D.documentElement;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var watch = function (el, fn, opt) {
    if (!el) return;
    if (!hasIO) { fn(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting); }); }, opt).observe(el);
  };
  var later = function (ms, fn) { setTimeout(fn, Math.max(0, ms - performance.now())); };

  /* ---------- scroll scenes: each section's own entrance runs once and never hides anything again ---------- */
  var rvs = $$('[data-rv]');
  if (RM || !hasIO) rvs.forEach(function (e) { e.classList.add('in'); });
  else {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    rvs.forEach(function (e) { rio.observe(e); });
    // a second check on scroll: a fast flick or a jump can skip past a section before the observer reports it, and
    // anything above the screen must still end up shown
    var sq = 0;
    var sweep = function () {
      sq = 0;
      rvs.forEach(function (e) {
        if (e.classList.contains('in')) return;
        if (e.getBoundingClientRect().top < innerHeight * 0.92) { e.classList.add('in'); rio.unobserve(e); }
      });
    };
    var queue = function () { if (!sq) sq = requestAnimationFrame(sweep); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    addEventListener('hashchange', queue);
  }

  /* ---------- the enquiry: the sentence is the signature. Tap a blank, pick, and its line inks in again ---------- */
  var form = $('#ask');
  var sel = function (n) { return form.querySelector('select[name="' + n + '"]'); };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fill(select, items, chosen) {
    select.innerHTML = '';
    items.forEach(function (it) {
      var o = D.createElement('option');
      o.value = it[0]; o.textContent = it[1];
      if (it[0] === chosen) o.selected = true;
      select.appendChild(o);
    });
  }
  var guests = [], nights = [], dates = [];
  for (var g = 1; g <= 15; g++) guests.push([String(g), g + (g === 1 ? ' guest' : ' guests')]);
  guests.push(['16+', '16+ guests']);
  for (var n = 1; n <= 10; n++) nights.push([String(n), n + (n === 1 ? ' night' : ' nights')]);
  var today = new Date(); today.setHours(12, 0, 0, 0);
  var firstSat = null;
  for (var i = 1; i <= 120; i++) {
    var d = new Date(today); d.setDate(today.getDate() + i);
    var txt = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    dates.push([txt, txt]);
    if (!firstSat && d.getDay() === 6) firstSat = txt;
  }
  fill(sel('nights'), nights, '2');
  fill(sel('date'), dates, firstSat);
  fill(sel('guests'), guests, '2');

  function shown(name) { var s = sel(name); return s.options[s.selectedIndex].text; }
  function update() {
    ['nights', 'date', 'guests'].forEach(function (k) { form.querySelector('[data-v="' + k + '"]').textContent = shown(k); });
    var one = sel('guests').value === '1';
    var msg = 'Hello Western Valley! ' + (one ? "I'd" : "We'd") + ' like to stay ' + shown('nights') + ' from ' +
      sel('date').value + (one ? ', just me.' : ', for ' + shown('guests') + '.') + ' Please share the tariff.';
    var href = 'https://wa.me/919003930530?text=' + encodeURIComponent(msg);
    $('#send').href = href;
    $$('[data-wa]').forEach(function (a) { a.href = href; });
  }
  form.addEventListener('change', function (e) {
    update();
    var b = e.target.closest && e.target.closest('.blank');
    if (!b || RM) return;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); location.href = $('#send').href; });
  update();

  /* ---------- the main action's closing moment: a brick ring and a few iron bars leaping up. The link is never delayed ---------- */
  function burst(btn) {
    if (RM || !btn.animate) return;
    var box = D.createElement('span'); box.className = 'burst'; box.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < 9; k++) {
      var bar = D.createElement('i'), dx = (k - 4) * 15, up = 38 + Math.random() * 38;
      box.appendChild(bar);
      bar.animate([
        { transform: 'translate(' + (dx * 0.35).toFixed(0) + 'px,0) scaleY(.5)', opacity: 0.95 },
        { transform: 'translate(' + dx + 'px,-' + up.toFixed(0) + 'px) scaleY(1)', opacity: 0 }
      ], { duration: 560 + Math.random() * 260, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    }
    btn.appendChild(box);
    setTimeout(function () { box.remove(); }, 950);
  }
  $$('a.send').forEach(function (b) {
    b.addEventListener('click', function () {
      if (RM) return;
      b.classList.add('again');
      b.classList.remove('sent'); void b.offsetWidth; b.classList.add('sent');
      burst(b);
    });
    b.addEventListener('animationend', function (e) { if (e.target === b) b.classList.remove('sent'); });
  });

  /* ---------- ambient: valley mist drifting across the gate photo, and a few specks of light ---------- */
  // DPR 1, about 30 fps, at most 22 shapes on a phone (6 mist, 16 specks) and 50 on a desktop. Paused off screen and in
  // hidden tabs. A frame watchdog steps the density down (1, .6, .36, .2) and never switches the layer off.
  (function () {
    var cv = $('canvas[data-mist]');
    if (!cv || !cv.getContext) return;
    var host = cv.parentNode, ctx = cv.getContext('2d');
    var small = matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    var NM = small ? 6 : 10, NS = small ? 16 : 40;
    var SC = [1, 0.6, 0.36, 0.2], level = 0;
    var sprite = (function () {
      var c = D.createElement('canvas'); c.width = c.height = 96;
      var x = c.getContext('2d'), gr = x.createRadialGradient(48, 48, 0, 48, 48, 48);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.55, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, 96, 96); return c;
    })();
    var W = 0, H = 0, mist = [], specks = [], on = false, raf = 0, last = 0, odd = 0, frames = 0, slow = 0, good = 0, t = 0;
    function newMist(m, any) {
      m.s = W * (0.6 + Math.random() * 0.55);
      m.x = any ? Math.random() * (W + m.s) - m.s * 0.5 : -m.s * 0.5;
      m.y = H * (0.5 + Math.random() * 0.45); m.v = 7 + Math.random() * 11;
      m.a = 0.35 + Math.random() * 0.4; m.ph = Math.random() * 6.28;
    }
    function newSpeck(p, any) {
      p.x = Math.random() * W; p.y = any ? Math.random() * H : H * (0.6 + Math.random() * 0.45);
      p.s = 0.9 + Math.random() * 1.4; p.vy = -(4 + Math.random() * 7); p.sw = Math.random() * 6.28;
      p.ph = Math.random() * 6.28; p.tw = 0.6 + Math.random() * 1.4;
    }
    function fill() {
      var nm = Math.max(2, Math.round(NM * SC[level])), ns = Math.max(4, Math.round(NS * SC[level]));
      if (mist.length > nm) mist.length = nm;
      if (specks.length > ns) specks.length = ns;
      while (W && mist.length < nm) { var m = {}; newMist(m, true); mist.push(m); }
      while (W && specks.length < ns) { var p = {}; newSpeck(p, true); specks.push(p); }
    }
    function size() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h || (w === W && h === H)) return;
      W = w; H = h; cv.width = w; cv.height = h; mist = []; specks = []; fill();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, m, p;
      for (i = 0; i < mist.length; i++) {
        m = mist[i];
        ctx.globalAlpha = m.a * (0.8 + 0.2 * Math.sin(m.ph));
        ctx.drawImage(sprite, m.x - m.s / 2, m.y - m.s * 0.28, m.s, m.s * 0.56);
      }
      ctx.globalAlpha = 0.6; ctx.fillStyle = 'rgb(255,255,255)';
      for (i = 0; i < specks.length; i++) {
        p = specks[i];
        var v = Math.pow(0.5 + 0.5 * Math.sin(p.ph), 2);
        ctx.globalAlpha = 0.15 + 0.5 * v;
        ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }
    function step(dt) {
      t += dt;
      var i, m, p;
      for (i = 0; i < mist.length; i++) { m = mist[i]; m.x += m.v * dt; m.ph += dt * 0.5; if (m.x - m.s / 2 > W) newMist(m, false); }
      for (i = 0; i < specks.length; i++) {
        p = specks[i]; p.y += p.vy * dt; p.x += Math.sin(t * 0.5 + p.sw) * 5 * dt; p.ph += p.tw * dt;
        if (p.y < -4) newSpeck(p, false);
      }
    }
    function frame(now) {
      raf = 0;
      var gap = last ? now - last : 16.7; last = now;
      frames++; if (gap > 24) slow++;
      if (frames >= 90) {
        if (slow > 45) { good = 0; if (level < 3) { level++; fill(); } }
        else if (slow < 9) { good += frames; if (good >= 600 && level > 0) { level--; fill(); good = 0; } }
        else good = 0;
        frames = 0; slow = 0;
      }
      if ((odd ^= 1)) { run(); return; }          // draw every second frame: about 30 fps
      step(Math.min(0.08, gap * 2 / 1000)); draw(); run();
    }
    function run() { if (!raf && on && !D.hidden) raf = requestAnimationFrame(frame); }
    function set(v) {
      if (v && !on) { size(); cv.classList.add('live'); }
      on = v;
      if (RM) { if (v) draw(); return; }
      if (v) { last = 0; run(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    window.__mist = { level: function () { return level; }, count: function () { return mist.length + specks.length; } };
    // the mist comes in at 1.3 s, as the gate has opened
    later(1300, function () { watch(host, set); });
    D.addEventListener('visibilitychange', function () { if (D.hidden) { cancelAnimationFrame(raf); raf = 0; } else { last = 0; frames = 0; slow = 0; run(); } });
    addEventListener('resize', function () { if (on) { size(); if (RM) draw(); } });
  })();

  /* ---------- desktop only (a mouse or trackpad): the two big photos drift a little against the scroll ---------- */
  (function () {
    if (RM || !matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;
    var imgs = $$('.shot.aerial .fr img, .shot.lawn .fr img');
    if (!imgs.length) return;
    root.classList.add('par');
    var q = 0, vis = new Set();
    function go() {
      q = 0;
      vis.forEach(function (im) {
        var r = im.parentNode.getBoundingClientRect();
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        im.style.setProperty('--py', Math.max(-20, Math.min(20, -p * 34)).toFixed(1) + 'px');
      });
    }
    imgs.forEach(function (im) { watch(im.parentNode, function (v) { if (v) vis.add(im); else vis.delete(im); if (!q) q = requestAnimationFrame(go); }); });
    addEventListener('scroll', function () { if (!q) q = requestAnimationFrame(go); }, { passive: true });
  })();
})();
