// Sync Service to sync data between Web and React Native apps
// This can be used to sync via API, WebSocket, or other methods

class SyncService {
  constructor() {
    this.syncEnabled = false;
    this.syncInterval = null;
    this.apiEndpoint = null;
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

  // Initialize sync service with API endpoint
  init(apiEndpoint, syncInterval = 30000) {
    this.apiEndpoint = apiEndpoint;
    this.syncInterval = syncInterval;
    this.syncEnabled = true;
  }

  // Sync data to server
  async syncToServer(data) {
    if (!this.apiEndpoint || !this.syncEnabled) {
      return;
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing to server:', error);
    }
  }

  // Sync data from server
  async syncFromServer() {
    if (!this.apiEndpoint || !this.syncEnabled) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing from server:', error);
      return null;
    }
  }

  // Start automatic syncing
  startAutoSync(storage) {
    if (!this.syncEnabled || this.syncInterval === null) {
      return;
    }

    setInterval(async () => {
      const data = {};
      for (const key of this.syncKeys) {
        const value = await storage.getItem(key);
        if (value) {
          data[key] = value;
        }
      }
      await this.syncToServer(data);
    }, this.syncInterval);
  }

  // Manual sync - sync all data
  async manualSync(storage) {
    const data = {};
    for (const key of this.syncKeys) {
      const value = await storage.getItem(key);
      if (value) {
        data[key] = value;
      }
    }
    return await this.syncToServer(data);
  }

  // Apply synced data to local storage
  async applySyncedData(storage, syncedData) {
    for (const [key, value] of Object.entries(syncedData)) {
      if (this.syncKeys.includes(key)) {
        await storage.setItem(key, value);
      }
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;

