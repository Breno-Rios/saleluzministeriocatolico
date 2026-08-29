"use client";

import { useRef, useState, type FormEvent } from "react";
import type { FolhetoSlug } from "@/lib/folhetos";
import ConfirmDialog from "./ConfirmDialog";

export default function FolhetoUploadForm({
  tipo,
  erro,
  onFileChange,
}: {
  tipo: FolhetoSlug;
  erro?: string;
  onFileChange: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0] ?? null;
    setFileName(file?.name ?? null);
    onFileChange(file);
    if (file && files && inputRef.current) {
      inputRef.current.files = files;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    event.preventDefault();
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);
    confirmedRef.current = true;
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action="/api/folheto/upload"
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-left"
      >
        <input type="hidden" name="tipo" value={tipo} />

        <label className="grid gap-2 text-sm">
          <span className="font-medium text-(--color-text)">
            Arquivo PDF
          </span>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFiles(event.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragActive
                ? "border-(--color-gold) bg-(--color-gold)/5"
                : "border-(--color-border) hover:border-(--color-teal)"
            }`}
          >
            <p className="text-sm text-(--color-text-muted)">
              {fileName ?? "Arraste o PDF aqui ou clique para escolher"}
            </p>
            <input
              ref={inputRef}
              type="file"
              name="arquivo"
              accept="application/pdf"
              required
              onChange={(event) => handleFiles(event.target.files)}
              className="hidden"
            />
          </div>
        </label>

        <button
          type="submit"
          className="rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
        >
          Publicar
        </button>

        {erro === "arquivo" && (
          <p className="text-center text-sm text-(--color-gold)">
            Envie um arquivo PDF válido.
          </p>
        )}
        {erro === "blob" && (
          <p className="text-center text-sm text-(--color-gold)">
            Armazenamento não configurado neste ambiente.
          </p>
        )}
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="Publicar folheto?"
        description={`"${fileName}" vai substituir o folheto atual no site.`}
        confirmLabel="Publicar"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
