import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(
  email: string,
  code: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada");
  }

  const { error } = await resend.emails.send({
    from: "WattIQ <onboarding@resend.dev>",
    to: email,
    subject: "Seu código de confirmação WattIQ",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
        <h1 style="margin-bottom: 8px;">Confirme seu login</h1>

        <p style="color: #666;">
          Use o código abaixo para confirmar seu acesso à WattIQ:
        </p>

        <div style="margin: 28px 0; padding: 20px; text-align: center; background: #f5f5f5; border-radius: 12px;">
          <strong style="font-size: 36px; letter-spacing: 8px;">
            ${code}
          </strong>
        </div>

        <p style="color: #777; font-size: 13px;">
          Esse código é temporário. Se você não tentou entrar na WattIQ,
          ignore este e-mail.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Erro ao enviar e-mail: ${error.message}`);
  }
}
