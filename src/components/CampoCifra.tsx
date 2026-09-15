"use client";

import { useRef, useState } from "react";

const CAMPO =
  "w-full rounded-lg border border-(--color-border) bg-transparent px-4 py-2.5 text-sm text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted)/60 focus:border-(--color-teal)";

export default function CampoCifra({ valor }: { valor: string }) {
  const [texto, setTexto] = useState(valor);
  const arquivo = useRef<HTMLInputElement>(null);

  // O arquivo é lido aqui mesmo e cai no textarea: o que vai para o banco é o
  // texto, não o arquivo. Assim dá para conferir e corrigir antes de salvar -
  // cifra copiada de site costuma vir com lixo no começo.
  function carregar(file: File) {
    const leitor = new FileReader();
    leitor.onload = () => setTexto(String(leitor.result ?? ""));
    leitor.readAsText(file, "utf-8");
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => arquivo.current?.click()}
          className="rounded-full border border-(--color-border) px-4 py-2 text-xs font-medium text-(--color-text-muted) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
        >
          Carregar arquivo .txt
        </button>

        {texto && (
          <>
            <span className="text-xs text-(--color-text-muted)">
              {texto.split("\n").length} linhas
            </span>
            <button
              type="button"
              onClick={() => setTexto("")}
              className="text-xs font-medium text-(--color-text-muted) underline underline-offset-4 transition-colors hover:text-(--color-gold)"
            >
              limpar
            </button>
          </>
        )}

        <input
          ref={arquivo}
          type="file"
          accept=".txt,text/plain"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) carregar(file);
            // Sem isto, escolher o mesmo arquivo duas vezes seguidas não
            // dispara o onChange de novo.
            event.target.value = "";
          }}
        />
      </div>

      <textarea
        name="cifra"
        rows={10}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        placeholder={"Cole a cifra aqui, acordes acima da letra:\n\nIntro: C  G  Am  F\n\n     C              G\nVem, Espírito de Deus"}
        className={`${CAMPO} font-mono text-xs leading-relaxed`}
      />

      <p className="text-xs text-(--color-text-muted)/80">
        Aceita acordes acima da letra ou ChordPro. Quem lê escolhe o tom na
        página.
      </p>
    </div>
  );
}
