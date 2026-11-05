#!/usr/bin/env node
/**
 * Gerador estático do site (sem dependências além das fontes).
 * Lê site.config.js + content/*.js e escreve a pasta dist/.
 *   npm run build
 */
const fs = require("fs");
const path = require("path");
const cfg = require("./site.config.js");

const ROOT = __dirname;
const DIST = path.join(ROOT, "docs"); // "docs" porque o GitHub Pages publica a partir dessa pasta

/* ---------- utilidades ---------- */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonEsc = (s) => JSON.stringify(String(s)).slice(1, -1);
const hexRgb = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

function contactLabel() {
  if (cfg.contact.email) return cfg.contact.email;
  const d = String(cfg.contact.whatsapp).replace(/\D/g, "");
  const m = d.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/);
  return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : d;
}

function loadContent(lang) {
  const file = require.resolve(`./content/${lang}.js`);
  delete require.cache[file];
  let raw = JSON.stringify(require(file));
  raw = raw
    .replace(/\{brand\}/g, jsonEsc(cfg.brand.name))
    .replace(/\{legalName\}/g, jsonEsc(cfg.brand.legalName))
    .replace(/\{email\}/g, jsonEsc(contactLabel()));
  return JSON.parse(raw);
}

function write(rel, data) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ---------- ícones ---------- */
const I = (body, extra = "") =>
  `<svg class="ico" ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICONS = {
  system: I('<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8M12 18v3"/><path d="M7 13h3M13 13h4"/>'),
  site: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  game: I('<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>'),
  tailor: I('<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>'),
  shield: I('<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5L15.5 10"/>'),
  lock: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2"/>'),
  chat: I('<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  toggle: I('<rect x="2.5" y="7" width="19" height="10" rx="5"/><circle cx="16.5" cy="12" r="2.6"/>'),
  server: I('<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M12 7h5M12 17h5"/>'),
  mobile: I('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  wa: `<svg class="ico ico-wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
};

/* ---------- logo tipográfica provisória ---------- */
function logo(t) {
  if (cfg.brand.logoMark) {
    const word = cfg.brand.logoWord
      ? `<img class="logo-wordimg" src="ASSETS/${esc(cfg.brand.logoWord)}" alt="${esc(cfg.brand.name)}" width="305" height="25">`
      : `<span class="logo-word">${esc(cfg.brand.name.toUpperCase())}</span>`;
    return `<img class="logo-mark" src="ASSETS/${esc(cfg.brand.logoMark)}" alt="" width="39" height="30">${word}`;
  }
  return `<span class="logo-word">${esc(cfg.brand.name.toUpperCase())}</span><span class="logo-dot" aria-hidden="true"></span>`;
}

/* ---------- mockups (HTML/CSS puro, dados fictícios) ---------- */
function frame(label, title, inner, cls) {
  return `<div class="mock ${cls}" role="img" aria-label="${esc(label)}">
    <div class="mock-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(title)}</span></div>
    <div class="mock-body" aria-hidden="true">${inner}</div>
  </div>`;
}

function mockSalon(t, label) {
  const m = t.projects.mock.salon;
  const hours = ["09:00", "11:00", "13:00", "15:00"];
  // [top%, height%, cor(1-3), serviço, cliente]
  const cols = [
    [[6, 20, 1, 0, 0], [52, 24, 3, 4, 1]],
    [[30, 22, 2, 1, 2], [62, 26, 1, 2, 3]],
    [[14, 30, 3, 3, 4], [58, 20, 2, 5, 5]],
  ];
  let n = 0;
  const colsHtml = cols
    .map(
      (c, ci) =>
        `<div class="m-col"><div class="m-day"><span class="av a${ci}"></span>${esc(m.pros[ci])}</div><div class="m-track">${c
          .map(([top, h, col, s, cl]) => {
            const drag = ci === 1 && s === 1 ? " drag" : "";
            return `<span class="blk c${col}${drag}" style="--t:${top}%;--h:${h}%;--i:${n++}"><b>${esc(m.services[s])}</b><em>${esc(m.clients[cl])}</em></span>`;
          })
          .join("")}</div></div>`
    )
    .join("");
  const gutter = `<div class="m-hours" aria-hidden="true">${hours.map((h) => `<span>${h}</span>`).join("")}</div>`;
  const inner = `<div class="m-side"><b></b><b class="on"></b><b></b><b></b><b></b></div>
    <div class="m-main"><div class="m-head"><strong>${esc(m.title)}</strong><span class="m-pill"></span></div><div class="m-cal">${gutter}<div class="m-week">${colsHtml}</div></div></div>`;
  return frame(label, m.title, inner, "mock-salon");
}

