// AsyncStorage API - replaces backend API calls for React Native
// This file provides AsyncStorage-based implementations of all API methods
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to generate unique IDs
const generateId = () => `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Products API
export const productAPI = {
    getAll: async (params) => {
        const products = JSON.parse(await AsyncStorage.getItem('products') || '[]');
        let filtered = products.filter(p => p.is_active);

        if (params?.category_id) {
            filtered = filtered.filter(p => p.category_id === parseInt(params.category_id));
        }

        return { data: filtered };
    },

    getById: async (id) => {
        const products = JSON.parse(await AsyncStorage.getItem('products') || '[]');
        const product = products.find(p => p.id === parseInt(id));
        return { data: product };
    },

    create: async (data) => {
        const products = JSON.parse(await AsyncStorage.getItem('products') || '[]');
        const newProduct = { ...data, id: Date.now(), is_active: true };
        products.push(newProduct);
        await AsyncStorage.setItem('products', JSON.stringify(products));
        return { data: newProduct };
    },

    update: async (id, data) => {
        const products = JSON.parse(await AsyncStorage.getItem('products') || '[]');
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = { ...products[index], ...data };
            await AsyncStorage.setItem('products', JSON.stringify(products));
            return { data: products[index] };
        }
        return { data: null };
    },

    delete: async (id) => {
        const products = JSON.parse(await AsyncStorage.getItem('products') || '[]');
        const filtered = products.filter(p => p.id !== parseInt(id));
        await AsyncStorage.setItem('products', JSON.stringify(filtered));
        return { data: { success: true } };
    }
};

// Categories API
export const categoryAPI = {
    getAll: async () => {
        const categories = JSON.parse(await AsyncStorage.getItem('categories') || '[]');
        return { data: categories.filter(c => c.is_active) };
    }
};

// Orders API
export const orderAPI = {
    getAll: async (params) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        return { data: orders };
    }
};

// Auth API - using AsyncStorage for demo/local mode
export const authAPI = {
    adminLogin: async (data) => {
        // For demo: accept any admin login with local storage
        const adminUser = {
            id: 1,
            email: data.email,
            name: 'Admin',
            role: 'admin'
        };
        const token = 'local-admin-token';
        return { data: { token, user: adminUser } };
    },

    changePassword: async (data) => {
        return { data: { success: true, message: 'Password changed successfully' } };
    },

    getMe: async () => {
        const user = await AsyncStorage.getItem('currentUser');
        return { data: user ? JSON.parse(user) : null };
    }
};

// Admin API - AsyncStorage-based admin operations
export const adminAPI = {
    getAllOrders: async (params) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        return { data: orders };
    },

    updateOrderStatus: async (id, status) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = status;
            await AsyncStorage.setItem('orders', JSON.stringify(orders));
        }
        return { data: { success: true } };
    },

    updatePaymentStatus: async (id, payment_status) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].payment_status = payment_status;
            await AsyncStorage.setItem('orders', JSON.stringify(orders));
        }
        return { data: { success: true } };
    },

    acceptOrder: async (id) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = 'accepted';
            await AsyncStorage.setItem('orders', JSON.stringify(orders));
        }
        return { data: { success: true } };
    },

    declineOrder: async (id, reason) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = 'declined';
            orders[index].decline_reason = reason;
            await AsyncStorage.setItem('orders', JSON.stringify(orders));
        }
        return { data: { success: true } };
    },

    getSalesSummary: async (params) => {
        const orders = JSON.parse(await AsyncStorage.getItem('orders') || '[]');
        const summary = {
            total_sales: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            total_orders: orders.length,
            pending_orders: orders.filter(o => o.status === 'pending').length
        };
        return { data: summary };
    },

    getAllRequests: async (params) => {
        const requests = JSON.parse(await AsyncStorage.getItem('requests') || '[]');
        return { data: requests || [] };
    },

    provideQuote: async (id, data) => {
        const requests = JSON.parse(await AsyncStorage.getItem('requests') || '[]');
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...data, status: 'quoted' };
            await AsyncStorage.setItem('requests', JSON.stringify(requests));
        }
        return { data: { success: true } };
    },

    acceptRequest: async (id) => {
        const requests = JSON.parse(await AsyncStorage.getItem('requests') || '[]');
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index].status = 'accepted';
            await AsyncStorage.setItem('requests', JSON.stringify(requests));
        }
        return { data: { success: true } };
    },

    updateRequestStatus: async (id, status) => {
        const requests = JSON.parse(await AsyncStorage.getItem('requests') || '[]');
        const index = requests.findIndex(r => r.id === id);
        if (index !== -1) {
            requests[index].status = status;
            await AsyncStorage.setItem('requests', JSON.stringify(requests));
        }
        return { data: { success: true } };
    },

    getAllStock: async () => {
        const stock = JSON.parse(await AsyncStorage.getItem('stock') || '[]');
        return { data: stock };
    },

    createStock: async (data) => {
        const stock = JSON.parse(await AsyncStorage.getItem('stock') || '[]');
        const newStock = { ...data, id: Date.now() };
        stock.push(newStock);
        await AsyncStorage.setItem('stock', JSON.stringify(stock));
        return { data: newStock };
    },

    updateStock: async (id, data) => {
        const stock = JSON.parse(await AsyncStorage.getItem('stock') || '[]');
        const index = stock.findIndex(s => s.id === id);
        if (index !== -1) {
            stock[index] = { ...stock[index], ...data };
            await AsyncStorage.setItem('stock', JSON.stringify(stock));
            return { data: stock[index] };
        }
        return { data: null };
    },

    deleteStock: async (id) => {
        const stock = JSON.parse(await AsyncStorage.getItem('stock') || '[]');
        const filtered = stock.filter(s => s.id !== id);
        await AsyncStorage.setItem('stock', JSON.stringify(filtered));
        return { data: { success: true } };
    },

    getAllMessages: async () => {
        return { data: [] };
    },

    sendMessage: async (data) => {
        return { data: { id: Date.now(), ...data } };
    },

    getAllNotifications: async () => {
        return { data: [] };
    },

    sendNotification: async (data) => {
        return { data: { id: Date.now(), ...data } };
    },

    deleteNotification: async (id) => {
        return { data: { success: true } };
    },

    getAbout: async () => {
        return { data: { title: 'About Us', description: 'FlowerForge' } };
    },

    updateAbout: async (data) => {
        return { data: { success: true } };
    },

    getContact: async () => {
        return { data: { phone: '+63 912 345 6789', email: 'info@flowerforge.com' } };
    },

    updateContact: async (data) => {
        return { data: { success: true } };
    },

    getEmployees: async () => {
        return { data: [] };
    },

    addEmployee: async (data) => {
        return { data: { id: Date.now(), ...data } };
    },

    deleteEmployee: async (id) => {
        return { data: { success: true } };
    }
};

// Upload API - mock for local development
export const uploadAPI = {
    image: async (file) => {
        // In a real app, you'd use FileSystem to handle uploads
        // For demo, just return a placeholder URL
        const url = `/uploads/local-${Date.now()}.jpg`;
        return { data: { url } };
    }
};

// Base URL export (not used in local mode but kept for compatibility)
export const BASE_URL = 'local-storage';

// Default export
export default {
    productAPI,
    categoryAPI,
    orderAPI,
    authAPI,
    adminAPI,
    uploadAPI,
    BASE_URL
};
