/* Prévia do link na bio no painel (sem o molde): lê os dados que o painel pôs na página
   (<script type="application/json" id="dados-bio-painel">, montado por previa.js), monta B e D e chama
   window.renderizarBio (bio-dinamico.js). Depois acerta a promoção com a campanha da vez: título, texto e data-fim
   (o contador da página roda depois deste arquivo e lê o data-fim), ou esconde se não houver campanha no ar.
   Roda antes do contador da página (ele é "defer"). */
(function () {
  "use strict";
  var bloco = document.getElementById("dados-bio-painel");
  if (!bloco || typeof window.renderizarBio !== "function") return;
  var P;
  try { P = JSON.parse(bloco.textContent); } catch (e) { return; }
  var bio = P.bio || {};
  var B = {
    frase: bio.frase || "",
    cores: { fundo: bio.fundo || "", principal: bio.principal || "" },
    oferta: bio.oferta || "",
    mostrar_promo: bio["mostrar-promo"] !== false,
    mostrar_avaliacoes: bio["mostrar-avaliacoes"] !== false,
    mostrar_duvidas: bio["mostrar-duvidas"] !== false,
    botoes: (bio.botoes || []).map(function (b) { return { nome: b.nome || "", texto: b.texto || "", tipo: b.tipo || "", destino: b.destino || "" }; })
  };
  var D = { ofertas: P.oferta ? [P.oferta] : [] };
  try { window.renderizarBio(B, D); } catch (e) { /* página diferente da esperada: fica como está */ }

  // Campanha da vez (a que termina primeiro): o painel já escolheu. Sem campanha no ar, a promoção some.
  var promo = document.querySelector(".promo");
  if (!promo) return;
  var c = P.campanha;
  if (!c || !B.mostrar_promo) { promo.style.display = "none"; return; }
  promo.setAttribute("data-fim", c.fim);
  promo.classList.remove("acabou");
  var titulo = promo.querySelector(".promo-titulo"); if (titulo) titulo.textContent = c.titulo;
  var selo = promo.querySelector(".promo-selo span"); if (selo && c.texto) selo.textContent = c.texto;
  promo.setAttribute("aria-label", "Promoção " + c.titulo);
})();
