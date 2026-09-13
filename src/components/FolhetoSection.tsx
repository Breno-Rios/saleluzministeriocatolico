"use client";

import { useEffect, useRef, useState } from "react";
import { FOLHETOS, type FolhetoSlug, type FolhetoUrls } from "@/lib/folhetos";
import FolhetoViewerClient from "./FolhetoViewerClient";

// Coincide com o breakpoint md: do Tailwind, onde os dois folhetos passam a
// aparecer lado a lado - abaixo disso só um está visível por vez.
const DESKTOP = "(min-width: 48rem)";

const ICONS: Record<FolhetoSlug, React.ReactNode> = {
  missa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
      <path d="M12 3v7M9 6h6M12 10v11" />
    </svg>
  ),
  cantos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
};

function Placeholder() {
  return <p className="py-16 text-center text-sm text-(--color-text-muted)">Carregando folheto...</p>;
}

export default function FolhetoSection({
  folhetos,
  urls,
}: {
  folhetos: typeof FOLHETOS[number][];
  urls: FolhetoUrls;
}) {
  const [selected, setSelected] = useState<FolhetoSlug>(folhetos[0].slug);
  const [fullscreenSlug, setFullscreenSlug] = useState<FolhetoSlug | null>(
    null,
  );

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Acumula: um folheto que já foi montado nunca é desmontado, senão trocar
  // de aba e voltar descartaria a página e o zoom em que o leitor estava.
  const [mounted, setMounted] = useState<FolhetoSlug[]>([]);

  // Cada PDF tem alguns megabytes, e a seção fica bem abaixo da dobra: montar
  // o visualizador junto com a página fazia todo visitante baixar os arquivos
  // inteiros mesmo sem nunca rolar até aqui.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Começa a carregar um pouco antes de entrar na tela, para o PDF estar
      // pronto quando a seção chegar.
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // No desktop os dois aparecem juntos, então os dois precisam carregar. No
    // mobile só o selecionado está visível - o outro carrega quando (e se) o
    // leitor trocar de aba.
    const needed = isDesktop ? folhetos.map((f) => f.slug) : [selected];
    setMounted((prev) => {
      const merged = [...new Set([...prev, ...needed])];
      return merged.length === prev.length ? prev : merged;
    });
  }, [visible, isDesktop, selected, folhetos]);

  if (folhetos.length === 1) {
    return (
      <div ref={sectionRef} className="mx-auto w-full max-w-[560px]">
        {visible ? (
          <FolhetoViewerClient
            file={urls[folhetos[0].slug]!}
            showDownload={false}
          />
        ) : (
          <Placeholder />
        )}
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8"
    >
      <div className="flex items-center gap-3">
        {folhetos.map((folheto) => (
          <button
            key={folheto.slug}
            type="button"
            onClick={() => setSelected(folheto.slug)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
              selected === folheto.slug
                ? "border-(--color-gold) text-(--color-gold)"
                : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-gold) hover:text-(--color-gold)"
            }`}
          >
            {ICONS[folheto.slug]}
            {folheto.label}
          </button>
        ))}
      </div>

      <div className="grid w-full gap-8 md:grid-cols-2">
        {folhetos.map((folheto) => (
          <div
            key={folheto.slug}
            className={selected === folheto.slug ? "block" : "hidden md:block"}
          >
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-(--color-text-muted)">
              {folheto.label}
            </p>
            {mounted.includes(folheto.slug) ? (
              <FolhetoViewerClient
                file={urls[folheto.slug]!}
                showDownload={false}
                expanded={fullscreenSlug === folheto.slug}
                onExpandedChange={(isOpen) => {
                  setFullscreenSlug(isOpen ? folheto.slug : null);
                  if (isOpen) setSelected(folheto.slug);
                }}
                switcher={folhetos.map((f) => ({
                  label: f.label,
                  active: f.slug === folheto.slug,
                  onSelect: () => {
                    setSelected(f.slug);
                    setFullscreenSlug(f.slug);
                  },
                }))}
              />
            ) : (
              <Placeholder />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
