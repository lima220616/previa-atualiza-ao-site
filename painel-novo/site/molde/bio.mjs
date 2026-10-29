// A /bio (o link do Instagram): logo, frase, nota, selos, oferta em destaque, caixa da campanha, cupom de primeira compra,
// botões, depoimentos, dúvidas, garantias, redes e os dados da empresa. Os dados vêm de bio.json (o que o painel edita)
// e dos outros arquivos, para não haver duas verdades: preço, Pix e foto do kits.json (pelas contas), nota e total do
// avaliacoes.json, campanha do campanhas.json, cupons, WhatsApp, lojas e empresa do marca.json. Função pura.
import { h, cru } from "./html.mjs";
import { avaliacoesVisiveis, resumoDasNotas, textosDoPreco } from "./contas.mjs";
import { campanhaDaVez, cupomDaCampanha, fimDaData, fimEscrito, linkDoWhatsapp, numeroEscrito, paginaVisivel, reaisRedondo } from "./partes/moldura/comum.mjs";
import { iconeDaMarca } from "./partes/lucre/marcas.mjs";
import { enderecoDoSite } from "./paginas.mjs";
import { atributosDaPagina, marca as marcaDoPainel } from "./partes/moldura/previa.mjs";
import { cabecaComum } from "./partes/moldura/cabeca-comum.mjs";

// Só as combinações aprovadas (Brand Book, contraste conferido). "principal" é o rosa dos botões, das bordas e dos
// ícones; "fundo" é a cor da coluna da página (o que se vê no celular; dos lados, no computador, fica a névoa). Cada
// fundo com o jeito de escrever no estilo (o branco de hoje está escrito "#fff").
const PRINCIPAIS = ["#B84060", "#8A2E48"];
const FUNDOS = { "#FFFFFF": "#fff", "#FDF0F3": "#FDF0F3", "#FCE7EB": "#FCE7EB", "#F5E8C8": "#F5E8C8" };

// A mensagem do WhatsApp do botão "Fale com a Bruna" quando o destino está vazio.
const MENSAGEM_DO_WHATSAPP = "Olá! Vim pelo Instagram.";

// Ícones de traço (parte fixa, iguais aos de hoje).
const TRACOS = {
  folha: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l8-8"/>',
  olho: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  caminhao: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
  pix: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M8.5 12h7"/>',
  etiqueta: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
  sacola: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  pino: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  escudo: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  coracao: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  presente: '<path d="M4 10h16v10H4z"/><path d="M3 7h18v3H3z"/><path d="M12 7v13"/><path d="M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1z"/>',
};

function traco(nome) {
  return h`<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cru(TRACOS[nome])}</svg></span>`;
}

function marcaRedonda(nome, fundo, cor) {
  return h`<span class="ic marca" style="background:${cru(fundo)}">${iconeDaMarca(nome, cor)}</span>`;
}

// Cada tipo de botão: o ícone e o endereço que vale quando o destino está vazio (do marca.json, um lugar só). O botão
// do tipo "loja" vai para uma página do site ("/" ou "/#p-...") e ganha as etiquetas de origem (utm_content = a chave).
const TIPOS = {
  loja: { icone: () => traco("sacola"), padrao: () => "/" },
  "grupo-vip": { icone: () => marcaRedonda("whatsapp", "#25D366", "#FFFFFF"), padrao: (m) => m["grupo-vip"] },
  whatsapp: { icone: () => marcaRedonda("whatsapp", "#25D366", "#FFFFFF"), padrao: (m) => linkDoWhatsapp(m, MENSAGEM_DO_WHATSAPP) },
  shopee: { icone: () => marcaRedonda("shopee", "#EE4D2D", "#FFFFFF"), padrao: (m) => m.lojas?.["shopee-loja"] },
  "mercado-livre": { icone: () => marcaRedonda("mercado-livre", "#FFE600", "#2D3277"), padrao: (m) => m.lojas?.["mercado-livre"] },
  rastrear: { icone: () => traco("pino"), padrao: (m) => m["minha-conta"] },
};

