// Painel Brumar: telas ligadas às funções em /painel/api/*. Sem bibliotecas e sem HTML montado com texto
// (tudo com textContent), para nenhum texto digitado virar código. Pensado para celular.
"use strict";

const API = "/painel/api/";
const NOMES_PAPEL = { admin: "Administradora", responsavel: "Responsável", funcionaria: "Funcionária" };
const app = document.getElementById("app");
let eu = null;

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
  const dados = await r.json().catch(() => ({}));
  if (r.status === 401 && rota !== "entrar" && eu) { eu = null; telaEntrar(dados.erro); }
  return { status: r.status, dados };
}

const quando = (ms) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(ms);
const mostrar = (v) => {
  if (v === undefined || v === null) return "(vazio)";
  if (typeof v === "boolean") return v ? "Ligado" : "Desligado";
  if (Array.isArray(v) && v.every((x) => x && "termina" in x)) return `${v.length} campanha(s): ${v.map((x) => `${x.titulo} (até ${String(x.termina).slice(8, 10)}/${String(x.termina).slice(5, 7)}${x.ligada === false ? ", desligada" : ""})`).join(" · ")}`;
  if (Array.isArray(v)) return `${v.length} vídeo(s): ${v.map((x, i) => `${i + 1}. ${x.titulo || (x.arquivo || "").split("/").pop()}${x.visivel === false ? " (escondido)" : ""}`).join(" · ")}`;
  return String(v);
};
const ehResponsavel = () => eu && (eu.papel === "responsavel" || eu.papel === "admin");

function trocar(...filhos) { estrutura = null; app.replaceChildren(...filhos); window.scrollTo(0, 0); }
function mensagem(el, texto, tipo = "erro") { el.className = tipo; el.textContent = texto || ""; }
function ocupado(botao, sim, texto) {
  botao.disabled = sim;
  if (sim) { botao.dataset.texto = botao.textContent; botao.textContent = texto || "Aguarde…"; }
  else if (botao.dataset.texto) botao.textContent = botao.dataset.texto;
}
function campo(rotulo, props, ajuda) {
  const id = "c" + Math.random().toString(36).slice(2, 8);
  const entrada = h(props.tag || "input", { id, ...props, tag: undefined });
  return { el: h("div", { class: "campo" }, h("label", { for: id, text: rotulo }), entrada, ajuda && h("p", { class: "ajuda", text: ajuda })), entrada };
}

// ---------- estrutura do computador: menu à esquerda, telas no meio, prévia do site à direita ----------
// (pedido de 22/10, inspirado no vídeo de exemplo). No celular, só o meio aparece (CSS).
let estrutura = null;
const TELA_LARGA = "(min-width: 1100px)";
let modoPrevia = "celular";
try { modoPrevia = localStorage.getItem("painel-modo-previa") || "celular"; } catch { /* sem armazenamento */ }

function itemLateral(icone, titulo, rota, acao) {
  return h("button", { class: "lateral-item", type: "button", "data-rota": rota ?? "", title: titulo, onclick: acao || (() => ir(rota)) },
    h("span", { class: "lateral-icone", "aria-hidden": "true", text: icone }), h("span", { class: "lateral-texto", text: titulo }));
}

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

// Recarrega a prévia (depois de Salvar, Descartar ou Publicar).
function atualizarPrevia() {
  try { estrutura?.iframe?.contentWindow?.location.reload(); } catch { /* prévia ainda carregando */ }
}

