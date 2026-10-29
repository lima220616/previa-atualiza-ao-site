// Uma tela de produto (#p-<chave>), com os blocos que ela tem nos dados, na ordem do site de hoje. Bloco sem dado
// não aparece. Preço pelas contas a partir de dados/kits.json; WhatsApp, cupons, frete e brinde do marca.json.
import { h } from "../../html.mjs";
import { formatarReais } from "../../contas.mjs";
import { arquivo, comLinks, condicoes, cupomDaCampanha, kitDe, kitPrincipal, kitVisivel, linkDoWhatsapp, nomeDoProduto, telaVisivel,
  seloDaOpcao, precosDoKit } from "./comum.mjs";
import { opcoesDaTela, escolhaDoKit, descontoDaFoto, galeria, caixaDePreco } from "./opcoes.mjs";
import { grupoDaTela, notaDoTopo, resultadosReais, oQueDizem } from "./avaliacoes.mjs";
import { CHECK, XIS, VISTO_PQ, ALERTA, DOR, PLAY, WHATS, SELOS, PROTOCOLO, compreTranquila } from "./fixos.mjs";
import { marca as marcaDoPainel } from "../moldura/previa.mjs";
import { textoDaFoto } from "../moldura/texto-alternativo.mjs";

const NOTA_DE_RODAPE = h`<p class="note">*O resultado varia conforme o tipo de cabelo e a aplicação. **Faça sempre o teste de mecha antes.</p>`;

// Foto principal, selo do topo (o selo da opção do kit principal), % OFF e, na tela do Gloss, a galeria de tamanhos.
function foto(dados, ctx, chave, p, principal, opcoes) {
  const selo = seloDaOpcao(dados, p, principal);
  const g = galeria(dados, ctx, chave);
  const imagem = g ? g.primeira.foto : dados.kits[principal].foto;
  return h`<div class="pp"><div class="pp-img">${selo ? h`<span class="tag">${selo}</span>` : null}${descontoDaFoto(dados, chave, opcoes)}${g?.html ?? null}<img class="main-img"${g ? h` style="display:none"` : null} src="${arquivo(ctx, imagem)}" alt="${p.nome}"></div>`;
}

// Chapéu, nome, nota, chamada, destaques (com a nota de rodapé quando algum tem *), aviso e a contagem do cupom.
function topo(dados, ctx, p, kit, grupo) {
  const cupom = kit["aceita-cupom"] ? cupomDaCampanha(dados, ctx) : null;
  const ondeVale = cupom?.["onde-vale"];
  if (cupom && !ondeVale) throw new Error('marca.json: falta "onde-vale" no cupom da campanha');
  const destaques = (p.destaques ?? []).map((d) => h`<li>${CHECK}<span>${d}</span></li>`);
  const avisos = (p["destaques-aviso"] ?? []).map((d) => h`<li>${XIS}<span>${d}</span></li>`);
  const asterisco = (p.destaques ?? []).some((d) => d.includes("*"));
  const aviso = p.aviso ? h`<div class="need warn"><svg class="i" style="width:22px;height:22px;color:#D93A3A"><use href="#i-help"/></svg><p><b>${p.aviso.titulo}</b> ${comLinks(dados, p.aviso.texto)}</p></div>` : null;
  const contagem = cupom ? h`<div class="pp-urg"><strong><svg class="i" style="width:18px;height:18px"><use href="#i-clock"/></svg>Cupom ${cupom.codigo} (${cupom.porcento}% OFF ${ondeVale}) termina em</strong><div class="mt"><span data-t="d">--</span>d<span data-t="h">--</span>h<span data-t="m">--</span>m<span data-t="s">--</span>s</div></div>` : null;
  return h`<div class="pp-info"><span class="kick">${p.chapeu}</span><h2 class="t1">${p.nome}</h2>${notaDoTopo(grupo)}
<p class="headl">${p.chamada}</p><ul class="chk">${destaques}${avisos}</ul>${asterisco ? NOTA_DE_RODAPE : null}${aviso}${contagem}</div></div>`;
}

