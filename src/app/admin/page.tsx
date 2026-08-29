import { cookies } from "next/headers";
import Link from "next/link";
import Header from "@/components/Header";
import AdminFolhetoPanel from "@/components/AdminFolhetoPanel";
import { checkFolhetoAvailability, type FolhetoSlug } from "@/lib/folhetos";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{
    erro?: string;
    tipo?: string;
  }>;
}) {
  const { erro, tipo } = await searchParams;
  const correct = process.env.FOLHETO_UPLOAD_PASSWORD;
  const cookieStore = await cookies();
  const authorized =
    !!correct && cookieStore.get("admin_access")?.value === correct;

  const hasFolheto: Record<FolhetoSlug, boolean> = authorized
    ? await checkFolhetoAvailability()
    : ({} as Record<FolhetoSlug, boolean>);

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
          <div>
            <h1 className="font-condensed text-3xl font-bold sm:text-4xl">
              Área restrita
            </h1>
            <p className="mt-2 text-(--color-text-muted)">
              Entre com a senha para gerenciar o Folheto do Dia.
            </p>
          </div>

          <form
            action="/api/admin/login"
            method="POST"
            className="grid w-full max-w-xs gap-3"
          >
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              required
              className="rounded-lg border border-(--color-border) bg-transparent px-4 py-3 text-center text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-teal)"
            />
            <button
              type="submit"
              className="rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
            >
              Entrar
            </button>
            {erro === "senha" && (
              <p className="text-sm text-(--color-gold)">Senha incorreta.</p>
            )}
          </form>

          <Link
            href="/"
            className="rounded-full border border-(--color-border) px-6 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header showLogout />
      <div className="flex flex-1 flex-col py-28">
        <AdminFolhetoPanel
          hasFolheto={hasFolheto}
          initialTipo={tipo}
          erro={erro}
        />
      </div>
    </div>
  );
}