function garantirEstrutura() {
  if (estrutura && app.contains(estrutura.raiz)) return estrutura;
  const recolhido = (() => { try { return localStorage.getItem("painel-menu-recolhido") === "1"; } catch { return false; } })();
  const gruposMenu = h("div", { class: "lateral-grupos" });
  const menu = h("aside", { class: `lateral${recolhido ? " recolhido" : ""}`, "aria-label": "Menu do painel" },
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
    itemLateral("✅", "Aprovações", "aprovacoes"),
    itemLateral("🕘", "Histórico", "historico"),
    itemLateral("🔔", "Avisos", "avisos"),
    ehResponsavel() && itemLateral("👥", "Acessos", "acessos"),
    eu.papel === "admin" && itemLateral("📊", "Medidor", "medidor"),
    eu.papel !== "admin" && itemLateral("🔑", "Minha senha", "senha"),
    h("div", { class: "lateral-fim" }, itemLateral("🚪", "Sair", null, sair)));
  const meio = h("div", { class: "meio" });
  const raiz = h("div", { class: "grade" }, menu, meio);
  estrutura = { raiz, menu, meio, iframe: null, moldura: null, botoesModo: [] };
  // A prévia só é montada em tela larga (no celular ela gastaria leituras à toa).
  if (window.matchMedia(TELA_LARGA).matches) {
    const iframe = h("iframe", { class: "previa-iframe", src: "previa/", title: "Prévia do site" });
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
  pedir("conteudo").then((r) => {
    if (r.status !== 200) return;
    gruposMenu.replaceChildren(...r.dados.grupos.map((g) => itemLateral("✏️", g.titulo, `conteudo/${g.id}`)));
    marcarAtivo();
  });
  return estrutura;
}

// ---------- casca (topo com medidor, avisos e rascunho) ----------
async function casca(...conteudo) {
  const medidor = h("div", { class: "medidor" });
  const sino = h("button", { class: "sino", type: "button", "aria-label": "Avisos", onclick: () => ir("avisos") }, "Avisos");
  const faixa = h("div");
  const topo = h("header", { class: "topo" },
    h("div", { class: "topo-linha" },
      h("img", { class: "topo-logo", src: "logo.png", alt: "Brumar Cosméticos" }),
      sino,
      h("div", { class: "quem" }, h("strong", { text: eu.nome }), NOMES_PAPEL[eu.papel])),
    medidor);
  const { meio } = garantirEstrutura();
  meio.replaceChildren(h("div", { class: "casca" }, topo, faixa, h("main", { class: "conteudo" }, ...conteudo)));
  window.scrollTo(0, 0);
  meio.scrollTo?.(0, 0);
  marcarAtivo();

  const [cota, avisos, rascunho] = await Promise.all([pedir("cota"), pedir("avisos"), pedir("rascunho")]);
  if (cota.status === 200) preencherMedidor(medidor, cota.dados);
  if (avisos.status === 200 && avisos.dados.naoLidos) sino.append(h("span", { class: "bolinha", text: avisos.dados.naoLidos }));
  if (rascunho.status === 200 && rascunho.dados.total) {
    const n = rascunho.dados.total;
    const acao = ehResponsavel() ? ["Publicar", () => ir("publicar")] : ["Enviar para aprovação", () => ir("enviar")];
    faixa.append(h("div", { class: "rascunho" },
      h("span", { text: `${n} ${n === 1 ? "mudança ainda não publicada" : "mudanças ainda não publicadas"}` }),
      h("div", { class: "botoes" },
        !estrutura?.iframe && h("a", { class: "botao claro", href: "previa/" }, "Ver como fica"),
        h("button", { class: "botao verde", type: "button", onclick: acao[1] }, acao[0]))));
  }
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

const voltar = () => h("button", { class: "voltar", type: "button", onclick: () => ir("") }, "‹ Voltar");

// ---------- navegação ----------
// Muda de tela pelo endereço (#acessos, #historico...). Se já estiver nele, o navegador não avisa: desenha direto.
function ir(rota) {
  const atual = location.hash.replace(/^#/, "");
  if (atual !== rota) location.hash = rota;
  else rotear();
}
window.addEventListener("hashchange", rotear);

async function rotear() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash.startsWith("convite/")) return telaConvite(hash.slice(8));
  if (!eu) {
    const r = await pedir("eu");
    if (r.status !== 200) return telaEntrar();
    eu = r.dados;
  }
  const telas = { publicar: telaPublicar, enviar: telaEnviar, aprovacoes: telaAprovacoes, historico: telaHistorico,
    acessos: telaAcessos, senha: telaSenha, avisos: telaAvisos, medidor: telaMedidor };
  if (hash === "conteudo") return telaConteudo();
  if (hash.startsWith("conteudo/")) return telaGrupo(hash.slice(9));
  return (telas[hash] || telaInicio)();
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
    eu = r.dados;
    ir("");
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
    h("p", { class: "sub", text: cadastro ? `Você vai entrar como ${NOMES_PAPEL[c.papel].toLowerCase()}. Este link funciona uma vez só.` : `Acesso de ${c.email}. Este link funciona uma vez só.` }),
    cadastro && nome.el, cadastro && email.el, senha.el, repetir.el, msg, botao);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (senha.entrada.value !== repetir.entrada.value) return mensagem(msg, "As duas senhas não são iguais.");
    ocupado(botao, true, "Salvando…");
    const corpo = { acao: "aceitar", codigo, senha: senha.entrada.value, ...(cadastro && { nome: nome.entrada.value, email: email.entrada.value }) };
    const res = await pedir("convite", { metodo: "POST", corpo });
    ocupado(botao, false);
    if (res.status !== 201) return mensagem(msg, res.dados.erro);
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
      itemMenu("✅", "Aprovações", responsavel ? "Mudanças das funcionárias" : "O que você enviou", "aprovacoes"),
      itemMenu("🕘", "Histórico", "O que foi publicado, por quem e quando", "historico"),
      responsavel && itemMenu("👥", "Acessos", "Convidar, desligar e criar nova senha", "acessos"),
      eu.papel === "admin" && itemMenu("📊", "Medidor de publicações", "Cota do mês e gasto real da Netlify", "medidor"),
      eu.papel !== "admin" && itemMenu("🔑", "Minha senha", "Trocar a sua senha", "senha"),
      h("button", { class: "menu-item", type: "button", onclick: sair },
        h("span", { class: "icone", "aria-hidden": "true", text: "🚪" }),
        h("span", {}, h("strong", { text: "Sair" }), h("small", { text: "Encerrar a entrada neste celular" })))));
}
// "Sair" só pelo botão (um link com #sair não desconecta ninguém). Apaga também os textos guardados neste aparelho,
// para a próxima pessoa no mesmo computador não ver o que foi digitado (auditoria 22/10, itens 10 e 11).
async function sair() {
  await pedir("sair", { metodo: "POST", corpo: {} });
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("painel-guardado:")) localStorage.removeItem(k);
  } catch { /* sem acesso ao armazenamento do aparelho */ }
  eu = null;
  history.replaceState(null, "", location.pathname);
  telaEntrar("Você saiu do painel.", "sucesso");
}

// ---------- conteúdo do site (telas montadas a partir do esquema) ----------
// Texto digitado e ainda não salvo fica guardado neste celular: se a entrada vencer, ele volta (item 4).
const chaveGuardada = (caminho) => `painel-guardado:${eu.email}:${caminho}`;
function guardar(caminho, valor) { try { localStorage.setItem(chaveGuardada(caminho), JSON.stringify(valor)); } catch { /* sem espaço ou bloqueado */ } }
function guardado(caminho) { try { const v = localStorage.getItem(chaveGuardada(caminho)); return v === null ? undefined : JSON.parse(v); } catch { return undefined; } }
function esquecer(caminho) { try { localStorage.removeItem(chaveGuardada(caminho)); } catch { /* nada */ } }

