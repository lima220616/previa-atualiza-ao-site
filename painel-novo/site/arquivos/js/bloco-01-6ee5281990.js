(function(){
var body=document.body,dr=document.getElementById('drawer'),ob=document.getElementById('openMenu');
function openM(){body.classList.add('open');dr.setAttribute('aria-hidden','false');ob.setAttribute('aria-expanded','true');document.getElementById('closeMenu').focus();}
function closeM(){body.classList.remove('open');dr.setAttribute('aria-hidden','true');ob.setAttribute('aria-expanded','false');ob.focus();}
ob.addEventListener('click',openM);
document.getElementById('closeMenu').addEventListener('click',closeM);
document.getElementById('overlay').addEventListener('click',closeM);
dr.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){body.classList.remove('open');dr.setAttribute('aria-hidden','true');ob.setAttribute('aria-expanded','false');});});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&body.classList.contains('open'))closeM();});

/* Opção A: os dados vêm do bloco da página (#dados-site, escrito pelo molde). Sem o bloco, nada quebra. */
var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();var COND=DS.condicoes||{},KITS=DS.kits||{};
/* Campanhas (a data vem com o fuso de Brasília): uma faixa com uma contagem, a que termina primeiro; quando ela acaba,
   entra a próxima sem recarregar e a frase dela sai da faixa rolante. O cupom da campanha some da faixa, das telas e
   do link de pagamento na hora exata. Sem a faixa (montagem depois da data), o resto da página funciona igual. */
var CAMP=(DS.campanhas||[]).map(function(c,n){return {t:String(c.titulo||''),x:String(c.texto||''),f:Date.parse(c.fim),n:n}}).filter(function(c){return c.f>0}).sort(function(a,b){return a.f-b.f});
var CUP=DS.cupom&&DS.cupom.codigo?{c:String(DS.cupom.codigo),o:String(DS.cupom['onde-vale']||''),f:Date.parse(DS.cupom.fim)}:null;
function pad(n){return n<10?'0'+n:''+n}
function cupomNoPrazo(agora){return !!CUP&&agora<CUP.f}
function textoDaFaixa(k,agora){var r=[cupomNoPrazo(agora)?['cupom '+CUP.c,CUP.o].filter(Boolean).join(' '):'',k.x].filter(Boolean).join(', ');return k.t+(r?': '+r:'')+'. Termina em'}
function contar(t,fazer){fazer('d',Math.floor(t/864e5));fazer('h',pad(Math.floor(t/36e5)%24));fazer('m',pad(Math.floor(t/6e4)%60));fazer('s',pad(Math.floor(t/1e3)%60))}
var faixa=document.getElementById('topo'),fxs=faixa&&faixa.querySelector('strong'),fxt=fxs&&fxs.lastChild&&fxs.lastChild.nodeType===3?fxs.lastChild:null;
var ebs=[].slice.call(document.querySelectorAll('#bnr .eb')).map(function(e){var tx=e.textContent,k=CAMP.filter(function(c){return c.t&&tx.indexOf(c.t+' · ')===0})[0];return k?{e:e,resto:tx.slice(k.t.length+3)}:null}).filter(Boolean);
function tick(){var agora=Date.now(),i=0;while(i<CAMP.length&&CAMP[i].f<=agora)i++;var k=CAMP[i]||null;
if(DS.campanhas){if(faixa){if(!k)faixa.style.display='none';else{if(fxt){var nt=textoDaFaixa(k,agora);if(fxt.nodeValue!==nt)fxt.nodeValue=nt}contar(k.f-agora,function(id,v){var e=document.getElementById(id);if(e)e.textContent=v})}}
ebs.forEach(function(b){var nt=(k?k.t+' · ':'')+b.resto;if(b.e.textContent!==nt)b.e.textContent=nt});
document.querySelectorAll('.ticker [data-campanha]').forEach(function(x){var j=+x.getAttribute('data-campanha'),e=CAMP.filter(function(c){return c.n===j})[0];if((!e||e.f<=agora||e===k)&&x.style.display!=='none')x.style.display='none'})}
if(CUP){var tc=Math.max(0,CUP.f-agora);if(!tc)document.querySelectorAll('.pp-urg,#bnr .badge,#bnr .note').forEach(function(x){x.style.display='none'});contar(tc,function(id,v){document.querySelectorAll('[data-t="'+id+'"]').forEach(function(x){x.textContent=v})})}}
tick();setInterval(tick,1000);

