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
        const imageFile = formData.image;
        
        console.log('=== CREATE PRODUCT DEBUG ===');
        console.log('imageFile type:', typeof imageFile);
        console.log('imageFile:', imageFile);

        if (imageFile && imageFile.base64) {
            try {
                const fileName = imageFile.fileName || `product-${Date.now()}.jpg`;
                // The expo-image-picker result includes mimeType.
                const contentType = imageFile.mimeType || 'image/jpeg';
                
                console.log(`Uploading ${fileName} with contentType: ${contentType}`);

                // Decode base64 to ArrayBuffer, which is more reliable for uploads.
                const arrayBuffer = decode(imageFile.base64);
                
                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, arrayBuffer, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType,
                    });

                if (uploadError) {
                    console.error('Supabase upload error:', uploadError);
                    throw uploadError;
                }
                
                console.log('Upload successful, path:', uploadData.path);
                
                // Get public URL
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(uploadData.path);
                
                imageUrl = publicUrlData.publicUrl;
                console.log('Public URL generated:', imageUrl);
                
            } catch (error) {
                console.error('Error processing image:', error);
                throw new Error('Failed to upload image: ' + error.message);
            }
        } else {
            console.log('No image file with base64 data provided.');
        }

        // Prepare product data
        const productToInsert = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
            description: formData.description || '',
            category_id: parseInt(formData.category_id, 10),
            image_url: imageUrl,
            is_active: true,
        };

        console.log('Inserting product to database:', productToInsert);

        // Insert into database
        const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productToInsert)
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            throw error;
        }

        console.log('Product created successfully:', newProduct);
        console.log('=== END CREATE PRODUCT DEBUG ===');

        return { data: newProduct };
    },

    update: async function(id, formData) {
        let imageUrl = formData.image_url_hidden;
        const imageFile = formData.image;
        console.log('productAPI.update: existing imageUrl (hidden):', imageUrl);
        console.log('productAPI.update: imageFile from formData (full object):', imageFile);

        // If a new image is picked, it will have base64 data.
        if (imageFile && imageFile.base64) {
            try {
                const fileName = imageFile.fileName || `${Date.now()}.jpg`;
                const contentType = imageFile.mimeType || 'image/jpeg';
                const arrayBuffer = decode(imageFile.base64);

                console.log(`Uploading new image for update: ${fileName}`);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, arrayBuffer, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: contentType,
                    });

                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    throw uploadError;
                }
                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
                imageUrl = publicUrlData.publicUrl; // Set new image URL
            } catch (error) {
                 console.error('Error processing image for update:', error);
                throw new Error('Failed to upload image for update: ' + error.message);
            }
        } else if (imageFile && imageFile.uri && imageFile.uri.startsWith('http')) {
            // This is the case where no new image was selected, so we keep the old one.
            imageUrl = imageFile.uri;
        }

        const productToUpdate = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity, 10),
            description: formData.description,
            category_id: parseInt(formData.category_id, 10),
            image_url: imageUrl,
        };
        
        Object.keys(productToUpdate).forEach(key => (productToUpdate[key] === undefined || Number.isNaN(productToUpdate[key])) && delete productToUpdate[key]);

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productToUpdate)
            .eq('id', parseInt(id, 10))
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }

        return { data: updatedProduct };
    },

    deleteProduct: async (id) => {
        // First, delete all order_items referencing this product
        const { error: orderItemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('product_id', parseInt(id, 10));

        if (orderItemsError) {
            console.error('Error deleting associated order items:', orderItemsError);
            throw orderItemsError;
        }

        // Then, delete the product itself
        const { error: productError } = await supabase
            .from('products')
            .delete()
            .eq('id', parseInt(id, 10));

        if (productError) {
            console.error('Error deleting product:', productError);
            throw productError;
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

// Auth API - using Supabase for real authentication
export const authAPI = {
    adminLogin: async ({ email, password }) => {
        // 1. Sign in with Supabase Auth
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            console.error('Supabase sign-in error:', signInError);
            throw signInError;
        }

        if (!sessionData.user) {
            throw new Error('Login failed: No user data returned.');
        }

        const { user, session } = sessionData;

        // 2. Fetch user profile from 'users' table to check role
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Sign out the user as we can't verify their role
            await supabase.auth.signOut();
            throw new Error('Could not verify user role. Your account might not be set up correctly.');
        }

        // 3. Check the role
        if (profile.role !== 'admin' && profile.role !== 'employee') {
            // Sign out the user because they don't have the required role
            await supabase.auth.signOut();
            throw new Error('Access Denied: You do not have permission to access this dashboard.');
        }

        // 4. Combine auth user data with public profile data
        const fullUser = {
            ...user,
            ...profile, // This will add 'role' and 'name' to the user object
        };

        // 5. Return data in the format expected by LoginScreen.js
        return {
            data: {
                token: session.access_token,
                user: fullUser,
            }
        };
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out from Supabase:', error);
        }
        // AsyncStorage cleanup will be handled in the component
        return { data: { success: true } };
    },

    changePassword: async (data) => {
        // This would be implemented using supabase.auth.updateUser
        return { data: { success: true, message: 'Password changed successfully' } };
    },

    getMe: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null };

        // Also fetch profile to get role
        const { data: profile } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single();
        
        return { data: { ...user, ...profile } };
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
                receipt_url,
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

    declineOrder: async (id, status) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: status })
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
        let query = supabase
            .from('requests')
            .select(`
                id,
                request_number,
                type,
                status,
                image_url,
                notes,
                created_at,
                users (
                    name,
                    email,
                    phone
                )
            `)
            .order('created_at', { ascending: false });

        const { data: requests, error } = await query;

        if (error) {
            console.error('Supabase query error for requests:', error);
            return { data: { requests: [] } };
        }

        const formattedRequests = requests.map(req => {
            const userData = req.users || {};
            // requestData is no longer fetched

            return {
                id: req.id,
                request_number: req.request_number,
                type: req.type,
                status: req.status,
                image_url: req.image_url,
                notes: req.notes,
                created_at: req.created_at,
                user_name: userData.name,
                user_email: userData.email,
                user_phone: userData.phone,
                // No longer spreading requestData here
            };
        });

        return { data: { requests: formattedRequests } };
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
        const { data, error } = await supabase
            .from('requests')
            .update({ status: status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating request status:', error);
            throw error;
        }
        return { data: { success: true, request: data } };
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
    },

    getAllConversations: async () => {
        const adminId = (await authAPI.getMe())?.data?.id;
        if (!adminId) return { data: [] };

        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(id, name, email),
                receiver:receiver_id(id, name, email)
            `)
            .or(`sender_id.eq.${adminId},receiver_id.eq.${adminId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all messages:', error);
            return { data: [] };
        }

        const conversations = new Map();
        messages.forEach(message => {
            const otherUser = message.sender_id === adminId ? message.receiver : message.sender;
            if (!otherUser) return;

            if (!conversations.has(otherUser.id)) {
                conversations.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: message.message,
                    timestamp: message.created_at,
                });
            }
        });

        const sortedConversations = Array.from(conversations.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
        return { data: sortedConversations };
    },

    getMessagesWithUser: async (userId) => {
        const adminId = (await authAPI.getMe())?.data?.id;
        if (!adminId) return { data: [] };

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${adminId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${adminId})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return { data: [] };
        }
        return { data };
    },

    sendMessage: async (receiverId, messageText) => {
        const adminId = (await authAPI.getMe())?.data?.id;
        if (!adminId) return { error: { message: "Not logged in" } };

        const message = {
            sender_id: adminId,
            receiver_id: receiverId,
            message: messageText,
        };

        const { data, error } = await supabase.from('messages').insert([message]).select().single();
        
        if (error) {
            console.error('Error sending message:', error);
            return { error };
        }
        return { data };
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

// Base URL export
export const BASE_URL = 'https://luzcecstkebntjnfonwv.supabase.co/storage/v1/object/public/product-images/';

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
