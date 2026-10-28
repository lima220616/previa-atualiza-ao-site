(function(){var c=document.getElementById('vt');if(!c)return;var it=c.querySelectorAll('.vt-s'),n=it.length,lab=document.getElementById('vt-c'),t;
function step(){return it[0].offsetWidth+14}
function cur(){return Math.min(n-1,Math.round(c.scrollLeft/step()))}
function upd(){lab.textContent=(cur()+1)+' / '+n}
upd();c.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(upd,60)},{passive:true});
document.getElementById('vt-prev').addEventListener('click',function(){c.scrollTo({left:Math.max(0,cur()-1)*step(),behavior:'smooth'})});
document.getElementById('vt-next').addEventListener('click',function(){c.scrollTo({left:Math.min(n-1,cur()+1)*step(),behavior:'smooth'})});})();
