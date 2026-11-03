/* ECR Resorts concept: depth gauge and the WhatsApp message builder. Everything works without this file. */
(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add("has-js");

  // 1. Depth gauge: marks sit where each depth section starts, the pointer follows the scroll.
  var secs = [].slice.call(doc.querySelectorAll("[data-depth]"));
  if (secs.length) {
    root.classList.add("has-gauge");
    var rail = doc.createElement("div");
    rail.className = "rail";
    rail.setAttribute("aria-hidden", "true");
    rail.innerHTML = '<i class="rail-line"></i>';
    var marks = secs.map(function (s) {
      var d = s.getAttribute("data-depth");
      var m = doc.createElement("span");
      m.className = "rail-mark" + (d === "DEEP" ? " deep" : "");
      m.innerHTML = "<b>" + d + "</b>";
      rail.appendChild(m);
      return m;
    });
    var ptr = doc.createElement("i");
    ptr.className = "rail-ptr";
    rail.appendChild(ptr);
    doc.body.appendChild(rail);

    var starts = [], railH = 0, maxY = 1;
    var layout = function () {
      railH = rail.clientHeight;
      maxY = Math.max(1, root.scrollHeight - window.innerHeight);
      // A mark counts as reached when its section clears the sticky top bar, not the very top of the screen.
      starts = secs.map(function (s) { return Math.max(0, s.getBoundingClientRect().top + window.scrollY - 76); });
      var pad = 22, span = railH - pad * 2;
      marks.forEach(function (m, i) {
        var p = Math.min(0.96, starts[i] / maxY);
        m.style.top = pad + p * span + "px";
      });
      update();
    };
    var update = function () {
      var y = window.scrollY, pad = 22, span = railH - pad * 2;
      ptr.style.top = pad + Math.min(1, y / maxY) * span + "px";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    layout();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(layout);
  }

  // 1b. The hero carries the WhatsApp action, so the floating pill appears once the hero scrolls away.
  var hero = doc.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      root.classList.toggle("hero-in", entries[0].intersectionRatio > 0.45);
    }, { threshold: [0, 0.45, 1] }).observe(hero);
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
    planner.addEventListener("input", build);
    planner.addEventListener("change", function () {
      // Show the number the message really uses, so the field and the text never disagree.
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
    var today = new Date();
    when.min = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    build();
  }
})();
