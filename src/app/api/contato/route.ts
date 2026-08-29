import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function escapeHtml(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    return NextResponse.json(
      { ok: false, error: "E-mail não configurado neste ambiente." },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const nome = escapeHtml(form.get("nome"));
  const telefone = escapeHtml(form.get("telefone"));
  const email = form.get("email");
  const tipoCelebracao = form.get("tipoCelebracao");
  const tipoCelebracaoOutro = form.get("tipoCelebracaoOutro");
  const data = escapeHtml(form.get("data")) || "não informada";
  const mensagem = escapeHtml(form.get("mensagem")).replace(/\n/g, "<br>");

  const celebracao = escapeHtml(
    tipoCelebracao === "Outro" ? tipoCelebracaoOutro : tipoCelebracao,
  );

  const recipients = process.env.CONTACT_EMAIL.split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "Banda Sal & Luz <contato@saleluzministeriocatolico.com.br>",
      to: recipients,
      replyTo: typeof email === "string" && email ? email : undefined,
      subject: `Pedido de orçamento — ${nome || "sem nome"}`,
      html: `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Telefone/WhatsApp:</strong> ${telefone}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Celebração:</strong> ${celebracao}</p>
        <p><strong>Data prevista:</strong> ${data}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem}</p>
      `,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Falha ao enviar. Tente novamente." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
