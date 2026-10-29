// "Dúvidas frequentes" da página inicial: as dúvidas do faq.json com "inicial", 7 à vista e o resto no "Ver mais
// perguntas" (o mesmo arquivo da tela Dúvidas), e a chamada do WhatsApp.
import { h } from "../../html.mjs";
import { cabecalho, chamadaDoWhatsapp, dadosDe, pergunta } from "./comum.mjs";
import { DUVIDAS_A_VISTA as A_VISTA, marcado } from "../moldura/previa.mjs";

// Na prévia do painel, as dúvidas à vista levam a marca "faq" (as do "Ver mais", fechadas, ficam marcadas na tela
// Dúvidas, que a prévia abre).
export default function duvidas(dados, ctx) {
  const d = dadosDe(dados, "inicial").duvidas;
  const lista = Object.entries(dadosDe(dados, "faq")).filter(([, p]) => p.inicial)
    .map(([chave, p], n) => (n < A_VISTA ? marcado(pergunta(dados, p), ctx, "faq", chave) : pergunta(dados, p)));
  const mais = lista.slice(A_VISTA);
  return h`<section id="duvidas">
<div class="wrap" style="max-width:820px">
${cabecalho(d)}
${lista.slice(0, A_VISTA)}${mais.length ? h`<div class="q-more" id="q-more">${mais}</div><button type="button" class="btn ghost q-more-b" id="q-more-b" aria-expanded="false">Ver mais perguntas</button>` : ""}
${chamadaDoWhatsapp(dados)}
</div>
</section>

`;
}