function mockAuto(t, label) {
  const m = t.projects.mock.auto;
  const tiles = m.kpis
    .map((k, i) => `<div class="a-tile" style="--i:${i}"><span>${esc(k)}</span><i></i></div>`)
    .join("");
  const plates = ["ABC-1D23", "FGH-4I56", "JKL-7M89"];
  const counts = [3, 1, 2, 3, 9];
  const rows = m.stages
    .map(
      (s, i) =>
        `<div class="a-row" style="--i:${i + 3}"><span class="a-chip s${i}">${esc(s)}</span><span class="a-bar"><i style="--w:${20 + counts[i] * 8}%"></i></span><b>${counts[i]}</b></div>`
    )
    .join("");
  const ready = plates.map((p, i) => `<span class="a-plate" style="--i:${i + 8}">${p}</span>`).join("");
  const inner = `<div class="m-side"><b></b><b></b><b class="on"></b><b></b><b></b></div>
    <div class="m-main"><div class="m-head"><strong>${esc(m.title)}</strong><span class="m-pill"></span></div>
    <div class="a-tiles">${tiles}</div>
    <div class="a-grid"><div class="a-stages">${rows}</div><div class="a-ready">${ready}</div></div></div>`;
  return frame(label, m.title, inner, "mock-auto");
}

function mockPharmacy(t, label) {
  const m = t.projects.mock.pharmacy;
  const lots = ["L-0412", "L-0415", "L-0420"];
  const widths = [86, 22, 64];
  const tiles = m.kpis
    .map((k, i) => `<div class="a-tile" style="--i:${i}"><span>${esc(k)}</span><i></i></div>`)
    .join("");
  const rows = m.rows
    .slice(0, 3)
    .map(
      (r, i) =>
        `<div class="p-row" style="--i:${i + 3}"><span>${esc(r)}</span><span class="p-mono">${lots[i]}</span><span class="p-bar"><i style="--w:${widths[i]}%"></i></span><span class="p-chip${i === 1 ? " warn" : ""}">${esc(m.status[i])}</span></div>`
    )
    .join("");
  const head = m.head.map((h) => `<span>${esc(h)}</span>`).join("");
  const inner = `<div class="m-side"><b></b><b></b><b></b><b class="on"></b><b></b></div>
    <div class="m-main"><div class="m-head"><strong>${esc(m.title)}</strong><span class="m-pill"></span></div>
    <div class="a-tiles t3">${tiles}</div>
    <div class="p-table"><div class="p-row p-th">${head}</div>${rows}</div></div>`;
  return frame(label, m.title, inner, "mock-pharmacy");
}

function mockCrm(t, label) {
  const m = t.projects.mock.crm;
  const layout = [
    [[0, 62], [1, 38], [2, 80]],
    [[3, 54], [4, 90]],
    [[5, 40]],
  ];
  let n = 0;
  const cols = m.stages
    .slice(0, 3)
    .map(
      (name, ci) =>
        `<div class="k-col"><div class="k-head"><span class="k-dot d${ci}"></span>${esc(name)}</div>${layout[ci]
          .map(([av, w]) => `<div class="k-card c${ci}" style="--i:${n++}"><span class="k-lines"><i style="width:${w}%"></i><i></i></span><span class="k-foot"><em class="k-pill"></em><span class="f-av a${av % 3}"></span></span></div>`)
          .join("")}</div>`
    )
    .join("");
  const inner = `<div class="m-side"><b></b><b class="on"></b><b></b><b></b><b></b></div>
    <div class="m-main"><div class="m-head"><strong>${esc(m.title)}</strong><span class="m-pill"></span></div><div class="k-board">${cols}</div></div>`;
  return frame(label, m.title, inner, "mock-crm");
}

const MOCKS = { salon: mockSalon, auto: mockAuto, pharmacy: mockPharmacy, crm: mockCrm };

