// LocalStorage Sync - For syncing between React Native and Web without backend
// This works when both apps can access the same localStorage (same domain/development)

class LocalStorageSync {
  constructor() {
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
    this.checkInterval = null;
  }

  // Check for updates from React Native (reads from localStorage)
  checkForUpdates() {
    try {
      // Check if there's pending sync data
      const pendingSync = localStorage.getItem('_admin_sync_pending');
      if (pendingSync) {
        const syncData = JSON.parse(pendingSync);
        this.applyUpdates(syncData.data);
        
        // Clear the pending sync
        localStorage.removeItem('_admin_sync_pending');
        
        // Dispatch event for components to update
        window.dispatchEvent(new CustomEvent('adminDataUpdated', {
          detail: syncData.data
        }));
        
        return syncData.data;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
    return null;
  }

  // Apply updates to localStorage
  applyUpdates(updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (this.syncKeys.includes(key)) {
        localStorage.setItem(key, JSON.stringify(value));
        
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(value),
          oldValue: localStorage.getItem(key),
        }));
      }
    }
  }

  // Start listening for updates
  startListening(interval = 2000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkForUpdates();

    // Then check on interval
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, interval);
  }

  // Stop listening
  stopListening() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const localStorageSync = new LocalStorageSync();
export default localStorageSync;

