(function(){var c=document.getElementById('gcar');if(!c)return;var sec=document.getElementById('p-gloss'),box=c.closest('.pp-img'),mi=box.querySelector('.main-img'),dots=document.querySelectorAll('#gcar-d button'),slides=c.querySelectorAll('.gcar-s'),lock=false,t=null;
/* a foto e a opção andam juntas pela chave do kit (data-kit), nunca pelo nome escrito */
function inp(k){return /^[a-z0-9-]+$/.test(k||'')?sec.querySelector('.vo input[data-kit="'+k+'"]'):null}
function idx(){return Math.round(c.scrollLeft/c.clientWidth)}
function mark(i){dots.forEach(function(d,j){d.classList.toggle('on',j===i)})}
function pick(i){var x=inp(slides[i].getAttribute('data-kit'));if(x&&!x.checked){x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}))}mark(i)}
c.addEventListener('scroll',function(){if(lock)return;clearTimeout(t);t=setTimeout(function(){pick(idx())},120)},{passive:true});
dots.forEach(function(d,j){d.addEventListener('click',function(){c.scrollTo({left:j*c.clientWidth,behavior:'smooth'});pick(j)})});
sec.querySelectorAll('.vo input').forEach(function(x){x.addEventListener('change',function(){var l=x.getAttribute('data-kit'),j=-1;slides.forEach(function(s,k){if(s.getAttribute('data-kit')===l)j=k});
if(j<0){box.classList.add('kitmode');mi.style.display=''}else{box.classList.remove('kitmode');mi.style.display='none';mark(j);if(idx()!==j){lock=true;c.scrollTo({left:j*c.clientWidth,behavior:'smooth'});setTimeout(function(){lock=false},500)}}})});
var f=sec.querySelector('.vo input:checked');if(f){f.checked=true;f.dispatchEvent(new Event('change',{bubbles:true}))}
})();