function incluso(kit) {
  return h`<div class="incl"><h3>${kit.itens.length > 1 ? "Neste kit:" : "Neste pedido:"}</h3><ul class="incl-l">${kit.itens.map((i) => h`<li>${CHECK}${i}</li>`)}</ul></div>`;
}

function cupomDaPrimeiraCompra(marca) {
  const c = marca.cupons;
  if (!c["primeira-compra"] || !c["primeira-compra-porcento"]) throw new Error("marca.json: falta o cupom da primeira compra ou o % dele");
  return h`<div class="cupom"><svg class="i" style="width:20px;height:20px"><use href="#i-tag"/></svg><span>Primeira compra? Use o cupom <b>${c["primeira-compra"]}</b> na próxima etapa e ganhe ${c["primeira-compra-porcento"]}% OFF.</span></div>`;
}

// Vídeos de resultado do produto (dados/videos-por-produto.json): só os visíveis; sem nenhum, a seção não aparece (na
// prévia do painel, fica só a marca vazia, para o painel achar o lugar quando a pessoa põe o primeiro vídeo).
function videosDoProduto(dados, ctx, chave, p) {
  const videos = (dados["videos-por-produto"]?.[chave]?.videos ?? []).filter((v) => v.visivel === true);
  if (!videos.length) return ctx.previa ? h`<div${marcaDoPainel(ctx, "videos-por-produto", chave)} hidden></div>` : null;
  const produto = nomeDoProduto(dados, chave);
  const cartoes = videos.map((v, n) => h`<div class="pv-c" role="listitem"><video src="${arquivo(ctx, v.arquivo)}"${v.capa ? h` poster="${arquivo(ctx, v.capa)}"` : null} playsinline preload="none" aria-label="${v.titulo || `Vídeo de resultado ${n + 1} do ${produto}`}"></video><button type="button" class="vplay-b" aria-label="Assistir o vídeo de resultado ${n + 1}">${PLAY}</button></div>`);
  return h`<div class="pp-sec pv"${marcaDoPainel(ctx, "videos-por-produto", chave)}><span class="eyebrow">Vídeos</span><h2>Veja o resultado de quem já usa</h2><p class="pv-sub">Toque no vídeo para assistir com som. Arraste para o lado para ver mais.</p><div class="pv-row" role="list" aria-label="Vídeos de resultado do ${produto}">${cartoes}</div><div class="pv-nav"><button type="button" class="res-a pv-a" data-dir="-1" aria-label="Vídeo anterior">‹</button><button type="button" class="res-a pv-a" data-dir="1" aria-label="Próximo vídeo">›</button></div></div>`;
}

// Fotos de resultado do produto (dados/fotos-por-produto.json, postas pela Bruna no painel; pedido da dona de 27/10):
// só as visíveis; sem nenhuma, a seção não aparece (na prévia do painel, fica só a marca vazia, como nos vídeos).
function fotosDoProduto(dados, ctx, chave) {
  const fotos = (dados["fotos-por-produto"]?.[chave]?.fotos ?? []).filter((f) => f.visivel !== false);
  if (!fotos.length) return ctx.previa ? h`<div${marcaDoPainel(ctx, "fotos-por-produto", chave)} hidden></div>` : null;
  const produto = nomeDoProduto(dados, chave);
  const cartoes = fotos.map((f, n) => h`<article class="rr-c"><div class="rr-f"><img src="${arquivo(ctx, f.arquivo)}" alt="${f.tipo === "antes-e-depois" ? "Antes e depois" : "Resultado"} ${String(n + 1)} com o ${produto}" loading="lazy"></div></article>`);
  return h`<div class="pp-sec rr"${marcaDoPainel(ctx, "fotos-por-produto", chave)}><span class="eyebrow">Resultados</span><h2>Fotos de resultado</h2><p class="rr-sub">Fotos de clientes, com autorização.</p><div class="rr-g">${cartoes}</div><p class="rr-nota">Os resultados variam conforme o tipo de cabelo e a aplicação.</p></div>`;
}

function dores(p) {
  if (!p.dores?.length) return null;
  return h`<div class="pp-sec"><span class="eyebrow">Você se identifica?</span><h2>Se alguma dessas já aconteceu com você…</h2><div class="idf">${p.dores.map((d) => h`<div>${DOR}<span>${d}</span></div>`)}</div><p class="dor-end">${p["dores-fim"]}</p></div>`;
}

