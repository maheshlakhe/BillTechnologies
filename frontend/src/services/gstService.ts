import { api } from '../infrastructure/api';

export const getGstr1Json = async (month: number, year: number) => {
  const response = await api.get(`/gst/gstr1?month=${month}&year=${year}`);
  return response.data;
};

export const getGstr2Json = async (month: number, year: number) => {
  const response = await api.get(`/gst/gstr2?month=${month}&year=${year}`);
  return response.data;
};

export const getGstConstants = async () => {
    const response = await api.get('/gst/constants');
    return response.data;
};

export const searchHsn = async (query: string) => {
    const response = await api.get(`/gst/hsn?q=${query}`);
    return response.data;
};
