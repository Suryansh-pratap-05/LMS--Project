import axios from 'axios';

// Use relative URL to leverage Vite proxy
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log detailed error information
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url;
    
    console.error('API Error:', {
      url: url,
      status: status,
      data: data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => {
    console.log('authAPI.signup called with:', data);
    return api.post('/auth/signup', data);
  },
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Courses API
export const coursesAPI = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.put(`/tasks/${id}/complete`),
};

// Study Planner API
export const plannerAPI = {
  getPlans: (params) => api.get('/planner', { params }),
  createPlan: (data) => api.post('/planner', data),
  updatePlan: (id, data) => api.put(`/planner/${id}`, data),
  deletePlan: (id) => api.delete(`/planner/${id}`),
  generate: (daysAhead) => api.post('/planner/generate', null, { params: { days_ahead: daysAhead } }),
  getDeadlines: (days) => api.get('/planner/deadlines', { params: { days } }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getProgress: () => api.get('/analytics/progress'),
  getWeekly: (weeks) => api.get('/analytics/weekly', { params: { weeks } }),
};

export default api;