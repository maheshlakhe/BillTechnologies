import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../infrastructure/api';
import {
  InvoiceTemplate,
  BillSize,
  SIZE_CONFIG,
} from '../core';
import { SUPPORTED_BILLING_FORMATS } from '../';
import { useSettingsContext } from '../../../contexts/SettingsContext';

export const useTemplateLogic = (filterCategory?: string, initialSize?: BillSize) => {
  const { appearanceSettings, setAppearanceSettings } = useSettingsContext();

  const [activeFormat, setActiveFormat] = useState('');
  const [selectedSize, setSelectedSize] = useState<BillSize | ''>(initialSize || '');


  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncFailed, setLastSyncFailed] = useState(false);

  const [availableSizes] = useState<BillSize[]>(['A4', 'A5', '58mm', '80mm', '1/4', '1/5', '1/6', '1/7', '1/8']);


  const LS_KEY = 'billsoft_template_overrides';

  const getLocalOverrides = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch {
      return {};
    }
  };

  // Sync initial state from appearanceSettings
  useEffect(() => {
    if (appearanceSettings.defaultBillSize && !selectedSize) {
      setSelectedSize(appearanceSettings.defaultBillSize as BillSize);
      if (appearanceSettings.activeTemplateId) setActiveFormat(appearanceSettings.activeTemplateId);
    }
  }, [appearanceSettings.defaultBillSize, appearanceSettings.activeTemplateId, selectedSize]);

  const mergeOverrides = useCallback((list: InvoiceTemplate[]): InvoiceTemplate[] => {
    const overrides = getLocalOverrides();
    const defaultId = localStorage.getItem('billsoft_default_template_id');

    return list.map(t => {
      const sizeKey = `${t.id}:${selectedSize}`;
      const override = overrides[sizeKey] || overrides[t.id];

      const template = {
        ...t,
        isDefault: defaultId ? t.id === defaultId : t.isDefault,
        settings: {
          ...t.settings,
          billSize: selectedSize as BillSize
        }
      };

      if (!override) return template;

      return {
        ...template,
        settings: {
          ...template.settings,
          ...(override.settings || {}),
          billSize: selectedSize as BillSize
        },
        fields: override.fields || template.fields,
      };
    });
  }, [selectedSize]);

  const fetchTemplates = useCallback(async () => {
    // 1. Initialize with local base templates immediately for zero-latency UI
    const baseTemplates = SUPPORTED_BILLING_FORMATS.map((s: any) => {
      const config = SIZE_CONFIG[s.size as BillSize];
      return {
        id: s.id,
        name: s.label,
        description: s.description || `Industry-standard ${s.size} for ${s.label}.`,
        category: 'billing',
        billType: s.label,
        complexity: 'standard' as const,
        preview: '',
        settings: {
          billSize: s.size as BillSize,
          billType: s.label,
          activeColumns: config?.defaultCols || ['Item Name', 'Qty', 'Amount'],
          colorScheme: '#3b82f6',
          logoPosition: 'top-left' as const,
          fontFamily: 'Inter',
          fontSize: 10,
          showBorder: true,
          headerHeight: 40,
          footerHeight: 40,
          margins: { top: 10, bottom: 10, left: 10, right: 10 }
        },
        tags: s.id.includes('purchase_order') || s.label.toLowerCase().includes('purchase order') 
               ? [s.size, 'purchase order'] 
               : [s.size],
        fields: [],
        folder: s.folder,
        subfolder: s.subfolder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }) as InvoiceTemplate[];

    setTemplates(mergeOverrides(baseTemplates));

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/templates');
      const backendTemplates = response.data.templates || [];

      // Map backend templates
      const dbTemplates = backendTemplates.map((t: any) => {
        let columnConfig = [];
        try { columnConfig = JSON.parse(t.columnConfig); } catch (e) { columnConfig = []; }

        return {
          id: t.id,
          name: t.name,
          category: 'billing',
          billType: t.billType || t.name,
          complexity: 'standard' as const,
          settings: {
            billSize: t.pageSize as BillSize,
            billType: t.billType || t.name,
            activeColumns: columnConfig.map((c: any) => c.label),
            dynamicColumns: columnConfig,
            colorScheme: '#3b82f6',
            logoPosition: 'top-left' as const,
            fontFamily: 'Inter',
            fontSize: 10,
            showBorder: true,
            headerHeight: 40,
            footerHeight: 40,
            margins: { top: 10, bottom: 10, left: 10, right: 10 }
          },
          tags: (t.id.includes('purchase_order') || t.name.toLowerCase().includes('purchase order')) 
                 ? [t.pageSize, 'purchase order'] 
                 : [t.pageSize],
          fields: [],
          folder: t.folder || (t.id.includes('purchase_order') ? 'PO' : 'Bill'),
          subfolder: t.subfolder || t.pageSize,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        };
      });

      setTemplates(mergeOverrides([...dbTemplates, ...baseTemplates]));
    } catch (err) {
      console.error('Error fetching templates:', err);
      // We still have baseTemplates from the initial setTemplates call
    } finally {
      setLoading(false);
    }
  }, [mergeOverrides]);

  const filterTemplatesLocally = useCallback(() => {
    let filtered = [...templates];

    if (!selectedSize) {
      setFilteredTemplates([]);
      return;
    }

    // Filter by Size
    filtered = filtered.filter(t => t.settings.billSize === selectedSize);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(s) || 
        t.tags?.some(tag => tag.toLowerCase().includes(s))
      );
    }

    if (filterCategory) {
      const cat = filterCategory.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(cat) ||
        t.id.toLowerCase().includes(cat.replace(' ', '_')) ||
        t.tags?.some(tag => tag.toLowerCase().includes(cat))
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedSize, searchTerm, filterCategory]);

  useEffect(() => {
    filterTemplatesLocally();
  }, [filterTemplatesLocally]);

  useEffect(() => {
    if (selectedSize) {
        setAppearanceSettings(prev => ({
            ...prev,
            defaultBillSize: selectedSize as BillSize,
            activeColumns: SIZE_CONFIG[selectedSize as BillSize]?.defaultCols || []
        }));

        fetchTemplates();
    } else {
        setTemplates([]);
        setActiveFormat('');
        setLoading(false);
    }
  }, [selectedSize, fetchTemplates, setAppearanceSettings]);

  const syncTemplateConfig = async (size: string, format: string) => {
    setIsSaving(true);
    try {
      const { templateAPI } = await import('../../../infrastructure/api');
      await templateAPI.updateTemplateConfig({
        defaultBillSize: size,
        activeTemplateId: format,
        billType: appearanceSettings.billType || ''
      });

      setActiveFormat(format);
      setSelectedSize(size as BillSize);

      setAppearanceSettings(prev => ({
        ...prev,
        defaultBillSize: size as BillSize,
        activeTemplateId: format,
        billType: appearanceSettings.billType || ''
      }));

      localStorage.setItem('billsoft_default_bill_size', size);
      localStorage.setItem('billsoft_default_template_id', format);
      setLastSyncFailed(false);
    } catch (err: any) {
      console.error('Failed to sync config:', err);
      setLastSyncFailed(true);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (isSaving) return;
    const targetTemplate = templates.find(t => t.id === templateId);
    if (!targetTemplate) return;

    try {
      await syncTemplateConfig(targetTemplate.settings.billSize, templateId);
      setTemplates(prev => prev.map(template => ({
        ...template,
        isDefault: template.id === templateId
      })));
      setActiveFormat(templateId);
      return targetTemplate;
    } catch (err) {
      throw err;
    }
  };

  const saveTemplateCustomization = async (templateId: string, settings: any) => {
    setIsSaving(true);
    try {
      const { templateAPI } = await import('../../../infrastructure/api');
      await templateAPI.saveTemplateSettings(templateId, settings);
      
      // Update local state
      setTemplates(prev => prev.map(t => {
        if (t.id === templateId) {
          return { ...t, settings: { ...t.settings, ...settings } };
        }
        return t;
      }));
      
      // Also sync current active size/format to global config if it's the active one
      if (templateId === activeFormat) {
          await syncTemplateConfig(settings.billSize || selectedSize, templateId);
      }
      
      setLastSyncFailed(false);
    } catch (err) {
      console.error('Failed to save customization:', err);
      setLastSyncFailed(true);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const setInitialState = useCallback((_ignoredParam?: any, size?: BillSize) => {
    if (size) setSelectedSize(size);
  }, []);

  return {
    activeFormat, setActiveFormat,
    selectedSize, setSelectedSize,
    templates, filteredTemplates,
    loading, error,
    searchTerm, setSearchTerm,
    isSaving, lastSyncFailed,
    availableSizes,
    handleTemplateSelect,
    saveTemplateCustomization,
    fetchTemplates,
    syncTemplateConfig,
    appearanceSettings, setAppearanceSettings,
    setInitialState
  };
};
