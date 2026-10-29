// Modo prévia do painel (especificação, ajustes 11, 17 e 18; etapa 14). Só com ctx.previa: a página publicada não leva
// nada disto (o montador confere). Funções puras (Node e navegador).
//  - <html data-previa="1">, com o foco do painel em data-previa-foco ("<grupo>" ou "<grupo>:<chave>") e a tela que a
//    prévia abre em data-previa-tela ("p-..."): a do produto, a do kit, a dos vídeos do produto ou a das Dúvidas;
//  - as partes que o painel edita levam data-painel="<grupo>" e data-painel-chave="<chave>" (o rolar.js do painel
//    rola até a do foco). Cada item é marcado num lugar só, o que fica à vista com a tela aberta;
//  - o programa da prévia (js/previa.js) roda antes dos outros: nada sai do quadro nem fica gravado;
//  - dado incompleto mostra um aviso no lugar da parte, em vez de parar (sem a prévia, o montador para).
import { h, cru } from "../../html.mjs";
import { secaoLigada } from "./comum.mjs";

// Os grupos do foco (os mesmos do esquema do painel e do rolar.js dele).
export const GRUPOS_DO_FOCO = ["textos", "atendimento", "campanhas", "banners", "secoes", "produtos", "kits", "faq", "videos", "fotos", "resultados",
  "videos-por-produto", "fotos-por-produto", "bio"];
const PEDACO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "produtos:gloss" -> { grupo: "produtos", chave: "gloss" }. Foco estranho = sem foco (a prévia não para por isso).
export function lerFoco(foco) {
  const m = /^([a-z0-9-]+)(?::([a-z0-9-]+))?$/.exec(String(foco ?? ""));
  if (!m || !GRUPOS_DO_FOCO.includes(m[1]) || (m[2] !== undefined && !PEDACO.test(m[2]))) return null;
  return { grupo: m[1], chave: m[2] ?? "" };
}

// O pedaço de atributo da marca, para pôr dentro da etiqueta: h`<div${marca(ctx, "videos", "depoimentos")}>`.
export function marca(ctx, grupo, chave = "") {
  if (!ctx?.previa) return null;
  return chave ? h` data-painel="${grupo}" data-painel-chave="${chave}"` : h` data-painel="${grupo}"`;
}

// A marca na primeira etiqueta de um pedaço que o molde já escreveu com h`` (uma seção, uma tela, uma dúvida). Junta
// dois pedaços já protegidos: o começo da etiqueta e a marca (que também sai do h``).
export function marcado(pronto, ctx, grupo, chave = "") {
  if (!ctx?.previa || !pronto) return pronto;
  const s = String(pronto);
  const m = /^\s*<[a-zA-Z][a-zA-Z0-9-]*/.exec(s);
  if (!m) throw new Error(`molde: a marca da prévia (${grupo}) precisa de uma etiqueta no começo`);
  return cru(m[0] + String(marca(ctx, grupo, chave)) + s.slice(m[0].length));
}

const visivel = (dados, tela) => Boolean(dados.produtos?.[tela]) && dados.produtos[tela].visivel !== false;

// A tela de produto de um kit, para a prévia abrir e para a marca do kit ficar num lugar só: a tela do próprio kit
// (com a mesma chave; senão, a que tem ele como kit principal); senão, a primeira que o oferece (na ordem do
// produtos.json). Nenhuma: null.
export function telaDoKit(dados, kit) {
  const telas = Object.keys(dados.produtos ?? {}).filter((t) => visivel(dados, t) && (dados.produtos[t].opcoes ?? []).includes(kit));
  return telas.find((t) => t === kit) ?? telas.find((t) => dados.produtos[t].kit === kit) ?? telas[0] ?? null;
}

// As dúvidas à vista na seção da página inicial (as 7 primeiras com "inicial"; o resto fica no "Ver mais perguntas",
// fechado). Uma dúvida fora delas é marcada e aberta na tela Dúvidas.
export const DUVIDAS_A_VISTA = 7;
export function duvidaAVistaNaInicial(dados, chave) {
  if (!secaoLigada(dados, "duvidas")) return false;
  const lista = Object.entries(dados.faq ?? {}).filter(([, p]) => p?.inicial).map(([c]) => c);
  return lista.indexOf(chave) >= 0 && lista.indexOf(chave) < DUVIDAS_A_VISTA;
}

export function telaDoFoco(dados, foco) {
  if (!foco?.chave) return null;
  if (foco.grupo === "produtos" || foco.grupo === "videos-por-produto" || foco.grupo === "fotos-por-produto") return visivel(dados, foco.chave) ? `p-${foco.chave}` : null;
  if (foco.grupo === "kits") { const t = telaDoKit(dados, foco.chave); return t ? `p-${t}` : null; }
  if (foco.grupo === "faq" && dados.faq?.[foco.chave]) return duvidaAVistaNaInicial(dados, foco.chave) ? null : "p-duvidas";
  return null;
}

// Os atributos do <html> na prévia (fora dela, nada).
export function atributosDaPagina(dados, ctx) {
  if (!ctx?.previa) return null;
  const foco = lerFoco(ctx.foco);
  let tela = null;
  try { tela = foco ? telaDoFoco(dados, foco) : null; } catch { tela = null; }
  const escrito = foco ? (foco.chave ? `${foco.grupo}:${foco.chave}` : foco.grupo) : "";
  return h` data-previa="1"${escrito ? h` data-previa-foco="${escrito}"` : null}${tela ? h` data-previa-tela="${tela}"` : null}`;
}

// ---------------------------------------------------------------------------------------------------------------
// Dado incompleto na prévia: um aviso no lugar da parte (o resto da página continua). A mensagem é a do molde (a
// mesma que pararia a montagem), escrita como texto.
const ESTILO_DO_AVISO = "margin:16px auto;max-width:820px;padding:14px 16px;border:2px solid #D93A3A;border-radius:10px;"
  + "background:#FFF4F4;color:#8A2E48;font:15px/1.5 Montserrat,Arial,sans-serif";

function mensagemDe(erro) {
  const s = String(erro?.message ?? erro ?? "erro desconhecido").replace(/\s+/g, " ").trim();
  return s.length > 300 ? `${s.slice(0, 300)}…` : s;
}

export function avisoDaPrevia(onde, erro) {
  return h`<div class="previa-aviso" role="alert" style="${ESTILO_DO_AVISO}"><b>Prévia: ${onde} não aparece.</b> ${mensagemDe(erro)}. O site no ar não muda; a publicação só sai com isso corrigido.</div>
`;
}

// Na prévia, um erro em fazer() vira o aviso; fora dela, o erro segue (e a montagem para).
export function naPrevia(ctx, onde, fazer, embrulho = (aviso) => aviso) {
  if (!ctx.previa) return fazer();
  try {
    return fazer();
  } catch (erro) {
    return embrulho(avisoDaPrevia(onde, erro));
  }
}

// A página inteira de aviso (quando nem a cabeça ou o fim da página saem).
export function paginaDeAviso(erro) {
  return String(h`<!doctype html>
<html lang="pt-BR" data-previa="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prévia do site</title>
</head>
<body style="margin:0;background:#FDF0F3">
${avisoDaPrevia("a página", erro)}</body>
</html>
`);
}
