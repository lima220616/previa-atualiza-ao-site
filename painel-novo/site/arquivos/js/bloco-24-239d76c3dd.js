/* 20/10: vídeos de resultado da página inicial (setas, contador e play que abre a tela cheia) */
(function(){var c=document.getElementById('resvid');if(!c)return;var it=c.querySelectorAll('.rv2-c'),n=it.length,lab=document.getElementById('rv2-c'),t;
function step(){return it[0].offsetWidth+12}function cur(){return Math.min(n-1,Math.round(c.scrollLeft/step()))}
function upd(){lab.textContent=(cur()+1)+' / '+n}upd();c.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(upd,60)},{passive:true});
document.getElementById('rv2-prev').addEventListener('click',function(){c.scrollTo({left:Math.max(0,cur()-1)*step(),behavior:'smooth'})});
document.getElementById('rv2-next').addEventListener('click',function(){c.scrollTo({left:Math.min(n-1,cur()+1)*step(),behavior:'smooth'})});
it.forEach(function(k){var v=k.querySelector('video'),b=k.querySelector('.vplay-b');b.addEventListener('click',function(){var p=v.play();if(p&&p.catch)p.catch(function(e){if(!e||e.name!=='AbortError')v.controls=true})})})})();
