/* Brumar: medição das visitas e dos anúncios (Pixel da Meta e Google Analytics 4, e a conversão do Google Ads quando
   houver), com o aviso de cookies da LGPD. Nada da Meta nem do Google carrega antes do "Aceitar". A escolha fica no
   navegador ("brumar_cookies" = "sim" ou "nao"); qualquer elemento com data-cookies reabre o aviso. Os números vêm do
   próprio <script> (data-pixel, data-ga, data-ads, data-ads-lead: molde/partes/moldura/cabeca-comum.mjs). Evento que
   acontece antes do aceite não conta (não fica guardado para depois). Nenhum evento leva nome, e-mail ou WhatsApp.
   Roda na inicial, na /bio, na 404 e nas páginas das políticas; nunca na prévia do painel (<html data-previa>). No
   computador (localhost, 127.0.0.1, [::1], *.localhost, *.test) o aviso aparece, mas nada da Meta nem do Google carrega
   (testes e "Ver site no computador" não sujam a medição). */
(function () {
  "use strict";
  var eu = document.currentScript;
  if (!eu || document.documentElement.hasAttribute("data-previa")) return;
  function numero(nome, formato) { var v = eu.getAttribute(nome) || ""; return formato.test(v) ? v : ""; }
  var PIXEL = numero("data-pixel", /^\d{10,20}$/), GA = numero("data-ga", /^G-[A-Z0-9]{6,15}$/);
  var ADS = numero("data-ads", /^AW-\d{6,15}$/), ROTULO = ADS ? numero("data-ads-lead", /^[A-Za-z0-9_-]{4,40}$/) : "";
  if (!PIXEL && !GA && !ADS) return;
  var host = String(location.hostname || "").toLowerCase();
  var LOCAL = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1" || /\.(localhost|test)$/.test(host);

  var CHAVE = "brumar_cookies";
  function escolha() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) { /* aba anônima: vale só nesta visita */ } }

  // ligado = as ferramentas já foram carregadas nesta visita; permitido = a pessoa aceitou (e não recusou depois).
  var ligado = false, permitido = false;
  function meta() { if (permitido && PIXEL && window.fbq) window.fbq.apply(window, arguments); }
  function google() { if (permitido && (GA || ADS) && window.gtag) window.gtag.apply(window, arguments); }

  function carregar(endereco) {
    var s = document.createElement("script");
    s.async = true; s.src = endereco;
    document.head.appendChild(s);
  }

  // O Google respeita esta chave (window["ga-disable-G-..."] = true): enquanto estiver ligada, não mede nada.
  function bloquearGoogle(sim) {
    if (GA) window["ga-disable-" + GA] = sim;
    if (ADS) window["ga-disable-" + ADS] = sim;
  }

  // Apaga os cookies da Meta (_fbp, _fbc) e do Google (_ga, _ga_..., _gcl_...). Eles podem ter sido gravados no
  // domínio inteiro (.brumarcosmeticos.com) ou só neste endereço: tenta todos os jeitos (apagar o que não existe não
  // faz mal).
  function apagarCookies() {
    var nomes = String(document.cookie || "").split(";").map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return /^(_ga|_ga_[A-Za-z0-9_-]+|_gcl_[A-Za-z0-9_-]+|_fbp|_fbc)$/.test(n); });
    if (!nomes.length) return;
    var dominios = [""], partes = host.split(".");
    if (!LOCAL && partes.length > 1) {
      for (var i = 0; i < partes.length - 1; i++) {
        var d = partes.slice(i).join(".");
        dominios.push(";domain=" + d, ";domain=." + d);
      }
    }
    nomes.forEach(function (n) {
      dominios.forEach(function (d) { document.cookie = n + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=0;path=/" + d; });
    });
  }

  function ligar() {
    if (LOCAL) return; // no computador: nunca carrega a Meta nem o Google
    permitido = true;
    bloquearGoogle(false);
    if (ligado) {
      // aceitou de novo na mesma visita, depois de recusar
      if (PIXEL && window.fbq) window.fbq("consent", "grant");
      if (window.gtag) window.gtag("consent", "update", { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
      return;
    }
    ligado = true;
    if (PIXEL) {
      // o começo padrão do Pixel (o mesmo do código da Meta), escrito aqui porque programa dentro da página é proibido
      if (!window.fbq) {
        var f = window.fbq = function () { if (f.callMethod) f.callMethod.apply(f, arguments); else f.queue.push(arguments); };
        if (!window._fbq) window._fbq = f;
        f.push = f; f.loaded = true; f.version = "2.0"; f.queue = [];
      }
      // a troca de tela (âncora) não conta como PageView sozinha: quem manda a visita é este programa (visita())
      window.fbq.disablePushState = true;
      carregar("https://connect.facebook.net/en_US/fbevents.js");
      // o Pixel não lê sozinho os campos dos formulários (nome, e-mail, WhatsApp): só os eventos que mandamos
      window.fbq("set", "autoConfig", false, PIXEL);
      window.fbq("init", PIXEL);
    }
    if (GA || ADS) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      // a visita é mandada por este programa (visita()), para não contar duas vezes no carregamento
      if (GA) window.gtag("config", GA, { send_page_view: false });
      if (ADS) window.gtag("config", ADS);
      carregar("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA || ADS));
    }
    ultima = tela();
    visita();
  }

  function desligar() {
    permitido = false;
    bloquearGoogle(true);
    apagarCookies();
    if (!ligado) return;
    if (PIXEL && window.fbq) window.fbq("consent", "revoke");
    if (window.gtag) window.gtag("consent", "update", { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Telas: o site é uma página só; cada tela é uma <section class="view" id="p-..."> aberta pela âncora (bloco-01.js,
  // route). Qualquer outra âncora (#mais-vendido, #inicio...) é a inicial.
  function tela() {
    var h = location.hash;
    if (h.indexOf("#p-") !== 0) return null;
    var t = document.getElementById(h.slice(1));
    return t && t.classList.contains("view") ? t : null;
  }
  var ultima = null;

  function preco(b) {
    var v = b ? parseFloat(b.getAttribute("data-price") || b.getAttribute("data-p") || "") : NaN;
    return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0;
  }
  function texto(el) { return el ? String(el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100) : ""; }

  function visita() {
    var t = tela();
    var titulo = t ? (texto(t.querySelector("h1, .t1")) || t.id) + " · " + document.title : document.title;
    meta("track", "PageView");
    google("event", "page_view", { page_location: location.href, page_title: titulo });
    if (t && t.classList.contains("pp2")) {
      // o mesmo identificador do AddToCart (o data-kit do botão grande da tela); o nome da tela só como reserva
      var b = t.querySelector("button.buy.big[data-kit]") || t.querySelector("button.buy[data-kit]");
      var id = (b ? b.getAttribute("data-kit") : "") || t.getAttribute("data-slug") || t.id.slice(2);
      var nome = texto(t.querySelector("h1, .t1")) || (b ? b.getAttribute("data-name") : "") || id, valor = preco(b);
      meta("track", "ViewContent", { content_name: nome, content_ids: [id], content_type: "product", value: valor, currency: "BRL" });
      google("event", "view_item", { currency: "BRL", value: valor, items: [{ item_id: id, item_name: nome, price: valor }] });
    }
  }

  window.addEventListener("hashchange", function () {
    if (aviso && !aviso.hidden) setTimeout(posicionarAviso, 0); // a tela nova pode ter (ou não) a barra de compra
    var t = tela();
    if (t === ultima) return;
    ultima = t;
    visita();
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Cliques (fase de captura: conta antes de o botão levar para o pagamento ou para o WhatsApp).
  function lead(nome, metodo) {
    meta("track", "Lead", { content_name: nome });
    google("event", "generate_lead", { method: metodo, transport_type: "beacon" });
    if (ADS && ROTULO) google("event", "conversion", { send_to: ADS + "/" + ROTULO, transport_type: "beacon" });
  }

  document.addEventListener("click", function (e) {
    var alvo = e.target && e.target.closest ? e.target : null;
    if (!alvo) return;
    var cookies = alvo.closest("[data-cookies]");
    if (cookies) { e.preventDefault(); mostrarAviso(true); return; }
    if (!permitido) return;
    var b = alvo.closest("button.buy[data-name]");
    if (b) {
      var nome = String(b.getAttribute("data-name") || "").slice(0, 100), valor = preco(b);
      var t = b.closest("section.view.pp2"), id = b.getAttribute("data-kit") || (t ? t.getAttribute("data-slug") : "") || nome;
      meta("track", "AddToCart", { content_name: nome, content_ids: [id], content_type: "product", value: valor, currency: "BRL" });
      google("event", "add_to_cart", { currency: "BRL", value: valor, items: [{ item_id: id, item_name: nome, price: valor, quantity: 1 }] });
      return;
    }
    var a = alvo.closest("a[href]");
    if (!a) return;
    var href = String(a.href || "");
    if (/^https?:\/\/chat\.whatsapp\.com\//i.test(href)) { lead("Grupo VIP", "grupo_vip"); return; }
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
      // onde: as classes do botão (a.wa = o flutuante), nunca o endereço (ele leva o texto da mensagem)
      var onde = String(a.getAttribute("class") || "link").slice(0, 60);
      meta("track", "Contact");
      google("event", "contact", { method: "whatsapp", link_classes: onde, transport_type: "beacon" });
    }
  }, true);

  // Avisos dos formulários (os programas dos formulários disparam depois de um envio que deu certo).
  document.addEventListener("brumar:lead", function (e) {
    var origem = e && e.detail && e.detail.origem;
    origem = origem === "pop-up" || origem === "ofertas" ? origem : "site";
    lead("Cadastro WhatsApp " + origem, "cadastro_" + origem.replace("-", "_"));
  });
  document.addEventListener("brumar:avaliacao", function (e) {
    var produto = String((e && e.detail && e.detail.produto) || "");
    // avaliação não é evento padrão do Pixel: só o Google
    google("event", "avaliacao_enviada", { produto: /^[a-z0-9-]{1,60}$/.test(produto) ? produto : "outro" });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // O aviso de cookies: no rodapé da tela, pequeno, sem cobrir o botão do WhatsApp (a.wa) nem a barra fixa de compra
  // das telas de produto (.sticky, com o botão Comprar): com a barra visível, o aviso fica acima dela. "Aceitar" e "Recusar" do
  // mesmo tamanho e do mesmo jeito (recusar tem de ser tão fácil quanto aceitar). Acima da página, abaixo das janelas.
  var ESTILO = ".ck{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:36;"
    + "max-width:440px;box-sizing:border-box;background:#fff;color:var(--vinho,#8A2E48);border:1.5px solid var(--borda,#F3D3DA);"
    + "border-radius:14px;box-shadow:0 8px 28px rgba(138,46,72,.2);padding:12px 14px;"
    + "font-family:var(--sans,'Montserrat',Helvetica,Arial,sans-serif);font-size:13px;line-height:1.45;text-align:left}"
    + ".ck.ck-wa{right:86px}.ck[hidden]{display:none}.ck p{margin:0 0 10px}"
    + "@media (max-width:480px){.ck{padding:9px 11px;font-size:12px;line-height:1.4;border-radius:12px}.ck p{margin:0 0 7px}"
    + ".ck-b button{min-height:40px;padding:6px 8px;font-size:13px}}"
    + ".ck a{color:var(--rosa,#B84060);font-weight:700}"
    + ".ck-b{display:flex;gap:8px}.ck-b button{flex:1 1 0;min-width:0;min-height:44px;margin:0;padding:8px 10px;"
    + "border:2px solid var(--rosa,#B84060);border-radius:10px;background:#fff;color:var(--rosa,#B84060);"
    + "font-family:inherit;font-size:14px;font-weight:700;cursor:pointer}"
    + ".ck-b button:hover{background:var(--bebe,#FCE7EB)}"
    + ".ck button:focus-visible,.ck a:focus-visible{outline:3px solid var(--vinho,#8A2E48);outline-offset:2px}";
  var aviso = null;

  function montarAviso() {
    var estilo = document.createElement("style");
    estilo.textContent = ESTILO;
    document.head.appendChild(estilo);
    aviso = document.createElement("div");
    aviso.className = "ck";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    var p = document.createElement("p");
    p.appendChild(document.createTextNode("Usamos cookies para entender as visitas e melhorar nossos anúncios (Meta e Google). Você escolhe. "));
    var mais = document.createElement("a");
    mais.href = "/politica-de-privacidade/";
    mais.textContent = "Saiba mais";
    p.appendChild(mais);
    var botoes = document.createElement("div");
    botoes.className = "ck-b";
    function botao(nome, fazer) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = nome;
      b.addEventListener("click", function () { fazer(); aviso.hidden = true; });
      botoes.appendChild(b);
      return b;
    }
    aviso.aceitar = botao("Aceitar", function () { guardar("sim"); ligar(); });
    botao("Recusar", function () { guardar("nao"); desligar(); });
    aviso.appendChild(p);
    aviso.appendChild(botoes);
    document.body.appendChild(aviso);
  }

  // Visível de verdade: com tamanho na tela (as telas fechadas e o que está escondido medem 0). offsetParent não
  // serve aqui: em quem tem position:fixed (a barra e o botão do WhatsApp) ele é sempre null.
  function visivel(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function barraDeCompra() {
    var barras = document.querySelectorAll(".sticky");
    for (var i = 0; i < barras.length; i++) if (visivel(barras[i])) return barras[i];
    return null;
  }
  // Acima da barra de compra (altura dela + 12px) quando ela aparece; folga à direita só com o WhatsApp à vista.
  function posicionarAviso() {
    if (!aviso || aviso.hidden) return;
    var barra = barraDeCompra();
    aviso.style.bottom = barra ? Math.ceil(barra.getBoundingClientRect().height) + 12 + "px" : "";
    var wa = document.querySelectorAll("a.wa"), comWa = false;
    for (var i = 0; i < wa.length; i++) if (visivel(wa[i])) comWa = true;
    aviso.classList.toggle("ck-wa", comWa);
  }
  window.addEventListener("resize", posicionarAviso);

  function mostrarAviso(focar) {
    if (!aviso) montarAviso();
    aviso.hidden = false;
    posicionarAviso();
    if (focar) aviso.aceitar.focus();
  }

  var feita = escolha();
  if (feita === "sim") ligar();
  else if (feita !== "nao") mostrarAviso(false);
})();
