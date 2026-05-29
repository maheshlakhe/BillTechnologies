import { api } from './api';

export const qrMenuService = {
  // Table Setup
  getTables: async () => {
    const response = await api.get('/qr-menu/tables');
    return response.data;
  },

  createTable: async (name: string, section?: string, capacity?: number) => {
    const response = await api.post('/qr-menu/tables', { name, section, capacity });
    return response.data;
  },

  bulkCreateTables: async (payload: {
    totalTables: number;
    prefix?: string;
    startNumber?: number;
    section?: string;
    capacity?: number;
  }) => {
    const response = await api.post('/qr-menu/tables/bulk', payload);
    return response.data;
  },

  updateTable: async (id: string, name: string, section?: string, capacity?: number) => {
    const response = await api.put(`/qr-menu/tables/${id}`, { name, section, capacity });
    return response.data;
  },

  patchTableStatus: async (id: string, payload: { status?: string; isActive?: boolean }) => {
    const response = await api.patch(`/qr-menu/tables/${id}/status`, payload);
    return response.data;
  },

  deleteTable: async (id: string) => {
    const response = await api.delete(`/qr-menu/tables/${id}`);
    return response.data;
  },

  // QR Code
  getQrCodes: async () => {
    const response = await api.get('/qr-menu/qr-codes');
    return response.data;
  },

  generateQrCode: async (tableId: string) => {
    const response = await api.post(`/qr-menu/qr-codes/${tableId}/generate`);
    return response.data;
  },

  // Customer Menu (Public — uses direct fetch or axios, does not require auth token)
  getPublicMenu: async (restaurantId: string, token: string) => {
    const response = await api.get(`/qr-menu/public/menu/${restaurantId}/${token}`);
    return response.data;
  },

  createPublicSession: async (payload: {
    tableId: string;
    customerName?: string;
    customerPhone?: string;
    restaurantId: string;
  }) => {
    const response = await api.post('/qr-menu/public/session', payload);
    return response.data;
  },

  placePublicOrder: async (payload: {
    sessionId?: string;
    tableId: string;
    items: Array<{ productId: string; quantity: number; name: string; notes?: string }>;
    notes?: string;
    restaurantId: string;
  }) => {
    const response = await api.post('/qr-menu/public/orders', payload);
    return response.data;
  },

  getPublicOrders: async (sessionId: string) => {
    const response = await api.get(`/qr-menu/public/orders/${sessionId}`);
    return response.data;
  },

  callWaiter: async (payload: { tableId: string; sessionId?: string; restaurantId: string }) => {
    const response = await api.post('/qr-menu/public/call-waiter', payload);
    return response.data;
  },

  requestBill: async (payload: { tableId: string; sessionId?: string; restaurantId: string }) => {
    const response = await api.post('/qr-menu/public/request-bill', payload);
    return response.data;
  },

  submitFeedback: async (payload: {
    tableId: string;
    rating: number;
    remarks?: string;
    restaurantId: string;
  }) => {
    const response = await api.post('/qr-menu/public/feedback', payload);
    return response.data;
  },

  // Admin Live Dashboard
  getDashboard: async () => {
    const response = await api.get('/qr-menu/dashboard');
    return response.data;
  },

  getOrders: async (filters?: { status?: string; tableId?: string; history?: boolean }) => {
    const response = await api.get('/qr-menu/orders', { params: filters });
    return response.data;
  },

  // Kitchen Panel
  getKitchenQueue: async () => {
    const response = await api.get('/qr-menu/kitchen/queue');
    return response.data;
  },

  acceptKitchenOrder: async (orderId: string) => {
    const response = await api.patch(`/qr-menu/kitchen/${orderId}/accept`);
    return response.data;
  },

  markOrderPreparing: async (orderId: string, estimatedTime?: number) => {
    const response = await api.patch(`/qr-menu/kitchen/${orderId}/preparing`, { estimatedTime });
    return response.data;
  },

  markOrderReady: async (orderId: string) => {
    const response = await api.patch(`/qr-menu/kitchen/${orderId}/ready`);
    return response.data;
  },

  // Waiter Panel
  getWaiterTables: async () => {
    const response = await api.get('/qr-menu/waiter/tables');
    return response.data;
  },

  getWaiterActions: async () => {
    const response = await api.get('/qr-menu/waiter/actions');
    return response.data;
  },

  resolveWaiterAction: async (actionId: string) => {
    const response = await api.patch(`/qr-menu/waiter/actions/${actionId}/resolve`);
    return response.data;
  },

  markOrderServed: async (orderId: string) => {
    const response = await api.patch(`/qr-menu/waiter/${orderId}/served`);
    return response.data;
  },

  transferTable: async (tableId: string, targetTableId: string) => {
    const response = await api.post(`/qr-menu/waiter/${tableId}/transfer`, { targetTableId });
    return response.data;
  },

  waiterAddItems: async (tableId: string, payload: {
    items: Array<{ productId: string; quantity: number; name: string; notes?: string }>;
    notes?: string;
  }) => {
    const response = await api.post(`/qr-menu/waiter/${tableId}/add-items`, payload);
    return response.data;
  },

  // Billing Integration
  settleOrder: async (orderId: string, paymentMode?: string) => {
    const response = await api.post(`/qr-menu/orders/${orderId}/settle`, { paymentMode });
    return response.data;
  },

  mergeSettleOrders: async (tableId: string, paymentMode?: string) => {
    const response = await api.post(`/qr-menu/orders/${tableId}/merge`, { paymentMode });
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/qr-menu/analytics');
    return response.data;
  }
};
