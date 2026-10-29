// Comunidade Brumar: os números do inicial.json, o total de avaliações pelas contas (o mesmo da seção de avaliações),
// as 6 redes e o Grupo VIP do marca.json. Ícone e nome de cada rede são parte fixa.
import { h } from "../../html.mjs";
import { cabecalho, dadosDe, ICONE_WHATSAPP, notasDaLoja } from "./comum.mjs";

const REDES = {
  instagram: ["Instagram", h`<svg viewBox="0 0 24 24" class="i"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/></svg>`],
  tiktok: ["TikTok", h`<svg viewBox="0 0 24 24" class="i"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.4 4.4 5 4.6"/></svg>`],
  youtube: ["YouTube", h`<svg viewBox="0 0 24 24" class="i"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/></svg>`],
  facebook: ["Facebook", h`<svg viewBox="0 0 24 24" class="i"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg>`],
  kwai: ["Kwai", h`<svg viewBox="0 0 24 24" class="i"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/></svg>`],
  threads: ["Threads", h`<svg viewBox="0 0 24 24" class="i"><path d="M16.5 11.2c-.4-2.6-2.1-3.9-4.4-3.9-2.7 0-4.4 2-4.4 4.7s1.7 4.7 4.4 4.7c2 0 3.5-1 3.5-2.8 0-2.6-3.6-2.8-5.4-2.1"/><path d="M19.5 8.5C18.2 5.3 15.6 3.5 12 3.5 7 3.5 4 7 4 12s3 8.5 8 8.5c3.4 0 6-1.7 7-4.7"/></svg>`],
};

export default function comunidade(dados) {
  const d = dadosDe(dados, "inicial").comunidade;
  const { marca } = dados;
  const redes = Object.entries(marca.redes ?? {}).filter(([, url]) => url).map(([rede, url]) => {
    const jeito = REDES[rede];
    if (!jeito) throw new Error(`marca.json: rede desconhecida (${rede})`);
    return h`<a class="btn ghost cm-soc" href="${url}" target="_blank" rel="noopener">${jeito[1]}${jeito[0]}</a>`;
  });
  return h`<section id="comunidade">
<div class="wrap">
${cabecalho(d, true)}
<div class="cm-stats">${d.numeros.map((n, i) => (i === 0
    ? h`<div class="cm-big"><b>${n.numero}</b><span>${n.texto}</span></div>`
    : h`<div><b>${n.numero}</b><span>${n.texto}</span></div>`))}<div><b>+${String(notasDaLoja(dados).quantidade)}</b><span>${d["texto-avaliacoes"]}</span></div></div>
<p class="cm-lead">${d.redes}</p>
<div class="cm-btns">${redes}</div>
<div class="cmvip"><span class="eyebrow">${d["vip-chamada"]}</span><h3>${d["vip-titulo"]}</h3>
<ul>${d["vip-itens"].map((item) => h`<li><svg class="i"><use href="#i-check"/></svg>${item}</li>`)}</ul>
<a class="btn cmvip-b" href="${marca["grupo-vip"]}" target="_blank" rel="noopener">${ICONE_WHATSAPP}${d["vip-botao"]}</a><small>${d["vip-nota"]}</small></div>
</div>
</section>

`;
}
