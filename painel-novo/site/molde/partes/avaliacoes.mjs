// Tela Avaliações (#p-avaliacoes) e a foto ampliada (#avlb). Nota e total pelas contas a partir do avaliacoes.json;
// fotos das clientes, cabeleireiras e clientes do destaques.json (ligados às avaliações); abas da Shopee e do Mercado
// Livre com todas as avaliações com comentário do marketplaces.json. Os vídeos da fileira são copiados pelo programa da
// página (depoimentos e aplicação na prática da inicial). Os textos da tela são parte fixa.
import { h } from "../html.mjs";
import {
  abas, arquivo, cartaoDeAvaliacao, linkDaTela, cartoesLigados, dadosDe, estrelas, fotosDaInicial, linkDeDuvida, lojas, notasDaLoja,
  quando, resumoDaLoja, visiveis, ICONE_WHATSAPP,
} from "./inicial/comum.mjs";

const setas = (fileira) => h`<div class="av-arr"><button type="button" class="av-a" data-row="${fileira}" data-dir="-1" aria-label="Voltar">‹</button><button type="button" class="av-a" data-row="${fileira}" data-dir="1" aria-label="Avançar">›</button></div>`;

function cartaoDaLoja(l, a) {
  return h`<article class="avc avc-mk"><div class="avc-top"><span class="stars" aria-label="${String(a.estrelas)} de 5 estrelas">${estrelas(a.estrelas)}</span></div><p>“${a.texto}”</p><div class="avc-f"><b>Cliente ${l.de}</b><span class="verif mk">Comprou ${l.em}</span></div><small>Comprou: ${a.produto}${quando(a)}</small></article>`;
}

function abaDaLoja(l) {
  return h`<div class="av-aba" id="p-${l.aba}" role="tabpanel" aria-labelledby="p-t-${l.aba}" data-aba="${l.aba}" data-row="${l.fileira}" hidden>${resumoDaLoja(l)}<p class="av-sub">Todas as ${String(l.d.avaliacoes.length)} avaliações com comentário de quem comprou ${l.em} (${String(l.quantidade)} avaliações ao todo). Sem nome e sem foto de quem avaliou. Dados de ${l.copiadoEm}. <a href="${l.link}" target="_blank" rel="noopener">${l.todas}</a></p><div class="av-row av-cards" id="${l.fileira}">${l.d.avaliacoes.map((a) => cartaoDaLoja(l, a))}</div></div>`;
}

export default function avaliacoes(dados, ctx) {
  const loja = notasDaLoja(dados);
  const outras = lojas(dados);
  const destaques = dadosDe(dados, "destaques");
  const fotos = fotosDaInicial(dados);
  const tambem = outras.map((l, i) => h`${i ? " e " : ""}${l.em} (${l.nota} · ${String(l.quantidade)} avaliações)`);
  return h`<section class="view" id="p-avaliacoes" hidden><div class="wrap">
<nav class="crumbs"><a href="#inicio">Início</a> › <span>Avaliações de clientes</span></nav>
<div class="av-hero"><span class="eyebrow">Avaliações</span><h2 class="t1">Avaliações de clientes</h2><p>Vídeos, fotos e opiniões de quem já fez a transformação com o Gloss Brumar, em casa e no salão.</p>
<div class="av-nota"><b>${loja.nota}</b><span class="stars" aria-hidden="true">★★★★★</span><span>${String(loja.quantidade)} avaliações na loja oficial</span></div>${outras.length ? h`<p class="av-outras">Também avaliada ${tambem}.</p>` : ""}</div>
<nav class="av-jump" aria-label="Ir para"><span>Ir direto para:</span><button type="button" data-go="av-videos">Vídeos</button><button type="button" data-go="av-fotos">Fotos</button><button type="button" data-go="av-salao">Cabeleireiras</button><button type="button" data-go="av-clientes">Clientes</button></nav>

<div class="av-sec" id="av-videos"><div class="av-h"><div><span class="eyebrow">Vídeos</span><h2>Vídeos de resultados e depoimentos</h2></div>${setas("row-v")}</div>
<p class="av-sub">Toque no vídeo para assistir. Arraste para o lado para ver mais.</p>
<div class="av-row av-vids" id="row-v"></div></div>

<div class="av-sec" id="av-fotos"><div class="av-h"><div><span class="eyebrow">Fotos</span><h2>Quem usa, mostra</h2></div>${setas("row-f")}</div>
<p class="av-sub">Fotos enviadas pelas clientes. Toque para ampliar. Os resultados variam conforme o cabelo e a aplicação.</p>
<div class="av-row av-fotos" id="row-f">${visiveis(destaques["pagina-fotos"]).map((f, k) => h`<button type="button" class="avf" aria-label="Ampliar foto de resultado ${String(k + 1)}"><img src="${arquivo(ctx, f.arquivo)}" alt="Resultado real de cliente Brumar, antes e depois" loading="lazy"></button>`)}</div></div>

<div class="av-sec" id="av-salao"><div class="av-h"><div><span class="eyebrow">Para cabeleireiras</span><h2>Quem é do salão aprova</h2></div>${setas("row-s")}</div>
<p class="av-sub">Avaliações de cabeleireiras e cabeleireiros que usam o Gloss Brumar com as clientes.</p>
<div class="av-row av-cards" id="row-s">${cartoesLigados(dados, destaques["pagina-salao"]).map((c) => cartaoDeAvaliacao(ctx, c, fotos, true))}</div></div>

<div class="av-sec" id="av-clientes"><div class="av-h"><div><span class="eyebrow">Clientes</span><h2>O que dizem as clientes</h2></div>${setas("row-c")}</div>
${abas("p", loja.nota, outras)}<div class="av-aba" id="p-site" role="tabpanel" aria-labelledby="p-t-site" data-aba="site" data-row="row-c"><p class="av-sub">Avaliações de quem comprou na loja oficial da Brumar.</p>
<div class="av-row av-cards" id="row-c">${cartoesLigados(dados, destaques["pagina-clientes"]).map((c) => cartaoDeAvaliacao(ctx, c, fotos, false))}</div></div>${outras.map(abaDaLoja)}</div>

<div class="av-fim"><h2>Chegou a sua vez de transformar</h2><p>Liso com brilho espelhado desde a primeira aplicação, sem formol.</p><div class="av-fim-b"><a class="btn buy" href="${linkDaTela(dados, "kit-completo-1l", "#mais-vendido")}">Quero meu liso</a><a class="btn wa-o" href="${linkDeDuvida(dados.marca)}" target="_blank" rel="noopener">${ICONE_WHATSAPP}Tirar dúvida no WhatsApp</a></div></div>
</div></section>
<div class="avlb" id="avlb" hidden><button type="button" class="avlb-x" aria-label="Fechar foto">×</button><img alt="Foto ampliada de resultado"></div>
`;
}
