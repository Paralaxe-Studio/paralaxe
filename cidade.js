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
 * Obra com guindaste-robô: a planta tracejada vira prédio, andar por andar (o que a Paralaxe faz com sistemas).
 * Linha do tempo de 28 s: 6 andares de 4 s cada e uma pausa com o prédio pronto. Sem animação, mostra o prédio pronto.
 */
const OBRA = { x: 1002, w: 110, base: 442, andar: 22, andares: 6, pega: 1196, solta: 1057, telhadoPega: 471, trilho: 244, alto: 262 };
const CICLO = 28;

function pct(t) { return +((t / CICLO) * 100).toFixed(3); }

function quadros(nome, pontos) {
  // pontos: [[tempo em s, "propriedades css"], ...] em ordem
  return `@keyframes ${nome}{${pontos.map(([t, v]) => `${pct(t)}%{${v}}`).join("")}}`;
}

function obra() {
  const o = OBRA;
  const r = sorteio(77);
  const ganchoPega = o.telhadoPega - 14;
  const ganchoSolta = (k) => o.base - o.andar * k - 14;
  const carrinho = [[0, `transform:translate(${o.pega}px,0)`]];
  const gancho = [[0, `transform:translate(0,${o.alto}px)`]];
  const cabo = [[0, `transform:scaleY(${o.alto - o.trilho})`]];
  const olho = [[0, "transform:translateX(5px)"]];
  const bloco = [[0, "opacity:0"]];
  const pousos = [];
  const passo = (lista, t, v) => lista.push([t, v]);
  for (let k = 0; k < o.andares; k++) {
    const t0 = k * 4;
    const desce = (y) => [`transform:translate(0,${y}px)`, `transform:scaleY(${y - o.trilho})`];
    // desce na pilha, pega o bloco, sobe
    passo(gancho, t0 + 0.05, desce(o.alto)[0]); passo(cabo, t0 + 0.05, desce(o.alto)[1]);
    passo(gancho, t0 + 0.45, desce(ganchoPega)[0]); passo(cabo, t0 + 0.45, desce(ganchoPega)[1]);
    passo(bloco, t0 + 0.44, "opacity:0"); passo(bloco, t0 + 0.46, "opacity:1");
    passo(gancho, t0 + 0.85, desce(o.alto)[0]); passo(cabo, t0 + 0.85, desce(o.alto)[1]);
    // leva até a obra
    passo(carrinho, t0 + 0.85, `transform:translate(${o.pega}px,0)`);
    passo(olho, t0 + 0.85, "transform:translateX(5px)");
    passo(carrinho, t0 + 1.9, `transform:translate(${o.solta}px,0)`);
    passo(olho, t0 + 1.9, "transform:translateX(-5px)");
    // desce até o andar de cima, solta
    passo(gancho, t0 + 1.95, desce(o.alto)[0]); passo(cabo, t0 + 1.95, desce(o.alto)[1]);
    passo(gancho, t0 + 2.5, desce(ganchoSolta(k))[0]); passo(cabo, t0 + 2.5, desce(ganchoSolta(k))[1]);
    passo(bloco, t0 + 2.5, "opacity:1"); passo(bloco, t0 + 2.52, "opacity:0");
    pousos.push(t0 + 2.5);
    passo(gancho, t0 + 3.0, desce(o.alto)[0]); passo(cabo, t0 + 3.0, desce(o.alto)[1]);
    // volta
    passo(carrinho, t0 + 3.05, `transform:translate(${o.solta}px,0)`);
    passo(olho, t0 + 3.05, "transform:translateX(-5px)");
    passo(carrinho, t0 + 3.95, `transform:translate(${o.pega}px,0)`);
    passo(olho, t0 + 3.95, "transform:translateX(5px)");
  }
  [carrinho, gancho, cabo, olho, bloco].forEach((l) => l.push([CICLO, l[l.length - 1][1]]));

  const css = [
    quadros("obra-carrinho", carrinho), quadros("obra-gancho", gancho), quadros("obra-cabo", cabo),
    quadros("obra-olho", olho), quadros("obra-bloco", bloco),
  ];
  const andares = [];
  for (let k = 0; k < o.andares; k++) {
    const y = o.base - o.andar * (k + 1);
    const janelas = [];
    for (let jx = o.x + 9; jx < o.x + o.w - 8; jx += 11) {
      if (r() < 0.45) janelas.push(`<rect class="${r() < 0.3 ? "jf" : "j"}" x="${jx}" y="${y + 8}" width="4" height="6"/>`);
    }
    const t = pousos[k];
    css.push(quadros(`obra-andar${k}`, [[0, "opacity:0"], [t - 0.01, "opacity:0"], [t, "opacity:1"], [CICLO - 1.2, "opacity:1"], [CICLO - 0.3, "opacity:0"], [CICLO, "opacity:0"]]));
    css.push(quadros(`obra-brilho${k}`, [[0, "opacity:0"], [t, "opacity:0"], [t + 0.04, "opacity:.9"], [t + 0.7, "opacity:0"], [CICLO, "opacity:0"]]));
    andares.push(`<g class="andar" style="--a:obra-andar${k}"><rect class="corpo" x="${o.x}" y="${y}" width="${o.w}" height="${o.andar}"/><path class="laje" d="M${o.x} ${y + 0.5}H${o.x + o.w}"/>${janelas.join("")}<rect class="brilho" style="--a:obra-brilho${k}" x="${o.x}" y="${y}" width="${o.w}" height="${o.andar}"/></g>`);
  }
  // Prédio pronto acende tudo por um instante antes de recomeçar.
  css.push(quadros("obra-pronto", [[0, "opacity:0"], [CICLO - 3.2, "opacity:0"], [CICLO - 2.6, "opacity:.55"], [CICLO - 1.6, "opacity:0"], [CICLO, "opacity:0"]]));

  const topo = o.base - o.andar * o.andares;
  const planta = `<rect class="planta" x="${o.x + 0.5}" y="${topo + 0.5}" width="${o.w - 1}" height="${o.base - topo - 1}"/>`
    + Array.from({ length: o.andares - 1 }, (_, i) => `<path class="planta" d="M${o.x} ${o.base - o.andar * (i + 1)}H${o.x + o.w}"/>`).join("");

  // Torre do guindaste em treliça.
  const mx = 1121, mw = 10, mtopo = 236;
  let trelica = `M${mx} 720V${mtopo}M${mx + mw} 720V${mtopo}`;
  for (let y = 720; y > mtopo + 10; y -= 14) trelica += `M${mx} ${y}L${mx + mw} ${y - 14}`;
  const jib = { de: 962, ate: 1236, y: 236 };
  let lanca = `M${jib.de} ${jib.y}H${jib.ate}M${jib.de + 6} ${jib.y + 8}H${jib.ate}`;
  for (let x = jib.de + 6; x < jib.ate - 4; x += 12) lanca += `M${x} ${jib.y + 8}L${x + 6} ${jib.y}L${x + 12} ${jib.y + 8}`;
  const pilha = [0, 1, 2].map((i) => `<rect class="caixote" x="${o.pega - 26 + i * 15}" y="${o.telhadoPega - 12}" width="12" height="12" rx="1.5"/>`).join("")
    + `<rect class="caixote" x="${o.pega - 19}" y="${o.telhadoPega - 24}" width="12" height="12" rx="1.5"/>`;

  const robo = `<g class="robo">
    <path class="antena" d="M1126 206V194"/><circle class="farol" cx="1126" cy="193" r="2.6" style="--d:.3s"/>
    <rect class="cabeca" x="1109" y="205" width="34" height="27" rx="7"/>
    <rect class="visor" x="1114" y="212" width="24" height="10" rx="5"/>
    <circle class="olho" cx="1126" cy="217" r="2.8"/>
  </g>`;

  return {
    css: css.join(""),
    svg: `<g class="obra">${planta}<g class="andares">${andares.join("")}</g>`
      + `<rect class="pronto" x="${o.x}" y="${topo}" width="${o.w}" height="${o.base - topo}"/>`
      + `<path class="guindaste" d="${trelica}"/><path class="guindaste" d="${lanca}"/>`
      + `<rect class="contrapeso" x="1214" y="${jib.y + 8}" width="20" height="14" rx="2"/>`
      + pilha
      + `<g class="carrinho"><rect class="carro-trilho" x="-6" y="${o.trilho - 4}" width="12" height="5" rx="1.5"/>`
      + `<rect class="cabo" x="-0.6" y="${o.trilho}" width="1.2" height="1"/>`
      + `<g class="gancho"><path class="garra" d="M-7 0H7M-7 0V5M7 0V5"/><rect class="bloco" x="-6" y="2" width="12" height="12" rx="1.5"/></g></g>`
      + robo + `</g>`,
  };
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
  const o = obra();
  const chao = `<rect class="horizonte" x="0" y="${ALTURA - 3}" width="${LARGURA}" height="3"/>`;
  return `<div class="cidade" aria-hidden="true">
  ${svg("cid-longe", longe)}
  ${svg("cid-meio", meio)}
  ${svg("cid-drones", carros() + drone("d1", false) + drone("d2", true) + drone("d3", false))}
  ${svg("cid-perto", `<style>${o.css}</style>` + perto + o.svg + chao)}
  <div class="cid-nevoa"></div>
</div>`;
}

module.exports = { cidade };
