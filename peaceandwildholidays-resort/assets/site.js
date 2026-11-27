/* Peace & Wild Holidays concept: message builder, photo viewer, floating WhatsApp button. Everything works without this file. */
(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add("has-js");

  // 1. The page's own WhatsApp buttons come first: the floating pill stays hidden while they are on screen or still
  //    below it (a trip page's buttons start under the fold), and appears once they have scrolled away above.
  //    Measured on scroll (one element, once a frame) rather than with an observer, so a jump back to the top, such as
  //    tapping the phone's status bar, hides it again too.
  var ctas = [].slice.call(doc.querySelectorAll("[data-cta]"));
  if (ctas.length && "requestAnimationFrame" in window) {
    var update = function () {
      var waiting = ctas.some(function (el) { var r = el.getBoundingClientRect(); return r.top + r.height / 2 > 0; });
      root.classList.toggle("hero-in", waiting);
      doc.body.classList.add("dock-ready");   // decided straight away, so the dock never flashes over the buttons
    };
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The page opens at the top, where the page's own buttons are still below the name bar: start in that state without
    // measuring anything (a measurement here forced a full layout before first paint: one 700 ms task on a throttled
    // phone; even reading the scroll position forces it). A reload that restores the scroll fires a scroll event, and
    // every scroll measures as before.
    root.classList.add("hero-in");
    doc.body.classList.add("dock-ready");
  } else {
    doc.body.classList.add("dock-ready");
  }

  // Work that is not the opening (the dock's observers, the photo viewer) waits until the opening has played and the browser
  // is idle. Observers measure the whole page, which cost a 500 ms task on a throttled phone when set up at load.
  var afterOpening = function (fn) {
    var ran = 0, go = function () {
      if (ran) return; ran = 1;
      (window.requestIdleCallback || function (f) { setTimeout(f, 60); })(fn, { timeout: 1200 });
    };
    if (root.dataset.opening === "done") { go(); return; }
    try { new MutationObserver(function (m, o) { if (root.dataset.opening === "done") { o.disconnect(); go(); } }).observe(root, { attributes: true, attributeFilter: ["data-opening"] }); } catch (x) {}
    setTimeout(go, 3600);
  };

  // 1a. The pair also rests while the booking block or the footer is on screen: it would sit on their buttons.
  afterOpening(function () {
  if ("IntersectionObserver" in window) {
    //     It also rests while a trip card, a "more trips" card or the outing button sits in the strip the pair covers
    //     (the name bar keeps a WhatsApp button, so contact is never out of reach).
    var seen = 0, mark = null, big = doc.querySelectorAll("#book, .foot"), marks = [].slice.call(doc.querySelectorAll(".vcard, .ocard, .after-wall"));
    var all = [].slice.call(big).concat(marks);
    var upd = function (es) {
      es.forEach(function (e) { e.target.__on = e.isIntersecting; });
      root.classList.toggle("dock-off", all.some(function (el) { return el.__on; }));
    };
    var bigIO = new IntersectionObserver(upd);
    [].forEach.call(big, function (el) { bigIO.observe(el); });
    var watch = function () {
      if (mark) mark.disconnect();
      mark = new IntersectionObserver(upd, { rootMargin: "-" + Math.max(0, window.innerHeight - 96) + "px 0px 0px 0px" });   // the bottom 96 px of the screen
      marks.forEach(function (el) { el.__on = false; mark.observe(el); });
    };
    watch();
    window.addEventListener("resize", function () { clearTimeout(watch.t); watch.t = setTimeout(watch, 200); });
  }
  });

  // 1b. Departures that have left (India date, UTC+5:30: no daylight saving). Whatever carries data-start (the first day of
  //     a dated trip) is changed once it has started (on the day it leaves, like the other versions: a departure that has left is no longer offered), so a visitor never sees a trip that already ran offered as upcoming:
  //       data-past="text"     the element's text becomes this ("a|b" makes a line break)
  //       data-past-hide       the element is hidden
  //       data-past-wa="text"  a WhatsApp link asks for the next dates instead of the departed ones
  //       <option>             becomes data-past-value / data-past-label (no date, so the date field returns), or is
  //                            removed when it has none; a removed selected option hands the selection to the next one
  //     Only wording already on the page is used. Without JS the page reads as it always did.
  var today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  [].forEach.call(doc.querySelectorAll("[data-start]"), function (el) {
    if (el.getAttribute("data-start") > today) return;
    el.classList.add("is-past");
    if (el.tagName === "OPTION") {
      var pv = el.getAttribute("data-past-value");
      if (pv) {
        el.setAttribute("data-was", el.value);
        el.value = pv;
        el.textContent = el.getAttribute("data-past-label") || el.textContent;
        el.removeAttribute("data-fixed");
      } else {
        var sel = el.parentNode, wasSel = el.selected, nxt = el.nextElementSibling;
        sel.removeChild(el);
        if (wasSel) sel.value = nxt ? nxt.value : "";
      }
      return;
    }
    if (el.hasAttribute("data-past-hide")) { el.hidden = true; return; }
    var wa = el.getAttribute("data-past-wa");
    if (wa) { el.href = el.href.split("?")[0] + "?text=" + encodeURIComponent(wa); return; }
    var text = el.getAttribute("data-past");
    if (text !== null) {
      el.textContent = "";
      text.split("|").forEach(function (part, i) {
        if (i) el.appendChild(doc.createElement("br"));
        el.appendChild(doc.createTextNode(part));
      });
    }
  });

  // 2. Planner: builds the WhatsApp message the visitor will send.
  var planner = doc.querySelector("[data-planner]");
  if (planner) {
    var trip = planner.querySelector("[name=trip]");
    var guests = planner.querySelector("[name=guests]");
    var when = planner.querySelector("[name=when]");
    var out = planner.querySelector("[data-preview]");
    var send = planner.querySelector("[data-send]");
    var number = planner.getAttribute("data-number");
    var MAX = 60;   // team outings can be large groups
    var whenField = when.closest ? when.closest(".field") : null;
    var picked = function () { return trip.options[trip.selectedIndex] || null; };
    var build = function () {
      var n = Math.max(1, Math.min(MAX, Math.round(Number(guests.value)) || 1));
      var opt = picked();
      var fixed = !!(opt && opt.hasAttribute("data-fixed"));   // a departure with its own dates: no date to ask for
      var team = !!(opt && opt.hasAttribute("data-team"));
      if (whenField) whenField.hidden = fixed;
      var text = "Hi Peace & Wild Holidays, I'd like details of " + (trip.value || "your upcoming trips");
      text += team ? " for a team of " + n : " for " + n + (n === 1 ? " person" : " people");
      if (!fixed && when.value && when.value >= when.min) {
        var d = new Date(when.value + "T00:00:00");
        text += ", around " + d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      }
      text += ". Please share the dates, the price and what's included.";
      out.textContent = text;
      send.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
    };
    var capNote = planner.querySelector("[data-cap]"), caps = {};
    try { caps = JSON.parse(planner.getAttribute("data-caps") || "{}"); } catch (e) { caps = {}; }
    // an option that lost its dates keeps its price note
    [].forEach.call(planner.querySelectorAll("option[data-was]"), function (o) { if (caps[o.getAttribute("data-was")] && !caps[o.value]) caps[o.value] = caps[o.getAttribute("data-was")]; });
    var showCap = function () { if (capNote) capNote.textContent = caps[trip.value] || ""; };
    trip.addEventListener("change", showCap);
    // a team outing starts at 10 people, unless the visitor already changed the count
    trip.addEventListener("change", function () {
      var opt = picked();
      if (opt && opt.hasAttribute("data-team") && guests.value === guests.defaultValue) guests.value = 10;
    });
    showCap();
    planner.addEventListener("input", build);
    planner.addEventListener("change", function () {
      guests.value = Math.max(1, Math.min(MAX, Math.round(Number(guests.value)) || 1));
      if (when.value && when.value < when.min) when.value = "";
      build();
    });
    [].forEach.call(planner.querySelectorAll("[data-step]"), function (b) {
      b.addEventListener("click", function () {
        var n = (parseInt(guests.value, 10) || 1) + parseInt(b.getAttribute("data-step"), 10);
        guests.value = Math.max(1, Math.min(MAX, n));
        build();
      });
    });
    var t = new Date();
    when.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    build();
  }

  // 3. Photo viewer: tapping a photo in a wall opens it large. Without JS the link opens the image itself.
  //    Wired after the opening has played (idle): until then the link simply opens the image.
  var links = [].slice.call(doc.querySelectorAll("[data-zoom]"));
  var wireViewer = function () {
  if (links.length && typeof HTMLDialogElement === "function") {
    var dlg = doc.createElement("dialog");
    dlg.className = "lb";
    dlg.setAttribute("aria-label", "Photo viewer");
    dlg.innerHTML = '<div class="inner"><img alt=""></div>' +
      '<button class="x" aria-label="Close">&times;</button>' +
      '<button class="prev" aria-label="Previous photo">&#8249;</button>' +
      '<button class="next" aria-label="Next photo">&#8250;</button>';
    doc.body.appendChild(dlg);
    var img = dlg.querySelector("img"), cur = 0;
    var show = function (i) {
      cur = (i + links.length) % links.length;
      var a = links[cur];
      img.src = a.getAttribute("href");
      img.alt = (a.querySelector("img") || {}).alt || "";
    };
    links.forEach(function (a, i) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
        dlg.showModal();
        // one history entry while a photo is open, so the phone's Back button closes the photo instead of leaving the page
        try { history.pushState({ lb: 1 }, ""); } catch (x) {}
      });
    });
    window.addEventListener("popstate", function () { if (dlg.open) dlg.close(); });
    dlg.addEventListener("close", function () { try { if (history.state && history.state.lb) history.back(); } catch (x) {} });
    dlg.querySelector(".x").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".prev").addEventListener("click", function () { show(cur - 1); });
    dlg.querySelector(".next").addEventListener("click", function () { show(cur + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("inner")) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }
  };
  afterOpening(wireViewer);
})();
