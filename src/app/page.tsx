import Image from "next/image";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import FolhetoSection from "@/components/FolhetoSection";
import { FOLHETOS, checkFolhetoAvailability } from "@/lib/folhetos";

const LANCAMENTO_YOUTUBE_ID = "niQTKVqYXLs";

const HISTORY_TIMELINE = [
  {
    year: "2018",
    text: "Nascemos em agosto, na Paróquia Nossa Senhora Aparecida, na Ilha do Governador. Um grupo em preparação para a Crisma iniciou seu estágio pastoral no ministério de música. Assim nasceu a Sal & Luz.",
  },
  {
    year: "2022",
    text: "Passamos a nos dedicar a estudar com mais profundidade a música litúrgica. Buscamos cantar a Liturgia com cuidado e sensibilidade pastoral. Nosso propósito é um só: elevar almas a Deus.",
  },
  {
    year: "2024",
    text: "Passamos a integrar o corpo de músicos da Paróquia Sagrada Família, na Ribeira, Ilha do Governador.",
  },
];

const SYMBOLS = [
  {
    title: "Cruz",
    image: "/images/symbol-cruz.jpg",
    text: "A cruz é nossa única esperança. Somos chamados a tomá-la e a seguir a Cristo, nossa luz.",
    ref: "cf. CIC, §618",
  },
  {
    title: "Arado",
    image: "/images/symbol-arado.jpg",
    text: '"Aquele que põe a mão no arado e olha para trás não é apto para o Reino de Deus." As marcas do arado refletem nossa caminhada e fidelidade a Jesus Cristo.',
    ref: "Lucas 9:62",
  },
  {
    title: "Clave de Sol",
    image: "/images/symbol-clave.jpg",
    text: "A música é o meio pelo qual somos sal da terra; que, através dela, brilhe nossa luz diante dos homens, para que, vendo nossas obras, glorifiquem ao Pai que está nos céus.",
    ref: "cf. Mt 5, 13-16",
  },
];

