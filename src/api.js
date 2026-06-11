import axios from 'axios';

const api = axios.create({
  baseURL: 'https://morale-bacterium-avid.ngrok-free.app',
  headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
