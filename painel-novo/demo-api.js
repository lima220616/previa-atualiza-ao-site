// DEMONSTRAÇÃO do painel (link para mostrar à Bruna): troca o servidor por um "servidor de mentira" dentro do
// navegador. Tudo fica só neste aparelho (localStorage); nada vai para o site. Os dados de exemplo vêm de
// demo-dados.js (gerado por ferramentas/montar-demo.py a partir de exemplo/). Não vai para o painel de verdade.
"use strict";
(function () {
  const CHAVE = "painel-brumar-demo-v1";
  const base = window.DEMO_DADOS;
  const ESQUEMA = base.esquema;
  const novo = () => ({ site: JSON.parse(JSON.stringify(base.dados)), rascunho: {}, historico: [], usadas: 0 });
  let E;
  try { E = JSON.parse(localStorage.getItem(CHAVE)) || novo(); } catch { E = novo(); }
  const guardar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch { /* sem espaço */ } };
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
  const nomeDe = (caminho) => {
    const m = modeloDe(caminho); if (!m) return caminho;
    const r = ESQUEMA.campos[m]; if (m === caminho) return r.nome || caminho;
    const p = caminho.split("."); return `${r.nome} · ${m.split(".").map((x, i) => (x === "*" ? p[i] : null)).filter(Boolean).join(" · ")}`;
  };
  const ler = (obj, partes) => partes.reduce((a, k) => (a && typeof a === "object" && Object.hasOwn(a, k) ? a[k] : undefined), obj);
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
    const proibida = (t) => (r.proibidas || []).find((p) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(p));
    if (r.tipo === "texto") {
      if (typeof valor !== "string") return `${n}: precisa ser um texto.`;
      if (/[<>]/.test(valor)) return `${n}: não use os sinais < e >.`;
      if (valor.trim().length > r.max) return `${n}: no máximo ${r.max} letras.`;
      if (proibida(valor)) return `${n}: a palavra "${proibida(valor)}" não pode ser usada (Brand Book).`;
    }
    if (r.tipo === "link" && !/^https:\/\//.test(valor)) return `${n}: o link precisa começar com https://`;
    if (r.tipo === "campanhas") {
      for (const [i, c] of valor.entries()) {
        if (!c.titulo) return `${n} (${i + 1}): coloque o título.`;
        if (!c.termina) return `${n} (${i + 1}): coloque a data de término (obrigatória).`;
        if (proibida(`${c.titulo} ${c.texto}`)) return `${n} (${i + 1}): palavra proibida pelo Brand Book.`;
      }
    }
    return null;
  }

  function conteudo() {
    const grupos = ESQUEMA.grupos.map((g) => ({
      id: g.id, titulo: g.titulo, descricao: g.descricao || "", icone: g.icone || "",
      campos: g.campos.flatMap((modelo, pos) => {
        const p = modelo.split("."); const i = p.indexOf("*");
        const casos = i < 0 ? [{ caminho: modelo, item: "", chave: "", ordem: -1 }]
          : Object.keys(ler(E.site[arq(modelo)], p.slice(1, i)) || {}).map((k, ordem) => {
            const it = ler(E.site[arq(modelo)], [...p.slice(1, i), k]);
            return { caminho: [...p.slice(0, i), k, ...p.slice(i + 1)].join("."), item: (it && it.nome) || k, chave: k, ordem };
          });
        return casos.map(({ caminho, item, chave, ordem }) => {
          const r = ESQUEMA.campos[modelo];
          const rasc = E.rascunho[caminho];
          return { caminho, tipo: r.tipo, max: r.max, opcoes: r.opcoes, rotulos: r.rotulos, ajuda: r.ajuda, item: chave, itemNome: item, rotulo: r.nome,
            nome: item ? `${r.nome} · ${item}` : r.nome, noSite: ler(E.site[arq(caminho)], lugar(caminho)),
            ...(rasc && { rascunho: { valor: rasc.valor, por: rasc.por, em: rasc.em } }), _o: [ordem, pos] };
        });
      }).sort((a, b) => a._o[0] - b._o[0] || a._o[1] - b._o[1]).map(({ _o, ...c }) => c),
    }));
    return { grupos, publicarLigado: true };
  }

  const cota = () => {
    const restantes = Math.max(0, 25 - E.usadas);
    const cor = restantes === 0 ? "travado" : restantes <= 2 ? "vermelho" : restantes <= 12.5 ? "laranja" : "verde";
    return { usadas: E.usadas, cota: 25, restantes, cor, renovaEm: "21/11/2026", texto: `Publicações este mês: ${E.usadas} de 25 · renova em 21/11/2026`, mensagem: "" };
  };

  function publicar(mudancas, quem, tipo, desfazendo) {
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
    return ok({ ok: true, id, quando: agora(), mudancas: aplicadas.map((a) => a.nome), cota: cota() });
  }

  async function rota(url, metodo, corpo) {
    const caminho = url.pathname.replace(/^.*\/painel\/api\//, "");
    const dados = corpo ? JSON.parse(corpo) : {};
    switch (caminho) {
      case "eu": case "entrar": return ok({ ...EU, expira: agora() + 432e5 });
      case "sair": return ok({ ok: true });
      case "cota": return ok(cota());
      case "avisos": return ok(metodo === "GET" ? { naoLidos: 0, avisos: [] } : { ok: true });
      case "conteudo": return ok(conteudo());
      case "rascunho": {
        if (metodo === "POST") {
          const erros = dados.mudancas.map((m) => ({ caminho: m.caminho, erro: validar(m.caminho, m.valor) })).filter((e) => e.erro);
          if (erros.length) return ok({ erro: "Algumas mudanças não foram salvas. Confira os campos marcados.", campos: erros }, 400);
          for (const m of dados.mudancas) E.rascunho[m.caminho] = { valor: typeof m.valor === "string" ? m.valor.trim() : m.valor, por: EU.nome, em: agora() };
        }
        if (metodo === "DELETE") { if (!dados.caminhos.length) E.rascunho = {}; for (const c of dados.caminhos) delete E.rascunho[c]; }
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
        const r = publicar(E.rascunho, EU.nome, "publicacao");
        E.rascunho = {}; guardar(); return r;
      }
      case "historico": return ok({ publicacoes: E.historico });
      case "desfazer": {
        const p = E.historico.find((x) => x.id === dados.id); if (!p) return falha("Publicação não encontrada.", 404);
        return publicar(Object.fromEntries(p.mudancas.map((m) => [m.caminho, { valor: m.antes }])), EU.nome, "desfazer", p.id);
      }
      case "aprovacoes": return ok({ envios: [] });
      case "acessos": return ok(metodo === "GET" ? { pessoas: [
        { nome: "Bruna", email: "bruna@exemplo.com", papel: "responsavel", ativo: true, podeMexer: false },
        { nome: "CEO da marca", email: "ceo@exemplo.com", papel: "responsavel", ativo: true, podeMexer: false },
        { nome: "Ana (exemplo)", email: "ana@exemplo.com", papel: "funcionaria", ativo: true, podeMexer: true }], registro: [] }
        : { ok: true, ativo: dados.acao === "religar" });
      case "convites": return ok(metodo === "GET" ? { convites: [] }
        : { id: "demo", link: `${location.origin}${location.pathname}#convite/exemplo-de-convite`, papel: dados.papel || "funcionaria", expira: agora() + 1728e5 }, metodo === "POST" ? 201 : 200);
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
      faixa.append(texto, botao);
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
