// As 16 telas de produto (#p-gloss até #p-kit-gloss-branco), na ordem de dados/produtos.json. Tela escondida no
// painel (ou sem nenhum kit visível) não aparece. Na prévia do painel, cada tela leva a marca "produtos" e uma tela com
// dado incompleto vira um aviso na própria tela (sem a prévia, o erro para a montagem).
import { h } from "../html.mjs";
import { tela } from "./produto/tela.mjs";
import { marcado, naPrevia, marca as marcaDoPainel } from "./moldura/previa.mjs";

function telaComAviso(ctx, chave, aviso) {
  return h`<section class="view" id="p-${chave}" hidden${marcaDoPainel(ctx, "produtos", chave)}><div class="wrap">${aviso}</div></section>
`;
}

export default function (dados, ctx) {
  return h`${Object.keys(dados.produtos ?? {}).map((chave) => naPrevia(ctx, `a tela "${chave}"`,
    () => marcado(tela(dados, ctx, chave), ctx, "produtos", chave), (aviso) => telaComAviso(ctx, chave, aviso)))}`;
}
