import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export interface IndustryDropdownOption {
  id: string;
  label: string;
  value: string;
}

export interface IndustryDropdownGroup {
  id: string;
  name: string;
  slug: string;
  options: IndustryDropdownOption[];
}

export interface IndustryField {
  id: string;
  name: string;
  label: string;
  dataType: string;
  required: boolean;
  order: number;
  placeholder?: string;
  defaultValue?: string;
  groupId?: string;
  group?: IndustryDropdownGroup;
  options?: string; // Keep for legacy if needed, though we should transition
}


export const useIndustryFields = (entity: string, industryId?: string) => {
  const [fields, setFields] = useState<IndustryField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const url = industryId 
        ? `${API_URL}/industries/${industryId}/fields/${entity}`
        : `${API_URL}/industries/my-fields/${entity}`;

      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (res.data.success) {
        setFields(res.data.fields || []);
      }
      setError(null);
    } catch (err: any) {
      console.error('[useIndustryFields] Fetch failed:', err);
      setError(err.response?.data?.error || 'Failed to fetch industry fields');
    } finally {
      setLoading(false);
    }
  }, [entity, industryId]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return {
    fields,
    loading,
    error,
    refreshFields: fetchFields
  };
};
