"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import BuscaMusicas from "./BuscaMusicas";
import MusicaCard from "./MusicaCard";
import MusicaDetalhe from "./MusicaDetalhe";
import PrateleiraMusicas from "./PrateleiraMusicas";
import { buscar } from "@/lib/busca";
import { capaDaMusica, capaOtimizavel, type Musica, type Prateleira } from "@/lib/musicas";

// pushState não dispara popstate, então a própria página avisa quando muda a
// URL por conta própria.
const NAVEGOU = "musicas:navegou";

function assinarNavegacao(aoMudar: () => void) {
  window.addEventListener("popstate", aoMudar);
  window.addEventListener(NAVEGOU, aoMudar);
  return () => {
    window.removeEventListener("popstate", aoMudar);
    window.removeEventListener(NAVEGOU, aoMudar);
  };
}

export default function MusicasCatalogo({
  prateleiras,
}: {
  prateleiras: Prateleira[];
}) {
  const [consulta, setConsulta] = useState("");
  const [genero, setGenero] = useState<string | null>(null);

  // Uma música em duas prateleiras aparece duas vezes na lista de prateleiras;
  // aqui ela precisa contar uma vez só.
  const catalogo = useMemo(() => {
    const vistas = new Map<number, Musica>();
    for (const prateleira of prateleiras) {
      for (const musica of prateleira.musicas) vistas.set(musica.id, musica);
    }
    return [...vistas.values()];
  }, [prateleiras]);

  const generos = useMemo(
    () => prateleiras.map((prateleira) => prateleira.genero),
    [prateleiras],
  );

  const filtrando = consulta.trim() !== "" || genero !== null;
  const resultados = useMemo(
    () => (filtrando ? buscar(catalogo, consulta, genero) : []),
    [filtrando, catalogo, consulta, genero],
  );

  const porSlug = useMemo(() => {
    const mapa = new Map<string, Musica>();
    for (const prateleira of prateleiras) {
      for (const musica of prateleira.musicas) mapa.set(musica.slug, musica);
    }
    return mapa;
  }, [prateleiras]);

  // O detalhe aberto vira ?musica=slug na barra de endereço: o link fica
  // compartilhável e o botão de voltar do celular fecha o painel em vez de
  // tirar o visitante da página. Quem manda é a URL, e não um estado paralelo,
  // para as duas coisas nunca discordarem - pushState/replaceState direto no
  // history é o que o Next suporta para isso sem refazer a navegação.
  const busca = useSyncExternalStore(
    assinarNavegacao,
    () => window.location.search,
    () => "",
  );
  const selecionada =
    porSlug.get(new URLSearchParams(busca).get("musica") ?? "") ?? null;

  // Só houve pushState se o painel foi aberto por clique; quem chegou por um
  // link com ?musica= não tem para onde voltar.
  const empurrouHistorico = useRef(false);

  const abrir = (musica: Musica) => {
    window.history.pushState(null, "", `?musica=${musica.slug}`);
    empurrouHistorico.current = true;
    window.dispatchEvent(new Event(NAVEGOU));
  };

  const fechar = () => {
    if (empurrouHistorico.current) {
      // Desfaz o pushState da abertura, para o botão de voltar do navegador
      // não ter que passar por cada música que o visitante abriu.
      empurrouHistorico.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
      window.dispatchEvent(new Event(NAVEGOU));
    }
  };

  if (prateleiras.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center">
        <p className="font-condensed text-xl font-bold text-(--color-gold)">
          Nenhuma música publicada ainda
        </p>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          Em breve nosso repertório estará aqui, organizado por gênero.
        </p>
      </div>
    );
  }

  // O topo é a música marcada como destaque no painel. Sem nenhuma marcada -
  // ou se a marcada não estiver em prateleira nenhuma - cai na primeira da
  // primeira prateleira.
  const todas = prateleiras.flatMap((prateleira) => prateleira.musicas);
  const destaque = todas.find((musica) => musica.destaque) ?? todas[0];
  const capaDestaque = capaDaMusica(destaque);

  return (
    <>
      {/* O destaque fica de pé mesmo com filtro ativo: é a vitrine da banda, e
          sumir a cada clique num gênero deixava a página começando do nada. */}
      <section className="relative mb-4 overflow-hidden border-b border-(--color-border)">
        <div className="absolute inset-0">
          <Image
            src={capaDestaque}
            alt=""
            fill
            priority
            unoptimized={!capaOtimizavel(capaDestaque)}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-(--color-bg) via-(--color-bg)/80 to-(--color-bg)/40" />
        </div>

        {/* px-7 no mobile para alinhar com o recuo das prateleiras. */}
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-4 px-7 pb-12 pt-32 sm:px-6 sm:pb-16 sm:pt-40">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-(--color-teal-strong)">
            {destaque.generos[0]?.nome ?? "Em destaque"}
          </p>
          <h2 className="max-w-2xl font-condensed text-3xl font-bold sm:text-5xl">
            {destaque.titulo}
          </h2>
          {destaque.descricao && (
            <p className="line-clamp-3 max-w-xl text-(--color-text-muted)">
              {destaque.descricao}
            </p>
          )}
          <button
            type="button"
            onClick={() => abrir(destaque)}
            className="mt-2 flex items-center gap-2 rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
            Assistir
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-7 pt-2 sm:px-6">
        <BuscaMusicas
          consulta={consulta}
          onConsulta={setConsulta}
          genero={genero}
          onGenero={setGenero}
          generos={generos}
          total={resultados.length}
          filtrando={filtrando}
        />
      </div>

      {filtrando ? (
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-3 px-7 py-8 sm:grid-cols-4 sm:gap-4 sm:px-6 lg:grid-cols-5">
          {resultados.map((musica) => (
            <MusicaCard
              key={musica.id}
              musica={musica}
              onSelect={abrir}
              ansioso={musica.id === destaque.id}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-10 py-8">
          {prateleiras.map((prateleira) => (
            <PrateleiraMusicas
              key={prateleira.genero.slug}
              prateleira={prateleira}
              onSelect={abrir}
              destaqueId={destaque.id}
            />
          ))}
        </div>
      )}

      {selecionada && (
        <MusicaDetalhe musica={selecionada} onClose={fechar} />
      )}
    </>
  );
}
