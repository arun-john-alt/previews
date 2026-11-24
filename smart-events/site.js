/* Smart Events concept: plain script. Everything here works without GSAP (blocked CDN) and is static under
   reduced motion. The opening itself is CSS in the page; this marks it done and takes over from there. */
(function () {
  'use strict';
  window.__se = 1;
  var D = document, root = D.documentElement;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WIDE = matchMedia('(min-width: 1024px)');
  var SCENE = matchMedia('(min-width: 1024px) and (pointer: fine)');   // the pinned desktop scene; touch tablets keep the phone's programme
  var WA = '919159966611';
  var hasIO = 'IntersectionObserver' in window;

  /* ---------------- the arch follows the occasion: their birthday stages for a birthday, their serving team
     for every other occasion (all their decor photos are birthdays, so none is shown under another occasion) ---------------- */
  var SET = function (n) { return 'img/arch-' + n + '-480.webp 480w, img/arch-' + n + '-720.webp 720w, img/arch-' + n + '-960.webp 960w'; };
  var STAGES = [
    { n: 'birthday', w: 960, h: 900, pos: '50% 45%', cap: 'Garden birthday, gold and black', alt: 'A birthday stage by Smart Events in a garden: gold and black balloon arch, gold sequin wall with a Happy Birthday sign, red carpet' },
    { n: 'pastel', w: 960, h: 840, pos: '50% 50%', cap: 'First birthday · pastel arch', alt: 'A first-birthday stage by Smart Events in a hall: arched pink panels, a silver sequin wall and pastel balloon garlands' },
    { n: 'butterfly', w: 960, h: 900, pos: '50% 50%', cap: 'First birthday · butterfly stage', alt: 'A butterfly themed first-birthday stage by Smart Events with a pastel balloon arch, a neon Happy Birthday sign and a red carpet' },
    { n: 'unicorn', w: 960, h: 810, pos: '50% 45%', cap: 'First birthday · unicorn arch', alt: 'An outdoor unicorn themed first-birthday stage by Smart Events with a pastel balloon arch and balloon pillars' },
    { n: 'drapes', w: 960, h: 880, pos: '50% 50%', cap: 'First birthday · pink drapes', alt: 'A first-birthday stage by Smart Events with pink and purple drapes, a pearl balloon garland and a light-up number one' },
    { n: 'night', w: 960, h: 800, pos: '50% 50%', cap: 'First birthday · hot-air balloons', alt: 'A hot-air-balloon themed first-birthday stage by Smart Events at night, with a big ONE and teddy bears' }
  ];
  var WELCOME = { srcset: 'img/arch-welcome-640.webp 640w, img/arch-welcome-960.webp 960w, img/arch-welcome-1280.webp 1280w', src: 'img/arch-welcome-960.webp',
    w: 1280, h: 720, pos: '50% 32%', cap: 'Our Sri Velavan serving team', alt: 'Four members of the Sri Velavan Catering serving team in red sarees, greeting guests with folded hands in a dining hall' };
  function archDef(key) {
    if (key === 'welcome') return WELCOME;
    var s = STAGES[key];
    return { srcset: SET(s.n), src: 'img/arch-' + s.n + '-720.webp', w: s.w, h: s.h, pos: s.pos, cap: s.cap, alt: s.alt };
  }

  /* ---------------- what the blanks can hold ---------------- */
  var OCC = {
    birthday: { card: 'birthday', noun: 'birthday', art: 'a' },
    wedding: { card: 'wedding', noun: 'wedding', art: 'a' },
    kadhani: { card: 'காதணி விழா', noun: 'ear-piercing ceremony (காதணி விழா)', art: 'an' },
    traditional: { card: 'traditional function', noun: 'traditional function', art: 'a' },
    corporate: { card: 'corporate event', noun: 'corporate event', art: 'a' },
    other: { card: '', noun: '', art: 'a' }
  };
  var NEED = {
    decor: { card: 'decor', msg: 'decorations & a themed stage' },
    balloons: { card: 'balloons', msg: 'balloon work' },
    catering: { card: 'catering', msg: 'catering (vegetarian)' },
    photos: { card: 'photos', msg: 'photos & videos' },
    planning: { card: 'planning', msg: 'planning & coordination' }
  };
  var ORDER = ['name', 'occasion', 'date', 'guests', 'needs'];
  var TITLE = { name: 'Whose function?', occasion: 'Which occasion?', date: 'Which date?', guests: 'How many guests?', needs: 'What do you need?' };
  var NEXT = { name: 'Next: occasion', occasion: 'Next: date', date: 'Next: guests', guests: 'Next: needs' };
  var GHOST = { name: 'your', occasion: 'birthday', date: 'the date', guests: 'how many', needs: 'decor, catering, photos' };
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var S = { name: '', occ: '', other: '', date: '', nodate: false, guests: '', needs: [] };
  var clean = function (s) { return (s || '').replace(/\s+/g, ' ').trim(); };
  function parseDate(v) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function shortDate(v) { var d = parseDate(v); return d ? DAY[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] : ''; }
  function longDate(v) { var d = parseDate(v); return d ? DAY[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear() : ''; }

  function occNoun() {
    if (!S.occ) return '';
    if (S.occ === 'other') return S.other || 'function';
    return OCC[S.occ].noun;
  }
  function message() {
    var noun = occNoun(), t;
    if (S.name && noun) t = S.name + '’s ' + noun;
    else if (noun) t = (S.occ === 'other' ? (/^[aeiou]/i.test(noun) ? 'an' : 'a') : OCC[S.occ].art) + ' ' + noun;
    else if (S.name) t = S.name + '’s function';
    else t = 'a function';
    var m = 'Hello Smart Events, I’d like to plan ' + t;
    if (S.date) m += ' on ' + longDate(S.date);
    else if (S.nodate) m += ' (date not fixed yet)';
    if (S.guests) m += ' for ' + (/^(up to|over)/.test(S.guests) ? S.guests : 'about ' + S.guests) + ' guests';
    m += '.';
    if (S.needs.length) m += ' We need: ' + S.needs.map(function (n) { return NEED[n].msg; }).join(', ') + '.';
    return m;
  }
  function cardValue(k) {
    if (k === 'name') return S.name;
    if (k === 'occasion') return S.occ ? (S.occ === 'other' ? S.other : OCC[S.occ].card) : '';
    if (k === 'date') return S.date ? shortDate(S.date) : (S.nodate ? 'to be fixed' : '');
    if (k === 'guests') {
      if (!S.guests) return '';
      if (S.guests === 'over 1,000') return '1,000+';
      return S.guests.replace(/^(\d[\d,]*) to (\d[\d,]*)$/, '$1–$2');
    }
    if (k === 'needs') return S.needs.map(function (n) { return NEED[n].card; }).join(', ');
    return '';
  }
  var touchedAny = false;
  function syncLinks() {
    var href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message());
    $$('[data-wa]').forEach(function (a) { a.href = href; });
  }

  /* ---------------- the pen: a choice is written into the card ---------------- */
  var blanks = {};
  $$('.blank[data-k]').forEach(function (b) { blanks[b.getAttribute('data-k')] = b; });
  function writeIn(k, text, ghost) {
    var b = blanks[k]; if (!b) return;
    var v = $('[data-v]', b), nib = $('.nib', b), rule = $('.rule', b);
    v.textContent = text;
    if (ghost) b.removeAttribute('data-filled'); else b.setAttribute('data-filled', '');
    if (k === 'name') { var poss = $('[data-poss]'); if (poss) poss.hidden = ghost || !text; }
    b.setAttribute('aria-label', b.querySelector('.lb').textContent + ': ' + (ghost ? 'not filled in yet' : text) + '. Tap to ' + (ghost ? 'fill in' : 'change'));
    if (RM || !v.animate) return;
    var dur = Math.max(300, Math.min(760, 24 * text.length + 200));
    var ease = 'cubic-bezier(.4,.15,.55,1)';
    v.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: dur, easing: ease });
    var w = Math.min(v.scrollWidth, v.getBoundingClientRect().width || v.scrollWidth);
    if (nib) nib.animate([
      { opacity: 0, transform: 'translate(0px,-4px)' },
      { opacity: 1, transform: 'translate(0px,0px)', offset: 0.1 },
      { opacity: 1, transform: 'translate(' + w.toFixed(0) + 'px,1px)', offset: 0.86 },
      { opacity: 0, transform: 'translate(' + (w + 6).toFixed(0) + 'px,-10px)' }
    ], { duration: dur + 140, easing: ease });
    if (!ghost && rule) { try { rule.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: dur, easing: ease, pseudoElement: '::after' }); } catch (e) { /* older engines: the line just appears */ } }
  }

  /* ---------------- the arch: a crossfade to whatever the occasion word calls for ---------------- */
  var win = $('[data-win]'), cap = $('[data-cap]'), shown = 0, stage = 0, loaded = {};
  function loadArch(key) {
    if (loaded[key]) return loaded[key];
    var p = archDef(key), img = new Image();
    img.decoding = 'async'; img.alt = p.alt; img.width = p.w; img.height = p.h;
    img.sizes = '(min-width: 1024px) 460px, 80vw'; img.srcset = p.srcset; img.src = p.src;
    img.style.setProperty('--pos', p.pos);
    if (key === 'welcome') img.classList.add('is-welcome');   // a 640 px original: shown whole on desktop, never blown up
    loaded[key] = (img.decode ? img.decode() : new Promise(function (r) { img.onload = r; img.onerror = r; })).catch(function () {}).then(function () { return img; });
    return loaded[key];
  }
  loaded[0] = Promise.resolve($('img', win));
  function showArch(key) {
    if (key === shown) return Promise.resolve();
    shown = key;
    return loadArch(key).then(function (img) {
      if (shown !== key) return;
      var olds = $$('img', win).filter(function (o) { return o !== img; });
      img.classList.remove('first');
      win.appendChild(img);
      cap.textContent = archDef(key).cap;
      var clear = function () { olds.forEach(function (o) { if (o.parentNode) o.parentNode.removeChild(o); }); };
      if (RM || !img.animate) { clear(); return; }
      img.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = clear;
      // a letterboxed photo (shown whole on desktop) doesn't cover the old one: fade the old one out with it
      if (getComputedStyle(img).objectFit === 'contain') olds.forEach(function (o) { o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' }); });
      cap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 200, easing: 'ease-out', fill: 'backwards' });
    });
  }
  // the photo that belongs with an occasion key ('' = nothing chosen yet, which reads "birthday")
  function archFor(occ, advance) {
    if (!occ || occ === 'birthday') {
      if (advance) stage = (stage + 1) % STAGES.length;
      return showArch(stage);
    }
    return showArch('welcome');
  }

  /* ---------------- the envelope: the message builds live under the card ---------------- */
  function syncSay() {
    if (!touchedAny) return;
    var m = '“' + message() + '”';
    $$('[data-say]').forEach(function (say) {
      var span = $('span', say);
      say.hidden = false; say.classList.add('msg');
      if (span.textContent === m) return;
      span.textContent = m;
      if (!RM && span.animate) span.animate([{ opacity: 0.2, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' });
    });
  }
  function commit(k) {
    touchedAny = true;
    var val = cardValue(k);
    if (val) writeIn(k, val, false);
    else if (k !== 'occasion' || blanks.occasion.hasAttribute('data-filled') || $('[data-v]', blanks.occasion).textContent !== GHOST.occasion) writeIn(k, GHOST[k], true);
    if (k === 'occasion') archFor(S.occ, false);
    if (k === 'name' && !S.occ) archFor('', false);
    syncLinks(); syncSay();
  }

  /* ---------------- the slip: tapping a blank opens a choice sheet ---------------- */
  var dlg = $('[data-slip]'), form = $('[data-slip-form]'), prev = $('[data-preview]');
  var openK = null, closing = 0;
  var title = $('[data-title]');
  var other = $('#occ-other'), fName = $('#f-name'), fDate = $('#f-date');
  (function () { var t = new Date(); fDate.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); })();

  function loadInputs(k) {
    if (k === 'occasion') {
      $$('input[name=occasion]', form).forEach(function (r) { r.checked = r.value === S.occ; });
      other.hidden = S.occ !== 'other'; other.value = S.other;
    } else if (k === 'name') fName.value = S.name;
    else if (k === 'date') { fDate.value = S.date; $('input[name=nodate]', form).checked = S.nodate; }
    else if (k === 'guests') $$('input[name=guests]', form).forEach(function (r) { r.checked = r.value === S.guests; });
    else if (k === 'needs') $$('input[name=needs]', form).forEach(function (c) { c.checked = S.needs.indexOf(c.value) > -1; });
  }
  function readInputs(k) {
    if (k === 'occasion') {
      var r = $('input[name=occasion]:checked', form); S.occ = r ? r.value : '';
      other.hidden = S.occ !== 'other'; S.other = clean(other.value);
    } else if (k === 'name') S.name = clean(fName.value);
    else if (k === 'date') {
      // only a whole, valid date from today on: typing "12/12/2026" passes through year 0002 on the way
      var ok = fDate.value && fDate.validity.valid && +fDate.value.slice(0, 4) >= new Date().getFullYear();
      S.date = ok ? fDate.value : '';
      S.nodate = !S.date && $('input[name=nodate]', form).checked;
    }
    else if (k === 'guests') { var g = $('input[name=guests]:checked', form); S.guests = g ? g.value : ''; }
    else if (k === 'needs') S.needs = $$('input[name=needs]:checked', form).map(function (c) { return c.value; });
    prev.textContent = message();
  }
  function place(trigger) {
    if (!WIDE.matches || !trigger) { dlg.style.removeProperty('--sx'); dlg.style.removeProperty('--sy'); return; }
    // below the blank, else above it, else beside it (over the photo leaf), never on top of the blank itself
    var r = trigger.getBoundingClientRect(), box = $('.slip-in', dlg), h = box.offsetHeight || 420, w = 420, x, y, ox, oy;
    if (r.bottom + 10 + h < innerHeight - 12) { y = r.bottom + 10; x = r.left + r.width / 2 - w / 2; ox = r.left + r.width / 2; oy = 0; }
    else if (r.top - 10 - h > 12) { y = r.top - 10 - h; x = r.left + r.width / 2 - w / 2; ox = r.left + r.width / 2; oy = h; }
    else {
      y = Math.max(12, Math.min(innerHeight - h - 12, r.top + r.height / 2 - h / 2));
      x = r.left - w - 24 >= 16 ? r.left - w - 24 : r.right + 24;
      ox = x < r.left ? w : 0; oy = r.top + r.height / 2 - y;
    }
    x = Math.max(16, Math.min(innerWidth - w - 16, x));
    if (oy === 0 || oy === h) ox -= x;
    dlg.style.setProperty('--sx', x + 'px'); dlg.style.setProperty('--sy', y + 'px');
    dlg.style.setProperty('--ox', ox + 'px'); dlg.style.setProperty('--oy', oy + 'px');
  }
  function open(k, trigger) {
    if (!dlg || !dlg.showModal) return;
    stopCycles();
    // from the first tap the card says what the message says: with no occasion chosen, the message plans "a function",
    // so the occasion placeholder becomes "function" (the arch goes back to their birthday stages)
    GHOST.occasion = 'function';
    if (!S.occ && $('[data-v]', blanks.occasion).textContent !== GHOST.occasion) writeIn('occasion', GHOST.occasion, true);
    if (!S.occ) archFor('', false);
    clearTimeout(closing); closing = 0;
    openK = k;
    $$('[data-panel]', form).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== k; });
    title.textContent = TITLE[k];
    $('[data-skip]', form).textContent = NEXT[k] || 'Close';
    loadInputs(k);
    prev.textContent = message();
    if (!dlg.open) dlg.showModal();
    root.classList.add('slip-open');
    place(trigger);
    requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add('in'); }); });
    var focusEl = k === 'name' ? fName : k === 'date' ? fDate : ($('[data-panel="' + k + '"] input:checked', form) || $('[data-panel="' + k + '"] input', form));
    if (focusEl) try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); }
  }
  function close(then) {
    if (!dlg.open || closing) return;
    var k = openK;
    readInputs(k);
    dlg.classList.remove('in');
    closing = setTimeout(function () {
      closing = 0; dlg.close(); root.classList.remove('slip-open');
      commit(k);
      if (then) then();
    }, RM ? 0 : 230);
  }
  if (dlg) {
    $$('.blank[data-k]').forEach(function (b) {
      b.addEventListener('click', function () { open(b.getAttribute('data-k'), b); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); close(); });
    $('[data-close]', form).addEventListener('click', function () { close(); });
    $('[data-skip]', form).addEventListener('click', function () {
      var i = ORDER.indexOf(openK);
      if (i < 4) { readInputs(openK); commit(openK); open(ORDER[i + 1], blanks[ORDER[i + 1]]); } else close();
    });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    // writing an occasion of your own ticks "Something else" for you
    other.addEventListener('input', function () { if (other.value.trim()) $('input[name=occasion][value=other]', form).checked = true; });
    form.addEventListener('input', function () { readInputs(openK); });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'nodate' && e.target.checked) fDate.value = '';     // not fixed yet: no date
      if (e.target === fDate && fDate.value) $('input[name=nodate]', form).checked = false;
      readInputs(openK);
      // a single choice writes itself in: tick, a beat, then the slip goes back down
      if (e.target.type === 'radio' && !(openK === 'occasion' && S.occ === 'other')) setTimeout(function () { close(); }, RM ? 0 : 260);
      if (e.target.type === 'radio' && openK === 'occasion' && S.occ === 'other') other.focus();
      if (e.target === fDate && S.date) setTimeout(function () { close(); }, 200);
    });
  }

  /* ---------------- the opening hands over ---------------- */
  var inv = $('.inv');
  function opened() {
    if (root.getAttribute('data-opening') === 'done') return;
    root.setAttribute('data-opening', 'done');
    after();
  }
  if (RM) opened();
  else {
    var fallback = setTimeout(opened, 2800);
    requestAnimationFrame(function () {
      // the falling petals outlive the opening on purpose; everything else in the first screen counts
      var list = (inv && inv.getAnimations ? inv.getAnimations({ subtree: true }) : []).filter(function (a) { return a.animationName !== 'fall'; });
      if (!list.length) { clearTimeout(fallback); opened(); return; }
      Promise.all(list.map(function (a) { return a.finished.catch(function () {}); })).then(function () { clearTimeout(fallback); opened(); });
    });
  }

  /* ---------------- after the opening: the occasion word cycles, and the arch follows it ---------------- */
  var CYC = ['wedding', 'kadhani', 'traditional', 'corporate', 'birthday'], ci = 0, wordT = 0, archT = 0, wordsOn = !RM, heroOn = true;
  function stopCycles() { wordsOn = false; clearTimeout(wordT); clearTimeout(archT); }
  function words() {
    wordT = 0;
    if (!wordsOn) return;
    if (!heroOn || D.hidden || (dlg && dlg.open)) { wordT = setTimeout(words, 1000); return; }
    var k = CYC[ci++ % CYC.length];
    writeIn('occasion', OCC[k].card, true);
    archFor(k, k === 'birthday');   // each return to "birthday" brings the next of their stages
    wordT = setTimeout(words, 4200);
  }
  if (hasIO && inv) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }, { threshold: 0.35 }).observe(inv);

  /* once the opening is over, the pen nib bobs over "your": the blanks are there to be written in */
  function nudge() {
    var b = blanks.name, nib = b && $('.nib', b), v = b && $('[data-v]', b);
    if (!nib || !nib.animate || b.hasAttribute('data-filled') || dlg.open) return;
    var x = Math.max(0, v.getBoundingClientRect().width * 0.55 - 6).toFixed(0);
    nib.animate([
      { opacity: 0, transform: 'translate(' + x + 'px,-10px)' },
      { opacity: 1, transform: 'translate(' + x + 'px,-6px)', offset: 0.2 },
      { opacity: 1, transform: 'translate(' + x + 'px,1px)', offset: 0.4 },
      { opacity: 1, transform: 'translate(' + x + 'px,-6px)', offset: 0.6 },
      { opacity: 1, transform: 'translate(' + x + 'px,1px)', offset: 0.8 },
      { opacity: 0, transform: 'translate(' + x + 'px,-10px)' }
    ], { duration: 1300, easing: 'ease-in-out' });
  }

  // the three last pages skip layout until they come near (content-visibility: auto); once the opening is done, lay
  // them out one per idle moment while the visitor reads the first screen, so it never lands mid-scroll
  function layOutLater() {
    var secs = $$('.venue, .comp, .back'), i = 0;
    var next = function () {
      if (i >= secs.length) return;
      secs[i++].style.contentVisibility = 'visible';
      if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 1500 }); else setTimeout(next, 200);
    };
    if (window.requestIdleCallback) requestIdleCallback(next, { timeout: 1500 }); else setTimeout(next, 200);
  }

  function after() {
    petals();
    layOutLater();
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    if (RM) return;
    idle(function () {
      loadArch('welcome'); loadArch(1);
      if (D.fonts && D.fonts.load) { D.fonts.load('700 21px Kalam'); D.fonts.load('21px Kavivanar', 'கா'); }
    });
    setTimeout(nudge, 700);
    wordT = setTimeout(words, 3000);     // about 5 s after the link opens
  }

  /* ---------------- inside pages: each one moves in its own way, once ---------------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), from = Math.floor(to * 0.35), t0 = 0;
    if (RM || !to) return;
    el.textContent = from;
    var step = function (now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / 1900), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = to;
    };
    requestAnimationFrame(step);
  }
  function show(el) {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
  }
  var io = null, pending = $$('.rv'), openFold = null;
  if (!hasIO || RM) pending.forEach(show);
  else {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    pending.forEach(function (el) { io.observe(el); });
    // a second net: sections below the first screen are laid out only as they come near (content-visibility), and a
    // slow renderer (or a fast flick) can scroll past a line before its first intersection is reported, so a light
    // scroll check shows anything on screen or already scrolled past
    var sweepT = 0;
    var sweep = function () {
      sweepT = 0;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        // measure the section first: measuring inside a far-off content-visibility section forces its whole layout
        var sec = el.closest('section'), sr = sec && sec.getBoundingClientRect();
        if (el.hasAttribute('data-scene')) {               // a scene (desktop gatefold, phone fold) prints this one
          if (openFold && el.hasAttribute('data-fold-reveal') && sr && sr.top < innerHeight * 0.5) openFold();
          return true;
        }
        if (sr && sr.top > innerHeight * 2) return true;
        if (sr && sr.bottom < 0) { show(el); io.unobserve(el); return false; }   // the whole section is behind us
        var r = el.getBoundingClientRect();
        if (r.height && r.top < innerHeight * 0.9) { show(el); io.unobserve(el); return false; }
        return true;
      });
      if (!pending.length) removeEventListener('scroll', onScroll);
    };
    var onScroll = function () { if (!sweepT) sweepT = setTimeout(sweep, 160); };
    addEventListener('scroll', onScroll, { passive: true });
  }
  window.__seReveal = { show: show, unobserve: function (el) { if (io) io.unobserve(el); el.setAttribute('data-scene', ''); } };

  /* phones: the programme's front cover swings open on its hinge as the page arrives, once, and
     the first stages rise into place behind it. Not scrubbed, not pinned. The desktop gets its pinned gatefold. */
  var prog = $('[data-prog]'), fold = $('[data-fold]');
  if (prog && fold && io && matchMedia('(max-width: 767px)').matches && !root.classList.contains('rv-fail')) {
    var held = $$('[data-fold-reveal]', prog);
    held.forEach(function (el) { io.unobserve(el); el.setAttribute('data-scene', ''); });
    var release = function () { held.forEach(function (el) { el.removeAttribute('data-scene'); show(el); }); };
    var foldIO = new IntersectionObserver(function (es) { if (es[0].isIntersecting) openFold(); },
      { rootMargin: '0px 0px -52% 0px' });   // opens once the cover fills the lower half of the screen
    openFold = function () {
      if (prog.classList.contains('open')) return;
      foldIO.disconnect();
      prog.classList.add('open');
      setTimeout(release, 420);                       // the stages print as the cover clears them
      setTimeout(function () { fold.hidden = true; }, 1400);   // gone for good (WebKit can draw a back face)
    };
    foldIO.observe(prog);
  } else if (fold) fold.hidden = true;

  /* today's opening hours get underlined */
  var today = new Date().getDay();
  $$('.hrow[data-days]').forEach(function (r) { if (r.getAttribute('data-days').split(',').indexOf(String(today)) > -1) r.classList.add('today'); });

  /* the RSVP seal follows once the envelope has scrolled away, and steps aside for the card's back, the written
     compliments, and any line of text that passes under its corner */
  var rsvp = $('[data-rsvp]'), sendOn = true, blockers = new Set(), corner = new Set(), cornerIO = null;
  function rsvpSync() { if (rsvp) rsvp.classList.toggle('on', !sendOn && !blockers.size && !corner.size); }
  if (rsvp && hasIO) {
    new IntersectionObserver(function (es) { sendOn = es[0].isIntersecting; rsvpSync(); }).observe($('.send'));
    var blockIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) blockers.add(e.target); else blockers.delete(e.target); });
      rsvpSync();
    }, { threshold: 0 });
    [$('.cardback'), $('.notes')].forEach(function (el) { if (el) blockIO.observe(el); });
    // the seal's own corner: a box the size of the seal at the bottom right of the screen
    var texts = $$('main > section:not(.inv) :is(p, h2, h3, dt, dd, figcaption, address, .plates, .tab-btn, .score)');
    var watchCorner = function () {
      if (cornerIO) cornerIO.disconnect();
      corner.clear();
      var s = WIDE.matches ? 100 : 92;
      cornerIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) corner.add(e.target); else corner.delete(e.target); });
        rsvpSync();
      }, { rootMargin: -(innerHeight - s) + 'px 0px 0px ' + -(innerWidth - s) + 'px', threshold: 0 });
      texts.forEach(function (el) { cornerIO.observe(el); });
    };
    watchCorner();
    var rz = 0;
    addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(watchCorner, 250); });
  }

  /* ---------------- marigold petals drifting through the red field ----------------
     A CSS loop per petal, built once after the opening: the compositor moves them, so they cost no script per frame.
     A watchdog thins them (to 60%, then 20%) when frames run slow; they are never switched off. */
  function petals() {
    var box = $('[data-petals]');
    if (!box || petals.on) return;
    petals.on = 1;
    var small = matchMedia('(max-width: 767px), (pointer: coarse)').matches, n = small ? 10 : 36;
    var COLS = ['#F7A51C', '#EE8A10', '#FFC53D', '#E2650E'], html = '';
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    for (var i = 0; i < n; i++) {
      var d = rnd(11, 19);
      html += '<span class="pt" style="--x:' + rnd(0, 98).toFixed(1) + '%;--w:' + rnd(6, 10).toFixed(1) + 'px;--d:' + d.toFixed(1) +
        's;--dl:-' + rnd(0, d).toFixed(1) + 's;--f:' + rnd(1.4, 2.6).toFixed(2) + 's;--y0:' + rnd(0, 100).toFixed(0) + 'vh;--c:' + COLS[i % 4] + '"><i></i></span>';
    }
    box.innerHTML = html;
    if (RM) return;
    var level = 0, raf = 0, last = 0, frames = 0, slow = 0;
    window.__petals = { level: function () { return level; }, count: function () { return box.querySelectorAll('.pt').length; } };
    function frame(now) {
      raf = 0;
      var gap = last ? now - last : 16.7; last = now;
      frames++; if (gap > 24) slow++;
      if (frames >= 90) {
        if (slow > 45 && level < 2) { level++; box.classList.toggle('thin', level >= 1); box.classList.toggle('thinner', level >= 2); }
        frames = 0; slow = 0;
      }
      if (level < 2) raf = requestAnimationFrame(frame);   // at the lowest level there is nothing left to step down to
    }
    D.addEventListener('visibilitychange', function () { if (!D.hidden && !raf && level < 2) { last = 0; frames = 0; slow = 0; raf = requestAnimationFrame(frame); } });
    raf = requestAnimationFrame(frame);
  }

  /* ---------------- sending throws a handful of turmeric rice (the link opens at once) ---------------- */
  function rice(btn) {
    if (RM || !btn.animate) return;
    var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + 6, n = 26;
    for (var i = 0; i < n; i++) {
      var g = D.createElement('i');
      g.className = 'rice' + (i % 6 === 0 ? ' k' : '');
      g.setAttribute('aria-hidden', 'true');
      D.body.appendChild(g);
      var dx = (Math.random() - 0.5) * Math.min(340, innerWidth * 0.9), up = 90 + Math.random() * 150, rot = (Math.random() - 0.5) * 720;
      var x0 = cx + (Math.random() - 0.5) * r.width * 0.5;
      var a = g.animate([
        { transform: 'translate(' + x0 + 'px,' + cy + 'px) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + (x0 + dx * 0.55) + 'px,' + (cy - up) + 'px) rotate(' + rot * 0.5 + 'deg)', opacity: 1, offset: 0.42, easing: 'cubic-bezier(.3,0,.6,1)' },
        { transform: 'translate(' + (x0 + dx) + 'px,' + (cy - up * 0.35 + 60) + 'px) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 760 + Math.random() * 240, easing: 'cubic-bezier(.15,.6,.35,1)', fill: 'forwards' });
      a.onfinish = (function (el) { return function () { el.remove(); }; })(g);
    }
  }
  $$('[data-wa]').forEach(function (a) { a.addEventListener('click', function () { rice(a); }); });

  syncLinks();

  /* ---------------- GSAP only where its scenes run (1024 px and up, motion allowed), after the page has loaded:
     phones never download or parse it, so the opening has the main thread to itself ---------------- */
  var LIBS = [
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js', 'sha384-HOvlOYPIs/zjoIkWUGXkVmXsjr8GuZLV+Q+rcPwmJOVZVpvTSXQChiN4t9Euv9Vc'],
    ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js', 'sha384-P8VzCVnT9NBUkMrpcIZrJbA7EBjJvh/fJS6PmP+4nLIM284DtsImIv8D0fFjIkeh'],
    ['scenes.js', '']
  ];
  function loadScenes() {
    if (loadScenes.on || RM || !SCENE.matches) return;
    loadScenes.on = 1;
    (function next(i) {
      if (i >= LIBS.length) return;
      var s = D.createElement('script');
      s.src = LIBS[i][0];
      if (LIBS[i][1]) { s.integrity = LIBS[i][1]; s.crossOrigin = 'anonymous'; }
      s.onload = function () { next(i + 1); };
      D.body.appendChild(s);
    })(0);
  }
  if (D.readyState === 'complete') loadScenes(); else addEventListener('load', loadScenes);
  if (SCENE.addEventListener) SCENE.addEventListener('change', function () { if (D.readyState === 'complete') loadScenes(); });
})();
