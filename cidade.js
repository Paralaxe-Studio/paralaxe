/**
 * Cidade tecnológica da abertura do site, em camadas (paralaxe de verdade: cada camada anda numa velocidade).
 * Tudo gerado aqui no build, com sorteio fixo (o desenho é sempre o mesmo). Só SVG e CSS: leve, sem vídeo.
 *
 * Camadas (de trás para a frente): longe, meio, drones, perto. Prédios baixos à esquerda (o texto fica ali)
 * e as torres altas à direita.
 */
const LARGURA = 1600;
const ALTURA = 720;

function sorteio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Altura máxima permitida em cada ponto: baixa à esquerda, alta à direita. */
function perfil(x, minimo, maximo) {
  const p = Math.min(1, Math.max(0, (x - 380) / 900));
  const suave = p * p * (3 - 2 * p);
  return minimo + (maximo - minimo) * suave;
}

function camada(semente, { minimo, maximo, larguraMin, larguraMax, cor, borda, janelas, luzes, antenas, piscaMax, vao = 6 }) {
  const r = sorteio(semente);
  const partes = [];
  const janelasSvg = [];
  const topo = [];
  let piscando = 0;
  let x = -20;
  const torres = [];
  while (x < LARGURA + 20) {
    const w = Math.round(larguraMin + r() * (larguraMax - larguraMin));
    const limite = perfil(x + w / 2, minimo, maximo);
    const h = Math.round(limite * (0.55 + r() * 0.45));
    const y = ALTURA - h;
    // Corpo com recuo no alto em parte dos prédios (cara de arranha-céu).
    if (h > 220 && r() < 0.5) {
      const recuo = Math.round(w * 0.18);
      const alturaRecuo = Math.round(24 + r() * 40);
      partes.push(`M${x} ${ALTURA}V${y + alturaRecuo}H${x + recuo}V${y}H${x + w - recuo}V${y + alturaRecuo}H${x + w}V${ALTURA}Z`);
    } else {
      partes.push(`M${x} ${ALTURA}V${y}H${x + w}V${ALTURA}Z`);
    }
    if (borda) topo.push(`M${x} ${y + 0.5}H${x + w}`);
    torres.push({ x, w, y, h });

    // Janelas: grade, só uma parte acesa.
    if (janelas) {
      for (let jy = y + 18; jy < ALTURA - 14; jy += 14) {
        for (let jx = x + 8; jx < x + w - 10; jx += 11) {
          if (r() < janelas) {
            const forte = r() < 0.25;
            let classe = forte ? "jf" : "j";
            if (piscando < piscaMax && r() < 0.06) {
              classe += " pisca";
              piscando++;
              janelasSvg.push(`<rect class="${classe}" x="${jx}" y="${jy}" width="4" height="6" style="--d:${(r() * 9).toFixed(2)}s"/>`);
              continue;
            }
            janelasSvg.push(`<rect class="${classe}" x="${jx}" y="${jy}" width="4" height="6"/>`);
          }
        }
      }
    }
    x += w + Math.round(r() * vao);
  }

  // Antenas com farol nas torres mais altas.
  const extras = [];
  if (antenas) {
    torres
      .filter((t) => t.h > antenas.minimo)
      .sort((a, b) => b.h - a.h)
      .slice(0, antenas.quantas)
      .forEach((t, i) => {
        const cx = Math.round(t.x + t.w / 2);
        const alto = Math.round(30 + r() * 46);
        extras.push(`<path class="antena" d="M${cx} ${t.y}V${t.y - alto}"/>`);
        extras.push(`<circle class="farol" cx="${cx}" cy="${t.y - alto}" r="3" style="--d:${(i * 0.7).toFixed(1)}s"/>`);
        if (luzes && i < luzes) {
          // Feixe de dados subindo da antena.
          extras.push(`<path class="feixe" d="M${cx} ${t.y - alto - 6}V${t.y - alto - 220}" style="--d:${(i * 1.3).toFixed(1)}s"/>`);
        }
      });
  }

  return `<path class="predio" fill="${cor}" d="${partes.join("")}"/>`
    + (topo.length ? `<path class="borda" d="${topo.join("")}"/>` : "")
    + `<g class="janelas">${janelasSvg.join("")}</g>`
    + extras.join("");
}


/**
 * Robô montando um sistema em holograma: um projetor no telhado acende a tela, o robô desenha as partes com o laser
 * (menu, indicadores, gráfico, lista), o sistema "entra no ar" e os dados descem para a cidade.
 * Linha do tempo de 16 s, gerada aqui. Sem animação, mostra a tela pronta.
 */
