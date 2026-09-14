import type { Musica } from "./musicas";

/**
 * Busca por relevância sobre o catálogo carregado na página - não há ida ao
 * banco a cada tecla. O catálogo é de dezenas de músicas, então pontuar todas
 * a cada caractere é barato e dá resultado instantâneo.
 */

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Onde o termo aparece importa mais do que quantas vezes: bater no título vale
// muito mais do que bater no meio da descrição.
const PESO = { titulo: 10, generos: 4, creditos: 2, descricao: 1 };

function inicioDePalavra(alvo: string, pos: number): boolean {
  return pos === 0 || !/[a-z0-9]/.test(alvo[pos - 1]);
}

/**
 * Casa os caracteres do termo na ordem, mesmo separados ("comnh" acha
 * "comunhão"). É o que salva quem digita pela metade, mas solto demais ele
 * casa com quase tudo: em textos longos, 3 ou 4 letras quaisquer aparecem em
 * ordem em qualquer frase. Daí as duas travas - termo curto não vale fuzzy, e
 * as letras precisam estar num trecho curto, não espalhadas pela frase inteira.
 */
const MIN_FUZZY = 4;

function subsequenciaCompacta(alvo: string, termo: string): boolean {
  if (termo.length < MIN_FUZZY) return false;
  const limite = termo.length * 2;

  for (let inicio = 0; inicio <= alvo.length - termo.length; inicio++) {
    if (alvo[inicio] !== termo[0]) continue;

    let casadas = 1;
    let fim = inicio + 1;
    while (fim < alvo.length && casadas < termo.length && fim - inicio < limite) {
      if (alvo[fim] === termo[casadas]) casadas++;
      fim++;
    }
    if (casadas === termo.length) return true;
  }

  return false;
}

function pontuarTexto(
  alvo: string,
  termo: string,
  peso: number,
  // O fuzzy só vale em campos curtos (título e gênero). Liberado na descrição,
  // ele transformava qualquer busca de 3 letras em "achei 55 das 72 músicas".
  fuzzy: boolean,
): number {
  if (!alvo) return 0;
  if (alvo === termo) return peso * 12;

  const pos = alvo.indexOf(termo);
  if (pos === 0) return peso * 8;
  if (pos > 0) return peso * (inicioDePalavra(alvo, pos) ? 6 : 3);

  return fuzzy && subsequenciaCompacta(alvo, termo) ? peso : 0;
}

function campos(musica: Musica) {
  return [
    { texto: normalizar(musica.titulo), peso: PESO.titulo, fuzzy: true },
    {
      texto: normalizar(musica.generos.map((g) => g.nome).join(" ")),
      // Nome de gênero é curto como título, então o fuzzy aqui não corre o
      // risco de casar letras espalhadas: "comnh" precisa achar Comunhão.
      peso: PESO.generos,
      fuzzy: true,
    },
    { texto: normalizar(musica.creditos ?? ""), peso: PESO.creditos, fuzzy: false },
    { texto: normalizar(musica.descricao ?? ""), peso: PESO.descricao, fuzzy: false },
  ];
}

/**
 * Pontua uma música contra os termos digitados. Todo termo precisa casar em
 * algum campo - digitar "ave maria" não pode trazer tudo que tem "maria" -, e
 * de cada termo conta só o melhor campo, para uma palavra repetida na descrição
 * não inflar a nota.
 */
export function pontuar(musica: Musica, termos: string[]): number {
  if (termos.length === 0) return 1;

  const alvos = campos(musica);
  let total = 0;

  for (const termo of termos) {
    let melhor = 0;
    for (const alvo of alvos) {
      melhor = Math.max(
        melhor,
        pontuarTexto(alvo.texto, termo, alvo.peso, alvo.fuzzy),
      );
    }
    if (melhor === 0) return 0;
    total += melhor;
  }

  return total;
}

export function termosDaConsulta(consulta: string): string[] {
  return normalizar(consulta).split(/\s+/).filter(Boolean);
}

/** Filtra por gênero e ordena por relevância; empate volta para o alfabeto. */
export function buscar(
  musicas: Musica[],
  consulta: string,
  generoSlug: string | null,
): Musica[] {
  const termos = termosDaConsulta(consulta);

  return musicas
    .filter(
      (musica) =>
        !generoSlug || musica.generos.some((g) => g.slug === generoSlug),
    )
    .map((musica) => ({ musica, nota: pontuar(musica, termos) }))
    .filter((item) => item.nota > 0)
    .sort(
      (a, b) =>
        b.nota - a.nota || a.musica.titulo.localeCompare(b.musica.titulo, "pt"),
    )
    .map((item) => item.musica);
}
