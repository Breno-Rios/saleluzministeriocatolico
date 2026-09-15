"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { db, hasDatabase } from "@/lib/db";
import { extrairYoutubeId, slugify } from "@/lib/musicas";

export type EstadoForm = { erro?: string; ok?: string };

async function autorizar(): Promise<string | null> {
  if (!(await isAdmin())) return "Sessão expirada. Entre novamente.";
  if (!hasDatabase()) return "Banco de dados não configurado (DATABASE_URL).";
  return null;
}

/**
 * O slug é a chave do link compartilhável (/musicas?musica=slug), então
 * precisa ser único. Duas músicas com o mesmo nome ganham sufixo numérico, e
 * uma música já salva mantém o slug que já circula por aí mesmo que o título
 * mude depois.
 */
async function slugDisponivel(titulo: string, idAtual: number | null) {
  const base = slugify(titulo) || "musica";
  const sql = db();
  const ocupados = new Set(
    (
      (await sql`
        select slug from musicas
        where slug = ${base} or slug like ${`${base}-%`}
      `) as { slug: string }[]
    ).map((linha) => linha.slug),
  );

  if (idAtual) {
    const [atual] = (await sql`
      select slug from musicas where id = ${idAtual}
    `) as { slug: string }[];
    if (atual && (atual.slug === base || atual.slug.startsWith(`${base}-`))) {
      return atual.slug;
    }
  }

  if (!ocupados.has(base)) return base;
  let n = 2;
  while (ocupados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function textoOuNulo(valor: FormDataEntryValue | null): string | null {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto === "" ? null : texto;
}

export async function salvarMusica(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const negado = await autorizar();
  if (negado) return { erro: negado };

  const id = Number(formData.get("id")) || null;
  const titulo = textoOuNulo(formData.get("titulo"));
  const youtubeId = extrairYoutubeId(String(formData.get("youtube") ?? ""));

  if (!titulo) return { erro: "Informe o título da música." };
  if (!youtubeId) {
    return { erro: "Link do YouTube inválido. Cole a URL do vídeo ou o ID." };
  }

  const generos = formData
    .getAll("generos")
    .map((valor) => Number(valor))
    .filter(Boolean);

  const dados = {
    titulo,
    youtubeId,
    imagemUrl: textoOuNulo(formData.get("imagem_url")),
    descricao: textoOuNulo(formData.get("descricao")),
    creditos: textoOuNulo(formData.get("creditos")),
    cifraUrl: textoOuNulo(formData.get("cifra_url")),
    ano: Number(formData.get("ano")) || null,
    publicada: formData.get("publicada") === "on",
    destaque: formData.get("destaque") === "on",
  };

  const sql = db();
  const slug = await slugDisponivel(titulo, id);

  let musicaId: number;
  try {
    // Só uma música ocupa o topo: marcar esta desmarca a anterior. A limpeza
    // vem antes da gravação para o banco nunca passar por um instante com
    // dois destaques.
    if (dados.destaque) {
      await sql`update musicas set destaque = false where destaque`;
    }

    if (id) {
      await sql`
        update musicas set
          slug = ${slug},
          titulo = ${dados.titulo},
          youtube_id = ${dados.youtubeId},
          imagem_url = ${dados.imagemUrl},
          descricao = ${dados.descricao},
          creditos = ${dados.creditos},
          cifra_url = ${dados.cifraUrl},
          ano = ${dados.ano},
          publicada = ${dados.publicada},
          destaque = ${dados.destaque},
          atualizado_em = now()
        where id = ${id}
      `;
      musicaId = id;
    } else {
      const [criada] = (await sql`
        insert into musicas
          (slug, titulo, youtube_id, imagem_url, descricao, creditos, cifra_url,
           ano, publicada, destaque)
        values
          (${slug}, ${dados.titulo}, ${dados.youtubeId}, ${dados.imagemUrl},
           ${dados.descricao}, ${dados.creditos}, ${dados.cifraUrl}, ${dados.ano},
           ${dados.publicada}, ${dados.destaque})
        returning id
      `) as { id: number }[];
      musicaId = criada.id;
    }

    // Regravar a lista inteira é mais simples - e mais seguro - do que
    // calcular o que entrou e o que saiu a cada edição.
    await sql`delete from musica_generos where musica_id = ${musicaId}`;
    if (generos.length > 0) {
      await sql.transaction(
        generos.map(
          (generoId, indice) => sql`
            insert into musica_generos (musica_id, genero_id, ordem)
            values (${musicaId}, ${generoId}, ${indice})
          `,
        ),
      );
    }
  } catch (erro) {
    console.error("Falha ao salvar música", erro);
    return { erro: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/musicas");
  revalidatePath("/admin/musicas");
  return { ok: id ? "Música atualizada." : "Música cadastrada." };
}

export async function excluirMusica(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const negado = await autorizar();
  if (negado) return { erro: negado };

  const id = Number(formData.get("id"));
  if (!id) return { erro: "Música não encontrada." };

  // musica_generos tem on delete cascade, então a ligação some junto.
  await db()`delete from musicas where id = ${id}`;

  revalidatePath("/musicas");
  revalidatePath("/admin/musicas");
  return { ok: "Música excluída." };
}

export async function salvarGenero(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const negado = await autorizar();
  if (negado) return { erro: negado };

  const id = Number(formData.get("id")) || null;
  const nome = textoOuNulo(formData.get("nome"));
  if (!nome) return { erro: "Informe o nome do gênero." };

  // A ordem decide a posição da prateleira na página; o padrão joga o gênero
  // novo para o fim da fila.
  const ordem = Number(formData.get("ordem")) || 999;
  const sql = db();

  try {
    if (id) {
      await sql`update generos set nome = ${nome}, ordem = ${ordem} where id = ${id}`;
    } else {
      await sql`
        insert into generos (slug, nome, ordem)
        values (${slugify(nome)}, ${nome}, ${ordem})
        on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem
      `;
    }
  } catch (erro) {
    console.error("Falha ao salvar gênero", erro);
    return { erro: "Não foi possível salvar o gênero." };
  }

  revalidatePath("/musicas");
  revalidatePath("/admin/musicas");
  return { ok: id ? "Gênero atualizado." : "Gênero criado." };
}

export async function excluirGenero(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const negado = await autorizar();
  if (negado) return { erro: negado };

  const id = Number(formData.get("id"));
  if (!id) return { erro: "Gênero não encontrado." };

  // As músicas continuam cadastradas; só deixam de aparecer nesta prateleira.
  await db()`delete from generos where id = ${id}`;

  revalidatePath("/musicas");
  revalidatePath("/admin/musicas");
  return { ok: "Gênero excluído." };
}
