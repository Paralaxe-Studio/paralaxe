# Site institucional (nome provisório: Lynx)

Site em duas versões completas, português do Brasil (`/pt/`) e inglês (`/en/`), gerado de forma estática. Sem framework: HTML, CSS e um pouco de JavaScript.

## Como trocar nome, cores e contatos

Tudo está em **`site.config.js`**: nome da marca, cores, fontes, WhatsApp, e-mail e domínio.
Os textos ficam em `content/pt.js` e `content/en.js` (o marcador `{brand}` vira o nome da marca).

Antes de publicar, troque no `site.config.js`:

- `contact.whatsapp` (hoje é um número de teste) e `contact.email` (vazio esconde o botão de e-mail);
- `siteUrl` (usado em canonical, hreflang e sitemap);
- `brand.name` e `brand.legalName`.

Nomes de clientes reais **não** aparecem no site. Só ative `showClientNames` depois que o cliente autorizar.
O selo de cada projeto fica em `projectStatus` ("ready" = pronto para implantação; "live" = em produção, só quando estiver no ar com cliente).

## Paralaxe One (app de gestão)

A seção do app (ramos, telas e planos) fica em `content/one.pt.js` e `content/one.en.js`.
Os preços precisam bater com `frontend/src/lib/planos.ts` do app.
Enquanto o app não estiver no ar, `one.appUrl` fica vazio no `site.config.js` e os botões abrem o WhatsApp
com a mensagem pronta. Quando estiver no ar, coloque `https://one.paralaxestudio.com`: os botões passam a abrir
o cadastro já com o ramo escolhido (`/cadastro?nicho=...`).

## Comandos

```bash
npm install
npm run build        # gera a pasta docs/
npm start            # gera e serve em http://localhost:4173
node tools/screenshots.js   # capturas em desktop/tablet/celular, PT e EN
```

## Publicação

A pasta `docs/` é o site pronto (GitHub Pages publica a partir dela: Settings → Pages → Branch `main`, pasta `/docs`). Os caminhos são relativos, então funciona também em subpasta, como `usuario.github.io/empresa-site`.

## Observações

- A página de privacidade é um texto-base provisório: revise com um advogado antes de publicar em definitivo.
- Idioma: a raiz (`/`) escolhe pelo idioma do navegador na primeira visita e lembra a escolha feita no botão de idioma.
- Animações respeitam `prefers-reduced-motion`.
