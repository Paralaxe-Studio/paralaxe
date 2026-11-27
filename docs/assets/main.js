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
  function clearBad(e) {
    var box = e.target.closest && e.target.closest(".cf");
    if (box) box.classList.remove("bad");
    if (!form.querySelector(".cf.bad")) err.hidden = true;
  }
  form.addEventListener("input", clearBad);
  form.addEventListener("change", clearBad);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (n) { return (form.elements[n].value || "").trim(); };
    var name = v("name"), business = v("business"), need = v("need"), message = v("message");
    form.querySelectorAll(".cf").forEach(function (l) { l.classList.remove("bad"); });
    if (!name || !need) {
      if (!name) form.elements.name.closest(".cf").classList.add("bad");
      if (!need) form.querySelector(".cf-need").classList.add("bad");
      err.textContent = cfg.required; err.hidden = false;
      (name ? form.querySelector("input[name=need]") : form.elements.name).focus();
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

/* Paralaxe One: troca de ramo, contagem dos números e troca automática */
(function () {
  "use strict";
  /* --- Paralaxe One: trocar o ramo mostrado nas telas --- */
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var oneData = doc.getElementById("one-data");
  var oneSec = doc.querySelector(".one");
  if (oneData && oneSec) {
    var niches = [];
    try { niches = JSON.parse(oneData.textContent); } catch (e) {}
    var tabs = Array.prototype.slice.call(oneSec.querySelectorAll(".one-pick [role=tab]"));
    var devices = oneSec.querySelector(".one-devices");
    var stage = doc.getElementById("one-stage");
    var check = (oneSec.querySelector(".one-ready li .ico") || {}).outerHTML || "";
    var setText = function (key, value) {
      oneSec.querySelectorAll('[data-one="' + key + '"]').forEach(function (el) { el.textContent = value; });
    };
    var contar = function (el, alvo) {
      // "R$ 1.870" ou "7/12": anima só o primeiro número, mantendo o resto do texto.
      var m = String(alvo).match(/^(\D*)(\d[\d.,]*)(.*)$/);
      if (reduce || !m) { el.textContent = alvo; return; }
      var sep = /\d\.\d{3}/.test(m[2]) ? "." : /\d,\d{3}/.test(m[2]) ? "," : "";
      var fim = Number(m[2].replace(/[.,]/g, "")), t0 = null;
      if (!isFinite(fim) || /[.,]\d{1,2}$/.test(m[2])) { el.textContent = alvo; return; }
      var passo = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 700), v = Math.round(fim * (1 - Math.pow(1 - p, 3)));
        var txt = sep ? String(v).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(v);
        el.textContent = m[1] + txt + m[3];
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    var animarTela = function () {
      if (reduce || !devices) return;
      devices.classList.add("crescer");
      void devices.offsetWidth;
      devices.classList.remove("crescer");
      oneSec.querySelectorAll('[data-one^="stat"][data-one$="v"]').forEach(function (el) { contar(el, el.getAttribute("data-alvo") || el.textContent); });
      var rl = oneSec.querySelector(".one-ready");
      if (rl) {
        rl.classList.remove("ligado");
        rl.querySelectorAll("li").forEach(function (li, i) { li.style.setProperty("--li", i); });
        void rl.offsetWidth;
        rl.classList.add("ligado");
      }
    };
    var apply = function (n) {
      oneSec.style.setProperty("--na", n.color);
      n.stats.forEach(function (s, i) {
        oneSec.querySelectorAll('[data-one="stat' + i + 'v"]').forEach(function (el) { el.setAttribute("data-alvo", s[1]); });
      });
      setText("name", n.name);
      n.stats.forEach(function (s, i) { setText("stat" + i + "k", s[0]); setText("stat" + i + "v", s[1]); });
      n.list.forEach(function (r, i) { setText("row" + i + "a", r[0]); setText("row" + i + "b", r[1]); setText("row" + i + "c", r[2]); });
      var ul = oneSec.querySelector('[data-one="ready"]');
      if (ul) {
        ul.innerHTML = "";
        n.ready.forEach(function (x) {
          var li = doc.createElement("li");
          li.innerHTML = check;
          var sp = doc.createElement("span");
          sp.textContent = x;
          li.appendChild(sp);
          ul.appendChild(li);
        });
      }
      var tryBtn = oneSec.querySelector('[data-one="try"]');
      if (tryBtn) tryBtn.href = n.href;
      animarTela();
    };
    var select = function (tab, focus, rolar) {
      var n = niches.filter(function (x) { return x.key === tab.getAttribute("data-niche"); })[0];
      if (!n || tab.getAttribute("aria-selected") === "true") { if (focus) tab.focus(); return; }
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; });
      if (stage) stage.setAttribute("aria-labelledby", tab.id);
      if (focus) tab.focus();
      // Rola só a fileira de chips (nunca a página) para mostrar o ramo escolhido.
      var fila = tab.parentNode;
      if (rolar !== false && fila.scrollWidth > fila.clientWidth) {
        fila.scrollTo({ left: tab.offsetLeft - (fila.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      }
      if (reduce || !devices) { apply(n); return; }
      devices.classList.add("troca");
      setTimeout(function () { apply(n); devices.classList.remove("troca"); }, 170);
    };
    /* troca sozinha a cada 4,2 s enquanto a seção está na tela, até a pessoa mexer */
    var pick = oneSec.querySelector(".one-pick");
    var TEMPO = 4200, timer = null, parado = reduce, visivel = false;
    var proximo = function () {
      var atual = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0];
      var j = (tabs.indexOf(atual) + 1) % tabs.length;
      select(tabs[j], false, true);
    };
    var agendar = function () {
      clearTimeout(timer);
      if (parado || !visivel) { if (pick) pick.classList.remove("girando"); return; }
      if (pick) { pick.classList.remove("girando"); void pick.offsetWidth; pick.style.setProperty("--tempo", TEMPO + "ms"); pick.classList.add("girando"); }
      timer = setTimeout(function () { proximo(); agendar(); }, TEMPO);
    };
    var parar = function () { parado = true; agendar(); };
    if (devices && "IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visivel = en[0].isIntersecting;
        if (visivel && !devices.classList.contains("ligado")) {
          devices.classList.add("ligado");
          oneSec.querySelectorAll('[data-one^="stat"][data-one$="v"]').forEach(function (el) { el.setAttribute("data-alvo", el.textContent); });
          animarTela();
        }
        agendar();
      }, { threshold: 0.35 }).observe(devices);
    } else if (devices) {
      devices.classList.add("ligado");
      var rl0 = oneSec.querySelector(".one-ready");
      if (rl0) rl0.classList.add("ligado");
    }
    ["pointerdown", "keydown", "focusin"].forEach(function (ev) { if (pick) pick.addEventListener(ev, parar); });
    /* inclinação leve das telas acompanhando o mouse */
    if (devices && !reduce && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      devices.addEventListener("pointermove", function (e) {
        var r = devices.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        devices.classList.add("seguindo");
        devices.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
        devices.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
      });
      devices.addEventListener("pointerleave", function () {
        devices.style.setProperty("--ry", "0deg");
        devices.style.setProperty("--rx", "0deg");
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % tabs.length;
        else if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
        else if (k === "Home") j = 0;
        else if (k === "End") j = tabs.length - 1;
        if (j >= 0) { e.preventDefault(); select(tabs[j], true); }
      });
    });
  }
})();

