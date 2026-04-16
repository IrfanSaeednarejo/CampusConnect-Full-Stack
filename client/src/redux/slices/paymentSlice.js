import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentApi from '../../api/paymentApi';

export const createPaymentIntent = createAsyncThunk(
  'payments/createIntent',
  async (paymentData, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.createPaymentIntent(paymentData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create payment intent');
    }
  }
);

export const fetchMyPayments = createAsyncThunk(
  'payments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.getMyPayments();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch payments');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verify',
  async (verificationData, { rejectWithValue }) => {
    try {
      const { data } = await paymentApi.verifyPayment(verificationData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Payment verification failed');
    }
  }
);

const initialState = {
  payments: [],
  currentIntent: null,
  loading: false,
  error: null,
  success: false,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.currentIntent = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Payments
    builder
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;

export const selectAllPayments = (state) => state.payments.payments;
export const selectCurrentIntent = (state) => state.payments.currentIntent;
export const selectPaymentLoading = (state) => state.payments.loading;
export const selectPaymentError = (state) => state.payments.error;
export const selectPaymentSuccess = (state) => state.payments.success;

export default paymentSlice.reducer;
