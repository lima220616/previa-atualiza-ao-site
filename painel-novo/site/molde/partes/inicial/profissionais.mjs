// "Para cabeleireiras": os cartões dos kits do salão (inicial.json; nome, foto e preços do kits.json pelas contas) e
// os depoimentos de profissionais (destaques.json, ligados ao avaliacoes.json).
import { h } from "../../html.mjs";
import { cabecalho, cartaoDeAvaliacao, cartaoDeKit, cartoesLigados, dadosDe, fotosDaInicial } from "./comum.mjs";

export default function profissionais(dados, ctx) {
  const d = dadosDe(dados, "inicial").profissionais;
  const kits = d.cartoes.map((c) => cartaoDeKit(dados, ctx, c)).filter((c) => String(c));
  const fotos = fotosDaInicial(dados);
  const cartoes = cartoesLigados(dados, dadosDe(dados, "destaques").profissionais);
  return h`<section id="profissionais">
<div class="wrap">
${cabecalho(d)}
<div class="cards pcards" id="pcards">
${kits.map((k) => h`${k}
`)}</div><div class="pc-d" id="pc-d">${kits.map((k, i) => (i === 0
    ? h`<button type="button" class=on aria-label="Kit 1"></button>`
    : h`<button type="button" aria-label="Kit ${String(i + 1)}"></button>`))}</div><p class="pc-h">Arraste para o lado para ver os outros kits</p>
<div class="prof-rv"><div class="av-h"><div><span class="eyebrow">${d["depoimentos-chamada"]}</span><h3>${d["depoimentos-titulo"]}</h3></div><div class="av-arr"><button type="button" class="av-a" data-row="row-s2" data-dir="-1" aria-label="Voltar">‹</button><button type="button" class="av-a" data-row="row-s2" data-dir="1" aria-label="Avançar">›</button></div></div>
<div class="av-row av-cards" id="row-s2">${cartoes.map((c) => cartaoDeAvaliacao(ctx, c, fotos, true))}</div>
<a class="btn ghost" href="#p-avaliacoes" style="margin-top:16px">Ver todas as avaliações</a></div>
</div>
</section>

`;
}
