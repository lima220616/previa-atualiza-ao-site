/* Prévia do link na bio no painel (sem o molde da Opção A): desenha por cima da página /bio de verdade o que está no
   rascunho. Cópia de painel-online/previa/bio-dinamico.js (a prévia antiga, que já funcionou), ajustada ao formato de
   26/10: oferta = um kit (preços já contados pelo painel), botões com nome, texto e tipo (loja, grupo-vip, whatsapp,
   shopee, mercado-livre, rastrear). O painel chama window.renderizarBio(bio, dados) por meio de iniciar.js.
   Textos entram sempre como texto (textContent); só os ícones fixos da marca entram como SVG. */
(function () {
  "use strict";
  var LINHA = {
    sacola: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    pino: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function el(tag, cls, texto) { var e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; }
  // Tipo de cada botão da página de hoje, pelo endereço (para reaproveitar o ícone de verdade de cada um).
  function tipoPeloLink(href) {
    var d = String(href || "").toLowerCase();
    if (d.indexOf("chat.whatsapp.com") >= 0) return "grupo-vip";
    if (d.indexOf("wa.me") >= 0 || d.indexOf("api.whatsapp") >= 0) return "whatsapp";
    if (d.indexOf("shopee") >= 0) return "shopee";
    if (d.indexOf("mercadoli") >= 0) return "mercado-livre";
    if (d.indexOf("minha-conta") >= 0) return "rastrear";
    return "loja";
  }
  function iconeDeReserva(tipo) {
    var span = el("span", "ic"), M = window.ICONES_MARCA || {};
    var marca = function (fundo, svg) { span.className = "ic marca"; span.style.background = fundo; span.innerHTML = svg; return span; };
    if (tipo === "whatsapp" || tipo === "grupo-vip") return marca("#25D366", M.whatsapp || "");
    if (tipo === "shopee") return marca("#EE4D2D", M.shopee || "");
    if (tipo === "mercado-livre") {
      return marca("#FFE600", '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="15.5" text-anchor="middle" font-family="Montserrat,Arial" font-weight="800" font-size="9" fill="#2D3277">ML</text></svg>');
    }
    var nome = tipo === "loja" ? "sacola" : tipo === "rastrear" ? "pino" : "link";
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + LINHA[nome] + "</svg>";
    return span;
  }
  function mostrar(no, sim) { if (no) no.style.display = sim ? "" : "none"; }
  function blocoDepois(h2Texto) {
    var h2 = [].slice.call(document.querySelectorAll("h2")).filter(function (x) { return x.textContent.indexOf(h2Texto) === 0; })[0];
    var lista = []; var n = h2;
    while (n) { lista.push(n); n = n.nextElementSibling; if (!n || n.tagName === "H2" || n.classList.contains("garantias")) break; }
    return lista;
  }
  // B = { frase, cores: { fundo, principal }, oferta, mostrar_promo, mostrar_avaliacoes, mostrar_duvidas, botoes: [{ nome, texto, tipo }] }
  // D = { ofertas: [{ id, nome, curto, itens, selo, botao, foto, precos: { por, pix, de, off, economia } }] }
  window.renderizarBio = function (B, D) {
    var raiz = document.documentElement, pagina = document.querySelector(".pagina");
    if (B.cores.principal) raiz.style.setProperty("--rosa", B.cores.principal);
    if (B.cores.fundo) { if (pagina) pagina.style.background = B.cores.fundo; document.body.style.background = B.cores.fundo; }
    var prova = document.querySelector(".prova"); if (prova) prova.textContent = B.frase;
    // oferta em destaque (um kit de kits.json)
    var o = (D.ofertas || []).filter(function (x) { return x.id === B.oferta; })[0];
    var caixa = document.querySelector(".oferta");
    if (o && caixa) {
      var p = o.precos || {};
      var selo = caixa.querySelector(".oferta-topo span"); if (selo) selo.textContent = o.selo || "";
      var off = caixa.querySelector(".selo-off"); if (off) { off.textContent = p.off || ""; mostrar(off, p.off); }
      var img = caixa.querySelector("img"); if (img && o.foto) { img.src = o.foto; img.alt = o.nome; }
      caixa.querySelector("h3").textContent = o.nome;
      caixa.querySelector(".itens").textContent = o.itens;
      var de = caixa.querySelector(".de"); if (de) { de.textContent = p.de ? "De " + p.de : ""; mostrar(de, p.de); }
      caixa.querySelector(".por").textContent = p.por || "";
      caixa.querySelector(".pix").textContent = p.pix ? p.pix + " no Pix" : "";
      var eco = caixa.querySelector(".economia"); if (eco) { eco.textContent = p.economia ? "Você economiza " + p.economia : ""; mostrar(eco, p.economia); }
      var comprar = document.querySelector(".comprar"); if (comprar) comprar.textContent = o.botao || "Quero meu " + o.curto;
    }
    mostrar(caixa, Boolean(o));
    mostrar(document.querySelector(".promo"), B.mostrar_promo);
    // botões: os ícones de verdade da página (pelo tipo), na ordem e com os textos do painel
    var nav = document.querySelector("nav.links");
    if (nav) {
      var icones = {};
      [].slice.call(nav.querySelectorAll("a.link")).forEach(function (a) {
        var ic = a.querySelector(".ic"), tipo = tipoPeloLink(a.getAttribute("href"));
        if (ic && !icones[tipo]) icones[tipo] = ic.cloneNode(true);
      });
      nav.textContent = "";
      B.botoes.forEach(function (b) {
        var a = el("a", "link"); a.href = "#"; a.addEventListener("click", function (ev) { ev.preventDefault(); });
        var txt = el("span", "link-txt"); txt.appendChild(el("strong", null, b.nome)); txt.appendChild(el("small", null, b.texto));
        a.appendChild(icones[b.tipo] ? icones[b.tipo].cloneNode(true) : iconeDeReserva(b.tipo)); a.appendChild(txt);
        var seta = el("span", "seta", "›"); seta.setAttribute("aria-hidden", "true"); a.appendChild(seta);
        nav.appendChild(a);
      });
    }
    blocoDepois("O que dizem").forEach(function (x) { mostrar(x, B.mostrar_avaliacoes); });
    blocoDepois("Dúvidas").forEach(function (x) { mostrar(x, B.mostrar_duvidas); });
  };
})();
