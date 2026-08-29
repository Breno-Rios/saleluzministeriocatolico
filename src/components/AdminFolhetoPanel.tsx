"use client";

import { useState } from "react";
import { FOLHETOS, isFolhetoSlug, DEFAULT_FOLHETO_SLUG, type FolhetoSlug } from "@/lib/folhetos";
import FolhetoViewerClient from "./FolhetoViewerClient";
import FolhetoUploadForm from "./FolhetoUploadForm";
import DeleteFolhetoForm from "./DeleteFolhetoForm";

type SelectedFiles = Partial<Record<FolhetoSlug, File | null>>;

export default function AdminFolhetoPanel({
  hasFolheto,
  initialTipo,
  erro,
}: {
  hasFolheto: Record<FolhetoSlug, boolean>;
  initialTipo?: string;
  erro?: string;
}) {
  const [selected, setSelected] = useState<FolhetoSlug>(
    isFolhetoSlug(initialTipo) ? initialTipo : DEFAULT_FOLHETO_SLUG,
  );
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 md:flex-row md:items-start">
      <div className="w-full shrink-0 text-left md:w-80">
        <h1 className="font-condensed text-3xl font-bold sm:text-4xl">
          Folheto do Dia
        </h1>

        <nav className="mt-6 grid gap-2">
          {FOLHETOS.map((folheto) => (
            <button
              key={folheto.slug}
              type="button"
              onClick={() => setSelected(folheto.slug)}
              className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected === folheto.slug
                  ? "bg-(--color-gold) text-[#14181c]"
                  : "text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-gold)"
              }`}
            >
              {folheto.label}
            </button>
          ))}
        </nav>

        {FOLHETOS.map((folheto) => (
          <div
            key={folheto.slug}
            className={`mt-8 ${selected === folheto.slug ? "block" : "hidden"}`}
          >
            <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-(--color-text-muted)">
              Publicar novo
            </p>
            <FolhetoUploadForm
              tipo={folheto.slug}
              erro={erro}
              onFileChange={(file) =>
                setSelectedFiles((prev) => ({ ...prev, [folheto.slug]: file }))
              }
            />
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {FOLHETOS.map((folheto) => {
          const preview = selectedFiles[folheto.slug];
          return (
            <div
              key={folheto.slug}
              className={selected === folheto.slug ? "block" : "hidden"}
            >
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-(--color-text-muted)">
                    Publicado atualmente
                  </p>
                  {hasFolheto[folheto.slug] ? (
                    <div className="relative">
                      <DeleteFolhetoForm
                        tipo={folheto.slug}
                        variant="icon"
                        className="absolute -right-2 -top-2 z-10"
                      />
                      <FolhetoViewerClient
                        file={`/api/folheto?tipo=${folheto.slug}`}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
                      <p className="text-sm text-(--color-text-muted)">
                        Nenhum folheto publicado no momento.
                      </p>
                    </div>
                  )}
                </div>

                {preview && (
                  <div>
                    <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-(--color-text-muted)">
                      Prévia — {preview.name}
                    </p>
                    <FolhetoViewerClient
                      key={`${preview.name}-${preview.size}-${preview.lastModified}`}
                      file={preview}
                      showDownload={false}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
