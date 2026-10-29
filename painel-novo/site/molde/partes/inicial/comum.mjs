// Ajudas da página inicial e das telas Dúvidas e Avaliações: cabeçalho de seção, botão do fim, cartão de kit (preço
// pelas contas), cartões de avaliação ligados ao avaliacoes.json, abas Site Brumar / Shopee / Mercado Livre, notas e
// barras, as dúvidas e a chamada do WhatsApp. Funções puras (Node e navegador).
import { h } from "../../html.mjs";
import { avaliacoesVisiveis, formatarComoPython, resumoDasNotas, textosDoPreco } from "../../contas.mjs";
import { arquivo, brindeDaLoja, linkDaTela, linkDoWhatsapp, numeroEscrito, paginaVisivel, reaisRedondo, secaoLigada } from "../moldura/comum.mjs";

export { arquivo, brindeDaLoja, linkDaTela, linkDoWhatsapp, numeroEscrito, paginaVisivel, reaisRedondo, secaoLigada };

// Ícones escritos dentro da página (parte fixa).
export const ICONE_WHATSAPP = h`<svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#25D366" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 .9c.3.1.4.2.5.3.1.2.1.7-.1 1.2z"/></svg>`;
export const ICONE_VERIFICADO = h`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>`;
export const ICONE_PLAY = h`<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>`;

// Pedaço de endereço que vem dos dados (chave de tela, nome de ícone): só letra minúscula, número e hífen.
export function pedaco(valor, onde) {
  const s = String(valor ?? "");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) throw new Error(`${onde}: nome estranho (${s})`);
  return s;
}

// As seções que o painel pode desligar (secoes.json), na ordem da página. As outras ficam sempre ligadas, porque há
// link para elas fora da inicial que não acompanha: mais-vendido (telas de produto, /ir/ e página de erro), avaliacoes
// (as fotos da tela Avaliações, de Profissionais e do aviso no canto são copiadas dela), brinde (a sacola do topo) e
// compre-tranquila (o #garantia do rodapé e do menu); a abertura não tem id.
export const PODEM_DESLIGAR = ["depoimentos", "identifica", "resultados", "qual-kit", "combo", "reels", "como-funciona",
  "diferenciais", "comparativo", "profissionais", "comunidade", "receber-whatsapp", "duvidas"];

export function ligada(dados, id) {
  return !PODEM_DESLIGAR.includes(id) || secaoLigada(dados, id);
}

export function dadosDe(dados, arquivo) {
  if (!dados[arquivo]) throw new Error(`molde: falta o dados/${arquivo}.json`);
  return dados[arquivo];
}

export function kitDe(dados, chave) {
  const kit = dadosDe(dados, "kits")[chave];
  if (!kit) throw new Error(`molde: o kit "${chave}" não existe no kits.json`);
  return kit;
}

// "2026-10-19" -> "19/10/2026"
export function dataBr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ""));
  if (!m) throw new Error(`molde: data estranha (${iso})`);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export const visiveis = (lista) => (lista ?? []).filter((item) => item.visivel !== false);

// Estrelas: cheias e, se pedir, as vazias até 5 (★★★☆☆).
export function estrelas(n, comVazias = true) {
  return "★".repeat(n) + (comVazias ? "☆".repeat(5 - n) : "");
}

// ------------------------------------------------------------------ cabeçalho e botão do fim de cada seção
export function cabecalho(d, centro = false) {
  const titulo = h`<span class="eyebrow">${d.chamada}</span><h2>${d.titulo}</h2>${d.texto ? h`<p>${d.texto}</p>` : ""}`;
  return centro
    ? h`<div class="sec-head" style="text-align:center;margin-left:auto;margin-right:auto">${titulo}</div>`
    : h`<div class="sec-head">${titulo}</div>`;
}

// Os botões de compra da inicial levam para a tela do produto, onde a cliente escolhe e põe na sacola (pedido da dona
// em 28/10). Tela escondida: o cartão do mais vendido.
export function linkDeCompra(dados, tela = "kit-completo-1l") {
  return linkDaTela(dados, tela, "#mais-vendido");
}

