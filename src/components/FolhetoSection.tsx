"use client";

import { useState } from "react";
import { FOLHETOS, type FolhetoSlug } from "@/lib/folhetos";
import FolhetoViewerClient from "./FolhetoViewerClient";

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

export default function FolhetoSection({
  folhetos,
}: {
  folhetos: typeof FOLHETOS[number][];
}) {
  const [selected, setSelected] = useState<FolhetoSlug>(folhetos[0].slug);
  const [fullscreenSlug, setFullscreenSlug] = useState<FolhetoSlug | null>(
    null,
  );

  if (folhetos.length === 1) {
    return (
      <div className="mx-auto w-full max-w-[560px]">
        <FolhetoViewerClient
          file={`/api/folheto?tipo=${folhetos[0].slug}`}
          showDownload={false}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
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
            <FolhetoViewerClient
              file={`/api/folheto?tipo=${folheto.slug}`}
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
          </div>
        ))}
      </div>
    </div>
  );
}
