// Admin Sync Status Component - React Web App
// Shows sync status and listens for updates from React Native admin

import { useState, useEffect } from 'react';
import webSyncListener from '../utils/webSyncListener';

const AdminSyncStatus = ({ apiEndpoint }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [status, setStatus] = useState('Not connected');
  const [syncMethod, setSyncMethod] = useState('none');

  useEffect(() => {
    // Check if using API or localStorage sync
    const usingAPI = apiEndpoint && !apiEndpoint.includes('your-api.com');
    
    if (usingAPI) {
      // API sync
      webSyncListener.init(apiEndpoint, 5000);
      webSyncListener.startListening();
      setIsListening(true);
      setSyncMethod('api');
      setStatus('Listening for updates via API...');

      const unsubscribe = webSyncListener.onUpdate((updates) => {
        setLastUpdate(new Date().toLocaleTimeString());
        setUpdateCount(prev => prev + 1);
        setStatus('Update received from admin');
        
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Admin Update', {
              body: 'Data updated from mobile admin app',
              icon: '/favicon.ico',
            });
          }
        }
      });

      return () => {
        webSyncListener.stopListening();
        unsubscribe();
      };
    } else {
      // LocalStorage sync
      setIsListening(true);
      setSyncMethod('local');
      setStatus('Listening for updates via localStorage...');

      const handleUpdate = (event) => {
        if (event.detail) {
          setLastUpdate(new Date().toLocaleTimeString());
          setUpdateCount(prev => prev + 1);
          setStatus('Update received from admin (local)');
        }
      };

      window.addEventListener('adminDataUpdated', handleUpdate);

      return () => {
        window.removeEventListener('adminDataUpdated', handleUpdate);
      };
    }
  }, [apiEndpoint]);

  const handleManualPull = async () => {
    setStatus('Checking for updates...');
    try {
      if (syncMethod === 'api') {
        await webSyncListener.pullFromAdmin();
        setStatus('Update check complete');
      } else {
        // For localStorage sync, just trigger a check
        window.dispatchEvent(new Event('storage'));
        setStatus('Local storage check complete');
      }
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      backgroundColor: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e3e6f0',
      zIndex: 1000,
      minWidth: '250px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#1cc88a' : '#dc3545',
        }} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
          Admin Sync
        </span>
      </div>
      
      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
        {status}
      </div>

      {lastUpdate && (
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
          Last update: {lastUpdate} ({updateCount} total)
        </div>
      )}

      <button
        onClick={handleManualPull}
        style={{
          width: '100%',
          padding: '6px 12px',
          backgroundColor: '#ec4899',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        Check for Updates
      </button>
    </div>
  );
};

export default AdminSyncStatus;