function solucao(p) {
  if (!p.solucao?.length) return null;
  return h`<div class="pp-sec"><span class="eyebrow">A solução</span><h2>A transformação que você procura</h2>${p.solucao.map((t) => h`<p class="lead">${t}</p>`)}</div>`;
}

function beneficios(p) {
  if (!p.beneficios?.length) return null;
  return h`<div class="pp-sec"><span class="eyebrow">Benefícios</span><h2>Por que escolher ${p.nome}</h2><div class="bens">${p.beneficios.map((b) => h`<div class="ben-c"><span class="bi"><svg class="i" style="width:26px;height:26px"><use href="#i-${b.icone}"/></svg></span><div><b>${b.titulo}</b><span>${b.texto}</span></div></div>`)}</div></div>`;
}

function paraQuem(dados, p) {
  const indicado = (p["para-quem"] ?? []).map((t) => h`<li>${VISTO_PQ}<span>${comLinks(dados, t)}</span></li>`);
  const cuidados = (p.cuidados ?? []).map((t) => h`<li>${ALERTA}<span>${comLinks(dados, t)}</span></li>`);
  if (!indicado.length && !cuidados.length) return null;
  const a = indicado.length ? h`<div class="pq"><h3>${VISTO_PQ}Indicado se você…</h3><ul>${indicado}</ul></div>` : null;
  const b = cuidados.length ? h`<div class="pq"><h3>${ALERTA}Cuidados importantes</h3><ul>${cuidados}</ul></div>` : null;
  return h`<div class="pp-sec"><span class="eyebrow">Para quem é</span><h2>É pra você?</h2>${a}${a && b ? "\n" : null}${b}</div>`;
}

function resultado(p) {
  if (!p.resultado) return null;
  return h`<div class="res-band"><span class="ib" style="background:#fff"><svg class="i" style="width:24px;height:24px"><use href="#i-sparkle"/></svg></span><p><b>Resultado:</b> ${p.resultado}</p></div>`;
}

// Modo de usar: o da tela; com a lista dela vazia e "modo-de-usar-de", o de outra tela (o comum do Gloss Matizado e o
// do Gloss Branco ficam escritos uma vez só).
function modoDeUsar(dados, chave, p) {
  const dono = !p["modo-de-usar"]?.length && p["modo-de-usar-de"] ? dados.produtos[p["modo-de-usar-de"]] : p;
  if (!dono) throw new Error(`produtos.json, "${chave}": o modo de usar aponta para uma tela que não existe`);
  const passos = dono["modo-de-usar"] ?? [];
  if (!passos.length) return null;
  const precisa = dono.precisa ? h`<div class="need"><svg class="i" style="width:22px;height:22px;color:#B84060"><use href="#i-help"/></svg><p><b>O que você vai precisar:</b> ${dono.precisa}</p></div>` : null;
  return h`<div class="pp-sec"><span class="eyebrow">Modo de uso</span><h2>Como aplicar</h2><div class="steps-n">${passos.map((t, n) => h`<div><span class="sn">${n + 1}</span><p>${t}</p></div>`)}</div>${precisa}</div>`;
}

// "No salão" -> "no-salao" (a chave da descrição do vídeo no videos.json, como na página inicial).
const chaveDoTitulo = (titulo) => String(titulo).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Aplicação na prática: os mesmos vídeos da página inicial (videos.json, "na-pratica"); cada tela só diz se mostra.
function naPratica(dados, ctx, p) {
  if (!p["na-pratica"]) return null;
  const pratica = dados.videos?.["na-pratica"];
  if (!pratica) throw new Error('molde: falta "na-pratica" no dados/videos.json (a aplicação na prática das telas de produto)');
  const videos = (pratica.videos ?? []).filter((v) => v.visivel !== false);
  if (!videos.length) return null;
  const figuras = videos.map((v) => {
    const descricao = (pratica.descricoes ?? {})[chaveDoTitulo(v.titulo)] || v.titulo;
    const capa = v.capa ? h` poster="${arquivo(ctx, v.capa)}"` : null;
    return h`<figure class="pa-v"><span class="rl-t">${v.titulo}</span><div class="pa-c vplay"><video src="${arquivo(ctx, v.arquivo)}"${capa} playsinline preload="none" aria-label="${descricao}"></video><button type="button" class="vplay-b" aria-label="Assistir o vídeo ${v.titulo.toLowerCase()}">${PLAY}</button></div></figure>`;
  });
  return h`<div class="pp-sec pa"><div class="pa-box"><span class="eyebrow">Veja na prática</span><h2>Veja a aplicação na prática</h2><p class="pa-sub">O passo a passo real, do Shampoo à prancha.</p><div class="pa-vs">${figuras}</div></div></div>`;
}

