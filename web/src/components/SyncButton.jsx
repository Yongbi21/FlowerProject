// Sync Button Component for Web App
// Allows users to sync data with mobile app

import { useState } from 'react';
import DataExport from '../utils/dataExport';
import syncService from '../utils/syncService';
import storage from '../utils/storage';

const SyncButton = ({ apiEndpoint }) => {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleManualSync = async () => {
    if (!apiEndpoint) {
      setMessage('API endpoint not configured');
      return;
    }

    setSyncing(true);
    setMessage('Syncing...');
    
    try {
      await syncService.manualSync(storage);
      setMessage('Data synced successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    setSyncing(true);
    try {
      await DataExport.exportToFile('flowerforge-data.json');
      setMessage('Data exported!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Export failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSyncing(true);
    setMessage('Importing...');
    
    try {
      const result = await DataExport.importFromFile(file);
      if (result.success) {
        setMessage('Data imported successfully!');
        // Reload page to reflect changes
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage('Import failed: ' + result.message);
      }
    } catch (error) {
      setMessage('Import failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      {apiEndpoint && (
        <button 
          onClick={handleManualSync} 
          disabled={syncing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: syncing ? 'not-allowed' : 'pointer',
          }}
        >
          {syncing ? 'Syncing...' : 'Sync with Mobile'}
        </button>
      )}
      
      <button 
        onClick={handleExport}
        disabled={syncing}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4e73df',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: syncing ? 'not-allowed' : 'pointer',
        }}
      >
        Export Data
      </button>

      <label style={{
        padding: '8px 16px',
        backgroundColor: '#1cc88a',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'inline-block',
      }}>
        Import Data
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
          disabled={syncing}
        />
      </label>

      {message && (
        <span style={{ 
          padding: '8px 12px',
          backgroundColor: message.includes('success') ? '#d1e7dd' : '#f8d7da',
          color: message.includes('success') ? '#0f5132' : '#721c24',
          borderRadius: '5px',
          fontSize: '14px',
        }}>
          {message}
        </span>
      )}
    </div>
  );
};

export default SyncButton;

