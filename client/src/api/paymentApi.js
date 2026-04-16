import api from './axios';

export const createPaymentIntent = (data) => api.post('/payments/intent', data);
export const getMyPayments = () => api.get('/payments/my');
export const verifyPayment = (data) => api.post('/payments/verify', data);
