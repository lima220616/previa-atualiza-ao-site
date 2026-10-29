// "Ofertas no seu WhatsApp": o cabeçalho do inicial.json; o formulário (Netlify Forms, com a autorização) é parte
// fixa, com o nome da marca e o número do WhatsApp do marca.json. O programa (bloco-15) manda também para /api/lead.
import { h } from "../../html.mjs";
import { dadosDe, numeroEscrito } from "./comum.mjs";

export default function receberWhatsapp(dados) {
  const d = dadosDe(dados, "inicial")["receber-whatsapp"];
  const { marca } = dados;
  return h`<section id="receber-whatsapp">
<div class="wrap" style="max-width:720px">
<div class="wz">
<div class="wz-h"><span class="ib"><svg class="i"><use href="#i-chat"/></svg></span><div><span class="eyebrow" style="margin:0">${d.chamada}</span><h2>${d.titulo}</h2><p>${d.texto}</p></div></div>
<form class="wz-f" id="wz-f" name="whatsapp-ofertas" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
<input type="hidden" name="form-name" value="whatsapp-ofertas"><input type="hidden" name="origem" value="ofertas">
<p class="wz-hp" hidden><label>Não preencha este campo: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<label class="wz-l">Seu nome<input type="text" name="nome" id="wz-nome" autocomplete="given-name" placeholder="Como podemos te chamar?" maxlength="60" required></label>
<label class="wz-l">Seu e-mail<input type="email" name="email" id="wz-email" autocomplete="email" inputmode="email" placeholder="seuemail@exemplo.com" maxlength="120" required></label>
<label class="wz-l">Seu WhatsApp com DDD<input type="tel" name="whatsapp" id="wz-tel" inputmode="numeric" autocomplete="tel-national" placeholder="(64) 99999-9999" maxlength="30" required></label>
<label class="wz-c"><input type="checkbox" name="autorizacao" id="wz-ok" value="sim" required><span>Autorizo a ${marca.nome} a me enviar promoções, cupons e novidades pelo WhatsApp e por e-mail. Posso cancelar quando quiser, respondendo SAIR. Veja a <a href="#p-politicas">Política de Privacidade</a>.</span></label>
<p class="wz-err" id="wz-err" role="alert"></p>
<button type="submit" class="btn wz-b">Quero receber no meu WhatsApp</button>
</form>
<div class="wz-ok" id="wz-done" hidden><span class="ib"><svg class="i"><use href="#i-check"/></svg></span><p><b>Pronto, <span id="wz-n"></span>!</b> Você vai receber as ofertas da Brumar no seu WhatsApp. Salve o nosso número ${numeroEscrito(marca)} para não perder nenhuma mensagem.</p></div>
</div>
</div>
</section>

`;
}
