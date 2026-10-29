// Painel Brumar: telas ligadas às funções em /painel/api/*. Sem bibliotecas e sem HTML montado com texto
// (tudo com textContent), para nenhum texto digitado virar código. Pensado para celular.
"use strict";

const API = "/painel/api/";
const NOMES_PAPEL = { admin: "Administradora", responsavel: "Responsável", funcionaria: "Funcionária" };
const app = document.getElementById("app");
let eu = null;

// <ajudantes-puros> Sem tela e sem servidor: testados direto em testes/auditoria2-telas.test.mjs (auditoria 2).

// Data do site ("2026-11-30T23:59", horário de Brasília) do jeito brasileiro: "30/11/2026 às 23h59" (item 60).
function dataBR(t) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(t ?? ""));
  return m ? `${m[3]}/${m[2]}/${m[1]} às ${m[4]}h${m[5]}` : String(t ?? "");
}

// Vídeo sem "visivel" nos dados aparece no site (o site só esconde visivel: false): o painel segue a mesma regra (item 57).
const visivelDe = (v) => v?.visivel !== false;

const soObjetos = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);

// Tipo do campo: o das regras (vem com cada campo em /painel/api/conteudo) ou, sem elas, pelo formato do valor.
function tipoDoValor(v, regra) {
  if (regra && typeof regra.tipo === "string") return regra.tipo;
  if (typeof v === "boolean") return "ligado";
  if (Array.isArray(v)) {
    // Lista de fotos (Resultados reais): arquivo + tipo, sem capa. Lista de vídeos: arquivo (e capa, título).
    if (v.some((x) => x && typeof x === "object" && "arquivo" in x && "tipo" in x && !("capa" in x))) return "fotos";
    if (v.some((x) => x && typeof x === "object" && "arquivo" in x)) return "videos";
    if (v.some((x) => x && typeof x === "object" && ("termina" in x || "titulo" in x))) return "campanhas";
    // Lista só de frases (destaques, para quem é...): mesmo sem as regras, aparece frase por frase (contrato C1).
    if (v.length && v.every((x) => typeof x === "string")) return "lista-de-textos";
    return "lista";
  }
  if (typeof v === "string" && /^(?:foto:\S+|\S+\.(?:jpe?g|png|webp))$/i.test(v)) return "foto";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return "data";
  return "texto";
}

// WhatsApp como o site escreve: "5564993192101" -> "(64) 99319-2101" (o mesmo do numeroEscrito do molde).
function whatsappEscrito(v) {
  const n = String(v ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return n.length >= 10 ? `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}` : String(v ?? "");
}

// Valor simples (texto, link, data, escolha, ligado) como a pessoa entende: rótulo da escolha, data brasileira,
// "Ligado"/"Desligado". Nunca o código cru ("nevoa", "2026-11-30T23:59"; item 60).
function textoSimples(v, regra) {
  const tipo = tipoDoValor(v, regra);
  const rotulos = regra && regra.rotulos && typeof regra.rotulos === "object" ? regra.rotulos : {};
  if (tipo === "escolha" && Object.hasOwn(rotulos, String(v ?? ""))) return String(rotulos[String(v ?? "")]);
  if (v === undefined || v === null || v === "") return "(vazio)";
  if (tipo === "ligado") return v === true ? "Ligado" : v === false ? "Desligado" : String(v);
  if (tipo === "data") return dataBR(v);
  if (tipo === "whatsapp") return whatsappEscrito(v);
  if (typeof v === "object") return "(conteúdo que o painel não sabe mostrar)";
  return String(v);
}

// Vídeos: o que muda entre duas listas, vídeo por vídeo (pelo arquivo): quais entraram, saíram, ficaram escondidos
// ou voltaram a aparecer, título ou capa trocados e se a ordem mudou (item 4).
function diferencaDeVideos(antes, depois) {
  const a = soObjetos(antes);
  const d = soObjetos(depois);
  const chave = (v) => String(v.arquivo ?? "");
  const deAntes = new Map(a.map((v) => [chave(v), v]));
  const deDepois = new Map(d.map((v) => [chave(v), v]));
  const ficaram = d.filter((v) => deAntes.has(chave(v)));
  return {
    entraram: d.filter((v) => !deAntes.has(chave(v))),
    sairam: a.filter((v) => !deDepois.has(chave(v))),
    esconderam: ficaram.filter((v) => visivelDe(deAntes.get(chave(v))) && !visivelDe(v)),
    apareceram: ficaram.filter((v) => !visivelDe(deAntes.get(chave(v))) && visivelDe(v)),
    titulos: ficaram.filter((v) => String(deAntes.get(chave(v)).titulo ?? "").trim() !== String(v.titulo ?? "").trim()),
    capas: ficaram.filter((v) => String(deAntes.get(chave(v)).capa ?? "") !== String(v.capa ?? "")),
    ordemMudou: JSON.stringify(a.map(chave).filter((k) => deDepois.has(k))) !== JSON.stringify(ficaram.map(chave)),
  };
}

function resumoDeVideos(dif) {
  const partes = [];
  const contar = (n, um, varios) => { if (n) partes.push(`${n} ${n === 1 ? um : varios}`); };
  contar(dif.entraram.length, "entrou", "entraram");
  contar(dif.sairam.length, "saiu", "saíram");
  contar(dif.esconderam.length, "escondido", "escondidos");
  contar(dif.apareceram.length, "voltou a aparecer", "voltaram a aparecer");
  contar(dif.titulos.length, "título mudou", "títulos mudaram");
  contar(dif.capas.length, "capa trocada", "capas trocadas");
  if (dif.ordemMudou) partes.push("ordem mudou");
  return partes.join(" · ");
}

// Listas de frases (contrato C1): o que entrou, saiu ou mudou, frase por frase. Primeiro liga as frases iguais. Das
// que sobram, só vira "mudou" (texto trocado) a frase parecida com uma que sobrou do outro lado (metade das palavras
// em comum) ou a que ficou na mesma posição; o resto entrou ou saiu. Antes, uma frase tirada e outra nova sem
// relação viravam "1 mudou", e quem aprovava não via que uma promessa saiu do site e outra entrou (rodada 2).
// comoAntes/comoDepois: "igual" | "mudou" | "saiu" (antes) | "entrou" (depois), na posição de cada frase.
const soTextos = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()) : []); // caixa vazia não conta
// Palavras de 3 letras ou mais, sem acento e sem maiúscula ("de", "o", "e" não fazem duas frases parecidas).
const palavrasDe = (t) => new Set(t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter((p) => p.length >= 3));
function parecidas(x, y) {
  const a = palavrasDe(x);
  const b = palavrasDe(y);
  const menor = Math.min(a.size, b.size);
  return menor > 0 && [...a].filter((p) => b.has(p)).length / menor >= 0.5;
}
function diferencaDeTextos(antes, depois) {
  const a = soTextos(antes);
  const d = soTextos(depois);
  const comoAntes = a.map(() => "saiu");
  const parDe = d.map((x) => {
    const j = a.findIndex((y, k) => comoAntes[k] === "saiu" && y.trim() === x.trim());
    if (j >= 0) comoAntes[j] = "igual";
    return j;
  });
  const sobrando = a.map((_, k) => k).filter((k) => comoAntes[k] === "saiu");
  const comoDepois = d.map((x, i) => {
    if (parDe[i] >= 0) return "igual";
    let k = sobrando.findIndex((j) => parecidas(a[j], x));
    if (k < 0) k = sobrando.indexOf(i);
    if (k < 0) return "entrou";
    comoAntes[sobrando.splice(k, 1)[0]] = "mudou";
    return "mudou";
  });
  const iguais = parDe.filter((j) => j >= 0);
  return { comoAntes, comoDepois, ordemMudou: iguais.some((j, i) => i > 0 && j < iguais[i - 1]) };
}
function resumoDeTextos(dif) {
  const n = (lista, como) => lista.filter((x) => x === como).length;
  const partes = [];
  const contar = (q, um, varios) => { if (q) partes.push(`${q} ${q === 1 ? um : varios}`); };
  contar(n(dif.comoDepois, "entrou"), "entrou", "entraram");
  contar(n(dif.comoAntes, "saiu"), "saiu", "saíram");
  contar(n(dif.comoDepois, "mudou"), "mudou", "mudaram");
  if (dif.ordemMudou) partes.push("ordem mudou");
  return partes.join(" · ");
}
// Limites da lista de frases que vêm com o campo ("max-itens" e "max-letras" do esquema). Sem eles, os maiores
// combinados com o chat do site (12 frases de 200 letras); o servidor confere de novo.
const inteiroOu = (v, padrao) => (Number.isInteger(v) && v > 0 ? v : padrao);
const limitesDaLista = (c) => ({ itens: inteiroOu(c?.["max-itens"] ?? c?.maxItens, 12), letras: inteiroOu(c?.["max-letras"] ?? c?.maxLetras, 200) });

const CAMPOS_DA_CAMPANHA = ["titulo", "texto", "botao", "termina", "ligada"];
const mesmaParte = (k, x, y) => (k === "ligada" ? (x !== false) === (y !== false) : String(x ?? "").trim() === String(y ?? "").trim());
// Campanhas: liga cada campanha de "depois" à de "antes" com o mesmo título (ou, se o título mudou, à da mesma
// posição) e diz quais partes mudaram (texto, botão, término, ligada); as que sobram em "antes" saíram (item 4).
function diferencaDeCampanhas(antes, depois) {
  const a = soObjetos(antes);
  const d = soObjetos(depois);
  const usadas = new Set();
  const pares = d.map((x) => {
    const j = a.findIndex((y, k) => !usadas.has(k) && String(y.titulo ?? "") === String(x.titulo ?? ""));
    if (j >= 0) usadas.add(j);
    return { x, j };
  });
  const titulosDepois = new Set(d.map((x) => String(x.titulo ?? "")));
  pares.forEach((p, i) => {
    if (p.j < 0 && i < a.length && !usadas.has(i) && !titulosDepois.has(String(a[i].titulo ?? ""))) { p.j = i; usadas.add(i); }
  });
  return {
    pares: pares.map(({ x, j }) => ({ depois: x, antes: j >= 0 ? a[j] : null, nova: j < 0,
      mudaram: j >= 0 ? CAMPOS_DA_CAMPANHA.filter((k) => !mesmaParte(k, a[j][k], x[k])) : [] })),
    sairam: a.filter((_, k) => !usadas.has(k)),
  };
}

// Resposta sem "erro" (tempo limite da função, 500/502 da Netlify, página HTML): mensagem em português (item 28).
function erroPadrao(rota, status, metodo = "GET") {
  if (metodo !== "GET" && status >= 500 && /^(publicar|aprovacoes|desfazer)\b/.test(rota)) {
    // No Aprovar, o que continua guardado é o envio da funcionária, não "suas mudanças" (contrato C6).
    const guardado = /^aprovacoes\b/.test(rota) ? "O envio continua esperando aprovação." : "Suas mudanças continuam salvas.";
    return `O painel demorou para responder. ${guardado} Espere 2 minutos e abra o Histórico para ver se publicou antes de tentar de novo.`;
  }
  if (metodo === "GET") return "Não foi possível carregar agora. Tente de novo em instantes.";
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

// O que ficou guardado no aparelho só vale no formato { valor, base, em } e por 7 dias (itens 25 e 33).
const GUARDADO_PRAZO = 7 * 24 * 60 * 60 * 1000;
function guardadoValido(texto, agora) {
  try {
    const g = JSON.parse(texto);
    if (!g || typeof g !== "object" || !Object.hasOwn(g, "valor") || typeof g.base !== "string" || typeof g.em !== "number") return null;
    if (agora - g.em > GUARDADO_PRAZO || g.em - agora > 60_000) return null;
    return g;
  } catch {
    return null;
  }
}

// A lista que a tela de Publicar mostrou, para o servidor publicar exatamente ela: { caminho: em } (item 23).
const vistasDe = (mudancas) => Object.fromEntries(Object.entries(mudancas || {}).map(([c, m]) => [c, m?.em ?? null]));

// Campos que mudaram no rascunho desde que a tela abriu (outra pessoa salvou, publicou ou descartou; item 26).
const mudaramDesde = (itens, mudancasAgora) => itens.filter((x) => (mudancasAgora?.[x.caminho]?.em ?? null) !== (x.em ?? null));

// Salvar ou "Voltar ao que está no site" recusado porque outra pessoa mudou o campo depois que a tela abriu: o
// servidor responde 409 com { erro, atual, em } e não grava nada (contrato C3). Outros 409 (rascunho cheio, muita
// gente salvando) não trazem "atual" nem "em".
const outraPessoaMudou = (r) => r?.status === 409 && Boolean(r.dados) && (Object.hasOwn(r.dados, "atual") || Object.hasOwn(r.dados, "em"));

// Código da versão (commit): curto ou completo, o começo bate.
const mesmoCommit = (a, b) => typeof a === "string" && typeof b === "string" && a.length >= 7 && b.length >= 7 && (a.startsWith(b) || b.startsWith(a));
// Código que veio na resposta do Publicar/Aprovar/Desfazer ou no Histórico (contrato C2: 40 letras; aceita o curto).
const commitDe = (x) => (typeof x?.commit === "string" && /^[0-9a-f]{7,40}$/.test(x.commit) ? x.commit : null);

// "Ana (a***@loja.com)": nome com o e-mail já mascarado pelo servidor; sem o e-mail, só o nome (contrato C5).
const comEmail = (nome, email) => (typeof email === "string" && email ? `${nome} (${email})` : String(nome ?? ""));

// Registro de acessos: "gerou convite de funcionaria" → "gerou convite de funcionária" (item 60).
const PAPEL_ESCRITO = { admin: "administradora", responsavel: "responsável", funcionaria: "funcionária" };
const papelLegivel = (texto) => String(texto ?? "").replace(/\b(funcionaria|responsavel|admin)\b/g, (p) => PAPEL_ESCRITO[p]);

// Espera uma promessa por no máximo "ms"; depois desiste (ex.: capa do vídeo no iPhone; item 35).
function comPrazo(promessa, ms) {
  return new Promise((ok, falhou) => {
    const relogio = setTimeout(() => falhou(new Error("prazo")), ms);
    promessa.then((v) => { clearTimeout(relogio); ok(v); }, (e) => { clearTimeout(relogio); falhou(e); });
  });
}

// Faixa de créditos baixos no topo (pedido de 26/10): aparece com o medidor laranja, vermelho ou travado, ou quando a
// cota caiu pelo gasto real anotado (baixouPelaLeitura). Quem publica lê "junte e publique"; a funcionária, que não
// publica, lê que a Bruna vai juntar. A linha menor diz quantas publicações restam até renovar ("21/11/2026" → "21/11").
// Acabou (travado): "junte e publique" não vale mais, então a faixa diz que as mudanças ficam salvas e quando dá para
// publicar de novo (revisão de 26/10: antes as duas linhas se contradiziam).
// Devolve null (sem faixa) ou { titulo, linha, tom }.
function faixaDeCreditos(c, papel) {
  if (!c || typeof c !== "object") return null;
  if (!["laranja", "vermelho", "travado"].includes(c.cor) && c.baixouPelaLeitura !== true) return null;
  const n = Number.isInteger(c.restantes) && c.restantes > 0 ? c.restantes : 0;
  const dia = /^\d{2}\/\d{2}/.exec(String(c.renovaEm ?? ""))?.[0];
  if (c.cor === "travado" || n === 0) {
    const quando = dia ? `a partir de ${dia}` : "quando o mês renovar";
    return { titulo: "As publicações do mês acabaram: as mudanças ficam salvas.",
      linha: papel === "funcionaria" ? `A Bruna volta a publicar ${quando}.` : `Dá para publicar de novo ${quando}.`, tom: "vermelho" };
  }
  const ate = dia ? ` até ${dia}` : " este mês";
  const linha = `${n === 1 ? "Resta 1 publicação" : `Restam ${n} publicações`}${ate}.`;
  const titulo = papel === "funcionaria" ? "Créditos baixos: a Bruna vai juntar as mudanças antes de publicar."
    : "Créditos baixos: junte as mudanças e publique tudo de uma vez.";
  return { titulo, linha, tom: c.cor === "vermelho" ? "vermelho" : "laranja" };
}

// "Entendi" vale para esta entrada (cada entrada vence numa hora diferente) e para esta situação (cor, cota e leitura):
// numa entrada nova, ou se a situação piorar (laranja → vermelho, cota que cai), a faixa volta. Sem o e-mail: a marca
// fica na aba e não precisa dizer quem entrou (revisão de 26/10; o Sair também apaga a marca).
const marcaDaFaixa = (c, pessoa) => [pessoa?.expira, c?.cor, c?.cota, c?.baixouPelaLeitura === true].join("|");

// </ajudantes-puros>

// ---------- ajudantes ----------
function h(tag, props, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const f of filhos.flat()) if (f !== null && f !== undefined && f !== false) el.append(f.nodeType ? f : document.createTextNode(String(f)));
  return el;
}
const novoId = () => "c" + Math.random().toString(36).slice(2, 10);
const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function pedir(rota, { metodo = "GET", corpo } = {}) {
  let r;
  try {
    r = await fetch(API + rota, {
      method: metodo,
      credentials: "same-origin",
      headers: { "X-Painel": "1", ...(corpo !== undefined && { "Content-Type": "application/json" }) },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    return { status: 0, dados: { erro: "Sem internet ou o painel não respondeu. Tente de novo." } };
  }
  const lido = await r.json().catch(() => null);
  const dados = lido && typeof lido === "object" && !Array.isArray(lido) ? lido : {};
  // Toda falha tem mensagem, mesmo quando a Netlify responde sem o "erro" (tempo limite, 502; item 28).
  if (!r.ok && typeof dados.erro !== "string") dados.erro = erroPadrao(rota, r.status, metodo);
  if (r.status === 401 && rota !== "entrar" && eu) {
    eu = null;
    telaEntrar(`${dados.erro} Se você estava digitando, o texto ficou guardado neste aparelho.`);
  }
  return { status: r.status, dados };
}

const quando = (ms) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(ms);
const ehResponsavel = () => eu && (eu.papel === "responsavel" || eu.papel === "admin");

// Tela de entrar ou de convite no lugar do painel: uma pergunta que estava aberta era da tela que saiu (fecha com "não").
function trocar(...filhos) { perguntaAberta?.responder(false); estrutura = null; app.replaceChildren(...filhos); window.scrollTo(0, 0); }
// Sem texto numa mensagem de erro, diz pelo menos que algo deu errado (item 28). "" limpa a mensagem.
function mensagem(el, texto, tipo = "erro") {
  el.className = tipo;
  el.textContent = texto === undefined && tipo === "erro" ? "Algo deu errado. Tente de novo." : texto || "";
}
function ocupado(botao, sim, texto) {
  botao.disabled = sim;
  if (sim) { botao.dataset.texto = botao.textContent; botao.textContent = texto || "Aguarde…"; }
  else if (botao.dataset.texto) botao.textContent = botao.dataset.texto;
}
function campo(rotulo, props, ajuda) {
  const id = novoId();
  const entrada = h(props.tag || "input", { id, ...props, tag: undefined });
  return { el: h("div", { class: "campo" }, h("label", { for: id, text: rotulo }), entrada, ajuda && h("p", { class: "ajuda", text: ajuda })), entrada };
}
const etiqueta = (texto, cor = "") => h("span", { class: `etiqueta ${cor}`, text: texto });
const botaoInicio = () => h("button", { class: "botao", type: "button", onclick: () => ir("") }, "Voltar ao início");

// ---------- pergunta na própria tela, no lugar do confirm() e do alert() do navegador (teste de 26/10) ----------
// O navegador de dentro de aplicativos (WhatsApp, Instagram) e o do app do Claude bloqueiam essas janelinhas: o
// confirm() devolvia "não" na hora, sem mostrar nada, e "Publicar no site" não fazia nada. Agora a pergunta é uma
// caixa do próprio painel, direto no <body>: fora da área que as telas desenham de novo (não some no meio) e por cima
// de tudo, até do menu do celular. Devolve uma promessa: true = o botão "sim"; false = "Cancelar", Esc ou outra
// pergunta que abriu no lugar. nao: null = só um botão (aviso, no lugar do alert). tom: "verde" (publicar) ou
// "perigo" (apagar, excluir, desligar). Tocar no fundo escuro não responde nada (evita toque sem querer).
let perguntaAberta = null; // { botoes, responder }
function perguntar(texto, { sim = "Sim", nao = "Cancelar", tom = "", titulo } = {}) {
  perguntaAberta?.responder(false); // uma pergunta de cada vez: a que estava aberta responde "não" e some
  const antes = document.activeElement; // ao fechar, o foco volta para cá
  return new Promise((resolver) => {
    const idTitulo = novoId();
    const idTexto = novoId();
    const bSim = h("button", { class: `botao ${tom}`.trim(), type: "button", "data-resposta": "sim" }, sim);
    const bNao = nao === null ? null : h("button", { class: "botao claro", type: "button", "data-resposta": "nao" }, nao);
    const fundo = h("div", { class: "pergunta-fundo" },
      h("div", { class: `pergunta ${tom}`.trim(), role: "alertdialog", "aria-modal": "true", "aria-labelledby": idTitulo, "aria-describedby": idTexto },
        h("div", { class: "pergunta-corpo" },
          h("h2", { class: "pergunta-titulo", id: idTitulo, text: titulo || (nao === null ? "Aviso" : tom === "perigo" ? "Atenção" : "Confirme") }),
          h("p", { class: "pergunta-texto", id: idTexto, text: texto })),
        h("div", { class: "pergunta-botoes" }, bSim, bNao)));
    // Clicar no fundo não tira o foco dos botões (quem usa teclado continua na pergunta).
    fundo.addEventListener("mousedown", (e) => { if (e.target === fundo) e.preventDefault(); });
    const esta = {
      botoes: [bSim, bNao].filter(Boolean),
      responder(resposta) {
        if (perguntaAberta !== esta) return;
        perguntaAberta = null;
        fundo.remove();
        app.inert = false;
        if (antes && antes !== document.body && antes.isConnected) antes.focus?.({ preventScroll: true });
        resolver(resposta);
      },
    };
    bSim.addEventListener("click", () => esta.responder(true));
    bNao?.addEventListener("click", () => esta.responder(false));
    perguntaAberta = esta;
    app.inert = true; // a tela de trás fica fora do toque, do Tab e da leitura de tela enquanto a pergunta está aberta
    document.body.append(fundo);
    // Apagar, excluir, desligar: o foco começa em "Cancelar" (um Enter sem querer não apaga nada).
    (tom === "perigo" && bNao ? bNao : bSim).focus();
  });
}
// Com a pergunta aberta: Esc = Cancelar e o Tab fica preso nos botões dela. Na fase de captura, antes do Esc que
// fecha o menu do celular (o Esc só fecha a pergunta).
document.addEventListener("keydown", (e) => {
  if (!perguntaAberta) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); perguntaAberta.responder(false); return; }
  if (e.key !== "Tab") return;
  e.preventDefault();
  const { botoes } = perguntaAberta;
  const i = botoes.indexOf(document.activeElement);
  const passo = e.shiftKey ? -1 : 1;
  botoes[i < 0 ? (passo > 0 ? 0 : botoes.length - 1) : (i + passo + botoes.length) % botoes.length].focus();
}, true);

