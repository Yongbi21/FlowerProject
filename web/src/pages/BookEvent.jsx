import React, { useMemo, useState, useRef } from 'react';
import RequestSuccessModal from '../components/RequestSuccessModal';
import { requestAPI, uploadAPI } from '../config/api';
import '../styles/BookEvent.css';

const initialFormState = {
    fullName: '',
    eventType: '',
    otherEventType: '',
    eventDate: '',
    venue: '',
    details: '',
    inspirationFile: null,
};

const BookEvent = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const minEventDate = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

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

        let nextValue = value;

        if (name === 'eventDate' && value) {
            nextValue = value < minEventDate ? minEventDate : value;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nextValue,
            ...(name === 'eventType' && nextValue !== 'Other' ? { otherEventType: '' } : {}),
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
                type: 'booking',
                full_name: formData.fullName,
                event_type: formData.eventType,
                other_event_type: formData.otherEventType,
                event_date: formData.eventDate,
                venue: formData.venue,
                additional_notes: formData.details,
                photo_url: photoUrl,
                notes: formData.details // Keep notes for general purpose
            };

            const response = await requestAPI.create(requestData);

            if (response.data.success) {
                setShowModal(true);
                setFormData(initialFormState);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setStatus(null);
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            setStatus({
                type: 'error',
                message: 'Failed to submit booking. Please try again.'
            });
        }
    };

    return (
        <div className="book-event-page">
            <section id="bookingForm" className="booking-section bg-light">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold font-playfair mb-3">Let's Create Something Beautiful</h1>
                        <p className="lead text-muted">From intimate gatherings to grand celebrations, we bring your floral dreams to life.</p>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-0 text-center pt-5 pb-3">
                                    <h2 className="fw-bold text-dark font-playfair">Event Details</h2>
                                    <p className="text-muted">Tell us about your special day</p>
                                    {status && (
                                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} mb-0`}>
                                            {status.message}
                                        </div>
                                    )}
                                </div>
                                <div className="card-body p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold" htmlFor="fullName">Full Name</label>
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    className="form-control bg-light border-0 py-3"
                                                    placeholder="Enter your full name"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold" htmlFor="eventType">Occasion</label>
                                                <select
                                                    id="eventType"
                                                    name="eventType"
                                                    className="form-select bg-light border-0 py-3"
                                                    value={formData.eventType}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select an occasion</option>
                                                    <option value="Wedding">Wedding</option>
                                                    <option value="Debut">Debut / Birthday</option>
                                                    <option value="Anniversary">Anniversary</option>
                                                    <option value="Corporate">Corporate Event</option>
                                                    <option value="Funeral">Funeral / Sympathy</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            {formData.eventType === 'Other' && (
                                                <div className="col-12">
                                                    <div className="p-4 bg-white rounded-4 border shadow-sm">
                                                        <label className="form-label fw-semibold" htmlFor="otherEventType">Tell us about the occasion</label>
                                                        <input
                                                            type="text"
                                                            id="otherEventType"
                                                            name="otherEventType"
                                                            className="form-control bg-light border-0 py-3"
                                                            placeholder="Describe the celebration"
                                                            value={formData.otherEventType}
                                                            onChange={handleChange}
                                                            required={formData.eventType === 'Other'}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold" htmlFor="eventDate">Event Date</label>
                                                <input
                                                    type="date"
                                                    id="eventDate"
                                                    name="eventDate"
                                                    className="form-control bg-light border-0 py-3"
                                                    value={formData.eventDate}
                                                    onChange={handleChange}
                                                    min={minEventDate}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold" htmlFor="venue">Venue Address</label>
                                                <input
                                                    type="text"
                                                    id="venue"
                                                    name="venue"
                                                    className="form-control bg-light border-0 py-3"
                                                    placeholder="Where will the event be held?"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold" htmlFor="details">Additional Notes</label>
                                                <textarea
                                                    id="details"
                                                    name="details"
                                                    className="form-control bg-light border-0 py-3"
                                                    rows="4"
                                                    placeholder="Tell us more about your event, style preferences, or any special requests."
                                                    value={formData.details}
                                                    onChange={handleChange}
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
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
                                                <button type="submit" className="btn btn-pink w-100 py-3 rounded-pill fw-bold shadow-sm">
                                                    Submit Inquiry
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
                message="Your event inquiry has been submitted successfully! You can view it in My Orders under the Pending tab. The admin will review and respond soon."
            />
        </div>
    );
};

export default BookEvent;
