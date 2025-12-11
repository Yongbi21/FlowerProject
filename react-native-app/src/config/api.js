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

    create: async (productData) => {
        let imageUrl = null;
        const imageFile = productData.image;

        console.log('productAPI.create: imageFile from productData:', JSON.stringify(imageFile, null, 2));

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

                console.log('productAPI.create: Blob created via XHR:', blob);

                const fileName = imageFile.fileName || imageFile.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, blob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.type || 'image/jpeg',
                    });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw uploadError;
                }
                
                if (!uploadData) {
                    throw new Error("Upload succeeded but no data was returned");
                }

                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
                imageUrl = publicUrlData.publicUrl;
            } catch (e) {
                console.error('productAPI.create: Exception during image handling:', e);
                throw e;
            }
        }

        const productToInsert = {
            name: productData.name,
            price: parseFloat(productData.price),
            stock_quantity: parseInt(productData.stock_quantity, 10),
            description: productData.description,
            category_id: parseInt(productData.category_id, 10),
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

    update: async (id, productData) => {
        let imageUrl = productData.image_url_hidden || null;
        const oldImageUrl = productData.image_url_hidden;

        const imageFile = productData.image;
        console.log('productAPI.update: imageFile from productData:', JSON.stringify(imageFile, null, 2));

        // If a new image is provided, and it's different from the old one, upload it
        if (imageFile && imageFile.uri && imageFile.uri !== oldImageUrl) {
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

                const fileName = imageFile.fileName || imageFile.name || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, blob, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.type || 'image/jpeg',
                    });

                if (uploadError) {
                    console.error('Error uploading new image:', uploadError);
                    throw uploadError;
                }

                if (!uploadData) {
                    throw new Error("Upload succeeded but no data was returned");
                }
                
                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
                imageUrl = publicUrlData.publicUrl;

                // Optionally, delete the old image if a new one was successfully uploaded
                if (oldImageUrl) {
                    try {
                        const oldFileName = oldImageUrl.split('/').pop().split('?')[0]; // Handle Supabase URL query params
                        if (oldFileName) {
                            const { error: deleteError } = await supabase.storage
                                .from('product-images')
                                .remove([oldFileName]);

                            if (deleteError) {
                                console.warn('Could not delete old image from storage:', deleteError);
                            }
                        }
                    } catch (deleteOldError) {
                        console.warn('Error processing old image for deletion:', deleteOldError);
                    }
                }

            } catch (e) {
                console.error('productAPI.update: Exception during image handling:', e);
                throw e;
            }
        }

        const productToUpdate = {
            name: productData.name,
            price: parseFloat(productData.price),
            stock_quantity: parseInt(productData.stock_quantity, 10),
            description: productData.description,
            category_id: parseInt(productData.category_id, 10),
            image_url: imageUrl, // Use the new or retained image URL
            is_active: true,
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
        let query = supabase
            .from('orders')
            .select(`
                id,
                created_at,
                order_number,
                status,
                payment_status,
                payment_method,
                total,
                subtotal,
                shipping_fee,
                delivery_method,


                users (
                    name,
                    email,
                    phone
                ),
                order_items (
                    product_id,
                    quantity,
                    price,
                    products (
                        name,
                        image_url
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (params?.status) {
            query = query.eq('status', params.status);
        }

        const { data: orders, error } = await query;

        if (error) {
            console.error('Supabase query error for orders:', error);
            return { data: [] };
        }
        console.log('Raw orders data from Supabase:', JSON.stringify(orders, null, 2));

        const formattedOrders = orders.map(order => {
            const customerName = order.users ? order.users.name : 'N/A';
            const customerEmail = order.users ? order.users.email : 'N/A';
            const customerPhone = order.users ? order.users.phone : 'N/A';
            
            const items = order.order_items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                name: item.products ? item.products.name : 'Unknown Product',
                image_url: item.products ? item.products.image_url : null,
            }));

            return {
                ...order,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                items: items,
                users: undefined, // Remove the raw users object
                order_items: undefined, // Remove the raw order_items object
            };
        });
        console.log('Formatted orders data for UI:', JSON.stringify(formattedOrders, null, 2));

        return { data: formattedOrders };
    },

    updateOrderStatus: async (id, status) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
        return { data: { success: true, order: data } };
    },

    updateOrderPaymentMethod: async (id, newPaymentMethod) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ payment_method: newPaymentMethod })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating order payment method:', error);
            throw error;
        }
        return { data: { success: true, order: data } };
    },

    acceptOrder: async (id, status) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error accepting order:', error);
            throw error;
        }
        return { data: { success: true, order: data } };
    },

    declineOrder: async (id, status, reason) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status, decline_reason: reason })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error declining order:', error);
            throw error;
        }
        return { data: { success: true, order: data } };
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