let conteudoCache = null;
async function carregarConteudo() {
  const r = await pedir("conteudo");
  conteudoCache = r.status === 200 ? r.dados : null;
  return r;
}

async function telaConteudo() {
  const r = await carregarConteudo();
  if (r.status !== 200) return casca(voltar(), h("div", { class: "cartao" }, h("p", { class: "erro", text: r.dados.erro })));
  const grupos = r.dados.grupos;
  if (!grupos.length) {
    return casca(voltar(), h("h1", { text: "Conteúdo do site" }),
      h("div", { class: "cartao" }, h("p", { text: "As telas de textos, fotos, produtos e link na bio chegam junto com o site novo." })));
  }
  await casca(voltar(), h("h1", { text: "Conteúdo do site" }),
    h("div", { class: "menu" }, grupos.map((g) => {
      const salvos = g.campos.filter((c) => c.rascunho).length;
      return itemMenu("✏️", g.titulo, salvos ? `${salvos} mudança(s) salva(s) · ${g.descricao}` : g.descricao, `conteudo/${g.id}`);
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

function entradaDeFoto(c, valor) {
  let atual = valor;
  const previa = h("img", { alt: "", class: "previa-foto" });
  const nota = h("p", { class: "ajuda", text: valor ? `No site: ${String(valor).split("/").pop()}` : "Ainda sem foto." });
  const escolher = h("input", { type: "file", accept: "image/*" });
  const erroFoto = h("p", { class: "erro" });
  if (typeof valor === "string" && valor.startsWith("foto:")) {
    previa.src = `${API}foto?id=${encodeURIComponent(valor.slice(5))}`;
    nota.textContent = "Foto nova salva, ainda não publicada.";
  }
  escolher.addEventListener("change", async () => {
    const arquivo = escolher.files[0];
    if (!arquivo) return;
    mensagem(erroFoto, "");
    nota.textContent = "Diminuindo e enviando a foto…";
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
    } catch (e) {
      nota.textContent = "";
      mensagem(erroFoto, e.paraPessoa ? e.message : "Não foi possível usar esta foto. Tente outra.");
    }
  });
  return { el: h("div", {}, previa, nota, escolher, erroFoto), ler: () => atual, foco: escolher };
}

// Vídeos: a lista inteira é o valor do campo. O celular confere (MP4, até 20 MB), tira a capa de um quadro do
// próprio vídeo e envia em partes de até 4 MB. Acima de 8 MB, o robô diminui ao publicar.
const VIDEO_MAX = 20 * 1024 * 1024;
const VIDEO_PESADO = 8 * 1024 * 1024;

async function capaDoVideo(arquivo) {
  const url = URL.createObjectURL(arquivo);
  try {
    const v = h("video", { muted: true, playsinline: true, preload: "auto" });
    v.src = url;
    await new Promise((ok, falhou) => { v.onloadeddata = ok; v.onerror = falhou; });
    v.currentTime = Math.min(1, (v.duration || 2) / 2);
    await new Promise((ok) => { v.onseeked = ok; });
    const escala = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
    const tela = h("canvas");
    tela.width = Math.round(v.videoWidth * escala);
    tela.height = Math.round(v.videoHeight * escala);
    tela.getContext("2d").drawImage(v, 0, 0, tela.width, tela.height);
    return await new Promise((ok) => tela.toBlob(ok, "image/jpeg", 0.8));
  } finally {
    URL.revokeObjectURL(url);
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

const enderecoDaCapa = (capa) => (capa.startsWith("foto:") ? `${API}foto?id=${encodeURIComponent(capa.slice(5))}` : capa);

function entradaDeVideos(c, valor) {
  let lista = Array.isArray(valor) ? valor.map((v) => ({ ...v })) : [];
  const caixa = h("div");
  const nota = h("p", { class: "ajuda" });
  const erroVideo = h("p", { class: "erro" });
  const desenhar = () => {
    caixa.replaceChildren(...lista.map((v, i) => {
      const titulo = h("input", { type: "text", maxlength: 80, placeholder: "Título (opcional)" });
      titulo.value = v.titulo || "";
      titulo.addEventListener("input", () => { v.titulo = titulo.value; });
      const visivel = h("input", { type: "checkbox", checked: v.visivel });
      visivel.addEventListener("change", () => { v.visivel = visivel.checked; });
      const mover = (passo) => { const j = i + passo; if (j < 0 || j >= lista.length) return; [lista[i], lista[j]] = [lista[j], lista[i]]; desenhar(); };
      return h("div", { class: "video-item" },
        v.capa ? h("img", { class: "previa-foto", alt: "", src: enderecoDaCapa(v.capa) }) : h("div", { class: "miudo", text: "Sem capa" }),
        h("div", { class: "miudo", text: v.arquivo.startsWith("video:") ? "Vídeo novo (vai ao site ao publicar)" : v.arquivo.split("/").pop() }),
        titulo,
        h("label", { class: "escolha" }, visivel, h("span", { text: "Aparece no site" })),
        h("div", { class: "botoes" },
          h("button", { class: "botao claro", type: "button", disabled: i === 0, onclick: () => mover(-1) }, "↑ Subir"),
          h("button", { class: "botao claro", type: "button", disabled: i === lista.length - 1, onclick: () => mover(1) }, "↓ Descer"),
          h("button", { class: "botao perigo", type: "button", onclick: () => { lista.splice(i, 1); desenhar(); } }, "Tirar")));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhum vídeo. No site aparece \"Em breve\"." }));
  };
  const escolher = h("input", { type: "file", accept: "video/mp4" });
  escolher.addEventListener("change", async () => {
    const arquivo = escolher.files[0];
    escolher.value = "";
    if (!arquivo) return;
    mensagem(erroVideo, "");
    if (arquivo.type && arquivo.type !== "video/mp4") return mensagem(erroVideo, "Use vídeo MP4. No iPhone: Ajustes > Câmera > Formatos > Mais Compatível.");
    if (arquivo.size > VIDEO_MAX) return mensagem(erroVideo, "Vídeo acima de 20 MB. Corte ou diminua o vídeo no celular e tente de novo.");
    escolher.disabled = true;
    try {
      nota.textContent = "Tirando a capa do vídeo…";
      let capa = "";
      try {
        const imagem = await capaDoVideo(arquivo);
        if (imagem) capa = (await enviarBinario("foto", imagem, imagem.type)).valor;
      } catch { /* sem capa: o vídeo continua valendo */ }
      const enviado = await enviarVideo(arquivo, (p) => { nota.textContent = `Enviando o vídeo… ${p}%`; });
      lista.push({ arquivo: enviado.valor, capa, titulo: "", visivel: true });
      desenhar();
      const mb = enviado.megas.toLocaleString("pt-BR");
      nota.textContent = enviado.pesado
        ? `Vídeo pesado (${mb} MB): ao publicar, o robô diminui para até 8 MB. Toque em Salvar.`
        : `Vídeo pronto (${mb} MB). Toque em Salvar.`;
    } catch (e) {
      nota.textContent = "";
      mensagem(erroVideo, e.paraPessoa ? e.message : "Não foi possível usar este vídeo. Tente outro.");
    } finally {
      escolher.disabled = false;
    }
  });
  desenhar();
  const ler = () => lista.map(({ arquivo, capa, titulo, visivel }) => ({ arquivo, capa: capa || "", titulo: (titulo || "").trim(), visivel: visivel === true }));
  return {
    el: h("div", {}, caixa, h("p", { class: "rotulo", text: "+ Adicionar vídeo (MP4, até 20 MB)" }), escolher, nota, erroVideo,
      h("p", { class: "ajuda", text: "Cada vez que uma cliente dá play, a Netlify gasta créditos pelo tamanho do vídeo (um vídeo de 8 MB gasta uns 0,16 crédito)." })),
    ler, foco: escolher, lista: true,
  };
}

// Campanhas: várias ao mesmo tempo (pedido de 22/10). A lista inteira é o valor do campo.
function entradaDeCampanhas(c, valor) {
  const lista = Array.isArray(valor) ? valor.map((x) => ({ ...x })) : [];
  const max = c.max || 6;
  const caixa = h("div");
  const erroLista = h("p", { class: "erro" });
  const etiquetaDe = (x) => {
    const fim = x.termina ? new Date(`${x.termina}:00-03:00`) : null;
    if (!fim) return ["Falta a data", "laranja"];
    if (fim < new Date()) return ["Terminou", "cinza"];
    if (x.ligada === false) return ["Desligada", "cinza"];
    return [`No ar até ${x.termina.slice(8, 10)}/${x.termina.slice(5, 7)} às ${x.termina.slice(11, 13)}h${x.termina.slice(14, 16)}`, "verde"];
  };
  const desenhar = () => {
    caixa.replaceChildren(...lista.map((x, i) => {
      const [rotulo, cor] = etiquetaDe(x);
      const texto = (nome, chave, maxLetras) => {
        const e = h("input", { type: "text", maxlength: maxLetras });
        e.value = x[chave] || "";
        e.addEventListener("input", () => { x[chave] = e.value; });
        return h("div", { class: "campo" }, h("span", { class: "rotulo", text: nome }), e);
      };
      const fim = h("input", { type: "datetime-local" });
      fim.value = x.termina || "";
      fim.addEventListener("change", () => { x.termina = fim.value; desenhar(); });
      const ligada = h("input", { type: "checkbox", checked: x.ligada !== false });
      ligada.addEventListener("change", () => { x.ligada = ligada.checked; desenhar(); });
      return h("div", { class: "video-item" },
        h("div", { class: "botoes" }, h("strong", { text: x.titulo || "Campanha nova" }), h("span", { class: `etiqueta ${cor}`, text: rotulo })),
        texto("Título", "titulo", 40), texto("Texto (ex.: até 30% OFF com cupom)", "texto", 60), texto("Texto do botão", "botao", 30),
        h("div", { class: "campo" }, h("span", { class: "rotulo", text: "Termina em (horário de Brasília) · obrigatório" }), fim,
          h("p", { class: "ajuda", text: "A contagem regressiva some sozinha nessa hora." })),
        h("label", { class: "escolha" }, ligada, h("span", { text: "Ligada no site" })),
        h("div", { class: "botoes" },
          h("button", { class: "botao claro", type: "button", disabled: i === 0, onclick: () => { [lista[i - 1], lista[i]] = [lista[i], lista[i - 1]]; desenhar(); } }, "↑ Subir"),
          h("button", { class: "botao perigo", type: "button", onclick: () => { if (confirm(`Tirar a campanha "${x.titulo || "nova"}"?`)) { lista.splice(i, 1); desenhar(); } } }, "Tirar")));
    }));
    if (!lista.length) caixa.append(h("p", { class: "miudo", text: "Nenhuma campanha. Toque em \"+ Adicionar campanha\"." }));
  };
  const adicionar = h("button", { class: "botao claro cheio", type: "button" }, "+ Adicionar campanha");
  adicionar.addEventListener("click", () => {
    mensagem(erroLista, "");
    if (lista.length >= max) return mensagem(erroLista, `No máximo ${max} campanhas ao mesmo tempo.`);
    lista.push({ titulo: "", texto: "", botao: "", termina: "", ligada: true });
    desenhar();
  });
  desenhar();
  const ler = () => lista.map(({ titulo, texto, botao, termina, ligada }) => ({ titulo: (titulo || "").trim(), texto: (texto || "").trim(), botao: (botao || "").trim(), termina: termina || "", ligada: ligada !== false }));
  return { el: h("div", {}, caixa, adicionar, erroLista,
    h("p", { class: "ajuda", text: "Só anuncie desconto que já existe na Yampi, com a mesma data de término." })), ler, foco: adicionar, lista: true };
}

function entradaDoCampo(c, valor) {
  if (c.tipo === "campanhas") return entradaDeCampanhas(c, valor);
  if (c.tipo === "foto") return entradaDeFoto(c, valor);
  if (c.tipo === "videos") return entradaDeVideos(c, valor);
  if (c.tipo === "ligado") {
    const caixa = h("input", { type: "checkbox", checked: valor === true });
    const texto = h("span", { text: valor === true ? "Ligado" : "Desligado" });
    caixa.addEventListener("change", () => { texto.textContent = caixa.checked ? "Ligado" : "Desligado"; });
    return { el: h("label", { class: "escolha" }, caixa, texto), ler: () => caixa.checked, foco: caixa };
  }
  if (c.tipo === "escolha") {
    const sel = h("select", {}, c.opcoes.map((o) => h("option", { value: o, selected: o === valor, text: (c.rotulos && c.rotulos[o]) || o })));
    return { el: sel, ler: () => sel.value, foco: sel };
  }
  const props = c.tipo === "data" ? { type: "datetime-local" } : c.tipo === "link" ? { type: "url", inputmode: "url" } : {};
  const grande = c.tipo === "texto" && c.max > 100;
  const entrada = h(grande ? "textarea" : "input", { ...(grande ? {} : { type: "text", ...props }), maxlength: c.max });
  entrada.value = valor === undefined || valor === null ? "" : String(valor);
  return { el: entrada, ler: () => entrada.value, foco: entrada, texto: true };
}

async function telaGrupo(id) {
  const r = conteudoCache ? { status: 200, dados: conteudoCache } : await carregarConteudo();
  conteudoCache = null; // da próxima vez, lê de novo
  const grupo = r.status === 200 && r.dados.grupos.find((g) => g.id === id);
  if (!grupo) return ir("conteudo");
  const msg = h("p", { class: "erro" });
  const campos = grupo.campos.map((c) => {
    const valorAtual = c.rascunho ? c.rascunho.valor : c.noSite;
    const entrada = entradaDoCampo(c, valorAtual);
    const erroCampo = h("p", { class: "erro" });
    const notas = h("div");
    const contador = entrada.texto && c.max && h("p", { class: "ajuda" });
    const atualizarContador = () => { if (contador) contador.textContent = `${entrada.ler().length} de ${c.max} letras`; };

    const recuperado = entrada.texto ? guardado(c.caminho) : undefined;
    if (recuperado !== undefined && recuperado !== entrada.ler() && recuperado !== String(valorAtual ?? "")) {
      entrada.foco.value = recuperado;
      notas.append(h("p", { class: "sucesso", text: "Recuperamos o que você tinha digitado e não salvou." }));
    }
    if (entrada.texto) entrada.foco.addEventListener("input", () => { guardar(c.caminho, entrada.ler()); atualizarContador(); });
    atualizarContador();

    if (c.rascunho) {
      const descartar = h("button", { class: "botao claro", type: "button" }, "Voltar ao que está no site");
      descartar.addEventListener("click", async () => {
        ocupado(descartar, true);
        const res = await pedir("rascunho", { metodo: "DELETE", corpo: { caminhos: [c.caminho] } });
        if (res.status !== 200) { ocupado(descartar, false); return mensagem(erroCampo, res.dados.erro); }
        esquecer(c.caminho);
        telaGrupo(id);
        atualizarPrevia();
      });
      notas.append(h("p", { class: "miudo", text: `Salvo por ${c.rascunho.por} em ${quando(c.rascunho.em)}, ainda não publicado. No site: ${mostrar(c.noSite)}` }), descartar);
    }
    const bloco = h("div", { class: "campo" }, h("span", { class: "rotulo", text: c.nome }), entrada.el, contador, c.ajuda && h("p", { class: "ajuda", text: c.ajuda }), notas, erroCampo);
    return { c, entrada, valorAtual, erroCampo, bloco };
  });

  const salvar = h("button", { class: "botao cheio", type: "button" }, "Salvar");
  salvar.addEventListener("click", async () => {
    for (const x of campos) mensagem(x.erroCampo, "");
    const mudancas = campos.filter((x) => {
      const novo = x.entrada.ler();
      if (x.entrada.lista) return JSON.stringify(novo) !== JSON.stringify(x.valorAtual ?? []);
      return x.c.tipo === "ligado" ? novo !== (x.valorAtual === true) : novo !== String(x.valorAtual ?? "");
    }).map((x) => ({ caminho: x.c.caminho, valor: x.entrada.ler(), antes: x.c.noSite }));
    if (!mudancas.length) return mensagem(msg, "Nada mudou nesta tela.", "ajuda");
    ocupado(salvar, true, "Salvando…");
    const res = await pedir("rascunho", { metodo: "POST", corpo: { mudancas } });
    ocupado(salvar, false);
    if (res.status !== 200) {
      for (const e of res.dados.campos || []) {
        const x = campos.find((y) => y.c.caminho === e.caminho);
        if (x) mensagem(x.erroCampo, e.erro);
      }
      return mensagem(msg, res.dados.erro);
    }
    for (const m of mudancas) esquecer(m.caminho);
    await telaGrupo(id);
    atualizarPrevia();
  });

  await casca(h("button", { class: "voltar", type: "button", onclick: () => ir("conteudo") }, "‹ Conteúdo do site"),
    h("h1", { text: grupo.titulo }), grupo.descricao && h("p", { class: "sub", text: grupo.descricao }),
    h("div", { class: "cartao" }, campos.map((x) => x.bloco), msg, salvar,
      h("p", { class: "ajuda", text: "Salvar não publica nem gasta crédito. Para ir ao site, use Publicar (ou Enviar para aprovação)." })));
}

// ---------- conflitos (mesmo campo mudado por fora) ----------
function telaConflitos(conflitos, explicacao, aoEscolher) {
  const escolhas = {};
  const blocos = conflitos.map((c) => {
    const nomeGrupo = "g" + Math.random().toString(36).slice(2, 8);
    const opcao = (valor, titulo, texto) => {
      const radio = h("input", { type: "radio", name: nomeGrupo, value: valor, onchange: () => { escolhas[c.caminho] = valor; } });
      return h("label", { class: "escolha" }, radio, h("span", {}, h("b", { text: titulo }), h("br"), mostrar(texto)));
    };
    return h("div", { class: "cartao" }, h("h3", { text: c.nome }),
      opcao("painel", "Ficar com a versão do painel", c.noPainel), opcao("site", "Manter a que está no site", c.noSite));
  });
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", onclick: async () => {
    if (Object.keys(escolhas).length < conflitos.length) return mensagem(msg, "Escolha uma versão em cada campo.");
    ocupado(botao, true, "Publicando…");
    await aoEscolher(escolhas, msg);
    ocupado(botao, false);
  } }, "Continuar");
  casca(voltar(), h("h1", { text: "Escolha qual versão fica" }), h("p", { class: "sub", text: explicacao }), ...blocos, msg, botao);
}

function resultadoPublicacao(r, msg, repetir) {
  if (r.status === 200) atualizarPrevia();
  if (r.status === 409 && r.dados.conflitos) return telaConflitos(r.dados.conflitos, r.dados.erro, repetir);
  if (r.status !== 200) return mensagem(msg, r.dados.erro);
  const d = r.dados;
  casca(h("div", { class: "cartao" },
    h("h1", { text: d.nada ? "Nada para mudar" : "Publicado!" }),
    h("p", { text: d.nada ? d.aviso : `O site vai mostrar as mudanças em alguns minutos: ${d.mudancas.join(", ")}.` }),
    h("button", { class: "botao", type: "button", onclick: () => ir("") }, "Voltar ao início")));
}

// ---------- publicar ----------
async function telaPublicar() {
  if (!ehResponsavel()) return ir("enviar");
  const r = await pedir("publicar");
  const lista = r.dados.mudancas || [];
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", disabled: !lista.length }, "Publicar no site");
  const publicar = async (escolhas) => {
    const res = await pedir("publicar", { metodo: "POST", corpo: { confirmar: true, escolhas } });
    resultadoPublicacao(res, msg, (novas) => publicar({ ...escolhas, ...novas }));
  };
  botao.addEventListener("click", async () => {
    if (!confirm(`Publicar ${lista.length} mudança(s) no site? Conta 1 publicação do mês.`)) return;
    ocupado(botao, true, "Publicando…");
    await publicar({});
    ocupado(botao, false);
  });
  await casca(voltar(), h("h1", { text: "Publicar no site" }),
    h("div", { class: "cartao" },
      lista.length ? h("ul", { class: "lista" }, lista.map((m) => h("li", {}, h("strong", { text: m.nome }), h("div", { class: "miudo", text: `Salvo por ${m.por} em ${quando(m.em)}` }))))
        : h("p", { text: "Não há mudanças salvas para publicar." }),
      msg, botao));
}

// ---------- enviar para aprovação (funcionária) ----------
async function telaEnviar() {
  const r = await pedir("rascunho");
  const total = r.dados.total || 0;
  const msg = h("p", { class: "erro" });
  const botao = h("button", { class: "botao verde cheio", type: "button", disabled: !total }, "Enviar para aprovação");
  botao.addEventListener("click", async () => {
    ocupado(botao, true, "Enviando…");
    const res = await pedir("enviar", { metodo: "POST", corpo: {} });
    ocupado(botao, false);
    if (res.status !== 201) return mensagem(msg, res.dados.erro);
    casca(h("div", { class: "cartao" }, h("h1", { text: "Enviado!" }),
      h("p", { text: "A Bruna e o CEO foram avisados. Você vê a resposta em Aprovações." }),
      h("button", { class: "botao", type: "button", onclick: () => ir("") }, "Voltar ao início")));
  });
  await casca(voltar(), h("h1", { text: "Enviar para aprovação" }),
    h("div", { class: "cartao" }, h("p", { text: total ? `Você tem ${total} mudança(s) salvas.` : "Você não tem mudanças salvas." }), msg, botao));
}

// ---------- aprovações ----------
async function telaAprovacoes() {
  const r = await pedir("aprovacoes");
  const envios = r.dados.envios || [];
  const ETIQUETA = { pendente: ["Esperando", "laranja"], aprovado: ["Aprovado", "verde"], devolvido: ["Devolvido", ""], descartado: ["Descartado", "cinza"], aprovando: ["Publicando", "laranja"] };
  const cartoes = envios.map((e) => {
    const msg = h("p", { class: "erro" });
    const acoes = h("div", { class: "botoes" });
    if (e.status === "pendente" && ehResponsavel()) {
      const decidir = async (corpo, botao) => {
        ocupado(botao, true);
        const res = await pedir("aprovacoes", { metodo: "POST", corpo: { id: e.id, ...corpo } });
        ocupado(botao, false);
        if (corpo.acao === "aprovar") return resultadoPublicacao(res, msg, (escolhas) => decidir({ ...corpo, escolhas }, botao));
        if (res.status !== 200) return mensagem(msg, res.dados.erro);
        telaAprovacoes();
      };
      const aprovar = h("button", { class: "botao verde", type: "button" }, "Aprovar e publicar");
      aprovar.addEventListener("click", () => confirm("Aprovar e publicar no site? Conta 1 publicação do mês.") && decidir({ acao: "aprovar" }, aprovar));
      const devolver = h("button", { class: "botao claro", type: "button" }, "Devolver com recado");
      devolver.addEventListener("click", () => {
        const recado = prompt("Recado para a funcionária (o que precisa mudar):");
        if (recado) decidir({ acao: "devolver", recado }, devolver);
      });
      const descartar = h("button", { class: "botao perigo", type: "button" }, "Descartar");
      descartar.addEventListener("click", () => confirm("Descartar estas mudanças? Elas não vão para o site.") && decidir({ acao: "descartar" }, descartar));
      acoes.append(aprovar, devolver, descartar);
    }
    const [rotulo, cor] = ETIQUETA[e.status] || [e.status, ""];
    return h("div", { class: "cartao" },
      h("div", { class: "botoes" }, h("span", { class: `etiqueta ${cor}`, text: rotulo }), h("span", { class: "miudo", text: `${e.de} · ${quando(e.criado)}` })),
      e.decisao && h("p", { class: "miudo", text: e.decisao }),
      e.recado && h("p", {}, h("b", { text: "Recado: " }), e.recado),
      h("ul", { class: "lista" }, e.mudancas.map((m) => h("li", {}, h("strong", { text: m.nome }),
        h("div", { class: "antes-depois" }, h("div", {}, h("b", { text: "Antes" }), mostrar(m.antes)), h("div", {}, h("b", { text: "Depois" }), mostrar(m.depois)))))),
      msg, acoes);
  });
  await casca(voltar(), h("h1", { text: "Aprovações" }), cartoes.length ? cartoes : h("div", { class: "cartao" }, h("p", { text: "Nenhum envio por enquanto." })));
}

// ---------- histórico ----------
async function telaHistorico() {
  const r = await pedir("historico");
  const lista = r.dados.publicacoes || [];
  const cartoes = lista.map((p) => {
    const msg = h("p", { class: "erro" });
    const desfazer = ehResponsavel() && h("button", { class: "botao claro", type: "button" }, "Desfazer esta publicação");
    if (desfazer) {
      const pedirDesfazer = async (escolhas) => {
        const res = await pedir("desfazer", { metodo: "POST", corpo: { id: p.id, escolhas } });
        resultadoPublicacao(res, msg, (novas) => pedirDesfazer({ ...escolhas, ...novas }));
      };
      desfazer.addEventListener("click", async () => {
        if (!confirm("Voltar estes campos para como estavam antes? Conta 1 publicação do mês.")) return;
        ocupado(desfazer, true, "Desfazendo…");
        await pedirDesfazer({});
        ocupado(desfazer, false);
      });
    }
    return h("div", { class: "cartao" },
      h("div", { class: "botoes" }, h("span", { class: `etiqueta ${p.tipo === "desfazer" ? "cinza" : "verde"}`, text: p.tipo === "desfazer" ? "Desfeita" : "Publicada" }),
        h("span", { class: "miudo", text: `${p.quem} · ${quando(p.quando)}` })),
      h("ul", { class: "lista" }, p.mudancas.map((m) => h("li", {}, h("strong", { text: m.nome }),
        h("div", { class: "antes-depois" }, h("div", {}, h("b", { text: "Antes" }), mostrar(m.antes)), h("div", {}, h("b", { text: "Depois" }), mostrar(m.depois)))))),
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

function telaConvidar() {
  const papeis = eu.papel === "admin" ? [["responsavel", "Responsável (Bruna, CEO): publica direto e aprova"], ["funcionaria", "Funcionária: salva e envia para aprovação"]]
    : [["funcionaria", "Funcionária: salva e envia para aprovação"]];
  let papel = papeis[0][0];
  const opcoes = papeis.map(([valor, texto], i) => h("label", { class: "escolha" },
    h("input", { type: "radio", name: "papel", value: valor, checked: i === 0, onchange: () => { papel = valor; } }), h("span", { text: texto })));
  formReconfirmar("Convidar pessoa", "Gere um link e mande para a pessoa. Ela mesma digita o e-mail e cria a senha.",
    [h("p", { class: "rotulo", text: "Papel da pessoa" }), ...opcoes],
    async (email, senha) => {
      const r = await pedir("convites", { metodo: "POST", corpo: { tipo: "cadastro", papel, email, senha } });
      if (r.status !== 201) return r.dados.erro;
      mostrarLink("Convite pronto", r.dados.link, "Aqui está o seu acesso ao painel do site da Brumar. Toque no link, digite seu nome, seu e-mail e crie uma senha (mínimo 10 letras ou números). O link funciona uma vez só e vale por 48 horas.");
    });
}

function telaNovaSenha(pessoa) {
  formReconfirmar(`Nova senha para ${pessoa.nome}`, "Gere um link para a pessoa criar uma senha nova. As entradas antigas dela deixam de valer.", [],
    async (email, senha) => {
      const r = await pedir("convites", { metodo: "POST", corpo: { tipo: "nova-senha", para: pessoa.email, email, senha } });
      if (r.status !== 201) return r.dados.erro;
      mostrarLink(`Link de nova senha para ${pessoa.nome}`, r.dados.link, "Aqui está o link para criar uma senha nova no painel da Brumar. Ele funciona uma vez só e vale por 48 horas.");
    });
}

async function telaAcessos() {
  if (!ehResponsavel()) return ir("");
  const [pessoas, convites] = await Promise.all([pedir("acessos"), pedir("convites")]);
  const msg = h("p", { class: "erro" });
  const linhas = (pessoas.dados.pessoas || []).map((p) => {
    const acoes = h("div", { class: "botoes" });
    if (p.podeMexer) {
      const ligar = h("button", { class: p.ativo ? "botao perigo" : "botao claro", type: "button" }, p.ativo ? "Desligar acesso" : "Religar acesso");
      ligar.addEventListener("click", async () => {
        if (p.ativo && !confirm(`Desligar o acesso de ${p.nome}? Ela sai do painel na hora.`)) return;
        ocupado(ligar, true);
        const r = await pedir("acessos", { metodo: "POST", corpo: { email: p.email, acao: p.ativo ? "desligar" : "religar" } });
        if (r.status !== 200) { ocupado(ligar, false); return mensagem(msg, r.dados.erro); }
        telaAcessos();
      });
      acoes.append(ligar);
      if (p.ativo) acoes.append(h("button", { class: "botao claro", type: "button", onclick: () => telaNovaSenha(p) }, "Nova senha"));
      if (eu.papel === "admin" && !p.ativo) {
        const apagar = h("button", { class: "botao perigo", type: "button" }, "Apagar dados");
        apagar.addEventListener("click", async () => {
          if (!confirm(`Apagar de vez os dados de ${p.nome}? Não dá para desfazer.`)) return;
          ocupado(apagar, true);
          const r = await pedir("acessos", { metodo: "POST", corpo: { email: p.email, acao: "apagar" } });
          if (r.status !== 200) { ocupado(apagar, false); return mensagem(msg, r.dados.erro); }
          telaAcessos();
        });
        acoes.append(apagar);
      }
      if (eu.papel === "admin") {
        const destravar = h("button", { class: "botao claro", type: "button" }, "Destravar");
        destravar.addEventListener("click", async () => {
          ocupado(destravar, true);
          const r = await pedir("acessos", { metodo: "POST", corpo: { email: p.email, acao: "destravar" } });
          ocupado(destravar, false);
          mensagem(msg, r.status === 200 ? `${p.nome} pode tentar entrar de novo.` : r.dados.erro, r.status === 200 ? "sucesso" : "erro");
        });
        acoes.append(destravar);
      }
    }
    return h("li", {}, h("strong", { text: p.nome }), " ", h("span", { class: `etiqueta ${p.ativo ? "" : "cinza"}`, text: p.ativo ? NOMES_PAPEL[p.papel] : "Desligado" }),
      h("div", { class: "miudo", text: p.email }), acoes);
  });
  const abertos = (convites.dados.convites || []).map((c) => {
    const cancelar = h("button", { class: "botao perigo", type: "button" }, "Cancelar");
    cancelar.addEventListener("click", async () => {
      ocupado(cancelar, true);
      await pedir("convites", { metodo: "DELETE", corpo: { id: c.id } });
      telaAcessos();
    });
    return h("li", {}, h("strong", { text: c.tipo === "cadastro" ? `Convite de ${NOMES_PAPEL[c.papel].toLowerCase()}` : `Nova senha de ${c.email}` }),
      h("div", { class: "miudo", text: `Criado por ${c.criadoPor} · vence ${quando(c.expira)}` }), h("div", { class: "botoes" }, cancelar));
  });
  await casca(voltar(), h("h1", { text: "Acessos" }),
    h("button", { class: "botao verde cheio", type: "button", onclick: telaConvidar }, "+ Convidar pessoa"),
    h("div", { class: "cartao" }, h("h2", { text: "Quem tem acesso" }), msg, linhas.length ? h("ul", { class: "lista" }, linhas) : h("p", { text: "Ninguém ainda." })),
    abertos.length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Convites ainda não usados" }), h("ul", { class: "lista" }, abertos)),
    (pessoas.dados.registro || []).length > 0 && h("div", { class: "cartao" }, h("h2", { text: "Últimas mudanças de acesso" }),
      h("ul", { class: "lista" }, pessoas.dados.registro.map((r) => h("li", {},
        h("span", { text: `${r.quem} ${r.acao}` }), r.alvo && h("span", { class: "miudo", text: ` · ${r.alvo}` }),
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
  const lista = r.dados.avisos || [];
  await casca(voltar(), h("h1", { text: "Avisos" }),
    h("div", { class: "cartao" }, lista.length ? h("ul", { class: "lista" }, lista.map((a) => h("li", { class: a.lido ? "aviso-item" : "aviso-item novo" },
      h("strong", { text: a.titulo }), h("div", { class: "miudo", text: quando(a.em) }), h("p", { text: a.texto }))))
      : h("p", { text: "Nenhum aviso." })));
  if (lista.some((a) => !a.lido)) pedir("avisos", { metodo: "POST", corpo: { acao: "lidos" } });
}

// ---------- medidor (administradora) ----------
async function telaMedidor() {
  if (eu.papel !== "admin") return ir("");
  const r = await pedir("cota");
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
      leitura.el, bLeitura, h("hr"), cota.el, bCota, h("hr"), bFora, msg));
}

rotear();
