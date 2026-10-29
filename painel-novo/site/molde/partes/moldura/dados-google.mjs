// O que a página conta para a busca do Google sobre os produtos: os dados de produto (schema.org/Product) que a
// cabeça junta no @graph do JSON-LD, ao lado da loja (Organization) e do site (WebSite). O texto alternativo das fotos
// fica em texto-alternativo.mjs.
// Tudo sai dos dados, pelas mesmas contas que a página mostra: preço pelo kits.json (contas.mjs) e nota e total de
// avaliações pelo avaliacoes.json (avaliação escondida fica de fora, texto repetido conta uma vez). Funções puras.
import { arredondarCentavo } from "../../contas.mjs";
import { link } from "../../seguro.mjs";
import { kitPrincipal, telaVisivel } from "../produto/comum.mjs";
import { opcoesDaTela, galeria } from "../produto/opcoes.mjs";
import { grupoDaTela } from "../produto/avaliacoes.mjs";

// Endereço completo de uma foto dos dados ("/arquivos/x.webp" ou "foto:..." do painel), como o Google pede.
function fotoCompleta(site, ctx, caminho) {
  const s = String(caminho ?? "");
  const u = /^(foto|video):/.test(s) ? String(ctx.url(s)) : s;
  link(u, "foto do produto");
  return u.startsWith("/") ? site + u.slice(1) : u;
}

// "5,0" (a nota que a página mostra) -> "5.0" (o número que o Google lê).
const notaDoGoogle = (nota) => nota.replace(",", ".");

// O Product de uma tela que aparece (null: tela escondida ou sem kit visível). A nota (aggregateRating) só vai na tela
// da própria família de avaliações (Gloss Matizado, Gloss Branco, Shampoo, Leave-in...), com a mesma conta da nota do
// topo da tela; os kits e combos que mostram a nota "do Gloss Matizado" ficam sem ela (a nota é do produto, não do combo).
// Sem "review" (avaliações uma a uma): as que o Google receberia não são as que a tela mostra naquela página, e o
// Google pede que o que vai no JSON-LD esteja à vista de quem abre a página. A nota e o total, sim, estão.
function produtoDaTela(dados, ctx, chave) {
  if (!telaVisivel(dados, chave)) return null;
  const principal = kitPrincipal(dados, chave);
  if (!principal) return null;
  const site = dados.marca.site;
  const p = dados.produtos[chave];
  const precos = opcoesDaTela(dados, chave, principal).map((o) => dados.kits[o.kit].preco);
  const g = galeria(dados, ctx, chave);
  const foto = g ? g.primeira.foto : dados.kits[principal].foto;
  const url = `${site}#p-${chave}`;
  const produto = {
    "@type": "Product", "@id": `${url}-produto`, name: p.nome, description: p.chamada || p["descricao-no-menu"] || p.nome,
    image: fotoCompleta(site, ctx, foto), url, brand: { "@type": "Brand", name: dados.marca.nome },
    offers: {
      "@type": "AggregateOffer", priceCurrency: "BRL", lowPrice: arredondarCentavo(Math.min(...precos)),
      highPrice: arredondarCentavo(Math.max(...precos)), offerCount: precos.length,
      availability: "https://schema.org/InStock", url,
    },
  };
  const grupo = grupoDaTela(dados, chave);
  if (grupo.propria && grupo.quantidade) {
    produto.aggregateRating = { "@type": "AggregateRating", ratingValue: notaDoGoogle(grupo.nota), reviewCount: grupo.quantidade,
      bestRating: 5, worstRating: 1 };
  }
  return produto;
}

// Um Product por tela de produto que aparece, na ordem do produtos.json. Duas telas com o mesmo nome (o Kit Completo
// de 300 ml e o de 1 L) são um produto só: fica a primeira. Na prévia do painel, uma tela com dado pela metade fica
// só sem o Product (a tela dela já mostra o aviso; a cabeça não pode derrubar a página inteira); fora dela, para.
export function produtosDoGoogle(dados, ctx) {
  const lista = [];
  const nomes = new Set();
  for (const chave of Object.keys(dados.produtos ?? {})) {
    let produto;
    try {
      produto = produtoDaTela(dados, ctx, chave);
    } catch (erro) {
      if (ctx?.previa) continue;
      throw erro;
    }
    if (!produto || nomes.has(produto.name)) continue;
    nomes.add(produto.name);
    lista.push(produto);
  }
  return lista;
}

// O bloco para o Google da cabeça (Organization e WebSite) com os produtos no mesmo @graph: um <script> só.
export function comOsProdutos(bloco, dados, ctx) {
  return { ...bloco, "@graph": [...bloco["@graph"], ...produtosDoGoogle(dados, ctx)] };
}