// Pergunta antes de agir num botão da tela. Dois toques seguidos no botão não abrem duas perguntas. O "sim" só vale
// se o botão ainda estiver na tela: se ela foi trocada ou desenhada de novo enquanto a pergunta estava aberta (ex.:
// voltar do navegador), não age sobre o que já saiu.
const perguntandoEm = new WeakSet();
async function confirmarNaTela(botao, texto, opcoes) {
  if (perguntandoEm.has(botao)) return false;
  perguntandoEm.add(botao);
  try {
    return (await perguntar(texto, opcoes)) && botao.isConnected;
  } finally {
    perguntandoEm.delete(botao);
  }
}

// ---------- como cada valor aparece na tela (Aprovações, conflitos, Histórico, Publicar, Enviar; itens 4 e 60) ----------
const enderecoDeImagem = (v) => window.demoFotoDe?.(v) || (String(v).startsWith("foto:") ? `${API}foto?id=${encodeURIComponent(String(v).slice(5))}` : String(v));
const vazio = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
function miniatura(endereco, alt, pequena) {
  const img = h("img", { class: `miniatura${pequena ? " pequena" : ""}`, src: enderecoDeImagem(endereco), alt, loading: "lazy" });
  img.addEventListener("error", () => img.classList.add("sem-imagem"));
  return img;
}

// Mostra um valor do site para a pessoa. "outro" é o valor do outro lado (antes/depois) e "lado" diz qual é este,
// para destacar o que mudou: vídeos e campanhas item por item, foto com miniatura.
function valorNaTela(v, regra, outro, lado = "depois") {
  const tipo = tipoDoValor(vazio(v) && outro !== undefined ? outro : v, regra);
  if (tipo === "foto") {
    if (!v) return h("span", { class: "miudo", text: "(sem foto)" });
    return h("div", { class: "valor-foto" }, miniatura(v, "Foto"),
      h("span", { class: "miudo", text: String(v).startsWith("foto:") ? "Foto nova (enviada pelo painel)" : String(v).split("/").pop() }));
  }
  if (tipo === "videos") return videosNaTela(v, outro, lado);
  if (tipo === "fotos") return fotosNaTela(v, outro, lado, regra);
  if (tipo === "campanhas") return campanhasNaTela(v, outro, lado);
  if (tipo === "lista-de-textos") return textosNaTela(v, outro, lado);
  if (tipo === "lista") return h("span", { text: Array.isArray(v) && v.length ? `${v.length} item(ns)` : "(nenhum)" });
  return h("span", { class: "valor-texto", text: textoSimples(v, regra) });
}

// Lista de frases: cada frase numa linha, com o que entrou, saiu ou mudou em destaque (contrato C1).
function textosNaTela(v, outro, lado) {
  const ts = soTextos(v);
  if (!ts.length) return h("span", { class: "miudo", text: "(nenhuma frase: este bloco não aparece no site)" });
  const comparar = outro !== undefined;
  const dif = lado === "antes" ? diferencaDeTextos(v, outro) : diferencaDeTextos(outro, v);
  const como = lado === "antes" ? dif.comoAntes : dif.comoDepois;
  const resumo = comparar && lado === "depois" ? resumoDeTextos(dif) : "";
  return h("div", {},
    h("p", { class: "miudo", text: `${ts.length} ${ts.length === 1 ? "frase" : "frases"}${resumo ? ` · ${resumo}` : ""}` }),
    h("ol", { class: "valor-lista valor-frases" }, ts.map((t, i) => h("li", {},
      h("span", { class: comparar && como[i] !== "igual" ? "mudou" : "", text: t }), " ",
      comparar && lado === "depois" && como[i] === "entrou" && etiqueta("Nova", "verde"),
      comparar && lado === "depois" && como[i] === "mudou" && etiqueta("Mudou"),
      comparar && lado === "antes" && como[i] === "saiu" && etiqueta("Sai", "laranja"),
      comparar && lado === "antes" && como[i] === "mudou" && etiqueta("Vai mudar")))));
}

function videosNaTela(v, outro, lado) {
  const vs = soObjetos(v);
  if (!vs.length) return h("span", { class: "miudo", text: "(nenhum vídeo)" });
  const comparar = outro !== undefined;
  const dif = lado === "antes" ? diferencaDeVideos(v, outro) : diferencaDeVideos(outro, v);
  const em = (lista, x) => comparar && lista.includes(x);
  const resumo = comparar && lado === "depois" ? resumoDeVideos(dif) : "";
  return h("div", {},
    h("p", { class: "miudo", text: `${vs.length} ${vs.length === 1 ? "vídeo" : "vídeos"}${resumo ? ` · ${resumo}` : ""}` }),
    h("ol", { class: "valor-lista" }, vs.map((x) => h("li", { class: "valor-item" },
      x.capa ? miniatura(x.capa, "Capa do vídeo", true) : h("span", { class: "sem-capa", text: "Sem capa" }),
      h("span", {},
        // Sem título: o nome do arquivo (vídeo do site) ou "Vídeo novo" (enviado pelo painel), nunca o código "video:…".
        h("span", { class: em(dif.titulos, x) ? "mudou" : "", text: String(x.titulo || "").trim()
          || (String(x.arquivo ?? "").startsWith("video:") ? "Vídeo novo (sem título)" : `Vídeo sem título (${String(x.arquivo ?? "").split("/").pop()})`) }), " ",
        lado === "depois" && em(dif.entraram, x) && etiqueta("Novo", "verde"),
        lado === "antes" && em(dif.sairam, x) && etiqueta("Sai", "laranja"),
        !visivelDe(x) && etiqueta(lado === "depois" && em(dif.esconderam, x) ? "Escondido agora" : "Escondido", "cinza"),
        lado === "depois" && em(dif.apareceram, x) && etiqueta("Volta a aparecer", "verde"),
        lado === "depois" && em(dif.capas, x) && etiqueta("Capa nova"))))));
}

// Lista de fotos (Resultados reais): miniatura de cada uma, com o tipo e o que entrou, saiu ou ficou escondido.
const TIPOS_DE_FOTO = { "antes-e-depois": "Antes e depois", resultado: "Resultado", comentario: "Comentário de cliente" };
const rotuloDoTipoDeFoto = (tipo, regra) => regra?.rotulos?.[tipo] || TIPOS_DE_FOTO[tipo] || tipo;
function fotosNaTela(v, outro, lado, regra) {
  const fs = soObjetos(v);
  if (!fs.length) return h("span", { class: "miudo", text: "(nenhuma foto)" });
  const comparar = outro !== undefined;
  const dif = lado === "antes" ? diferencaDeVideos(v, outro) : diferencaDeVideos(outro, v);
  const em = (lista, x) => comparar && lista.includes(x);
  const resumo = comparar && lado === "depois" ? resumoDeVideos({ ...dif, ordemMudou: false }) : "";
  return h("div", {},
    h("p", { class: "miudo", text: `${fs.length} ${fs.length === 1 ? "foto" : "fotos"}${resumo ? ` · ${resumo}` : ""}` }),
    h("ol", { class: "valor-lista" }, fs.map((x) => h("li", { class: "valor-item" },
      miniatura(x.arquivo, rotuloDoTipoDeFoto(x.tipo, regra), true),
      h("span", {}, h("span", { text: rotuloDoTipoDeFoto(x.tipo, regra) }), " ",
        lado === "depois" && em(dif.entraram, x) && etiqueta("Nova", "verde"),
        lado === "antes" && em(dif.sairam, x) && etiqueta("Sai", "laranja"),
        !visivelDe(x) && etiqueta(lado === "depois" && em(dif.esconderam, x) ? "Escondida agora" : "Escondida", "cinza"),
        lado === "depois" && em(dif.apareceram, x) && etiqueta("Volta a aparecer", "verde"))))));
}

function campanhasNaTela(v, outro, lado) {
  const cs = soObjetos(v);
  if (!cs.length) return h("span", { class: "miudo", text: "(nenhuma campanha)" });
  const comparar = outro !== undefined;
  const dif = lado === "antes" ? diferencaDeCampanhas(v, outro) : diferencaDeCampanhas(outro, v);
  return h("ol", { class: "valor-lista" }, cs.map((x) => {
    const par = dif.pares.find((p) => (lado === "antes" ? p.antes : p.depois) === x);
    const mudaram = comparar && par ? par.mudaram : [];
    const parte = (k, texto) => h("div", { class: mudaram.includes(k) ? "mudou" : "", text: texto });
    return h("li", { class: "valor-item campanha" }, h("div", {},
      h("strong", { class: mudaram.includes("titulo") ? "mudou" : "", text: x.titulo || "(sem título)" }), " ",
      comparar && lado === "depois" && par?.nova && etiqueta("Nova", "verde"),
      comparar && lado === "antes" && !par && etiqueta("Sai", "laranja"),
      parte("texto", `Texto: ${x.texto || "(vazio)"}`),
      parte("botao", `Botão: ${x.botao || "(vazio)"}`),
      parte("termina", `Termina: ${x.termina ? dataBR(x.termina) : "(sem data)"}`),
      parte("ligada", x.ligada === false ? "Desligada no site" : "Ligada no site")));
  }));
}

function antesDepois(antes, depois, regra, rotulos = ["Antes", "Depois"]) {
  return h("div", { class: "antes-depois" },
    h("div", {}, h("b", { text: rotulos[0] }), valorNaTela(antes, regra, depois, "antes")),
    h("div", {}, h("b", { text: rotulos[1] }), valorNaTela(depois, regra, antes, "depois")));
}

// Nome do campo: primeiro o da tela de Conteúdo ("Para quem é · Gloss Brumar Matizado"), que vem com o nome do item;
// depois o do servidor (que, em publicações antigas, tem a chave: "Para quem é · gloss"; rodada 2 da conferência).
const itemDeMudanca = (m, mapa) => h("li", {}, h("strong", { text: mapa[m.caminho]?.nome || m.nome || m.caminho }),
  antesDepois(m.antes, m.depois, mapa[m.caminho]));

// ---------- regras dos campos (tipo e rótulos das escolhas) ----------
// Vêm com cada campo em /painel/api/conteudo e servem para mostrar cada valor do jeito certo nas telas que só têm o
// caminho do campo. Não guardam nada da pessoa (o rascunho fica de fora).
let regrasCache = null; // { dono, mapa, menu }
function anotarRegras(dados) {
  const mapa = {};
  for (const g of dados?.grupos || []) for (const c of g.campos || []) mapa[c.caminho] = { tipo: c.tipo, rotulos: c.rotulos, opcoes: c.opcoes, nome: c.nome, rotulo: c.rotulo };
  const menu = (dados?.grupos || []).map(({ id, titulo, icone, dentroDe }) => ({ id, titulo, icone, dentroDe }));
  regrasCache = { dono: eu?.email, mapa, menu };
}
// O menu e as telas pedem as regras juntos: um pedido só.
let conteudoNoCaminho = null; // { dono, promessa }
function pedirConteudo() {
  if (!conteudoNoCaminho || conteudoNoCaminho.dono !== eu?.email) {
    const promessa = pedir("conteudo").then((r) => { if (r.status === 200) anotarRegras(r.dados); return r; });
    conteudoNoCaminho = { dono: eu?.email, promessa };
    promessa.then(() => { if (conteudoNoCaminho?.promessa === promessa) conteudoNoCaminho = null; });
  }
  return conteudoNoCaminho.promessa;
}
async function regras() {
  if (regrasCache && regrasCache.dono === eu?.email) return regrasCache.mapa;
  const r = await pedirConteudo();
  return r.status === 200 && regrasCache ? regrasCache.mapa : {};
}

// ---------- o que foi mexido e não salvo fica guardado neste aparelho (item 4 da especificação) ----------
// Vale para todas as telas de edição (campos, campanha, vídeos, foto, recado), por 7 dias. Nunca volta sozinho para o
// campo nem entra no Salvar de outro campo: a tela mostra "Recuperamos…" com "Usar o que eu tinha digitado" e
// "Descartar" (itens 11, 25, 27, 32 e 33). "base" = o valor que a tela mostrava quando a pessoa começou a mexer.
const prefixoGuardado = () => `painel-guardado:${eu ? eu.email : ""}:`;
const chaveGuardada = (sufixo) => prefixoGuardado() + sufixo;
function guardarEm(chave, valor, base) {
  if (!eu || !chave.startsWith(prefixoGuardado())) return; // a pessoa saiu ou outra entrou neste aparelho
  try { localStorage.setItem(chave, JSON.stringify({ valor, base: JSON.stringify(base ?? null), em: Date.now() })); } catch { /* sem espaço ou bloqueado */ }
}
function lerGuardado(chave) {
  try {
    const texto = localStorage.getItem(chave);
    if (texto === null) return null;
    const g = guardadoValido(texto, Date.now());
    if (!g) localStorage.removeItem(chave);
    return g;
  } catch {
    return null;
  }
}
function esquecerChave(chave) { try { localStorage.removeItem(chave); } catch { /* nada */ } }
function limparGuardadosVencidos() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("painel-guardado:") && !guardadoValido(localStorage.getItem(k), Date.now())) localStorage.removeItem(k);
  } catch { /* sem acesso ao armazenamento do aparelho */ }
}

// "mesmo": como comparar o guardado com o de agora (a lista de frases ignora caixa vazia e espaços nas pontas).
function oferecerRecuperacao(chave, { atual, base, aoUsar, mostrar, mesmo = (a, b) => JSON.stringify(a) === JSON.stringify(b) }) {
  const g = lerGuardado(chave);
  if (!g) return null;
  if (mesmo(g.valor, atual)) { esquecerChave(chave); return null; }
  const usar = h("button", { class: "botao", type: "button" }, "Usar o que eu tinha digitado");
  const descartar = h("button", { class: "botao claro", type: "button" }, "Descartar");
  const caixa = h("div", { class: "recuperado", role: "status" },
    h("p", { class: "sucesso", text: `Recuperamos o que você tinha digitado e não salvou (${quando(g.em)}):` }),
    h("div", { class: "recuperado-valor" }, mostrar(g.valor)),
    g.base !== JSON.stringify(base ?? null) && h("p", { class: "erro", text: "Atenção: isto mudou depois que você digitou (no site ou por outra pessoa). Confira antes de usar." }),
    h("div", { class: "botoes" }, usar, descartar));
  usar.addEventListener("click", () => { aoUsar(g.valor); caixa.remove(); });
  descartar.addEventListener("click", () => { esquecerChave(chave); caixa.remove(); });
  return caixa;
}

// ---------- foto ou vídeo subindo: avisa antes de sair da tela (item 56) ----------
let enviosEmAndamento = 0;
const PERGUNTA_ENVIO = "Um vídeo ou uma foto ainda está subindo. Espere terminar e toque em Salvar. Sair desta tela mesmo assim? (Se terminar de subir, ele fica guardado neste aparelho.)";
// Sem envio no meio, pode sair; com envio, pergunta na tela e só sai com "Sair mesmo assim" (devolve uma promessa).
const podeSairDaTela = async () => !enviosEmAndamento
  || perguntar(PERGUNTA_ENVIO, { sim: "Sair mesmo assim", nao: "Ficar e esperar", titulo: "Ainda está subindo" });
window.addEventListener("beforeunload", (e) => { if (enviosEmAndamento) { e.preventDefault(); e.returnValue = ""; } });

// O envio terminou, mas a tela dele não está mais na frente (a pessoa saiu ou a tela foi desenhada de novo): o
// resultado já ficou guardado no aparelho; avisa na tela de agora, com um botão para abrir a tela do campo. Sem isso,
// ela só via o "Recuperamos…" se voltasse lá por conta própria (item 56).
function avisarEnvioTerminado(el, frase, rota) {
  if (!eu || el.isConnected) return;
  const lugar = estrutura?.meio?.querySelector(".conteudo");
  if (!lugar) return;
  const caixa = h("div", { class: "recuperado aviso-envio", role: "status" },
    h("p", { class: "sucesso", text: `${frase} Para usar, abra a tela, toque em "Usar o que eu tinha digitado" e depois em Salvar.` }),
    h("div", { class: "botoes" },
      h("button", { class: "botao", type: "button", onclick: () => ir(rota) }, "Abrir agora"),
      h("button", { class: "botao claro", type: "button", onclick: () => caixa.remove() }, "Depois")));
  lugar.prepend(caixa);
}

// ---------- estrutura do computador: menu à esquerda, telas no meio, prévia do site à direita ----------
// (pedido de 22/10, inspirado no vídeo de exemplo). No celular, só o meio aparece (CSS).
let estrutura = null;
const TELA_LARGA = "(min-width: 1100px)";
const CELULAR = "(max-width: 759px)";
let modoPrevia = "celular";
try { modoPrevia = localStorage.getItem("painel-modo-previa") || "celular"; } catch { /* sem armazenamento */ }

function itemLateral(icone, titulo, rota, acao) {
  return h("button", { class: "lateral-item", type: "button", "data-rota": rota ?? "", title: titulo, onclick: acao || (() => ir(rota)) },
    h("span", { class: "lateral-icone", "aria-hidden": "true", text: icone }), h("span", { class: "lateral-texto", text: titulo }));
}

// Menu do celular: fechado, fica fora da leitura de tela e do Tab (inert e aria-hidden); o ☰ diz se está aberto;
// Esc fecha; ao abrir, o foco vai para o menu e, ao fechar, volta para o ☰ (item 61).
function menuDoCelular(aberto, { focar = false } = {}) {
  if (!estrutura) return;
  const { menu, fundo } = estrutura;
  menu.classList.toggle("aberto", aberto);
  fundo.classList.toggle("aberto", aberto);
  const escondido = window.matchMedia(CELULAR).matches && !aberto;
  menu.inert = escondido;
  if (escondido) menu.setAttribute("aria-hidden", "true");
  else menu.removeAttribute("aria-hidden");
  estrutura.abrirMenu?.setAttribute("aria-expanded", aberto ? "true" : "false");
  if (focar) (aberto ? menu.querySelector(".lateral-item") : estrutura.abrirMenu)?.focus();
}
window.matchMedia(CELULAR).addEventListener?.("change", () => menuDoCelular(Boolean(estrutura?.menu.classList.contains("aberto"))));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && estrutura?.menu.classList.contains("aberto")) menuDoCelular(false, { focar: true });
});

function marcarAtivo() {
  if (!estrutura) return;
  const atual = decodeURIComponent(location.hash.slice(1));
  for (const b of estrutura.menu.querySelectorAll(".lateral-item")) b.classList.toggle("ativo", b.dataset.rota === atual);
}

function ajustarPrevia() {
  if (!estrutura?.iframe) return;
  const { iframe, moldura } = estrutura;
  const largura = modoPrevia === "computador" ? 1280 : 390;
  const escala = Math.min(1, moldura.clientWidth / largura);
  iframe.style.width = `${largura}px`;
  iframe.style.height = `${Math.round(moldura.clientHeight / escala)}px`;
  iframe.style.transform = `scale(${escala})`;
  for (const b of estrutura.botoesModo) b.classList.toggle("ativo", b.dataset.modo === modoPrevia);
}

// Parte do site que a prévia mostra: a do grupo aberto (pedido de 26/10). "#conteudo/produtos/gloss" →
// "produtos:gloss"; "#conteudo/videos/videos-por-produto:gloss" → "videos-por-produto:gloss" (item de um grupo com
// várias listas); campanha aberta ("#conteudo/campanhas/0") → "campanhas"; fora do Conteúdo → "" (página inicial).
function focoDaTela() {
  let endereco;
  try { endereco = decodeURIComponent(location.hash.slice(1)); } catch { return ""; }
  const [secao, grupo, item = ""] = endereco.split("/");
  const pedaco = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (secao !== "conteudo" || !pedaco.test(grupo || "")) return "";
  const partes = item.split(":");
  if (partes.length > 1) return partes.length === 2 && partes.every((p) => pedaco.test(p)) ? item : grupo;
  return pedaco.test(item) && !/^\d+$/.test(item) && item !== "nova" ? `${grupo}:${item}` : grupo;
}

// Monta (de novo) a prévia: dados do site com o rascunho → previa/previa.js (molde da Opção A ou prévia simplificada)
// → iframe "srcdoc". Assim a página não precisa ser aberta numa moldura, e as regras de segurança do site
// (frame-ancestors 'none') continuam fechadas. Busca os dados ao abrir e depois de Salvar, Descartar ou Publicar;
// ao trocar de tela, só desenha de novo com o foco novo (focarPrevia), sem pedir os dados outra vez.
let buscandoPrevia = 0;
let montandoPrevia = 0;
let previaResposta = null; // última resposta de /painel/api/previa
let focoMostrado = null; // foco da última prévia desenhada
async function atualizarPrevia() {
  const iframe = estrutura?.iframe;
  if (!iframe) return;
  const vez = ++buscandoPrevia; // se pedirem de novo no meio, só a última busca vale
  const r = await pedir("previa");
  if (vez !== buscandoPrevia || estrutura?.iframe !== iframe) return;
  previaResposta = r;
  await desenharPrevia();
}
async function desenharPrevia() {
  const iframe = estrutura?.iframe;
  const r = previaResposta;
  if (!iframe || !r) return;
  const vez = ++montandoPrevia; // só a última montagem vai para a tela
  const foco = focoDaTela();
  let html;
  if (r.status !== 200) {
    html = `<!doctype html><meta charset="utf-8"><p style="font-family:sans-serif;padding:16px">${(r.dados.erro || "Não foi possível montar a prévia.").replace(/[<>&]/g, "")}</p>`;
  } else {
    try {
      const base = new URL("previa/", document.baseURI).href;
      const modulo = await import(new URL("previa.js", base).href);
      html = await modulo.htmlDaPrevia(r.dados, base, foco);
    } catch {
      html = `<!doctype html><meta charset="utf-8"><p style="font-family:sans-serif;padding:16px">Não foi possível montar a prévia agora.</p>`;
    }
  }
  if (vez === montandoPrevia && estrutura?.iframe === iframe) { iframe.srcdoc = html; focoMostrado = foco; }
}
// Trocou de tela: a prévia passa a mostrar a parte do site do grupo aberto (Textos → topo, Link na bio → a /bio...).
function focarPrevia() {
  if (!estrutura?.iframe || !previaResposta || focoDaTela() === focoMostrado) return;
  desenharPrevia();
}

