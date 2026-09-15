"use client";

import Image from "next/image";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ConfirmDialog from "./ConfirmDialog";
import {
  excluirGenero,
  excluirMusica,
  salvarGenero,
  salvarMusica,
  type EstadoForm,
} from "@/app/admin/musicas/actions";
import { buscar } from "@/lib/busca";
import {
  capaDaMusica,
  capaOtimizavel,
  type Genero,
  type Musica,
} from "@/lib/musicas";

const CAMPO =
  "w-full rounded-lg border border-(--color-border) bg-transparent px-4 py-2.5 text-sm text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted)/60 focus:border-(--color-teal)";
const ROTULO = "text-xs font-medium uppercase tracking-widest text-(--color-text-muted)";

export default function AdminMusicasPanel({
  musicas,
  generos,
}: {
  musicas: Musica[];
  generos: Genero[];
}) {
  const [aba, setAba] = useState<"musicas" | "generos">("musicas");
  const [editando, setEditando] = useState<Musica | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-condensed text-3xl font-bold sm:text-4xl">
          Músicas
        </h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-(--color-text-muted) underline underline-offset-4 transition-colors hover:text-(--color-gold)"
        >
          Voltar ao Folheto do Dia
        </Link>
      </div>

      <nav className="mt-6 flex gap-2">
        {(["musicas", "generos"] as const).map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => setAba(valor)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
              aba === valor
                ? "border-(--color-gold) text-(--color-gold)"
                : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-gold) hover:text-(--color-gold)"
            }`}
          >
            {valor === "musicas" ? "Músicas" : "Gêneros"}
          </button>
        ))}
      </nav>

      {aba === "musicas" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <ListaMusicas
            musicas={musicas}
            generos={generos}
            editando={editando}
            onEditar={setEditando}
          />
          <FormMusica
            key={editando?.id ?? "nova"}
            musica={editando}
            generos={generos}
            onConcluir={() => setEditando(null)}
          />
        </div>
      ) : (
        <PainelGeneros generos={generos} />
      )}
    </div>
  );
}

function ListaMusicas({
  musicas,
  generos,
  editando,
  onEditar,
}: {
  musicas: Musica[];
  generos: Genero[];
  editando: Musica | null;
  onEditar: (musica: Musica | null) => void;
}) {
  const [consulta, setConsulta] = useState("");
  const [genero, setGenero] = useState<string | null>(null);

  // Mesmo ranqueamento da página pública: título pesa mais que gênero, que
  // pesa mais que créditos e descrição.
  const visiveis = useMemo(
    () =>
      consulta.trim() === "" && !genero
        ? musicas
        : buscar(musicas, consulta, genero),
    [musicas, consulta, genero],
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => onEditar(null)}
        className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
          editando === null
            ? "border-(--color-gold) text-(--color-gold)"
            : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-gold) hover:text-(--color-gold)"
        }`}
      >
        + Nova música
      </button>

      <div className="mt-4 grid gap-2">
        <input
          type="search"
          value={consulta}
          onChange={(event) => setConsulta(event.target.value)}
          placeholder="Buscar música"
          aria-label="Buscar música"
          className={CAMPO}
        />
        <select
          value={genero ?? ""}
          onChange={(event) => setGenero(event.target.value || null)}
          aria-label="Filtrar por gênero"
          className={CAMPO}
        >
          <option value="">Todos os gêneros</option>
          {generos.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.nome}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-(--color-text-muted)">
        {visiveis.length} de {musicas.length} música(s)
      </p>

      {/* Com o catálogo inteiro empilhado, a página virava uma rolagem sem fim
          e o formulário ficava lá em cima, fora da tela. A lista rola sozinha
          e o resto do painel fica sempre à vista. */}
      <ul className="mt-4 grid max-h-[55vh] gap-2 overflow-y-auto pr-1 lg:max-h-[65vh]">
        {visiveis.map((musica) => {
          const capa = capaDaMusica(musica);
          return (
            <li key={musica.id}>
              <button
                type="button"
                onClick={() => onEditar(musica)}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  editando?.id === musica.id
                    ? "border-(--color-gold)"
                    : "border-transparent hover:border-(--color-border)"
                }`}
              >
                <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-(--color-bg-alt)">
                  <Image
                    src={capa}
                    alt=""
                    fill
                    unoptimized={!capaOtimizavel(capa)}
                    className="object-cover"
                    sizes="64px"
                  />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {musica.titulo}
                    </span>
                    {musica.destaque && (
                      <span
                        title="Em destaque no topo de /musicas"
                        className="shrink-0 text-(--color-gold)"
                      >
                        ★
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-(--color-text-muted)">
                    {musica.publicada ? "Publicada" : "Rascunho"}
                    {musica.generos.length > 0 &&
                      ` · ${musica.generos.map((g) => g.nome).join(", ")}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        {visiveis.length === 0 && (
          <li className="rounded-lg border border-(--color-border) p-4 text-center text-sm text-(--color-text-muted)">
            {musicas.length === 0
              ? "Nenhuma música cadastrada ainda."
              : "Nada encontrado com esse filtro."}
          </li>
        )}
      </ul>
    </div>
  );
}

function FormMusica({
  musica,
  generos,
  onConcluir,
}: {
  musica: Musica | null;
  generos: Genero[];
  onConcluir: () => void;
}) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(
    salvarMusica,
    {},
  );
  const form = useRef<HTMLFormElement>(null);

  // Cadastrar uma música atrás da outra é o uso normal deste formulário, então
  // ele se limpa assim que o cadastro dá certo.
  useEffect(() => {
    if (estado.ok && !musica) form.current?.reset();
  }, [estado.ok, musica]);

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
      <form ref={form} action={acao} className="grid gap-4">
        {musica && <input type="hidden" name="id" value={musica.id} />}

        <label className="grid gap-1.5">
          <span className={ROTULO}>Título</span>
          <input
            name="titulo"
            defaultValue={musica?.titulo ?? ""}
            required
            className={CAMPO}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={ROTULO}>Link ou ID do YouTube</span>
          <input
            name="youtube"
            defaultValue={musica?.youtubeId ?? ""}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className={CAMPO}
          />
        </label>

        <div className="grid gap-1.5">
          <span className={ROTULO}>Gêneros</span>
          <div className="flex flex-wrap gap-2">
            {generos.map((genero) => (
              <label
                key={genero.id}
                className="flex items-center gap-2 rounded-full border border-(--color-border) px-4 py-2 text-sm text-(--color-text-muted) transition-colors has-checked:border-(--color-gold) has-checked:text-(--color-gold)"
              >
                <input
                  type="checkbox"
                  name="generos"
                  value={genero.id}
                  defaultChecked={musica?.generos.some(
                    (atual) => atual.slug === genero.slug,
                  )}
                  className="accent-(--color-gold)"
                />
                {genero.nome}
              </label>
            ))}
            {generos.length === 0 && (
              <p className="text-sm text-(--color-text-muted)">
                Nenhum gênero criado ainda — crie na aba Gêneros.
              </p>
            )}
          </div>
        </div>

        <label className="grid gap-1.5">
          <span className={ROTULO}>Descrição</span>
          <textarea
            name="descricao"
            rows={4}
            defaultValue={musica?.descricao ?? ""}
            className={CAMPO}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={ROTULO}>Créditos</span>
          <textarea
            name="creditos"
            rows={3}
            defaultValue={musica?.creditos ?? ""}
            placeholder="Composição, arranjo, vocais..."
            className={CAMPO}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={ROTULO}>Ano</span>
            <input
              name="ano"
              type="number"
              min={1900}
              max={2100}
              defaultValue={musica?.ano ?? ""}
              className={CAMPO}
            />
          </label>

          <label className="grid gap-1.5">
            <span className={ROTULO}>Link da cifra (opcional)</span>
            <input
              name="cifra_url"
              defaultValue={musica?.cifraUrl ?? ""}
              placeholder="https://..."
              className={CAMPO}
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={ROTULO}>Imagem de capa (opcional)</span>
          <input
            name="imagem_url"
            defaultValue={musica?.imagemUrl ?? ""}
            placeholder="Em branco usa a capa do vídeo no YouTube"
            className={CAMPO}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <input
            type="checkbox"
            name="publicada"
            defaultChecked={musica?.publicada ?? true}
            className="accent-(--color-gold)"
          />
          Publicada (aparece em /musicas)
        </label>

        <label className="flex items-center gap-2 text-sm text-(--color-text-muted)">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={musica?.destaque ?? false}
            className="accent-(--color-gold)"
          />
          Destaque (ocupa o topo da página; desmarca a música anterior)
        </label>

        {estado.erro && (
          <p className="text-sm text-(--color-gold)">{estado.erro}</p>
        )}
        {estado.ok && (
          <p className="text-sm text-(--color-teal-strong)">{estado.ok}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-full bg-(--color-gold) px-6 py-2.5 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong) disabled:opacity-60"
          >
            {salvando ? "Salvando..." : musica ? "Salvar alterações" : "Cadastrar"}
          </button>

          {musica && (
            <>
              <button
                type="button"
                onClick={onConcluir}
                className="rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
              >
                Cancelar
              </button>
              <BotaoExcluir
                id={musica.id}
                acao={excluirMusica}
                titulo="Excluir música"
                descricao={`"${musica.titulo}" sai da página de músicas. Não dá para desfazer.`}
                onExcluir={onConcluir}
              />
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function PainelGeneros({ generos }: { generos: Genero[] }) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(
    salvarGenero,
    {},
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <ul className="grid gap-3">
        {generos.map((genero) => (
          <li
            key={genero.id}
            className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
          >
            <form action={acao} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={genero.id} />
              <label className="grid flex-1 gap-1.5">
                <span className={ROTULO}>Nome</span>
                <input name="nome" defaultValue={genero.nome} className={CAMPO} />
              </label>
              <label className="grid w-24 gap-1.5">
                <span className={ROTULO}>Ordem</span>
                <input
                  name="ordem"
                  type="number"
                  defaultValue={genero.ordem}
                  className={CAMPO}
                />
              </label>
              <button
                type="submit"
                className="rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
              >
                Salvar
              </button>
              <BotaoExcluir
                id={genero.id}
                acao={excluirGenero}
                titulo="Excluir gênero"
                descricao={`A prateleira "${genero.nome}" some da página. As músicas continuam cadastradas.`}
              />
            </form>
          </li>
        ))}

        {generos.length === 0 && (
          <li className="rounded-2xl border border-(--color-border) p-6 text-center text-sm text-(--color-text-muted)">
            Nenhum gênero criado ainda.
          </li>
        )}
      </ul>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        <p className={ROTULO}>Novo gênero</p>
        <form action={acao} className="mt-4 grid gap-4">
          <input name="nome" placeholder="Nome" required className={CAMPO} />
          <input
            name="ordem"
            type="number"
            placeholder="Ordem na página"
            className={CAMPO}
          />
          <button
            type="submit"
            disabled={salvando}
            className="rounded-full bg-(--color-gold) px-6 py-2.5 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong) disabled:opacity-60"
          >
            Criar
          </button>
          {estado.erro && (
            <p className="text-sm text-(--color-gold)">{estado.erro}</p>
          )}
          {estado.ok && (
            <p className="text-sm text-(--color-teal-strong)">{estado.ok}</p>
          )}
        </form>
      </div>
    </div>
  );
}

function BotaoExcluir({
  id,
  acao,
  titulo,
  descricao,
  onExcluir,
}: {
  id: number;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  titulo: string;
  descricao: string;
  onExcluir?: () => void;
}) {
  const [estado, submeter] = useActionState<EstadoForm, FormData>(acao, {});
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (estado.ok) onExcluir?.();
  }, [estado.ok, onExcluir]);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-text-muted) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={confirmando}
        title={titulo}
        description={descricao}
        confirmLabel="Excluir"
        onCancel={() => setConfirmando(false)}
        onConfirm={() => {
          setConfirmando(false);
          const dados = new FormData();
          dados.set("id", String(id));
          startTransition(() => submeter(dados));
        }}
      />
    </>
  );
}
