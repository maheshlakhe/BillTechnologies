import { Warehouse } from '../types/warehouse';
import { StorageProvider } from '../interfaces/storage';
import { HttpClient } from '../interfaces/http';

export interface IWarehouseService {
  getWarehouses(): Promise<Warehouse[]>;
  getWarehouseById(id: string): Promise<Warehouse | null>;
  createWarehouse(warehouse: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Warehouse>;
  updateWarehouse(warehouse: Warehouse): Promise<Warehouse>;
  deleteWarehouse(id: string): Promise<void>;
}

export class WarehouseService implements IWarehouseService {
  private readonly API_ENDPOINT = 'warehouses';

  constructor(
    private storage: StorageProvider,
    private httpClient: HttpClient
  ) {}

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const response = await this.httpClient.get<any>(this.API_ENDPOINT);
      return response.data.warehouses || response.data;
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      throw new Error('Failed to fetch warehouses');
    }
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const response = await this.httpClient.get<any>(`${this.API_ENDPOINT}/${id}`);
      return response.data.warehouse || response.data;
    } catch (error: any) {
      console.error(`Error fetching warehouse ${id}:`, error);
      return null;
    }
  }

  async createWarehouse(warehouseData: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Warehouse> {
    try {
      const response = await this.httpClient.post<any>(this.API_ENDPOINT, warehouseData);
      return response.data.warehouse || response.data;
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  async updateWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    try {
      const response = await this.httpClient.put<any>(`${this.API_ENDPOINT}/${warehouse.id}`, warehouse);
      return response.data.warehouse || response.data;
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  async deleteWarehouse(id: string): Promise<void> {
    try {
      await this.httpClient.delete(`${this.API_ENDPOINT}/${id}`);
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  }
}
