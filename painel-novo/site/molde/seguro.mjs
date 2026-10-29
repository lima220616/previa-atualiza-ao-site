// Proteção de tudo que vem dos dados (e, depois, do painel) antes de entrar na página. Todo texto e atributo passa
// por aqui. O jeito de escrever é o mesmo do site de hoje, para a página sair idêntica: no texto só & < > viram
// códigos (e o espaço fixo vira &nbsp;); no atributo também as aspas. Funções puras (Node e navegador).

const NO_TEXTO = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\u00a0": "&nbsp;" };
const NO_ATRIBUTO = { ...NO_TEXTO, '"': "&quot;" };

export function texto(valor) {
  return String(valor ?? "").replace(/[&<>\u00a0]/g, (c) => NO_TEXTO[c]);
}

export function atributo(valor) {
  return String(valor ?? "").replace(/[&<>"\u00a0]/g, (c) => NO_ATRIBUTO[c]);
}

// Links: só https://, wa.me (por https), mailto:, tel:, âncora "#..." e endereço do próprio site começando com "/".
// Qualquer outro (javascript:, data:, http:, "//outro-site", endereço sem barra) para a montagem.
export function link(valor, onde = "link") {
  const s = String(valor ?? "").trim();
  const ok = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(s) || /^mailto:[^\s<>"]+@[^\s<>"]+$/i.test(s)
    || /^tel:\+?[0-9]{8,15}$/.test(s) || /^#[a-z0-9_-]*$/i.test(s) || /^\/(?!\/)[^\s<>"\\]*$/.test(s);
  if (!ok) throw new Error(`${onde}: endereço não permitido (${s.slice(0, 80)})`);
  return atributo(s);
}

// Bloco de dados dentro da página (<script type="application/json">): nunca pode fechar a etiqueta nem abrir
// comentário. O "<" vira \u003c, que o JSON lê igual.
export function blocoDeDados(objeto) {
  return JSON.stringify(objeto).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// HTML das políticas: só títulos, parágrafos, listas, tabelas, negrito, itálico, quebra de linha e links permitidos.
// Qualquer outra etiqueta, atributo (fora href/id/class simples) ou link perigoso para a montagem.
const ETIQUETAS = new Set(["h2", "h3", "h4", "p", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td",
  "strong", "b", "em", "i", "br", "a", "small", "span", "div", "section", "article", "details", "summary"]);
const ATRIBUTOS = new Set(["href", "id", "class"]);
// Cada "<" tem de abrir uma etiqueta bem escrita: nome, atributos separados por espaço, valor entre aspas duplas. O
// navegador também aceita "/" no lugar do espaço (<svg/onload=...>, <img/src=x onerror=...>): por isso qualquer outro
// jeito para a montagem, em vez de passar sem ser conferido.
const ETIQUETA = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[a-zA-Z][a-zA-Z-]*(?:="[^"<>]*")?)*)\s*\/?>/y;

export function conferirHtmlDaPolitica(html, onde = "política") {
  const semComentarios = html.replace(/<!--[\s\S]*?-->/g, "");
  if (/<!--|-->/.test(semComentarios)) throw new Error(`${onde}: comentário mal fechado`);
  for (let i = semComentarios.indexOf("<"); i >= 0; i = semComentarios.indexOf("<", i + 1)) {
    ETIQUETA.lastIndex = i;
    const m = ETIQUETA.exec(semComentarios);
    const nome = (m ? m[2] : (/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(semComentarios.slice(i, i + 40)) || [])[1] ?? "").toLowerCase();
    if (nome && !ETIQUETAS.has(nome)) throw new Error(`${onde}: etiqueta não permitida <${nome}>`);
    if (!m) throw new Error(`${onde}: HTML estranho${nome ? ` em <${nome}> (atributo sem aspas ou separado por /)` : ` ("<" solto: escreva &lt;)`}`);
    for (const a of m[3].matchAll(/([a-zA-Z][a-zA-Z-]*)(?:="([^"]*)")?/g)) {
      const atr = a[1].toLowerCase();
      const valor = a[2] ?? "";
      if (!ATRIBUTOS.has(atr)) throw new Error(`${onde}: atributo não permitido ${atr} em <${nome}>`);
      // No HTML pronto, o navegador lê os códigos (&#47; vira "/"): no link, só o &amp;.
      if (atr === "href" && /&(?!amp;)/.test(valor)) throw new Error(`${onde} (link): código & estranho no endereço`);
      if (atr === "href") link(valor.replace(/&amp;/g, "&"), `${onde} (link)`);
      if ((atr === "id" || atr === "class") && !/^[a-zA-Z0-9 _-]*$/.test(valor)) throw new Error(`${onde}: ${atr} estranho`);
    }
  }
  return html;
}
