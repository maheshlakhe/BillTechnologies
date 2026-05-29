import { useState, useCallback, useEffect, useMemo } from 'react';
import { Warehouse } from '../types/warehouse';
import { getWarehouseService } from '../infrastructure/DIContainer';

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const warehouseService = useMemo(() => getWarehouseService(), []);

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getWarehouses();
      setWarehouses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [warehouseService]);

  const createWarehouse = async (data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const newWH = await warehouseService.createWarehouse(data);
      setWarehouses(prev => [...prev, newWH]);
      return newWH;
    } catch (err: any) {
      setError(err.message || 'Failed to create warehouse');
      throw err;
    }
  };

  const updateWarehouse = async (data: Warehouse) => {
    try {
      const updatedWH = await warehouseService.updateWarehouse(data);
      setWarehouses(prev => prev.map(w => w.id === data.id ? updatedWH : w));
      return updatedWH;
    } catch (err: any) {
      setError(err.message || 'Failed to update warehouse');
      throw err;
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      await warehouseService.deleteWarehouse(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete warehouse');
      throw err;
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  return {
    warehouses,
    loading,
    error,
    refresh: loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
  };
};
