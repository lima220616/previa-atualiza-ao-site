// Prévia do site (pedido de 22/10; prévia que acompanha o grupo aberto, pedido de 26/10). Monta a página a partir dos
// dados do site com o rascunho já aplicado (/painel/api/previa). Nada aqui publica: é só para olhar antes de publicar.
//   - Com o MOLDE da Opção A (/molde/montar.mjs): Link na bio → montarBio; o resto → montarPagina, com o foco.
//   - Sem o molde: Link na bio → a página /bio de verdade de hoje, com os dados do rascunho por cima (bio/); o resto →
//     prévia simplificada, uma parte por grupo.
//   - foco = "<grupo>" ou "<grupo>:<chave>" (o que está aberto no painel; grupos: textos, campanhas, secoes, produtos,
//     kits, faq, videos, resultados, videos-por-produto, bio). As partes levam data-painel="<grupo>" (e
//     data-painel-chave="<chave>"), como o molde no modo prévia (combinado com o chat do site); rolar.js rola até lá.
//   - No computador, o painel importa este arquivo e põe o HTML num iframe "srcdoc" (coluna da direita): assim as
//     regras de segurança do site (frame-ancestors 'none') continuam fechadas. No celular, o botão "Ver como fica"
//     abre /painel/previa/?foco=<grupo>, que se desenha sozinha (fim do arquivo).
//   - Texto vindo dos dados nunca vira HTML: prévia simplificada só com textContent; na /bio, os dados vão num JSON
//     com "<" trocado (não fecha o <script>) e quem desenha é bio/bio-dinamico.js, também com textContent.

export const MOLDE = "/previa-atualiza-ao-site/painel-novo/site/molde/montar.mjs"; // caminho do molde no site novo (combinado na Opção A)
export const CONTAS = "/previa-atualiza-ao-site/painel-novo/site/molde/contas.mjs"; // contas de preço do molde (precoPix, formatarReais)

// ---------- foco ----------
const PEDACO = "[a-z0-9]+(?:-[a-z0-9]+)*";
const FOCO = new RegExp(`^${PEDACO}(?::${PEDACO})?$`);
export const focoValido = (f) => (typeof f === "string" && f.length <= 120 && FOCO.test(f) ? f : "");
export function lerFoco(foco) {
  const f = focoValido(foco);
  const [grupo = "", chave = ""] = f ? f.split(":") : [];
  return { foco: f, grupo, chave };
}

// Fotos e vídeos novos do rascunho ainda não estão no site: vêm do armazenamento do painel.
export const urlDeMidia = (caminho) => {
  const c = String(caminho || "");
  if (c.startsWith("foto:")) return `/painel/api/foto?id=${encodeURIComponent(c.slice(5))}`;
  if (c.startsWith("video:")) return `/painel/api/video?id=${encodeURIComponent(c.slice(6))}`;
  return c;
};

// Contagem: só UMA no site (Brand Book) — a campanha ligada que termina primeiro (decisão de 22/10).
export function campanhaDaVez(campanhas, agora) {
  return (Array.isArray(campanhas?.lista) ? campanhas.lista : [])
    .filter((c) => c && c.ligada !== false && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(c.termina)) && new Date(`${c.termina}:00-03:00`) > agora)
    .sort((a, b) => String(a.termina).localeCompare(String(b.termina)))[0];
}

function contagem(termina, agora) {
  const ms = new Date(`${termina}:00-03:00`) - agora;
  const d = Math.floor(ms / 864e5), hr = Math.floor((ms % 864e5) / 36e5), mi = Math.floor((ms % 36e5) / 6e4);
  return `${d}d ${hr}h ${mi}min`;
}

// ---------- preços ----------
// As contas do molde (/molde/contas.mjs) quando existirem; senão, as mesmas aqui: 5% no Pix e reais do Brasil.
const centavo = (v) => Math.floor(v * 100 + 0.5 + 1e-6) / 100;
export const CONTAS_LOCAIS = {
  precoPix: (preco) => centavo(preco * 0.95),
  formatarReais: (v) => { const [i, c] = centavo(v).toFixed(2).split("."); return `R$ ${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${c}`; },
};
async function contasDoPreco(carregar) {
  try {
    const c = await carregar(CONTAS);
    if (typeof c?.precoPix === "function" && typeof c?.formatarReais === "function") return c;
  } catch { /* molde ainda não existe */ }
  return CONTAS_LOCAIS;
}

