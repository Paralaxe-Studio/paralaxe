/**
 * CONFIGURAÇÃO CENTRAL DA MARCA
 * -----------------------------
 * Tudo que muda quando a empresa tiver nome definitivo está aqui:
 * nome, cores, fontes, contatos, domínio e flags de exibição.
 * Os textos de marca (slogans, descrições) ficam em content/pt.js e content/en.js
 * e usam o marcador {brand}, que é trocado pelo nome abaixo.
 *
 * Depois de mexer aqui, rode:  npm run build
 */
module.exports = {
  brand: {
    name: "Paralaxe",
    legalName: "Paralaxe",     // razão social / nome jurídico (aparece no rodapé e na privacidade)
    // Logo em imagem (arquivos em assets/). Deixe null para usar só texto.
    logoMark: "logo-mark.png",       // o "P" amarelo
    logoWord: "logo-wordmark.png",   // o nome PARALAXE
    tagline: "Software / Games / Technology",
  },

  // URL final do site, sem barra no fim. Enquanto não houver domínio próprio, usa o
  // endereço gratuito do GitHub Pages. Quando comprar o domínio, troque aqui.
  siteUrl: "https://paralaxestudio.com.br",

  // Domínio próprio publicado pelo GitHub Pages (gera o arquivo docs/CNAME). Deixe "" para não usar.
  customDomain: "paralaxestudio.com.br",

  languages: ["pt", "en"],
  defaultLang: "pt",

  contact: {
    // WhatsApp só com números, com DDI+DDD. Número provisório de teste.
    whatsapp: "5511993821582",
    // Deixe "" para esconder o botão de e-mail (enquanto não houver e-mail profissional).
    email: "contato@paralaxestudio.com",
  },

  // Redes sociais (URL completa). Deixe "" para não mostrar a rede no rodapé.
  social: {
    instagram: "https://instagram.com/paralaxe_studio",
    tiktok: "",
    youtube: "https://www.youtube.com/@ParalaxeStudio",
    x: "",
    linkedin: "",
  },

  // Nomes de clientes reais NÃO aparecem no site por padrão.
  // Só mude para true depois que o cliente autorizar, e preencha os nomes.
  showClientNames: false,
  clientNames: {
    auto: "Megatrom",
    pharmacy: "Privilégio Fórmulas",
  },

  // Selo de cada projeto: "ready" = Pronto para implantação, "live" = Em produção
  // (só quando estiver de fato no ar com cliente), "" = sem selo.
  projectStatus: {
    salon: "live",
    auto: "live",
    pharmacy: "live",
    crm: "live",
  },

  // Paleta da marca: preto profundo + amarelo do logo.
  colors: {
    bg: "#050505",
    bgAlt: "#0a0a0b",
    surface: "#111113",
    surface2: "#19191c",
    border: "#2a2a2f",
    text: "#f4f3ee",
    muted: "#a3a3a8",
    accent: "#fed301",       // amarelo do logo
    accentStrong: "#ffe55c",
    accentDeep: "#c79e00",
    onAccent: "#141000",     // texto sobre botões amarelos
    warm: "#ff9a3c",         // laranja de apoio
  },

  // Fontes self-hosted (pacotes @fontsource). Se trocar, ajuste também build.js.
  fonts: {
    display: "Space Grotesk",
    body: "Inter",
  },

  year: 2026,
};
