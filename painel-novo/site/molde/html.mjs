// O jeito de escrever as páginas no molde: h`<p>${valor}</p>`. Todo valor que entra é protegido sozinho, conforme o
// lugar onde está: no texto, como texto; dentro de atributo entre aspas, como atributo; em href/src/action/poster
// (quando o valor começa o endereço), também conferido como link. Valor no meio de uma etiqueta sem aspas, dentro de
// <script> ou <style>, ou num comentário para a montagem, a não ser que já venha pronto (outro h`` ou cru()).
// Listas viram o texto de cada item, um atrás do outro. null, undefined e false não escrevem nada.
import { texto, atributo, link } from "./seguro.mjs";

export class Pronto {
  constructor(html) { this.html = html; }
  toString() { return this.html; }
}

// Só para HTML já conferido (as políticas, depois de conferirHtmlDaPolitica) e partes fixas do molde.
export function cru(html) {
  return new Pronto(String(html));
}

const LINKS = new Set(["href", "src", "action", "poster", "formaction"]);

// Onde o texto do molde termina: no texto, dentro de etiqueta, dentro de atributo (com o nome dele), em <script>/<style>
// ou em comentário. Lê só o que o próprio molde escreveu (os valores já entram protegidos).
function proximoEstado(estado, pedaco) {
  let { lugar, aspa, nome, cru: bruto, inicioDoValor } = estado;
  for (let i = 0; i < pedaco.length; i++) {
    const c = pedaco[i];
    inicioDoValor = false;
    if (lugar === "comentario") { if (pedaco.startsWith("-->", i)) { lugar = "texto"; i += 2; } continue; }
    if (lugar === "bruto") {
      const fim = `</${bruto}`;
      if (pedaco.slice(i, i + fim.length).toLowerCase() === fim) { lugar = "etiqueta"; i += fim.length - 1; bruto = ""; }
      continue;
    }
    if (lugar === "texto") {
      if (pedaco.startsWith("<!--", i)) { lugar = "comentario"; i += 3; continue; }
      if (c === "<") {
        const m = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(pedaco.slice(i));
        lugar = "etiqueta";
        nome = m ? m[1].toLowerCase() : "";
        bruto = nome === "script" || nome === "style" ? nome : "";
      }
      continue;
    }
    if (lugar === "etiqueta") {
      if (c === ">") { lugar = bruto ? "bruto" : "texto"; continue; }
      const m = /^([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])/.exec(pedaco.slice(i));
      if (m && /[\s"']/.test(pedaco[i - 1] ?? " ")) {
        lugar = "atributo"; aspa = m[2]; nome = m[1].toLowerCase(); i += m[0].length - 1; inicioDoValor = true;
      }
      continue;
    }
    if (lugar === "atributo" && c === aspa) { lugar = "etiqueta"; aspa = ""; }
  }
  return { lugar, aspa, nome, cru: bruto, inicioDoValor };
}

function escrever(valor, estado) {
  if (valor === null || valor === undefined || valor === false) return "";
  if (Array.isArray(valor)) return valor.map((v) => escrever(v, estado)).join("");
  if (valor instanceof Pronto) return valor.html;
  if (estado.lugar === "texto") return texto(valor);
  if (estado.lugar === "atributo") {
    if (estado.aspa !== '"') throw new Error("molde: valor em atributo com aspas simples");
    return LINKS.has(estado.nome) && estado.inicioDoValor ? link(valor, `atributo ${estado.nome}`) : atributo(valor);
  }
  throw new Error(`molde: valor solto no lugar "${estado.lugar}" (use cru() só para o que já foi conferido)`);
}

// Um pedaço que começa com atributo (h` poster="${foto}"`, para pôr dentro de uma etiqueta de outro h``) começa
// dentro da etiqueta: o valor é protegido como atributo (com as aspas) e conferido como link, e não como texto.
const COMECA_COM_ATRIBUTO = /^\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*\s*=\s*["']/;

export function h(partes, ...valores) {
  const lugar = COMECA_COM_ATRIBUTO.test(partes.raw[0]) ? "etiqueta" : "texto";
  let estado = { lugar, aspa: "", nome: "", cru: "", inicioDoValor: false };
  let saida = "";
  for (let i = 0; i < partes.raw.length; i++) {
    saida += partes.raw[i];
    estado = proximoEstado(estado, partes.raw[i]);
    if (i < valores.length) saida += escrever(valores[i], estado);
  }
  return new Pronto(saida);
}
