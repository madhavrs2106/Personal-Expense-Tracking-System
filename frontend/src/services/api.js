import axios from 'axios';

const API = axios.create({
  baseURL: 'https://personal-expense-tracking-system-s630.onrender.com/api',
});

// Inject JWT token into headers if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pets_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
