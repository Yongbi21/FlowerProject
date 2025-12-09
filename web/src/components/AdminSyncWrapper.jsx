// Admin Sync Wrapper - Wraps the web app to listen for admin updates
import { useEffect } from 'react';
import webSyncListener from '../utils/webSyncListener';
import localStorageSync from '../utils/localStorageSync';
import AdminSyncStatus from './AdminSyncStatus';

const AdminSyncWrapper = ({ children, apiEndpoint }) => {
  useEffect(() => {
    // If API endpoint is configured and not a placeholder, use API sync
    if (apiEndpoint && !apiEndpoint.includes('your-api.com')) {
      // Initialize and start listening for updates from React Native admin via API
      webSyncListener.init(apiEndpoint, 5000);
      webSyncListener.startListening();

      // Listen for updates and refresh data
      const unsubscribe = webSyncListener.onUpdate((updates) => {
        console.log('Admin updates received via API:', updates);
        
        // Dispatch custom event to trigger component updates
        window.dispatchEvent(new CustomEvent('adminDataUpdated', { detail: updates }));
      });

      return () => {
        webSyncListener.stopListening();
        unsubscribe();
      };
    } else {
      // Fallback: Use localStorage sync (for development without backend)
      console.log('Using localStorage sync (no API endpoint configured)');
      localStorageSync.startListening(2000);

      // Listen for localStorage updates
      const handleStorageUpdate = (event) => {
        if (event.detail) {
          console.log('Admin updates received via localStorage:', event.detail);
          window.dispatchEvent(new CustomEvent('adminDataUpdated', { detail: event.detail }));
        }
      };

      window.addEventListener('adminDataUpdated', handleStorageUpdate);

      return () => {
        localStorageSync.stopListening();
        window.removeEventListener('adminDataUpdated', handleStorageUpdate);
      };
    }
  }, [apiEndpoint]);

  return (
    <>
      {children}
      <AdminSyncStatus apiEndpoint={apiEndpoint} />
    </>
  );
};

export default AdminSyncWrapper;

