// Ajudas das telas de produto: texto com link, os kits que aparecem, preço pelas contas e as condições do marca.json.
// Endereço de foto e vídeo, WhatsApp, valor redondo, tela visível e o cupom da campanha são os da moldura (os mesmos
// do topo e do rodapé). Funções puras (Node e navegador).
import { h } from "../../html.mjs";
import { textosDoPreco } from "../../contas.mjs";
import { arquivo, cupomDaCampanha, linkDoWhatsapp, nomeDoProduto, paginaVisivel, reaisRedondo } from "../moldura/comum.mjs";

export { arquivo, cupomDaCampanha, linkDoWhatsapp, nomeDoProduto, reaisRedondo };

// Texto dos dados com link escrito como [rótulo](#p-chave) (outra tela) ou [rótulo](protocolo) (o protocolo de
// tratamento, que fica na tela do Gloss Matizado e o programa da página rola até ele). O resto sai como texto.
// Tela escondida no painel: o rótulo fica, sem o link.
export function comLinks(dados, texto) {
  const s = String(texto ?? "");
  const pedacos = [];
  const regra = /\[([^\]]+)\]\((#p-[a-z0-9-]+|protocolo)\)/g;
  let desde = 0;
  for (const m of s.matchAll(regra)) {
    pedacos.push(s.slice(desde, m.index));
    const tela = m[2] === "protocolo" ? "gloss" : m[2].slice(3);
    if (!paginaVisivel(dados, tela)) pedacos.push(m[1]);
    else pedacos.push(m[2] === "protocolo" ? h`<a href="#p-gloss" data-goto-proto>${m[1]}</a>` : h`<a href="${m[2]}">${m[1]}</a>`);
    desde = m.index + m[0].length;
  }
  pedacos.push(s.slice(desde));
  return h`${pedacos}`;
}

// O kit pela chave; chave que não existe em kits.json para a montagem (erro nos dados).
export function kitDe(dados, chave, onde) {
  const kit = dados.kits?.[chave];
  if (!kit) throw new Error(`${onde}: o kit "${chave}" não existe em kits.json`);
  return kit;
}

export const kitVisivel = (dados, chave) => dados.kits?.[chave]?.visivel !== false;
export const telaVisivel = (dados, chave) => Boolean(dados.produtos?.[chave]) && paginaVisivel(dados, chave);

// O kit principal da tela (o da caixa de preço, dos botões e da barra fixa). Escondido no painel: vale a primeira
// opção que aparece. Sem nenhuma opção visível, a tela não tem o que vender: null.
export function kitPrincipal(dados, chave) {
  const p = dados.produtos[chave];
  const visiveis = p.opcoes.filter((k) => kitDe(dados, k, `produtos.json, "${chave}"`) && kitVisivel(dados, k));
  if (!visiveis.length) return null;
  return visiveis.includes(p.kit) ? p.kit : visiveis[0];
}

// O selo de uma opção: o do painel (kits.json "selo"); senão o desta tela; senão o de sempre do kit.
export function seloDaOpcao(dados, p, chave) {
  const kit = dados.kits[chave];
  return kit.selo || (p["selos-das-opcoes"] ?? {})[chave] || kit["selo-da-opcao"] || "";
}

// As contas de hoje são 5% no Pix e 3x sem juros (molde/contas.mjs). Se o marca.json mudar, as contas precisam mudar
// junto: a montagem para em vez de mostrar um número e fazer outra conta.
export function condicoes(marca) {
  const c = marca?.condicoes ?? {};
  if (c["pix-porcento"] !== 5 || c.parcelas !== 3) {
    throw new Error("marca.json: as contas do preço são de 5% no Pix e 3x sem juros; mude molde/contas.mjs junto");
  }
  return c;
}

// Textos do preço de um kit: por, Pix, 3x e, com o preço "de" (a soma dos itens separados), de, % OFF e economia.
export const precosDoKit = (kit) => textosDoPreco(kit["preco-de"], kit.preco);
