import { deleteCookie, setCookie } from "cookies-next";

const names = [
  "token",
  "auth_token",
  "access_token",
  "refresh_token",
  "user_role",
  "user_name",
  "remember_session",
];
export function clearSession() {
  names.forEach((name) => deleteCookie(name, { path: "/" }));
  if (typeof window !== "undefined") {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith("pos-draft:"))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      /* Browser storage may be unavailable. */
    }
  }
}
export function saveSession(
  data: { access_token?: string; token?: string; refresh_token?: string },
  remember: boolean,
) {
  const token = data.access_token || data.token;
  if (!token) throw new Error("The server did not return an access token.");
  const options = {
    path: "/",
    sameSite: "lax" as const,
    secure: typeof location !== "undefined" && location.protocol === "https:",
    ...(remember ? { maxAge: 60 * 60 * 24 * 14 } : {}),
  };
  setCookie("token", token, options);
  if (data.refresh_token)
    setCookie("refresh_token", data.refresh_token, options);
  setCookie("remember_session", remember ? "yes" : "no", options);
}
