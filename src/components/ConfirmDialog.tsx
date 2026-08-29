"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-center shadow-2xl">
        <p className="font-condensed text-xl font-bold text-(--color-text)">
          {title}
        </p>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          {description}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-(--color-gold) px-5 py-2.5 font-condensed text-sm font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
