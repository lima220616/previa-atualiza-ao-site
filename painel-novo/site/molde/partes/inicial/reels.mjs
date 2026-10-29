// "Veja a aplicação na prática": os vídeos do videos.json (na-pratica), com o título em cima. O texto para o leitor de
// tela vem das descrições da mesma seção (pela chave do título); sem descrição, vale o título.
import { h } from "../../html.mjs";
import { botaoFinal, cabecalho, dadosDe, linkDeCompra, visiveis } from "./comum.mjs";
import { video } from "./depoimentos.mjs";
import { marca as marcaDoPainel } from "../moldura/previa.mjs";

const chaveDoTitulo = (titulo) => String(titulo).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function reels(dados, ctx) {
  const d = dadosDe(dados, "inicial").reels;
  const pratica = dadosDe(dados, "videos")["na-pratica"] ?? {};
  const descricoes = pratica.descricoes ?? {};
  return h`<section id="reels">
<div class="wrap">
${cabecalho(d)}
<div class="reels"${marcaDoPainel(ctx, "videos", "na-pratica")}>${visiveis(pratica.videos).map((v) => h`<figure class="rl"><span class="rl-t">${v.titulo}</span>${video(ctx, v, "reel", descricoes[chaveDoTitulo(v.titulo)] || v.titulo, "muted")}</figure>`)}</div>

${botaoFinal(d.botao, linkDeCompra(dados))}
</div>
</section>

`;
}
