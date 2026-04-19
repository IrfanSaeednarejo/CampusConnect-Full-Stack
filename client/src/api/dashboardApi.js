import API from './axios';

export const getSummary = () => API.get('/dashboard/summary');
export const getTimeline = () => API.get('/dashboard/timeline');