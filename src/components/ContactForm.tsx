"use client";

import { useState, type FormEvent } from "react";
import { whatsAppUrl } from "@/lib/whatsapp";

type Status = "idle" | "sending" | "sent" | "error";

const CELEBRATION_OPTIONS = [
  "Casamento",
  "Batismo",
  "Aniversário",
  "Primeira Comunhão",
  "Renovação de Votos Matrimoniais (Bodas)",
  "Casamento e Recepção",
  "Casamento Comunitário",
];

const DEFAULT_ERROR = "Não foi possível enviar. Tente novamente em instantes.";

function formatDataBr(value: FormDataEntryValue | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return "não informada";
  const [, ano, mes, dia] = match;
  return `${dia}/${mes}/${ano}`;
}

function buildWhatsAppFallbackUrl(form: FormData): string {
  const tipoCelebracao = form.get("tipoCelebracao");
  const celebracao =
    tipoCelebracao === "Outro" ? form.get("tipoCelebracaoOutro") : tipoCelebracao;

  const message = [
    "Olá! Tentei enviar um pedido de orçamento pelo site, mas não deu certo. Seguem meus dados:",
    "",
    `Nome: ${form.get("nome") || "não informado"}`,
    `Telefone/WhatsApp: ${form.get("telefone") || "não informado"}`,
    `E-mail: ${form.get("email") || "não informado"}`,
    `Celebração: ${celebracao || "não informada"}`,
    `Data prevista: ${formatDataBr(form.get("data"))}`,
    "",
    `Mensagem: ${form.get("mensagem") || ""}`,
  ].join("\n");

  return whatsAppUrl(message);
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(DEFAULT_ERROR);
  const [fallbackWhatsAppUrl, setFallbackWhatsAppUrl] = useState<string | null>(
    null,
  );
  const [celebrationType, setCelebrationType] = useState("");
  const isOther = celebrationType === "Outro";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contato", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error || DEFAULT_ERROR);
        setFallbackWhatsAppUrl(buildWhatsAppFallbackUrl(formData));
        setStatus("error");
        return;
      }
      setStatus("sent");
      setCelebrationType("");
      form.reset();
    } catch {
      setErrorMessage(DEFAULT_ERROR);
      setFallbackWhatsAppUrl(buildWhatsAppFallbackUrl(formData));
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center">
        <p className="font-condensed text-2xl font-bold text-(--color-gold)">
          Mensagem enviada!
        </p>
        <p className="mt-2 text-(--color-text-muted)">
          Obrigado pelo contato. Vamos responder em breve com os detalhes do
          orçamento.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-(--color-teal) underline underline-offset-4 hover:text-(--color-teal-strong)"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome" name="nome" type="text" required />
        <Field label="Telefone / WhatsApp" name="telefone" type="tel" required />
      </div>
      <Field label="E-mail" name="email" type="email" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-(--color-text)">
            Tipo de celebração
          </span>
          <div className="relative">
            <select
              name="tipoCelebracao"
              required
              value={celebrationType}
              onChange={(event) => setCelebrationType(event.target.value)}
              className="w-full appearance-none rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3 pr-10 text-(--color-text) outline-none transition-colors focus:border-(--color-teal)"
            >
              <option value="" disabled>
                Selecione...
              </option>
              {CELEBRATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="Outro">Outro</option>
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </label>
        <Field label="Data prevista" name="data" type="date" />
      </div>
      {isOther && (
        <Field
          label="Qual celebração?"
          name="tipoCelebracaoOutro"
          type="text"
          required
          placeholder="Descreva o tipo de celebração"
        />
      )}
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-(--color-text)">Mensagem</span>
        <textarea
          name="mensagem"
          required
          rows={4}
          placeholder="Conte um pouco sobre o evento e o que você precisa"
          className="rounded-lg border border-(--color-border) bg-transparent px-4 py-3 text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-teal)"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-(--color-gold) px-6 py-3 font-condensed font-bold text-[#14181c] transition-colors hover:bg-(--color-gold-strong) disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Solicitar orçamento"}
      </button>
      {status === "error" && (
        <div className="grid justify-items-center gap-3 text-center">
          <p className="text-sm text-(--color-gold)">{errorMessage}</p>
          {fallbackWhatsAppUrl && (
            <a
              href={fallbackWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-text) transition-colors hover:border-(--color-gold) hover:text-(--color-gold)"
            >
              Enviar pelo WhatsApp em vez disso
            </a>
          )}
        </div>
      )}

      {/* Campo isca contra bots - invisível para pessoas de verdade */}
      <div className="sr-only" aria-hidden="true">
        <input
          type="text"
          name="empresa"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-(--color-text)">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-(--color-border) bg-transparent px-4 py-3 text-(--color-text) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-teal)"
      />
    </label>
  );
}
