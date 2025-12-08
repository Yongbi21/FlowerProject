import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('catalogue');
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Check if user is logged in and get role
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUserRole(currentUser.role || 'employee');
    }, [navigate]);

    const tabs = [
        { id: 'catalogue', label: 'Catalogue', icon: 'fa-box', roles: ['employee', 'admin'] },
        { id: 'orders', label: 'Orders', icon: 'fa-shopping-cart', roles: ['employee', 'admin'] },
        { id: 'stock', label: 'Stock', icon: 'fa-warehouse', roles: ['employee', 'admin'] },
        { id: 'notifications', label: 'Notifications', icon: 'fa-bell', roles: ['employee', 'admin'] },
        { id: 'messaging', label: 'Messaging', icon: 'fa-comments', roles: ['employee', 'admin'] },
        { id: 'about', label: 'About', icon: 'fa-info-circle', roles: ['admin'] },
        { id: 'contact', label: 'Contact', icon: 'fa-phone', roles: ['admin'] },
        { id: 'sales', label: 'Sales', icon: 'fa-chart-line', roles: ['admin'] },
        { id: 'employees', label: 'Employees', icon: 'fa-users', roles: ['admin'] },
    ];

    const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    if (!userRole) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Admin Dashboard</h3>
                </div>
                <nav className="admin-nav" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
                    <div style={{ flex: 1 }}>
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`admin-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <i className={`fas ${tab.icon}`}></i>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <button
                        className="admin-nav-link"
                        onClick={handleLogout}
                        style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', textAlign: 'left', background: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer' }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </nav>
            </div>
            <div className="admin-content">
                {activeTab === 'catalogue' && <CatalogueTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'stock' && <StockTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
                {activeTab === 'messaging' && <MessagingTab />}
                {activeTab === 'about' && <AboutTab />}
                {activeTab === 'contact' && <ContactTab />}
                {activeTab === 'sales' && <SalesTab />}
                {activeTab === 'employees' && <EmployeesTab />}
            </div>
        </div>
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
        imagePreview: null
    });

    const categories = ['Sympathy', 'Graduation', 'All Souls Day', 'Valentines', 'Get Well Soon', 'Mothers Day'];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        const savedProducts = JSON.parse(localStorage.getItem('catalogueProducts') || '[]');
        setProducts(savedProducts);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'image') {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        image: reader.result,
                        imagePreview: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
            name: formData.name,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            description: formData.description,
            category: formData.category,
            image: formData.image || 'https://via.placeholder.com/300',
            createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const savedProducts = JSON.parse(localStorage.getItem('catalogueProducts') || '[]');
        if (editingProduct) {
            const updated = savedProducts.map(p => p.id === editingProduct.id ? productData : p);
            localStorage.setItem('catalogueProducts', JSON.stringify(updated));
        } else {
            localStorage.setItem('catalogueProducts', JSON.stringify([...savedProducts, productData]));
        }

        loadProducts();
        handleCloseModal();
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            description: product.description,
            category: product.category,
            image: product.image,
            imagePreview: product.image
        });
        setShowModal(true);
    };

    const handleDelete = (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const savedProducts = JSON.parse(localStorage.getItem('catalogueProducts') || '[]');
            const updated = savedProducts.filter(p => p.id !== productId);
            localStorage.setItem('catalogueProducts', JSON.stringify(updated));
            loadProducts();
        }
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
            imagePreview: null
        });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Catalogue Management</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i>Add Product
                </button>
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    No products found. Add your first product!
                                </td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>₱{product.price.toLocaleString()}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(product)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>{editingProduct ? 'Edit Product' : 'Add Product'}</h5>
                            <button className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Product Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Product Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                    />
                                    {formData.imagePreview && (
                                        <img 
                                            src={formData.imagePreview} 
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '5px' }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update' : 'Add'} Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Orders Tab Component
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = () => {
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const savedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
        const allOrders = [...savedOrders, ...savedRequests];
        setOrders(allOrders);
    };

    const handleAccept = (order) => {
        if (order.type) {
            // It's a request
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const updated = requests.map(r => 
                r.id === order.id ? { ...r, status: 'processing', acceptedAt: new Date().toISOString() } : r
            );
            localStorage.setItem('requests', JSON.stringify(updated));
            
            // Create notification
            createNotification(order, 'accepted');
        } else {
            // Regular order
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const updated = savedOrders.map(o => 
                o.id === order.id ? { ...o, status: 'processing', acceptedAt: new Date().toISOString() } : o
            );
            localStorage.setItem('orders', JSON.stringify(updated));
            
            createNotification(order, 'accepted');
        }
        loadOrders();
    };

    const handleDecline = (order) => {
        if (window.confirm('Are you sure you want to decline this order?')) {
            if (order.type) {
                // It's a request - delete it when declined
                const requests = JSON.parse(localStorage.getItem('requests') || '[]');
                const updated = requests.filter(r => r.id !== order.id);
                localStorage.setItem('requests', JSON.stringify(updated));
            } else {
                // Regular order - update status
                const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const updated = savedOrders.map(o => 
                    o.id === order.id ? { ...o, status: 'cancelled', declinedAt: new Date().toISOString() } : o
                );
                localStorage.setItem('orders', JSON.stringify(updated));
            }
            createNotification(order, 'declined');
            loadOrders();
        }
    };

    const handleConfirmPayment = (order) => {
        if (order.type) {
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const updated = requests.map(r => 
                r.id === order.id ? { ...r, paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString() } : r
            );
            localStorage.setItem('requests', JSON.stringify(updated));
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const updated = savedOrders.map(o => 
                o.id === order.id ? { ...o, paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString() } : o
            );
            localStorage.setItem('orders', JSON.stringify(updated));
        }
        createNotification(order, 'payment_confirmed');
        loadOrders();
    };

    const handleStatusChange = (order, newStatus) => {
        if (order.type) {
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const updated = requests.map(r => 
                r.id === order.id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
            );
            localStorage.setItem('requests', JSON.stringify(updated));
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const updated = savedOrders.map(o => 
                o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
            );
            localStorage.setItem('orders', JSON.stringify(updated));
        }
        loadOrders();
    };

    const handlePaymentStatusChange = (order, newPaymentStatus) => {
        if (order.type) {
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const updated = requests.map(r => 
                r.id === order.id ? { ...r, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() } : r
            );
            localStorage.setItem('requests', JSON.stringify(updated));
        } else {
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const updated = savedOrders.map(o => 
                o.id === order.id ? { ...o, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() } : o
            );
            localStorage.setItem('orders', JSON.stringify(updated));
        }
        loadOrders();
    };

    const handleDelete = (order) => {
        const orderType = order.type === 'inquiry' ? 'inquiry' : 
                         order.type === 'booking' ? 'event booking' :
                         order.type === 'special_order' ? 'special order' :
                         order.type === 'customized' ? 'customized bouquet' :
                         'order';
        
        if (window.confirm(`Are you sure you want to delete this ${orderType}? This action cannot be undone.`)) {
            if (order.type) {
                // It's a request (inquiry, booking, special_order, customized)
                const requests = JSON.parse(localStorage.getItem('requests') || '[]');
                const updated = requests.filter(r => r.id !== order.id);
                localStorage.setItem('requests', JSON.stringify(updated));
            } else {
                // It's a regular order
                const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const updated = savedOrders.filter(o => o.id !== order.id);
                localStorage.setItem('orders', JSON.stringify(updated));
            }
            loadOrders();
        }
    };

    const createNotification = (order, type) => {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        let notification;
        
        if (type === 'accepted') {
            notification = {
                id: `notif-${Date.now()}`,
                type: 'order',
                title: 'Order Accepted!',
                message: `Your ${order.type ? 'request' : 'order'} has been accepted and is now being processed.`,
                icon: 'fa-check-circle',
                timestamp: new Date().toISOString(),
                read: false,
                link: '/my-orders'
            };
        } else if (type === 'declined') {
            notification = {
                id: `notif-${Date.now()}`,
                type: 'order',
                title: 'Order Declined',
                message: `Your ${order.type ? 'request' : 'order'} has been declined. Please contact us for more information.`,
                icon: 'fa-times-circle',
                timestamp: new Date().toISOString(),
                read: false,
                link: '/my-orders'
            };
        } else if (type === 'payment_confirmed') {
            notification = {
                id: `notif-${Date.now()}`,
                type: 'payment',
                title: 'Payment Confirmed!',
                message: `Your payment for ${order.type ? 'request' : 'order'} has been confirmed.`,
                icon: 'fa-check-circle',
                timestamp: new Date().toISOString(),
                read: false,
                link: '/my-orders'
            };
        }
        
        if (notification) {
            localStorage.setItem('notifications', JSON.stringify([notification, ...notifications]));
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'status-pending',
            processing: 'status-processing',
            ready_for_pickup: 'status-ready',
            to_receive: 'status-shipped',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    };

    return (
        <div>
            <h2 className="mb-4">Orders Management</h2>
            <div className="table-card">
                <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Type</th>
                            <th>Timestamp</th>
                            <th>Delivery Method</th>
                            <th>Delivery Address</th>
                            <th>Status</th>
                            <th>Payment Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No orders found</td>
                            </tr>
                        ) : (
                            orders.map(order => {
                                const orderDate = new Date(order.date || order.requestDate);
                                const deliveryMethod = order.deliveryMethod || (order.address ? 'delivery' : 'pickup');
                                const address = order.address 
                                    ? (typeof order.address === 'string' 
                                        ? order.address 
                                        : `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.province || ''} ${order.address.zip || ''}`.trim())
                                    : (order.venue || 'Jocery\'s Flower Shop, 123 Flower St., Quezon City');
                                
                                return (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>
                                            {order.type === 'booking' && 'Event Booking'}
                                            {order.type === 'special_order' && 'Special Order'}
                                            {order.type === 'customized' && 'Customized'}
                                            {order.type === 'inquiry' && 'Inquiry'}
                                            {!order.type && 'Regular Order'}
                                        </td>
                                        <td>
                                            <div>{orderDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}</div>
                                            <small className="text-muted">
                                                {orderDate.toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </small>
                                        </td>
                                        <td>
                                            {deliveryMethod === 'delivery' ? (
                                                <span className="badge bg-info">
                                                    <i className="fas fa-truck me-1"></i>Delivery
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary">
                                                    <i className="fas fa-store me-1"></i>Pickup
                                                </span>
                                            )}
                                            {order.pickupTime && deliveryMethod === 'pickup' && (
                                                <div className="small text-muted mt-1">
                                                    {order.pickupTime}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {deliveryMethod === 'delivery' ? (
                                                <div className="small">
                                                    <i className="fas fa-map-marker-alt me-1 text-danger"></i>
                                                    {address || 'No address provided'}
                                                </div>
                                            ) : (
                                                <div className="small text-muted">
                                                    <i className="fas fa-store me-1"></i>
                                                    Jocery's Flower Shop
                                                    <br />
                                                    <span style={{ fontSize: '0.8rem' }}>123 Flower St., Quezon City</span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(order.status || 'pending')}`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                order.paymentStatus === 'paid' ? 'bg-success' : 
                                                order.paymentStatus === 'waiting_for_confirmation' ? 'bg-info' : 
                                                'bg-warning'
                                            }`}>
                                                {order.paymentStatus || 'to_pay'}
                                            </span>
                                        </td>
                                        <td>₱{(order.total || order.price || 0).toLocaleString()}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowOrderModal(true);
                                                }}
                                            >
                                                View
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(order)}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>Order Details - {selectedOrder.id}</h5>
                            <button className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Order Type:</strong> {
                                        selectedOrder.type === 'booking' ? 'Event Booking' :
                                        selectedOrder.type === 'special_order' ? 'Special Order' :
                                        selectedOrder.type === 'customized' ? 'Customized Bouquet' :
                                        selectedOrder.type === 'inquiry' ? 'Inquiry' :
                                        'Regular Order'
                                    }
                                </div>
                                <div className="col-md-6">
                                    <strong>Timestamp:</strong> {new Date(selectedOrder.date || selectedOrder.requestDate).toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Delivery Method:</strong>
                                    {selectedOrder.deliveryMethod === 'delivery' || (selectedOrder.address && !selectedOrder.deliveryMethod) ? (
                                        <span className="badge bg-info ms-2">
                                            <i className="fas fa-truck me-1"></i>Delivery
                                        </span>
                                    ) : (
                                        <span className="badge bg-secondary ms-2">
                                            <i className="fas fa-store me-1"></i>Pickup
                                        </span>
                                    )}
                                    {selectedOrder.pickupTime && (selectedOrder.deliveryMethod === 'pickup' || !selectedOrder.deliveryMethod) && (
                                        <div className="mt-2">
                                            <strong>Pickup Time:</strong> {selectedOrder.pickupTime}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <strong>Delivery Address:</strong>
                                    <div className="mt-2">
                                        {selectedOrder.deliveryMethod === 'delivery' || (selectedOrder.address && !selectedOrder.deliveryMethod) ? (
                                            <div>
                                                <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                                                {selectedOrder.address 
                                                    ? (typeof selectedOrder.address === 'string' 
                                                        ? selectedOrder.address 
                                                        : `${selectedOrder.address.street || ''}, ${selectedOrder.address.city || ''}, ${selectedOrder.address.province || ''} ${selectedOrder.address.zip || ''}`.trim())
                                                    : 'No address provided'}
                                            </div>
                                        ) : (
                                            <div>
                                                <i className="fas fa-store me-2"></i>
                                                Jocery's Flower Shop
                                                <br />
                                                <span className="text-muted" style={{ marginLeft: '24px' }}>
                                                    123 Flower St., Quezon City
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.items && (
                                <div className="mb-3">
                                    <strong>Items:</strong>
                                    <ul>
                                        {selectedOrder.items.map((item, idx) => (
                                            <li key={idx}>{item.name} x{item.qty} - ₱{item.price}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedOrder.photo && (
                                <div className="mb-3">
                                    <strong>Photo:</strong>
                                    <img src={selectedOrder.photo} alt="Order" style={{ maxWidth: '100%', marginTop: '10px' }} />
                                </div>
                            )}

                            {selectedOrder.receipt && (
                                <div className="mb-3">
                                    <strong>Payment Receipt:</strong>
                                    <img src={selectedOrder.receipt} alt="Receipt" style={{ maxWidth: '100%', marginTop: '10px' }} />
                                    <button 
                                        className="btn btn-success btn-sm mt-2"
                                        onClick={() => {
                                            handleConfirmPayment(selectedOrder);
                                            setShowOrderModal(false);
                                        }}
                                    >
                                        Confirm Payment
                                    </button>
                                </div>
                            )}

                            <div className="mb-3">
                                <strong>Status:</strong>
                                <select 
                                    className="form-select mt-2"
                                    value={selectedOrder.status || 'pending'}
                                    onChange={(e) => handleStatusChange(selectedOrder, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="ready_for_pickup">Ready for Pickup</option>
                                    <option value="to_receive">Out for Delivery</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <strong>Payment Status:</strong>
                                <select 
                                    className="form-select mt-2"
                                    value={selectedOrder.paymentStatus || 'to_pay'}
                                    onChange={(e) => handlePaymentStatusChange(selectedOrder, e.target.value)}
                                >
                                    <option value="to_pay">To Pay</option>
                                    <option value="waiting_for_confirmation">Waiting for Confirmation</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <strong>Total:</strong> ₱{(selectedOrder.total || selectedOrder.price || 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <div>
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => {
                                        handleDelete(selectedOrder);
                                        setShowOrderModal(false);
                                    }}
                                    title="Permanently delete this item"
                                >
                                    <i className="fas fa-trash me-1"></i>Delete
                                </button>
                            </div>
                            <div>
                                {selectedOrder.status === 'pending' && (
                                    <>
                                        <button 
                                            className="btn btn-success me-2"
                                            onClick={() => {
                                                handleAccept(selectedOrder);
                                                setShowOrderModal(false);
                                            }}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            className="btn btn-warning me-2"
                                            onClick={() => {
                                                handleDecline(selectedOrder);
                                                setShowOrderModal(false);
                                            }}
                                        >
                                            Decline
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Stock Tab Component
const StockTab = () => {
    const [stock, setStock] = useState({
        wrappers: [],
        ribbons: [],
        flowers: []
    });
    const [activeCategory, setActiveCategory] = useState('wrappers');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        available: true,
        image: null,
        imagePreview: null
    });

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = () => {
        const savedStock = JSON.parse(localStorage.getItem('stock') || '{"wrappers":[],"ribbons":[],"flowers":[]}');
        setStock(savedStock);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'image') {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        image: reader.result,
                        imagePreview: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            id: editingItem ? editingItem.id : `${activeCategory}-${Date.now()}`,
            name: formData.name,
            price: parseFloat(formData.price) || 0,
            available: formData.available,
            image: formData.image || 'https://via.placeholder.com/300',
            createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const savedStock = JSON.parse(localStorage.getItem('stock') || '{"wrappers":[],"ribbons":[],"flowers":[]}');
        const categoryItems = savedStock[activeCategory] || [];
        
        if (editingItem) {
            const updated = categoryItems.map(item => item.id === editingItem.id ? itemData : item);
            savedStock[activeCategory] = updated;
        } else {
            savedStock[activeCategory] = [...categoryItems, itemData];
        }
        
        localStorage.setItem('stock', JSON.stringify(savedStock));
        loadStock();
        handleCloseModal();
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            available: item.available,
            image: item.image,
            imagePreview: item.image
        });
        setShowModal(true);
    };

    const handleDelete = (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const savedStock = JSON.parse(localStorage.getItem('stock') || '{"wrappers":[],"ribbons":[],"flowers":[]}');
            savedStock[activeCategory] = savedStock[activeCategory].filter(item => item.id !== itemId);
            localStorage.setItem('stock', JSON.stringify(savedStock));
            loadStock();
        }
    };

    const handleToggleAvailability = (itemId) => {
        const savedStock = JSON.parse(localStorage.getItem('stock') || '{"wrappers":[],"ribbons":[],"flowers":[]}');
        savedStock[activeCategory] = savedStock[activeCategory].map(item => 
            item.id === itemId ? { ...item, available: !item.available } : item
        );
        localStorage.setItem('stock', JSON.stringify(savedStock));
        loadStock();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            name: '',
            price: '',
            available: true,
            image: null,
            imagePreview: null
        });
    };

    const currentItems = stock[activeCategory] || [];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Stock Management</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i>Add {activeCategory.slice(0, -1)}
                </button>
            </div>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeCategory === 'wrappers' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('wrappers')}
                    >
                        Wrappers
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeCategory === 'ribbons' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('ribbons')}
                    >
                        Ribbons
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeCategory === 'flowers' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('flowers')}
                    >
                        Flowers
                    </button>
                </li>
            </ul>

            <div className="table-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    No {activeCategory} found. Add your first item!
                                </td>
                            </tr>
                        ) : (
                            currentItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>₱{item.price.toLocaleString()}</td>
                                    <td>
                                        <button 
                                            className={`btn btn-sm ${item.available ? 'btn-success' : 'btn-secondary'}`}
                                            onClick={() => handleToggleAvailability(item.id)}
                                        >
                                            {item.available ? 'Available' : 'Unavailable'}
                                        </button>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>{editingItem ? 'Edit' : 'Add'} {activeCategory.slice(0, -1)}</h5>
                            <button className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">Available</label>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleInputChange}
                                    />
                                    {formData.imagePreview && (
                                        <img 
                                            src={formData.imagePreview} 
                                            alt="Preview"
                                            style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '5px' }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Notifications Tab Component
const NotificationsTab = () => {
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'order'
    });

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = () => {
        const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(saved);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendNotification = (e) => {
        e.preventDefault();
        const notification = {
            id: `notif-${Date.now()}`,
            type: formData.type,
            title: formData.title,
            message: formData.message,
            icon: 'fa-bell',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/my-orders'
        };

        const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
        localStorage.setItem('notifications', JSON.stringify([notification, ...saved]));
        loadNotifications();
        setShowModal(false);
        setFormData({ title: '', message: '', type: 'order' });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Notifications</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i>Send Notification
                </button>
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Type</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No notifications found</td>
                            </tr>
                        ) : (
                            notifications.map(notif => (
                                <tr key={notif.id}>
                                    <td>{notif.title}</td>
                                    <td>{notif.message}</td>
                                    <td>{notif.type}</td>
                                    <td>{new Date(notif.timestamp).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Send Notification Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>Send Notification</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSendNotification}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        className="form-control"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="order">Order</option>
                                        <option value="payment">Payment</option>
                                        <option value="request">Request</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Messaging Tab Component
const MessagingTab = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        setCurrentUser(user);
        loadConversations();
    }, []);

    useEffect(() => {
        // Listen for storage changes (when messages are added from another tab/window)
        const handleStorageChange = (e) => {
            if (e.key === 'messages') {
                loadConversations();
                if (selectedConversation) {
                    loadMessages(selectedConversation.orderId);
                }
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events (same tab updates)
        const handleMessageUpdate = () => {
            loadConversations();
            if (selectedConversation) {
                loadMessages(selectedConversation.orderId);
            }
        };
        
        window.addEventListener('messageUpdated', handleMessageUpdate);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('messageUpdated', handleMessageUpdate);
        };
    }, [selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.orderId);
        }
        // Auto-refresh messages every 1 second for real-time feel
        const interval = setInterval(() => {
            if (selectedConversation) {
                loadMessages(selectedConversation.orderId);
            }
            loadConversations();
        }, 1000);
        return () => clearInterval(interval);
    }, [selectedConversation]);

    const loadConversations = () => {
        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        const allOrders = [...orders, ...requests];

        // Group messages by orderId
        const conversationMap = new Map();
        
        // First, add all orders that have messages
        allMessages.forEach(msg => {
            if (msg.orderId) {
                if (!conversationMap.has(msg.orderId)) {
                    const order = allOrders.find(o => o.id === msg.orderId);
                    if (order) {
                        conversationMap.set(msg.orderId, {
                            orderId: msg.orderId,
                            order: order,
                            lastMessage: msg,
                            unreadCount: 0
                        });
                    } else {
                        // Order not found but has messages - create conversation anyway
                        conversationMap.set(msg.orderId, {
                            orderId: msg.orderId,
                            order: { id: msg.orderId, type: 'unknown' },
                            lastMessage: msg,
                            unreadCount: 0
                        });
                    }
                } else {
                    const conv = conversationMap.get(msg.orderId);
                    if (conv.lastMessage && new Date(msg.timestamp) > new Date(conv.lastMessage.timestamp)) {
                        conv.lastMessage = msg;
                    } else if (!conv.lastMessage) {
                        conv.lastMessage = msg;
                    }
                }
            }
        });

        // Count unread messages (messages not read by admin)
        allMessages.forEach(msg => {
            if (msg.sender === 'user' && !msg.readByAdmin && msg.orderId) {
                const conv = conversationMap.get(msg.orderId);
                if (conv) {
                    conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
            }
        });

        // Also add orders without messages so admin can start conversations
        allOrders.forEach(order => {
            if (order.id && !conversationMap.has(order.id)) {
                conversationMap.set(order.id, {
                    orderId: order.id,
                    order: order,
                    lastMessage: null,
                    unreadCount: 0
                });
            }
        });

        const conversationsList = Array.from(conversationMap.values())
            .filter(conv => conv.lastMessage || conv.order) // Only show if has message or order exists
            .sort((a, b) => {
                // Sort by last message timestamp, or order date if no messages
                const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.order?.date || a.order?.requestDate || 0);
                const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.order?.date || b.order?.requestDate || 0);
                return bTime - aTime;
            });
        
        setConversations(conversationsList);
    };

    const loadMessages = (orderId) => {
        if (!orderId) {
            setMessages([]);
            return;
        }
        
        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        const orderMessages = allMessages
            .filter(msg => msg.orderId && msg.orderId.toString() === orderId.toString())
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(orderMessages);

        // Mark messages as read by admin
        let hasUnread = false;
        const updatedMessages = allMessages.map(msg => {
            if (msg.orderId && msg.orderId.toString() === orderId.toString() && msg.sender === 'user' && !msg.readByAdmin) {
                hasUnread = true;
                return { ...msg, readByAdmin: true };
            }
            return msg;
        });
        
        if (hasUnread) {
            localStorage.setItem('messages', JSON.stringify(updatedMessages));
            loadConversations();
        }
        
        // Scroll to bottom
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const orderId = selectedConversation.orderId;
        if (!orderId) {
            console.error('Order ID is missing');
            return;
        }

        const message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderId: orderId,
            sender: 'admin',
            senderName: currentUser?.name || 'Admin',
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            readByUser: false
        };

        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        const updatedMessages = [...allMessages, message];
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('messageUpdated'));
        
        // Create notification for user
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const order = selectedConversation.order;
        const orderType = order?.type 
            ? (order.type === 'booking' ? 'Event Booking' 
                : order.type === 'special_order' ? 'Special Order' 
                : order.type === 'customized' ? 'Customized Bouquet' 
                : 'Request')
            : 'Order';
        
        const notification = {
            id: `notif-${Date.now()}`,
            type: 'message',
            title: 'New Message from Admin',
            message: `You have a new message about your ${orderType.toLowerCase()}.`,
            icon: 'fa-comments',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/my-orders'
        };
        localStorage.setItem('notifications', JSON.stringify([notification, ...notifications]));

        setNewMessage('');
        // Reload messages immediately and force update
        loadMessages(orderId);
        loadConversations();
        
        // Also reload after a short delay to ensure sync
        setTimeout(() => {
            loadMessages(orderId);
            loadConversations();
        }, 200);
    };

    const handleSendPaymentRequest = () => {
        if (!selectedConversation) return;
        setShowPaymentRequestModal(true);
    };

    const handleSubmitPaymentRequest = (e) => {
        e.preventDefault();
        if (!paymentAmount || parseFloat(paymentAmount) <= 0 || !selectedConversation) return;

        const orderId = selectedConversation.orderId;
        const amount = parseFloat(paymentAmount);

        const paymentRequest = {
            id: `payment-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderId: orderId,
            sender: 'admin',
            senderName: currentUser?.name || 'Admin',
            type: 'payment_request',
            amount: amount,
            message: `Payment request for ₱${amount.toLocaleString()}`,
            timestamp: new Date().toISOString(),
            status: 'pending', // pending, paid, confirmed
            receipt: null,
            readByUser: false
        };

        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        localStorage.setItem('messages', JSON.stringify([...allMessages, paymentRequest]));
        
        // Dispatch custom event
        window.dispatchEvent(new Event('messageUpdated'));
        
        // Create notification for user
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const notification = {
            id: `notif-${Date.now()}`,
            type: 'payment',
            title: 'Payment Request',
            message: `You have a payment request of ₱${amount.toLocaleString()} for your order.`,
            icon: 'fa-money-bill-wave',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/my-orders'
        };
        localStorage.setItem('notifications', JSON.stringify([notification, ...notifications]));

        setPaymentAmount('');
        setShowPaymentRequestModal(false);
        loadMessages(orderId);
        loadConversations();
    };

    const handleConfirmPaymentFromRequest = (paymentRequest) => {
        if (window.confirm('Confirm payment for this request?')) {
            const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
            const updatedMessages = allMessages.map(msg => 
                msg.id === paymentRequest.id 
                    ? { ...msg, status: 'confirmed', confirmedAt: new Date().toISOString() }
                    : msg
            );
            localStorage.setItem('messages', JSON.stringify(updatedMessages));

            // Update order payment status
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const allOrders = [...orders, ...requests];
            
            const order = allOrders.find(o => o.id === paymentRequest.orderId);
            if (order) {
                if (order.type) {
                    const updatedRequests = requests.map(r => 
                        r.id === order.id ? { ...r, paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString() } : r
                    );
                    localStorage.setItem('requests', JSON.stringify(updatedRequests));
                } else {
                    const updatedOrders = orders.map(o => 
                        o.id === order.id ? { ...o, paymentStatus: 'paid', paymentConfirmedAt: new Date().toISOString() } : o
                    );
                    localStorage.setItem('orders', JSON.stringify(updatedOrders));
                }
            }

            // Create notification for user
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            const notification = {
                id: `notif-${Date.now()}`,
                type: 'payment',
                title: 'Payment Confirmed!',
                message: `Your payment of ₱${paymentRequest.amount.toLocaleString()} has been confirmed.`,
                icon: 'fa-check-circle',
                timestamp: new Date().toISOString(),
                read: false,
                link: '/my-orders'
            };
            localStorage.setItem('notifications', JSON.stringify([notification, ...notifications]));

            loadMessages(selectedConversation.orderId);
            loadConversations();
        }
    };

    const getOrderLabel = (order) => {
        if (!order) return 'Unknown Order';
        if (order.type === 'booking') return 'Event Booking';
        if (order.type === 'special_order') return 'Special Order';
        if (order.type === 'customized') return 'Customized Bouquet';
        return `Order #${order.id}`;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const groupMessagesByDate = (messages) => {
        const grouped = [];
        let currentDate = null;

        messages.forEach((msg, index) => {
            const msgDate = new Date(msg.timestamp).toDateString();
            const prevMsgDate = index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;

            if (msgDate !== prevMsgDate) {
                const date = new Date(msg.timestamp);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                let dateLabel;
                if (date.toDateString() === today.toDateString()) {
                    dateLabel = 'Today';
                } else if (date.toDateString() === yesterday.toDateString()) {
                    dateLabel = 'Yesterday';
                } else {
                    dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                }

                grouped.push({ type: 'date', label: dateLabel });
                currentDate = msgDate;
            }

            grouped.push({ type: 'message', ...msg });
        });

        return grouped;
    };

    const getInitials = (order) => {
        if (!order) return '?';
        if (order.type === 'booking') return 'EB';
        if (order.type === 'special_order') return 'SO';
        if (order.type === 'customized') return 'CB';
        return 'O';
    };

    return (
        <div>
            <h2 className="mb-4">Messaging</h2>
            <div className="chat-container">
                <div className="chat-list">
                    <div className="chat-list-header">
                        <h5 className="mb-0">Conversations</h5>
                    </div>
                    {conversations.length === 0 ? (
                        <div className="chat-empty-state">
                            <i className="fas fa-comments"></i>
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.orderId}
                                className={`chat-user ${selectedConversation?.orderId === conv.orderId ? 'active' : ''}`}
                                onClick={() => setSelectedConversation(conv)}
                            >
                                <div className="chat-user-avatar">
                                    {getInitials(conv.order)}
                                </div>
                                <div className="chat-user-info">
                                    <div className="chat-user-name">{getOrderLabel(conv.order)}</div>
                                    {conv.lastMessage ? (
                                        <>
                                            <div className="chat-user-preview">
                                                {conv.lastMessage.type === 'payment_request' ? (
                                                    <>
                                                        <i className="fas fa-money-bill-wave me-1"></i>
                                                        Payment Request: ₱{conv.lastMessage.amount?.toLocaleString() || '0'}
                                                        {conv.lastMessage.receipt && !conv.lastMessage.status === 'confirmed' && (
                                                            <span className="ms-2 text-warning">
                                                                <i className="fas fa-receipt"></i> Receipt uploaded
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {conv.lastMessage.sender === 'admin' ? 'You: ' : ''}{conv.lastMessage.message}
                                                    </>
                                                )}
                                            </div>
                                            <div className="chat-user-time">
                                                {formatTime(conv.lastMessage.timestamp)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="chat-user-preview" style={{ fontStyle: 'italic' }}>
                                            No messages yet
                                        </div>
                                    )}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="chat-unread-badge">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="chat-area">
                    {selectedConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <h5>{getOrderLabel(selectedConversation.order)}</h5>
                                    <small>
                                        Order ID: {selectedConversation.order?.id || 'N/A'}
                                        {selectedConversation.order?.type && (
                                            <span className="ms-2">
                                                • {selectedConversation.order.type === 'booking' ? 'Event Booking' :
                                                    selectedConversation.order.type === 'special_order' ? 'Special Order' :
                                                    selectedConversation.order.type === 'customized' ? 'Customized Bouquet' : 'Request'}
                                            </span>
                                        )}
                                    </small>
                                </div>
                                <div className="text-muted small">
                                    <i className="fas fa-user me-1"></i>
                                    Customer Conversation
                                </div>
                            </div>
                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="chat-empty-state">
                                        <i className="fas fa-comments"></i>
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    <>
                                        {groupMessagesByDate(messages).map((item, index) => {
                                            if (item.type === 'date') {
                                                return (
                                                    <div key={`date-${index}`} className="date-divider">
                                                        <span>{item.label}</span>
                                                    </div>
                                                );
                                            }
                                            
                                            // Payment Request Message
                                            if (item.type === 'payment_request') {
                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`message-wrapper ${item.sender === 'admin' ? 'sent' : 'received'}`}
                                                    >
                                                        <div className={`message ${item.sender === 'admin' ? 'sent' : 'received'}`} style={{ maxWidth: '85%' }}>
                                                            <div className="message-text">
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <i className="fas fa-money-bill-wave"></i>
                                                                    <strong>Payment Request</strong>
                                                                </div>
                                                                <div className="mb-2">
                                                                    Amount: <strong>₱{item.amount.toLocaleString()}</strong>
                                                                </div>
                                                                {item.status === 'pending' && item.receipt && item.sender === 'admin' && (
                                                                    <div className="mb-2">
                                                                        <small className="text-warning">
                                                                            <i className="fas fa-clock me-1"></i>
                                                                            Receipt uploaded - Waiting for confirmation
                                                                        </small>
                                                                    </div>
                                                                )}
                                                                {item.status === 'confirmed' && (
                                                                    <div className="mb-2">
                                                                        <small className="text-success">
                                                                            <i className="fas fa-check-circle me-1"></i>Payment Confirmed
                                                                        </small>
                                                                    </div>
                                                                )}
                                                                {item.receipt && (
                                                                    <div className="mb-2">
                                                                        <img 
                                                                            src={item.receipt} 
                                                                            alt="Receipt" 
                                                                            style={{ 
                                                                                maxWidth: '100%', 
                                                                                maxHeight: '150px', 
                                                                                borderRadius: '8px',
                                                                                border: '1px solid #ddd'
                                                                            }}
                                                                        />
                                                                        {item.status === 'pending' && item.sender === 'admin' && (
                                                                            <button
                                                                                className="btn btn-sm btn-success mt-2"
                                                                                onClick={() => handleConfirmPaymentFromRequest(item)}
                                                                            >
                                                                                <i className="fas fa-check me-1"></i>Confirm Payment
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="message-time">
                                                                {formatMessageTime(item.timestamp)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            
                                            // Regular Message
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`message-wrapper ${item.sender === 'admin' ? 'sent' : 'received'}`}
                                                >
                                                    <div className={`message ${item.sender === 'admin' ? 'sent' : 'received'}`}>
                                                        <div className="message-text">{item.message}</div>
                                                        <div className="message-time">
                                                            {formatMessageTime(item.timestamp)}
                                                            {item.sender === 'admin' && (
                                                                <span className="message-status">
                                                                    {item.readByUser ? '✓✓' : '✓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                            <div className="chat-input">
                                <div className="d-flex gap-2 mb-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={handleSendPaymentRequest}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        <i className="fas fa-money-bill-wave me-1"></i>Send Payment Request
                                    </button>
                                </div>
                                <form onSubmit={handleSendMessage} className="chat-input-form">
                                    <input
                                        type="text"
                                        className="chat-input-field"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        autoFocus
                                    />
                                    <button 
                                        type="submit" 
                                        className="chat-send-btn"
                                        disabled={!newMessage.trim()}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty-state">
                            <i className="fas fa-comments"></i>
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Request Modal */}
            {showPaymentRequestModal && selectedConversation && (
                <div className="modal-overlay" onClick={() => setShowPaymentRequestModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>Send Payment Request</h5>
                            <button className="btn-close" onClick={() => setShowPaymentRequestModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmitPaymentRequest}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Payment Amount (₱)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter amount"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        required
                                        autoFocus
                                    />
                                    <small className="text-muted">
                                        Enter the amount the customer needs to pay
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowPaymentRequestModal(false);
                                        setPaymentAmount('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-paper-plane me-2"></i>Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// About Tab Component
const AboutTab = () => {
    const [aboutData, setAboutData] = useState({
        story: '',
        promise: '',
        ownerQuote: ''
    });

    useEffect(() => {
        loadAboutData();
    }, []);

    const loadAboutData = () => {
        const saved = JSON.parse(localStorage.getItem('aboutData') || '{}');
        if (Object.keys(saved).length === 0) {
            setAboutData({
                story: "Jocery's Flower Shop was born from a love for flowers and a commitment to our community. When a beloved local flower shop closed its doors, we saw an opportunity to continue serving its loyal customers, ensuring that our town wouldn't lose its source of fresh, beautifully crafted floral designs.",
                promise: "We built our shop on the foundation of those relationships, and our roots in the community run deep. Every bouquet we craft and every event we style is a continuation of a legacy of quality, creativity, and connection.",
                ownerQuote: "Flowers have always been my passion. They have a unique way of telling stories and connecting people. When I saw our community was about to lose its local florist, I knew I had to step in. This shop is my love letter to this town and to the art of floristry."
            });
        } else {
            setAboutData(saved);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAboutData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('aboutData', JSON.stringify(aboutData));
        alert('About page updated successfully!');
    };

    return (
        <div>
            <h2 className="mb-4">About Page Management</h2>
            <div className="table-card">
                <div className="mb-3">
                    <label className="form-label">Our Story</label>
                    <textarea
                        className="form-control"
                        name="story"
                        value={aboutData.story}
                        onChange={handleInputChange}
                        rows="5"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Our Promise</label>
                    <textarea
                        className="form-control"
                        name="promise"
                        value={aboutData.promise}
                        onChange={handleInputChange}
                        rows="5"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Owner Quote</label>
                    <textarea
                        className="form-control"
                        name="ownerQuote"
                        value={aboutData.ownerQuote}
                        onChange={handleInputChange}
                        rows="5"
                    />
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Contact Tab Component
const ContactTab = () => {
    const [contactData, setContactData] = useState({
        address: '',
        phone: '',
        email: '',
        mapUrl: ''
    });

    useEffect(() => {
        loadContactData();
    }, []);

    const loadContactData = () => {
        const saved = JSON.parse(localStorage.getItem('contactData') || '{}');
        if (Object.keys(saved).length === 0) {
            setContactData({
                address: 'Zamboanga City, Philippines',
                phone: '+63 756 347 901',
                email: 'JoceryFlowerShop@gmail.com',
                mapUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1608.6438299927784!2d122.07320562571662!3d6.908031381591681!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x325041c4ef608537%3A0xbd63d709d92c1d51!2sCagayano\'s%20Panciteria!5e0!3m2!1sen!2sus!4v1763301121573!5m2!1sen!2sus'
            });
        } else {
            setContactData(saved);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('contactData', JSON.stringify(contactData));
        alert('Contact page updated successfully!');
    };

    return (
        <div>
            <h2 className="mb-4">Contact Page Management</h2>
            <div className="table-card">
                <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={contactData.address}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={contactData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={contactData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Map URL (Google Maps Embed)</label>
                    <textarea
                        className="form-control"
                        name="mapUrl"
                        value={contactData.mapUrl}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                </button>
            </div>
        </div>
    );
};

// Sales Tab Component
const SalesTab = () => {
    const [salesData, setSalesData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        calculateSales();
    }, []);

    const calculateSales = () => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const requests = JSON.parse(localStorage.getItem('requests') || '[]');
        const allOrders = [...orders, ...requests];

        const completed = allOrders.filter(o => o.status === 'completed' || o.paymentStatus === 'paid');
        const pending = allOrders.filter(o => o.status === 'pending');
        
        const revenue = completed.reduce((sum, o) => sum + (o.total || o.price || 0), 0);

        setSalesData({
            totalRevenue: revenue,
            totalOrders: allOrders.length,
            completedOrders: completed.length,
            pendingOrders: pending.length
        });
    };

    return (
        <div>
            <h2 className="mb-4">Sales Overview</h2>
            <div className="row g-4">
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon bg-pink">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div>
                            <h3>₱{salesData.totalRevenue.toLocaleString()}</h3>
                            <p className="text-muted mb-0">Total Revenue</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon bg-blue">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <div>
                            <h3>{salesData.totalOrders}</h3>
                            <p className="text-muted mb-0">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon bg-green">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <h3>{salesData.completedOrders}</h3>
                            <p className="text-muted mb-0">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon bg-orange">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div>
                            <h3>{salesData.pendingOrders}</h3>
                            <p className="text-muted mb-0">Pending</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Employees Tab Component
const EmployeesTab = () => {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee'
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = () => {
        const saved = JSON.parse(localStorage.getItem('employees') || '[]');
        setEmployees(saved);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const employee = {
            id: `emp-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            createdAt: new Date().toISOString()
        };

        const saved = JSON.parse(localStorage.getItem('employees') || '[]');
        localStorage.setItem('employees', JSON.stringify([...saved, employee]));
        loadEmployees();
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'employee' });
    };

    const handleDelete = (employeeId) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            const saved = JSON.parse(localStorage.getItem('employees') || '[]');
            const updated = saved.filter(emp => emp.id !== employeeId);
            localStorage.setItem('employees', JSON.stringify(updated));
            loadEmployees();
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Employee Management</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus me-2"></i>Add Employee
                </button>
            </div>

            <div className="table-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No employees found</td>
                            </tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id}>
                                    <td>{emp.name}</td>
                                    <td>{emp.email}</td>
                                    <td>
                                        <span className={`badge ${emp.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(emp.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5>Add Employee</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">Add Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

