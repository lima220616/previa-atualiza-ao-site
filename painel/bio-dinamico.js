/* Deixa a mini-vitrine do link na bio editável pelo painel (só na prévia). O painel chama window.renderizarBio(bio, dados).
   Textos entram sempre como texto (textContent); só os ícones fixos da marca entram como SVG. */
(function () {
  "use strict";
  var LINHA = {
    sacola: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    pino: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    estrela: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  function el(tag, cls, texto) { var e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; }
  function icone(b) {
    var d = (b.destino || "").toLowerCase(), span = el("span", "ic");
    var marca = function (fundo, svg) { span.className = "ic marca"; span.style.background = fundo; span.innerHTML = svg; return span; };
    var M = window.ICONES_MARCA || {};
    if (b.tipo === "whatsapp" || d.indexOf("whatsapp.com") >= 0 || d.indexOf("wa.me") >= 0) return marca("#25D366", M.whatsapp || "");
    if (d.indexOf("shopee") >= 0) return marca("#EE4D2D", M.shopee || "");
    if (d.indexOf("mercadoli") >= 0) {
      return marca("#FFE600", '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="15.5" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="9" fill="#2D3277">ML</text></svg>');
    }
    var nome = b.tipo === "site" ? (d.indexOf("avaliac") >= 0 ? "estrela" : "sacola") : (d.indexOf("minha-conta") >= 0 ? "pino" : "link");
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + LINHA[nome] + "</svg>";
    return span;
  }
  function legenda(b) {
    if (b.tipo === "site") return "brumarcosmeticos.com";
    if (b.tipo === "whatsapp") return "Atendimento no WhatsApp";
    var d = (b.destino || "").toLowerCase();
    if (d.indexOf("chat.whatsapp") >= 0) return "Grupo no WhatsApp";
    if (d.indexOf("shopee") >= 0) return "Compre com a garantia Shopee";
    if (d.indexOf("mercadoli") >= 0) return "Compre com a proteção do Mercado Livre";
    if (d.indexOf("minha-conta") >= 0) return "Acompanhe a sua entrega";
    return d.replace(/^https:\/\//, "").split("/")[0];
  }
  function reais(v) { return "R$ " + Number(v).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d),)/g, "."); }
  function blocoDepois(h2Texto) {
    var h2 = [].slice.call(document.querySelectorAll("h2")).filter(function (x) { return x.textContent.indexOf(h2Texto) === 0; })[0];
    var lista = []; var n = h2;
    while (n) { lista.push(n); n = n.nextElementSibling; if (!n || n.tagName === "H2" || n.classList.contains("garantias")) break; }
    return lista;
  }
  window.renderizarBio = function (B, D) {
    var raiz = document.documentElement;
    raiz.style.setProperty("--rosa", B.cores.principal);
    document.querySelector(".pagina").style.background = B.cores.fundo;
    document.body.style.background = B.cores.fundo;
    var prova = document.querySelector(".prova"); if (prova) prova.textContent = B.frase;
    // oferta em destaque
    var o = (D.ofertas || []).filter(function (x) { return x.id === B.oferta; })[0];
    var caixa = document.querySelector(".oferta");
    if (o && caixa) {
      var off = Math.floor((o.de - o.por) / o.de * 100);
      caixa.querySelector(".oferta-topo span").textContent = o.selo;
      caixa.querySelector(".selo-off").textContent = off + "% OFF";
      var img = caixa.querySelector("img"); img.src = o.foto; img.alt = o.nome;
      caixa.querySelector("h3").textContent = o.nome;
      caixa.querySelector(".itens").textContent = o.itens;
      caixa.querySelector(".de").textContent = "De " + reais(o.de);
      caixa.querySelector(".por").textContent = reais(o.por);
      caixa.querySelector(".pix").textContent = reais(o.pix) + " no Pix";
      caixa.querySelector(".economia").textContent = "Você economiza " + reais(o.de - o.por);
      document.querySelector(".comprar").textContent = "Quero meu " + o.curto;
    }
    var promo = document.querySelector(".promo"); if (promo) promo.style.display = B.mostrar_promo ? "" : "none";
    // botões
    var nav = document.querySelector("nav.links"); nav.textContent = "";
    B.botoes.forEach(function (b) {
      if (b.tipo === "link" && !b.destino) return;
      var a = el("a", "link"); a.href = "#"; a.addEventListener("click", function (ev) { ev.preventDefault(); });
      var txt = el("span", "link-txt"); txt.appendChild(el("strong", null, b.texto)); txt.appendChild(el("small", null, legenda(b)));
      a.appendChild(icone(b)); a.appendChild(txt); a.appendChild(el("span", "seta", "›"));
      nav.appendChild(a);
    });
    blocoDepois("O que dizem").forEach(function (x) { x.style.display = B.mostrar_avaliacoes ? "" : "none"; });
    blocoDepois("Dúvidas").forEach(function (x) { x.style.display = B.mostrar_duvidas ? "" : "none"; });
  };
  if (window.parent && window.parent !== window && window.parent.bioPronta) window.parent.bioPronta();
})();
