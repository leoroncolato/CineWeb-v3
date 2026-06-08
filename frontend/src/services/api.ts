import axios from 'axios';

const TOKEN_KEY = 'cineweb_admin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to format errors seamlessly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 400/409 errors here if we want or just pass them down
    return Promise.reject(error);
  }
);

export default api;
