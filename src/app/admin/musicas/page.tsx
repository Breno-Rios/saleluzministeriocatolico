import { redirect } from "next/navigation";
import AdminMusicasPanel from "@/components/AdminMusicasPanel";
import Header from "@/components/Header";
import { isAdmin } from "@/lib/admin-auth";
import { hasDatabase } from "@/lib/db";
import { fetchGeneros, fetchMusicas } from "@/lib/musicas";

export default async function AdminMusicas() {
  // Sem sessão não há o que mostrar aqui: o formulário de senha mora no /admin.
  if (!(await isAdmin())) redirect("/admin");

  const [musicas, generos] = await Promise.all([fetchMusicas(), fetchGeneros()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header showLogout />
      <div className="flex flex-1 flex-col py-28">
        {hasDatabase() ? (
          <AdminMusicasPanel musicas={musicas} generos={generos} />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
            <p className="font-condensed text-xl font-bold text-(--color-gold)">
              Banco não configurado
            </p>
            <p className="mt-2 text-sm text-(--color-text-muted)">
              Defina DATABASE_URL e rode <code>npm run db:migrate</code> para
              habilitar o catálogo de músicas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
