import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { getIndustryUiConfig, IndustryUiConfig } from '../utils/industryUiConfig';
import { useAuth } from '../contexts/AuthContext';

export const useIndustryLayout = (industryId?: string) => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<IndustryUiConfig>(() => {
    // Initial sync state using hardcoded config as fallback
    const slug = user?.industry?.slug;
    return getIndustryUiConfig(slug);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLayout = async () => {
      setIsLoading(true);
      setError(null);

      // Determine which slug/industryId to query
      const token = localStorage.getItem('authToken');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const url = industryId 
          ? `${API_URL}/industries/${industryId}/layout`
          : `${API_URL}/industries/my-layout`;

        const response = await axios.get(url, { headers: authHeaders });

        if (response.data.success && response.data.layout) {
          if (isMounted) {
            // Merge API layout ON TOP of hardcoded slug config.
            // This ensures computed flags like isRestaurant, isHospitality, isServiceOriented
            // (which live in industryUiConfig.ts and are NOT stored in the DB) are always
            // correctly set based on the industry slug — even after an API override.
            const slug = user?.industry?.slug;
            const baseConfig = getIndustryUiConfig(slug);
            setLayout({ ...baseConfig, ...response.data.layout });
          }
        }
      } catch (err: any) {
        console.warn('[useIndustryLayout] Failed to load layout from DB, using fallback:', err.message);
        if (isMounted) {
          setError(err.message || 'Failed to load database layout');
          // Update to match current user industry anyway
          const slug = user?.industry?.slug;
          setLayout(getIndustryUiConfig(slug));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLayout();

    return () => {
      isMounted = false;
    };
  }, [industryId, user?.industry?.slug]);

  return { layout, isLoading, error };
};
