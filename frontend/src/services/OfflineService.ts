import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDBSchema extends DBSchema {
  materials: {
    key: string;
    value: {
      id: string;
      title: string;
      content: any;
      file_type: string;
      created_at: string;
      updated_at: string;
      synced: boolean;
      offline_created: boolean;
    };
  };
  folders: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      parent_folder_id?: string;
      created_at: string;
      synced: boolean;
      offline_created: boolean;
    };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'create' | 'update' | 'delete';
      table: 'materials' | 'folders';
      data: any;
      timestamp: number;
      retries: number;
    };
  };
  user_preferences: {
    key: string;
    value: {
      key: string;
      value: any;
      timestamp: number;
    };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      ttl: number;
    };
  };
}

class OfflineService {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  async init(): Promise<void> {
    try {
      this.db = await openDB<OfflineDBSchema>('eduai-offline', 1, {
        upgrade(db) {
          // Materials store
          if (!db.objectStoreNames.contains('materials')) {
            const materialsStore = db.createObjectStore('materials', { keyPath: 'id' });
            (materialsStore as any).createIndex('file_type', 'file_type');
            (materialsStore as any).createIndex('synced', 'synced');
            (materialsStore as any).createIndex('created_at', 'created_at');
          }

          // Folders store
          if (!db.objectStoreNames.contains('folders')) {
            const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
            (foldersStore as any).createIndex('parent_folder_id', 'parent_folder_id');
            (foldersStore as any).createIndex('synced', 'synced');
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('sync_queue')) {
            const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
            (syncStore as any).createIndex('timestamp', 'timestamp');
            (syncStore as any).createIndex('table', 'table');
          }

          // User preferences store
          if (!db.objectStoreNames.contains('user_preferences')) {
            db.createObjectStore('user_preferences', { keyPath: 'key' });
          }

          // Cache store
          if (!db.objectStoreNames.contains('cache')) {
            const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
            (cacheStore as any).createIndex('timestamp', 'timestamp');
          }
        },
      });

      // Listen for online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Initial sync if online
      if (this.isOnline) {
        this.syncWhenOnline();
      }

      console.log('OfflineService initialized');
    } catch (error) {
      console.error('Failed to initialize OfflineService:', error);
    }
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.emit('online');
    this.syncWhenOnline();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.emit('offline');
  }

  // Material operations
  async saveMaterial(material: any, isOfflineCreated: boolean = false): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const materialData = {
      ...material,
      updated_at: new Date().toISOString(),
      synced: this.isOnline && !isOfflineCreated,
      offline_created: isOfflineCreated
    };

    await this.db.put('materials', materialData);

    if (!this.isOnline || isOfflineCreated) {
      await this.addToSyncQueue('materials', 'create', materialData);
    }

