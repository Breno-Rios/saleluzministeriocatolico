"use client";

import { useRef, useState, type FormEvent } from "react";
import type { FolhetoSlug } from "@/lib/folhetos";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteFolhetoForm({
  tipo,
  variant = "button",
  className,
}: {
  tipo: FolhetoSlug;
  variant?: "button" | "icon";
  className?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

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
        action="/api/folheto/delete"
        method="POST"
        onSubmit={handleSubmit}
        className={className}
      >
        <input type="hidden" name="tipo" value={tipo} />
        {variant === "icon" ? (
          <button
            type="submit"
            aria-label="Remover folheto"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg) text-(--color-text-muted) shadow-md transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            className="rounded-full border border-(--color-border) px-6 py-2.5 text-sm font-medium text-(--color-gold) transition-colors hover:border-(--color-gold)"
          >
            Remover folheto
          </button>
        )}
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="Remover folheto?"
        description="Ele deixa de aparecer no site até que outro seja enviado."
        confirmLabel="Remover"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