export default async function Home() {
  const availability = await checkFolhetoAvailability();
  const availableFolhetos = FOLHETOS.filter((f) => availability[f.slug]);

  return (
    <div id="top" className="flex flex-1 flex-col">
      <Header />

      {/* HERO */}
      <section
        className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-(--color-border) px-6 pb-16 pt-24"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, var(--color-bg-alt-2), var(--color-bg-alt) 45%, var(--color-bg) 85%)",
        }}
      >
        {/* Logo grande ao fundo, na parte de cima, tipo "hero" full page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden select-none"
        >
          <Image
            src="/images/logo-mark.svg"
            alt=""
            width={900}
            height={900}
            className="mt-12 h-auto w-[130vw] max-w-[1100px] opacity-[0.16] sm:mt-2 sm:w-[75vw]"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 45%, var(--color-bg) 92%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto mt-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-6xl">
            BANDA SAL &amp; LUZ
          </h1>
          <p className="font-sans text-sm font-medium uppercase tracking-[0.3em] text-(--color-teal-strong)">
            Ministério Católico
          </p>
          <blockquote className="mt-2 max-w-xl text-balance text-lg text-(--color-text-muted) sm:text-xl">
            &ldquo;Vós sois o sal da terra. Vós sois a luz do mundo.&rdquo;
            <footer className="mt-2 text-sm text-(--color-text-muted)/80">
              Mateus 5, 13-14
            </footer>
          </blockquote>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#lancamento"
              className="rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
            >
              Ouça nosso lançamento
            </a>
            <a
              href="#contato"
              className="rounded-full border border-(--color-border) px-6 py-3 font-condensed font-bold text-(--color-text) transition-colors hover:border-(--color-teal) hover:text-(--color-teal-strong)"
            >
              Solicitar orçamento
            </a>
          </div>
        </div>
      </section>

      {/* HISTÓRIA */}
      <section
        id="historia"
        className="relative scroll-mt-28 overflow-hidden px-6 py-20 sm:py-28"
      >
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-condensed text-3xl font-bold sm:text-4xl">
              Nossa História
            </h2>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-(--color-teal-strong)">
              Servindo ao Altar do Senhor através da música
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
            {/* Foto ao fundo, escurecida, só no mobile */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center select-none md:hidden"
            >
              <div
                className="relative aspect-[411/549] w-[75%] max-w-[420px]"
                style={{
                  maskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 70%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 70%)",
                }}
              >
                <Image
                  src="/images/historia-bg.jpg"
                  alt=""
                  fill
                  className="object-cover opacity-30"
                  sizes="75vw"
                />
                <div className="absolute inset-0 bg-(--color-bg)/45" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl md:mx-0">
              <ol className="relative border-l border-(--color-border) pl-8">
                {HISTORY_TIMELINE.map((item) => (
                  <li key={item.year} className="mb-10 last:mb-0">
                    <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-(--color-gold)" />
                    <p className="font-condensed text-lg font-bold text-(--color-gold)">
                      {item.year}
                    </p>
                    <p className="mt-1 text-(--color-text-muted)">
                      {item.text}
                    </p>
                  </li>
                ))}
              </ol>

              <blockquote className="mt-2 border-l border-(--color-border) pl-8 text-balance italic text-(--color-text-muted)">
                &ldquo;Que, pela graça de Deus, possamos seguir colocando
                nossos dons a serviço da Igreja — sempre para a maior glória
                de Deus.&rdquo;
              </blockquote>
            </div>

            {/* Foto visível, só no desktop, ao lado do texto */}
            <div className="relative hidden md:block">
              <div className="relative mx-auto aspect-[411/549] w-full max-w-sm overflow-hidden rounded-2xl border border-(--color-border) shadow-lg shadow-black/10">
                <Image
                  src="/images/historia-bg.jpg"
                  alt="Banda Sal & Luz em frente à igreja"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 384px, 100vw"
                />
              </div>
            </div>
          </div>

          <details className="group mt-20">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-center font-condensed text-base font-bold text-(--color-text-muted) transition-colors hover:text-(--color-gold) [&::-webkit-details-marker]:hidden">
              O que cada símbolo do nosso logo representa
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {SYMBOLS.map((symbol) => (
              <div
                key={symbol.title}
                className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={symbol.image}
                    alt={`Símbolo: ${symbol.title}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-condensed text-xl font-bold text-(--color-gold)">
                    {symbol.title}
                  </h3>
                  <p className="mt-2 text-sm text-(--color-text-muted)">
                    {symbol.text}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-(--color-teal-strong)">
                    {symbol.ref}
                  </p>
                </div>
              </div>
            ))}
            </div>
          </details>
        </div>
      </section>

      {/* LANÇAMENTO */}
      <section
        id="lancamento"
        className="scroll-mt-28 px-6 py-20 sm:py-28"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-bg) 0%, var(--color-bg-alt) 15%, var(--color-bg-alt) 85%, var(--color-bg) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-condensed text-3xl font-bold sm:text-4xl">
            Lançamento
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-(--color-text-muted)">
            Ouça a música mais recente da Banda Sal &amp; Luz, lançada em
            nosso canal do YouTube.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-(--color-border) shadow-2xl">
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${LANCAMENTO_YOUTUBE_ID}`}
                title="Lançamento — Banda Sal & Luz"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <a
            href={`https://www.youtube.com/watch?v=${LANCAMENTO_YOUTUBE_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-(--color-teal-strong) underline underline-offset-4 hover:text-(--color-teal)"
          >
            Assistir no YouTube
          </a>
        </div>
      </section>

      {/* FOLHETO DO DIA */}
      <section id="folheto" className="scroll-mt-28 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-condensed text-3xl font-bold sm:text-4xl">
            Folhetos do Dia
          </h2>
          {availability.missa && availability.cantos && (
            <p className="mx-auto mt-4 max-w-xl text-(--color-text-muted)">
              O folheto da missa e o de músicas, disponíveis para acompanhar
              durante a celebração.
            </p>
          )}
          {availability.missa && !availability.cantos && (
            <p className="mx-auto mt-4 max-w-xl text-(--color-text-muted)">
              O folheto da missa, disponível para acompanhar durante a
              celebração.
            </p>
          )}
          {!availability.missa && availability.cantos && (
            <p className="mx-auto mt-4 max-w-xl text-(--color-text-muted)">
              O folheto de músicas, disponível para acompanhar durante a
              celebração.
            </p>
          )}
        </div>

        <div className="mt-10">
          {availableFolhetos.length > 0 ? (
            <FolhetoSection folhetos={availableFolhetos} />
          ) : (
            <div className="mx-auto max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
              <p className="font-condensed text-xl font-bold text-(--color-gold)">
                Folheto indisponível
              </p>
              <p className="mt-2 text-sm text-(--color-text-muted)">
                O folheto do dia é publicado antes de cada celebração.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="scroll-mt-28 px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <h2 className="font-condensed text-3xl font-bold sm:text-4xl">
              Contato para orçamentos
            </h2>
            <p className="mt-4 text-(--color-text-muted)">
              Quer conhecer um pouco mais do nosso trabalho e serviço ao
              Altar ou entrar em contato conosco para fazer um orçamento?
            </p>

            <a
              href="https://www.instagram.com/saleluz_ministeriocatolico"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-(--color-border) px-5 py-3 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
              </svg>
              @saleluz_ministeriocatolico
            </a>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-(--color-border) px-6 py-6 text-sm text-(--color-text-muted)">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-circle.jpg"
              alt="Logo Banda Sal & Luz"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-condensed font-bold text-(--color-text)">
                BANDA SAL &amp; LUZ
              </p>
              <p className="text-xs">Ministério Católico</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
          <a
            href="mailto:contato.bandasaleluz@gmail.com"
            aria-label="E-mail"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </a>

          <a
            href="https://api.whatsapp.com/send?phone=5521997121099"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/saleluz_ministeriocatolico"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
            </svg>
          </a>

          <a
            href="https://www.youtube.com/@saleluzministeriocatolico"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="3" y="6" width="18" height="12" rx="4" />
              <path d="M10 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none" />
            </svg>
          </a>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-6xl border-t border-(--color-border) pt-4 text-center text-xs">
          © {new Date().getFullYear()} Banda Sal &amp; Luz. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
