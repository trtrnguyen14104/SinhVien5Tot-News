import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// Tự động gắn JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv5tot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động logout khi token hết hạn
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sv5tot_token');
      localStorage.removeItem('sv5tot_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data)     => api.post('/auth/login', data),
  getMe:          ()         => api.get('/auth/me'),
  changePassword: (data)     => api.put('/auth/password', data),
};

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postsApi = {
  getAll:      (params)  => api.get('/posts', { params }),
  getBySlug:   (slug)    => api.get(`/posts/${slug}`),
  adminGetPostById: (id) => api.get(`/admin/posts/${id}`),
  // Admin
  adminGetAll: (params)  => api.get('/admin/posts', { params }),
  create:      (data)    => api.post('/admin/posts', data),
  update:      (id, data)=> api.put(`/admin/posts/${id}`, data),
  delete:      (id)      => api.delete(`/admin/posts/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// ─── Featured Students ────────────────────────────────────────────────────────
export const studentsApi = {
  getAll:  (params)  => api.get('/featured-students', { params }),
  create:  (data)    => api.post('/admin/students', data),
  update:  (id, data)=> api.put(`/admin/students/${id}`, data),
  delete:  (id)      => api.delete(`/admin/students/${id}`),
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentsApi = {
  getAll:  (params)  => api.get('/documents', { params }),
  create:  (data)    => api.post('/admin/documents', data),
  delete:  (id)      => api.delete(`/admin/documents/${id}`),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  image:    (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  document: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/upload/document', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
};

export default api;

// ─── Banners ──────────────────────────────────────────────────────────────────
export const bannersApi = {
  getAll:  ()          => api.get('/banners'),
  create:  (data)      => api.post('/admin/banners', data),
  update:  (id, data)  => api.put(`/admin/banners/${id}`, data),
  delete:  (id)        => api.delete(`/admin/banners/${id}`),
};

// ─── Users (admin only) ───────────────────────────────────────────────────────
export const usersApi = {
  getAll:  ()          => api.get('/admin/users'),
  create:  (data)      => api.post('/admin/users', data),
  update:  (id, data)  => api.put(`/admin/users/${id}`, data),
  delete:  (id)        => api.delete(`/admin/users/${id}`),
};
