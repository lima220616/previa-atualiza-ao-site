// Topo da página: âncora do início, faixa da campanha (com a contagem), Grupo VIP, faixa rolante e o cabeçalho. No
// cabeçalho, um ícone só para "Minha conta / Rastrear pedido": a área do cliente da Yampi (marca.json, minha-conta),
// onde a cliente vê os pedidos e o rastreio.
import { h } from "../html.mjs";
import { arquivo, campanhasNoPrazo, cupomDaCampanha, linkDoWhatsapp } from "./moldura/comum.mjs";
import { marca as marcaDoPainel } from "./moldura/previa.mjs";

// Ícone de cada frase da faixa rolante, pela posição (parte fixa).
const ICONES_DA_FAIXA = ["i-tag", "i-truck", "i-gift", "i-pix", "i-card", "i-shield"];

// Só a campanha da vez (a ligada que termina primeiro); depois da data, nada. A contagem começa em "--" e o programa
// da página conta até o fim. O texto: "<título>: cupom <código> <onde vale>, <texto>. Termina em" (o programa da página
// escreve igual quando a próxima campanha entra na faixa: bloco-01.js, textoDaFaixa).
function faixaDaCampanha(dados, ctx, campanha) {
  if (!campanha) return "";
  const cupom = cupomDaCampanha(dados, ctx);
  const resto = [cupom && [`cupom ${cupom.codigo}`, cupom["onde-vale"]].filter(Boolean).join(" "), campanha.texto]
    .filter(Boolean).join(", ");
  return h`<div class="urg" id="topo"${marcaDoPainel(ctx, "campanhas")}>
<div class="wrap">
<strong><svg class="i" style="width:18px;height:18px"><use href="#i-clock"/></svg>${campanha.titulo}${resto ? h`: ${resto}` : ""}. Termina em</strong>
<div class="timer" role="timer" aria-live="off"><div><span id="d">--</span><small>dias</small></div><div><span id="h">--</span><small>horas</small></div><div><span id="m">00</span><small>min</small></div><div><span id="s">00</span><small>seg</small></div></div>
</div>
</div>
`;
}

function grupoVip(marca) {
  if (!marca["grupo-vip"]) return "";
  return h`<div class="vip"><div class="wrap"><span>🖤 <b>Grupo VIP Brumar:</b> ofertas e cupons antes de todo mundo</span><a href="${marca["grupo-vip"]}" target="_blank" rel="noopener">Entrar no grupo</a></div></div>
`;
}

// As frases de textos.faixa-topo-1 a 6 (vazia = não aparece) e, sem contagem, as outras campanhas no prazo
// ("<título>: <texto>"; data-campanha = a posição dela no bloco de dados: o programa da página tira a frase quando ela
// vai para a faixa da contagem ou acaba). E de novo, escondidas, para a faixa dar a volta.
function faixaRolante(ctx, textos, outras) {
  const frases = ICONES_DA_FAIXA.map((icone, i) => [icone, String(textos[`faixa-topo-${i + 1}`] ?? "").trim(), null])
    .filter(([, f]) => f)
    .concat(outras.map(([n, c]) => ["i-tag", [c.titulo, c.texto].filter(Boolean).join(": "), String(n)]));
  if (!frases.length) return "";
  return h`<div class="ticker"${marcaDoPainel(ctx, "textos", "faixa-topo")} aria-label="Benefícios da loja">
<div class="ticker-track">
${frases.map(([icone, frase, n]) => h`<span${n ? h` data-campanha="${n}"` : null}><svg class="i"><use href="#${icone}"/></svg>${frase}</span>
`)}${frases.map(([icone, frase, n]) => h`<span aria-hidden="true"${n ? h` data-campanha="${n}"` : null}><svg class="i"><use href="#${icone}"/></svg>${frase}</span>
`)}</div>
</div>
`;
}

export default function topo(dados, ctx) {
  const { marca, textos } = dados;
  const [daVez, ...outras] = campanhasNoPrazo(dados, ctx);
  return h`<div id="inicio"></div>

${faixaDaCampanha(dados, ctx, daVez)}${grupoVip(marca)}${faixaRolante(ctx, textos, outras.map((c, i) => [i + 1, c]))}
<header>
<div class="wrap hd">
<div class="hd-left"><button class="icon-btn" id="openMenu" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer"><svg class="i"><use href="#i-menu"/></svg></button></div>
<a class="logo" href="#inicio" aria-label="${marca.nome}, página inicial"><img src="${arquivo(ctx, marca.logo)}" alt="${marca.nome} – ${textos.slogan}"></a>
<div class="hd-right">
<a class="icon-btn" href="${marca["minha-conta"]}" target="_blank" rel="noopener" aria-label="Minha conta e rastrear pedido" title="Minha conta / Rastrear pedido"><svg class="i"><use href="#i-user"/></svg></a>
<a class="icon-btn wa-ic" href="${linkDoWhatsapp(marca, textos["whatsapp-mensagem"])}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"><svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 .9c.3.1.4.2.5.3.1.2.1.7-.1 1.2z"/></svg></a>
<a class="icon-btn" href="#brinde" aria-label="Sacola de compras"><svg class="i"><use href="#i-bag"/></svg><span class="badge" id="count">0</span></a>
</div>
</div>
</header>

`;
}
