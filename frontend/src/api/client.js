import axios from 'axios';

const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

// jwt token attachment to requests 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//  global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem("token");
      
      window.location.href = "/login";
      
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
        console.error("Access denied");
        // 403 Forbidden custom page redirection
    }

    return Promise.reject(error);
  }
);

export default api;

