import { GeneratedImage } from "../types";

const DB_NAME = 'LuminaDB';
const STORE_NAME = 'history';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveToHistory = async (item: Omit<GeneratedImage, 'id' | 'timestamp'>): Promise<GeneratedImage | null> => {
  try {
    const db = await openDB();
    const newItem: GeneratedImage = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(newItem);

      request.onsuccess = () => {
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('historyUpdated'));
        resolve(newItem);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save history:", error);
    return null;
  }
};

export const getHistory = async (): Promise<GeneratedImage[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as GeneratedImage[];
        // Sort descending by timestamp (newest first)
        result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        window.dispatchEvent(new Event('historyUpdated'));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => {
        window.dispatchEvent(new Event('historyUpdated'));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};