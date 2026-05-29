import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { templateAPI, authAPI } from '../../infrastructure/api';
import { ColumnData } from './PurchaseOrderLayouts';
import A4PurchaseOrderClassic from './A4PurchaseOrderClassic';
import A4PurchaseOrderModern from './A4PurchaseOrderModern';
import A4PurchaseOrderMinimal from './A4PurchaseOrderMinimal';
import POConsultingA4 from './POConsultingA4';
import POPharmacyA4 from './POPharmacyA4';
import POProfessionalA4 from './POProfessionalA4';
import POProfessionalRedA4 from './POProfessionalRedA4';
import EliteSignaturePO from './EliteSignaturePO';
import GradientFlowPO from './GradientFlowPO';
import IndustrialShadowPO from './IndustrialShadowPO';

// Mirror the TEMPLATES from POTemplateLibrary to avoid direct dependency if they change
const TEMPLATE_MAP = [
  { id: 'classic-1', layout: 'classic', colorScheme: 'blue' },
  { id: 'modern-1', layout: 'modern', colorScheme: 'teal' },
  { id: 'minimal-1', layout: 'minimal', colorScheme: 'gray' },
  { id: 'elite-1', layout: 'elite', colorScheme: 'blue' },
  { id: 'gradient-1', layout: 'gradient', colorScheme: 'violet' },
  { id: 'industrial-shadow-1', layout: 'industrial-shadow', colorScheme: 'slate' },
  { id: 'consulting-1', layout: 'consulting', colorScheme: 'indigo' },
  { id: 'pharmacy-1', layout: 'pharmacy', colorScheme: 'emerald' },
  { id: 'professional-1', layout: 'professional', colorScheme: 'blue' },
  
  // Standard supported billing format PO templates mapping
  { id: 'po_classic_pro', layout: 'professional', colorScheme: 'blue' },
  { id: 'po_modern_exec', layout: 'modern', colorScheme: 'teal' },
  { id: 'po_minimal_georgia', layout: 'minimal', colorScheme: 'gray' },
  { id: 'po_professional_blue', layout: 'professional', colorScheme: 'blue' },
];

const DEFAULT_COLS: ColumnData[] = [
  { id: 'sr_no', label: 'SR NO', enabled: true, section: 'index' },
  { id: 'item_name', label: 'Item / Description', enabled: true, section: 'product' },
  { id: 'quantity', label: 'Qty', enabled: true, section: 'inventory' },
  { id: 'unit_price', label: 'Rate', enabled: true, section: 'product' },
  { id: 'taxRate', label: 'GST %', enabled: true, section: 'tax' },
  { id: 'total', label: 'Amount', enabled: true, section: 'product' },
];

interface POTemplateRendererProps {
    order: any;
}

