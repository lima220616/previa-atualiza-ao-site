// Ajudas da moldura da página (cabeça, topo e rodapé): endereço de foto e vídeo, links do WhatsApp, número escrito,
// valor redondo, o que está visível e a campanha da vez. Funções puras (Node e navegador).
import { cru } from "../../html.mjs";
import { atributo, link } from "../../seguro.mjs";
import { formatarReais } from "../../contas.mjs";

// Foto ou vídeo dos dados ("/arquivos/x.webp", ou "foto:..."/"video:..." do painel) pronto para src e poster. O endereço
// é conferido como link antes de o espelho tirar a "/" do começo (o h`` recusaria "arquivos/x.webp" sem a barra).
export function arquivo(ctx, caminho) {
  return cru(atributo(endereco(ctx, caminho)));
}

// O mesmo endereço, como texto (para o bloco de dados da página).
export function endereco(ctx, caminho) {
  const s = String(caminho ?? "");
  if (/^(foto|video):/.test(s)) {
    const u = String(ctx.url(s)).trim();
    link(u, "foto ou vídeo do painel");
    return u;
  }
  link(s, "foto ou vídeo");
  return ctx.rel(s);
}

// A mensagem no link do WhatsApp escrita como o gerador de hoje (o quote do Python: também ! ' ( ) * viram código).
export function codificar(mensagem) {
  return encodeURIComponent(mensagem).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// Link do WhatsApp sempre com o número do marca.json; sem mensagem, o link puro (como os botões gerais de hoje).
export function linkDoWhatsapp(marca, mensagem = "") {
  const numero = String(marca?.whatsapp ?? "");
  if (!/^[0-9]{10,15}$/.test(numero)) throw new Error(`marca.json: número do WhatsApp inválido (${numero})`);
  return `https://wa.me/${numero}` + (mensagem ? `?text=${codificar(mensagem)}` : "");
}

// "5564993192101" -> "(64) 99319-2101"
export function numeroEscrito(marca) {
  const n = String(marca.whatsapp).replace(/^55/, "");
  return `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}`;
}

// O telefone dos dados do Google, do mesmo WhatsApp (o painel só muda o "whatsapp"): "+55 64 99319-2101".
export function telefoneDoGoogle(marca) {
  const n = String(marca.whatsapp).replace(/^55/, "");
  return `+55 ${n.slice(0, 2)} ${n.slice(2, -4)}-${n.slice(-4)}`;
}

// "R$ 300" para valor inteiro; com centavos, "R$ 299,90".
export function reaisRedondo(valor) {
  return formatarReais(valor).replace(/,00$/, "");
}

// Tela de produto escondida no painel (produtos.<chave>.visivel = false) e seção desligada (secoes.<id>.ligada = false).
// A tela com todos os kits escondidos (kits.<chave>.visivel = false) também some (não tem o que vender: produto/tela.mjs),
// e os links para ela, junto (senão a conferência final do montador para a publicação: "link #p-... sem destino").
// As telas fixas (Dúvidas, Avaliações, Lucre...) não estão no produtos.json: sempre aparecem.
export function paginaVisivel(dados, chave) {
  const p = dados.produtos?.[chave];
  if (!p) return true;
  if (p.visivel === false) return false;
  return !Array.isArray(p.opcoes) || p.opcoes.some((k) => dados.kits?.[k]?.visivel !== false);
}

// Link para uma tela de produto (o "#p-..." da página) só quando ela aparece; senão o outro destino (ou null).
export function linkDaTela(dados, chave, senao = null) {
  return paginaVisivel(dados, chave) ? `#p-${chave}` : senao;
}

export function secaoLigada(dados, id) {
  return dados.secoes?.[id]?.ligada !== false;
}

// O nome do produto de uma tela (caixa de avaliação, "Complete o tratamento", rodapé): o "produto" do produtos.json;
// sem ele, o nome do kit principal (kits.json), para o nome do kit não ficar escrito duas vezes.
export function nomeDoProduto(dados, chave) {
  const p = dados.produtos?.[chave];
  if (!p) throw new Error(`produtos.json: a tela "${chave}" não existe`);
  const nome = p.produto ?? dados.kits?.[p.kit]?.nome;
  if (!nome) throw new Error(`produtos.json, "${chave}": sem o nome do produto (nem o kit "${p.kit}" no kits.json)`);
  return nome;
}

// O brinde (marca.json, condicoes.brinde-produto = a chave da tela dele): o nome é o da tela e a foto, a do kit dela.
export function brindeDaLoja(dados) {
  const chave = dados.marca?.condicoes?.["brinde-produto"];
  const p = dados.produtos?.[chave];
  const kit = dados.kits?.[p?.kit];
  if (!p?.nome || !kit) throw new Error(`marca.json: o brinde "${chave}" não é uma tela do produtos.json com kit no kits.json`);
  return { nome: p.nome, kit };
}

// "2026-11-04T23:59" (horário de Brasília, sem horário de verão) -> o fim daquele minuto, como os programas contam.
// Data mal escrita para a montagem.
export function fimDaData(termina, onde) {
  const s = String(termina ?? "");
  const fim = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? Date.parse(`${s}:59-03:00`) : NaN;
  if (Number.isNaN(fim) || new Date(fim - 3 * 36e5).toISOString().slice(0, 16) !== s) {
    throw new Error(`${onde}: data de término mal escrita (${s || "vazia"}); use AAAA-MM-DDTHH:MM`);
  }
  return fim;
}

// As campanhas no prazo: as ligadas que ainda não acabaram (ctx.agora), da que termina primeiro para a última. Toda
// data é conferida, também a das desligadas (data mal escrita para a montagem).
export function campanhasNoPrazo(dados, ctx) {
  const lista = dados.campanhas?.lista ?? [];
  if (!Array.isArray(lista)) throw new Error("campanhas.json: a lista de campanhas não é uma lista");
  return lista
    .map((c, i) => ({ ...c, fim: fimDaData(c?.termina, `campanhas.json (campanha ${i + 1})`) }))
    .filter((c) => c.ligada === true && c.fim > ctx.agora.getTime())
    .sort((a, b) => a.fim - b.fim);
}

// A campanha da faixa e da contagem: a que termina primeiro. Nenhuma no prazo = null (a montagem não gera nada da
// campanha). As outras aparecem sem contagem na faixa rolante; quando a da vez acaba, o programa da página põe a
// próxima na faixa (as datas vão no bloco de dados).
export function campanhaDaVez(dados, ctx) {
  return campanhasNoPrazo(dados, ctx)[0] ?? null;
}

// "2026-11-04T23:59" -> "2026-11-04T23:59:59-03:00" (o fim do minuto, horário de Brasília), para o programa da página.
export function fimEscrito(termina) {
  return `${termina}:59-03:00`;
}

// O cupom da campanha (marca.json) enquanto vale; depois da data, null.
export function cupomDaCampanha(dados, ctx) {
  const cupom = dados.marca?.cupons?.campanha;
  if (!cupom?.codigo) return null;
  return fimDaData(cupom.termina, "marca.json (cupom da campanha)") > ctx.agora.getTime() ? cupom : null;
}
