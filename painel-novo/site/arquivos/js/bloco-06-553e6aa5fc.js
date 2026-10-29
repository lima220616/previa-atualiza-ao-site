(function(){var c=document.getElementById('ccar');if(!c)return;var d=document.querySelectorAll('#ccar-d button'),t;
function mark(i){d.forEach(function(b,j){b.classList.toggle('on',j===i)})}
c.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){mark(Math.round(c.scrollLeft/c.clientWidth))},80)},{passive:true});
d.forEach(function(b,j){b.addEventListener('click',function(){c.scrollTo({left:j*c.clientWidth,behavior:'smooth'});mark(j)})});})();
