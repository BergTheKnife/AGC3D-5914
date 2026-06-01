import { createAuthClient } from "better-auth/react";

export const TOKEN_KEY = "bearer_token";
// Flag stored in localStorage telling us whether the session should persist
// across browser restarts (localStorage) or only for the current session
// (sessionStorage). Defaults to persistent.
const REMEMBER_KEY = "remember_me";

function persistent(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== "0";
}

export function setRemember(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

// Read the token from whichever storage currently holds it.
export function getToken(): string {
  return (
    localStorage.getItem(TOKEN_KEY) ??
    sessionStorage.getItem(TOKEN_KEY) ??
    ""
  );
}

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getToken(),
    },
  },
});

// Save the token in the right storage based on the "remember me" preference.
export function captureToken(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (!token) return;
  if (persistent()) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
