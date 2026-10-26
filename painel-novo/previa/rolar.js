/* Prévia do painel: rola até a parte do site do grupo aberto no painel (pedido de 26/10).
   foco (data-foco deste <script>, posto por previa.js) = "<grupo>" ou "<grupo>:<chave>". As partes da página levam
   data-painel="<grupo>" e data-painel-chave="<chave>" (o molde da Opção A no modo prévia e a prévia simplificada).
   Grupos: textos, campanhas, secoes, produtos, kits, faq, videos, resultados, videos-por-produto e bio. "faq" (uma
   dúvida: "faq:<chave>") e "resultados" ("resultados:videos", dos vídeos de antes e depois) também usam as marcas:
   o item achado ganha contorno e a dúvida abre. Enquanto o molde não marca as partes, usa as seções de hoje do site
   (os id="..." de site-novo/index.html).
   Rolagem que "anda" (achado do revisor do site, 26/10): a primeira rolagem acontece antes de as fotos de cima
   carregarem e de o molde terminar a tela; depois disso o alvo desce (com o foco num kit, parou em 220 px e a opção
   estava a 2.270 px). Por isso, por até 5 s, rola de novo quando uma foto acima do alvo termina de carregar e quando
   o tamanho da página muda. Para de corrigir assim que a pessoa rola sozinha (roda do mouse, toque ou teclado).
   Topo preso (rodada 4): o cabeçalho do site fica preso no alto ("sticky", até uns 73 px) e, no "Ver como fica", a
   barra "‹ Voltar ao painel" também. Com só 8 px de margem, a parte do foco parava atrás do logo (a dúvida inteira
   coberta). A margem é a altura do que fica preso no alto (ou o scroll-padding-top que o site marca para isso) + 8 px.
   Marca vazia escondida (rodada 4): videos-por-produto sem vídeo é um <div hidden> no lugar da seção. Sem caixa, a
   conta dava 0 e a página subia 8 px a cada correção. A posição vem do vizinho visível, e ninguém ganha contorno. */
