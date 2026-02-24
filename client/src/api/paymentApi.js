import api from './axios';

/**
 * Payment API functions
 */

// Create payment intent for mentoring session
export const createPaymentIntent = async (sessionId, amount) => {
  try {
    const response = await api.post('/payments/create-intent', {
      sessionId,
      amount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await api.post('/payments/confirm', {
      paymentIntentId,
      paymentMethodId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment history
export const getPaymentHistory = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/payments/history/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request refund
export const requestRefund = async (paymentId, reason) => {
  try {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add payment method
export const addPaymentMethod = async (userId, paymentMethodData) => {
  try {
    const response = await api.post(`/payments/methods/${userId}`, paymentMethodData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment methods
export const getPaymentMethods = async (userId) => {
  try {
    const response = await api.get(`/payments/methods/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (userId, methodId) => {
  try {
    const response = await api.delete(`/payments/methods/${userId}/${methodId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (userId, methodId) => {
  try {
    const response = await api.patch(`/payments/methods/${userId}/${methodId}/default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get mentor earnings summary
export const getEarningsSummary = async (mentorId) => {
  try {
    const response = await api.get(`/payments/earnings/${mentorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request payout
export const requestPayout = async (mentorId, amount, accountDetails) => {
  try {
    const response = await api.post(`/payments/payout/${mentorId}`, {
      amount,
      accountDetails,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payout history
export const getPayoutHistory = async (mentorId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/payments/payout/${mentorId}/history`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
