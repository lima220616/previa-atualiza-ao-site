// "Resultados reais": as fotos e os vídeos do resultados.json, cada um numa fileira de arrastar com setas e contador.
// O tipo da foto escolhe a classe e o texto para o leitor de tela (parte fixa).
import { h } from "../../html.mjs";
import { arquivo, botaoFinal, cabecalho, dadosDe, linkDeCompra, ICONE_PLAY, visiveis } from "./comum.mjs";
import { marca as marcaDoPainel } from "../moldura/previa.mjs";

const FOTOS = {
  "antes-e-depois": ["resimg dupla", "Antes e depois da mesma cliente com o Gloss Brumar"],
  resultado: ["resimg", "Resultado real com o Gloss Brumar"],
  comentario: ["resimg", "Comentário de cliente sobre o Gloss Brumar"],
};

function foto(ctx, f) {
  const jeito = FOTOS[f.tipo];
  if (!jeito) throw new Error(`resultados.json: tipo de foto desconhecido (${f.tipo})`);
  return h`<img class="${jeito[0]}" src="${arquivo(ctx, f.arquivo)}" alt="${jeito[1]}" loading="lazy">`;
}

function video(ctx, v, n) {
  const capa = v.capa ? h` poster="${arquivo(ctx, v.capa)}"` : null; // sem capa (o painel deixa), sem o atributo
  return h`<div class="rv2-c"><video src="${arquivo(ctx, v.arquivo)}"${capa} playsinline preload="none" aria-label="${v.titulo || `Vídeo de resultado ${n}`}"></video><button type="button" class="vplay-b" aria-label="Assistir o vídeo de resultado ${String(n)}">${ICONE_PLAY}</button></div>`;
}

export default function resultados(dados, ctx) {
  const d = dadosDe(dados, "inicial").resultados;
  const r = dadosDe(dados, "resultados");
  const fotos = visiveis(r.fotos);
  const videos = visiveis(r.videos);
  return h`<section id="resultados">
<div class="wrap">
${cabecalho(d)}
<h3 class="res-sub">Fotos</h3><div class="res-grid res-car" id="rescar">${fotos.map((f) => foto(ctx, f))}</div><div class="res-nav"><button type="button" class="res-a" id="res-prev" aria-label="Foto anterior">‹</button><span class="res-c" id="res-c">1 / ${String(fotos.length)}</span><button type="button" class="res-a" id="res-next" aria-label="Próxima foto">›</button></div><h3 class="res-sub">Vídeos</h3><p class="res-sub-p">Toque no vídeo para assistir com som. Arraste para o lado para ver mais.</p><div class="rv2-row" id="resvid"${marcaDoPainel(ctx, "resultados", "videos")} role="list" aria-label="Vídeos de resultado">${videos.map((v, k) => video(ctx, v, k + 1))}</div><div class="res-nav"><button type="button" class="res-a" id="rv2-prev" aria-label="Vídeo anterior">‹</button><span class="res-c" id="rv2-c">1 / ${String(videos.length)}</span><button type="button" class="res-a" id="rv2-next" aria-label="Próximo vídeo">›</button></div>

${botaoFinal(d.botao, linkDeCompra(dados))}
</div>
</section>



`;
}