const HOLO = { x: 992, y: 148, w: 252, h: 172, emissor: { x: 1057, y: 442 } };
const CICLO = 16;

function pct(t) { return +((t / CICLO) * 100).toFixed(3); }
function quadros(nome, pontos) {
  return `@keyframes ${nome}{${pontos.map(([t, v]) => `${pct(t)}%{${v}}`).join("")}}`;
}
/** Peça que aparece no tempo t e some junto com a tela. */
function surge(nome, t, extra = "") {
  return quadros(nome, [[0, `opacity:0;${extra}`], [t, `opacity:0;${extra}`], [t + 0.25, "opacity:1;transform:none"], [12, "opacity:1;transform:none"], [12.8, `opacity:0`], [CICLO, "opacity:0"]]);
}

function holograma() {
  const H = HOLO;
  const css = [];
  const pecas = [];
  const alvos = []; // [tempo, x, y] para onde o laser aponta
  let n = 0;
  const peca = (t, svgPeca, alvo, extra) => {
    const nome = `holo-p${n++}`;
    css.push(surge(nome, t, extra));
    pecas.push(`<g class="holo-peca" style="--a:${nome}">${svgPeca}</g>`);
    if (alvo) alvos.push([t, ...alvo]);
  };
  const X = (v) => H.x + v;
  const Y = (v) => H.y + v;

  // barra do topo
  peca(0.9, `<rect class="hp" x="${X(0)}" y="${Y(0)}" width="${H.w}" height="16" rx="8"/><circle class="hf" cx="${X(10)}" cy="${Y(8)}" r="2.4"/><circle class="hp2" cx="${X(19)}" cy="${Y(8)}" r="2.4"/><circle class="hp2" cx="${X(28)}" cy="${Y(8)}" r="2.4"/>`, [X(30), Y(8)]);
  // menu lateral
  [0, 1, 2, 3, 4].forEach((i) => peca(1.4 + i * 0.22, `<rect class="${i === 0 ? "hf" : "hp2"}" x="${X(10)}" y="${Y(28 + i * 14)}" width="${i === 0 ? 34 : 26 + (i % 2) * 8}" height="5" rx="2.5"/>`, [X(24), Y(30 + i * 14)], "transform:translateX(-6px)"));
  // indicadores
  [0, 1, 2].forEach((i) => peca(2.7 + i * 0.4, `<rect class="hp" x="${X(56 + i * 64)}" y="${Y(26)}" width="56" height="30" rx="6"/><rect class="hf" x="${X(63 + i * 64)}" y="${Y(33)}" width="${22 + i * 6}" height="6" rx="3"/><rect class="hp2" x="${X(63 + i * 64)}" y="${Y(44)}" width="34" height="4" rx="2"/>`, [X(84 + i * 64), Y(41)], "transform:scale(.85)"));
  // gráfico de barras
  const alturas = [26, 40, 32, 52, 44, 66, 78];
  alturas.forEach((h, i) => peca(4.1 + i * 0.22, `<rect class="${i === alturas.length - 1 ? "hf" : "hb"}" x="${X(58 + i * 15)}" y="${Y(158 - h)}" width="10" height="${h}" rx="2"/>`, [X(63 + i * 15), Y(158 - h)], "transform:scaleY(0)"));
  // lista com confirmações
  [0, 1, 2, 3].forEach((i) => peca(5.9 + i * 0.3, `<circle class="hc" cx="${X(176)}" cy="${Y(76 + i * 22)}" r="5"/><path class="hk" d="M${X(173.5)} ${Y(76 + i * 22)}l1.8 1.8 3.4-3.6"/><rect class="hp2" x="${X(186)}" y="${Y(73 + i * 22)}" width="${46 - (i % 2) * 10}" height="5" rx="2.5"/>`, [X(176), Y(76 + i * 22)], "transform:translateX(6px)"));
  // selo de pronto
  peca(7.4, `<circle class="hselo" cx="${X(H.w - 14)}" cy="${Y(8)}" r="5"/>`, null, "transform:scale(0)");

  // tela (moldura e fundo)
  css.push(quadros("holo-tela", [[0, "opacity:0"], [0.2, "opacity:0"], [0.7, "opacity:1"], [12, "opacity:1"], [12.9, "opacity:0"], [CICLO, "opacity:0"]]));
  css.push(quadros("holo-moldura", [[0, "stroke-dashoffset:860"], [0.3, "stroke-dashoffset:860"], [1.0, "stroke-dashoffset:0"], [CICLO, "stroke-dashoffset:0"]]));
  css.push(quadros("holo-feixe", [[0, "opacity:0"], [0.1, "opacity:0"], [0.5, "opacity:1"], [12.2, "opacity:1"], [12.9, "opacity:0"], [CICLO, "opacity:0"]]));
  css.push(quadros("holo-pronto", [[0, "opacity:0"], [7.4, "opacity:0"], [7.6, "opacity:.5"], [8.6, "opacity:0"], [CICLO, "opacity:0"]]));
  // dados descendo para a cidade quando o sistema entra no ar
  css.push(quadros("holo-desce", [[0, "stroke-dashoffset:0;opacity:0"], [7.5, "stroke-dashoffset:0;opacity:0"], [7.6, "stroke-dashoffset:0;opacity:1"], [9.4, "stroke-dashoffset:-320;opacity:1"], [9.6, "stroke-dashoffset:-320;opacity:0"], [CICLO, "opacity:0"]]));

  // Robô: vai de peça em peça, laser aceso enquanto desenha.
  const base = { x: H.x + H.w + 44, y: H.y + 60 };
  const robo = [[0, `transform:translate(${base.x}px,${base.y + 40}px)`]];
  const raios = [];
  let ultimo = { x: base.x, y: base.y + 40 };
  alvos.forEach(([t, tx, ty]) => {
    const rx = base.x + ((tx - H.x) / H.w) * 18;
    const ry = Math.max(H.y - 6, Math.min(H.y + H.h - 10, ty - 6));
    robo.push([t - 0.3, `transform:translate(${ultimo.x}px,${ultimo.y}px)`]);
    robo.push([t - 0.05, `transform:translate(${rx}px,${ry}px)`]);
    const nome = `holo-r${raios.length}`;
    css.push(quadros(nome, [[0, "opacity:0"], [t - 0.06, "opacity:0"], [t - 0.02, "opacity:1"], [t + 0.24, "opacity:1"], [t + 0.3, "opacity:0"], [CICLO, "opacity:0"]]));
    raios.push(`<path class="holo-raio" style="--a:${nome}" d="M${(rx - 8).toFixed(1)} ${(ry - 2).toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}"/><circle class="holo-faisca" style="--a:${nome}" cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="3"/>`);
    ultimo = { x: rx, y: ry };
  });
  robo.push([8.2, `transform:translate(${ultimo.x}px,${ultimo.y}px)`]);
  robo.push([9.2, `transform:translate(${base.x}px,${base.y + 40}px)`]);
  robo.push([CICLO, `transform:translate(${base.x}px,${base.y + 40}px)`]);
  css.push(quadros("holo-robo", robo));

  const e = H.emissor;
  const desce = [
    `M${e.x - 4} ${e.y}V${e.y + 60}H${e.x - 40}V720`,
    `M${e.x + 4} ${e.y}V${e.y + 90}H${e.x + 44}V720`,
    `M${e.x} ${e.y}V720`,
  ].map((d) => `<path class="holo-dado" d="${d}"/>`).join("");

  const svgHolo = `<defs><linearGradient id="feixe-holo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fed301" stop-opacity=".55"/><stop offset="1" stop-color="#fed301" stop-opacity="0"/></linearGradient></defs>
  <g class="holo">
    <path class="holo-feixe" d="M${e.x - 7} ${e.y - 6}L${H.x + 14} ${H.y + H.h}H${H.x + H.w - 14}L${e.x + 7} ${e.y - 6}Z"/>
    <g class="holo-tela">
      <rect class="holo-fundo" x="${H.x}" y="${H.y}" width="${H.w}" height="${H.h}" rx="12"/>
      <rect class="holo-moldura" x="${H.x}" y="${H.y}" width="${H.w}" height="${H.h}" rx="12" pathLength="860"/>
      <g class="holo-linhas">${Array.from({ length: 9 }, (_, i) => `<path d="M${H.x + 6} ${H.y + 20 + i * 17}H${H.x + H.w - 6}"/>`).join("")}</g>
      ${pecas.join("")}
      <rect class="holo-pronto" x="${H.x}" y="${H.y}" width="${H.w}" height="${H.h}" rx="12"/>
    </g>
    <rect class="emissor" x="${e.x - 12}" y="${e.y - 7}" width="24" height="7" rx="2"/><circle class="emissor-luz" cx="${e.x}" cy="${e.y - 7}" r="2.4"/>
    ${desce}
    ${raios.join("")}
    <g class="holo-robo"><g class="robo-corpo">
      <ellipse class="propulsor" cx="-6" cy="22" rx="3" ry="5"/><ellipse class="propulsor" cx="6" cy="22" rx="3" ry="5"/>
      <rect class="tronco" x="-9" y="9" width="18" height="12" rx="4"/>
      <path class="antena" d="M0 -12V-20"/><circle class="farol" cx="0" cy="-21" r="2.2"/>
      <rect class="cabeca" x="-15" y="-12" width="30" height="22" rx="7"/>
      <rect class="visor" x="-11" y="-6" width="22" height="9" rx="4.5"/>
      <circle class="olho" cx="-4" cy="-1.5" r="2.2"/><circle class="olho" cx="4" cy="-1.5" r="2.2"/>
    </g></g>
  </g>`;
  return { css: css.join(""), svg: svgHolo };
}

