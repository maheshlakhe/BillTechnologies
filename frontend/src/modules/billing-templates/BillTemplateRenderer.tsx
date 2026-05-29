import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Bill } from '../../types/bill';
import { 
    InvoiceTemplate, 
    BillSize, 
    SIZE_CONFIG 
} from './core';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { modernTheme } from '../../theme/theme';
import { API_URL } from '../../config/api';
import UniversalBillEngine from './UniversalBillEngine';

import { useAuth } from '../../contexts/AuthContext';

// New Billing Module Components
import { getBillingTemplate, SUPPORTED_BILLING_FORMATS } from './index';
import { processSaleData } from '../../utils/billingUtils';
import { resolveFileUrl } from '../../utils/url';

interface BillTemplateRendererProps {
    template?: InvoiceTemplate;
    bill?: Bill;
    saleData?: any;
    preferences?: any;
    size?: string;
    activeColumns?: string[];
    billType?: string;
}

const BillTemplateRenderer: React.FC<BillTemplateRendererProps> = ({ 
    template, 
    bill, 
    saleData, 
    preferences: initialPreferences, 
    size: sizeOverride, 
    activeColumns: propColumns,
    billType: propBillType
}) => {
    const { appearanceSettings } = useSettingsContext();
    const [preferences, setPreferences] = useState<any>(initialPreferences || null);

    const { user: currentUser } = useAuth();

    // Merge bill user with current user profile for complete branding
    const effectiveBill = bill ? {
        ...bill,
        user: (bill.user || currentUser || {}) as any
    } : null;

    useEffect(() => {
        if (initialPreferences) {
            setPreferences(initialPreferences);
            return;
        }

        const loadPreferences = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_URL}/admin/settings/invoice-preferences`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const res = await response.json();
                if (res.success && res.data) {
                    setPreferences(res.data);
                }
            } catch (err) {
                console.error('Error loading preferences in renderer:', err);
            }
        };
        loadPreferences();
    }, [initialPreferences]);

    const renderContent = () => {
        // Resolve Effective Type
        const finalBillType = propBillType || saleData?.billType || effectiveBill?.billType || appearanceSettings?.billType || '';

        // 🚀 CASE 1: Direct SaleData (Used by BillForm for instant preview)
        if (saleData) {
            const activeTemplateId = (saleData.templateId === 'default' || !saleData.templateId) ? 'thermal_58mm' : saleData.templateId;
            const templateMeta = SUPPORTED_BILLING_FORMATS.find(f => f.id === activeTemplateId);
            const templateSize = (sizeOverride || templateMeta?.size || '58mm') as BillSize;
            
            // Check for dynamic columns or specialized designs
            const hasDynamicCols = !!(saleData.settings?.dynamicColumns && saleData.settings.dynamicColumns.length > 0);
            const CustomTemplate = hasDynamicCols ? UniversalBillEngine : getBillingTemplate(activeTemplateId, templateSize);

            // Normalize data using the core processing engine
            const processedSaleData = processSaleData({
                ...saleData,
                templateId: activeTemplateId
            });

            const strictConfig = SIZE_CONFIG[templateSize] || SIZE_CONFIG['A4'];
            
            return (
                <CustomTemplate 
                    saleData={processedSaleData} 
                    size={templateSize} 
                    activeColumns={propColumns || saleData?.activeColumns} 
                    sizeConfig={strictConfig}
                    billType={finalBillType}
                />
            );
        }

        // 🚀 CASE 2: Legacy Bill/Template mapping (Used by Library and ViewBill)
        if (!effectiveBill || !template) return <div>Loading Preview...</div>;

        const rawTemplateId = effectiveBill.templateId || template.id;
        const activeTemplateId = (rawTemplateId === 'default' || !rawTemplateId) ? 'thermal_58mm' : rawTemplateId;
        const templateMeta = SUPPORTED_BILLING_FORMATS.find(f => f.id === activeTemplateId);
        const templateSize = (sizeOverride || templateMeta?.size || '58mm') as BillSize;
        
        // Check for dynamic columns
        const hasDynamicCols = !!(template.settings?.dynamicColumns && template.settings.dynamicColumns.length > 0);
        const CustomTemplate = hasDynamicCols ? UniversalBillEngine : getBillingTemplate(activeTemplateId, templateSize);
        
        const processed = processSaleData({
            items: effectiveBill.items.map((item: any) => ({
                name: item.productName,
                qty: Number(item.quantity || item.qty),
                rate: Number(item.price || item.rate),
                taxRate: Number(item.taxRate || 0),
                discount: Number(item.discount || item.customFields?.discount || 0),
                hsn: item.hsn || item.customFields?.hsn || '',
                batch: item.batch || item.customFields?.batch || '',
                exp: item.exp || item.customFields?.exp || '',
                mfg: item.mfg || item.customFields?.mfg || '',
                unit: item.unit || item.customFields?.unit || 'PCS',
                size: item.size || item.customFields?.size || '',
                customFields: item.customFields || {} 
            })),
            isInterState: false, 
            tcsRate: 0,
            tcsMode: 'TOTAL',
            storeName: effectiveBill.user?.companyName || 'Store',
            storeAddress: effectiveBill.user?.address || '',
            storeGSTIN: effectiveBill.user?.gstNumber || '',
            businessLogo: resolveFileUrl(effectiveBill.user?.logoUrl),
            billNo: effectiveBill.billNumber || 'AUTO',
            billDate: effectiveBill.createdAt,
            customerName: effectiveBill.customerName,
            customerPhone: effectiveBill.customer?.phone || '',
            customerAddress: effectiveBill.customer?.address || '',
            customerGSTIN: effectiveBill.customer?.gstNumber || '',
            paymentMode: effectiveBill.paymentMode || 'Cash',
            bankName: effectiveBill.user?.bankName || preferences?.bankName || 'HDFC BANK',
            accountNumber: effectiveBill.user?.accountNumber || preferences?.accountNumber || '50200012345678',
            ifscCode: effectiveBill.user?.ifscCode || preferences?.ifscCode || 'HDFC0001234',
            branchName: effectiveBill.user?.branchName || preferences?.branchName || 'PUNE',
            upiId: effectiveBill.user?.upiId || preferences?.upiId || 'shop@upi',
            customFields: { ...effectiveBill } 
        });

        const strictConfig = SIZE_CONFIG[templateSize] || SIZE_CONFIG['A4'];

        return (
            <CustomTemplate 
                saleData={processed} 
                size={templateSize} 
                activeColumns={propColumns || template?.settings?.activeColumns} 
                sizeConfig={strictConfig} 
                billType={finalBillType}
            />
        );
    };

    return (
        <ThemeProvider theme={modernTheme} key={`renderer-${saleData?.templateId || effectiveBill?.templateId || 'default'}`}>
            {renderContent()}
        </ThemeProvider>
    );
};

export default BillTemplateRenderer;
