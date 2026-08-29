import LaunchCountdown from "@/components/LaunchCountdown";
import Image from "next/image";

export default async function EmBreve({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const launchAt = process.env.SITE_LAUNCH_AT
    ? new Date(process.env.SITE_LAUNCH_AT).getTime()
    : null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-6 py-16 text-center"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, var(--color-bg-alt-2), var(--color-bg-alt) 45%, var(--color-bg) 85%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <Image
          src="/images/logo-mark.svg"
          alt=""
          width={900}
          height={900}
          className="h-auto w-[110vw] max-w-[820px] opacity-[0.1] sm:w-[55vw]"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
        <div>
          <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-5xl">
            Em breve
          </h1>
          <p className="mt-3 max-w-sm text-(--color-text-muted)">
            Estamos preparando o novo site da Banda Sal &amp; Luz.
          </p>
        </div>

        {launchAt && <LaunchCountdown launchAt={launchAt} />}

        <details className="group">
          <summary className="cursor-pointer list-none text-xs font-medium uppercase tracking-widest text-(--color-text-muted) transition-colors hover:text-(--color-gold) [&::-webkit-details-marker]:hidden">
            Acesso antecipado
          </summary>

          <form
            action="/api/unlock"
            method="POST"
            className="mt-4 grid w-full max-w-xs gap-3"
          >
            <input
              type="password"
              name="senha"
              placeholder="Senha de acesso"
              required
              className="rounded-lg border border-(--color-border) bg-transparent px-4 py-3 text-center text-sm text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-teal)"
            />
            <button
              type="submit"
              className="rounded-full border border-(--color-border) px-6 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              Entrar
            </button>
            {erro && (
              <p className="text-sm text-(--color-gold)">Senha incorreta.</p>
            )}
          </form>
        </details>
      </div>

      <div className="relative z-10 -mt-4 mb-8 flex flex-col items-center gap-6 md:-mt-6">
        <div className="flex flex-col items-center gap-2">
          <p className="font-sans text-4xl font-bold tracking-tight sm:text-6xl">
            BANDA SAL &amp; LUZ
          </p>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-(--color-teal-strong)">
            Ministério Católico
          </p>
        </div>
        <blockquote className="max-w-xl text-balance text-lg text-(--color-text-muted) sm:text-xl">
          &ldquo;Vós sois o sal da terra. Vós sois a luz do mundo.&rdquo;
          <footer className="mt-2 text-sm text-(--color-text-muted)/80">
            Mateus 5, 13-14
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
