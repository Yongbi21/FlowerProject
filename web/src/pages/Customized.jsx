import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import { FaChevronLeft, FaArrowRotateLeft, FaScroll, FaRibbon, FaSeedling } from 'react-icons/fa6';
import html2canvas from 'html2canvas';
import RequestSuccessModal from '../components/RequestSuccessModal';
import '../styles/Customized.css';
import darkBlueWrapperImg from '../assets/pictures/darkbluewrapper.png';
import blueWrapperImg from '../assets/pictures/bluewrapper.png';
import greenWrapperImg from '../assets/pictures/greenwrapper.png';
import pinkWrapperImg from '../assets/pictures/pinkwrapper.png';
import redWrapperImg from '../assets/pictures/redwrapper.png';
import violetWrapperImg from '../assets/pictures/violetwrapper.png';
import blackWrapperImg from '../assets/pictures/blackwrapper.png';
import blackRibbonImg from '../assets/pictures/black-ribbon.png';
import blueRibbonImg from '../assets/pictures/blue-ribbon.png';
import goldRibbonImg from '../assets/pictures/gold-ribbon.png';
import peachRibbonImg from '../assets/pictures/peach-ribbon.png';
import pinkRibbonImg from '../assets/pictures/pink-ribbon.png';
import redRibbonImg from '../assets/pictures/red-ribbon.png';
import violetRibbonImg from '../assets/pictures/violet-ribbon.png';
import whiteRibbonImg from '../assets/pictures/white-ribbon.png';
import whiteRoseCustomizedImg from "../assets/pictures/white-rose-customized.png";
import redRoseCustomizedImg from "../assets/pictures/red-rose-customized.png";
import pinkRoseCustomizedImg from "../assets/pictures/pink-rose-customized.png";
import chrysanthemumImg from "../assets/pictures/Chrysanthemum.png";

const placeholderStemImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const customizationData = {
  flowers: [
    {
      id: 'f1',
      name: 'White Rose Luxe',
      price: 180,
      img: whiteRoseCustomizedImg,
      layerImg: whiteRoseCustomizedImg,
      stemImg: whiteRoseCustomizedImg
    },
    {
      id: 'f2',
      name: 'Red Rose Couture',
      price: 185,
      img: redRoseCustomizedImg,
      layerImg: redRoseCustomizedImg,
      stemImg: redRoseCustomizedImg
    },
    {
      id: 'f3',
      name: 'Pink Rose Custom',
      price: 175,
      img: pinkRoseCustomizedImg,
      layerImg: pinkRoseCustomizedImg,
      stemImg: pinkRoseCustomizedImg
    },
    {
      id: 'f4',
      name: 'Chrysanthemum',
      price: 165,
      img: chrysanthemumImg,
      layerImg: chrysanthemumImg,
      stemImg: chrysanthemumImg
    }
  ],
  wrappers: [
    { id: 'w1', name: 'Dark Blue Wrap', price: 80, img: darkBlueWrapperImg, layerImg: darkBlueWrapperImg },
    { id: 'w2', name: 'Blue Satin', price: 85, img: blueWrapperImg, layerImg: blueWrapperImg },
    { id: 'w3', name: 'Green Meadow', price: 85, img: greenWrapperImg, layerImg: greenWrapperImg },
    { id: 'w4', name: 'Pink Bloom', price: 90, img: pinkWrapperImg, layerImg: pinkWrapperImg },
    { id: 'w5', name: 'Red Royale', price: 95, img: redWrapperImg, layerImg: redWrapperImg },
    { id: 'w6', name: 'Violet Whisper', price: 95, img: violetWrapperImg, layerImg: violetWrapperImg },
    { id: 'w7', name: 'Midnight Black', price: 100, img: blackWrapperImg, layerImg: blackWrapperImg }
  ],
  ribbons: [
    { id: 'r1', name: 'Midnight Black', price: 35, img: blackRibbonImg, layerImg: blackRibbonImg },
    { id: 'r2', name: 'Cobalt Blue', price: 35, img: blueRibbonImg, layerImg: blueRibbonImg },
    { id: 'r3', name: 'Golden Glow', price: 40, img: goldRibbonImg, layerImg: goldRibbonImg },
    { id: 'r4', name: 'Crimson Silk', price: 35, img: redRibbonImg, layerImg: redRibbonImg },
    { id: 'r5', name: 'Blush Pink', price: 35, img: pinkRibbonImg, layerImg: pinkRibbonImg },
    { id: 'r6', name: 'Peach Sorbet', price: 35, img: peachRibbonImg, layerImg: peachRibbonImg },
    { id: 'r7', name: 'Violet Shine', price: 38, img: violetRibbonImg, layerImg: violetRibbonImg },
    { id: 'r8', name: 'Classic White', price: 30, img: whiteRibbonImg, layerImg: whiteRibbonImg }
  ]
};

const bundleOptions = [3, 6, 12];
const steps = [
  { id: 1, icon: <FaScroll />, label: 'Wrapper' },
  { id: 2, icon: <FaRibbon />, label: 'Ribbon' },
  { id: 3, icon: <FaSeedling />, label: 'Flowers' }
];

