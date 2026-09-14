"use client";

import type { Genero } from "@/lib/musicas";

export default function BuscaMusicas({
  consulta,
  onConsulta,
  genero,
  onGenero,
  generos,
  total,
  filtrando,
}: {
  consulta: string;
  onConsulta: (valor: string) => void;
  genero: string | null;
  onGenero: (slug: string | null) => void;
  generos: Genero[];
  total: number;
  filtrando: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          type="search"
          value={consulta}
          onChange={(event) => onConsulta(event.target.value)}
          placeholder="Buscar por título, gênero ou créditos"
          aria-label="Buscar música"
          className="w-full rounded-full border border-(--color-border) bg-(--color-surface) py-3 pl-11 pr-11 text-sm text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted)/70 focus:border-(--color-teal)"
        />

        {consulta && (
          <button
            type="button"
            onClick={() => onConsulta("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-(--color-text-muted) transition-colors hover:text-(--color-gold)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* Os gêneros rolam de lado no mobile em vez de quebrar em quatro linhas
          e empurrar o catálogo para fora da tela. */}
      <div className="-mx-7 flex snap-x scroll-pl-7 gap-2 overflow-x-auto px-7 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:scroll-pl-6 sm:px-6">
        <Chip ativo={!genero} onClick={() => onGenero(null)}>
          Todos
        </Chip>
        {generos.map((item) => (
          <Chip
            key={item.slug}
            ativo={genero === item.slug}
            onClick={() => onGenero(genero === item.slug ? null : item.slug)}
          >
            {item.nome}
          </Chip>
        ))}
      </div>

      {filtrando && (
        <p className="text-sm text-(--color-text-muted)">
          {total === 0
            ? "Nenhuma música encontrada."
            : `${total} música${total > 1 ? "s" : ""} encontrada${total > 1 ? "s" : ""}.`}
        </p>
      )}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 snap-start rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        ativo
          ? "border-(--color-gold) text-(--color-gold)"
          : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-gold) hover:text-(--color-gold)"
      }`}
    >
      {children}
    </button>
  );
}
