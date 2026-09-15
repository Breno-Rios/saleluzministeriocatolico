/**
 * Leitura e transposição de cifras, sobre o ChordSheetJS.
 *
 * Este módulo é sempre carregado por import dinâmico: a biblioteca tem algumas
 * centenas de KB, e quem abre /musicas para ouvir uma música não deve pagar por
 * ela. Só quem clica em "Ver cifra" baixa.
 */
import {
  Chord,
  ChordProParser,
  ChordsOverWordsParser,
  TextFormatter,
  type Song,
} from "chordsheetjs";

export type Acidente = "#" | "b";

/** Cifra em ChordPro tem o acorde entre colchetes no meio da letra. */
function ehChordPro(texto: string): boolean {
  return /\[[A-G][^\]\n]{0,12}\]/.test(texto);
}

function soAcordes(trecho: string): boolean {
  const tokens = trecho.trim().split(/\s+/);
  return tokens.length > 0 && tokens.every((token) => Chord.parse(token) !== null);
}

/**
 * Quebra "Intro: C G Am F" em duas linhas - o rótulo e os acordes.
 *
 * Sem isso a linha inteira é lida como letra: ela aparece na tela, mas os
 * acordes dela não transpõem, e o leitor acaba com a introdução num tom e o
 * resto da música em outro. Cifra brasileira quase sempre começa assim, então
 * não é caso de borda.
 */
function separarRotulos(texto: string): string {
  return texto
    .split("\n")
    .flatMap((linha) => {
      const partes = linha.match(/^(\s*[^:\n]{1,24}):[ \t]+(\S.*)$/);
      if (partes && soAcordes(partes[2])) return [`${partes[1]}:`, partes[2]];
      return [linha];
    })
    .join("\n");
}

/**
 * Notação brasileira que o ChordSheetJS não conhece.
 *
 * Isto não é capricho: basta um acorde não reconhecido numa linha para o parser
 * tratar a linha inteira como letra - e aí a cifra aparece bonita na tela e não
 * transpõe nada, sem erro nenhum. "E7/9" e "F#º" são de cifra de missa comum,
 * então quase toda cifra colada de site cairia nesse buraco.
 *
 * A troca é por token e só vale quando o resultado vira acorde de verdade, para
 * não mexer em palavra da letra: "24/7" continua "24/7", "dimensão" continua
 * inteira.
 */
function normalizarNotacao(texto: string): string {
  return texto.replace(/\S+/g, (token) => {
    const trocado = token
      .replace(/º/g, "dim")
      // 7M é como o Brasil escreve o acorde com sétima maior.
      .replace(/7M/g, "maj7")
      .replace(/6[/(]9\)?/g, "69")
      // "E7/9" e "E7(9)" são a mesma coisa que "E9" na notação que a
      // biblioteca entende.
      .replace(/7[/(](\d+)\)?/g, "$1");

    if (trocado === token) return token;
    return Chord.parse(trocado) ? trocado : token;
  });
}

/**
 * De volta à grafia daqui, depois de transpor.
 *
 * A normalização da entrada é o que faz a biblioteca reconhecer os acordes, mas
 * ela devolve "Gsus", "Gma7" e "Gdim" onde a banda escreve "G4", "G7M" e "Gº".
 * Como o sufixo é editável, a viagem é de ida e volta e o leitor vê a cifra na
 * linguagem em que ele lê.
 *
 * Duas grafias não voltam. "E7/9" sai como "E9", o mesmo acorde escrito da
 * outra forma - mapear todo "9" de volta mexeria em quem digitou "E9" de
 * propósito. E "G4" sai como "Gsus", porque quem troca é o formatador, na hora
 * de renderizar; consertar exigiria reescrever o texto já formatado, onde
 * "sus" também aparece no meio de "Jesus".
 */
const GRAFIA_BR: Record<string, string> = {
  ma7: "7M",
  maj7: "7M",
  dim: "º",
  dim7: "º7",
  "69": "6/9",
};

function abrasileirar(song: Song): Song {
  return song.changeChords((acorde) => {
    const troca = GRAFIA_BR[acorde.suffix ?? ""];
    return troca ? acorde.set({ suffix: troca }) : acorde;
  });
}

function interpretar(texto: string): Song {
  const normalizado = normalizarNotacao(texto);
  return ehChordPro(normalizado)
    ? new ChordProParser().parse(normalizado)
    : new ChordsOverWordsParser().parse(separarRotulos(normalizado));
}

export type LinhaCifra = {
  texto: string;
  /** Linha só de acordes - é ela que a página pinta. */
  acordes: boolean;
};

export type CifraPreparada = {
  /** Formata a cifra já interpretada, transposta em `semitons`. */
  formatar(semitons: number, acidente: Acidente): string;
  /** A mesma coisa, linha a linha, dizendo quais são de acorde. */
  formatarLinhas(semitons: number, acidente: Acidente): LinhaCifra[];
  /**
   * Falso quando nenhum acorde foi reconhecido - a cifra aparece, mas os
   * controles de tom não teriam efeito nenhum. Melhor dizer isso do que deixar
   * o leitor apertando um botão que não faz nada.
   */
  transponivel: boolean;
};

/**
 * Interpreta a cifra uma vez e devolve algo que formata quantas vezes for
 * preciso.
 *
 * A separação existe porque o custo está na interpretação: numa cifra de ~2 KB
 * são uns 33ms para interpretar contra 38ms para transpor e formatar. Refazer
 * tudo a cada clique no botão de tom somava 60ms+ por toque, o suficiente para
 * o controle parecer emperrado num celular modesto.
 *
 * O acidente é escolha de quem lê: transpor três semitons acima de Dó dá Ré#
 * para o ChordSheetJS, mas todo músico escreve Mib. Como acertar sozinho exigiria
 * conhecer a tonalidade de destino, quem lê decide.
 */
export function prepararCifra(texto: string): CifraPreparada {
  const original = interpretar(texto);

  const formatar: CifraPreparada["formatar"] = (semitons, acidente) => {
    let song = semitons === 0 ? original : original.transpose(semitons);
    if (acidente === "b") song = song.changeChords((c) => c.useAccidental("b"));
    return new TextFormatter().format(abrasileirar(song));
  };

  return {
    formatar,

    formatarLinhas(semitons, acidente) {
      return formatar(semitons, acidente)
        .split("\n")
        .map((texto) => ({
          texto,
          // A detecção roda sobre a notação normalizada porque a saída já veio
          // abrasileirada: "F#º" não seria reconhecido de volta como acorde.
          acordes: texto.trim() !== "" && soAcordes(normalizarNotacao(texto)),
        }));
    },
    // Um semitom acima tem de mudar alguma coisa; se não muda, é porque o
    // parser não achou acorde nenhum.
    transponivel: formatar(1, "#") !== formatar(0, "#"),
  };
}