    this.emit('material_saved', materialData);
  }

  async getMaterial(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('materials', id) || null;
  }

  async getAllMaterials(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('materials');
  }

  async getMaterialsByType(fileType: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await (this.db as any).getAllFromIndex('materials', 'file_type', fileType);
  }

  async updateMaterial(id: string, updates: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get('materials', id);
    if (!existing) throw new Error('Material not found');

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
      synced: false
    };

    await this.db.put('materials', updated);

    if (!this.isOnline) {
      await this.addToSyncQueue('materials', 'update', updated);
    }

    this.emit('material_updated', updated);
  }

  async deleteMaterial(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get('materials', id);
    if (!existing) return;

    await this.db.delete('materials', id);

    if (!this.isOnline && !existing.offline_created) {
      await this.addToSyncQueue('materials', 'delete', { id });
    }

    this.emit('material_deleted', { id });
  }

  // Folder operations
  async saveFolder(folder: any, isOfflineCreated: boolean = false): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const folderData = {
      ...folder,
      created_at: folder.created_at || new Date().toISOString(),
      synced: this.isOnline && !isOfflineCreated,
      offline_created: isOfflineCreated
    };

    await this.db.put('folders', folderData);

    if (!this.isOnline || isOfflineCreated) {
      await this.addToSyncQueue('folders', 'create', folderData);
    }

    this.emit('folder_saved', folderData);
  }

  async getFolder(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('folders', id) || null;
  }

  async getAllFolders(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('folders');
  }

  async deleteFolder(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.db.get('folders', id);
    if (!existing) return;

    await this.db.delete('folders', id);

    if (!this.isOnline && !existing.offline_created) {
      await this.addToSyncQueue('folders', 'delete', { id });
    }

    this.emit('folder_deleted', { id });
  }

  // Search functionality
  async searchMaterials(query: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const allMaterials = await this.db.getAll('materials');
    const lowerQuery = query.toLowerCase();

    return allMaterials.filter(material => 
      material.title.toLowerCase().includes(lowerQuery) ||
      (material.content && JSON.stringify(material.content).toLowerCase().includes(lowerQuery))
    );
  }

  // Cache management
  async setCache(key: string, data: any, ttl: number = 3600000): Promise<void> { // 1 hour default TTL
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getCache(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const cached = await this.db.get('cache', key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      await this.db.delete('cache', key);
      return null;
    }

    return cached.data;
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const allCached = await this.db.getAll('cache');
    const now = Date.now();

    for (const cached of allCached) {
      if (now - cached.timestamp > cached.ttl) {
        await this.db.delete('cache', cached.key);
      }
    }
  }

  // User preferences
  async setPreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('user_preferences', {
      key,
      value,
      timestamp: Date.now()
    });
  }

  async getPreference(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const pref = await this.db.get('user_preferences', key);
    return pref ? pref.value : null;
  }

  // Sync queue management
  private async addToSyncQueue(table: 'materials' | 'folders', action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    if (!this.db) return;

    const queueItem = {
      id: `${table}_${action}_${data.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    await this.db.put('sync_queue', queueItem);
  }

  private async syncWhenOnline(): Promise<void> {
    if (!this.db || this.syncInProgress) return;

    this.syncInProgress = true;
    this.emit('sync_started');

    try {
      const queueItems = await this.db.getAll('sync_queue');
      
      for (const item of queueItems.sort((a, b) => a.timestamp - b.timestamp)) {
        try {
          await this.syncItem(item);
          await this.db.delete('sync_queue', item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          
          // Increment retry count
          item.retries++;
          
          // Remove from queue if too many retries
          if (item.retries > 3) {
            await this.db.delete('sync_queue', item.id);
            this.emit('sync_failed', { item, error });
          } else {
            await this.db.put('sync_queue', item);
          }
        }
      }

      this.emit('sync_completed');
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync_error', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: any): Promise<void> {
    // This would integrate with your existing API client
    // For now, just simulate the sync
    console.log('Syncing item:', item);
    
    // TODO: Implement actual API calls based on item.table and item.action
    // Example:
    // if (item.table === 'materials') {
    //   if (item.action === 'create') {
    //     await apiClient.post('/files', item.data);
    //   } else if (item.action === 'update') {
    //     await apiClient.put(`/files/${item.data.id}`, item.data);
    //   } else if (item.action === 'delete') {
    //     await apiClient.delete(`/files/${item.data.id}`);
    //   }
    // }
  }

  // Statistics and status
  async getOfflineStats(): Promise<{
    totalMaterials: number;
    unsyncedMaterials: number;
    totalFolders: number;
    unsyncedFolders: number;
    queueSize: number;
    cacheSize: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [materials, folders, queue, cache] = await Promise.all([
      this.db.getAll('materials'),
      this.db.getAll('folders'),
      this.db.getAll('sync_queue'),
      this.db.getAll('cache')
    ]);

    return {
      totalMaterials: materials.length,
      unsyncedMaterials: materials.filter(m => !m.synced).length,
      totalFolders: folders.length,
      unsyncedFolders: folders.filter(f => !f.synced).length,
      queueSize: queue.length,
      cacheSize: cache.length
    };
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = ['materials', 'folders', 'sync_queue', 'cache'] as const;
    
    for (const storeName of stores) {
      await this.db.clear(storeName);
    }

    this.emit('data_cleared');
  }

  async exportOfflineData(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const [materials, folders, preferences] = await Promise.all([
      this.db.getAll('materials'),
      this.db.getAll('folders'),
      this.db.getAll('user_preferences')
    ]);

    const exportData = {
      materials,
      folders,
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importOfflineData(data: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const importData = JSON.parse(data);
      
      if (!importData.materials || !importData.folders) {
        throw new Error('Invalid data format');
      }

      // Clear existing data
      await this.db.clear('materials');
      await this.db.clear('folders');
      await this.db.clear('user_preferences');

      // Import materials
      for (const material of importData.materials) {
        await this.db.put('materials', material);
      }

      // Import folders
      for (const folder of importData.folders) {
        await this.db.put('folders', folder);
      }

      // Import preferences
      if (importData.preferences) {
        for (const pref of importData.preferences) {
          await this.db.put('user_preferences', pref);
        }
      }

      this.emit('data_imported');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
export default offlineService;