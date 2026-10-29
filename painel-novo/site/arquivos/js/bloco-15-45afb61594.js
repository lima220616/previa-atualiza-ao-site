/* 27/10: seção "Ofertas no seu WhatsApp" com e-mail. Vai para o Netlify Forms (cópia de segurança) e, ao mesmo tempo,
   para /api/lead (Yampi); deu certo se pelo menos um dos dois recebeu. "t" conta desde que este programa rodou (a página
   carregou): é o jeito mais simples, e ninguém preenche nome, e-mail e WhatsApp em menos de 3 segundos depois disso. */
(function(){var f=document.getElementById('wz-f');if(!f)return;var tel=document.getElementById('wz-tel'),err=document.getElementById('wz-err'),T0=Date.now(),REAL=/netlify|brumarcosmeticos/.test(location.hostname);
/* e-mail: EXATAMENTE a regra da função (funcoes-site/lib/comum.mjs, emailValido); o teste confere que é a mesma */
function emailOk(e){return e.length<=254&&/^[^\s@<>()",;:]{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(e)}
function utm(){try{var u=JSON.parse(localStorage.getItem('brumar_utm')||'{}');return u&&typeof u==='object'&&!Array.isArray(u)?u:{}}catch(x){return {}}}
tel.addEventListener('input',function(ev){var x=tel.value.replace(/\D/g,'').replace(/^0+/,''),ad=(tel.dataset.ant||'').replace(/\D/g,'').length,cola=!ev||!ev.inputType||!/^(insertText|insertCompositionText|delete)/.test(ev.inputType)||x.length-ad>1;if(!cola&&x.length>11){tel.value=tel.dataset.ant||'';return}if(cola&&x.length>11&&x.indexOf('55')===0&&/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(x.slice(2)))x=x.slice(2);var d=x.slice(0,11),o='';if(d.length>0)o='('+d.slice(0,2);if(d.length>=3)o+=') '+d.slice(2,d.length>10?7:6);if(d.length>=7)o+='-'+d.slice(d.length>10?7:6);tel.value=o;tel.dataset.ant=o});
f.addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('wz-nome').value.trim(),em=document.getElementById('wz-email').value.trim(),d=tel.value.replace(/\D/g,''),ok=document.getElementById('wz-ok').checked;
if(n.length<2){err.textContent='Escreva o seu nome.';return}
if(!emailOk(em)){err.textContent='Confira o seu e-mail.';return}
if(!/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(d)){err.textContent='Confira o seu WhatsApp com DDD.';return}
if(!ok){err.textContent='Marque a autorização para receber as ofertas no WhatsApp.';return}
err.textContent='';
/* No site publicado na Netlify, este formulário é recebido pelo Netlify Forms (data-netlify="true"). */
var fim=function(){document.getElementById('wz-n').textContent=n.split(' ')[0];f.hidden=true;document.getElementById('wz-done').hidden=false;try{localStorage.setItem('brumar_wzp','ok')}catch(x){}};
if(!REAL){fim();return}
var b=f.querySelector('button[type=submit]');b.disabled=true;
var corpo={nome:n,email:em,whatsapp:d,autorizacao:true,origem:'ofertas',pagina:location.pathname+location.hash,utm:utm(),t:Date.now()-T0,site:(f.querySelector('[name=bot-field]')||{}).value||''};
/* os dois envios ao mesmo tempo; a resposta para a cliente vem quando os dois terminarem */
var falta=2,deu=false;function chegou(ok){if(ok)deu=true;if(--falta)return;
 if(!deu){b.disabled=false;err.textContent='Não deu para enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.';return}
 fim();try{document.dispatchEvent(new CustomEvent('brumar:lead',{detail:{origem:'ofertas'}}))}catch(x){}}
fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()}).then(function(r){chegou(r.ok)},function(){chegou(false)});
fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)}).then(function(r){chegou(r.ok)},function(){chegou(false)})});})();
