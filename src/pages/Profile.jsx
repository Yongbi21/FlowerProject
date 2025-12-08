import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Shop.css';

const orderTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'ready_for_pickup', label: 'Ready for Pickup' },
    { id: 'to_receive', label: 'Out for Delivery' },
    { id: 'claimed', label: 'Claimed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

const menuItems = [
    { id: 'orders', label: 'My Orders', icon: 'fa-box' },
    { id: 'messages', label: 'Messages', icon: 'fa-comments' },
    { id: 'addresses', label: 'Addresses', icon: 'fa-map-marker-alt' },
    { id: 'settings', label: 'Account Settings', icon: 'fa-cog' },
];



const Profile = ({ user, logout }) => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('orders');
    const [activeOrderTab, setActiveOrderTab] = useState('all');
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem(`userAddresses_${user?.email}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        label: '',
        name: '',
        phone: '',
        street: '',
        city: '',
        province: '',
        zip: ''
    });
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [showWaitingModal, setShowWaitingModal] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    useEffect(() => {
        // Initialize addresses in localStorage if not present - REMOVED per user request
        // if (!localStorage.getItem('userAddresses')) {
        //     localStorage.setItem('userAddresses', JSON.stringify(mockUserAddresses));
        // }

        // Load all orders including regular orders, event bookings, special orders, and customized requests
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const savedRequests = JSON.parse(localStorage.getItem('requests') || '[]');

        // Combine regular orders with requests (bookings, special orders, customized)
        const allOrders = [...savedOrders, ...savedRequests];

        // Enrich orders with status and paymentStatus if not present
        const enrichedOrders = allOrders.map((order) => {
            let enrichedOrder = { ...order };

            // Add paymentStatus if not present
            if (!enrichedOrder.paymentStatus) {
                // If payment method exists and is GCash, mark as waiting for confirmation; otherwise to_pay
                if (enrichedOrder.payment && enrichedOrder.payment.id === 'gcash') {
                    enrichedOrder.paymentStatus = 'waiting_for_confirmation';
                } else {
                    enrichedOrder.paymentStatus = 'to_pay';
                }
            }

            // Add status if not present or update COD orders to processing
            if (!enrichedOrder.status) {
                // Determine status based on order type and date
                if (enrichedOrder.type === 'booking' || enrichedOrder.type === 'special_order' || enrichedOrder.type === 'customized') {
                    // New requests start as pending
                    enrichedOrder.status = 'pending';
                } else {
                    // Regular orders use existing logic
                    const orderDate = new Date(enrichedOrder.date || enrichedOrder.requestDate);
                    const now = new Date();
                    const hours = (now - orderDate) / (1000 * 60 * 60);

                    if (hours < 2) {
                        enrichedOrder.status = 'to_pay';
                    } else if (hours < 8) {
                        enrichedOrder.status = 'processing';
                    } else {
                        if (enrichedOrder.deliveryMethod === 'pickup') {
                            if (hours < 12) {
                                enrichedOrder.status = 'ready_for_pickup';
                            } else if (hours < 24) {
                                enrichedOrder.status = 'claimed';
                            } else {
                                enrichedOrder.status = 'completed';
                            }
                        } else {
                            if (hours < 24) {
                                enrichedOrder.status = 'to_receive';
                            } else {
                                enrichedOrder.status = 'completed';
                            }
                        }
                    }
                }
            } else if (enrichedOrder.status === 'pending' && enrichedOrder.payment && enrichedOrder.payment.id === 'cod') {
                // Move existing COD orders from pending to processing
                enrichedOrder.status = 'processing';
            }

            return enrichedOrder;
        });

        // Sort by date (newest first)
        enrichedOrders.sort((a, b) => {
            const dateA = new Date(a.date || a.requestDate || 0);
            const dateB = new Date(b.date || b.requestDate || 0);
            return dateB - dateA;
        });

        setOrders(enrichedOrders);

        // Load messages
        const savedMessages = JSON.parse(localStorage.getItem('userMessages') || '[]');
        if (savedMessages.length === 0) {
            // Add welcome message from shop
            const welcomeMsg = {
                id: 1,
                sender: 'shop',
                text: 'Welcome to Jocery\'s Flower Shop! How can we help you today? Feel free to ask about our products, orders, or any inquiries.',
                time: new Date().toISOString()
            };
            setMessages([welcomeMsg]);
            localStorage.setItem('userMessages', JSON.stringify([welcomeMsg]));
        } else {
            setMessages(savedMessages);
        }
    }, []);

    const getOrderTypeLabel = (type) => {
        const labels = {
            booking: 'Event Booking',
            special_order: 'Special Order',
            customized: 'Customized Bouquet',
            regular: 'Regular Order'
        };
        return labels[type] || 'Order';
    };

    const filteredOrders = activeOrderTab === 'all'
        ? orders
        : orders.filter(o => o.status === activeOrderTab);

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'pending',
            processing: 'processing',
            to_pay: 'pending',
            ready_for_pickup: 'processing',
            to_receive: 'shipped',
            claimed: 'shipped',
            completed: 'delivered',
            cancelled: 'cancelled'
        };
        return classes[status] || 'pending';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            processing: 'Processing',
            to_pay: 'To Pay',
            ready_for_pickup: 'Ready for Pickup',
            to_receive: 'Out for Delivery',
            claimed: 'Claimed',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return labels[status] || status;
    };

    const handleTrackOrder = (orderId) => {
        navigate(`/order-tracking/${orderId}`);
    };

    const handleTrackStatus = (order) => {
        // Show waiting for approval modal for pending requests
        if (order.status === 'pending' && order.type) {
            setShowWaitingModal(true);
        } else {
            handleTrackOrder(order.id);
        }
    };

    const handleCancelClick = (order) => {
        setOrderToCancel(order);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (!orderToCancel) return;

        // Create cancellation notification
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const orderTypeLabel = orderToCancel.type
            ? (orderToCancel.type === 'booking' ? 'Event Booking'
                : orderToCancel.type === 'special_order' ? 'Special Order'
                    : orderToCancel.type === 'customized' ? 'Customized Bouquet'
                        : 'Request')
            : 'Order';
        const orderId = orderToCancel.id ? `#${orderToCancel.id}` : '';

        const newNotification = {
            id: `notif-${Date.now()}`,
            type: 'cancellation',
            title: `${orderTypeLabel} Cancelled`,
            message: `Your ${orderTypeLabel.toLowerCase()} ${orderId} has been cancelled successfully.`,
            icon: 'fa-times-circle',
            timestamp: new Date().toISOString(),
            read: false,
            link: '/profile'
        };
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...notifications]));

        // Remove from appropriate storage
        if (orderToCancel.type) {
            // It's a request (booking, special_order, customized)
            const requests = JSON.parse(localStorage.getItem('requests') || '[]');
            const updatedRequests = requests.filter(req => req.id !== orderToCancel.id);
            localStorage.setItem('requests', JSON.stringify(updatedRequests));
        } else {
            // It's a regular order
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const updatedOrders = savedOrders.filter(ord => ord.id !== orderToCancel.id);
            localStorage.setItem('orders', JSON.stringify(updatedOrders));
        }

        // Reload orders from localStorage
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const savedRequests = JSON.parse(localStorage.getItem('requests') || '[]');
        const allOrders = [...savedOrders, ...savedRequests];

        // Apply enrichment logic
        const enrichedOrders = allOrders.map((order) => {
            let enrichedOrder = { ...order };

            if (!enrichedOrder.paymentStatus) {
                if (enrichedOrder.payment && enrichedOrder.payment.id === 'gcash') {
                    enrichedOrder.paymentStatus = 'waiting_for_confirmation';
                } else {
                    enrichedOrder.paymentStatus = 'to_pay';
                }
            }

            if (!enrichedOrder.status) {
                if (enrichedOrder.type === 'booking' || enrichedOrder.type === 'special_order' || enrichedOrder.type === 'customized') {
                    enrichedOrder.status = 'pending';
                } else {
                    const orderDate = new Date(enrichedOrder.date || enrichedOrder.requestDate);
                    const now = new Date();
                    const hours = (now - orderDate) / (1000 * 60 * 60);

                    if (hours < 2) {
                        enrichedOrder.status = 'to_pay';
                    } else if (hours < 8) {
                        enrichedOrder.status = 'processing';
                    } else {
                        if (enrichedOrder.deliveryMethod === 'pickup') {
                            if (hours < 12) {
                                enrichedOrder.status = 'ready_for_pickup';
                            } else if (hours < 24) {
                                enrichedOrder.status = 'claimed';
                            } else {
                                enrichedOrder.status = 'completed';
                            }
                        } else {
                            if (hours < 24) {
                                enrichedOrder.status = 'to_receive';
                            } else {
                                enrichedOrder.status = 'completed';
                            }
                        }
                    }
                }
            } else if (enrichedOrder.status === 'pending' && enrichedOrder.payment && enrichedOrder.payment.id === 'cod') {
                enrichedOrder.status = 'processing';
            }

            return enrichedOrder;
        });

        enrichedOrders.sort((a, b) => {
            const dateA = new Date(a.date || a.requestDate || 0);
            const dateB = new Date(b.date || b.requestDate || 0);
            return dateB - dateA;
        });

        setOrders(enrichedOrders);
        setShowCancelModal(false);
        setOrderToCancel(null);
    };

    const handleReorder = (order) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        order.items.forEach(item => {
            const existingItem = cart.find(i => i.name === item.name);
            if (existingItem) {
                existingItem.qty += item.qty || 1;
            } else {
                cart.push({ ...item });
            }
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        navigate('/cart');
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const userMsg = {
            id: messages.length + 1,
            sender: 'user',
            text: newMessage.trim(),
            time: new Date().toISOString()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        localStorage.setItem('userMessages', JSON.stringify(updatedMessages));
        setNewMessage('');

        // Simulate shop auto-reply after 1 second
        setTimeout(() => {
            const replies = [
                "Thank you for your message! Our team will get back to you shortly.",
                "We appreciate your inquiry! Please allow us some time to respond.",
                "Got it! One of our staff will assist you soon.",
                "Thank you for reaching out! We'll respond as soon as possible."
            ];
            const shopReply = {
                id: updatedMessages.length + 1,
                sender: 'shop',
                text: replies[Math.floor(Math.random() * replies.length)],
                time: new Date().toISOString()
            };
            const newMessages = [...updatedMessages, shopReply];
            setMessages(newMessages);
            localStorage.setItem('userMessages', JSON.stringify(newMessages));
        }, 1000);
    };

    const renderOrdersContent = () => (
        <>
            <div className="order-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {orderTabs.map(tab => {
                    const orderCount = tab.id !== 'all'
                        ? orders.filter(o => o.status === tab.id).length
                        : orders.length;

                    return (
                        <button
                            key={tab.id}
                            className={`order-tab ${activeOrderTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveOrderTab(tab.id)}
                            style={{ flexShrink: 0 }}
                        >
                            {tab.label}
                            {tab.id !== 'all' && orderCount > 0 && (
                                <span className="badge">{orderCount}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <i className="fas fa-box-open"></i>
                    </div>
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                    <Link to="/" className="btn-shop-now">Shop Now</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order, index) => (
                        <div key={order.id || `order-${index}`} className="order-card">
                            <div className="order-card-header">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="order-id">
                                        {order.type === 'booking' && 'Event Booking'}
                                        {order.type === 'special_order' && 'Special Order'}
                                        {order.type === 'customized' && 'Customized Bouquet'}
                                        {!order.type && `Order #${order.id || index + 1}`}
                                    </div>
                                    {order.type && (
                                        <span className="badge bg-info text-white">
                                            {getOrderTypeLabel(order.type)}
                                        </span>
                                    )}
                                </div>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <small className="text-muted">
                                        {new Date(order.date || order.requestDate).toLocaleDateString('en-PH', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </small>
                                    <span className={`order-status ${getStatusBadgeClass(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    {order.paymentStatus && (
                                        <span className={`badge ${order.paymentStatus === 'paid'
                                            ? 'bg-success'
                                            : order.paymentStatus === 'waiting_for_confirmation'
                                                ? 'bg-info'
                                                : 'bg-warning'
                                            }`}>
                                            <i className={`fas ${order.paymentStatus === 'paid'
                                                ? 'fa-check-circle'
                                                : order.paymentStatus === 'waiting_for_confirmation'
                                                    ? 'fa-hourglass-half'
                                                    : 'fa-clock'
                                                } me-1`}></i>
                                            {order.paymentStatus === 'paid'
                                                ? 'Paid'
                                                : order.paymentStatus === 'waiting_for_confirmation'
                                                    ? 'Waiting for Confirmation'
                                                    : 'To Pay'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="order-card-body">
                                {/* Display order items or request details */}
                                {order.items && order.items.length > 0 ? (
                                    <>
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <img
                                                    src={item.image || item.photo}
                                                    alt={item.name || 'Item'}
                                                    className="order-item-img"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/70'}
                                                />
                                                <div>
                                                    <div className="order-item-name">{item.name || 'Custom Item'}</div>
                                                    {item.variant && (
                                                        <div className="order-item-variant">{item.variant}</div>
                                                    )}
                                                    <div className="order-item-qty">x{item.qty || 1}</div>
                                                </div>
                                                <div className="order-item-price">
                                                    ₱{((item.price || order.price || 0) * (item.qty || 1)).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div className="text-muted small mt-2">
                                                + {order.items.length - 2} more item(s)
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    // Display request details for bookings, special orders, and customized
                                    <div className="order-item">
                                        {order.photo && (
                                            <img
                                                src={order.photo}
                                                alt="Request preview"
                                                className="order-item-img"
                                                style={{ objectFit: 'cover' }}
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/70'}
                                            />
                                        )}
                                        <div className="flex-grow-1">
                                            <div className="order-item-name">
                                                {order.type === 'booking' && order.eventType && (
                                                    <>{order.eventType} Event</>
                                                )}
                                                {order.type === 'special_order' && (
                                                    <>Special Order Request</>
                                                )}
                                                {order.type === 'customized' && (
                                                    <>Customized Bouquet Request</>
                                                )}
                                                {!order.type && 'Order Item'}
                                            </div>
                                            {order.type === 'booking' && order.venue && (
                                                <div className="order-item-variant">
                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                    {order.venue}
                                                </div>
                                            )}
                                            {order.type === 'special_order' && order.recipientName && (
                                                <div className="order-item-variant">
                                                    <i className="fas fa-user me-1"></i>
                                                    For: {order.recipientName}
                                                </div>
                                            )}
                                            {order.type === 'customized' && order.flower && (
                                                <div className="order-item-variant">
                                                    <i className="fas fa-seedling me-1"></i>
                                                    {order.flower.name} - {order.bundleSize} stems
                                                </div>
                                            )}
                                        </div>
                                        <div className="order-item-price">
                                            ₱{(order.price || order.total || 0).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {/* Payment Method Information */}
                                {order.payment && (
                                    <div className="mt-3 pt-3 border-top">
                                        <div className="d-flex align-items-start gap-2">
                                            <i className={`fas ${order.payment.icon || 'fa-credit-card'} mt-1`} style={{ color: 'var(--shop-pink)', fontSize: '0.9rem' }}></i>
                                            <div className="flex-grow-1">
                                                <div className="small fw-bold mb-1">Payment Method</div>
                                                <div className="small text-muted">
                                                    {order.payment.name || 'Cash on Delivery'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery/Pickup Information */}
                                {(order.deliveryMethod || order.address) && (
                                    <div className="mt-3 pt-3 border-top">
                                        {order.deliveryMethod === 'pickup' ? (
                                            <div className="d-flex align-items-start gap-2">
                                                <i className="fas fa-store mt-1" style={{ color: 'var(--shop-pink)', fontSize: '0.9rem' }}></i>
                                                <div className="flex-grow-1">
                                                    <div className="small fw-bold mb-1">Pickup Order</div>
                                                    {order.pickupTime && (
                                                        <div className="small text-muted mb-1">
                                                            <i className="fas fa-clock me-1"></i>
                                                            Pickup Time: {order.pickupTime}
                                                        </div>
                                                    )}
                                                    <div className="small text-muted">
                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                        Jocery's Flower Shop, 123 Flower St., Quezon City
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            order.address && (
                                                <div className="d-flex align-items-start gap-2">
                                                    <i className="fas fa-truck mt-1" style={{ color: 'var(--shop-pink)', fontSize: '0.9rem' }}></i>
                                                    <div className="flex-grow-1">
                                                        <div className="small fw-bold mb-1">Delivery Address</div>
                                                        <div className="small text-muted">
                                                            {typeof order.address === 'string'
                                                                ? order.address
                                                                : `${order.address.street}, ${order.address.city}, ${order.address.province} ${order.address.zip}`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="order-card-footer">
                                <div className="order-total">
                                    {order.type ? 'Request Total' : 'Order Total'}: <span>₱{(order.total || order.price || 0).toLocaleString()}</span>
                                </div>
                                <div className="order-actions">
                                    {order.status === 'completed' && order.items && (
                                        <button
                                            className="btn-order-action secondary"
                                            onClick={() => {
                                                const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                                                order.items.forEach(item => {
                                                    const existingItem = cart.find(i => i.name === item.name);
                                                    if (existingItem) {
                                                        existingItem.qty += item.qty || 1;
                                                    } else {
                                                        cart.push({ ...item });
                                                    }
                                                });
                                                localStorage.setItem('cart', JSON.stringify(cart));
                                                navigate('/cart');
                                            }}
                                        >
                                            Buy Again
                                        </button>
                                    )}
                                    {order.status === 'pending' && order.type && (
                                        <button
                                            className="btn-order-action primary"
                                            onClick={() => handleTrackStatus(order)}
                                        >
                                            Track Status
                                        </button>
                                    )}
                                    {order.status !== 'cancelled' && order.status !== 'completed' && !(order.status === 'pending' && order.type) && (
                                        <button
                                            className="btn-order-action primary"
                                            onClick={() => handleTrackOrder(order.id || `order-${index}`)}
                                        >
                                            Track Order
                                        </button>
                                    )}
                                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                                        <button
                                            className="btn-order-action danger"
                                            onClick={() => handleCancelClick(order)}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    const renderAddressesContent = () => (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">My Addresses</h5>
                <button
                    className="btn btn-sm"
                    style={{ background: 'var(--shop-pink)', color: 'white' }}
                    onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({ label: '', name: user.name || '', phone: '', street: '', city: '', province: '', zip: '' });
                        setShowAddressModal(true);
                    }}
                >
                    <i className="fas fa-plus me-2"></i>Add Address
                </button>
            </div>

            {addresses.map(addr => (
                <div key={addr.id} className="address-card mb-3" style={{ cursor: 'default' }}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            {addr.isDefault && <span className="address-label">Default</span>}
                            <span className="badge bg-secondary ms-2">{addr.label}</span>
                        </div>
                        <div>
                            <button
                                className="btn btn-link btn-sm text-primary"
                                onClick={() => {
                                    setEditingAddress(addr);
                                    // Parse address string into separate fields
                                    const addressStr = addr.address || '';
                                    const parts = addressStr.split(',').map(p => p.trim());

                                    let street = '';
                                    let city = '';
                                    let province = '';
                                    let zip = '';

                                    if (parts.length >= 4) {
                                        // Format: Street, Barangay, City, Province Zip
                                        street = parts[0];
                                        city = parts[2];
                                        const lastPart = parts[3];
                                        const zipMatch = lastPart.match(/(\d+)$/);
                                        if (zipMatch) {
                                            zip = zipMatch[1];
                                            province = lastPart.replace(/\s*\d+$/, '').trim();
                                        } else {
                                            province = lastPart;
                                        }
                                    } else if (parts.length === 3) {
                                        // Format: Street, City, Province Zip
                                        street = parts[0];
                                        city = parts[1];
                                        const lastPart = parts[2];
                                        const zipMatch = lastPart.match(/(\d+)$/);
                                        if (zipMatch) {
                                            zip = zipMatch[1];
                                            province = lastPart.replace(/\s*\d+$/, '').trim();
                                        } else {
                                            province = lastPart;
                                        }
                                    } else if (parts.length === 2) {
                                        street = parts[0];
                                        city = parts[1];
                                    } else {
                                        street = addressStr;
                                    }

                                    setAddressForm({
                                        label: addr.label || '',
                                        name: addr.name || '',
                                        phone: addr.phone || '',
                                        street: street,
                                        city: city,
                                        province: province,
                                        zip: zip
                                    });
                                    setShowAddressModal(true);
                                }}
                            >
                                Edit
                            </button>
                            {!addr.isDefault && (
                                <button
                                    className="btn btn-link btn-sm text-danger"
                                    onClick={() => {
                                        const updated = addresses.filter(a => a.id !== addr.id);
                                        setAddresses(updated);
                                        localStorage.setItem('userAddresses', JSON.stringify(updated));
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="address-name mt-2">{addr.name}</div>
                    <div className="address-phone">{addr.phone}</div>
                    <div className="address-detail mt-2">{addr.address}</div>
                    {!addr.isDefault && (
                        <button
                            className="btn btn-outline-secondary btn-sm mt-3"
                            onClick={() => {
                                const updated = addresses.map(a => ({
                                    ...a,
                                    isDefault: a.id === addr.id
                                }));
                                setAddresses(updated);
                                localStorage.setItem('userAddresses', JSON.stringify(updated));
                            }}
                        >
                            Set as Default
                        </button>
                    )}
                </div>
            ))}
        </>
    );

    const renderSettingsContent = () => (
        <>
            <h5 className="fw-bold mb-4">Account Settings</h5>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" defaultValue={user.name} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" defaultValue={user.email} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" defaultValue={user.phone} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" />
                </div>
            </div>

            <hr className="my-4" />

            <h6 className="fw-bold mb-3">Change Password</h6>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" />
                </div>
            </div>

            <button className="btn mt-3" style={{ background: 'var(--shop-pink)', color: 'white' }}>
                Save Changes
            </button>
        </>
    );

    const renderMessagesContent = () => (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                    <i className="fas fa-comments me-2" style={{ color: 'var(--shop-pink)' }}></i>
                    Chat with Us
                </h5>
                <span className="badge" style={{ background: 'var(--shop-pink-light)', color: 'var(--shop-pink)' }}>
                    <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem' }}></i>
                    Online
                </span>
            </div>

            <div
                className="messages-container rounded p-3 mb-3"
                style={{
                    background: '#f8f9fa',
                    height: '400px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                        <div
                            className="message-bubble p-3 rounded-3"
                            style={{
                                maxWidth: '75%',
                                background: msg.sender === 'user' ? 'var(--shop-pink)' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#333',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            {msg.sender === 'shop' && (
                                <div className="d-flex align-items-center mb-2">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{ width: '24px', height: '24px', background: 'var(--shop-pink-light)' }}
                                    >
                                        <i className="fas fa-store" style={{ fontSize: '0.7rem', color: 'var(--shop-pink)' }}></i>
                                    </div>
                                    <small className="fw-bold" style={{ color: 'var(--shop-pink)' }}>Jocery's Flower Shop</small>
                                </div>
                            )}
                            <p className="mb-1" style={{ fontSize: '0.95rem' }}>{msg.text}</p>
                            <small className={msg.sender === 'user' ? 'text-white-50' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                                {new Date(msg.time).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            <div className="input-group">
                <input
                    type="text"
                    className="form-control rounded-pill rounded-end"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ borderRight: 'none' }}
                />
                <button
                    className="btn rounded-pill rounded-start px-4"
                    style={{ background: 'var(--shop-pink)', color: 'white', borderLeft: 'none' }}
                    onClick={sendMessage}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>

            <div className="mt-3 p-3 rounded" style={{ background: 'var(--shop-pink-light)' }}>
                <small className="text-muted">
                    <i className="fas fa-info-circle me-2" style={{ color: 'var(--shop-pink)' }}></i>
                    <strong>Quick Help:</strong> You can ask about product availability, order status, custom arrangements, delivery times, or any other inquiries.
                </small>
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeMenu) {
            case 'orders': return renderOrdersContent();
            case 'messages': return renderMessagesContent();
            case 'addresses': return renderAddressesContent();
            case 'settings': return renderSettingsContent();
            default: return renderOrdersContent();
        }
    };

    return (
        <div className="profile-container">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 mb-4">
                        <div className="profile-sidebar">
                            <div className="text-center pb-3 mb-3" style={{ borderBottom: '1px solid #eee' }}>
                                <h5 className="fw-bold mb-1" style={{ color: '#333' }}>{user.name}</h5>
                                <small className="text-muted">{user.email}</small>
                            </div>

                            <ul className="profile-menu" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {menuItems.map(item => (
                                    <li
                                        key={item.id}
                                        className={`profile-menu-item ${activeMenu === item.id ? 'active' : ''}`}
                                        onClick={() => {
                                            if (item.link) {
                                                navigate(item.link);
                                            } else {
                                                setActiveMenu(item.id);
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className={`fas ${item.icon}`}></i>
                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>

                            <hr />

                            <div
                                className="profile-menu-item text-danger"
                                onClick={logout}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-9">
                        <div className="profile-content">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h4>{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>
                            <button className="modal-close" onClick={() => setShowAddressModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="form-group">
                                <label className="form-label">Label</label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={addressForm.label}
                                    onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                    placeholder="e.g., Home, Office"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={addressForm.name}
                                    onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control-custom"
                                    value={addressForm.phone}
                                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Street Address</label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={addressForm.street}
                                    onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                                    placeholder="e.g., 123 Sampaguita St., Brgy. Maligaya"
                                />
                            </div>
                            <button
                                className="btn"
                                style={{ background: 'var(--shop-pink)', color: 'white' }}
                                onClick={() => {
                                    if (!addressForm.label || !addressForm.name || !addressForm.phone || !addressForm.street) {
                                        alert('Please fill in all required fields (Label, Name, Phone, Street)');
                                        return;
                                    }

                                    // Construct full address string from form fields
                                    // Only save street address as requested (City/Province implied)
                                    const fullAddress = addressForm.street;

                                    let updated;
                                    if (editingAddress) {
                                        updated = addresses.map(a =>
                                            a.id === editingAddress.id
                                                ? {
                                                    ...a,
                                                    label: addressForm.label,
                                                    name: addressForm.name,
                                                    phone: addressForm.phone,
                                                    address: fullAddress
                                                }
                                                : a
                                        );
                                    } else {
                                        const newId = addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1;
                                        updated = [...addresses, {
                                            id: newId,
                                            label: addressForm.label,
                                            name: addressForm.name,
                                            phone: addressForm.phone,
                                            address: fullAddress,
                                            isDefault: addresses.length === 0
                                        }];
                                    }
                                    setAddresses(updated);
                                    localStorage.setItem(`userAddresses_${user?.email}`, JSON.stringify(updated));
                                    setShowAddressModal(false);
                                    setAddressForm({ label: '', name: user.name || '', phone: '', street: '', city: '', province: '', zip: '' });
                                    setEditingAddress(null);
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {showCancelModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowCancelModal(false);
                        setOrderToCancel(null);
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <div
                        className="modal-content-custom"
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Cancel {orderToCancel?.type ? 'Request' : 'Order'}?</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
                            Are you sure you want to cancel this {orderToCancel?.type ? 'request' : 'order'}? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setOrderToCancel(null);
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#4b5563',
                                    border: '1px solid #d1d5db',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '9999px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Keep {orderToCancel?.type ? 'Request' : 'Order'}
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '9999px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Waiting for Approval Modal */}
            {showWaitingModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowWaitingModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <div
                        className="modal-content-custom"
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{ fontSize: '3rem', color: '#ff9800', marginBottom: '1rem' }}>
                            <i className="fas fa-hourglass-half"></i>
                        </div>
                        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Waiting for Approval</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
                            Your request is currently pending approval from our team. We will review it and get back to you soon.
                        </p>
                        <p style={{ marginBottom: '1.5rem', color: '#4b5563', fontSize: '0.9rem' }}>
                            You will be notified once your request has been processed.
                        </p>
                        <button
                            onClick={() => setShowWaitingModal(false)}
                            style={{
                                backgroundColor: 'var(--shop-pink)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
