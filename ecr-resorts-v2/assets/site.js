/* ECR Resorts concept v2: message builder, photo viewer, floating WhatsApp button. Everything works without this file. */
(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add("has-js");

  // 1. The hero already carries WhatsApp, so the floating pill appears once the hero scrolls away.
  var ctas = [].slice.call(doc.querySelectorAll("[data-cta]"));
  if (ctas.length && "IntersectionObserver" in window) {
    var shown = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) shown.add(e.target); else shown.delete(e.target); });
      root.classList.toggle("hero-in", shown.size > 0);
      doc.body.classList.add("dock-ready");   // the first answer arrives straight away, so the dock never flashes over the buttons
    }, { threshold: [0.5] });
    ctas.forEach(function (el) { io.observe(el); });
    setTimeout(function () { doc.body.classList.add("dock-ready"); }, 1200);   // failsafe: the buttons are never left hidden
  } else {
    doc.body.classList.add("dock-ready");
  }

  // 2. Planner: builds the WhatsApp message the visitor will send.
  var planner = doc.querySelector("[data-planner]");
  if (planner) {
    var villa = planner.querySelector("[name=villa]");
    var guests = planner.querySelector("[name=guests]");
    var when = planner.querySelector("[name=when]");
    var out = planner.querySelector("[data-preview]");
    var send = planner.querySelector("[data-send]");
    var number = planner.getAttribute("data-number");
    var build = function () {
      var n = Math.max(1, Math.min(30, Math.round(Number(guests.value)) || 1));
      var v = villa.value;
      var text = "Hi ECR Resorts, I'd like to check availability " + (v ? "at " + v : "for one of your villas");
      text += " for " + n + (n === 1 ? " guest" : " guests");
      if (when.value && when.value >= when.min) {
        var d = new Date(when.value + "T00:00:00");
        text += " on " + d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      }
      text += ". Please share the rate and what's free.";
      out.textContent = text;
      send.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
    };
    var capNote = planner.querySelector("[data-cap]"), caps = {};
    try { caps = JSON.parse(planner.getAttribute("data-caps") || "{}"); } catch (e) { caps = {}; }
    var showCap = function () { if (capNote) capNote.textContent = caps[villa.value] || ""; };
    villa.addEventListener("change", showCap);
    showCap();
    planner.addEventListener("input", build);
    planner.addEventListener("change", function () {
      guests.value = Math.max(1, Math.min(30, Math.round(Number(guests.value)) || 1));
      if (when.value && when.value < when.min) when.value = "";
      build();
    });
    [].forEach.call(planner.querySelectorAll("[data-step]"), function (b) {
      b.addEventListener("click", function () {
        var n = (parseInt(guests.value, 10) || 1) + parseInt(b.getAttribute("data-step"), 10);
        guests.value = Math.max(1, Math.min(30, n));
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
