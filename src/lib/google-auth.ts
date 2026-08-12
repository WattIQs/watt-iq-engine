const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const AUTH_REDIRECT_URL = process.env.AUTH_REDIRECT_URL;

export function getGoogleLoginUrl() {
  if (!GOOGLE_CLIENT_ID || !AUTH_REDIRECT_URL) {
    throw new Error("GOOGLE_CLIENT_ID ou AUTH_REDIRECT_URL não configurado");
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: AUTH_REDIRECT_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !AUTH_REDIRECT_URL) {
    throw new Error("Variáveis do Google OAuth não configuradas");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: AUTH_REDIRECT_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google OAuth falhou: ${await response.text()}`);
  }

  return response.json();
}
