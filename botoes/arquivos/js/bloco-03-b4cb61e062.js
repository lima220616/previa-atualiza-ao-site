(function(){
function is1L(l){return /(^|\s)1 L(\s|$)/.test(l)}function is300(l){return /300 ml/.test(l)}
/* Carrossel de opções desativado a pedido da Bruna: só a página do Gloss tem a troca de tamanho (#gcar). */
[].forEach(function(sec){
 var vos=sec.querySelector('.vos');if(!vos)return;
 var items=[].slice.call(vos.querySelectorAll('.vo'));if(items.length<2)return;
 for(var i=0;i<items.length-1;i++){var a=items[i].querySelector('input').getAttribute('data-label'),b=items[i+1].querySelector('input').getAttribute('data-label');
  if(is300(a)&&is1L(b)&&a.replace('300 ml','')===b.replace('1 L','')){vos.insertBefore(items[i+1],items[i]);var t=items[i];items[i]=items[i+1];items[i+1]=t;i++}}
 var box=sec.querySelector('.pp-img'),main=box&&box.querySelector('.main-img');if(!main)return;
 var car=document.createElement('div');car.className='pcar';var trk=document.createElement('div');trk.className='pcar-t';var dots=document.createElement('div');dots.className='pcar-d';
 items.forEach(function(v,k){var inp=v.querySelector('input'),L=inp.getAttribute('data-label'),sl=document.createElement('figure');sl.className='pcar-s';
  var im=document.createElement('img');im.src=v.querySelector('img').src;im.alt=L;var cap=document.createElement('figcaption');cap.textContent=L;sl.appendChild(im);sl.appendChild(cap);trk.appendChild(sl);
  var d=document.createElement('button');d.type='button';d.setAttribute('aria-label',L);d.addEventListener('click',function(){go(k,true);sel(k)});dots.appendChild(d)});
 var al=document.createElement('button');al.type='button';al.className='pcar-a l';al.setAttribute('aria-label','Opção anterior');al.textContent='‹';
 var ar=document.createElement('button');ar.type='button';ar.className='pcar-a r';ar.setAttribute('aria-label','Próxima opção');ar.textContent='›';
 var hint=document.createElement('p');hint.className='pcar-h';hint.textContent='Arraste para o lado e veja as outras opções';
 car.appendChild(trk);car.appendChild(al);car.appendChild(ar);car.appendChild(dots);car.appendChild(hint);main.style.display='none';box.appendChild(car);
 var lock=false,cur=-1,tm;
 function mark(k){[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===k)})}
 function go(k,smooth){k=Math.max(0,Math.min(items.length-1,k));cur=k;lock=true;trk.scrollTo({left:k*trk.clientWidth,behavior:smooth?'smooth':'auto'});mark(k);clearTimeout(tm);setTimeout(function(){lock=false},smooth?600:80)}
 function sel(k){var inp=items[k].querySelector('input');if(!inp.checked){inp.checked=true;inp.dispatchEvent(new Event('change',{bubbles:true}))}}
 al.addEventListener('click',function(){go(cur-1,true);sel(cur)});ar.addEventListener('click',function(){go(cur+1,true);sel(cur)});
 trk.addEventListener('scroll',function(){if(lock)return;clearTimeout(tm);tm=setTimeout(function(){var k=Math.round(trk.scrollLeft/Math.max(1,trk.clientWidth));if(k!==cur){cur=k;mark(k);sel(k)}},140)},{passive:true});
 items.forEach(function(v,k){v.querySelector('input').addEventListener('change',function(){if(k!==cur)go(k,true)})});
 var start=-1;
 if(sec.id==='p-gloss'){items.forEach(function(v,k){if(v.querySelector('input').getAttribute('data-label')==='Gloss Matizado 1 L')start=k});if(start>=0)sel(start)}
 if(start<0){items.forEach(function(v,k){if(v.querySelector('input').checked)start=k});if(start<0)start=0}
 function align(){if(!sec.hidden)go(cur<0?start:cur,false)}
 requestAnimationFrame(align);new MutationObserver(align).observe(sec,{attributes:true,attributeFilter:['hidden']});window.addEventListener('resize',align);
});})();
