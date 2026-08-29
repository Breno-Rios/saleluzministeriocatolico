import { list } from "@vercel/blob";

export const FOLHETOS = [
  { slug: "missa", label: "Folheto da Missa", prefix: "folheto-missa" },
  { slug: "cantos", label: "Folheto de Cantos", prefix: "folheto-do-dia" },
] as const;

export type FolhetoSlug = (typeof FOLHETOS)[number]["slug"];

export const DEFAULT_FOLHETO_SLUG: FolhetoSlug = "cantos";

export function isFolhetoSlug(value: unknown): value is FolhetoSlug {
  return FOLHETOS.some((f) => f.slug === value);
}

export function prefixForSlug(slug: FolhetoSlug): string {
  return FOLHETOS.find((f) => f.slug === slug)!.prefix;
}

export async function checkFolhetoAvailability(): Promise<
  Record<FolhetoSlug, boolean>
> {
  const availability = {} as Record<FolhetoSlug, boolean>;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const folheto of FOLHETOS) availability[folheto.slug] = false;
    return availability;
  }

  for (const folheto of FOLHETOS) {
    const { blobs } = await list({ prefix: folheto.prefix });
    availability[folheto.slug] = blobs.length > 0;
  }

  return availability;
}
