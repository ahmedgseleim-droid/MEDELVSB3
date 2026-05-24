const TOKEN_KEY = "samba2_auth_token";
const ROLE_KEY  = "samba2_role";
const USER_KEY  = "samba2_username";

export type UserRole = "admin" | "staff";

export function getStoredToken(): string | null  { return sessionStorage.getItem(TOKEN_KEY); }
export function getStoredRole(): UserRole | null  { return sessionStorage.getItem(ROLE_KEY) as UserRole | null; }
export function getStoredUsername(): string | null { return sessionStorage.getItem(USER_KEY); }

export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export async function login(
  username: string,
  password: string
): Promise<{ role: UserRole; username: string } | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { token: string; role: UserRole; username: string };
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(ROLE_KEY, data.role);
    sessionStorage.setItem(USER_KEY, data.username);
    return { role: data.role, username: data.username };
  } catch {
    return null;
  }
}
