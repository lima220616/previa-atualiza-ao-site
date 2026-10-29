// Fim da página: rodapé, botão do WhatsApp, fundo escuro e menu (drawer), as janelas (#sp, #toast, #vfs, #wzp), o vídeo
// da Magda, o bloco de dados dos programas (#dados-site), os 25 programas, cada um no seu lugar (alguns procuram partes
// que precisam já existir), e o fim. "Minha conta / Rastrear pedido" (rodapé e menu) leva à área do cliente da Yampi
// (marca.json, minha-conta); o botão "Preferências de cookies" (data-cookies) reabre a escolha de cookies.
import { h } from "../html.mjs";
import { arquivo, brindeDaLoja, linkDoWhatsapp, nomeDoProduto, numeroEscrito, paginaVisivel, reaisRedondo, secaoLigada }
  from "./moldura/comum.mjs";
import { blocoDoSite } from "./moldura/dados-do-site.mjs";
import { marca as marcaDoPainel } from "./moldura/previa.mjs";
import { textoDaFoto } from "./moldura/texto-alternativo.mjs";
import { medicaoLigada } from "./moldura/cabeca-comum.mjs";

// As redes no rodapé, nesta ordem, com o ícone de cada uma (parte fixa; o endereço vem do marca.json).
const REDES = [
  ["instagram", "Instagram", h`<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>`],
  ["facebook", "Facebook", h`<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>`],
  ["threads", "Threads", h`<path d="M16.5 11.2c-.4-2.6-2.1-3.9-4.4-3.9-2.7 0-4.4 2-4.4 4.7s1.7 4.7 4.4 4.7c2 0 3.5-1 3.5-2.8 0-2.6-3.6-2.8-5.4-2.1"/><path d="M19.5 8.5C18.2 5.3 15.6 3.5 12 3.5 7 3.5 4 7 4 12s3 8.5 8 8.5c3.4 0 6-1.7 7-4.7"/>`],
  ["tiktok", "TikTok", h`<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.4 4.4 5 4.6"/>`],
  ["kwai", "Kwai", h`<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/>`],
  ["youtube", "YouTube", h`<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/>`],
];

// Coluna "Produtos" do rodapé: as telas (o nome é o do produto, nomeDoProduto) e os links fixos [destino, rótulo].
// "p-..." some com a tela escondida; o resto some com a seção desligada.
const PRODUTOS_DO_RODAPE = [
  "gloss", "shampoo", "leavein", "oleo", "serum", "cristal",
  ["p-kit-completo-1l", "Todos os kits"], ["profissionais", "Para cabeleireiras"], ["resultados", "Resultados reais"],
];

// Menu: as telas, em grupos (parte fixa: os grupos e a ordem). Do produtos.json vêm o nome (o da tela; nos kits e
// combos, o do kit principal no kits.json; "nome-no-menu" quando é outro) e a descrição ("descricao-no-menu"). A foto é
// a do kit marcado da tela (kits.json), que o painel pode trocar.
const MENU_PRODUTOS = ["gloss", "shampoo", "leavein", "oleo", "serum", "cristal", "gloss-branco"];
const MENU_KITS = [
  ["USO EM CASA", ["kit-completo-300ml", "combo-300"]],
  ["USO NO SALÃO", ["kit-completo-1l", "kit-finalizacao", "combo-1l", "kit-profissional", "combo-prof", "combo-super", "kit-gloss-branco"]],
];

// O vídeo da Magda (aberto pelo link da dúvida sobre coloração). Parte fixa por enquanto, já no formato do videos.json.
const VIDEO_DA_MAGDA = {
  arquivo: "/videos-depoimentos/DegwIHpRqvO.mp4", capa: "/arquivos/fd7fbb0fcbc4.jpg",
  titulo: "Depoimento da Magda: mechas, luzes e coloração depois do Gloss", visivel: true,
};

// Os programas da página: <script src> com o nome com impressão digital.
const programa = (ctx, n) => h`<script src="${ctx.url("js/bloco-" + String(n).padStart(2, "0") + ".js")}"></script>`;
const programas = (ctx, de, ate) => Array.from({ length: ate - de + 1 }, (_, i) => programa(ctx, de + i));

function destinoVisivel(dados, destino) {
  return destino.startsWith("p-") ? paginaVisivel(dados, destino.slice(2)) : secaoLigada(dados, destino);
}

function fotoDoKit(dados, ctx, kit) {
  const foto = dados.kits?.[kit]?.foto;
  if (!foto) throw new Error(`menu: o kit "${kit}" não existe no kits.json ou está sem foto`);
  return arquivo(ctx, foto);
}

