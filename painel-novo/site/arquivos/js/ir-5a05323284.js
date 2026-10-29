/* Brumar: página de passagem. Leva um endereço do site antigo (/produto/..., /loja/...) ou da loja antiga da Yampi
   (/<produto>/p, que a Netlify manda para /ir/<produto>/) para a página nova (/#p-...), mantendo o cupom e as utm_.
   O destino sai sempre de uma lista fixa: o endereço não consegue mandar a pessoa para fora do site. */
(function () {
  "use strict";
  var eu = document.currentScript, padrao = (eu && eu.getAttribute("data-para")) || "";
  var KITS = {
    "gloss-progressiva-organica": "p-kit-completo-1l", "kit-completo-gloss-matizado-1-litro-brinde": "p-kit-completo-1l",
    "gloss-matizado-progressiva-organica-sem-formol-1-lt-e-shampoo-limpeza-1-lt": "p-gloss",
    "gloss-progressiva-organica-matizada-leavein": "p-gloss", "progressiva-gloss-matizada-sem-formol-brumar-1l": "p-gloss",
    "gloss-matizada-sem-formol-1-litro-brinde-gloss-matizada-sem-formol-300ml": "p-gloss", "gloss-300ml-matizado": "p-gloss",
    "kit-completo-gloss-matizado-300ml": "p-kit-completo-300ml", "shampoo-3-gloss-matizado-1-litro": "p-kit-profissional",
    "kit-profissional-gloss-matizado": "p-kit-profissional", "combo-transformacao-profissional": "p-combo-prof",
    "combo-super-transformacao": "p-combo-super",
    "kit-gloss-branco-brumar-cosmeticos-progressiva-sem-formol": "p-kit-gloss-branco",
    "gloss-progressiva-organica-branca-shampoo-limpeza": "p-gloss-branco",
    "gloss-branco-progressiva-sem-formol-organica-1-litro-e-leave-in-300ml": "p-gloss-branco",
    "gloss-progressiva-organica-branco-1lt": "p-gloss-branco", "gloss-progressiva-300ml-branco": "p-gloss-branco",
    "3-gloss-1-shampoo": "p-gloss-branco", "shampoo-limpeza-profunda-1-lt": "p-shampoo",
    "leave-in-protetor-termico-300ml": "p-leavein", "oleo-umectante-60ml": "p-oleo", "perfume-capilar-60ml": "p-cristal",
    "serum-reparador-60ml": "p-serum", "kit-gloss-brumar-cosmeticos-progressiva-sem-formol": "p-kit-completo-1l"
  };
  var DESTINOS = {
    "mais-vendido": "mais-vendido", "finalizadores": "p-kit-finalizacao", "quem-somos": "p-quem-somos",
    "duvidas": "p-duvidas", "modo-de-usar": "reels", "resultados": "resultados", "privacidade": "p-politicas",
    "cookies": "p-politicas", "trocas": "p-politicas", "termos": "p-politicas"
  };
  var ANCORAS = { "como-usar": "reels", "videos": "resultados", "privacidade": "p-politicas", "trocas": "p-politicas",
    "envio": "p-politicas", "termos": "p-politicas" };
  var MANTER = /^(cupom|promocode|utm_(source|medium|campaign|content|term))$/;
  var m = /^\/ir\/([a-z0-9-]+)\/?$/i.exec(location.pathname), chave = m ? m[1].toLowerCase() : "";
  var pedacos = (location.search.slice(1) + "&" + location.hash.slice(1).replace(/\?/g, "&")).split("&");
  var fica = [], kit = "", ancora = "";
  pedacos.forEach(function (p) {
    if (!p) return;
    var i = p.indexOf("="), nome = (i < 0 ? p : p.slice(0, i)).toLowerCase(), valor = i < 0 ? "" : p.slice(i + 1);
    if (i < 0) { if (!ancora) ancora = nome; return; }
    if (nome === "kit") { kit = valor; return; }
    if (MANTER.test(nome) && valor && valor.length <= 200) fica.push(nome + "=" + valor);
  });
  function de(o, k) { return Object.prototype.hasOwnProperty.call(o, k) ? o[k] : ""; }
  var destino = de(KITS, chave) || de(DESTINOS, chave) || de(KITS, kit) || de(ANCORAS, ancora) || padrao || (chave ? "mais-vendido" : "");
  location.replace("/" + (fica.length ? "?" + fica.join("&") : "") + (destino ? "#" + destino : ""));
})();