(function () {
  "use strict";
  var script = document.currentScript;
  var foco = (script && script.getAttribute("data-foco")) || "";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*(:[a-z0-9]+(-[a-z0-9]+)*)?$/.test(foco)) return;
  var partes = foco.split(":"), grupo = partes[0], chave = partes[1] || "";
  var CORRIGIR_POR = 5000; // ms: depois disso a página já assentou (e a pessoa pode estar lendo outra parte)
  var FOLGA = 8; // px entre o que fica preso no alto e o alvo
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
  function estiloDe(el) {
    try { return el && typeof window.getComputedStyle === "function" ? window.getComputedStyle(el) : null; } catch (e) { return null; }
  }
  // Tem caixa na tela? (hidden, display:none ou dentro de algo escondido: não tem)
  function temCaixa(el) {
    if (!el || el.hidden) return false;
    return typeof el.getClientRects !== "function" || el.getClientRects().length > 0;
  }
  // Onde rolar: o próprio alvo ou, se ele não tem caixa, o vizinho visível mais perto (o seguinte, o anterior, o pai).
  // Sem nenhum (só o <body>), não rola.
  function lugarDe(el) {
    if (temCaixa(el)) return el;
    var x;
    for (x = el.nextElementSibling; x; x = x.nextElementSibling) if (temCaixa(x)) return x;
    for (x = el.previousElementSibling; x; x = x.previousElementSibling) if (temCaixa(x)) return x;
    for (x = el.parentElement; x && x !== document.body && x !== document.documentElement; x = x.parentElement) if (temCaixa(x)) return x;
    return null;
  }
  // Altura do que fica preso no alto da tela quando a página desce: o scroll-padding-top do site (80 px no molde) e
  // os filhos do <body> e os <header> com position sticky ou fixed presos no alto (top em px). Contam onde ficam
  // quando presos (top + altura); presos um por cima do outro, vale o mais baixo. Não contam: o que fica embaixo
  // (top "auto": aviso, barra de compra), o escondido e o que cobre boa parte da tela (janela ou menu aberto).
  function alturaDoTopo() {
    var vista = window.innerHeight || 0, altura = 0;
    var raiz = estiloDe(document.documentElement);
    var reserva = raiz ? parseFloat(raiz.scrollPaddingTop) : NaN;
    if (reserva > 0) altura = reserva;
    var lista = [];
    if (document.body && document.body.children) lista = lista.concat([].slice.call(document.body.children));
    if (typeof document.querySelectorAll === "function") lista = lista.concat([].slice.call(document.querySelectorAll("header")));
    for (var i = 0; i < lista.length; i++) {
      var s = estiloDe(lista[i]);
      if (!s || (s.position !== "sticky" && s.position !== "fixed") || !temCaixa(lista[i])) continue;
      var topo = parseFloat(s.top), alt = lista[i].getBoundingClientRect().height;
      if (!(topo >= 0) || !(alt > 0) || (vista && topo + alt > vista * 0.4)) continue;
      altura = Math.max(altura, topo + alt);
    }
    return vista ? Math.min(altura, vista / 2) : altura;
  }
  var alvo = null; // o último achado (para saber se uma foto que carregou fica acima dele)
  function rolar() {
    var a = achar();
    alvo = a;
    if (!a) { if ((grupo === "textos" || grupo === "bio") && window.scrollY !== 0) window.scrollTo(0, 0); return; }
    // Tela de produto que o site abre pelo endereço (#p-...): pede para abrir e espera (escondida, ela não tem lugar;
    // quando abre, a página muda de tamanho e a correção rola até ela).
    if (a.el.hidden && /^p-/.test(a.el.id)) { try { location.hash = a.el.id; } catch (e) { /* sem endereço na prévia */ } return; }
    var lugar = a.lugar = lugarDe(a.el);
    if (!lugar) return;
    // Só esta página rola (scrollIntoView rolaria também o painel em volta da prévia e a tela da pessoa pularia).
    var y = Math.max(0, lugar.getBoundingClientRect().top + window.scrollY - alturaDoTopo() - FOLGA);
    if (Math.abs(y - window.scrollY) >= 2) window.scrollTo(0, y); // já está lá: não mexe (nada de tremer)
    // Um item só (um produto, um kit, uma dúvida): contorno para achar fácil. No vizinho, não (seria outra parte).
    if (a.item && lugar === a.el) { a.el.style.outline = "3px solid #B84060"; a.el.style.outlineOffset = "3px"; if (a.el.tagName === "DETAILS") a.el.open = true; }
  }

  // ---- correções nos primeiros segundos ----
  var corrigindo = true;
  var observador = null;
  var SOZINHA = ["wheel", "touchstart", "keydown", "mousedown"]; // mousedown: arrastar a barra de rolagem
  function corrigir() { if (corrigindo) rolar(); }
  // Uma foto terminou de carregar (ou falhou): só importa se ela fica acima do alvo (empurra o alvo para baixo).
  function fotoCarregou(e) {
    var img = e && e.target;
    if (!corrigindo || !img || img.tagName !== "IMG") return;
    if (alvo && alvo.lugar && img.getBoundingClientRect && img.getBoundingClientRect().top > alvo.lugar.getBoundingClientRect().top) return;
    corrigir();
  }
  function parar() {
    if (!corrigindo) return;
    corrigindo = false;
    if (observador) observador.disconnect();
    if (document.removeEventListener) { document.removeEventListener("load", fotoCarregou, true); document.removeEventListener("error", fotoCarregou, true); }
    if (window.removeEventListener) for (var i = 0; i < SOZINHA.length; i++) window.removeEventListener(SOZINHA[i], parar, true);
  }
  // "load" e "error" das fotos não sobem pela página: ouvindo na captura, vale também para as fotos que o molde põe
  // depois desta primeira rolagem.
  document.addEventListener("load", fotoCarregou, true);
  document.addEventListener("error", fotoCarregou, true);
  for (var i = 0; i < SOZINHA.length; i++) window.addEventListener(SOZINHA[i], parar, { capture: true, passive: true });
  // A página mudou de altura (tela do produto que abriu, foto sem tamanho marcado, fonte que chegou, a barra
  // "‹ Voltar ao painel" que entrou no alto): rola de novo.
  if (typeof window.ResizeObserver === "function" && document.body) {
    observador = new window.ResizeObserver(corrigir);
    observador.observe(document.body);
  }
  if (typeof window.setTimeout === "function") window.setTimeout(parar, CORRIGIR_POR);
  else corrigindo = false; // sem relógio, não dá para garantir que para: rola só uma vez

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rolar); else rolar();
  // Quando todas as fotos terminam de carregar, as alturas mudam: rola de novo, se a pessoa ainda não mexeu.
  window.addEventListener("load", corrigir);
})();
