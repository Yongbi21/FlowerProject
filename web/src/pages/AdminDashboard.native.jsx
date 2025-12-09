import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('catalogue');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (!userJson) {
        navigation.navigate('Login');
        return;
      }
      const currentUser = JSON.parse(userJson);
      setUserRole(currentUser.role || 'employee');
    } catch (error) {
      console.error('Error checking user:', error);
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'catalogue', label: 'Catalogue', icon: 'box', roles: ['employee', 'admin'] },
    { id: 'orders', label: 'Orders', icon: 'shopping-cart', roles: ['employee', 'admin'] },
    { id: 'stock', label: 'Stock', icon: 'warehouse', roles: ['employee', 'admin'] },
    { id: 'notifications', label: 'Notifications', icon: 'bell', roles: ['employee', 'admin'] },
    { id: 'messaging', label: 'Messaging', icon: 'comments', roles: ['employee', 'admin'] },
    { id: 'about', label: 'About', icon: 'info-circle', roles: ['admin'] },
    { id: 'contact', label: 'Contact', icon: 'phone', roles: ['admin'] },
    { id: 'sales', label: 'Sales', icon: 'chart-line', roles: ['admin'] },
    { id: 'employees', label: 'Employees', icon: 'users', roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalogue':
        return <CatalogueTab />;
      case 'orders':
        return <OrdersTab />;
      case 'stock':
        return <StockTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'messaging':
        return <MessagingTab />;
      case 'about':
        return <AboutTab />;
      case 'contact':
        return <ContactTab />;
      case 'sales':
        return <SalesTab />;
      case 'employees':
        return <EmployeesTab />;
      default:
        return null;
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
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Admin Dashboard</Text>
        </View>
        <ScrollView style={styles.navContainer}>
          {visibleTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navLink,
                activeTab === tab.id && styles.navLinkActive,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#fff' : '#c2c7d0'}
                style={styles.navIcon}
              />
              <Text
                style={[
                  styles.navLinkText,
                  activeTab === tab.id && styles.navLinkTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color="#c2c7d0" style={styles.navIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

// Catalogue Tab Component
const CatalogueTab = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    category: '',
    image: null,
  });

  const categories = ['Sympathy', 'Graduation', 'All Souls Day', 'Valentines', 'Get Well Soon', 'Mothers Day'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const saved = await AsyncStorage.getItem('catalogueProducts');
      setProducts(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description,
        category: formData.category,
        image: formData.image || 'https://via.placeholder.com/300',
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await AsyncStorage.getItem('catalogueProducts');
      const savedProducts = saved ? JSON.parse(saved) : [];
      
      let updated;
      if (editingProduct) {
        updated = savedProducts.map(p => p.id === editingProduct.id ? productData : p);
      } else {
        updated = [...savedProducts, productData];
      }

      await AsyncStorage.setItem('catalogueProducts', JSON.stringify(updated));
      loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description,
      category: product.category,
      image: product.image,
    });
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem('catalogueProducts');
              const savedProducts = saved ? JSON.parse(saved) : [];
              const updated = savedProducts.filter(p => p.id !== productId);
              await AsyncStorage.setItem('catalogueProducts', JSON.stringify(updated));
              loadProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      quantity: '',
      description: '',
      category: '',
      image: null,
    });
  };

  const renderProduct = ({ item }) => (
    <View style={styles.tableRow}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.name}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.category}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>₱{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCellText}>{item.quantity}</Text>
      </View>
      <View style={styles.tableCell}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Icon name="edit" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="trash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Catalogue Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No products found. Add your first product!</Text>
        </View>
      ) : (
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Image</Text>
          <Text style={styles.tableHeaderText}>Name</Text>
          <Text style={styles.tableHeaderText}>Category</Text>
          <Text style={styles.tableHeaderText}>Price</Text>
          <Text style={styles.tableHeaderText}>Qty</Text>
          <Text style={styles.tableHeaderText}>Actions</Text>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter product name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.quantity}
                  onChangeText={(value) => handleInputChange('quantity', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView style={styles.categoryContainer}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        formData.category === cat && styles.categoryOptionActive,
                      ]}
                      onPress={() => handleInputChange('category', cat)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === cat && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={formData.image || ''}
                  onChangeText={(value) => handleInputChange('image', value)}
                  placeholder="Enter image URL"
                />
                {formData.image && (
                  <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingProduct ? 'Update' : 'Add'} Product
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Orders Tab Component (Simplified version - full implementation would be similar)
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      const savedRequests = await AsyncStorage.getItem('requests');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      const requests = savedRequests ? JSON.parse(savedRequests) : [];
      setOrders([...orders, ...requests]);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const renderOrder = ({ item }) => {
    const orderDate = new Date(item.date || item.requestDate);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>
            {orderDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <Text style={styles.orderType}>
          {item.type === 'booking' && 'Event Booking'}
          {item.type === 'special_order' && 'Special Order'}
          {item.type === 'customized' && 'Customized'}
          {!item.type && 'Regular Order'}
        </Text>
        <View style={styles.orderStatusRow}>
          <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.orderTotal}>₱{(item.total || item.price || 0).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Orders Management</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
};

// Stock Tab Component
const StockTab = () => {
  const [stock, setStock] = useState({
    wrappers: [],
    ribbons: [],
    flowers: [],
  });
  const [activeCategory, setActiveCategory] = useState('wrappers');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    available: true,
    image: null,
  });

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const saved = await AsyncStorage.getItem('stock');
      setStock(saved ? JSON.parse(saved) : { wrappers: [], ribbons: [], flowers: [] });
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        id: editingItem ? editingItem.id : `${activeCategory}-${Date.now()}`,
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        available: formData.available,
        image: formData.image || 'https://via.placeholder.com/300',
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await AsyncStorage.getItem('stock');
      const savedStock = saved ? JSON.parse(saved) : { wrappers: [], ribbons: [], flowers: [] };
      const categoryItems = savedStock[activeCategory] || [];

      let updated;
      if (editingItem) {
        updated = categoryItems.map(item => item.id === editingItem.id ? itemData : item);
      } else {
        updated = [...categoryItems, itemData];
      }

      savedStock[activeCategory] = updated;
      await AsyncStorage.setItem('stock', JSON.stringify(savedStock));
      loadStock();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving stock item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      available: item.available,
      image: item.image,
    });
    setShowModal(true);
  };

  const handleDelete = (itemId) => {
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
              const saved = await AsyncStorage.getItem('stock');
              const savedStock = saved ? JSON.parse(saved) : { wrappers: [], ribbons: [], flowers: [] };
              savedStock[activeCategory] = savedStock[activeCategory].filter(item => item.id !== itemId);
              await AsyncStorage.setItem('stock', JSON.stringify(savedStock));
              loadStock();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      available: true,
      image: null,
    });
  };

  const currentItems = stock[activeCategory] || [];

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Stock Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add {activeCategory.slice(0, -1)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeCategory === 'wrappers' && styles.tabButtonActive]}
            onPress={() => setActiveCategory('wrappers')}
          >
            <Text style={[styles.tabButtonText, activeCategory === 'wrappers' && styles.tabButtonTextActive]}>
              Wrappers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeCategory === 'ribbons' && styles.tabButtonActive]}
            onPress={() => setActiveCategory('ribbons')}
          >
            <Text style={[styles.tabButtonText, activeCategory === 'ribbons' && styles.tabButtonTextActive]}>
              Ribbons
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeCategory === 'flowers' && styles.tabButtonActive]}
            onPress={() => setActiveCategory('flowers')}
          >
            <Text style={[styles.tabButtonText, activeCategory === 'flowers' && styles.tabButtonTextActive]}>
              Flowers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No {activeCategory} found. Add your first item!</Text>
        </View>
      ) : (
        <FlatList
          data={currentItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.stockCard}>
              <Image source={{ uri: item.image }} style={styles.stockImage} />
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{item.name}</Text>
                <Text style={styles.stockPrice}>₱{item.price.toLocaleString()}</Text>
                <View style={styles.stockActions}>
                  <Switch
                    value={item.available}
                    onValueChange={async () => {
                      const saved = await AsyncStorage.getItem('stock');
                      const savedStock = saved ? JSON.parse(saved) : { wrappers: [], ribbons: [], flowers: [] };
                      savedStock[activeCategory] = savedStock[activeCategory].map(i =>
                        i.id === item.id ? { ...i, available: !i.available } : i
                      );
                      await AsyncStorage.setItem('stock', JSON.stringify(savedStock));
                      loadStock();
                    }}
                  />
                  <Text style={styles.availableText}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
              <View style={styles.stockItemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(item)}
                >
                  <Icon name="edit" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Icon name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Add'} {activeCategory.slice(0, -1)}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Available</Text>
                  <Switch
                    value={formData.available}
                    onValueChange={(value) => handleInputChange('available', value)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={formData.image || ''}
                  onChangeText={(value) => handleInputChange('image', value)}
                  placeholder="Enter image URL"
                />
                {formData.image && (
                  <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>{editingItem ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Notifications Tab
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'order',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const saved = await AsyncStorage.getItem('notifications');
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const notification = {
        id: `notif-${Date.now()}`,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        icon: 'bell',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/my-orders',
      };

      const saved = await AsyncStorage.getItem('notifications');
      const savedNotifications = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('notifications', JSON.stringify([notification, ...savedNotifications]));
      loadNotifications();
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'order' });
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationType}>{item.type}</Text>
      <Text style={styles.notificationDate}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Notifications</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Send Notification</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No notifications found</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Notification</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(value) => handleInputChange('title', value)}
                  placeholder="Enter title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.message}
                  onChangeText={(value) => handleInputChange('message', value)}
                  placeholder="Enter message"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Type *</Text>
                <View style={styles.typeContainer}>
                  {['order', 'payment', 'request'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.typeOptionActive,
                      ]}
                      onPress={() => handleInputChange('type', type)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          formData.type === type && styles.typeOptionTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSendNotification}
              >
                <Text style={styles.submitButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Messaging Tab (Simplified - full implementation would include chat UI)
const MessagingTab = () => {
  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Messaging</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>Messaging feature coming soon</Text>
      </View>
    </View>
  );
};

// About Tab
const AboutTab = () => {
  const [aboutData, setAboutData] = useState({
    story: '',
    promise: '',
    ownerQuote: '',
  });

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const saved = await AsyncStorage.getItem('aboutData');
      if (saved) {
        setAboutData(JSON.parse(saved));
      } else {
        setAboutData({
          story: "Jocery's Flower Shop was born from a love for flowers...",
          promise: "We built our shop on the foundation of those relationships...",
          ownerQuote: "Flowers have always been my passion...",
        });
      }
    } catch (error) {
      console.error('Error loading about data:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setAboutData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('aboutData', JSON.stringify(aboutData));
      Alert.alert('Success', 'About page updated successfully!');
    } catch (error) {
      console.error('Error saving about data:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>About Page Management</Text>
      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Our Story</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={aboutData.story}
            onChangeText={(value) => handleInputChange('story', value)}
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Our Promise</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={aboutData.promise}
            onChangeText={(value) => handleInputChange('promise', value)}
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Owner Quote</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={aboutData.ownerQuote}
            onChangeText={(value) => handleInputChange('ownerQuote', value)}
            multiline
            numberOfLines={5}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Contact Tab
const ContactTab = () => {
  const [contactData, setContactData] = useState({
    address: '',
    phone: '',
    email: '',
    mapUrl: '',
  });

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const saved = await AsyncStorage.getItem('contactData');
      if (saved) {
        setContactData(JSON.parse(saved));
      } else {
        setContactData({
          address: 'Zamboanga City, Philippines',
          phone: '+63 756 347 901',
          email: 'JoceryFlowerShop@gmail.com',
          mapUrl: '',
        });
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('contactData', JSON.stringify(contactData));
      Alert.alert('Success', 'Contact page updated successfully!');
    } catch (error) {
      console.error('Error saving contact data:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Contact Page Management</Text>
      <ScrollView style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={contactData.address}
            onChangeText={(value) => handleInputChange('address', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={contactData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={contactData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Map URL</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contactData.mapUrl}
            onChangeText={(value) => handleInputChange('mapUrl', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Sales Tab
const SalesTab = () => {
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    calculateSales();
  }, []);

  const calculateSales = async () => {
    try {
      const ordersJson = await AsyncStorage.getItem('orders');
      const requestsJson = await AsyncStorage.getItem('requests');
      const orders = ordersJson ? JSON.parse(ordersJson) : [];
      const requests = requestsJson ? JSON.parse(requestsJson) : [];
      const allOrders = [...orders, ...requests];

      const completed = allOrders.filter(o => o.status === 'completed' || o.paymentStatus === 'paid');
      const pending = allOrders.filter(o => o.status === 'pending');
      const revenue = completed.reduce((sum, o) => sum + (o.total || o.price || 0), 0);

      setSalesData({
        totalRevenue: revenue,
        totalOrders: allOrders.length,
        completedOrders: completed.length,
        pendingOrders: pending.length,
      });
    } catch (error) {
      console.error('Error calculating sales:', error);
    }
  };

  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Sales Overview</Text>
      <ScrollView style={styles.salesContainer}>
        <StatCard
          icon="dollar-sign"
          value={`₱${salesData.totalRevenue.toLocaleString()}`}
          label="Total Revenue"
          color="#ec4899"
        />
        <StatCard
          icon="shopping-cart"
          value={salesData.totalOrders.toString()}
          label="Total Orders"
          color="#4e73df"
        />
        <StatCard
          icon="check-circle"
          value={salesData.completedOrders.toString()}
          label="Completed"
          color="#1cc88a"
        />
        <StatCard
          icon="clock-o"
          value={salesData.pendingOrders.toString()}
          label="Pending"
          color="#f6c23e"
        />
      </ScrollView>
    </View>
  );
};

// Employees Tab
const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const saved = await AsyncStorage.getItem('employees');
      setEmployees(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const employee = {
        id: `emp-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        createdAt: new Date().toISOString(),
      };

      const saved = await AsyncStorage.getItem('employees');
      const savedEmployees = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('employees', JSON.stringify([...savedEmployees, employee]));
      loadEmployees();
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
    } catch (error) {
      console.error('Error adding employee:', error);
      Alert.alert('Error', 'Failed to add employee');
    }
  };

  const handleDelete = (employeeId) => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const saved = await AsyncStorage.getItem('employees');
              const savedEmployees = saved ? JSON.parse(saved) : [];
              const updated = savedEmployees.filter(emp => emp.id !== employeeId);
              await AsyncStorage.setItem('employees', JSON.stringify(updated));
              loadEmployees();
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  const renderEmployee = ({ item }) => (
    <View style={styles.employeeCard}>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, item.role === 'admin' && styles.roleBadgeAdmin]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => handleDelete(item.id)}
      >
        <Icon name="trash" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabTitle}>Employee Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Employee</Text>
        </TouchableOpacity>
      </View>

      {employees.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No employees found</Text>
        </View>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderEmployee}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Employee</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="times" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter password"
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role *</Text>
                <View style={styles.typeContainer}>
                  {['employee', 'admin'].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.typeOption,
                        formData.role === role && styles.typeOptionActive,
                      ]}
                      onPress={() => handleInputChange('role', role)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          formData.role === role && styles.typeOptionTextActive,
                        ]}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Add Employee</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f6f9',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#343a40',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: 20,
    backgroundColor: '#ec4899',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  navContainer: {
    flex: 1,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 25,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: '#ec4899',
  },
  navIcon: {
    width: 25,
    marginRight: 10,
  },
  navLinkText: {
    color: '#c2c7d0',
    fontSize: 14,
  },
  navLinkTextActive: {
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    color: '#c2c7d0',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
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
  tabContainer: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fc',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e3e6f0',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
    color: '#1a1a1a',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e6f0',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
  },
  tableCellText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#4e73df',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e6f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e3e6f0',
    gap: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e3e6f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButton: {
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#ec4899',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e6f0',
    backgroundColor: '#fff',
  },
  categoryOptionActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e3e6f0',
  },
  tabButton: {
    padding: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -2,
  },
  tabButtonActive: {
    borderBottomColor: '#ec4899',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#6c757d',
  },
  tabButtonTextActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  stockCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stockImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableText: {
    fontSize: 12,
    color: '#6c757d',
  },
  stockItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  orderType: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statuspending: {
    backgroundColor: '#ffeeba',
  },
  statusprocessing: {
    backgroundColor: '#cfe2ff',
  },
  statusready: {
    backgroundColor: '#d1e7dd',
  },
  statuscompleted: {
    backgroundColor: '#d1e7dd',
  },
  statuscancelled: {
    backgroundColor: '#f8d7da',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  notificationType: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  formContainer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#ec4899',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e6f0',
    backgroundColor: '#fff',
  },
  typeOptionActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  salesContainer: {
    flex: 1,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    padding: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#4e73df',
  },
  roleBadgeAdmin: {
    backgroundColor: '#dc3545',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminDashboard;

