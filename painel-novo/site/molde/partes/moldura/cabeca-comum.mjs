// O trecho comum do <head> das páginas de verdade (a inicial, a /bio, a 404 e as páginas próprias das políticas): a
// confirmação do Google (Search Console), quando houver, e o programa de medição (js/rastreio.js: aviso de cookies,
// Pixel da Meta e Google Analytics, só depois do "Aceitar"). Os números vão em atributos data- do próprio <script>,
// porque a regra de segurança não deixa escrever programa dentro da página. Um lugar só: mudou aqui, muda em todas.
// Fica de fora: as páginas de passagem (/ir/, /loja/, ...), que só levam para a inicial (contar lá contaria a mesma
// visita duas vezes), e a prévia do painel (nunca carrega Meta nem Google, nem mostra o aviso). Função pura.
import { h } from "../../html.mjs";

// O formato de cada número (marca.json, "rastreio"). Vazio = desligado. Fora do formato, a montagem para (um número
// errado mediria nada, calado).
const FORMATOS = {
  "meta-pixel": [/^\d{10,20}$/, "só números"],
  "google-analytics": [/^G-[A-Z0-9]{6,15}$/, 'começa com "G-"'],
  "google-ads": [/^AW-\d{6,15}$/, 'começa com "AW-"'],
  "google-ads-rotulo-lead": [/^[A-Za-z0-9_-]{4,40}$/, "letras, números, _ e -"],
  "google-verificacao": [/^[A-Za-z0-9_-]{20,80}$/, "o código da meta google-site-verification"],
};

// Os números conferidos: { "meta-pixel": "...", ... } (vazio quando não há). Sem o objeto "rastreio": tudo vazio.
export function rastreioConferido(marca) {
  const r = marca?.rastreio ?? {};
  if (typeof r !== "object" || Array.isArray(r)) throw new Error("marca.json: \"rastreio\" precisa ser um objeto");
  const saida = {};
  for (const [campo, [formato, jeito]] of Object.entries(FORMATOS)) {
    const valor = r[campo] ?? "";
    if (typeof valor !== "string") throw new Error(`marca.json: rastreio.${campo} precisa ser texto`);
    const v = valor.trim();
    if (v && !formato.test(v)) throw new Error(`marca.json: rastreio.${campo} fora do formato (${jeito})`);
    saida[campo] = v;
  }
  for (const campo of Object.keys(r)) if (!Object.hasOwn(FORMATOS, campo)) throw new Error(`marca.json: rastreio.${campo} não existe`);
  if (saida["google-ads-rotulo-lead"] && !saida["google-ads"]) throw new Error("marca.json: rastreio.google-ads-rotulo-lead sem o google-ads");
  return saida;
}

export function cabecaComum(ctx, marca) {
  if (ctx?.previa) return null;
  const r = rastreioConferido(marca);
  const verificacao = r["google-verificacao"] ? h`<meta name="google-site-verification" content="${r["google-verificacao"]}">
` : null;
  const programa = r["meta-pixel"] || r["google-analytics"] || r["google-ads"]
    ? h`<script src="${ctx.url("js/rastreio.js")}" defer data-pixel="${r["meta-pixel"]}" data-ga="${r["google-analytics"]}" data-ads="${r["google-ads"]}" data-ads-lead="${r["google-ads-rotulo-lead"]}"></script>
`
    : null;
  return h`${verificacao}${programa}`;
}

// Se a página leva o programa da medição: só então o botão "Preferências de cookies" aparece (sem ele o botão não
// faria nada, como na prévia do painel ou com os números vazios).
export function medicaoLigada(ctx, marca) {
  if (ctx?.previa) return false;
  const r = rastreioConferido(marca);
  return Boolean(r["meta-pixel"] || r["google-analytics"] || r["google-ads"]);
}

export default cabecaComum;
