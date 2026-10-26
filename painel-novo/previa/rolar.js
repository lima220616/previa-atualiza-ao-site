/* Prévia do painel: rola até a parte do site do grupo aberto no painel (pedido de 26/10).
   foco (data-foco deste <script>, posto por previa.js) = "<grupo>" ou "<grupo>:<chave>". As partes da página levam
   data-painel="<grupo>" e data-painel-chave="<chave>" (o molde da Opção A no modo prévia e a prévia simplificada).
   Grupos: textos, campanhas, secoes, produtos, kits, faq, videos, resultados, videos-por-produto e bio. "faq" (uma
   dúvida: "faq:<chave>") e "resultados" ("resultados:videos", dos vídeos de antes e depois) também usam as marcas:
   o item achado ganha contorno e a dúvida abre. Enquanto o molde não marca as partes, usa as seções de hoje do site
   (os id="..." de site-novo/index.html). */
(function () {
  "use strict";
  var script = document.currentScript;
  var foco = (script && script.getAttribute("data-foco")) || "";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*(:[a-z0-9]+(-[a-z0-9]+)*)?$/.test(foco)) return;
  var partes = foco.split(":"), grupo = partes[0], chave = partes[1] || "";
  // Seções de hoje para cada grupo, na falta das marcas (só letras, números e hífen: o foco já foi conferido).
  var DE_HOJE = {
    campanhas: ["#bnr"], secoes: chave ? ["#" + chave] : [], produtos: chave ? ["#p-" + chave] : ["#mais-vendido"],
    kits: ["#qual-kit", "#mais-vendido"], faq: ["#duvidas", "#p-duvidas"],
    videos: chave === "na-pratica" ? ["#reels"] : chave ? ["#" + chave] : ["#depoimentos"], resultados: ["#resultados"],
    "videos-por-produto": chave ? ["#p-" + chave] : []
  };
  function achar() {
    var marca = '[data-painel="' + grupo + '"]';
    var el = chave && document.querySelector(marca + '[data-painel-chave="' + chave + '"]');
    if (el) return { el: el, item: true };
    el = document.querySelector(marca);
    if (el) return { el: el, item: false };
    var lista = DE_HOJE[grupo] || [];
    for (var i = 0; i < lista.length; i++) { el = document.querySelector(lista[i]); if (el) return { el: el, item: false }; }
    return null;
  }
  var rolouPara = null;
  function rolar() {
    var a = achar();
    if (!a) { if (grupo === "textos" || grupo === "bio") window.scrollTo(0, 0); return; }
    // Tela de produto que o site abre pelo endereço (#p-...): pede para abrir antes de rolar.
    if (a.el.hidden && /^p-/.test(a.el.id)) { try { location.hash = a.el.id; } catch (e) { /* sem endereço na prévia */ } }
    // Só esta página rola (scrollIntoView rolaria também o painel em volta da prévia e a tela da pessoa pularia).
    window.scrollTo(0, Math.max(0, a.el.getBoundingClientRect().top + window.scrollY - 8));
    // Um item só (um produto, um kit, uma dúvida): contorno para achar fácil.
    if (a.item) { a.el.style.outline = "3px solid #B84060"; a.el.style.outlineOffset = "3px"; if (a.el.tagName === "DETAILS") a.el.open = true; }
    rolouPara = window.scrollY;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rolar); else rolar();
  // Quando as fotos terminam de carregar, as alturas mudam: rola de novo, se a pessoa ainda não mexeu.
  window.addEventListener("load", function () { if (rolouPara === null || window.scrollY === rolouPara) rolar(); });
})();
