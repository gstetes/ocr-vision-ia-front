import Axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL

const api = Axios.create({
  baseURL: API_URL,
});

export default api;