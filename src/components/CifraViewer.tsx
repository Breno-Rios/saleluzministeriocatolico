"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Acidente, CifraPreparada } from "@/lib/cifra";

const LIMITE = 11;

export default function CifraViewer({ slug }: { slug: string }) {
  const [semitons, setSemitons] = useState(0);
  const [acidente, setAcidente] = useState<Acidente>("#");
  // Papel branco para quem vai tocar lendo de perto, ou imprimir; escuro para
  // quem só está de passagem pela página.
  const [claro, setClaro] = useState(false);
  const [cifra, setCifra] = useState<CifraPreparada | null>(null);
  const [erro, setErro] = useState(false);

  // Texto e biblioteca chegam juntos e só agora: a cifra fica fora do payload
  // da página, e o ChordSheetJS são algumas centenas de KB que não têm por que
  // pesar em quem entrou para ouvir música.
  useEffect(() => {
    let atual = true;

    Promise.all([
      fetch(`/api/musicas/${slug}/cifra`).then((resposta) =>
        resposta.ok ? resposta.json() : Promise.reject(new Error("sem cifra")),
      ),
      import("@/lib/cifra"),
    ])
      .then(([dados, { prepararCifra }]) => {
        if (atual) setCifra(prepararCifra(dados.cifra));
      })
      .catch(() => {
        if (atual) setErro(true);
      });

    return () => {
      atual = false;
    };
  }, [slug]);

  // Transpor não refaz a interpretação nem volta ao servidor: o trabalho caro
  // já foi feito uma vez.
  const linhas = useMemo(
    () => cifra?.formatarLinhas(semitons, acidente) ?? null,
    [cifra, semitons, acidente],
  );

  if (erro) {
    return (
      <p className="text-sm text-(--color-text-muted)">
        Não foi possível carregar a cifra agora.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-(--color-text-muted)">
          Tom
        </span>

        <div className="flex items-center gap-1">
          <Botao
            aria-label="Um semitom abaixo"
            onClick={() => setSemitons((v) => Math.max(-LIMITE, v - 1))}
          >
            −
          </Botao>
          <span className="w-12 text-center font-condensed text-sm font-bold text-(--color-gold)">
            {semitons > 0 ? `+${semitons}` : semitons}
          </span>
          <Botao
            aria-label="Um semitom acima"
            onClick={() => setSemitons((v) => Math.min(LIMITE, v + 1))}
          >
            +
          </Botao>
        </div>

        <Botao
          aria-label={acidente === "#" ? "Usar bemóis" : "Usar sustenidos"}
          onClick={() => setAcidente((v) => (v === "#" ? "b" : "#"))}
          largo
        >
          {acidente === "#" ? "♯" : "♭"}
        </Botao>

        <Botao
          aria-label={claro ? "Fundo escuro" : "Fundo branco"}
          onClick={() => setClaro((v) => !v)}
          largo
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
            {claro ? (
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
              </>
            )}
          </svg>
        </Botao>

        {semitons !== 0 && (
          <button
            type="button"
            onClick={() => setSemitons(0)}
            className="text-xs font-medium text-(--color-text-muted) underline underline-offset-4 transition-colors hover:text-(--color-gold)"
          >
            tom original
          </button>
        )}
      </div>

      {/* A cifra depende de largura fixa por caractere: é o alinhamento do
          acorde sobre a sílaba que diz onde trocar. Daí o pre + font-mono, e a
          rolagem horizontal em vez de quebra de linha.

          No papel branco o acorde é o azul da paleta; no escuro, o dourado -
          que é o que enxerga bem em cada fundo. */}
      <div
        className={`relative overflow-hidden rounded-xl border border-(--color-border) ${
          claro ? "bg-white" : "bg-(--color-bg)"
        }`}
      >
        {/* A marca fica no contêiner, e não dentro do <pre>: assim ela não
            desliza quando a cifra rola para o lado. Opacidade baixa o bastante
            para o texto continuar sendo o que se lê. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          {/* Rasterização de brand-assets/original/logotipo-oficial-v2.svg -
              o logo com o nome da banda e sem a borda redonda. Em PNG porque a
              marca sai achatada em silhueta de qualquer forma: o SVG custaria
              154 KB para desenhar cores que o filtro descarta, contra 27 KB
              aqui.

              Nos dois modos ela é silhueta: no claro brightness-0 achata em
              preto; no escuro o invert em seguida vira branco. Cor cheia atrás
              de cifra disputava atenção com o acorde. */}
          <Image
            src="/images/logo-wordmark.png"
            alt=""
            width={560}
            height={560}
            className={`h-auto w-[92%] max-w-[460px] brightness-0 ${
              claro ? "opacity-[0.06]" : "opacity-[0.05] invert"
            }`}
          />
        </div>

        <pre
          className={`relative overflow-x-auto whitespace-pre p-4 font-mono text-xs leading-relaxed ${
            claro ? "font-bold text-[#14181c]" : "text-(--color-text)"
          }`}
        >
          {linhas
            ? linhas.map((linha, indice) => (
                <span
                  key={indice}
                  className={
                    linha.acordes
                      ? `font-bold ${claro ? "text-(--color-teal)" : "text-(--color-gold)"}`
                      : undefined
                  }
                >
                  {linha.texto}
                  {"\n"}
                </span>
              ))
            : "Carregando cifra..."}
        </pre>
      </div>
    </div>
  );
}

function Botao({
  children,
  onClick,
  largo = false,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  largo?: boolean;
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...props}
      className={`flex h-8 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold) ${
        largo ? "w-10" : "w-8"
      }`}
    >
      {children}
    </button>
  );
}
