// Escolha do kit (as opções com os data-* que o programa da página lê; a compra vai pelo data-kit, a chave do
// kits.json), a galeria do Gloss, o % OFF da foto e a
// caixa de preço. Todo preço sai das contas a partir de dados/kits.json; data-price e data-sep saem do kits.json
// como estão (o 1354.1999999999998 continua igual).
import { h } from "../../html.mjs";
import { descontoPorcento } from "../../contas.mjs";
import { arquivo, kitDe, kitVisivel, precosDoKit, seloDaOpcao, reaisRedondo, condicoes } from "./comum.mjs";
import { marca as marcaDoPainel, telaDoKit } from "../moldura/previa.mjs";
import { textoDaFoto } from "../moldura/texto-alternativo.mjs";

// Espaço entre value="N" e data-label: o normal é "  " (ou " checked "). A tela do Gloss guarda em "espelho" os
// números e os espaços que sobraram das trocas da prévia; só estes formatos são aceitos.
const ESPACOS = new Map([["", h``], [" ", h` `], ["  ", h`  `], [" checked ", h` checked `], ["  checked ", h`  checked `]]);

// As opções que aparecem, na ordem da tela, cada uma com o número (value) e o espaço de hoje.
export function opcoesDaTela(dados, chave, marcado) {
  const p = dados.produtos[chave];
  const espelho = p.espelho && p.espelho.valores?.length === p.opcoes.length && p.espelho.espacos?.length === p.opcoes.length ? p.espelho : null;
  const lista = [];
  p.opcoes.forEach((k, i) => {
    kitDe(dados, k, `produtos.json, "${chave}"`);
    if (!kitVisivel(dados, k)) return;
    const normal = k === marcado ? " checked " : "  ";
    const doEspelho = espelho?.espacos[i];
    const espaco = doEspelho !== undefined && doEspelho.includes("checked") === (k === marcado) ? doEspelho : normal;
    if (!ESPACOS.has(espaco)) throw new Error(`produtos.json, "${chave}": espaço estranho no espelho das opções`);
    lista.push({ kit: k, indice: i, valor: espelho ? espelho.valores[i] : lista.length, espaco: ESPACOS.get(espaco) });
  });
  // Sem o espelho, o número é a posição entre as que aparecem.
  if (!espelho) lista.forEach((o, n) => { o.valor = n; });
  return lista;
}

function opcao(dados, ctx, chave, p, o) {
  const kit = dados.kits[o.kit];
  const t = precosDoKit(kit);
  const selo = seloDaOpcao(dados, p, o.kit);
  const de = kit["preco-de"] ? h`<span class="off">${t.off}</span><s>${t.de}</s>` : null;
  // Na prévia do painel, a marca do kit fica só na tela dele (a que a prévia abre com o foco no kit).
  const doPainel = ctx.previa && telaDoKit(dados, o.kit) === chave ? marcaDoPainel(ctx, "kits", o.kit) : null;
  return h`<label class="vo"${doPainel}><input type="radio" name="v-${chave}" value="${o.valor}"${o.espaco}data-label="${kit.nome}" data-price="${kit.preco}" data-img="${o.kit}" data-items="${kit.itens.join("|")}" data-sep="${kit["preco-de"] ?? 0}" data-kit="${o.kit}"><img src="${arquivo(ctx, kit.foto)}" alt="${textoDaFoto(dados, kit.nome)}"><span class="vo-t"><b>${kit.nome}</b><small>${kit.rendimento}</small>${selo ? h`<span class="vb">${selo}</span>` : null}</span><span class="vo-p">${de}<b>${t.por}</b><small class="pixs">${t.pix} Pix</small></span></label>`;
}

// Onde começa cada grupo ("Frasco de 300 ml") e o "ver mais": pela posição do kit "desde" na lista completa.
function posicao(p, k) {
  const i = p.opcoes.indexOf(k);
  return i < 0 ? Infinity : i;
}

