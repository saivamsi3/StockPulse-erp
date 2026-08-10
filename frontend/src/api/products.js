import { apiFetch } from './client';

export function listProducts(params) {
  return apiFetch('/products', { params });
}

export function getProduct(id) {
  return apiFetch(`/products/${id}`);
}

export function createProduct(body) {
  return apiFetch('/products', { method: 'POST', body });
}

export function updateProduct(id, body) {
  return apiFetch(`/products/${id}`, { method: 'PUT', body });
}

export function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

export function adjustStock(id, body) {
  return apiFetch(`/products/${id}/stock`, { method: 'POST', body });
}

export function listProductMovements(id, params) {
  return apiFetch(`/products/${id}/movements`, { params });
}

export function listCategories() {
  return apiFetch('/products/categories');
}
