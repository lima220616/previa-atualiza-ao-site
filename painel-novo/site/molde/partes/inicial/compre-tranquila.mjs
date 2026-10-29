// "Compre tranquila" (parte fixa do molde, pelo atalho da especificação, ajuste 15): os 5 compromissos, idênticos
// ao site de hoje; o Pix e as parcelas vêm das condições do marca.json (as mesmas da faixa e do rodapé). Fica sempre
// ligada: o link #garantia do rodapé e do menu aponta para o título dela.
import { h } from "../../html.mjs";
import { linkDeCompra } from "./comum.mjs";

export default function compreTranquila(dados) {
  const c = dados.marca.condicoes;
  return h`<section id="compre-tranquila">
<div class="wrap" style="max-width:820px">
<div class="sec-head" style="text-align:center;margin-left:auto;margin-right:auto"><span class="eyebrow" id="garantia">Compre tranquila</span><h2>Compra segura e garantida</h2></div>
<div class="ctq">
<div><span class="ib"><svg class="i"><use href="#i-heart"/></svg></span><p><b>7 dias para desistir</b>Recebeu e se arrependeu? Você tem 7 dias após a entrega para pedir a devolução, sem custo, conforme a nossa política de trocas.</p></div>
<div><span class="ib"><svg class="i"><use href="#i-shield"/></svg></span><p><b>Compra segura</b>Pagamento protegido. Pague com Pix (${String(c["pix-porcento"])}% OFF) ou cartão em até ${String(c["parcelas-cartao"])}x, sendo ${String(c.parcelas)}x sem juros.</p></div>
<div><span class="ib"><svg class="i"><use href="#i-truck"/></svg></span><p><b>Envio rápido e rastreado</b>Postagem em até 24 horas depois da confirmação do pagamento, com o código de rastreio no seu WhatsApp.</p></div>
<div><span class="ib"><svg class="i"><use href="#i-chat"/></svg></span><p><b>Suporte de verdade</b>Dúvida antes ou depois da compra, inclusive na hora de aplicar? Fale com a gente no WhatsApp.</p></div><div class="ctq-g"><span class="ib"><svg class="i"><use href="#i-shield"/></svg></span><p><b>Garantia de satisfação</b>Se usar do jeito certo e não tiver o resultado esperado, você tem até 30 dias para pedir a devolução e o reembolso, após análise da equipe.</p></div>
<div class="sec-cta"><a class="btn buy" href="${linkDeCompra(dados)}">Quero meu liso</a></div>
</div>
</div>
</section>



`;
}
