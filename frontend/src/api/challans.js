import { apiFetch } from './client';

export function listChallans(params) {
  return apiFetch('/challans', { params });
}

export function getChallan(id) {
  return apiFetch(`/challans/${id}`);
}

export function createChallan(body) {
  return apiFetch('/challans', { method: 'POST', body });
}

export function confirmChallan(id) {
  return apiFetch(`/challans/${id}/confirm`, { method: 'PUT' });
}

export function cancelChallan(id) {
  return apiFetch(`/challans/${id}/cancel`, { method: 'PUT' });
}
