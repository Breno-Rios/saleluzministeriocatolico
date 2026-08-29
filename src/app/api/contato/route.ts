import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  submissionsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function escapeHtml(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderEmailHtml({
  nome,
  telefone,
  email,
  celebracao,
  data,
  mensagem,
}: {
  nome: string;
  telefone: string;
  email: string;
  celebracao: string;
  data: string;
  mensagem: string;
}): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;width:150px;color:#8a8a8a;font-size:13px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;color:#14181c;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2d8c4;border-radius:12px;overflow:hidden;">
      <div style="background:#0f1f33;padding:28px 32px;text-align:center;">
        <img src="https://saleluzministeriocatolico.com.br/images/logo-circle.jpg" width="48" height="48" alt="Banda Sal & Luz" style="border-radius:50%;display:block;margin:0 auto 12px;" />
        <p style="margin:0;font-size:18px;font-weight:bold;letter-spacing:1px;color:#e3b673;">BANDA SAL &amp; LUZ</p>
        <p style="margin:4px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#5fc1d4;">Ministério Católico</p>
      </div>

      <div style="padding:32px;">
        <p style="margin:0 0 20px;font-size:17px;font-weight:bold;color:#14181c;">Novo pedido de orçamento</p>

        <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;">
          ${row("Nome", nome)}
          ${row("Telefone/WhatsApp", telefone)}
          ${row("E-mail", email)}
          ${row("Celebração", celebracao)}
          ${row("Data prevista", data)}
        </table>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8a8a8a;">Mensagem</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#14181c;">${mensagem}</p>
        </div>
      </div>

      <div style="padding:18px 32px;background:#faf6ef;text-align:center;">
        <p style="margin:0;font-size:12px;font-style:italic;color:#8f7a5c;">
          &ldquo;Vós sois o sal da terra. Vós sois a luz do mundo.&rdquo; — Mt 5, 13-14
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    return NextResponse.json(
      { ok: false, error: "E-mail não configurado neste ambiente." },
      { status: 500 },
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  const form = await request.formData();

  // Campo isca: invisível para gente de verdade, mas bots costumam
  // preencher todo campo que encontram. Se vier algo, finge sucesso
  // sem enviar nada, pra não revelar ao bot que foi bloqueado.
  if (form.get("empresa")) {
    return NextResponse.json({ ok: true });
  }

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
      html: renderEmailHtml({
        nome,
        telefone,
        email: escapeHtml(email),
        celebracao,
        data,
        mensagem,
      }),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Falha ao enviar. Tente novamente." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
