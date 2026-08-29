"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#historia", label: "Nossa História" },
  { href: "#lancamento", label: "Lançamento" },
  { href: "#folheto", label: "Folhetos do Dia" },
  { href: "#contato", label: "Contato" },
];

export default function Header({ showLogout = false }: { showLogout?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const toHome = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg)/85 shadow-lg shadow-black/5 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-6 py-3">
          <a href={isHome ? "#top" : "/"} className="flex items-center gap-3">
            <Image
              src="/images/logo-circle.jpg"
              alt="Logo Banda Sal & Luz"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <span className="font-condensed text-lg font-bold tracking-wide">
              SAL &amp; LUZ
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={toHome(link.href)}
                className="text-sm font-medium text-(--color-text-muted) transition-colors hover:text-(--color-gold)"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {showLogout && (
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-medium text-(--color-text-muted) underline underline-offset-4 transition-colors hover:text-(--color-gold)"
                >
                  Sair
                </button>
              </form>
            )}
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-(--color-border) text-(--color-text) md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d={open ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-(--color-border) px-6 py-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={toHome(link.href)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-gold)"
              >
                {link.label}
              </a>
            ))}
            {showLogout && (
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-(--color-text-muted) hover:bg-(--color-surface) hover:text-(--color-gold)"
                >
                  Sair
                </button>
              </form>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
