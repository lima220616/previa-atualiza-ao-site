// As outras páginas do site (fora a inicial e a /bio, que têm o seu molde): a página de erro, as páginas de passagem
// (/ir/, /loja/, /produto/... do site antigo), as páginas próprias das políticas e os arquivos de texto para a Netlify e
// o Google (_redirects, robots.txt, sitemap.xml). Devolve { "caminho": conteúdo }. Funções puras (Node e navegador).
import { h } from "./html.mjs";
import { linkDoWhatsapp, numeroEscrito } from "./partes/moldura/comum.mjs";
import { politicasConferidas } from "./partes/politicas.mjs";
import { cabecaComum, medicaoLigada } from "./partes/moldura/cabeca-comum.mjs";

// "https://brumarcosmeticos.com/" -> "https://brumarcosmeticos.com" (o endereço oficial, sem a barra do fim).
export function enderecoDoSite(marca) {
  const s = String(marca?.site ?? "");
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/.test(s)) throw new Error(`marca.json: endereço do site inválido (${s})`);
  return s.replace(/\/$/, "");
}

// O logo do site, com a descrição de sempre: "Brumar Cosméticos – O Poder da Transformação".
function logo(dados) {
  return h`<img src="${dados.marca.logo}" alt="${dados.marca.nome} – ${dados.textos.slogan}">`;
}

// Endereços do site de 16/10 que o Google e os anúncios conhecem -> tela nova (parte fixa; o ir.js troca pelo kit
// quando o endereço traz um). A ordem é a do gerador de hoje.
const PASSAGENS = {
  "produto/gloss-matizado": "p-gloss", "produto/gloss-branco": "p-gloss-branco", "produto/shampoo": "p-shampoo",
  "produto/leave-in": "p-leavein", "produto/oleo-umectante": "p-oleo", "produto/perfume-capilar": "p-cristal",
  "produto/serum-reparador": "p-serum", "loja": "mais-vendido", "duvidas": "p-duvidas", "avaliacoes": "p-avaliacoes",
  "sobre": "p-quem-somos", "politicas": "p-politicas",
};

// A passagem fica sem o trecho comum (cabecaComum: aviso de cookies, Pixel e Google): ela só leva na hora para a
// inicial, que conta a visita; contar aqui também contaria a mesma visita duas vezes.
function passagem(dados, ctx, tela) {
  const ancora = `#${tela || "mais-vendido"}`;
  return h`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${dados.marca.nome}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${enderecoDoSite(dados.marca)}/">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/icone-48.png">
<script src="${ctx.url("js/ir.js")}"${tela ? h` data-para="${tela}"` : null}></script>
<noscript><meta http-equiv="refresh" content="0; url=/${ancora}"></noscript>
</head>
<body style="font-family:Arial,sans-serif;text-align:center;padding:40px 16px;color:#8A2E48">
<p>Abrindo a página da Brumar…</p>
<p><a href="/${ancora}" style="color:#B84060;font-weight:700">Toque aqui se não abrir sozinha</a></p>
</body>
</html>
`;
}

function paginaDeErro(dados, ctx) {
  // a medição e o aviso de cookies; com eles, o botão que reabre o aviso
  const medicao = cabecaComum(ctx, dados.marca);
  const comAviso = /rastreio/.test(String(medicao ?? ""));
  return h`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada · ${dados.marca.nome}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#B84060">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/icone-48.png">
<link rel="stylesheet" href="${ctx.url("fontes/fontes.css")}">
<style>
body{margin:0;background:#fff;color:#8A2E48;font-family:Montserrat,Helvetica,Arial,sans-serif;text-align:center;padding:48px 16px}
img{height:64px;width:auto;margin:0 auto 24px;display:block}
h1{font-family:'Playfair Display',Georgia,serif;font-size:28px;margin:0 0 12px}
a.b{display:inline-block;margin:8px 4px;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none}
.v{background:#0B8139;color:#fff}.c{border:2px solid #B84060;color:#B84060}
.lk-cookies{margin-top:24px;padding:0;border:0;background:none;color:#B84060;font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
.lk-cookies:focus-visible{outline:3px solid #8A2E48;outline-offset:2px}
</style>
${medicao}</head>
<body>
<a href="/">${logo(dados)}</a>
<h1>Página não encontrada</h1>
<p>O endereço pode ter mudado. Os produtos estão todos na página inicial.</p>
<p><a class="b v" href="/#mais-vendido">Ver os produtos</a><a class="b c" href="${linkDoWhatsapp(dados.marca)}">Falar no WhatsApp</a></p>
${comAviso ? h`<p><button type="button" class="lk-cookies" data-cookies>Preferências de cookies</button></p>
` : ""}</body>
</html>
`;
}

