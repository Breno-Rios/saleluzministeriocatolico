"use client";

import { useEffect, useRef, useState } from "react";
import MusicaCard from "./MusicaCard";
import type { Musica, Prateleira } from "@/lib/musicas";

export default function PrateleiraMusicas({
  prateleira,
  onSelect,
}: {
  prateleira: Prateleira;
  onSelect: (musica: Musica) => void;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(true);

  // As setas só existem quando há o que rolar para aquele lado - com poucas
  // músicas a prateleira cabe inteira na tela e não ganha controle nenhum.
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;

    const sincronizar = () => {
      setInicio(el.scrollLeft <= 8);
      setFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };

    sincronizar();
    el.addEventListener("scroll", sincronizar, { passive: true });
    // A largura do trilho muda ao girar o celular, e com ela muda se ainda há
    // o que rolar.
    const observer = new ResizeObserver(sincronizar);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", sincronizar);
      observer.disconnect();
    };
  }, []);

  const rolar = (direcao: -1 | 1) => {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="group/prateleira">
      <h2 className="px-7 font-condensed text-lg font-bold sm:px-6 sm:text-xl">
        {prateleira.genero.nome}
      </h2>

      <div className="relative mt-4">
        {/* O scroll-padding acompanha o padding: sem ele o snap encosta o
            primeiro card na borda do scroller ao carregar, comendo o recuo da
            esquerda e deixando os cards colados enquanto o título fica afastado. */}
        <div
          ref={trilho}
          className="flex snap-x scroll-pl-7 gap-3 overflow-x-auto scroll-smooth px-7 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-pl-6 sm:gap-4 sm:px-6"
        >
          {prateleira.musicas.map((musica) => (
            <MusicaCard
              key={musica.id}
              musica={musica}
              onSelect={onSelect}
              // Cabem 3 cards mais uma faixa do quarto, para ficar claro que a
              // prateleira continua para o lado: 28px de recuo do trilho + 3
              // intervalos de 12px + os ~14px que sobram do quarto card dão os
              // 78px descontados da tela.
              className="w-[calc((100vw-78px)/3)] shrink-0 snap-start sm:w-64"
            />
          ))}
        </div>

        {!inicio && <Seta direcao={-1} onClick={() => rolar(-1)} />}
        {!fim && <Seta direcao={1} onClick={() => rolar(1)} />}
      </div>
    </section>
  );
}

function Seta({ direcao, onClick }: { direcao: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direcao === -1 ? "Voltar" : "Avançar"}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface)/90 text-(--color-text) opacity-0 transition-opacity hover:text-(--color-gold) focus-visible:opacity-100 group-hover/prateleira:opacity-100 md:flex ${
        direcao === -1 ? "left-2" : "right-2"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d={direcao === -1 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
