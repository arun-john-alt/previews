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
    update();
  } else {
    doc.body.classList.add("dock-ready");
  }

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
  var links = [].slice.call(doc.querySelectorAll("[data-zoom]"));
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
      });
    });
    dlg.querySelector(".x").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".prev").addEventListener("click", function () { show(cur - 1); });
    dlg.querySelector(".next").addEventListener("click", function () { show(cur + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("inner")) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }
})();
