import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this with your computer's IP address for mobile testing
// For local testing: Use your computer's IP (e.g., 192.168.1.100)
// For production: Use your deployed backend URL
const BASE_URL = 'http://10.36.28.250:5000'; // Your computer's IP - Update if your IP changes
const API_URL = `${BASE_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 seconds - reduced for faster error feedback
});

// Add token to requests automatically
api.interceptors.request.use(
    async (config) => {
        const fullUrl = config.baseURL + config.url;
        console.log('🌐 Making request to:', fullUrl);
        console.log('📡 Base URL:', BASE_URL);
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('currentUser');
        }
        
        // Enhanced error logging for debugging
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - Server took too long to respond');
            console.error('Server URL:', API_URL);
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.error('Connection error - Cannot reach server at:', API_URL);
            console.error('Base URL:', BASE_URL);
            console.error('Error code:', error.code);
            console.error('Make sure:');
            console.error('1. Backend server is running on port 5000');
            console.error('2. Your device is on the same network');
            console.error('3. IP address is correct:', BASE_URL);
            console.error('4. Firewall allows connections on port 5000');
        } else if (error.request && !error.response) {
            console.error('Network error - No response from server');
            console.error('Request URL:', error.config?.url);
            console.error('Base URL:', BASE_URL);
            console.error('Full error:', JSON.stringify(error, null, 2));
        }
        
        return Promise.reject(error);
    }
);

// API Methods
export const authAPI = {
    adminLogin: (data) => api.post('/auth/admin/login', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    getMe: () => api.get('/auth/me')
};

export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data, config) => api.post('/products', data, config),
    update: (id, data, config) => api.put(`/products/${id}`, data, config),
    delete: (id) => api.delete(`/products/${id}`)
};

export const categoryAPI = {
    getAll: () => api.get('/categories')
};

export const orderAPI = {
    getAll: (params) => api.get('/admin/orders', { params })
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
    updateRequestStatus: (id, status) => api.put(`/admin/requests/${id}/status`, { status }),

    // Stock
    getAllStock: () => api.get('/admin/stock'),
    createStock: (data) => api.post('/admin/stock', data),
    updateStock: (id, data) => api.put(`/admin/stock/${id}`, data),
    deleteStock: (id) => api.delete(`/admin/stock/${id}`),

    // Messages
    getAllMessages: () => api.get('/admin/messages'),
    sendMessage: (data) => api.post('/admin/messages', data),

    // Notifications
    getAllNotifications: () => api.get('/admin/notifications'),
    sendNotification: (data) => api.post('/admin/notifications', data),
    deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),

    // Content Management
    getAbout: () => api.get('/admin/content/about'),
    updateAbout: (data) => api.put('/admin/content/about', data),
    getContact: () => api.get('/admin/content/contact'),
    updateContact: (data) => api.put('/admin/content/contact', data),

    // Employee Management
    getEmployees: () => api.get('/admin/employees'),
    addEmployee: (data) => api.post('/admin/employees', data),
    deleteEmployee: (id) => api.delete(`/admin/employees/${id}`)
};

export const uploadAPI = {
    image: (file) => {
        const formData = new FormData();
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'photo.jpg'
        });
        return api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

export default api;
export { BASE_URL };
