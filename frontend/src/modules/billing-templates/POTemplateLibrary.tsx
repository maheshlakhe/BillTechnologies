import React, { useState, useCallback, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Modal,
    Stack,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as PreviewIcon,
    CheckCircle as SelectedIcon,
    Close as CloseIcon,
    Settings as SettingsIcon,
    ArrowUpward as MoveUpIcon,
    ArrowDownward as MoveDownIcon,
    VisibilityOff as HiddenIcon
} from '@mui/icons-material';
import { ColumnData, DEFAULT_COLS } from './PurchaseOrderLayouts';
import { useSettingsContext } from '../../contexts/SettingsContext';

import { templateAPI } from '../../infrastructure/api';
import { SUPPORTED_BILLING_FORMATS } from './index';
import BillTemplateRenderer from './BillTemplateRenderer';
import { useAuth } from '../../contexts/AuthContext';


// Enhanced mapping for the Template Library UI
interface TemplateDef {
    id: string;
    name: string;
    layout: string;
    colorScheme: string;
    tag: string;
    category: 'PO' | 'Invoice';
    size: string;
}

export const TEMPLATES: TemplateDef[] = (SUPPORTED_BILLING_FORMATS || []).map((f: any) => ({
    id: f.id,
    name: f.label,
    layout: f.id,
    colorScheme: f.id.includes('red') ? 'red' : f.id.includes('teal') ? 'teal' : f.id.includes('indigo') ? 'indigo' : 'blue',
    tag: f.folder === 'PO' ? 'Official' : (f.size === 'A4' ? 'Premium' : 'Compact'),
    category: (f.folder === 'PO' ? 'PO' : 'Invoice') as 'PO' | 'Invoice',
    size: f.size
}));

const getThumbnailStyle = (size: string) => {
    let pageWidth = '210mm';
    let pageHeight = '297mm';
    let scale = 0.20;
    
    if (size === 'A4') {
        pageWidth = '210mm';
        pageHeight = '297mm';
        scale = 0.20;
    } else if (size === 'A5') {
        pageWidth = '148mm';
        pageHeight = '210mm';
        scale = 0.28;
    } else if (size === '80mm') {
        pageWidth = '80mm';
        pageHeight = '150mm';
        scale = 0.45;
    } else if (size === '58mm') {
        pageWidth = '58mm';
        pageHeight = '130mm';
        scale = 0.60;
    } else {
        pageWidth = '105mm';
        pageHeight = '145mm';
        scale = 0.35;
    }
    
    return {
        width: pageWidth,
        minWidth: pageWidth,
        maxWidth: pageWidth,
        height: pageHeight,
        minHeight: pageHeight,
        maxHeight: pageHeight,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
    };
};

const getScaledDimensions = (size: string) => {
    if (size === 'A4') {
        return { width: 159, height: 225 };
    } else if (size === 'A5') {
        return { width: 157, height: 222 };
    } else if (size === '80mm') {
        return { width: 136, height: 255 };
    } else if (size === '58mm') {
        return { width: 132, height: 295 };
    } else {
        return { width: 145, height: 200 };
    }
};

interface POTemplateLibraryProps {
    initialTab?: 'PO' | 'Invoice';
}

