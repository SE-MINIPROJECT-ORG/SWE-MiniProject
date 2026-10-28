const BASE_URL = import.meta.env.VITE_API_URL || '';

// Small wrapper around fetch. Errors carry the status and the code from the standard
// error format (SAD section 4.4.1).
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error((data && data.error && data.error.message) || 'Request failed');
    error.status = response.status;
    error.code = data && data.error ? data.error.code : undefined;
    throw error;
  }
  return data;
}
