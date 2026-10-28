/* 20/10: play do vídeo do passo a passo (a tela cheia abre sozinha quando o vídeo começa) */
document.querySelectorAll('.pa-c').forEach(function(c){var v=c.querySelector('video'),b=c.querySelector('.vplay-b');
 b.addEventListener('click',function(){var p=v.play();if(p&&p.catch)p.catch(function(e){if(!e||e.name!=='AbortError')v.controls=true})})});