/* --- cidade da abertura: cada camada anda numa velocidade (paralaxe) --- */
(function () {
  "use strict";
  var cidade = document.querySelector(".cidade");
  if (!cidade) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var hero = cidade.parentNode;
  var alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 }, raf = 0;

  function passo() {
    atual.x += (alvo.x - atual.x) * 0.08;
    atual.y += (alvo.y - atual.y) * 0.08;
    cidade.style.setProperty("--mx", atual.x.toFixed(3));
    cidade.style.setProperty("--my", atual.y.toFixed(3));
    if (Math.abs(alvo.x - atual.x) > 0.002 || Math.abs(alvo.y - atual.y) > 0.002) raf = requestAnimationFrame(passo);
    else raf = 0;
  }
  function mirar(x, y) {
    alvo.x = Math.max(-1, Math.min(1, x));
    alvo.y = Math.max(-1, Math.min(1, y));
    if (!raf) raf = requestAnimationFrame(passo);
  }

  // Mouse (computador).
  hero.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var r = hero.getBoundingClientRect();
    mirar(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  }, { passive: true });
  hero.addEventListener("pointerleave", function () { mirar(0, 0); });

  // Celular inclinado (Android libera direto; no iPhone fica só a rolagem).
  window.addEventListener("deviceorientation", function (e) {
    if (e.gamma == null || e.beta == null) return;
    mirar(e.gamma / 25, (e.beta - 45) / 35);
  }, { passive: true });

  // Rolagem: as camadas de trás descem mais devagar.
  var agendado = false;
  window.addEventListener("scroll", function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () {
      agendado = false;
      var y = Math.min(window.scrollY, hero.offsetHeight);
      cidade.style.setProperty("--sy", y.toFixed(0));
    });
  }, { passive: true });
})();

/* --- Paralaxe One: instalar no celular (abas iPhone/Android e vídeo que só toca quando aparece na tela) --- */
(function () {
  var caixa = document.querySelector(".inst");
  if (!caixa) return;
  var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var abas = Array.prototype.slice.call(caixa.querySelectorAll("[role=tab]"));
  var visivel = false;
  // No iPhone, começa pela aba do iPhone; no Android, pela do Android.
  var ua = navigator.userAgent || "";
  var inicial = /Android/.test(ua) ? "android" : "iphone";

  function videoAtivo() {
    var p = caixa.querySelector(".inst-painel:not([hidden]) video");
    return p;
  }
  function tocar() {
    var v = videoAtivo();
    if (!v) return;
    if (reduzir) { v.controls = true; return; } // quem pediu menos movimento dá o play quando quiser
    if (visivel) { var r = v.play(); if (r && r.catch) r.catch(function () { v.controls = true; }); } else v.pause();
  }
  function escolher(aba, foco) {
    abas.forEach(function (a) {
      var sel = a === aba;
      a.setAttribute("aria-selected", String(sel));
      a.tabIndex = sel ? 0 : -1;
      var painel = document.getElementById(a.getAttribute("aria-controls"));
      painel.hidden = !sel;
      var v = painel.querySelector("video");
      if (!sel) v.pause();
      else { if (v.preload === "none") v.preload = "metadata"; v.currentTime = 0; }
    });
    if (foco) aba.focus();
    tocar();
  }
  abas.forEach(function (a, i) {
    a.addEventListener("click", function () { escolher(a, false); });
    a.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); escolher(abas[(i + d + abas.length) % abas.length], true); }
    });
  });
  var primeira = abas.filter(function (a) { return a.getAttribute("data-so") === inicial; })[0];
  if (primeira && primeira !== abas[0]) escolher(primeira, false);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; tocar(); }, { threshold: 0.35 }).observe(caixa);
  } else { visivel = true; tocar(); }
})();
