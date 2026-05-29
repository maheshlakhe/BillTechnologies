import { StorageProvider } from '../../interfaces/storage';

/**
 * In-memory implementation of StorageProvider
 * Useful for backend services and testing
 */
export class MemoryStorageProvider implements StorageProvider {
  private storage: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const value = this.storage.get(key);
    return value !== undefined ? value : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}
