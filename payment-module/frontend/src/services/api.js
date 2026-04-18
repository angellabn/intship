import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);

// Payments
export const getPayments = (params) => API.get('/payments', { params });
export const getPaymentById = (id) => API.get(`/payments/${id}`);
export const processPayment = (data) => API.post('/payments/process', data);
export const refundPayment = (id) => API.post(`/payments/${id}/refund`);
export const getStats = () => API.get('/payments/stats');

// Orders
export const getOrders = () => API.get('/orders');
export const createOrder = (data) => API.post('/orders', data);
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });
