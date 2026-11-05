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
    [[14, 30, 3, 3, 4], [50, 20, 2, 5, 5]],
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

function waFloat(t) {
  const c = t.contact;
  const wa = `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent(c.waMessage)}`;
  return `<a class="wa-float" href="${wa}" target="_blank" rel="noopener" aria-label="${esc(c.whatsapp)}" title="${esc(c.whatsapp)}">${ICONS.wa}</a>`;
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
  return Object.keys(SOCIAL_LABELS).filter((k) => soc[k]).map((k) => ({ key: k, label: SOCIAL_LABELS[k], url: soc[k] }));
}

// Logos oficiais das redes (Simple Icons, CC0). Cor da marca aparece no hover.
const BRAND_ICONS = {
  instagram: { hex: "#FF0069", path: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" },
  youtube: { hex: "#FF0000", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  discord: { hex: "#5865F2", path: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" },
};
const brandSvg = (k) =>
  `<svg class="soc-ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${BRAND_ICONS[k].path}"/></svg>`;

function footer(t, ctx) {
  const socials = socialEntries()
    .map((s) =>
      BRAND_ICONS[s.key]
        ? `<a class="soc soc-${s.key}" href="${esc(s.url)}" target="_blank" rel="noopener me" aria-label="${esc(s.label)}" title="${esc(s.label)}" style="--brand:${BRAND_ICONS[s.key].hex}">${brandSvg(s.key)}</a>`
        : `<a href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)}</a>`
    )
    .join("\n        ");
  return `<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot-brand"><a class="logo" href="${ctx.homeHref}" aria-label="${esc(cfg.brand.name)}">${logo(t).replace(/ASSETS\//g, ctx.up + "assets/")}</a>
      <p>© ${cfg.year} ${esc(cfg.brand.legalName)}. ${esc(t.footer.rights)}</p></div>
    <div class="foot-links">${socials ? `\n      <div class="foot-social">\n        ${socials}\n      </div>\n      ` : ""}<a href="${ctx.privacyHref}">${esc(t.footer.privacy)}</a>
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
${isPriv ? "" : waFloat(t)}
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
