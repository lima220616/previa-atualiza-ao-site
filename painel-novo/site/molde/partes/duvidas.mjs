// Tela Dúvidas (#p-duvidas): todas as dúvidas do faq.json (o mesmo arquivo da seção da página inicial) e a chamada
// do WhatsApp. Os textos da tela são parte fixa.
import { h } from "../html.mjs";
import { chamadaDoWhatsapp, dadosDe, pergunta } from "./inicial/comum.mjs";
import { duvidaAVistaNaInicial, marcado } from "./moldura/previa.mjs";

// Na prévia do painel, a marca "faq" fica aqui nas dúvidas que não estão à vista na página inicial.
export default function duvidas(dados, ctx) {
  const lista = Object.entries(dadosDe(dados, "faq"))
    .map(([chave, p]) => (ctx?.previa && !duvidaAVistaNaInicial(dados, chave) ? marcado(pergunta(dados, p), ctx, "faq", chave) : pergunta(dados, p)));
  return h`<section class="view" id="p-duvidas" hidden><div class="wrap" style="max-width:820px">
<nav class="crumbs"><a href="#inicio">Início</a> › <span>Dúvidas frequentes</span></nav>
<div class="sec-head" style="margin-top:12px"><span class="eyebrow">Dúvidas</span><h2 class="t1" style="font-size:clamp(32px,5vw,46px);margin:0">Dúvidas frequentes</h2><p>Tudo o que as clientes costumam perguntar sobre o Gloss, os kits, a aplicação e a compra.</p></div>
${lista}
${chamadaDoWhatsapp(dados)}

</div></section>
`;
}
