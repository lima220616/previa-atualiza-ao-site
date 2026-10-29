// O bloco de dados da página inicial (<script type="application/json" id="dados-site">): o que os programas da página
// (molde/js/) precisam e antes ficava escrito dentro deles. Não é programa (a regra de segurança aceita, como o bloco
// para o Google). Só o que a página já mostra ou usa, campo por campo (a lista permitida está no teste
// testes-node/bloco-de-dados.test.mjs): nada do avaliacoes.json além dos avisos do canto (de cartões à vista na página,
// com a foto só quando liberada), nenhum id de avaliação, número de produto da Yampi (produto_yampi) ou e-mail. Os
// códigos de compra dos kits já são públicos (vão no link de pagamento). Funções puras.
import { h, cru } from "../../html.mjs";
import { blocoDeDados } from "../../seguro.mjs";
import { cartoesLigados } from "../inicial/comum.mjs";
import { brindeDaLoja, campanhasNoPrazo, endereco, fimDaData, fimEscrito, secaoLigada } from "./comum.mjs";

// Os kits que podem aparecer (visíveis no kits.json), pela chave: o código da Yampi (a compra vai pela chave do botão,
// nunca pelo nome escrito), o nome curto (a chamada final), a foto (a foto grande troca com a opção) e se o cupom da
// campanha vale nele.
function kits(dados, ctx) {
  const lista = {};
  for (const [chave, kit] of Object.entries(dados.kits ?? {})) {
    if (kit?.visivel === false) continue;
    lista[chave] = { codigo: kit["codigo-yampi"], "nome-curto": kit["nome-curto"], foto: endereco(ctx, kit.foto),
      cupom: kit["aceita-cupom"] === true };
  }
  return lista;
}

// Frete, brinde e o maior desconto de cupom (com ele, o "brinde garantido" só aparece quando o brinde vem mesmo).
function condicoes(dados) {
  const c = dados.marca.condicoes;
  const cupons = dados.marca.cupons ?? {};
  const brinde = brindeDaLoja(dados);
  return {
    "frete-gratis-acima": c["frete-gratis-acima"], "brinde-acima": c["brinde-acima"], brinde: brinde.nome,
    "brinde-curto": brinde.kit["nome-curto"],
    "desconto-maximo": Math.max(Number(cupons["primeira-compra-porcento"]) || 0, Number(cupons.campanha?.porcento) || 0),
  };
}

// As campanhas no prazo (a 1ª é a da faixa) e o cupom da campanha com a data dele. O cupom vai mesmo depois da data:
// é com ela que o programa tira o cupom vencido do link de quem chega pelo anúncio antigo (?cupom=). Não aparece na tela.
function campanhas(dados, ctx) {
  return campanhasNoPrazo(dados, ctx).map((c) => ({ titulo: c.titulo, texto: c.texto, fim: fimEscrito(c.termina) }));
}

function cupom(dados) {
  const c = dados.marca.cupons?.campanha;
  if (!c?.codigo) return null;
  fimDaData(c.termina, "marca.json (cupom da campanha)");
  return { codigo: c.codigo, "onde-vale": c["onde-vale"] ?? "", fim: fimEscrito(c.termina) };
}

// O resultado do quiz (quiz.json, "resultados"): o nome do kit vem do kits.json. Sem a seção, nada.
function quiz(dados) {
  if (!secaoLigada(dados, "qual-kit")) return {};
  const lista = {};
  for (const [chave, r] of Object.entries(dados.quiz?.resultados ?? {})) {
    const kit = dados.kits?.[r.kit];
    if (!kit) throw new Error(`quiz.json, resultado "${chave}": o kit "${r.kit}" não existe no kits.json`);
    if (!dados.produtos?.[r.tela]) throw new Error(`quiz.json, resultado "${chave}": a tela "${r.tela}" não existe no produtos.json`);
    lista[chave] = { nome: kit.nome, rendimento: r.rendimento, porque: r["por-que"], tela: r.tela, kit: r.kit };
  }
  return lista;
}

// O aviso de compra no canto: os cartões em destaque da inicial que têm "aviso" (avaliação escondida tira o cartão e o
// aviso; foto só a do cartão, que só existe com as fotos liberadas).
function avisos(dados, ctx) {
  return cartoesLigados(dados, dados.destaques?.inicial).filter((c) => c.aviso?.texto)
    .map((c) => ({ nome: c.nome, texto: c.aviso.texto, comprou: c.aviso.comprou ?? "", foto: c.foto ? endereco(ctx, c.foto) : "" }));
}

export function dadosDoSite(dados, ctx) {
  return {
    whatsapp: dados.marca.whatsapp,
    condicoes: condicoes(dados),
    kits: kits(dados, ctx),
    campanhas: campanhas(dados, ctx),
    cupom: cupom(dados),
    quiz: quiz(dados),
    avisos: avisos(dados, ctx),
  };
}

export function blocoDoSite(dados, ctx) {
  return h`<script type="application/json" id="dados-site">${cru(blocoDeDados(dadosDoSite(dados, ctx)))}</script>`;
}