var labels={site:'avaliações no site',shopee:'avaliações na Shopee',ml:'avaliações no Mercado Livre'},links={site:'Ver mais avaliações',shopee:'Ver todas na Shopee',ml:'Ver todas no Mercado Livre'};
document.querySelectorAll('.tab').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('.tab').forEach(function(x){x.setAttribute('aria-selected','false')});b.setAttribute('aria-selected','true');var k=b.getAttribute('data-tab');document.getElementById('mais-av').textContent=links[k];});});

var count=0,toast=document.getElementById('toast'),tt;
var cols=['#B84060','#E8899B','#F3C6D2','#E888A0'];
function bfly(c){return '<svg width="22" height="18" viewBox="0 0 28 22"><path d="M14 11C10 2 2 1 2 7s6 7 12 4zM14 11c4-9 12-10 12-4s-6 7-12 4zM14 11c-3 5-9 9-10 5s5-6 10-5zM14 11c3 5 9 9 10 5s-5-6-10-5z" fill="'+c+'"/><rect x="13.2" y="6" width="1.6" height="11" rx=".8" fill="#8A2E48"/></svg>'}
function burst(el){
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
for(var i=0;i<14;i++){(function(i){var p=document.createElement('div');p.className='fx';p.innerHTML=bfly(cols[i%4]);p.style.left=cx+'px';p.style.top=cy+'px';document.body.appendChild(p);
var a=Math.PI*2*i/14+(Math.random()-.5)*.5,d=70+Math.random()*70,dx=Math.cos(a)*d,dy=Math.sin(a)*d-30,rot=(Math.random()-.5)*240,s=.7+Math.random()*.5;
var an=p.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale('+s+') rotate('+rot+'deg)',opacity:1,offset:.7},{transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+(dy+25)+'px)) scale('+s*.9+') rotate('+rot*1.2+'deg)',opacity:0}],{duration:850,easing:'cubic-bezier(.2,.8,.3,1)'});an.onfinish=function(){p.remove()};})(i);}
}
var B_ACIMA=+COND['brinde-acima']||0,F_ACIMA=+COND['frete-gratis-acima']||0,B_NOME=String(COND.brinde||''),B_CURTO=String(COND['brinde-curto']||'');function rd(v){return brl(v).replace(/,00$/,'')}
var total=0,itens=[];try{var _s=JSON.parse(sessionStorage.getItem('brumar_sacola')||'null');if(_s&&_s.itens&&_s.itens.filter)itens=_s.itens.filter(function(it){return it&&it.n&&it.t&&it.p>=0&&it.q>0})}catch(e){}function somar(){var c=0;count=0;itens.forEach(function(it){c+=Math.round(it.p*100)*it.q;count+=it.q});total=c/100}function guardar(){try{sessionStorage.setItem('brumar_sacola',JSON.stringify({itens:itens}))}catch(e){}}function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}function topo(){var tb=document.getElementById('tbar'),tm=document.getElementById('tmsg');if(!tb||!tm)return;tb.style.width=Math.min(100,total/B_ACIMA*100)+'%';tm.textContent=total<=0?'Compras acima de '+rd(B_ACIMA)+' ganham o '+B_NOME+'.':total>B_ACIMA?(cupomAtual()?'Seu frete já é grátis. Com o cupom, o '+B_CURTO+' vem se o total depois do desconto passar de '+rd(B_ACIMA)+'.':'Parabéns! Você ganhou o '+B_NOME+' e o frete grátis.'):'Faltam '+brl(Math.max(0.01,B_ACIMA-total))+' para ganhar o '+B_NOME+(total>F_ACIMA?'. Seu frete já é grátis.':'.')}function brinde(){var bb=document.getElementById('brinde-bar'),bf=document.getElementById('brinde-falta'),bs=document.getElementById('brinde-sacola'),bl=document.getElementById('brinde-itens'),bm=document.getElementById('brinde-msg');if(!bb||!bf)return;var ok=total>B_ACIMA;bb.querySelector('i').style.width=Math.min(100,total/B_ACIMA*100)+'%';bb.setAttribute('aria-valuenow',Math.min(B_ACIMA,total).toFixed(2));bb.setAttribute('aria-valuetext',brl(Math.min(B_ACIMA,total))+' de '+brl(B_ACIMA));bf.classList.toggle('ok',ok);bf.innerHTML=ok?(cupomAtual()?'<span class="bf-r">Com o cupom</span><strong class="bf-v">Brinde se passar de '+esc(rd(B_ACIMA))+' depois do desconto</strong>':'<span class="bf-r">Pronto!</span><strong class="bf-v">Você ganhou o '+esc(B_CURTO)+'</strong>'):'<span class="bf-r">Falta para o seu brinde</span><strong class="bf-v">'+brl(Math.max(0.01,B_ACIMA-total))+'</strong>';bs.innerHTML=count>0?'Na sacola: <b>'+brl(total)+'</b>':'Sua sacola está vazia';bl.innerHTML=itens.map(function(it,k){return '<li><span class="bi-n">'+(it.q>1?it.q+'× ':'')+esc(it.n)+'</span><span class="bi-p">'+brl(Math.round(it.p*100)*it.q/100)+'</span><button type="button" class="bi-x" data-k="'+k+'" aria-label="Tirar 1 '+esc(it.n)+' da sacola">×</button></li>'}).join('');bl.hidden=!itens.length;var sf=document.getElementById('sacola-fim'),sc=document.getElementById('sacola-cupom');if(sf){var lk=linkYampi(itens);sf.hidden=!lk;sf.href=lk||'#'}if(sc){var cp=cupomAtual();if(cp&&!cupomVale(cp,itens))cp='';sc.hidden=!(cp&&itens.length);sc.textContent=cp?'O cupom '+cp+' vai junto para o pagamento. Se ele valer para estes produtos, o desconto aparece lá. Com cupom, o brinde conta o valor depois do desconto.':''}bm.textContent=ok?'O frete também é grátis. Se usar cupom no pagamento, o brinde conta o valor depois do desconto.':total>F_ACIMA?'Seu frete já é grátis.':'Acima de '+rd(F_ACIMA)+' o frete é grátis.'}function atualizar(){somar();document.getElementById('count').textContent=count;topo();brinde();guardar()}function por(n,p,t){var it=itens.filter(function(x){return x.t===t})[0];if(it)it.q=Math.min(20,it.q+1);else itens.push({n:n,p:p,t:t,q:1});atualizar()}function tirar(k){var it=itens[k];if(!it)return;it.q--;if(it.q<=0)itens.splice(k,1);atualizar();var bl=document.getElementById('brinde-itens'),xs=bl?bl.querySelectorAll('.bi-x'):[];if(xs.length)xs[Math.min(k,xs.length-1)].focus();else{var f=document.getElementById('brinde-falta');if(f){f.setAttribute('tabindex','-1');f.focus()}}}function brl(v){v=Math.round(v*100+1e-6)/100;var q=v.toFixed(2).split('.');return 'R$ '+q[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+q[1]}
/* troca rápida: compra pela Yampi (links /r/CODIGO:QTD, cupom, etiquetas de origem e origem do pedido) */
var CHECKOUT='https://seguro.brumarcosmeticos.com',WA='https://wa.me/'+String(DS.whatsapp||'')+'?text=',UTMS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
/* compra pela chave do kit (data-kit; dois kits juntos: "a+b"), nunca pelo nome escrito no botão */
function codigoDoKit(k){var c=[],ok=!!k;String(k||'').split('+').forEach(function(x){var it=Object.prototype.hasOwnProperty.call(KITS,x)?KITS[x]:null;if(it&&/^[A-Z0-9]{6,20}:\d{1,2}$/.test(it.codigo||''))c.push(it.codigo);else ok=false});return ok?c.join(','):''}
/* o cupom da campanha só vai com algum kit em que ele vale (cupom: true no bloco); código que o bloco não conhece (kit
   escondido no painel que ficou na sacola) conta como sem cupom */
var COM_CUPOM=[];Object.keys(KITS).forEach(function(k){if(KITS[k].cupom===true)String(KITS[k].codigo||'').split(',').forEach(function(p){if(p)COM_CUPOM.push(p.split(':')[0])})});
function cupomVale(c,lista){if(!CUP||c!==CUP.c.toUpperCase())return true;if(!cupomNoPrazo(Date.now()))return false;return lista.some(function(it){return String(it.t||'').split(',').some(function(p){return p&&COM_CUPOM.indexOf(p.split(':')[0])>=0})})}
(function(){var h=location.hash,i=h.search(/[?&]/);if(i<1)return;var q=new URLSearchParams(location.search);new URLSearchParams(h.slice(i+1)).forEach(function(v,k){if(!q.has(k))q.set(k,v)});try{history.replaceState(null,'',location.pathname+'?'+q.toString()+h.slice(0,i))}catch(e){}})();
function cupomAtual(){var c=Date.now()<lsl('brumar_cupom_ate',0)?lsl('brumar_cupom',''):'';return CUP&&c===CUP.c.toUpperCase()&&!cupomNoPrazo(Date.now())?'':c}function lsl(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}function lsg(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
(function(){var q=new URLSearchParams(location.search),c=(q.get('cupom')||q.get('promocode')||'').trim();if(/^[A-Za-z0-9_-]{2,40}$/.test(c)){lsg('brumar_cupom',c.toUpperCase());lsg('brumar_cupom_ate',Date.now()+7*864e5)}var u={},tem=false;UTMS.forEach(function(k){var v=q.get(k);if(v&&v.length<=200){u[k]=v;tem=true}});if(tem)lsg('brumar_utm',u)})();
function linkYampi(lista){var soma={},ordem=[];lista.forEach(function(it){String(it.t||'').split(',').forEach(function(p){var m=/^([A-Z0-9]{6,20}):(\d{1,2})$/.exec(p);if(!m)return;if(!(m[1] in soma)){soma[m[1]]=0;ordem.push(m[1])}soma[m[1]]+=(+m[2])*(it.q||1)})});if(!ordem.length)return '';var q=new URLSearchParams(),c=cupomAtual(),u=lsl('brumar_utm',{});if(c&&cupomVale(c,lista))q.set('promocode',c);Object.keys(u).forEach(function(k){if(UTMS.indexOf(k)>=0)q.set(k,u[k])});q.set('metadata[origem]','site');return CHECKOUT+'/r/'+ordem.map(function(t){return t+':'+Math.min(20,soma[t])}).join(',')+'?'+q.toString()}
/* na prévia do painel (<html data-previa>), nada sai do quadro: o programa da prévia mostra um aviso */
function irPara(l){if(document.documentElement.hasAttribute('data-previa')){document.dispatchEvent(new CustomEvent('previa-link',{detail:String(l)}));return}location.href=l}
document.querySelectorAll('button.buy[data-name]').forEach(function(b){b.addEventListener('click',function(){var n=b.getAttribute('data-name'),p=parseFloat(b.getAttribute('data-price')||0),t=codigoDoKit(b.getAttribute('data-kit'));burst(b);if(!t){irPara(WA+encodeURIComponent('Olá! Quero comprar o '+n+' pelo site.'));return}if(b.closest('.pp2')){irPara(linkYampi(itens.some(function(x){return x.t===t})?itens:itens.concat([{t:t,q:1}])));return}por(n,p,t);document.getElementById('toastName').textContent=n;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},6000);});});
document.querySelectorAll('a.buy').forEach(function(b){b.addEventListener('click',function(){burst(b);});});
var _bl=document.getElementById('brinde-itens');if(_bl)_bl.addEventListener('click',function(e){var x=e.target.closest('.bi-x');if(x)tirar(+x.getAttribute('data-k'))});
somar();if(count)document.getElementById('count').textContent=count;topo();brinde();
})();

