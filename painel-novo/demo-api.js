// DEMONSTRAÇÃO do painel (link para mostrar à Bruna): troca o servidor por um "servidor de mentira" dentro do
// navegador. Tudo fica só neste aparelho (localStorage); nada vai para o site. Os dados de exemplo vêm de
// demo-dados.js (gerado por ferramentas/montar-demo.py a partir de exemplo/). Não vai para o painel de verdade.
"use strict";
(function () {
  const CHAVE = "painel-brumar-demo-v1";
  const base = window.DEMO_DADOS;
  const ESQUEMA = base.esquema;
  const copia = (x) => JSON.parse(JSON.stringify(x));
  // Só os arquivos que o painel muda (os do esquema) ficam guardados no aparelho. Os outros (marca.json,
  // avaliacoes.json de ~400 KB, inicial.json...) vêm sempre de demo-dados.js: a prévia recebe TODOS os dados, como
  // no servidor (/painel/api/previa), sem encher o armazenamento. Também completa o que foi guardado antes (26/10).
  const EDITAVEIS = new Set(Object.keys(ESQUEMA.campos).map((c) => c.split(".")[0]));
  const comTodos = (site) => {
    const s = site && typeof site === "object" && !Array.isArray(site) ? site : {};
    for (const [k, v] of Object.entries(base.dados)) if (!Object.hasOwn(s, k) || !EDITAVEIS.has(k)) s[k] = copia(v);
    return s;
  };
  const novo = () => ({ site: copia(base.dados), rascunho: {}, historico: [], usadas: 0 });
  let E;
  try { E = JSON.parse(localStorage.getItem(CHAVE)) || novo(); } catch { E = novo(); }
  E.site = comTodos(E.site);
  const guardar = () => {
    const site = Object.fromEntries(Object.entries(E.site).filter(([k]) => EDITAVEIS.has(k)));
    try { localStorage.setItem(CHAVE, JSON.stringify({ ...E, site })); } catch { /* sem espaço */ }
  };
  window.recomecarDemo = () => { E = novo(); guardar(); location.hash = ""; location.reload(); };

  const EU = { nome: "Bruna", email: "bruna@exemplo.com", papel: "responsavel" };
  const ok = (dados, status = 200) => new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json" } });
  const falha = (erro, status = 400) => ok({ erro }, status);
  const agora = () => Date.now();

  // ---- esquema (mesmas ideias do servidor: campos com "*" viram um por item) ----
  const modeloDe = (caminho) => {
    if (ESQUEMA.campos[caminho]) return caminho;
    const p = caminho.split(".");
    return Object.keys(ESQUEMA.campos).find((m) => { const x = m.split("."); return x.length === p.length && x.every((y, i) => y === "*" || y === p[i]); });
  };
  const ler = (obj, partes) => partes.reduce((a, k) => (a && typeof a === "object" && Object.hasOwn(a, k) ? a[k] : undefined), obj);
  // Com o nome do item, como o servidor (lib/esquema.mjs, nomeDe com os dados): "Para quem é · Gloss Brumar Matizado".
  const nomeDe = (caminho) => {
    const m = modeloDe(caminho); if (!m) return caminho;
    const r = ESQUEMA.campos[m]; if (m === caminho) return r.nome || caminho;
    const p = caminho.split(".");
    return `${r.nome} · ${m.split(".").flatMap((x, i) => (x === "*" ? [nomeDoItem(r, p[i], ler(E.site[p[0]], p.slice(1, i + 1)))] : [])).join(" · ")}`;
  };
  const gravar = (obj, partes, v) => {
    let a = obj;
    for (const k of partes.slice(0, -1)) { if (!a || typeof a !== "object" || !Object.hasOwn(a, k)) return false; a = a[k]; }
    a[partes.at(-1)] = v; return true;
  };
  const arq = (c) => c.split(".")[0];
  const lugar = (c) => c.split(".").slice(1);

  function validar(caminho, valor) {
    const m = modeloDe(caminho); if (!m) return "Este campo não pode ser mudado pelo painel.";
    const r = ESQUEMA.campos[m]; const n = r.nome || caminho;
    // Sem acento e sem maiúscula dos dois lados, como o servidor.
    const semAcento = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const proibida = (t) => (r.proibidas || []).find((p) => semAcento(t).includes(semAcento(p)));
    if (r.tipo === "texto") {
      if (typeof valor !== "string") return `${n}: precisa ser um texto.`;
      if (/[<>]/.test(valor)) return `${n}: não use os sinais < e >.`;
      if (valor.trim().length > r.max) return `${n}: no máximo ${r.max} letras.`;
      if (proibida(valor)) return `${n}: a palavra "${proibida(valor)}" não pode ser usada (Brand Book).`;
    }
    // Link: https:// ou atalho do site ("/loja/"), como no servidor (auditoria 2, item 45).
    if (r.tipo === "link" && !/^https:\/\//.test(valor) && !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*(?:#[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(valor)) return `${n}: o link precisa começar com https:// (ou ser uma página do site, como /loja/)`;
    if (r.tipo === "campanhas") {
      for (const [i, c] of valor.entries()) {
        if (!c.titulo) return `${n} (${i + 1}): coloque o título.`;
        if (!c.termina) return `${n} (${i + 1}): coloque a data de término (obrigatória).`;
        if (proibida(`${c.titulo} ${c.texto}`)) return `${n} (${i + 1}): palavra proibida pelo Brand Book.`;
      }
    }
    if (r.tipo === "lista-de-textos") return listaDeTextos(valor, r, n, proibida).erro || null;
    // Vídeos: no máximo "max" e capa nova só JPEG ("foto:<id>.jpg"), com as mesmas mensagens do servidor
    // (lib/regras.mjs; achado 3 do chat do site, 26/10). A capa que já está no site ("/...") continua aceita.
    if (r.tipo === "videos") {
      const max = Number.isInteger(r.max) ? r.max : 12;
      if (!Array.isArray(valor) || valor.length > max) return `${n}: no máximo ${max} vídeos.`;
      for (const [i, v] of valor.entries()) {
        const capa = String((v && v.capa) || "");
        if (/^foto:[0-9a-f]{64}\.(png|webp)$/.test(capa)) return `${n} (vídeo ${i + 1}): a capa nova precisa ser uma foto JPEG. Envie o vídeo de novo.`;
        if (capa && !/^foto:[0-9a-f]{64}\.jpg$/.test(capa) && !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(jpe?g|png|webp)$/.test(capa)) return `${n} (vídeo ${i + 1}): capa inválida.`;
      }
    }
    return null;
  }

  // Lista de frases (contrato C1), igual ao servidor (lib/esquema.mjs, mesmas mensagens): quebra de linha vira
  // espaço, tira os espaços das pontas, descarta frase vazia, recusa "<" e ">", frase acima de max-letras, palavra
  // proibida em cada frase e lista acima de max-itens. A frase conta pela posição da caixa na tela. Aceita "*" e
  // lista vazia (o bloco some no site). Devolve { valor } limpo ou { erro }.
  function listaDeTextos(valor, r, n, proibida) {
    const maxItens = Number.isInteger(r["max-itens"]) ? r["max-itens"] : 12;
    const maxLetras = Number.isInteger(r["max-letras"]) ? r["max-letras"] : 200;
    if (!Array.isArray(valor) || valor.some((t) => typeof t !== "string")) return { erro: `${n}: precisa ser uma lista de frases.` };
    const frases = [];
    for (const [i, t] of valor.entries()) {
      const limpa = t.replace(/\s*[\r\n]+\s*/g, " ").trim();
      if (!limpa) continue;
      if (/[<>]/.test(limpa)) return { erro: `${n}: na frase ${i + 1}, não use os sinais < e >.` };
      if (limpa.length > maxLetras) return { erro: `${n}: a frase ${i + 1} passou de ${maxLetras} letras.` };
      if (proibida(limpa)) return { erro: `${n}: a frase ${i + 1} usa a palavra "${proibida(limpa)}", que não pode ser usada (Brand Book).` };
      frases.push(limpa);
    }
    if (frases.length > maxItens) return { erro: `${n}: no máximo ${maxItens} frases (tem ${frases.length}).` };
    return { valor: frases };
  }

  // Mesmas regras de funcoes/conteudo.mjs: nome do item ("nomeDoItem"), campo sem "*" que vira item, e grupo com
  // mais de uma lista (Vídeos) com o item "arquivo:chave", uma lista depois da outra (duas listas do mesmo arquivo:
  // "arquivo:<posição da lista>-chave", como idDoItem).
  function nomeDoItem(r, k, it) {
    const base = (it && typeof it.nome === "string" && it.nome) || k;
    const m = r.nomeDoItem;
    if (m && typeof m === "object") return m[k] || base;
    if (typeof m !== "string" || !m) return base;
    return m.replace(/\{([a-z0-9-]+)\}/g, (_, c) => (c === "nome" ? base : (it && typeof it[c] === "string" && it[c]) || k));
  }
  const idDoItem = (chave, fonte, arquivo, fontes) => {
    if (!chave || fontes.length < 2) return chave;
    return fontes.filter((f) => f.split(".")[0] === arquivo).length > 1 ? `${arquivo}:${fontes.indexOf(fonte) + 1}-${chave}` : `${arquivo}:${chave}`;
  };
  function conteudo() {
    const grupos = ESQUEMA.grupos.map((g) => {
      const casos = g.campos.flatMap((modelo, pos) => {
        const r = ESQUEMA.campos[modelo];
        const p = modelo.split("."); const i = p.indexOf("*");
        if (i < 0) {
          return [typeof r.nomeDoItem === "string" ? { caminho: modelo, item: r.nomeDoItem, chave: p.slice(1).join("-"), ordem: 0, fonte: modelo, arquivo: p[0], modelo, pos }
            : { caminho: modelo, item: "", chave: "", ordem: -1, fonte: "", modelo, pos }];
        }
        return Object.keys(ler(E.site[arq(modelo)], p.slice(1, i)) || {}).map((k, ordem) => ({
          caminho: [...p.slice(0, i), k, ...p.slice(i + 1)].join("."), item: nomeDoItem(r, k, ler(E.site[arq(modelo)], [...p.slice(1, i), k])),
          chave: k, ordem, fonte: p.slice(0, i).join("."), arquivo: p[0], modelo, pos }));
      });
      const fontes = [...new Set(casos.filter((x) => x.fonte).map((x) => x.fonte))];
      const campos = casos.map(({ caminho, item, chave, ordem, fonte, arquivo, modelo, pos }) => {
        const r = ESQUEMA.campos[modelo];
        const rasc = E.rascunho[caminho];
        return { caminho, tipo: r.tipo, max: r.max, "max-itens": r["max-itens"], "max-letras": r["max-letras"], opcoes: r.opcoes, rotulos: r.rotulos, ajuda: r.ajuda,
          item: idDoItem(chave, fonte, arquivo, fontes), itemNome: item, rotulo: r.nome,
          nome: item ? `${r.nome} · ${item}` : r.nome, noSite: ler(E.site[arq(caminho)], lugar(caminho)),
          ...(rasc && { rascunho: { valor: rasc.valor, por: rasc.por, em: rasc.em } }), _o: [fonte ? fontes.indexOf(fonte) : -1, ordem, pos] };
      }).sort((a, b) => a._o[0] - b._o[0] || a._o[1] - b._o[1] || a._o[2] - b._o[2]).map(({ _o, ...c }) => c);
      return { id: g.id, titulo: g.titulo, descricao: g.descricao || "", icone: g.icone || "", campos };
    });
    return { grupos, publicarLigado: true };
  }

  // Medidor como o do servidor (lib/cota.mjs), com as mesmas mensagens. "Ver com créditos baixos" (botão na faixa
  // amarela; pedido de 26/10): o mês começa com 22 de 25 usadas, para a faixa de créditos baixos aparecer; cada
  // publicação da demonstração continua contando a partir daí.
  const MENSAGENS = { verde: "", laranja: "Junte as mudanças antes de publicar.",
    vermelho: "Restam poucas publicações este mês. Junte tudo numa publicação só.",
    travado: "A cota de segurança do mês acabou. Isso protege o site de sair do ar. Renova em 21/11/2026. Suas mudanças ficam salvas." };
  const cota = () => {
    const usadas = E.creditosBaixos ? 22 + Math.max(0, E.usadas - E.creditosBaixos.desde) : E.usadas;
    const restantes = Math.max(0, 25 - usadas);
    const cor = restantes === 0 ? "travado" : restantes <= 2 ? "vermelho" : restantes <= 12.5 ? "laranja" : "verde";
    return { usadas, cota: 25, restantes, cor, renovaEm: "21/11/2026", texto: `Publicações este mês: ${usadas} de 25 · renova em 21/11/2026`,
      mensagem: MENSAGENS[cor], baixouPelaLeitura: false };
  };
  window.creditosBaixosDemo = (ligar) => {
    E.creditosBaixos = ligar ? { desde: E.usadas } : null;
    guardar();
    // A faixa volta a aparecer mesmo que alguém já tenha tocado em "Entendi" nesta aba.
    try { sessionStorage.removeItem("painel-creditos-entendi"); } catch { /* sem armazenamento */ }
    location.reload();
  };

  function publicar(mudancas, quem, tipo, desfazendo) {
    // Cota do mês acabou: não publica, como o servidor (as mudanças ficam salvas).
    if (cota().restantes <= 0) return ok({ erro: cota().mensagem, cota: cota() }, 429);
    const aplicadas = [];
    for (const [c, m] of Object.entries(mudancas)) {
      const antes = ler(E.site[arq(c)], lugar(c));
      if (JSON.stringify(antes) === JSON.stringify(m.valor)) continue;
      if (gravar(E.site[arq(c)], lugar(c), JSON.parse(JSON.stringify(m.valor)))) aplicadas.push({ caminho: c, nome: nomeDe(c), antes, depois: m.valor });
    }
    if (!aplicadas.length) return ok({ ok: true, nada: true, aviso: "O site já está assim. Nada foi publicado." });
    const id = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}-${Math.random().toString(16).slice(2, 8)}`;
    E.historico.unshift({ id, tipo, desfazendo: desfazendo || null, quem, quando: agora(), mudancas: aplicadas });
    E.usadas += 1; guardar();
    return ok({ ok: true, id, quando: agora(), mudancas: aplicadas.map((a) => a.nome), caminhos: aplicadas.map((a) => a.caminho), cota: cota() });
  }

  async function rota(url, metodo, corpo) {
    const caminho = url.pathname.replace(/^.*\/painel\/api\//, "");
    const dados = corpo ? JSON.parse(corpo) : {};
    switch (caminho) {
      // A mesma "entrada" a cada recarga (como no servidor, que guarda quando ela vence): o "Entendi" da faixa de
      // créditos baixos vale até a próxima entrada.
      case "eu": case "entrar": {
        if (!(E.expira > agora())) { E.expira = agora() + 432e5; guardar(); }
        return ok({ ...EU, expira: E.expira });
      }
      case "sair": return ok({ ok: true });
      case "cota": return ok(cota());
      case "avisos": return ok(metodo === "GET" ? { naoLidos: 0, avisos: [] } : { ok: true });
      case "conteudo": return ok(conteudo());
      case "rascunho": {
        // "visto" (contrato C3): o "em" que a tela viu (ou null, sem rascunho). Se o rascunho do campo mudou depois
        // (outra aba, por exemplo), recusa sem gravar nada, como o servidor.
        const mudouDesde = (caminho, visto) => visto !== undefined && (E.rascunho[caminho]?.em ?? null) !== visto;
        const recusar = (caminho) => ok({ erro: "Outra pessoa mudou isto agora há pouco. Veja a versão nova antes de continuar.",
          caminho, atual: E.rascunho[caminho] ? E.rascunho[caminho].valor : null, em: E.rascunho[caminho]?.em ?? null }, 409);
        if (metodo === "POST") {
          const erros = dados.mudancas.map((m) => ({ caminho: m.caminho, erro: validar(m.caminho, m.valor) })).filter((e) => e.erro);
          if (erros.length) return ok({ erro: "Algumas mudanças não foram salvas. Confira os campos marcados.", campos: erros }, 400);
          const mudou = dados.mudancas.find((m) => mudouDesde(m.caminho, m.visto));
          if (mudou) return recusar(mudou.caminho);
          for (const m of dados.mudancas) {
            // "antes" = o valor do site da primeira vez (a tela de Publicar mostra o antes e o depois).
            const anterior = E.rascunho[m.caminho];
            const r = ESQUEMA.campos[modeloDe(m.caminho)];
            const valor = r?.tipo === "lista-de-textos" ? listaDeTextos(m.valor, r, r.nome, () => null).valor
              : typeof m.valor === "string" ? m.valor.trim() : m.valor;
            E.rascunho[m.caminho] = { valor, por: EU.nome, em: agora(),
              ...(anterior && "antes" in anterior ? { antes: anterior.antes } : m.antes !== undefined ? { antes: m.antes } : {}) };
          }
        }
        if (metodo === "DELETE") {
          if (dados.caminhos.length === 1 && mudouDesde(dados.caminhos[0], dados.visto)) return recusar(dados.caminhos[0]);
          if (!dados.caminhos.length) E.rascunho = {};
          for (const c of dados.caminhos) delete E.rascunho[c];
        }
        guardar();
        return ok({ total: Object.keys(E.rascunho).length, mudancas: E.rascunho, atualizado: agora() });
      }
      case "previa": {
        const site = JSON.parse(JSON.stringify(E.site));
        for (const [c, m] of Object.entries(E.rascunho)) gravar(site[arq(c)], lugar(c), m.valor);
        return ok({ dados: site, mudancas: Object.keys(E.rascunho).length, naoAplicadas: [] });
      }
      case "publicar": {
        if (metodo === "GET") return ok({ total: Object.keys(E.rascunho).length, mudancas: Object.entries(E.rascunho).map(([c, m]) => ({ caminho: c, nome: nomeDe(c), por: m.por, em: m.em })) });
        // Publica só a lista que a tela mostrou (auditoria 2, item 23).
        const vistas = dados.vistas;
        if (vistas && (Object.keys(vistas).length !== Object.keys(E.rascunho).length || Object.entries(E.rascunho).some(([c, m]) => vistas[c] !== m.em))) {
          return ok({ erro: "O rascunho mudou desde que você abriu esta tela. Nada foi publicado: confira a lista de novo.", rascunhoMudou: true }, 409);
        }
        const r = publicar(E.rascunho, EU.nome, "publicacao");
        if (r.status === 200) { E.rascunho = {}; guardar(); } // sem cota, as mudanças ficam salvas
        return r;
      }
      case "historico": return ok({ publicacoes: E.historico });
      case "desfazer": {
        const p = E.historico.find((x) => x.id === dados.id); if (!p) return falha("Publicação não encontrada.", 404);
        return publicar(Object.fromEntries(p.mudancas.map((m) => [m.caminho, { valor: m.antes }])), EU.nome, "desfazer", p.id);
      }
      case "aprovacoes": return ok({ envios: [] });
      // Como o servidor: quem não é a administradora vê o e-mail das outras pessoas mascarado, e a tela age pelo "id".
      case "acessos": return ok(metodo === "GET" ? { pessoas: [
        { nome: "Bruna", email: "bruna@exemplo.com", id: "1".repeat(64), papel: "responsavel", ativo: true, podeMexer: false },
        { nome: "CEO da marca", email: "c***@exemplo.com", id: "2".repeat(64), papel: "responsavel", ativo: true, podeMexer: false }], registro: [] }
        : { ok: true, ativo: dados.acao === "religar" });
      // Desde 27/10 o painel é só da Bruna e do CEO: não há convite de funcionária.
      case "convites": return ok(metodo === "GET" ? { convites: [] }
        : { id: "demo", link: `${location.origin}${location.pathname}#convite/exemplo-de-convite`, papel: "responsavel", expira: agora() + 1728e5 }, metodo === "POST" ? 201 : 200);
      case "convite": return falha("Esta é só uma demonstração: o convite de verdade funciona no painel no ar.", 410);
      case "foto": case "video": return falha("Na demonstração não dá para enviar fotos e vídeos. No painel de verdade, funciona.");
      default: return falha("Na demonstração, isso não está disponível.", 404);
    }
  }

  // Faixa amarela de demonstração (só na janela principal, não dentro da prévia do site).
  if (window.top === window) {
    document.addEventListener("DOMContentLoaded", () => {
      const faixa = document.createElement("div");
      faixa.className = "faixa-demo";
      const texto = document.createElement("span");
      texto.textContent = "Demonstração do painel · nada aqui vai para o site · o que você mexer fica só neste aparelho";
      const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = "Recomeçar";
      botao.addEventListener("click", () => { if (confirm("Apagar o que foi mexido e começar de novo?")) window.recomecarDemo(); });
      // Para ver a faixa de créditos baixos do topo (e voltar ao normal).
      const creditos = document.createElement("button");
      creditos.type = "button";
      creditos.textContent = E.creditosBaixos ? "Voltar aos créditos normais" : "Ver com créditos baixos";
      creditos.addEventListener("click", () => window.creditosBaixosDemo(!E.creditosBaixos));
      faixa.append(texto, creditos, botao);
      document.body.prepend(faixa);
    });
  }

  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (entrada, opcoes = {}) => {
    const url = new URL(typeof entrada === "string" ? entrada : entrada.url, location.href);
    if (!url.pathname.includes("/painel/api/")) return fetchOriginal(entrada, opcoes);
    await new Promise((r) => setTimeout(r, 120)); // parece um servidor de verdade
    const corpo = typeof opcoes.body === "string" ? opcoes.body : null;
    return rota(url, (opcoes.method || "GET").toUpperCase(), corpo);
  };
})();
