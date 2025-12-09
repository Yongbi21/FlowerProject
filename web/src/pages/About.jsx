import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/About.css';
import customServiceImg from '../assets/pictures/CUSTOMIZED.jpg';
import eventServiceImg from '../assets/pictures/EVENTSPECIFIC.jpg';
import specialServiceImg from '../assets/pictures/SPECIALORDERPAGE.jpg';
import aboutShopImg from '../assets/pictures/about2.jpg';

const About = () => {
    const [aboutData, setAboutData] = useState({
        story: "Jocery's Flower Shop was born from a love for flowers and a commitment to our community. When a beloved local flower shop closed its doors, we saw an opportunity to continue serving its loyal customers, ensuring that our town wouldn't lose its source of fresh, beautifully crafted floral designs.",
        promise: "We built our shop on the foundation of those relationships, and our roots in the community run deep. Every bouquet we craft and every event we style is a continuation of a legacy of quality, creativity, and connection.",
        ownerQuote: "Flowers have always been my passion. They have a unique way of telling stories and connecting people. When I saw our community was about to lose its local florist, I knew I had to step in. This shop is my love letter to this town and to the art of floristry."
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('aboutData') || '{}');
        if (Object.keys(saved).length > 0) {
            setAboutData(saved);
        }
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="about-hero">
                <div className="container">
                    <h1>About Us</h1>
                    <p className="lead text-muted">Crafting beautiful moments, one petal at a time.</p>
                </div>
            </section>

            {/* Story */}
            <section className="story-section">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div className="story-image-wrapper">
                                <img src={aboutShopImg} alt="Our Shop" className="story-img shadow-lg" />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="story-content">
                                <h2 className="mb-4 fw-bold">Our Shop</h2>
                                <p className="text-muted mb-4">
                                    {aboutData.story}
                                </p>
                                <p className="text-muted mb-0">
                                    {aboutData.promise}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promise */}
            <section className="promise-section">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold text-dark position-relative d-inline-block section-title">Our Services</h2>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 rounded-4 overflow-hidden shadow hover-lift">
                                <div className="img-wrapper" style={{ height: '250px' }}>
                                    <Link to="/customized" className="d-block w-100 h-100">
                                        <img
                                            src={customServiceImg}
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Custom Bouquets"
                                        />
                                    </Link>
                                </div>
                                <div className="card-body p-4 text-center">
                                    <h3 className="h4 fw-bold mb-3">Custom Bouquets</h3>
                                    <p className="text-muted mb-4">Create your own unique arrangement with your choice of flowers, colors, and wrapping.</p>
                                    <Link to="/customized" className="btn btn-pink rounded-pill px-4 fw-semibold">Learn More</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card h-100 border-0 rounded-4 overflow-hidden shadow hover-lift">
                                <div className="img-wrapper" style={{ height: '250px' }}>
                                    <Link to="/book-event" className="d-block w-100 h-100">
                                        <img
                                            src={eventServiceImg}
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Event Decorations"
                                        />
                                    </Link>
                                </div>
                                <div className="card-body p-4 text-center">
                                    <h3 className="h4 fw-bold mb-3">Event Decorations</h3>
                                    <p className="text-muted mb-4">Beautiful floral arrangements for weddings, parties, and corporate events.</p>
                                    <Link to="/book-event" className="btn btn-pink rounded-pill px-4 fw-semibold">Learn More</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card h-100 border-0 rounded-4 overflow-hidden shadow hover-lift">
                                <div className="img-wrapper" style={{ height: '250px' }}>
                                    <Link to="/special-order" className="d-block w-100 h-100">
                                        <img
                                            src={specialServiceImg}
                                            className="w-100 h-100 object-fit-cover"
                                            alt="Special Orders"
                                        />
                                    </Link>
                                </div>
                                <div className="card-body p-4 text-center">
                                    <h3 className="h4 fw-bold mb-3">Special Orders</h3>
                                    <p className="text-muted mb-4">Add chocolates, teddy bears, and personalized gifts to make your surprise extra special.</p>
                                    <Link to="/special-order" className="btn btn-pink rounded-pill px-4 fw-semibold">Learn More</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <h2 className="text-center mb-5 fw-bold">Our Promise</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="promise-card">
                                <i className="fas fa-leaf fa-2x mb-3 text-success"></i>
                                <h3>Responsibly Sourced</h3>
                                <p className="text-muted">We work with ethical suppliers to ensure our flowers are fresh, sustainable, and responsibly grown.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="promise-card">
                                <i className="fas fa-hands fa-2x mb-3 text-primary"></i>
                                <h3>Crafted by Experts</h3>
                                <p className="text-muted">Each bouquet is arranged by skilled florists who put heart and creativity into every detail.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="promise-card">
                                <i className="fas fa-heart fa-2x mb-3 text-danger"></i>
                                <h3>Caring for Moments</h3>
                                <p className="text-muted">Whether it’s a celebration, a comfort, or a simple “thank you,” we craft for your emotions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="team-section">
                <div className="container">
                    <h2 className="mb-5 fw-bold">Meet The Owner</h2>
                    <img
                        src="/Pictures/owner.jpg"
                        alt="Owner"
                        className="owner-img shadow"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                    />
                    <figure className="text-center">
                        <blockquote className="blockquote">
                            <p className="quote">
                                "{aboutData.ownerQuote}"
                            </p>
                        </blockquote>
                        <figcaption className="blockquote-footer mt-3">
                            Owner of <cite title="Source Title">Jocery's Flower Shop</cite>
                        </figcaption>
                    </figure>
                </div>
            </section>
        </div>
    );
};

export default About;