(function(){var b=document.getElementById('bnr');if(!b)return;var tr=b.querySelector('.bnr-track'),dots=b.querySelectorAll('.bnr-dots button'),n=dots.length,i=0,t=null,DUR=5000;
function go(k){i=(k+n)%n;tr.style.transform='translateX(-'+(i*100)+'%)';dots.forEach(function(d,j){d.setAttribute('aria-current',j===i?'true':'false')})}
function play(){stop();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)t=setInterval(function(){go(i+1)},DUR)}
function stop(){if(t)clearInterval(t);t=null}
dots.forEach(function(d,j){d.addEventListener('click',function(){go(j);play()})});
b.querySelector('.prev').addEventListener('click',function(){go(i-1);play()});b.querySelector('.next').addEventListener('click',function(){go(i+1);play()});
b.addEventListener('mouseenter',stop);b.addEventListener('mouseleave',play);
var x0=null;b.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;stop()},{passive:true});b.addEventListener('touchend',function(e){if(x0!==null){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(dx<0?i+1:i-1);x0=null}play()});
play()})();
/* sem a seção dos depoimentos (#vt), as telas, o quiz e as opções continuam funcionando */
(function(){var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();var KITS=DS.kits||{};var v=document.getElementById('vt');if(v){var vids=v.querySelectorAll('video');vids.forEach(function(x){x.addEventListener('play',function(){vids.forEach(function(y){if(y!==x)y.pause()})})});var d=document.querySelectorAll('.vt-dots span');v.addEventListener('scroll',function(){var w=v.querySelector('.vt-s').offsetWidth+14,i=Math.round(v.scrollLeft/w);d.forEach(function(x,j){x.classList.toggle('on',j===Math.min(i,d.length-1))})},{passive:true})}
var home=document.getElementById('home');
var voltarY=null,voltarT=0,salvarY=null;function guardarY(){if(home.hidden)return;clearTimeout(salvarY);try{history.replaceState(Object.assign({},history.state,{homeY:Math.round(window.scrollY)}),'')}catch(e){}}window.addEventListener('popstate',function(e){var s=e.state;voltarY=(s&&typeof s.homeY==='number')?s.homeY:null;voltarT=Date.now()});window.addEventListener('scroll',function(){if(home.hidden)return;clearTimeout(salvarY);salvarY=setTimeout(guardarY,150)},{passive:true});document.addEventListener('click',guardarY,true);
function route(){var h=location.hash,vs=document.querySelectorAll('.view'),t=null;
if(h.indexOf('#p-')===0){t=document.getElementById(h.slice(1));}
if(t){home.hidden=true;vs.forEach(function(v){v.hidden=(v!==t)});window.scrollTo(0,0);}
else{var was=home.hidden;home.hidden=false;vs.forEach(function(v){v.hidden=true});var vy=(Date.now()-voltarT<800)?voltarY:null;voltarY=null;if(vy!==null){setTimeout(function(){window.scrollTo(0,vy)},0)}else if(h==='#inicio'||h==='#topo'){window.scrollTo(0,0)}else if(h&&h.length>1){var a=document.getElementById(h.slice(1));if(a){setTimeout(function(){a.scrollIntoView()},0)}}else if(was){window.scrollTo(0,0)}}}
window.addEventListener('hashchange',route);route();
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#inicio"]');if(a&&location.hash==='#inicio'){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}});
/* resultados do quiz (quiz.json, pelo bloco de dados): o nome é o do kit e a opção é marcada pela chave */
var Q=DS.quiz||{};
(function(){var qz=document.getElementById('qz');if(!qz)return;var A={},step=1;
function show(n){step=n;qz.querySelectorAll('.qz-s').forEach(function(x){x.hidden=(+x.getAttribute('data-s')!==n)});document.getElementById('qz-r').hidden=n!==4;document.getElementById('qz-back').hidden=(n===1||n===4);document.getElementById('qz-step').textContent=n<4?'Pergunta '+n+' de 3':'Pronto!';document.getElementById('qz-fill').style.width=(n<4?n*33.3:100)+'%';}
qz.querySelectorAll('.qo2').forEach(function(b){b.addEventListener('click',function(){var q=b.getAttribute('data-q');A[q]=b.getAttribute('data-v');b.parentNode.querySelectorAll('.qo2').forEach(function(x){x.classList.toggle('sel',x===b)});
setTimeout(function(){if(q!=='3'){show(+q+1)}else{var sz=(A['1']==='casa'&&A['2']==='medio')?'300ml':'1l';var r=Object.prototype.hasOwnProperty.call(Q,A['3']+'-'+sz)?Q[A['3']+'-'+sz]:null;if(!r||!/^[a-z0-9-]+$/.test(r.tela+r.kit))return;document.getElementById('qz-name').textContent=r.nome;document.getElementById('qz-yield').textContent=r.rendimento;document.getElementById('qz-why').textContent=r.porque;var im=document.querySelector('#p-'+r.tela+' .pp-img img');if(im){document.getElementById('qz-img').src=im.src}document.getElementById('qz-img').alt=r.nome;document.getElementById('qz-buy').href='#p-'+r.tela;var kit=r.kit,pg='p-'+r.tela;document.getElementById('qz-buy').onclick=function(){setTimeout(function(){var i=document.querySelector('#'+pg+' .vo input[data-kit="'+kit+'"]');if(i&&!i.checked){i.checked=true;i.dispatchEvent(new Event('change',{bubbles:true}))}},60)};show(4)}},220)})});
document.getElementById('qz-back').addEventListener('click',function(){show(step-1)});
document.getElementById('qz-again').addEventListener('click',function(){A={};qz.querySelectorAll('.qo2').forEach(function(x){x.classList.remove('sel')});show(1)});})();

function onpp(){document.body.classList.toggle('onpp',location.hash.indexOf('#p-')===0&&location.hash!=='#p-quem-somos'&&location.hash!=='#p-politicas')}
window.addEventListener('hashchange',onpp);onpp();
function brl2(v){v=Math.round(v*100+1e-6)/100;var q=v.toFixed(2).split('.');return 'R$ '+q[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+q[1]}
document.querySelectorAll('.vo input').forEach(function(inp){inp.addEventListener('change',function(){var sec=inp.closest('.pp2'),pr=parseFloat(inp.getAttribute('data-price')),sep=parseFloat(inp.getAttribute('data-sep')),lab=inp.getAttribute('data-label'),items=inp.getAttribute('data-items').split('|');
sec.querySelector('.pb-sep').innerHTML=(sep&&pr)?'De <s>'+brl2(sep)+'</s> <span class="off">'+Math.floor((1-pr/sep)*100+1e-9)+'% OFF</span> <span class="econ">Economize '+brl2(sep-pr)+'</span>':'';
sec.querySelector('.pb-v').textContent=pr?brl2(pr):'[PREÇO]';sec.querySelector('.pb-pix').textContent=pr?brl2(pr*0.95)+' no Pix (5% OFF)':'[PREÇO NO PIX] no Pix';sec.querySelector('.pb-parc').textContent=pr?'ou 3x de '+brl2(pr/3)+' sem juros':'ou 3x sem juros';
var ul=sec.querySelector('.incl-l');ul.innerHTML='';items.forEach(function(t){var li=document.createElement('li');li.innerHTML='<svg class="i" style="width:20px;height:20px;color:#0B8139"><use href="#i-check"/></svg>';li.appendChild(document.createTextNode(t));ul.appendChild(li)});
sec.querySelector('.incl h3').textContent=items.length>1?'Neste kit:':'Neste pedido:';
sec.querySelector('.st-l').textContent=lab;sec.querySelector('.st-p').textContent=pr?brl2(pr):'[PREÇO]';
sec.querySelectorAll('button.buy[data-follow], .pbox ~ button.buy, button.buy.big').forEach(function(b){if(!b.closest('.cj')){b.setAttribute('data-name',lab);b.setAttribute('data-price',pr||0);b.setAttribute('data-kit',inp.getAttribute('data-kit')||'')}});
var mi=sec.querySelector('.main-img'),fk=Object.prototype.hasOwnProperty.call(KITS,inp.getAttribute('data-kit'))?KITS[inp.getAttribute('data-kit')]:null;if(fk&&fk.foto)mi.src=fk.foto;})});
})();

/* aviso de compra no canto: as avaliações em destaque da inicial (destaques.json, pelo bloco de dados) */
(function(){var sp=document.getElementById('sp');if(!sp)return;var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();
var R=(DS.avisos||[]).filter(function(a){return a&&a.texto});if(!R.length)return;
var k=0,off=false;function show(){if(off)return;var ck=document.querySelector('.ck');if(ck&&!ck.hidden)return;var r=R[k%R.length],im=document.getElementById('sp-img');k++;document.getElementById('sp-t').textContent='“'+r.texto+'”';document.getElementById('sp-n').textContent=r.nome;document.getElementById('sp-c').textContent=r.comprou?'comprou '+r.comprou:'';if(r.foto)im.src=r.foto;else im.removeAttribute('src');sp.hidden=false;requestAnimationFrame(function(){sp.classList.add('show')});setTimeout(function(){sp.classList.remove('show');setTimeout(function(){sp.hidden=true},400)},6000)}
document.getElementById('sp-x').addEventListener('click',function(){off=true;sp.classList.remove('show');setTimeout(function(){sp.hidden=true},400)});
if(!document.documentElement.hasAttribute('data-previa'))setTimeout(function(){show();setInterval(show,18000)},7000)})();
