import axios from 'axios';

// API Base URL - change this based on your environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Add token to requests automatically
api.interceptors.request.use(
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        // Prevent redirect loop for auth routes
        if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/admin/login')) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser'); // Updated to match App.jsx key
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Methods
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    getMe: () => api.get('/auth/me')
};

export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

export const categoryAPI = {
    getAll: () => api.get('/categories')
};

export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (id, data) => api.put(`/cart/${id}`, data),
    delete: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart'),
    getCount: () => api.get('/cart/count')
};

export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    cancel: (id) => api.put(`/orders/${id}/cancel`)
};

export const requestAPI = {
    getAll: () => api.get('/requests'),
    getById: (id) => api.get(`/requests/${id}`),
    create: (data) => api.post('/requests', data),
    cancel: (id) => api.put(`/requests/${id}/cancel`)
};

export const addressAPI = {
    getAll: () => api.get('/addresses'),
    create: (data) => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    delete: (id) => api.delete(`/addresses/${id}`),
    setDefault: (id) => api.put(`/addresses/${id}/set-default`)
};

export const wishlistAPI = {
    getAll: () => api.get('/wishlist'),
    add: (productId) => api.post('/wishlist/add', { product_id: productId }),
    remove: (productId) => api.delete(`/wishlist/remove/${productId}`)
};

export const reviewAPI = {
    create: (data) => api.post('/reviews', data),
    getByProduct: (productId) => api.get(`/reviews/product/${productId}`)
};

export const messageAPI = {
    getAll: (params) => api.get('/messages', { params }),
    send: (data) => api.post('/messages', data),
    markAsRead: (id) => api.put(`/messages/${id}/read`)
};

export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    delete: (id) => api.delete(`/notifications/${id}`)
};

export const adminAPI = {
    // Orders
    getAllOrders: (params) => api.get('/admin/orders', { params }),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    updatePaymentStatus: (id, payment_status) => api.put(`/admin/orders/${id}/payment-status`, { payment_status }),
    acceptOrder: (id) => api.post(`/admin/orders/${id}/accept`),
    declineOrder: (id, reason) => api.post(`/admin/orders/${id}/decline`, { reason }),

    // Sales
    getSalesSummary: (params) => api.get('/admin/sales/summary', { params }),

    // Requests
    getAllRequests: (params) => api.get('/admin/requests', { params }),
    provideQuote: (id, data) => api.put(`/admin/requests/${id}/quote`, data),
    acceptRequest: (id) => api.put(`/admin/requests/${id}/accept`),
    updateRequestStatus: (id, status) => api.put(`/admin/requests/${id}/status`, { status })
};

export const uploadAPI = {
    image: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default api;
