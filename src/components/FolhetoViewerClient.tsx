"use client";

import dynamic from "next/dynamic";
import type { FolhetoSwitcherItem } from "./FolhetoViewer";

const FolhetoViewer = dynamic(() => import("./FolhetoViewer"), {
  ssr: false,
  loading: () => (
    <p className="py-16 text-sm text-(--color-text-muted)">
      Carregando folheto...
    </p>
  ),
});

export default function FolhetoViewerClient({
  file,
  showDownload = true,
  switcher,
  expanded,
  onExpandedChange,
}: {
  file: string | File;
  showDownload?: boolean;
  switcher?: FolhetoSwitcherItem[];
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  return (
    <FolhetoViewer
      file={file}
      showDownload={showDownload}
      switcher={switcher}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    />
  );
}
