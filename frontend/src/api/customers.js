import { apiFetch } from './client';

export function listCustomers(params) {
  return apiFetch('/customers', { params });
}

export function getCustomer(id) {
  return apiFetch(`/customers/${id}`);
}

export function createCustomer(body) {
  return apiFetch('/customers', { method: 'POST', body });
}

export function updateCustomer(id, body) {
  return apiFetch(`/customers/${id}`, { method: 'PUT', body });
}

export function deleteCustomer(id) {
  return apiFetch(`/customers/${id}`, { method: 'DELETE' });
}

export function listFollowUps(id) {
  return apiFetch(`/customers/${id}/follow-ups`);
}

export function addFollowUp(id, note) {
  return apiFetch(`/customers/${id}/follow-ups`, { method: 'POST', body: { note } });
}