function heroUi(t) {
  const h = t.hero;
  const bars = [38, 62, 46, 80, 58, 92, 70]
    .map((v, i) => `<i style="--h:${v}%;--i:${i}"></i>`)
    .join("");
  return `<div class="hero-ui" aria-hidden="true">
    <div class="mock hero-mock">
      <div class="mock-bar"><i></i><i></i><i></i><span>${esc(cfgName())}</span></div>
      <div class="hero-body">
        <div class="hu-side"><b></b><b class="on"></b><b></b><b></b></div>
        <div class="hu-main">
          <div class="hu-row">
            <div class="hu-card hu-a"><span class="hu-k"></span><span class="hu-l"></span><span class="hu-s"></span></div>
            <div class="hu-card hu-b"><span class="hu-k"></span><span class="hu-l"></span><span class="hu-s"></span></div>
            <div class="hu-card hu-c"><span class="hu-k"></span><span class="hu-l"></span><span class="hu-s"></span></div>
          </div>
          <div class="hu-chart"><div class="hu-bars">${bars}</div><svg class="hu-line" viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 46 C25 40 35 18 62 26 S105 52 130 28 S175 6 200 12"/></svg></div>
          <div class="hu-list"><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
    <div class="float f1">${ICONS.system}<span>${esc(h.floatA)}</span></div>
    <div class="float f2">${ICONS.toggle}<span>${esc(h.floatB)}</span></div>
    <div class="float f3">${ICONS.shield}<span>${esc(h.floatC)}</span></div>
  </div>`;
}
const cfgName = () => cfg.brand.name;

/* ---------- partes da página ---------- */
function head(t, ctx) {
  const { lang, up, canonical, alt, title, description, jsonld } = ctx;
  const fontPre = ["space-grotesk-latin-700-normal", "inter-latin-400-normal"]
    .map((f) => `<link rel="preload" href="${up}assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`)
    .join("\n");
  const alts = alt
    .map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}">`)
    .join("\n")
    .concat(`\n<link rel="alternate" hreflang="x-default" href="${alt[0].xdefault}">`);
  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="${cfg.colors.bg}">
<link rel="canonical" href="${canonical}">
${alts}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${t.ogLocale}">
<meta property="og:image" content="${cfg.siteUrl.replace(/\/$/, "")}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${cfg.brand.logoMark ? `<link rel="icon" type="image/png" sizes="64x64" href="${up}assets/favicon.png">\n<link rel="apple-touch-icon" href="${up}assets/apple-touch-icon.png">` : `<link rel="icon" type="image/svg+xml" href="${up}assets/favicon.svg">`}
${fontPre}
<link rel="stylesheet" href="${up}assets/fonts.css">
<link rel="stylesheet" href="${up}assets/style.css">
<style>:root{${Object.entries(cfg.colors)
    .map(([k, v]) => `--${kebab(k)}:${v}`)
    .join(";")};--accent-rgb:${hexRgb(cfg.colors.accent)};--warm-rgb:${hexRgb(cfg.colors.warm)};--bg-rgb:${hexRgb(cfg.colors.bg)};--surface-rgb:${hexRgb(cfg.colors.surface)};--border-rgb:${hexRgb(cfg.colors.border)};--f-display:'${cfg.fonts.display}',system-ui,sans-serif;--f-body:'${cfg.fonts.body}',system-ui,sans-serif}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>`;
}

function header(t, ctx) {
  const { homeHref, anchor, switchHref } = ctx;
  const links = t.nav.map((n) => `<a href="${anchor(n.id)}">${esc(n.label)}</a>`).join("");
  return `<a class="skip" href="#main">${esc(t.ui.skip)}</a>
<header class="site-header" id="top">
  <div class="wrap bar">
    <a class="logo" href="${homeHref}" aria-label="${esc(cfg.brand.name)} — ${esc(t.ui.home)}">${logo(t).replace(/ASSETS\//g, ctx.up + "assets/")}</a>
    <nav class="nav" id="nav" aria-label="Principal">
      ${links}
      <a class="btn btn-sm nav-cta" href="${anchor("contato")}">${esc(t.cta)}</a>
    </nav>
    <div class="bar-end">
      <a class="lang" href="${switchHref}" hreflang="${t.lang === "pt" ? "en" : "pt"}" lang="${t.lang === "pt" ? "en" : "pt"}" data-lang-switch="${t.lang === "pt" ? "en" : "pt"}" aria-label="${esc(t.ui.switchLabel)}">${ICONS.globe}<span>${esc(t.ui.switchCode)}</span></a>
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="${esc(t.ui.menu)}" data-open="${esc(t.ui.menu)}" data-close="${esc(t.ui.menuClose)}"><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function sectionHead(eyebrow, title, intro) {
  return `<div class="sec-head" data-reveal>
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h2>${esc(title)}</h2>
    ${intro ? `<p class="lead">${esc(intro)}</p>` : ""}
  </div>`;
}

function hero(t, ctx) {
  const h = t.hero;
  return `<section class="hero" aria-labelledby="hero-title">
  <canvas class="hero-canvas" aria-hidden="true"></canvas>
  <div class="hero-glow g1" aria-hidden="true"></div><div class="hero-glow g2" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow" data-reveal>${esc(h.eyebrow)}</p>
      <h1 id="hero-title" data-reveal style="--d:80ms">${esc(h.title[0])} <span class="grad">${esc(h.title[1])}</span></h1>
      <p class="hero-sub" data-reveal style="--d:160ms">${esc(h.sub)}</p>
      <div class="hero-actions" data-reveal style="--d:240ms">
        <a class="btn" href="${ctx.anchor("contato")}"><span>${esc(t.cta)}</span>${ICONS.arrow}</a>
        <a class="btn btn-ghost" href="${ctx.anchor("sistemas")}">${esc(h.secondary)}</a>
      </div>
      <ul class="chips" data-reveal style="--d:320ms">${h.chips.map((c) => `<li>${ICONS.check}${esc(c)}</li>`).join("")}</ul>
    </div>
    <div class="hero-visual" data-reveal style="--d:200ms">${heroUi(t)}</div>
  </div>
</section>`;
}

function what(t) {
  const w = t.what;
  const cards = w.cards
    .map((c, i) => {
      const inner = `<span class="card-ico">${ICONS[c.icon]}</span>
        <h3>${esc(c.title)}${c.badge ? ` <span class="badge">${esc(c.badge)}</span>` : ""}</h3>
        <p>${esc(c.text)}</p>`;
      return c.href
        ? `<a class="card card-soft glow" href="${c.href}" data-reveal style="--d:${i * 90}ms">${inner}</a>`
        : `<article class="card glow" data-reveal style="--d:${i * 90}ms">${inner}</article>`;
    })
    .join("");
  const items = w.niches.map((n) => `<li>${esc(n)}</li>`).join("");
  return `<section class="sec" id="${w.id}" aria-labelledby="h-what">
  <div class="wrap">
    ${sectionHead(w.eyebrow, w.title, w.intro).replace("<h2>", '<h2 id="h-what">')}
    <div class="grid-3 grid-4">${cards}</div>
    <div class="niches" data-reveal>
      <div class="niches-head"><h3>${esc(w.nichesTitle)}</h3><p>${esc(w.nichesNote)}</p></div>
      <div class="marquee" aria-label="${esc(w.nichesTitle)}">
        <ul class="marquee-track">${items}</ul>
        <ul class="marquee-track" aria-hidden="true">${items}</ul>
      </div>
    </div>
  </div>
</section>`;
}

function projects(t) {
  const p = t.projects;
  const cards = p.items
    .map((it, i) => {
      let title = it.title;
      if (cfg.showClientNames && cfg.clientNames[it.key]) title = `${it.title} — ${cfg.clientNames[it.key]}`;
      const label = `${title}. ${t.ui.mockNote}.`;
      return `<article class="proj" data-reveal>
        <div class="proj-visual">${MOCKS[it.key](t, label)}<p class="mock-note">${esc(t.ui.mockNote)}</p></div>
        <div class="proj-copy">
          <p class="tag">${esc(it.tag)}${cfg.projectStatus && cfg.projectStatus[it.key] ? ` <span class="badge badge-live">${esc(p.badges[cfg.projectStatus[it.key]])}</span>` : ""}</p>
          <h3>${esc(title)}</h3>
          <p>${esc(it.text)}</p>
          <p class="mod-title">${esc(p.modulesTitle)}</p>
          <ul class="mods">${it.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        </div>
      </article>`;
    })
    .join("");
  return `<section class="sec sec-alt" id="${p.id}" aria-labelledby="h-proj">
  <div class="wrap">
    ${sectionHead(p.eyebrow, p.title, p.intro).replace("<h2>", '<h2 id="h-proj">')}
    <p class="disclaimer" data-reveal>${ICONS.shield}<span>${esc(p.disclaimer)}</span></p>
    <div class="proj-list">${cards}</div>
    <div class="proj-more" data-reveal>
      <div><h3>${esc(p.more.title)}</h3><p>${esc(p.more.text)}</p></div>
      <a class="btn" href="#contato"><span>${esc(t.cta)}</span>${ICONS.arrow}</a>
    </div>
  </div>
</section>`;
}

function deliver(t) {
  const d = t.deliver;
  const items = d.items
    .map(
      (it, i) => `<article class="card glow" data-reveal style="--d:${(i % 3) * 80}ms">
      <span class="card-ico">${ICONS[it.icon]}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`
    )
    .join("");
  const pos = d.positioning;
  return `<section class="sec" id="${d.id}" aria-labelledby="h-del">
  <div class="wrap">
    ${sectionHead(d.eyebrow, d.title).replace("<h2>", '<h2 id="h-del">')}
    <div class="grid-3">${items}</div>
    <div class="model" data-reveal>
      <div class="model-copy"><h3>${esc(d.model.title)}</h3><p>${esc(d.model.text)}</p></div>
      <div class="position" role="group" aria-label="${esc(d.model.title)}">
        <div class="pos pos-side"><b>${esc(pos.left)}</b><span>${esc(pos.leftNote)}</span></div>
        <div class="pos pos-mid"><b>${esc(pos.mid)}</b><span>${esc(pos.midNote)}</span></div>
        <div class="pos pos-side"><b>${esc(pos.right)}</b><span>${esc(pos.rightNote)}</span></div>
      </div>
    </div>
  </div>
</section>`;
}

function process(t) {
  const p = t.process;
  const steps = p.steps
    .map(
      (s, i) => `<li class="step" data-reveal style="--d:${i * 90}ms"><span class="step-n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`
    )
    .join("");
  return `<section class="sec sec-alt" id="${p.id}" aria-labelledby="h-proc">
  <div class="wrap">
    ${sectionHead(p.eyebrow, p.title).replace("<h2>", '<h2 id="h-proc">')}
    <ol class="steps">${steps}</ol>
  </div>
</section>`;
}

function games(t) {
  const g = t.games;
  const cells = Array.from({ length: 24 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  return `<section class="sec" id="${g.id}" aria-labelledby="h-games">
  <div class="wrap">
    <div class="games" data-reveal>
      <div class="games-copy">
        <p class="eyebrow">${esc(g.eyebrow)}</p>
        <h2 id="h-games">${esc(g.title)} <span class="badge badge-lg">${esc(g.badge)}</span></h2>
        <p class="lead">${esc(g.text)}</p>
      </div>
      <div class="teaser" role="img" aria-label="${esc(g.teaserAlt)}">
        <div class="teaser-grid" aria-hidden="true">${cells}</div>
        <div class="teaser-bar" aria-hidden="true"><i></i></div>
        <span class="teaser-text" aria-hidden="true">${esc(g.teaser)}</span>
      </div>
    </div>
  </div>
</section>`;
}

function contact(t) {
  const c = t.contact;
  const wa = `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent(c.waMessage)}`;
  const mail = `mailto:${cfg.contact.email}?subject=${encodeURIComponent(c.emailSubject)}`;
  return `<section class="sec sec-contact" id="${c.id}" aria-labelledby="h-contact">
  <div class="wrap">
    <div class="contact" data-reveal>
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h2 id="h-contact">${esc(c.title)}</h2>
      <p class="lead">${esc(c.text)}</p>
      <div class="contact-actions">
        <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">${ICONS.wa}<span>${esc(c.whatsapp)}</span></a>
        ${cfg.contact.email ? `<a class="btn btn-ghost" href="${mail}">${ICONS.mail}<span>${esc(c.email)}</span></a>` : ""}
      </div>
      <p class="contact-note">${esc(c.note)}</p>
    </div>
  </div>
</section>`;
}

const SOCIAL_LABELS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", discord: "Discord", x: "X", linkedin: "LinkedIn" };
function socialEntries() {
  const soc = cfg.social || {};
  return Object.keys(SOCIAL_LABELS).filter((k) => soc[k]).map((k) => ({ label: SOCIAL_LABELS[k], url: soc[k] }));
}

function footer(t, ctx) {
  const socials = socialEntries().map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)}</a>`).join("\n      ");
  return `<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot-brand"><a class="logo" href="${ctx.homeHref}" aria-label="${esc(cfg.brand.name)}">${logo(t).replace(/ASSETS\//g, ctx.up + "assets/")}</a>
      <p>© ${cfg.year} ${esc(cfg.brand.legalName)}. ${esc(t.footer.rights)}</p></div>
    <div class="foot-links">${socials ? "\n      " + socials + "\n      " : ""}<a href="${ctx.privacyHref}">${esc(t.footer.privacy)}</a>
      <a href="${ctx.switchHref}" data-lang-switch="${t.lang === "pt" ? "en" : "pt"}" hreflang="${t.lang === "pt" ? "en" : "pt"}" lang="${t.lang === "pt" ? "en" : "pt"}">${esc(t.ui.switchTo)}</a></div>
    <p class="foot-note">${esc(t.footer.demoNote)}</p>
  </div>
</footer>`;
}

/* ---------- páginas ---------- */
function urls(lang, page) {
  const other = cfg.languages.find((l) => l !== lang);
  const T = { pt: loadContent("pt"), en: loadContent("en") };
  const base = cfg.siteUrl.replace(/\/$/, "");
  const abs = (l, pg) => `${base}/${l}/${pg === "privacy" ? T[l].paths.privacy + "/" : ""}`;
  return { other, T, abs };
}

function buildPage(lang, page) {
  const { other, T, abs } = urls(lang, page);
  const t = T[lang];
  const isPriv = page === "privacy";
  const up = isPriv ? "../../" : "../";
  const homeHref = isPriv ? "../" : "./";
  const anchor = (id) => (isPriv ? `../#${id}` : `#${id}`);
  const switchHref = isPriv ? `../../${other}/${T[other].paths.privacy}/` : `../${other}/`;
  const privacyHref = isPriv ? "./" : `${t.paths.privacy}/`;
  const ctx = { up, homeHref, anchor, switchHref, privacyHref };

  const title = isPriv ? t.meta.privacyTitle : t.meta.title;
  const description = isPriv ? t.meta.privacyDescription : t.meta.description;
  const canonical = abs(lang, page);
  const alt = cfg.languages.map((l) => ({
    lang: l === "pt" ? "pt-BR" : "en",
    href: abs(l, page),
    xdefault: abs(cfg.defaultLang, page),
  }));
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: cfg.brand.name, url: cfg.siteUrl, ...(socialEntries().length ? { sameAs: socialEntries().map((s) => s.url) } : {}) },
      { "@type": "WebSite", name: cfg.brand.name, url: cfg.siteUrl, inLanguage: t.htmlLang },
    ],
  };

  const body = isPriv
    ? `<main id="main" class="legal"><div class="wrap narrow">
        <a class="back" href="../">${ICONS.arrow}<span>${esc(t.ui.backHome)}</span></a>
        <h1>${esc(t.privacy.title)}</h1>
        <p class="legal-meta">${esc(t.privacy.updated)}</p>
        ${t.privacy.draftNote ? `<p class="draft">${esc(t.privacy.draftNote)}</p>` : ""}
        ${t.privacy.sections
          .map((s) => `<section><h2>${esc(s.h)}</h2>${s.p.map((x) => `<p>${esc(x)}</p>`).join("")}</section>`)
          .join("")}
      </div></main>`
    : `<main id="main">${hero(t, ctx)}${what(t)}${projects(t)}${deliver(t)}${process(t)}${games(t)}${contact(t)}</main>`;

  return `${head(t, { lang, up, canonical, alt, title, description, jsonld })}
<body class="${isPriv ? "page-legal" : "page-home"}">
${header(t, ctx)}
${body}
${footer(t, ctx)}
<script src="${up}assets/main.js" defer></script>
</body>
</html>
`;
}

