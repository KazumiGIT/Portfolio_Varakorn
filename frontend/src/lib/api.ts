import type { Floor, Profile } from "@/types/game";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  floors: () => request<Floor[]>("/floors"),
  floor: (id: number) => request<Floor>(`/floors/${id}`),
  profile: () => request<Profile>("/profile"),
  sendContact: (body: { name: string; email: string; message: string; honeypot?: string }) =>
    request<{ ok: boolean; id: string | null; detail: string | null }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  chat: (body: {
    message: string;
    history: { role: "user" | "assistant"; content: string }[];
  }) =>
    request<{ reply: string; source: "gemini" | "faq" }>("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
