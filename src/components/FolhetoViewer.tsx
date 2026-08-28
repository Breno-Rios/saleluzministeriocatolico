"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PDF_URL = "/api/folheto";
const MIN_SCALE = 0.7;
const MAX_SCALE = 2;
const SWIPE_MIN_DISTANCE = 50;
const SWIPE_MAX_DURATION = 600;

const DOCUMENT_OPTIONS = {
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
};

export default function FolhetoViewer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState<number>();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [notFound, setNotFound] = useState(false);

  const touchStart = useRef<{ x: number; time: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setStageHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages]);

  function goNext() {
    setPageNumber((p) => Math.min(p + 1, numPages ?? p));
  }

  function goPrev() {
    setPageNumber((p) => Math.max(p - 1, 1));
  }

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    if (relativeX < 0.35) goPrev();
    else goNext();
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, time: Date.now() };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const elapsed = Date.now() - start.time;
    if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE || elapsed > SWIPE_MAX_DURATION) return;
    if (deltaX > 0) goPrev();
    else goNext();
  }

  const baseHeight = stageHeight ? stageHeight - 32 : 560;

  if (notFound) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
        <p className="font-condensed text-xl font-bold text-(--color-gold)">
          Folheto ainda não disponível
        </p>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          O folheto do dia é publicado antes de cada apresentação. Volte aqui
          próximo ao evento.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        {/* Palco: toque/clique nas laterais ou deslize para navegar */}
        <div
          ref={stageRef}
          onClick={handleStageClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="group relative flex h-[68vh] max-h-[760px] min-h-[420px] select-none items-center justify-center overflow-auto p-4 [-webkit-tap-highlight-color:transparent]"
        >
          <Document
            file={PDF_URL}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
            }}
            onLoadError={() => setNotFound(true)}
            options={DOCUMENT_OPTIONS}
            loading={
              <p className="text-sm text-(--color-text-muted)">
                Carregando folheto...
              </p>
            }
          >
            <Page
              pageNumber={pageNumber}
              height={baseHeight * scale}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Setas de apoio (desktop) */}
          <EdgeArrow
            side="left"
            disabled={pageNumber <= 1}
            onClick={goPrev}
          />
          <EdgeArrow
            side="right"
            disabled={!numPages || pageNumber >= numPages}
            onClick={goNext}
          />
        </div>

        {/* Barra de controle, sempre fixa embaixo do palco */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3 py-2.5">
          <NavButton label="Página anterior" disabled={pageNumber <= 1} onClick={goPrev}>
            <path d="M15 18l-6-6 6-6" />
          </NavButton>

          <span className="min-w-[5.5rem] text-center text-sm font-medium text-(--color-text-muted)">
            {numPages ? `${pageNumber} / ${numPages}` : "..."}
          </span>

          <NavButton
            label="Próxima página"
            disabled={!numPages || pageNumber >= numPages}
            onClick={goNext}
          >
            <path d="M9 6l6 6-6 6" />
          </NavButton>

          <span className="mx-1 h-6 w-px bg-(--color-border)" />

          <NavButton label="Diminuir zoom" disabled={scale <= MIN_SCALE} onClick={() => setScale((s) => Math.max(s - 0.15, MIN_SCALE))}>
            <path d="M5 12h14" />
          </NavButton>
          <NavButton label="Aumentar zoom" disabled={scale >= MAX_SCALE} onClick={() => setScale((s) => Math.min(s + 0.15, MAX_SCALE))}>
            <path d="M12 5v14M5 12h14" />
          </NavButton>

          <a
            href={PDF_URL}
            download
            className="rounded-full border border-(--color-border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            Baixar
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-(--color-text-muted)">
        Toque nas laterais da página (ou deslize) para navegar
      </p>
    </div>
  );
}

function EdgeArrow({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Página anterior" : "Próxima página"}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg)/80 text-(--color-text) opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:border-(--color-gold) hover:text-(--color-gold) disabled:pointer-events-none disabled:opacity-0 sm:flex ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d={side === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--color-border) disabled:hover:text-(--color-text)"
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
        {children}
      </svg>
    </button>
  );
}
