/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Inventory as InventoryIcon,
  AutoFixHigh as AutoFixIcon,
  Storefront as IndustryIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Product } from '../../types/product';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import { useIndustryProductForm } from '../../hooks/useIndustryProductForm';
import { DynamicIndustryForm } from './DynamicIndustryForm';

// Constants
import { INDUSTRY_SAMPLES } from '../../constants/industrySamples';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave?: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, product: initialProduct, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { createProduct, updateProduct } = useProducts();
  const { user } = useAuth();
  
  const { formStructure, loading: formLoading } = useIndustryProductForm(user?.industryId || undefined);
  
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: '' as any,
    taxRate: 0,
    tax: 0,
    stock: '' as any,
    quantity: 1 as any,
    sku: '',
    hsnCode: '',
    category: '',
    imageUrl: '',
    createdAt: '',
    updatedAt: '',
    customFields: {}
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
    } else {
      setFormData({
        id: '', name: '', description: '', price: '' as any, taxRate: 0, tax: 0,
        stock: '' as any, quantity: 1 as any, sku: '', hsnCode: '', category: '', imageUrl: '',
        createdAt: '', updatedAt: '', customFields: {}
      });
    }
  }, [initialProduct, open]);


  const handleChange = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productToSave = {
        ...formData,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        taxRate: Number(formData.taxRate) || 0,
        quantity: Number(formData.quantity) || 0
      };

      const result = initialProduct?.id 
        ? await updateProduct(productToSave)
        : await createProduct(productToSave);
      
      if (onSave) onSave(result);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const renderIndustryForm = () => {
    return (
      <DynamicIndustryForm
        formData={formData}
        setFormData={setFormData}
        onChange={handleChange}
        formStructure={formStructure}
        loading={formLoading}
        industryName={user?.industry?.name}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <InventoryIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {initialProduct ? 'Edit Product' : 'Add Product'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
             {user?.industry?.name && (
               <Chip 
                 icon={<IndustryIcon />} 
                 label={`${user.industry.name} Mode`} 
                 size="small" 
                 color="primary" 
                 variant="outlined"
                 sx={{ fontWeight: 'bold' }}
               />
             )}
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, bgcolor: '#f1f5f9' }}>
          {submitError && (
            <Box mb={2}>
              <Typography color="error" variant="body2" sx={{ bgcolor: '#fee2e2', p: 1.5, borderRadius: 1 }}>
                {submitError}
              </Typography>
            </Box>
          )}
          {renderIndustryForm()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>Discard</Button>
          <LoadingButton type="submit" variant="contained" loading={loading} startIcon={<SaveIcon />} sx={{ borderRadius: 2, px: 4 }}>
            {initialProduct ? 'Update Inventory' : 'Add to Catalog'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
