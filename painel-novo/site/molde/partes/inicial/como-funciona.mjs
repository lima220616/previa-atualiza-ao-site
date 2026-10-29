// Como funciona (parte fixa do molde, pelo atalho da especificação, ajuste 15): os 3 passos e os 3
// finalizadores, idênticos ao site de hoje. Só as fotos vêm do kits.json (a de cada produto). Viram dados na fase 2
// sem mudar a tela. Com a tela do Kit Completo 1 L escondida no painel, o botão leva para os mais vendidos.
import { h } from "../../html.mjs";
import { arquivo, kitDe, linkDeCompra } from "./comum.mjs";

export default function comoFunciona(dados, ctx) {
  return h`<section id="como-funciona">
<div class="wrap">
<div class="sec-head"><span class="eyebrow">Como funciona</span><h2>Por que o kit completo?</h2><p>Cada produto cuida de uma etapa. Sem o fio bem limpo, o Gloss não age por igual. Sem proteção térmica, o calor resseca e o liso dura menos. Juntos, entregam o resultado desde a primeira aplicação, com duração de 3 a 4 meses.</p></div>
<div class="steps">
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "shampoo-1l").foto)}" alt="Shampoo Limpeza Profunda" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-bottle"/></svg></span><span class="n">1. Limpa</span></div><h3>Shampoo Limpeza Profunda</h3><p>Com pH 6,0 neutro, remove resíduos, impurezas e acúmulo de produtos sem agredir. Deixa o fio pronto para o Gloss agir por igual.</p></div>
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "gloss-1l").foto)}" alt="Gloss Matizado" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-straight"/></svg></span><span class="n">2. Alisa</span></div><h3>Gloss Matizado</h3><p>Sem formol, faz a transformação: liso com brilho espelhado, sem frizz e sem volume. O pigmento matizador evita o amarelado em loiros e grisalhos.</p></div>
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "leavein").foto)}" alt="Leave-in Protetor Térmico" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-dryer"/></svg></span><span class="n">3. Protege do calor</span></div><h3>Leave-in Protetor Térmico</h3><p>Protege os fios do calor do secador e da prancha e dos raios UV. Facilita a finalização e faz o resultado durar mais.</p></div>
</div>
<h3 style="font-size:26px;margin:36px 0 16px">E os finalizadores, para cuidar todos os dias</h3>
<div class="steps">
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "oleo").foto)}" alt="Óleo Umectante" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-drop"/></svg></span><span class="n">Nutre</span></div><h3>Óleo Umectante</h3><p>Nutre e hidrata. Em fios porosos, use com a máscara de hidratação antes do Gloss e enxágue tudo: o Gloss sela a cutícula com os nutrientes dentro do fio.</p></div>
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "serum").foto)}" alt="Serum Repair" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-scissors"/></svg></span><span class="n">Sela as pontas</span></div><h3>Serum Repair</h3><p>Sela e protege as pontas depois da progressiva, reduz o frizz e dá brilho sem pesar. Perfume floral sofisticado.</p></div>
<div class="step"><img src="${arquivo(ctx, kitDe(dados, "cristal").foto)}" alt="Cristal Shine Perfume Capilar" class="stepimg"><div style="display:flex;align-items:center;gap:10px"><span class="ib"><svg class="i"><use href="#i-sparkle"/></svg></span><span class="n">Brilho e acabamento</span></div><h3>Cristal Shine Perfume Capilar</h3><p>Com o cabelo finalizado, borrife e espalhe com as mãos: abaixa o frizz que ficou e dá brilho espelhado na hora.</p></div>
</div>
<div class="sec-cta"><a class="btn buy" href="${linkDeCompra(dados)}">Quero meu Kit Completo</a></div>
</div>
</section>

`;
}
