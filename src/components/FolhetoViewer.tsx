"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.7;
const MAX_SCALE = 2;
const SWIPE_MIN_DISTANCE = 50;
const SWIPE_MAX_DURATION = 600;

const DOCUMENT_OPTIONS = {
  cMapUrl: "/pdfjs/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "/pdfjs/standard_fonts/",
};

export type FolhetoSwitcherItem = {
  label: string;
  active: boolean;
  onSelect: () => void;
};

export default function FolhetoViewer({
  file,
  showDownload = true,
  switcher,
  expanded: expandedProp,
  onExpandedChange,
}: {
  file: string | File;
  showDownload?: boolean;
  switcher?: FolhetoSwitcherItem[];
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState<number>();
  const expandedStageRef = useRef<HTMLDivElement>(null);
  const [expandedStageHeight, setExpandedStageHeight] = useState<number>();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [notFound, setNotFound] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = expandedProp ?? internalExpanded;

  function setExpanded(value: boolean) {
    if (onExpandedChange) onExpandedChange(value);
    else setInternalExpanded(value);
  }

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
    if (!expanded) return;
    const el = expandedStageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setExpandedStageHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

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
  const expandedBaseHeight = expandedStageHeight
    ? expandedStageHeight - 32
    : 700;

  if (notFound) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
        <p className="font-condensed text-xl font-bold text-(--color-gold)">
          {typeof file === "string"
            ? "Folheto ainda não disponível"
            : "Não foi possível abrir este arquivo"}
        </p>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          {typeof file === "string"
            ? "O folheto do dia é publicado antes de cada celebração."
            : "Verifique se o PDF não está corrompido e tente novamente."}
        </p>
      </div>
    );
  }

  const loadingLabel = (
    <p className="text-sm text-(--color-text-muted)">Carregando folheto...</p>
  );

  function handleLoadSuccess({ numPages: loadedPages }: { numPages: number }) {
    setNumPages(loadedPages);
    // Compact e tela cheia usam <Document> separados, então trocar entre
    // eles (ou entre folhetos) dispara onLoadSuccess de novo - preserva a
    // página atual em vez de sempre voltar pra 1.
    setPageNumber((p) => Math.min(p, loadedPages));
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
          {!expanded && (
            <Document
              file={file}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={() => setNotFound(true)}
              options={DOCUMENT_OPTIONS}
              loading={loadingLabel}
            >
              <Page
                pageNumber={pageNumber}
                height={baseHeight * scale}
                renderAnnotationLayer={false}
              />
            </Document>
          )}

          {/* Setas de apoio (desktop) */}
          <EdgeArrow side="left" disabled={pageNumber <= 1} onClick={goPrev} />
          <EdgeArrow
            side="right"
            disabled={!numPages || pageNumber >= numPages}
            onClick={goNext}
          />

          {/* Maximizar, mesma posição do X de fechar no modo tela cheia */}
          <button
            type="button"
            aria-label="Expandir"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(true);
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg)/80 text-(--color-text) backdrop-blur transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
          >
            <MaximizeIcon />
          </button>
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

          {showDownload && typeof file === "string" && (
            <a
              href={file}
              download
              className="rounded-full border border-(--color-border) px-4 py-2 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              Baixar
            </a>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-(--color-text-muted)">
        Toque nas laterais da página (ou deslize) para navegar
      </p>

      {expanded && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-(--color-bg)">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-(--color-border) px-4 py-3">
            <span className="text-sm font-medium text-(--color-text-muted)">
              {numPages ? `${pageNumber} / ${numPages}` : "..."}
            </span>

            {switcher && (
              <div className="flex items-center justify-center gap-2">
                {switcher.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onSelect}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      item.active
                        ? "border-(--color-gold) text-(--color-gold)"
                        : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-gold) hover:text-(--color-gold)"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setExpanded(false)}
              className="flex h-10 w-10 items-center justify-self-end rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mx-auto h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div
            ref={expandedStageRef}
            onClick={handleStageClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="group relative flex flex-1 select-none items-center justify-center overflow-auto p-4 [-webkit-tap-highlight-color:transparent]"
          >
            <Document
              file={file}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={() => setNotFound(true)}
              options={DOCUMENT_OPTIONS}
              loading={loadingLabel}
            >
              <Page
                pageNumber={pageNumber}
                height={expandedBaseHeight * scale}
                renderAnnotationLayer={false}
              />
            </Document>

            <EdgeArrow side="left" disabled={pageNumber <= 1} onClick={goPrev} />
            <EdgeArrow
              side="right"
              disabled={!numPages || pageNumber >= numPages}
              onClick={goNext}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3 py-2.5">
            <NavButton label="Página anterior" disabled={pageNumber <= 1} onClick={goPrev}>
              <path d="M15 18l-6-6 6-6" />
            </NavButton>
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
          </div>
        </div>
      )}
    </div>
  );
}

function MaximizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
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
