// "Você se identifica?": as situações do inicial.json, 7 à vista e o resto no "Ver mais situações". A primeira abre
// sozinha. "protocolo" acrescenta o link para o protocolo de tratamento na tela do Gloss (parte fixa), se ela aparece.
import { h } from "../../html.mjs";
import { cabecalho, dadosDe, linkDeCompra, paginaVisivel } from "./comum.mjs";

const A_VISTA = 7;

function situacao(dados, s, k) {
  const corpo = h`<summary><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg><span>${s.dor}</span><svg class="idf-c" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></summary><div class="idf-s"><svg class="idf-ok" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg><p><b>Com a Brumar:</b> ${s.resposta}${s.protocolo && paginaVisivel(dados, "gloss") ? h` <a class="idf-lk" href="#p-gloss" data-goto-proto="1">Clique aqui para conhecer o protocolo de tratamento</a>` : ""}</p></div>`;
  return k === 0 ? h`<details open>${corpo}</details>` : h`<details>${corpo}</details>`;
}

export default function identifica(dados) {
  const d = dadosDe(dados, "inicial").identifica;
  const lista = d.situacoes.map((s, k) => situacao(dados, s, k));
  const mais = lista.slice(A_VISTA);
  return h`<section id="identifica">
<div class="wrap">
${cabecalho(d, true)}
<p class="idf-hint">${d.dica}</p><div class="idf idf-acc">${lista.slice(0, A_VISTA)}${mais.length ? h`<div class="idf-x" id="idf-x">${mais}</div>` : ""}</div>${mais.length ? h`<button type="button" class="btn ghost more-b" data-more="idf-x" data-label="${d["botao-mais"]}" aria-expanded="false">${d["botao-mais"]}</button>` : ""}
<div class="idf-end"><h3>${d["fim-titulo"]}</h3><p style="color:var(--texto2)">${d["fim-texto"]}</p><a class="btn buy" href="${linkDeCompra(dados)}">${d["fim-botao"]}</a></div>
</div>
</section>

`;
}
