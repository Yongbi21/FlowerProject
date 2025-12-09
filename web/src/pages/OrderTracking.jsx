import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/Shop.css';

// Timeline steps for Delivery orders
const deliverySteps = [
    { id: 1, status: 'order_received', title: 'Order Received', description: 'Your order has been received', icon: 'fa-clipboard-check' },
    { id: 2, status: 'payment', title: 'Payment', description: 'Payment confirmed', icon: 'fa-credit-card' },
    { id: 3, status: 'processing', title: 'Processing', description: 'Our florists are preparing your order', icon: 'fa-seedling' },
    { id: 4, status: 'ready_for_delivery', title: 'Ready for Delivery', description: 'Your order is ready to be shipped', icon: 'fa-box' },
    { id: 5, status: 'out_for_delivery', title: 'Out for Delivery', description: 'Your order is on its way', icon: 'fa-truck' },
    { id: 6, status: 'delivered', title: 'Delivered', description: 'Order has been delivered successfully', icon: 'fa-check-circle' },
];

// Timeline steps for Pickup orders
const pickupSteps = [
    { id: 1, status: 'order_received', title: 'Order Received', description: 'Your order has been received', icon: 'fa-clipboard-check' },
    { id: 2, status: 'payment', title: 'Payment', description: 'Payment confirmed', icon: 'fa-credit-card' },
    { id: 3, status: 'processing', title: 'Processing', description: 'Our florists are preparing your order', icon: 'fa-seedling' },
    { id: 4, status: 'ready_for_pickup', title: 'Ready for Pickup', description: 'Your order is ready for pickup', icon: 'fa-store' },
    { id: 5, status: 'claimed', title: 'Claimed', description: 'Order has been picked up', icon: 'fa-check-circle' },
];

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [currentStep, setCurrentStep] = useState(2);

    useEffect(() => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = orders.find(o => o.id === orderId);
        
        if (foundOrder) {
            setOrder(foundOrder);
            const orderDate = new Date(foundOrder.date);
            const now = new Date();
            const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);
            
            const steps = foundOrder.deliveryMethod === 'pickup' ? pickupSteps : deliverySteps;
            const maxSteps = steps.length;
            
            if (hoursSinceOrder < 0.5) setCurrentStep(1);
            else if (hoursSinceOrder < 1) setCurrentStep(2);
            else if (hoursSinceOrder < 4) setCurrentStep(3);
            else if (hoursSinceOrder < 8) setCurrentStep(4);
            else if (hoursSinceOrder < 24 && maxSteps > 5) setCurrentStep(5);
            else setCurrentStep(maxSteps);
        }
    }, [orderId]);

    const getTrackingSteps = () => {
        if (!order) return deliverySteps;
        return order.deliveryMethod === 'pickup' ? pickupSteps : deliverySteps;
    };

    const getTimelineDate = (stepId) => {
        if (!order) return '';
        const orderDate = new Date(order.date);
        const stepDate = new Date(orderDate.getTime() + (stepId - 1) * 2 * 60 * 60 * 1000);
        
        if (stepId <= currentStep) {
            return stepDate.toLocaleString('en-PH', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        return 'Pending';
    };

    const getExpectedDate = () => {
        if (!order) return '';
        const orderDate = new Date(order.date);
        const expectedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
        return expectedDate.toLocaleDateString('en-PH', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric'
        });
    };

    const getOrderTypeLabel = () => {
        if (!order) return '';
        const isCustom = order.orderType === 'custom';
        const isPickup = order.deliveryMethod === 'pickup';
        
        if (isCustom) {
            return isPickup ? 'Custom/Event Arrangement - Pick Up' : 'Custom/Event Arrangement - Delivery';
        }
        return isPickup ? 'E-commerce - Pick Up' : 'E-commerce - Delivery';
    };

    const trackingSteps = getTrackingSteps();
    const isPickup = order?.deliveryMethod === 'pickup';
    const isFinalStep = currentStep >= trackingSteps.length;

    if (!order) {
        return (
            <div className="tracking-container">
                <div className="container">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <h3>Order Not Found</h3>
                        <p>We couldn't find an order with ID: {orderId}</p>
                        <Link to="/profile" className="btn-shop-now">View My Orders</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tracking-container">
            <div className="container">
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to="/profile">My Orders</Link></li>
                        <li className="breadcrumb-item active">Track Order</li>
                    </ol>
                </nav>

                <div className="tracking-header">
                    <div className="tracking-order-info">
                        <div className="tracking-order-id">
                            <h2>Order #{order.id}</h2>
                            <div className="tracking-order-date">
                                Placed on {new Date(order.date).toLocaleDateString('en-PH', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <span className="badge mt-2" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
                                {getOrderTypeLabel()}
                            </span>
                        </div>
                        <div className="tracking-current-status">
                            <div className="current-status-badge">
                                {trackingSteps[currentStep - 1]?.title}
                            </div>
                            <div className="expected-delivery">
                                {!isFinalStep && (
                                    isPickup 
                                        ? `Expected pickup: ${getExpectedDate()}` 
                                        : `Expected delivery: ${getExpectedDate()}`
                                )}
                                {isFinalStep && (isPickup ? 'Picked up successfully!' : 'Delivered successfully!')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div className="tracking-timeline">
                            <h5 className="fw-bold mb-4">
                                <i className="fas fa-route me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                Tracking Timeline
                            </h5>
                            
                            <div className="timeline">
                                {trackingSteps.map((step) => (
                                    <div 
                                        key={step.id}
                                        className={`timeline-item ${
                                            step.id < currentStep ? 'completed' : 
                                            step.id === currentStep ? 'current' : ''
                                        }`}
                                    >
                                        <div className="timeline-marker">
                                            <i className={`fas ${step.icon}`}></i>
                                        </div>
                                        <div className="timeline-content">
                                            <h5>{step.title}</h5>
                                            <p>{step.description}</p>
                                            <div className="timeline-date">{getTimelineDate(step.id)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="delivery-details">
                            <h5 className="fw-bold mb-4">
                                <i className={`fas ${isPickup ? 'fa-store' : 'fa-map-marker-alt'} me-2`} style={{ color: 'var(--shop-pink)' }}></i>
                                {isPickup ? 'Pickup Details' : 'Delivery Details'}
                            </h5>
                            
                            {isPickup ? (
                                <>
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Pickup Location</div>
                                        <div className="delivery-value">Jocery's Flower Shop, 123 Flower St., Quezon City</div>
                                    </div>
                                    {order.pickupTime && (
                                        <div className="delivery-info-row">
                                            <div className="delivery-label">Pickup Time</div>
                                            <div className="delivery-value">{order.pickupTime}</div>
                                        </div>
                                    )}
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Payment</div>
                                        <div className="delivery-value">{order.payment?.name}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Recipient</div>
                                        <div className="delivery-value">{order.address?.name}</div>
                                    </div>
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Phone</div>
                                        <div className="delivery-value">{order.address?.phone}</div>
                                    </div>
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Address</div>
                                        <div className="delivery-value">
                                            {order.address?.street}, {order.address?.city}, {order.address?.province} {order.address?.zip}
                                        </div>
                                    </div>
                                    <div className="delivery-info-row">
                                        <div className="delivery-label">Payment</div>
                                        <div className="delivery-value">{order.payment?.name}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="tracking-items">
                            <h5 className="fw-bold mb-4">
                                <i className="fas fa-box me-2" style={{ color: 'var(--shop-pink)' }}></i>
                                Order Items
                            </h5>
                            
                            {order.items?.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="order-item-img"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/70'}
                                    />
                                    <div>
                                        <div className="order-item-name">{item.name}</div>
                                        <div className="order-item-qty">x{item.qty || 1}</div>
                                    </div>
                                    <div className="order-item-price">
                                        ₱{(item.price * (item.qty || 1)).toLocaleString()}
                                    </div>
                                </div>
                            ))}

                            <hr />

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>₱{order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>{isPickup ? 'Pickup' : 'Shipping'}</span>
                                <span>{order.shippingFee === 0 ? 'FREE' : `₱${order.shippingFee}`}</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold fs-5 mt-3" style={{ color: 'var(--shop-pink)' }}>
                                <span>Total</span>
                                <span>₱{order.total?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-3">
                            <Link to="/profile" className="btn w-100 py-2" style={{ background: 'var(--shop-pink-light)', color: 'var(--shop-pink)' }}>
                                <i className="fas fa-arrow-left me-2"></i>Back to My Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