function cor(valor, permitidas, campo) {
  const lista = Array.isArray(permitidas) ? Object.fromEntries(permitidas.map((c) => [c, c])) : permitidas;
  if (!Object.hasOwn(lista, valor)) throw new Error(`bio.json: ${campo} fora das cores aprovadas (${valor}); use ${Object.keys(lista).join(", ")}`);
  return cru(lista[valor]);
}

// Endereço do site com as etiquetas de origem da /bio, antes da âncora: "/#p-duvidas" ->
// "https://brumarcosmeticos.com/?utm_source=instagram&utm_medium=bio&utm_content=duvidas#p-duvidas".
function linkDoSite(site, caminho, etiqueta) {
  const s = String(caminho || "/");
  if (!/^\/(?!\/)[^\s"<>]*$/.test(s)) throw new Error(`bio.json: endereço do site tem de começar com "/" (${s})`);
  if (!/^[a-z0-9-]+$/.test(etiqueta)) throw new Error(`bio.json: etiqueta de origem estranha (${etiqueta})`);
  const [base, ...resto] = s.split("#");
  const ancora = resto.length ? `#${resto.join("#")}` : "";
  return `${site}${base}${base.includes("?") ? "&" : "?"}utm_source=instagram&utm_medium=bio&utm_content=${etiqueta}${ancora}`;
}

// Para onde vai o "Quero meu ...": a tela visível que vende o kit (a que tem o mesmo nome dele; senão, a primeira que o
// oferece, em produtos.json). Com todas essas telas escondidas no painel, vale o destino reserva (os mais vendidos).
function ancoraDoKit(dados, chave) {
  const telas = dados.produtos ?? {};
  const oferecem = Object.keys(telas).filter((t) => Array.isArray(telas[t]?.opcoes) && telas[t].opcoes.includes(chave));
  if (!oferecem.length) throw new Error(`bio.json: a oferta "${chave}" não está em nenhuma tela de produto (produtos.json)`);
  const visiveis = oferecem.filter((t) => paginaVisivel(dados, t));
  if (!visiveis.length) return "mais-vendido";
  return `p-${visiveis.includes(chave) ? chave : visiveis[0]}`;
}

function foto(ctx, caminho) {
  const s = String(caminho ?? "");
  return /^(foto|video):/.test(s) ? ctx.url(s) : s;
}

function oferta(dados, ctx, site) {
  const { bio, kits } = dados;
  const chave = bio.oferta;
  const kit = kits?.[chave];
  if (!kit) throw new Error(`bio.json: a oferta "${chave}" não é um kit do kits.json`);
  if (kit.visivel === false) return "";
  const extra = bio["detalhes-da-oferta"]?.[chave] ?? {};
  const precos = textosDoPreco(kit["preco-de"], kit.preco);
  return h`  <section class="oferta" aria-label="Oferta em destaque">
    <div class="oferta-topo"><span>${extra.selo || kit.selo || "Oferta em destaque"}</span>${precos.off ? h`<span class="selo-off">${precos.off}</span>` : ""}</div>
    <div class="oferta-corpo">
      <img src="${foto(ctx, extra.foto || kit.foto)}" alt="${kit.nome}" width="120" height="120">
      <div><h3>${kit.nome}</h3><p class="itens">${kit.itens.join(" + ")}</p>
        ${precos.de ? h`<span class="de">De ${precos.de}</span>` : ""}<span class="por">${precos.por}</span>
        <span class="pix">${precos.pix} no Pix</span>${precos.econ ? h`<br><span class="economia">Você economiza ${precos.econ}</span>` : ""}</div>
    </div>
    <a class="comprar" href="${linkDoSite(site, `/#${ancoraDoKit(dados, chave)}`, "oferta")}" target="_blank" rel="noopener">${extra.botao || `Quero meu ${kit["nome-curto"]}`}</a>
  </section>
`;
}

// A caixa da campanha da vez (a mesma da faixa do site), com o cupom do marca.json. Depois da data, nada. Texto ou
// botão vazio no painel: a linha (ou o botão) some.
function promocao(dados, ctx) {
  const { marca } = dados;
  const campanha = campanhaDaVez(dados, ctx);
  const cupom = cupomDaCampanha(dados, ctx);
  if (!dados.bio["mostrar-promo"] || !campanha || !cupom) return "";
  // A caixa mostra o cupom: some (e conta até) quando acaba o primeiro dos dois, a campanha ou o cupom. Campanha
  // estendida no painel depois da data do cupom não deixa o cupom vencido à vista na /bio.
  const termina = fimDaData(cupom.termina, "marca.json (cupom da campanha)") < campanha.fim ? cupom.termina : campanha.termina;
  return h`  <section class="promo" aria-label="Promoção de ${campanha.titulo}" data-fim="${fimEscrito(termina)}">
    <p class="promo-titulo">${campanha.titulo} Brumar</p>
${campanha.texto ? h`    <p class="promo-selo"><span>${String(campanha.texto).toUpperCase()}</span> com cupom</p>
` : ""}    <div class="contador" role="timer" aria-label="Tempo até o fim da promoção">
      <span><b data-d>00</b>dias</span><span><b data-h>00</b>horas</span><span><b data-m>00</b>min</span><span><b data-s>00</b>seg</span>
    </div>
    <p class="promo-condicao">Use o cupom ${cupom.codigo} no pagamento: ${cupom.porcento}% OFF nos Kits Completos e produtos avulsos. Somando o desconto do kit e ${marca.condicoes["pix-porcento"]}% no Pix, chega a até 30% OFF em relação ao preço dos produtos separados. Um cupom por pedido.</p>
${campanha.botao ? h`    <button type="button" class="promo-botao" data-copiar="${cupom.codigo}">${traco("etiqueta")}${campanha.botao} ${cupom.codigo}</button>
` : ""}    <a class="promo-zap" href="${linkDoWhatsapp(marca, `Olá! Tenho uma dúvida sobre o cupom de ${campanha.titulo} da Brumar.`)}" target="_blank" rel="noopener">Dúvidas? Fale com a gente no WhatsApp</a>
  </section>
`;
}

function botoes(dados, ctx, site) {
  return Object.entries(dados.bio.botoes ?? {}).filter(([, b]) => b?.visivel !== false).map(([chave, b]) => {
    const tipo = TIPOS[b?.tipo];
    if (!tipo) throw new Error(`bio.json: o botão "${chave}" tem um tipo que não existe (${b?.tipo})`);
    const destino = String(b.destino ?? "") || tipo.padrao(dados.marca);
    if (!destino) throw new Error(`bio.json: o botão "${chave}" está sem destino e o marca.json não tem um`);
    const endereco = b.tipo === "loja" ? linkDoSite(site, destino, chave) : destino;
    return h`<a class="link"${marcaDoPainel(ctx, "bio", chave)} href="${endereco}" target="_blank" rel="noopener">${tipo.icone()}<span class="link-txt"><strong>${b.nome}</strong><small>${b.texto}</small></span><span class="seta" aria-hidden="true">›</span></a>`;
  });
}

// Os depoimentos escolhidos (pelo id da avaliação); escondida ou apagada pelo robô, sai da lista.
function depoimentos(dados, visiveis) {
  const porId = new Map(visiveis.map((a) => [a.id, a]));
  return (dados.bio.depoimentos ?? []).map((id) => porId.get(id)).filter(Boolean)
    .map((a) => h`<figure class="depo"><span class="estrelas" aria-hidden="true">${"★".repeat(Math.round(a.nota))}</span><blockquote>“${a.texto}”</blockquote><figcaption>${a.nome} · ${String(a.produto).split(" · ")[0]}</figcaption></figure>`);
}

function clientes(dados, site, visiveis, total) {
  const lista = depoimentos(dados, visiveis);
  if (!dados.bio["mostrar-avaliacoes"] || !lista.length) return "";
  return h`  <h2>O que dizem as clientes</h2>
  <div class="depos">${lista}</div>
  <a class="ver-mais" href="${linkDoSite(site, "/#p-avaliacoes", "avaliacoes")}" target="_blank" rel="noopener">Ver todas as ${total} avaliações ›</a>

`;
}

function duvidas(dados, site) {
  const lista = Object.values(dados.bio.duvidas ?? {});
  if (!dados.bio["mostrar-duvidas"] || !lista.length) return "";
  return h`  <h2>Dúvidas mais perguntadas</h2>
  ${lista.map((d) => h`<details><summary>${d.pergunta}</summary><p>${d.resposta}</p></details>`)}
  <a class="ver-mais" href="${linkDoSite(site, "/#p-duvidas", "duvidas")}" target="_blank" rel="noopener">Ver todas as dúvidas ›</a>

`;
}

function redes(marca, principal) {
  const lista = [["instagram", "Instagram"], ["facebook", "Facebook"], ["tiktok", "TikTok"], ["youtube", "YouTube"]]
    .filter(([rede]) => marca.redes?.[rede]);
  return lista.map(([rede, nome]) => h`<a href="${marca.redes[rede]}" target="_blank" rel="noopener" aria-label="${nome}">${marcaRedonda(rede, "#FCE7EB", principal)}</a>`);
}

export function montarBio(dados, ctx) {
  const { bio, marca, textos } = dados;
  if (!bio) throw new Error("molde: falta dados/bio.json");
  const site = enderecoDoSite(marca);
  const principal = String(bio.principal ?? "");
  const visiveis = avaliacoesVisiveis(dados.avaliacoes?.avaliacoes ?? []);
  const { nota, quantidade } = resumoDasNotas(visiveis);
  const { condicoes, empresa } = marca;
  // a medição e o aviso de cookies (fora da prévia); com eles, o botão que reabre o aviso, discreto, no fim da página
  const medicao = cabecaComum(ctx, marca);
  const comAviso = /rastreio/.test(String(medicao ?? ""));
  return h`<!doctype html>
<html lang="pt-BR"${atributosDaPagina(dados, ctx)}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${marca.nome} · ${textos.titulo}</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${site}/bio/">
<meta name="theme-color" content="#B84060">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/icone-48.png">
<link rel="apple-touch-icon" href="/assets/img/icone-180.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${marca.nome}">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${marca.nome} · ${textos.titulo}">
<meta property="og:description" content="Loja oficial, Grupo VIP, Shopee, Mercado Livre e atendimento no WhatsApp.">
<meta property="og:url" content="${site}/bio/">
<meta property="og:image" content="${site}/assets/img/compartilhar.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="description" content="Progressiva Gloss Brumar 100% sem formol. Loja oficial, Grupo VIP, Shopee, Mercado Livre e atendimento no WhatsApp.">
<link rel="stylesheet" href="${ctx.url("fontes/fontes.css")}">
<style>
:root { --rosa: ${cor(principal, PRINCIPAIS, "principal")}; --rosa-hover: #9E3552; --profundo: #8A2E48; --texto2: #7A3A4C; --texto3: #9A5A6C;
  --nevoa: #FDF0F3; --bebe: #FCE7EB; --borda: #F3D3DA; --dourado: #F5E8C8; --verde: #0B8139; --verde-h: #096B2F;
  --vermelho: #D93A3A; --estrela: #F5B400; --serif: 'Playfair Display', Georgia, serif; --sans: 'Montserrat', Arial, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--nevoa); font-family: var(--sans); color: var(--profundo); font-size: 16px; line-height: 1.5; }
.pagina { max-width: 480px; margin: 0 auto; background: ${cor(bio.fundo, FUNDOS, "fundo")}; min-height: 100vh; padding: 28px 18px 36px; }
h2 { font-family: var(--serif); font-size: 1.3rem; margin: 30px 0 12px; text-align: center; }
.topo { text-align: center; }
.topo img { width: 170px; height: auto; display: block; margin: 0 auto 14px; }
.prova { font-weight: 600; margin: 0; }
.nota { display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; padding: 6px 14px; border-radius: 8px;
  background: var(--nevoa); border: 1px solid var(--borda); font-size: .9rem; color: var(--profundo); text-decoration: none; }
.estrelas { color: var(--estrela); letter-spacing: 1px; }
.selos { list-style: none; padding: 0; margin: 18px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.selos li { display: flex; align-items: center; gap: 8px; font-size: .82rem; font-weight: 600; color: var(--texto2); }
.ic { flex: none; width: 40px; height: 40px; border-radius: 50%; background: var(--bebe); color: var(--rosa); display: grid; place-items: center; }
.ic svg { width: 22px; height: 22px; }
.ic.marca svg { width: 21px; height: 21px; }
.selos .ic { width: 34px; height: 34px; } .selos .ic svg { width: 19px; height: 19px; }
.oferta { margin-top: 22px; border: 1px solid var(--borda); border-radius: 12px; overflow: hidden; background: #fff;
  box-shadow: 0 6px 22px rgba(138,46,72,.10); }
.oferta-topo { background: var(--dourado); padding: 8px 14px; font-weight: 700; font-size: .8rem; letter-spacing: .06em; text-transform: uppercase;
  display: flex; justify-content: space-between; align-items: center; }
.selo-off { background: var(--vermelho); color: #fff; border-radius: 99px; padding: 3px 10px; font-size: .78rem; letter-spacing: 0; }
.oferta-corpo { display: grid; grid-template-columns: 120px 1fr; gap: 12px; padding: 14px; align-items: center; }
.oferta-corpo img { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,.08)); }
.oferta h3 { font-family: var(--serif); font-size: 1.05rem; margin: 0 0 4px; }
.itens { font-size: .78rem; color: var(--texto3); margin: 0 0 6px; }
.de { text-decoration: line-through; color: var(--texto3); font-size: .85rem; }
.por { font-size: 1.5rem; font-weight: 700; color: var(--profundo); display: block; line-height: 1.2; }
.pix { color: var(--verde); font-weight: 700; font-size: .88rem; }
.economia { font-size: .78rem; color: var(--texto2); }
.comprar { display: block; margin: 0 14px 14px; padding: 14px; text-align: center; background: var(--verde); color: #fff; border-radius: 8px;
  font-weight: 700; font-size: 1.05rem; text-decoration: none; }
.comprar:hover { background: var(--verde-h); }
.promo { margin-top: 14px; border-radius: 12px; padding: 16px 14px 14px; text-align: center; background: var(--vermelho); color: #fff;
  box-shadow: 0 6px 22px rgba(217,58,58,.25); }
.promo-titulo { margin: 0; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: .78rem; opacity: .95; }
.promo-selo { margin: 4px 0 10px; font-size: 1rem; font-weight: 600; }
.promo-selo span { font-family: var(--serif); font-size: 1.9rem; font-weight: 700; display: block; line-height: 1.1; }
.contador { display: flex; justify-content: center; gap: 8px; }
.contador span { background: #fff; color: var(--vermelho); border-radius: 8px; min-width: 56px; padding: 6px 4px; font-size: .68rem; font-weight: 600; }
.contador b { display: block; font-size: 1.35rem; line-height: 1.1; }
.promo-condicao { margin: 10px 0 12px; font-size: .78rem; line-height: 1.45; opacity: .95; }
.promo-botao { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border-radius: 8px; background: #25D366;
  color: #fff; font-weight: 700; text-decoration: none; }
.promo-botao .ic { width: 26px; height: 26px; }
button.promo-botao { width: 100%; border: 0; font: inherit; font-weight: 700; cursor: pointer; }
.promo-zap { display: block; margin-top: 10px; color: #fff; text-align: center; font-size: .8rem; }
.promo.acabou { display: none; }
.cupom { margin: 12px 0 0; padding: 10px 14px; border: 1.5px dashed var(--rosa); border-radius: 10px; display: flex; gap: 10px; align-items: center;
  font-size: .85rem; }
.cupom .ic { width: 34px; height: 34px; }
.cupom code { font-family: var(--sans); font-weight: 700; background: var(--bebe); padding: 1px 6px; border-radius: 4px; }
.links { display: grid; gap: 10px; margin-top: 4px; }
.link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #fff; border: 1.5px solid var(--rosa); border-radius: 8px;
  color: var(--profundo); text-decoration: none; transition: background .15s; }
.link:hover { background: var(--nevoa); }
.link-txt { flex: 1; min-width: 0; }
.link strong { display: block; font-size: 1rem; }
.link small { display: block; color: var(--texto3); font-size: .78rem; }
.seta { color: var(--rosa); font-size: 1.5rem; line-height: 1; }
.depos { display: grid; gap: 10px; }
.depo { margin: 0; padding: 14px; background: var(--nevoa); border-radius: 12px; }
.depo blockquote { margin: 6px 0; font-size: .92rem; color: var(--profundo); }
.depo figcaption { font-size: .78rem; color: var(--texto3); font-weight: 600; }
.ver-mais { display: block; text-align: center; margin-top: 10px; color: var(--rosa); font-weight: 700; font-size: .9rem; }
details { border-bottom: 1px solid var(--borda); }
summary { cursor: pointer; padding: 12px 4px; font-weight: 600; list-style: none; display: flex; justify-content: space-between; gap: 10px; }
summary::after { content: "+"; color: var(--rosa); font-weight: 700; font-size: 1.2rem; line-height: 1; }
details[open] summary::after { content: "−"; }
details p { margin: 0 4px 12px; color: var(--texto2); font-size: .92rem; }
.garantias { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 26px; text-align: center; font-size: .72rem; font-weight: 600; color: var(--texto2); }
.garantias .ic { margin: 0 auto 4px; width: 36px; height: 36px; }
.redes { display: flex; justify-content: center; gap: 12px; margin-top: 26px; }
.redes a { text-decoration: none; }
.empresa { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--borda); text-align: center; font-size: .74rem; color: var(--texto3); line-height: 1.6; }
.empresa strong { color: var(--profundo); }
.assinatura { font-family: 'Great Vibes', cursive; }
.lk-cookies { margin-top: 10px; padding: 0; border: 0; background: none; color: var(--texto3); font: inherit; font-size: .72rem; text-decoration: underline; cursor: pointer; }
.lk-cookies:focus-visible { outline: 3px solid var(--profundo); outline-offset: 2px; }
</style>
${medicao}</head>
<body>
<main class="pagina">
  <header class="topo">
    <img src="/bio/img/logo.png" alt="${marca.nome} – ${textos.slogan}" width="170" height="76">
    <p class="prova"${marcaDoPainel(ctx, "bio", "frase")}>${bio.frase}</p>
    <a class="nota" href="${linkDoSite(site, "/#p-avaliacoes", "avaliacoes")}" target="_blank" rel="noopener"><span class="estrelas" aria-hidden="true">★★★★★</span><strong>Nota ${nota}</strong>
      <span>· ${quantidade} avaliações de clientes</span></a>
    <ul class="selos"><li>${traco("folha")}<span>100% sem formol</span></li><li>${traco("olho")}<span>Não arde os olhos</span></li><li>${traco("caminhao")}<span>Frete grátis acima de ${reaisRedondo(condicoes["frete-gratis-acima"])}</span></li><li>${traco("pix")}<span>${condicoes["pix-porcento"]}% OFF no Pix</span></li></ul>
  </header>

${oferta(dados, ctx, site)}${promocao(dados, ctx)}  <p class="cupom">${traco("etiqueta")}<span>Primeira compra? Use o cupom <code>${marca.cupons["primeira-compra"]}</code> e ganhe ${marca.cupons["primeira-compra-porcento"]}% OFF.</span></p>

  <h2>Onde comprar e falar com a gente</h2>
  <nav class="links" aria-label="Links da Brumar">${botoes(dados, ctx, site)}</nav>

${clientes(dados, site, visiveis, quantidade)}${duvidas(dados, site)}  <ul class="garantias" style="list-style:none;padding:0">
    <li>${traco("escudo")}Compra segura</li><li>${traco("coracao")}Garantia de satisfação de 30 dias</li>
    <li>${traco("presente")}Brinde acima de ${reaisRedondo(condicoes["brinde-acima"])}</li>
  </ul>

  <nav class="redes" aria-label="Redes sociais">${redes(marca, principal)}</nav>

  <footer class="empresa">
    <strong>${marca.nome}</strong> · ${empresa["razao-social"]} · CNPJ ${empresa.cnpj}<br>
    ${empresa.endereco}, ${empresa.cidade} - ${empresa.estado}, CEP ${empresa.cep}<br>
    ${textos.horario}<br>
    ${marca.email} · WhatsApp ${numeroEscrito(marca)}<br>
    Direito de desistência em até 7 dias após o recebimento.${comAviso ? h`<br>
    <button type="button" class="lk-cookies" data-cookies>Preferências de cookies</button>` : ""}
  </footer>
</main>
${ctx.previa ? h`<script src="${ctx.url("js/previa.js")}"></script>
` : ""}<script src="${ctx.url("js/bio-contador.js")}" defer></script>
</body>
</html>
`;
}

export default montarBio;