function buildRoot() {
  const base = cfg.siteUrl.replace(/\/$/, "");
  const alts = cfg.languages
    .map((l) => `<link rel="alternate" hreflang="${l === "pt" ? "pt-BR" : "en"}" href="${base}/${l}/">`)
    .join("\n");
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(cfg.brand.name)}</title>
<meta name="description" content="${esc(loadContent("pt").meta.description)}">
<meta name="theme-color" content="${cfg.colors.bg}">
<link rel="canonical" href="${base}/${cfg.defaultLang}/">
${alts}
<link rel="alternate" hreflang="x-default" href="${base}/${cfg.defaultLang}/">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${cfg.colors.bg};color:${cfg.colors.text};font-family:system-ui,sans-serif}a{color:${cfg.colors.accentStrong};margin:0 12px;font-size:1.1rem}</style>
<script>
(function(){
  var lang='${cfg.defaultLang}';
  try{
    var saved=localStorage.getItem('lang');
    if(saved==='pt'||saved==='en'){lang=saved;}
    else{
      var nav=(navigator.languages&&navigator.languages[0])||navigator.language||'';
      lang=nav.toLowerCase().indexOf('pt')===0?'pt':'en';
    }
  }catch(e){}
  location.replace(lang+'/');
})();
</script>
</head>
<body>
<p><a href="pt/">Português</a> · <a href="en/">English</a></p>
</body>
</html>
`;
}

function buildFavicon() {
  const ch = esc(cfg.brand.name.trim().charAt(0).toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${cfg.colors.bg}"/><rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="${cfg.colors.accent}" stroke-opacity=".5" stroke-width="3"/><text x="32" y="45" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="38" fill="${cfg.colors.accentStrong}">${ch}</text></svg>`;
}

