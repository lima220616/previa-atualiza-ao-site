// Cabeça da página: doctype, <head> (título, descrição para o Google, compartilhamento, ícones, o bloco para o Google
// montado do marca.json, as letras, o estilo e o trecho comum: moldura/cabeca-comum.mjs) e a abertura do <body>.
import { h, cru } from "../html.mjs";
import { blocoDeDados } from "../seguro.mjs";
import { ESTILO } from "./moldura/estilo.mjs";
import { atributosDaPagina } from "./moldura/previa.mjs";
import { comOsProdutos } from "./moldura/dados-google.mjs";
import { cabecaComum } from "./moldura/cabeca-comum.mjs";
import { telefoneDoGoogle } from "./moldura/comum.mjs";

// As redes que o Google liga à loja (parte fixa: as 4 com perfil da marca).
const REDES_DO_GOOGLE = ["instagram", "tiktok", "youtube", "facebook"];

function blocoDoGoogle(marca, textos) {
  const site = marca.site;
  const e = marca.empresa;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": `${site}#loja`, name: marca.nome, legalName: e["razao-social"], taxID: e.cnpj,
        url: site, logo: `${site}assets/img/icone-180.png`, image: `${site}assets/img/compartilhar.jpg`,
        description: marca["descricao-da-loja"], slogan: textos.slogan, email: marca.email, telephone: telefoneDoGoogle(marca),
        address: { "@type": "PostalAddress", streetAddress: e.endereco, addressLocality: e.cidade, addressRegion: e.estado,
          postalCode: e.cep, addressCountry: "BR" },
        sameAs: REDES_DO_GOOGLE.map((r) => marca.redes?.[r]).filter(Boolean),
      },
      { "@type": "WebSite", "@id": `${site}#site`, url: site, name: marca.nome, inLanguage: "pt-BR", publisher: { "@id": `${site}#loja` } },
    ],
  };
}

export default function cabeca(dados, ctx) {
  const { marca, textos } = dados;
  if (!/^https:\/\/[a-z0-9.-]+\/$/.test(marca.site ?? "")) throw new Error(`marca.json: endereço do site inválido (${marca.site})`);
  const titulo = `${marca.nome} · ${textos.titulo}`;
  const imagem = `${marca.site}assets/img/compartilhar.jpg`;
  return h`<!doctype html>
<html lang="pt-BR"${atributosDaPagina(dados, ctx)}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titulo}</title>
<meta name="description" content="${textos.descricao}">
<link rel="canonical" href="${marca.site}">
<meta name="theme-color" content="#B84060">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/icone-48.png">
<link rel="apple-touch-icon" href="/assets/img/icone-180.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${marca.nome}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${textos["descricao-compartilhamento"]}">
<meta property="og:url" content="${marca.site}">
<meta property="og:image" content="${imagem}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Shampoo, Gloss Matizado e Leave-in da ${marca.nome}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${cru(blocoDeDados(comOsProdutos(blocoDoGoogle(marca, textos), dados, ctx)))}</script>
<link rel="stylesheet" href="${ctx.url("fontes/fontes.css")}">
${ESTILO}
${cabecaComum(ctx, marca)}</head>
<body>
`;
}