function garantirEstrutura() {
  if (estrutura && app.contains(estrutura.raiz)) return estrutura;
  const recolhido = (() => { try { return localStorage.getItem("painel-menu-recolhido") === "1"; } catch { return false; } })();
  const gruposMenu = h("div", { class: "lateral-grupos" });
  const menu = h("aside", { class: `lateral${recolhido ? " recolhido" : ""}`, id: "menu-painel", "aria-label": "Menu do painel" },
    h("div", { class: "lateral-topo" },
      h("img", { class: "lateral-logo", src: "logo.png", alt: "Brumar Cosméticos" }),
      h("button", { class: "lateral-recolher", type: "button", "aria-label": "Recolher ou abrir o menu", onclick: () => {
        menu.classList.toggle("recolhido");
        try { localStorage.setItem("painel-menu-recolhido", menu.classList.contains("recolhido") ? "1" : "0"); } catch { /* nada */ }
        setTimeout(ajustarPrevia, 50);
      } }, "☰")),
    itemLateral("🏠", "Início", ""),
    h("p", { class: "lateral-secao", text: "Conteúdo do site" }), gruposMenu,
    h("p", { class: "lateral-secao", text: "Site" }),
    ehResponsavel() ? itemLateral("🚀", "Publicar", "publicar") : itemLateral("📨", "Enviar para aprovação", "enviar"),
    !ehResponsavel() && itemLateral("✅", "Aprovações", "aprovacoes"), // sem funcionárias desde 27/10
    itemLateral("🕘", "Histórico", "historico"),
    itemLateral("🔔", "Avisos", "avisos"),
    eu.papel === "admin" && itemLateral("👥", "Acessos", "acessos"), // sem funcionárias, só a administradora cuida de acessos
    eu.papel === "admin" && itemLateral("📊", "Medidor", "medidor"),
    eu.papel !== "admin" && itemLateral("🔑", "Minha senha", "senha"),
    h("div", { class: "lateral-fim" }, itemLateral("🚪", "Sair", null, sair)));
  const meio = h("div", { class: "meio" });
  // No celular, o menu abre por cima da tela (☰ no topo) e fecha tocando fora, com Esc ou escolhendo uma tela.
  const fundo = h("div", { class: "fundo-menu", onclick: () => menuDoCelular(false, { focar: true }) });
  const raiz = h("div", { class: "grade" }, menu, fundo, meio);
  estrutura = { raiz, menu, fundo, meio, iframe: null, moldura: null, botoesModo: [], abrirMenu: null };
  // A prévia só é montada em tela larga (no celular ela gastaria leituras à toa).
  if (window.matchMedia(TELA_LARGA).matches) {
    // SEM o atributo sandbox (achado 2 do chat do site, 26/10): com sandbox sem allow-same-origin, a prévia vira uma
    // página "de origem nenhuma" e as letras do site (fontes) não carregam (o navegador barra por CORS). A página da
    // prévia é montada aqui (srcdoc) com os dados escapados; o teste preparacao-ramo.test.mjs falha se alguém puser.
    const iframe = h("iframe", { class: "previa-iframe", title: "Prévia do site" });
    const moldura = h("div", { class: "previa-moldura" }, iframe);
    const botoesModo = ["celular", "computador"].map((modo) => h("button", { class: "botao claro", type: "button", "data-modo": modo, onclick: () => {
      modoPrevia = modo;
      try { localStorage.setItem("painel-modo-previa", modo); } catch { /* nada */ }
      ajustarPrevia();
    } }, modo === "celular" ? "📱 Celular" : "💻 Computador"));
    raiz.append(h("aside", { class: "coluna-previa", "aria-label": "Prévia do site" },
      h("div", { class: "previa-topo" }, h("strong", { text: "Prévia do site" }), h("div", { class: "botoes" }, botoesModo)),
      h("p", { class: "ajuda", text: "Mostra o site com o que você salvou, antes de publicar." }), moldura));
    Object.assign(estrutura, { iframe, moldura, botoesModo });
    window.addEventListener("resize", ajustarPrevia);
  }
  app.replaceChildren(raiz);
  setTimeout(ajustarPrevia, 0);
  previaResposta = null; // prévia de outra entrada (ou de antes de sair) não aparece
  focoMostrado = null;
  if (estrutura.iframe) atualizarPrevia();
  // Os grupos do menu vêm das regras já lidas (sem pedir de novo ao GitHub) ou de um pedido só.
  const montarMenu = (grupos) => {
    // Grupo "dentroDe" outro (Banners) abre pela tela do de fora (Campanhas), não pelo menu.
    gruposMenu.replaceChildren(...grupos.filter((g) => !g.dentroDe).map((g) => itemLateral(g.icone || "✏️", g.titulo, `conteudo/${g.id}`)));
    marcarAtivo();
  };
  if (regrasCache && regrasCache.dono === eu.email) montarMenu(regrasCache.menu);
  else pedirConteudo().then((r) => { if (r.status === 200) montarMenu(r.dados.grupos); });
  return estrutura;
}

// ---------- casca (topo com medidor, avisos e rascunho) ----------
async function casca(...conteudo) {
  if (!eu) return; // a entrada venceu no meio: a tela de entrar já está na frente
  const medidor = h("div", { class: "medidor" });
  const sino = h("button", { class: "sino", type: "button", "aria-label": "Avisos", onclick: () => ir("avisos") }, "Avisos");
  const creditos = h("div"); // faixa de créditos baixos (fora do topo fixo: no celular não cobre o ☰ nem o Publicar)
  const faixa = h("div");
  const abrirMenu = h("button", { class: "abrir-menu", type: "button", "aria-label": "Abrir o menu", "aria-controls": "menu-painel", "aria-expanded": "false", onclick: () => {
    estrutura?.menu.classList.remove("recolhido");
    menuDoCelular(true, { focar: true });
  } }, "☰");
  const topo = h("header", { class: "topo" },
    h("div", { class: "topo-linha" },
      abrirMenu,
      h("img", { class: "topo-logo", src: "logo.png", alt: "Brumar Cosméticos" }),
      sino,
      h("div", { class: "quem" }, h("strong", { text: eu.nome }), NOMES_PAPEL[eu.papel])),
    medidor);
  const { meio } = garantirEstrutura();
  estrutura.abrirMenu = abrirMenu;
  meio.replaceChildren(h("div", { class: "casca" }, topo, creditos, faixa, h("main", { class: "conteudo" }, ...conteudo)));
  window.scrollTo(0, 0);
  meio.scrollTo?.(0, 0);
  menuDoCelular(false);
  marcarAtivo();
  focarPrevia();

  const [cota, avisos, rascunho] = await Promise.all([pedir("cota"), pedir("avisos"), pedir("rascunho")]);
  if (cota.status === 200) { preencherMedidor(medidor, cota.dados); mostrarFaixaDeCreditos(creditos, cota.dados); }
  if (avisos.status === 200 && avisos.dados.naoLidos) sino.append(h("span", { class: "bolinha", text: avisos.dados.naoLidos }));
  if (rascunho.status === 200 && rascunho.dados.total) {
    const n = rascunho.dados.total;
    const acao = ehResponsavel() ? ["Publicar", () => ir("publicar")] : ["Enviar para aprovação", () => ir("enviar")];
    // "Ver a lista" (teste de 26/10): a pessoa não lembra tudo o que mexeu; abre ali mesmo, embaixo da faixa, o que
    // foi mexido, parte por parte, e cada linha leva à tela daquela parte. O antes e depois fica no Publicar.
    const lista = h("div", { class: "rascunho-detalhe", id: novoId(), role: "region", "aria-label": "Mudanças ainda não publicadas" });
    const verLista = h("button", { class: "botao claro ver-lista", type: "button", "aria-expanded": "false", "aria-controls": lista.id }, "Ver a lista");
    verLista.addEventListener("click", () => {
      const abrir = verLista.getAttribute("aria-expanded") !== "true";
      verLista.setAttribute("aria-expanded", String(abrir));
      verLista.textContent = abrir ? "Fechar a lista" : "Ver a lista";
      if (abrir) mostrarListaDoRascunho(lista, acao[0], () => verLista.getAttribute("aria-expanded") === "true");
      else lista.replaceChildren();
    });
    faixa.append(h("div", { class: "rascunho" },
      h("span", { text: `${n} ${n === 1 ? "mudança ainda não publicada" : "mudanças ainda não publicadas"}` }),
      h("div", { class: "botoes" },
        verLista,
        // No celular, a prévia abre na parte do site do grupo aberto (pedido de 26/10). No computador, a prévia já
        // fica à direita.
        !estrutura?.iframe && h("a", { class: "botao claro", href: focoDaTela() ? `previa/?foco=${encodeURIComponent(focoDaTela())}` : "previa/" }, "Ver como fica"),
        h("button", { class: "botao verde", type: "button", onclick: acao[1] }, acao[0]))), lista);
  }
}

// O que mudou num campo, em poucas palavras, para a lista da faixa: "Selo: Mais vendido", "Para quem é (1 entrou)",
// "Campanha teste (nova)". Texto comprido não aparece (o antes e depois fica no Publicar). comItem: a linha é do grupo
// todo (ex.: Link na bio, com a frase e os botões juntos), então o campo de um item leva o nome dele ("Nome do botão ·
// Loja"), como na tela do grupo.
function resumoDoCampo(c, comItem) {
  const valor = c.rascunho.valor;
  const rotulo = comItem && c.item ? c.nome : c.rotulo;
  const comResumo = (resumo) => (resumo ? `${rotulo} (${resumo})` : rotulo);
  if (c.tipo === "campanhas") {
    const dif = diferencaDeCampanhas(c.noSite, valor);
    const nome = (x) => `"${String(x?.titulo ?? "").trim() || "sem título"}"`;
    const partes = [...dif.pares.filter((p) => p.nova).map((p) => `${nome(p.depois)} (nova)`),
      ...dif.pares.filter((p) => !p.nova && p.mudaram.length).map((p) => `${nome(p.depois)} (mudou)`),
      ...dif.sairam.map((x) => `${nome(x)} (excluída)`)];
    if (partes.length) return partes.join(", ");
    // Sem campanha nova, mudada ou excluída: ou a ordem mudou, ou ficou igual ao site (Salvar sem mexer).
    const titulos = (v) => JSON.stringify(soObjetos(v).map((x) => String(x.titulo ?? "")));
    return `${rotulo} (${titulos(c.noSite) === titulos(valor) ? "igual ao site" : "ordem mudou"})`;
  }
  if (c.tipo === "videos") return comResumo(resumoDeVideos(diferencaDeVideos(c.noSite, valor)));
  if (c.tipo === "fotos") return comResumo(resumoDeVideos({ ...diferencaDeVideos(c.noSite, valor), ordemMudou: false }));
  if (c.tipo === "lista-de-textos") return comResumo(resumoDeTextos(diferencaDeTextos(c.noSite, valor)));
  if (["ligado", "escolha", "data"].includes(c.tipo)) return `${rotulo}: ${textoSimples(valor, c)}`;
  if (c.tipo === "foto") return `${rotulo} nova`;
  return rotulo;
}

// A lista da faixa: uma linha por parte (ou por produto, kit, vídeo...), com o que foi mexido; tocar leva à tela.
// Lê de novo o rascunho e o conteúdo: o rascunho é dividido (Bruna, CEO, administradora), e alguém pode ter publicado
// ou descartado depois que a faixa apareceu (revisão de 26/10).
// aberta(): a lista continua aberta (se a pessoa fechou enquanto carregava, não abre sozinha).
async function mostrarListaDoRascunho(el, verbo, aberta) {
  el.replaceChildren(h("p", { class: "miudo", text: "Carregando a lista…" }));
  const [r, rasc] = await Promise.all([pedirConteudo(), pedir("rascunho")]);
  if (!aberta()) return;
  const falhou = [r, rasc].find((x) => x.status !== 200);
  if (falhou) return el.replaceChildren(h("p", { class: "erro", text: falhou.dados?.erro || "Não foi possível carregar a lista agora." }));
  const mudancas = rasc.dados.mudancas || {};
  if (!Object.keys(mudancas).length) {
    return el.replaceChildren(h("p", { class: "miudo", text: "Nada salvo para publicar agora (alguém já publicou ou descartou)." }));
  }
  const linhas = [];
  const achados = new Set();
  for (const g of r.dados.grupos) {
    const mexidos = g.campos.filter((c) => c.rascunho);
    if (!mexidos.length) continue;
    const campanhas = g.campos.length === 1 && g.campos[0].tipo === "campanhas";
    const porItem = !campanhas && g.campos.every((c) => c.item);
    const partes = porItem ? [...new Set(mexidos.map((c) => c.item))].map((item) => mexidos.filter((c) => c.item === item)) : [mexidos];
    for (const campos of partes) {
      campos.forEach((c) => achados.add(c.caminho));
      const rota = porItem ? `conteudo/${g.id}/${campos[0].item}` : `conteudo/${g.id}`;
      const titulo = `${g.titulo}${porItem && campos[0].itemNome ? ` · ${campos[0].itemNome}` : ""}`;
      // O ícone não é lido em voz alta (como no menu lateral).
      linhas.push(h("li", {}, h("button", { class: "rascunho-item", type: "button", onclick: () => ir(rota) },
        h("strong", {}, h("span", { "aria-hidden": "true", text: `${g.icone || "✏️"} ` }), titulo),
        h("span", { text: campos.map((c) => resumoDoCampo(c, !porItem)).join(", ") }))));
    }
  }
  // Mudança salva num campo que as telas de hoje não mostram (as regras do site mudaram): conta, sem link.
  const fora = Object.keys(mudancas).filter((c) => !achados.has(c)).length;
  // replaceChildren do navegador escreve null e false como texto: só elementos (revisão de 26/10).
  el.replaceChildren(...[
    linhas.length > 0 && h("ul", { class: "lista" }, linhas),
    fora > 0 && h("p", { class: "miudo", text: `${fora === 1 ? "Mais 1 mudança" : `Mais ${fora} mudanças`} fora das telas de hoje.` }),
    h("p", { class: "miudo", text: `O antes e depois de cada uma aparece em ${verbo}, antes de confirmar.` })].filter(Boolean));
}

function preencherMedidor(el, c) {
  el.className = `medidor ${c.cor}`;
  const barra = h("span");
  barra.style.width = `${c.cota ? Math.round((c.restantes / c.cota) * 100) : 0}%`;
  el.replaceChildren(
    h("div", { class: "medidor-linha" }, h("span", { text: "Publicações este mês" }),
      h("span", { class: "medidor-num", text: `${c.usadas} de ${c.cota}` })),
    h("div", { class: "medidor-barra" }, barra),
    h("div", { class: "medidor-aviso", text: c.mensagem || `Renova em ${c.renovaEm}` }));
}

// Faixa de créditos baixos (pedido de 26/10). "Entendi" esconde até a próxima entrada: guardado na aba
// (sessionStorage, que pode estar bloqueado) e também aqui, para valer nas outras telas mesmo sem ele.
const FAIXA_ENTENDIDA = "painel-creditos-entendi";
let faixaEntendida = null;
function mostrarFaixaDeCreditos(lugar, c) {
  const f = faixaDeCreditos(c, eu?.papel);
  if (!f || !eu) return;
  const marca = marcaDaFaixa(c, eu);
  let entendida = faixaEntendida === marca;
  try { entendida ||= sessionStorage.getItem(FAIXA_ENTENDIDA) === marca; } catch { /* sem armazenamento: vale a da memória */ }
  if (entendida) return;
  const caixa = h("div", { class: `faixa-creditos ${f.tom}`, role: "status" },
    h("span", { class: "faixa-creditos-icone", "aria-hidden": "true", text: "⚠️" }),
    h("div", { class: "faixa-creditos-texto" }, h("strong", { text: f.titulo }), h("span", { class: "faixa-creditos-linha", text: f.linha })),
    h("button", { class: "botao", type: "button", onclick: () => {
      faixaEntendida = marca;
      try { sessionStorage.setItem(FAIXA_ENTENDIDA, marca); } catch { /* bloqueado: some só nesta visita */ }
      // O botão some junto com a faixa: o foco vai para o conteúdo da tela, e não para o começo da página (quem usa
      // teclado ou leitor de tela continua dali; revisão de 26/10).
      const conteudo = lugar.parentNode?.querySelector(".conteudo");
      caixa.remove();
      conteudo?.setAttribute("tabindex", "-1");
      conteudo?.focus({ preventScroll: true });
    } }, "Entendi"));
  lugar.replaceChildren(caixa);
}

const voltar = () => h("button", { class: "voltar", type: "button", onclick: () => ir("") }, "‹ Voltar");

// Falha ao carregar uma tela: mostra o motivo e "Tentar de novo", nunca uma lista vazia como se não houvesse nada (item 59).
function telaFalhou(titulo, r) {
  return casca(voltar(), h("h1", { text: titulo }), h("div", { class: "cartao" },
    h("p", { class: "erro", role: "alert", text: r.dados.erro || "Não foi possível carregar agora. Tente de novo." }),
    h("button", { class: "botao", type: "button", onclick: () => rotear() }, "Tentar de novo")));
}

// Aviso no alto da tela que está na frente (ou numa caixa com "Entendi", se não houver tela do painel). No celular,
// fecha o menu (ex.: "Sair" tocado no menu): senão o aviso ficava escondido atrás dele.
function avisoNaTela(texto) {
  const lugar = estrutura?.meio?.querySelector(".conteudo");
  if (!lugar) return perguntar(texto, { sim: "Entendi", nao: null });
  if (estrutura.menu.classList.contains("aberto")) menuDoCelular(false, { focar: true });
  lugar.querySelector(".aviso-geral")?.remove();
  lugar.prepend(h("p", { class: "erro aviso-geral", role: "alert", text: texto }));
  window.scrollTo(0, 0);
}

// ---------- navegação ----------
// Muda de tela pelo endereço (#acessos, #historico...). Se já estiver nele, o navegador não avisa: desenha direto.
// Com foto ou vídeo subindo, pergunta antes (na tela) e só muda com "Sair mesmo assim".
let hashMostrado = location.hash; // endereço da tela que está na frente (para voltar a ele se a pessoa desistir de sair)
let saidaConfirmada = false;
function ir(rota) {
  if (!enviosEmAndamento) return navegar(rota);
  podeSairDaTela().then((sim) => { if (sim) navegar(rota); });
}
function navegar(rota) {
  const atual = location.hash.replace(/^#/, "");
  if (atual !== rota) { saidaConfirmada = true; location.hash = rota; }
  else rotear();
}
window.addEventListener("hashchange", () => {
  const pode = saidaConfirmada || location.hash === hashMostrado || !enviosEmAndamento;
  saidaConfirmada = false;
  if (pode) return rotear();
  // Voltar do navegador (ou um link) com foto ou vídeo subindo: o endereço volta na hora para o da tela que está na
  // frente e a pergunta aparece; com "Sair mesmo assim", vai para o endereço pedido.
  const pedido = location.hash;
  history.replaceState(null, "", hashMostrado || location.pathname + location.search);
  podeSairDaTela().then((sim) => {
    if (!sim) return;
    if (location.hash === pedido) return rotear();
    saidaConfirmada = true;
    location.hash = pedido;
  });
});

async function rotear() {
  // Tela nova: uma pergunta que estava aberta era da tela que está saindo (fecha com "não"; nada dela acontece).
  perguntaAberta?.responder(false);
  hashMostrado = location.hash;
  const hash = decodeURIComponent(location.hash.slice(1));
  // A cópia do conteúdo só serve para ir de "Conteúdo do site" direto a um grupo (item 24).
  if (!hash.startsWith("conteudo/")) conteudoCache = null;
  if (hash.startsWith("convite/")) return telaConvite(hash.slice(8));
  if (!eu) {
    const r = await pedir("eu");
    if (r.status !== 200) return telaEntrar(r.status === 401 ? undefined : r.dados.erro);
    eu = r.dados;
    limparGuardadosVencidos();
  }
  const telas = { publicar: telaPublicar, enviar: telaEnviar, aprovacoes: telaAprovacoes, historico: telaHistorico,
    acessos: telaAcessos, senha: telaSenha, avisos: telaAvisos, medidor: telaMedidor };
  if (hash === "conteudo") return telaConteudo();
  if (hash.startsWith("conteudo/")) {
    const [id, ...resto] = hash.slice(9).split("/");
    return telaGrupo(id, resto.join("/"));
  }
  return (Object.hasOwn(telas, hash) ? telas[hash] : telaInicio)();
}

// ---------- entrar ----------
function telaEntrar(aviso, tipo = "erro") {
  const email = campo("E-mail", { type: "email", autocomplete: "username", required: true });
  const senha = campo("Senha", { type: "password", autocomplete: "current-password", required: true });
  const msg = h("p", { class: tipo, text: aviso || "" });
  const botao = h("button", { class: "botao cheio", type: "submit" }, "Entrar");
  const form = h("form", { class: "cartao" }, h("h1", { text: "Entrar no painel" }), email.el, senha.el, msg, botao,
    h("p", { class: "ajuda", text: "Esqueceu a senha? Peça à Bruna ou ao CEO um link de nova senha." }));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocupado(botao, true, "Entrando…");
    const r = await pedir("entrar", { metodo: "POST", corpo: { email: email.entrada.value, senha: senha.entrada.value } });
    ocupado(botao, false);
    if (r.status !== 200) { senha.entrada.value = ""; return mensagem(msg, r.dados.erro); }
    conteudoCache = null;
    regrasCache = null;
    eu = r.dados;
    limparGuardadosVencidos();
    // Volta para a tela em que a pessoa estava quando a entrada venceu (o endereço continua o mesmo; item 27).
    // Depois de Sair, o endereço foi limpo: vai para o Início.
    rotear();
  });
  trocar(h("div", { class: "entrada" }, h("img", { class: "topo-logo", src: "logo.png", alt: "Brumar Cosméticos" }), form));
}

