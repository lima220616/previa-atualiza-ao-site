(function(){var c=document.getElementById('rescar');if(!c)return;var im=c.querySelectorAll('.resimg'),n=im.length,lab=document.getElementById('res-c'),t;
function step(){return im[0].offsetWidth+12}
function cur(){return Math.min(n-1,Math.round(c.scrollLeft/step()))}
function upd(){lab.textContent=(cur()+1)+' / '+n}
upd();c.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(upd,60)},{passive:true});
document.getElementById('res-prev').addEventListener('click',function(){c.scrollTo({left:Math.max(0,cur()-1)*step(),behavior:'smooth'})});
document.getElementById('res-next').addEventListener('click',function(){c.scrollTo({left:Math.min(n-1,cur()+1)*step(),behavior:'smooth'})});})();
