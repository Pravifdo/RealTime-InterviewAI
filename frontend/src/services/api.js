import axios from 'axios';

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL 
  ? `${process.env.REACT_APP_BACKEND_URL}/api` 
  : 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, role) => {
    return apiClient.post('/auth/login', { email, password, role });
  },
  
  register: (name, email, password, role) => {
    return apiClient.post('/auth/register', { name, email, password, role });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

// Session API
export const sessionAPI = {
  getSessions: () => {
    return apiClient.get('/sessions');
  },
  
  createSession: (sessionData) => {
    return apiClient.post('/sessions', sessionData);
  },
  
  getSessionById: (id) => {
    return apiClient.get(`/sessions/${id}`);
  },
  
  updateSession: (id, sessionData) => {
    return apiClient.put(`/sessions/${id}`, sessionData);
  },
  
  deleteSession: (id) => {
    return apiClient.delete(`/sessions/${id}`);
  },
};

// Evaluation API
export const evaluationAPI = {
  getEvaluations: () => {
    return apiClient.get('/evaluation');
  },
  
  createEvaluation: (evaluationData) => {
    return apiClient.post('/evaluation', evaluationData);
  },
  
  getEvaluationById: (id) => {
    return apiClient.get(`/evaluation/${id}`);
  },
};

export default apiClient;