/** Rede entre as antenas: pacotes de dados indo de torre em torre. */
function rede() {
  const pontos = [[1264, 150], [1539, 156], [1647, 172]];
  const ligacoes = [[0, 1], [1, 2], [0, 2]];
  return ligacoes.map(([a, b], i) => {
    const [x1, y1] = pontos[a]; const [x2, y2] = pontos[b];
    const mx = (x1 + x2) / 2; const my = Math.min(y1, y2) - 40;
    return `<path class="rede" d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}"/><path class="pacote" d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" style="--d:${(-i * 0.9).toFixed(1)}s"/>`;
  }).join("");
}

/** Carros voadores: riscos de luz cruzando a cidade em duas faixas. */
function carros() {
  const faixas = [
    { y: 318, dir: 1, dur: 11, n: 3 },
    { y: 352, dir: -1, dur: 14, n: 3 },
    { y: 404, dir: 1, dur: 17, n: 2 },
  ];
  const out = [];
  faixas.forEach((f, i) => {
    for (let k = 0; k < f.n; k++) {
      const atraso = -((f.dur / f.n) * k + i * 1.7).toFixed(2);
      out.push(`<g class="carro ${f.dir > 0 ? "ida" : "volta"}" style="--y:${f.y + k * 3}px;--t:${f.dur}s;--d:${atraso}s"><g class="carro-corpo"><path class="rastro" d="M-46 0H-4"/><rect x="-6" y="-1.6" width="11" height="3.2" rx="1.6"/></g></g>`);
    }
  });
  return out.join("");
}