// ---------- convite (cadastro ou nova senha) ----------
async function telaConvite(codigo) {
  const r = await pedir("convite", { metodo: "POST", corpo: { acao: "ver", codigo } });
  const logo = h("img", { class: "topo-logo", src: "logo.png", alt: "Brumar Cosméticos" });
  if (r.status !== 200) {
    return trocar(h("div", { class: "entrada" }, logo, h("div", { class: "cartao" }, h("h1", { text: "Convite vencido" }),
      h("p", { text: r.dados.erro || "Peça um link novo para quem te convidou." }))));
  }
  const c = r.dados;
  const cadastro = c.tipo === "cadastro";
  const nome = cadastro && campo("Seu nome", { type: "text", autocomplete: "name", maxlength: 60, required: true });
  const email = cadastro && campo("Seu e-mail", { type: "email", autocomplete: "email", required: true });
  const senha = campo(cadastro ? "Crie uma senha" : "Nova senha", { type: "password", autocomplete: "new-password", minlength: 10, required: true }, "Pelo menos 10 letras ou números.");
  const repetir = campo("Digite a senha de novo", { type: "password", autocomplete: "new-password", required: true });
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao cheio", type: "submit" }, cadastro ? "Criar meu acesso" : "Salvar nova senha");
  const form = h("form", { class: "cartao" },
    h("h1", { text: cadastro ? "Seu acesso ao painel" : "Criar nova senha" }),
    h("p", { class: "sub", text: cadastro ? `Você vai entrar como ${(NOMES_PAPEL[c.papel] || "").toLowerCase()}. Este link funciona uma vez só.` : `Acesso de ${c.email}. Este link funciona uma vez só.` }),
    cadastro && nome.el, cadastro && email.el, senha.el, repetir.el, msg, botao);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (senha.entrada.value !== repetir.entrada.value) return mensagem(msg, "As duas senhas não são iguais.");
    ocupado(botao, true, "Salvando…");
    const corpo = { acao: "aceitar", codigo, senha: senha.entrada.value, ...(cadastro && { nome: nome.entrada.value, email: email.entrada.value }) };
    const res = await pedir("convite", { metodo: "POST", corpo });
    ocupado(botao, false);
    if (res.status !== 201) return mensagem(msg, res.dados.erro);
    conteudoCache = null;
    regrasCache = null;
    eu = res.dados;
    history.replaceState(null, "", location.pathname); // o código não fica no histórico do navegador
    rotear();
  });
  trocar(h("div", { class: "entrada" }, logo, form));
}

// ---------- início ----------
function itemMenu(icone, titulo, texto, rota, desligado) {
  return h("button", { class: "menu-item", type: "button", disabled: desligado, onclick: () => rota && ir(rota) },
    h("span", { class: "icone", "aria-hidden": "true", text: icone }),
    h("span", {}, h("strong", { text: titulo }), h("small", { text: texto })),
    !desligado && h("span", { class: "seta", "aria-hidden": "true", text: "›" }));
}

async function telaInicio() {
  const responsavel = ehResponsavel();
  await casca(
    h("h1", { text: `Olá, ${eu.nome.split(" ")[0]}!` }),
    h("div", { class: "menu" },
      itemMenu("✏️", "Conteúdo do site", "Textos, campanha, seções, produtos e link na bio", "conteudo"),
      responsavel ? itemMenu("🚀", "Publicar", "Levar as mudanças salvas para o site", "publicar")
        : itemMenu("📨", "Enviar para aprovação", "A Bruna ou o CEO aprovam e publicam", "enviar"),
      !responsavel && itemMenu("✅", "Aprovações", "O que você enviou", "aprovacoes"), // sem funcionárias desde 27/10
      itemMenu("🕘", "Histórico", "O que foi publicado, por quem e quando", "historico"),
      eu.papel === "admin" && itemMenu("👥", "Acessos", "Convidar a Bruna ou o CEO, desligar e criar nova senha", "acessos"),
      eu.papel === "admin" && itemMenu("📊", "Medidor de publicações", "Cota do mês e gasto real da Netlify", "medidor"),
      eu.papel !== "admin" && itemMenu("🔑", "Minha senha", "Trocar a sua senha", "senha"),
      h("button", { class: "menu-item", type: "button", onclick: sair },
        h("span", { class: "icone", "aria-hidden": "true", text: "🚪" }),
        h("span", {}, h("strong", { text: "Sair" }), h("small", { text: "Encerrar a entrada neste celular" })))));
}

// "Sair" só pelo botão (um link com #sair não desconecta ninguém). Apaga também os textos guardados neste aparelho,
// para a próxima pessoa no mesmo computador não ver o que foi digitado (auditoria 22/10, itens 10 e 11).
// Só diz "Você saiu" quando o servidor confirmou: sem isso, a entrada pode continuar valendo neste aparelho (item 36).
async function sair(e) {
  const botao = e && e.currentTarget && e.currentTarget.nodeType === 1 ? e.currentTarget : null;
  if (enviosEmAndamento && !(await perguntar("Um vídeo ou uma foto ainda está subindo e vai se perder. Sair mesmo assim?",
    { sim: "Sair mesmo assim", nao: "Ficar e esperar", tom: "perigo" }))) return;
  if (!eu) return; // a entrada venceu enquanto a pergunta estava aberta: a tela de entrar já está na frente
  if (botao) botao.disabled = true;
  const r = await pedir("sair", { metodo: "POST", corpo: {} });
  if (botao) botao.disabled = false;
  if (r.status !== 200) {
    return avisoNaTela("Não foi possível sair agora (sem internet ou o painel não respondeu). Toque em Sair de novo antes de deixar o aparelho.");
  }
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("painel-guardado:")) localStorage.removeItem(k);
  } catch { /* sem acesso ao armazenamento do aparelho */ }
  // O "Entendi" da faixa de créditos baixos também sai: a próxima pessoa na mesma aba vê a faixa (revisão de 26/10).
  faixaEntendida = null;
  try { sessionStorage.removeItem(FAIXA_ENTENDIDA); } catch { /* sem acesso ao armazenamento da aba */ }
  eu = null;
  conteudoCache = null;
  regrasCache = null;
  history.replaceState(null, "", location.pathname);
  hashMostrado = "";
  telaEntrar("Você saiu do painel.", "sucesso");
}

// ---------- conteúdo do site (telas montadas a partir do esquema) ----------
// Cópia do conteúdo para a tela do grupo não pedir de novo logo depois de "Conteúdo do site". É de UMA pessoa e vale
// 10 s; some ao sair, ao entrar, ao publicar e ao ir para qualquer tela fora de "Conteúdo" (item 24).
let conteudoCache = null; // { dono, em, dados }
// "deixarCopia": só a tela "Conteúdo do site" deixa a cópia. A tela do grupo lê sempre de novo e não deixa nada
// (senão, depois de Salvar, a tela seguinte mostrava o valor de antes).
async function carregarConteudo({ deixarCopia = false } = {}) {
  const r = await pedir("conteudo");
  if (r.status === 200) anotarRegras(r.dados);
  conteudoCache = deixarCopia && r.status === 200 && eu ? { dono: eu.email, em: Date.now(), dados: r.dados } : null;
  return r;
}
function conteudoGuardado() {
  const c = conteudoCache;
  conteudoCache = null; // da próxima vez, lê de novo
  return c && eu && c.dono === eu.email && Date.now() - c.em < 10_000 ? c.dados : null;
}

async function telaConteudo() {
  const r = await carregarConteudo({ deixarCopia: true });
  if (r.status !== 200) return telaFalhou("Conteúdo do site", r);
  const grupos = r.dados.grupos;
  if (!grupos.length) {
    return casca(voltar(), h("h1", { text: "Conteúdo do site" }),
      h("div", { class: "cartao" }, h("p", { text: "Ainda não há telas de conteúdo neste painel (as regras do site estão sem grupos). Avise a administradora." })));
  }
  await casca(voltar(), h("h1", { text: "Conteúdo do site" }),
    // Grupo "dentroDe" outro (Banners, dentro de Campanhas) não tem linha própria: as mudanças dele contam no de fora.
    h("div", { class: "menu" }, grupos.filter((g) => !g.dentroDe).map((g) => {
      const salvos = [g, ...grupos.filter((x) => x.dentroDe === g.id)].flatMap((x) => x.campos).filter((c) => c.rascunho).length;
      return itemMenu(g.icone || "✏️", g.titulo, salvos ? `${salvos} mudança(s) salva(s) · ${g.descricao}` : g.descricao, `conteudo/${g.id}`);
    })));
}

// Foto: o celular diminui (até 1600 px e 1 MB, em WebP ou JPEG) antes de enviar; o servidor confere o tipo.
const LADO_MAX = 1600;
const BYTES_MAX = 1024 * 1024;
// Erro com mensagem já em português, para mostrar à pessoa (os do navegador vêm em inglês).
const erroParaPessoa = (texto) => Object.assign(new Error(texto), { paraPessoa: true });

async function diminuirFoto(arquivo) {
  let imagem;
  try { imagem = await createImageBitmap(arquivo); } catch { throw erroParaPessoa("Este arquivo não é uma foto (use JPG, PNG ou WebP)."); }
  const escala = Math.min(1, LADO_MAX / Math.max(imagem.width, imagem.height));
  const tela = document.createElement("canvas");
  tela.width = Math.round(imagem.width * escala);
  tela.height = Math.round(imagem.height * escala);
  tela.getContext("2d").drawImage(imagem, 0, 0, tela.width, tela.height);
  for (const tipo of ["image/webp", "image/jpeg"]) {
    for (const qualidade of [0.85, 0.75, 0.65, 0.5]) {
      const blob = await new Promise((ok) => tela.toBlob(ok, tipo, qualidade));
      if (blob && blob.type === tipo && blob.size <= BYTES_MAX) return blob;
    }
  }
  throw erroParaPessoa("Não consegui deixar a foto leve o bastante. Tente outra foto.");
}

