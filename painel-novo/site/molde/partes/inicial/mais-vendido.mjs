// "O mais vendido": o cartão do kit escolhido no inicial.json (nome, foto, itens e preços do kits.json, pelas contas).
// Fica sempre ligada: os botões de toda a página e de cada tela de produto levam para cá.
import { h } from "../../html.mjs";
import { cabecalho, cartaoDeKit, dadosDe } from "./comum.mjs";

export default function maisVendido(dados, ctx) {
  const d = dadosDe(dados, "inicial")["mais-vendido"];
  return h`<section id="mais-vendido">
<div class="wrap">
${cabecalho(d)}
${cartaoDeKit(dados, ctx, d.cartao, true)}
</div>
</section>

`;
}
