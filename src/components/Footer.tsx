import Image from "next/image";
import { whatsAppUrl } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="border-t border-(--color-border) px-6 py-6 text-sm text-(--color-text-muted)">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-circle.jpg"
            alt="Logo Banda Sal & Luz"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-condensed font-bold text-(--color-text)">
              BANDA SAL &amp; LUZ
            </p>
            <p className="text-xs">Ministério Católico</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
        <a
          href="mailto:contato.bandasaleluz@gmail.com"
          aria-label="E-mail"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </a>

        <a
          href={whatsAppUrl("")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </a>

        <a
          href="https://www.instagram.com/saleluz_ministeriocatolico"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
          </svg>
        </a>

        <a
          href="https://www.youtube.com/@saleluzministeriocatolico"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect x="3" y="6" width="18" height="12" rx="4" />
            <path d="M10 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none" />
          </svg>
        </a>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-6xl border-t border-(--color-border) pt-4 text-center text-xs">
        © {new Date().getFullYear()} Banda Sal &amp; Luz. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