function buildFontsCss() {
  const f = (family, file, weight) =>
    `@font-face{font-family:'${family}';font-style:normal;font-display:swap;font-weight:${weight};src:url(fonts/${file}.woff2) format('woff2')}`;
  return [
    f(cfg.fonts.display, "space-grotesk-latin-500-normal", 500),
    f(cfg.fonts.display, "space-grotesk-latin-700-normal", 700),
    f(cfg.fonts.body, "inter-latin-400-normal", 400),
    f(cfg.fonts.body, "inter-latin-500-normal", 500),
    f(cfg.fonts.body, "inter-latin-600-normal", 600),
  ].join("\n");
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"));
  const fontsDir = path.join(DIST, "assets", "fonts");
  fs.mkdirSync(fontsDir, { recursive: true });
  const nm = path.join(ROOT, "node_modules", "@fontsource");
  const fontFiles = [
    ["space-grotesk", "space-grotesk-latin-500-normal"],
    ["space-grotesk", "space-grotesk-latin-700-normal"],
    ["inter", "inter-latin-400-normal"],
    ["inter", "inter-latin-500-normal"],
    ["inter", "inter-latin-600-normal"],
  ];
  for (const [pkg, f] of fontFiles) {
    fs.copyFileSync(path.join(nm, pkg, "files", `${f}.woff2`), path.join(fontsDir, `${f}.woff2`));
  }
  write("assets/fonts.css", buildFontsCss());
  write("assets/favicon.svg", buildFavicon());

  write("index.html", buildRoot());
  for (const lang of cfg.languages) {
    const t = loadContent(lang);
    write(`${lang}/index.html`, buildPage(lang, "home"));
    write(`${lang}/${t.paths.privacy}/index.html`, buildPage(lang, "privacy"));
  }

  const base = cfg.siteUrl.replace(/\/$/, "");
  const T = { pt: loadContent("pt"), en: loadContent("en") };
  const entry = (pg) => {
    const loc = (l) => `${base}/${l}/${pg === "privacy" ? T[l].paths.privacy + "/" : ""}`;
    return cfg.languages
      .map(
        (l) =>
          `  <url><loc>${loc(l)}</loc>${cfg.languages
            .map((a) => `<xhtml:link rel="alternate" hreflang="${a === "pt" ? "pt-BR" : "en"}" href="${loc(a)}"/>`)
            .join("")}</url>`
      )
      .join("\n");
  };
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entry("home")}\n${entry("privacy")}\n</urlset>\n`
  );
  write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  write(".nojekyll", "");
  if (cfg.customDomain) write("CNAME", cfg.customDomain + "\n");
  console.log("Site gerado em docs/");
}

main();
