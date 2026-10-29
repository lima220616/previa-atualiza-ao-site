/* 19/10: o botão da chamada final acompanha a opção escolhida, com o nome do produto (Brand Book) */
/* Opção A: o nome curto é o do kit (kits.json, pelo bloco de dados), pela chave da opção marcada */
(function(){var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();var KITS=DS.kits||{};function curto(k,l){var it=Object.prototype.hasOwnProperty.call(KITS,k||'')?KITS[k]:null;return it&&it['nome-curto']?it['nome-curto']:l}
document.querySelectorAll('.pp2').forEach(function(sec){var b=sec.querySelector('.cta-f button.buy');if(!b)return;
function upd(){var i=sec.querySelector('.vo input:checked'),k=i?i.getAttribute('data-kit'):b.getAttribute('data-kit'),l=i?i.getAttribute('data-label'):b.getAttribute('data-name');if(l)b.textContent='Quero meu '+curto(k,l)}
upd();sec.querySelectorAll('.vo input').forEach(function(i){i.addEventListener('change',upd)})})})();
