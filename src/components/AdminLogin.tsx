"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MENSAGENS: Record<string, string> = {
  "sem-permissao": "Esta conta Google não tem acesso ao painel.",
  "token-invalido": "Não foi possível validar o login. Tente novamente.",
  "token-ausente": "Não foi possível validar o login. Tente novamente.",
  "login-indisponivel": "O login com Google não está configurado neste ambiente.",
  "sessao-indisponivel": "O servidor não conseguiu abrir a sessão. Avise quem cuida do site.",
  rede: "Sem conexão com o servidor. Tente novamente.",
};

export default function AdminLogin({
  clientId,
  loginDeDesenvolvimento,
}: {
  clientId?: string;
  loginDeDesenvolvimento: boolean;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar(rota: string, corpo?: unknown) {
    setEntrando(true);
    setErro(null);
    try {
      const resposta = await fetch(rota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo ?? {}),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(MENSAGENS[dados.erro] ?? MENSAGENS["token-invalido"]);
        return;
      }

      // O cookie já veio na resposta; refresh() faz o servidor renderizar a
      // página de novo, agora do lado autorizado.
      router.refresh();
    } catch {
      setErro(MENSAGENS.rede);
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="grid w-full max-w-xs justify-items-center gap-4">
      {clientId ? (
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={(resposta) =>
              entrar("/api/admin/google", { credential: resposta.credential })
            }
            onError={() => setErro(MENSAGENS["token-invalido"])}
            theme="filled_black"
            shape="pill"
            text="signin_with"
          />
        </GoogleOAuthProvider>
      ) : loginDeDesenvolvimento ? (
        <>
          <button
            type="button"
            disabled={entrando}
            onClick={() => entrar("/api/admin/dev-login")}
            className="w-full rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong) disabled:opacity-60"
          >
            {entrando ? "Entrando..." : "Entrar como administrador (dev)"}
          </button>
          <p className="text-xs text-(--color-text-muted)">
            Atalho de desenvolvimento, sem Google. Não existe em produção.
          </p>
        </>
      ) : (
        <p className="text-sm text-(--color-text-muted)">
          O login com Google ainda não foi configurado neste ambiente.
        </p>
      )}

      {erro && <p className="text-sm text-(--color-gold)">{erro}</p>}
    </div>
  );
}
