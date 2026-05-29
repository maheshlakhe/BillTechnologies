import axios from 'axios';
import { API_URL } from '../config/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
};

export const superAdminService = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/super-admin/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getAllBills: async (page = 1, limit = 50, search = '') => {
        const response = await axios.get(`${API_URL}/super-admin/bills`, {
            params: { page, limit, search },
            headers: getAuthHeader()
        });
        return response.data;
    },

    getOrganizations: async () => {
        const response = await axios.get(`${API_URL}/super-admin/organizations`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getLeads: async (search = '') => {
        const response = await axios.get(`${API_URL}/super-admin/leads`, {
            params: { search },
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateLeadStatus: async (id: string, status: string) => {
        const response = await axios.patch(`${API_URL}/super-admin/leads/${id}`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getDemoRequests: async (search = '') => {
        const response = await axios.get(`${API_URL}/super-admin/demo-requests`, {
            params: { search },
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateDemoStatus: async (id: string, status: string) => {
        const response = await axios.patch(`${API_URL}/super-admin/demo-requests/${id}`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateOrganizationStatus: async (id: string, isActive: boolean) => {
        const response = await axios.patch(`${API_URL}/super-admin/organizations/${id}/status`, { isActive }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    verifyOrganization: async (id: string, isVerified: boolean) => {
        const response = await axios.patch(`${API_URL}/super-admin/organizations/${id}/verify`, { isVerified }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    resetOrganizationPassword: async (id: string, password: string) => {
        const response = await axios.post(`${API_URL}/super-admin/organizations/${id}/reset-password`, { password }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getBackupLogs: async () => {
        const response = await axios.get(`${API_URL}/admin/backups`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    triggerBackup: async () => {
        const response = await axios.post(`${API_URL}/admin/backups/trigger`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    resendVerification: async (id: string) => {
        const response = await axios.post(`${API_URL}/auth/resend-verification/${id}`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
