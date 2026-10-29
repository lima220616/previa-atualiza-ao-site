// "Qual kit é pra mim?": as 3 perguntas do quiz.json. A chave de cada opção é o valor que o programa da página lê
// (casa/salao, medio/longo, gloss/kit/combo): não pode mudar. Os 6 resultados (quiz.json, "resultados") vão para o
// programa da página pelo bloco de dados (moldura/dados-do-site.mjs). A parte do resultado é fixa.
import { h } from "../../html.mjs";
import { cabecalho, dadosDe, pedaco } from "./comum.mjs";

function pergunta(p, n) {
  const opcoes = Object.entries(p.opcoes);
  const botoes = opcoes.map(([valor, o]) => h`<button type="button" class="qo2" data-q="${String(n)}" data-v="${pedaco(valor, "opção do quiz")}"><span class="ib"><svg class="i"><use href="#i-${pedaco(o.icone, "ícone do quiz")}"/></svg></span>${o.texto}</button>`);
  const caixa = opcoes.length === 3 ? h`<div class="qz-o qz-o3">${botoes}</div>` : h`<div class="qz-o">${botoes}</div>`;
  return n === 1
    ? h`<div class="qz-s" data-s="1"><h3>${p.titulo}</h3>${caixa}</div>
`
    : h`<div class="qz-s" data-s="${String(n)}" hidden><h3>${p.titulo}</h3>${caixa}</div>
`;
}

export default function qualKit(dados) {
  const d = dadosDe(dados, "inicial")["qual-kit"];
  const perguntas = Object.entries(dadosDe(dados, "quiz")).filter(([k]) => /^pergunta-\d+$/.test(k)).map(([, p]) => p);
  return h`<section id="qual-kit">
<div class="wrap">
${cabecalho(d, true)}
<div class="qz" id="qz">
<div class="qz-top"><span id="qz-step">Pergunta 1 de 3</span><div class="qz-bar"><i id="qz-fill" style="width:33%"></i></div></div>
${perguntas.map((p, k) => pergunta(p, k + 1))}<div class="qz-r" id="qz-r" hidden aria-live="polite"><img id="qz-img" alt="O kit indicado para você"><div><span class="eyebrow" style="margin:0">O seu kit ideal</span><h3 id="qz-name"></h3><span class="yield" id="qz-yield"></span><p id="qz-why"></p><div class="qz-act"><a class="btn buy" id="qz-buy" href="#">Ver o meu kit</a><button type="button" class="qz-again" id="qz-again">Refazer</button></div></div></div>
<button type="button" class="qz-back" id="qz-back" hidden>‹ Voltar</button>
</div>
</div>
</section>

`;
}
