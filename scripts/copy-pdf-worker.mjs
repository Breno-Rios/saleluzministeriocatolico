import { copyFileSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pdfjsDir = path.join(projectRoot, "node_modules/pdfjs-dist");

copyFileSync(
  path.join(pdfjsDir, "build/pdf.worker.min.mjs"),
  path.join(projectRoot, "public/pdf.worker.min.mjs"),
);

cpSync(
  path.join(pdfjsDir, "cmaps"),
  path.join(projectRoot, "public/pdfjs/cmaps"),
  { recursive: true },
);
cpSync(
  path.join(pdfjsDir, "standard_fonts"),
  path.join(projectRoot, "public/pdfjs/standard_fonts"),
  { recursive: true },
);

console.log("Assets do pdf.js copiados para public/ (worker, cmaps, standard_fonts)");
