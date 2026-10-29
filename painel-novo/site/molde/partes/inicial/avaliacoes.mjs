// "Quem comprou aprova": abas Site Brumar / Shopee / Mercado Livre. Site: nota, total e barras pelas contas a partir do
// avaliacoes.json e os cartões de destaque (destaques.json, inicial) ligados às avaliações. Shopee e Mercado Livre:
// nota, barras e as 3 em destaque do marketplaces.json, com a data da cópia. Fica sempre ligada: as fotos destes
// cartões são copiadas para a tela Avaliações, para Profissionais e para o aviso no canto.
import { h } from "../../html.mjs";
import {
  abas, barras, botaoFinal, cabecalho, cartaoDaInicial, cartoesLigados, dadosDe, estrelas, linkDeCompra, lojas, notasDaLoja, quando,
  resumoDaLoja,
} from "./comum.mjs";

function cartaoDaLoja(l, a) {
  return h`<div class="rv rv-mk"><div class="rv-b"><div class="rv-top"><b class="rv-n">Cliente ${l.de}</b><span class="rv-st"><span class="stars" aria-hidden="true">${estrelas(a.estrelas, false)}</span><b>${String(a.estrelas)},0</b></span><span class="verif mk">COMPROU ${l.em.toUpperCase()}</span></div><p>${a.texto}</p><small>Comprou: ${a.produto}${quando(a)}</small></div></div>`;
}

function abaDaLoja(l) {
  return h`<div class="av-aba" id="h-${l.aba}" role="tabpanel" aria-labelledby="h-t-${l.aba}" data-aba="${l.aba}" hidden>${resumoDaLoja(l)}<div class="rvs">${l.d.avaliacoes.filter((a) => a.destaque).map((a) => cartaoDaLoja(l, a))}</div><p class="fonte-av">Algumas avaliações com comentário. Nota e quantidade ${l.em} em ${l.copiadoEm}.</p><div style="margin-top:16px"><a class="btn ghost" href="${l.link}" target="_blank" rel="noopener">${l.todas}</a></div></div>`;
}

export default function avaliacoes(dados, ctx) {
  const d = dadosDe(dados, "inicial").avaliacoes;
  const loja = notasDaLoja(dados);
  const outras = lojas(dados);
  const cartoes = cartoesLigados(dados, dadosDe(dados, "destaques").inicial);
  return h`<section id="avaliacoes">
<div class="wrap">
${cabecalho(d)}
${abas("h", loja.nota, outras)}<div class="av-aba" id="h-site" role="tabpanel" aria-labelledby="h-t-site" data-aba="site"><div class="rev-top"><span class="nota" id="nota">${loja.nota}</span><div><div class="stars" aria-hidden="true">★★★★★</div><span id="qtd" style="font-size:14px;color:var(--texto2)">${String(loja.quantidade)} avaliações no site</span></div></div>${barras(loja.dist)}
<div class="rvs">${cartoes.map((c) => cartaoDaInicial(ctx, c))}</div>
<p class="fonte-av">Avaliações feitas na loja oficial Brumar.</p><div style="margin-top:16px"><a class="btn ghost" href="#p-avaliacoes" id="mais-av">Ver mais avaliações</a></div></div>${outras.map(abaDaLoja)}
${botaoFinal(d.botao, linkDeCompra(dados))}
</div>
</section>

`;
}