// Textos do preço de um kit: por, Pix e, com o preço "de", o de, o % OFF e a economia.
export function precosDoKit(kit, contas = CONTAS_LOCAIS) {
  const por = Number(kit?.preco);
  if (!Number.isFinite(por) || por <= 0) return null;
  const de = Number(kit?.["preco-de"]);
  const p = { por: contas.formatarReais(por), pix: contas.formatarReais(contas.precoPix(por)), de: "", off: "", economia: "" };
  if (Number.isFinite(de) && de > por) Object.assign(p, { de: contas.formatarReais(de), off: `${Math.floor((1 - por / de) * 100 + 1e-9)}% OFF`, economia: contas.formatarReais(de - por) });
  return p;
}

// ---------- pedaços de HTML que a prévia junta (só com valores conferidos ou escapados) ----------
const atributo = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON dentro de <script type="application/json">: nenhum "<" (assim "</script>" no texto não fecha o bloco).
export const jsonSeguro = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

function antesDoFim(html, marca, pedaco) {
  const i = html.toLowerCase().lastIndexOf(marca);
  return i < 0 ? html + pedaco : html.slice(0, i) + pedaco + html.slice(i);
}

// Põe o rolar.js no fim da página: ele rola até a parte do foco.
export function comRolagem(html, base, foco) {
  html = window.demoNaRaiz ? window.demoNaRaiz(html) : html;
  const f = focoValido(foco);
  if (!f) return html;
  return antesDoFim(String(html), "</body>", `<script src="${atributo(new URL("rolar.js", base).href)}" data-foco="${atributo(f)}"></script>\n`);
}

// ---------- Link na bio sem o molde: a página de verdade de hoje com os dados do rascunho ----------
// Dados que bio/iniciar.js usa: a bio, o kit da oferta (com os preços já contados) e a campanha da vez.
export function pacoteDaBio(dados, agora, contas = CONTAS_LOCAIS) {
  const bio = dados?.bio && typeof dados.bio === "object" ? dados.bio : {};
  const kit = dados?.kits?.[bio.oferta];
  const detalhe = bio["detalhes-da-oferta"]?.[bio.oferta] || {};
  const botoes = Object.entries(bio.botoes && typeof bio.botoes === "object" ? bio.botoes : {})
    .map(([chave, b]) => ({ chave, nome: String(b?.nome ?? ""), texto: String(b?.texto ?? ""), tipo: String(b?.tipo ?? ""), destino: String(b?.destino ?? "") }));
  const campanha = campanhaDaVez(dados?.campanhas, agora);
  return {
    bio: { frase: String(bio.frase ?? ""), fundo: String(bio.fundo ?? ""), principal: String(bio.principal ?? ""), oferta: String(bio.oferta ?? ""),
      "mostrar-promo": bio["mostrar-promo"] !== false, "mostrar-avaliacoes": bio["mostrar-avaliacoes"] !== false,
      "mostrar-duvidas": bio["mostrar-duvidas"] !== false, botoes },
    oferta: kit ? { id: String(bio.oferta), nome: String(kit.nome ?? ""), curto: String(kit["nome-curto"] || kit.nome || ""),
      itens: Array.isArray(kit.itens) ? kit.itens.join(" + ") : String(kit.itens ?? ""), selo: String(detalhe.selo || kit.selo || ""),
      botao: String(detalhe.botao || ""), foto: urlDeMidia(detalhe.foto || kit.foto || ""), precos: precosDoKit(kit, contas) } : null,
    campanha: campanha ? { titulo: String(campanha.titulo ?? ""), texto: String(campanha.texto ?? ""), fim: `${campanha.termina}:59-03:00` } : null,
  };
}

