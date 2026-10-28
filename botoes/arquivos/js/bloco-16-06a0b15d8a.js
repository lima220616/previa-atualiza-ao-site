/* 27/10: janela do cupom com e-mail. Vai para o Netlify Forms (cópia de segurança) e, ao mesmo tempo, para /api/lead
   (Yampi); deu certo se pelo menos um dos dois recebeu. "t" conta desde que a janela abriu. */
(function(){var m=document.getElementById('wzp');if(!m)return;var KEY='brumar_wzp',T0=Date.now(),REAL=/netlify|brumarcosmeticos/.test(location.hostname);
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
/* e-mail: EXATAMENTE a regra da função (funcoes-site/lib/comum.mjs, emailValido); o teste confere que é a mesma */
function emailOk(e){return e.length<=254&&/^[^\s@<>()",;:]{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(e)}
function utm(){try{var u=JSON.parse(localStorage.getItem('brumar_utm')||'{}');return u&&typeof u==='object'&&!Array.isArray(u)?u:{}}catch(x){return {}}}
function sget(k){try{return sessionStorage.getItem(k)}catch(e){return null}}function sset(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
// enquanto o aviso de cookies (.ck, do rastreio.js) estiver na tela, a janela espera a escolha (um toque em "Recusar" não pode cair nela)
function open(){var ck=document.querySelector('.ck');if(ck&&!ck.hidden){setTimeout(open,2000);return}if(document.documentElement.hasAttribute('data-previa')||location.hash==='#p-politicas'||get(KEY)==='ok'||sget(KEY)||document.body.classList.contains('vfs-on')||document.body.classList.contains('lbx-on')||document.body.classList.contains('open'))return;m.hidden=false;T0=Date.now();document.body.classList.add('wzp-on');sset(KEY,'visto');try{history.pushState({wzp:1},'');pushed=true}catch(e){}}
var pushed=false;function close(semVoltar){if(m.hidden)return;m.hidden=true;document.body.classList.remove('wzp-on');if(pushed){pushed=false;if(semVoltar!==true)try{history.back()}catch(e){}}}window.addEventListener('popstate',function(){if(!m.hidden){pushed=false;close(true)}});
setTimeout(open,6000);
document.getElementById('wzp-x').addEventListener('click',close);
document.getElementById('wzp-no').addEventListener('click',close);
m.addEventListener('click',function(e){if(e.target===m)close();else if(e.target.closest&&e.target.closest('a[href^="#"]'))close(true)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close()});
var tel=document.getElementById('wzp-tel'),err=document.getElementById('wzp-err'),f=document.getElementById('wzp-f');
tel.addEventListener('input',function(ev){var x=tel.value.replace(/\D/g,'').replace(/^0+/,''),ad=(tel.dataset.ant||'').replace(/\D/g,'').length,cola=!ev||!ev.inputType||!/^(insertText|insertCompositionText|delete)/.test(ev.inputType)||x.length-ad>1;if(!cola&&x.length>11){tel.value=tel.dataset.ant||'';return}if(cola&&x.length>11&&x.indexOf('55')===0&&/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(x.slice(2)))x=x.slice(2);var d=x.slice(0,11),o='';if(d.length>0)o='('+d.slice(0,2);if(d.length>=3)o+=') '+d.slice(2,d.length>10?7:6);if(d.length>=7)o+='-'+d.slice(d.length>10?7:6);tel.value=o;tel.dataset.ant=o});
f.addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('wzp-nome').value.trim(),em=document.getElementById('wzp-email').value.trim(),d=tel.value.replace(/\D/g,''),ok=document.getElementById('wzp-ok').checked;
if(n.length<2){err.textContent='Escreva o seu nome.';return}
if(!emailOk(em)){err.textContent='Confira o seu e-mail.';return}
if(!/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(d)){err.textContent='Confira o seu WhatsApp com DDD.';return}
if(!ok){err.textContent='Marque a autorização para receber as ofertas no WhatsApp.';return}
err.textContent='';
var fim=function(){set(KEY,'ok');document.getElementById('wzp-n').textContent=n.split(' ')[0];f.hidden=true;document.getElementById('wzp-done').hidden=false};
if(!REAL){fim();return}
var b=f.querySelector('button[type=submit]');b.disabled=true;
var corpo={nome:n,email:em,whatsapp:d,autorizacao:true,origem:'pop-up',pagina:location.pathname+location.hash,utm:utm(),t:Date.now()-T0,site:(f.querySelector('[name=bot-field]')||{}).value||''};
/* os dois envios ao mesmo tempo; a resposta para a cliente vem quando os dois terminarem */
var falta=2,deu=false;function chegou(ok){if(ok)deu=true;if(--falta)return;
 if(!deu){b.disabled=false;err.textContent='Não deu para enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.';return}
 fim();try{document.dispatchEvent(new CustomEvent('brumar:lead',{detail:{origem:'pop-up'}}))}catch(x){}}
fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()}).then(function(r){chegou(r.ok)},function(){chegou(false)});
fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)}).then(function(r){chegou(r.ok)},function(){chegou(false)})});
document.getElementById('wzp-copy').addEventListener('click',function(){var b=this,c=document.getElementById('wzp-code').textContent;function done(){b.textContent='Copiado!'}
function falhou(){var ok=false;try{var r=document.createRange();r.selectNodeContents(document.getElementById('wzp-code'));var s=getSelection();s.removeAllRanges();s.addRange(r);ok=document.execCommand('copy')}catch(e){}b.textContent=ok?'Copiado!':'Selecionado'}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(c).then(done,falhou)}else{falhou()}});
document.getElementById('wzp-go').addEventListener('click',function(){close(true);if(location.hash.indexOf('#p-')===0)return;location.hash='#mais-vendido';var t=document.getElementById('mais-vendido');if(t)t.scrollIntoView({behavior:'smooth'})});
var sf=document.getElementById('wz-f');if(sf)sf.addEventListener('submit',function(){setTimeout(function(){if(sf.hidden)set(KEY,'ok')},50)});
})();
