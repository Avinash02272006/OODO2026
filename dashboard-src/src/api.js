import axios from 'axios';

// Create interceptor for Unified Auth Strategy
const api = axios.create({
    baseURL: '/api', // Use relative path to leverage Vite proxy
});

// Automatically inject JWT from localStorage
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle Auth Errors (401/403)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Force logout if token invalid
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                // window.location.href = '/login'; // Let React Router handle this
            }
        }
        return Promise.reject(error);
    }
);

export { api };
export default api;
