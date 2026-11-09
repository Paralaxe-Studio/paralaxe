(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce) doc.documentElement.classList.add("js-anim");

  /* --- idioma: lembrar a escolha --- */
  doc.querySelectorAll("[data-lang-switch]").forEach(function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("lang", a.getAttribute("data-lang-switch")); } catch (e) {}
    });
  });

  var links = {};
  /* --- cabeçalho --- */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 12);
    if (window.scrollY < 200) Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- barra de progresso de leitura + paralaxe leve no hero --- */
  var bar = null;
  if (!reduce) {
    bar = doc.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    doc.body.appendChild(bar);
  }
  var ticking = false;
  function paint() {
    ticking = false;
    var y = window.scrollY;
    if (bar) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      bar.classList.toggle("on", y > 40);
    }
    if (y < 1400) doc.documentElement.style.setProperty("--py", Math.round(y));
  }
  if (!reduce) {
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }
  /* entrada escalonada dos módulos (chips) */
  doc.querySelectorAll(".mods").forEach(function (ul) {
    ul.querySelectorAll("li").forEach(function (li, i) { li.style.setProperty("--ci", i); });
  });

  /* --- menu mobile --- */
  var burger = doc.querySelector(".burger");
  var nav = doc.getElementById("nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", burger.getAttribute(open ? "data-close" : "data-open"));
    nav.classList.toggle("open", open);
  }
  if (burger && nav) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* --- revelar ao rolar --- */
  var items = doc.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* --- link ativo no menu --- */
  doc.querySelectorAll(".nav a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var secs = Object.keys(links).map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle("active", k === en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* --- brilho que segue o cursor nos cartões --- */
  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    doc.querySelectorAll(".glow").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* --- linha dos passos --- */
  var steps = doc.querySelector(".steps");
  if (steps && !reduce && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { steps.classList.add("drawn"); so.disconnect(); }
    }, { threshold: 0.3 });
    so.observe(steps);
  }

  /* --- inclinação 3D leve nas telas de demonstração --- */
  if (!reduce && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    doc.querySelectorAll(".proj-visual").forEach(function (v) {
      var m = v.querySelector(".mock");
      if (!m) return;
      v.addEventListener("pointermove", function (e) {
        var r = v.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        m.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
        m.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
      });
      v.addEventListener("pointerleave", function () { m.style.setProperty("--ry", "0deg"); m.style.setProperty("--rx", "0deg"); });
    });
  }

  /* --- botão flutuante do WhatsApp: aparece depois do topo e some no contato --- */
  var waf = doc.querySelector(".wa-float");
  if (waf) {
    var heroEl = doc.querySelector(".hero"), contactEl = doc.querySelector(".contact"), nearContact = false;
    function waUpdate() {
      var past = window.scrollY > (heroEl ? heroEl.offsetHeight * 0.6 : 500);
      waf.classList.toggle("show", past && !nearContact);
    }
    if (contactEl && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { nearContact = en[0].isIntersecting; waUpdate(); }, { threshold: 0.15 }).observe(contactEl);
    }
    window.addEventListener("scroll", waUpdate, { passive: true });
    waUpdate();
  }

  /* --- fundo vivo do hero (rede de pontos) --- */
  var canvas = doc.querySelector(".hero-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var w = 0, h = 0, pts = [], raf = 0, visible = true, mouse = { x: -999, y: -999 };
  var accent = getComputedStyle(doc.documentElement).getPropertyValue("--accent").trim() || "#22c7d6";

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  var rgb = hexToRgb(accent);

  function resize() {
    var r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(18, Math.min(70, Math.round((w * h) / 17000)));
    pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28, r: Math.random() * 1.4 + 0.6 });
    }
    draw(false);
  }

  function draw(step) {
    ctx.clearRect(0, 0, w, h);
    var maxD = Math.min(150, w / 4);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (step) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          ctx.strokeStyle = "rgba(" + rgb + "," + (0.18 * (1 - d / maxD)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      var md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      var boost = md < 140 ? 1 - md / 140 : 0;
      ctx.fillStyle = "rgba(" + rgb + "," + (0.55 + boost * 0.4) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost * 1.6, 0, 6.2832); ctx.fill();
      if (boost > 0.3) {
        ctx.strokeStyle = "rgba(" + rgb + "," + boost * 0.35 + ")";
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  }

  function loop() {
    if (!visible || doc.hidden) { raf = 0; return; }
    draw(true);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  resize();
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  if (reduce) return; // um quadro estático, sem animação

  canvas.parentNode.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.parentNode.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); }).observe(canvas.parentNode);
  }
  doc.addEventListener("visibilitychange", function () { if (!doc.hidden) start(); });
  start();
})();

/* --- faixa de ramos: a cópia para o loop é criada aqui, não no HTML --- */
(function () {
  "use strict";
  document.querySelectorAll(".marquee").forEach(function (m) {
    var track = m.querySelector(".marquee-track");
    if (!track || m.querySelectorAll(".marquee-track").length > 1) return;
    var copy = track.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    m.appendChild(copy);
  });
})();

/* --- formulário de contato: monta a mensagem e abre WhatsApp ou e-mail --- */
(function () {
  "use strict";
  var form = document.querySelector("[data-cform]");
  if (!form) return;
  var cfg;
  try { cfg = JSON.parse(form.getAttribute("data-cform")); } catch (e) { return; }
  var err = form.querySelector(".cform-err");
  var via = "wa";
  form.querySelectorAll("[data-via]").forEach(function (b) {
    b.addEventListener("click", function () { via = b.getAttribute("data-via"); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (n) { return (form.elements[n].value || "").trim(); };
    var name = v("name"), business = v("business"), need = v("need"), message = v("message");
    form.querySelectorAll(".cf").forEach(function (l) { l.classList.remove("bad"); });
    if (!name || !need) {
      if (!name) form.elements.name.closest(".cf").classList.add("bad");
      if (!need) form.elements.need.closest(".cf").classList.add("bad");
      err.textContent = cfg.required; err.hidden = false;
      (name ? form.elements.need : form.elements.name).focus();
      return;
    }
    err.hidden = true;
    var L = cfg.labels, lines = [cfg.intro, "", L[0] + ": " + name];
    if (business) lines.push(L[1] + ": " + business);
    lines.push(L[2] + ": " + need);
    if (message) lines.push(L[3] + ": " + message);
    var text = lines.join("\n");
    if (via === "mail" && cfg.mail) {
      window.location.href = "mailto:" + cfg.mail + "?subject=" + encodeURIComponent(cfg.subject + " — " + need) + "&body=" + encodeURIComponent(text);
    } else {
      window.open("https://wa.me/" + cfg.wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    }
  });
})();
