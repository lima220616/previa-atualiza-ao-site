// A página inicial (main#home): as 18 seções na ordem fixa do Brand Book, cada uma numa função em partes/inicial/.
// As que o painel pode desligar (secoes.json) somem inteiras quando desligadas, e os links da inicial para elas também
// (o "Qual kit é pra mim?" da abertura e o "Quero ganhar o brinde", que leva para o Combo).
import { h } from "../html.mjs";
import { ligada, PODEM_DESLIGAR } from "./inicial/comum.mjs";
import { marcado, naPrevia } from "./moldura/previa.mjs";
import abertura from "./inicial/abertura.mjs";
import depoimentos from "./inicial/depoimentos.mjs";
import maisVendido from "./inicial/mais-vendido.mjs";
import identifica from "./inicial/identifica.mjs";
import resultados from "./inicial/resultados.mjs";
import qualKit from "./inicial/qual-kit.mjs";
import combo from "./inicial/combo.mjs";
import reels from "./inicial/reels.mjs";
import comoFunciona from "./inicial/como-funciona.mjs";
import avaliacoes from "./inicial/avaliacoes.mjs";
import diferenciais from "./inicial/diferenciais.mjs";
import comparativo from "./inicial/comparativo.mjs";
import profissionais from "./inicial/profissionais.mjs";
import brinde from "./inicial/brinde.mjs";
import comunidade from "./inicial/comunidade.mjs";
import receberWhatsapp from "./inicial/receber-whatsapp.mjs";
import duvidas from "./inicial/duvidas.mjs";
import compreTranquila from "./inicial/compre-tranquila.mjs";

// [id da seção de hoje, função]. A abertura não tem id (fica sempre).
export const SECOES = [
  ["abertura", abertura], ["depoimentos", depoimentos], ["mais-vendido", maisVendido], ["identifica", identifica],
  ["resultados", resultados], ["qual-kit", qualKit], ["combo", combo], ["reels", reels], ["como-funciona", comoFunciona],
  ["avaliacoes", avaliacoes], ["diferenciais", diferenciais], ["comparativo", comparativo], ["profissionais", profissionais],
  ["brinde", brinde], ["comunidade", comunidade], ["receber-whatsapp", receberWhatsapp], ["duvidas", duvidas],
  ["compre-tranquila", compreTranquila],
];

// Na prévia do painel, as seções que ligam e desligam levam a marca "secoes" e uma seção com dado incompleto vira um
// aviso no lugar dela (sem a prévia, o erro para a montagem).
function secao(dados, ctx, id, desenhar) {
  return naPrevia(ctx, `a seção "${id}"`, () => (PODEM_DESLIGAR.includes(id) ? marcado(desenhar(dados, ctx), ctx, "secoes", id) : desenhar(dados, ctx)));
}

export default function inicial(dados, ctx) {
  return h`<main id="home">
${SECOES.map(([id, desenhar]) => (ligada(dados, id) ? secao(dados, ctx, id, desenhar) : ""))}</main>
`;
}
