// Prévia do site (pedido de 22/10). Monta a página com o MOLDE da Opção A (montarPagina, contrato combinado com o
// chat do site) a partir dos dados do site com o rascunho já aplicado (/painel/api/previa). Sem o molde, monta uma
// prévia simplificada dos mesmos dados. Nada aqui publica: é só para olhar antes de publicar.
//   - No computador, o painel importa este arquivo e põe o HTML num iframe "srcdoc" (coluna da direita): assim as
//     regras de segurança do site (frame-ancestors 'none') continuam fechadas.
//   - No celular, o botão "Ver como fica" abre /painel/previa/, que se desenha sozinha (fim do arquivo).

export const MOLDE = "/molde/montar.mjs"; // caminho do molde no site novo (combinar na Opção A)

// Fotos e vídeos novos do rascunho ainda não estão no site: vêm do armazenamento do painel.
export const urlDeMidia = (caminho) => {
  const c = String(caminho || "");
  if (c.startsWith("foto:")) return `/painel/api/foto?id=${encodeURIComponent(c.slice(5))}`;
  if (c.startsWith("video:")) return `/painel/api/video?id=${encodeURIComponent(c.slice(6))}`;
  return c;
};

// Contagem: só UMA no site (Brand Book) — a campanha ligada que termina primeiro (decisão de 22/10).
function campanhaDaVez(campanhas, agora) {
  return (campanhas?.lista || [])
    .filter((c) => c.ligada !== false && new Date(`${c.termina}:00-03:00`) > agora)
    .sort((a, b) => String(a.termina).localeCompare(String(b.termina)))[0];
}

function contagem(termina, agora) {
  const ms = new Date(`${termina}:00-03:00`) - agora;
  const d = Math.floor(ms / 864e5), hr = Math.floor((ms % 864e5) / 36e5), mi = Math.floor((ms % 36e5) / 6e4);
  return `${d}d ${hr}h ${mi}min`;
}

// Monta a prévia simplificada num documento separado (nada de HTML montado com texto: tudo por textContent).
function previaSimplificada(dados, agora, mudancas, naoAplicadas, base) {
  const doc = document.implementation.createHTMLDocument("Prévia do site");
  const h = (tag, props, ...filhos) => {
    const el = doc.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else el.setAttribute(k, v);
    }
    for (const f of filhos.flat()) if (f !== null && f !== undefined && f !== false) el.append(f.nodeType ? f : doc.createTextNode(String(f)));
    return el;
  };
  doc.head.append(
    h("base", { href: base }),
    h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
    h("link", { rel: "stylesheet", href: new URL("../painel.css", base).href }));
  doc.body.className = "pagina-previa";
  const t = dados.textos || {};
  const campanha = campanhaDaVez(dados.campanhas, agora);
  const secoes = Object.entries(dados.secoes || {});
  const produtos = Object.entries(dados.produtos || {});
  const faixa = [t["faixa-topo-1"], t["faixa-topo-2"]].filter(Boolean);
  doc.body.append(h("div", { class: "previa-simples" },
    h("p", { class: "previa-aviso", text: "Prévia simplificada. A prévia com o visual do site chega junto com o site novo." }),
    mudancas ? h("p", { class: "miudo", text: `Com ${mudancas} mudança(s) salva(s) e ainda não publicada(s).` }) : h("p", { class: "miudo", text: "Igual ao site no ar (nada salvo para publicar)." }),
    naoAplicadas.length > 0 && h("p", { class: "erro", text: `Não aparece na prévia: ${naoAplicadas.join(", ")}` }),
    campanha && h("div", { class: "previa-faixa-campanha" }, h("strong", { text: campanha.titulo }), " ", campanha.texto,
      h("span", { class: "previa-contagem", text: `termina em ${contagem(campanha.termina, agora)}` })),
    faixa.length > 0 && h("div", { class: "previa-faixa", text: faixa.join("  ·  ") }),
    h("img", { class: "previa-logo", src: new URL("../logo.png", base).href, alt: "Brumar Cosméticos" }),
    t.slogan && h("h1", { text: t.slogan }),
    secoes.length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Seções da página inicial" }),
      h("ul", { class: "lista" }, secoes.map(([nome, ligada]) => h("li", {}, nome, " ", h("span", { class: `etiqueta ${ligada ? "verde" : "cinza"}`, text: ligada ? "aparece" : "escondida" }))))),
    produtos.length > 0 && h("div", { class: "previa-produtos" }, produtos.filter(([, p]) => p.visivel !== false).map(([, p]) =>
      h("div", { class: "cartao" }, p.foto && h("img", { src: urlDeMidia(p.foto), alt: "", class: "previa-foto" }), h("h3", { text: p.nome || "" }), h("p", { text: p.chamada || "" })))),
    t.horario && h("p", { class: "miudo", text: `Atendimento: ${t.horario}` })));
  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

// HTML da prévia. resposta = o que /painel/api/previa devolveu; base = endereço desta pasta (…/painel/previa/).
export async function htmlDaPrevia(resposta, base) {
  const agora = new Date();
  let molde = null;
  try { molde = await import(MOLDE); } catch { /* molde ainda não existe: prévia simplificada */ }
  if (molde?.montarPagina) return molde.montarPagina(resposta.dados, { url: urlDeMidia, agora, previa: true });
  return previaSimplificada(resposta.dados, agora, resposta.mudancas, resposta.naoAplicadas || [], base);
}

// Página /painel/previa/ aberta sozinha (celular, "Ver como fica"): busca os dados e se desenha.
if (document.getElementById("previa")) {
  (async () => {
    const caixa = document.getElementById("previa");
    let r;
    try {
      r = await fetch("/painel/api/previa", { credentials: "same-origin", headers: { "X-Painel": "1" } });
    } catch {
      caixa.textContent = "Sem internet ou o painel não respondeu.";
      return;
    }
    const corpo = await r.json().catch(() => ({}));
    if (r.status !== 200) { caixa.textContent = corpo.erro || "Não foi possível montar a prévia."; return; }
    const html = await htmlDaPrevia(corpo, new URL("./", location.href).href);
    document.open();
    document.write(html);
    document.close();
  })();
}
