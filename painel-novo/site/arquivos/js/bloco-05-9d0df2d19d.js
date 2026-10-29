(function(){var o=document.getElementById('vfs'),v=document.getElementById('vfs-v'),x=document.getElementById('vfs-x'),src=null,pushed=false,skip=false,sy=0;
function open(el){src=el;grupoDe(el);var t=el.currentTime||0;el.pause();if(el.poster)v.poster=el.poster;else v.removeAttribute('poster');v.src=el.currentSrc||el.src;v.controls=false;sy=window.scrollY;o.hidden=false;document.body.classList.add('vfs-on');
 if(!pushed){try{history.scrollRestoration='manual'}catch(e){}try{history.pushState({vfs:1},'',location.href);pushed=true}catch(e){}}
 v.addEventListener('loadedmetadata',function f(){v.removeEventListener('loadedmetadata',f);try{v.currentTime=t}catch(e){}},{once:true});
 var pr=v.play();if(pr&&pr.catch)pr.catch(function(){v.controls=true})}
function close(fromPop){v.pause();if(src){try{src.currentTime=v.currentTime}catch(e){}}v.removeAttribute('src');v.load();o.hidden=true;document.body.classList.remove('vfs-on');
 if(src){var c=src.closest('.avv');if(c)c.classList.remove('on')}src=null;
 if(pushed&&!fromPop){pushed=false;skip=true;try{history.back()}catch(e){}}
 window.scrollTo(0,sy)}
window.addEventListener('popstate',function(e){var nosso=skip||!o.hidden;if(skip){skip=false;window.scrollTo(0,sy)}else if(!o.hidden){pushed=false;close(true)}if(nosso)setTimeout(function(){try{history.scrollRestoration='auto'}catch(e){}},0)},true);
document.addEventListener('play',function(e){var el=e.target;if(el.tagName!=='VIDEO'||el===v)return;open(el)},true);
v.addEventListener('click',function(){v.controls=true});
x.addEventListener('click',function(e){e.stopPropagation();close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!o.hidden)close()});
/* 20/10: setas, contador e arrastar para o lado para passar de um vídeo para o outro */
var grupo=[],k=0,vc=document.createElement('p'),va=document.createElement('button'),vn=document.createElement('button');
vc.className='vfs-c';vc.setAttribute('aria-live','polite');
va.type='button';va.className='vfs-a vfs-p';va.setAttribute('aria-label','Vídeo anterior');va.textContent='‹';
vn.type='button';vn.className='vfs-a vfs-n';vn.setAttribute('aria-label','Próximo vídeo');vn.textContent='›';
o.appendChild(vc);o.appendChild(va);o.appendChild(vn);
function grupoDe(el){var a=el.parentElement,g=[el];
 while(a&&a!==document.body){var vs=[].filter.call(a.querySelectorAll('video'),function(y){return y!==v&&(y===el||y.offsetParent!==null)});
  if(vs.length>1){g=vs;break}if(a.matches('section,.view,.pp-sec'))break;a=a.parentElement}
 grupo=g;k=Math.max(0,g.indexOf(el));marca()}
function marca(){var n=grupo.length;vc.textContent=n>1?(k+1)+' / '+n:'';o.classList.toggle('vfs-1',n<2)}
function centra(el){for(var a=el.parentElement;a&&a!==document.body;a=a.parentElement){
  if(a.scrollWidth>a.clientWidth+4&&/auto|scroll/.test(getComputedStyle(a).overflowX)){var r=a.getBoundingClientRect(),q=el.getBoundingClientRect();
   a.scrollLeft+=q.left-r.left-(r.width-q.width)/2;return}}}
function ir(i){if(grupo.length<2||o.hidden)return;i=(i+grupo.length)%grupo.length;var el=grupo[i];if(el===src)return;
 v.pause();if(src){try{src.currentTime=v.currentTime}catch(e){}var c=src.closest('.avv');if(c)c.classList.remove('on')}
 k=i;src=el;marca();var t=el.ended?0:(el.currentTime||0);
 if(el.poster)v.poster=el.poster;else v.removeAttribute('poster');v.controls=false;v.src=el.currentSrc||el.src;
 if(t)v.addEventListener('loadedmetadata',function(){try{v.currentTime=t}catch(e){}},{once:true});
 var pr=v.play();if(pr&&pr.catch)pr.catch(function(){v.controls=true});centra(el)}
va.addEventListener('click',function(e){e.stopPropagation();ir(k-1)});
vn.addEventListener('click',function(e){e.stopPropagation();ir(k+1)});
document.addEventListener('keydown',function(e){if(o.hidden)return;if(e.key==='ArrowLeft')ir(k-1);else if(e.key==='ArrowRight')ir(k+1)});
var t0=null;
o.addEventListener('touchstart',function(e){var p=e.touches[0];t0=e.touches.length===1&&p.clientY<window.innerHeight-130?{x:p.clientX,y:p.clientY,h:Date.now()}:null},{passive:true});
o.addEventListener('touchend',function(e){if(!t0)return;var p=e.changedTouches[0],dx=p.clientX-t0.x,dy=p.clientY-t0.y;
 if(Date.now()-t0.h<800&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)ir(dx<0?k+1:k-1);t0=null},{passive:true});

v.addEventListener('ended',function(){v.controls=true});
})();
