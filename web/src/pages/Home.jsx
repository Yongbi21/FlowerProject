import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
// Removed API import - using localStorage instead
import eventImg from '../assets/pictures/EVENTSPECIFIC.jpg';
import customImg from '../assets/pictures/CUSTOMIZED.jpg';
import specialImg from '../assets/pictures/SPECIALORDERPAGE.jpg';

// Import Occasion Images
import allSouls1 from '../assets/pictures/occasions/ALLSOULSDAY1.png';
import allSouls2 from '../assets/pictures/occasions/ALLSOULSDAY2.png';
import allSouls3 from '../assets/pictures/occasions/ALLSOULSDAY3.png';
import allSouls4 from '../assets/pictures/occasions/ALLSOULSDAY4.png';
import allSouls5 from '../assets/pictures/occasions/ALLSOULSDAY5.png';

import getWell1 from '../assets/pictures/occasions/GETWELLSOON1.png';
import getWell2 from '../assets/pictures/occasions/GETWELLSOON2.png';
import getWell3 from '../assets/pictures/occasions/GETWELLSOON3.png';

import grad1 from '../assets/pictures/occasions/GRADUATION1.png';
import grad2 from '../assets/pictures/occasions/GRADUATION2.png';
import grad3 from '../assets/pictures/occasions/GRADUATION3.png';
import grad4 from '../assets/pictures/occasions/GRADUATION4.png';

import mothers1 from '../assets/pictures/occasions/MOTHERSDAY1.png';
import mothers2 from '../assets/pictures/occasions/MOTHERSDAY2.png';
import mothers3 from '../assets/pictures/occasions/MOTHERSDAY3.png';
import mothers4 from '../assets/pictures/occasions/MOTHERSDAY4.png';
import mothers5 from '../assets/pictures/occasions/MOTHERSDAY5.png';
import mothers6 from '../assets/pictures/occasions/MOTHERSDAY6.png';
import mothers7 from '../assets/pictures/occasions/MOTHERSDAY7.png';
import mothers8 from '../assets/pictures/occasions/MOTHERSDAY8.png';
import mothers9 from '../assets/pictures/occasions/MOTHERSDAY9.png';

import sympathy1 from '../assets/pictures/occasions/SYMPATHY1.png';
import sympathy2 from '../assets/pictures/occasions/SYMPATHY2.png';
import sympathy3 from '../assets/pictures/occasions/SYMPATHY3.png';
import sympathy4 from '../assets/pictures/occasions/SYMPATHY4.png';

import val1 from '../assets/pictures/occasions/VALENTINES1.png';
import val6 from '../assets/pictures/occasions/VALENTINES6.png';
import val7 from '../assets/pictures/occasions/VALENTINES7.png';
import val8 from '../assets/pictures/occasions/VALENTINES8.png';
import val9 from '../assets/pictures/occasions/VALENTINES9.png';