// Página própria de uma política (a Meta pede o endereço da Privacidade e dos Termos): abre direto, até para robôs (o
// único programa é o da medição, do trecho comum, com o aviso de cookies; o botão "Preferências de cookies" do rodapé
// reabre o aviso). O texto é o mesmo da tela Políticas.
function paginaDePolitica(dados, ctx, politica, comPagina) {
  const { marca } = dados;
  const site = enderecoDoSite(marca);
  const { empresa } = marca;
  return h`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${politica.titulo} · ${marca.nome}</title>
<meta name="description" content="${politica.titulo} da ${marca.nome} (${empresa["razao-social"]}, CNPJ ${empresa.cnpj}). Última atualização: ${politica.data}.">
<link rel="canonical" href="${site}/${politica.pagina}/">
<meta name="theme-color" content="#B84060">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/icone-48.png">
<link rel="apple-touch-icon" href="/assets/img/icone-180.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${marca.nome}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${politica.titulo} · ${marca.nome}">
<meta property="og:url" content="${site}/${politica.pagina}/">
<meta property="og:image" content="${site}/assets/img/compartilhar.jpg">
<link rel="stylesheet" href="${ctx.url("fontes/fontes.css")}">
<style>
:root{--vinho:#8A2E48;--rosa:#B84060;--linha:#F3D3DA;--sans:'Montserrat',Helvetica,Arial,sans-serif;--serif:'Playfair Display',Georgia,'Times New Roman',serif}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--vinho);font-family:var(--sans);font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased}
.topo{border-bottom:1.5px solid var(--linha);padding:14px 16px;text-align:center}
.topo img{height:54px;width:auto}
main{max-width:760px;margin:0 auto;padding:24px 16px 40px}
h1{font-family:var(--serif);font-size:clamp(28px,6vw,38px);line-height:1.2;margin:8px 0 6px}
.data{margin:0 0 22px;font-size:14px;opacity:.8}
h3{font-size:17px;margin:24px 0 6px}
ul{padding-left:20px;margin:8px 0}li{margin:4px 0}
a{color:var(--rosa)}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid var(--linha);padding:6px 8px;text-align:left;vertical-align:top}
.rodape{border-top:1.5px solid var(--linha);padding:22px 16px 32px;text-align:center;font-size:14px}
.rodape a,.rodape .lk-cookies{display:inline-block;margin:4px 10px}
.lk-cookies{padding:0;border:0;background:none;color:var(--rosa);font:inherit;text-decoration:underline;cursor:pointer}
.lk-cookies:focus-visible{outline:3px solid var(--vinho);outline-offset:2px}
</style>
${cabecaComum(ctx, marca)}</head>
<body>
<header class="topo"><a href="/">${logo(dados)}</a></header>
<main>
<h1>${politica.titulo}</h1>
<p>Última atualização: ${politica.data}</p>
${politica.html}
<p><a href="/#p-politicas">Ver todas as políticas da Brumar</a></p>
</main>
<footer class="rodape">
${comPagina.map((p) => h`<a href="/${p.pagina}/">${p.titulo}</a>`)}<a href="/#p-politicas">Todas as políticas</a>${medicaoLigada(ctx, marca) ? h`<button type="button" class="lk-cookies" data-cookies>Preferências de cookies</button>` : ""}<br>
<a href="/">Loja oficial</a><a href="${linkDoWhatsapp(marca)}">WhatsApp ${numeroEscrito(marca)}</a><a href="${`mailto:${marca.email}`}">${marca.email}</a>
<p>${marca.nome} · ${empresa["razao-social"]} · CNPJ ${empresa.cnpj}</p>
</footer>
</body>
</html>
`;
}

// Endereço de fora que vai num arquivo de texto (sem espaço, quebra de linha ou aspas: uma linha não vira duas regras).
function enderecoSimples(valor, onde) {
  const s = String(valor ?? "");
  if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[A-Za-z0-9._~%/-]*)?$/.test(s)) throw new Error(`${onde}: endereço inválido (${s})`);
  return s;
}

