import React, { useState, useRef } from 'react';
import RequestSuccessModal from '../components/RequestSuccessModal';
import { requestAPI, uploadAPI } from '../config/api';
import '../styles/SpecialOrder.css';

const initialFormState = {
    recipientName: '',
    occasion: '',
    otherOccasion: '',
    preferences: '',
    addon: '',
    inspirationFile: null,
    message: '',
};

const SpecialOrder = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        if (files && files[0]) {
            const file = files[0];
            setFormData((prev) => ({ ...prev, [name]: file }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'occasion' && value !== 'Other' ? { otherOccasion: '' } : {}),
        }));
    };

    const openFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUploadKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            let photoUrl = null;

            // Upload photo if selected
            if (formData.inspirationFile) {
                try {
                    const uploadResponse = await uploadAPI.image(formData.inspirationFile);
                    if (uploadResponse.data.success) {
                        photoUrl = uploadResponse.data.url;
                    }
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    setStatus({
                        type: 'error',
                        message: 'Failed to upload image. Please try again or try a smaller image.'
                    });
                    return;
                }
            }

            const requestData = {
                type: 'special_order',
                recipient_name: formData.recipientName,
                occasion: formData.occasion,
                other_occasion: formData.otherOccasion,
                preferences: formData.preferences,
                addon: formData.addon,
                card_message: formData.message,
                photo_url: photoUrl,
                notes: formData.message || `Special Order for ${formData.recipientName || 'recipient'}`
            };

            const response = await requestAPI.create(requestData);

            if (response.data.success) {
                // Create notification
                const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                const newNotification = {
                    id: `notif-${Date.now()}`,
                    type: 'request',
                    title: 'Special Order Request Submitted!',
                    message: `Your special order for ${formData.recipientName || 'recipient'} has been submitted and is pending approval.`,
                    icon: 'fa-gift',
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: '/my-orders'
                };
                localStorage.setItem('notifications', JSON.stringify([newNotification, ...notifications]));

                setShowModal(true);
                setFormData(initialFormState);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setStatus(null);
            }
        } catch (error) {
            console.error('Error submitting special order:', error);
            setStatus({
                type: 'error',
                message: 'Failed to submit special order. Please try again.'
            });
        }
    };

    return (
        <div className="special-order-page">
            <section id="orderForm" className="special-section bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold font-playfair mb-3">Make It Extra Special</h1>
                        <p className="lead text-muted">Add a personal touch with our curated selection of gifts and custom arrangements.</p>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-0 text-center pt-5 pb-3">
                                    <h2 className="fw-bold text-dark font-playfair">Custom Order Request</h2>
                                    <p className="text-muted">Tell us exactly what you need</p>
                                    {status && (
                                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} mb-0`}>
                                            {status.message}
                                        </div>
                                    )}
                                </div>
                                <div className="card-body p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-12">
                                                <h5 className="fw-bold text-secondary mb-3">
                                                    <i className="fas fa-user-friends me-2"></i>
                                                    Who is this for?
                                                </h5>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold" htmlFor="recipientName">Recipient Name</label>
                                                <input
                                                    type="text"
                                                    id="recipientName"
                                                    name="recipientName"
                                                    className="form-control bg-light border-0 py-3"
                                                    placeholder="Name of recipient"
                                                    value={formData.recipientName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold" htmlFor="occasion">Occasion</label>
                                                <select
                                                    id="occasion"
                                                    name="occasion"
                                                    className="form-select bg-light border-0 py-3"
                                                    value={formData.occasion}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select Occasion</option>
                                                    <option value="Birthday">Birthday</option>
                                                    <option value="Anniversary">Anniversary</option>
                                                    <option value="Valentines">Valentine's</option>
                                                    <option value="MothersDay">Mother's Day</option>
                                                    <option value="JustBecause">Just Because</option>
                                                    <option value="Apology">Apology</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            {formData.occasion === 'Other' && (
                                                <div className="col-12">
                                                    <div className="p-4 bg-white rounded-4 border shadow-sm">
                                                        <label className="form-label fw-semibold" htmlFor="otherOccasion">Tell us about the occasion</label>
                                                        <input
                                                            type="text"
                                                            id="otherOccasion"
                                                            name="otherOccasion"
                                                            className="form-control bg-light border-0 py-3"
                                                            placeholder="Describe the celebration"
                                                            value={formData.otherOccasion}
                                                            onChange={handleChange}
                                                            required={formData.occasion === 'Other'}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-12 mt-4">
                                                <label className="form-label fw-semibold" htmlFor="preferences">Your Vision in Words</label>
                                                <textarea
                                                    id="preferences"
                                                    name="preferences"
                                                    className="form-control bg-light border-0 py-3"
                                                    rows="3"
                                                    placeholder="Describe your desired arrangement. Think about flowers, color, and style."
                                                    value={formData.preferences}
                                                    onChange={handleChange}
                                                ></textarea>
                                            </div>
                                            <div className="col-12 mt-4">
                                                <label className="form-label fw-semibold" htmlFor="addon">Add-on Items</label>
                                                <select
                                                    id="addon"
                                                    name="addon"
                                                    className="form-select bg-light border-0 py-3"
                                                    value={formData.addon}
                                                    onChange={handleChange}
                                                >
                                                    <option value="" disabled>Select an Item</option>
                                                    <option value="Chocolates">Chocolates</option>
                                                    <option value="Teddy Bear">Teddy Bear</option>
                                                    <option value="Balloons">Balloons</option>
                                                    <option value="Message Card">Message Card</option>
                                                    <option value="None">None</option>
                                                </select>
                                            </div>
                                            <div className="col-12 mt-4">
                                                <label className="form-label fw-semibold" htmlFor="inspirationFile">Inspiration Gallery</label>
                                                {imagePreview ? (
                                                    <div className="position-relative">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: '400px',
                                                                objectFit: 'contain',
                                                                borderRadius: '12px',
                                                                border: '2px solid #e0e0e0',
                                                                padding: '10px',
                                                                background: '#f8f9fa'
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setImagePreview(null);
                                                                setFormData((prev) => ({ ...prev, inspirationFile: null }));
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.value = '';
                                                                }
                                                            }}
                                                            style={{ zIndex: 10 }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                        <div className="text-center mt-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={openFilePicker}
                                                            >
                                                                <i className="fas fa-edit me-2"></i>Change Image
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id="inspirationFile"
                                                            name="inspirationFile"
                                                            className="form-control visually-hidden"
                                                            ref={fileInputRef}
                                                            onChange={handleChange}
                                                            accept="image/*"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="upload-box p-5 text-center bg-light rounded-4 border-dashed"
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={openFilePicker}
                                                        onKeyDown={handleUploadKeyDown}
                                                    >
                                                        <i className="fas fa-cloud-upload-alt fa-2x text-primary mb-3"></i>
                                                        <p className="mb-2">Upload an image or drag and drop</p>
                                                        <input
                                                            type="file"
                                                            id="inspirationFile"
                                                            name="inspirationFile"
                                                            className="form-control visually-hidden"
                                                            ref={fileInputRef}
                                                            onChange={handleChange}
                                                            accept="image/*"
                                                        />
                                                        <label htmlFor="inspirationFile" className="btn btn-outline-primary rounded-pill px-4">Choose File</label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-12 mt-4">
                                                <label className="form-label fw-semibold" htmlFor="message">Message for Card (Optional)</label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    className="form-control bg-light border-0 py-3"
                                                    rows="3"
                                                    placeholder="Write your heartfelt message here..."
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                ></textarea>
                                            </div>
                                            <div className="col-12 mt-5">
                                                <button type="submit" className="btn btn-pink w-100 py-3 rounded-pill fw-bold shadow-sm">
                                                    Submit Special Order
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <RequestSuccessModal
                show={showModal}
                onClose={() => setShowModal(false)}
                message="Your special order request has been sent to the admin. Please wait for confirmation."
            />
        </div>
    );
};

export default SpecialOrder;
