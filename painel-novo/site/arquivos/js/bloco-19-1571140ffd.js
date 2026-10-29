/* 19/10: abas Site Brumar / Shopee / Mercado Livre; na página de avaliações, as setas passam a mover a fileira da aba aberta */
document.querySelectorAll('.av-tabs').forEach(function(tl){var box=tl.parentElement,ts=tl.querySelectorAll('.av-tab');
function abrir(t){var k=t.getAttribute('data-aba');ts.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1});
box.querySelectorAll('.av-aba').forEach(function(p){var on=p.getAttribute('data-aba')===k;p.hidden=!on;var r=p.getAttribute('data-row');
if(on&&r)box.querySelectorAll('.av-a').forEach(function(a){a.setAttribute('data-row',r)})})}
ts.forEach(function(t,i){if(t.getAttribute('aria-selected')!=='true')t.tabIndex=-1;t.addEventListener('click',function(){abrir(t)});
t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();var n=ts[(i+d+ts.length)%ts.length];n.focus();abrir(n)})})});
