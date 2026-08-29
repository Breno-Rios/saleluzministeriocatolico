import Image from "next/image";

export default async function EmBreve({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Image
        src="/images/logo-circle.jpg"
        alt="Logo Banda Sal & Luz"
        width={96}
        height={96}
        className="rounded-full"
        priority
      />
      <div>
        <h1 className="font-condensed text-3xl font-bold sm:text-4xl">
          Em breve
        </h1>
        <p className="mt-2 text-(--color-text-muted)">
          Estamos preparando o novo site da Banda Sal &amp; Luz.
        </p>
      </div>

      <form
        action="/api/unlock"
        method="POST"
        className="grid w-full max-w-xs gap-3"
      >
        <input
          type="password"
          name="senha"
          placeholder="Senha de acesso"
          required
          className="rounded-lg border border-(--color-border) bg-transparent px-4 py-3 text-center text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-teal)"
        />
        <button
          type="submit"
          className="rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
        >
          Entrar
        </button>
        {erro && (
          <p className="text-sm text-(--color-gold)">Senha incorreta.</p>
        )}
      </form>
    </div>
  );
}
