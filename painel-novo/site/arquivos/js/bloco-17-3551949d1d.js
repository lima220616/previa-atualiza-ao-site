/* 19/10: play grande no meio dos vídeos; tocar em qualquer parte do vídeo começa a rodar (abre em tela cheia) */
(function(){var PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
document.querySelectorAll('#vt video.vt-v, #reels video.reel').forEach(function(v){
 var w=document.createElement('div');w.className='vplay';v.parentNode.insertBefore(w,v);w.appendChild(v);
 var b=document.createElement('button');b.type='button';b.className='vplay-b';b.setAttribute('aria-label','Assistir: '+(v.getAttribute('aria-label')||'vídeo'));
 b.innerHTML='<span>'+PLAY+'</span>';
 b.addEventListener('click',function(){var p=v.play();if(p&&p.catch)p.catch(function(){v.controls=true})});
 w.appendChild(b)})})();
