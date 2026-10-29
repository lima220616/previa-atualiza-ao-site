// Avaliações nas telas de produto: a nota do topo e o resumo (da família certa, pelas contas a partir de
// dados/avaliacoes.json), os cartões de "Resultados reais" (ligados à avaliação de verdade: se ela for escondida, o
// cartão some), os 3 cartões em destaque (os mesmos da página inicial: destaques.json, "inicial") e a caixa de avaliação.
import { h } from "../../html.mjs";
import { avaliacoesVisiveis, resumoDasNotas } from "../../contas.mjs";
import { cartoesLigados, cartaoDaInicial, fotoLiberada } from "../inicial/comum.mjs";
import { arquivo, nomeDoProduto } from "./comum.mjs";
import { VISTO, caixaDeAvaliacao } from "./fixos.mjs";

// As avaliações que aparecem no site (contadas de novo a cada tela: a prévia do painel pode mudar os dados entre uma
// montagem e outra).
export function visiveis(dados) {
  const lista = dados.avaliacoes?.avaliacoes ?? [];
  return { todas: avaliacoesVisiveis(lista), porId: new Map(lista.map((a) => [a.id, a])) };
}

// O nome da família ("Gloss Matizado"): fica na tela do produto dela (produtos.<tela>.familia).
function nomeDaFamilia(dados, chave) {
  for (const p of Object.values(dados.produtos)) if (p.familia?.chave === chave) return p.familia.nome;
  throw new Error(`produtos.json: a família de avaliações "${chave}" não está em nenhuma tela`);
}

// O grupo de avaliações da tela: as da família dela; sem família, ou família ainda sem avaliação, a loja toda.
export function grupoDaTela(dados, chave) {
  const p = dados.produtos[chave];
  const { todas } = visiveis(dados);
  const familia = p["avaliacoes-da-familia"];
  const daFamilia = familia ? todas.filter((a) => a.familia === familia) : [];
  if (!daFamilia.length) return { ...resumoDasNotas(todas), de: "", propria: false };
  return { ...resumoDasNotas(daFamilia), de: ` do ${nomeDaFamilia(dados, familia)}`, propria: p.familia?.chave === familia };
}

// O produto da Yampi que recebe a avaliação feita nesta tela (o campo oculto "produto_yampi" da caixa; a função
// /api/avaliacao manda para ele). Os produtos da Yampi ficam nas famílias (produtos.<tela>.familia.produtos-yampi:
// endereço -> { nome, kit }). Vale, nesta ordem: o da família da tela com o mesmo kit principal da tela ("kit" do
// produtos.json: o produto avaliado não muda quando o painel esconde uma opção); o primeiro da família da tela; o de
// qualquer família com o mesmo kit (kits e combos não têm família). Sem nenhum deles: vazio (""), e a avaliação fica
// só no Netlify Forms (antes caía no Gloss Matizado, e a avaliação de um combo ia para o produto errado na Yampi).
export function produtoYampiDaTela(dados, chave) {
  const p = dados.produtos?.[chave];
  if (!p) throw new Error(`produtos.json: a tela "${chave}" não existe`);
  const doKit = (familia) => Object.entries(familia?.["produtos-yampi"] ?? {}).find(([, info]) => info?.kit && info.kit === p.kit)?.[0];
  const daFamilia = Object.keys(p.familia?.["produtos-yampi"] ?? {});
  const slug = doKit(p.familia) ?? daFamilia[0]
    ?? Object.values(dados.produtos).map((outra) => doKit(outra.familia)).find(Boolean) ?? "";
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`produtos.json, "${chave}": endereço da Yampi estranho: "${slug}"`);
  return slug;
}

// "473 avaliações" (e "1 avaliação", quando um produto recebe a primeira).
const avaliacoes = (n) => `${n} ${n === 1 ? "avaliação" : "avaliações"}`;

// "★★★★★ 5,0 (473 avaliações do Gloss Matizado)" ao lado do nome (só quando a tela tem avaliações próprias).
export function notaDoTopo(grupo) {
  if (!grupo.de) return null;
  return h`<div class="rate"><span class="stars">★★★★★</span><b>${grupo.nota}</b><span>(${avaliacoes(grupo.quantidade)}${grupo.propria ? "" : grupo.de})</span></div>`;
}

// O texto da avaliação no cartão de resultado, limpo como no gerador de hoje: uma linha só, primeira letra maiúscula
// e ponto no fim.
function textoDoCartao(texto) {
  const t = String(texto).split(/\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/).map((l) => l.trim()).filter(Boolean).join(" ");
  const c = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?…]$/.test(c) ? c : c + ".";
}

// "Resultados reais de quem usa": as fotos das clientes (só de avaliação que aparece e com a foto liberada).
export function resultadosReais(dados, ctx, chave) {
  const { porId } = visiveis(dados);
  const cartoes = (dados.produtos[chave].resultados ?? []).map((r) => {
    const a = porId.get(r.avaliacao);
    if (!a || a.oculta || !fotoLiberada(a)) return null;
    return h`<article class="rr-c"><div class="rr-f"><img src="${arquivo(ctx, r.foto)}" alt="Foto de resultado enviada por ${a.nome}" loading="lazy"></div><div class="rr-b"><span class="stars" aria-label="${a.nota} estrelas">${"★".repeat(a.nota)}</span><p>“${textoDoCartao(a.texto)}”</p><div class="avc-f"><b>${a.nome}</b><span class="verif">${VISTO}Avaliação da loja Brumar</span></div><small>Comprou: ${a.produto}</small></div></article>`;
  }).filter(Boolean);
  if (!cartoes.length) return null;
  return h`<div class="pp-sec rr"><span class="eyebrow">Avaliações</span><h2>Resultados reais de quem usa</h2><p class="rr-sub">Fotos enviadas pelas clientes, com autorização.</p><div class="rr-g">${cartoes}</div><p class="rr-nota">Os resultados variam conforme o tipo de cabelo e a aplicação.</p><div class="rr-cta"><a class="btn ghost" href="#p-avaliacoes">Ver mais avaliações</a></div></div>`;
}

// "O que dizem as clientes": resumo da família, os cartões em destaque e a caixa para a cliente avaliar.
export function oQueDizem(dados, ctx, chave, grupo, whatsapp) {
  if (!dados.destaques) throw new Error("molde: falta o dados/destaques.json (os cartões em destaque das telas de produto)");
  const cartoes = cartoesLigados(dados, dados.destaques.inicial).map((c) => cartaoDaInicial(ctx, c));
  return h`<div class="pp-sec"><span class="eyebrow">Avaliações</span><h2>O que dizem as clientes</h2>
<div class="rv-sum"><span class="big">${grupo.nota}</span><div><div class="stars">★★★★★</div><span>${avaliacoes(grupo.quantidade)}${grupo.de} na loja oficial Brumar</span></div></div>
<div class="rvs">${cartoes}</div><a class="btn ghost" href="#p-avaliacoes" style="margin-top:16px">Ver mais avaliações</a>${caixaDeAvaliacao(chave, nomeDoProduto(dados, chave), whatsapp, produtoYampiDaTela(dados, chave))}</div>`;
}
