// AdminDashboard.js - Complete Version with Full UI + API Integration
// Restored all features from original design

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { productAPI, adminAPI, categoryAPI, BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Helper function to format timestamp with date and time
const formatTimestamp = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateString;
  }
};

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('catalogue');
  const [menuVisible, setMenuVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (!currentUser) {
        navigation.navigate('Login');
        return;
      }

      const user = JSON.parse(currentUser);
      if (user.role !== 'admin' && user.role !== 'employee') {
        Alert.alert('Access Denied', 'You do not have permission to access this page');
        navigation.navigate('Login');
        return;
      }

      setUserRole(user.role);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      navigation.navigate('Login');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            await AsyncStorage.removeItem('token');
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  const renderTabContent = () => {
    // Prevent employees from accessing admin-only tabs
    if (userRole === 'employee' && (activeTab === 'sales' || activeTab === 'about' || activeTab === 'contact' || activeTab === 'employees')) {
      return <CatalogueTab />;
    }

    switch (activeTab) {
      case 'catalogue':
        return <CatalogueTab />;
      case 'orders':
        return <OrdersTab />;
      case 'stock':
        return <StockTab />;
      case 'requests':
        return <RequestsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'messaging':
        return <MessagingTab />;
      case 'sales':
        return <SalesTab />;
      case 'about':
        return <AboutTab />;
      case 'contact':
        return <ContactTab />;
      case 'employees':
        return <EmployeesTab />;
      default:
        return <CatalogueTab />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Joccery's Flower Shop</Text>
          <Text style={styles.headerSubtitle}>Admin Dashboard</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('catalogue')}
        >
          <Ionicons
            name="flower"
            size={24}
            color={activeTab === 'catalogue' ? '#ec4899' : '#999'}
          />
          <Text style={[styles.navText, activeTab === 'catalogue' && styles.navTextActive]}>
            Catalog..
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name="cart"
            size={24}
            color={activeTab === 'orders' ? '#ec4899' : '#999'}
          />
          <Text style={[styles.navText, activeTab === 'orders' && styles.navTextActive]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('stock')}
        >
          <Ionicons
            name="cube"
            size={24}
            color={activeTab === 'stock' ? '#ec4899' : '#999'}
          />
          <Text style={[styles.navText, activeTab === 'stock' && styles.navTextActive]}>
            Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={activeTab === 'notifications' ? '#ec4899' : '#999'}
          />
          <Text style={[styles.navText, activeTab === 'notifications' && styles.navTextActive]}>
            Notific..
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('messaging')}
        >
          <Ionicons
            name="chatbubbles"
            size={24}
            color={activeTab === 'messaging' ? '#ec4899' : '#999'}
          />
          <Text style={[styles.navText, activeTab === 'messaging' && styles.navTextActive]}>
            Messagi..
          </Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('catalogue'); setMenuVisible(false); }}>
                <Ionicons name="flower-outline" size={20} color="#ec4899" />
                <Text style={styles.menuItemText}>Catalogue</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('orders'); setMenuVisible(false); }}>
                <Ionicons name="cart-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('requests'); setMenuVisible(false); }}>
                <Ionicons name="calendar-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Requests & Bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('stock'); setMenuVisible(false); }}>
                <Ionicons name="cube-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Stock</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('notifications'); setMenuVisible(false); }}>
                <Ionicons name="notifications-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('messaging'); setMenuVisible(false); }}>
                <Ionicons name="chatbubbles-outline" size={20} color="#333" />
                <Text style={styles.menuItemText}>Messaging</Text>
              </TouchableOpacity>

              {userRole === 'admin' && (
                <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('sales'); setMenuVisible(false); }}>
                  <Ionicons name="cash-outline" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Sales</Text>
                </TouchableOpacity>
              )}

              {userRole === 'admin' && (
                <>
                  <View style={styles.menuDivider} />

                  <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('about'); setMenuVisible(false); }}>
                    <Ionicons name="information-circle-outline" size={20} color="#333" />
                    <Text style={styles.menuItemText}>About</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('contact'); setMenuVisible(false); }}>
                    <Ionicons name="call-outline" size={20} color="#333" />
                    <Text style={styles.menuItemText}>Contact</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveTab('employees'); setMenuVisible(false); }}>
                    <Ionicons name="people-outline" size={20} color="#333" />
                    <Text style={styles.menuItemText}>Employees</Text>
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleLogout(); }}>
                <Ionicons name="log-out-outline" size={20} color="#f44336" />
                <Text style={[styles.menuItemText, { color: '#f44336' }]}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// ==================== CATALOGUE TAB ====================
const CatalogueTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // New state
  const [productToDeleteId, setProductToDeleteId] = useState(null);   // New state
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    description: '',
    image: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsRes = await productAPI.getAll();

      const staticCategories = [
        { id: 1, name: 'Sympathy' },
        { id: 2, name: 'Graduation' },
        { id: 3, name: 'All Souls Day' },
        { id: 4, name: 'Valentines' },
        { id: 5, name: 'Get Well Soon' },
        { id: 6, name: 'Mothers Day' },
      ];
      const categoriesWithAll = [{ id: 0, name: 'All' }, ...staticCategories];
      setCategories(categoriesWithAll);

      const productsWithCategoryNames = (productsRes.data.products || []).map(product => {
        const category = staticCategories.find(c => c.id == product.category_id);
        return {
          ...product,
          category_name: category ? category.name : 'Uncategorized'
        };
      }).sort((a, b) => b.id - a.id);

      setProducts(productsWithCategoryNames);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id == categoryId);
    return category ? category.name : 'Select a category';
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0] });
      }
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert('Error', 'Failed to open image library. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0] });
      }
    } catch (error) {
      console.error('Error launching camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category_name === selectedCategory);

  const handleNumericInput = (field, text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setFormData({ ...formData, [field]: numericText });
  };

  const handleIntegerInput = (field, text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setFormData({ ...formData, [field]: numericText });
  };

  const handleSubmit = async () => {
    const { name, price, stock_quantity, category_id } = formData;
    const errors = [];

    if (!name.trim()) {
      errors.push('• Product Name is required.');
    }
    if (!price) {
      errors.push('• Price is required.');
    } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      errors.push('• Price must be a valid number (e.g., 100 or 100.99).');
    }
    if (!stock_quantity) {
      errors.push('• Quantity is required.');
    } else if (!/^\d+$/.test(stock_quantity)) {
      errors.push('• Quantity must be a whole number.');
    }
    if (!category_id) {
      errors.push('• Category is required.');
    }

    if (errors.length > 0) {
      Alert.alert('Please fix the following issues:', errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name: formData.name,
        price: formData.price,
        stock_quantity: formData.stock_quantity || '0',
        description: formData.description || '',
        category_id: formData.category_id || '1',
        image: formData.image, // Pass the image object from the state
      };

      if (editingProduct) {
        if (editingProduct.image_url) {
          productData.image_url_hidden = editingProduct.image_url;
        }
        await productAPI.update(editingProduct.id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await productAPI.create(productData);
        Alert.alert('Success', 'Product added successfully');
      }

      setModalVisible(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id?.toString() || '1',
      stock_quantity: product.stock_quantity?.toString() || '0',
      description: product.description || '',
      image: product.image_url ? { uri: product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}` } : null,
    });
    setModalVisible(true);
  };

  const handleDelete = (productId) => {
    setProductToDeleteId(productId);
    setDeleteModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category_id: '',
      stock_quantity: '',
      description: '',
      image: null,
    });
    setEditingProduct(null);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {/* Image Section - Always visible (Image or Placeholder) */}
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}` }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category_name || 'Uncategorized'}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₱{item.price}</Text>
          <Text style={styles.productStock}>Qty: {item.stock_quantity || 0}</Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Product</Text>
      </TouchableOpacity>

      {/* Category Filter Container */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.name && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.name && styles.categoryChipTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) => handleNumericInput('price', text)}
              />

              <Text style={styles.inputLabel}>Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter quantity"
                keyboardType="numeric"
                value={formData.stock_quantity}
                onChangeText={(text) => handleIntegerInput('stock_quantity', text)}
              />

              <Text style={styles.inputLabel}>Category *</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={styles.dropdownInputText}>
                  {getCategoryName(formData.category_id)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Enter product description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
              />

              <Text style={styles.inputLabel}>Product Image</Text>
              <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
                {formData.image ? (
                  <Image source={{ uri: formData.image.uri }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons name="camera" size={40} color="#ec4899" />
                    <Text style={styles.imageUploadText}>Tap to Upload Photo</Text>
                    <Text style={styles.imageUploadSubtext}>or take a picture</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.takePhotoButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color="#ec4899" />
                <Text style={styles.takePhotoText}>Take Photo</Text>
              </TouchableOpacity>

            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal visible={categoryModalVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalContainer} onPress={() => setCategoryModalVisible(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories.filter(c => c.id !== 0)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryPickerItem}
                  onPress={() => {
                    setFormData({ ...formData, category_id: item.id });
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.categoryPickerItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>Are you sure you want to delete this product?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={async () => {
                  setDeleteModalVisible(false);
                  if (productToDeleteId) {
                    try {
                      await productAPI.delete(productToDeleteId);
                      Alert.alert('Success', 'Product deleted');
                      await loadData();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete product');
                    }
                  }
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==================== ORDERS TAB ====================
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

      const loadOrders = async () => {
          setLoading(true);
          try {
              const response = await adminAPI.getAllOrders();
              console.log('Response from adminAPI.getAllOrders in AdminDashboard:', JSON.stringify(response.data, null, 2));
  
              if (!response.data || response.data.length === 0) {
                  console.warn('adminAPI.getAllOrders returned no data or empty array.');
              }
              setOrders(response.data || []);
          } catch (error) {
              console.error('Error loading orders:', error);
              setOrders([]);
          } finally {
              setLoading(false);
          }
      };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleAccept = async (orderId) => {
    try {
      await adminAPI.acceptOrder(orderId, 'processing');
      Alert.alert('Success', 'Order accepted');
      await loadOrders();
    } catch (error) {
      console.error('Accept order error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleDecline = async (orderId) => {
    Alert.alert(
      'Decline Order',
      'Are you sure you want to decline this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.declineOrder(orderId, 'cancelled', 'Declined by admin');
              Alert.alert('Success', 'Order declined');
              await loadOrders();
            } catch (error) {
              console.error('Decline order error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to decline order');
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', 'Order status updated');
      await loadOrders();
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handlePaymentMethodChange = async (orderId, newPaymentMethod) => {
    try {
      await adminAPI.updateOrderPaymentMethod(orderId, newPaymentMethod);
      Alert.alert('Success', 'Payment method updated');
      await loadOrders();
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'out_for_delivery': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'cancelled': return '#f44336';
      case 'pending': return '#FFA726';
      default: return '#999';
    }
  };

  const getPaymentColor = (status) => {
    return status === 'paid' ? '#4CAF50' : '#FF9800';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const renderOrder = ({ item }) => {
    const isExpanded = expandedOrder === item.id;

    return (
      <View style={styles.orderCard}>
        {/* Order Header - Only date badge, no duplicate time */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
            {item.created_at ? (
              <Text style={styles.orderDateBadge}>{formatTimestamp(item.created_at)}</Text>
            ) : item.order_date ? (
              <Text style={styles.orderDateBadge}>{item.order_date}</Text>
            ) : null}
          </View>
        </View>



        {/* Customer Info */}
        <View style={styles.orderSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.sectionTitle}>Customer</Text>
          </View>
          <Text style={styles.orderCustomer}>{item.customer_name || 'Customer'}</Text>
          {item.customer_email && (
            <Text style={styles.orderEmail}>{item.customer_email}</Text>
          )}
          {item.customer_phone && !item.customer_email && (
            <Text style={styles.orderPhone}>📞 {item.customer_phone}</Text>
          )}
        </View>



        {/* Items */}
        {item.items && item.items.length > 0 && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Items ({item.items.length}):</Text>
            {item.items.map((orderItem, index) => (
              <Text key={index} style={styles.itemText}>
                • {orderItem.name} x{orderItem.quantity} - ₱{orderItem.price.toFixed(2)}
              </Text>
            ))}
          </View>
        )}

        {/* Payment Method - Editable */}
        <View style={styles.orderSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Change Payment Method',
                  'Select payment method:',
                  [
                    { text: 'GCash', onPress: () => handlePaymentMethodChange(item.id, 'GCash') },
                    { text: 'Cash on Delivery', onPress: () => handlePaymentMethodChange(item.id, 'Cash on Delivery') },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Ionicons name="create-outline" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
          <Text style={styles.paymentMethodText}>{item.payment_method || 'Not specified'}</Text>
        </View>

        {/* Status Badges */}
        <View style={styles.orderBadges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPaymentColor(item.payment_status) }]}>
            <Text style={styles.badgeText}>{item.payment_status}</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal:</Text>
            <Text style={styles.priceValue}>₱{item.subtotal?.toFixed(2) || item.total}</Text>
          </View>
          {item.shipping_fee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee:</Text>
              <Text style={styles.priceValue}>₱{item.shipping_fee.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₱{item.total}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {item.status === 'pending' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleDecline(item.id)}
            >
              <Ionicons name="close-circle-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : item.status === 'processing' ? (
          <TouchableOpacity
            style={styles.changeStatusButton}
            onPress={() => {
              Alert.alert(
                'Change Status',
                'Select new status:',
                [
                  { text: 'Processing', onPress: () => handleStatusChange(item.id, 'processing') },
                  { text: 'Out for Delivery', onPress: () => handleStatusChange(item.id, 'out_for_delivery') },
                  { text: 'Completed', onPress: () => handleStatusChange(item.id, 'completed') },
                  { text: 'Cancelled', onPress: () => handleStatusChange(item.id, 'cancelled') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="create-outline" size={16} color="#2196F3" />
            <Text style={styles.changeStatusText}>Change Status</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.changeStatusButton}
            onPress={() => {
              Alert.alert(
                'Change Status',
                'Select new status:',
                [
                  { text: 'Processing', onPress: () => handleStatusChange(item.id, 'processing') },
                  { text: 'Out for Delivery', onPress: () => handleStatusChange(item.id, 'out_for_delivery') },
                  { text: 'Completed', onPress: () => handleStatusChange(item.id, 'completed') },
                  { text: 'Cancelled', onPress: () => handleStatusChange(item.id, 'cancelled') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Ionicons name="create-outline" size={16} color="#2196F3" />
            <Text style={styles.changeStatusText}>Change Status</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Orders Management</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No orders found</Text>
        }
      />
    </View>
  );
};

// ==================== STOCK TAB ====================
const StockTab = () => {
  const [activeStockTab, setActiveStockTab] = useState('Ribbons');
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    name: '',
    category: 'Ribbons',
    price: '',
    quantity: '',
    unit: '',
    reorder_level: '10',
    is_available: true
  });

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllStock();
      setStockItems(response.data.stock || []);
    } catch (error) {
      console.error('Error loading stock:', error);
      Alert.alert('Error', 'Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStock();
    setRefreshing(false);
  };

  const resetForm = () => {
    setStockFormData({
      name: '',
      category: activeStockTab,
      price: '',
      quantity: '',
      unit: '',
      reorder_level: '10',
      is_available: true
    });
    setEditingStock(null);
  };

  const handleEditStock = (item) => {
    setEditingStock(item);
    setStockFormData({
      name: item.name,
      category: item.category,
      price: item.price ? item.price.toString() : '',
      quantity: item.quantity ? item.quantity.toString() : '',
      unit: item.unit || '',
      reorder_level: item.reorder_level ? item.reorder_level.toString() : '10',
      is_available: Boolean(item.is_available)
    });
    setModalVisible(true);
  };

  const handleDeleteStock = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteStock(id);
              Alert.alert('Success', 'Item deleted');
              loadStock();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const handleSaveStock = async () => {
    if (!stockFormData.name || !stockFormData.quantity) {
      Alert.alert('Error', 'Please fill in Name and Quantity');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...stockFormData,
        price: parseFloat(stockFormData.price) || 0,
        quantity: parseInt(stockFormData.quantity) || 0,
        reorder_level: parseInt(stockFormData.reorder_level) || 10,
      };

      if (editingStock) {
        await adminAPI.updateStock(editingStock.id, data);
        Alert.alert('Success', 'Item updated successfully');
      } else {
        await adminAPI.createStock(data);
        Alert.alert('Success', 'Item added successfully');
      }

      setModalVisible(false);
      resetForm();
      await loadStock();
    } catch (error) {
      console.error('Error saving stock:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stockItems.filter(item =>
    item.category === activeStockTab
  );

  const renderStockItem = ({ item }) => (
    <View style={styles.stockCard}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockPrice}>₱{item.price || '0'} / {item.unit || 'unit'}</Text>
        <Text style={styles.stockQuantity}>Qty: {item.quantity}</Text>
        <View style={styles.stockAvailability}>
          <View style={[styles.availabilityDot, { backgroundColor: item.is_available ? '#4CAF50' : '#f44336' }]} />
          <Text style={styles.stockAvailabilityText}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      <View style={styles.stockActions}>
        <TouchableOpacity
          style={styles.editButtonSmall}
          onPress={() => handleEditStock(item)}
        >
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButtonSmall}
          onPress={() => handleDeleteStock(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing && !modalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add {activeStockTab.slice(0, -1)}</Text>
      </TouchableOpacity>

      {/* Stock Category Tabs */}
      <View style={styles.stockTabs}>
        {['Wrappers', 'Ribbons', 'Flowers'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.stockTab, activeStockTab === tab && styles.stockTabActive]}
            onPress={() => setActiveStockTab(tab)}
          >
            <Ionicons
              name={tab === 'Wrappers' ? 'gift' : tab === 'Ribbons' ? 'ribbon' : 'flower'}
              size={20}
              color={activeStockTab === tab ? '#ec4899' : '#666'}
            />
            <Text style={[styles.stockTabText, activeStockTab === tab && styles.stockTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStock}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {activeStockTab.toLowerCase()} found</Text>
        }
      />

      {/* Add/Edit Stock Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingStock ? 'Edit Stock Item' : 'Add Stock Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter item name"
                value={stockFormData.name}
                onChangeText={(text) => setStockFormData({ ...stockFormData, name: text })}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {['Wrappers', 'Ribbons', 'Flowers'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.modalCategoryChip,
                      stockFormData.category === cat && styles.modalCategoryChipActive
                    ]}
                    onPress={() => setStockFormData({ ...stockFormData, category: cat })}
                  >
                    <Text style={[
                      styles.modalCategoryChipText,
                      stockFormData.category === cat && styles.modalCategoryChipTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={stockFormData.price}
                    onChangeText={(text) => setStockFormData({ ...stockFormData, price: text })}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={stockFormData.quantity}
                    onChangeText={(text) => setStockFormData({ ...stockFormData, quantity: text })}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. meters"
                    value={stockFormData.unit}
                    onChangeText={(text) => setStockFormData({ ...stockFormData, unit: text })}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Reorder Level</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    keyboardType="numeric"
                    value={stockFormData.reorder_level}
                    onChangeText={(text) => setStockFormData({ ...stockFormData, reorder_level: text })}
                  />
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>Available</Text>
                <TouchableOpacity
                  style={[styles.switch, stockFormData.is_available && styles.switchActive]}
                  onPress={() => setStockFormData({ ...stockFormData, is_available: !stockFormData.is_available })}
                >
                  <View style={[styles.switchKnob, stockFormData.is_available && styles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveStock}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save Item'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==================== REQUESTS TAB ====================
const RequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllRequests();
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateRequestStatus(id, status);
      Alert.alert('Success', `Request ${status}`);
      setModalVisible(false);
      loadRequests();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'accepted': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'quoted': return '#2196F3';
      default: return '#999';
    }
  };

  const renderRequest = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestType}>{item.type.toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.requestCustomer}>{item.user_name || 'Customer'}</Text>
      <Text style={styles.requestDate}>{formatTimestamp(item.created_at)}</Text>

      {item.photo_url && (
        <View style={styles.requestPreviewImageContainer}>
          <Image
            source={{ uri: item.photo_url.startsWith('http') ? item.photo_url : `${BASE_URL}${item.photo_url}` }}
            style={styles.requestPreviewImage}
          />
          <Text style={styles.viewDetailsText}>View Details & Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Booking & Custom Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No requests found</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.type}</Text>
                </View>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Submitted:</Text>
                  <Text style={styles.detailValue}>{formatTimestamp(selectedRequest.created_at)}</Text>
                </View>

                {/* Parse JSON data for details */}
                {(() => {
                  try {
                    const data = typeof selectedRequest.data === 'string'
                      ? JSON.parse(selectedRequest.data)
                      : selectedRequest.data;

                    return (
                      <>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Event Type:</Text>
                          <Text style={styles.detailValue}>{data.eventType || data.occasion || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Date:</Text>
                          <Text style={styles.detailValue}>{data.eventDate || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Venue:</Text>
                          <Text style={styles.detailValue}>{data.venue || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Details:</Text>
                          <Text style={styles.detailValue}>{data.details || selectedRequest.notes || 'N/A'}</Text>
                        </View>
                      </>
                    );
                  } catch (e) {
                    return <Text>Error parsing details</Text>;
                  }
                })()}

                {selectedRequest.photo_url && (
                  <View style={styles.imageSection}>
                    <Text style={styles.detailLabel}>Inspiration Photo:</Text>
                    <Image
                      source={{ uri: selectedRequest.photo_url.startsWith('http') ? selectedRequest.photo_url : `http://192.168.111.94:5000${selectedRequest.photo_url}` }}
                      style={styles.fullImage}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleStatusChange(selectedRequest.id, 'accepted')}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleStatusChange(selectedRequest.id, 'cancelled')}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==================== NOTIFICATIONS TAB ====================
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    user_id: ''
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      Alert.alert('Error', 'Title and Message are required');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.sendNotification({
        ...formData,
        user_id: formData.user_id || null // If empty, send as system/null
      });
      Alert.alert('Success', 'Notification sent');
      setModalVisible(false);
      setFormData({ title: '', message: '', user_id: '' });
      loadNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteNotification(id);
            loadNotifications();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete notification');
          }
        }
      }
    ]);
  };

  if (loading && !refreshing && !modalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Send Notification</Text>
      </TouchableOpacity>

      <Text style={styles.tabTitle}>System Notifications</Text>

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationDate}>
                {new Date(item.created_at).toLocaleDateString()} • {item.user_name || 'System Wide'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications sent</Text>
        }
      />

      {/* Send Notification Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Notification</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Notification Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Notification Message"
                multiline
                numberOfLines={4}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
              />

              <Text style={styles.inputLabel}>User ID (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Specific User ID (Leave empty for all)"
                keyboardType="numeric"
                value={formData.user_id}
                onChangeText={(text) => setFormData({ ...formData, user_id: text })}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSendNotification}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==================== MESSAGING TAB ====================
const MessagingTab = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllMessages();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Messages</Text>

      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.conversationCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color="#ec4899" />
            </View>
            <View style={styles.conversationContent}>
              <Text style={styles.conversationName}>{item.sender_name || 'Unknown User'}</Text>
              <Text style={styles.conversationMessage} numberOfLines={1}>
                {item.content}
              </Text>
            </View>
            <View style={styles.conversationMeta}>
              <Text style={styles.conversationDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              {item.unread_count > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread_count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No messages yet</Text>
        }
      />
    </View>
  );
};

// ==================== SALES TAB ====================
const SalesTab = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadSalesData();
  }, [selectedPeriod]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const response = await adminAPI.getAllOrders();
      const orders = response.data.orders || [];

      // Calculate sales statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalSales = 0;
      let todaySales = 0;
      let weekSales = 0;
      let monthSales = 0;
      let completedOrders = 0;
      let pendingOrders = 0;

      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const orderTotal = parseFloat(order.total || 0);

        totalSales += orderTotal;

        if (orderDate >= today) {
          todaySales += orderTotal;
        }
        if (orderDate >= weekAgo) {
          weekSales += orderTotal;
        }
        if (orderDate >= monthAgo) {
          monthSales += orderTotal;
        }

        if (order.status === 'completed' || order.status === 'delivered') {
          completedOrders++;
        } else if (order.status === 'pending' || order.status === 'processing') {
          pendingOrders++;
        }
      });

      setSalesData({
        totalSales,
        todaySales,
        weekSales,
        monthSales,
        totalOrders: orders.length,
        completedOrders,
        pendingOrders,
      });

      // Get recent sales based on selected period
      let filteredOrders = orders;
      if (selectedPeriod === 'today') {
        filteredOrders = orders.filter(o => new Date(o.created_at) >= today);
      } else if (selectedPeriod === 'week') {
        filteredOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
      } else if (selectedPeriod === 'month') {
        filteredOrders = orders.filter(o => new Date(o.created_at) >= monthAgo);
      }

      setRecentSales(filteredOrders.slice(0, 20));
    } catch (error) {
      console.error('Error loading sales data:', error);
      // Set sample data if API fails
      setSalesData({
        totalSales: 15750.00,
        todaySales: 700.00,
        weekSales: 4200.00,
        monthSales: 12500.00,
        totalOrders: 45,
        completedOrders: 32,
        pendingOrders: 13,
      });

      // Sample recent sales
      setRecentSales([
        {
          id: 1,
          order_number: 'ORD-20251204-3154',
          customer_name: 'Rhiannah Niño Fernandez',
          total: 700.00,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSalesData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  const currentSales = selectedPeriod === 'today' ? salesData.todaySales :
    selectedPeriod === 'week' ? salesData.weekSales :
      selectedPeriod === 'month' ? salesData.monthSales :
        salesData.totalSales;

  return (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
      }
    >
      <Text style={styles.tabTitle}>Sales Dashboard</Text>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Period:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['today', 'week', 'month', 'all'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.categoryChip,
                selectedPeriod === period && styles.categoryChipActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedPeriod === period && styles.categoryChipTextActive
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sales Summary Cards */}
      <View style={styles.salesSummaryContainer}>
        <View style={styles.salesCard}>
          <Ionicons name="cash" size={32} color="#4CAF50" />
          <Text style={styles.salesCardValue}>{formatCurrency(currentSales)}</Text>
          <Text style={styles.salesCardLabel}>
            {selectedPeriod === 'today' ? "Today's Sales" :
              selectedPeriod === 'week' ? "This Week" :
                selectedPeriod === 'month' ? "This Month" :
                  "Total Sales"}
          </Text>
        </View>

        <View style={styles.salesCard}>
          <Ionicons name="cart" size={32} color="#2196F3" />
          <Text style={styles.salesCardValue}>{salesData.totalOrders}</Text>
          <Text style={styles.salesCardLabel}>Total Orders</Text>
        </View>
      </View>

      <View style={styles.salesSummaryContainer}>
        <View style={styles.salesCard}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.salesCardValue}>{salesData.completedOrders}</Text>
          <Text style={styles.salesCardLabel}>Completed</Text>
        </View>

        <View style={styles.salesCard}>
          <Ionicons name="time" size={32} color="#FF9800" />
          <Text style={styles.salesCardValue}>{salesData.pendingOrders}</Text>
          <Text style={styles.salesCardLabel}>Pending</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Today:</Text>
          <Text style={styles.statValue}>{formatCurrency(salesData.todaySales)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This Week:</Text>
          <Text style={styles.statValue}>{formatCurrency(salesData.weekSales)}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>This Month:</Text>
          <Text style={styles.statValue}>{formatCurrency(salesData.monthSales)}</Text>
        </View>
        <View style={[styles.statRow, styles.statRowTotal]}>
          <Text style={styles.statLabelTotal}>All Time:</Text>
          <Text style={styles.statValueTotal}>{formatCurrency(salesData.totalSales)}</Text>
        </View>
      </View>

      {/* Recent Sales */}
      <Text style={styles.sectionTitle}>Recent Sales</Text>
      {recentSales.length > 0 ? (
        recentSales.map((sale) => (
          <View key={sale.id} style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View>
                <Text style={styles.saleOrderNumber}>{sale.order_number}</Text>
                <Text style={styles.saleCustomer}>{sale.customer_name}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleAmount}>{formatCurrency(sale.total)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sale.status === 'completed' ? '#4CAF50' : '#FF9800' }]}>
                  <Text style={styles.statusText}>{sale.status}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.saleDate}>{formatDate(sale.created_at)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No sales for this period</Text>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// ==================== ABOUT TAB ====================
const AboutTab = () => {
  const [formData, setFormData] = useState({
    description: '',
    mission: '',
    vision: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAbout();
      if (response.data.content) {
        setFormData(response.data.content);
      }
    } catch (error) {
      console.error('Error loading about:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminAPI.updateAbout(formData);
      Alert.alert('Success', 'About content updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.description) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>About Page Management</Text>

      <Text style={styles.inputLabel}>Our Story</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        multiline
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder="Enter your shop's story..."
      />

      <Text style={styles.inputLabel}>Our Promise</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        multiline
        value={formData.mission}
        onChangeText={(text) => setFormData({ ...formData, mission: text })}
        placeholder="Enter your mission/promise..."
      />

      <Text style={styles.inputLabel}>Owner Quote (Vision)</Text>
      <TextInput
        style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
        multiline
        value={formData.vision}
        onChangeText={(text) => setFormData({ ...formData, vision: text })}
        placeholder="Enter a quote..."
      />

      <TouchableOpacity
        style={[styles.addButton, { marginTop: 20 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// ==================== CONTACT TAB ====================
const ContactTab = () => {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    map_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getContact();
      if (response.data.info) {
        setFormData(response.data.info);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminAPI.updateContact(formData);
      Alert.alert('Success', 'Contact info updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update info');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.address) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Contact Page Management</Text>

      <Text style={styles.inputLabel}>Address</Text>
      <TextInput
        style={styles.input}
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        placeholder="Full Address"
      />

      <Text style={styles.inputLabel}>Phone</Text>
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        placeholder="Phone Number"
      />

      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        placeholder="Email Address"
      />

      <Text style={styles.inputLabel}>Map URL</Text>
      <TextInput
        style={styles.input}
        value={formData.map_url}
        onChangeText={(text) => setFormData({ ...formData, map_url: text })}
        placeholder="Google Maps Embed URL"
      />

      <TouchableOpacity
        style={[styles.addButton, { marginTop: 20 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// ==================== EMPLOYEES TAB ====================
const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.addEmployee(formData);
      Alert.alert('Success', 'Employee added');
      setModalVisible(false);
      setFormData({ name: '', email: '', password: '' });
      loadData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminAPI.deleteEmployee(id);
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete employee');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Employee Management</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Employee</Text>
      </TouchableOpacity>

      <FlatList
        data={employees}
        renderItem={({ item }) => (
          <View style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <Text style={styles.stockName}>{item.name}</Text>
              <Text style={styles.stockQuantity}>{item.email}</Text>
              <View style={[styles.badge, { backgroundColor: '#e0e0e0', alignSelf: 'flex-start', marginTop: 5 }]}>
                <Text style={{ fontSize: 10, color: '#666' }}>EMPLOYEE</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButtonSmall}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No employees found</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Employee</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Employee Name"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Email Address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Password"
                secureTextEntry
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAdd}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Employee'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    backgroundColor: '#ec4899',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingBottom: 40,
    height: 100,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#ec4899',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 5,
    color: '#333',
  },
  categoryScroll: {
    marginBottom: 20,
    maxHeight: 50, // Limit height so they don't grow too tall
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    height: 40, // Fixed height for consistency
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#ec4899',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden', // Ensures image corners are rounded
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8f8f8',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#999',
    marginTop: 5,
    fontSize: 12,
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    paddingTop: 0, // Reduce top padding since info has bottom padding
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#3b82f6', // Blue
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ef4444', // Red
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  orderDateBadge: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: '#ec4899',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  orderEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  orderPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  orderBadges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  changeStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  changeStatusText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  stockTabs: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stockTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 5,
  },
  stockTabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#ec4899',
  },
  stockTabText: {
    fontSize: 14,
    color: '#666',
  },
  stockTabTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  stockCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  stockPrice: {
    fontSize: 14,
    color: '#ec4899',
    marginBottom: 5,
  },
  stockAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockAvailabilityText: {
    fontSize: 12,
    color: '#666',
  },
  stockActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButtonSmall: {
    padding: 8,
  },
  deleteButtonSmall: {
    padding: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteIconButton: {
    padding: 5,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffe0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  conversationMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#ec4899',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  modalCategoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  modalCategoryChipActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  modalCategoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  modalCategoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  imageUploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    marginBottom: 15,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageUploadPlaceholder: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ec4899',
    marginTop: 10,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ec4899',
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  takePhotoText: {
    color: '#ec4899',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteIconButton: {
    padding: 5,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffe0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  conversationMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#ec4899',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  modalCategoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  modalCategoryChipActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  modalCategoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  modalCategoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  imageUploadBox: {
    height: 200,
    borderWidth: 2,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    marginBottom: 15,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageUploadPlaceholder: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ec4899',
    marginTop: 10,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ec4899',
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  takePhotoText: {
    color: '#ec4899',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#ec4899',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: '70%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownInputText: {
    fontSize: 16,
    color: '#333',
  },
  categoryPickerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryPickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  // New styles for enhanced order display
  orderTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 5,
  },
  orderTypeText: {
    color: '#ec4899',
    fontSize: 13,
    fontWeight: '600',
  },
  orderSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  orderPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  addressRecipient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  pickupText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pricingSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
  },
  priceValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  stockQuantity: {
    fontSize: 14,
    color: '#666',
  },
  // Sales Tab Styles
  salesSummaryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  salesCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  salesCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  salesCardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickStatsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statRowTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#ec4899',
    paddingTop: 12,
    marginTop: 8,
  },
  statLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  saleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  saleOrderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  saleCustomer: {
    fontSize: 13,
    color: '#666',
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  saleDate: {
    fontSize: 12,
    color: '#999',
  },
  // Requests Tab Styles
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  requestCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  requestPreviewImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    gap: 10,
  },
  requestPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  detailSection: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  imageSection: {
    marginBottom: 20,
  },
  fullImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AdminDashboard;
