// Contas de preço e de nota do site, iguais às do site de hoje (o gerador em Python e os programas da página).
// Funções puras, sem nada de fora: rodam igual no montador (Node) e na prévia do painel (navegador).
// Preço em reais, como no data-price de hoje (290, 57.8, 414.9). O Pix não fica gravado nos dados: é sempre conta.

// Centavo arredondado para cima a partir de meio (como a tabela oficial: 1.014,90 × 0,95 = 964,16).
// Mesma conta, na mesma ordem, do reais() do gerador de hoje: o resultado sai igual até no último bit.
export function arredondarCentavo(valor) {
  return Math.floor(valor * 100 + 0.5 + 1e-6) / 100;
}

// "R$ 1.234,56"
export function formatarReais(valor) {
  const [inteiro, centavos] = arredondarCentavo(valor).toFixed(2).split(".");
  return "R$ " + inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + centavos;
}

// Pix com 5% de desconto sobre o preço "por".
export function precoPix(preco) {
  return arredondarCentavo(preco * 0.95);
}

// Parcela sem juros (o site mostra 3x).
export function precoParcela(preco, vezes = 3) {
  return arredondarCentavo(preco / vezes);
}

// % OFF arredondado para baixo.
export function descontoPorcento(de, por) {
  return Math.floor((1 - por / de) * 100 + 1e-9);
}

export function economia(de, por) {
  return arredondarCentavo(de - por);
}

// Os textos de um preço, como o gerador de hoje: por, Pix e 3x; com o preço "de", também de, % OFF e economia.
export function textosDoPreco(de, por) {
  const textos = { por: formatarReais(por), pix: formatarReais(por * 0.95), "3x": formatarReais(por / 3) };
  if (de) Object.assign(textos, { de: formatarReais(de), off: `${descontoPorcento(de, por)}% OFF`, econ: formatarReais(de - por) });
  return textos;
}

// Número com N casas exatamente como o Python escreve (f"{x:.1f}"): pelo valor exato guardado no computador e, no
// meio exato, para o par (4,25 vira 4,2). O toFixed do JavaScript sobe no meio (4,25 vira 4,3): por isso esta função.
export function formatarComoPython(x, casas) {
  if (!Number.isFinite(x)) throw new Error(`número inválido: ${x}`);
  const memoria = new DataView(new ArrayBuffer(8));
  memoria.setFloat64(0, Math.abs(x));
  const bits = memoria.getBigUint64(0);
  const expoente = Number((bits >> 52n) & 0x7ffn);
  let mantissa = bits & ((1n << 52n) - 1n);
  let e = -1074;
  if (expoente !== 0) { mantissa |= 1n << 52n; e = expoente - 1075; }
  let numerador = mantissa * 10n ** BigInt(casas);
  let denominador = 1n;
  if (e >= 0) numerador <<= BigInt(e); else denominador <<= BigInt(-e);
  let q = numerador / denominador;
  const resto = numerador % denominador;
  if (2n * resto > denominador || (2n * resto === denominador && q % 2n === 1n)) q += 1n;
  const digitos = q.toString().padStart(casas + 1, "0");
  const texto = casas ? `${digitos.slice(0, -casas)}.${digitos.slice(-casas)}` : digitos;
  return (x < 0 || Object.is(x, -0) ? "-" : "") + texto;
}

// Avaliações que aparecem: sem as escondidas e sem texto repetido (fica a primeira), como no site de hoje.
export function avaliacoesVisiveis(lista) {
  const vistos = new Set();
  const visiveis = [];
  for (const a of lista) {
    if (a.oculta || vistos.has(a.texto)) continue;
    vistos.add(a.texto);
    visiveis.push(a);
  }
  return visiveis;
}

// Nota com 1 casa ("5,0") e quantidade de um grupo de avaliações.
export function resumoDasNotas(grupo) {
  if (!grupo.length) return { nota: "", quantidade: 0 };
  const soma = grupo.reduce((total, a) => total + a.nota, 0);
  return { nota: formatarComoPython(soma / grupo.length, 1).replace(".", ","), quantidade: grupo.length };
}
