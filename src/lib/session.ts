import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "wattiq_session";
const SESSION_SECRET = process.env.SESSION_SECRET;

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

function sign(value: string) {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

export function createSessionCookie(user: SessionUser) {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not configured");
  }

  const value = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = sign(value);

  return `${SESSION_COOKIE}=${value}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

export function getSessionUser(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader || !SESSION_SECRET) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE}=`),
  );

  if (!sessionCookie) return null;

  try {
    const rawValue = sessionCookie.slice(`${SESSION_COOKIE}=`.length);
    const separatorIndex = rawValue.lastIndexOf(".");

    if (separatorIndex === -1) return null;

    const value = rawValue.slice(0, separatorIndex);
    const signature = rawValue.slice(separatorIndex + 1);

    if (!value || !signature) return null;

    const expectedSignature = sign(value);

    const signatureBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const user = JSON.parse(
      Buffer.from(value, "base64url").toString("utf-8"),
    ) as SessionUser;

    if (!user.sub || !user.email) return null;

    return user;
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}