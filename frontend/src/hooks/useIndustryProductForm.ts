import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface FormFieldConfig {
  name: string;
  label: string;
  dataType: string;
  required?: boolean;
  options?: string[];
}

export interface FormSectionConfig {
  id: string;
  title: string;
  fields: FormFieldConfig[];
}

export interface FormStructureConfig {
  sections: FormSectionConfig[];
}

export const useIndustryProductForm = (industryId?: string) => {
  const [formStructure, setFormStructure] = useState<FormStructureConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormStructure = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const url = industryId 
        ? `${API_URL}/industries/${industryId}/product-form`
        : `${API_URL}/industries/my-product-form`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (res.data.success) {
        setFormStructure(res.data.formStructure);
      }
      setError(null);
    } catch (err: any) {
      console.error('[useIndustryProductForm] Fetch failed:', err);
      setError(err.response?.data?.error || 'Failed to fetch form structure');
    } finally {
      setLoading(false);
    }
  }, [industryId]);

  useEffect(() => {
    fetchFormStructure();
  }, [fetchFormStructure]);

  return {
    formStructure,
    loading,
    error,
    refreshFormStructure: fetchFormStructure
  };
};
