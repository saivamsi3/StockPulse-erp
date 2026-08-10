const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('stockpulse_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('stockpulse_token', token);
  else localStorage.removeItem('stockpulse_token');
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers = {}, params } = options;

  let url = `${API_URL}${path}`;
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }

  const token = getToken();
  const config = { method, headers: { ...headers } };
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    const error = new Error('Network error - is the backend running?');
    error.status = 0;
    error.details = [err.message];
    throw error;
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const error = new Error(payload?.error?.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.details = payload?.error?.details;
    if (res.status === 401) {
      setToken(null);
    }
    throw error;
  }

  return payload;
}

export function qs(params) {
  return params;
}
