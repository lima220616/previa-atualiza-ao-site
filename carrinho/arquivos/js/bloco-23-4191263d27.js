/* 20/10: página Lucre com a Brumar (botões que rolam a tela, máscara do WhatsApp, cadastros) */
(function(){var pg=document.getElementById('p-lucre');if(!pg)return;var REAL=/netlify|brumarcosmeticos/.test(location.hostname);
pg.querySelectorAll('[data-lc]').forEach(function(b){b.addEventListener('click',function(){var a=document.getElementById(b.getAttribute('data-lc'));if(a)a.scrollIntoView({behavior:'smooth',block:'start'})})});
pg.querySelectorAll('input.lc-tel').forEach(function(t){t.addEventListener('input',function(ev){var x=t.value.replace(/\D/g,'').replace(/^0+/,''),ad=(t.dataset.ant||'').replace(/\D/g,'').length,cola=!ev||!ev.inputType||!/^(insertText|insertCompositionText|delete)/.test(ev.inputType)||x.length-ad>1;if(!cola&&x.length>11){t.value=t.dataset.ant||'';return}if(cola&&x.length>11&&x.indexOf('55')===0&&/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(x.slice(2)))x=x.slice(2);var d=x.slice(0,11),o='';if(d.length>0)o='('+d.slice(0,2);if(d.length>=3)o+=') '+d.slice(2,d.length>10?7:6);if(d.length>=7)o+='-'+d.slice(d.length>10?7:6);t.value=o;t.dataset.ant=o})});
pg.querySelectorAll('input[name=uf]').forEach(function(u){u.addEventListener('input',function(){u.value=u.value.toUpperCase()})});
var df=pg.querySelector('form[data-kind="dis"]');df.querySelectorAll('input[name="ja_representa"]').forEach(function(r){r.addEventListener('change',function(){var q=df.querySelector('.lc-qual'),mi=q.querySelector('input');q.hidden=!(r.value==='sim'&&r.checked);mi.disabled=q.hidden;if(q.hidden)mi.value=''})});
pg.querySelectorAll('form.lc-form').forEach(function(f){var err=f.querySelector('.lc-err');f.addEventListener('input',function(){err.textContent=''});
 f.addEventListener('submit',function(e){e.preventDefault();var v=function(n){var x=f.querySelector('[name="'+n+'"]');return x?x.value.trim():''};
  var tel=v('whatsapp').replace(/\D/g,''),foco=function(n){var x=f.querySelector('[name="'+n+'"]');if(x){x.focus({preventScroll:true});x.scrollIntoView({block:'center',behavior:'smooth'})}};
  if(v('nome').length<2){err.textContent='Escreva o seu nome.';return foco('nome')}
  if(!/^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(tel)){err.textContent='Confira o seu WhatsApp com DDD.';return foco('whatsapp')}
  if(v('instagram').length<2){err.textContent='Informe o seu Instagram.';return foco('instagram')}
  if(!v('cidade')||v('uf').length!==2){err.textContent='Informe a sua cidade e o estado (UF).';return foco(v('cidade')?'uf':'cidade')}
  if(!f.querySelector('input[type=radio]:checked')){err.textContent='Responda a pergunta de sim ou não.';return}
  if(!f.querySelector('[name="autorizacao"]').checked){err.textContent='Marque a autorização de contato pelo WhatsApp.';return}
  err.textContent='';var btn=f.querySelector('button[type=submit]');
  function fim(previa){var d=f.nextElementSibling;d.querySelector('.lc-n').textContent=v('nome').split(/\s+/)[0];
   if(previa)d.querySelector('.lc-dt').textContent='Isto é uma prévia: nada foi enviado. No site de verdade, o cadastro vai para a equipe Brumar.';
   f.hidden=true;d.hidden=false;d.focus({preventScroll:true});d.scrollIntoView({block:'center',behavior:'smooth'})}
  if(!REAL){fim(true);return}
  btn.disabled=true;var txt=btn.textContent;btn.textContent='Enviando...';
  fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
   .then(function(r){if(!r.ok)throw 0;fim(false)}).catch(function(){btn.disabled=false;btn.textContent=txt;err.textContent='Não deu para enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.'})})});
})();