const getInitialPositions = (count) => {
  const positions = [];
  // Positions are now relative to the flower-zone container
  if (count === 3) {
    positions.push({ x: 40, y: 20, rotate: -15, zIndex: 1 });
    positions.push({ x: 80, y: 10, rotate: 0, zIndex: 2 });
    positions.push({ x: 120, y: 20, rotate: 15, zIndex: 1 });
  } else if (count === 6) {
    positions.push({ x: 30, y: 30, rotate: -20, zIndex: 1 });
    positions.push({ x: 70, y: 20, rotate: -5, zIndex: 2 });
    positions.push({ x: 110, y: 30, rotate: 10, zIndex: 1 });
    positions.push({ x: 50, y: 50, rotate: -10, zIndex: 3 });
    positions.push({ x: 90, y: 50, rotate: 10, zIndex: 3 });
    positions.push({ x: 70, y: 70, rotate: 0, zIndex: 4 });
  } else if (count === 12) {
    for (let i = 0; i < 12; i += 1) {
      positions.push({
        x: Math.random() * 150,
        y: Math.random() * 100,
        rotate: (Math.random() * 30) - 15,
        zIndex: i
      });
    }
  }
  return positions;
};

const Customized = ({ addToCart }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selection, setSelection] = useState({
    flower: null,
    bundleSize: 0,
    wrapper: null,
    ribbon: null
  });
  const [showModal, setShowModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const previewRef = useRef(null);

  const handleBundleSelect = (size) => {
    setSelection((prev) => ({ ...prev, bundleSize: size }));
  };

  const handleOptionSelect = (type, id) => {
    const item = customizationData[type].find((entry) => entry.id === id);
    if (!item) return;
    setSelection((prev) => {
      const next = { ...prev, [type === 'flowers' ? 'flower' : type === 'wrappers' ? 'wrapper' : 'ribbon']: item };
      if (type === 'flowers' && prev.bundleSize === 0) {
        next.bundleSize = 3;
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelection({ flower: null, bundleSize: 0, wrapper: null, ribbon: null });
    setActiveStep(1);
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    if (selection.flower && selection.bundleSize) {
      total += selection.flower.price * selection.bundleSize;
    }
    if (selection.wrapper) total += selection.wrapper.price;
    if (selection.ribbon) total += selection.ribbon.price;
    return total;
  }, [selection]);

  const handleSubmitRequest = async () => {
    if (!selection.flower || !selection.bundleSize) {
      alert('Please complete your bouquet selection!');
      return;
    }

    try {
      // Capture screenshot of the preview
      let photoBase64 = null;
      if (previewRef.current) {
        try {
          const canvas = await html2canvas(previewRef.current, {
            backgroundColor: null,
            scale: 1,
            logging: false,
          });
          photoBase64 = canvas.toDataURL('image/png');
        } catch (canvasError) {
          console.error('Error capturing screenshot:', canvasError);
          // Continue without photo if screenshot fails
        }
      }

      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Create request object for localStorage
      // This will be displayed in Profile.jsx My Orders section
      const requestId = `customized-${Date.now()}`;
      const newRequest = {
        id: requestId,
        type: 'customized',
        status: 'pending', // Set as pending so it shows in pending tab
        paymentStatus: 'to_pay',
        flower: selection.flower,
        bundleSize: selection.bundleSize,
        wrapper: selection.wrapper,
        ribbon: selection.ribbon,
        photo: photoBase64,
        price: totalPrice,
        total: totalPrice, // Also add total for price display
        requestDate: new Date().toISOString(),
        date: new Date().toISOString(), // Add date field for sorting
        // Store full data structure for compatibility
        data: {
          flower: {
            name: selection.flower.name,
            id: selection.flower.id
          },
          bundleSize: selection.bundleSize,
          wrapper: selection.wrapper,
          ribbon: selection.ribbon,
          price: totalPrice
        }
      };

      // Save to localStorage requests array
      const requests = JSON.parse(localStorage.getItem('requests') || '[]');
      requests.push(newRequest);
      localStorage.setItem('requests', JSON.stringify(requests));

      // Create notification
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const newNotification = {
        id: `notif-${Date.now()}`,
        type: 'request',
        title: 'Customized Bouquet Request Submitted!',
        message: `Your customized bouquet (${selection.flower?.name || 'bouquet'}, ${selection.bundleSize} stems) has been submitted and is pending approval. You can view it in My Orders.`,
        icon: 'fa-seedling',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/my-orders'
      };
      localStorage.setItem('notifications', JSON.stringify([newNotification, ...notifications]));

      setCapturedPhoto(photoBase64);
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  const stemImage = selection.flower?.stemImg || selection.flower?.layerImg || placeholderStemImg;
  const stemSlots = selection.flower && selection.bundleSize ? getInitialPositions(selection.bundleSize) : [];
  const stemRefs = useMemo(
    () => Array.from({ length: stemSlots.length }, () => React.createRef()),
    [stemSlots.length]
  );
  const isEmpty = !selection.flower || !selection.bundleSize;

  const formatPrice = (value) => `₱${value.toLocaleString('en-PH')}`;

  const renderOptions = (groupKey, selectedId) => (
    <div className="grid-options" id={`${groupKey}Options`}>
      {customizationData[groupKey].map((item) => (
        <button
          key={item.id}
          type="button"
          className={`option-card ${selectedId === item.id ? 'selected' : ''}`}
          onClick={() => handleOptionSelect(groupKey, item.id)}
        >
          <img src={item.img} alt={item.name} className="option-img" />
          <div className="option-name">{item.name}</div>
          <div className="option-price">+{formatPrice(item.price)}{groupKey === 'flowers' ? '/pc' : ''}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="customize-page">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="back-link">
            <FaChevronLeft /> Back
          </Link>
          <span className="divider" />
          <h3>Customizer Studio</h3>
        </div>
        <div className="header-right">
          <button type="button" className="back-link border-0 bg-transparent" onClick={handleReset}>
            <FaArrowRotateLeft /> Reset
          </button>
          <div className="price-display">
            <span className="label">Total</span>
            <span className="amount">{formatPrice(totalPrice)}</span>
          </div>
          <button type="button" className="btn-action" onClick={handleSubmitRequest}>Submit a Request</button>
        </div>
      </header>

      <RequestSuccessModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setCapturedPhoto(null);
        }}
        message="Your customized bouquet request has been added to My Orders! You can view it in your Profile page under the Pending tab. The admin will review and respond soon."
        photo={capturedPhoto}
      />

      <main className="editor-layout">
        <section className="preview-canvas">
          <div className="canvas-container">
            <div className="bouquet-stage" ref={previewRef}>
              {selection.wrapper && (
                <img src={selection.wrapper.layerImg} alt="Wrapper" className="layer" style={{ zIndex: 1, top: '50%' }} />
              )}

              {/* Flower Zone - Constrained Area */}
              <div
                className="flower-zone"
                style={{
                  position: 'absolute',
                  top: '0%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '320px',
                  height: '250px',
                  zIndex: 2,
                  touchAction: 'none'
                }}
              >
                {stemSlots.map((slot, index) => (
                  <Draggable
                    key={`stem-${index}`}
                    bounds="parent"
                    defaultPosition={{ x: slot.x, y: slot.y }}
                    nodeRef={stemRefs[index]}
                    handle=".drag-handle"
                  >
                    <div
                      ref={stemRefs[index]}
                      className="drag-handle"
                      style={{
                        position: 'absolute',
                        zIndex: slot.zIndex,
                        cursor: 'grab',
                        width: '100px',
                        height: '100px',
                        touchAction: 'none'
                      }}
                    >
                      <div style={{ transform: `rotate(${slot.rotate}deg)`, width: '100%', height: '100%' }}>
                        <img src={stemImage} alt="Selected stem" className="stem-slot" draggable="false" />
                      </div>
                    </div>
                  </Draggable>
                ))}
              </div>

              {selection.ribbon && (
                <img
                  src={selection.ribbon.layerImg}
                  alt="Ribbon"
                  className="layer"
                  style={{ zIndex: 3, top: '65%' }}
                />
              )}

              {isEmpty && (
                <div className="empty-state">
                  <FaSeedling size={48} />
                  <p>Select a flower to start</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="tools-interface">
          <nav className="vertical-toolbar">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`tool-btn ${activeStep === step.id ? 'active' : ''}`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="icon-wrapper">{step.icon}</div>
                <span>{step.label}</span>
              </button>
            ))}
          </nav>

          <div className="options-panel">
            <div className={`panel-content ${activeStep === 1 ? 'active' : ''}`} id="step1">
              <div className="panel-header">
                <h4>Select Wrapper</h4>
                <p>Wrap it with style</p>
              </div>
              <div className="control-group">
                <label>Wrapper Style</label>
                {renderOptions('wrappers', selection.wrapper?.id || null)}
              </div>
            </div>

            <div className={`panel-content ${activeStep === 2 ? 'active' : ''}`} id="step2">
              <div className="panel-header">
                <h4>Pick Ribbon</h4>
                <p>Add the finishing touch</p>
              </div>
              <div className="control-group">
                <label>Ribbon Color</label>
                {renderOptions('ribbons', selection.ribbon?.id || null)}
              </div>
            </div>

            <div className={`panel-content ${activeStep === 3 ? 'active' : ''}`} id="step3">
              <div className="panel-header">
                <h4>Choose Flowers</h4>
                <p>Select your base blooms</p>
              </div>

              <div className="control-group">
                <label>Bundle Size</label>
                <div className="bundle-selector-group">
                  {bundleOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`bundle-pill ${selection.bundleSize === size ? 'active' : ''}`}
                      onClick={() => handleBundleSelect(size)}
                    >
                      {size} Stems
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>Flower Type</label>
                {renderOptions('flowers', selection.flower?.id || null)}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Customized;
