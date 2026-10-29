// O texto alternativo das fotos de produto (o que o leitor de tela fala e o Google lê no lugar da foto). Fica sozinho,
// sem importar nada, para qualquer parte do molde poder usar sem dar volta nas importações. Função pura.

// "Gloss Matizado 1 L" -> "Gloss Matizado 1 L Brumar Cosméticos" (o nome do produto e o da loja, do marca.json). Nome
// que já cita a marca ("Gloss Brumar Matizado") fica como está.
export function textoDaFoto(dados, nome) {
  const loja = String(dados.marca?.nome ?? "").trim();
  const n = String(nome ?? "").trim();
  if (!n) throw new Error("molde: foto de produto sem nome para o texto alternativo");
  const marca = loja.split(/\s+/)[0];
  return loja && !n.toLowerCase().includes(marca.toLowerCase()) ? `${n} ${loja}` : n;
}
