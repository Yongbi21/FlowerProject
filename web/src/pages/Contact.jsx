import React, { useState, useEffect } from 'react';
import '../styles/Contact.css';

const Contact = () => {
    const [contactData, setContactData] = useState({
        address: 'Zamboanga City, Philippines',
        phone: '+63 756 347 901',
        email: 'JoceryFlowerShop@gmail.com',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1608.6438299927784!2d122.07320562571662!3d6.908031381591681!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x325041c4ef608537%3A0xbd63d709d92c1d51!2sCagayano\'s%20Panciteria!5e0!3m2!1sen!2sus!4v1763301121573!5m2!1sen!2sus'
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('contactData') || '{}');
        if (Object.keys(saved).length > 0) {
            setContactData(saved);
        }
    }, []);

    return (
        <div>
            {/* Header */}
            <header className="contact-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p className="lead text-muted">We'd love to hear from you. Get in touch!</p>
                </div>
            </header>

            {/* Contact Info */}
            <section className="container mb-5">
                <div className="row g-4">
                    <div className="col-md-4">
                        <div className="info-card">
                            <div className="icon-circle">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <h3>Visit Us</h3>
                            <p>{contactData.address}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="info-card">
                            <div className="icon-circle">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <h3>Call Us</h3>
                            <p>{contactData.phone}</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="info-card">
                            <div className="icon-circle">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Email Us</h3>
                            <p>{contactData.email}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="container mb-5">
                <h2 className="text-center mb-4 fw-bold">Our Location</h2>
                <div className="map-container">
                    <iframe
                        src={contactData.mapUrl}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map"
                    >
                    </iframe>
                </div>
            </section>
        </div>
    );
};

export default Contact;
