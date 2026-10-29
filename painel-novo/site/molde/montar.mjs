// Junta o molde: a página inicial (as 11 partes, na ordem da página), a /bio e as outras páginas do site. É o que o
// montador (montar-site.mjs) chama no computador e na Netlify, e o que a prévia do painel chama no navegador
// (/molde/montar.mjs). Funções puras e sem nada de fora: os dados e o relógio chegam de quem chama.
//
// opcoes = { nivel, agora, previa, foco, nomes, urlDaPrevia }. O painel chama com { url, agora, previa, foco }: o
// url dele é o das fotos e vídeos ainda não publicados (urlDaPrevia). Sem nomes, valem os de molde/arquivos.mjs (a
// lista que o montador grava a cada montagem). Sem nivel, é o nível 2 (todo endereço começando com "/").
// Modo prévia (previa: true, só o painel): a página sai marcada para o painel (partes/moldura/previa.mjs), com o
// programa da prévia, e dado incompleto vira aviso em vez de parar. O montador nunca pede a prévia: lá, erro para.
import { criarContexto } from "./contexto.mjs";
import { condicoes } from "./partes/produto/comum.mjs";
import { naPrevia, paginaDeAviso } from "./partes/moldura/previa.mjs";

// As partes da página inicial, na ordem da página (as mesmas de ferramentas/fatias.mjs).
export const PARTES = ["cabeca", "icones", "topo", "inicial", "duvidas", "produtos", "politicas", "lucre", "quem-somos",
  "avaliacoes", "rodape"];

// Cada pedaço do molde é carregado aqui. Um arquivo que ainda não existe fica de fora (e montar o que precisa dele
// para com mensagem clara); qualquer outro erro dentro dele para na hora.
async function carregar(caminho) {
  const endereco = new URL(caminho, import.meta.url).href;
  try {
    return await import(endereco);
  } catch (erro) {
    if (erro?.code === "ERR_MODULE_NOT_FOUND" && erro.url === endereco) return null;
    throw erro;
  }
}

const [modulosDasPartes, moduloDaBio, moduloDasPaginas, moduloDosNomes] = await Promise.all([
  Promise.all(PARTES.map((nome) => carregar(`./partes/${nome}.mjs`))),
  carregar("./bio.mjs"),
  carregar("./paginas.mjs"),
  carregar("./arquivos.mjs"),
]);

const partes = Object.fromEntries(PARTES.map((nome, k) => [nome, modulosDasPartes[k]?.default]));
const desenharBio = moduloDaBio?.montarBio ?? moduloDaBio?.default;
const desenharOutrasPaginas = moduloDasPaginas?.montarOutrasPaginas ?? moduloDasPaginas?.default;
const NOMES = moduloDosNomes?.default ?? {};

// O que ainda falta no molde ("partes/topo.mjs", "bio.mjs", ...). Vazio = molde completo.
export function oQueFalta() {
  const falta = PARTES.filter((nome) => typeof partes[nome] !== "function").map((nome) => `partes/${nome}.mjs`);
  if (typeof desenharBio !== "function") falta.push("bio.mjs");
  if (typeof desenharOutrasPaginas !== "function") falta.push("paginas.mjs");
  return falta;
}

function exigir(...arquivos) {
  const falta = oQueFalta().filter((a) => arquivos.includes(a));
  if (falta.length) throw new Error(`molde: ainda falta ${falta.map((a) => `molde/${a}`).join(", ")}`);
}

function contexto(opcoes = {}) {
  const { nivel = 2, agora, previa = false, foco = "", nomes = NOMES, urlDaPrevia = null, url = null } = opcoes;
  return criarContexto({
    nivel,
    agora: agora instanceof Date || agora === undefined ? agora : new Date(agora),
    previa: Boolean(previa),
    foco: String(foco ?? ""),
    nomes,
    urlDaPrevia: urlDaPrevia ?? (typeof url === "function" ? url : null),
  });
}

// O Pix e as parcelas escritos na página vêm do marca.json, e as contas (contas.mjs) são de 5% e 3x: os dois têm de
// bater em toda página, mesmo com todas as telas de produto escondidas (senão, um texto diz uma coisa e o preço, outra).
// Na prévia, uma parte com dado incompleto vira aviso no lugar dela; sem a cabeça ou o fim da página (o rodapé, com os
// programas), a página inteira é o aviso.
const ESTRUTURA = ["cabeca", "rodape"];

function paginaInicial(dados, ctx) {
  exigir(...PARTES.map((nome) => `partes/${nome}.mjs`));
  if (!ctx.previa) {
    condicoes(dados.marca);
    return PARTES.map((nome) => String(partes[nome](dados, ctx))).join("");
  }
  try {
    condicoes(dados?.marca);
    return PARTES.map((nome) => String(ESTRUTURA.includes(nome) ? partes[nome](dados, ctx)
      : naPrevia(ctx, `a parte "${nome}"`, () => partes[nome](dados, ctx)))).join("");
  } catch (erro) {
    return paginaDeAviso(erro);
  }
}

function bio(dados, ctx) {
  exigir("bio.mjs");
  if (!ctx.previa) {
    condicoes(dados.marca);
    return String(desenharBio(dados, ctx));
  }
  try {
    condicoes(dados?.marca);
    return String(desenharBio(dados, ctx));
  } catch (erro) {
    return paginaDeAviso(erro);
  }
}

// A página inicial inteira (o HTML, como texto).
export function montarPagina(dados, opcoes) {
  return paginaInicial(dados, contexto(opcoes));
}

// A /bio inteira (o HTML, como texto).
export function montarBio(dados, opcoes) {
  return bio(dados, contexto(opcoes));
}

// Todos os arquivos que o molde escreve: { "index.html": "...", "bio/index.html": "...", "produto/x/index.html": ... }.
// Os programas, o estilo, as fotos e os vídeos não passam pelo molde: o montador copia.
export function montarSite(dados, opcoes) {
  if (opcoes?.previa) throw new Error("molde: o site inteiro nunca sai no modo prévia (só a página e a /bio do painel)");
  const ctx = contexto(opcoes);
  exigir("paginas.mjs");
  const site = { "index.html": paginaInicial(dados, ctx), "bio/index.html": bio(dados, ctx) };
  for (const [caminho, conteudo] of Object.entries(desenharOutrasPaginas(dados, ctx))) {
    if (caminho in site) throw new Error(`molde: a página ${caminho} saiu duas vezes`);
    site[caminho] = String(conteudo);
  }
  return site;
}