const products = [
    // All Souls Day
    { id: 'as1', name: 'Peaceful Tribute', price: 1200, category: 'All Souls Day', image: allSouls1 },
    { id: 'as2', name: 'Eternal Memory', price: 1350, category: 'All Souls Day', image: allSouls2 },
    { id: 'as3', name: 'Solemn Respect', price: 1500, category: 'All Souls Day', image: allSouls3 },
    { id: 'as4', name: 'White Remembrance', price: 1600, category: 'All Souls Day', image: allSouls4 },
    { id: 'as5', name: 'Gentle Peace', price: 1450, category: 'All Souls Day', image: allSouls5 },

    // Get Well Soon
    { id: 'gw1', name: 'Sunny Recovery', price: 1300, category: 'Get Well Soon', image: getWell1 },
    { id: 'gw2', name: 'Bright Spirits', price: 1250, category: 'Get Well Soon', image: getWell2 },
    { id: 'gw3', name: 'Healing Thoughts', price: 1400, category: 'Get Well Soon', image: getWell3 },

    // Graduation
    { id: 'gr1', name: 'Victory Bloom', price: 1500, category: 'Graduation', image: grad1 },
    { id: 'gr2', name: 'Success Bouquet', price: 1600, category: 'Graduation', image: grad2 },
    { id: 'gr3', name: 'Bright Future', price: 1450, category: 'Graduation', image: grad3 },
    { id: 'gr4', name: 'Achievement Rose', price: 1550, category: 'Graduation', image: grad4 },

    // Mothers Day
    { id: 'md1', name: 'Mom\'s Delight', price: 2000, category: 'Mothers Day', image: mothers1 },
    { id: 'md2', name: 'Queen for a Day', price: 2200, category: 'Mothers Day', image: mothers2 },
    { id: 'md3', name: 'Sweetest Love', price: 1800, category: 'Mothers Day', image: mothers3 },
    { id: 'md4', name: 'Elegant Mom', price: 2500, category: 'Mothers Day', image: mothers4 },
    { id: 'md5', name: 'Pink Appreciation', price: 1900, category: 'Mothers Day', image: mothers5 },
    { id: 'md6', name: 'Mother\'s Grace', price: 2100, category: 'Mothers Day', image: mothers6 },
    { id: 'md7', name: 'Loving Heart', price: 2300, category: 'Mothers Day', image: mothers7 },
    { id: 'md8', name: 'Purest Love', price: 2400, category: 'Mothers Day', image: mothers8 },
    { id: 'md9', name: 'Forever Mom', price: 2600, category: 'Mothers Day', image: mothers9 },

    // Sympathy
    { id: 'sy1', name: 'Deepest Sympathy', price: 1400, category: 'Sympathy', image: sympathy1 },
    { id: 'sy2', name: 'Comforting Lilies', price: 1600, category: 'Sympathy', image: sympathy2 },
    { id: 'sy3', name: 'Peaceful Rest', price: 1500, category: 'Sympathy', image: sympathy3 },
    { id: 'sy4', name: 'In Loving Memory', price: 1700, category: 'Sympathy', image: sympathy4 },

    // Valentines
    { id: 'v1', name: 'Valentine\'s Passion', price: 2500, category: 'Valentines', image: val1 },
    { id: 'v2', name: 'Romance Red', price: 2800, category: 'Valentines', image: val6 },
    { id: 'v3', name: 'Sweetheart Rose', price: 2200, category: 'Valentines', image: val7 },
    { id: 'v4', name: 'Be Mine', price: 2400, category: 'Valentines', image: val8 },
    { id: 'v5', name: 'Love Struck', price: 2600, category: 'Valentines', image: val9 },
    { id: 'v6', name: 'Cupid\'s Arrow', price: 2300, category: 'Valentines', image: val6 },
    { id: 'v7', name: 'Endless Love', price: 3000, category: 'Valentines', image: val7 },
    { id: 'v8', name: 'My Valentine', price: 2700, category: 'Valentines', image: val8 },
    { id: 'v9', name: 'Forever Yours', price: 2900, category: 'Valentines', image: val9 },
];

