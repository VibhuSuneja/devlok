import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We will inject the token via a custom hook or interceptor in App.jsx
export default api;

