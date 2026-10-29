// Tela Políticas da página inicial: as políticas de dados/politicas.json, cada uma num bloco que abre com um toque. O
// texto de cada uma passa por conferirHtmlDaPolitica (só títulos, listas, tabelas e links permitidos) antes de entrar.
// As páginas próprias (/politica-de-privacidade/ e /termos-de-uso/, em molde/paginas.mjs) usam o mesmo texto.
import { h, cru } from "../html.mjs";
import { conferirHtmlDaPolitica } from "../seguro.mjs";
import { linkDoWhatsapp, numeroEscrito } from "./moldura/comum.mjs";

const CHAVE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// O atendimento das políticas vem do mesmo lugar que o rodapé (29/10: a Bruna muda pelo painel, na aba Atendimento, e
// as políticas acompanham). No texto: {{whatsapp-link}} (https://wa.me/...), {{whatsapp}} ("(64) 99319-2101"),
// {{email}}, {{instagram}} ("@perfil") e {{horario}} ("segunda a sexta, das 8h às 17h, e sábado, das 8h às 12h", do
// textos.horario). Outra {{...}} para a montagem (erro de digitação no texto).
export function horarioEscrito(horario) {
  const partes = String(horario ?? "").split(" · ").map((p) => p.trim()).filter(Boolean).map((p) => p.slice(0, 1).toLowerCase() + p.slice(1));
  return partes.length > 1 ? `${partes.slice(0, -1).join(", ")}, e ${partes.at(-1)}` : partes.join("");
}
const perfil = (link) => `@${String(link ?? "").replace(/\/+$/, "").split("/").pop()}`;
export function comContato(html, dados, onde) {
  const { marca, textos } = dados;
  const trocas = {
    "whatsapp-link": () => linkDoWhatsapp(marca), whatsapp: () => numeroEscrito(marca), email: () => marca.email,
    instagram: () => perfil(marca.redes?.instagram), horario: () => horarioEscrito(textos?.horario),
  };
  return html.replace(/\{\{([^}]*)\}\}/g, (marcaNoTexto, nome) => {
    if (!Object.hasOwn(trocas, nome)) throw new Error(`${onde}: marca desconhecida no texto (${marcaNoTexto}); use ${Object.keys(trocas).map((k) => `{{${k}}}`).join(", ")}`);
    const valor = String(trocas[nome]() ?? "");
    if (!valor || valor === "@") throw new Error(`${onde}: ${marcaNoTexto} sem valor (marca.json ou textos.json)`);
    return valor;
  });
}

// "2026-10-21" -> "21/10/2026". Data mal escrita para a montagem.
export function dataEscrita(iso, onde) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ""));
  if (!m || new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) !== iso) {
    throw new Error(`${onde}: data mal escrita (${iso ?? "vazia"}); use AAAA-MM-DD`);
  }
  return `${m[3]}/${m[2]}/${m[1]}`;
}

// As políticas na ordem do arquivo, já conferidas: { chave, titulo, atualizacao, data, pagina, html }.
export function politicasConferidas(dados) {
  const lista = Object.entries(dados.politicas ?? {});
  if (!lista.length) throw new Error("politicas.json: nenhuma política");
  return lista.map(([chave, p]) => {
    const onde = `politicas.json (${chave})`;
    if (!CHAVE.test(chave)) throw new Error(`${onde}: chave estranha`);
    if (!String(p?.titulo ?? "").trim()) throw new Error(`${onde}: política sem título`);
    const pagina = String(p.pagina ?? "");
    // as pastas do site e do painel ficam de fora (as passagens, montarOutrasPaginas recusa)
    if (pagina && (!CHAVE.test(pagina) || /^(painel|molde|dados|bio|ir|arquivos|assets|fotos-painel|videos-painel|videos-depoimentos)$/.test(pagina))) {
      throw new Error(`${onde}: endereço da página própria não permitido (${pagina})`);
    }
    return { chave, titulo: p.titulo, atualizacao: p.atualizacao, data: dataEscrita(p.atualizacao, onde), pagina,
      html: cru(conferirHtmlDaPolitica(comContato(String(p.html ?? ""), dados, onde), `política ${chave}`)) };
  });
}

export default function politicas(dados) {
  const lista = politicasConferidas(dados);
  // A data do alto da tela é a da política mudada por último.
  const ultima = lista.map((p) => p.atualizacao).sort().at(-1);
  const blocos = lista.map((p, i) => h`${i ? "\n\n" : ""}<details class="pol-d" id="${p.chave}"><summary>${p.titulo}</summary><div class="pol-c">
<p>Última atualização: ${p.data}</p>
${p.html}
<p><a href="#p-politicas">Voltar para o início das políticas</a></p>
</div></details>`);
  return h`<section class="view" id="p-politicas" hidden><div class="wrap" style="max-width:820px"><a class="back" href="#inicio"><svg class="i" style="width:20px;height:20px"><use href="#i-arrow"/></svg>Voltar para a loja</a><span class="eyebrow">Políticas da loja</span><h2 class="t1" style="font-size:clamp(32px,5vw,46px);margin:8px 0 18px">Trocas, envio, privacidade e termos</h2><p class="lead">Toque em cada política para ler. Última atualização: ${dataEscrita(ultima, "politicas.json")}.</p>${blocos}
</div></section>
`;
}
