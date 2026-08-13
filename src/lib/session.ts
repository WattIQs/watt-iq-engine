import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "wattiq_session";

const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || "";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

function sign(value: string): string {
  if (!SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET não está configurada no ambiente.",
    );
  }

  return createHmac(
    "sha256",
    SESSION_SECRET,
  )
    .update(value)
    .digest("base64url");
}

function parseCookieHeader(
  request: Request,
): Record<string, string> {
  const header = request.headers.get("cookie");

  if (!header) {
    return {};
  }

  const cookies: Record<string, string> = {};

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const name = part
      .slice(0, separator)
      .trim();

    const value = part
      .slice(separator + 1)
      .trim();

    if (name) {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function createSessionCookie(
  user: SessionUser,
): string {
  if (!SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET não está configurada no ambiente.",
    );
  }

  const normalizedUser: SessionUser = {
    sub: String(user.sub),
    email: String(user.email)
      .trim()
      .toLowerCase(),
    name:
      String(user.name || "").trim() ||
      String(user.email)
        .split("@")[0]
        .trim(),
    picture:
      typeof user.picture === "string"
        ? user.picture
        : "",
  };

  const value = Buffer.from(
    JSON.stringify(normalizedUser),
    "utf8",
  ).toString("base64url");

  const signature = sign(value);

  return [
    `${SESSION_COOKIE}=${value}.${signature}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=604800",
  ].join("; ");
}

export function getSessionUser(
  request: Request,
): SessionUser | null {
  if (!SESSION_SECRET) {
    console.error(
      "AUTH SESSION: SESSION_SECRET não configurada.",
    );

    return null;
  }

  const cookies =
    parseCookieHeader(request);

  const rawCookie =
    cookies[SESSION_COOKIE];

  if (!rawCookie) {
    return null;
  }

  try {
    const separatorIndex =
      rawCookie.lastIndexOf(".");

    if (separatorIndex <= 0) {
      console.error(
        "AUTH SESSION: cookie sem assinatura válida.",
      );

      return null;
    }

    const value = rawCookie.slice(
      0,
      separatorIndex,
    );

    const signature =
      rawCookie.slice(
        separatorIndex + 1,
      );

    if (!value || !signature) {
      return null;
    }

    const expectedSignature =
      sign(value);

    const receivedBuffer =
      Buffer.from(
        signature,
        "base64url",
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "base64url",
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      console.error(
        "AUTH SESSION: tamanho da assinatura inválido.",
      );

      return null;
    }

    if (
      !timingSafeEqual(
        receivedBuffer,
        expectedBuffer,
      )
    ) {
      console.error(
        "AUTH SESSION: assinatura inválida.",
      );

      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(
        value,
        "base64url",
      ).toString("utf8"),
    ) as Partial<SessionUser>;

    if (
      typeof decoded.sub !== "string" ||
      !decoded.sub.trim() ||
      typeof decoded.email !== "string" ||
      !decoded.email.trim()
    ) {
      console.error(
        "AUTH SESSION: dados de usuário inválidos.",
      );

      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email
        .trim()
        .toLowerCase(),
      name:
        typeof decoded.name === "string" &&
        decoded.name.trim()
          ? decoded.name
          : decoded.email.split("@")[0],
      picture:
        typeof decoded.picture === "string"
          ? decoded.picture
          : "",
    };
  } catch (error) {
    console.error(
      "AUTH SESSION: erro ao validar cookie:",
      error,
    );

    return null;
  }
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}
