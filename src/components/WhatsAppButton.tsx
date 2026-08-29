import { whatsAppUrl } from "@/lib/whatsapp";

const WHATSAPP_MESSAGE =
  "Olá! Gostaria de solicitar um orçamento com a Banda Sal & Luz.";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsAppUrl(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-gold) text-[#14181c] shadow-lg shadow-black/20 transition-transform hover:scale-105 hover:bg-(--color-gold-strong) sm:right-6"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </a>
  );
}
