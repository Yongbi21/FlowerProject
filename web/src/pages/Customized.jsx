import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import { FaChevronLeft, FaArrowRotateLeft, FaScroll, FaRibbon, FaSeedling } from 'react-icons/fa6';
import html2canvas from 'html2canvas';
import RequestSuccessModal from '../components/RequestSuccessModal';
import { supabase } from '../config/supabase';
import { stockAPI } from '../config/api'; // Import stockAPI
import '../styles/Customized.css';

const placeholderStemImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodGg9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodGg9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9ImFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiBhbmNob3ItcGVudD0ibWlkZGxlIiB0ZXh0LWFuY2hvcnM9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'; // SVG "No Image" placeholder

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
  const [customBundleSizeInput, setCustomBundleSizeInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const previewRef = useRef(null);

  // New state for dynamic customization data
  const [flowers, setFlowers] = useState([]);
  const [wrappers, setWrappers] = useState([]);
  const [ribbons, setRibbons] = useState([]);
  const [loadingCustomizationData, setLoadingCustomizationData] = useState(true);

  useEffect(() => {
    const fetchCustomizationData = async () => {
      try {
        const response = await stockAPI.getAll();
        const allStockItems = response.data || [];

        const processedFlowers = allStockItems
          .filter(item => item.category === 'Flowers')
          .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
            layerImg: item.layerImg,
            stemImg: item.stemImg,
          }));

        const processedWrappers = allStockItems
          .filter(item => item.category === 'Wrappers')
          .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
            layerImg: item.layerImg,
          }));

        const processedRibbons = allStockItems
          .filter(item => item.category === 'Ribbons')
          .map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            img: item.img,
            layerImg: item.layerImg,
          }));

        setFlowers(processedFlowers);
        setWrappers(processedWrappers);
        setRibbons(processedRibbons);

      } catch (error) {
        console.error('Error fetching customization data:', error.message || error);
        alert('Failed to load customization options. Please try again.');
      } finally {
        setLoadingCustomizationData(false);
      }
    };

    fetchCustomizationData();
  }, []); // Run once on component mount

  const handleBundleSelect = (size) => {
    setSelection((prev) => ({ ...prev, bundleSize: size }));
    setCustomBundleSizeInput(''); // Clear custom input when a predefined bundle is selected
  };

  const handleCustomBundleChange = (e) => {
    const value = e.target.value;
    // Allow empty string for initial input, but then validate as number >= 2
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 2)) {
      setCustomBundleSizeInput(value);
      setSelection((prev) => ({ ...prev, bundleSize: value === '' ? 0 : parseInt(value, 10) }));
    }
  };

  const handleOptionSelect = (type, id) => {
    let item = null;
    if (type === 'flowers') {
      item = flowers.find((entry) => entry.id === id);
    } else if (type === 'wrappers') {
      item = wrappers.find((entry) => entry.id === id);
    } else if (type === 'ribbons') {
      item = ribbons.find((entry) => entry.id === id);
    }
    
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
      // Get current user info from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        alert('You need to be logged in to submit a customized bouquet request.');
        return;
      }

      // Capture screenshot of the preview
      let photoBase64 = null;
      if (previewRef.current) {
        try {
          const canvas = await html2canvas(previewRef.current, {
            backgroundColor: null, // Allow transparent background
            scale: 1,
            logging: false,
            useCORS: true, // Enable cross-origin image support
          });
          photoBase64 = canvas.toDataURL('image/png');
        } catch (canvasError) {
          console.error('Error capturing screenshot:', canvasError);
          // Continue without photo if screenshot fails
        }
      }

      // Function to upload image to Supabase Storage
      const uploadImageToSupabase = async (base64, userId) => {
        if (!base64) return null;

        const fileName = `customized-bouquets/${userId}-${Date.now()}.png`;
        const base64WithoutPrefix = base64.split(',')[1];
        const imageBuffer = Uint8Array.from(atob(base64WithoutPrefix), (c) => c.charCodeAt(0));

        const { data, error } = await supabase.storage
          .from('request-images') // Ensure this bucket exists in your Supabase project
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (error) {
          console.error('Error uploading image to Supabase:', error);
          return null;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('request-images')
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      };

      // Upload the photo to Supabase Storage
      const photoUrl = await uploadImageToSupabase(photoBase64, userId);

      // Create a unique request number
      const requestNumber = `CUS-${Date.now()}`;
      
      // Prepare data for Supabase requests table
      const requestData = {
        user_id: userId,
        request_number: requestNumber,
        type: 'customized',
        status: 'pending', // Initial status
        data: {
          flower: selection.flower,
          bundleSize: selection.bundleSize,
          wrapper: selection.wrapper,
          ribbon: selection.ribbon,
        },
        image_url: photoUrl,
        final_price: totalPrice,
      };

      const { data: insertedRequest, error: requestError } = await supabase
        .from('requests')
        .insert([requestData])
        .select();

      if (requestError) {
        console.error('Error inserting request:', requestError);
        alert('Error submitting request. Please try again.');
        return;
      }

      // Create notification in Supabase
      const notificationData = {
        user_id: userId,
        type: 'request', // Assuming 'request' is a valid type in your notifications table
        title: 'Customized Bouquet Request Submitted!',
        message: `Your customized bouquet (${selection.flower?.name || 'bouquet'}, ${selection.bundleSize} stems) has been submitted and is pending approval. Request Number: ${requestNumber}. You can view it in My Orders.`,
        link: '/my-orders',
        is_read: false,
      };

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (notificationError) {
        console.error('Error inserting notification:', notificationError);
        // Do not block submission if notification fails
      }

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

  const renderOptions = (groupKey, selectedId) => {
    let options = [];
    if (groupKey === 'flowers') {
      options = flowers;
    } else if (groupKey === 'wrappers') {
      options = wrappers;
    } else if (groupKey === 'ribbons') {
      options = ribbons;
    }

    if (loadingCustomizationData) {
      return <div className="loading-indicator">Loading options...</div>;
    }
    if (options.length === 0) {
      return <div className="no-options">No {groupKey} available.</div>;
    }

    return (
      <div className="grid-options" id={`${groupKey}Options`}>
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`option-card ${selectedId === item.id ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(groupKey, item.id)}
          >
            <img src={item.img || placeholderImg} alt={item.name} className="option-img" />
            <div className="option-name">{item.name}</div>
            <div className="option-price">+{formatPrice(item.price)}{groupKey === 'flowers' ? '/pc' : ''}</div>
          </button>
        ))}
      </div>
    );
  };

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
                <img src={selection.wrapper.layerImg || placeholderImg} alt="Wrapper" className="layer" style={{ zIndex: 1, top: '50%' }} />
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
                  src={selection.ribbon.layerImg || placeholderImg}
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
                      className={`bundle-pill ${selection.bundleSize === size && customBundleSizeInput === '' ? 'active' : ''}`}
                      onClick={() => handleBundleSelect(size)}
                    >
                      {size} Stems
                    </button>
                  ))}
                </div>
              </div>

              {/* New Custom Stems Input */}
              <div className="control-group">
                <label>Custom Stems</label>
                <div className="custom-bundle-input-card">
                  <input
                    type="number"
                    min="2"
                    step="1"
                    value={customBundleSizeInput}
                    onChange={handleCustomBundleChange}
                    placeholder="e.g. 2"
                    className="custom-stem-input"
                  />

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