// Cada entrada devolve { el, ler, foco, mudou, definir }. "mudou" compara com o valor do começo, do mesmo jeito que
// a tela mostrou: assim um campo que ninguém mexeu nunca vai no Salvar (itens 31 e 57).
function entradaDeFoto(c, valor, aoMudar) {
  const inicial = valor;
  let atual = valor;
  const previa = h("img", { alt: "Foto", class: "previa-foto" });
  previa.addEventListener("error", () => previa.removeAttribute("src"));
  const nota = h("p", { class: "ajuda" });
  const escolher = h("input", { type: "file", accept: "image/*", "aria-label": `Escolher foto nova: ${c.nome || "foto"}` });
  const erroFoto = h("p", { class: "erro" });
  const mostrarAtual = () => {
    if (typeof atual === "string" && atual) previa.src = enderecoDeImagem(atual);
    else previa.removeAttribute("src");
    nota.textContent = !atual ? "Ainda sem foto."
      : String(atual).startsWith("foto:") ? (atual === inicial ? "Foto nova salva, ainda não publicada." : "Foto pronta. Toque em Salvar.")
        : `No site: ${String(atual).split("/").pop()}`;
  };
  mostrarAtual();
  const el = h("div", {}, previa, nota, escolher, erroFoto);
  escolher.addEventListener("change", async () => {
    const arquivo = escolher.files[0];
    if (!arquivo) return;
    mensagem(erroFoto, "");
    nota.textContent = "Diminuindo e enviando a foto…";
    const rota = location.hash.replace(/^#/, ""); // tela deste campo, para o aviso se a pessoa sair antes de terminar
    enviosEmAndamento++;
    try {
      const leve = await diminuirFoto(arquivo);
      let r;
      try {
        r = await fetch(`${API}foto`, { method: "POST", credentials: "same-origin", headers: { "X-Painel": "1", "Content-Type": leve.type }, body: leve });
      } catch { throw erroParaPessoa("Sem internet ou o painel não respondeu. Tente de novo."); }
      const dados = await r.json().catch(() => ({}));
      if (r.status === 401 && eu) { eu = null; return telaEntrar(dados.erro); }
      if (r.status !== 201) throw erroParaPessoa(dados.erro || "Não foi possível enviar a foto.");
      atual = dados.valor;
      previa.src = URL.createObjectURL(leve);
      nota.textContent = `Foto pronta (${Math.round(leve.size / 1024)} KB). Toque em Salvar.`;
      aoMudar?.();
      avisarEnvioTerminado(el, `A foto de "${c.nome || "Foto"}" terminou de subir e ficou guardada neste aparelho.`, rota);
    } catch (e) {
      nota.textContent = "";
      mensagem(erroFoto, e.paraPessoa ? e.message : "Não foi possível usar esta foto. Tente outra.");
    } finally {
      enviosEmAndamento--;
      escolher.value = "";
    }
  });
  return { el, ler: () => atual, foco: escolher,
    // Sem envio, a foto não muda (mesmo sem foto no site; item 31).
    mudou: () => atual !== inicial, definir: (v) => { atual = v; mostrarAtual(); } };
}

// Fotos (lista, ex.: Resultados reais): a lista inteira é o valor do campo, como nos vídeos. Decisão da dona em 27/10:
// pôr, tirar e esconder, sem mudar a ordem (foto nova entra no fim). Cada foto tem o tipo, que muda o jeito no site.
const normalizarFotos = (fs) => soObjetos(fs).map((f) => ({ arquivo: String(f.arquivo ?? ""), tipo: String(f.tipo ?? ""), visivel: visivelDe(f) }));
function entradaDeFotos(c, valor, aoMudar) {
  let lista = normalizarFotos(valor);
  const opcoes = Array.isArray(c.opcoes) && c.opcoes.length ? c.opcoes : Object.keys(TIPOS_DE_FOTO);
  const caixa = h("div");
  const nota = h("p", { class: "ajuda", role: "status" });
  const erroFoto = h("p", { class: "erro" });
  const mexeu = () => aoMudar?.();
  const locais = new Map(); // "foto:<id>" -> endereço da foto neste aparelho (a miniatura aparece na hora)
  const seletorDeTipo = (atual, rotulo, aoTrocar) => {
    const s = h("select", { "aria-label": rotulo }, opcoes.map((o) => h("option", { value: o, text: rotuloDoTipoDeFoto(o, c) })));
    s.value = opcoes.includes(atual) ? atual : opcoes[0];
    s.addEventListener("change", () => aoTrocar(s.value));
    return s;
  };
  const desenhar = () => {
    caixa.replaceChildren(...lista.map((f, i) => {
      const visivel = h("input", { type: "checkbox", checked: f.visivel !== false });
      visivel.addEventListener("change", () => { f.visivel = visivel.checked; mexeu(); });
      return h("div", { class: "video-item" },
        h("img", { class: "previa-foto", alt: `Foto ${i + 1}`, src: locais.get(f.arquivo) || enderecoDeImagem(f.arquivo) }),
        h("div", { class: "miudo", text: f.arquivo.startsWith("foto:") ? "Foto nova (vai ao site ao publicar)" : f.arquivo.split("/").pop() }),
        seletorDeTipo(f.tipo, `Tipo da foto ${i + 1}`, (v) => { f.tipo = v; mexeu(); }),
        h("label", { class: "escolha" }, visivel, h("span", { text: "Aparece no site" })),
        h("div", { class: "botoes" },
          h("button", { class: "botao perigo", type: "button", "aria-label": `Tirar a foto ${i + 1}`, onclick: () => { lista.splice(i, 1); desenhar(); mexeu(); } }, "Tirar")));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhuma foto." }));
  };
  let tipoNovo = opcoes.includes("resultado") ? "resultado" : opcoes[0];
  const escolherTipo = seletorDeTipo(tipoNovo, "Tipo da foto nova", (v) => { tipoNovo = v; });
  const escolher = h("input", { type: "file", accept: "image/*", id: novoId() });
  const el = h("div", {}, caixa,
    h("div", { class: "campo" }, h("span", { class: "rotulo", text: "Tipo da foto nova" }), escolherTipo),
    h("label", { class: "rotulo", for: escolher.id, text: "+ Adicionar foto" }), escolher, nota, erroFoto,
    h("p", { class: "ajuda", text: "Só envie foto com a autorização da cliente. A foto nova entra no fim da lista." }));
  escolher.addEventListener("change", async () => {
    const arquivo = escolher.files[0];
    escolher.value = "";
    if (!arquivo) return;
    mensagem(erroFoto, "");
    nota.textContent = "Diminuindo e enviando a foto…";
    const rota = location.hash.replace(/^#/, "");
    enviosEmAndamento++;
    escolher.disabled = true;
    try {
      const leve = await diminuirFoto(arquivo);
      let r;
      try {
        r = await fetch(`${API}foto`, { method: "POST", credentials: "same-origin", headers: { "X-Painel": "1", "Content-Type": leve.type }, body: leve });
      } catch { throw erroParaPessoa("Sem internet ou o painel não respondeu. Tente de novo."); }
      const dados = await r.json().catch(() => ({}));
      if (r.status === 401 && eu) { eu = null; return telaEntrar(dados.erro); }
      if (r.status !== 201) throw erroParaPessoa(dados.erro || "Não foi possível enviar a foto.");
      locais.set(dados.valor, URL.createObjectURL(leve));
      lista.push({ arquivo: dados.valor, tipo: tipoNovo, visivel: true });
      desenhar();
      mexeu();
      nota.textContent = `Foto pronta (${Math.round(leve.size / 1024)} KB). Toque em Salvar.`;
      avisarEnvioTerminado(el, `A foto de "${c.nome || "Fotos"}" terminou de subir e ficou guardada neste aparelho.`, rota);
    } catch (e) {
      nota.textContent = "";
      mensagem(erroFoto, e.paraPessoa ? e.message : "Não foi possível usar esta foto. Tente outra.");
    } finally {
      enviosEmAndamento--;
      escolher.disabled = false;
    }
  });
  desenhar();
  const ler = () => lista.map(({ arquivo, tipo, visivel }) => ({ arquivo, tipo, visivel: visivel !== false }));
  const inicial = JSON.stringify(ler());
  return {
    el, ler, foco: escolher, lista: true,
    mudou: () => JSON.stringify(ler()) !== inicial,
    definir: (v) => { lista = normalizarFotos(v); desenhar(); },
  };
}

// Vídeos: a lista inteira é o valor do campo. O celular confere (MP4, até 20 MB), tira a capa de um quadro do
// próprio vídeo e envia em partes de até 4 MB. Acima de 8 MB, o robô diminui ao publicar.
const VIDEO_MAX = 20 * 1024 * 1024;
const VIDEO_PESADO = 8 * 1024 * 1024;
const PRAZO_CAPA = 8000;

// No iPhone, o vídeo fora da tela às vezes nunca carrega o quadro: cada espera tem prazo de 8 s e, se passar, o
// vídeo segue sem capa (o campo de escolher vídeo nunca fica travado; item 35).
async function capaDoVideo(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const v = h("video", { muted: true, playsinline: true, preload: "auto" });
  try {
    v.muted = true;
    const carregou = new Promise((ok, falhou) => { v.onloadedmetadata = ok; v.onerror = falhou; });
    v.src = url;
    v.load?.();
    await comPrazo(carregou, PRAZO_CAPA);
    const buscou = new Promise((ok, falhou) => { v.onseeked = ok; v.onerror = falhou; });
    v.currentTime = Math.min(1, (v.duration || 2) / 2);
    await comPrazo(buscou, PRAZO_CAPA);
    if (!v.videoWidth || !v.videoHeight) return null;
    const escala = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
    const tela = h("canvas");
    tela.width = Math.round(v.videoWidth * escala);
    tela.height = Math.round(v.videoHeight * escala);
    tela.getContext("2d").drawImage(v, 0, 0, tela.width, tela.height);
    return await comPrazo(new Promise((ok) => tela.toBlob(ok, "image/jpeg", 0.8)), PRAZO_CAPA);
  } finally {
    v.onloadedmetadata = v.onseeked = v.onerror = null;
    v.removeAttribute("src");
    URL.revokeObjectURL(url);
  }
}

// Capa de vídeo nova SEMPRE em JPEG (achado 3 do chat do site, 26/10): o montador do site só aceita capa .jpg em
// videos/painel/, e o servidor recusa capa nova PNG ou WebP. Toda capa passa por aqui antes de ir ao servidor: JPEG
// segue como está; PNG ou WebP é redesenhada no canvas (fundo branco, até 720 px) e vira JPEG com qualidade 0,85.
// Se não der para converter, devolve null (o vídeo segue sem capa, como quando o quadro não sai).
const QUALIDADE_CAPA = 0.85;
async function capaEmJpeg(imagem) {
  if (!imagem) return null;
  if (imagem.type === "image/jpeg") return imagem;
  let quadro;
  try { quadro = await createImageBitmap(imagem); } catch { return null; }
  try {
    const escala = Math.min(1, 720 / Math.max(quadro.width, quadro.height));
    const tela = h("canvas");
    tela.width = Math.max(1, Math.round(quadro.width * escala));
    tela.height = Math.max(1, Math.round(quadro.height * escala));
    const pincel = tela.getContext("2d");
    pincel.fillStyle = "#FFFFFF"; // JPEG não tem fundo transparente: sem isto, o transparente do PNG ficaria preto
    pincel.fillRect(0, 0, tela.width, tela.height);
    pincel.drawImage(quadro, 0, 0, tela.width, tela.height);
    const jpeg = await comPrazo(new Promise((ok) => tela.toBlob(ok, "image/jpeg", QUALIDADE_CAPA)), PRAZO_CAPA);
    return jpeg && jpeg.type === "image/jpeg" ? jpeg : null;
  } catch {
    return null;
  } finally {
    quadro.close?.();
  }
}

async function enviarBinario(rota, corpo, tipo, metodo = "POST") {
  let r;
  try {
    r = await fetch(API + rota, { method: metodo, credentials: "same-origin", headers: { "X-Painel": "1", "Content-Type": tipo }, body: corpo });
  } catch { throw erroParaPessoa("Sem internet ou o painel não respondeu. Tente de novo."); }
  const dados = await r.json().catch(() => ({}));
  if (r.status === 401 && eu) { eu = null; telaEntrar(dados.erro); throw erroParaPessoa("Sua entrada venceu."); }
  if (r.status >= 300) throw erroParaPessoa(dados.erro || "Não foi possível enviar.");
  return dados;
}

async function enviarVideo(arquivo, aoAndar) {
  const ini = await enviarBinario("video?acao=iniciar", JSON.stringify({ tamanho: arquivo.size }), "application/json");
  for (let n = 0; n < ini.partes; n++) {
    aoAndar(Math.round((n / ini.partes) * 100));
    const parte = arquivo.slice(n * ini.tamanhoDaParte, (n + 1) * ini.tamanhoDaParte);
    await enviarBinario(`video?id=${ini.id}&parte=${n}`, parte, "application/octet-stream", "PUT");
  }
  aoAndar(100);
  return enviarBinario("video?acao=finalizar", JSON.stringify({ id: ini.id }), "application/json");
}

// Por que o vídeo novo ficou sem capa (na faixa, depois de "Vídeo pronto (X MB), mas sem capa: ").
const SEM_CAPA_APARELHO = "este aparelho não conseguiu tirar a foto do vídeo. Toque em Salvar ou tente em outro navegador.";
const SEM_CAPA_ENVIO = "a foto do vídeo não ficou guardada. Toque em Salvar ou tire o vídeo e envie de novo.";

// Lista de vídeos como o site entende: vídeo sem "visivel" aparece (item 57).
const normalizarVideos = (vs) => soObjetos(vs).map((v) => ({ arquivo: String(v.arquivo ?? ""), capa: v.capa || "", titulo: v.titulo || "", visivel: visivelDe(v) }));

function entradaDeVideos(c, valor, aoMudar) {
  let lista = normalizarVideos(valor);
  const caixa = h("div");
  const nota = h("p", { class: "ajuda", role: "status" });
  const erroVideo = h("p", { class: "erro" });
  const mexeu = () => aoMudar?.();
  const desenhar = () => {
    caixa.replaceChildren(...lista.map((v, i) => {
      const titulo = h("input", { type: "text", maxlength: 80, placeholder: "Título (opcional)", "aria-label": `Título do vídeo ${i + 1}` });
      titulo.value = v.titulo || "";
      titulo.addEventListener("input", () => { v.titulo = titulo.value; mexeu(); });
      const visivel = h("input", { type: "checkbox", checked: v.visivel !== false });
      visivel.addEventListener("change", () => { v.visivel = visivel.checked; mexeu(); });
      // Decisão da dona em 27/10: nos vídeos a Bruna só põe e tira; a ordem não muda pelo painel (sem Subir/Descer).
      return h("div", { class: "video-item" },
        v.capa ? h("img", { class: "previa-foto", alt: `Capa do vídeo ${i + 1}`, src: enderecoDeImagem(v.capa) }) : h("div", { class: "miudo", text: "Sem capa" }),
        h("div", { class: "miudo", text: v.arquivo.startsWith("video:") ? "Vídeo novo (vai ao site ao publicar)" : v.arquivo.split("/").pop() }),
        titulo,
        h("label", { class: "escolha" }, visivel, h("span", { text: "Aparece no site" })),
        h("div", { class: "botoes" },
          h("button", { class: "botao perigo", type: "button", "aria-label": `Tirar o vídeo ${i + 1}`, onclick: () => { lista.splice(i, 1); desenhar(); mexeu(); } }, "Tirar")));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhum vídeo. No site aparece \"Em breve\"." }));
  };
  const escolher = h("input", { type: "file", accept: "video/mp4", id: novoId() });
  escolher.addEventListener("change", async () => {
    const arquivo = escolher.files[0];
    escolher.value = "";
    if (!arquivo) return;
    mensagem(erroVideo, "");
    if (arquivo.type && arquivo.type !== "video/mp4") return mensagem(erroVideo, "Use vídeo MP4. No iPhone: Ajustes > Câmera > Formatos > Mais Compatível.");
    if (arquivo.size > VIDEO_MAX) return mensagem(erroVideo, "Vídeo acima de 20 MB. Corte ou diminua o vídeo no celular e tente de novo.");
    escolher.disabled = true;
    const rota = location.hash.replace(/^#/, ""); // tela deste campo, para o aviso se a pessoa sair antes de terminar
    enviosEmAndamento++;
    try {
      nota.textContent = "Tirando a capa do vídeo…";
      // Só JPEG vai como capa (capaEmJpeg); se não sair JPEG, o vídeo segue sem capa. Sem capa, a faixa avisa e diz o
      // porquê (rodada 4: antes, a capa sumia calada). O vídeo continua valendo nos dois casos.
      let capa = "";
      let semCapa = "";
      let imagem = null;
      try { imagem = await capaEmJpeg(await capaDoVideo(arquivo)); } catch { /* o quadro não saiu (prazo ou vídeo que o aparelho não lê) */ }
      if (!imagem) semCapa = SEM_CAPA_APARELHO;
      else {
        try {
          const enviada = (await enviarBinario("foto", imagem, "image/jpeg")).valor;
          if (/^foto:[0-9a-f]{64}\.jpg$/.test(enviada || "")) capa = enviada;
          else semCapa = SEM_CAPA_ENVIO;
        } catch (e) {
          if (!eu) throw e; // a entrada venceu: para aqui
          semCapa = SEM_CAPA_ENVIO;
        }
      }
      const enviado = await enviarVideo(arquivo, (p) => { nota.textContent = `Enviando o vídeo… ${p}%`; });
      lista.push({ arquivo: enviado.valor, capa, titulo: "", visivel: true });
      desenhar();
      mexeu(); // fica guardado no aparelho mesmo se a pessoa já tiver saído desta tela
      const mb = Number(enviado.megas || 0).toLocaleString("pt-BR");
      const pesado = `Vídeo pesado (${mb} MB): ao publicar, o robô diminui para até 8 MB.`;
      if (!semCapa) nota.textContent = enviado.pesado ? `${pesado} Toque em Salvar.` : `Vídeo pronto (${mb} MB). Toque em Salvar.`;
      else nota.textContent = enviado.pesado ? `${pesado} Ficou sem capa: ${semCapa}` : `Vídeo pronto (${mb} MB), mas sem capa: ${semCapa}`;
      avisarEnvioTerminado(el, `O vídeo de "${c.nome || "Vídeos"}" terminou de subir${semCapa ? " (sem capa)" : ""} e ficou guardado neste aparelho.`, rota);
    } catch (e) {
      nota.textContent = "";
      mensagem(erroVideo, e.paraPessoa ? e.message : "Não foi possível usar este vídeo. Tente outro.");
    } finally {
      enviosEmAndamento--;
      escolher.disabled = false;
    }
  });
  desenhar();
  const ler = () => lista.map(({ arquivo, capa, titulo, visivel }) => ({ arquivo, capa: capa || "", titulo: (titulo || "").trim(), visivel: visivel !== false }));
  const inicial = JSON.stringify(ler());
  const el = h("div", {}, caixa, h("label", { class: "rotulo", for: escolher.id, text: "+ Adicionar vídeo (MP4, até 20 MB)" }), escolher, nota, erroVideo,
    h("p", { class: "ajuda", text: "Cada vez que uma cliente dá play, a Netlify gasta créditos pelo tamanho do vídeo (um vídeo de 8 MB gasta uns 0,16 crédito)." }));
  return {
    el, ler, foco: escolher, lista: true,
    mudou: () => JSON.stringify(ler()) !== inicial,
    definir: (v) => { lista = normalizarVideos(v); desenhar(); },
  };
}

// Campanhas: várias ao mesmo tempo (pedido de 22/10). A lista inteira é o valor do campo.
// (Só aparece aqui se o grupo tiver outros campos junto; o grupo só de campanhas usa a lista com Editar/Excluir.)
function entradaDeCampanhas(c, valor, aoMudar) {
  const normalizar = (v) => soObjetos(v).map((x) => ({ titulo: x.titulo || "", texto: x.texto || "", botao: x.botao || "", termina: x.termina || "", ligada: x.ligada !== false }));
  let lista = normalizar(valor);
  const max = c.max || 6;
  const caixa = h("div");
  const erroLista = h("p", { class: "erro" });
  const mexeu = () => aoMudar?.();
  const etiquetaDe = (x) => {
    const fim = x.termina ? new Date(`${x.termina}:00-03:00`) : null;
    if (!fim) return ["Falta a data", "laranja"];
    if (fim < new Date()) return ["Terminou", "cinza"];
    if (x.ligada === false) return ["Desligada", "cinza"];
    return [`No ar até ${dataBR(x.termina)}`, "verde"];
  };
  const desenhar = () => {
    caixa.replaceChildren(...lista.map((x, i) => {
      const [rotulo, cor] = etiquetaDe(x);
      const texto = (nome, chave, maxLetras) => {
        const id = novoId();
        const e = h("input", { type: "text", maxlength: maxLetras, id });
        e.value = x[chave] || "";
        e.addEventListener("input", () => { x[chave] = e.value; mexeu(); });
        return h("div", { class: "campo" }, h("label", { class: "rotulo", for: id, text: nome }), e);
      };
      const idFim = novoId();
      const fim = h("input", { type: "datetime-local", id: idFim });
      fim.value = x.termina || "";
      fim.addEventListener("change", () => { x.termina = fim.value; desenhar(); mexeu(); });
      const ligada = h("input", { type: "checkbox", checked: x.ligada !== false });
      ligada.addEventListener("change", () => { x.ligada = ligada.checked; desenhar(); mexeu(); });
      const tirar = h("button", { class: "botao perigo", type: "button" }, "Tirar");
      tirar.addEventListener("click", async () => {
        if (!(await confirmarNaTela(tirar, `Tirar a campanha "${x.titulo || "nova"}"?`, { sim: "Sim, tirar", tom: "perigo" }))) return;
        // Tira esta campanha (a mesma), não a que estiver na posição dela agora.
        const k = lista.indexOf(x);
        if (k < 0) return;
        lista.splice(k, 1);
        desenhar();
        mexeu();
      });
      return h("div", { class: "video-item" },
        h("div", { class: "botoes" }, h("strong", { text: x.titulo || "Campanha nova" }), h("span", { class: `etiqueta ${cor}`, text: rotulo })),
        texto("Título", "titulo", 40), texto("Texto (ex.: até 30% OFF com cupom)", "texto", 60), texto("Texto do botão", "botao", 30),
        h("div", { class: "campo" }, h("label", { class: "rotulo", for: idFim, text: "Termina em (horário de Brasília) · obrigatório" }), fim,
          h("p", { class: "ajuda", text: "A contagem regressiva some sozinha nessa hora." })),
        h("label", { class: "escolha" }, ligada, h("span", { text: "Ligada no site" })),
        h("div", { class: "botoes" },
          h("button", { class: "botao claro", type: "button", disabled: i === 0, onclick: () => { [lista[i - 1], lista[i]] = [lista[i], lista[i - 1]]; desenhar(); mexeu(); } }, "↑ Subir"),
          tirar));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhuma campanha. Toque em \"+ Adicionar campanha\"." }));
  };
  const adicionar = h("button", { class: "botao claro cheio", type: "button" }, "+ Adicionar campanha");
  adicionar.addEventListener("click", () => {
    mensagem(erroLista, "");
    if (lista.length >= max) return mensagem(erroLista, `No máximo ${max} campanhas ao mesmo tempo.`);
    lista.push({ titulo: "", texto: "", botao: "", termina: "", ligada: true });
    desenhar();
    mexeu();
  });
  desenhar();
  const ler = () => lista.map(({ titulo, texto, botao, termina, ligada }) => ({ titulo: (titulo || "").trim(), texto: (texto || "").trim(), botao: (botao || "").trim(), termina: termina || "", ligada: ligada !== false }));
  const inicial = JSON.stringify(ler());
  return { el: h("div", {}, caixa, adicionar, erroLista,
    h("p", { class: "ajuda", text: "Só anuncie desconto que já existe na Yampi, com a mesma data de término." })), ler, foco: adicionar, lista: true,
  mudou: () => JSON.stringify(ler()) !== inicial, definir: (v) => { lista = normalizar(v); desenhar(); } };
}

// Lista de frases (destaques, para quem é, cuidados, modo de usar; contrato C1): cada frase numa caixa com o contador
// de letras, Subir/Descer, Remover e "+ Acrescentar frase", com quantas frases cabem à vista. O valor vai caixa por
// caixa, como está na tela: o servidor tira as vazias e os espaços e, num erro, diz "a frase 3" pela posição da
// caixa. "mudou" e o "Recuperamos…" comparam a lista limpa (uma caixa vazia a mais não é mudança). Lista vazia vale:
// o bloco some no site.
const textosDe = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : typeof v === "string" && v.trim() ? [v] : []);
// Como o servidor limpa: uma frase é uma linha só (quebra de linha vira espaço), sem espaços nas pontas, e frase vazia sai.
const frasesLimpas = (v) => textosDe(v).map((t) => t.replace(/\s*[\r\n]+\s*/g, " ").trim()).filter(Boolean);
function entradaDeListaDeTextos(c, valor, aoMudar) {
  const { itens: maxItens, letras: maxLetras } = limitesDaLista(c);
  let lista = textosDe(valor);
  const caixa = h("div", { class: "frases" });
  const quantas = h("p", { class: "ajuda frases-quantas", "aria-live": "polite" });
  const erroLista = h("p", { class: "erro" });
  const acrescentar = h("button", { class: "botao claro", type: "button" }, "+ Acrescentar frase");
  const mexeu = () => aoMudar?.();
  let caixas = []; // { area, subir, descer, remover } de cada frase, na ordem da tela
  // foco: { frase, botao: "texto" | "subir" | "descer" | "remover" }. Subir, Descer e Remover deixam o foco num botão
  // (no celular, o foco na caixa de texto abria o teclado a cada toque e a página pulava); só "+ Acrescentar frase"
  // põe o foco na caixa, onde a pessoa vai digitar (rodada 2 da conferência).
  const desenhar = (foco = null) => {
    caixas = [];
    caixa.replaceChildren(...lista.map((t, i) => {
      const id = novoId();
      const letras = h("p", { class: "ajuda", id: `${id}-letras` });
      const area = h("textarea", { id, class: "frase-texto", rows: 2, maxlength: maxLetras, "aria-describedby": letras.id });
      area.value = t;
      // Frase do site maior que o limite (o navegador não corta o que já estava lá): o contador fica vermelho.
      const contar = () => {
        letras.textContent = `${area.value.length} de ${maxLetras} letras`;
        letras.className = area.value.length > maxLetras ? "erro" : "ajuda";
      };
      contar();
      area.addEventListener("input", () => { lista[i] = area.value; area.removeAttribute("aria-invalid"); contar(); ajustarAltura(area); mexeu(); });
      // Enter não quebra a linha (no site, cada frase é uma linha só).
      area.addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });
      const mover = (passo, botao) => {
        const j = i + passo;
        if (j < 0 || j >= lista.length) return;
        [lista[i], lista[j]] = [lista[j], lista[i]];
        desenhar({ frase: j, botao });
        mexeu();
      };
      // Frase com texto: pergunta antes de tirar (um toque errado no celular apagaria o que foi escrito).
      const remover = async () => {
        const frase = lista[i];
        if (frase.trim()) {
          const sim = await confirmarNaTela(tirar, `Remover a frase ${i + 1}?\n"${frase.trim()}"`, { sim: "Sim, remover", tom: "perigo" });
          // Se a lista foi desenhada de novo enquanto a pergunta estava aberta (as posições mudam), não remove nada:
          // só a caixa desta frase, ainda na tela e com o mesmo texto.
          if (!sim || !area.isConnected || lista[i] !== frase) return;
        }
        lista.splice(i, 1);
        desenhar({ frase: Math.min(i, lista.length - 1), botao: "remover" });
        mexeu();
      };
      const subir = h("button", { class: "botao claro", type: "button", disabled: i === 0, "aria-label": `Subir a frase ${i + 1}`, onclick: () => mover(-1, "subir") }, "↑ Subir");
      const descer = h("button", { class: "botao claro", type: "button", disabled: i === lista.length - 1, "aria-label": `Descer a frase ${i + 1}`, onclick: () => mover(1, "descer") }, "↓ Descer");
      const tirar = h("button", { class: "botao perigo", type: "button", "aria-label": `Remover a frase ${i + 1}`, onclick: remover }, "Remover");
      caixas.push({ area, subir, descer, remover: tirar });
      return h("div", { class: "frase" },
        h("label", { class: "rotulo", for: id, text: `Frase ${i + 1}` }), area, letras, h("div", { class: "botoes" }, subir, descer, tirar));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhuma frase. No site, este bloco não aparece." }));
    quantas.textContent = `${lista.length} de ${maxItens} frases${lista.length >= maxItens ? " (o máximo)" : ""}`;
    acrescentar.disabled = lista.length >= maxItens;
    // A caixa cresce com a frase depois de entrar na tela (antes disso o navegador não sabe a altura do texto).
    setTimeout(() => { for (const x of caixas) ajustarAltura(x.area); }, 0);
    if (!foco) return;
    const x = caixas[foco.frase];
    // O mesmo botão na posição nova; se ele ficou desligado (a frase chegou na ponta), o outro botão da frase.
    const alvo = !x ? acrescentar : foco.botao === "texto" ? x.area : [x[foco.botao], x.subir, x.descer, x.remover].find((b) => b && !b.disabled);
    alvo?.focus();
  };
  acrescentar.addEventListener("click", () => {
    mensagem(erroLista, "");
    if (lista.length >= maxItens) return mensagem(erroLista, `No máximo ${maxItens} frases.`);
    lista.push("");
    desenhar({ frase: lista.length - 1, botao: "texto" });
    mexeu();
  });
  desenhar();
  const ler = () => [...lista];
  const inicial = JSON.stringify(frasesLimpas(lista));
  // Erro do servidor que cita "a frase N": marca a caixa N (aria-invalid) e devolve ela, para a tela levar o foco até
  // lá (rodada 2 da conferência). Sem número, a lista toda (o botão de acrescentar). marcarErro(null) só desmarca.
  const marcarErro = (texto) => {
    for (const x of caixas) x.area.removeAttribute("aria-invalid");
    if (!texto) return null;
    const n = Number(/\bfrase (\d+)/.exec(String(texto))?.[1]);
    const x = caixas[n - 1];
    if (!x) return acrescentar;
    x.area.setAttribute("aria-invalid", "true");
    return x.area;
  };
  return { el: h("div", {}, caixa, quantas, acrescentar, erroLista), ler, foco: acrescentar, lista: true, marcarErro,
    mudou: () => JSON.stringify(frasesLimpas(lista)) !== inicial, definir: (v) => { lista = textosDe(v); desenhar(); },
    mesmo: (a, b) => JSON.stringify(frasesLimpas(a)) === JSON.stringify(frasesLimpas(b)) };
}

// A caixa da frase cresce com o texto: com 2 linhas fixas, no celular a maioria das frases ficava cortada e era
// preciso rolar dentro de uma caixinha (rodada 2 da conferência). Nunca fica menor que as 2 linhas do "rows".
function ajustarAltura(area) {
  if (!area.isConnected) return;
  area.style.height = "0px";
  const texto = area.scrollHeight; // altura do texto (com o espaço de dentro)
  area.style.height = "";
  if (texto > area.clientHeight) area.style.height = `${texto + area.offsetHeight - area.clientHeight}px`;
}
// Celular virado (a largura muda e as linhas também).
window.addEventListener("resize", () => { for (const a of app.querySelectorAll("textarea.frase-texto")) ajustarAltura(a); });

function entradaDoCampo(c, valor, aoMudar) {
  if (c.tipo === "lista-de-textos") return entradaDeListaDeTextos(c, valor, aoMudar);
  if (c.tipo === "campanhas") return entradaDeCampanhas(c, valor, aoMudar);
  if (c.tipo === "foto") return entradaDeFoto(c, valor, aoMudar);
  if (c.tipo === "videos") return entradaDeVideos(c, valor, aoMudar);
  if (c.tipo === "fotos") return entradaDeFotos(c, valor, aoMudar);
  if (c.tipo === "ligado") {
    const caixa = h("input", { type: "checkbox", checked: valor === true });
    const texto = h("span", { text: valor === true ? "Ligado" : "Desligado" });
    const mostrar = () => { texto.textContent = caixa.checked ? "Ligado" : "Desligado"; };
    caixa.addEventListener("change", () => { mostrar(); aoMudar?.(); });
    return { el: h("label", { class: "escolha" }, caixa, texto), ler: () => caixa.checked, foco: caixa,
      mudou: () => caixa.checked !== (valor === true), definir: (v) => { caixa.checked = v === true; mostrar(); } };
  }
  if (c.tipo === "escolha") {
    const opcoes = Array.isArray(c.opcoes) ? c.opcoes : [];
    const naLista = opcoes.findIndex((o) => o === valor);
    // Valor do site fora das opções (ou faltando): começa em "(escolha uma opção)" e só vai no Salvar se a pessoa
    // escolher de fato (item 31). As opções vão pela posição: valem texto, número ou sim/não.
    const sel = h("select", {}, naLista < 0 && h("option", { value: "", text: "(escolha uma opção)" }),
      opcoes.map((o, i) => h("option", { value: String(i), text: (c.rotulos && c.rotulos[o]) ?? String(o) })));
    sel.value = naLista < 0 ? "" : String(naLista);
    const ler = () => (sel.value === "" ? undefined : opcoes[Number(sel.value)]);
    sel.addEventListener("change", () => aoMudar?.());
    return { el: sel, ler, foco: sel, mudou: () => sel.value !== "" && ler() !== valor,
      definir: (v) => { const i = opcoes.findIndex((o) => o === v); if (i >= 0) sel.value = String(i); } };
  }
  if (c.tipo === "whatsapp") {
    // Mostra "(64) 99319-2101"; o servidor guarda só os números. "Testar" abre o WhatsApp com o número digitado, para a
    // pessoa conferir se é o certo antes de salvar.
    const entrada = h("input", { type: "tel", inputmode: "tel", autocomplete: "off", placeholder: "(64) 99999-9999", maxlength: 20 });
    entrada.value = whatsappEscrito(valor);
    const digitos = () => { const n = entrada.value.replace(/\D/g, ""); return n.length === 10 || n.length === 11 ? `55${n}` : n; };
    const testar = h("a", { class: "botao claro", target: "_blank", rel: "noopener", text: "Testar no WhatsApp" });
    const ajustar = () => { const n = digitos(); if (/^55[1-9]{2}\d{8,9}$/.test(n)) testar.href = `https://wa.me/${n}`; else testar.removeAttribute("href"); };
    ajustar();
    entrada.addEventListener("input", () => { ajustar(); aoMudar?.(); });
    return { el: h("div", { class: "whatsapp" }, entrada, testar), ler: () => entrada.value, foco: entrada,
      mudou: () => digitos() !== String(valor ?? ""), definir: (v) => { entrada.value = whatsappEscrito(v); ajustar(); } };
  }
  const props = c.tipo === "data" ? { type: "datetime-local" }
    : c.tipo === "link" ? { type: "url", inputmode: "url", placeholder: "https://… ou um atalho do site, como /loja/" } : {};
  const grande = c.tipo === "texto" && c.max > 100;
  const entrada = h(grande ? "textarea" : "input", { ...(grande ? {} : { type: "text", ...props }), maxlength: c.max });
  entrada.value = valor === undefined || valor === null ? "" : String(valor);
  const inicial = entrada.value; // como o navegador mostra (quebras de linha, data)
  entrada.addEventListener("input", () => aoMudar?.());
  return { el: entrada, ler: () => entrada.value, foco: entrada, texto: true, mudou: () => entrada.value !== inicial,
    definir: (v) => { entrada.value = v === undefined || v === null ? "" : String(v); } };
}

// ---------- salvar sem apagar a mudança de outra pessoa (item 26; contrato C3) ----------
// Antes de salvar, confere no rascunho se alguém mudou (ou publicou, ou descartou) os mesmos campos depois que a tela
// abriu. Se mudou, pergunta. Devolve os "vistos" ({ caminho: em que a tela viu, ou null }) para mandar no Salvar,
// false (recarregar a tela com a versão nova) ou null (parar: a entrada venceu). O servidor confere o "visto" de
// novo na hora de gravar: se alguém salvou entre a conferência e o Salvar, ele recusa (409) sem gravar nada.
// "naTela": um elemento da tela que pediu; se ela saiu enquanto a pergunta estava aberta, devolve null (para tudo).
async function podeSalvarPorCima(itens, naTela) {
  const vistos = Object.fromEntries(itens.map((x) => [x.caminho, x.em ?? null]));
  const r = await pedir("rascunho");
  if (r.status === 401) return null;
  if (r.status !== 200) return vistos; // sem como conferir agora: o servidor confere pelo "visto"
  const mudados = mudaramDesde(itens, r.dados.mudancas);
  if (!mudados.length) return vistos;
  const linhas = mudados.map((x) => {
    const m = r.dados.mudancas?.[x.caminho];
    return m ? `• ${x.nome}: salvo por ${m.por} em ${quando(m.em)}` : `• ${x.nome}: publicado ou descartado depois que você abriu a tela`;
  });
  // Cada botão diz o que acontece (antes era "OK:" e "Cancelar:" no texto). O foco começa em "Ver a versão nova".
  const porCima = await perguntar(`Isto mudou depois que você abriu a tela:\n${linhas.join("\n")}\n\n`
    + `"Salvar o meu por cima": o que está lá agora some.\n"Ver a versão nova": o que você mexeu fica guardado neste aparelho.`,
    { sim: "Salvar o meu por cima", nao: "Ver a versão nova", tom: "perigo" });
  if (naTela && !naTela.isConnected) return null; // a tela foi trocada: o que foi digitado já está guardado no aparelho
  if (!porCima) return false;
  // Quis salvar por cima: o "visto" passa a ser o que ela acabou de ver (se mudar de novo, o servidor recusa).
  for (const x of mudados) vistos[x.caminho] = r.dados.mudancas?.[x.caminho]?.em ?? null;
  return vistos;
}

// ---------- listas (pedido de 22/10, como no vídeo de exemplo) ----------
// Campanhas: lista com "+ Adicionar" no canto e Editar/Excluir em cada linha. Produtos e vídeos: lista dos itens,
// cada um com Editar (não dá para criar nem apagar produto: eles vêm da Yampi e do site).
function situacaoDaCampanha(x) {
  if (!x.termina) return etiqueta("Falta a data", "laranja");
  if (new Date(`${x.termina}:00-03:00`) < new Date()) return etiqueta("Terminou", "cinza");
  if (x.ligada === false) return etiqueta("Desligada", "cinza");
  return etiqueta("No ar", "verde");
}
const cabecalhoLista = (titulo, botao) => h("div", { class: "titulo-lista" }, h("h1", { text: titulo }), botao);
// No celular estreito, cada linha vira um cartão (CSS) e o nome da coluna aparece antes do valor: assim os botões
// Editar/Excluir (com 44 px para o dedo) não ficam escondidos para o lado (item 61).
function tabela(colunas, linhas) {
  for (const tr of linhas) Array.from(tr.children).forEach((td, i) => td.setAttribute("data-rotulo", colunas[i] || ""));
  return h("div", { class: "tabela-rolagem" }, h("table", { class: "tabela" },
    h("thead", {}, h("tr", {}, colunas.map((c) => h("th", { text: c })))), h("tbody", {}, linhas)));
}

// true = salvo; { recarregar, aviso } = outra pessoa mudou e a tela mostra a versão nova (com o aviso, se o servidor
// recusou pelo "visto"); false = não salvou.
async function salvarCampo(campo, valor, msg) {
  const vistos = await podeSalvarPorCima([{ caminho: campo.caminho, em: campo.rascunho?.em, nome: campo.nome }], msg);
  if (vistos === null) return false;
  if (!vistos) return { recarregar: true, aviso: "" };
  const res = await pedir("rascunho", { metodo: "POST", corpo: { mudancas: [{ caminho: campo.caminho, valor, antes: campo.noSite, visto: vistos[campo.caminho] }] } });
  if (outraPessoaMudou(res)) return { recarregar: true, aviso: res.dados.erro };
  if (res.status !== 200) { mensagem(msg, (res.dados.campos || [])[0]?.erro || res.dados.erro); return false; }
  atualizarPrevia();
  return true;
}

// "Voltar ao que está no site" de um campo, com o "em" que a tela viu (contrato C3): se outra pessoa salvou o campo
// depois, o servidor recusa (409) e nada é descartado. Sem o "em" (undefined), vai sem a conferência.
const descartarCampo = (caminho, visto) => pedir("rascunho", { metodo: "DELETE", corpo: { caminhos: [caminho], ...(visto !== undefined && { visto }) } });

const listaDoCampo = (campo) => {
  const v = campo.rascunho ? campo.rascunho.valor : campo.noSite;
  return Array.isArray(v) ? v.map((x) => ({ ...x })) : [];
};

// Aviso no alto da tela que acabou de ser desenhada de novo (ex.: "Outra pessoa mudou isto agora há pouco").
const avisoNoAlto = (aviso) => aviso && h("p", { class: "erro", role: "alert", text: aviso });

// "dentro": os grupos que abrem por um botão nesta tela (29/10: os Banners do topo, que são banners de campanha).
async function telaListaCampanhas(grupo, aviso = "", dentro = []) {
  const campo = grupo.campos[0];
  const botoesDeDentro = dentro.length > 0 && h("div", { class: "botoes" }, dentro.map((g) => {
    const salvos = g.campos.filter((c) => c.rascunho).length;
    return h("button", { class: "botao claro", type: "button", onclick: () => ir(`conteudo/${g.id}`) },
      `${g.icone || "🖼️"} ${g.titulo}${salvos ? ` · ${salvos} mudança(s) salva(s)` : ""}`);
  }));
  const lista = listaDoCampo(campo);
  const msg = h("p", { class: "erro" });
  const max = campo.max || 6;
  const adicionar = h("button", { class: "botao verde", type: "button", onclick: () => {
    if (lista.length >= max) return mensagem(msg, `No máximo ${max} campanhas ao mesmo tempo.`);
    ir(`conteudo/${grupo.id}/nova`);
  } }, "+ Adicionar");
  const linhas = lista.map((x, i) => {
    const excluir = h("button", { class: "acao perigo", type: "button", "aria-label": `Excluir a campanha ${x.titulo}` }, "🗑️ Excluir");
    excluir.addEventListener("click", async () => {
      if (!(await confirmarNaTela(excluir, `Excluir a campanha "${x.titulo}"? Ela sai do site na próxima publicação.`, { sim: "Sim, excluir", tom: "perigo" }))) return;
      ocupado(excluir, true);
      const r = await salvarCampo(campo, lista.filter((_, j) => j !== i), msg);
      ocupado(excluir, false);
      if (r) telaGrupo(grupo.id, "", r.aviso);
    });
    return h("tr", {},
      h("td", {}, h("strong", { text: x.titulo }), x.texto && h("div", { class: "miudo", text: x.texto })),
      h("td", { text: x.termina ? dataBR(x.termina) : "sem data" }),
      h("td", {}, situacaoDaCampanha(x)),
      h("td", { class: "acoes" }, h("button", { class: "acao", type: "button", "aria-label": `Editar a campanha ${x.titulo}`, onclick: () => ir(`conteudo/${grupo.id}/${i}`) }, "✏️ Editar"), excluir));
  });
  const descartar = campo.rascunho && h("button", { class: "botao claro", type: "button", onclick: async () => {
    if (!(await confirmarNaTela(descartar, "Desfazer as mudanças salvas nas campanhas e voltar ao que está no site?", { sim: "Sim, desfazer", tom: "perigo" }))) return;
    ocupado(descartar, true);
    const res = await descartarCampo(campo.caminho, campo.rascunho.em ?? null);
    if (outraPessoaMudou(res)) return telaGrupo(grupo.id, "", res.dados.erro);
    if (res.status !== 200) { ocupado(descartar, false); return mensagem(msg, res.dados.erro); }
    atualizarPrevia();
    telaGrupo(grupo.id);
  } }, "Voltar ao que está no site");
  await casca(cabecalhoLista(grupo.titulo, adicionar), avisoNoAlto(aviso),
    h("p", { class: "sub", text: "O site mostra uma contagem só: a da campanha ligada que termina primeiro. Quando ela acaba, entra a próxima." }),
    botoesDeDentro,
    h("div", { class: "cartao" },
      lista.length ? tabela(["Campanha", "Termina", "Situação", "Ações"], linhas) : h("p", { text: "Nenhuma campanha cadastrada. Toque em \"+ Adicionar\"." }),
      campo.rascunho && h("p", { class: "miudo", text: `Mudanças salvas por ${campo.rascunho.por} em ${quando(campo.rascunho.em)}, ainda não publicadas.` }),
      descartar, msg));
}

// Texto guardado de uma campanha: pelo título que ela tinha quando a tela abriu (ou "nova"), não pela posição.
const chaveDaCampanha = (campoLista, titulo) => chaveGuardada(`${campoLista.caminho}#${titulo === null ? "nova" : `titulo:${titulo}`}`);
// Troca o endereço sem desenhar a tela de novo (ela já está certa).
function trocarEndereco(rota) {
  history.replaceState(null, "", `#${rota}`);
  hashMostrado = location.hash;
}

// "procurar": o título da campanha que a tela mostrava antes de recarregar (outra pessoa mudou a lista). A campanha é
// achada por ele, não pela posição: se outra pessoa tirou ou reordenou campanhas, a mesma posição mostrava OUTRA
// campanha, e o "Recuperamos…" oferecia pôr o texto da campanha A por cima da B (rodada 2 da conferência).
async function telaCampanha(grupo, sub, aviso = "", procurar) {
  const campoLista = grupo.campos[0];
  const lista = listaDoCampo(campoLista);
  let nova = sub === "nova";
  let i = nova ? lista.length : Number(sub);
  let chaveDaOferta = null; // texto guardado de uma campanha que saiu da lista
  if (procurar !== undefined && !nova && lista[i]?.titulo !== procurar) {
    const j = lista.findIndex((c) => c.titulo === procurar);
    if (j < 0) {
      // A campanha saiu (ou mudou de título): o que ela digitou aparece em "Nova campanha", para criar uma campanha
      // nova se quiser, nunca por cima de outra.
      chaveDaOferta = chaveDaCampanha(campoLista, procurar);
      nova = true;
      aviso = `${aviso ? `${aviso} ` : ""}A campanha que você editava ("${procurar}") não está mais na lista. O que você digitou está abaixo, para criar uma campanha nova se quiser.`;
    }
    i = nova ? lista.length : j;
    trocarEndereco(`conteudo/${grupo.id}/${nova ? "nova" : i}`);
  }
  if (!nova && !(Number.isInteger(i) && lista[i])) return ir(`conteudo/${grupo.id}`);
  const x = nova ? { titulo: "", texto: "", botao: "", termina: "", ligada: true } : lista[i];
  const titulo = campo("Título", { type: "text", maxlength: 40, value: x.titulo || "" });
  const texto = campo("Texto (ex.: até 30% OFF com cupom)", { type: "text", maxlength: 60, value: x.texto || "" });
  const botao = campo("Texto do botão", { type: "text", maxlength: 30, value: x.botao || "" });
  const fim = campo("Termina em (horário de Brasília) · obrigatório", { type: "datetime-local", value: x.termina || "" }, "A contagem regressiva some sozinha nessa hora.");
  const ligada = h("input", { type: "checkbox", checked: x.ligada !== false });
  const msg = h("p", { class: "erro" });
  const salvar = h("button", { class: "botao cheio", type: "button" }, "Salvar");

  // O que foi digitado fica guardado neste aparelho a cada letra (item 4 da especificação; itens 11, 27 e 32).
  const lerForm = () => ({ titulo: titulo.entrada.value, texto: texto.entrada.value, botao: botao.entrada.value, termina: fim.entrada.value, ligada: ligada.checked });
  const definirForm = (v) => {
    titulo.entrada.value = v?.titulo ?? ""; texto.entrada.value = v?.texto ?? ""; botao.entrada.value = v?.botao ?? "";
    fim.entrada.value = v?.termina ?? ""; ligada.checked = v?.ligada !== false;
  };
  const chave = chaveDaCampanha(campoLista, nova ? null : x.titulo);
  const base = nova ? null : x;
  const guardarForm = () => guardarEm(chave, lerForm(), base);
  for (const e of [titulo.entrada, texto.entrada, botao.entrada, fim.entrada]) e.addEventListener("input", guardarForm);
  fim.entrada.addEventListener("change", guardarForm);
  ligada.addEventListener("change", guardarForm);
  const doComeco = lerForm();
  const oferta = oferecerRecuperacao(chaveDaOferta || chave, { atual: doComeco, base, aoUsar: definirForm,
    mostrar: (v) => valorNaTela([v], { tipo: "campanhas" }, [doComeco], "depois") });

  salvar.addEventListener("click", async () => {
    mensagem(msg, "");
    const f = lerForm();
    const novaLista = [...lista];
    novaLista[i] = { titulo: f.titulo.trim(), texto: f.texto.trim(), botao: f.botao.trim(), termina: f.termina, ligada: f.ligada };
    ocupado(salvar, true, "Salvando…");
    const deuCerto = await salvarCampo(campoLista, novaLista, msg);
    ocupado(salvar, false);
    // Outra pessoa mudou a lista: o que foi digitado fica guardado e a tela volta com a versão nova (e o aviso), na
    // mesma campanha (pelo título que a tela mostrava).
    if (deuCerto?.recarregar) { guardarForm(); return telaGrupo(grupo.id, nova ? "nova" : String(i), deuCerto.aviso, nova ? undefined : x.titulo); }
    if (deuCerto) { esquecerChave(chave); if (chaveDaOferta) esquecerChave(chaveDaOferta); ir(`conteudo/${grupo.id}`); }
  });
  await casca(h("button", { class: "voltar", type: "button", onclick: () => ir(`conteudo/${grupo.id}`) }, `‹ ${grupo.titulo}`),
    h("h1", { text: nova ? "Nova campanha" : `Editar: ${x.titulo}` }), avisoNoAlto(aviso),
    h("div", { class: "cartao" }, oferta, titulo.el, texto.el, botao.el, fim.el,
      h("label", { class: "escolha" }, ligada, h("span", { text: "Ligada no site" })), msg, salvar,
      h("p", { class: "ajuda", text: "Só anuncie desconto que já existe na Yampi, com a mesma data de término. Salvar não publica." })));
}

// Botão escolhido em cada grupo com filtros ("Produtos | Kits"...): continua o mesmo ao voltar para a lista.
const filtroEscolhido = new Map();

async function telaListaItens(grupo) {
  const itens = [];
  for (const c of grupo.campos) {
    let it = itens.find((x) => x.chave === c.item);
    if (!it) itens.push(it = { chave: c.item, nome: c.itemNome, campos: [] });
    it.campos.push(c);
  }
  // Filtros (27/10): botões no alto separam os itens pelo arquivo de onde vêm (o 1º pedaço do caminho do campo).
  const filtros = Array.isArray(grupo.filtros) && grupo.filtros.length > 1 ? grupo.filtros : null;
  const escolhido = filtros ? Math.min(filtroEscolhido.get(grupo.id) ?? 0, filtros.length - 1) : 0;
  const doFiltro = (it) => !filtros || filtros[escolhido].arquivos.includes(String(it.campos[0]?.caminho ?? "").split(".")[0]);
  const botoesDoFiltro = filtros && h("div", { class: "botoes filtros", role: "group", "aria-label": `Mostrar em ${grupo.titulo}` },
    filtros.map((f, n) => h("button", { class: n === escolhido ? "botao verde" : "botao claro", type: "button", "aria-pressed": String(n === escolhido),
      onclick: () => { filtroEscolhido.set(grupo.id, n); telaListaItens(grupo); } },
    `${f.rotulo} (${itens.filter((it) => f.arquivos.includes(String(it.campos[0]?.caminho ?? "").split(".")[0])).length})`)));
  const linhas = itens.filter(doFiltro).map((it) => {
    const valor = (c) => (c.rascunho ? c.rascunho.valor : c.noSite);
    const liga = it.campos.find((c) => c.tipo === "ligado");
    const videos = it.campos.find((c) => c.tipo === "videos");
    const fotos = it.campos.find((c) => c.tipo === "fotos");
    const nVideos = soObjetos(videos && valor(videos)).length;
    const nFotos = soObjetos(fotos && valor(fotos)).length;
    const situacao = liga ? etiqueta(`${liga.rotulo}: ${valor(liga) === false ? "Não" : "Sim"}`, valor(liga) === false ? "cinza" : "verde")
      : videos ? etiqueta(`${nVideos} ${nVideos === 1 ? "vídeo" : "vídeos"}`, nVideos ? "verde" : "cinza")
        : fotos ? etiqueta(`${nFotos} ${nFotos === 1 ? "foto" : "fotos"}`, nFotos ? "verde" : "cinza") : "";
    const salvos = it.campos.filter((c) => c.rascunho).length;
    return h("tr", {},
      h("td", {}, h("strong", { text: it.nome }), salvos > 0 && h("div", { class: "miudo", text: `${salvos} mudança(s) salva(s), ainda não publicada(s)` })),
      h("td", {}, situacao),
      h("td", { class: "acoes" }, h("button", { class: "acao", type: "button", "aria-label": `Editar ${it.nome}`, onclick: () => ir(`conteudo/${grupo.id}/${it.chave}`) }, "✏️ Editar")));
  });
  const voltarParaFora = grupo.dentroDe && h("button", { class: "voltar", type: "button", onclick: () => ir(`conteudo/${grupo.dentroDe}`) }, `‹ ${grupo.tituloDeFora || "Voltar"}`);
  await casca(voltarParaFora, cabecalhoLista(grupo.titulo), grupo.descricao && h("p", { class: "sub", text: grupo.descricao }), botoesDoFiltro,
    h("div", { class: "cartao" }, tabela(["Nome", "Situação", "Ações"], linhas)));
}

// aviso: mensagem no alto depois de desenhar de novo (ex.: o servidor recusou porque outra pessoa mudou o campo).
// procurar (Campanhas): o título da campanha que a tela mostrava (ver telaCampanha).
async function telaGrupo(id, sub = "", aviso = "", procurar) {
  const copia = conteudoGuardado();
  const r = copia ? { status: 200, dados: copia } : await carregarConteudo();
  if (r.status !== 200) return telaFalhou("Conteúdo do site", r);
  const grupo = r.dados.grupos.find((g) => g.id === id);
  if (!grupo) return ir("conteudo");
  if (grupo.campos.length === 1 && grupo.campos[0].tipo === "campanhas") {
    return sub ? telaCampanha(grupo, sub, aviso, procurar) : telaListaCampanhas(grupo, aviso, r.dados.grupos.filter((g) => g.dentroDe === grupo.id));
  }
  if (grupo.dentroDe) grupo.tituloDeFora = r.dados.grupos.find((g) => g.id === grupo.dentroDe)?.titulo;
  const porItem = grupo.campos.length > 0 && grupo.campos.every((c) => c.item);
  if (porItem && !sub) return telaListaItens(grupo);
  const doGrupo = porItem ? grupo.campos.filter((c) => c.item === sub) : grupo.campos;
  const voltarDoGrupo = porItem ? h("button", { class: "voltar", type: "button", onclick: () => ir(`conteudo/${id}`) }, `‹ ${grupo.titulo}`)
    : h("button", { class: "voltar", type: "button", onclick: () => ir("conteudo") }, "‹ Conteúdo do site");
  if (!doGrupo.length) {
    // Item que não existe mais: volta para a lista. Grupo sem nenhum item (ex.: lista de vídeos que ainda não existe
    // no site): mostra o aviso. Antes, "ir" para o mesmo endereço desenhava esta tela de novo, sem parar (item 29).
    if (porItem) return ir(`conteudo/${id}`);
    return casca(voltarDoGrupo, h("h1", { text: grupo.titulo }),
      h("div", { class: "cartao" }, h("p", { text: "Nada para mostrar aqui ainda." }), grupo.descricao && h("p", { class: "ajuda", text: grupo.descricao })));
  }
  const msg = h("p", { class: "erro" });
  const campos = doGrupo.map((c) => {
    const valorAtual = c.rascunho ? c.rascunho.valor : c.noSite;
    const chave = chaveGuardada(c.caminho);
    const erroCampo = h("p", { class: "erro" });
    const notas = h("div");
    let contador = null;
    const atualizarContador = () => { if (contador) contador.textContent = `${entrada.ler().length} de ${c.max} letras`; };
    // Cada mudança fica guardada neste aparelho (item 4 da especificação), com o valor que a tela mostrava.
    const entrada = entradaDoCampo(c, valorAtual, () => { guardarEm(chave, entrada.ler(), valorAtual); atualizarContador(); });
    contador = entrada.texto && c.max ? h("p", { class: "ajuda" }) : null;
    atualizarContador();

    const oferta = oferecerRecuperacao(chave, { atual: entrada.ler(), base: valorAtual, mesmo: entrada.mesmo,
      aoUsar: (v) => { entrada.definir(v); atualizarContador(); },
      mostrar: (v) => valorNaTela(v, c, entrada.ler(), "depois") });
    if (oferta) notas.append(oferta);

    if (c.rascunho) {
      const descartar = h("button", { class: "botao claro", type: "button" }, "Voltar ao que está no site");
      descartar.addEventListener("click", async () => {
        // A tela é desenhada de novo: com vídeo ou foto subindo (de qualquer campo), pergunta antes (item 56).
        if (!(await podeSairDaTela()) || !descartar.isConnected) return;
        // Um toque errado no celular apagava a versão salva (ex.: as frases do CEO) e o que ela digitou aqui, sem
        // perguntar; Campanhas e "Remover" uma frase já perguntavam (rodada 2 da conferência).
        if (!(await confirmarNaTela(descartar, `Voltar ao que está no site? A versão salva por ${c.rascunho.por} some${entrada.mudou() ? " e o que você digitou agora também" : ""}.`,
          { sim: "Sim, voltar ao site", tom: "perigo" }))) return;
        ocupado(descartar, true);
        const res = await descartarCampo(c.caminho, c.rascunho.em ?? null);
        if (outraPessoaMudou(res)) {
          // Nada foi descartado: guarda o que ela mexeu aqui e mostra a versão nova, com o aviso (contrato C3).
          if (entrada.mudou()) guardarEm(chave, entrada.ler(), valorAtual);
          return telaGrupo(id, sub, res.dados.erro);
        }
        if (res.status !== 200) { ocupado(descartar, false); return mensagem(erroCampo, res.dados.erro); }
        esquecerChave(chave);
        telaGrupo(id, sub);
        atualizarPrevia();
      });
      notas.append(h("div", { class: "miudo no-site" },
        h("p", { text: `Salvo por ${c.rascunho.por} em ${quando(c.rascunho.em)}, ainda não publicado. No site:` }),
        valorNaTela(c.noSite, c, c.rascunho.valor, "antes")), descartar);
    }
    // Nome ligado ao campo (o leitor de tela diz qual é; tocar no nome leva ao campo). Listas: grupo com nome (item 61).
    const nome = porItem ? c.rotulo : c.nome;
    const idRotulo = novoId();
    let rotulo;
    if (entrada.lista) rotulo = h("span", { class: "rotulo", id: idRotulo, text: nome });
    else {
      if (!entrada.foco.id) entrada.foco.id = novoId();
      rotulo = h("label", { class: "rotulo", for: entrada.foco.id, id: idRotulo, text: nome });
    }
    const bloco = h("div", { class: "campo", ...(entrada.lista && { role: "group", "aria-labelledby": idRotulo }) },
      rotulo, entrada.el, contador, c.ajuda && h("p", { class: "ajuda", text: c.ajuda }), notas, erroCampo);
    return { c, entrada, valorAtual, chave, erroCampo, bloco, oferta };
  });

  const salvar = h("button", { class: "botao cheio", type: "button" }, "Salvar");
  salvar.addEventListener("click", async () => {
    for (const x of campos) { mensagem(x.erroCampo, ""); x.entrada.marcarErro?.(null); x.entrada.foco?.removeAttribute?.("aria-invalid"); }
    // Salvar redesenha a tela: com envio no meio, o vídeo ou a foto se perderia (item 56).
    if (enviosEmAndamento) return mensagem(msg, "Espere o vídeo ou a foto terminar de subir para salvar.");
    const mudados = campos.filter((x) => x.entrada.mudou());
    if (!mudados.length) return mensagem(msg, "Nada mudou nesta tela.", "ajuda");
    mensagem(msg, "");
    ocupado(salvar, true, "Salvando…");
    const vistos = await podeSalvarPorCima(mudados.map((x) => ({ caminho: x.c.caminho, em: x.c.rascunho?.em, nome: x.c.nome })), salvar);
    if (vistos === null) return;
    if (!vistos) {
      for (const x of mudados) guardarEm(x.chave, x.entrada.ler(), x.valorAtual);
      return telaGrupo(id, sub);
    }
    const mudancas = mudados.map((x) => ({ caminho: x.c.caminho, valor: x.entrada.ler(), antes: x.c.noSite, visto: vistos[x.c.caminho] }));
    const res = await pedir("rascunho", { metodo: "POST", corpo: { mudancas } });
    ocupado(salvar, false);
    // Outra pessoa salvou no meio-tempo: nada foi gravado. O que ela digitou fica guardado no aparelho e a tela volta
    // com a versão nova, com o aviso do servidor e o "Recuperamos…" (contrato C3).
    if (outraPessoaMudou(res)) {
      for (const x of mudados) guardarEm(x.chave, x.entrada.ler(), x.valorAtual);
      return telaGrupo(id, sub, res.dados.erro);
    }
    if (res.status !== 200) {
      let primeiro = null;
      for (const e of res.dados.campos || []) {
        const x = campos.find((y) => y.c.caminho === e.caminho);
        if (!x) continue;
        mensagem(x.erroCampo, e.erro);
        // Lista de frases: a caixa da frase citada ("a frase 5"); outros campos: o próprio campo.
        const alvo = x.entrada.marcarErro ? x.entrada.marcarErro(e.erro) : x.entrada.foco;
        if (!x.entrada.marcarErro && ["INPUT", "SELECT", "TEXTAREA"].includes(alvo?.tagName)) alvo.setAttribute("aria-invalid", "true");
        primeiro ??= alvo;
      }
      mensagem(msg, res.dados.erro);
      // A mensagem geral fica no fim da tela e o erro pode estar milhares de pixels acima (tela do produto com as 4
      // listas): leva a pessoa até o primeiro campo com erro (rodada 2 da conferência).
      if (primeiro) { primeiro.focus?.({ preventScroll: true }); primeiro.scrollIntoView?.({ block: "center" }); }
      return;
    }
    for (const x of mudados) esquecerChave(x.chave);
    await telaGrupo(id, sub);
    atualizarPrevia();
  });

  // Texto recuperado num campo lá embaixo (a tela do produto tem várias telas de altura no celular): avisa no alto,
  // com um botão que leva até ele (rodada 2 da conferência).
  const recuperados = campos.filter((x) => x.oferta);
  const avisoRecuperado = recuperados.length > 0 && h("div", { class: "ajuda", role: "status" },
    h("p", { text: `Tem texto que você digitou e não salvou, guardado neste aparelho: ${recuperados.map((x) => (porItem ? x.c.rotulo : x.c.nome)).join(", ")}.` }),
    h("button", { class: "botao claro", type: "button", onclick: () => {
      const x = recuperados.find((y) => y.oferta.isConnected); // "Usar" e "Descartar" tiram a caixa
      if (x) x.oferta.scrollIntoView?.({ block: "center" });
      else avisoRecuperado.remove();
    } }, "Ir até lá"));
  await casca(voltarDoGrupo,
    h("h1", { text: porItem ? doGrupo[0].itemNome : grupo.titulo }), avisoNoAlto(aviso), avisoRecuperado, !porItem && grupo.descricao && h("p", { class: "sub", text: grupo.descricao }),
    h("div", { class: "cartao" }, campos.map((x) => x.bloco), msg, salvar,
      h("p", { class: "ajuda", text: "Salvar não publica nem gasta crédito. Para ir ao site, use Publicar (ou Enviar para aprovação)." })));
}

// ---------- conflitos (mesmo campo mudado por fora) ----------
// Cada lado aparece de verdade (foto com miniatura, campanhas e vídeos item por item, com o que muda em destaque), e
// a escolha vai com a marca do valor do site que a pessoa viu (itens 4 e 60).
async function telaConflitos(conflitos, explicacao, aoEscolher) {
  const mapa = await regras();
  const escolhas = {};
  const blocos = conflitos.map((c) => {
    const regra = mapa[c.caminho];
    const nomeGrupo = novoId();
    const opcao = (lado, titulo, valor, outro) => {
      const radio = h("input", { type: "radio", name: nomeGrupo, value: lado, onchange: () => { escolhas[c.caminho] = c.marca ? { lado, marca: c.marca } : lado; } });
      return h("label", { class: "escolha" }, radio, h("span", { class: "escolha-conteudo" }, h("b", { text: titulo }),
        valorNaTela(valor, regra, outro, lado === "site" ? "antes" : "depois")));
    };
    return h("div", { class: "cartao", role: "radiogroup", "aria-label": c.nome },
      h("h3", { text: regra?.nome || c.nome || c.caminho }),
      opcao("painel", "Ficar com a versão do painel", c.noPainel, c.noSite), opcao("site", "Manter a que está no site", c.noSite, c.noPainel));
  });
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", onclick: async () => {
    if (Object.keys(escolhas).length < conflitos.length) return mensagem(msg, "Escolha uma versão em cada campo.");
    ocupado(botao, true, "Publicando…");
    await aoEscolher(escolhas, msg);
    ocupado(botao, false);
  } }, "Continuar");
  return casca(voltar(), h("h1", { text: "Escolha qual versão fica" }), h("p", { class: "sub", text: explicacao }), ...blocos, msg, botao);
}

// Campos salvos que não valem mais (as regras do site mudaram): diz qual e por quê, com "Descartar esta mudança"
// (Publicar e Enviar) ou o recado pronto para devolver (Aprovar) (item 34).
// "vistos": o "em" de cada mudança que a tela mostrou (o Descartar vai com ele; contrato C3). "recarregar": desenha a
// tela de novo com um aviso (quando outra pessoa mudou o campo e nada foi descartado).
function listaDeInvalidos(invalidos, { nomes = {}, descartavel = false, aoDevolver, vistos, recarregar } = {}) {
  // Primeiro o nome da tela de Conteúdo (com o nome do item), depois o que a tela recebeu (rodada 2 da conferência).
  const nomeDe = (c) => regrasCache?.mapa?.[c]?.nome || nomes[c] || c;
  // Linha do recado: a mensagem do servidor já começa com o nome do campo ("Destaques: a frase 1 passou…"); em vez
  // de repetir ("- Destaques · Gloss: Destaques: …"), troca esse começo pelo nome com o item (rodada 2).
  const linhaDoRecado = (x) => {
    const nome = nomeDe(x.caminho);
    const erro = x.erro || "não vale mais";
    const rotulo = regrasCache?.mapa?.[x.caminho]?.rotulo || nome.split(" · ")[0];
    return rotulo && erro.startsWith(rotulo) && /^(:| \()/.test(erro.slice(rotulo.length)) ? `- ${nome}${erro.slice(rotulo.length)}` : `- ${nome}: ${erro}`;
  };
  return h("div", { class: "lista-invalidos" },
    h("ul", { class: "lista" }, invalidos.map((x) => {
      const msgItem = h("p", { class: "erro" });
      const descartar = descartavel && h("button", { class: "botao claro", type: "button" }, "Descartar esta mudança");
      if (descartar) {
        descartar.addEventListener("click", async () => {
          if (!(await confirmarNaTela(descartar, `Descartar a mudança salva em "${nomeDe(x.caminho)}"? Ela não vai para o site.`, { sim: "Sim, descartar", tom: "perigo" }))) return;
          ocupado(descartar, true);
          const res = await descartarCampo(x.caminho, vistos && Object.hasOwn(vistos, x.caminho) ? vistos[x.caminho] ?? null : undefined);
          if (outraPessoaMudou(res) && recarregar) return recarregar(res.dados.erro);
          if (res.status !== 200) { ocupado(descartar, false); return mensagem(msgItem, res.dados.erro); }
          atualizarPrevia();
          rotear();
        });
      }
      return h("li", {}, h("strong", { text: nomeDe(x.caminho) }), h("div", { text: x.erro || "Não vale mais." }), descartar, msgItem);
    })),
    aoDevolver && h("button", { class: "botao claro", type: "button", onclick: () => aoDevolver(
      `Corrija e envie de novo:\n${invalidos.map(linhaDoRecado).join("\n")}`.replace(/[<>]/g, "").slice(0, 500)) },
    "Devolver para a funcionária com estes problemas"));
}
function mostrarInvalidos(r, msg, opcoes) {
  if (msg.nextElementSibling?.classList.contains("lista-invalidos")) msg.nextElementSibling.remove();
  const invalidos = (Array.isArray(r.dados.campos) ? r.dados.campos : []).filter((x) => x && typeof x === "object" && typeof x.caminho === "string");
  if (invalidos.length) msg.after(listaDeInvalidos(invalidos, opcoes));
}

// ---------- depois de publicar: já está no ar? (item 8; contrato C2) ----------
// O site (Opção A) publica /versao.json com o código (commit) da versão no ar. Com o código desta publicação, que vem
// na resposta do Publicar/Aprovar/Desfazer, o painel confere de tempos em tempos. Sem /versao.json ou sem o código,
// fica só o "Enviado" (sem pedido nenhum a mais); nada aqui diz "Publicado" sem ter visto.
const CONFERIR_A_CADA = 15_000;
const CONFERIR_ATE = 10 * 60_000;
async function lerVersaoNoAr() {
  try {
    const r = await fetch("/versao.json", { cache: "no-store", credentials: "same-origin" });
    if (!r.ok) return null;
    const d = await r.json();
    return d && typeof d.commit === "string" && /^[0-9a-f]{7,40}$/.test(d.commit) ? d.commit : null;
  } catch {
    return null;
  }
}
async function conferirSeEstaNoAr(publicacao, nota) {
  const commit = commitDe(publicacao);
  if (!commit) return; // sem o código na resposta: nada a conferir (e nenhum pedido ao Histórico)
  const quandoFoi = publicacao.quando || Date.now();
  const inicio = Date.now();
  let antes = null; // versão no ar quando começou a conferir (a de antes desta publicação)
  let conferido = null;
  mensagem(nota, "Conferindo se a nova versão já está no ar…", "ajuda");
  while (nota.isConnected && Date.now() - inicio < CONFERIR_ATE) {
    const noAr = await lerVersaoNoAr();
    if (!noAr) { mensagem(nota, "", "ajuda"); return; } // site sem /versao.json: fica só o "Enviado"
    antes ??= noAr;
    let pronto = mesmoCommit(noAr, commit);
    if (!pronto && noAr !== antes && noAr !== conferido) {
      // O site mudou para outra versão que não é esta: se for de uma publicação do painel feita depois desta, esta
      // já foi junto. (Enquanto o site continua na versão de antes, não pergunta nada ao Histórico.)
      conferido = noAr;
      const hist = await pedir("historico");
      const outra = hist.status === 200 ? (hist.dados.publicacoes || []).find((p) => mesmoCommit(noAr, commitDe(p))) : null;
      pronto = Boolean(outra && outra.quando >= quandoFoi);
    }
    if (pronto) return mensagem(nota, "Pronto: a nova versão já está no ar.", "sucesso");
    await esperar(CONFERIR_A_CADA);
  }
  if (nota.isConnected) mensagem(nota, "Ainda não apareceu no site. Confira no Histórico daqui a pouco; se continuar assim, avise a administradora.", "erro");
}

// Resultado de Publicar, Aprovar e Desfazer.
async function resultadoPublicacao(r, msg, repetir, opcoes = {}) {
  if (r.status === 409 && r.dados.conflitos) return telaConflitos(r.dados.conflitos, r.dados.erro, repetir);
  if (r.status === 409 && r.dados.rascunhoMudou && opcoes.recarregar) return opcoes.recarregar(r.dados.erro);
  if (r.status !== 200) {
    mensagem(msg, r.dados.erro);
    mostrarInvalidos(r, msg, opcoes);
    return;
  }
  conteudoCache = null;
  atualizarPrevia();
  const d = r.dados;
  if (d.nada) return casca(h("div", { class: "cartao" }, h("h1", { text: "Nada para mudar" }), h("p", { text: d.aviso || "O site já está assim." }), botaoInicio()));
  const estado = h("p", { class: "ajuda", role: "status" });
  await casca(h("div", { class: "cartao" },
    h("h1", { text: "Enviado para o site" }),
    h("p", { text: "Pode levar alguns minutos para aparecer." }),
    d.esperandoRobo && h("p", { class: "ajuda", text: "Tem vídeo novo: o robô dos vídeos diminui o vídeo e só então o site muda (uns minutos). O Histórico mostra quando terminar." }),
    // Com o nome da tela de Conteúdo, pelo campo de cada mudança ("caminhos", na mesma ordem; rodada 2 da conferência).
    Array.isArray(d.mudancas) && d.mudancas.length > 0 && h("ul", { class: "lista" },
      d.mudancas.map((n, i) => h("li", { text: String(regrasCache?.mapa?.[Array.isArray(d.caminhos) ? d.caminhos[i] : ""]?.nome || n) }))),
    estado, botaoInicio()));
  if (!d.esperandoRobo) conferirSeEstaNoAr(d, estado);
}

// ---------- publicar ----------
// Mostra cada mudança salva com o antes e o depois, e publica exatamente essa lista: o servidor confere (caminho e
// hora de cada uma) e, se o rascunho mudou no meio-tempo, não publica nada e a tela recarrega (itens 4 e 23).
async function telaPublicar(aviso) {
  if (!ehResponsavel()) return ir("enviar");
  const [r, rasc, mapa] = await Promise.all([pedir("publicar"), pedir("rascunho"), regras()]);
  if (r.status !== 200) return telaFalhou("Publicar no site", r);
  if (rasc.status !== 200) return telaFalhou("Publicar no site", rasc);
  const nomes = Object.fromEntries((r.dados.mudancas || []).map((m) => [m.caminho, m.nome]));
  const mudancas = rasc.dados.mudancas || {};
  const vistas = vistasDe(mudancas);
  const lista = Object.entries(mudancas).map(([caminho, m]) => ({ caminho, ...m, nome: mapa[caminho]?.nome || nomes[caminho] || caminho,
    // Salvo igual ao que estava no site (ex.: desligou e ligou de novo): vai junto, mas não muda nada (teste de 27/10).
    igual: Object.hasOwn(m, "antes") && JSON.stringify(m.antes) === JSON.stringify(m.valor) }));
  const queMudam = lista.filter((m) => !m.igual).length;
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", disabled: !lista.length }, "Publicar no site");
  // "onde": a mensagem da tela que está na frente (depois da tela de conflitos, é a dela).
  const publicar = async (escolhas, onde = msg) => {
    const res = await pedir("publicar", { metodo: "POST", corpo: { confirmar: true, escolhas, vistas } });
    await resultadoPublicacao(res, onde, (novas, m) => publicar({ ...escolhas, ...novas }, m),
      { nomes: Object.fromEntries(lista.map((m) => [m.caminho, m.nome])), descartavel: true, vistos: vistas, recarregar: (erro) => telaPublicar(erro) });
  };
  botao.addEventListener("click", async () => {
    if (!(await confirmarNaTela(botao, `Publicar ${queMudam} mudança(s) no site? Conta 1 publicação do mês.`, { sim: "Sim, publicar", tom: "verde" }))) return;
    ocupado(botao, true, "Publicando…");
    await publicar({});
    ocupado(botao, false);
  });
  await casca(voltar(), h("h1", { text: "Publicar no site" }),
    aviso && h("p", { class: "erro", role: "alert", text: aviso }),
    h("div", { class: "cartao" },
      lista.length ? h("ul", { class: "lista" }, lista.map((m) => h("li", {}, h("strong", { text: m.nome }),
        h("div", { class: "miudo", text: `Salvo por ${m.por} em ${quando(m.em)}` }),
        m.igual && h("p", { class: "ajuda", text: "Igual ao que já está no site: não muda nada." }),
        Object.hasOwn(m, "antes") ? antesDepois(m.antes, m.valor, mapa[m.caminho], ["No site (quando foi salvo)", "Vai para o site"])
          : h("div", { class: "antes-depois um" }, h("div", {}, h("b", { text: "Vai para o site" }), valorNaTela(m.valor, mapa[m.caminho]))))))
        : h("p", { text: "Não há mudanças salvas para publicar." }),
      msg, botao));
}

// ---------- enviar para aprovação (funcionária) ----------
async function telaEnviar(aviso) {
  const [r, mapa] = await Promise.all([pedir("rascunho"), regras()]);
  if (r.status !== 200) return telaFalhou("Enviar para aprovação", r);
  const lista = Object.entries(r.dados.mudancas || {}).map(([caminho, m]) => ({ caminho, ...m, nome: mapa[caminho]?.nome || caminho }));
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", disabled: !lista.length }, "Enviar para aprovação");
  botao.addEventListener("click", async () => {
    ocupado(botao, true, "Enviando…");
    const res = await pedir("enviar", { metodo: "POST", corpo: {} });
    ocupado(botao, false);
    if (res.status !== 201) {
      mensagem(msg, res.dados.erro);
      return mostrarInvalidos(res, msg, { nomes: Object.fromEntries(lista.map((m) => [m.caminho, m.nome])), descartavel: true,
        vistos: vistasDe(r.dados.mudancas), recarregar: (erro) => telaEnviar(erro) });
    }
    casca(h("div", { class: "cartao" }, h("h1", { text: "Enviado!" }),
      h("p", { text: "A Bruna e o CEO foram avisados. Você vê a resposta em Aprovações." }), botaoInicio()));
  });
  await casca(voltar(), h("h1", { text: "Enviar para aprovação" }), avisoNoAlto(aviso),
    h("div", { class: "cartao" },
      h("p", { text: lista.length ? `Você tem ${lista.length} mudança(s) salvas.` : "Você não tem mudanças salvas." }),
      lista.length > 0 && h("ul", { class: "lista" }, lista.map((m) => h("li", {}, h("strong", { text: m.nome }),
        Object.hasOwn(m, "antes") ? antesDepois(m.antes, m.valor, mapa[m.caminho], ["No site", "Sua mudança"])
          : h("div", { class: "antes-depois um" }, h("div", {}, h("b", { text: "Sua mudança" }), valorNaTela(m.valor, mapa[m.caminho])))))),
      msg, botao));
}

// ---------- aprovações ----------
async function telaAprovacoes() {
  const [r, mapa] = await Promise.all([pedir("aprovacoes"), regras()]);
  if (r.status !== 200) return telaFalhou("Aprovações", r);
  const envios = r.dados.envios || [];
  const ETIQUETA = { pendente: ["Esperando", "laranja"], aprovado: ["Aprovado", "verde"], devolvido: ["Devolvido", ""], descartado: ["Descartado", "cinza"], aprovando: ["Publicando", "laranja"] };
  const cartoes = envios.map((e) => {
    const msg = h("p", { class: "erro" });
    const acoes = h("div", { class: "botoes" });
    const caixaRecado = h("div");
    // Envio que parou no meio da publicação ("preso", servidor) volta a ter os botões (itens 16 e 30).
    if ((e.status === "pendente" || e.preso === true) && ehResponsavel()) {
      const nomes = Object.fromEntries(e.mudancas.map((m) => [m.caminho, m.nome]));
      const chaveRecado = chaveGuardada(`recado:${e.id}`);
      const decidir = async (corpo, botao, onde = msg) => {
        ocupado(botao, true);
        const res = await pedir("aprovacoes", { metodo: "POST", corpo: { id: e.id, ...corpo } });
        ocupado(botao, false);
        if (corpo.acao === "aprovar") return resultadoPublicacao(res, onde, (escolhas, m) => decidir({ ...corpo, escolhas }, botao, m), { nomes, aoDevolver: abrirRecado });
        if (res.status !== 200) return mensagem(onde, res.dados.erro);
        if (corpo.acao === "devolver") esquecerChave(chaveRecado);
        telaAprovacoes();
      };
      // Recado num campo da própria tela (até 500 letras), guardado no aparelho: se o servidor recusar ou a entrada
      // vencer, o texto continua (item 32).
      function abrirRecado(texto) {
        const area = h("textarea", { id: novoId(), maxlength: 500, rows: 4 });
        const contador = h("p", { class: "ajuda" });
        const contar = () => { contador.textContent = `${area.value.length} de 500 letras`; };
        if (typeof texto === "string") { area.value = texto; guardarEm(chaveRecado, area.value, null); }
        area.addEventListener("input", () => { guardarEm(chaveRecado, area.value, null); contar(); });
        const oferta = typeof texto === "string" ? null : oferecerRecuperacao(chaveRecado, { atual: "", base: null,
          aoUsar: (v) => { area.value = String(v); contar(); }, mostrar: (v) => h("p", { class: "valor-texto", text: String(v) }) });
        const enviar = h("button", { class: "botao", type: "button" }, "Devolver com este recado");
        enviar.addEventListener("click", () => {
          const recado = area.value.trim();
          if (!recado) return mensagem(msg, "Escreva o recado (o que precisa mudar).");
          if (/[<>]/.test(recado)) return mensagem(msg, "Não use os sinais < e > no recado.");
          mensagem(msg, "");
          decidir({ acao: "devolver", recado }, enviar);
        });
        const cancelar = h("button", { class: "botao claro", type: "button", onclick: () => caixaRecado.replaceChildren() }, "Cancelar");
        contar();
        caixaRecado.replaceChildren(h("div", { class: "campo" },
          h("label", { for: area.id, text: "Recado para a funcionária (o que precisa mudar)" }), area, contador, oferta), h("div", { class: "botoes" }, enviar, cancelar));
        area.focus();
      }
      const aprovar = h("button", { class: "botao verde", type: "button" }, e.preso ? "Tentar publicar de novo" : "Aprovar e publicar");
      aprovar.addEventListener("click", async () => {
        const sim = await confirmarNaTela(aprovar, e.preso
          ? "Tentar publicar de novo? Se já tiver entrado no site, o painel só confirma."
          : "Aprovar e publicar no site? Conta 1 publicação do mês.", { sim: e.preso ? "Sim, tentar de novo" : "Sim, aprovar e publicar", tom: "verde" });
        if (sim) decidir({ acao: "aprovar" }, aprovar);
      });
      const devolver = h("button", { class: "botao claro", type: "button", onclick: () => abrirRecado() }, "Devolver com recado");
      const descartar = h("button", { class: "botao perigo", type: "button" }, "Descartar");
      descartar.addEventListener("click", async () => {
        if (await confirmarNaTela(descartar, "Descartar estas mudanças? Elas não vão para o site.", { sim: "Sim, descartar", tom: "perigo" })) decidir({ acao: "descartar" }, descartar);
      });
      acoes.append(aprovar, devolver, descartar);
      if (lerGuardado(chaveRecado)) abrirRecado(); // recado digitado antes de a entrada vencer
    }
    const [rotulo, cor] = e.preso ? ["Parou no meio", "laranja"] : ETIQUETA[e.status] || [e.status, ""];
    return h("div", { class: "cartao" },
      // Nome e e-mail mascarado de quem enviou: separa duas pessoas com o mesmo nome (contrato C5; item 43).
      h("div", { class: "botoes" }, h("span", { class: `etiqueta ${cor}`, text: rotulo }), h("span", { class: "miudo", text: `${comEmail(e.de, e.deEmail)} · ${quando(e.criado)}` })),
      e.decisao && h("p", { class: e.preso ? "erro" : "miudo", text: e.decisao }),
      e.recado && h("p", { class: "valor-texto" }, h("b", { text: "Recado: " }), e.recado),
      h("ul", { class: "lista" }, e.mudancas.map((m) => itemDeMudanca(m, mapa))),
      msg, acoes, caixaRecado);
  });
  await casca(voltar(), h("h1", { text: "Aprovações" }), cartoes.length ? cartoes : h("div", { class: "cartao" }, h("p", { text: "Nenhum envio por enquanto." })));
}

// ---------- histórico ----------
async function telaHistorico() {
  const [r, mapa] = await Promise.all([pedir("historico"), regras()]);
  if (r.status !== 200) return telaFalhou("Histórico", r);
  const lista = r.dados.publicacoes || [];
  // Qual publicação está no ar agora: a do código que o site mostra em /versao.json (item 8). As mais novas que
  // ela ainda não chegaram. Sem /versao.json, ou com o site numa versão feita fora do painel, não diz nada.
  // Só pergunta ao site se alguma publicação tiver o código (sem ele não há o que comparar; contrato C2).
  const noAr = lista.some((p) => commitDe(p)) ? await lerVersaoNoAr() : null;
  const k = noAr ? lista.findIndex((p) => mesmoCommit(noAr, commitDe(p))) : -1;
  const cartoes = lista.map((p, i) => {
    const msg = h("p", { class: "erro" });
    const desfazer = ehResponsavel() && h("button", { class: "botao claro", type: "button" }, "Desfazer esta publicação");
    if (desfazer) {
      const nomes = Object.fromEntries(p.mudancas.map((m) => [m.caminho, m.nome]));
      const pedirDesfazer = async (escolhas, onde = msg) => {
        const res = await pedir("desfazer", { metodo: "POST", corpo: { id: p.id, escolhas } });
        await resultadoPublicacao(res, onde, (novas, m) => pedirDesfazer({ ...escolhas, ...novas }, m), { nomes });
      };
      desfazer.addEventListener("click", async () => {
        if (!(await confirmarNaTela(desfazer, "Voltar estes campos para como estavam antes? Conta 1 publicação do mês.", { sim: "Sim, desfazer" }))) return;
        ocupado(desfazer, true, "Desfazendo…");
        await pedirDesfazer({});
        ocupado(desfazer, false);
      });
    }
    const noArAgora = k >= 0 && i === k;
    const aindaIndo = k >= 0 && i < k;
    return h("div", { class: "cartao" },
      h("div", { class: "botoes" }, etiqueta(p.tipo === "desfazer" ? "Desfeita" : "Publicada", p.tipo === "desfazer" ? "cinza" : "verde"),
        noArAgora && etiqueta("No ar agora", "verde"),
        aindaIndo && etiqueta(Date.now() - p.quando < 30 * 60_000 ? "Indo para o site" : "Ainda não está no ar", "laranja"),
        h("span", { class: "miudo", text: `${p.quem} · ${quando(p.quando)}` })),
      p.aviso && h("p", { class: "ajuda", role: "status", text: p.aviso }),
      h("ul", { class: "lista" }, p.mudancas.map((m) => itemDeMudanca(m, mapa))),
      msg, desfazer);
  });
  await casca(voltar(), h("h1", { text: "Histórico" }), cartoes.length ? cartoes : h("div", { class: "cartao" }, h("p", { text: "Nenhuma publicação pelo painel ainda." })));
}

// ---------- acessos ----------
function mostrarLink(titulo, link, texto) {
  const copiar = h("button", { class: "botao claro", type: "button" }, "Copiar link");
  copiar.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(link); copiar.textContent = "Copiado!"; } catch { copiar.textContent = "Segure no link para copiar"; }
  });
  const zap = h("a", { class: "botao verde", href: `https://wa.me/?text=${encodeURIComponent(`${texto}\n${link}`)}`, target: "_blank", rel: "noopener noreferrer" }, "Mandar pelo WhatsApp");
  casca(h("button", { class: "voltar", type: "button", onclick: () => ir("acessos") }, "‹ Voltar para Acessos"),
    h("div", { class: "cartao" }, h("h1", { text: titulo }),
      h("p", { class: "sub", text: "Funciona uma vez só e vence em 48 horas. Mande só para a pessoa certa." }),
      h("p", { class: "link-convite", text: link }), h("div", { class: "botoes" }, zap, copiar)));
}

function formReconfirmar(titulo, explicacao, extras, aoConfirmar) {
  const email = campo("Seu e-mail", { type: "email", autocomplete: "username", required: true });
  const senha = campo("Sua senha", { type: "password", autocomplete: "current-password", required: true });
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao cheio", type: "submit" }, "Gerar link");
  const form = h("form", { class: "cartao" }, h("h1", { text: titulo }), h("p", { class: "sub", text: explicacao }), ...extras,
    h("p", { class: "rotulo", text: "Por segurança, confirme que é você:" }), email.el, senha.el, msg, botao);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocupado(botao, true, "Gerando…");
    const erro = await aoConfirmar(email.entrada.value, senha.entrada.value);
    ocupado(botao, false);
    if (erro) { senha.entrada.value = ""; mensagem(msg, erro); }
  });
  casca(h("button", { class: "voltar", type: "button", onclick: () => ir("acessos") }, "‹ Voltar para Acessos"), form);
}

