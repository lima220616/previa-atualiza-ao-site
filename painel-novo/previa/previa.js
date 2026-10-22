// Prévia do site dentro do painel (coluna da direita, no computador). Pega os dados do site com o rascunho já
// aplicado (/painel/api/previa) e desenha com o MOLDE da Opção A (montarPagina, contrato combinado em 22/10 com o
// chat do site). Enquanto o molde não existir, mostra uma prévia simplificada dos mesmos dados.
// Nada aqui publica: é só para olhar antes de publicar.

const MOLDE = "/molde/montar.mjs"; // caminho do molde no site novo (combinar na Opção A)
const caixa = document.getElementById("previa");

// Fotos e vídeos novos do rascunho ainda não estão no site: vêm do armazenamento do painel.
const url = (caminho) => {
  const c = String(caminho || "");
  if (c.startsWith("foto:")) return `/painel/api/foto?id=${encodeURIComponent(c.slice(5))}`;
  if (c.startsWith("video:")) return `/painel/api/video?id=${encodeURIComponent(c.slice(6))}`;
  return c;
};

function h(tag, props, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = v; else if (k === "text") el.textContent = v; else el.setAttribute(k, v);
  }
  for (const f of filhos.flat()) if (f !== null && f !== undefined && f !== false) el.append(f.nodeType ? f : document.createTextNode(String(f)));
  return el;
}

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

function previaSimplificada(dados, agora, mudancas, naoAplicadas) {
  const t = dados.textos || {};
  const campanha = campanhaDaVez(dados.campanhas, agora);
  const secoes = Object.entries(dados.secoes || {});
  const produtos = Object.entries(dados.produtos || {});
  return h("div", { class: "previa-simples" },
    h("p", { class: "previa-aviso", text: "Prévia simplificada. A prévia com o visual do site chega junto com o site novo." }),
    mudancas ? h("p", { class: "miudo", text: `Com ${mudancas} mudança(s) salva(s) e ainda não publicada(s).` }) : h("p", { class: "miudo", text: "Igual ao site no ar (nada salvo para publicar)." }),
    naoAplicadas.length > 0 && h("p", { class: "erro", text: `Não aparece na prévia: ${naoAplicadas.join(", ")}` }),
    campanha && h("div", { class: "previa-faixa-campanha" }, h("strong", { text: campanha.titulo }), " ", campanha.texto,
      h("span", { class: "previa-contagem", text: `termina em ${contagem(campanha.termina, agora)}` })),
    [t["faixa-topo-1"], t["faixa-topo-2"]].filter(Boolean).length > 0 &&
      h("div", { class: "previa-faixa", text: [t["faixa-topo-1"], t["faixa-topo-2"]].filter(Boolean).join("  ·  ") }),
    h("img", { class: "previa-logo", src: "../logo.png", alt: "Brumar Cosméticos" }),
    t.slogan && h("h1", { text: t.slogan }),
    secoes.length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Seções da página inicial" }),
      h("ul", { class: "lista" }, secoes.map(([nome, ligada]) => h("li", {}, nome, " ", h("span", { class: `etiqueta ${ligada ? "verde" : "cinza"}`, text: ligada ? "aparece" : "escondida" }))))),
    produtos.length > 0 && h("div", { class: "previa-produtos" }, produtos.filter(([, p]) => p.visivel !== false).map(([, p]) =>
      h("div", { class: "cartao" }, p.foto && h("img", { src: url(p.foto), alt: "", class: "previa-foto" }), h("h3", { text: p.nome || "" }), h("p", { text: p.chamada || "" })))),
    t.horario && h("p", { class: "miudo", text: `Atendimento: ${t.horario}` }));
}

async function montar() {
  let r;
  try {
    r = await fetch("/painel/api/previa", { credentials: "same-origin", headers: { "X-Painel": "1" } });
  } catch {
    return caixa.replaceChildren(h("p", { class: "erro", text: "Sem internet ou o painel não respondeu." }));
  }
  const corpo = await r.json().catch(() => ({}));
  if (r.status !== 200) return caixa.replaceChildren(h("p", { class: "erro", text: corpo.erro || "Não foi possível montar a prévia." }));
  const agora = new Date();
  let molde = null;
  try { molde = await import(MOLDE); } catch { /* molde ainda não existe: prévia simplificada */ }
  if (molde?.montarPagina) {
    // O molde devolve a página inteira; ela substitui esta (os programas dela vêm de /arquivos/js/, como no site).
    const html = molde.montarPagina(corpo.dados, { url, agora, previa: true });
    document.open();
    document.write(html);
    document.close();
    return;
  }
  caixa.replaceChildren(previaSimplificada(corpo.dados, agora, corpo.mudancas, corpo.naoAplicadas || []));
}

montar();
