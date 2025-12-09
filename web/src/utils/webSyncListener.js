// Web Sync Listener - React Web App listens for updates from React Native Admin
// This service receives and applies updates from the React Native admin app

import storage, { StorageHelpers } from './storage';

class WebSyncListener {
  constructor() {
    this.apiEndpoint = null;
    this.listening = false;
    this.pollInterval = null;
    this.lastSyncTimestamp = null;
    this.onUpdateCallbacks = [];
    this.syncKeys = [
      'currentUser',
      'catalogueProducts',
      'orders',
      'requests',
      'stock',
      'notifications',
      'messages',
      'employees',
      'aboutData',
      'contactData',
    ];
  }

  // Initialize listener with API endpoint
  init(apiEndpoint, pollInterval = 5000) {
    this.apiEndpoint = apiEndpoint;
    this.pollInterval = pollInterval;
  }

  // Start listening for updates from React Native admin
  startListening() {
    if (!this.apiEndpoint) {
      console.warn('Web sync listener not initialized');
      return;
    }

    if (this.listening) {
      console.warn('Already listening for updates');
      return;
    }

    this.listening = true;

    // Poll for updates
    this.pollInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, this.pollInterval);

    // Also listen for storage events (cross-tab sync)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
      window.addEventListener('adminUpdate', this.handleAdminUpdate.bind(this));
    }

    // Initial check
    this.checkForUpdates();
  }

  // Stop listening
  stopListening() {
    this.listening = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
      window.removeEventListener('adminUpdate', this.handleAdminUpdate);
    }
  }

  // Check for updates from admin
  async checkForUpdates() {
    if (!this.apiEndpoint) return;

    try {
      const response = await fetch(`${this.apiEndpoint}/admin/pull?since=${this.lastSyncTimestamp || ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 304) {
          // No updates
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updates = await response.json();
      
      if (updates && Object.keys(updates.data || {}).length > 0) {
        await this.applyUpdates(updates.data);
        this.lastSyncTimestamp = updates.timestamp;
        this.notifyCallbacks(updates.data);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  // Apply updates to local storage
  async applyUpdates(updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (this.syncKeys.includes(key)) {
        await StorageHelpers.setJSON(key, value);
        
        // Dispatch custom event for component updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { key, value }
          }));
        }
      }
    }
  }

  // Handle storage events (for cross-tab sync)
  handleStorageEvent(event) {
    if (event.key && this.syncKeys.includes(event.key)) {
      this.notifyCallbacks({ [event.key]: JSON.parse(event.newValue || 'null') });
    }
  }

  // Handle admin update events
  handleAdminUpdate(event) {
    if (event.detail && event.detail.data) {
      this.applyUpdates(event.detail.data);
      this.notifyCallbacks(event.detail.data);
    }
  }

  // Register callback for updates
  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
    return () => {
      this.onUpdateCallbacks = this.onUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  // Notify all callbacks
  notifyCallbacks(updates) {
    this.onUpdateCallbacks.forEach(callback => {
      try {
        callback(updates);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }

  // Manual pull from admin
  async pullFromAdmin() {
    return await this.checkForUpdates();
  }
}

// Export singleton instance
export const webSyncListener = new WebSyncListener();
export default webSyncListener;