const POTemplateLibrary: React.FC<POTemplateLibraryProps> = ({ initialTab = 'PO' }) => {
    const { user } = useAuth();
    const industrySlug = user?.industry?.slug || 'retail';

    const [tabValue, setTabValue] = useState(initialTab);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTemplate, setActiveTemplate] = useState<string>('po_professional_blue');
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [columnManagerOpen, setColumnManagerOpen] = useState(false);
    const [managingTemplateId, setManagingTemplateId] = useState<string | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { refreshSettings } = useSettingsContext();
    const theme = useTheme();
    // Notification state
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setNotification({ open: true, message, severity });
    }, []);


    const sampleSaleData = {
        storeName: 'Elite Solutions Pvt Ltd',
        storeAddress: '123 Techno Park, Sector 5, Bangalore - 560001',
        storeGSTIN: '29ABCDE1234F1Z5',
        storeEmail: 'billing@elitesolutions.com',
        storePhone: '+91 98765 43210',
        billNo: 'PO/2026/1024',
        billDate: '13-Apr-2026',
        customerName: 'Global Nexus Corp',
        customerAddress: '456 Business Square, Mumbai - 400001',
        customerGSTIN: '27XYZAB5678K1Z2',
        customerEmail: 'procurement@globalnexus.com',
        customerPhone: '+91 91234 56780',
        items: [
            { id: '1', name: 'Industrial Server Rack', hsn: '8471', qty: 2, rate: 45000, total: 90000, taxRate: 18 },
            { id: '2', name: 'Cat6 Enterprise Cable (300m)', hsn: '8544', qty: 5, rate: 8500, total: 42500, taxRate: 18 },
            { id: '3', name: 'L3 Managed Switch', hsn: '8517', qty: 3, rate: 12000, total: 36000, taxRate: 18 },
        ],
        summary: { basicTotal: 168500, taxTotal: 30330, grandTotal: 198830 },
        paymentMode: 'Bank Transfer',
        deliveryPeriod: '15 Days',
        projectName: 'Datacenter Expansion'
    };

    const [templateCols, setTemplateCols] = useState<Record<string, ColumnData[]>>(() => {
        const initialDefault = TEMPLATES.reduce<Record<string, ColumnData[]>>((acc: any, t: TemplateDef) => ({ ...acc, [t.id]: DEFAULT_COLS.map(c => ({ ...c })) }), {});
        const saved = localStorage.getItem('po_template_columns');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const merged: Record<string, ColumnData[]> = { ...initialDefault };

                Object.keys(parsed).forEach(key => {
                    if (parsed[key] && Array.isArray(parsed[key])) {
                        // Intelligent merge: Keep existing columns from storage, but ensure all DEFAULT_COLS are present
                        const savedCols = parsed[key];
                        const defaultColsForKey = initialDefault[key] || DEFAULT_COLS.map(c => ({ ...c }));

                        // Map default cols and override their 'enabled' state if found in saved data
                        merged[key] = defaultColsForKey.map((dCol: ColumnData) => {
                            const savedCol = savedCols.find((s: any) => s.id === dCol.id || s.label === dCol.label);
                            return {
                                ...dCol,
                                enabled: savedCol ? !!savedCol.enabled : dCol.enabled
                            };
                        });

                        // Add any custom columns that were in saved data but not in defaults
                        const customSaved = savedCols.filter((s: any) => !defaultColsForKey.some((d: any) => d.id === s.id || d.label === s.label));
                        merged[key] = [...merged[key], ...customSaved.map((s: any) => ({
                            id: s.id || `custom_${Math.random().toString(36).substr(2, 9)}`,
                            label: s.label || 'Custom Column',
                            enabled: !!s.enabled,
                            section: s.section || 'custom'
                        }))];
                    }
                });
                return merged;
            } catch (e) {
                console.error("Failed to parse saved PO columns", e);
            }
        }
        return initialDefault;
    });

    // --- DB PERSISTENCE HOOKS ---
    useEffect(() => {
        const fetchSettings = async () => {
            setIsInitialLoading(true);
            try {
                // 1. Fetch Active Template
                const activeRes = await templateAPI.fetchSettings('PO_CONFIG', 'active_template');
                if (activeRes && activeRes.data) {
                    setActiveTemplate(activeRes.data);
                }

                // 2. Fetch Column Configurations
                const templatesRes = await templateAPI.fetchTemplates();
                const dbTemplates = templatesRes.templates || [];
                const poTemplates = dbTemplates.filter((t: any) => t.billType === 'purchase_order');

                if (poTemplates.length > 0) {
                    setTemplateCols(prev => {
                        const merged = { ...prev };
                        poTemplates.forEach((t: any) => {
                            try {
                                const cols = typeof t.columnConfig === 'string' ? JSON.parse(t.columnConfig) : t.columnConfig;
                                if (Array.isArray(cols) && cols.length > 0) {
                                    // Ensure both enabled and visible are synced for reliability
                                    merged[t.id] = cols.map(c => ({
                                        ...c,
                                        enabled: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true),
                                        visible: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true)
                                    }));
                                }
                            } catch (e) {
                                console.error('Failed to parse columns for', t.id, e);
                            }
                        });
                        return merged;
                    });
                }
            } catch (error) {
                console.error('Failed to load settings from DB:', error);
                showNotification('Failed to load settings from database.', 'error');
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchSettings();
    }, [showNotification]);

    const handleSetActiveTemplate = async (templateId: string) => {
        setActiveTemplate(templateId);
        try {
            if (tabValue === 'Invoice') {
                // Invoices are tracked in the user profile/admin settings
                await templateAPI.updateTemplateConfig({ 
                    activeTemplateId: templateId 
                });
            } else {
                // POs use a separate config key
                await templateAPI.saveSettings('PO_CONFIG', 'active_template', templateId);
            }
            
            // Critical: Refresh global settings context so other pages (like ViewBill) see the change instantly
            await refreshSettings();
            
            showNotification(`${tabValue === 'PO' ? 'PO' : 'Invoice'} template updated`, 'success');
        } catch (error) {
            console.error('Failed to save active template to DB:', error);
            showNotification('Failed to save template preference', 'error');
        }
    };

    const persistTemplateColumns = useCallback(async (templateId: string, columns: ColumnData[]) => {
        // setIsSaving(true);
        try {
            await templateAPI.saveTemplateSettings(templateId, {
                dynamicColumns: columns,
                billType: 'purchase_order',
                billSize: 'A4'
            });
            return true;
        } catch (error) {
            console.error('Failed to persist PO columns to DB:', error);
            showNotification('Failed to save column changes to database.', 'error');
            return false;
        } finally {
            // setIsSaving(false);
        }
    }, [showNotification]);


    const filteredTemplates = TEMPLATES.filter((t: TemplateDef) => {
        let isAllowedForIndustry = true;
        
        if (industrySlug === 'restaurant') {
            const allowedIds = [
                // Sales Invoices
                'thermal_80mm', 'thermal_58mm', 'FoodKOT', 'FoodDineIn', 'RealRestaurantThermal', 'CompactFoodie', 'KiranaThermal', 'ThermalSmall', 'mini_receipt', 'restaurant_thermal', 'standard_a4', 'minimal_service_a4',
                // Purchase Orders
                'po_classic_pro', 'po_modern_exec', 'po_minimal_georgia', 'po_industrial_shadow'
            ];
            isAllowedForIndustry = 
                allowedIds.includes(t.id) || 
                t.name.toLowerCase().includes('food') || 
                t.name.toLowerCase().includes('thermal') ||
                t.name.toLowerCase().includes('receipt') ||
                t.name.toLowerCase().includes('kot');
        }

        const matchesCategory = t.category === tabValue || (t.tag === 'Official' ? tabValue === 'PO' : tabValue === 'Invoice');
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return isAllowedForIndustry && matchesCategory && matchesSearch;
    });

    const handleOpenColumnManager = (id: string) => {
        setManagingTemplateId(id);
        setColumnManagerOpen(true);
    };

    const handleToggleColumn = async (colId: string, forcedState?: boolean) => {
        if (!managingTemplateId) return;

        let updatedCols: ColumnData[] = [];
        setTemplateCols(prev => {
            const currentTemplateCols = prev[managingTemplateId] || DEFAULT_COLS.map(c => ({ ...c }));
            updatedCols = currentTemplateCols.map(c => {
                if (String(c.id) === String(colId)) {
                    const nextState = forcedState !== undefined ? forcedState : !c.enabled;
                    return { ...c, enabled: nextState, visible: nextState };
                }
                return c;
            });

            return {
                ...prev,
                [managingTemplateId]: updatedCols
            };
        });

        // Async persistence
        if (updatedCols.length > 0) {
            await persistTemplateColumns(managingTemplateId, updatedCols);
        }
    };


    const handleRemoveColumn = useCallback(async (colId: string) => {
        if (!managingTemplateId) return;

        let updatedCols: ColumnData[] = [];
        setTemplateCols(prev => {
            const currentTemplateCols = prev[managingTemplateId] || [];
            updatedCols = currentTemplateCols.filter(c => c.id !== colId);

            return {
                ...prev,
                [managingTemplateId]: updatedCols
            };
        });

        if (updatedCols.length > 0) {
            await persistTemplateColumns(managingTemplateId, updatedCols);
        }
    }, [managingTemplateId, persistTemplateColumns]);

    const handleMoveColumn = useCallback(async (idx: number, direction: 'up' | 'down') => {
        if (!managingTemplateId) return;

        let updatedCols: ColumnData[] = [];
        setTemplateCols(prev => {
            const cols = [...(prev[managingTemplateId] || [])];
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= cols.length) return prev;
            [cols[idx], cols[newIdx]] = [cols[newIdx], cols[idx]];
            updatedCols = cols;
            return { ...prev, [managingTemplateId]: cols };
        });

        if (updatedCols.length > 0) {
            await persistTemplateColumns(managingTemplateId, updatedCols);
        }
    }, [managingTemplateId, persistTemplateColumns]);

    const handleAddColumn = async (label: string) => {
        if (!managingTemplateId || !label) return;
        const newCol: ColumnData = {
            id: `custom_${Date.now()}`,
            label,
            enabled: true,
            visible: true,
            section: 'custom'
        };

        let updatedCols: ColumnData[] = [];
        setTemplateCols(prev => {
            updatedCols = [...(prev[managingTemplateId] || []), newCol];
            return {
                ...prev,
                [managingTemplateId]: updatedCols
            };
        });

        if (updatedCols.length > 0) {
            await persistTemplateColumns(managingTemplateId, updatedCols);
        }
    };

    const sampleInvoiceData = {
        storeName: 'Elite Solutions Pvt Ltd',
        storeAddress: '123 Techno Park, Sector 5, Bangalore - 560001',
        storeGSTIN: '29ABCDE1234F1Z5',
        storeEmail: 'billing@elitesolutions.com',
        storePhone: '+91 98765 43210',
        billNo: 'INV/2026/001',
        billDate: '28-Apr-2026',
        customerName: 'Sample Customer',
        customerAddress: 'Sector 4, Rohini, New Delhi - 110085',
        customerGSTIN: 'N/A',
        customerEmail: 'customer@example.com',
        customerPhone: '+91 99999 88888',
        items: [
            { id: '1', name: 'Professional Service', hsn: '9983', qty: 1, rate: 15000, total: 15000, taxRate: 18 },
            { id: '2', name: 'Consulting Fee', hsn: '9983', qty: 2, rate: 5000, total: 10000, taxRate: 18 },
        ],
        summary: { basicTotal: 25000, taxTotal: 4500, grandTotal: 29500 },
        paymentMode: 'Online',
        placeOfSupply: 'Delhi',
        templateId: '' // Will be set dynamically
    };

    const renderLayout = (t: any) => {
        const isInvoice = t.category === 'Invoice';
        const data = isInvoice ? { ...sampleInvoiceData, templateId: t.id } : { ...sampleSaleData, templateId: t.id };
        
        return (
            <Box sx={{ width: '100%', height: '100%', bgcolor: '#fff' }}>
                <BillTemplateRenderer
                    template={{
                        id: t.id,
                        name: t.name,
                        settings: { 
                            billSize: t.size || 'A4', 
                            activeColumns: (templateCols[t.id] || DEFAULT_COLS).map(c => c.label) 
                        }
                    } as any}
                    saleData={data}
                    size={t.size || 'A4'}
                    billType={t.category === 'PO' ? 'Purchase Order' : 'Tax Invoice'}
                />
            </Box>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header Section */}
            <Box sx={{
                mb: 6,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 3
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary', letterSpacing: '-0.03em', mb: 0.5 }}>
                        Invoice Template Library
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Manage and configure professional invoice and purchase order layouts
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <TextField
                        size="small"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            width: { xs: '100%', md: 320 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '14px',
                                bgcolor: 'background.paper',
                                '& fieldset': { borderColor: 'divider', borderWidth: '1.5px' },
                                '&:hover fieldset': { borderColor: 'action.hover' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </Box>

            {/* Category Switcher */}
            <Box sx={{ mb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(_: React.SyntheticEvent, val: any) => setTabValue(val as 'PO' | 'Invoice')}
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            fontSize: '0.95rem',
                            minWidth: 160,
                            color: 'text.secondary',
                            '&.Mui-selected': { color: 'primary.main' }
                        }
                    }}
                >
                    <Tab label="Purchase Orders" value="PO" />
                    <Tab label="Sales Invoices" value="Invoice" />
                </Tabs>
            </Box>

            {/* Template Grid */}
            <Grid container spacing={3}>
                {isInitialLoading ? (
                    // Skeleton Loaders
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={i}>
                            <Box sx={{ height: 380, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', p: 2 }}>
                                <Box sx={{ height: 200, borderRadius: '12px', bgcolor: 'action.hover', mb: 2, animation: 'pulse 1.5s infinite ease-in-out' }} />
                                <Box sx={{ height: 24, width: '60%', bgcolor: 'action.hover', mb: 1, borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                <Box sx={{ height: 16, width: '40%', bgcolor: 'action.hover', mb: 3, borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Box sx={{ height: 40, flex: 1, bgcolor: 'action.hover', borderRadius: '10px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                    <Box sx={{ height: 40, flex: 1, bgcolor: 'action.hover', borderRadius: '10px', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                </Box>
                            </Box>
                        </Grid>
                    ))
                ) : (
                    filteredTemplates.map((t: TemplateDef) => {
                        const isActive = activeTemplate === t.id;
                        return (
                            <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={t.id}>
                                <Card
                                    sx={{
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        borderColor: isActive ? 'primary.main' : 'transparent',
                                        bgcolor: 'background.paper',
                                        boxShadow: isActive
                                            ? '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.15)'
                                            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-4px) scale(1.01)',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                                            '& .preview-overlay': { opacity: 1 }
                                        }
                                    }}
                                >
                                    {/* Selection Indicator */}
                                    {isActive && (
                                        <Box sx={{
                                            position: 'absolute', top: 12, right: 12, zIndex: 10,
                                            bgcolor: '#3b82f6', color: '#fff', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            p: 0.5, boxShadow: '0 4px 6px rgba(59, 130, 246, 0.4)'
                                        }}>
                                            <SelectedIcon sx={{ fontSize: 16 }} />
                                        </Box>
                                    )}

                                    {/* Badge */}
                                    <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                                        <Chip
                                            label={t.tag}
                                            size="small"
                                            sx={{
                                                bgcolor: t.tag === 'Premium' ? '#e0e7ff' : t.tag === 'Minimal' ? '#f1f5f9' : '#dcfce7',
                                                color: t.tag === 'Premium' ? '#4338ca' : t.tag === 'Minimal' ? '#475569' : '#15803d',
                                                fontWeight: 700,
                                                fontSize: '0.65rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.02em',
                                                border: 'none',
                                                height: 24,
                                                '& .MuiChip-label': { px: 1.5 }
                                            }}
                                        />
                                    </Box>

                                    {/* Preview Container - Centered Page Preview */}
                                    <Box sx={{
                                        height: 300, 
                                        width: '100%',
                                        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }} onClick={() => setPreviewTemplate(t)}>
                                        <Box className="preview-content" sx={{
                                            ...getThumbnailStyle(t.size),
                                            bgcolor: '#fff',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                                            pointerEvents: 'none',
                                            flexShrink: 0,
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '.MuiCard-root:hover &': {
                                                transform: `${getThumbnailStyle(t.size).transform} translateY(-8px)`,
                                                boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                                            }
                                        }}>
                                            {renderLayout(t)}
                                        </Box>
 
                                        {/* Premium Hover Overlay bounded exactly to PDF dimensions */}
                                        <Box className="preview-overlay" sx={{
                                            position: 'absolute',
                                            ...getScaledDimensions(t.size),
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.5)',
                                            opacity: 0, 
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            zIndex: 5,
                                            borderRadius: '4px',
                                            '.MuiCard-root:hover &': { 
                                                opacity: 1,
                                                transform: 'translate(-50%, calc(-50% - 8px))'
                                            }
                                        }}>
                                            <Box sx={{
                                                px: 2, py: 1, borderRadius: '12px', bgcolor: 'background.paper',
                                                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                                                display: 'flex', alignItems: 'center', gap: 1,
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                <PreviewIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                                <Typography variant="caption" fontWeight="800" sx={{ color: 'text.primary' }}>View Details</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Content Area */}
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                                                {t.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', height: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                Professional {t.colorScheme} theme for elegant POs.
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1.5}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={(e) => { e.stopPropagation(); handleSetActiveTemplate(t.id); }}
                                                sx={{
                                                    borderRadius: '10px',
                                                    py: 1,
                                                    fontWeight: '700',
                                                    textTransform: 'none',
                                                    fontSize: '0.8rem',
                                                    bgcolor: isActive ? 'primary.main' : 'text.primary',
                                                    color: 'background.paper',
                                                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                                    '&:hover': {
                                                        bgcolor: isActive ? 'primary.dark' : 'text.secondary',
                                                        boxShadow: isActive ? '0 6px 15px rgba(59, 130, 246, 0.4)' : 'none'
                                                    }
                                                }}
                                            >
                                                {isActive ? 'Active' : 'Use Template'}
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={(e) => { e.stopPropagation(); handleOpenColumnManager(t.id); }}
                                                sx={{
                                                    minWidth: 'fit-content',
                                                    px: 2,
                                                    borderRadius: '10px',
                                                    borderColor: 'divider',
                                                    color: 'text.secondary',
                                                    '&:hover': { borderColor: 'action.hover', bgcolor: 'action.hover', color: 'text.primary' }
                                                }}
                                            >
                                                <SettingsIcon sx={{ fontSize: 18 }} />
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Column Manager Modal */}
            <Modal open={columnManagerOpen} onClose={() => setColumnManagerOpen(false)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Box sx={{
                    width: '100%',
                    maxWidth: 500,
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: '24px',
                    p: 0,
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }}>
                    {/* MODAL HEADER */}
                    <Box sx={{
                        p: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.default'
                    }}>
                        <Box>
                            <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>Column Settings</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Configure visible fields for this template</Typography>
                        </Box>
                        <IconButton onClick={() => setColumnManagerOpen(false)} sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'action.hover' } }}>
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: 'background.paper' }}>
                        {managingTemplateId && templateCols[managingTemplateId]?.map((col: any, idx: number) => {
                            const isVisible = col.enabled;
                            return (
                                <Box key={col.id} sx={{
                                    display: 'flex', alignItems: 'center', p: 1.5, mb: 1, bgcolor: 'background.paper',
                                    borderRadius: '12px', border: '1px solid', borderColor: isVisible ? 'divider' : 'action.disabledBackground',
                                    transition: 'all 0.2s ease', opacity: isVisible ? 1 : 0.6,
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
                                        <IconButton size="small" onClick={() => handleMoveColumn(idx, 'up')} disabled={idx === 0} sx={{ p: 0.5, color: 'text.primary' }}><MoveUpIcon sx={{ fontSize: 14 }} /></IconButton>
                                        <IconButton size="small" onClick={() => handleMoveColumn(idx, 'down')} disabled={idx === (templateCols[managingTemplateId!]?.length || 0) - 1} sx={{ p: 0.5, color: 'text.primary' }}><MoveDownIcon sx={{ fontSize: 14 }} /></IconButton>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>{col.label}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>{col.section || 'General'}</Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggleColumn(col.id)}
                                            sx={{
                                                color: isVisible ? 'primary.main' : 'text.disabled',
                                                bgcolor: isVisible ? 'action.selected' : 'action.hover',
                                                '&:hover': { bgcolor: isVisible ? 'action.selected' : 'action.hover' }
                                            }}
                                        >
                                            {isVisible ? <PreviewIcon sx={{ fontSize: 18 }} /> : <HiddenIcon sx={{ fontSize: 18 }} />}
                                        </IconButton>

                                        {col.section === 'custom' && (
                                            <IconButton size="small" color="error" onClick={() => handleRemoveColumn(col.id)} sx={{ bgcolor: 'error.light', color: 'error.contrastText', '&:hover': { bgcolor: 'error.main' } }}>
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                        <Typography variant="caption" fontWeight="700" sx={{ mb: 1, display: 'block', color: 'text.secondary', textTransform: 'uppercase' }}>Add Custom Field</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <TextField
                                id="new-col-input" size="small" placeholder="Column label..." fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'background.paper' } }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddColumn((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{ borderRadius: '10px', px: 3, fontWeight: '700', bgcolor: 'text.primary', color: 'background.paper', textTransform: 'none' }}
                                onClick={() => {
                                    const input = document.getElementById('new-col-input') as HTMLInputElement;
                                    if (input.value) { handleAddColumn(input.value); input.value = ''; }
                                }}
                            >
                                Add
                            </Button>
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ borderRadius: '12px', fontWeight: '800', py: 1.5, bgcolor: 'primary.main', textTransform: 'none', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                            onClick={() => setColumnManagerOpen(false)}
                        >
                            Save Configuration
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Full Preview Modal */}
            <Modal open={!!previewTemplate} onClose={() => setPreviewTemplate(null)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <Box sx={{
                    width: '100%',
                    maxWidth: 1100,
                    height: '95vh',
                    bgcolor: 'background.paper',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>{previewTemplate?.name}</Typography>
                            <Chip label={previewTemplate?.tag} size="small" sx={{ fontWeight: 700, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', color: 'text.secondary' }} />
                        </Box>
                        <IconButton onClick={() => setPreviewTemplate(null)} sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'action.hover' } }}><CloseIcon /></IconButton>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 6 }, bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#e2e8f0' }}>
                        <Box sx={{
                            width: previewTemplate?.size === 'A4' ? '210mm' : 
                                   (previewTemplate?.size === 'A5' ? '148mm' : 
                                   (previewTemplate?.size === '80mm' ? '80mm' : 
                                   (previewTemplate?.size === '58mm' ? '58mm' : '105mm'))),
                            minHeight: previewTemplate?.size === 'A4' ? '297mm' : 
                                       (previewTemplate?.size === 'A5' ? '210mm' : '150mm'),
                            m: '0 auto',
                            bgcolor: '#fff',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
                            p: 0
                        }}>
                            {previewTemplate && renderLayout(previewTemplate)}
                        </Box>
                    </Box>
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center', bgcolor: 'background.default' }}>
                        <Button
                            variant="contained"
                            startIcon={<SelectedIcon />}
                            onClick={() => { handleSetActiveTemplate(previewTemplate.id); setPreviewTemplate(null); }}
                            sx={{ borderRadius: '12px', px: 6, py: 1.2, fontWeight: '800', bgcolor: 'primary.main', textTransform: 'none' }}
                        >
                            Select this Template
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Styles for pulse animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
            ` }} />

            {/* SNACKBAR */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default POTemplateLibrary;