const POTemplateRenderer: React.FC<POTemplateRendererProps> = ({ order }) => {
    const [loading, setLoading] = useState(true);
    const [activeTemplateId, setActiveTemplateId] = useState<string>('po_professional_blue');
    const [columns, setColumns] = useState<ColumnData[]>(DEFAULT_COLS);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            try {
                // 1. Fetch User Profile for Store Info
                const profileRes = await authAPI.getProfile();
                if (profileRes.success) {
                    setProfile(profileRes.user);
                }

                // 2. Check if order has own template config (Snapshot)
                // If it does, we use that for IMMUTABILITY
                if (order.templateId || order.layout || order.colorScheme) {
                    if (order.templateId) setActiveTemplateId(order.templateId);
                    
                    if (order.columnConfig) {
                        try {
                            const cols = typeof order.columnConfig === 'string' ? JSON.parse(order.columnConfig) : order.columnConfig;
                            if (Array.isArray(cols)) {
                                  setColumns(cols.map((c: any) => ({
                                      ...c,
                                      enabled: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true),
                                      visible: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true)
                                  })));
                            }
                        } catch (e) {
                            console.error('Failed to parse columns in order snapshot', e);
                        }
                    }
                    
                    setLoading(false);
                    return; // Done completely, skipping global template sync
                }

                // 3. Fallback: Fetch Active Template ID (Global) for legacy POs
                const activeRes = await templateAPI.fetchSettings('PO_CONFIG', 'active_template');
                const tId = activeRes?.data || 'po_professional_blue';
                setActiveTemplateId(tId);

                // 4. Fetch Column Settings for this template (Global)
                const templatesRes = await templateAPI.fetchTemplates();
                const dbTemplates = templatesRes.templates || [];
                const poTemplate = dbTemplates.find((t: any) => t.id === tId && t.billType === 'purchase_order');
                
                if (poTemplate) {
                    try {
                        const cols = typeof poTemplate.columnConfig === 'string' ? JSON.parse(poTemplate.columnConfig) : poTemplate.columnConfig;
                        if (Array.isArray(cols)) {
                            setColumns(cols.map((c: any) => ({
                                ...c,
                                enabled: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true),
                                visible: c.enabled !== undefined ? !!c.enabled : (c.visible !== undefined ? !!c.visible : true)
                            })));
                        }
                    } catch (e) {
                        console.error('Failed to parse columns in renderer', e);
                    }
                }
            } catch (err) {
                console.error('Failed to load PO template config:', err);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [order.colorScheme, order.columnConfig, order.layout, order.templateId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={40} />
                <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>Preparing premium view...</Typography>
            </Box>
        );
    }

    const templateMeta = (order.layout && order.colorScheme) 
        ? { id: activeTemplateId, layout: order.layout, colorScheme: order.colorScheme }
        : (TEMPLATE_MAP.find(t => t.id === activeTemplateId) || TEMPLATE_MAP[0]);
    
    // Transform Order Data to SaleData format
    const saleData = {
        storeName: profile?.companyName || 'Elite Solutions Pvt Ltd',
        storeAddress: profile?.address || '123 Techno Park, Sector 5, Bangalore - 560001',
        storeGSTIN: profile?.gstNumber || '29ABCDE1234F1Z5',
        storeEmail: profile?.email || 'billing@elitesolutions.com',
        storePhone: profile?.phone || '+91 98765 43210',
        businessLogo: profile?.businessLogo,

        billNo: order.poNumber,
        billDate: new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        
        customerName: order.supplier?.name,
        customerAddress: order.supplier?.address || 'Supplier Address',
        customerGSTIN: order.supplier?.gstNumber || 'N/A',
        customerEmail: order.supplier?.email || 'N/A',
        customerPhone: order.supplier?.phone || 'N/A',

        items: order.items.map((item: any) => ({
            id: item.id || Math.random().toString(),
            item_name: item.itemName,
            quantity: item.quantity,
            unit_price: item.price,
            total: item.total,
            taxRate: 18, // Defaulting to 18% as most POs have GST
            hsn_code: 'N/A'
        })),

        summary: {
            basicTotal: order.totalAmount / 1.18, // Rough estimate if not available
            cgst: (order.totalAmount - (order.totalAmount / 1.18)) / 2,
            sgst: (order.totalAmount - (order.totalAmount / 1.18)) / 2,
            grandTotal: order.totalAmount
        },

        paymentMode: 'Bank Transfer',
        deliveryPeriod: '15 Days',
        projectName: order.notes?.length > 10 ? order.notes.substring(0, 30) : 'Standard Procurement',
        scopeOfWork: order.notes || 'Procurement of goods/services as listed.'
    };

    const renderLayout = (layout: string, colorScheme: string) => {
        const props = { 
            saleData, 
            colorScheme, 
            activeColumns: columns 
        };
        switch (layout) {
            case 'classic': return <A4PurchaseOrderClassic {...props} />;
            case 'modern': return <A4PurchaseOrderModern {...props} />;
            case 'minimal': return <A4PurchaseOrderMinimal {...props} />;
            case 'consulting': return <POConsultingA4 {...props} />;
            case 'pharmacy': return <POPharmacyA4 {...props} />;
            case 'professional': return <POProfessionalA4 {...props} />;
            case 'professional-red': return <POProfessionalRedA4 {...props} />;
            case 'elite': return <EliteSignaturePO {...props} />;
            case 'gradient': return <GradientFlowPO {...props} />;
            case 'industrial-shadow': return <IndustrialShadowPO {...props} />;
            default: return <A4PurchaseOrderClassic {...props} />;
        }
    };

    return (
        <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            bgcolor: '#f1f5f9', 
            p: { xs: 1, md: 4 },
            overflow: 'auto',
            maxHeight: 'calc(100vh - 200px)',
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
            '@media print': {
                p: 0,
                m: 0,
                bgcolor: '#fff',
                overflow: 'visible',
                maxHeight: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                width: '100vw',
                height: '100vh',
                display: 'block'
            }
        }}>
            {/* Global style for printing to hide other elements and ensure 1:1 scale */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body > *:not(#print-root) { display: none !important; }
                    .MuiDialog-root, .MuiBackdrop-root { display: none !important; }
                    .premium-po-print-container { 
                        display: block !important; 
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-shadow: none !important;
                        width: 210mm !important;
                        height: 297mm !important;
                    }
                    @page { margin: 0; size: A4; }
                }
            ` }} />
            
            <Box className="premium-po-print-container" sx={{ 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                bgcolor: '#fff',
                transform: { xs: 'scale(0.5)', sm: 'scale(0.7)', md: 'scale(1)' },
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease',
                flexShrink: 0,
                mb: 4
            }}>
                {renderLayout(templateMeta.layout, templateMeta.colorScheme)}
            </Box>
        </Box>
    );
};

export default POTemplateRenderer;
