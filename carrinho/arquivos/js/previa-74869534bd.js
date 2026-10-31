/* Prévia do painel (etapa 14). Só roda com <html data-previa>, que o molde escreve só na prévia: a página publicada
   nunca carrega este programa. Ele vem antes dos outros e faz com que nada saia do quadro da prévia:
   - a sacola, o cupom e as etiquetas ficam só na memória (localStorage e sessionStorage de mentira): nada fica gravado
     no navegador de quem testa (o painel tem o mesmo endereço do site) e some ao recarregar;
   - nenhum formulário é enviado (nem pelo programa dele): aparece um aviso;
   - links para fora (Yampi, WhatsApp, redes, /bio/, políticas) e o "Comprar" (bloco-01, evento previa-link) não
     abrem: aparece um aviso;
   - links "#..." trocam a tela por dentro (no quadro srcdoc, o link "#p-gloss" levaria o quadro para /painel/#p-gloss);
   - com o foco num produto, kit ou dúvida, abre a tela dele (data-previa-tela) antes de o bloco-01 escolher a tela. */
(function(){var raiz=document.documentElement;if(!raiz.hasAttribute('data-previa'))return;
function memoria(){var d=Object.create(null);return {getItem:function(k){k=String(k);return k in d?d[k]:null},setItem:function(k,v){d[String(k)]=String(v)},removeItem:function(k){delete d[String(k)]},clear:function(){d=Object.create(null)},key:function(i){var c=Object.keys(d);return i>=0&&i<c.length?c[i]:null},get length(){return Object.keys(d).length}}}
/* se o navegador não deixar trocar, ao menos nada é gravado */
['localStorage','sessionStorage'].forEach(function(n){var m=memoria(),ok=false;try{Object.defineProperty(window,n,{value:m,configurable:true,enumerable:true,writable:false});ok=window[n]===m}catch(e){}
 if(!ok)try{var S=window.Storage&&Storage.prototype;if(S){S.setItem=function(){};S.removeItem=function(){};S.clear=function(){}}}catch(e){}});
var caixa=null,tempo=null;
function avisar(t){if(!document.body)return;if(!caixa){caixa=document.createElement('div');caixa.id='previa-aviso';caixa.setAttribute('role','status');caixa.setAttribute('aria-live','polite');var s=caixa.style;s.position='fixed';s.left='50%';s.bottom='18px';s.transform='translateX(-50%)';s.zIndex='2147483647';s.width='max-content';s.maxWidth='calc(100vw - 32px)';s.boxSizing='border-box';s.padding='12px 16px';s.borderRadius='10px';s.background='#8A2E48';s.color='#fff';s.font='600 14px/1.45 Montserrat,Arial,sans-serif';s.textAlign='center';s.boxShadow='0 6px 22px rgba(0,0,0,.25)';document.body.appendChild(caixa)}
 caixa.textContent=t;caixa.hidden=false;clearTimeout(tempo);tempo=setTimeout(function(){caixa.hidden=true},5000)}
function destino(h){h=String(h||'');var m=/^https:\/\/([^\/?#]+)/i.exec(h);
 if(/^https:\/\/seguro\.brumarcosmeticos\.com(?:[\/?#]|$)/i.test(h))return 'Prévia: o pagamento não abre aqui. No site, este botão leva para a compra na Yampi.';
 if(/^https:\/\/(?:wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)(?:[\/?#]|$)/i.test(h))return 'Prévia: o WhatsApp não abre aqui. No site, este link abre a conversa.';
 if(/^mailto:/i.test(h))return 'Prévia: o e-mail não abre aqui. No site, este link abre o e-mail.';
 if(m)return 'Prévia: este link não abre aqui. No site, ele leva para '+m[1].replace(/^www\./i,'')+'.';
 if(h.charAt(0)==='/')return 'Prévia: este link não abre aqui. No site, ele leva para '+h.split(/[?#]/)[0]+'.';
 return 'Prévia: este link não abre aqui.'}
/* troca de tela por dentro: o mesmo que o link "#..." faz no site (o bloco-01 troca a tela quando o "#" muda) */
function ir(h){try{if(location.hash!==h&&!(h==='#'&&!location.hash))location.hash=h;else if(h.length>1){var t=document.getElementById(h.slice(1));if(t&&!t.classList.contains('view'))t.scrollIntoView()}}catch(x){}}
function linkDe(e){return e.target&&e.target.closest?e.target.closest('a[href]'):null}
window.addEventListener('click',function(e){var a=linkDe(e);if(!a)return;var h=a.getAttribute('href')||'';if(h.charAt(0)==='#')return;e.preventDefault();setTimeout(function(){avisar(destino(a.getAttribute('href')||h))},0)},true);
/* o botão do meio do mouse (ou da rodinha) abriria o link em outra aba: também não abre */
window.addEventListener('auxclick',function(e){var a=linkDe(e);if(!a)return;var h=a.getAttribute('href')||'';if(h.charAt(0)==='#')return;e.preventDefault();avisar(destino(h))},true);
window.addEventListener('click',function(e){if(e.defaultPrevented)return;var a=linkDe(e);if(!a)return;var h=a.getAttribute('href')||'';if(h.charAt(0)!=='#')return;e.preventDefault();ir(h)});
window.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();avisar('Prévia: nada foi enviado. No site, este formulário vai para a Brumar.')},true);
document.addEventListener('previa-link',function(e){avisar(destino(e.detail))});
/* a tela do foco: o "#" muda sem a rolagem do navegador até a tela (ela seguraria a página ali enquanto carrega, e o
   painel não conseguiria rolar até a parte do foco); o bloco-01 lê o "#" e abre a tela */
var tela=raiz.getAttribute('data-previa-tela')||'';if(/^p-[a-z0-9-]+$/.test(tela)&&document.getElementById(tela)){try{history.replaceState(history.state,'',location.href.split('#')[0]+'#'+tela)}catch(x){}if(location.hash!=='#'+tela)ir('#'+tela)}
})();