const Home = ({ addToCart }) => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const [showWishlistPopup, setShowWishlistPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Error parsing wishlist:', e);
            }
        }

        // Load products from localStorage or initialize with default products
        loadProducts();
    }, []);

    const loadProducts = () => {
        try {
            // Check if products exist in localStorage
            const savedProducts = localStorage.getItem('products');

            if (savedProducts) {
                // Use products from localStorage
                const parsedProducts = JSON.parse(savedProducts);
                setDisplayProducts(parsedProducts);
                console.log(`Loaded ${parsedProducts.length} products from localStorage`);
            } else {
                // Initialize localStorage with default products
                localStorage.setItem('products', JSON.stringify(products));
                setDisplayProducts(products);
                console.log(`Initialized ${products.length} products in localStorage`);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to default products
            setDisplayProducts(products);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.name, product.price, product.image, product.id);
        setShowCartPopup(true);
        setTimeout(() => setShowCartPopup(false), 2000);
    };

    const toggleWishlist = (product, e) => {
        e.preventDefault();
        e.stopPropagation();

        const isInWishlist = wishlist.some(item => item.name === product.name);
        let newWishlist;

        if (isInWishlist) {
            newWishlist = wishlist.filter(item => item.name !== product.name);
            setPopupMessage('Removed from Wishlist');
        } else {
            newWishlist = [...wishlist, {
                id: product.id,
                product_id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            }];
            setPopupMessage('Added to Wishlist');
        }

        setWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));

        setShowWishlistPopup(true);
        setTimeout(() => setShowWishlistPopup(false), 2000);
    };

    const isInWishlist = (productName) => {
        return wishlist.some(item => item.name === productName);
    };
    const filteredProducts = displayProducts
        .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(product => selectedCategory === 'All' || product.category === selectedCategory);

    const categories = [
        'All',
        'Sympathy',
        'Graduation',
        'All Souls Day',
        'Valentines',
        'Get Well Soon',
        'Mothers Day'
    ];

    return (
        <div>
            {/* Wishlist Popup */}
            {showWishlistPopup && (
                <div className="wishlist-popup">
                    <i className={`fas fa-heart me-2`}></i>
                    {popupMessage}
                </div>
            )}

            {/* Cart Popup */}
            {showCartPopup && (
                <div className="cart-popup">
                    <i className="fas fa-cart-plus me-2"></i>
                    Item added to Cart
                </div>
            )}

            <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <Link to="/book-event">
                            <img src={eventImg} className="d-block w-100" alt="Event Flowers" />
                        </Link>
                        <div className="carousel-caption">
                            <h2>Booking for an Event</h2>
                            <p>Booking early helps us craft your perfect floral experience</p>
                            <Link to="/book-event" className="btn btn-hero">Book Now</Link>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <Link to="/customized">
                            <img src={customImg} className="d-block w-100" alt="Custom Flowers" />
                        </Link>
                        <div className="carousel-caption">
                            <h2>Design Your Own Bouquet</h2>
                            <p>Choose your favorite flowers, colors, and ribbons</p>
                            <Link to="/customized" className="btn btn-hero">Start Customizing</Link>
                        </div>
                    </div>
                    <div className="carousel-item">
                        <Link to="/special-order">
                            <img src={specialImg} className="d-block w-100" alt="Special Orders" />
                        </Link>
                        <div className="carousel-caption">
                            <h2>Special Orders</h2>
                            <p>Add chocolates, teddy bears, and personalized gifts</p>
                            <Link to="/special-order" className="btn btn-hero">Start to Craft</Link>
                        </div>
                    </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Search and Categories */}
            <div className="container">
                {/* Search Bar */}
                <div className="search-section">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search for flowers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => setSearchTerm('')}
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="category-nav text-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Products */}
            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5 fw-bold" style={{ color: 'var(--text-dark)' }}>Featured Collections</h2>
                    <div className="row g-4" id="productList">
                        {filteredProducts.map((product, index) => (
                            <div key={index} className="col-md-3 col-sm-6">
                                <div className="product-card">
                                    <Link to={`/product/${product.id}`}>
                                        <div className="product-img-wrapper">
                                            <img src={product.image} alt={product.name} />
                                            <button
                                                className={`wishlist-heart-btn ${isInWishlist(product.name) ? 'active' : ''}`}
                                                onClick={(e) => toggleWishlist(product, e)}
                                                title={isInWishlist(product.name) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                            >
                                                <i className={`${isInWishlist(product.name) ? 'fas' : 'far'} fa-heart`}></i>
                                            </button>
                                        </div>
                                    </Link>
                                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="product-body">
                                            <h5 className="product-title">{product.name}</h5>
                                            <p className="product-price">₱{product.price.toLocaleString()}</p>
                                        </div>
                                    </Link>
                                    <div className="product-body pt-0">
                                        <button
                                            className="btn-add-cart"
                                            onClick={(e) => handleAddToCart(product, e)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
