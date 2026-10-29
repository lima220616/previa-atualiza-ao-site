(function(){var c=document.getElementById('pcards');if(!c)return;var d=document.querySelectorAll('#pc-d button'),cards=c.querySelectorAll('.card'),t;
function idx(){var w=cards[0].offsetWidth+14;return Math.min(cards.length-1,Math.round(c.scrollLeft/w))}
c.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var i=idx();d.forEach(function(b,j){b.classList.toggle('on',j===i)})},60)},{passive:true});
d.forEach(function(b,j){b.addEventListener('click',function(){c.scrollTo({left:cards[j].offsetLeft-c.offsetLeft-2,behavior:'smooth'})})});})();
