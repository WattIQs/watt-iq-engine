export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(
  email: string,
  code: string,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY não configurada");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "WattIQ",
        email: "COLOQUE_AQUI_SEU_EMAIL_VERIFICADO_NO_BREVO",
      },
      to: [
        {
          email,
        },
      ],
      subject: "Seu código de confirmação WattIQ",
      htmlContent: `
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
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar e-mail: ${error}`);
  }
}
