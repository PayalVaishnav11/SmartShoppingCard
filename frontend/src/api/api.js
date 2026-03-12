import axios from 'axios';
export const SERVER = import.meta.env.VITE_API_URL ||  `http://${window.location.hostname}:5000`;
const api = axios.create({ baseURL: SERVER, timeout: 10000 });
export default api;