// Decisão da dona em 27/10: o painel é só da Bruna e do CEO. Só a administradora convida, e só como Responsável.
function telaConvidar() {
  const papel = "responsavel";
  formReconfirmar("Convidar a Bruna ou o CEO", "Gere um link e mande para a pessoa. Ela mesma digita o e-mail e cria a senha.",
    [h("p", { class: "ajuda", text: "O painel é só para a Bruna e o CEO: os dois publicam direto no site." })],
    async (email, senha) => {
      const r = await pedir("convites", { metodo: "POST", corpo: { tipo: "cadastro", papel, email, senha } });
      if (r.status !== 201) return r.dados.erro;
      mostrarLink("Convite pronto", r.dados.link, "Aqui está o seu acesso ao painel do site da Brumar. Toque no link, digite seu nome, seu e-mail e crie uma senha (mínimo 10 letras ou números). O link funciona uma vez só e vale por 48 horas.");
    });
}

function telaNovaSenha(pessoa) {
  formReconfirmar(`Nova senha para ${pessoa.nome}`, pessoa.ativo
    ? "Gere um link para a pessoa criar uma senha nova. Quando ela criar a senha nova, as entradas antigas dela deixam de valer e a senha antiga não entra mais."
    : "O acesso está desligado. Gere um link para a pessoa criar uma senha nova: o acesso volta com a senha nova, e a antiga não entra mais.", [],
    async (email, senha) => {
      const r = await pedir("convites", { metodo: "POST", corpo: { tipo: "nova-senha", para: pessoa.id || pessoa.email, email, senha } });
      if (r.status !== 201) return r.dados.erro;
      mostrarLink(`Link de nova senha para ${pessoa.nome}`, r.dados.link, "Aqui está o link para criar uma senha nova no painel da Brumar. Ele funciona uma vez só e vale por 48 horas.");
    });
}