function drone(id, carga) {
  return `<g class="drone ${id}">
    <g class="drone-corpo">
      <path class="braco" d="M-14 0H14"/>
      <ellipse class="helice" cx="-14" cy="-3" rx="8" ry="1.6"/>
      <ellipse class="helice" cx="14" cy="-3" rx="8" ry="1.6"/>
      <rect class="casco" x="-7" y="-4" width="14" height="8" rx="3"/>
      <circle class="luz" cx="0" cy="5" r="1.6"/>
      ${carga ? '<path class="cabo" d="M0 4V14"/><rect class="caixa" x="-5" y="14" width="10" height="8" rx="1.5"/>' : ""}
    </g>
  </g>`;
}

function svg(classe, conteudo) {
  return `<svg class="cid ${classe}" viewBox="0 0 ${LARGURA} ${ALTURA}" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">${conteudo}</svg>`;
}

function cidade() {
  const longe = camada(7, { minimo: 90, maximo: 640, larguraMin: 46, larguraMax: 96, cor: "#1b1b23", borda: false, janelas: 0.05, piscaMax: 0 });
  const meio = camada(21, {
    minimo: 60, maximo: 540, larguraMin: 54, larguraMax: 110, vao: 22, cor: "#111117", borda: true, janelas: 0.12, piscaMax: 24,
    antenas: { minimo: 320, quantas: 3 }, luzes: 1,
  });
  const perto = camada(42, {
    minimo: 34, maximo: 440, larguraMin: 64, larguraMax: 130, vao: 70, cor: "#060607", borda: true, janelas: 0.16, piscaMax: 30,
    antenas: { minimo: 280, quantas: 3 }, luzes: 3,
  });
  const o = holograma();
  const chao = `<rect class="horizonte" x="0" y="${ALTURA - 3}" width="${LARGURA}" height="3"/>`;
  return `<div class="cidade" aria-hidden="true">
  ${svg("cid-longe", longe)}
  ${svg("cid-meio", meio + rede())}
  ${svg("cid-drones", carros() + drone("d1", false) + drone("d2", false) + drone("d3", false))}
  ${svg("cid-perto", `<style>${o.css}</style>` + perto + o.svg + chao)}
  <div class="cid-nevoa"></div>
</div>`;
}

module.exports = { cidade };
