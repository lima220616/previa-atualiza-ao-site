// "Quem usa, recomenda": os vídeos de depoimento (videos.json, depoimentos), textos do inicial.json. Sem título no
// vídeo, o leitor de tela ouve "Depoimento em vídeo N".
import { h } from "../../html.mjs";
import { arquivo, botaoFinal, cabecalho, dadosDe, linkDeCompra, visiveis } from "./comum.mjs";
import { marca as marcaDoPainel } from "../moldura/previa.mjs";

export function video(ctx, v, classe, rotulo, extra = "") {
  const capa = v.capa ? h` poster="${arquivo(ctx, v.capa)}"` : null; // sem capa (o painel deixa), sem o atributo
  return extra === "muted"
    ? h`<video class="${classe}" style="padding:0;object-fit:cover;width:100%" src="${arquivo(ctx, v.arquivo)}"${capa} muted playsinline preload="none" aria-label="${rotulo}"></video>`
    : h`<video class="${classe}" src="${arquivo(ctx, v.arquivo)}"${capa} playsinline preload="none" aria-label="${rotulo}"></video>`;
}

export default function depoimentos(dados, ctx) {
  const d = dadosDe(dados, "inicial").depoimentos;
  const lista = visiveis(dadosDe(dados, "videos").depoimentos?.videos);
  return h`<section id="depoimentos">
<div class="wrap">
${cabecalho(d, true)}
<p style="text-align:center;max-width:640px;margin:-10px auto 22px;color:var(--texto2)">${d["texto-2"]}</p>
<div class="vt" id="vt"${marcaDoPainel(ctx, "videos", "depoimentos")}>${lista.map((v, k) => h`<div class="vt-s">${video(ctx, v, "vt-v", v.titulo || `Depoimento em vídeo ${k + 1}`)}</div>`)}</div>
<div class="res-nav vt-nav"><button type="button" class="res-a" id="vt-prev" aria-label="Vídeo anterior">‹</button><span class="res-c" id="vt-c">1 / ${String(lista.length)}</span><button type="button" class="res-a" id="vt-next" aria-label="Próximo vídeo">›</button></div>
${botaoFinal(d.botao, linkDeCompra(dados))}
</div>
</section>

`;
}