function itemDoMenu(dados, ctx, tela, deKit) {
  if (!paginaVisivel(dados, tela)) return "";
  const p = dados.produtos?.[tela];
  if (!p) throw new Error(`menu: a tela "${tela}" não existe no produtos.json`);
  const nome = p["nome-no-menu"] ?? (deKit ? dados.kits?.[p.kit]?.nome : p.nome);
  if (!nome) throw new Error(`menu: a tela "${tela}" sem nome (nem o kit "${p.kit}" no kits.json)`);
  return h`<a class="pi" href="#p-${tela}"><img src="${fotoDoKit(dados, ctx, p["kit-marcado"] ?? p.kit)}" alt="${textoDaFoto(dados, nome)}"><span><b>${nome}</b><span>${p["descricao-no-menu"]}</span></span></a>
`;
}

function rodapeDaLoja(dados, ctx) {
  const { marca, textos } = dados;
  const e = marca.empresa;
  const numero = numeroEscrito(marca);
  const instagram = marca.redes?.instagram;
  const host = marca.site.replace(/^https:\/\//, "").replace(/\/$/, "");
  const redes = REDES.filter(([r]) => marca.redes?.[r]).map(([r, nome, icone]) =>
    h`<a href="${marca.redes[r]}" target="_blank" rel="noopener" aria-label="${nome} da Brumar" title="${nome}"><svg viewBox="0 0 24 24" class="i">${icone}</svg></a>`);
  const produtos = PRODUTOS_DO_RODAPE.map((item) => (typeof item === "string" ? [`p-${item}`] : item))
    .filter(([d]) => destinoVisivel(dados, d))
    .map(([d, rotulo]) => h`<li><a href="#${d}">${rotulo ?? nomeDoProduto(dados, d.slice(2))}</a></li>`);
  const horario = String(textos.horario ?? "").split(" · ").map((p) => p.trim()).filter(Boolean)
    .map((p) => h`<li>${p.slice(0, 1).toUpperCase() + p.slice(1)}</li>`);
  const c = marca.condicoes;
  return h`<footer>
<div class="wrap">
<div class="f-brand"><span class="flogo"><img src="${arquivo(ctx, marca.logo)}" alt="${marca.nome}"></span><p class="f-sig"${marcaDoPainel(ctx, "textos", "slogan")}>${textos.slogan}</p><p class="f-tag">Transformação que você vê, qualidade que você confia.</p><p>Desde 2009, a Brumar cria cosméticos capilares 100% sem formol, de alta performance e com fórmulas seguras, para transformar cabelos em casa ou no salão. Porque cuidar dos cabelos é também cuidar da autoestima.</p>
<div class="socials">${redes}</div></div>
<div class="cols">
<div><h4>Produtos</h4><ul>${produtos}</ul></div>
<div><h4>Ajuda</h4><ul><li><a href="#p-duvidas">Dúvidas frequentes</a></li>${secaoLigada(dados, "garantia") ? h`<li><a href="#garantia">Garantia de satisfação</a></li>` : ""}<li><a href="#p-avaliacoes">Avaliações de clientes</a></li><li><a href="${marca["minha-conta"]}" target="_blank" rel="noopener">Minha conta / Rastrear pedido</a></li><li><a href="#p-politicas">Trocas e devoluções</a></li><li><a href="#p-politicas">Política de envio</a></li><li><a href="#p-politicas">Privacidade</a></li><li><a href="#p-politicas">Termos de uso</a></li><li><a href="#p-politicas">Aviso legal</a></li><li><a href="#p-politicas">Política de cookies</a></li>${medicaoLigada(ctx, marca) ? h`<li><button type="button" class="lk-cookies" data-cookies>Preferências de cookies</button></li>` : ""}<li><a href="#p-quem-somos">Sobre a Brumar</a></li></ul></div>
<div${marcaDoPainel(ctx, "atendimento")}><h4>Atendimento</h4><ul><li><a href="${linkDoWhatsapp(marca, textos["whatsapp-mensagem"])}" target="_blank" rel="noopener">WhatsApp ${numero}</a></li><li><a href="${"mailto:" + marca.email}">${marca.email}</a></li>${instagram ? h`<li><a href="${instagram}" target="_blank" rel="noopener">@${instagram.replace(/\/+$/, "").split("/").pop()}</a></li>` : ""}${horario}</ul>
<h4 style="margin-top:22px">Pagamento</h4><div class="paychips"><span>Pix ${c["pix-porcento"]}% OFF</span><span>Cartão em até ${c["parcelas-cartao"]}x</span><span>${c.parcelas}x sem juros</span><span>Compra segura</span></div></div>
</div>
<div class="legal"><p><b>${e["razao-social"]}</b> · Nome fantasia: ${marca.nome} · CNPJ ${e.cnpj}<br>${e.endereco}, ${e.cidade} - ${e.estado}, CEP ${e.cep}<br>E-mail: ${marca.email} · WhatsApp: ${numero} · ${host}</p><p>Você tem 7 dias após o recebimento para desistir da compra (Código de Defesa do Consumidor) e garantia de satisfação de até 30 dias.</p></div>
</div>
</footer>

<a class="wa"${marcaDoPainel(ctx, "textos", "whatsapp-mensagem")} href="${linkDoWhatsapp(marca, textos["whatsapp-mensagem"])}" target="_blank" rel="noopener" aria-label="Falar com a Brumar no WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 .9c.3.1.4.2.5.3.1.2.1.7-.1 1.2z"/></svg></a>

`;
}

function menu(dados, ctx) {
  const { marca, textos } = dados;
  const produtos = MENU_PRODUTOS.map((tela) => itemDoMenu(dados, ctx, tela, false)).filter(Boolean);
  const grupos = MENU_KITS.map(([titulo, telas]) => [titulo, telas.map((tela) => itemDoMenu(dados, ctx, tela, true)).filter(Boolean)])
    .filter(([, itens]) => itens.length);
  const ligacao = (id, icone, nome) => secaoLigada(dados, id)
    ? h`<a class="dr-link" href="#${id}"><svg class="i"><use href="#${icone}"/></svg>${nome}</a>
` : "";
  return h`<div class="overlay" id="overlay"></div>
<nav class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">
<div class="dr-head"><img src="${arquivo(ctx, marca.logo)}" alt="${marca.nome}"><button class="icon-btn" id="closeMenu" aria-label="Fechar menu"><svg class="i"><use href="#i-x"/></svg></button></div>
<div class="dr-body">
${produtos.length ? h`<details open><summary><svg class="i"><use href="#i-flask"/></svg>Produtos<svg class="i chev"><use href="#i-chev"/></svg></summary>
<div class="dr-sub">
${produtos}</div></details>
` : ""}${grupos.length ? h`<details><summary><svg class="i"><use href="#i-box"/></svg>Kits e combos<svg class="i chev"><use href="#i-chev"/></svg></summary>
<div class="dr-sub">
${grupos.map(([titulo, itens]) => h`<h5>${titulo}</h5>
${itens}`)}</div></details>
` : ""}${ligacao("resultados", "i-cam", "Resultados reais")}<a class="dr-link" href="#p-avaliacoes"><svg class="i"><use href="#i-star"/></svg>Avaliações de clientes</a>
${ligacao("reels", "i-play", "Como usar")}${ligacao("profissionais", "i-scissors", "Para cabeleireiras e revenda")}<a class="dr-link dr-lucre" href="#p-lucre"><span class="dr-new">NOVO</span><span class="dr-lc-i"><svg class="i"><use href="#i-coin"/></svg></span><span>Lucre com a Brumar<small>Seja afiliado(a), revendedor(a) ou distribuidor(a)</small></span></a>
<a class="dr-link" href="#p-quem-somos"><svg class="i"><use href="#i-book"/></svg>Quem somos</a>
<div class="dr-sep"></div>
<a class="dr-link" href="${marca["minha-conta"]}" target="_blank" rel="noopener"><svg class="i"><use href="#i-user"/></svg>Minha conta / Rastrear pedido</a>
<a class="dr-link" href="#p-duvidas"><svg class="i"><use href="#i-help"/></svg>Dúvidas frequentes</a>
${ligacao("garantia", "i-heart", "Garantia de satisfação")}<a class="dr-link" href="${linkDoWhatsapp(marca, textos["whatsapp-mensagem"])}" target="_blank" rel="noopener"><svg class="i"><use href="#i-chat"/></svg>Fale conosco</a>
</div>
</nav>

`;
}

function janelas(dados) {
  const c = dados.marca.condicoes;
  return h`<div class="sp" id="sp" role="status" aria-live="polite" hidden><img id="sp-img" alt="Foto enviada pela cliente"><div class="sp-b"><div class="stars" aria-hidden="true">★★★★★</div><p id="sp-t"></p><small><b id="sp-n"></b> · <span id="sp-c"></span></small></div><button type="button" class="sp-x" id="sp-x" aria-label="Fechar">×</button></div>
<div class="toast" id="toast" role="status" aria-live="polite"><b id="toastName">Produto</b> foi para a sacola.<div class="bar"><i id="tbar"></i></div><span style="font-size:13px" id="tmsg">Compras acima de ${reaisRedondo(c["brinde-acima"])} ganham o ${brindeDaLoja(dados).nome}.</span><a class="toast-a" href="#brinde">Ver a sacola e finalizar</a></div>

`;
}

// O vídeo em tela cheia (aberto pelos programas dos vídeos).
const TELA_CHEIA = h`<div class="vfs" id="vfs" hidden role="dialog" aria-label="Vídeo em tela cheia"><button type="button" class="vfs-x" id="vfs-x" aria-label="Fechar vídeo e voltar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><video id="vfs-v" playsinline></video></div>`;

function videoDaMagda(ctx) {
  const v = VIDEO_DA_MAGDA;
  if (!v.visivel) return "";
  return h`<video id="v-magda" src="${arquivo(ctx, v.arquivo)}" poster="${arquivo(ctx, v.capa)}" playsinline preload="none" style="display:none" aria-label="${v.titulo}"></video>`;
}

// A janela do cupom de primeira compra e do "receber no WhatsApp" (formulário da Netlify; o programa manda também para
// /api/lead).
function janelaDoCupom(dados) {
  const { marca } = dados;
  const codigo = marca.cupons["primeira-compra"];
  const porcento = marca.cupons["primeira-compra-porcento"];
  return h`<div class="wzp" id="wzp" hidden role="dialog" aria-modal="true" aria-labelledby="wzp-t">
<div class="wzp-box">
<button type="button" class="wzp-x" id="wzp-x" aria-label="Fechar">×</button>
<span class="ib wzp-ic"><svg class="i"><use href="#i-gift"/></svg></span>
<h2 id="wzp-t">Quer ficar por dentro das novidades e promoções?</h2>
<p class="wzp-s">Na primeira compra, use o cupom <b>${codigo}</b> e ganhe ${porcento}% OFF. Quer receber outras promoções e novidades da Brumar no seu WhatsApp? Deixe seu nome, e-mail e número.</p>
<form class="wz-f" id="wzp-f" name="whatsapp-popup" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
<input type="hidden" name="form-name" value="whatsapp-popup"><input type="hidden" name="origem" value="pop-up">
<p class="wz-hp" hidden><label>Não preencha este campo: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<label class="wz-l">Seu nome<input type="text" name="nome" id="wzp-nome" autocomplete="given-name" placeholder="Como podemos te chamar?" maxlength="60" required></label>
<label class="wz-l">Seu e-mail<input type="email" name="email" id="wzp-email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com" maxlength="120" required></label>
<label class="wz-l">Seu WhatsApp com DDD<input type="tel" name="whatsapp" id="wzp-tel" inputmode="numeric" autocomplete="tel-national" placeholder="(64) 99999-9999" maxlength="30" required></label>
<label class="wz-c"><input type="checkbox" name="autorizacao" id="wzp-ok" value="sim" required><span>Autorizo a ${marca.nome} a me enviar promoções, cupons e novidades pelo WhatsApp e por e-mail. Posso cancelar quando quiser, respondendo SAIR. Veja a <a href="#p-politicas">Política de Privacidade</a>.</span></label>
<p class="wz-err" id="wzp-err" role="alert"></p>
<button type="submit" class="btn wz-b">Quero receber no WhatsApp</button>
<button type="button" class="wzp-no" id="wzp-no">Agora não</button>
</form>
<div class="wzp-done" id="wzp-done" hidden><p><b>Pronto, <span id="wzp-n"></span>!</b> Use o cupom abaixo na sua primeira compra:</p><div class="wzp-cp"><span id="wzp-code">${codigo}</span><button type="button" class="btn ghost" id="wzp-copy">Copiar</button></div><p class="wzp-s2">${porcento}% OFF na primeira compra. Você também vai receber as ofertas da Brumar no seu WhatsApp. Salve o nosso número ${numeroEscrito(marca)}.</p><button type="button" class="btn buy" id="wzp-go">Ver os kits</button></div>
</div>
</div>
`;
}

// Na prévia do painel, o programa da prévia antes de todos (nada sai do quadro nem fica gravado). Fora dela, nada.
const programaDaPrevia = (ctx) => (ctx.previa ? h`<script src="${ctx.url("js/previa.js")}"></script>
` : null);

export default function rodape(dados, ctx) {
  const p = (n) => programa(ctx, n);
  return h`${rodapeDaLoja(dados, ctx)}${menu(dados, ctx)}${janelas(dados)}${blocoDoSite(dados, ctx)}${programaDaPrevia(ctx)}${p(1)}
${p(2)}
${p(3)}
${p(4)}${TELA_CHEIA}
${programas(ctx, 5, 9)}${videoDaMagda(ctx)}${programas(ctx, 10, 15)}${janelaDoCupom(dados)}${programas(ctx, 16, 25)}</body>
</html>
`;
}
