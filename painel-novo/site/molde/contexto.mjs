// O "contexto" que toda parte do molde recebe junto com os dados: o relógio, o modo (espelho ou nível 2, prévia do
// painel) e o endereço publicado de cada arquivo. Funções puras (Node e navegador).

// nomes: { "js/bloco-01.js": "/arquivos/js/bloco-01-4d1c8e93f2.js", ... } (gerado pelo montador em molde/arquivos.mjs)
export function criarContexto({ nivel = 2, agora, previa = false, foco = "", nomes = {}, urlDaPrevia = null } = {}) {
  if (!(agora instanceof Date) || Number.isNaN(agora.getTime())) throw new Error("molde: o contexto precisa do relógio (agora)");
  return {
    nivel,
    agora,
    previa,
    foco,
    // Endereço publicado: os programas e o estilo pelo nome com impressão digital; foto e vídeo do painel
    // ("foto:..." e "video:...") pelo que a prévia ou o montador disserem; o resto (já começando com "/") igual.
    url(caminho) {
      if (nomes[caminho]) return nomes[caminho];
      if (/^(foto|video):/.test(caminho)) {
        if (urlDaPrevia) return urlDaPrevia(caminho);
        const [tipo, arquivo] = caminho.split(":");
        return (tipo === "foto" ? "/fotos-painel/" : "/videos-painel/") + arquivo;
      }
      if (caminho.startsWith("/")) return caminho;
      throw new Error(`molde: não sei o endereço de "${caminho}"`);
    },
    // No espelho (nível 1), onde o site de hoje escreve o endereço sem a "/" do começo (as fotos em "arquivos/...").
    // No nível 2, todo endereço começa com "/" (a prévia do painel precisa disso).
    rel(endereco) {
      return nivel === 1 ? String(endereco).replace(/^\//, "") : String(endereco);
    },
  };
}