export function botaoFinal(texto, destino) {
  return h`<div class="sec-cta"><a class="btn buy" href="${destino}">${texto}</a></div>`;
}

// ------------------------------------------------------------------ cartão de kit (mais vendido e profissionais)
// Nome, foto, % OFF, De, Por, Pix e 3x sempre do kits.json, pelas contas. O botão leva para a tela do kit; só com a
// tela escondida ele põe direto na sacola. No site de hoje, os botões dos combos escrevem data-price antes de data-name
// (e os dos kits, o contrário): o molde segue isso. A compra vai pelo data-kit (a chave do kits.json), nunca pelo nome
// escrito. Tela do cartão escondida: o nome fica, sem o link.
export function botaoDeCompra(dados, kit, chave, texto, tela) {
  const destino = tela ? linkDaTela(dados, tela) : null;
  if (destino) return h`<a class="btn buy" href="${destino}">${texto}</a>`;
  const preco = String(kit.preco);
  return chave.startsWith("combo-")
    ? h`<button class="btn buy" data-price="${preco}" data-name="${kit["nome-curto"]}" data-kit="${chave}">${texto}</button>`
    : h`<button class="btn buy" data-name="${kit["nome-curto"]}" data-price="${preco}" data-kit="${chave}">${texto}</button>`;
}

export function cartaoDeKit(dados, ctx, c, largo = false) {
  const kit = kitDe(dados, c.kit);
  if (kit.visivel === false) return "";
  const p = textosDoPreco(kit["preco-de"], kit.preco);
  const itens = c.itens ?? kit.itens;
  return h`<article class="card${largo ? " wide" : ""}"><div class="img">${p.off ? h`<span class="offtag">${p.off}</span>` : ""}${c.selo ? h`<span class="tag">${c.selo}</span>` : ""}<img src="${arquivo(ctx, kit.foto)}" alt="${kit.nome}"></div><div class="body"><span class="yield"><svg class="i" style="width:16px;height:16px"><use href="#i-${pedaco(c.icone, "ícone do cartão")}"/></svg>${c.rendimento}</span><h3>${paginaVisivel(dados, pedaco(c.pagina, "tela do cartão")) ? h`<a href="#p-${c.pagina}" style="text-decoration:none">${kit.nome}</a>` : kit.nome}</h3><ul>${itens.map((item) => h`<li><svg class="i"><use href="#i-check"/></svg>${item}</li>`)}</ul><div class="price">${p.de ? h`<s class="de">${p.de}</s>` : ""}<span class="v">${p.por}</span><span class="pix">${p.pix} no Pix</span><span class="parc">ou 3x de ${p["3x"]} sem juros</span></div>${botaoDeCompra(dados, kit, c.kit, c.botao, c.pagina)}</div></article>`;
}

// ------------------------------------------------------------------ avaliações da loja (avaliacoes.json, do robô)
// Nota, quantidade e barras de cada estrela, pela mesma regra do site de hoje (sem as escondidas e sem texto repetido).
export function notasDaLoja(dados) {
  const lista = avaliacoesVisiveis(dadosDe(dados, "avaliacoes").avaliacoes ?? []);
  const { nota, quantidade } = resumoDasNotas(lista);
  const dist = [5, 4, 3, 2, 1].map((s) => [s, lista.filter((a) => a.nota === s).length]);
  return { nota, quantidade, dist };
}

export function barras(dist) {
  const total = dist.reduce((soma, [, n]) => soma + n, 0);
  const rotulo = dist.map(([s, n]) => `${n} de ${s} estrelas`).join(", ");
  return h`<div class="dist" role="img" aria-label="Quantas avaliações de cada nota: ${rotulo}">${dist.map(([s, n]) => h`<div class="dl"><span>${s} ★</span><i><b style="width:${formatarComoPython(total ? 100 * n / total : 0, 1)}%"></b></i><em>${n}</em></div>`)}</div>`;
}