// Junta à página da /bio: <base> (endereços dela continuam valendo), os dados (JSON) e os programas da prévia, que
// rodam ANTES do contador da página (ele é "defer": roda só depois de a página inteira ser lida).
export function injetarNaBio(html, enderecoDaPagina, base, pacote) {
  const programa = (nome) => `<script src="${atributo(new URL(`bio/${nome}`, base).href)}"></script>\n`;
  let saida = String(html);
  const cabeca = /<head[^>]*>/i.exec(saida);
  const marcaBase = `<base href="${atributo(enderecoDaPagina)}">\n`;
  saida = cabeca ? saida.slice(0, cabeca.index + cabeca[0].length) + "\n" + marcaBase + saida.slice(cabeca.index + cabeca[0].length) : marcaBase + saida;
  return antesDoFim(saida, "</body>", `<script type="application/json" id="dados-bio-painel">${jsonSeguro(pacote)}</script>\n`
    + programa("bio-icones.js") + programa("bio-dinamico.js") + programa("iniciar.js"));
}

// A /bio de hoje: primeiro a cópia da demonstração (montar-demo.py), depois a do próprio site (no ar, o painel fica no
// mesmo endereço do site). Guardada enquanto o painel estiver aberto (só muda quando o site é publicado).
// (A página é só a moldura: o que muda vem sempre dos dados de agora, postos por cima.)
let vitrineGuardada = null;
async function vitrineDeHoje(base, buscar) {
  if (vitrineGuardada?.base === base) return vitrineGuardada;
  for (const endereco of [new URL("bio/vitrine.html", base).href, new URL("/bio/", base).href]) {
    try {
      const r = await buscar(endereco, { credentials: "same-origin" });
      if (!r.ok) continue;
      const texto = await r.text();
      // Confere que é mesmo a /bio (e não uma página de erro com status 200).
      if (/<nav class="links"/.test(texto) && /class="prova"/.test(texto)) return (vitrineGuardada = { base, endereco, texto });
    } catch { /* sem internet ou endereço que não existe: tenta o próximo */ }
  }
  return null;
}

// ---------- prévia simplificada (sem o molde) ----------
const NOMES_DAS_SECOES = { depoimentos: "Depoimentos", "mais-vendido": "O mais vendido", identifica: "Você se identifica?",
  resultados: "Antes e depois", "qual-kit": "Qual kit é pra mim?", combo: "Combo Transformação", reels: "Veja na prática",
  "como-funciona": "Como funciona", avaliacoes: "Avaliações", diferenciais: "Por que a Brumar", comparativo: "Gloss Brumar × progressiva comum",
  profissionais: "Para cabeleireiras", brinde: "Brinde", comunidade: "Comunidade Brumar", "receber-whatsapp": "Ofertas no seu WhatsApp",
  duvidas: "Dúvidas frequentes", "compre-tranquila": "Compre tranquila" };
const NOMES_DOS_VIDEOS = { depoimentos: "Depoimentos", "na-pratica": "Como usar · Veja na prática" };
const bonito = (chave) => { const t = String(chave).replace(/-/g, " "); return t.charAt(0).toUpperCase() + t.slice(1); };
const objeto = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
const ligadaDe = (v) => (v && typeof v === "object" ? v.ligada !== false : v !== false);

const criarDocumentoDoNavegador = (titulo) => document.implementation.createHTMLDocument(titulo);

// Monta um documento só com elementos e textContent (nada de HTML montado com texto).
function construtor(doc) {
  return (tag, props, ...filhos) => {
    const el = doc.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else el.setAttribute(k, v);
    }
    for (const f of filhos.flat(Infinity)) if (f !== null && f !== undefined && f !== false && f !== "") el.append(f.nodeType ? f : doc.createTextNode(String(f)));
    return el;
  };
}

function cabecaDaPrevia(doc, h, base, titulo) {
  doc.title = titulo;
  doc.head.append(
    h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
    h("meta", { name: "robots", content: "noindex, nofollow" }),
    h("link", { rel: "stylesheet", href: new URL("../painel.css", base).href }));
  doc.body.className = "pagina-previa";
}

function capas(h, videos, vazio) {
  const vs = lista(videos);
  if (!vs.length) return h("p", { class: "miudo", text: vazio });
  return h("div", { class: "previa-capas" }, vs.map((v) => h("figure", { class: `previa-capa${v.visivel === false ? " escondido" : ""}` },
    v.capa ? h("img", { src: urlDeMidia(v.capa), alt: "", loading: "lazy" }) : h("div", { class: "previa-sem-capa", text: "▶" }),
    h("figcaption", {}, v.titulo || "", v.visivel === false && h("span", { class: "etiqueta cinza", text: "escondido" })))));
}

