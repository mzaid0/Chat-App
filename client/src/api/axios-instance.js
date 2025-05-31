import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      toast.error(error.response.data.message || 'An error occurred');
    } else {
      toast.error('Network error');
    }
    return Promise.reject(error);
  }
);

export default api;