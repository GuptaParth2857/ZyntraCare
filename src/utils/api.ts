export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function fetchJsonThen<T>(url: string): Promise<T | null> {
  return fetch(url)
    .then(res => {
      if (!res.ok) return null;
      return res.text();
    })
    .then(text => {
      if (!text || text.trim() === '') return null;
      return JSON.parse(text) as T;
    })
    .catch(() => null);
}