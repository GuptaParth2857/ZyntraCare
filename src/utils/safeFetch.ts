export async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    return safeJson<T>(res);
  } catch {
    return null;
  }
}