export function escolhaDoKit(dados, ctx, chave, opcoes) {
  const p = dados.produtos[chave];
  if (opcoes.length === 1) return h`<div class="vos" hidden>${opcao(dados, ctx, chave, p, opcoes[0])}</div>`;
  const grupos = (p.grupos ?? []).map((g) => ({ ...g, de: posicao(p, g.desde) })).sort((a, b) => a.de - b.de);
  const inicioDoMais = p["ver-mais"] ? posicao(p, p["ver-mais"].desde) : Infinity;
  const antes = opcoes.filter((o) => o.indice < inicioDoMais);
  const mais = opcoes.filter((o) => o.indice >= inicioDoMais);
  const vistos = new Set();
  const itens = antes.map((o) => {
    const g = grupos.filter((x) => x.de <= o.indice).pop();
    const cabeca = g && !vistos.has(g) ? (vistos.add(g), h`<p class="vg-t"><b>${g.titulo}</b><span>${g.subtitulo}</span></p>`) : null;
    return h`${cabeca}${opcao(dados, ctx, chave, p, o)}`;
  });
  const rotulo = mais.length ? `Ver mais ${mais.length} ${p["ver-mais"].texto}` : "";
  // O "ver mais" usa o id gm-mais, que o estilo de hoje conhece.
  const verMais = mais.length
    ? h`<div id="gm-mais">${mais.map((o) => opcao(dados, ctx, chave, p, o))}</div><button type="button" class="btn ghost more-b" data-more="gm-mais" data-label="${rotulo}" aria-expanded="false">${rotulo}</button>`
    : null;
  return h`<div class="pp-sec" style="margin-top:20px"><div class="vh"><h3>${p["titulo-das-opcoes"]}</h3><span>${opcoes.length} opções</span></div><div class="vos">${itens}${verMais}</div></div>`;
}

// "ATÉ 19% OFF" na foto: o maior desconto entre as opções à vista (as do "ver mais" ficam de fora); com uma opção
// só, sem o "ATÉ". Nenhuma opção com preço "de": nada.
export function descontoDaFoto(dados, chave, opcoes) {
  const p = dados.produtos[chave];
  const inicioDoMais = p["ver-mais"] ? posicao(p, p["ver-mais"].desde) : Infinity;
  const descontos = opcoes.filter((o) => o.indice < inicioDoMais).map((o) => dados.kits[o.kit])
    .filter((k) => k["preco-de"]).map((k) => descontoPorcento(k["preco-de"], k.preco));
  if (!descontos.length) return null;
  return h`<span class="offtag pp-off">${opcoes.length > 1 ? "ATÉ " : ""}${Math.max(...descontos)}% OFF</span>`;
}

// A galeria 1 L / 300 ml (só a tela do Gloss tem): uma foto por kit que aparece.
export function galeria(dados, ctx, chave) {
  const g = dados.produtos[chave].galeria;
  const fotos = (g?.fotos ?? []).filter((f) => kitDe(dados, f.kit, `produtos.json, "${chave}" (galeria)`) && kitVisivel(dados, f.kit));
  if (!fotos.length) return null;
  return {
    primeira: dados.kits[fotos[0].kit],
    html: h`<div class="gcar" id="gcar" aria-label="${g.rotulo}">${fotos.map((f) => h`<div class="gcar-s" data-l="${dados.kits[f.kit].nome}" data-kit="${f.kit}"><img src="${arquivo(ctx, dados.kits[f.kit].foto)}" alt="${dados.kits[f.kit].nome}"><span class="gcar-l">${f.legenda}</span></div>`)}</div><div class="gcar-d" id="gcar-d">${fotos.map((f, n) => h`<button type="button"${n === 0 ? h` class="on"` : null} aria-label="${f["nome-do-botao"]}">${f.botao}</button>`)}</div><p class="gcar-h">Arraste para o lado para trocar o tamanho</p>`,
  };
}

// Caixa de preço do kit principal (o programa da página troca quando a cliente escolhe outra opção).
export function caixaDePreco(dados, kit) {
  const c = condicoes(dados.marca);
  const t = precosDoKit(kit);
  const de = kit["preco-de"] ? h`De <s>${t.de}</s> <span class="off">${t.off}</span> <span class="econ">Economize ${t.econ}</span>` : null;
  return h`<div class="pbox"><span class="pb-sep">${de}</span><span class="pb-v">${t.por}</span><span class="pb-pix">${t.pix} no Pix (${c["pix-porcento"]}% OFF)</span><span class="pb-parc">ou ${c.parcelas}x de ${t["3x"]} sem juros</span><span class="pb-frete"><svg class="i" style="width:20px;height:20px"><use href="#i-truck"/></svg>Frete grátis acima de ${reaisRedondo(c["frete-gratis-acima"])} · brinde acima de ${reaisRedondo(c["brinde-acima"])}</span></div>`;
}
