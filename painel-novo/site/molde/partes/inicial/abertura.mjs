// Abertura da página inicial: os banners (banners.json), o texto ao lado (inicial.json) e a faixa com os 4 benefícios
// (condições do marca.json). Fica sempre ligada (não tem id de seção). O banner com "selo-da-campanha" mostra o selo
// "até 30% OFF" e a nota com o cupom do marca.json enquanto ele vale; "com-campanha" põe o título da campanha da vez
// (campanhas.json) na frente da chamada. Depois da data, nada disso sai (o programa da página também esconde na hora).
import { h } from "../../html.mjs";
import { campanhaDaVez, cupomDaCampanha, paginaVisivel } from "../moldura/comum.mjs";
import { arquivo, dadosDe, linkDeCompra, dataBr, ligada, pedaco, reaisRedondo } from "./comum.mjs";
import { textoDaFoto } from "../moldura/texto-alternativo.mjs";
import { marca } from "../moldura/previa.mjs";

// Cores de cada tema do banner (parte fixa). Os ids gd/gl repetem como hoje.
const TEMAS = {
  escuro: { classe: "dark", gradiente: "gd", cores: ["#F5E8C8", "#E0B860"] },
  claro: { classe: "light", gradiente: "gl", cores: ["#E888A0", "#B84060"] },
};

function banner(dados, ctx, [chave, b], n, total, campanha, cupom) {
  const tema = TEMAS[b.tema];
  if (!tema) throw new Error(`banners.json: tema desconhecido (${b.tema})`);
  const comSelo = b["selo-da-campanha"] && cupom;
  const pix = dados.marca.condicoes["pix-porcento"];
  const [dia, hora] = String(cupom?.termina ?? "T").split("T");
  return h`<div class="bnr-s"${marca(ctx, "banners", chave)} aria-label="Banner ${String(n)} de ${String(total)}"><a class="bnx ${tema.classe}" href="#p-${pedaco(b.pagina, "tela do banner")}"><div class="spark"></div><svg class="rib" viewBox="0 0 200 400" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${tema.gradiente}" x1="0" x2="1"><stop offset="0" stop-color="${tema.cores[0]}"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="${tema.cores[1]}"/></linearGradient></defs><path d="M150 -10 C 60 60, 190 120, 110 190 S 40 300, 150 410" fill="none" stroke="url(#${tema.gradiente})" stroke-width="16" stroke-linecap="round" opacity=".85"/></svg>${comSelo ? h`<div class="badge"><small>ATÉ</small><b>30%</b><small>OFF*</small><em>com cupom</em></div>` : ""}<div class="stage"><div class="pod"></div><div class="pod2"></div><img class="prod" src="${arquivo(ctx, b.foto)}" alt="${textoDaFoto(dados, dados.produtos?.[b.pagina]?.nome ?? b.titulo)}"></div><div class="txt"><div class="eb">${b["com-campanha"] && campanha ? h`${campanha.titulo} · ` : ""}${b.chamada}</div><h3>${b.titulo}</h3><ul>${b.itens.map((item) => h`<li><i>✓</i>${item}</li>`)}</ul><span class="cta">${b.botao}</span>${comSelo ? h`<p class="note">*Até 30% OFF sobre os produtos separados: desconto do kit + cupom ${cupom.codigo} (${String(cupom.porcento)}%, só Kits Completos e avulsos) + ${String(pix)}% no Pix. Até ${dataBr(dia)}, ${hora.replace(":", "h")}. Um cupom por pedido.</p>` : ""}</div></a></div>
`;
}

// Banner escondido ou de tela de produto escondida (produtos.json) não aparece.
function banners(dados, ctx) {
  const lista = Object.entries(dadosDe(dados, "banners")).filter(([, b]) => b.visivel !== false && paginaVisivel(dados, b.pagina));
  if (!lista.length) return "";
  const campanha = campanhaDaVez(dados, ctx);
  const cupom = cupomDaCampanha(dados, ctx);
  return h`<div class="bnr"${marca(ctx, "banners")} id="bnr" aria-roledescription="carrossel" aria-label="Promoções do momento">
<div class="bnr-track">
${lista.map((b, k) => banner(dados, ctx, b, k + 1, lista.length, campanha, cupom))}</div>
<button class="bnr-nav prev" type="button" aria-label="Banner anterior"><svg class="i"><use href="#i-arrow"/></svg></button>
<button class="bnr-nav next" type="button" aria-label="Próximo banner"><svg class="i" style="transform:scaleX(-1)"><use href="#i-arrow"/></svg></button>
<div class="bnr-dots" role="tablist">${lista.map((b, k) => (k === 0
    ? h`<button type="button" aria-label="Banner 1" aria-current="true"></button>`
    : h`<button type="button" aria-label="Banner ${String(k + 1)}"></button>`))}</div>
</div>
`;
}

export default function abertura(dados, ctx) {
  const a = dadosDe(dados, "inicial").abertura;
  const c = dados.marca.condicoes;
  return h`<section class="hero">
<div class="wrap">
${banners(dados, ctx)}<div class="hero-txt">
<span class="chip"><svg class="i" style="width:16px;height:16px"><use href="#i-leaf"/></svg>${a.selo}</span>
<h1>${a.titulo}</h1>
<p class="sub">${a.texto}</p>
<div class="ctas"><a class="btn buy" href="${linkDeCompra(dados)}">${a.botao}</a>${ligada(dados, "qual-kit") ? h`<a class="btn ghost" href="#qual-kit">${a["botao-quiz"]}</a>` : ""}</div>
</div>
</div>
</section>

<div class="wrap ben">
<div><span class="ib"><svg class="i"><use href="#i-truck"/></svg></span><p><b>Frete grátis</b><span>acima de ${reaisRedondo(c["frete-gratis-acima"])}</span></p></div>
<div><span class="ib"><svg class="i"><use href="#i-pix"/></svg></span><p><b>${String(c["pix-porcento"])}% OFF no Pix</b><span>aprovação na hora</span></p></div>
<div><span class="ib"><svg class="i"><use href="#i-card"/></svg></span><p><b>Até ${String(c["parcelas-cartao"])}x no cartão</b><span>sendo ${String(c.parcelas)}x sem juros</span></p></div>
<div><span class="ib"><svg class="i"><use href="#i-shield"/></svg></span><p><b>Site oficial</b><span>compra segura</span></p></div>
</div>

`;
}
