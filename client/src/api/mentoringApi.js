import api from './axios';

const BASE = '/mentors';

export const getMentors = (params = {}) =>
  api.get(BASE, { params });

export const getMentorById = (mentorId) =>
  api.get(`${BASE}/${mentorId}`);

export const getMyMentorProfile = () =>
  api.get(`${BASE}/me`);

export const registerAsMentor = (data) =>
  api.post(`${BASE}/register`, data);

export const updateMentorProfile = (data) =>
  api.patch(`${BASE}/profile`, data);

export const setAvailability = (data) =>
  api.put(`${BASE}/availability`, data);

export const getMentorAvailability = (mentorId, params = {}) =>
  api.get(`${BASE}/${mentorId}/availability`, { params });

export const bookSession = (mentorId, data) =>
  api.post(`${BASE}/${mentorId}/book`, data);

export const getMyBookings = (params = {}) =>
  api.get(`${BASE}/bookings/my`, { params });

export const getBookingById = (bookingId) =>
  api.get(`${BASE}/bookings/${bookingId}`);

export const confirmBooking = (bookingId) =>
  api.patch(`${BASE}/bookings/${bookingId}/confirm`);

export const cancelBooking = (bookingId) =>
  api.patch(`${BASE}/bookings/${bookingId}/cancel`);

export const completeBooking = (bookingId) =>
  api.patch(`${BASE}/bookings/${bookingId}/complete`);

export const markNoShow = (bookingId) =>
  api.patch(`${BASE}/bookings/${bookingId}/no-show`);

export const submitReview = (bookingId, data) =>
  api.post(`${BASE}/bookings/${bookingId}/review`, data);

export const getMentorReviews = (mentorId, params = {}) =>
  api.get(`${BASE}/${mentorId}/reviews`, { params });

export const respondToReview = (mentorId, reviewId, data) =>
  api.patch(`${BASE}/${mentorId}/reviews/${reviewId}/respond`, data);

export const verifyMentor = (mentorId) =>
  api.patch(`${BASE}/${mentorId}/verify`);

export const suspendMentor = (mentorId, data = {}) =>
  api.patch(`${BASE}/${mentorId}/suspend`, data);
