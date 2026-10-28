/* 20/10: fotos em tela cheia com zoom (toque, dois dedos, dois toques) e X para fechar */
(function(){var SEL='#rescar .resimg, .rr-f img, .rv img, .avf img, .avc-img, .main-img, #gcar .gcar-s img';
var o=document.createElement('div');o.className='lbx';o.id='lbx';o.hidden=true;o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Foto em tela cheia');
o.innerHTML='<button type="button" class="lbx-x" aria-label="Fechar foto e voltar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
 '<div class="lbx-v"><img class="lbx-img" alt="" draggable="false"></div>'+
 '<button type="button" class="lbx-a lbx-p" aria-label="Foto anterior">‹</button><button type="button" class="lbx-a lbx-n" aria-label="Próxima foto">›</button>'+
 '<p class="lbx-c" aria-live="polite"></p><p class="lbx-d">Use dois dedos ou toque duas vezes para dar zoom</p>';
document.body.appendChild(o);
var im=o.querySelector('.lbx-img'),vw=o.querySelector('.lbx-v'),grupo=[],k=0,pushed=false,skip=false,sy=0,esc=1,tx=0,ty=0,origem=null,abriuEm=0,fechouEm=0;
function lim(){var r=vw.getBoundingClientRect(),mx=Math.max(0,(im.offsetWidth*esc-r.width)/2),my=Math.max(0,(im.offsetHeight*esc-r.height)/2);
 tx=Math.max(-mx,Math.min(mx,tx));ty=Math.max(-my,Math.min(my,ty))}
function aplica(){lim();im.style.transform='translate('+tx+'px,'+ty+'px) scale('+esc+')';o.classList.toggle('lbx-z',esc>1.01)}
function zera(){esc=1;tx=0;ty=0;aplica()}
function mostra(i){k=(i+grupo.length)%grupo.length;var g=grupo[k];im.src=g.currentSrc||g.src;im.alt=g.alt||'Foto';zera();
 o.querySelector('.lbx-c').textContent=grupo.length>1?(k+1)+' / '+grupo.length:'';o.classList.toggle('lbx-1',grupo.length<2)}
/* com a página ampliada com dois dedos, a tela da foto se encaixa na parte que está à vista */
function encaixa(){if(o.hidden)return;var vv=window.visualViewport;
 if(vv&&vv.scale>1.05){o.style.left=vv.offsetLeft+'px';o.style.top=vv.offsetTop+'px';o.style.width=vv.width+'px';o.style.height=vv.height+'px';o.style.right='auto';o.style.bottom='auto'}
 else o.removeAttribute('style')}
if(window.visualViewport){visualViewport.addEventListener('resize',encaixa);visualViewport.addEventListener('scroll',encaixa)}
function abre(img){origem=img.closest('button')||img;
 var box=img.closest('#rescar,.rr-g,.rvs,.pp-img,.av-row')||(img.closest('.avf')?img.closest('.avf').parentElement:null)||img.closest('.pp-sec,section')||document.body;
 grupo=[].slice.call(box.querySelectorAll(SEL)).filter(function(x){return x===img||x.offsetParent!==null});if(grupo.indexOf(img)<0)grupo=[img];
 abriuEm=Date.now();sy=window.scrollY;o.hidden=false;encaixa();document.body.classList.add('lbx-on');mostra(grupo.indexOf(img));
 /* "manual": sem isso, ao voltar, o navegador leva a página para o topo do produto (a âncora #p-...) */
 if(!pushed){try{history.scrollRestoration='manual'}catch(e){}try{history.pushState({lbx:1},'',location.href);pushed=true}catch(e){}}
 try{o.querySelector('.lbx-x').focus({preventScroll:true})}catch(e){}}
function fecha(doPop){if(o.hidden)return;fechouEm=Date.now();o.hidden=true;o.removeAttribute('style');document.body.classList.remove('lbx-on');im.removeAttribute('src');
 if(pushed&&!doPop){pushed=false;skip=true;try{history.back()}catch(e){}}window.scrollTo(0,sy);
 if(origem){if(!origem.matches('button,a,[tabindex]'))origem.setAttribute('tabindex','-1');try{origem.focus({preventScroll:true})}catch(e){}}}
window.addEventListener('popstate',function(){var nosso=skip||!o.hidden;if(skip){skip=false;window.scrollTo(0,sy)}else if(!o.hidden){pushed=false;fecha(true)}
 if(nosso)setTimeout(function(){try{history.scrollRestoration='auto'}catch(e){}},0)});
/* logo depois de fechar, um 2º toque não abre o que estava atrás do X (a sacola do topo) */
document.addEventListener('click',function(e){if(Date.now()-fechouEm<400){e.preventDefault();e.stopPropagation()}},true);
document.addEventListener('click',function(e){var t=e.target;if(t&&t.classList&&t.classList.contains('avf'))t=t.querySelector('img');
 if(t&&t.matches&&t.matches(SEL)&&!t.closest('.lbx')){e.preventDefault();abre(t)}});
o.querySelector('.lbx-x').addEventListener('click',function(){fecha()});
o.querySelector('.lbx-p').addEventListener('click',function(e){e.stopPropagation();mostra(k-1)});
o.querySelector('.lbx-n').addEventListener('click',function(e){e.stopPropagation();mostra(k+1)});
/* o 2º de dois toques rápidos na miniatura cai no fundo escuro: não fecha a foto que acabou de abrir */
vw.addEventListener('click',function(e){if(Date.now()-abriuEm<450)return;if(e.target===vw&&esc<=1.01)fecha()});
document.addEventListener('keydown',function(e){if(o.hidden)return;
 if(e.key==='Tab'){var f=[].slice.call(o.querySelectorAll('button')).filter(function(b){return b.offsetParent!==null});
  if(f.length){var i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}return}
 if(e.key==='Escape')fecha();else if(e.key==='ArrowLeft')mostra(k-1);else if(e.key==='ArrowRight')mostra(k+1)});
function zoomEm(nova,cx,cy){var r=vw.getBoundingClientRect(),px=cx-r.left-r.width/2,py=cy-r.top-r.height/2,f=nova/esc;
 tx=px-(px-tx)*f;ty=py-(py-ty)*f;esc=nova;aplica()}
var t0=null,d0=0,e0=1,ultimo=0,tratou=0,md=null;
/* quando o touchend já tratou os dois toques, o "duplo clique" que o navegador manda logo depois é ignorado
   (se os toques foram mais lentos e o touchend não contou, é o duplo clique que dá o zoom) */
im.addEventListener('dblclick',function(e){e.preventDefault();if(Date.now()-tratou<800)return;if(esc>1.01)zera();else zoomEm(2.5,e.clientX,e.clientY)});
vw.addEventListener('wheel',function(e){e.preventDefault();var d=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?400:1);
 zoomEm(Math.max(1,Math.min(4,esc*Math.exp(-d*0.0015))),e.clientX,e.clientY);if(esc<=1)zera()},{passive:false});
/* no computador: arrastar a foto ampliada com o mouse */
im.addEventListener('mousedown',function(e){if(esc<=1.01||e.button!==0)return;e.preventDefault();md={x:e.clientX,y:e.clientY,tx:tx,ty:ty};o.classList.add('lbx-arr')});
window.addEventListener('mousemove',function(e){if(!md)return;tx=md.tx+e.clientX-md.x;ty=md.ty+e.clientY-md.y;aplica()});
window.addEventListener('mouseup',function(){if(md){md=null;o.classList.remove('lbx-arr')}});
if(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)o.querySelector('.lbx-d').textContent='Use a roda do mouse ou clique duas vezes para dar zoom';
function dist(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
vw.addEventListener('touchstart',function(e){if(e.touches.length===2){d0=dist(e.touches[0],e.touches[1]);e0=esc;t0=null}
 else if(e.touches.length===1){var t=e.touches[0];t0={x:t.clientX,y:t.clientY,tx:tx,ty:ty,tempo:Date.now(),mexeu:false}}},{passive:true});
vw.addEventListener('touchmove',function(e){e.preventDefault();
 if(e.touches.length===2&&d0){var a=e.touches[0],b=e.touches[1];zoomEm(Math.max(1,Math.min(4,e0*dist(a,b)/d0)),(a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2)}
 else if(e.touches.length===1&&t0){var t=e.touches[0],dx=t.clientX-t0.x,dy=t.clientY-t0.y;if(Math.abs(dx)+Math.abs(dy)>8)t0.mexeu=true;
  if(esc>1.01){tx=t0.tx+dx;ty=t0.ty+dy;aplica()}}},{passive:false});
vw.addEventListener('touchend',function(e){if(e.touches.length>0){if(e.touches.length===1){var t=e.touches[0];t0={x:t.clientX,y:t.clientY,tx:tx,ty:ty,tempo:Date.now(),mexeu:true}}return}
 d0=0;if(esc<=1.01)zera();if(!t0)return;var c=e.changedTouches[0],dx=c.clientX-t0.x,dy=c.clientY-t0.y,agora=Date.now();
 if(!t0.mexeu){if(agora-ultimo<350){ultimo=0;tratou=agora;if(esc>1.01)zera();else zoomEm(2.5,c.clientX,c.clientY)}else ultimo=agora}
 else if(esc<=1.01&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){mostra(dx<0?k+1:k-1)}t0=null});
})();
