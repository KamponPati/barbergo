import type { Role } from "./types";

export function parseRoleFromUrl(url: string): Role | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, "");
    if (path === "customer" || path === "partner" || path === "admin") {
      return path;
    }
    if (parsed.hostname === "customer" || parsed.hostname === "partner" || parsed.hostname === "admin") {
      return parsed.hostname;
    }
    return null;
  } catch {
    return null;
  }
}
