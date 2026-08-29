"use client";

import dynamic from "next/dynamic";

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
}: {
  file: string | File;
  showDownload?: boolean;
}) {
  return <FolhetoViewer file={file} showDownload={showDownload} />;
}
