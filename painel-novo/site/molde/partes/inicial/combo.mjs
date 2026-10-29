// Combo Transformação: os kits do combo (inicial.json, com o rótulo de cada tamanho), com nome, foto e preços do
// kits.json pelas contas, e o brinde do marca.json. A frase da economia é parte fixa, com os preços de cada kit. O nome
// de cada item é o da tela do produto (produtos.json).
import { h } from "../../html.mjs";
import { textosDoPreco } from "../../contas.mjs";
import { arquivo, botaoDeCompra, brindeDaLoja, dadosDe, kitDe, pedaco, reaisRedondo } from "./comum.mjs";

// Os kits do combo que estão visíveis no kits.json. Sem nenhum, a seção some sozinha (e o botão do brinde também).
// A tela de cada kit do combo (a do produtos.json com esse kit).
function telaDoCombo(dados, chave) {
  return Object.keys(dados.produtos ?? {}).find((t) => dados.produtos[t].kit === chave) ?? null;
}

export function kitsDoCombo(dados) {
  return dadosDe(dados, "inicial").combo.kits.map((k) => ({ ...k, kit: kitDe(dados, k.kit), chave: k.kit }))
    .filter((k) => k.kit.visivel !== false);
}

function nomeDaTela(dados, tela) {
  const nome = dados.produtos?.[tela]?.nome;
  if (!nome) throw new Error(`inicial.json (combo): a tela "${tela}" não existe no produtos.json`);
  return nome;
}

export default function combo(dados, ctx) {
  const d = dadosDe(dados, "inicial").combo;
  const c = dados.marca.condicoes;
  const kits = kitsDoCombo(dados);
  if (!kits.length) return "";
  const precos = kits.map((k) => textosDoPreco(k.kit["preco-de"], k.kit.preco));
  const economia = kits.map((k, i) => (i === 0
    ? h`o de ${k.rotulo} por <b>${precos[i].por}</b> (separados, sairiam por ${precos[i].de})`
    : h` ou o de ${k.rotulo} por <b>${precos[i].por}</b> (separados, ${precos[i].de})`));
  return h`<section id="combo">
<div class="wrap">
<div class="combo">
<div class="img ccar-w"><div class="ccar" id="ccar">${kits.map((k, i) => h`<figure class="ccar-s"><img src="${arquivo(ctx, k.kit.foto)}" alt="${k.kit.nome}"><figcaption>Combo ${k.rotulo} · ${precos[i].por}</figcaption></figure>`)}</div><div class="ccar-d" id="ccar-d">${kits.map((k, i) => (i === 0 ? h`<button type="button" class="on">${k.rotulo}</button>` : h`<button type="button">${k.rotulo}</button>`))}</div></div>
<div class="txt">
<span class="eyebrow">${d.chamada}</span><h2>${d.titulo}</h2>
<p>${d.texto}</p>
<ul>
${d.itens.map((item) => h`<li><svg class="i"><use href="#i-${pedaco(item.icone, "ícone do combo")}"/></svg><span><b>${nomeDaTela(dados, item.tela)}:</b> ${item.texto}</span></li>
`)}</ul>
<div class="save">Leve mais e pague menos. No combo, você leva ${economia}. E nessa compra você já garante o brinde do ${brindeDaLoja(dados).nome}, que é só para compras acima de ${reaisRedondo(c["brinde-acima"])}.</div>
<div style="display:flex;flex-wrap:wrap;gap:10px">${kits.map((k) => botaoDeCompra(dados, k.kit, k.chave, h`Quero o combo ${k.rotulo}`, telaDoCombo(dados, k.chave)))}</div>
</div>
</div>
</div>
</section>

`;
}
