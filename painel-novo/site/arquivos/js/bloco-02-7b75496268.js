/* ===== Acréscimos 18/10 ===== */
(function(){
/* Opção A: frete, brinde e o maior desconto de cupom vêm do bloco de dados da página (#dados-site) */
var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();var COND=DS.condicoes||{};
/* Sem uso desde 19/10: sem a taxa real, o site mostra só 3x sem juros e 'até 12x'. Para mostrar o 12x, pôr a taxa real e usar parc12 em parcTxt. */
var JUROS_MES=0.0299;
/* Sem uso desde 19/10: o custo por aplicação agora é o preço dividido pelas aplicações. */
var ITEM={shampoo1l:49,shampoo300:23,leavein:44,finalizador:57.8};
var FRETE_GRATIS=+COND['frete-gratis-acima']||Infinity;
function brl(v){v=Math.round(v*100+1e-6)/100;var q=v.toFixed(2).split('.');return 'R$ '+q[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+q[1]}
function num(t){if(!t)return 0;var m=String(t).match(/R\$\s*([\d.]+,\d{2})/);return m?parseFloat(m[1].replace(/\./g,'').replace(',','.')):0}
function parc12(p){return p*JUROS_MES/(1-Math.pow(1+JUROS_MES,-12))}
function nParc(p){return Math.max(1,Math.min(12,Math.floor(p/10+1e-9)))}function parcTxt(p){var n=Math.min(3,nParc(p));return n>1?'ou '+n+'x de '+brl(p/n)+' sem juros':'à vista no cartão'}
function notaTxt(p){var n=nParc(p);return n>4?'Ou em até '+n+'x no cartão (de 4x a '+n+'x, com juros).':n===4?'Ou em 4x no cartão, com juros.':''}
var TRUCK='<svg class="i" aria-hidden="true"><use href="#i-truck"/></svg>';
function aplic(L,p){return ''}
function fg(sm){var e=document.createElement('span');e.className='fg'+(sm?' sm':'');e.innerHTML=TRUCK+'Frete grátis';return e}
var BRINDE=+COND['brinde-acima']||Infinity,NOME_BRINDE=String(COND.brinde||''),FATOR=(100-(+COND['desconto-maximo']||0))/100,GIFT='<svg class="i" aria-hidden="true"><use href="#i-gift"/></svg>';
function gb(sm){var e=document.createElement('span');e.className='fg gb'+(sm?' sm':'');e.innerHTML=GIFT;e.appendChild(document.createTextNode(sm?'Brinde garantido':'Brinde garantido: '+NOME_BRINDE));return e}

/* 1. Cards de produto */
document.querySelectorAll('.card').forEach(function(c){var h=c.querySelector('h3'),pv=c.querySelector('.price .v');if(!h||!pv)return;
 var L=h.textContent.trim(),p=num(pv.textContent),price=c.querySelector('.price');
 var y=c.querySelector('.yield'),t=aplic(L,p);
 if(y&&t){var a=document.createElement('span');a.className='ppa';a.textContent=t;y.insertAdjacentElement('afterend',a)}
 if(p){var pc=price.querySelector('.parc');if(pc){pc.textContent=parcTxt(p);var n=document.createElement('small');n.className='pnota';n.textContent=notaTxt(p);price.appendChild(n)}
  if(p*FATOR>BRINDE)price.insertBefore(gb(),price.firstChild);
  if(p>FRETE_GRATIS)price.insertBefore(fg(),price.firstChild)}});

/* 2. Opções de kit nas páginas de produto */
document.querySelectorAll('.vo').forEach(function(v){var i=v.querySelector('input');if(!i)return;var L=i.getAttribute('data-label'),p=parseFloat(i.getAttribute('data-price'))||0;
 var sm=v.querySelector('.vo-t small'),t=aplic(L,p);if(sm&&t){var e=document.createElement('em');e.className='vo-ppa';e.textContent=t;sm.insertAdjacentElement('afterend',e)}
 if(p>FRETE_GRATIS){var vp=v.querySelector('.vo-p');if(vp)vp.appendChild(fg(true))}
 if(p*FATOR>BRINDE){var vp2=v.querySelector('.vo-p');if(vp2)vp2.appendChild(gb(true))}});

/* 3. Caixa de preço: parcelamento máximo, frete e custo por aplicação */
function upd(sec){var box=sec.querySelector('.pbox');if(!box)return;var i=sec.querySelector('.vo input:checked'),h1=sec.querySelector('.t1');
 var L=i?i.getAttribute('data-label'):(h1?h1.textContent.trim():''),p=i?(parseFloat(i.getAttribute('data-price'))||0):num((box.querySelector('.pb-v')||{}).textContent);
 var pc=box.querySelector('.pb-parc');['.pb-nota','.pb-ppa','.pb-fg'].forEach(function(k){box.querySelectorAll(k).forEach(function(o){o.remove()})});
 if(p&&pc){pc.textContent=parcTxt(p);var n=document.createElement('small');n.className='pnota pb-nota';n.textContent=notaTxt(p);pc.insertAdjacentElement('afterend',n)}
 var t=aplic(L,p);if(t){var a=document.createElement('span');a.className='pb-ppa';a.textContent=t;(box.querySelector('.pb-pix')||pc).insertAdjacentElement('afterend',a)}
 if(p*FATOR>BRINDE){var g=gb();g.classList.add('pb-fg');var nb=document.createElement('small');nb.className='pnota pb-fg';nb.textContent='Esta compra passa de '+brl(BRINDE).replace(/,00$/,'')+': você já garante o brinde do '+NOME_BRINDE+'.';box.insertBefore(nb,box.firstChild);box.insertBefore(g,box.firstChild)}
 if(p>FRETE_GRATIS){var f=fg();f.classList.add('pb-fg');box.insertBefore(f,box.firstChild)}}
document.querySelectorAll('.pp2').forEach(function(sec){upd(sec);sec.querySelectorAll('.vo input').forEach(function(i){i.addEventListener('change',function(){upd(sec)})})});

/* 4. Quiz: custo por aplicação no resultado */
var PR={};document.querySelectorAll('.vo input').forEach(function(i){var p=parseFloat(i.getAttribute('data-price'));if(p)PR[i.getAttribute('data-label')]=p});
var qn=document.getElementById('qz-name'),qy=document.getElementById('qz-yield');
if(qn&&qy){new MutationObserver(function(){var L=qn.textContent.trim();if(!L||/por aplicação/.test(qy.textContent))return;var t=aplic(L,PR[L]||0);if(t)qy.textContent=qy.textContent+' · '+t}).observe(qn,{childList:true,characterData:true,subtree:true})}

/* 5. Página de avaliações */
var rv=document.querySelectorAll('#avaliacoes .rv img');
document.querySelectorAll('img[data-clone-idx]').forEach(function(im){var o=rv[+im.getAttribute('data-clone-idx')];if(o)im.src=o.src;else im.remove()});
var row=document.getElementById('row-v');
if(row){var PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
 var vids=[].slice.call(document.querySelectorAll('#vt video, #reels video'));
 vids.forEach(function(src,k){var v=document.createElement('video');v.src=src.getAttribute('src');if(src.getAttribute('poster'))v.poster=src.getAttribute('poster');v.playsInline=true;v.setAttribute('playsinline','');v.preload='none';v.setAttribute('aria-label','Vídeo de resultado e depoimento '+(k+1));
  var w=document.createElement('div');w.className='avv';var b=document.createElement('button');b.type='button';b.className='avv-p';b.setAttribute('aria-label','Assistir vídeo '+(k+1));b.innerHTML='<span>'+PLAY+'</span>';
  b.addEventListener('click',function(){document.querySelectorAll('.avv video').forEach(function(o){if(o!==v)o.pause()});w.classList.add('on');v.controls=true;v.play()});
  v.addEventListener('play',function(){document.querySelectorAll('.avv video').forEach(function(o){if(o!==v)o.pause()})});
  w.appendChild(v);w.appendChild(b);row.appendChild(w)});
 }
document.querySelectorAll('.av-a').forEach(function(b){b.addEventListener('click',function(){var r=document.getElementById(b.getAttribute('data-row'));if(r)r.scrollBy({left:(+b.getAttribute('data-dir'))*r.clientWidth*0.85,behavior:'smooth'})})});
var jump=document.querySelectorAll('.av-jump button');
jump.forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-go'));if(t)t.scrollIntoView({behavior:'smooth',block:'start'});jump.forEach(function(x){x.classList.toggle('on',x===b)})})});
var lb=null;/* 20/10: as fotos abrem na tela cheia com zoom (#lbx) */
if(lb){var li=lb.querySelector('img');document.querySelectorAll('.avf').forEach(function(f){f.addEventListener('click',function(){li.src=f.querySelector('img').src;lb.hidden=false})});
 lb.addEventListener('click',function(e){if(e.target!==li)lb.hidden=true});document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true})}
function avp(){if(location.hash==='#p-avaliacoes'){document.body.classList.remove('onpp')}else{document.querySelectorAll('.avv video').forEach(function(v){v.pause()})}}
window.addEventListener('hashchange',function(){setTimeout(avp,0)});avp();
var vb=document.querySelector('.vip-b');if(vb)vb.addEventListener('click',function(e){e.preventDefault()});
})();