// Ficha técnica, com o número da ANVISA só quando estiver confirmado (especificação, item 22).
function ficha(p) {
  if (!p.ficha?.length) return null;
  const anvisa = p.anvisa?.confirmado === true && p.anvisa.numero ? h`<div><dt>ANVISA</dt><dd>${p.anvisa.numero}</dd></div>` : null;
  return h`<div class="pp-sec"><span class="eyebrow">Ficha técnica</span><h2>Especificações técnicas</h2><dl class="spec">${p.ficha.map((f) => h`<div><dt>${f.nome}</dt><dd>${f.valor}</dd></div>`)}${anvisa}</dl></div>`;
}

// Compre junto (avulsos): com o combo da Yampi, o preço dele (separados, economia e Pix, com espaço que não quebra);
// sem combo, a soma dos dois kits e o nome das telas no botão. A compra vai pela chave (data-kit: o combo, ou os dois
// kits ligados por "+"), nunca pelo nome escrito.
function compreJunto(dados, ctx, p) {
  const cj = p["compre-junto"];
  if (!cj?.itens?.length) return null;
  const itens = cj.itens.map((i) => ({ ...i, k: kitDe(dados, i.kit, "produtos.json (compre junto)") }));
  if (itens.some((i) => !telaVisivel(dados, i.pagina) || !kitVisivel(dados, i.kit))) return null;
  const fixo = (s) => String(s).replace(/(\d) (L|ml)\b/g, "$1 $2");
  const semQuebra = (s) => s.replace(/ /g, " ");
  const combo = cj.combo ? kitDe(dados, cj.combo, "produtos.json (compre junto)") : null;
  if (combo && !kitVisivel(dados, cj.combo)) return null;
  const nomes = itens.map((i) => (combo ? fixo(i.k.nome) : dados.produtos[i.pagina].nome));
  const linha = itens.map((i, n) => h`<a href="#p-${i.pagina}"><img src="${arquivo(ctx, i.k.foto)}" alt="${textoDaFoto(dados, i.k.nome)}"><span>${nomes[n]}</span></a>`);
  let preco, nome, valor, chaves;
  if (combo) {
    const t = precosDoKit(combo);
    preco = combo["preco-de"]
      ? h`Juntos: <b>${semQuebra(t.por)}</b> <span>(separados, ${semQuebra(t.de)})</span><br><span class="econ">Economize ${semQuebra(t.econ)}</span> · <span class="pixs">${semQuebra(t.pix)} no Pix</span>`
      : h`Juntos: <b>${semQuebra(t.por)}</b> · <span class="pixs">${semQuebra(t.pix)} no Pix</span>`;
    nome = combo.nome;
    valor = combo.preco;
    chaves = cj.combo;
  } else {
    valor = itens.reduce((soma, i) => soma + i.k.preco, 0);
    preco = h`Juntos: <b>${formatarReais(valor)}</b>`;
    nome = nomes.join(" + ");
    chaves = itens.map((i) => i.kit).join("+");
  }
  return h`<div class="cj"><h2>Compre junto</h2><div class="cj-row">${linha[0]}<span class="plus">+</span>${linha.slice(1)}</div><p>${preco}</p><button class="btn buy" data-name="${nome}" data-price="${valor}" data-kit="${chaves}">Comprar os dois</button></div>`;
}

