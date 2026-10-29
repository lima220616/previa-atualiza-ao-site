// O estilo do site inteiro: parte fixa, igual ao site de hoje letra por letra (vai dentro do <head>).
import { h } from "../../html.mjs";

export const ESTILO = h`<style>
:root{
--rosa:#B84060;--rosa-esc:#8A2E48;--rosa-cl:#FCE7EB;--blush:#FDF0F3;--vinho:#8A2E48;--texto:#8A2E48;--texto2:#7A3A4C;
--verde:#0B8139;--verde-h:#096B2F;--vermelho:#D93A3A;--bg:#FFFFFF;--card:#FFFFFF;--linha:#F3D3DA;--foto:#FFFFFF;
--serif:'Playfair Display',Georgia,'Times New Roman',serif;--sans:'Montserrat',Helvetica,Arial,sans-serif;
color-scheme:light;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--texto);font-family:var(--sans);font-size:18px;line-height:1.6;-webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
a{color:inherit}
h1,h2,h3{font-family:var(--serif);font-weight:700;line-height:1.15;margin:0;text-wrap:balance}
h2{font-size:clamp(28px,4.5vw,40px)}
p{margin:0}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
section{padding:56px 0;border-top:1px solid #F3D3DA}
.sec-head{display:flex;flex-direction:column;gap:10px;margin-bottom:28px;max-width:640px}
.sec-head p{color:var(--texto2)}
svg.i{width:24px;height:24px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.ib{width:48px;height:48px;border-radius:50%;background:var(--rosa-cl);color:var(--rosa);display:flex;align-items:center;justify-content:center;flex-shrink:0}
:focus-visible{outline:3px solid var(--rosa);outline-offset:2px}
button{font:inherit;cursor:pointer}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:12px 24px;border-radius:10px;border:2px solid transparent;font-weight:700;font-size:17px;text-decoration:none;transition:transform .15s,background .15s}
.btn:active{transform:scale(.96)}
.buy{background:var(--verde);color:#fff}
.buy:hover{background:var(--verde-h)}
.ghost{background:transparent;border-color:var(--rosa);color:var(--rosa)}

/* barra rolante */
.ticker{background:var(--rosa);color:#fff;overflow:hidden;font-size:14px;font-weight:600}
.ticker-track{display:flex;gap:48px;width:max-content;padding:9px 0;animation:tick 32s linear infinite}
.ticker span{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ticker svg.i{width:18px;height:18px}
@keyframes tick{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: reduce){.ticker-track{animation:none}}

/* cabeçalho */
header{position:sticky;top:0;z-index:30;box-shadow:0 2px 10px rgba(138,46,72,.08);background:#fff;border-bottom:1px solid #F3D3DA}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:21;background:#fff}
.hd{display:flex;align-items:center;gap:6px;height:72px}
.hd .logo{flex:1;display:flex;justify-content:center}
.hd-left,.hd-right{display:flex;align-items:center;gap:2px}
.hd-right{justify-content:flex-end}
.icon-btn{width:44px;height:44px;border:0;background:transparent;color:var(--rosa);display:flex;align-items:center;justify-content:center;border-radius:10px;position:relative;text-decoration:none}
.icon-btn:hover{background:#FDF0F3}
.hd .logo img{height:52px;width:auto}
.icon-btn.wa-ic{color:#25D366}
@media (max-width:520px){.hd .logo img{height:42px}.icon-btn{width:38px;height:44px}}
.badge{position:absolute;top:4px;right:2px;min-width:18px;height:18px;border-radius:9px;background:var(--verde);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px}


/* urgência */
.urg{background:#D93A3A;color:#fff}
.urg .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 16px;padding-top:10px;padding-bottom:10px}
.urg strong{color:#fff;font-size:15px;display:inline-flex;align-items:center;gap:6px}
.timer{display:flex;gap:6px}
.timer div{background:#fff;color:#D93A3A;border-radius:8px;min-width:46px;padding:4px 6px;text-align:center;font-weight:700;font-size:16px;line-height:1.1}
.timer small{display:block;font-size:10px;font-weight:600;color:#8A2E48}
.vip{background:#0B0B0B;color:#E8C77A}
.vip .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 16px;padding-top:10px;padding-bottom:12px;text-align:center}
.vip b{color:#F2D58C}
.vip a{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(180deg,#F5E8C8,#D9B25F);color:#1A1208;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;padding:8px 16px;min-height:40px}
.vip a svg{width:18px;height:18px;fill:#fff}

/* hero */
.hero{background:#FFFFFF;padding:40px 0 48px}

.hero h1{font-size:clamp(34px,5.6vw,58px);color:var(--texto)}
.hero .sub{font-size:20px;color:var(--texto2);margin:16px 0 24px;max-width:520px}
.hero .ctas{display:flex;flex-wrap:wrap;gap:12px}
.hero .pic{background:#fff;border-radius:28px 28px 120px 28px;overflow:hidden;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06)}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--rosa);color:#fff;border-radius:6px;font-size:13px;font-weight:700;padding:5px 10px;margin-bottom:16px}


.hero .wrap{display:flex;flex-direction:column;gap:28px}
.hero-txt{max-width:760px}
.bnr{position:relative;border-radius:24px;overflow:hidden;box-shadow:0 14px 36px rgba(138,46,72,.12);background:#FDF0F3}
.bnr-track{display:flex;transition:transform .6s ease}
.bnr-s{flex:0 0 100%;aspect-ratio:16/7;position:relative;display:flex;align-items:center;justify-content:center;text-decoration:none;background:#fff}
.bnr-s img{height:100%;width:auto;object-fit:contain}
.bnr-s.ph2{background:#FCE7EB}.bnr-s.ph3{background:#F5E8C8}.bnr-s.ph4{background:#F8C8D0}
.bnr-ph{position:absolute;left:16px;bottom:44px;background:rgba(255,255,255,.92);color:#8A2E48;font-weight:700;font-size:15px;padding:8px 12px;border-radius:10px;line-height:1.3}
.bnr-ph small{font-weight:600;font-size:12px}
.bnr-nav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:#B84060;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.12)}
.bnr-nav.prev{left:12px}.bnr-nav.next{right:12px}
.bnr-dots{position:absolute;left:0;right:18px;bottom:16px;display:flex;justify-content:flex-end;gap:8px;z-index:4}
.bnr-dots button{width:10px;height:10px;border-radius:5px;border:0;background:rgba(255,255,255,.8);box-shadow:0 0 0 1px rgba(184,64,96,.4);padding:0;transition:width .3s}
.bnr-dots button[aria-current="true"]{width:28px;background:#B84060}
@media (max-width:760px){.bnr-s{aspect-ratio:4/5}.bnr-nav{display:none}}
@media (prefers-reduced-motion: reduce){.bnr-track{transition:none}}
.bnr-s{display:block}
.bnx{container-type:size;position:relative;width:100%;height:100%;overflow:hidden;font-family:'Montserrat',Helvetica,Arial,sans-serif;text-decoration:none;display:block}
.bnx.dark{background:radial-gradient(120% 90% at 70% 25%,#B84060 0%,#8A2E48 55%,#5E1F31 100%);color:#fff}
.bnx.light{background:radial-gradient(120% 90% at 70% 25%,#FFFFFF 0%,#FCE7EB 55%,#F8C8D0 100%);color:#8A2E48}
.bnx .spark{position:absolute;inset:0;background-image:radial-gradient(circle,#F5E8C8 0 1.2px,transparent 2px),radial-gradient(circle,#F5E8C8 0 .9px,transparent 1.6px);background-size:9cqw 9cqw,13cqw 13cqw;background-position:2cqw 3cqw,7cqw 9cqw;opacity:.55;mask-image:linear-gradient(180deg,#000 0,#000 60%,transparent 75%)}
.bnx.light .spark{opacity:.9;background-image:radial-gradient(circle,#E0B860 0 1.2px,transparent 2px),radial-gradient(circle,#E888A0 0 .9px,transparent 1.6px)}
.bnx .rib{position:absolute;right:-8cqw;top:-4cqh;width:44cqw;height:58cqh;z-index:1}
.bnx .stage{position:absolute;left:0;right:0;top:3cqh;height:47cqh;display:flex;align-items:flex-end;justify-content:center}
.bnx .pod{position:absolute;left:50%;transform:translateX(-50%);bottom:-1cqh;width:66cqw;height:9cqh;border-radius:50%/40%;}
.bnx.dark .pod{background:linear-gradient(180deg,#9E3552,#6E2338);box-shadow:0 2cqh 4cqh rgba(0,0,0,.35)}
.bnx.light .pod{background:linear-gradient(180deg,#FFFFFF,#F3D3DA);box-shadow:0 2cqh 4cqh rgba(138,46,72,.18)}
.bnx .pod2{position:absolute;left:50%;transform:translateX(-50%);bottom:5cqh;width:56cqw;height:7cqh;border-radius:50%/40%}
.bnx.dark .pod2{background:linear-gradient(180deg,#B84060,#8A2E48)}
.bnx.light .pod2{background:linear-gradient(180deg,#FFFFFF,#FDF0F3)}
.bnx .prod{position:relative;z-index:2;max-height:calc(100% - 6cqh);max-width:64cqw;object-fit:contain;margin-bottom:6cqh;filter:drop-shadow(0 2cqh 2.5cqh rgba(0,0,0,.25))}
.bnx .badge{position:absolute;z-index:3;right:5cqw;top:4cqh;width:22cqw;height:22cqw;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF6DE,#F5E8C8 45%,#E0B860);color:#8A2E48;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:800;line-height:1;box-shadow:0 1cqh 3cqh rgba(0,0,0,.25);border:.6cqw solid #fff}
.bnx .badge small{font-size:3cqw;font-weight:800;letter-spacing:.2cqw}.bnx .badge em{font-style:normal;font-size:2.3cqw;font-weight:700;margin-top:.4cqw}
.bnx .note{margin:1.6cqh 0 0;font-size:2.1cqw;line-height:1.3;opacity:.85}.bnx .badge b{font-size:7.4cqw;font-weight:800;letter-spacing:-.2cqw}
.bnx .txt{position:absolute;left:7cqw;right:7cqw;bottom:3.5cqh;z-index:3}
.bnx .eb{font-size:2.6cqw;font-weight:700;letter-spacing:.9cqw;text-transform:uppercase;color:#F5E8C8;margin-bottom:1.4cqh}
.bnx.light .eb{color:#B84060}
.bnx h3{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:7cqw;line-height:1.08;margin:0 0 2cqh;color:inherit}
.bnx ul{list-style:none;margin:0 0 2.6cqh;padding:0;display:flex;flex-direction:column;gap:1.1cqh}
.bnx li{display:flex;align-items:center;gap:2cqw;font-size:3.7cqw;font-weight:600}
.bnx li i{width:4.6cqw;height:4.6cqw;border-radius:50%;background:#F5E8C8;color:#8A2E48;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:3cqw;font-weight:900;flex-shrink:0}
.bnx.light li i{background:#B84060;color:#fff}
.bnx .cta{display:inline-flex;align-items:center;justify-content:center;background:#0B8139;color:#fff;font-weight:800;letter-spacing:.4cqw;font-size:3.5cqw;padding:2.2cqh 7cqw;border-radius:2cqw;box-shadow:0 1cqh 2.4cqh rgba(0,0,0,.2)}
@container (orientation: landscape){
.bnx .stage{left:46%;right:0;top:6cqh;height:88cqh}
.bnx .prod{max-height:calc(100% - 9cqh)}
.bnx .prod{max-width:44cqw;margin-bottom:9cqh}
.bnx .pod{width:40cqw;height:12cqh;left:73%}
.bnx .pod2{width:30cqw;height:9cqh;bottom:7cqh;left:73%}
.bnx .rib{right:-2cqw;top:-10cqh;width:30cqw;height:120cqh}
.bnx .badge{right:3cqw;left:auto;top:7cqh;width:12cqw;height:12cqw;border-width:.3cqw}
.bnx .badge small{font-size:1.4cqw}.bnx .badge em{font-size:1.05cqw}.bnx .note{font-size:1cqw;margin-top:2.6cqh}.bnx .badge b{font-size:3.6cqw}
.bnx .txt{left:6cqw;right:52%;top:50%;bottom:auto;transform:translateY(-50%)}
.bnx .eb{font-size:1.15cqw;letter-spacing:.45cqw;margin-bottom:2.4cqh}
.bnx h3{font-size:3.7cqw;margin-bottom:4cqh}
.bnx ul{gap:2.2cqh;margin-bottom:5cqh}.bnx li{font-size:1.6cqw;gap:1cqw}.bnx li i{width:2.2cqw;height:2.2cqw;font-size:1.4cqw}
.bnx .cta{font-size:1.5cqw;padding:2.6cqh 3.2cqw;border-radius:.8cqw;letter-spacing:.2cqw}
.bnx .spark{mask-image:none;opacity:.45}
}
.qz{max-width:620px;margin:0 auto;background:#fff;border-radius:22px;padding:20px;box-shadow:0 14px 36px rgba(138,46,72,.10)}
.qz-top{display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;color:var(--texto2);margin-bottom:14px}
.qz-bar{flex:1;height:6px;border-radius:3px;background:#F3D3DA;overflow:hidden}.qz-bar i{display:block;height:100%;background:#B84060;transition:width .35s}
.qz-s h3,.qz-r h3{font-size:22px;margin:0 0 12px}
.qz-o{display:grid;grid-template-columns:1fr 1fr;gap:10px}.qz-o3{grid-template-columns:1fr}
.qo2{display:flex;align-items:center;gap:12px;border:2px solid var(--linha);border-radius:14px;padding:10px 12px;background:#fff;font:inherit;font-weight:600;font-size:16px;color:inherit;text-align:left;cursor:pointer;min-height:58px}
.qo2 .ib{width:40px;height:40px;flex-shrink:0}
.qo2:hover,.qo2.sel{border-color:var(--rosa);background:var(--blush)}
.qz-s{animation:qzin .3s ease}@keyframes qzin{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
.qz [hidden]{display:none!important}
.qz-r{display:grid;grid-template-columns:1fr;gap:12px;animation:qzin .3s ease;text-align:center}
.qz-r img{width:100%;max-height:220px;object-fit:contain;border-radius:14px;background:#fff}
.qz-r .qz-act{justify-content:center}.qz-r p{margin:8px 0 12px;font-size:16px}
.qz-act{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.qz-again,.qz-back{border:0;background:none;color:var(--rosa);font:inherit;font-weight:700;cursor:pointer;padding:8px 4px}
.qz-back{margin-top:8px}
@media (max-width:480px){.qz-o{grid-template-columns:1fr}}
/* benefícios */
.ben{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;padding:28px 0}
.ben div{display:flex;gap:12px;align-items:center}
.ben b{display:block;font-size:15px}
.ben span{font-size:13px;color:var(--texto2)}
@media (max-width:860px){.ben{grid-template-columns:repeat(2,minmax(0,1fr))}}

.idf{display:flex;flex-direction:column;gap:12px;max-width:760px;margin:0 auto}
.idf div{display:flex;gap:14px;align-items:flex-start;background:#fff;border-radius:16px;padding:18px 20px;font-size:17px;font-weight:600;line-height:1.45;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06)}
.idf svg{width:26px;height:26px;flex-shrink:0;stroke:#B84060;fill:none;stroke-width:1.8;stroke-linecap:round}
.idf-end{text-align:center;max-width:720px;margin:32px auto 0;display:flex;flex-direction:column;gap:12px;align-items:center}
.idf-end h3{font-size:clamp(24px,3.6vw,32px);color:#8A2E48}
.vt{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 10px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.vt::-webkit-scrollbar{display:none}
.vt-s{flex:0 0 min(70%,300px);scroll-snap-align:center}
.vt-s .reel{width:100%}
.vt-v{display:block;width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:22px;background:#8A2E48;box-shadow:0 10px 26px rgba(138,46,72,.15)}
.vt-dots{display:flex;justify-content:center;gap:8px;margin-top:8px}
.vt-dots span{width:8px;height:8px;border-radius:4px;background:#F3D3DA;transition:width .3s}
.vt-dots span.on{width:24px;background:#B84060}
@media (min-width:900px){.vt-s{flex-basis:calc((100% - 28px)/3)}}
/* resultados */
.res-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ph{background:var(--rosa-cl);border:2px dashed #F3D3DA;border-radius:16px;aspect-ratio:4/5;display:flex;align-items:center;justify-content:center;text-align:center;padding:12px;font-size:13px;font-weight:600;color:var(--rosa-esc)}
@media (max-width:760px){.res-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* produtos */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.card{background:var(--card);box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:20px;overflow:hidden;display:flex;flex-direction:column}
.card .img{background:#fff;position:relative}
.card .tag{position:absolute;top:12px;left:12px;background:var(--rosa);color:#fff;font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px}
.card .body{padding:20px;display:flex;flex-direction:column;gap:10px;flex:1}
.card h3{font-size:22px}
.card ul{margin:0;padding:0;list-style:none;font-size:15px;color:var(--texto2)}
.card li{display:flex;gap:8px;align-items:flex-start;padding:2px 0}
.card li svg.i{width:18px;height:18px;color:var(--rosa);margin-top:3px}
.price{display:flex;flex-direction:column;gap:2px;margin-top:auto;padding-top:8px}
.price .v{font-size:30px;font-weight:700}
.price .pix{color:var(--verde);font-weight:700;font-size:15px}
.price .parc{font-size:14px;color:var(--texto2)}
.yield{display:inline-flex;align-items:center;gap:6px;background:var(--blush);color:var(--rosa-esc);font-size:13px;font-weight:700;padding:5px 10px;border-radius:6px;align-self:flex-start}
.card .btn{width:100%}
.card.wide{display:grid;grid-template-columns:1fr 1fr;max-width:920px}
.card.wide .body{padding:28px;justify-content:center}
.card.wide h3{font-size:28px}
@media (max-width:760px){.card.wide{grid-template-columns:1fr}}

/* qual kit */
.choose{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.opt{box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:12px;background:var(--card)}
.opt h3{font-size:24px}
.optimg{width:100%;aspect-ratio:4/3;object-fit:contain;background:#fff;border-radius:14px}
.opt .big{font-family:var(--serif);font-size:44px;font-weight:700;color:var(--rosa);line-height:1}
@media (max-width:700px){.choose{grid-template-columns:1fr}}

.quiz{max-width:720px;margin:0 auto;background:#fff;border-radius:24px;padding:28px;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06)}
.quiz fieldset{border:0;margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:10px}
.quiz legend{font-weight:700;font-size:18px;margin-bottom:10px;padding:0}
.qo{display:flex;align-items:center;gap:14px;border:2px solid var(--linha);border-radius:14px;padding:10px 14px;cursor:pointer;font-weight:600;min-height:60px}
.qo input{position:absolute;opacity:0;pointer-events:none}
.qo:has(input:checked){border-color:var(--rosa);background:var(--blush)}
.qo:has(input:focus-visible){outline:3px solid var(--rosa);outline-offset:2px}
.qerr{color:#D93A3A;font-size:14px;min-height:20px;margin-bottom:6px}
.qres{display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:center;margin-top:20px;background:var(--blush);border-radius:18px;padding:18px}
.qres img{width:100%;border-radius:14px;background:#fff}
.qres h3{font-size:24px;margin:8px 0}
@media (max-width:600px){.qres{grid-template-columns:1fr}}
/* combo destaque */
.combo{background:var(--rosa);color:#fff;border-radius:28px;display:grid;grid-template-columns:1fr 1fr;overflow:hidden}
.combo .img{background:#fff}
.combo .txt{padding:36px;display:flex;flex-direction:column;gap:14px}
.combo h2{color:#fff}
.combo ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.combo li{display:flex;gap:10px}
.combo li svg.i{color:#fff}
.save{background:#fff;color:var(--rosa-esc);border-radius:12px;padding:14px 16px;font-weight:600;font-size:15px}
@media (max-width:800px){.combo{grid-template-columns:1fr}.combo .txt{padding:24px}}

/* reels */
.reels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.reel{aspect-ratio:9/16;border-radius:18px;background:var(--vinho);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;font-weight:600;font-size:14px}
.reel .play{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center}
@media (max-width:700px){.reels{grid-template-columns:repeat(2,minmax(0,1fr))}.reels .reel:nth-child(3){display:none}}

/* passos */
.steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.step{background:#FFFFFF;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:12px}
.step .n{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--rosa)}
.step h3{font-size:22px}
.stepimg{width:100%;aspect-ratio:1/1;max-height:220px;object-fit:contain;background:#fff;border-radius:14px}
.why{margin-top:20px;border:2px solid var(--rosa);border-radius:16px;padding:20px 22px;display:flex;gap:14px;align-items:flex-start}
@media (max-width:760px){.steps{grid-template-columns:1fr}}

/* avaliações */
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.tab{border:2px solid var(--linha);background:var(--card);color:var(--texto);border-radius:10px;padding:10px 18px;font-weight:600;min-height:44px}
.tab[aria-selected="true"]{border-color:var(--rosa);background:var(--rosa);color:#fff}
.rev-top{display:flex;align-items:center;gap:16px;margin-bottom:16px}
.rev-top .nota{font-family:var(--serif);font-size:44px;font-weight:700}
.stars{color:#F5B400;letter-spacing:2px;font-size:18px}
.revs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.rev{background:var(--card);box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:8px;font-size:15px}
.rev .who{font-size:13px;color:var(--texto2)}
@media (max-width:800px){.revs{grid-template-columns:1fr}}

/* diferenciais */
.dif{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.dif div{display:flex;gap:14px;align-items:center;background:var(--card);box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:16px;padding:16px}
.dif b{font-size:16px}
@media (max-width:760px){.dif{grid-template-columns:1fr}}

/* brinde */
.gift{display:flex;gap:20px;align-items:center;background:#FFFFFF;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06);border-radius:24px;padding:24px}
.gift img{width:120px;border-radius:16px;background:#fff}
.bar{height:10px;border-radius:5px;background:var(--rosa-cl);overflow:hidden;margin-top:10px}
.bar i{display:block;height:100%;width:62%;transition:width .4s;background:var(--verde);border-radius:5px}
@media (max-width:600px){.gift{flex-direction:column;align-items:flex-start}}

/* faq */
details.q{border-bottom:1px solid var(--linha)}
details.q summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;font-weight:600;font-size:17px;cursor:pointer}
details.q summary::-webkit-details-marker{display:none}
details.q summary svg.i{transition:transform .2s;color:var(--rosa)}
details.q[open] summary svg.i{transform:rotate(180deg)}
details.q p{padding:0 0 18px;color:var(--texto2)}

.ctq{display:flex;flex-direction:column;gap:14px}
.ctq div{display:flex;gap:16px;align-items:flex-start;background:#fff;border-radius:18px;padding:18px 20px;box-shadow:0 10px 26px rgba(138,46,72,.08)}
.ctq b{display:block;font-size:18px;margin-bottom:2px}
/* garantia + cta */
.guar{display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center;background:var(--card);border:2px solid var(--rosa);border-radius:24px;padding:28px}
@media (max-width:760px){.guar{grid-template-columns:1fr}}

/* rodapé */
footer{background:var(--vinho);color:#F6E9ED;padding:48px 0 24px;font-size:14px}
footer .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:28px}
.f-brand{max-width:560px}.f-brand p{color:#FCE7EB;margin:6px 0 16px}
.f-sig{font-family:"Great Vibes",cursive;font-size:36px;line-height:1.1;color:#fff !important;margin:10px 0 0 !important}
.f-tag{font-family:var(--serif);font-size:19px;font-weight:600;color:#F5E8C8 !important;margin:2px 0 10px !important}
.socials{display:flex;flex-wrap:wrap;gap:10px}.socials a{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#fff}.socials a:hover{background:rgba(255,255,255,.22)}
.paychips{display:flex;flex-wrap:wrap;gap:8px}.paychips span{background:rgba(255,255,255,.12);border-radius:8px;padding:8px 12px;font-weight:700;font-size:14px}
footer .legal p{margin:0;line-height:1.7}
footer h4{font-family:var(--serif);font-size:18px;margin:0 0 12px}
footer ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
footer a{text-decoration:none;color:#F6E9ED}
footer a:hover{text-decoration:underline}
footer .lk-cookies{background:none;border:0;padding:0;margin:0;font:inherit;color:#F6E9ED;cursor:pointer;text-align:left}
footer .lk-cookies:hover,footer .lk-cookies:focus-visible{text-decoration:underline}
footer .legal{border-top:1px solid rgba(255,255,255,.2);margin-top:32px;padding-top:20px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;color:#D9BFC8}
footer .flogo{background:#fff;border-radius:14px;padding:10px 14px;display:inline-block;margin-bottom:12px}
footer .flogo img{height:56px;width:auto}
@media (max-width:800px){footer .cols{grid-template-columns:1fr}}

/* whatsapp flutuante */
.wa{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:58px;height:58px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;z-index:30;box-shadow:0 4px 14px rgba(0,0,0,.2)}
.wa svg{width:30px;height:30px;fill:#fff}

/* gaveta */
.overlay{position:fixed;inset:0;background:rgba(138,46,72,.5);z-index:40;opacity:0;pointer-events:none;transition:opacity .25s}
.drawer{position:fixed;top:0;left:0;bottom:0;width:min(88vw,380px);background:#fff;color:#8A2E48;z-index:41;transform:translateX(-100%);transition:transform .28s ease;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body.open .overlay{opacity:1;pointer-events:auto}
body.open .drawer{transform:none}
@media (prefers-reduced-motion: reduce){.drawer,.overlay{transition:none}}
.dr-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #F3D3DA}
.dr-head img{height:44px;width:auto}
.dr-body{overflow-y:auto;flex:1;padding:8px 0 24px}
.dr-body details>summary,.dr-link{display:flex;align-items:center;gap:12px;padding:14px 20px;font-weight:600;font-size:16px;list-style:none;cursor:pointer;text-decoration:none;color:#8A2E48;min-height:52px}
.dr-body details>summary::-webkit-details-marker{display:none}
.dr-body summary .chev{margin-left:auto;transition:transform .2s}
.dr-body details[open]>summary .chev{transform:rotate(180deg)}
.dr-body svg.i{color:#B84060}
.dr-sub{padding:0 12px 10px 20px}
.dr-sub h5{margin:12px 8px 6px;font-size:12px;letter-spacing:1px;color:#8A2E48;font-weight:700}
.pi{display:flex;gap:12px;align-items:center;padding:8px;border-radius:12px;text-decoration:none;color:#8A2E48}
.pi:hover{background:#FDF0F3}
.pi img{width:56px;height:56px;object-fit:contain;background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(138,46,72,.12)}
.pi b{display:block;font-size:15px;line-height:1.25}
.pi span{font-size:13px;color:#7A3A4C;line-height:1.35}
.dr-sep{height:1px;background:#F3D3DA;margin:8px 20px}

.resimg{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:16px;box-shadow:0 10px 26px rgba(138,46,72,.12)}
.revimg{width:110px;height:110px;object-fit:cover;border-radius:12px}
.cmp{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06)}
.cmp-h,.cmp-r{display:grid;grid-template-columns:1.6fr 1fr 1fr;align-items:center;text-align:center}
.cmp-h{background:var(--rosa-cl);font-weight:700;font-size:15px}
.cmp-h span,.cmp-r span{padding:14px 10px}
.cmp-r{border-top:1px solid var(--linha)}
.cmp-r span:first-child,.cmp-h span:first-child{text-align:left;font-weight:600}
.yes svg,.no svg{width:30px;height:30px;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.yes svg{stroke:#0B8139}.no svg{stroke:#D93A3A}
.no{display:flex;flex-direction:column;align-items:center;gap:2px}
.no small{font-size:12px;color:var(--texto2)}
@media (max-width:520px){.cmp-h,.cmp-r{grid-template-columns:1.4fr .8fr 1fr}.cmp-h span,.cmp-r span{padding:12px 6px;font-size:14px}}
section{scroll-margin-top:80px}
.view{border-top:0;padding-top:24px}
.back{display:inline-flex;align-items:center;gap:6px;color:var(--rosa);font-weight:600;text-decoration:none;margin-bottom:16px;min-height:44px}
.pp{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start}
.pp-img{background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 14px 36px rgba(138,46,72,.10),0 2px 6px rgba(138,46,72,.06)}
.pp-info{display:flex;flex-direction:column;gap:12px}
.pp-info .kick{color:var(--rosa);font-weight:700;font-size:14px}
.pp-info .t1{font-size:clamp(30px,4.4vw,44px)}
.pp-info .size{color:var(--rosa-esc);font-weight:600}
.pp-info .btn{width:100%}
.selos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:4px}
.selos div{display:flex;gap:10px;align-items:center;font-size:13px;color:var(--texto2);background:var(--blush);border-radius:12px;padding:10px}
.selos svg{color:var(--rosa)}
.selos b{display:block;color:var(--texto);font-size:14px}
.pp-sec{margin-top:40px}
.pp-sec h2{font-size:28px;margin-bottom:14px}
.pp-sec.two{display:grid;grid-template-columns:1fr 1fr;gap:36px}
.fns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.fn{display:flex;gap:12px;align-items:flex-start;background:#fff;border-radius:16px;padding:16px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.fn b{display:block;color:var(--rosa-esc)}
.fn span{font-size:14px;color:var(--texto2)}
.spec{margin:0;display:grid;grid-template-columns:1fr;gap:0}
.spec div{display:grid;grid-template-columns:150px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--linha)}
.spec dt{font-weight:700;color:var(--rosa-esc);font-size:14px}
.spec dd{margin:0;font-size:15px}
.mode{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:10px}
.mode li::marker{color:var(--rosa);font-weight:700}
.res-band{margin-top:32px;background:var(--rosa);color:#fff;border-radius:18px;padding:18px 22px;display:flex;gap:14px;align-items:center}
.cj{margin-top:40px;background:var(--blush);border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.cj h2{font-size:26px}
.cj-row{display:flex;align-items:center;gap:10px}
.cj-row a{display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;font-weight:600;font-size:13px;width:110px;text-align:center}
.cj-row img{width:100px;height:100px;object-fit:contain;background:#fff;border-radius:16px;box-shadow:0 6px 16px rgba(138,46,72,.10)}
.cj .plus{font-size:28px;color:var(--rosa);font-weight:700}
.kis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ki{display:flex;gap:12px;align-items:center;background:#fff;border-radius:16px;padding:10px;text-decoration:none;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.ki img{width:70px;height:70px;object-fit:contain;background:#fff;border-radius:12px}
.ki b{display:block;font-size:15px}
.ki span span{font-size:13px;color:var(--texto2)}
.mini3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}
.mini3 div{display:flex;flex-direction:column;gap:4px;align-items:flex-start;background:#fff;border-radius:16px;padding:14px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.mini3 svg{color:var(--rosa);width:28px;height:28px}
.mini3 span{font-size:13px;color:var(--texto2)}
.up{margin-top:28px;display:flex;gap:14px;align-items:center;background:#fff;border-radius:18px;padding:18px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.up a{color:var(--rosa);font-weight:700}
.guide{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.guide div{display:flex;gap:12px;align-items:center;background:#fff;border-radius:14px;padding:12px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.guide b{display:block;font-size:15px}
.guide small{color:var(--texto2);font-size:13px}
.preview-note a{color:#5A4500;font-weight:700}
@media (max-width:800px){.pp,.pp-sec.two{grid-template-columns:1fr}.fns{grid-template-columns:1fr}.kis{grid-template-columns:1fr}.mini3{grid-template-columns:1fr}.spec div{grid-template-columns:120px 1fr}}
.eyebrow{display:block;font-size:14px;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--rosa);margin-bottom:6px}
.pp2 .crumbs{font-size:14px;color:var(--texto2);margin-bottom:14px}
.pp2 .crumbs a{color:var(--texto2);text-decoration:none}
.pp2 .pp-img{position:relative}
.pp2 .pp-img .tag{position:absolute;top:14px;left:14px;background:var(--rosa);color:#fff;font-size:13px;font-weight:700;padding:6px 12px;border-radius:8px;z-index:1}
.rate{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--texto2)}
.rate b{color:var(--texto)}
.headl{font-size:20px;font-weight:600;line-height:1.5;color:var(--texto)}
.chk{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.chk li{display:flex;gap:10px;align-items:flex-start;font-size:16px}
.chk svg{margin-top:3px;flex-shrink:0}
.note{font-size:13px;color:var(--texto2)}
.pp-urg{background:#FDECEC;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
.pp-urg strong{color:#D93A3A;display:flex;align-items:center;gap:8px;font-size:17px}
.mt{display:flex;gap:6px;align-items:baseline;color:#8A2E48;font-weight:700}
.mt span{background:#D93A3A;color:#fff;border-radius:8px;padding:6px 10px;font-size:20px;min-width:44px;text-align:center}
.vh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.vh h3{font-size:22px}.vh span{color:var(--texto2);font-weight:600}
.vos{display:flex;flex-direction:column;gap:12px}
.vo{display:grid;grid-template-columns:72px 1fr auto;gap:14px;align-items:center;background:#fff;border:2px solid var(--linha);border-radius:18px;padding:12px;cursor:pointer;position:relative}
.vo input{position:absolute;opacity:0;pointer-events:none}
.vo img{width:72px;height:72px;object-fit:contain;border-radius:12px;background:#fff}
.vo-t b{display:block;font-size:16px;line-height:1.3}.vo-t small{color:var(--texto2);font-size:13px}
.vb{display:inline-block;margin-top:4px;background:var(--rosa-cl);color:var(--rosa-esc);font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:3px 8px;border-radius:6px}
.vo-p{display:flex;flex-direction:column;align-items:flex-end;text-align:right}
.vo-p s{font-size:13px;color:var(--texto2)}.vo-p b{font-size:18px}.pixs{color:var(--verde);font-weight:700;font-size:13px}
.vo:has(input:checked){border-color:var(--rosa);background:var(--blush);box-shadow:0 8px 22px rgba(138,46,72,.12)}
.vo:has(input:checked)::after{content:"✓";position:absolute;top:-10px;right:-8px;width:26px;height:26px;border-radius:50%;background:var(--rosa);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:14px}
.vo:has(input:focus-visible){outline:3px solid var(--rosa);outline-offset:2px}
.pbox{margin-top:22px;background:var(--blush);border-radius:20px;padding:20px 22px;display:flex;flex-direction:column;gap:4px}
.pb-sep{font-size:14px;color:var(--texto2)}.pb-v{font-size:30px;font-weight:700;line-height:1.1}
.pb-pix{color:var(--verde);font-weight:700;font-size:18px}.pb-parc{color:var(--texto2)}
.pb-frete{display:flex;gap:8px;align-items:center;color:var(--verde);font-weight:600;font-size:14px;border-top:1px dashed var(--linha);margin-top:10px;padding-top:10px}
.incl{margin-top:18px}.incl h3{font-size:20px;margin-bottom:8px}
.incl-l{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.incl-l li{display:flex;gap:10px;align-items:center;background:#fff;border-radius:12px;padding:10px 14px;box-shadow:0 4px 14px rgba(138,46,72,.06);font-weight:600}
.btn.big{width:100%;min-height:58px;font-size:18px;margin-top:18px;text-transform:uppercase;letter-spacing:.5px}
.btn.wa-o{width:100%;margin-top:10px;background:#fff;border:2px solid #0B8139;color:#0B8139}
.cupom{display:flex;gap:10px;align-items:flex-start;margin-top:12px;background:#FFF8E6;border:1.5px dashed #E5C463;border-radius:14px;padding:12px 14px;font-size:14px;color:#6B5100}
.cupom svg{color:#B08600;flex-shrink:0;margin-top:2px}
.sel3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px;text-align:center;font-size:13px;color:var(--texto2)}
.sel3 div{display:flex;flex-direction:column;align-items:center;gap:6px}.sel3 svg{color:var(--rosa)}
.pp2 .pp-sec{margin-top:48px}
.pp2 .pp-sec h2{font-size:clamp(26px,4vw,34px);margin-bottom:16px}
.lead{font-size:17px;line-height:1.7;margin-bottom:12px}
.dor-end{margin-top:14px;font-weight:700;color:var(--rosa-esc);font-size:18px}
.bens{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.ben-c{display:flex;gap:14px;align-items:flex-start;background:#fff;border-radius:18px;padding:18px;box-shadow:0 10px 26px rgba(138,46,72,.08)}
.bi{width:52px;height:52px;border-radius:14px;background:var(--rosa);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ben-c b{display:block;font-size:17px}.ben-c div span{font-size:15px;color:var(--texto2)}
.pq{background:#fff;border-radius:20px;padding:20px 22px;box-shadow:0 10px 26px rgba(138,46,72,.08);margin-bottom:14px}
.pq h3{display:flex;gap:10px;align-items:center;font-size:20px;margin-bottom:10px}
.pq ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.pq li{display:flex;gap:10px;align-items:flex-start;font-size:16px}
.okc,.wrn{width:24px;height:24px;flex-shrink:0;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.okc{stroke:#0B8139}.wrn{stroke:#B7791F}
.steps-n{display:flex;flex-direction:column;gap:12px}
.steps-n div{display:flex;gap:14px;align-items:flex-start;background:#fff;border-radius:16px;padding:16px;box-shadow:0 8px 22px rgba(138,46,72,.07)}
.sn{width:40px;height:40px;border-radius:12px;background:var(--rosa);color:#fff;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.need{display:flex;gap:12px;align-items:flex-start;background:#FFF8E6;border-radius:16px;padding:16px;margin-top:14px;color:#5A4500}
.need.warn{background:#FDECEC;color:#7A1F1F}.need a{color:var(--rosa);font-weight:700}
.proto{background:var(--blush);border-radius:24px;padding:24px}
.proto .tip{margin-top:12px;font-size:15px}
.rv-sum{display:flex;gap:18px;align-items:center;background:#fff;border-radius:20px;padding:18px 22px;box-shadow:0 10px 26px rgba(138,46,72,.08);margin-bottom:16px}
.rv-sum .big{font-family:var(--serif);font-size:48px;font-weight:700;color:var(--rosa-esc)}
.rvs{display:flex;flex-direction:column;gap:14px}
.rv{display:grid;grid-template-columns:110px 1fr;gap:16px;background:#fff;border-radius:18px;padding:16px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.rv img{width:110px;height:140px;object-fit:cover;border-radius:14px}
.rv-h{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.rv-h b{font-size:17px}
.verif{display:inline-flex;align-items:center;gap:5px;color:#0B8139;font-weight:700;font-size:14px}
.verif svg{width:18px;height:18px;fill:none;stroke:#0B8139;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rv p{margin:6px 0;font-size:16px}.rv small{color:var(--texto2)}
.cta-f{margin-top:48px;text-align:center;background:var(--blush);border-radius:24px;padding:28px 22px}
.cta-f h2{font-size:clamp(22px,3.4vw,30px)}
.sticky{position:fixed;left:0;right:0;bottom:0;z-index:35;background:#fff;box-shadow:0 -6px 20px rgba(138,46,72,.12);display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 20px calc(12px + env(safe-area-inset-bottom,0px))}
.sticky small{display:block;color:var(--texto2);font-size:14px}.sticky b{font-size:22px}
.sticky .btn{min-width:150px;font-size:17px;text-transform:uppercase}
body.onpp .wa{bottom:calc(92px + env(safe-area-inset-bottom,0px))}
body.onpp .toast{bottom:calc(160px + env(safe-area-inset-bottom,0px))}
body.onpp footer{padding-bottom:110px}
@media (max-width:700px){.bens{grid-template-columns:1fr}.vo{grid-template-columns:60px 1fr auto}.vo img{width:60px;height:60px}.rv{grid-template-columns:90px 1fr}.rv img{width:90px;height:120px}}
.rv{display:grid;grid-template-columns:112px 1fr;gap:16px;align-items:start;background:#fff;border-radius:18px;padding:16px;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.rv img{width:112px;height:140px;object-fit:cover;border-radius:14px}
.rv-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}
.rv-n{font-size:17px}.rv-st{display:inline-flex;align-items:center;gap:6px}.rv-st .stars{color:#F5B400;letter-spacing:1px}.rv-st b{font-size:15px}
.verif{display:inline-flex;align-items:center;gap:5px;color:#0B8139;font-weight:700;font-size:13px;letter-spacing:.5px}
.verif svg{width:18px;height:18px;fill:none;stroke:#0B8139;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rv-b p{margin:10px 0 6px;font-size:16px}.rv-b small{color:var(--texto2)}
.ben-c .bi,.ben-c .bi svg{color:#fff}.fn .ib{color:var(--rosa)}
.xsg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.xs{display:flex;flex-direction:column;gap:4px;background:#fff;border-radius:18px;padding:12px;text-decoration:none;box-shadow:0 8px 22px rgba(138,46,72,.08)}
.xs img{width:100%;aspect-ratio:1/1;object-fit:contain;border-radius:12px;background:#fff;margin-bottom:6px}
.xs b{font-size:16px;line-height:1.3}.xs span{font-size:14px;color:var(--texto2)}.xs strong{font-size:20px;margin-top:6px}.xs small{color:#0B8139;font-weight:700}
@media (max-width:600px){.rv{grid-template-columns:92px 1fr}.rv img{width:92px;height:118px}}
.sp{position:fixed;left:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:32;width:min(calc(100vw - 96px),380px);background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(138,46,72,.22);display:flex;gap:12px;align-items:center;padding:10px 34px 10px 10px;transform:translateY(20px);opacity:0;transition:all .35s}
.sp.show{transform:none;opacity:1}
.sp img{width:64px;height:64px;border-radius:12px;object-fit:cover;flex-shrink:0}
.sp-b{min-width:0}.sp-b .stars{color:#F5B400;font-size:13px;letter-spacing:1px}
.sp-b p{margin:2px 0;font-size:15px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sp-b small{font-size:12px;color:var(--texto2);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp-x{position:absolute;top:4px;right:6px;width:28px;height:28px;border:0;background:transparent;color:var(--texto2);font-size:20px;line-height:1}
body.onpp .sp{bottom:calc(112px + env(safe-area-inset-bottom,0px))}
body.open .sp{display:none}
/* toast */
.toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);background:#8A2E48;color:#fff;border-radius:14px;padding:14px 18px;width:min(92vw,420px);z-index:50;opacity:0;pointer-events:none;transition:all .25s;font-size:14px}
.toast.show{opacity:1;transform:translate(-50%,0)}
.toast .bar{background:rgba(255,255,255,.25)}
.fx{position:fixed;pointer-events:none;z-index:60}
.preview-note{background:#FFF6D6;color:#5A4500;font-size:13px;text-align:center;padding:8px 12px}
/* ===== Acréscimos 18/10: parcelamento, frete, custo por aplicação ===== */
.fg{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;background:var(--rosa-cl);color:var(--rosa-esc);font-weight:700;font-size:13px;line-height:1.2;padding:5px 10px;border-radius:8px;margin:2px 0 4px}
.fg svg.i{width:16px;height:16px}
.fg.sm{font-size:11px;padding:3px 7px;gap:4px;margin:4px 0 0}.fg.sm svg.i{width:13px;height:13px}
.vo-p .fg.sm{display:flex}
.pnota{display:block;font-size:11px;line-height:1.35;color:var(--texto2);margin-top:4px}
.ppa{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--rosa-esc);margin:2px 0}
.ppa small{font-weight:500;color:var(--texto2)}
.vo-ppa{display:block;font-style:normal;font-size:12px;font-weight:600;color:var(--rosa-esc);margin-top:2px}
.pb-ppa{display:block;font-size:14px;font-weight:700;color:var(--rosa-esc);margin-top:4px}
.pb-ppa small{font-weight:500;color:var(--texto2)}
/* ===== Comunidade e Grupo VIP ===== */
.cm-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:560px;margin:0 auto}
.cm-stats div{background:var(--blush);border-radius:20px;padding:22px 14px;text-align:center;display:flex;flex-direction:column;gap:4px}
.cm-stats .cm-big{grid-column:1/-1}
.cm-stats div:not(.cm-big) b{font-size:clamp(24px,5vw,34px);overflow-wrap:anywhere}
.cm-stats b{font-family:var(--serif);font-size:clamp(32px,6vw,44px);color:var(--rosa-esc);line-height:1.1}
.cm-stats span{font-size:14px;color:var(--texto2)}
.cm-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:22px 0 28px}

.dif-t{margin:0;display:flex;flex-direction:column;gap:4px}.dif-t .dif-s{font-size:14px;font-weight:400;color:var(--texto2);line-height:1.45}
#diferenciais .dif div{align-items:flex-start}
.rl{margin:0;display:flex;flex-direction:column;gap:10px}.rl-x{display:none!important}
.rl-t{align-self:flex-start;background:var(--rosa);color:#fff;font-weight:700;font-size:14px;letter-spacing:.5px;padding:6px 14px;border-radius:10px}
#reels .reels{grid-template-columns:repeat(2,minmax(0,1fr));max-width:760px}
.cm-lead{text-align:center;font-weight:700;color:var(--rosa-esc);margin:24px 0 0}
.cm-btns{margin-top:12px!important}.cm-soc{gap:8px;min-height:46px;padding:10px 16px;font-size:15px}.cm-soc svg.i{width:20px;height:20px}
.cmvip{background:linear-gradient(160deg,#FDF0F3,#FCE7EB);border-radius:24px;padding:26px 22px;max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.cmvip h3{font-size:clamp(22px,3.4vw,28px);margin:0}
.cmvip ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.cmvip li{display:flex;gap:10px;align-items:center}.cmvip li svg{color:var(--rosa);flex-shrink:0}
.cmvip-b{align-self:center;background:var(--rosa);color:#fff;margin-top:6px}.cmvip-b:hover{background:#9E3552}.cmvip-b svg{fill:#fff!important}
.cmvip small{text-align:center;color:var(--texto2)}
/* ===== Faixas em rosa profundo (quebra de ritmo) ===== */
#depoimentos,#reels,#diferenciais,#comunidade{background:linear-gradient(160deg,#8A2E48 0%,#9E3552 60%,#A8395A 100%);border-top:0;color:#fff}
#depoimentos+section,#reels+section,#diferenciais+section,#comunidade+section{border-top:0}
#depoimentos .sec-head h2,#reels .sec-head h2,#diferenciais .sec-head h2,#comunidade .sec-head h2,#comunidade .cm-lead{color:#fff}
#depoimentos .eyebrow,#reels .sec-head .eyebrow,#diferenciais .sec-head .eyebrow,#comunidade .sec-head .eyebrow{color:#F5E8C8}
#depoimentos .sec-head p,#depoimentos .wrap>p,#reels .sec-head p,#reels .wrap>p,#comunidade .sec-head p{color:#FCE7EB!important}
#depoimentos .vt-dots span{background:rgba(255,255,255,.35)}#depoimentos .vt-dots span.on{background:#F5E8C8}
#depoimentos .vt-v,#reels video.reel{box-shadow:0 12px 30px rgba(40,6,18,.35)}
#reels .rl-t{background:#F5E8C8;color:#8A2E48}
#reels div.reel{background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.28)}
#diferenciais .dif div{box-shadow:0 12px 30px rgba(40,6,18,.25)}
#comunidade .cm-stats div{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22)}
#comunidade .cm-stats b{color:#fff}#comunidade .cm-stats span{color:#FCE7EB}
#comunidade .cm-soc{border-color:#fff;color:#fff;background:transparent}#comunidade .cm-soc:hover{background:rgba(255,255,255,.12)}
#comunidade .cmvip{box-shadow:0 12px 30px rgba(40,6,18,.25)}
#diferenciais .dif div,#comunidade .cmvip,#comunidade .cmvip h3,#comunidade .cmvip li{color:var(--texto)}#comunidade .cmvip .eyebrow{color:var(--rosa)}
/* ===== Subtítulo da escolha perfeita ===== */
#diferenciais .dif-sub{font-family:var(--serif);font-size:clamp(20px,3.6vw,26px);font-weight:600;color:#FCE7EB;line-height:1.3;margin:0}
#diferenciais .dif-sub .gv{font-family:inherit;font-weight:inherit;font-size:1em;color:#F5E8C8;white-space:nowrap;line-height:inherit}
/* ===== Rodapé: logo negativa e assinatura menor ===== */
footer .flogo{background:transparent;padding:0;border-radius:0}
footer .flogo img{height:64px;filter:brightness(0) invert(1)}
footer .f-sig{font-size:28px;margin-top:8px!important}
footer .f-tag{font-size:16px;line-height:1.4;font-weight:600}
@media (min-width:800px){footer .f-sig{font-size:34px}footer .f-tag{font-size:17px}}
/* ===== Dúvidas: chamada para o WhatsApp ===== */
.faq-cta{display:grid;grid-template-columns:auto 1fr;gap:14px 16px;align-items:center;margin-top:24px;background:var(--blush);border-radius:20px;padding:22px}
.faq-cta h3{font-size:22px;margin:0 0 4px}.faq-cta p{margin:0;color:var(--texto2)}
.faq-cta .btn{grid-column:1/-1;margin-top:4px}
@media (min-width:760px){.faq-cta{grid-template-columns:auto 1fr auto}.faq-cta .btn{grid-column:auto;width:auto;margin-top:0}}
/* ===== Linhas com rolagem lateral ===== */
.av-h{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:6px}
.av-h h2,.av-h h3{margin:0}
.av-arr{display:flex;gap:8px;flex-shrink:0}
.av-a{width:44px;height:44px;border-radius:50%;border:2px solid var(--rosa);background:#fff;color:var(--rosa);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center}
.av-sub{color:var(--texto2);font-size:15px;margin:0 0 12px}
.av-row{display:grid;grid-auto-flow:column;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:4px 2px 14px;scrollbar-width:thin;scrollbar-color:var(--rosa) var(--rosa-cl)}
.av-row::-webkit-scrollbar{height:6px}.av-row::-webkit-scrollbar-track{background:var(--rosa-cl);border-radius:3px}.av-row::-webkit-scrollbar-thumb{background:var(--rosa);border-radius:3px}
.av-row>*{scroll-snap-align:start}
.av-vids{grid-auto-columns:min(62%,260px)}
.av-fotos{grid-template-rows:repeat(2,auto);grid-auto-columns:min(44%,220px)}
.av-cards{grid-auto-columns:min(82%,320px);align-items:start}
@media (min-width:900px){.av-vids{grid-auto-columns:calc((100% - 42px)/4)}.av-fotos{grid-auto-columns:calc((100% - 56px)/5)}.av-cards{grid-auto-columns:calc((100% - 28px)/3)}}
/* vídeo em tela cheia no card, um toque para assistir */
.avv{position:relative;aspect-ratio:9/16;border-radius:20px;overflow:hidden;background:var(--vinho);box-shadow:0 10px 26px rgba(138,46,72,.15)}
.avv video{display:block;width:100%;height:100%;object-fit:cover}
.avv-p{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.35));border:0;width:100%;padding:0}
.avv-p span{width:68px;height:68px;border-radius:50%;background:rgba(184,64,96,.9);display:flex;align-items:center;justify-content:center}
.avv-p svg{width:28px;height:28px;fill:#fff;margin-left:4px}
.avv.on .avv-p{display:none}
.avv-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;font-weight:600;font-size:14px;text-align:center;padding:16px;height:100%}
.avf{display:block;padding:0;border:0;background:none;border-radius:16px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 6px 16px rgba(138,46,72,.10)}
.avf img{width:100%;height:100%;object-fit:cover;display:block}
.avc{background:#fff;border-radius:18px;padding:18px;box-shadow:0 8px 22px rgba(138,46,72,.08);display:flex;flex-direction:column;gap:8px}
.avc-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.avc-tag{background:var(--rosa);color:#fff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px}
.avc p{margin:0;font-size:16px}
.avc-img{width:96px;height:120px;object-fit:cover;border-radius:12px}
.avc-f{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}
.avc-f .verif{font-size:12px}.avc-f .verif svg{width:15px;height:15px}
.avc small{color:var(--texto2);font-size:13px}
/* página de avaliações */
#p-avaliacoes .crumbs a{color:var(--texto2);text-decoration:none}
.av-hero{text-align:center;max-width:680px;margin:0 auto 18px;display:flex;flex-direction:column;gap:8px;align-items:center}
.av-hero .t1{font-size:clamp(32px,5vw,46px);margin:0}.av-hero p{color:var(--texto2);margin:0}
.av-nota{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px}
.av-nota b{font-family:var(--serif);font-size:30px;color:var(--rosa-esc)}.av-nota span:last-child{color:var(--texto2);font-size:15px}
.av-jump{position:sticky;top:calc(env(safe-area-inset-top,0px) + 70px);z-index:5;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;background:rgba(255,255,255,.96);padding:10px 2px;margin:0 -2px 8px;border-bottom:1px solid var(--linha);align-items:center}
.av-jump::-webkit-scrollbar{display:none}
.av-jump span{font-size:13px;color:var(--texto2);white-space:nowrap}
.av-jump button{flex-shrink:0;min-height:40px;padding:8px 16px;border-radius:10px;border:2px solid var(--rosa);background:#fff;color:var(--rosa);font-weight:700;font-size:14px}
.av-jump button.on{background:var(--rosa);color:#fff}
.av-sec{padding:28px 0 8px;scroll-margin-top:150px}
.av-fim{text-align:center;background:var(--blush);border-radius:24px;padding:28px 20px;margin:28px 0 8px;display:flex;flex-direction:column;gap:10px;align-items:center}
.av-fim h2{margin:0}.av-fim p{margin:0;color:var(--texto2)}
.av-fim-b{display:flex;flex-direction:column;gap:10px;width:100%;max-width:380px}.av-fim-b .btn{width:100%;margin:0}
.prof-rv{margin-top:36px}
.avlb{position:fixed;inset:0;z-index:100;background:rgba(20,8,12,.88);display:flex;align-items:center;justify-content:center;padding:20px}
.avlb[hidden]{display:none}
.avlb img{max-width:100%;max-height:85vh;border-radius:14px}
.avlb-x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);right:14px;width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:var(--rosa-esc);font-size:28px;line-height:1}

.off{display:inline-block;background:#D93A3A;color:#fff;font-weight:800;font-size:12px;letter-spacing:.3px;padding:3px 8px;border-radius:999px;line-height:1.3}
.vo-p .off{margin-bottom:2px}
.pb-sep{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}
.pb-sep .econ{color:#0B8139;font-weight:700;font-size:14px}
.offtag{position:absolute;z-index:3;top:12px;left:12px;background:#D93A3A;color:#fff;font-weight:800;font-size:14px;letter-spacing:.4px;padding:6px 14px;border-radius:999px;box-shadow:0 4px 12px rgba(217,58,58,.3)}
.card .img,.xs,.pp-img{position:relative}
.card .img .offtag{left:auto;right:12px}
.xs .offtag{top:10px;left:10px;font-size:12px;padding:4px 10px}
.price s.de{display:block;color:var(--texto2);font-size:15px}
.sec-cta{display:flex;justify-content:center;margin-top:24px}.sec-cta .btn{min-width:min(100%,320px)}
.pcar{position:relative}
.pcar-t{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.pcar-t::-webkit-scrollbar{display:none}
.pcar-s{flex:0 0 100%;scroll-snap-align:center;margin:0;position:relative}
.pcar-s img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff;display:block}
.pcar-s figcaption{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:rgba(255,255,255,.94);color:var(--rosa-esc);font-weight:700;font-size:14px;padding:6px 14px;border-radius:999px;box-shadow:0 4px 12px rgba(138,46,72,.15);white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.pcar-d{display:flex;justify-content:center;gap:8px;padding:10px 0 14px;background:#fff}
.pcar-d button{width:9px;height:9px;border-radius:5px;border:0;padding:0;background:#F3D3DA;transition:width .3s}
.pcar-d button.on{width:26px;background:#B84060}
.pcar-h{text-align:center;font-size:13px;color:var(--texto2);background:#fff;margin:-6px 0 0;padding-bottom:10px}
.pcar-a{position:absolute;top:calc(50% - 40px);width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#B84060;font-size:26px;line-height:1;box-shadow:0 4px 12px rgba(0,0,0,.12);z-index:4;display:none}
.pcar-a.l{left:10px}.pcar-a.r{right:10px}
@media (hover:hover){.pcar-a{display:flex;align-items:center;justify-content:center}}
.gcar{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.gcar::-webkit-scrollbar{display:none}
.gcar-s{flex:0 0 100%;scroll-snap-align:center;position:relative;display:flex;flex-direction:column;align-items:center}
.gcar-s img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff}
.gcar-l{margin:-6px 0 10px;font-weight:700;font-size:14px;color:var(--rosa-esc);background:var(--blush);padding:4px 12px;border-radius:999px}
.gcar-d{display:flex;justify-content:center;gap:8px;padding:0 0 12px}
.gcar-d button{border:2px solid var(--rosa);background:#fff;color:var(--rosa);font-weight:700;font-size:14px;border-radius:999px;padding:5px 16px;min-height:36px}
.gcar-d button.on{background:var(--rosa);color:#fff}
.gcar-h{text-align:center;font-size:13px;color:var(--texto2);margin:-4px 0 12px}
.pp-img.kitmode .gcar,.pp-img.kitmode .gcar-d,.pp-img.kitmode .gcar-h{display:none}
.fg.gb{background:#FFF4D6;color:#8A5A00}
.pbox .fg.gb{margin-top:0}
.vfs{position:fixed;inset:0;z-index:200;background:#000;display:flex;align-items:center;justify-content:center}
.vfs[hidden]{display:none}
.vfs video{width:100%;height:100%;object-fit:contain;background:#000}
.vfs-x{position:absolute;z-index:2;top:calc(env(safe-area-inset-top,0px) + 14px);right:14px;width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#8A2E48;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.vfs-x svg{width:24px;height:24px;stroke:currentColor;stroke-width:2.4;fill:none;stroke-linecap:round}
body.vfs-on{overflow:hidden}
.ccar{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.ccar::-webkit-scrollbar{display:none}
.ccar-s{flex:0 0 100%;scroll-snap-align:center;margin:0;position:relative;background:#fff}
.ccar-s img{width:100%;aspect-ratio:1/1;object-fit:contain;display:block}
.ccar-s figcaption{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);background:var(--rosa);color:#fff;font-weight:700;font-size:14px;padding:5px 14px;border-radius:999px;white-space:nowrap}
.ccar-w{background:#fff}
.ccar-d{display:flex;justify-content:center;gap:8px;padding:10px 0 14px;background:#fff}
.ccar-d button{border:2px solid var(--rosa);background:#fff;color:var(--rosa);font-weight:700;font-size:14px;border-radius:999px;padding:5px 16px;min-height:36px}
.ccar-d button.on{background:var(--rosa);color:#fff}
.idf-hint{text-align:center;color:var(--texto2);font-size:15px;margin:-12px 0 18px}
.idf-acc{display:flex;flex-direction:column;gap:12px}
.idf-acc details{background:#fff;border-radius:18px;box-shadow:0 8px 22px rgba(138,46,72,.08);overflow:hidden}
.idf-acc summary{list-style:none;display:flex;align-items:center;gap:14px;padding:16px 18px;cursor:pointer;font-size:17px;font-weight:600;line-height:1.45}
.idf-acc summary::-webkit-details-marker{display:none}
.idf-acc summary>svg:first-child{width:28px;height:28px;flex-shrink:0}
.idf-acc summary span{flex:1}
.idf .idf-c{width:22px;height:22px;flex-shrink:0;fill:none;stroke:var(--rosa);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s}
.idf-acc details[open] .idf-c{transform:rotate(180deg)}
.idf-acc details[open] summary{border-bottom:1px solid #F3D3DA}
.idf-acc .idf-s{display:flex;gap:12px;align-items:flex-start;padding:14px 18px 18px;background:#E7F7EE;border-radius:0;box-shadow:none;font-size:16px;font-weight:400}
.idf-s p{margin:0;font-size:16px;font-weight:400;color:var(--texto)}
.idf-s b{color:#0B8139}
.idf .idf-ok{width:24px;height:24px;flex-shrink:0;fill:none;stroke:#0B8139;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;margin-top:1px}
.idf-lk{display:inline-block;margin-top:6px;color:#B84060;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.q-more{display:none}.q-more.open{display:block}
.q-more-b{display:flex;margin:14px auto 0;min-width:min(100%,300px)}
#p-duvidas .crumbs a{color:var(--texto2);text-decoration:none}
.idf .idf-x{display:none!important;flex-direction:column;gap:12px;background:none;box-shadow:none;padding:0;border-radius:0}.idf .idf-x.open{display:flex!important}
.dif.dif-x{display:none;margin-top:16px}.dif.dif-x.open{display:grid}
.more-b{display:flex;margin:16px auto 0;min-width:min(100%,300px)}
#diferenciais .more-b{border-color:#fff;color:#fff;background:transparent}#diferenciais .more-b:hover{background:rgba(255,255,255,.12)}

/* Por que o kit completo: texto sobre a foto */
#como-funciona .steps{gap:14px}
#como-funciona .step{position:relative;padding:0;overflow:hidden;gap:0;min-height:340px;background:#fff;justify-content:flex-end}
#como-funciona .stepimg{position:absolute;inset:0 0 auto 0;width:100%;height:68%;max-height:none;aspect-ratio:auto;object-fit:contain;object-position:center 10%;border-radius:0;padding:14px 14px 0}
#como-funciona .step>div,#como-funciona .step>h3,#como-funciona .step>p{position:relative;z-index:1}
#como-funciona .step::after{content:"";position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(180deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.94) 28%,#fff 48%);z-index:0}
#como-funciona .step>div{padding:0 18px}
#como-funciona .step>h3{padding:0 18px;margin:6px 0 2px;font-size:20px}
#como-funciona .step>p{padding:0 18px 18px;margin:0;font-size:15px;line-height:1.45;color:var(--texto2)}
#como-funciona .step .ib{width:38px;height:38px}
#como-funciona h3[style*="26px"]{margin:28px 0 14px!important}
@media (max-width:760px){#como-funciona .step{min-height:330px}}
/* espaçamento mais elegante entre seções */
section{padding:44px 0}
@media (min-width:900px){section{padding:64px 0}}
.sec-head{margin-bottom:22px}
#profissionais .pcards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding:4px 2px 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
#profissionais .pcards::-webkit-scrollbar{display:none}
#profissionais .pcards .card{flex:0 0 86%;scroll-snap-align:center}
@media (min-width:900px){#profissionais .pcards .card{flex-basis:calc((100% - 28px)/3)}}
.pc-d{display:flex;justify-content:center;gap:8px;margin-top:10px}
.pc-d button{width:8px;height:8px;border-radius:4px;border:0;padding:0;background:#F3D3DA;transition:width .3s}
.pc-d button.on{width:24px;background:#B84060}
.pc-h{text-align:center;font-size:13px;color:var(--texto2);margin:8px 0 0}
.ctq .ctq-g{border:2px solid #B84060;background:#FDF0F3}
.ctq p{font-size:15px;line-height:1.45;margin:0}.ctq b{font-size:17px}.ctq{gap:10px}.ctq>div{padding:14px 16px}

/* cartões profissionais compactos: cabem numa tela */
#pcards{align-items:flex-start}
#pcards .card .img{height:150px;padding:8px}
#pcards .card .img img{height:100%;width:100%;object-fit:contain}
#pcards .card .body{padding:12px 16px 16px;gap:6px}
#pcards .card .yield{font-size:13px;padding:4px 10px}
#pcards .card .ppa{font-size:13px}
#pcards .card h3{font-size:21px;margin:2px 0}
#pcards .card ul{margin:0;gap:2px}
#pcards .card ul li{font-size:14.5px;line-height:1.35}
#pcards .card .price{gap:2px;margin-top:6px}
#pcards .card .price .fg{font-size:12.5px;padding:4px 10px;margin:0 6px 4px 0;display:inline-flex}
#pcards .card .price s.de{font-size:14px}
#pcards .card .price .v{font-size:28px;line-height:1.1}
#pcards .card .price .pix{font-size:15px}
#pcards .card .price .parc{font-size:14px}
#pcards .card .price small,#pcards .card .pnota{font-size:11.5px;line-height:1.3}
#pcards .card .btn{font-size:15.5px;min-height:48px;padding:12px 10px;margin-top:8px;white-space:nowrap}
.res-grid.res-car{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;padding:4px 2px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.res-car::-webkit-scrollbar{display:none}
.res-car .resimg{flex:0 0 72%;scroll-snap-align:start;aspect-ratio:4/5}
@media (min-width:760px){.res-car .resimg{flex-basis:calc((100% - 36px)/4)}}
.res-nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:6px}
.res-a{width:40px;height:40px;border-radius:50%;border:2px solid var(--rosa);background:#fff;color:var(--rosa);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0 0 3px}
.res-c{font-weight:700;color:var(--texto2);font-size:15px;min-width:60px;text-align:center}
#depoimentos .vt-nav .res-a{background:transparent;border-color:#fff;color:#fff}
#depoimentos .vt-nav .res-c{color:#fff}
.wz{background:#fff;border-radius:22px;padding:22px;box-shadow:0 14px 36px rgba(138,46,72,.10);border:2px solid #F3D3DA}
.wz-h{display:flex;gap:14px;align-items:flex-start;margin-bottom:14px}
.wz-h h2{font-size:26px;margin:4px 0 6px}.wz-h p{margin:0;color:var(--texto2);font-size:16px}
.wz-f{display:flex;flex-direction:column;gap:12px}
.wz-l{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:15px}
.wz-l input{font:inherit;font-weight:500;font-size:17px;padding:13px 14px;border:2px solid #F3D3DA;border-radius:12px;background:#FDF0F3;color:var(--texto)}
.wz-l input:focus{outline:none;border-color:#B84060;background:#fff}
.wz-c{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.45;color:var(--texto2)}
.wz-c input{width:22px;height:22px;flex-shrink:0;margin-top:1px;accent-color:#B84060}
.wz-c a{color:#B84060;font-weight:700}
.wz-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.wz-err{color:#D93A3A;font-weight:700;font-size:14px;margin:0;min-height:0}
.wz-b{background:#25D366;color:#fff;border:0;font-size:17px;min-height:52px}
.wz-b:hover{background:#1EBE5B}
.wz-ok{display:flex;gap:12px;align-items:flex-start;background:#E7F7EE;border-radius:14px;padding:14px 16px}
.wz-ok[hidden],.wz-f[hidden]{display:none}.wz-ok p{margin:0}
.wzp{position:fixed;inset:0;z-index:150;background:rgba(40,10,20,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.wzp[hidden]{display:none}
.wzp-box{position:relative;width:min(100%,420px);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:22px;padding:24px 20px 18px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:wzpin .3s ease}
@keyframes wzpin{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
.wzp-x{position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:0;background:#FDF0F3;color:#8A2E48;font-size:26px;line-height:1}
.wzp-ic{width:52px;height:52px;margin:0 auto 10px;display:flex}
.wzp-box h2{text-align:center;font-size:24px;line-height:1.2;margin:0 28px 8px}
.wzp-s{text-align:center;color:var(--texto2);font-size:15px;margin:0 0 14px}
.wzp-no{border:0;background:none;color:var(--texto2);font:inherit;font-size:14px;text-decoration:underline;padding:4px;margin-top:-2px}
.wzp-done{text-align:center}.wzp-done[hidden],#wzp-f[hidden]{display:none}
.wzp-cp{display:flex;gap:8px;justify-content:center;align-items:center;margin:10px 0;border:2px dashed #B84060;border-radius:14px;padding:10px}
.wzp-cp span{font-weight:800;font-size:20px;letter-spacing:1px;color:#8A2E48}
.wzp-cp .btn{min-height:40px;padding:8px 14px;font-size:14px}
.wzp-s2{font-size:14px;color:var(--texto2);margin:0 0 12px}
body.wzp-on{overflow:hidden}body.wzp-on .sp,body.wzp-on .wa{display:none!important}

/* ===== 19/10: comparativo menor, com "Compare" e a coluna do Gloss Brumar em destaque rosa ===== */
#comparativo .cmp{border-radius:16px}
#comparativo .cmp-h,#comparativo .cmp-r{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr);align-items:stretch}
#comparativo .cmp-h{background:#FDF0F3}
#comparativo .cmp-h span,#comparativo .cmp-r span[role=cell]{display:flex;align-items:center;justify-content:center;padding:10px 8px;font-size:15px;line-height:1.3}
#comparativo .cmp-h span{font-size:13px;letter-spacing:.06em;text-transform:uppercase;line-height:1.25}
#comparativo .cmp-h span:first-child{justify-content:flex-start;letter-spacing:.14em;color:#8A2E48}
#comparativo .cmp-r span[role=cell]:first-child{justify-content:flex-start;text-align:left}
#comparativo .cmp-h .cmp-br{background:#B84060;color:#fff}
#comparativo .cmp-r span[role=cell]:nth-child(2){background:#FDF0F3;box-shadow:inset 2px 0 0 #B84060,inset -2px 0 0 #B84060}
#comparativo .cmp-r:last-child span[role=cell]:nth-child(2){box-shadow:inset 2px 0 0 #B84060,inset -2px 0 0 #B84060,inset 0 -2px 0 #B84060}
#comparativo .cmp-r .yes,#comparativo .cmp-r .no,#comparativo .cmp-r .nem{padding:0}
#comparativo .yes svg,#comparativo .no svg{display:block;width:24px;height:24px}
#comparativo .nem{font-size:13px;font-weight:600;line-height:1.25;color:#7A3A4C;text-align:center}
#comparativo .no{gap:1px}
#comparativo .no small{font-size:11px;line-height:1.2;white-space:nowrap}
#comparativo .cmp-nota{font-size:12px;line-height:1.4;color:var(--texto2);text-align:center;margin-top:10px}
@media (max-width:520px){
#comparativo .cmp-h,#comparativo .cmp-r{grid-template-columns:minmax(0,1.35fr) minmax(0,.95fr) minmax(0,1fr)}
#comparativo .cmp-h span,#comparativo .cmp-r span[role=cell]{padding:9px 6px;font-size:14px}
#comparativo .cmp-h span{font-size:11px;letter-spacing:.03em}
#comparativo .cmp-h span:first-child{letter-spacing:.1em}
}
@media (max-width:380px){
#comparativo .cmp-h span{font-size:10px;letter-spacing:0;padding:8px 4px}
#comparativo .cmp-h span:first-child{letter-spacing:.06em}
#comparativo .no small{font-size:10px}
}
/* ===== 19/10: seção do brinde mostra quanto falta e os produtos da sacola ===== */
#brinde .bf{display:flex;align-items:baseline;justify-content:space-between;gap:4px 12px;flex-wrap:wrap;margin-top:16px;padding:14px 16px;border-radius:14px;background:var(--blush)}
#brinde .bf:focus{outline:2px solid var(--rosa);outline-offset:2px}
#brinde .bf-r{font-size:14px;font-weight:600;color:var(--texto2)}
#brinde .bf-v{font-family:var(--serif);font-size:30px;line-height:1.1;color:var(--rosa)}
#brinde .bf.ok .bf-v{font-size:22px}
#brinde .bar{height:12px;border-radius:6px;margin-top:12px}
#brinde .bar i{width:0;border-radius:6px}
#brinde .bs{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:var(--texto2);margin-top:6px}
#brinde .bi-l{list-style:none;margin:12px 0 0;padding:0;border-top:1px solid var(--linha)}
#brinde .bi-l[hidden]{display:none}
#brinde .bi-l li{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--linha);font-size:14px;color:var(--texto)}
#brinde .bi-n{flex:1;min-width:0}
#brinde .bi-p{font-weight:700;white-space:nowrap}
#brinde .bi-x{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--linha);background:#fff;color:var(--rosa-esc);font-size:20px;line-height:1;cursor:pointer}
#brinde .bi-x:hover{background:var(--blush)}
#brinde .brinde-msg{font-size:14px;margin-top:8px;color:var(--texto2)}

/* 21/10: políticas completas, uma por bloco */
.pol-d{border:1.5px solid var(--linha);border-radius:14px;margin:12px 0;background:#fff}
.pol-d>summary{cursor:pointer;padding:16px 18px;font-weight:700;font-size:18px;color:var(--vinho);list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
.pol-d>summary::-webkit-details-marker{display:none}
.pol-d>summary::after{content:"+";font-size:26px;line-height:1;color:var(--rosa)}
.pol-d[open]>summary::after{content:"–"}
.pol-c{padding:0 18px 18px;font-size:16px;line-height:1.65}
.pol-c h3{font-family:var(--sans);font-size:17px;margin:20px 0 6px;color:var(--vinho)}
.pol-c ul{padding-left:20px;margin:8px 0}.pol-c li{margin:4px 0}

/* 19/10: Compre junto do Shampoo com o combo da Yampi: economia e Pix em verde, como na caixa de preço */
.cj p span{white-space:nowrap}
.cj p .econ{color:#0B8139;font-weight:700;font-size:14px}
.cj p .pixs{font-size:14px}

/* ===== 19/10: correções que o Brand Book já decide ===== */
/* Verde só para comprar: barras, contador da sacola e frete em rosa. As respostas "Com a Brumar" do "Você se
   identifica?" ficam no verde da prévia original (✓ verde e fundo verde claro): decisão da Brumar em 19-20/10. */
.bar i{background:var(--rosa)}
.toast .bar i{background:#F8C8D0}
.badge{background:var(--rosa)}
.pb-frete{color:var(--rosa-esc)}
/* Botões de WhatsApp com contorno rosa (o verde WhatsApp fica só no ícone) */
.btn.wa-o{border-color:var(--rosa);color:var(--rosa)}
.btn.wa-o:hover{background:#FDF0F3;border-color:#9E3552;color:#9E3552}
/* Nada de pílula */
.gcar-d button,.ccar-d button{border-radius:10px}
/* Ícones: traço rosa sobre círculo rosa-claro */
.bi,.ben-c .bi{border-radius:50%;background:var(--rosa-cl);color:var(--rosa)}
.ben-c .bi svg{color:var(--rosa)}
/* Só cores da paleta: dourado claro no lugar dos amarelos */
.cupom{background:#F5E8C8;border-color:#B84060;color:#8A2E48}
.cupom svg{color:#B84060}
.need:not(.warn){background:#F5E8C8;color:#8A2E48}
.fg.gb{background:#F5E8C8;color:#8A2E48}
.wrn{stroke:#D93A3A}
/* Botões nas faixas rosa-profundo: fundo branco com texto rosa */
#comunidade .cm-soc,#diferenciais .more-b,#depoimentos .vt-nav .res-a{background:#fff;border-color:#fff;color:var(--rosa)}
#comunidade .cm-soc:hover,#diferenciais .more-b:hover{background:#FDF0F3}
/* 20/10: dois vídeos na faixa "Veja a aplicação na prática": No salão e Em casa */
#reels .reels{grid-template-columns:repeat(2,minmax(0,1fr));max-width:620px;margin-left:auto;margin-right:auto}
/* Botão rosa "Ver o Gloss Matizado" embaixo do botão de compra, nas páginas do Gloss Branco */
.cta-f .btn.ghost{width:100%;margin-top:10px}
/* Cupom: o botão Copiar pode descer de linha em tela estreita */
.wzp-cp{flex-wrap:wrap}

/* 19/10: play no meio dos vídeos (mesmo estilo da página de avaliações) */
.vplay{position:relative}
.vplay-b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:transparent;border:0;padding:0;cursor:pointer;border-radius:22px}
.vplay-b span{width:72px;height:72px;border-radius:50%;background:rgba(184,64,96,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(40,6,18,.35);transition:transform .15s}
.vplay-b svg{width:30px;height:30px;fill:#fff;margin-left:4px}
.vplay-b:hover span{transform:scale(1.06)}
.vplay-b:focus-visible{outline:3px solid #fff;outline-offset:-6px}

/* 19/10: "Escolha o seu kit" do Gloss Matizado separado em frasco de 300 ml e frasco de 1 litro */
.vg-t{display:flex;flex-direction:column;gap:2px;margin:6px 0 0;padding:10px 14px;background:var(--blush);border-radius:12px}
.vg-t b{font-size:17px;color:var(--rosa-esc)}
.vg-t span{font-size:14px;color:var(--texto2)}
#gm-mais{display:none;flex-direction:column;gap:12px}
#gm-mais.open{display:flex}
.vos .more-b{margin:2px auto 0}

/* 19/10: títulos e subtítulos das seções centralizados (os textos longos e as listas continuam à esquerda) */
#home .sec-head{text-align:center;margin-left:auto;margin-right:auto;align-items:center}
.pp2 .pp-sec > .eyebrow,.pp2 .pp-sec > h2{text-align:center}
#mais-vendido .card.wide{margin-left:auto;margin-right:auto}  /* o cartão do kit fica no centro, embaixo do título */

/* 19/10: abas Site Brumar / Shopee / Mercado Livre nas avaliações */
.av-tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:4px 0 18px}
.av-tab{border:2px solid var(--linha);background:#fff;color:var(--texto);border-radius:10px;padding:10px 16px;font:600 15px var(--sans);min-height:44px;cursor:pointer}
.av-tab b{margin-left:4px}
.av-tab[aria-selected="true"]{border-color:var(--rosa);background:var(--rosa);color:#fff}
.av-tab:focus-visible{outline:3px solid var(--rosa-esc);outline-offset:2px}
.stars-p{position:relative;display:inline-block;font-size:20px;letter-spacing:2px;line-height:1;color:#E9DCE0}
.stars-p .on{position:absolute;left:0;top:0;width:var(--p);overflow:hidden;white-space:nowrap;color:#F5B400}
.rt-q{display:block;font-size:14px;color:var(--texto2)}
.dist{max-width:340px;margin:10px auto 18px;font-size:13px;color:var(--texto2)}
.dl{display:flex;align-items:center;gap:8px;margin:3px 0}
.dl span{width:34px;text-align:right}.dl em{width:30px;font-style:normal}
.dl i{flex:1;height:8px;border-radius:4px;background:var(--rosa-cl);overflow:hidden}
.dl i b{display:block;height:100%;background:#F5B400}
.verif.mk{background:var(--blush);color:var(--rosa-esc);border-radius:6px;padding:2px 8px}
.rv.rv-mk{grid-template-columns:1fr}
.fonte-av{font-size:13px;color:var(--texto2);margin-top:12px;text-align:center}
.av-outras{font-size:14px;color:var(--texto2);margin:0}
.av-aba .rev-top{justify-content:center}

/* 20/10: resultados reais (fotos de clientes) entre "A solução" e "Benefícios" */
.rr .rr-sub{text-align:center;color:var(--texto2);margin:-4px auto 16px;max-width:560px}
.rr-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (min-width:760px){.rr-g{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}}
.rr-c{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 22px rgba(138,46,72,.08);display:flex;flex-direction:column}
.rr-f{aspect-ratio:1/1;background:var(--blush);display:flex;align-items:center;justify-content:center}
.rr-f img{width:100%;height:100%;object-fit:contain}
.rr-b{padding:10px 12px 14px;display:flex;flex-direction:column;gap:6px}
.rr-b .stars{font-size:14px}
.rr-b p{margin:0;font-size:14px;line-height:1.45;color:var(--texto)}
.rr-b .avc-f{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}
.rr-b .avc-f b{font-size:14px}
.rr-b .verif{font-size:11px}
.rr-b .verif svg{width:13px;height:13px}
.rr-b small{color:var(--texto2);font-size:12px}
.rr-nota{text-align:center;font-size:13px;color:var(--texto2);margin-top:12px}
.rr-cta{text-align:center;margin-top:12px}

/* 20/10: vídeos nas páginas de produto (abaixo dos 3 ícones) */
.pv .pv-sub{text-align:center;color:var(--texto2);margin:-4px auto 14px;max-width:560px}
.pv-row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 2px 8px;scrollbar-width:none}
.pv-row::-webkit-scrollbar{display:none}
.pv-c{flex:0 0 46%;max-width:240px;aspect-ratio:9/16;border-radius:16px;overflow:hidden;position:relative;background:#2a1a20;scroll-snap-align:start;box-shadow:0 8px 22px rgba(138,46,72,.12)}
@media (min-width:760px){.pv-c{flex-basis:23%}}
.pv-c video{width:100%;height:100%;object-fit:cover;display:block}
.pv-c .vplay-b{border-radius:16px}
.pv-c .vplay-b span{width:64px;height:64px;background:rgba(255,255,255,.92);box-shadow:0 6px 18px rgba(0,0,0,.25)}
.pv-c .vplay-b svg{width:28px;height:28px;fill:var(--rosa);margin-left:3px}
.pv-nav{display:flex;justify-content:center;gap:10px;margin-top:8px}
/* em espera: o produto ainda não tem vídeo de resultado (o painel vai pôr) */
.pv-espera{display:flex;gap:14px;align-items:center;background:var(--blush);border:1.5px dashed #E7B9C6;border-radius:16px;padding:18px;max-width:560px;margin:0 auto}
.pv-ei{flex:none;width:52px;height:52px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center}
.pv-ei svg{width:24px;height:24px;fill:var(--rosa);margin-left:3px}
.pv-espera p{margin:0;color:var(--texto2);font-size:15px;line-height:1.45}.pv-espera b{color:#8A2E48}.pv-espera a{color:#8A2E48}

/* 20/10: caixa vinho "Veja a aplicação na prática" (No salão e Em casa), entre "O que você vai precisar" e o Protocolo */
.pa-box{background:linear-gradient(160deg,#8A2E48 0%,#9E3552 60%,#A8395A 100%);border-radius:24px;padding:28px 18px 30px;text-align:center}
.pa-box .eyebrow{color:#F5E8C8}.pa-box h2{color:#fff}.pa-box .pa-sub{color:#FCE7EB;margin:6px auto 0;max-width:520px}
.pa-vs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:620px;margin:18px auto 0}
.pa-v{margin:0;min-width:0;display:flex;flex-direction:column;gap:10px;align-items:flex-start}
.pa-v .rl-t{background:#F5E8C8;color:#8A2E48}
.pa-c{width:100%;aspect-ratio:9/16;border-radius:18px;overflow:hidden;background:#2a1a20;box-shadow:0 12px 30px rgba(40,6,18,.35)}
.pa-c video{width:100%;height:100%;object-fit:cover;display:block}
.pa-c .vplay-b{border-radius:18px}
.pa-c .vplay-b span{background:rgba(255,255,255,.92);width:58px;height:58px}
.pa-c .vplay-b svg{fill:var(--rosa)}

/* 20/10: caixa de avaliação (página inicial e páginas de produto) */
.fav{margin:24px auto 18px;max-width:560px;background:#FDF0F3;border:1.5px solid #B84060;border-radius:20px;padding:24px 18px;text-align:left}
.fav-campos{display:flex;flex-direction:column;gap:9px}.fav-campos[hidden]{display:none}
.fav .eyebrow{margin:0;text-align:center}.fav-h{font-family:'Playfair Display',serif;font-size:24px;line-height:1.2;color:#8A2E48;margin:0 0 2px;text-align:center}
.fav-l{font-weight:700;color:#8A2E48;font-size:15px;margin:8px 0 0}.fav-l small{font-weight:400;color:#7a5a64}
.fav-in{width:100%;box-sizing:border-box;background:#fff;border:1.5px solid #E7B9C6;border-radius:12px;padding:12px 14px;color:var(--texto);font:inherit;font-size:16px}
.fav-in:focus{outline:none;border-color:#B84060;box-shadow:0 0 0 3px rgba(184,64,96,.18)}
.fav-in[aria-invalid=true],.fav-rs.erro{border-color:#C0392B;box-shadow:0 0 0 3px rgba(192,57,43,.15)}
textarea.fav-in{resize:vertical;min-height:84px}
.fav-prod{margin:0;text-align:center;color:#5a3a44;font-size:14.5px;background:#fff;border-radius:10px;padding:8px}
.fav-rs{background:#fff;border:1.5px solid #E7B9C6;border-radius:12px;padding:4px 12px}
.fav-r{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0 8px;padding:4px 0;border-bottom:1px solid #F6DDE4;font-weight:600;color:#5a3a44;font-size:15px}.fav-r:last-child{border:0}
@media (max-width:440px){.fav-r{flex-direction:column;align-items:flex-start}.fav-rl{padding-top:6px}}
.fav-st{display:flex}.fav-st input{position:absolute;opacity:0;width:1px;height:1px}
.fav-st label{min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;font-size:30px;line-height:1;cursor:pointer;color:transparent;-webkit-text-stroke:1.6px #A08850;transition:transform .1s}
.fav-st label.on{color:#E0A100;-webkit-text-stroke:1.6px #B07D00}
@media (hover:hover){.fav-st label:hover{transform:scale(1.12)}}
.fav-st input:focus-visible+label{outline:2px solid #B84060;outline-offset:-2px;border-radius:8px}
.fav-up{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.fav-f,.fav-v{display:flex;align-items:center;justify-content:center;gap:8px;border-radius:12px;padding:12px;font-weight:700;font-size:14.5px;background:#fff;color:#B84060;text-decoration:none;cursor:pointer;text-align:center;min-height:48px;box-sizing:border-box}
.fav-fn{overflow-wrap:anywhere}
.fav-f{border:1.5px dashed #B84060}.fav-f.on{border-style:solid;background:#E7F7EE;color:#0A7A35;border-color:#0A7A35}
.fav-f:focus-within{outline:2px solid #B84060;outline-offset:2px}
.fav-fx{align-self:center;background:none;border:0;color:#8A2E48;text-decoration:underline;font:inherit;font-size:14px;padding:8px 12px;min-height:44px;cursor:pointer}.fav-fx[hidden]{display:none}
.fav-okf[hidden]{display:none}
.fav-v{border:1.5px solid #B84060}.fav-v svg{color:#25D366}
.fav-dica{font-size:12.5px;color:#6E4F59;margin-top:-4px}
.fav-ce{color:#C0392B;font-weight:600;font-size:13.5px;margin-top:-4px}.fav-ce:empty{display:none}
.fav-ok{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:#5a3a44;margin-top:6px;cursor:pointer}
.fav-ok input{flex:none;width:22px;height:22px;margin:0;accent-color:#B84060}.fav-ok a{color:#8A2E48}
.fav-err{margin:0;color:#C0392B;font-weight:600;font-size:14px}.fav-err:empty{display:none}
.fav-b{background:#B84060;color:#fff;border-color:#B84060;justify-content:center;margin-top:4px;width:100%}
.fav-b:disabled{opacity:.7;cursor:wait}
.fav-rod{text-align:center;color:#6E4F59;font-size:12.5px}
.fav-fim{display:flex;gap:12px;align-items:flex-start;background:#E7F7EE;border-radius:16px;padding:18px}.fav-fim[hidden]{display:none}.fav-fim:focus{outline:none}
.fav-ok-i{flex:none;width:40px;height:40px;border-radius:50%;background:#CDEFDB;color:#0A7A35;font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center}
.fav-fim p{margin:0;font-size:15px;line-height:1.45}.fav-fim b{color:#8A2E48}
.sr{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;white-space:nowrap!important}
/* A caixinha "fulana comprou" do rodapé ficava invisível mas por cima da tela, roubando toques: agora só existe quando aparece */
.sp[hidden]{display:none}.sp:not(.show){pointer-events:none}
/* Ao pular para um campo, ele não fica escondido atrás do topo nem da barra fixa de compra */
html{scroll-padding-top:80px;scroll-padding-bottom:120px}

/* 20/10: página Lucre com a Brumar (cores e medidas da prévia que a Brumar mandou) */
#p-lucre{--prof:#8A2E48;--t2:#7A3A4C;--bebe:#FCE7EB;--nevoa:#FDF0F3;--borda:#F3D3DA;--ouro:#F5E8C8;--verde:#0B8139;--verdec:#E7F7EE;--wa:#25D366;color:var(--prof)}
#p-lucre .t1,#p-lucre h2,#p-lucre h3{font-family:'Playfair Display',Georgia,serif;color:var(--prof);line-height:1.15;margin:0}
#p-lucre .back{margin-bottom:10px}
.lc-sec{padding:44px 0}@media (min-width:900px){.lc-sec{padding:64px 0}}
.lc-eb{display:block;font-size:14px;letter-spacing:3px;text-transform:uppercase;font-weight:700;color:var(--rosa);margin-bottom:8px}
.lc-sh{text-align:center;max-width:720px;margin:0 auto 24px}.lc-sh h2{font-size:clamp(28px,6vw,38px);margin-bottom:8px}
.lc-hero{background:linear-gradient(180deg,var(--nevoa),#fff);padding:28px 0 40px}
.lc-hero-w{display:grid;gap:22px;align-items:center}@media (min-width:900px){.lc-hero-w{grid-template-columns:1.1fr .9fr}}
#p-lucre .lc-hero .t1{font-size:clamp(36px,8vw,54px);margin:4px 0 12px}
.lc-lead{font-size:19px;color:var(--t2);margin:0 0 18px}
.lc-img{background:#fff;border-radius:24px;box-shadow:0 14px 36px rgba(138,46,72,.12);padding:16px}.lc-img img{width:100%;display:block}
.lc-paths{display:grid;gap:12px;margin-top:6px}@media (min-width:700px){.lc-paths{grid-template-columns:repeat(3,1fr)}}
.lc-path{display:flex;gap:12px;align-items:center;background:#fff;border:2px solid var(--borda);border-radius:16px;padding:12px 14px;color:var(--prof);text-align:left;font:inherit;cursor:pointer;transition:border-color .2s,transform .2s}
.lc-path:hover{border-color:var(--rosa);transform:translateY(-2px)}.lc-path b{display:block;font-size:16px}
.lc-s{font-size:13.5px;color:var(--t2)}
.lc-ib{width:46px;height:46px;border-radius:50%;background:var(--bebe);color:var(--rosa);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lc-ib svg.i{width:22px;height:22px;stroke-width:1.7}
.lc-trust{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}@media (max-width:399px){.lc-trust{grid-template-columns:1fr}}@media (min-width:800px){.lc-trust{grid-template-columns:repeat(4,1fr)}}
.lc-trust div{background:var(--nevoa);border-radius:16px;padding:14px;display:flex;gap:10px;align-items:center;font-weight:600;font-size:14.5px;line-height:1.35}
.lc-trust .lc-ib{width:40px;height:40px;background:#fff}
.lc-mode{border-top:1px solid var(--borda)}.lc-alt{background:var(--nevoa)}.lc-alt .lc-mh .lc-ib{background:#fff}
.lc-mh{display:flex;gap:14px;align-items:center;margin-bottom:12px}.lc-mh h2{font-size:clamp(28px,6vw,36px)}
.lc-tag{display:inline-block;background:var(--prof);color:#fff;font-weight:800;font-size:13px;letter-spacing:.5px;padding:5px 12px;border-radius:999px;margin-bottom:10px}
.lc-big{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:6px 0 14px}
.lc-big strong{font-size:44px;line-height:1;color:var(--rosa);font-weight:800}.lc-big span{color:var(--t2);font-weight:600}
.lc-cols{display:grid;gap:18px}@media (min-width:900px){.lc-cols{grid-template-columns:1fr 1fr;align-items:start}}
.lc-intro{margin:0 0 14px;color:var(--t2)}
.lc-ben{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.lc-ben li{display:flex;gap:12px;align-items:flex-start;background:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 6px 18px rgba(138,46,72,.06)}
.lc-ben li .lc-ib{width:38px;height:38px}.lc-ben li .lc-ib svg.i{width:19px;height:19px}.lc-ben b{display:block}.lc-ben .lc-s{font-size:15px}
.lc-steps{counter-reset:st;list-style:none;margin:0;padding:0;display:grid;gap:10px}
.lc-steps li{counter-increment:st;display:flex;gap:12px;align-items:flex-start;font-size:16px}
.lc-steps li::before{content:counter(st);width:30px;height:30px;border-radius:50%;background:var(--rosa);color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
.lc-card{background:#fff;border-radius:22px;padding:20px;box-shadow:0 14px 36px rgba(138,46,72,.10);border:2px solid var(--borda)}
.lc-card h3{font-size:24px;margin-bottom:6px}.lc-cs{color:var(--t2);margin:0 0 14px;font-size:15.5px}
.lc-plat{display:grid;gap:10px}
.lc-lojas{margin:12px 0 0;font-size:14px;color:var(--t2);text-align:center}.lc-lojas a{color:var(--rosa);font-weight:700}
.lc-pb{display:flex;align-items:center;gap:12px;border:2px solid var(--rosa);background:#fff;color:var(--prof);border-radius:12px;padding:12px 14px;text-decoration:none;font-weight:700;font-size:16px;min-height:56px}
.lc-pb:hover{background:var(--nevoa)}.lc-pb small{display:block;font-weight:500;font-size:13px;color:var(--t2)}.lc-go{margin-left:auto;color:var(--rosa);font-size:22px}
.lc-pl{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0}
.lc-pl svg{width:21px;height:21px}
.lc-fine{font-size:12.5px;color:var(--t2);margin:10px 0 0;line-height:1.45}
.lc-form{display:flex;flex-direction:column;gap:12px}.lc-form[hidden]{display:none}
.lc-f{display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:15px}.lc-f[hidden]{display:none}
.lc-f input{font:inherit;font-weight:500;font-size:16.5px;padding:12px 14px;border:2px solid var(--borda);border-radius:12px;background:var(--nevoa);color:var(--prof);width:100%;box-sizing:border-box}
.lc-f input:focus{outline:none;border-color:var(--rosa);background:#fff}
.lc-row2{display:grid;grid-template-columns:1fr 92px;gap:10px}
#p-lucre fieldset{border:0;padding:0;margin:0}#p-lucre legend{font-weight:700;font-size:15px;margin-bottom:6px}
.lc-yn{display:flex;gap:10px}
.lc-yn label{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:2px solid var(--borda);border-radius:12px;padding:10px;font-weight:700;cursor:pointer;background:var(--nevoa);min-height:48px}
.lc-yn input{accent-color:var(--rosa);width:18px;height:18px}.lc-yn label:has(input:checked){border-color:var(--rosa);background:#fff}
.lc-ok{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.45;color:var(--t2)}
.lc-ok input{width:22px;height:22px;flex-shrink:0;accent-color:var(--rosa);margin-top:1px}.lc-ok a{color:var(--prof)}
.lc-err{color:#D93A3A;font-weight:700;font-size:14px;margin:0}.lc-err:empty{display:none}
.lc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:10px;padding:14px 20px;font:inherit;font-weight:700;font-size:17px;cursor:pointer;text-decoration:none;min-height:52px}
.lc-p{background:var(--rosa);color:#fff}.lc-p:hover{background:#9E3552}.lc-p:disabled{opacity:.7;cursor:wait}
.lc-done{display:flex;gap:12px;align-items:flex-start;background:var(--verdec);border-radius:14px;padding:16px}.lc-done[hidden]{display:none}.lc-done:focus{outline:none}
.lc-done p{margin:0}.lc-done .lc-ib{background:#fff;color:var(--verde)}
.lc-hp{position:absolute;left:-9999px}
.lc-tw{overflow-x:auto}
.lc-cmp{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 26px rgba(138,46,72,.08);font-size:14.5px}
.lc-cmp th,.lc-cmp td{padding:12px 10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--borda)}
.lc-cmp th{background:var(--prof);color:#fff;font-weight:700}.lc-cmp td:first-child{font-weight:700;color:var(--prof);width:30%}
details.lc-q{background:#fff;border-radius:14px;margin-bottom:10px;box-shadow:0 6px 18px rgba(138,46,72,.06)}
details.lc-q summary{list-style:none;cursor:pointer;padding:15px 16px;font-weight:700;display:flex;justify-content:space-between;gap:10px}
details.lc-q summary::-webkit-details-marker{display:none}
details.lc-q summary::after{content:"+";color:var(--rosa);font-size:22px;line-height:1}details.lc-q[open] summary::after{content:"–"}
details.lc-q p{margin:0;padding:0 16px 16px;color:var(--t2);font-size:15.5px}
.lc-final{background:linear-gradient(135deg,var(--prof),var(--rosa));color:#fff;text-align:center}
#p-lucre .lc-final h2{color:#fff;font-size:clamp(28px,6vw,38px);margin-bottom:8px}.lc-final p{margin:0 0 18px;color:#FCE7EB}
.lc-final .lc-btn{background:#fff;color:var(--prof);margin:4px}
.lc-wa-row{display:flex;justify-content:center;margin-top:22px}
.lc-wa{background:var(--wa);color:#fff;width:min(100%,460px);text-align:center;line-height:1.3}.lc-wa:hover{background:#1EBE5B}.lc-wa svg{width:24px;height:24px;color:#fff;flex-shrink:0}
/* item do menu, em destaque (logo abaixo de Para cabeleireiras) */
.dr-link.dr-lucre{margin:10px 12px 12px;border-radius:16px;background:linear-gradient(135deg,#8A2E48,#B84060);color:#fff;padding:14px;box-shadow:0 8px 22px rgba(138,46,72,.25);position:relative;align-items:center}
.dr-lucre small{display:block;font-weight:500;font-size:13px;color:#FCE7EB;margin-top:2px}
.dr-lc-i{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dr-lucre svg.i{color:#fff}
.dr-new{position:absolute;top:-8px;right:12px;background:#F5E8C8;color:#8A2E48;font-size:11px;font-weight:800;letter-spacing:.5px;padding:3px 9px;border-radius:999px}

/* 20/10: Resultados reais da página inicial: fotos em cima, vídeos embaixo, cada um numa fileira de arrastar */
#resultados .res-sub{font-family:'Playfair Display',serif;color:#8A2E48;font-size:24px;margin:10px 0 10px}
#resultados .res-sub-p{color:var(--texto2);margin:-4px 0 12px;font-size:15px}
#rescar .resimg{aspect-ratio:9/16;flex:0 0 46%;max-width:240px;min-width:0}
@media (min-width:760px){#rescar .resimg{flex-basis:calc((100% - 48px)/5)}}
/* colagem antes | depois: cartão largo, mostra as duas metades inteiras */
#rescar{align-items:flex-start}
#rescar .resimg.dupla{flex:0 0 92%;max-width:480px;aspect-ratio:auto;height:auto;object-fit:contain;background:#fff}
@media (min-width:760px){#rescar .resimg.dupla{flex-basis:calc((100% - 48px)/5*2 + 12px)}}
.rv2-row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rv2-row::-webkit-scrollbar{display:none}
.rv2-c{flex:0 0 46%;max-width:240px;aspect-ratio:9/16;border-radius:16px;overflow:hidden;position:relative;background:#2a1a20;scroll-snap-align:start;box-shadow:0 8px 22px rgba(138,46,72,.12)}
@media (min-width:760px){.rv2-c{flex-basis:calc((100% - 48px)/5)}}
.rv2-c video{width:100%;height:100%;object-fit:cover;display:block}
.rv2-c .vplay-b{border-radius:16px}
.rv2-c .vplay-b span{width:56px;height:56px;background:rgba(255,255,255,.92)}
.rv2-c .vplay-b svg{width:26px;height:26px;fill:var(--rosa)}

/* 20/10: fotos em tela cheia com zoom */
#rescar .resimg,.rr-f img,.rv img,.avf img,.avc-img,.main-img,#gcar .gcar-s img{cursor:zoom-in}
.lbx{position:fixed;inset:0;z-index:210;background:#000;display:flex;align-items:center;justify-content:center}
.lbx[hidden]{display:none}
.lbx-v{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;touch-action:none}
.lbx-img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center center;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.lbx-z .lbx-img{cursor:grab}.lbx-arr .lbx-img{cursor:grabbing}
.lbx-x{position:absolute;z-index:3;top:calc(env(safe-area-inset-top,0px) + 14px);right:calc(env(safe-area-inset-right,0px) + 14px);width:48px;height:48px;border-radius:50%;border:0;background:rgba(255,255,255,.92);color:#8A2E48;display:flex;align-items:center;justify-content:center;cursor:pointer}
.lbx-x svg{width:24px;height:24px;stroke:currentColor;stroke-width:2.4;fill:none;stroke-linecap:round}
.lbx-a{position:absolute;z-index:3;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#8A2E48;font-size:30px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer}
.lbx-p{left:calc(env(safe-area-inset-left,0px) + 10px)}.lbx-n{right:calc(env(safe-area-inset-right,0px) + 10px)}.lbx-1 .lbx-a,.lbx-z .lbx-a{display:none}
.lbx-c{position:absolute;z-index:3;top:calc(env(safe-area-inset-top,0px) + 26px);left:calc(env(safe-area-inset-left,0px) + 18px);margin:0;color:#fff;font-weight:700;font-size:15px}
.lbx-d{position:absolute;z-index:3;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);margin:0;text-align:center;color:rgba(255,255,255,.75);font-size:13px;pointer-events:none}
.lbx-z .lbx-d{display:none}
body.lbx-on{overflow:hidden}

/* 20/10: setas e contador na tela cheia dos vídeos. Sem o touch-action, o navegador do celular entende o arrasto para
   a direita como "voltar página" e fecha o vídeo em vez de passar para o anterior. */
.vfs{touch-action:none;overscroll-behavior:none}
.vfs-a{position:absolute;z-index:2;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.85);color:#8A2E48;font-size:30px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.vfs-p{left:calc(env(safe-area-inset-left,0px) + 10px)}.vfs-n{right:calc(env(safe-area-inset-right,0px) + 10px)}.vfs-1 .vfs-a{display:none}
.vfs-c{position:absolute;z-index:2;top:calc(env(safe-area-inset-top,0px) + 26px);left:calc(env(safe-area-inset-left,0px) + 18px);margin:0;color:#fff;font-weight:700;font-size:15px;text-shadow:0 1px 4px rgba(0,0,0,.7)}

/* 20/10, pedido da usuária: todo visto (✓) do site fica no verde das páginas de produto (#0B8139), menos os
   banners do topo (#bnr), que ficam como estão porque viram fotos depois. */
.card li svg.i,.cmvip li svg{color:#0B8139}
.vo:has(input:checked)::after{background:#0B8139}
.wz-ok .ib{color:#0B8139;background:#CDEFDB}
.ben-c .bi:has(use[href="#i-check"]){background:#E7F7EE}
.ben-c .bi:has(use[href="#i-check"]) svg{color:#0B8139}
@media (max-width:600px){.bnr-dots{bottom:4px}}
/* troca rápida: botão Finalizar compra na lista da sacola */
#sacola-fim{display:flex;width:100%;margin-top:14px;justify-content:center}
#sacola-fim[hidden]{display:none}
.toast .toast-a{display:block;margin-top:8px;color:#fff;font-weight:700;text-decoration:underline}.toast.show .toast-a{pointer-events:auto}
</style>`;
