"use client";

import Image from "next/image";
import { capaDaMusica, capaOtimizavel, type Musica } from "@/lib/musicas";

/**
 * O card usado tanto nas prateleiras quanto na grade de resultados da busca -
 * quem chama decide a largura, o resto é igual nos dois lugares.
 */
export default function MusicaCard({
  musica,
  onSelect,
  className = "",
  ansioso = false,
}: {
  musica: Musica;
  onSelect: (musica: Musica) => void;
  className?: string;
  /**
   * Carrega a capa sem esperar a rolagem. Vale para o card da música em
   * destaque: ele repete a capa do bloco do topo, que já vem com priority, e
   * marcar a mesma URL como lazy aqui fazia o Next avisar que o LCP da página
   * estava sem prioridade.
   */
  ansioso?: boolean;
}) {
  const capa = capaDaMusica(musica);

  return (
    <button
      type="button"
      onClick={() => onSelect(musica)}
      className={`group/card text-left transition-transform duration-200 hover:scale-[1.03] focus-visible:scale-[1.03] focus-visible:outline-none ${className}`}
    >
      {/* Retrato no mobile: com o card estreito, o 16:9 virava uma tira de
          60px de altura. O corte lateral da capa do YouTube é o preço de
          deixar a prateleira com cara de pôster. */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-alt) transition-colors group-hover/card:border-(--color-gold) group-focus-visible/card:border-(--color-gold) sm:aspect-video">
        <Image
          src={capa}
          alt=""
          fill
          unoptimized={!capaOtimizavel(capa)}
          loading={ansioso ? "eager" : "lazy"}
          className="object-cover"
          sizes="(min-width: 640px) 256px, 33vw"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <span className="absolute bottom-1.5 left-2 right-2 line-clamp-2 font-condensed text-xs font-bold text-white drop-shadow sm:bottom-2 sm:left-3 sm:right-3 sm:text-sm">
          {musica.titulo}
        </span>
      </div>
    </button>
  );
}