const etiquetaEscondido = (h, visivel, texto = "escondido no site") => visivel === false && h("span", { class: "etiqueta cinza", text: texto });

// Sem a expressão "site novo" (pedido da dona, 26/10).
export const AVISO_SIMPLIFICADA = "Prévia simplificada: mostra o conteúdo, não o visual do site. Com o painel no ar, aqui aparece o site de verdade.";

// Listas de frases do produto (destaques, para quem é, cuidados, modo de usar; contrato C1), já com o rascunho:
// frase vazia não aparece, e lista vazia some (como no site).
const frasesDe = (v) => (Array.isArray(v) ? v : typeof v === "string" ? [v] : []).filter((x) => typeof x === "string" && x.trim());
function blocoDeFrases(h, titulo, v, numerada = false) {
  const fs = frasesDe(v);
  return fs.length > 0 && h("div", { class: "miudo previa-frases" }, h("strong", { text: titulo }), h(numerada ? "ol" : "ul", {}, fs.map((x) => h("li", { text: x }))));
}

export function previaSimplificada(dados, { agora = new Date(), mudancas = 0, naoAplicadas = [], base, foco = "", contas = CONTAS_LOCAIS, criarDocumento = criarDocumentoDoNavegador, aviso = "" } = {}) {
  const doc = criarDocumento("Prévia do site");
  const h = construtor(doc);
  cabecaDaPrevia(doc, h, base, "Prévia do site");
  const t = objeto(dados.textos);
  const campanha = campanhaDaVez(dados.campanhas, agora);
  const outras = lista(dados.campanhas?.lista).filter((c) => c !== campanha && c.ligada !== false && new Date(`${c.termina}:00-03:00`) > agora).length;
  const kits = objeto(dados.kits);
  const faixa = [1, 2, 3, 4, 5, 6].map((i) => t[`faixa-topo-${i}`]).filter((x) => typeof x === "string" && x.trim());
  const marcado = (grupo, chave) => ({ "data-painel": grupo, "data-painel-chave": chave });

  doc.body.append(h("div", { class: "previa-simples" },
    h("p", { class: "previa-aviso", text: aviso || AVISO_SIMPLIFICADA }),
    h("p", { class: "miudo previa-estado", text: mudancas ? `Com ${mudancas} ${mudancas === 1 ? "mudança salva e ainda não publicada" : "mudanças salvas e ainda não publicadas"}.` : "Igual ao site no ar (nada salvo para publicar)." }),
    naoAplicadas.length > 0 && h("p", { class: "erro", text: `Não aparece na prévia: ${naoAplicadas.join(", ")}` }),

    h("section", { class: "previa-parte", "data-painel": "textos" },
      faixa.length > 0 && h("div", { class: "previa-faixa", text: faixa.join("  ·  ") }),
      h("img", { class: "previa-logo", src: new URL("../logo.png", base).href, alt: "Brumar Cosméticos" }),
      t.slogan && h("h1", { text: t.slogan }),
      t.descricao && h("p", { class: "previa-centro", text: t.descricao }),
      t.horario && h("p", { class: "miudo previa-centro", text: `Atendimento: ${t.horario}` }),
      t["whatsapp-mensagem"] && h("p", { class: "miudo previa-centro", text: `Mensagem do WhatsApp: ${t["whatsapp-mensagem"]}` })),

    h("section", { class: "previa-parte", "data-painel": "campanhas" },
      campanha ? h("div", { class: "previa-faixa-campanha" }, h("strong", { text: campanha.titulo || "" }), campanha.texto || "", campanha.botao && h("span", { class: "previa-botao", text: campanha.botao }),
        h("span", { class: "previa-contagem", text: `termina em ${contagem(campanha.termina, agora)}` }))
        : h("p", { class: "miudo previa-centro", text: "Nenhuma campanha no ar agora." }),
      outras > 0 && h("p", { class: "miudo previa-centro", text: outras === 1 ? "Mais 1 campanha ligada: ela entra quando esta acabar."
        : `Mais ${outras} campanhas ligadas: cada uma entra quando a anterior acabar.` })),

    h("section", { class: "previa-parte cartao", "data-painel": "secoes" }, h("h2", { text: "Seções da página inicial" }),
      h("ul", { class: "lista" }, Object.entries(objeto(dados.secoes)).map(([id, v]) => h("li", marcado("secoes", id),
        NOMES_DAS_SECOES[id] || bonito(id), " ", h("span", { class: `etiqueta ${ligadaDe(v) ? "verde" : "cinza"}`, text: ligadaDe(v) ? "aparece" : "escondida" }))))),

    h("section", { class: "previa-parte", "data-painel": "produtos" }, h("h2", { text: `Produtos (${Object.keys(objeto(dados.produtos)).length} telas)` }),
      h("div", { class: "previa-grade" }, Object.entries(objeto(dados.produtos)).map(([k, p]) => {
        const foto = p.foto || kits[p.kit]?.foto;
        return h("div", { class: `cartao${p.visivel === false ? " escondido" : ""}`, ...marcado("produtos", k) },
          foto && h("img", { src: urlDeMidia(foto), alt: "", class: "previa-foto", loading: "lazy" }),
          h("h3", { text: p.nome || bonito(k) }), etiquetaEscondido(h, p.visivel),
          p.chamada && h("p", { text: p.chamada }),
          blocoDeFrases(h, "Destaques:", p.destaques), blocoDeFrases(h, "Para quem é:", p["para-quem"]),
          blocoDeFrases(h, "Cuidados:", p.cuidados), blocoDeFrases(h, "Modo de usar:", p["modo-de-usar"], true));
      }))),

    h("section", { class: "previa-parte", "data-painel": "kits" }, h("h2", { text: `Kits e preços (${Object.keys(kits).length})` }),
      h("div", { class: "previa-grade" }, Object.entries(kits).map(([k, kit]) => {
        const p = precosDoKit(kit, contas);
        return h("div", { class: `cartao${kit.visivel === false ? " escondido" : ""}`, ...marcado("kits", k) },
          kit.foto && h("img", { src: urlDeMidia(kit.foto), alt: "", class: "previa-foto", loading: "lazy" }),
          h("h3", { text: kit.nome || bonito(k) }), kit.selo && h("span", { class: "etiqueta", text: kit.selo }), etiquetaEscondido(h, kit.visivel),
          Array.isArray(kit.itens) && kit.itens.length > 0 && h("p", { class: "miudo", text: kit.itens.join(" + ") }),
          p && h("p", { class: "previa-preco" }, p.de && h("span", { class: "previa-de", text: `De ${p.de}` }), h("strong", { text: p.por }),
            h("span", { class: "previa-pix", text: `${p.pix} no Pix` })));
      }))),

    h("section", { class: "previa-parte cartao", "data-painel": "faq" }, h("h2", { text: `Dúvidas (${Object.keys(objeto(dados.faq)).length})` }),
      Object.entries(objeto(dados.faq)).map(([k, d]) => h("details", marcado("faq", k),
        h("summary", {}, d.pergunta || bonito(k), " ", d.inicial !== false && h("span", { class: "etiqueta verde", text: "na página inicial" })),
        h("p", { text: d.resposta || "" })))),

    h("section", { class: "previa-parte", "data-painel": "videos" }, h("h2", { text: "Vídeos do site" }),
      Object.entries(objeto(dados.videos)).map(([k, s]) => h("div", { class: "cartao", ...marcado("videos", k) },
        h("h3", { text: NOMES_DOS_VIDEOS[k] || bonito(k) }), capas(h, s?.videos, "Nenhum vídeo."))),
      dados.resultados && Array.isArray(dados.resultados.videos) && h("div", { class: "cartao", ...marcado("resultados", "videos") },
        h("h3", { text: "Antes e depois · Resultados reais" }), capas(h, dados.resultados.videos, "Nenhum vídeo."))),

    h("section", { class: "previa-parte", "data-painel": "videos-por-produto" }, h("h2", { text: "Vídeos de resultado de cada produto" }),
      h("div", { class: "previa-grade" }, Object.entries(objeto(dados["videos-por-produto"])).map(([k, s]) => h("div", { class: "cartao", ...marcado("videos-por-produto", k) },
        h("h3", { text: s?.nome || bonito(k) }), capas(h, s?.videos, "Sem vídeo (a página não mostra a seção).")))))));

  return comRolagem(`<!doctype html>\n${doc.documentElement.outerHTML}`, base, foco);
}

