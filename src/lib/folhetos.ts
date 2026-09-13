import { list } from "@vercel/blob";

export const FOLHETOS = [
  { slug: "missa", label: "Folheto da Missa", prefix: "folheto-missa" },
  { slug: "cantos", label: "Folheto de Cantos", prefix: "folheto-do-dia" },
] as const;

export type FolhetoSlug = (typeof FOLHETOS)[number]["slug"];

export type FolhetoUrls = Partial<Record<FolhetoSlug, string>>;

export const DEFAULT_FOLHETO_SLUG: FolhetoSlug = "cantos";

export function isFolhetoSlug(value: unknown): value is FolhetoSlug {
  return FOLHETOS.some((f) => f.slug === value);
}

export function prefixForSlug(slug: FolhetoSlug): string {
  return FOLHETOS.find((f) => f.slug === slug)!.prefix;
}

/**
 * URL pública do PDF de cada folheto, ou ausente quando ainda não há upload.
 *
 * Cada `list()` é uma Advanced Operation no Blob, e a cota do plano free é de
 * 2.000/mês - por isso quem chama isto deve ser sempre uma página estática ou
 * revalidada, nunca uma rota por request. Com a URL embutida no HTML, o
 * navegador busca o PDF direto do store e o visitante não custa operação
 * nenhuma. O sufixo aleatório do upload garante URL nova a cada publicação,
 * então o cache de um mês do blob nunca entrega folheto vencido.
 */
export async function fetchFolhetoUrls(): Promise<FolhetoUrls> {
  const urls: FolhetoUrls = {};

  if (!process.env.BLOB_READ_WRITE_TOKEN) return urls;

  for (const folheto of FOLHETOS) {
    try {
      const { blobs } = await list({ prefix: folheto.prefix });
      if (blobs.length === 0) continue;
      // Só o mais recente interessa; o upload apaga os anteriores, mas uma
      // publicação interrompida no meio pode deixar sobra para trás.
      const latest = blobs.reduce((newest, blob) =>
        blob.uploadedAt > newest.uploadedAt ? blob : newest,
      );
      urls[folheto.slug] = latest.url;
    } catch {
      // Store fora do ar ou cota estourada: a home sai sem a seção do folheto
      // em vez de derrubar o build inteiro.
    }
  }

  return urls;
}
