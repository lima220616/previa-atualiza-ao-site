/* Contagem regressiva da promoção (horário de Brasília). Some sozinha quando a data passa. */
(function () {
  var caixa = document.querySelector(".promo[data-fim]"); if (!caixa) return;
  var fim = new Date(caixa.getAttribute("data-fim")).getTime();
  function z(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var r = Math.floor((fim - Date.now()) / 1000);
    if (r <= 0) { caixa.classList.add("acabou"); return; }
    caixa.querySelector("[data-d]").textContent = z(Math.floor(r / 86400));
    caixa.querySelector("[data-h]").textContent = z(Math.floor(r % 86400 / 3600));
    caixa.querySelector("[data-m]").textContent = z(Math.floor(r % 3600 / 60));
    caixa.querySelector("[data-s]").textContent = z(r % 60);
  }
  tick(); setInterval(tick, 1000);
})();
/* Botão que copia o cupom (se o navegador não deixar copiar, mostra o código no botão) */
document.querySelectorAll("[data-copiar]").forEach(function (b) {
  b.addEventListener("click", function () {
    var c = b.getAttribute("data-copiar"), antes = b.innerHTML;
    function mostra(t) { b.textContent = t; setTimeout(function () { b.innerHTML = antes; }, 2500); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(c).then(function () { mostra("Cupom copiado!"); }, function () { mostra("Cupom: " + c); });
    } else { mostra("Cupom: " + c); }
  });
});
