import { db, hasDatabase } from "@/lib/db";

export type Genero = {
  id: number;
  slug: string;
  nome: string;
  ordem: number;
};

export type Musica = {
  id: number;
  slug: string;
  titulo: string;
  youtubeId: string;
  imagemUrl: string | null;
  descricao: string | null;
  creditos: string | null;
  cifraUrl: string | null;
  /**
   * Texto da cifra. Só vem preenchido no painel do admin: na listagem pública
   * viajaria para todo visitante dentro do payload da página, e alguns KB por
   * música multiplicados pelo catálogo inteiro pesariam em quem nunca vai abrir
   * uma cifra. Lá a página usa `temCifra` e busca o texto ao clicar.
   */
  cifra: string | null;
  temCifra: boolean;
  ano: number | null;
  publicada: boolean;
  /** Ocupa o topo de /musicas; no máximo uma música por vez. */
  destaque: boolean;
  /** Prateleiras em que a música aparece, na ordem em que a página as exibe. */
  generos: { slug: string; nome: string }[];
};

/** Uma linha do catálogo: o gênero e as músicas que aparecem nele. */
export type Prateleira = {
  genero: Genero;
  musicas: Musica[];
};

/**
 * Capa do card. Sem imagem própria cadastrada, vale a capa do próprio vídeo:
 * hqdefault é a única resolução que o YouTube garante para todo vídeo - as
 * maiores (maxresdefault) faltam em vídeos antigos e voltariam 404.
 */
export function capaDaMusica(musica: Musica): string {
  return (
    musica.imagemUrl ?? `https://i.ytimg.com/vi/${musica.youtubeId}/hqdefault.jpg`
  );
}

/**
 * O otimizador de imagens do Next só aceita hosts declarados em
 * next.config.ts. A capa do YouTube está lá, mas a imagem própria é uma URL
 * livre digitada no painel - e um host não declarado viraria erro 400 no lugar
 * da capa. Nesse caso a imagem sai direto da origem, sem otimização.
 */
export function capaOtimizavel(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "i.ytimg.com" ||
      hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function urlDoVideo(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/**
 * Aceita tanto o ID cru quanto qualquer formato de link que o YouTube gera
 * (watch, youtu.be, embed, shorts), porque quem cadastra vem do botão de
 * compartilhar do YouTube, não da barra de endereço.
 */
export function extrairYoutubeId(entrada: string): string | null {
  const texto = entrada.trim();
  if (/^[\w-]{11}$/.test(texto)) return texto;

  try {
    const url = new URL(texto);
    const v = url.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const segmento = url.pathname.split("/").filter(Boolean).pop();
    if (segmento && /^[\w-]{11}$/.test(segmento)) return segmento;
  } catch {
    // Não é URL; cai no null abaixo.
  }

  return null;
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type LinhaMusica = {
  id: number;
  slug: string;
  titulo: string;
  youtube_id: string;
  imagem_url: string | null;
  descricao: string | null;
  creditos: string | null;
  cifra_url: string | null;
  tem_cifra: boolean;
  ano: number | null;
  destaque: boolean;
};

type LinhaPrateleira = LinhaMusica & {
  genero_id: number;
  genero_slug: string;
  genero_nome: string;
  genero_ordem: number;
};

/**
 * O catálogo publicado, agrupado em prateleiras na ordem em que a página as
 * exibe. Uma música que está em dois gêneros volta em duas linhas - o catálogo
 * é curado na mão e pequeno, então repetir sai mais barato que um agregado.
 */
export async function fetchPrateleiras(): Promise<Prateleira[]> {
  if (!hasDatabase()) return [];

  let linhas: LinhaPrateleira[];
  try {
    linhas = (await db()`
      select g.id as genero_id, g.slug as genero_slug, g.nome as genero_nome,
             g.ordem as genero_ordem,
             m.id, m.slug, m.titulo, m.youtube_id, m.imagem_url, m.descricao,
             m.creditos, m.cifra_url, (m.cifra is not null) as tem_cifra,
             m.ano, m.destaque
      from generos g
      join musica_generos mg on mg.genero_id = g.id
      join musicas m on m.id = mg.musica_id and m.publicada
      order by g.ordem, g.nome, mg.ordem, m.titulo
    `) as LinhaPrateleira[];
  } catch {
    // Banco fora do ar não derruba a página: ela sai com o estado vazio, como
    // a home já faz quando o Blob falha.
    return [];
  }

  // Os gêneros de cada música saem das próprias linhas, que já vêm ordenadas
  // por gênero - assim o detalhe mostra "Entrada · Comunhão" sem uma segunda
  // ida ao banco.
  const generosPorMusica = new Map<number, { slug: string; nome: string }[]>();
  for (const linha of linhas) {
    const atual = generosPorMusica.get(linha.id) ?? [];
    atual.push({ slug: linha.genero_slug, nome: linha.genero_nome });
    generosPorMusica.set(linha.id, atual);
  }

  const prateleiras = new Map<string, Prateleira>();
  for (const linha of linhas) {
    let prateleira = prateleiras.get(linha.genero_slug);
    if (!prateleira) {
      prateleira = {
        genero: {
          id: linha.genero_id,
          slug: linha.genero_slug,
          nome: linha.genero_nome,
          ordem: linha.genero_ordem,
        },
        musicas: [],
      };
      prateleiras.set(linha.genero_slug, prateleira);
    }

    prateleira.musicas.push({
      id: linha.id,
      slug: linha.slug,
      titulo: linha.titulo,
      youtubeId: linha.youtube_id,
      imagemUrl: linha.imagem_url,
      descricao: linha.descricao,
      creditos: linha.creditos,
      cifraUrl: linha.cifra_url,
      cifra: null,
      temCifra: linha.tem_cifra,
      ano: linha.ano,
      publicada: true,
      destaque: linha.destaque,
      generos: generosPorMusica.get(linha.id) ?? [],
    });
  }

  return [...prateleiras.values()];
}

export async function fetchGeneros(): Promise<Genero[]> {
  if (!hasDatabase()) return [];
  return (await db()`
    select id, slug, nome, ordem from generos order by ordem, nome
  `) as Genero[];
}

/** Todas as músicas, publicadas ou não: a visão do painel do admin. */
export async function fetchMusicas(): Promise<Musica[]> {
  if (!hasDatabase()) return [];

  const linhas = (await db()`
    select m.id, m.slug, m.titulo, m.youtube_id, m.imagem_url, m.descricao,
           m.creditos, m.cifra_url, m.cifra, m.ano, m.destaque, m.publicada,
           coalesce(
             json_agg(json_build_object('slug', g.slug, 'nome', g.nome)
                      order by g.ordem, g.nome)
               filter (where g.id is not null),
             '[]'
           ) as generos
    from musicas m
    left join musica_generos mg on mg.musica_id = m.id
    left join generos g on g.id = mg.genero_id
    group by m.id
    order by m.titulo
  `) as (Omit<LinhaMusica, "tem_cifra"> & {
    cifra: string | null;
    publicada: boolean;
    generos: { slug: string; nome: string }[];
  })[];

  return linhas.map((linha) => ({
    id: linha.id,
    slug: linha.slug,
    titulo: linha.titulo,
    youtubeId: linha.youtube_id,
    imagemUrl: linha.imagem_url,
    descricao: linha.descricao,
    creditos: linha.creditos,
    cifraUrl: linha.cifra_url,
    cifra: linha.cifra,
    temCifra: !!linha.cifra,
    ano: linha.ano,
    publicada: linha.publicada,
    destaque: linha.destaque,
    generos: linha.generos,
  }));
}
