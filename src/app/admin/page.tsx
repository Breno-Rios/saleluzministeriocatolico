import Link from "next/link";
import Header from "@/components/Header";
import AdminFolhetoPanel from "@/components/AdminFolhetoPanel";
import AdminLogin from "@/components/AdminLogin";
import { isAdmin, loginDeDesenvolvimento } from "@/lib/admin-auth";
import { fetchFolhetoUrls, type FolhetoUrls } from "@/lib/folhetos";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{
    erro?: string;
    tipo?: string;
  }>;
}) {
  const { erro, tipo } = await searchParams;
  const authorized = await isAdmin();

  const folhetoUrls: FolhetoUrls = authorized ? await fetchFolhetoUrls() : {};

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
              Entre com sua conta Google para gerenciar o site.
            </p>
          </div>

          {erro === "sessao" && (
            <p className="text-sm text-(--color-gold)">
              Sua sessão expirou. Entre novamente.
            </p>
          )}

          <AdminLogin
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
            loginDeDesenvolvimento={loginDeDesenvolvimento()}
          />

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
          folhetoUrls={folhetoUrls}
          initialTipo={tipo}
          erro={erro}
        />
      </div>
    </div>
  );
}