// Endereços antigos (loja antiga da Yampi e site de 16/10) -> páginas novas. Parte fixa, igual à de hoje (o comentário
// também, para o espelho sair idêntico).
function redirecionamentos(dados) {
  return h`# Endereços antigos (loja antiga da Yampi e site de 16/10) -> páginas novas. 301 = mudança permanente.
# Os destinos não têm "?" nem "#": assim a Netlify repassa o ?cupom= e as utm_ do anúncio, e a página de passagem
# (/ir/, com ir.js) leva para /#p-... sem perder nada. Gerado por previa-v4/montar-site-novo.py.
/produtos  /ir/mais-vendido/  301
/produtos/*  /ir/mais-vendido/  301
/promocoes  /ir/mais-vendido/  301
/finalizadores  /ir/finalizadores/  301
/mais-vendidos  /ir/mais-vendido/  301
/busca  /ir/mais-vendido/  301
/brumar  /ir/quem-somos/  301
/atendimento/perguntas-frequentes  /ir/duvidas/  301
/atendimento/modo-de-usar  /ir/modo-de-usar/  301
/atendimento/resultados-reais  /ir/resultados/  301
/atendimento/rastrear-pedido  ${enderecoSimples(dados.marca["minha-conta"], "marca.json (minha-conta)")}  301
/atendimento/politica-de-privacidade  /politica-de-privacidade/  301
/atendimento/politica-de-cookies  /ir/cookies/  301
/atendimento/politica-de-trocas-e-devolucoes  /ir/trocas/  301
/atendimento/termos-de-uso  /termos-de-uso/  301
/:produto/p  /ir/:produto/  301
/:colecao/l  /ir/mais-vendido/  301
/ir/*  /ir/index.html  200
`;
}

// O mapa do site: só as páginas que o Google pode guardar (sem noindex). São a página inicial e as páginas próprias
// das políticas. Ficam de fora, de propósito, as que têm noindex: a /bio (página do Instagram, repete a inicial), a 404
// e as passagens (/ir/, /loja/, /produto/..., /avaliacoes/...: só levam para uma tela da inicial, e o Google reclama de
// página com noindex no mapa). As telas (#p-...) são parte da inicial: o Google não guarda endereço com "#" como página
// separada. Sem <lastmod>: a data da montagem mudava a cada publicação sem mudança de verdade (o Google passa a não
// confiar nela), e não há outra data que diga quando o texto mudou.
function mapaDoSite(dados, comPagina) {
  const site = enderecoDoSite(dados.marca);
  return h`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${site}/</loc></url>
${comPagina.map((p) => h`<url><loc>${site}/${p.pagina}/</loc></url>
`)}</urlset>
`;
}

// O que nunca pode ir para o Google nem para as regras de endereço: as telas do painel e os módulos do molde.
function semPainelNemMolde(texto, onde) {
  if (/(^|[\s"'>])\/?(painel|molde)(\/|\s|$)|brumarcosmeticos\.com\/(painel|molde)\b/m.test(texto)) {
    throw new Error(`${onde}: não pode citar /painel/ nem /molde/`);
  }
  return texto;
}

export function montarOutrasPaginas(dados, ctx) {
  const politicas = politicasConferidas(dados);
  const comPagina = politicas.filter((p) => p.pagina);
  const paginas = { "404.html": paginaDeErro(dados, ctx) };
  // Cada endereço uma vez só: a página própria de uma política com o nome de uma passagem ("politicas", "duvidas", ...)
  // não pode tomar o lugar dela calada.
  const pagina = (caminho, conteudo) => {
    if (Object.hasOwn(paginas, caminho)) throw new Error(`molde: a página ${caminho} sairia duas vezes (veja o "pagina" do politicas.json)`);
    paginas[caminho] = conteudo;
  };
  for (const [caminho, tela] of Object.entries(PASSAGENS)) pagina(`${caminho}/index.html`, passagem(dados, ctx, tela));
  pagina("ir/index.html", passagem(dados, ctx, ""));
  for (const p of comPagina) pagina(`${p.pagina}/index.html`, paginaDePolitica(dados, ctx, p, comPagina));
  paginas._redirects = semPainelNemMolde(String(redirecionamentos(dados)), "_redirects");
  paginas["robots.txt"] = semPainelNemMolde(String(h`User-agent: *
Allow: /
Sitemap: ${enderecoDoSite(dados.marca)}/sitemap.xml
`), "robots.txt");
  paginas["sitemap.xml"] = semPainelNemMolde(String(mapaDoSite(dados, comPagina)), "sitemap.xml");
  return Object.fromEntries(Object.entries(paginas).map(([caminho, conteudo]) => [caminho, String(conteudo)]));
}

export default montarOutrasPaginas;
