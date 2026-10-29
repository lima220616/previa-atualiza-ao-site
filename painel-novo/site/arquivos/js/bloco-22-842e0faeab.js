/* 20/10: caixa de avaliação (estrelas, foto, envio). Na prévia, avisa que nada foi enviado.
   27/10: com e-mail. Vai para o Netlify Forms (com a foto: a cópia de segurança) e, ao mesmo tempo, para /api/avaliacao
   (Yampi, sem a foto); deu certo se pelo menos um dos dois recebeu. "t" conta desde que a cliente tocou na caixa. */
(function(){var DS=(function(){try{var e=document.getElementById('dados-site');return (e&&JSON.parse(e.textContent))||{}}catch(x){return {}}})();var WA=String(DS.whatsapp||''),REAL=/netlify|brumarcosmeticos/.test(location.hostname);
/* e-mail: EXATAMENTE a regra da função (funcoes-site/lib/comum.mjs, emailValido); o teste confere que é a mesma */
function emailOk(e){return e.length<=254&&/^[^\s@<>()",;:]{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(e)}
/* A foto vai sempre redesenhada como JPEG novo (menor e sem dados escondidos, como o local). Se o navegador não abre
   a foto (ex.: HEIC no Chrome), devolve null e a foto não é enviada. */
function reduzir(file){if(!window.createImageBitmap)return Promise.resolve(null);
 return createImageBitmap(file).then(function(b){var M=1600,k=Math.min(1,M/Math.max(b.width,b.height)),c=document.createElement('canvas');
  c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
  return new Promise(function(r){c.toBlob(function(x){r(x)},'image/jpeg',.85)})}).catch(function(){return null})}
document.querySelectorAll('form.fav').forEach(function(f){
 /* quem começou a avaliar não recebe a janela de ofertas do WhatsApp por cima */
 var T0=Date.now(),tocou=false;
 f.addEventListener('focusin',function(){if(!tocou){tocou=true;T0=Date.now()}try{sessionStorage.setItem('brumar_wzp','visto')}catch(e){}});
 f.querySelectorAll('.fav-st').forEach(function(g){var ins=g.querySelectorAll('input'),ls=g.querySelectorAll('label');
  function pinta(){var v=0;ins.forEach(function(i){if(i.checked)v=+i.value});ls.forEach(function(l,k){l.classList.toggle('on',k<v)})}
  ins.forEach(function(i){i.addEventListener('change',pinta)})});
 var foto=f.querySelector('input[type=file]'),fn=f.querySelector('.fav-fn'),fx=f.querySelector('.fav-fx'),okf=f.querySelector('.fav-okf');
 function mostraFoto(){var tem=!!(foto.files&&foto.files[0]);fn.textContent=tem?'Foto escolhida ✓':'Adicionar foto';
  f.querySelector('.fav-f').classList.toggle('on',tem);fx.hidden=!tem;okf.hidden=!tem;if(!tem)okf.querySelector('input').checked=false}
 foto.addEventListener('change',mostraFoto);fx.addEventListener('click',function(){foto.value='';mostraFoto();limpa()});
 var prod=f.querySelector('[name=produto]'),v=f.querySelector('.fav-v'),err=f.querySelector('.fav-err');
 function limpa(){f.querySelectorAll('.fav-ce').forEach(function(s){s.textContent=''});err.textContent='';
  f.querySelectorAll('[aria-invalid]').forEach(function(x){x.removeAttribute('aria-invalid')});f.querySelector('.fav-rs').classList.remove('erro')}
 /* o aviso some enquanto a cliente corrige (e não quando ela sai do campo, para o botão não pular de lugar) */
 f.addEventListener('input',limpa);
 function erro(msg,campo,slot,foco){limpa();var s=document.getElementById(slot);if(s)s.textContent=msg;
  err.textContent='Falta uma parte: veja o aviso em vermelho acima.';if(campo)campo.setAttribute('aria-invalid','true');
  try{foco.focus({preventScroll:true})}catch(e){foco.focus()}(s||foco).scrollIntoView({block:'center',behavior:'smooth'})}
 v.addEventListener('click',function(){var p=prod.value;v.href='https://wa.me/'+WA+'?text='+encodeURIComponent('Oi! Quero mandar o vídeo da minha avaliação'+(p?' do '+p:'')+'.')});
 f.addEventListener('submit',function(e){e.preventDefault();var nome=f.querySelector('[name=nome]'),email=f.querySelector('[name=email]'),aut=f.querySelector('[name=autorizo]'),btn=f.querySelector('.fav-b');
  if(!prod.value)return erro('Escolha o produto que você usou.',prod,prod.id+'-e',prod);
  if(!f.querySelector('[name=nota_produto]:checked')){erro('Toque nas estrelas para dar a nota do produto.',null,f.id+'-r-e',f.querySelector('[name=nota_produto]'));f.querySelector('.fav-rs').classList.add('erro');return}
  var com=f.querySelector('[name=comentario]');if(com.value.trim().length<3)return erro('Escreva um comentário curto sobre o produto.',com,com.id+'-e',com);
  if(nome.value.trim().length<2)return erro('Escreva o seu nome.',nome,nome.id+'-e',nome);
  var em=email.value.trim();if(!emailOk(em))return erro('Confira o seu e-mail.',email,email.id+'-e',email);
  if(!aut.checked)return erro('Marque a autorização para publicar a sua avaliação.',aut,f.id+'-a-e',aut);
  limpa();btn.disabled=true;btn.textContent='Enviando...';
  var fotoOk=!!(foto.files&&foto.files[0])&&okf.querySelector('input').checked;
  function volta(){btn.disabled=false;btn.textContent='Enviar avaliação'}
  function fim(ok,previa){if(!ok){volta();err.textContent='Não deu para enviar agora. Tente de novo em instantes ou fale com a gente pelo WhatsApp.';return}
   f.querySelector('.fav-obg').textContent='Obrigada, '+nome.value.trim().split(/\s+/)[0]+'! 💜';
   if(previa)f.querySelector('.fav-fimt').textContent='Isto é uma prévia: nada foi enviado. No site de verdade, a sua avaliação vai para a Brumar conferir.';
   f.querySelector('.fav-campos').hidden=true;var m=f.querySelector('.fav-fim');m.hidden=false;m.focus({preventScroll:true});m.scrollIntoView({block:'center',behavior:'smooth'})}
  if(!REAL){fim(true,true);return}
  (fotoOk?reduzir(foto.files[0]):Promise.resolve(null)).then(function(b){
   if(fotoOk&&!b)throw new Error('formato');if(b&&b.size>7.5e6)throw new Error('grande');
   var fd=new FormData(f);fd.delete('foto');if(b)fd.append('foto',b,'foto.jpg');
   var g=function(n){var x=f.querySelector('[name='+n+']');return x?String(x.value||'').trim():''};
   var py=g('produto_yampi');
   var corpo={produto:f.id.replace(/^fav-/,''),produto_yampi:py,nome:nome.value.trim(),email:em,nota:+f.querySelector('[name=nota_produto]:checked').value,comentario:g('comentario'),pedido:g('pedido'),autorizo:true,t:Date.now()-T0,site:g('bot-field')};
   /* os dois envios ao mesmo tempo (depois de a foto ficar pronta); a resposta vem quando os dois terminarem. Tela sem o
      produto da Yampi (campo produto_yampi vazio): só o Netlify Forms, sem chamar /api/avaliacao. */
   return new Promise(function(pronto){var falta=py?2:1,deu=false;function chegou(ok){if(ok)deu=true;if(!--falta)pronto(deu)}
    fetch('/',{method:'POST',body:fd}).then(function(r){chegou(r.ok)},function(){chegou(false)});
    if(py)fetch('/api/avaliacao',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo)}).then(function(r){chegou(r.ok)},function(){chegou(false)})})}).then(function(ok){fim(ok);
   if(ok)try{document.dispatchEvent(new CustomEvent('brumar:avaliacao',{detail:{produto:f.id.replace(/^fav-/,'')}}))}catch(x){}}).catch(function(x){volta();
   if(x&&x.message==='formato')return erro('Essa foto está num formato que o site não abre. Tire um print da foto e envie o print, ou mande pelo WhatsApp.',null,f.id+'-f-e',fx);
   if(x&&x.message==='grande')return erro('A foto é muito grande. Escolha outra, tire a foto ou mande pelo WhatsApp.',null,f.id+'-f-e',fx);
   fim(false)})})})})();
