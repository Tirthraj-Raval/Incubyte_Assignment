// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Products API
export const productsAPI = {
  getAll: () => apiRequest('/sweets'),
  getById: (id: string) => apiRequest(`/sweets/${id}`),
  search: (params: { name?: string; category?: string; minPrice?: number; maxPrice?: number }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    return apiRequest(`/sweets/search?${queryParams}`);
  },
  create: (productData: any) =>
    apiRequest('/sweets', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  update: (id: string, productData: any) =>
    apiRequest(`/sweets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  delete: (id: string) =>
    apiRequest(`/sweets/${id}`, {
      method: 'DELETE',
    }),
  purchase: (id: string, quantity: number) =>
    apiRequest(`/sweets/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }),
  restock: (id: string, quantity: number) =>
    apiRequest(`/sweets/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),
  getById: (id: string) => apiRequest(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => apiRequest('/cart'),
  add: (productId: string, quantity: number) =>
    apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }),
  update: (itemId: string, quantity: number) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  remove: (itemId: string) =>
    apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    }),
  clear: () =>
    apiRequest('/cart', {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiRequest('/orders'),
  getById: (id: string) => apiRequest(`/orders/${id}`),
  create: (orderData: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  updateStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Admin API
export const adminAPI = {
  getStats: () => apiRequest('/admin/stats'),
  getOrders: (page: number = 1, limit: number = 10, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    return apiRequest(`/admin/orders?${params}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getProducts: (page: number = 1, limit: number = 10) =>
    apiRequest(`/admin/products?page=${page}&limit=${limit}`),
  getCustomers: (page: number = 1, limit: number = 10) =>
    apiRequest(`/admin/customers?page=${page}&limit=${limit}`),
  deleteProduct: (id: string) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'DELETE',
    }),
};

export default apiRequest;