async function telaAcessos() {
  if (!ehResponsavel()) return ir("");
  const [pessoas, convites] = await Promise.all([pedir("acessos"), pedir("convites")]);
  if (pessoas.status !== 200) return telaFalhou("Acessos", pessoas);
  const msg = h("p", { class: "erro" });
  // Quem não é a administradora recebe o e-mail das outras pessoas mascarado ("a***@loja.com"): a tela age pelo "id"
  // de cada pessoa (rodada 2 da conferência; E2).
  const quemE = (p) => (p.id ? { id: p.id } : { email: p.email });
  const linhas = (pessoas.dados.pessoas || []).map((p) => {
    const acoes = h("div", { class: "botoes" });
    if (p.podeMexer) {
      const ligar = h("button", { class: p.ativo ? "botao perigo" : "botao claro", type: "button" }, p.ativo ? "Desligar acesso" : "Religar acesso");
      ligar.addEventListener("click", async () => {
        if (p.ativo && !(await confirmarNaTela(ligar, `Desligar o acesso de ${p.nome}? Ela sai do painel na hora.`, { sim: "Sim, desligar", tom: "perigo" }))) return;
        ocupado(ligar, true);
        const r = await pedir("acessos", { metodo: "POST", corpo: { ...quemE(p), acao: p.ativo ? "desligar" : "religar" } });
        if (r.status !== 200) { ocupado(ligar, false); return mensagem(msg, r.dados.erro); }
        telaAcessos();
      });
      acoes.append(ligar);
      // Também para quem está desligada: é o jeito seguro de religar depois de celular roubado ou senha vazada
      // ("Religar" volta com a senha de antes; auditoria 2, item 6).
      acoes.append(h("button", { class: "botao claro", type: "button", onclick: () => telaNovaSenha(p) }, "Nova senha"));
      if (eu.papel === "admin" && !p.ativo) {
        const apagar = h("button", { class: "botao perigo", type: "button" }, "Apagar dados");
        apagar.addEventListener("click", async () => {
          if (!(await confirmarNaTela(apagar, `Apagar de vez os dados de ${p.nome}? Não dá para desfazer.`, { sim: "Sim, apagar", tom: "perigo" }))) return;
          ocupado(apagar, true);
          const r = await pedir("acessos", { metodo: "POST", corpo: { ...quemE(p), acao: "apagar" } });
          if (r.status !== 200) { ocupado(apagar, false); return mensagem(msg, r.dados.erro); }
          telaAcessos();
        });
        acoes.append(apagar);
      }
      if (eu.papel === "admin") {
        const destravar = h("button", { class: "botao claro", type: "button" }, "Destravar");
        destravar.addEventListener("click", async () => {
          ocupado(destravar, true);
          const r = await pedir("acessos", { metodo: "POST", corpo: { ...quemE(p), acao: "destravar" } });
          ocupado(destravar, false);
          mensagem(msg, r.status === 200 ? `${p.nome} pode tentar entrar de novo.` : r.dados.erro, r.status === 200 ? "sucesso" : "erro");
        });
        acoes.append(destravar);
      }
    }
    return h("li", {}, h("strong", { text: p.nome }), " ", h("span", { class: `etiqueta ${p.ativo ? "" : "cinza"}`, text: p.ativo ? NOMES_PAPEL[p.papel] || p.papel : "Desligado" }),
      h("div", { class: "miudo", text: p.email }),
      !p.ativo && p.podeMexer && h("p", { class: "ajuda", text: "Nova senha: a pessoa cria uma senha nova pelo link; o acesso volta com a senha nova e a antiga não entra mais. Religar acesso: volta com a mesma senha de antes (não use se a senha vazou ou o celular foi roubado)." }),
      acoes);
  });
  const abertos = (convites.dados.convites || []).map((c) => {
    const cancelar = h("button", { class: "botao perigo", type: "button" }, "Cancelar");
    cancelar.addEventListener("click", async () => {
      ocupado(cancelar, true);
      const r = await pedir("convites", { metodo: "DELETE", corpo: { id: c.id } });
      if (r.status !== 200) { ocupado(cancelar, false); return mensagem(msg, r.dados.erro); }
      telaAcessos();
    });
    return h("li", {}, h("strong", { text: c.tipo === "cadastro" ? `Convite de ${(NOMES_PAPEL[c.papel] || "pessoa").toLowerCase()}` : `Nova senha de ${c.email}` }),
      h("div", { class: "miudo", text: `Criado por ${c.criadoPor} · vence ${quando(c.expira)}` }), h("div", { class: "botoes" }, cancelar));
  });
  await casca(voltar(), h("h1", { text: "Acessos" }),
    eu.papel === "admin" && h("button", { class: "botao verde cheio", type: "button", onclick: telaConvidar }, "+ Convidar a Bruna ou o CEO"),
    h("div", { class: "cartao" }, h("h2", { text: "Quem tem acesso" }), msg, linhas.length ? h("ul", { class: "lista" }, linhas) : h("p", { text: "Ninguém ainda." })),
    convites.status !== 200 && h("div", { class: "cartao" }, h("h2", { text: "Convites ainda não usados" }), h("p", { class: "erro", text: convites.dados.erro })),
    abertos.length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Convites ainda não usados" }), h("ul", { class: "lista" }, abertos)),
    (pessoas.dados.registro || []).length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Últimas mudanças de acesso" }),
      h("ul", { class: "lista" }, pessoas.dados.registro.map((r) => h("li", {},
        h("span", { text: `${comEmail(r.quem, r.quemEmail)} ${papelLegivel(r.acao)}` }), r.alvo && h("span", { class: "miudo", text: ` · ${r.alvo}` }),
        h("div", { class: "miudo", text: quando(r.em) }))))));
}

