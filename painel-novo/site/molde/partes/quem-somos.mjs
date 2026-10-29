// Tela Quem somos (a história da marca): parte fixa do molde, igual ao site de hoje. Não tem campo no painel nesta
// versão; vira dado na fase 2, se a Brumar pedir.
import { h } from "../html.mjs";

export default function quemSomos() {
  return h`<section class="view" id="p-quem-somos" hidden><div class="wrap" style="max-width:820px">
<a class="back" href="#inicio"><svg class="i" style="width:20px;height:20px"><use href="#i-arrow"/></svg>Voltar para a loja</a>
<span class="eyebrow">Nossa história</span><h2 class="t1" style="font-size:clamp(32px,5vw,46px);margin:8px 0 18px">Beleza real começa com cuidado de verdade</h2>
<p class="lead">A Brumar nasceu para transformar a autoestima com produtos de alta qualidade e fórmulas seguras. Somos uma marca de cosméticos de Goiás, criada por uma cabeleireira e especializada em alisamento e tratamento capilar sem formol.</p>
<p class="lead">O nome vem da união de <b>Bruna</b> e <b>Marcos</b>, e a borboleta do logo representa a transformação. Tudo começou em 2009, quando o casal decidiu criar os próprios produtos. O primeiro foi o Gloss, uma fórmula aperfeiçoada muitas vezes até chegar ao resultado que as clientes conhecem hoje. Em 2010, já em Morrinhos, a Brumar seguia crescendo.</p>
<p class="lead">Acreditamos que nenhuma mulher deveria escolher entre o cabelo que ama e a própria saúde. Por isso as nossas fórmulas entregam liso com brilho espelhado sem arder os olhos, sem fumaça e sem cheiro forte, para quem aplica em casa e para as cabeleireiras que confiam na Brumar no dia a dia do salão.</p>
<p class="lead">Em 2024, a família perdeu o Marcos. Os filhos, Marcos Júnior, Davi e Igor, entraram na empresa ao lado da Bruna para continuar o que os pais construíram. Hoje já são mais de 100 mil cabelos transformados com a Progressiva Gloss Brumar em todo o Brasil. A essência segue a mesma, e o nosso lema também: <b>O Poder da Transformação. Transformação que você vê, qualidade que você confia.</b></p>
<div class="res-band" style="margin-top:24px"><span class="ib" style="background:#fff"><svg class="i" style="width:24px;height:24px"><use href="#i-heart"/></svg></span><p><b>Nosso propósito:</b> cuidar dos cabelos é também cuidar da autoestima.</p></div>
<div class="bens" style="margin-top:24px"><div class="ben-c"><span class="bi"><svg class="i" style="width:26px;height:26px"><use href="#i-sparkle"/></svg></span><div><b>Missão</b><span>Transformar cabelos de forma visível, unindo alisamento e tratamento em cada aplicação.</span></div></div><div class="ben-c"><span class="bi"><svg class="i" style="width:26px;height:26px"><use href="#i-pin"/></svg></span><div><b>Visão</b><span>Ser referência brasileira em alisamento, crescendo em todo o país e fora dele.</span></div></div><div class="ben-c"><span class="bi"><svg class="i" style="width:26px;height:26px"><use href="#i-heart"/></svg></span><div><b>Valores</b><span>Resultado de verdade, fórmulas 100% sem formol e valorização da autoestima de cada cliente.</span></div></div></div>
</div></section>

`;
}
