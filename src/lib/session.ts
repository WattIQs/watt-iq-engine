const SESSION_COOKIE = "wattiq_session";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export function createSessionCookie(user: SessionUser) {
  const value = Buffer.from(JSON.stringify(user)).toString("base64url");

  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`;
}

export function getSessionUser(request: Request): SessionUser | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE}=`)
  );

  if (!sessionCookie) return null;

  try {
    const value = sessionCookie.slice(`${SESSION_COOKIE}=`.length);
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