// Link na bio, versão simples (quando não dá para mostrar a página de verdade): frase, oferta, promoção e botões.
export function bioSimples(dados, { agora = new Date(), base, contas = CONTAS_LOCAIS, criarDocumento = criarDocumentoDoNavegador } = {}) {
  const doc = criarDocumento("Prévia do link na bio");
  const h = construtor(doc);
  cabecaDaPrevia(doc, h, base, "Prévia do link na bio");
  const p = pacoteDaBio(dados, agora, contas);
  const caixa = h("section", { class: "previa-bio", "data-painel": "bio" },
    h("p", { class: "previa-aviso", text: "Prévia simplificada do link na bio (a página de verdade não abriu agora)." }),
    h("img", { class: "previa-logo", src: new URL("../logo.png", base).href, alt: "Brumar Cosméticos" }),
    h("p", { class: "previa-centro", text: p.bio.frase }),
    p.oferta && h("div", { class: "cartao" }, p.oferta.selo && h("span", { class: "etiqueta", text: p.oferta.selo }),
      p.oferta.foto && h("img", { src: p.oferta.foto, alt: "", class: "previa-foto" }), h("h3", { text: p.oferta.nome }),
      p.oferta.itens && h("p", { class: "miudo", text: p.oferta.itens }),
      p.oferta.precos && h("p", { class: "previa-preco" }, p.oferta.precos.de && h("span", { class: "previa-de", text: `De ${p.oferta.precos.de}` }),
        h("strong", { text: p.oferta.precos.por }), h("span", { class: "previa-pix", text: `${p.oferta.precos.pix} no Pix` }))),
    p.bio["mostrar-promo"] && p.campanha && h("div", { class: "previa-faixa-campanha" }, h("strong", { text: p.campanha.titulo }), p.campanha.texto),
    h("ul", { class: "lista" }, p.bio.botoes.map((b) => h("li", { "data-painel": "bio", "data-painel-chave": b.chave }, h("strong", { text: b.nome }), h("div", { class: "miudo", text: b.texto })))));
  if (p.bio.fundo && /^#[0-9A-Fa-f]{6}$/.test(p.bio.fundo)) caixa.setAttribute("style", `background:${p.bio.fundo}`);
  doc.body.append(caixa);
  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

// ---------- HTML da prévia ----------
// resposta = o que /painel/api/previa devolveu; base = endereço desta pasta (…/painel/previa/); foco = grupo aberto.
// "ajuda" (só para os testes): troca o import, o fetch e o documento do navegador.
export async function htmlDaPrevia(resposta, base, foco = "", ajuda = {}) {
  const carregar = ajuda.carregar || ((endereco) => import(endereco));
  const buscar = ajuda.buscar || ((...x) => fetch(...x));
  const criarDocumento = ajuda.criarDocumento || criarDocumentoDoNavegador;
  const agora = ajuda.agora || new Date();
  const { foco: f, grupo } = lerFoco(foco);
  const dados = resposta?.dados && typeof resposta.dados === "object" ? resposta.dados : {};
  let molde = null;
  try { molde = await carregar(MOLDE); } catch { /* molde ainda não existe: prévia sem ele */ }
  const contas = await contasDoPreco(carregar);
  const opcoes = { url: urlDeMidia, agora, previa: true, foco: f };
  let aviso = "";

  if (grupo === "bio") {
    if (typeof molde?.montarBio === "function") {
      try { return comRolagem(String(molde.montarBio(dados, opcoes)), base, f); } catch (e) { console.warn("[prévia] molde da bio:", e?.message); }
    }
    const vitrine = await vitrineDeHoje(base, buscar);
    if (vitrine) return injetarNaBio(vitrine.texto, vitrine.endereco, base, pacoteDaBio(dados, agora, contas));
    return bioSimples(dados, { agora, base, contas, criarDocumento });
  }
  if (typeof molde?.montarPagina === "function") {
    try { return comRolagem(String(molde.montarPagina(dados, opcoes)), base, f); } catch (e) {
      console.warn("[prévia] molde:", e?.message);
      aviso = "O desenho do site não abriu agora: esta é a prévia simplificada (só o conteúdo).";
    }
  }
  return previaSimplificada(dados, { agora, mudancas: resposta?.mudancas || 0, naoAplicadas: resposta?.naoAplicadas || [], base, foco: f, contas, criarDocumento, aviso });
}

// "‹ Voltar ao painel" no alto da prévia aberta sozinha (celular, "Ver como fica"): antes, só dava para voltar com o
// botão do aparelho (rodada 2 da conferência). Dentro de outra página (iframe), não aparece. Volta pelo histórico
// (o painel abre na mesma tela, com o que estava guardado); sem histórico, abre o painel. Estilo no próprio botão:
// a página pode ser o molde do site, sem o CSS do painel.
// É um BOTÃO e navega sempre por aqui (rodada 4): no modo prévia, o molde cancela o clique em todo link que não
// começa com "#" ("Prévia: este link não abre aqui."). Com o link de antes, aberta sem o painel antes, o toque não
// fazia nada. Janelas do site (WhatsApp, vídeo, foto) e trocas de tela ("#...") põem passos a mais no histórico
// desta página: enquanto o "voltar" ainda cai aqui (popstate), volta mais um; depois de 10, abre o painel.
const PASSOS_PARA_VOLTAR = 10;
export function colocarVoltarAoPainel(doc, janela) {
  if (janela.top !== janela || !doc.body) return null;
  const painel = new URL("../", janela.location.href).href;
  const voltar = doc.createElement("button");
  voltar.type = "button";
  voltar.className = "previa-voltar";
  voltar.textContent = "‹ Voltar ao painel";
  voltar.setAttribute("style", "position:sticky;top:0;z-index:2147483647;display:block;box-sizing:border-box;width:100%;min-height:44px;"
    + "margin:0;padding:12px 16px;background:#fff;color:#8A2E48;font:600 16px/20px system-ui,sans-serif;text-align:left;"
    + "border:0;border-bottom:1px solid #eee;border-radius:0;cursor:pointer");
  let voltando = false;
  voltar.addEventListener("click", (e) => {
    e.preventDefault();
    if (voltando) return; // dois toques seguidos: um "voltar" só
    let doPainel = false;
    try { doPainel = new URL(doc.referrer).pathname.startsWith(new URL(painel).pathname); } catch { /* sem referrer */ }
    if (!doPainel || !(janela.history.length > 1)) { janela.location.href = painel; return; }
    voltando = true;
    let passos = 0;
    const parar = () => { voltando = false; janela.removeEventListener("popstate", maisUm); janela.removeEventListener("pagehide", parar); };
    function maisUm() {
      if (++passos >= PASSOS_PARA_VOLTAR) { parar(); janela.location.href = painel; return; }
      janela.history.back();
    }
    janela.addEventListener("popstate", maisUm);
    janela.addEventListener("pagehide", parar); // saiu da prévia: nada fica ouvindo (se ela voltar da memória do navegador)
    janela.history.back();
  });
  doc.body.prepend(voltar);
  return voltar;
}

// Página /painel/previa/ aberta sozinha (celular, "Ver como fica"): busca os dados e se desenha.
if (typeof document !== "undefined" && document.getElementById("previa")) {
  (async () => {
    const caixa = document.getElementById("previa");
    const foco = focoValido(new URLSearchParams(location.search).get("foco") || "");
    let r;
    try {
      r = await fetch("/painel/api/previa", { credentials: "same-origin", headers: { "X-Painel": "1" } });
    } catch {
      caixa.textContent = "Sem internet ou o painel não respondeu.";
      return;
    }
    const corpo = await r.json().catch(() => ({}));
    if (r.status !== 200) { caixa.textContent = corpo.erro || "Não foi possível montar a prévia."; return; }
    const html = await htmlDaPrevia(corpo, new URL("./", location.href).href, foco);
    document.open();
    document.write(html);
    document.close();
    colocarVoltarAoPainel(document, window);
  })();
}
