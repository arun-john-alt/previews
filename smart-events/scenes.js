/* Smart Events concept: desktop scroll scenes (GSAP + ScrollTrigger, loaded by site.js after the page's load event,
   only at 1024 px and up with motion allowed). With the CDN blocked, reduced motion or a phone, the programme is an
   open sheet whose lines print as they arrive (site.js) and nothing here runs.
   1024 px and up: the programme is a folded gatefold that opens while it is pinned; the arched photos drift
   slightly against the scroll under a mouse. */
(function () {
  'use strict';
  var g = window.gsap, ST = window.ScrollTrigger, D = document;
  if (!g || !ST) return;
  if (D.documentElement.classList.contains('rv-fail')) return;   // arrived after the failsafe: leave everything shown
  g.registerPlugin(ST);
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || D).querySelectorAll(s)); };
  var R = window.__seReveal || { show: function (el) { el.classList.add('in'); }, unobserve: function () {} };
  var mm = g.matchMedia();

  mm.add({ ok: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 1024px)', fine: '(hover: hover) and (pointer: fine)' }, function (ctx) {
    var c = ctx.conditions, undo = [];
    if (!c.ok || !c.wide || !c.fine) return;

    /* the programme: folded on arrival, it opens as the page is scrolled, then its lines print */
    var prog = $('[data-prog]'), spread = $('[data-spread]'), leaf = $('[data-leaf]');
    // loaded after the page: if the visitor is already at or past the programme, never fold it shut in front of them
    if (prog && spread && leaf && prog.getBoundingClientRect().top >= innerHeight * 0.9) {
      var lines = $$('[data-pl]', prog).filter(function (l) { return !l.classList.contains('in'); });
      lines.forEach(R.unobserve);
      var left = lines.filter(function (l) { return !leaf.contains(l); }), right = lines.filter(function (l) { return leaf.contains(l); });
      var all = function () { lines.forEach(function (l) { l.removeAttribute('data-scene'); R.show(l); }); };
      // the cover only shows while the leaf is folded (WebKit draws back faces through backface-visibility)
      var fold = function (on) { spread.classList.toggle('folded', on); };
      fold(true);
      var tl = g.timeline({
        scrollTrigger: {
          trigger: prog, start: 'top top', end: '+=85%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (s) { if (s.progress > 0.42) left.forEach(R.show); if (s.progress > 0.78) right.forEach(R.show); },
          onLeave: all
        }
      });
      tl.fromTo(spread, { xPercent: 25 }, { xPercent: 0, ease: 'power1.inOut', duration: 1 }, 0)
        .fromTo(leaf, { rotationY: -180 }, { rotationY: 0, ease: 'power1.inOut', duration: 1 }, 0)
        .to({}, { duration: 0.3 });
      // the timeline's own update also runs while the scrub catches up, so the cover tracks the leaf exactly
      tl.eventCallback('onUpdate', function () { fold(tl.progress() < 0.38); });
      undo.push(function () { all(); fold(false); g.set([spread, leaf], { clearProps: 'transform' }); });
    }

    /* arched photos drift a little against the scroll (mouse and trackpad only) */
    if (c.fine) {
      $$('.prog .ar-win img').forEach(function (img) {
        g.fromTo(img, { yPercent: -3.5 }, { yPercent: 3.5, ease: 'none',
          scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
      });
    }
    return function () { undo.forEach(function (f) { f(); }); };
  });

  // site.js loads this file after the page's load event, so layout is settled: measure once now
  if (D.readyState === 'complete') ST.refresh(); else addEventListener('load', function () { ST.refresh(); });
})();
