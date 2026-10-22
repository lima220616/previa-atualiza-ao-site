/* Painel Brumar · PRÉVIA. Tudo fica só neste navegador (nada é publicado, nada vai para o GitHub ou a Netlify).
   Mostra como o painel vai funcionar: entrar, mexer, salvar, publicar com medidor, aprovação das funcionárias,
   avaliações, link na bio e acessos. Textos dos dados entram sempre como texto (nunca como HTML). */
(function () {
  "use strict";

  var CHAVE = "painel-brumar-previa-v10";
  var COTA = 25;              // plano Personal (1.000 créditos): reserva ~600 para visitas, vídeos e robôs; ~25 publicações
  var RENOVA = "21/11";
  var PESSOAS_INICIAIS = [
    { id: "bruna", nome: "Bruna", email: "bruna@exemplo.com", papel: "responsavel" },
    { id: "ceo", nome: "CEO da marca", email: "ceo@exemplo.com", papel: "responsavel" },
    { id: "ana", nome: "Ana", email: "ana@exemplo.com", papel: "funcionaria" },
    { id: "teste", nome: "Teste", email: "administradora@exemplo.com", papel: "admin" }
  ];
  var SELOS = ["", "Sistema completo", "Mais vendido", "Com brinde", "Ideal para salão", "Melhor custo-benefício", "Lançamento"];
  // Cores do link na bio: só as do Brand Book (fundos claros + rosa escuro ou rosa profundo).
  var FUNDOS = [["#FFFFFF", "Branco"], ["#FDF0F3", "Rosa névoa"], ["#FCE7EB", "Rosa bebê"], ["#F5E8C8", "Dourado claro"]];
  var PRINCIPAIS = [["#B84060", "Rosa Brumar"], ["#8A2E48", "Rosa profundo"]];

  // ------------------------------------------------------------------ estado (só neste navegador)
  function copia(x) { return JSON.parse(JSON.stringify(x)); }
  function novoEstado() {
    var base = copia(window.DADOS);
    return {
      publicado: base, trabalho: copia(base), pessoas: copia(PESSOAS_INICIAIS), usadas: 3,
      historico: [
        { quando: "16/10 21:40", quem: "Administradora", oque: ["Site no domínio novo, sem textos de teste"] },
        { quando: "16/10 23:05", quem: "Administradora", oque: ["Campanha de 30% pausada"] },
        { quando: "18/10 07:00", quem: "Robô das avaliações", oque: ["Avaliações novas da Yampi"] }
      ],
      aprovacoes: [], convites: [], logado: null
    };
  }
  var E;
  try { E = JSON.parse(localStorage.getItem(CHAVE)) || novoEstado(); } catch (e) { E = novoEstado(); }
  function guardar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* prévia: segue sem guardar */ } }
  var tela = { aba: "site", sub: null, familia: null };
  var fotosTemporarias = {}; // fotos escolhidas nesta sessão (só na prévia)

  function eu() { return E.pessoas.filter(function (p) { return p.id === E.logado; })[0] || null; }
  function responsavel() { var p = eu(); return p && (p.papel === "responsavel" || p.papel === "admin"); }
  function nomePapel(papel) { return { admin: "administradora", responsavel: "responsável", funcionaria: "funcionária" }[papel] || papel; }
  function codigoAleatorio() {
    var a = new Uint8Array(18); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  var HORAS_CONVITE = 48;

  // ------------------------------------------------------------------ montar elementos sem innerHTML
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
      else if (k === "style") el.setAttribute("style", v);
      else el.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) acrescentar(el, arguments[i]);
    return el;
  }
  function acrescentar(el, filho) {
    if (filho === null || filho === undefined || filho === false) return;
    if (Array.isArray(filho)) { filho.forEach(function (f) { acrescentar(el, f); }); return; }
    el.appendChild(typeof filho === "string" || typeof filho === "number" ? document.createTextNode(String(filho)) : filho);
  }
  function aviso(texto) {
    var t = h("div", { class: "aviso-toast", role: "status", text: texto });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }
  function janela(conteudo) {
    var fundo = h("div", { class: "fundo-janela", onclick: function (ev) { if (ev.target === fundo) fechar(); } });
    function fechar() { fundo.remove(); }
    var j = h("div", { class: "janela", role: "dialog", "aria-modal": "true" }, conteudo(fechar));
    fundo.appendChild(j); document.body.appendChild(fundo);
    var foco = j.querySelector("input, textarea, button"); if (foco) foco.focus();
    return fechar;
  }
  function reais(v) { return v === null || v === undefined || v === "" ? "" : "R$ " + Number(v).toFixed(2).replace(".", ","); }
  function agora() { var d = new Date(); function z(n) { return (n < 10 ? "0" : "") + n; } return z(d.getDate()) + "/" + z(d.getMonth() + 1) + " " + z(d.getHours()) + ":" + z(d.getMinutes()); }

  // ------------------------------------------------------------------ o que mudou (rascunho = trabalho diferente do publicado)
  function mudancas(pub, tra) {
    var lista = [];
    function cmp(rotulo, a, b) { if (JSON.stringify(a) !== JSON.stringify(b)) lista.push({ rotulo: rotulo, antes: texto(a), depois: texto(b) }); }
    function texto(v) {
      if (v === true) return "aparece"; if (v === false) return "escondido";
      if (Array.isArray(v)) return v.map(function (x) { return typeof x === "object" ? x.texto || x.p || "" : x; }).join(" · ");
      if (v && typeof v === "object") return Object.keys(v).map(function (k) { return v[k]; }).join(" / ");
      return v === "" || v === null || v === undefined ? "(vazio)" : String(v);
    }
    var m1 = pub.marca, m2 = tra.marca;
    cmp("Frase da marca", m1.slogan, m2.slogan);
    cmp("Descrição do site", m1.descricao, m2.descricao);
    cmp("Faixa do topo", m1.faixa_anuncios, m2.faixa_anuncios);
    cmp("Horário de atendimento", m1.atendimento, m2.atendimento);
    cmp("Mensagem automática do WhatsApp", m1.whatsapp_mensagem, m2.whatsapp_mensagem);
    cmp("Campanha", m1.campanha, m2.campanha);
    pub.secoes.forEach(function (s, i) { cmp("Seção “" + s.nome + "”", s.ligada, tra.secoes[i].ligada); });
    pub.familias.forEach(function (f, i) {
      var g = tra.familias[i];
      cmp(f.curto + ": nome", f.nome, g.nome); cmp(f.curto + ": chamada", f.chamada, g.chamada);
      cmp(f.curto + ": para quem é", f.para_quem, g.para_quem); cmp(f.curto + ": no site", f.visivel, g.visivel);
      g.kits.forEach(function (k, j) {
        var a = f.kits[j];
        if (!a) { lista.push({ rotulo: "Kit novo em " + f.curto, antes: "(não existia)", depois: k.nome + " · " + reais(k.preco) }); return; }
        cmp(f.curto + " · " + a.nome + ": nome", a.nome, k.nome); cmp(f.curto + " · " + a.nome + ": selo", a.selo, k.selo);
        cmp(f.curto + " · " + a.nome + ": no site", a.visivel, k.visivel); cmp(f.curto + " · " + a.nome + ": preço", a.preco, k.preco);
        if (a.foto !== k.foto) lista.push({ rotulo: f.curto + " · " + a.nome + ": foto", antes: "foto antiga", depois: "foto nova" });
      });
    });
    cmp("Dúvidas frequentes", pub.faq.map(function (q) { return q.p + "|" + q.r + "|" + q.home; }),
        tra.faq.map(function (q) { return q.p + "|" + q.r + "|" + q.home; }));
    if (pub.faq.length !== tra.faq.length) lista[lista.length - 1].depois = tra.faq.length + " perguntas (antes " + pub.faq.length + ")";
    cmp("Modo de usar", pub.modo_de_usar, tra.modo_de_usar);
    Object.keys(tra.videos_produto || {}).forEach(function (k) {
      var a = ((pub.videos_produto || {})[k] || { videos: [] }).videos, b = tra.videos_produto[k].videos;
      var chave = function (v) { return (v.id || v.arquivo) + (v.visivel === false ? ":escondido" : ""); };
      if (JSON.stringify(a.map(chave)) !== JSON.stringify(b.map(chave)))
        lista.push({ rotulo: "Vídeos de resultado: " + tra.videos_produto[k].produto, antes: a.length + " vídeo(s)", depois: b.length + " vídeo(s)" });
    });
    cmp("Vídeos", (pub.videos || []).map(function (v) { return v.titulo + (v.visivel ? "" : " (escondido)"); }),
        (tra.videos || []).map(function (v) { return v.titulo + (v.visivel ? "" : " (escondido)"); }));
    pub.avaliacoes.forEach(function (a, i) {
      var b = tra.avaliacoes[i];
      if (a.oculta !== b.oculta) lista.push({ rotulo: "Avaliação de " + a.nome, antes: a.oculta ? "escondida" : "aparece", depois: b.oculta ? "escondida" : "aparece" });
      if (a.fotos_liberadas !== b.fotos_liberadas) lista.push({ rotulo: "Fotos da avaliação de " + a.nome, antes: a.fotos_liberadas ? "liberadas" : "não", depois: b.fotos_liberadas ? "liberadas" : "não" });
    });
    cmp("Link na bio: frase de destaque", pub.bio.frase, tra.bio.frase);
    cmp("Link na bio: cores", pub.bio.cores, tra.bio.cores);
    cmp("Link na bio: botões", pub.bio.botoes, tra.bio.botoes);
    cmp("Link na bio: avaliações", pub.bio.mostrar_avaliacoes, tra.bio.mostrar_avaliacoes);
    cmp("Link na bio: dúvidas", pub.bio.mostrar_duvidas, tra.bio.mostrar_duvidas);
    cmp("Link na bio: promoção de Final de Ano", pub.bio.mostrar_promo, tra.bio.mostrar_promo);
    if (pub.bio.oferta !== tra.bio.oferta) {
      var nomeOf = function (id) { return ((tra.ofertas || []).filter(function (o) { return o.id === id; })[0] || {}).nome || id; };
      lista.push({ rotulo: "Link na bio: oferta em destaque", antes: nomeOf(pub.bio.oferta), depois: nomeOf(tra.bio.oferta) });
    }
    return lista;
  }

  // ------------------------------------------------------------------ medidor
  function medidor() {
    var resta = Math.max(0, COTA - E.usadas), pct = resta / COTA * 100, cor, msg;
    if (resta === 0) { cor = "travado"; msg = "🔒 Cota de segurança do mês acabou. Publicar volta em " + RENOVA + ". Salvar continua liberado."; }
    else if (resta <= 2) { cor = "vermelho"; msg = "Use só para o que for importante."; }
    else if (pct <= 50) { cor = "laranja"; msg = "Junte as mudanças antes de publicar."; }
    else { cor = "verde"; msg = ""; }
    return h("div", { class: "medidor " + cor, role: "status" },
      h("div", { class: "medidor-linha" },
        h("span", null, "Publicações este mês: ", h("span", { class: "medidor-num", text: resta + " de " + COTA })),
        h("small", { text: "renova em " + RENOVA })),
      h("div", { class: "medidor-barra" }, h("span", { style: "width:" + pct + "%" })),
      msg ? h("div", { class: "medidor-aviso", text: msg }) : null);
  }

  // ------------------------------------------------------------------ publicar / enviar para aprovação
  function abrirPublicar() {
    var lista = mudancas(E.publicado, E.trabalho);
    if (!lista.length) { aviso("Não há mudanças salvas para publicar."); return; }
    var p = eu();
    if (!responsavel()) {
      janela(function (fechar) {
        return [h("h2", { text: "Enviar para aprovação" }),
          h("p", { class: "sub", text: "A Bruna e o CEO recebem um e-mail com estas mudanças. Basta um deles aprovar." }),
          lista.map(cartaoMudanca),
          h("div", { class: "acoes" },
            h("button", { class: "botao", onclick: function () {
              E.aprovacoes.push({ id: Date.now(), quem: p.nome, quando: agora(), lista: lista, trabalho: copia(E.trabalho), estado: "pendente" });
              E.trabalho = copia(E.publicado); guardar(); fechar(); desenhar();
              aviso("Enviado! Na versão real, a Bruna e o CEO recebem um e-mail.");
            } }, "Enviar para aprovação"),
            h("button", { class: "botao claro", onclick: fechar }, "Voltar"))];
      });
      return;
    }
    var resta = COTA - E.usadas;
    janela(function (fechar) {
      return [h("h2", { text: "Publicar no site" }),
        h("p", { class: "sub", text: lista.length + " mudança(s) vão para o site numa publicação só." + (resta > 0 ? " Depois desta, sobram " + (resta - 1) + " no mês." : "") }),
        lista.map(cartaoMudanca),
        resta <= 0 ? h("p", { class: "erro", text: "🔒 A cota de segurança do mês acabou. Publicar volta em " + RENOVA + ". Se for urgente, fale com a administradora." }) : null,
        h("div", { class: "acoes" },
          h("button", { class: "botao", disabled: resta <= 0, onclick: function () {
            publicar(lista, p.nome, null); fechar();
            aviso("Publicado! (Na prévia, nada vai para o site de verdade.) O " + (p.id === "bruna" ? "CEO" : "a Bruna") + " recebe um aviso.");
          } }, "Publicar agora"),
          h("button", { class: "botao claro", onclick: fechar }, "Voltar"))];
    });
  }
  function publicar(lista, quem, trabalho) {
    if (trabalho) E.trabalho = copia(trabalho);
    E.publicado = copia(E.trabalho); E.usadas += 1;
    E.historico.unshift({ quando: agora(), quem: quem, oque: lista.map(function (m) { return m.rotulo; }) });
    guardar(); desenhar();
  }
  function cartaoMudanca(m) {
    return h("div", { class: "mudanca" }, h("strong", { text: m.rotulo }),
      h("div", { class: "antes-depois" },
        h("div", { class: "antes" }, h("b", { text: "Antes" }), m.antes),
        h("div", { class: "depois" }, h("b", { text: "Depois" }), m.depois)));
  }

  // ------------------------------------------------------------------ campos
  function campoTexto(rotulo, valor, max, opc) {
    opc = opc || {};
    var id = "c" + Math.random().toString(36).slice(2);
    var input = opc.area ? h("textarea", { id: id, maxlength: max }) : h("input", { id: id, type: opc.tipo || "text", maxlength: max });
    input.value = valor || "";
    var cont = h("div", { class: "ajuda", text: (valor || "").length + " de " + max + " caracteres" + (opc.ajuda ? " · " + opc.ajuda : "") });
    input.addEventListener("input", function () { cont.textContent = input.value.length + " de " + max + " caracteres" + (opc.ajuda ? " · " + opc.ajuda : ""); });
    return { el: h("div", { class: "campo" }, h("label", { for: id, text: rotulo }), input, cont), input: input };
  }
  function salvarBotao(fn) {
    return h("button", { class: "botao cheio", onclick: function () {
      var erro = fn(); if (erro) { aviso(erro); return; }
      guardar(); desenhar(); aviso("Salvo! Ainda não está no site: toque em Publicar quando terminar.");
    } }, "Salvar");
  }
  function voltar(paraOnde) { return h("button", { class: "voltar", onclick: function () { paraOnde(); desenhar(); } }, "‹ Voltar"); }

  // ------------------------------------------------------------------ telas: SITE
  function telaSite() {
    var T = E.trabalho;
    if (tela.sub === "textos") {
      var slogan = campoTexto("Frase da marca", T.marca.slogan, 80);
      var desc = campoTexto("Descrição do site (aparece no Google)", T.marca.descricao, 200, { area: true });
      var faixa = campoTexto("Faixa do topo (uma frase por linha, até 6)", T.marca.faixa_anuncios.join("\n"), 400, { area: true });
      var atend = campoTexto("Horário de atendimento", T.marca.atendimento, 80);
      var whats = campoTexto("Mensagem automática do WhatsApp", T.marca.whatsapp_mensagem, 200, { area: true });
      return [voltar(function () { tela.sub = null; }), h("div", { class: "cartao" }, h("h2", { text: "Textos gerais" }),
        slogan.el, desc.el, faixa.el, atend.el, whats.el,
        salvarBotao(function () {
          var linhas = faixa.input.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
          if (!linhas.length || linhas.length > 6) return "A faixa do topo precisa de 1 a 6 frases.";
          if (linhas.some(function (l) { return l.length > 60; })) return "Cada frase da faixa pode ter até 60 caracteres.";
          if (!slogan.input.value.trim()) return "A frase da marca não pode ficar vazia.";
          T.marca.slogan = slogan.input.value.trim(); T.marca.descricao = desc.input.value.trim(); T.marca.faixa_anuncios = linhas;
          T.marca.atendimento = atend.input.value.trim(); T.marca.whatsapp_mensagem = whats.input.value.trim();
        }))];
    }
    if (tela.sub === "campanha") {
      var c = T.marca.campanha;
      var tit = campoTexto("Título", c.titulo, 40), tx = campoTexto("Texto (ex.: até 30% OFF com cupom)", c.texto, 60);
      var bt = campoTexto("Texto do botão", c.botao, 30);
      var fim = h("input", { type: "datetime-local", id: "fim-camp" }); fim.value = (c.termina || "").slice(0, 16);
      return [voltar(function () { tela.sub = null; }), h("div", { class: "cartao" }, h("h2", { text: "Campanha" }),
        h("p", { class: "sub", text: "A faixa com contagem regressiva some sozinha na data de término. Só anuncie desconto que já existe na Yampi." }),
        tit.el, tx.el, bt.el,
        h("div", { class: "campo" }, h("label", { for: "fim-camp", text: "Termina em (horário de Brasília)" }), fim,
          h("div", { class: "ajuda", text: "Obrigatório. Sem data, a campanha não é salva." })),
        salvarBotao(function () {
          if (!fim.value) return "Coloque a data de término da campanha.";
          T.marca.campanha = { titulo: tit.input.value.trim(), texto: tx.input.value.trim(), botao: bt.input.value.trim(), termina: fim.value + ":00-03:00" };
        }))];
    }
    if (tela.sub === "secoes") {
      return [voltar(function () { tela.sub = null; }), h("div", { class: "cartao" }, h("h2", { text: "Seções da página inicial" }),
        h("p", { class: "sub", text: "Ligue ou desligue. A ordem e o visual não mudam." }),
        T.secoes.map(function (s) {
          return h("label", { class: "chave" }, h("span", { text: s.nome }),
            h("input", { type: "checkbox", checked: s.ligada, onchange: function (ev) { s.ligada = ev.target.checked; guardar(); desenhar(); } }));
        }))];
    }
    if (tela.sub === "faq") {
      return [voltar(function () { tela.sub = null; }), h("div", { class: "cartao" }, h("h2", { text: "Dúvidas frequentes" }),
        h("p", { class: "sub", text: T.faq.length + " de 40 perguntas. Marque ⭐ para aparecer na página inicial." }),
        T.faq.map(function (q, i) {
          return h("div", { class: "botao-bio" },
            h("div", { class: "texto" }, h("strong", { text: (q.home ? "⭐ " : "") + q.p }), h("small", { text: q.r })),
            h("button", { class: "icone-bt", "aria-label": "Editar pergunta", onclick: function () { editarPergunta(i); } }, "✏️"));
        }),
        h("div", { class: "acoes" }, h("button", { class: "botao claro", disabled: T.faq.length >= 40, onclick: function () { editarPergunta(-1); } }, "➕ Nova pergunta")))];
    }
    if (tela.sub === "modo") {
      var passos = campoTexto("Passos (um por linha)", T.modo_de_usar.join("\n"), 2000, { area: true });
      passos.input.style.minHeight = "240px";
      return [voltar(function () { tela.sub = null; }), h("div", { class: "cartao" }, h("h2", { text: "Modo de usar" }), passos.el,
        salvarBotao(function () {
          var l = passos.input.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
          if (!l.length) return "Coloque pelo menos um passo."; T.modo_de_usar = l;
        }))];
    }
    if (tela.sub === "videos") return telaVideos();
    if (tela.sub === "produtos" && tela.familia !== null) return telaFamilia(T.familias[tela.familia]);
    if (tela.sub === "produtos") {
      return [voltar(function () { tela.sub = null; }), h("h2", { text: "Produtos" }),
        h("p", { class: "sub", text: "Preços e produtos novos vêm da Yampi. Aqui você muda textos, fotos e o que aparece no site." }),
        h("div", { class: "acoes", style: "margin-bottom:12px" }, h("button", { class: "botao claro", onclick: buscarPrecos }, "🔄 Buscar preços da Yampi")),
        h("div", { class: "lista-produtos" }, T.familias.map(function (f, i) {
          return h("button", { class: "produto", onclick: function () { tela.familia = i; desenhar(); } },
            f.foto ? h("img", { src: f.foto, alt: "" }) : null, h("strong", { text: f.curto }),
            h("small", { text: f.kits.length + " opções" }), " ",
            f.visivel ? null : h("span", { class: "etiqueta cinza", text: "escondido" }));
        }))];
    }
    var itens = [
      ["✍️", "Textos gerais", "Frase da marca, faixa do topo, atendimento", "textos"],
      ["🎁", "Campanha", "Promoção com contagem regressiva", "campanha"],
      ["🧴", "Produtos", "Fotos, textos, mostrar ou esconder, preços da Yampi", "produtos"],
      ["\uD83C\uDFAC", "Vídeos", (T.videos || []).length + " vídeos · adicionar, tirar e ordenar", "videos"],
      ["❓", "Dúvidas frequentes", T.faq.length + " perguntas", "faq"],
      ["📋", "Modo de usar", "Passo a passo da aplicação", "modo"],
      ["🧩", "Seções da página inicial", "Ligar e desligar", "secoes"]
    ];
    return [h("h1", { text: "Olá, " + eu().nome + "!" }),
      h("p", { class: "sub", text: "O que você quer mudar no site hoje?" }),
      h("div", { class: "menu" }, itens.map(function (it) {
        return h("button", { class: "menu-item", onclick: function () { tela.sub = it[3]; tela.familia = null; desenhar(); } },
          h("span", { class: "icone", text: it[0] }), h("span", null, h("strong", { text: it[1] }), h("small", { text: it[2] })), h("span", { class: "seta", text: "›" }));
      }))];
  }

  // ------------------------------------------------------------------ VÍDEOS
  var MB_MAXIMO = 20, MB_IDEAL = 8;
  function telaVideos() {
    var V = E.trabalho.videos = E.trabalho.videos || [];
    var arquivo = h("input", { type: "file", id: "arquivo-video", accept: "video/mp4,video/quicktime", style: "display:none", onchange: function (ev) {
      var a = ev.target.files[0]; ev.target.value = ""; if (!a) return;
      if (!/^video\/(mp4|quicktime)$/.test(a.type)) { aviso("Escolha um vídeo MP4 (o formato do celular)."); return; }
      var mb = a.size / 1024 / 1024;
      if (mb > MB_MAXIMO) { aviso("Este vídeo tem " + mb.toFixed(0) + " MB. O máximo é " + MB_MAXIMO + " MB: corte ou diminua a qualidade antes."); return; }
      var url = URL.createObjectURL(a), vid = document.createElement("video");
      vid.muted = true; vid.preload = "metadata"; vid.src = url; vid.playsInline = true;
      vid.addEventListener("loadeddata", function () { vid.currentTime = Math.min(1, (vid.duration || 2) / 2); });
      vid.addEventListener("seeked", function () {
        var tela2 = document.createElement("canvas"); tela2.width = 360; tela2.height = Math.round(360 * vid.videoHeight / vid.videoWidth) || 640;
        tela2.getContext("2d").drawImage(vid, 0, 0, tela2.width, tela2.height);
        var capa = tela2.toDataURL("image/jpeg", 0.8);
        janela(function (fechar) {
          var titulo = campoTexto("Título do vídeo (para quem não enxerga a tela)", a.name.replace(/\.[^.]+$/, ""), 80);
          var VP = E.trabalho.videos_produto || {};
          var secao = h("select", { id: "secao-v" }, ["Depoimentos", "Como usar e resultados"].map(function (x) { return h("option", { value: x, text: x }); })
            .concat(Object.keys(VP).map(function (k) { var o = h("option", { value: "produto:" + k, text: "Resultado: " + VP[k].produto }); if (tela.produtoVideo === k) o.selected = true; return o; })));
          return [h("h2", { text: "Novo vídeo" }), h("img", { src: capa, alt: "", style: "width:140px;border-radius:12px;margin-bottom:10px" }),
            h("p", { class: mb > MB_IDEAL ? "erro" : "ajuda", text: mb.toFixed(1) + " MB · " + Math.round(vid.duration || 0) + " segundos" +
              (mb > MB_IDEAL ? ". Vídeo pesado: cada play gasta mais créditos. O ideal é até " + MB_IDEAL + " MB." : "") }),
            titulo.el, h("div", { class: "campo" }, h("label", { for: "secao-v", text: "Onde aparece" }), secao),
            h("p", { class: "ajuda", text: "A capa foi tirada do próprio vídeo. Ele só carrega quando a cliente toca no play." }),
            h("div", { class: "acoes" },
              h("button", { class: "botao", onclick: function () {
                if (!titulo.input.value.trim()) { aviso("Coloque um título."); return; }
                var novo = { id: "novo-" + Date.now(), titulo: titulo.input.value.trim(), capa: capa, mb: Math.round(mb * 10) / 10, visivel: true };
                if (secao.value.indexOf("produto:") === 0) { VP[secao.value.slice(8)].videos.push(novo); tela.produtoVideo = secao.value.slice(8); }
                else { novo.secao = secao.value; V.push(novo); }
                guardar(); fechar(); desenhar(); aviso("Vídeo adicionado ao rascunho. Vai para o site quando publicar.");
              } }, "Adicionar"),
              h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))];
        });
      }, { once: true });
    } });
    var total = V.filter(function (v) { return v.visivel; }).reduce(function (t, v) { return t + (v.mb || 0); }, 0);
    return [voltar(function () { tela.sub = null; }), h("h1", { text: "Vídeos" }),
      h("p", { class: "sub", text: "Envie o vídeo direto do celular (MP4, até " + MB_MAXIMO + " MB). Ele fica no site, sem marca de rede social, como pede o Brand Book." }),
      h("div", { class: "acoes", style: "margin-bottom:14px" },
        h("button", { class: "botao", onclick: function () { arquivo.click(); } }, "\u2795 Adicionar vídeo"), arquivo),
      ["Depoimentos", "Como usar e resultados"].map(function (sec) {
        var lista = V.filter(function (v) { return v.secao === sec; });
        return h("div", { class: "cartao" }, h("h3", { text: sec }),
          lista.length ? lista.map(function (v) {
            var i = V.indexOf(v);
            return h("div", { class: "kit" + (v.visivel ? "" : " kit-escondido") },
              v.capa ? h("img", { src: v.capa, alt: "" }) : h("div", { class: "etiqueta", text: "sem capa" }),
              h("div", null, h("strong", { text: v.titulo }),
                h("div", { class: v.mb > MB_IDEAL ? "erro" : "ajuda", text: (v.mb ? v.mb + " MB" : "") + (v.mb > MB_IDEAL ? " · pesado" : "") }),
                h("div", { class: "acoes" },
                  h("button", { class: "icone-bt", "aria-label": "Subir", disabled: i === 0, onclick: function () { V.splice(i - 1, 0, V.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2191"),
                  h("button", { class: "icone-bt", "aria-label": "Descer", disabled: i === V.length - 1, onclick: function () { V.splice(i + 1, 0, V.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2193"),
                  h("label", { class: "chave", style: "border:0;padding:0;gap:6px" }, h("small", { text: v.visivel ? "No site" : "Escondido" }),
                    h("input", { type: "checkbox", checked: v.visivel, onchange: function (ev) { v.visivel = ev.target.checked; guardar(); desenhar(); } })),
                  h("button", { class: "icone-bt", "aria-label": "Tirar o vídeo", onclick: function () {
                    if (!confirm("Tirar o vídeo \u201c" + v.titulo + "\u201d do site?")) return; V.splice(i, 1); guardar(); desenhar();
                  } }, "\uD83D\uDDD1\ufe0f"))));
          }) : h("p", { class: "ajuda", text: "Nenhum vídeo nesta parte." }));
      }),
      cartaoVideosProduto(),
      h("p", { class: total > 40 ? "erro" : "ajuda", text: "Vídeos no site: " + total.toFixed(0) + " MB no total. Cada play gasta créditos da Netlify conforme o tamanho do vídeo (um vídeo de 8 MB gasta uns 0,16 crédito por play)." })];
  }

  function cartaoVideosProduto() {
    var VP = E.trabalho.videos_produto || {}, chaves = Object.keys(VP);
    if (!chaves.length) return null;
    var atual = tela.produtoVideo && VP[tela.produtoVideo] ? tela.produtoVideo : chaves[0], lista = VP[atual].videos;
    var escolha = h("select", { id: "prod-v", onchange: function (ev) { tela.produtoVideo = ev.target.value; desenhar(); } },
      chaves.map(function (k) { var o = h("option", { value: k, text: VP[k].produto + " (" + VP[k].videos.length + ")" }); if (k === atual) o.selected = true; return o; }));
    return h("div", { class: "cartao" }, h("h3", { text: "Resultados de cada produto" }),
      h("p", { class: "sub", text: "Aparecem na página do produto, em \u201cVeja o resultado de quem já usa\u201d. Sem vídeo, a página mostra \u201cEm breve\u201d." }),
      h("div", { class: "campo" }, h("label", { for: "prod-v", text: "Produto" }), escolha),
      lista.length ? lista.map(function (v, i) {
        return h("div", { class: "kit" + (v.visivel === false ? " kit-escondido" : "") },
          v.capa ? h("img", { src: v.capa, alt: "" }) : h("div", { class: "etiqueta", text: "sem capa" }),
          h("div", null, h("strong", { text: v.titulo || v.arquivo || "Vídeo" }),
            h("div", { class: v.mb > MB_IDEAL ? "erro" : "ajuda", text: v.mb ? v.mb + " MB" + (v.mb > MB_IDEAL ? " · pesado (o robô diminui ao publicar)" : "") : "" }),
            h("div", { class: "acoes" },
              h("button", { class: "icone-bt", "aria-label": "Subir", disabled: i === 0, onclick: function () { lista.splice(i - 1, 0, lista.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2191"),
              h("button", { class: "icone-bt", "aria-label": "Descer", disabled: i === lista.length - 1, onclick: function () { lista.splice(i + 1, 0, lista.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2193"),
              h("label", { class: "chave", style: "border:0;padding:0;gap:6px" }, h("small", { text: v.visivel === false ? "Escondido" : "No site" }),
                h("input", { type: "checkbox", checked: v.visivel !== false, onchange: function (ev) { v.visivel = ev.target.checked; guardar(); desenhar(); } })),
              h("button", { class: "icone-bt", "aria-label": "Tirar o vídeo", onclick: function () {
                if (!confirm("Tirar este vídeo do " + VP[atual].produto + "?")) return; lista.splice(i, 1); guardar(); desenhar();
              } }, "\uD83D\uDDD1\ufe0f"))));
      }) : h("p", { class: "ajuda", text: "Nenhum vídeo ainda. No site aparece \u201cEm breve, vídeos de resultado do " + VP[atual].produto + "\u201d." }),
      h("div", { class: "acoes" }, h("button", { class: "botao claro", onclick: function () {
        tela.produtoVideo = atual; document.querySelector("#arquivo-video").click();
      } }, "\u2795 Adicionar vídeo neste produto")));
  }

  function editarPergunta(i) {
    var T = E.trabalho, q = i >= 0 ? T.faq[i] : { p: "", r: "", home: false };
    janela(function (fechar) {
      var p = campoTexto("Pergunta", q.p, 160), r = campoTexto("Resposta", q.r, 800, { area: true });
      var home = h("input", { type: "checkbox", checked: q.home });
      return [h("h2", { text: i >= 0 ? "Editar pergunta" : "Nova pergunta" }), p.el, r.el,
        h("label", { class: "chave" }, h("span", { text: "Mostrar na página inicial" }), home),
        h("div", { class: "acoes" },
          h("button", { class: "botao", onclick: function () {
            if (!p.input.value.trim() || !r.input.value.trim()) { aviso("Preencha a pergunta e a resposta."); return; }
            var nova = { p: p.input.value.trim(), r: r.input.value.trim(), home: home.checked };
            if (i >= 0) T.faq[i] = nova; else T.faq.push(nova);
            guardar(); fechar(); desenhar(); aviso("Salvo!");
          } }, "Salvar"),
          i >= 0 ? h("button", { class: "botao perigo", onclick: function () {
            if (!confirm("Apagar esta pergunta?")) return; T.faq.splice(i, 1); guardar(); fechar(); desenhar();
          } }, "Apagar") : null,
          h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))];
    });
  }

  function telaFamilia(f) {
    var nome = campoTexto("Nome do produto", f.nome, 90), cham = campoTexto("Chamada", f.chamada, 220, { area: true });
    var pq = f.para_quem ? campoTexto("Para quem é", f.para_quem, 220, { area: true }) : null;
    return [voltar(function () { tela.familia = null; }),
      h("div", { class: "cartao" },
        h("label", { class: "chave" }, h("span", null, h("strong", { text: "Aparece no site" })),
          h("input", { type: "checkbox", checked: f.visivel, onchange: function (ev) { f.visivel = ev.target.checked; guardar(); desenhar(); } })),
        nome.el, cham.el, pq ? pq.el : null,
        salvarBotao(function () {
          if (!nome.input.value.trim()) return "O nome não pode ficar vazio.";
          f.nome = nome.input.value.trim(); f.chamada = cham.input.value.trim(); if (pq) f.para_quem = pq.input.value.trim();
        })),
      h("div", { class: "cartao" }, h("h3", { text: "Opções (kits)" }),
        h("p", { class: "sub", text: "O preço vem da Yampi. Para mudar o preço, mude na Yampi e toque em “Buscar preços da Yampi”." }),
        f.kits.map(function (k) { return cartaoKit(k); }),
        h("div", { class: "acoes" }, h("button", { class: "botao claro", onclick: function () { adicionarKit(f); } }, "➕ Adicionar kit da Yampi")))];
  }
  function cartaoKit(k) {
    var foto = fotosTemporarias[k.id] || k.foto;
    var sel = h("select", { "aria-label": "Selo do kit " + k.nome, onchange: function (ev) { k.selo = ev.target.value; guardar(); desenhar(); } },
      SELOS.map(function (s) { var o = h("option", { value: s, text: s || "Sem selo" }); if (s === k.selo) o.selected = true; return o; }));
    var arquivo = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", onchange: function (ev) {
      var a = ev.target.files[0]; if (!a) return;
      if (!/^image\/(jpeg|png|webp)$/.test(a.type)) { aviso("Escolha uma foto JPG, PNG ou WebP."); return; }
      fotosTemporarias[k.id] = URL.createObjectURL(a); k.foto = "nova:" + a.name; guardar(); desenhar();
      aviso("Foto trocada! Na versão real, o celular diminui a foto antes de enviar.");
    } });
    return h("div", { class: "kit" + (k.visivel ? "" : " kit-escondido") },
      h("div", null, foto && foto.indexOf("nova:") !== 0 ? h("img", { src: foto, alt: "" }) : h("div", { class: "etiqueta", text: "foto nova" }),
        h("label", { class: "trocar-foto" }, "Trocar foto", arquivo)),
      h("div", null,
        h("strong", { text: k.nome }), " ", k.selo ? h("span", { class: "etiqueta", text: k.selo }) : null,
        h("div", { class: "ajuda", text: k.itens.join(" + ") }),
        h("div", { class: "preco", text: reais(k.preco) + (k.preco_pix ? " · " + reais(k.preco_pix) + " no Pix" : "") }),
        h("div", { class: "acoes" }, sel,
          h("button", { class: "botao claro", style: "padding:6px 12px;font-size:.8rem", onclick: function () {
            var n = prompt("Nome do kit (até 70 caracteres):", k.nome);
            if (n === null) return; n = n.trim(); if (!n || n.length > 70) { aviso("Nome vazio ou maior que 70 caracteres."); return; }
            k.nome = n; guardar(); desenhar();
          } }, "Renomear"),
          h("label", { class: "chave", style: "border:0;padding:0;gap:6px" }, h("small", { text: k.visivel ? "No site" : "Escondido" }),
            h("input", { type: "checkbox", checked: k.visivel, onchange: function (ev) { k.visivel = ev.target.checked; guardar(); desenhar(); } })))));
  }
  function buscarPrecos() {
    var k = E.trabalho.familias[0].kits[0], novo = k.preco === 290 ? 260 : 290;
    janela(function (fechar) {
      return [h("h2", { text: "Preços da Yampi" }),
        h("p", { class: "sub", text: "Na prévia, a busca é simulada. Na versão real, o painel consulta a Yampi e mostra só o que mudou." }),
        cartaoMudanca({ rotulo: "Gloss Matizado · " + k.nome + ": preço", antes: reais(k.preco), depois: reais(novo) }),
        h("div", { class: "acoes" },
          h("button", { class: "botao", onclick: function () { k.preco = novo; k.preco_pix = Math.round(novo * 0.95 * 100) / 100; guardar(); fechar(); desenhar(); aviso("Preço atualizado no rascunho."); } }, "Trazer para o site"),
          h("button", { class: "botao claro", onclick: fechar }, "Agora não"))];
    });
  }
  function adicionarKit(f) {
    janela(function (fechar) {
      var link = campoTexto("Link ou código do produto na Yampi", "", 300, { ajuda: "Cadastre o produto na Yampi primeiro." });
      return [h("h2", { text: "Adicionar kit da Yampi" }), link.el,
        h("p", { class: "ajuda", text: "Na prévia, a busca é simulada. Na versão real, o painel traz da Yampi o nome, o preço, o preço no Pix, a foto e o código de compra." }),
        h("div", { class: "acoes" },
          h("button", { class: "botao", onclick: function () {
            if (!link.input.value.trim()) { aviso("Cole o link ou o código do produto."); return; }
            f.kits.push({ id: "novo-" + Date.now(), nome: "Kit novo (da Yampi)", itens: [f.curto], preco: 199, preco_pix: 189.05, selo: "Lançamento", foto: f.foto, visivel: true, grupo: "" });
            guardar(); fechar(); desenhar(); aviso("Kit adicionado ao rascunho.");
          } }, "Buscar na Yampi"),
          h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))];
    });
  }

  // ------------------------------------------------------------------ AVALIAÇÕES
  function telaAvaliacoes() {
    var T = E.trabalho;
    var topo = [h("h1", { text: "Avaliações" })];
    var busca = h("input", { type: "text", placeholder: "Buscar por nome, produto ou texto", "aria-label": "Buscar avaliação" });
    var lista = h("div");
    function filtrar() {
      lista.textContent = "";
      var t = busca.value.toLowerCase();
      T.avaliacoes.filter(function (a) { return !t || (a.nome + a.produto + a.texto).toLowerCase().indexOf(t) >= 0; }).slice(0, 30).forEach(function (a) {
        lista.appendChild(h("div", { class: "avaliacao" + (a.oculta ? " kit-escondido" : "") },
          h("div", null, h("span", { class: "estrelas", text: "★★★★★".slice(0, a.nota) }), " ", h("strong", { text: a.nome }), " ",
            a.oculta ? h("span", { class: "etiqueta cinza", text: "escondida" }) : null),
          h("p", { text: a.texto }), h("small", { text: a.produto + " · " + a.data.split("-").reverse().join("/") }),
          h("div", { class: "acoes" },
            h("button", { class: "botao claro", style: "padding:6px 12px;font-size:.8rem", onclick: function () { a.oculta = !a.oculta; guardar(); desenhar(); } }, a.oculta ? "Mostrar no site" : "Esconder do site"),
            a.fotos ? h("label", { class: "chave", style: "border:0;padding:0;gap:6px" }, h("small", { text: "Fotos (" + a.fotos + ") liberadas" }),
              h("input", { type: "checkbox", checked: a.fotos_liberadas, onchange: function (ev) { a.fotos_liberadas = ev.target.checked; guardar(); desenhar(); } })) : null)));
      });
    }
    busca.addEventListener("input", filtrar); filtrar();
    return [topo, h("div", { class: "cartao" },
      h("p", { class: "sub", text: E.trabalho.total_avaliacoes + " avaliações no site. As novas chegam sozinhas da Yampi. O texto e a nota da cliente não podem ser editados." }),
      h("div", { class: "campo" }, busca), lista)];
  }

  // ------------------------------------------------------------------ LINK NA BIO
  function luminancia(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contraste(a, b) { var x = luminancia(a), y = luminancia(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function destinoBio(b) {
    if (b.tipo === "site") return "brumarcosmeticos.com" + b.destino;
    if (b.tipo === "whatsapp") return "WhatsApp da loja: “" + b.destino + "”";
    return b.destino || "⚠ falta o link (o botão não aparece no site até ter link)";
  }
  function telaBio() {
    var B = E.trabalho.bio, cores = B.cores, D = E.trabalho;
    var ok = contraste(cores.principal, cores.fundo) >= 4.5;
    // Celular com a mini-vitrine de verdade (bio.html); o painel manda os dados e ela se redesenha.
    var quadro = h("iframe", { class: "celular-vitrine", src: "bio.html", title: "Como fica o link na bio no celular" });
    window.bioPronta = function () { try { quadro.contentWindow.renderizarBio(B, D); } catch (e) { /* prévia */ } };
    quadro.addEventListener("load", window.bioPronta);
    var frase = campoTexto("Frase de destaque (abaixo do logo)", B.frase, 90, { ajuda: "O logo já traz \u201cO Poder da Transformação\u201d: não repita." });
    var oferta = h("select", { id: "oferta-bio", onchange: function (ev) { B.oferta = ev.target.value; guardar(); desenhar(); } },
      (D.ofertas || []).map(function (o) {
        var opt = h("option", { value: o.id, text: o.nome + " · " + reais(o.por) }); if (o.id === B.oferta) opt.selected = true; return opt;
      }));
    function chave(rotulo, campo) {
      return h("label", { class: "chave" }, h("span", { text: rotulo }),
        h("input", { type: "checkbox", checked: B[campo], onchange: function (ev) { B[campo] = ev.target.checked; guardar(); desenhar(); } }));
    }
    function amostras(lista, campo) {
      return h("div", { class: "paletas" }, lista.map(function (c) {
        return h("button", { class: "paleta", "aria-pressed": cores[campo] === c[0] ? "true" : "false", title: c[1], "aria-label": c[1], onclick: function () {
          var nova = copia(cores); nova[campo] = c[0];
          if (contraste(nova.principal, nova.fundo) < 4.5) {
            // Em vez de recusar, ajusta sozinho a outra cor para continuar fácil de ler.
            var outra = campo === "fundo" ? PRINCIPAIS : FUNDOS, chaveOutra = campo === "fundo" ? "principal" : "fundo";
            var boa = outra.filter(function (o) { var t2 = copia(nova); t2[chaveOutra] = o[0]; return contraste(t2.principal, t2.fundo) >= 4.5; })[0];
            if (!boa) return;
            nova[chaveOutra] = boa[0];
            aviso("Ajustei " + (chaveOutra === "principal" ? "os botões para " : "o fundo para ") + boa[1] + ", para continuar fácil de ler.");
          }
          B.cores = nova; guardar(); desenhar();
        } }, h("span", { style: "width:44px;background:" + c[0] + ";border:1px solid #ddd" }), h("small", { text: c[1], style: "align-self:center;padding:0 6px;font-size:.72rem" }));
      }));
    }
    return [h("h1", { text: "Link na bio" }),
      h("p", { class: "sub", text: "Endereço: brumarcosmeticos.com/bio · coloque uma vez na bio do Instagram e mude tudo por aqui." }),
      h("div", { class: "celular-moldura" }, quadro),
      h("p", { class: "ajuda", style: "text-align:center;margin-bottom:14px", text: "Prévia ao vivo: role dentro do celular para ver tudo" }),
      h("div", { class: "cartao" }, h("h3", { text: "Destaques" }),
        h("div", { class: "campo" }, h("label", { for: "oferta-bio", text: "Oferta em destaque" }), oferta,
          h("div", { class: "ajuda", text: "Preços oficiais do Brand Book. O desconto aparece sozinho, arredondado para baixo." })),
        chave("Mostrar a promoção de Final de Ano (só se o cupom existir na Yampi)", "mostrar_promo"),
        chave("Mostrar as avaliações das clientes", "mostrar_avaliacoes"),
        chave("Mostrar as dúvidas mais perguntadas", "mostrar_duvidas")),
      h("div", { class: "cartao" }, h("h3", { text: "Botões" }),
        B.botoes.map(function (b, i) {
          return h("div", { class: "botao-bio" },
            h("div", { class: "texto" }, h("strong", { text: b.texto }), h("small", { text: destinoBio(b) })),
            h("button", { class: "icone-bt", "aria-label": "Subir", disabled: i === 0, onclick: function () { B.botoes.splice(i - 1, 0, B.botoes.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2191"),
            h("button", { class: "icone-bt", "aria-label": "Descer", disabled: i === B.botoes.length - 1, onclick: function () { B.botoes.splice(i + 1, 0, B.botoes.splice(i, 1)[0]); guardar(); desenhar(); } }, "\u2193"),
            h("button", { class: "icone-bt", "aria-label": "Editar", onclick: function () { editarBotaoBio(i); } }, "\u270f\ufe0f"),
            h("button", { class: "icone-bt", "aria-label": "Apagar", onclick: function () { if (confirm("Apagar o botão \u201c" + b.texto + "\u201d?")) { B.botoes.splice(i, 1); guardar(); desenhar(); } } }, "\uD83D\uDDD1\ufe0f"));
        }),
        h("p", { class: "ajuda", text: "O ícone aparece sozinho: WhatsApp, Shopee, Mercado Livre, loja ou rastreio." }),
        h("div", { class: "acoes" }, h("button", { class: "botao claro", disabled: B.botoes.length >= 15, onclick: function () { editarBotaoBio(-1); } }, "\u2795 Adicionar botão"))),
      h("div", { class: "cartao" }, h("h3", { text: "Frase e cores" }), frase.el,
        h("button", { class: "botao claro", style: "margin-bottom:14px", onclick: function () {
          if (!frase.input.value.trim()) { aviso("A frase não pode ficar vazia."); return; }
          if (/alinh/i.test(frase.input.value)) { aviso("O Brand Book não deixa usar \u201calinha\u201d. Use \u201calisa\u201d ou \u201cliso\u201d."); return; }
          B.frase = frase.input.value.trim(); guardar(); desenhar(); aviso("Salvo!");
        } }, "Salvar frase"),
        h("span", { class: "rotulo", text: "Fundo" }), amostras(FUNDOS, "fundo"),
        h("span", { class: "rotulo", text: "Cor dos botões e destaques" }), amostras(PRINCIPAIS, "principal"),
        h("p", { class: "ajuda", text: "Só as cores do Brand Book. Se uma combinação ficar difícil de ler, o painel ajusta sozinho. O verde fica só no botão de compra, e o vermelho só na promoção." }),
        h("div", { class: "contraste " + (ok ? "ok" : "ruim"), text: ok ? "\u2714 Cores fáceis de ler" : "\u26a0 Escolha outra combinação" }))];
  }
  function editarBotaoBio(i) {
    var B = E.trabalho.bio, b = i >= 0 ? copia(B.botoes[i]) : { texto: "", tipo: "site", destino: "/" };
    var paginas = [["/", "Página inicial"]].concat(E.trabalho.familias.map(function (f) { return ["/produto/" + f.slug + "/", f.curto]; }), [["/#avaliacoes", "Avaliações"], ["/#qual-gloss", "Qual Gloss é o meu?"]]);
    janela(function (fechar) {
      var texto = campoTexto("Texto do botão", b.texto, 40);
      var tipo = h("select", { id: "tipo-bt" }, [["site", "Uma página do site"], ["whatsapp", "WhatsApp da loja"], ["link", "Outro endereço (https)"]].map(function (t) {
        var o = h("option", { value: t[0], text: t[1] }); if (t[0] === b.tipo) o.selected = true; return o;
      }));
      var area = h("div");
      function desenharDestino() {
        area.textContent = "";
        if (tipo.value === "site") {
          var s = h("select", { id: "dest" }, paginas.map(function (p) { var o = h("option", { value: p[0], text: p[1] }); if (p[0] === b.destino) o.selected = true; return o; }));
          area.appendChild(h("div", { class: "campo" }, h("label", { for: "dest", text: "Qual página" }), s));
        } else if (tipo.value === "whatsapp") {
          var m = campoTexto("Mensagem que já vem escrita", b.tipo === "whatsapp" ? b.destino : "Olá! Vim pelo Instagram.", 200, { ajuda: "O número da loja já vem preenchido" });
          m.input.id = "dest"; area.appendChild(m.el);
        } else {
          var l = campoTexto("Endereço", b.tipo === "link" ? b.destino : "https://", 300, { tipo: "url", ajuda: "Só endereços que começam com https://" });
          l.input.id = "dest"; area.appendChild(l.el);
        }
      }
      tipo.addEventListener("change", desenharDestino); desenharDestino();
      return [h("h2", { text: i >= 0 ? "Editar botão" : "Novo botão" }), texto.el,
        h("div", { class: "campo" }, h("label", { for: "tipo-bt", text: "Para onde o botão leva" }), tipo), area,
        h("div", { class: "acoes" },
          h("button", { class: "botao", onclick: function () {
            var d = area.querySelector("#dest").value.trim();
            if (!texto.input.value.trim()) { aviso("Escreva o texto do botão."); return; }
            if (tipo.value === "link" && !/^https:\/\/[^\s]+\.[^\s]+/.test(d)) { aviso("O endereço precisa começar com https:// (endereços inseguros são recusados)."); return; }
            var novo = { texto: texto.input.value.trim(), tipo: tipo.value, destino: d };
            if (i >= 0) B.botoes[i] = novo; else B.botoes.push(novo);
            guardar(); fechar(); desenhar(); aviso("Salvo!");
          } }, "Salvar"),
          h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))];
    });
  }

  // ------------------------------------------------------------------ APROVAÇÕES
  function pendentes() { return E.aprovacoes.filter(function (a) { return a.estado === "pendente"; }); }
  function telaAprovacoes() {
    var p = pendentes();
    if (!responsavel()) {
      var minhas = E.aprovacoes.filter(function (a) { return a.quem === eu().nome; });
      return [h("h1", { text: "Minhas mudanças" }),
        h("p", { class: "sub", text: "O que você enviou para a Bruna e o CEO aprovarem." }),
        minhas.length ? minhas.slice().reverse().map(function (a) {
          return h("div", { class: "cartao" }, h("strong", { text: a.quando + " · " + a.lista.length + " mudança(s)" }), " ",
            h("span", { class: "etiqueta" + (a.estado === "pendente" ? "" : " cinza"), text: { pendente: "esperando", aprovada: "aprovada por " + a.por, devolvida: "devolvida", descartada: "descartada" }[a.estado] }),
            a.recado ? h("p", { class: "erro", text: "Recado: " + a.recado }) : null);
        }) : h("div", { class: "cartao" }, h("p", { text: "Nada enviado ainda. Mexa no que precisar, toque em Salvar e depois em “Enviar para aprovação”." }))];
    }
    return [h("h1", { text: "Aprovações" }),
      h("p", { class: "sub", text: "Mudanças das funcionárias esperando você ou o outro responsável. Basta um aprovar." }),
      p.length ? p.map(function (a) {
        return h("div", { class: "cartao" },
          h("h3", { text: a.quem + " · " + a.quando }), a.lista.map(cartaoMudanca),
          h("div", { class: "acoes" },
            h("button", { class: "botao", disabled: E.usadas >= COTA, onclick: function () {
              a.estado = "aprovada"; a.por = eu().nome; publicar(a.lista, a.quem + " (aprovado por " + eu().nome + ")", a.trabalho);
              aviso("Aprovado e publicado! " + a.quem + " recebe um aviso.");
            } }, "Aprovar e publicar"),
            h("button", { class: "botao claro", onclick: function () {
              var r = prompt("Recado para " + a.quem + " (o que corrigir):", ""); if (r === null) return;
              a.estado = "devolvida"; a.recado = r.slice(0, 300); guardar(); desenhar(); aviso("Devolvido. " + a.quem + " recebe o recado por e-mail.");
            } }, "Devolver com recado"),
            h("button", { class: "botao perigo", onclick: function () { if (!confirm("Descartar estas mudanças?")) return; a.estado = "descartada"; guardar(); desenhar(); } }, "Descartar")));
      }) : h("div", { class: "cartao" }, h("p", { text: "Nenhuma mudança esperando aprovação. ✔" }),
        h("p", { class: "ajuda", text: "Para testar: em “Ver como”, lá em cima, escolha a Ana (funcionária), mude algo, salve e envie para aprovação." }))];
  }

  // ------------------------------------------------------------------ MAIS: acessos e histórico
  function telaMais() {
    if (tela.sub === "historico") {
      return [voltar(function () { tela.sub = null; }), h("h1", { text: "Histórico" }), E.historico.map(function (x, i) {
        return h("div", { class: "cartao" }, h("strong", { text: x.quando + " · " + x.quem }),
          h("ul", null, x.oque.slice(0, 6).map(function (o) { return h("li", { text: o }); }), x.oque.length > 6 ? h("li", { text: "e mais " + (x.oque.length - 6) }) : null),
          i === 0 && responsavel() ? h("button", { class: "botao claro", onclick: function () {
            if (!confirm("Desfazer a última publicação? Conta como 1 publicação.")) return;
            aviso("Na versão real, o site volta como estava antes desta publicação.");
          } }, "↩ Desfazer esta publicação") : null);
      })];
    }
    if (tela.sub === "acessos" && responsavel()) {
      var euMesmo = eu(), admin = euMesmo.papel === "admin";
      var abertos = (E.convites || []).filter(function (c) { return !c.usado && !c.cancelado && Date.now() < c.vence; });
      return [voltar(function () { tela.sub = null; }), h("h1", { text: "Acessos" }),
        h("p", { class: "sub", text: admin ? "Convide a Bruna e o CEO (responsáveis). Depois eles convidam as funcionárias." :
          "Convide funcionárias por um link. Cada pessoa cria o próprio e-mail e senha." }),
        h("div", { class: "acoes", style: "margin-bottom:14px" }, h("button", { class: "botao", onclick: convidar }, "\u2795 Convidar pessoa")),
        abertos.length ? h("div", { class: "cartao" }, h("h3", { text: "Convites esperando" }), abertos.map(function (c) {
          return h("div", { class: "botao-bio" },
            h("div", { class: "texto" }, h("strong", { text: (c.para || "Convite") + " · " + nomePapel(c.papel) }),
              h("small", { text: "Criado por " + c.por + " · vence " + new Date(c.vence).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) })),
            h("button", { class: "botao perigo", style: "padding:6px 12px;font-size:.8rem", onclick: function () {
              c.cancelado = true; guardar(); desenhar(); aviso("Convite cancelado. O link não funciona mais.");
            } }, "Cancelar"));
        })) : null,
        h("div", { class: "cartao" }, h("h3", { text: "Quem tem acesso" }), E.pessoas.map(function (p) {
          var podeDesligar = p.id !== euMesmo.id && (admin ? p.papel !== "admin" : p.papel === "funcionaria");
          return h("div", { class: "botao-bio" },
            h("div", { class: "texto" }, h("strong", { text: p.nome + (p.desligado ? " (desligada)" : "") }),
              h("small", { text: p.email + " · " + nomePapel(p.papel) })),
            podeDesligar ? h("button", { class: "botao " + (p.desligado ? "claro" : "perigo"), style: "padding:6px 12px;font-size:.8rem", onclick: function () {
              p.desligado = !p.desligado; guardar(); desenhar(); aviso(p.desligado ? p.nome + " não consegue mais entrar." : p.nome + " pode entrar de novo.");
            } }, p.desligado ? "Religar" : "Desligar") : null);
        }))];
    }
    var itens = [["🕒", "Histórico", "Quem publicou o quê, e Desfazer", "historico"]];
    if (responsavel()) itens.push(["👥", "Acessos", "Convidar e desligar pessoas", "acessos"]);
    return [h("h1", { text: "Mais" }), h("div", { class: "menu" },
      itens.map(function (it) {
        return h("button", { class: "menu-item", onclick: function () { tela.sub = it[3]; desenhar(); } },
          h("span", { class: "icone", text: it[0] }), h("span", null, h("strong", { text: it[1] }), h("small", { text: it[2] })), h("span", { class: "seta", text: "›" }));
      }),
      h("button", { class: "menu-item", onclick: function () { E.logado = null; guardar(); desenhar(); } },
        h("span", { class: "icone", text: "🚪" }), h("span", null, h("strong", { text: "Sair" }), h("small", { text: eu().email })), h("span", { class: "seta", text: "›" })))];
  }
  // Convite: 1) confirmar e-mail e senha de quem convida; 2) escolher o papel; 3) link de uso único (48 h) para o WhatsApp.
  function convidar() {
    var quem = eu(), admin = quem.papel === "admin";
    janela(function (fechar) {
      var corpo = h("div");
      function passo1() {
        corpo.textContent = "";
        var email = campoTexto("O seu e-mail", "", 120, { tipo: "email" }), senha = campoTexto("A sua senha", "", 64, { tipo: "password" });
        email.el.querySelector(".ajuda").remove(); senha.el.querySelector(".ajuda").remove();
        var erro = h("p", { class: "erro", role: "alert" });
        acrescentar(corpo, [h("h2", { text: "Confirme que é você" }),
          h("p", { class: "sub", text: "Para gerar um convite, digite de novo o seu e-mail e a sua senha. Assim, ninguém gera convites no seu lugar." }),
          email.el, senha.el, erro,
          h("div", { class: "acoes" },
            h("button", { class: "botao", onclick: function () {
              var ok = email.input.value.trim().toLowerCase() === quem.email.toLowerCase() && senha.input.value.length > 0 &&
                (!quem.senhaPrevia || senha.input.value === quem.senhaPrevia);
              if (!ok) { erro.textContent = "E-mail ou senha não conferem com o seu acesso."; return; }
              passo2();
            } }, "Continuar"),
            h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))]);
      }
      function passo2() {
        corpo.textContent = "";
        var para = campoTexto("Para quem é? (só para você lembrar)", "", 60);
        var papel = h("select", { id: "papel-conv" }, (admin ? [["responsavel", "Responsável (como a Bruna e o CEO)"], ["funcionaria", "Funcionária"]] :
          [["funcionaria", "Funcionária"]]).map(function (o) { return h("option", { value: o[0], text: o[1] }); }));
        acrescentar(corpo, [h("h2", { text: "Novo convite" }), para.el,
          h("div", { class: "campo" }, h("label", { for: "papel-conv", text: "Papel" }), papel,
            h("div", { class: "ajuda", text: admin ? "Responsáveis publicam e convidam funcionárias." : "Funcionárias mexem e salvam; você ou o outro responsável aprovam." })),
          h("div", { class: "acoes" },
            h("button", { class: "botao", onclick: function () {
              var c = { codigo: codigoAleatorio(), papel: papel.value, para: para.input.value.trim(), por: quem.nome,
                criado: Date.now(), vence: Date.now() + HORAS_CONVITE * 3600 * 1000 };
              E.convites = E.convites || []; E.convites.push(c); guardar(); passo3(c);
            } }, "Gerar link"),
            h("button", { class: "botao claro", onclick: fechar }, "Cancelar"))]);
      }
      function passo3(c) {
        corpo.textContent = "";
        var link = location.origin + location.pathname + "#convite/" + c.codigo;
        var texto = "Olá" + (c.para ? ", " + c.para : "") + "! Este é o seu convite para o painel da Brumar. Abra o link, " +
          "coloque o seu e-mail e crie a sua senha. Ele vale por 48 horas e funciona uma vez só: " + link;
        var campo = h("input", { type: "text", readonly: true, value: link, "aria-label": "Link do convite" });
        acrescentar(corpo, [h("h2", { text: "Convite pronto" }),
          h("p", { class: "sub", text: "Mande pelo WhatsApp. O link vale por 48 horas e funciona uma vez só." }),
          h("div", { class: "campo" }, campo),
          h("div", { class: "acoes" },
            h("a", { class: "botao", style: "background:#25D366", href: "https://wa.me/?text=" + encodeURIComponent(texto), target: "_blank", rel: "noopener" }, "Mandar pelo WhatsApp"),
            h("button", { class: "botao claro", onclick: function () {
              (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { aviso("Link copiado."); },
                function () { campo.select(); aviso("Selecione e copie o link."); });
            } }, "Copiar link"),
            h("button", { class: "botao claro", onclick: function () { fechar(); desenhar(); } }, "Fechar")),
          h("p", { class: "ajuda", text: "Na prévia, o link abre esta mesma prévia no computador. No painel de verdade, ele abre brumarcosmeticos.com/painel." })]);
      }
      passo1();
      return corpo;
    });
  }

  // ------------------------------------------------------------------ ACEITAR CONVITE
  function telaConvite(codigo) {
    var c = (E.convites || []).filter(function (x) { return x.codigo === codigo; })[0];
    var valido = c && !c.usado && !c.cancelado && Date.now() < c.vence;
    if (!valido) {
      return h("div", { class: "entrada" }, h("div", { class: "cartao" },
        h("img", { src: "img/logo.png", alt: "Brumar Cosméticos" }), h("h1", { text: "Convite vencido" }),
        h("p", { class: "sub", text: "Este link já foi usado, foi cancelado ou passou de 48 horas. Peça um convite novo para a Bruna ou o CEO." })));
    }
    var nome = campoTexto("Seu nome", c.para, 60), email = campoTexto("Seu e-mail", "", 120, { tipo: "email" });
    var senha = campoTexto("Crie uma senha (mínimo 10 caracteres)", "", 64, { tipo: "password" }), senha2 = campoTexto("Repita a senha", "", 64, { tipo: "password" });
    var erro = h("p", { class: "erro", role: "alert" });
    return h("div", { class: "entrada" }, h("div", { class: "cartao" },
      h("img", { src: "img/logo.png", alt: "Brumar Cosméticos" }), h("h1", { text: "Bem-vinda ao painel" }),
      h("p", { class: "sub", text: c.por + " convidou você como " + nomePapel(c.papel) + "." }),
      h("form", { onsubmit: function (ev) {
        ev.preventDefault();
        var e = email.input.value.trim().toLowerCase();
        if (!nome.input.value.trim()) { erro.textContent = "Coloque o seu nome."; return; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { erro.textContent = "E-mail inválido."; return; }
        if (E.pessoas.some(function (x) { return x.email.toLowerCase() === e; })) { erro.textContent = "Já existe um acesso com este e-mail."; return; }
        if (senha.input.value.length < 10) { erro.textContent = "A senha precisa ter pelo menos 10 caracteres."; return; }
        if (senha.input.value !== senha2.input.value) { erro.textContent = "As duas senhas não são iguais."; return; }
        var nova = { id: "p" + Date.now(), nome: nome.input.value.trim(), email: e, papel: c.papel, senhaPrevia: senha.input.value };
        E.pessoas.push(nova); c.usado = true; c.usadoPor = nova.nome; E.logado = nova.id; guardar();
        history.replaceState(null, "", location.pathname); desenhar(); aviso("Acesso criado! Bem-vinda, " + nova.nome + ".");
      } }, nome.el, email.el, senha.el, senha2.el, erro, h("button", { class: "botao cheio", type: "submit" }, "Criar meu acesso")),
      h("p", { class: "ajuda", text: "Na versão real, a senha fica guardada embaralhada e ninguém consegue ver." })));
  }

  // ------------------------------------------------------------------ ENTRAR
  function telaEntrada() {
    var email = campoTexto("E-mail", "", 120, { tipo: "email" }), senha = campoTexto("Senha", "", 64, { tipo: "password" });
    email.el.querySelector(".ajuda").remove(); senha.el.querySelector(".ajuda").remove();
    var erro = h("p", { class: "erro", role: "alert" });
    return h("div", { class: "entrada" }, h("div", { class: "cartao" },
      h("img", { src: "img/logo.png", alt: "Brumar Cosméticos" }), h("h1", { text: "Painel da loja" }),
      h("p", { class: "sub", text: "Entre com o seu e-mail e senha." }),
      h("form", { onsubmit: function (ev) {
        ev.preventDefault();
        var p = E.pessoas.filter(function (x) { return x.email === email.input.value.trim().toLowerCase() && !x.desligado; })[0];
        if (!p || senha.input.value.length < 1 || (p.senhaPrevia && senha.input.value !== p.senhaPrevia)) { erro.textContent = "E-mail ou senha incorretos."; return; }
        E.logado = p.id; guardar(); document.getElementById("ver-como").value = p.id; desenhar();
      } }, email.el, senha.el, erro, h("button", { class: "botao cheio", type: "submit" }, "Entrar")),
      h("p", { class: "ajuda", text: "Esqueceu a senha? Peça um convite novo para a Bruna ou o CEO." }),
      h("p", { class: "ajuda", style: "margin-top:12px", text: "Na prévia: use bruna@exemplo.com, ceo@exemplo.com ou ana@exemplo.com com qualquer senha. Na versão real, 5 senhas erradas bloqueiam por 15 minutos." })));
  }

  // ------------------------------------------------------------------ montar a tela
  function desenhar() {
    var app = document.getElementById("app");
    app.textContent = "";
    var conv = location.hash.match(/^#convite\/([0-9a-f]+)$/);
    if (conv) { app.appendChild(telaConvite(conv[1])); return; }
    if (!eu() || eu().desligado) { E.logado = null; app.appendChild(telaEntrada()); return; }
    var p = eu(), lista = mudancas(E.publicado, E.trabalho), np = pendentes().length;
    var topo = h("header", { class: "topo" },
      h("div", { class: "topo-linha" }, h("img", { class: "topo-logo", src: "img/logo.png", alt: "Brumar Cosméticos" }),
        h("div", { class: "quem" }, h("strong", { text: p.nome }), nomePapel(p.papel))),
      responsavel() ? medidor() : null);
    var faixa = lista.length ? h("div", { class: "rascunho" },
      h("span", { text: lista.length + (lista.length === 1 ? " mudança ainda não publicada" : " mudanças ainda não publicadas") }),
      h("button", { class: "botao", onclick: abrirPublicar }, responsavel() ? "Publicar" : "Enviar para aprovação")) : null;
    var corpo = { site: telaSite, bio: telaBio, aval: telaAvaliacoes, aprov: telaAprovacoes, mais: telaMais }[tela.aba]();
    var abas = [["site", "🏪", "Site"], ["bio", "🔗", "Link na bio"], ["aval", "⭐", "Avaliações"],
      ["aprov", "✅", responsavel() ? "Aprovações" : "Enviadas"], ["mais", "☰", "Mais"]];
    var nav = h("nav", { class: "nav", "aria-label": "Seções do painel" }, h("div", { class: "nav-dentro" }, abas.map(function (a) {
      return h("button", { "aria-current": tela.aba === a[0] ? "page" : null, onclick: function () { tela.aba = a[0]; tela.sub = null; tela.familia = null; desenhar(); window.scrollTo(0, 0); } },
        h("span", { class: "ic", text: a[1] }), a[2], a[0] === "aprov" && responsavel() && np ? h("span", { class: "badge", text: np }) : null);
    })));
    app.appendChild(h("div", { class: "casca" }, topo, faixa, h("main", { class: "conteudo" }, corpo), nav));
    document.documentElement.style.setProperty("--altura-topo", topo.offsetHeight + "px");
  }

  document.getElementById("ver-como").addEventListener("change", function (ev) {
    E.logado = ev.target.value; tela = { aba: "site", sub: null, familia: null }; guardar(); desenhar();
  });
  document.getElementById("recomecar").addEventListener("click", function () {
    if (!confirm("Apagar tudo o que foi mexido nesta prévia e começar de novo?")) return;
    E = novoEstado(); fotosTemporarias = {}; guardar(); tela = { aba: "site", sub: null, familia: null }; desenhar();
  });
  // Atalho só da prévia: #pessoa/aba/subtela abre direto numa tela (ex.: #bruna/bio, #bruna/site/produtos, #ana/aval)
  window.addEventListener("hashchange", function () { if (/^#convite\//.test(location.hash)) desenhar(); });
  var atalho = location.hash.slice(1).split("/");
  if (atalho[0] && E.pessoas.some(function (p) { return p.id === atalho[0]; })) {
    E.logado = atalho[0];
    if (["site", "bio", "aval", "aprov", "mais"].indexOf(atalho[1]) >= 0) tela.aba = atalho[1];
    if (atalho[2]) tela.sub = atalho[2];
    if (atalho[3] !== undefined) tela.familia = Number(atalho[3]);
  }
  if (E.logado) document.getElementById("ver-como").value = E.logado;
  desenhar();
})();
