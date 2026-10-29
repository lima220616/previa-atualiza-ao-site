// Brinde: o produto do brinde (marca.json, com o nome da tela e a foto do kit dela) e o valor do marca.json.
// A barra e a sacola são do programa da página (parte fixa). Fica sempre ligada: a sacola do topo leva para cá. O botão
// do fim leva para o Combo e some junto com ele.
import { h } from "../../html.mjs";
import { formatarReais } from "../../contas.mjs";
import { arquivo, botaoFinal, brindeDaLoja, dadosDe, ligada, reaisRedondo } from "./comum.mjs";
import { kitsDoCombo } from "./combo.mjs";

export default function brinde(dados, ctx) {
  const d = dadosDe(dados, "inicial").brinde;
  const c = dados.marca.condicoes;
  const { nome, kit } = brindeDaLoja(dados);
  const valor = c["brinde-acima"];
  return h`<section id="brinde">
<div class="wrap">
<div class="gift">
<img src="${arquivo(ctx, kit.foto)}" alt="${nome}">
<div style="flex:1">
<span class="eyebrow">${d.chamada}</span><h2 style="font-size:28px">Compras acima de ${reaisRedondo(valor)} ganham o ${nome}</h2>
<p style="color:var(--texto2);margin-top:8px">${d.texto}</p>
<div class="bf" id="brinde-falta"><span class="bf-r">Falta para o seu brinde</span><strong class="bf-v">${formatarReais(valor)}</strong></div><div class="bar" id="brinde-bar" role="progressbar" aria-label="Progresso até o brinde" aria-valuemin="0" aria-valuemax="${String(valor)}" aria-valuenow="0" aria-valuetext="R$ 0,00 de ${formatarReais(valor)}"><i></i></div><div class="bs"><span id="brinde-sacola">Sua sacola está vazia</span><span>Brinde: ${reaisRedondo(valor)}</span></div><ul class="bi-l" id="brinde-itens" aria-label="Produtos na sacola" hidden></ul><a class="btn buy big" id="sacola-fim" href="#" hidden>Finalizar compra</a><p class="brinde-msg" id="sacola-cupom" hidden></p><p class="brinde-msg" id="brinde-msg">Acima de ${reaisRedondo(c["frete-gratis-acima"])} o frete é grátis.</p>
</div>
</div>
${ligada(dados, "combo") && kitsDoCombo(dados).length ? h`${botaoFinal(d.botao, "#combo")}
` : ""}</div>
</section>

`;
}
