"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CifraViewer from "./CifraViewer";
import { capaDaMusica, capaOtimizavel, urlDoVideo, type Musica } from "@/lib/musicas";

export default function MusicaDetalhe({
  musica,
  onClose,
}: {
  musica: Musica;
  onClose: () => void;
}) {
  const [tocando, setTocando] = useState(false);
  const [vendoCifra, setVendoCifra] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Sem isto a página continua rolando atrás do painel no mobile, e fechar
    // devolve o leitor a um ponto diferente de onde ele clicou.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const capa = capaDaMusica(musica);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm sm:py-16"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={musica.titulo}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-(--color-text) transition-colors hover:bg-black/80 hover:text-(--color-gold)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="relative aspect-video w-full bg-black">
          {tocando ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              // O embed só entra depois do clique no play: um iframe do YouTube
              // custa centenas de KB, e o detalhe abre só para olhar a ficha na
              // maior parte das vezes.
              src={`https://www.youtube.com/embed/${musica.youtubeId}?autoplay=1`}
              title={musica.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setTocando(true)}
              aria-label={`Tocar ${musica.titulo}`}
              className="group absolute inset-0 h-full w-full"
            >
              <Image
                src={capa}
                alt=""
                fill
                unoptimized={!capaOtimizavel(capa)}
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-(--color-surface) via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-(--color-gold) text-[#14181c] transition-transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="font-condensed text-2xl font-bold sm:text-3xl">
            {musica.titulo}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {musica.ano && (
              <span className="text-(--color-teal-strong)">{musica.ano}</span>
            )}
            {musica.generos.map((genero) => (
              <span
                key={genero.slug}
                className="rounded-full border border-(--color-border) px-3 py-1 text-(--color-text-muted)"
              >
                {genero.nome}
              </span>
            ))}
          </div>

          {musica.descricao && (
            <p className="mt-5 whitespace-pre-line text-(--color-text-muted)">
              {musica.descricao}
            </p>
          )}

          {musica.creditos && (
            <p className="mt-5 whitespace-pre-line text-sm text-(--color-text-muted)/80">
              <span className="font-medium uppercase tracking-widest text-(--color-text-muted)">
                Créditos
              </span>
              <br />
              {musica.creditos}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={urlDoVideo(musica.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              Assistir no YouTube
            </a>

            {/* A cifra embutida ganha do link: é a que transpõe. O link
                externo continua valendo para quem só tem a cifra em outro
                site. */}
            {musica.temCifra ? (
              <button
                type="button"
                onClick={() => setVendoCifra((v) => !v)}
                className="rounded-full bg-(--color-gold) px-5 py-2.5 font-condensed text-sm font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
              >
                {vendoCifra ? "Esconder cifra" : "Ver cifra"}
              </button>
            ) : musica.cifraUrl ? (
              <a
                href={musica.cifraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-(--color-gold) px-5 py-2.5 font-condensed text-sm font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
              >
                Ver cifra
              </a>
            ) : (
              <span className="rounded-full border border-dashed border-(--color-border) px-5 py-2.5 text-sm text-(--color-text-muted)/60">
                Cifra em breve
              </span>
            )}
          </div>

          {musica.temCifra && vendoCifra && (
            <div className="mt-6">
              <CifraViewer slug={musica.slug} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
