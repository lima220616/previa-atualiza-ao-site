/* 20/10: vídeos de resultado de cada produto (vindos de videos-por-produto.json); o play abre a tela cheia */
document.querySelectorAll('.pv').forEach(function(sec){var row=sec.querySelector('.pv-row');if(!row)return;
 row.querySelectorAll('.pv-c').forEach(function(c){var v=c.querySelector('video'),b=c.querySelector('.vplay-b');
  b.addEventListener('click',function(){var p=v.play();if(p&&p.catch)p.catch(function(e){if(!e||e.name!=='AbortError')v.controls=true})})});
 sec.querySelectorAll('.pv-a').forEach(function(a){a.addEventListener('click',function(){row.scrollBy({left:(+a.getAttribute('data-dir'))*row.clientWidth*0.8,behavior:'smooth'})})})});
