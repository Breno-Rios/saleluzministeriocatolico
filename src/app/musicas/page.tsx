import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MusicasCatalogo from "@/components/MusicasCatalogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { fetchPrateleiras } from "@/lib/musicas";

export const metadata: Metadata = {
  title: "Músicas | Banda Sal & Luz",
  description:
    "O repertório da Banda Sal & Luz organizado por gênero: entrada, ofertório, comunhão, marianas e mais. Ouça, veja os créditos e acompanhe cada canto.",
};

// A página é estática, mas o catálogo vem do banco - sem isto ela congelaria
// no estado do último deploy. O painel do admin chama revalidatePath a cada
// publicação, então os cinco minutos são só o limite de quando nada é editado.
export const revalidate = 300;

export default async function Musicas() {
  const prateleiras = await fetchPrateleiras();

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <WhatsAppButton />

      {prateleiras.length === 0 ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-40 text-center">
          <h1 className="font-condensed text-3xl font-bold sm:text-4xl">
            Músicas
          </h1>
          <MusicasCatalogo prateleiras={prateleiras} />
        </section>
      ) : (
        <main className="flex-1">
          <h1 className="sr-only">Músicas da Banda Sal &amp; Luz</h1>
          <MusicasCatalogo prateleiras={prateleiras} />
        </main>
      )}

      <Footer />
    </div>
  );
}