// Os cartões de destaque (destaques.json) com a avaliação ligada: nota, produto e data vêm do avaliacoes.json.
// Avaliação escondida (ou que sumiu do arquivo) tira o cartão. A foto da cliente segue a mesma regra do "Resultados
// reais": só com as fotos da avaliação liberadas e nenhuma escondida; senão, o cartão sai sem foto.
export function fotoLiberada(a) {
  return a?.fotos_liberadas === true && !Object.keys(a.fotos_ocultas ?? {}).length;
}

export function cartoesLigados(dados, lista) {
  const porId = new Map((dadosDe(dados, "avaliacoes").avaliacoes ?? []).map((a) => [a.id, a]));
  return (lista ?? []).map((c) => ({ ...c, a: porId.get(c.avaliacao) })).filter((c) => c.a && !c.a.oculta)
    .map((c) => (c.foto && !fotoLiberada(c.a) ? { ...c, foto: "" } : c));
}

// As avaliações (na ordem) dos cartões da aba Site da inicial que têm foto: o programa da página copia a foto de lá
// para os cartões marcados "da-inicial" (data-clone-idx = a posição nesta lista).
export function fotosDaInicial(dados) {
  return cartoesLigados(dados, dadosDe(dados, "destaques").inicial).filter((c) => c.foto).map((c) => c.avaliacao);
}

function comprou(c) {
  return h`Comprou: ${c.a.produto}${c["mostrar-data"] ? h` · ${dataBr(c.a.data)}` : ""}`;
}

// Cartão de avaliação da loja nas fileiras (Profissionais e tela Avaliações).
export function cartaoDeAvaliacao(ctx, c, fotos, profissional) {
  let foto = "";
  if (c.foto === "da-inicial") {
    const k = fotos.indexOf(c.avaliacao);
    if (k >= 0) foto = h`<img class="avc-img" data-clone-idx="${String(k)}" alt="Foto enviada por ${c.nome}">`;
  } else if (c.foto) {
    foto = h`<img class="avc-img" src="${arquivo(ctx, c.foto)}" alt="Foto enviada por ${c.nome}">`;
  }
  return h`<article class="avc"><div class="avc-top"><span class="stars" aria-label="${String(c.a.nota)} estrelas">${estrelas(c.a.nota, false)}</span>${profissional ? h`<span class="avc-tag">Profissional</span>` : ""}</div>${foto}<p>“${c.texto}”</p><div class="avc-f"><b>${c.nome}</b><span class="verif">${ICONE_VERIFICADO}Avaliação da loja Brumar</span></div><small>${comprou(c)}</small></article>`;
}

// Cartão de avaliação da loja na aba Site da inicial.
export function cartaoDaInicial(ctx, c) {
  return h`<div class="rv">${c.foto ? h`<img src="${arquivo(ctx, c.foto)}" alt="Foto enviada por ${c.nome}">` : ""}<div class="rv-b"><div class="rv-top"><b class="rv-n">${c.nome}</b><span class="rv-st"><span class="stars" aria-hidden="true">${estrelas(c.a.nota, false)}</span><b>${String(c.a.nota)},0</b></span><span class="verif">${ICONE_VERIFICADO}AVALIAÇÃO DA LOJA BRUMAR</span></div><p>${c.texto}</p><small>${comprou(c)}</small></div></div>`;
}

// ------------------------------------------------------------------ Shopee e Mercado Livre (marketplaces.json)
// Como cada loja aparece (parte fixa): código da aba, fileira da tela Avaliações e as palavras de cada uma.
const LOJAS = {
  shopee: { aba: "shopee", fileira: "row-sh", de: "da Shopee", em: "na Shopee", todas: "Ver todas na Shopee" },
  "mercado-livre": { aba: "ml", fileira: "row-ml", de: "do Mercado Livre", em: "no Mercado Livre", todas: "Ver todas no Mercado Livre" },
};

