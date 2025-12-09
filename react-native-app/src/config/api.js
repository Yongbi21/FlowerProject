// Supabase API - replaces AsyncStorage for backend operations
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

// Products API
export const productAPI = {
    getAll: async (params) => {
        let query = supabase
            .from('products')
            .select(`
                id,
                name,
                description,
                price,
                category_id,
                image_url,
                stock_quantity,
                is_active,
                categories ( name )
            `)
            .eq('is_active', true);

        if (params?.category_id) {
            query = query.eq('category_id', parseInt(params.category_id, 10));
        }

        const { data: products, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            return { data: { products: [] } };
        }

        const formattedProducts = products.map(p => ({
            ...p,
            category_name: p.categories ? p.categories.name : 'Uncategorized'
        }));

        return { data: { products: formattedProducts || [] } };
    },

    getById: async (id) => {
        const { data: product, error } = await supabase
            .from('products')
            .select(`*, categories ( name )`)
            .eq('id', parseInt(id, 10))
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            return { data: null };
        }
        
        const formattedProduct = {
            ...product,
            category_name: product.categories ? product.categories.name : 'Uncategorized'
        };

        return { data: formattedProduct };
    },

    create: async (formData) => {
        let imageUrl = null;
        const imageFile = formData.get('image'); // This should now be the full object from ImagePicker, not an intermediate one

        console.log('productAPI.create: imageFile from formData (full object):', JSON.stringify(imageFile, null, 2)); // Log imageFile

        if (imageFile && imageFile.uri) {
            try {
                // Use XMLHttpRequest to get a blob from the local URI, more reliable for file://
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function(e) {
                        console.error('XHR error:', e);
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', imageFile.uri, true);
                    xhr.send(null);
                });

                console.log('productAPI.create: Blob created via XHR:', blob); // Log the Blob

                const fileName = imageFile.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, blob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.type,
                    });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw uploadError;
                }
                
                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
                imageUrl = publicUrlData.publicUrl;
            } catch (e) {
                console.error('productAPI.create: Exception during image handling:', e);
                throw e; // Re-throw to propagate to handleSubmit catch block
            }
        }

        const productToInsert = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            stock_quantity: parseInt(formData.get('stock_quantity'), 10),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category_id'), 10),
            image_url: imageUrl,
            is_active: true,
        };

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productToInsert)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            throw error;
        }

        return { data: newProduct };
    },

    update: async (id, formData) => {
        let imageUrl = null;
        let oldImageUrl = formData.get('image_url_hidden'); // Retrieve the old image URL if passed

        const imageFile = formData.get('image');
        console.log('productAPI.update: imageFile from formData (full object):', JSON.stringify(imageFile, null, 2));

        // If a new image is provided, upload it
        if (imageFile && imageFile.uri) {
            try {
                // Use XMLHttpRequest to get a blob from the local URI, more reliable for file://
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function(e) {
                        console.error('XHR error:', e);
                        reject(new TypeError('Network request failed'));
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', imageFile.uri, true);
                    xhr.send(null);
                });

                console.log('productAPI.update: Blob created via XHR:', blob);

                const fileName = imageFile.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, blob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.type,
                    });

                if (uploadError) {
                    console.error('Error uploading new image:', uploadError);
                    throw uploadError;
                }
                
                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
                imageUrl = publicUrlData.publicUrl;

                // Optionally, delete the old image if a new one was successfully uploaded
                if (oldImageUrl) {
                    try {
                        const oldFileName = oldImageUrl.split('/').pop();
                        // Assuming images are stored directly in 'product-images' bucket
                        const { error: deleteError } = await supabase.storage
                            .from('product-images')
                            .remove([oldFileName]);

                        if (deleteError) {
                            console.warn('Could not delete old image from storage:', deleteError);
                        }
                    } catch (deleteOldError) {
                        console.warn('Error processing old image for deletion:', deleteOldError);
                    }
                }

            } catch (e) {
                console.error('productAPI.update: Exception during image handling:', e);
                throw e;
            }
        } else if (oldImageUrl) {
            // If no new image was provided, but there was an old one, keep it
            imageUrl = oldImageUrl;
        }


        const productToUpdate = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            stock_quantity: parseInt(formData.get('stock_quantity'), 10),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category_id'), 10),
            image_url: imageUrl, // Use the new or retained image URL
            is_active: true, // Assuming active status remains true unless explicitly changed
        };

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productToUpdate)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }

        return { data: updatedProduct };
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', parseInt(id, 10));

        if (error) {
            console.error('Error deleting product:', error);
            throw error;
        }

        return { data: { success: true } };
    }
};

// Categories API
export const categoryAPI = {
    getAll: async () => {
        let { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching categories:', error);
            return { data: { categories: [] } };
        }
        
        return { data: { categories: categories || [] } };
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

// Upload API - uses Supabase Storage
export const uploadAPI = {
    image: async (file) => {
        const res = await fetch(file.uri);
        const blob = await res.blob();
        const fileName = file.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, blob, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
        return { data: { url: publicUrlData.publicUrl } };
    }
};

// Base URL export (not used in local mode but kept for compatibility)
export const BASE_URL = supabase.storage.url;

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