// ---------- minha senha ----------
function telaSenha() {
  const atual = campo("Senha atual", { type: "password", autocomplete: "current-password", required: true });
  const nova = campo("Nova senha", { type: "password", autocomplete: "new-password", minlength: 10, required: true }, "Pelo menos 10 letras ou números.");
  const repetir = campo("Digite a nova senha de novo", { type: "password", autocomplete: "new-password", required: true });
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao cheio", type: "submit" }, "Trocar senha");
  const form = h("form", { class: "cartao" }, h("h1", { text: "Minha senha" }),
    h("p", { class: "sub", text: "Depois de trocar, os outros celulares onde você entrou vão pedir a senha nova." }), atual.el, nova.el, repetir.el, msg, botao);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (nova.entrada.value !== repetir.entrada.value) return mensagem(msg, "As duas senhas novas não são iguais.");
    ocupado(botao, true, "Trocando…");
    const r = await pedir("senha", { metodo: "POST", corpo: { senhaAtual: atual.entrada.value, senhaNova: nova.entrada.value } });
    ocupado(botao, false);
    form.reset();
    mensagem(msg, r.status === 200 ? "Senha trocada!" : r.dados.erro, r.status === 200 ? "sucesso" : "erro");
  });
  casca(voltar(), form);
}

// ---------- avisos ----------
async function telaAvisos() {
  const r = await pedir("avisos");
  if (r.status !== 200) return telaFalhou("Avisos", r);
  const lista = r.dados.avisos || [];
  await casca(voltar(), h("h1", { text: "Avisos" }),
    h("div", { class: "cartao" }, lista.length ? h("ul", { class: "lista" }, lista.map((a) => h("li", { class: a.lido ? "aviso-item" : "aviso-item novo" },
      h("strong", { text: a.titulo }), h("div", { class: "miudo", text: quando(a.em) }), h("p", { class: "aviso-texto", text: a.texto }))))
      : h("p", { text: "Nenhum aviso." })));
  // Marca como lidos só os avisos que a tela mostrou: um que chegue entre a leitura e este pedido continua "novo"
  // (auditoria 2, item 40). O servidor aceita até 50 por vez; o resto fica para a próxima visita.
  const ids = lista.filter((a) => !a.lido && typeof a.id === "string").map((a) => a.id).slice(0, 50);
  if (ids.length) pedir("avisos", { metodo: "POST", corpo: { acao: "lidos", ids } });
}

// ---------- medidor (administradora) ----------
// Última leitura da vigia semanal (página de créditos da Netlify, pedido de 28/10).
const numBR = (v) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const cartaoNetlify = (n) => h("div", { class: "miudo" },
  h("p", { text: `Última leitura da Netlify (vigia semanal): ${quando(n.em)}` }),
  h("p", { text: `Usados no mês: ${numBR(n.usados)} · disponíveis: ${numBR(n.disponiveis)}` }),
  h("p", { text: `Visitas: ${numBR(n.visitas.creditos)} · fotos e vídeos: ${numBR(n.transferencia)} · publicações: ${n.publicacoes} (${numBR(n.creditosPublicacoes)} créditos)` }));
async function telaMedidor() {
  if (eu.papel !== "admin") return ir("");
  const r = await pedir("cota");
  if (r.status !== 200) return telaFalhou("Medidor de publicações", r);
  const c = r.dados;
  const msg = h("p", { class: "erro" });
  const leitura = campo("Créditos usados até hoje (tela Uso e faturamento da Netlify)", { type: "number", min: 0, step: 1, inputmode: "numeric" });
  const cota = campo("Cota de publicações por mês", { type: "number", min: 0, max: 200, step: 1, value: c.cota });
  const enviar = async (corpo, botao) => {
    ocupado(botao, true);
    const res = await pedir("cota", { metodo: "POST", corpo });
    ocupado(botao, false);
    if (res.status !== 200) return mensagem(msg, res.dados.erro);
    telaMedidor();
  };
  const bLeitura = h("button", { class: "botao", type: "button" }, "Anotar gasto real");
  bLeitura.addEventListener("click", () => enviar({ acao: "leitura", creditosUsados: Number(leitura.entrada.value) }, bLeitura));
  const bCota = h("button", { class: "botao claro", type: "button" }, "Salvar cota");
  bCota.addEventListener("click", () => enviar({ acao: "ajustar", cota: Number(cota.entrada.value) }, bCota));
  const bFora = h("button", { class: "botao claro", type: "button" }, "Contar publicação feita fora do painel");
  bFora.addEventListener("click", () => enviar({ acao: "publicacao-externa" }, bFora));
  await casca(voltar(), h("h1", { text: "Medidor de publicações" }),
    h("div", { class: "cartao" }, h("p", { text: c.texto }),
      c.leitura && h("p", { class: "miudo", text: `Última leitura: ${c.leitura.creditosUsados} créditos em ${quando(c.leitura.em)}` }),
      c.previstoSemPublicar !== null && c.previstoSemPublicar !== undefined && h("p", { class: "miudo", text: `Previsão do mês sem publicações: ${c.previstoSemPublicar} créditos` }),
      c.netlify && cartaoNetlify(c.netlify),
      leitura.el, bLeitura, h("hr"), cota.el, bCota, h("hr"), bFora, msg));
}

rotear();
