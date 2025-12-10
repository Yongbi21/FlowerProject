import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Shop.css';
import { supabase } from '../config/supabase';
import qrCodeImage from '../assets/qr-code-1.jpg'; // Import the QR code image

const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: 'fa-money-bill-wave' },
    { id: 'gcash', name: 'GCash', description: 'Pay via GCash e-wallet', icon: 'fa-wallet' },
];

const pickupTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const Checkout = ({ setCart, user }) => {
    const navigate = useNavigate();
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [orderType, setOrderType] = useState('ecommerce');
    const [selectedPayment, setSelectedPayment] = useState('cod');
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [selectedPickupTime, setSelectedPickupTime] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);

    const [address, setAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        province: '',
        zip: ''
    });
    const [savedAddresses, setSavedAddresses] = useState([]);

    useEffect(() => {
        // Load addresses from profile (same key as Profile page uses)
        if (user?.email) {
            const saved = localStorage.getItem(`userAddresses_${user.email}`);
            if (saved) {
                const parsedAddresses = JSON.parse(saved);
                setSavedAddresses(parsedAddresses);
                
                // Set default address if available
                const defaultAddress = parsedAddresses.find(addr => addr.isDefault) || parsedAddresses[0];
                if (defaultAddress) {
                    parseAddressToForm(defaultAddress);
                    setSelectedAddressId(defaultAddress.id);
                } else {
                    // If no saved addresses, use user info from profile
                    setAddress({
                        name: user.name || '',
                        phone: user.phone || '',
                        street: '',
                        city: '',
                        province: '',
                        zip: ''
                    });
                }
            } else {
                setSavedAddresses([]);
                // Use user info from profile if no saved addresses
                setAddress({
                    name: user.name || '',
                    phone: user.phone || '',
                    street: '',
                    city: '',
                    province: '',
                    zip: ''
                });
            }
        } else {
            // Fallback for guest or legacy
            const saved = localStorage.getItem('userAddresses');
            if (saved) {
                const parsedAddresses = JSON.parse(saved);
                setSavedAddresses(parsedAddresses);
                const defaultAddress = parsedAddresses.find(addr => addr.isDefault) || parsedAddresses[0];
                if (defaultAddress) {
                    parseAddressToForm(defaultAddress);
                    setSelectedAddressId(defaultAddress.id);
                }
            } else {
                setSavedAddresses([]);
            }
        }
    }, [user]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: '',
        name: '',
        phone: '',
        address: ''
    });

    const parseAddressToForm = (addressObj) => {
        // Parse the address string into form fields
        // Profile page stores address as just the street address string
        const addressStr = addressObj.address || '';
        
        // Try to parse if it contains commas (legacy format)
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
            // Extract zip code if present (e.g., "Metro Manila 1100")
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
            // Profile page format: just street address
            street = addressStr;
        }

        setAddress({
            name: addressObj.name || user?.name || '',
            phone: addressObj.phone || user?.phone || '',
            street: street,
            city: city,
            province: province,
            zip: zip
        });
    };

    const handleAddressSelect = (addressId) => {
        const selectedAddr = savedAddresses.find(addr => addr.id === addressId);
        if (selectedAddr) {
            parseAddressToForm(selectedAddr);
            setSelectedAddressId(addressId);
        }
    };

    const handleSaveNewAddress = () => {
        if (!newAddress.label || !address.name || !address.phone || !address.street) {
            alert('Please fill in all required fields (Label, Name, Phone, Street)');
            return;
        }

        // Construct full address string from form fields (matching Profile page format)
        const fullAddress = address.street;

        // Create new address object (matching Profile page structure)
        const newId = savedAddresses.length > 0 ? Math.max(...savedAddresses.map(a => a.id)) + 1 : 1;
        const addressToSave = {
            id: newId,
            label: newAddress.label,
            name: address.name,
            phone: address.phone,
            address: fullAddress,
            isDefault: savedAddresses.length === 0
        };

        // Save to localStorage (same key as Profile page)
        const updated = [...savedAddresses, addressToSave];
        setSavedAddresses(updated);

        if (user?.email) {
            localStorage.setItem(`userAddresses_${user.email}`, JSON.stringify(updated));
        } else {
            localStorage.setItem('userAddresses', JSON.stringify(updated));
        }

        // Select the new address
        parseAddressToForm(addressToSave);
        setSelectedAddressId(newId);

        // Reset form and close modal
        setNewAddress({ label: '', name: '', phone: '', address: '' });
        setShowAddAddressModal(false);
    };

    useEffect(() => {
        const savedCheckoutItems = localStorage.getItem('checkoutItems');
        const savedOrderType = localStorage.getItem('orderType');
        if (savedCheckoutItems) {
            setCheckoutItems(JSON.parse(savedCheckoutItems));
        }
        if (savedOrderType) {
            setOrderType(savedOrderType);
        }
        // Address loading is now handled in the user effect above
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
    const shippingFee = deliveryMethod === 'pickup' ? 0 : (subtotal >= 2000 ? 0 : 100);
    const total = subtotal + shippingFee;

    const handlePaymentChange = (paymentId) => {
        setSelectedPayment(paymentId);
        if (paymentId === 'gcash') {
            setShowQRModal(true);
        }
    };

    const handleReceiptUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlaceOrder = async () => {
        if (deliveryMethod === 'pickup' && !selectedPickupTime) {
            alert('Please select a pickup time');
            return;
        }

        if (selectedPayment === 'gcash' && !receiptFile) {
            alert('Please upload your GCash payment receipt');
            return;
        }

        setIsProcessing(true);

        let uploadedReceiptUrl = null;

        // Handle file upload if a receipt is present
        if (receiptFile && selectedPayment === 'gcash') {
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${user ? user.id : 'guest'}-${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, receiptFile);

            if (uploadError) {
                console.error('Error uploading receipt:', uploadError);
                alert('There was an error uploading your receipt. Please try again.');
                setIsProcessing(false);
                return;
            }

            // Get the public URL of the uploaded file
            const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);
            
            if (!urlData || !urlData.publicUrl) {
                console.error('Error getting public URL for receipt');
                alert('Could not retrieve receipt URL. Please try again.');
                setIsProcessing(false);
                return;
            }
            
            uploadedReceiptUrl = urlData.publicUrl;
        }

        const newOrder = {
            user_id: user ? user.id : null,
            items: checkoutItems,
            delivery_address: deliveryMethod === 'delivery' ? address : null,
            payment_method: selectedPayment,
            payment_status: selectedPayment === 'cod' ? 'unpaid' : 'paid',
            subtotal: subtotal,
            shipping_fee: shippingFee,
            total_amount: total,
            status: 'pending',
            order_type: orderType,
            delivery_method: deliveryMethod,
            pickup_time: deliveryMethod === 'pickup' ? selectedPickupTime : null,
            receipt_url: uploadedReceiptUrl,
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            alert('There was an error placing your order. Please try again.');
            setIsProcessing(false);
            return;
        }

        // --- Success ---
        const newOrderId = data.id;

        // Create notification (can also be done with a DB trigger)
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const newNotification = {
            id: `notif-${Date.now()}`,
            type: 'order',
            title: 'Order Placed Successfully!',
            message: `Your order #${newOrderId} has been placed. ${selectedPayment === 'cod' ? 'Payment will be collected on delivery.' : 'Waiting for payment confirmation.'}`,
            icon: 'fa-shopping-bag',
            timestamp: new Date().toISOString(),
            read: false,
            link: `/order-tracking/${newOrderId}`
        };
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...notifications]));

        // Cleanup local storage and state
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const checkoutItemIds = checkoutItems.map(item => item.id);
        const remainingCart = currentCart.filter(item => !checkoutItemIds.includes(item.id));
        
        localStorage.setItem('cart', JSON.stringify(remainingCart));
        localStorage.removeItem('checkoutItems');
        localStorage.removeItem('orderType');

        if (setCart) setCart(remainingCart);

        navigate(`/order-success/${newOrderId}`);
    };

    if (checkoutItems.length === 0 && !isProcessing) {
        return (
            <div className="checkout-container">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <h3>No items to checkout</h3>
                        <p>Please select items from your cart first</p>
                        <Link to="/cart" className="btn-shop-now">Go to Cart</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="container">
                <div className="checkout-header">
                    <i className="fas fa-lock fa-lg"></i>
                    <h1>Secure Checkout</h1>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        {/* Delivery Method Selection */}
                        <div className="checkout-section">
                            <h5 className="section-title">
                                <i className="fas fa-truck"></i>
                                Delivery Method
                            </h5>

                            <div className="d-flex gap-3 mb-3">
                                <div
                                    className={`payment-option flex-grow-1 ${deliveryMethod === 'delivery' ? 'selected' : ''}`}
                                    onClick={() => setDeliveryMethod('delivery')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="payment-icon">
                                        <i className="fas fa-truck"></i>
                                    </div>
                                    <div className="payment-info">
                                        <h6>Delivery</h6>
                                        <p>We'll deliver to your address</p>
                                    </div>
                                    <div className="form-check ms-auto">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            checked={deliveryMethod === 'delivery'}
                                            onChange={() => setDeliveryMethod('delivery')}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`payment-option flex-grow-1 ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
                                    onClick={() => setDeliveryMethod('pickup')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="payment-icon">
                                        <i className="fas fa-store"></i>
                                    </div>
                                    <div className="payment-info">
                                        <h6>Pick Up</h6>
                                        <p>Pick up at our store</p>
                                    </div>
                                    <div className="form-check ms-auto">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            checked={deliveryMethod === 'pickup'}
                                            onChange={() => setDeliveryMethod('pickup')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pickup Time Selection */}
                            {deliveryMethod === 'pickup' && (
                                <div className="mt-3 p-3 rounded" style={{ background: '#f8f9fa' }}>
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-clock me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                        Select Pickup Time
                                    </label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {pickupTimes.map(time => (
                                            <button
                                                key={time}
                                                type="button"
                                                className={`btn btn-sm rounded-pill px-3 ${selectedPickupTime === time ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                style={selectedPickupTime === time ? { background: 'var(--shop-pink)', border: 'none' } : {}}
                                                onClick={() => setSelectedPickupTime(time)}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                    <small className="text-muted mt-2 d-block">
                                        <i className="fas fa-map-marker-alt me-1"></i>
                                        Pickup Location: Jocery's Flower Shop, 123 Flower St., Quezon City
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Delivery Address - Only show if delivery method */}
                        {deliveryMethod === 'delivery' && (
                            <div className="checkout-section">
                                <h5 className="section-title mb-3">
                                    <i className="fas fa-map-marker-alt"></i>
                                    Delivery Address
                                </h5>

                                <div className="mb-3">
                                    {savedAddresses.length > 0 ? (
                                        <>
                                            <label className="form-label small text-muted fw-bold">Choose from Saved Addresses</label>
                                            <select
                                                className="form-select"
                                                value={selectedAddressId || ''}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAddressSelect(parseInt(e.target.value));
                                                    } else {
                                                        setSelectedAddressId(null);
                                                        // Reset to user info if no address selected
                                                        setAddress({
                                                            name: user?.name || '',
                                                            phone: user?.phone || '',
                                                            street: '',
                                                            city: '',
                                                            province: '',
                                                            zip: ''
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Enter new address</option>
                                                {savedAddresses.map(addr => (
                                                    <option key={addr.id} value={addr.id}>
                                                        {addr.label} {addr.isDefault && '(Default)'} - {addr.address}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle me-2"></i>
                                            No saved addresses. 
                                            {user ? (
                                                <span> Go to <Link to="/profile" style={{ color: 'var(--shop-pink)' }}>Profile</Link> to add addresses, or fill in the form below.</span>
                                            ) : (
                                                <span> Please fill in your delivery address below.</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={address.name}
                                            onChange={e => setAddress({ ...address, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={address.phone}
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted">Street Address</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={address.street}
                                            onChange={e => setAddress({ ...address, street: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="checkout-section">
                            <h5 className="section-title">
                                <i className="fas fa-box"></i>
                                Order Items ({checkoutItems.length})
                            </h5>

                            {checkoutItems.map((item, index) => (
                                <div key={index} className="checkout-item">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="checkout-item-img"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                    />
                                    <div className="checkout-item-info">
                                        <div className="checkout-item-name">{item.name}</div>
                                        <div className="checkout-item-qty">Qty: {item.qty || 1}</div>
                                    </div>
                                    <div className="checkout-item-price">
                                        ₱{((item.price) * (item.qty || 1)).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Method */}
                        <div className="checkout-section">
                            <h5 className="section-title">
                                <i className="fas fa-credit-card"></i>
                                Payment Method
                            </h5>

                            {paymentMethods.map(method => (
                                <div
                                    key={method.id}
                                    className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}
                                    onClick={() => handlePaymentChange(method.id)}
                                >
                                    <div className="payment-icon">
                                        <i className={`fas ${method.icon}`}></i>
                                    </div>
                                    <div className="payment-info">
                                        <h6>{method.name}</h6>
                                        <p>{method.description}</p>
                                    </div>
                                    <div className="form-check ms-auto">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            checked={selectedPayment === method.id}
                                            onChange={() => handlePaymentChange(method.id)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* GCash QR Code and Receipt Upload */}
                            {selectedPayment === 'gcash' && (
                                <div className="mt-3 p-3 rounded" style={{ background: '#f8f9fa', border: '2px dashed var(--shop-pink)' }}>
                                    <div className="text-center mb-3">
                                        <h6 className="fw-bold mb-2">
                                            <i className="fas fa-qrcode me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                            Scan to Pay via GCash
                                        </h6>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setShowQRModal(true)}
                                        >
                                            <i className="fas fa-eye me-2"></i>View QR Code
                                        </button>
                                    </div>

                                    <div className="mt-3">
                                        <label className="form-label fw-bold small">
                                            <i className="fas fa-receipt me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                            Upload Payment Receipt (Screenshot)
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept="image/*"
                                            onChange={handleReceiptUpload}
                                        />
                                        {receiptPreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={receiptPreview}
                                                    alt="Receipt Preview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '200px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <button
                                                    className="btn btn-sm btn-link text-danger mt-1 p-0"
                                                    onClick={() => {
                                                        setReceiptFile(null);
                                                        setReceiptPreview(null);
                                                    }}
                                                >
                                                    <i className="fas fa-times me-1"></i>Remove
                                                </button>
                                            </div>
                                        )}
                                        <small className="text-muted d-block mt-2">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Please upload a screenshot of your GCash payment confirmation
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="order-summary-card">
                            <h5 className="fw-bold mb-4">Order Summary</h5>

                            <div className="summary-row">
                                <span>Subtotal ({checkoutItems.reduce((acc, item) => acc + (item.qty || 1), 0)} items)</span>
                                <span>₱{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>{deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping Fee'}</span>
                                <span>{shippingFee === 0 ? 'FREE' : `₱${shippingFee}`}</span>
                            </div>
                            {deliveryMethod === 'pickup' && selectedPickupTime && (
                                <div className="small mb-2" style={{ color: 'var(--shop-pink)' }}>
                                    <i className="fas fa-clock me-1"></i>
                                    Pickup: {selectedPickupTime}
                                </div>
                            )}
                            {shippingFee === 0 && deliveryMethod === 'delivery' && (
                                <div className="text-success small mb-2">
                                    <i className="fas fa-check-circle me-1"></i>
                                    Free shipping for orders ₱2,000+
                                </div>
                            )}

                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₱{total.toLocaleString()}</span>
                            </div>

                            <button
                                className="btn-place-order"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>Place Order</>
                                )}
                            </button>

                            <div className="text-center mt-3">
                                <small className="text-muted">
                                    <i className="fas fa-shield-alt me-1"></i>
                                    Your payment information is secure
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GCash QR Code Modal */}
            {showQRModal && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal-content-custom" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header-custom">
                            <h4>GCash Payment QR Code</h4>
                            <button className="modal-close" onClick={() => setShowQRModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-custom text-center">
                            <div className="mb-3">
                                <div
                                    style={{
                                        width: '250px',
                                        height: '250px',
                                        margin: '0 auto',
                                        background: '#fff',
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}
                                >
                                    <img 
                                        src={qrCodeImage} 
                                        alt="GCash QR Code" 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} 
                                    />
                                </div>
                            </div>
                            <div className="p-3 rounded mb-3" style={{ background: '#f8f9fa' }}>
                                <h6 className="fw-bold mb-2">Payment Instructions:</h6>
                                <ol className="text-start small" style={{ paddingLeft: '20px' }}>
                                    <li>Open your GCash app</li>
                                    <li>Tap "Scan QR"</li>
                                    <li>Scan this QR code</li>
                                    <li>Enter the amount: <strong>₱{total.toLocaleString()}</strong></li>
                                    <li>Complete the payment</li>
                                    <li>Take a screenshot of the payment confirmation</li>
                                    <li>Upload the screenshot below</li>
                                </ol>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small">
                                    <i className="fas fa-receipt me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                    Upload Payment Receipt
                                </label>
                                <input
                                    type="file"
                                    className="form-control form-control-sm"
                                    accept="image/*"
                                    onChange={handleReceiptUpload}
                                />
                                {receiptPreview && (
                                    <div className="mt-2">
                                        <img
                                            src={receiptPreview}
                                            alt="Receipt Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '150px',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn w-100"
                                style={{ background: 'var(--shop-pink)', color: 'white' }}
                                onClick={() => setShowQRModal(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Address Modal */}
            {showAddAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddAddressModal(false)}>
                    <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <h4>Add New Address</h4>
                            <button className="modal-close" onClick={() => setShowAddAddressModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-custom">
                            <div className="form-group">
                                <label className="form-label">Label <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={newAddress.label}
                                    onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                    placeholder="e.g., Home, Office"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={address.name}
                                    onChange={e => setAddress({ ...address, name: e.target.value })}
                                    placeholder={user?.name || 'Enter full name'}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                                <input
                                    type="tel"
                                    className="form-control-custom"
                                    value={address.phone}
                                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                                    placeholder={user?.phone || 'Enter phone number'}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Street Address <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={address.street}
                                    onChange={e => setAddress({ ...address, street: e.target.value })}
                                    placeholder="e.g., 123 Sampaguita St., Brgy. Maligaya"
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control-custom"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            placeholder="e.g., Quezon City"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label">Province</label>
                                        <input
                                            type="text"
                                            className="form-control-custom"
                                            value={address.province}
                                            onChange={e => setAddress({ ...address, province: e.target.value })}
                                            placeholder="e.g., Metro Manila"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Zip Code</label>
                                <input
                                    type="text"
                                    className="form-control-custom"
                                    value={address.zip}
                                    onChange={e => setAddress({ ...address, zip: e.target.value })}
                                    placeholder="e.g., 1100"
                                />
                            </div>
                        </div>
                        <div className="modal-footer-custom">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setShowAddAddressModal(false);
                                    setNewAddress({ label: '', name: '', phone: '', address: '' });
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--shop-pink)', color: 'white' }}
                                onClick={handleSaveNewAddress}
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