// Complete o tratamento: um cartão por tela (nome do produto, resumo, preço e Pix do kit principal dela).
function completeOTratamento(dados, ctx, p) {
  const cartoes = (p["complete-o-tratamento"] ?? []).filter((t) => telaVisivel(dados, t)).map((t) => {
    const alvo = dados.produtos[t];
    const k = kitPrincipal(dados, t);
    if (!k) return null;
    const kit = dados.kits[k];
    const preco = precosDoKit(kit);
    return h`<a class="xs" href="#p-${t}"><img src="${arquivo(ctx, kit.foto)}" alt="${textoDaFoto(dados, nomeDoProduto(dados, t))}">${kit["preco-de"] ? h`<span class="offtag">${preco.off}</span>` : null}<b>${nomeDoProduto(dados, t)}</b><span>${alvo.resumo}</span><strong>${preco.por}</strong><small>${preco.pix} no Pix</small></a>`;
  }).filter(Boolean);
  if (!cartoes.length) return null;
  return h`<div class="pp-sec"><span class="eyebrow">Complete o tratamento</span><h2>Combina com o seu kit</h2><div class="xsg">${cartoes}</div></div>`;
}

function chamadaFinal(dados, p, kit, principal) {
  const l = p["chamada-final-link"];
  const link = l && telaVisivel(dados, l.pagina) ? h`<a class="btn ghost" href="#p-${l.pagina}">${l.texto}</a>` : null;
  return h`<div class="cta-f"><h2>${p["chamada-final"]}</h2><button class="btn buy big" data-name="${kit.nome}" data-price="${kit.preco}" data-follow="1" data-kit="${principal}">Quero meu ${kit["nome-curto"]}</button>${link}</div>`;
}

export function tela(dados, ctx, chave) {
  if (!telaVisivel(dados, chave)) return null;
  const p = dados.produtos[chave];
  const principal = kitPrincipal(dados, chave);
  if (!principal) return null; // sem nenhum kit visível, a tela não tem o que vender
  const kit = dados.kits[principal];
  const marcado = p["kit-marcado"] && p.opcoes.includes(p["kit-marcado"]) && kitVisivel(dados, p["kit-marcado"]) ? p["kit-marcado"] : principal;
  const opcoes = opcoesDaTela(dados, chave, marcado);
  const grupo = grupoDaTela(dados, chave);
  const wa = linkDoWhatsapp(dados.marca);
  const t = precosDoKit(kit);
  return h`<section class="view pp2" id="p-${chave}" hidden data-slug="${chave}"><div class="wrap">
<nav class="crumbs"><a href="#inicio">Início</a> › <a href="#mais-vendido">Loja</a> › <span>${p.nome}</span></nav>
${foto(dados, ctx, chave, p, principal, opcoes)}
${topo(dados, ctx, p, kit, grupo)}
${escolhaDoKit(dados, ctx, chave, opcoes)}${caixaDePreco(dados, kit)}
${incluso(kit)}
<button class="btn buy big" data-name="${kit.nome}" data-price="${kit.preco}" data-kit="${principal}">Comprar agora</button>
<a class="btn wa-o" href="${wa}" target="_blank" rel="noopener">${WHATS}Tirar dúvida no WhatsApp</a>
${cupomDaPrimeiraCompra(dados.marca)}
${SELOS}
${videosDoProduto(dados, ctx, chave, p)}${fotosDoProduto(dados, ctx, chave)}${dores(p)}${solucao(p)}${resultadosReais(dados, ctx, chave)}${beneficios(p)}${paraQuem(dados, p)}${resultado(p)}${modoDeUsar(dados, chave, p)}${naPratica(dados, ctx, p)}${p.protocolo ? PROTOCOLO : null}${ficha(p)}${oQueDizem(dados, ctx, chave, grupo, wa)}${compreJunto(dados, ctx, p)}${compreTranquila(condicoes(dados.marca))}${completeOTratamento(dados, ctx, p)}${chamadaFinal(dados, p, kit, principal)}
</div><div class="sticky"><div><small class="st-l">${kit.nome}</small><b class="st-p">${t.por}</b></div><button class="btn buy" data-name="${kit.nome}" data-price="${kit.preco}" data-follow="1" data-kit="${principal}">Comprar</button></div></section>
`;
}
