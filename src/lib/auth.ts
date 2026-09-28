export const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * ログイン用パスワードが正しいか判定する。
 */
export function isValidPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return expected.length > 0 && password === expected;
}

/**
 * Web Crypto API (Edge runtime のmiddlewareでも動く) でSHA-256ハッシュを計算する。
 */
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * cookie に保存するセッショントークン。
 * パスワード自体をcookieに保存しないよう、ハッシュ値を使う。
 */
export async function getSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return sha256Hex(password);
}

/**
 * リクエストのcookie値が有効なセッションかどうか判定する。
 */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const sessionToken = await getSessionToken();
  return token === sessionToken;
}