// Nota com 1 casa e as barras com as contas do gerador de hoje (formatarComoPython). A quantidade é a soma das estrelas.
export function lojas(dados) {
  return Object.entries(dadosDe(dados, "marketplaces")).map(([chave, d]) => {
    const jeito = LOJAS[chave];
    if (!jeito) throw new Error(`marketplaces.json: loja desconhecida (${chave})`);
    const dist = [5, 4, 3, 2, 1].map((s) => [s, Number(d.distribuicao?.[`nota-${s}`] ?? 0)]);
    // link vazio = a loja do marca.json (lojas.<chave>)
    const link = d.link || dados.marca?.lojas?.[chave];
    if (!link) throw new Error(`marketplaces.json: a loja ${chave} sem link (nem no marca.json)`);
    return { chave, ...jeito, d, link, dist, quantidade: dist.reduce((soma, [, n]) => soma + n, 0),
      nota: formatarComoPython(d.nota, 1).replace(".", ","), porcento: formatarComoPython(d.nota / 5 * 100, 1),
      copiadoEm: dataBr(d["copiado-em"]) };
  });
}

export function abas(prefixo, notaDoSite, listaDeLojas) {
  const botoes = [["site", "Site Brumar", notaDoSite], ...listaDeLojas.map((l) => [l.aba, l.d.nome, l.nota])];
  return h`<div class="av-tabs" role="tablist" aria-label="Onde as avaliações foram feitas">${botoes.map(([k, rotulo, nota]) => h`<button type="button" class="av-tab" role="tab" id="${prefixo}-t-${k}" aria-controls="${prefixo}-${k}" aria-selected="${k === "site" ? "true" : "false"}" data-aba="${k}">${rotulo} <b>${nota}</b></button>`)}</div>`;
}

export function resumoDaLoja(l) {
  return h`<div class="rev-top"><span class="nota">${l.nota}</span><div><span class="stars-p" style="--p:${l.porcento}%" role="img" aria-label="Nota ${l.nota} de 5"><span aria-hidden="true">★★★★★</span><span class="on" aria-hidden="true">★★★★★</span></span><span class="rt-q">${String(l.quantidade)} avaliações ${l.em}</span></div></div>${barras(l.dist)}`;
}

export function quando(a) {
  return a.data ? h` · ${dataBr(a.data)}` : "";
}

// ------------------------------------------------------------------ dúvidas (faq.json) e a chamada do WhatsApp
// A resposta é texto; "contato-antes" põe o WhatsApp e o e-mail do marca.json antes dela, e "link" acrescenta o link
// do fim (hoje só o que abre o vídeo da Magda).
function resposta(dados, p) {
  const { marca } = dados;
  const contato = p["contato-antes"]
    ? h`Pelo WhatsApp <a href="${linkDoWhatsapp(marca)}" target="_blank" rel="noopener">${numeroEscrito(marca)}</a> ou pelo e-mail <a href="${`mailto:${marca.email}`}">${marca.email}</a>. `
    : "";
  let link = "";
  if (p.link) {
    if (p.link.abre !== "video-da-magda") throw new Error(`faq.json: link de dúvida desconhecido (${p.link.abre})`);
    link = h` <a class="idf-lk" href="#" data-vid-magda="1">${p.link.texto}</a>`;
  }
  return h`${contato}${p.resposta}${link}`;
}

export function pergunta(dados, p) {
  return h`<details class="q"><summary>${p.pergunta}<svg class="i"><use href="#i-chev"/></svg></summary><p>${resposta(dados, p)}</p></details>`;
}

export function linkDeDuvida(marca) {
  return linkDoWhatsapp(marca, marca["mensagens-whatsapp"]?.duvida ?? "");
}

export function chamadaDoWhatsapp(dados) {
  return h`<div class="faq-cta"><span class="ib"><svg class="i"><use href="#i-chat"/></svg></span><div class="faq-cta-t"><h3>Não conseguiu achar a resposta da sua dúvida?</h3><p>Entre em contato agora mesmo pelo WhatsApp. A gente te ajuda antes da compra e também na hora de aplicar.</p></div><a class="btn wa-o" href="${linkDeDuvida(dados.marca)}" target="_blank" rel="noopener">${ICONE_WHATSAPP}Falar no WhatsApp</a></div>`;
}
