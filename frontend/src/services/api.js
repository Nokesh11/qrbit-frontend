import axios from 'axios';
const BACKEND_URI = 'https://qrbit-backend.onrender.com';

const api = axios.create({
  baseURL: `${BACKEND_URI}/api`, // Keeping the original URL as per request to not change functionality yet
});

export const getClasses = () => api.get('/classes');
export const getQR = (sessionId) => api.get(`/qr?sessionId=${sessionId}`);
export const getAttendanceCount = (sessionId) => api.get(`/attendance/count?sessionId=${sessionId}`);
// ... add other endpoints as needed, or just use raw axios in components for now if convenient, but service is better.

export default api;
