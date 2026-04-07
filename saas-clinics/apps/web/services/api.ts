const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request(method: string, url: string, data?: any, params?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  let fullUrl = `${BASE_URL}${url}`;
  if (params) {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)));
    if (qs.toString()) fullUrl += `?${qs}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Array.isArray(json.message) ? json.message[0] : json.message || 'Error en la petición';
    throw { message };
  }

  return json;
}

export const api = {
  get: (url: string, params?: Record<string, string>) => request('GET', url, undefined, params),
  post: (url: string, data: any) => request('POST', url, data),
  patch: (url: string, data: any) => request('PATCH', url, data),
  delete: (url: string) => request('DELETE', url),
};
