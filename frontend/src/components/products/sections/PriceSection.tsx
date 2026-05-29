import React from 'react';
import { Grid, TextField, Box, MenuItem, IconButton, InputAdornment, Switch, Typography } from '@mui/material';
import { CurrencyRupee as PriceIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Product } from '../../../types/product';
import { SectionHeader } from './SectionHeader';
import { IndustryField, IndustryDropdownOption } from '../../../hooks/useIndustryFields';

interface PriceSectionProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  industryFields?: IndustryField[];
}

const PRICE_KEYWORDS = ['price', 'mrp', 'discount', 'tax', 'cost', 'gst', 'billing', 'commercial', 'hsn', 'currency', 'rate', 'charge', 'fee', 'vat', 'amount', 'payment', 'sale'];
const INVENTORY_KEYWORDS = ['stock', 'quantity', 'warehouse', 'rack', 'bin', 'shelf', 'expiry', 'batch', 'serial', 'unit', 'reorder', 'supplier', 'inventory', 'location', 'aisle', 'level', 'weight', 'dimension', 'volume'];

export const PriceSection: React.FC<PriceSectionProps> = ({ formData, setFormData, onChange, industryFields = [] }) => {
  
  const priceIndustryFields = industryFields.filter(f => {
    const name = (f.name + ' ' + f.label).toLowerCase();
    const isPrice = PRICE_KEYWORDS.some(k => name.includes(k));
    const isInventory = INVENTORY_KEYWORDS.some(k => name.includes(k));
    return isPrice && !isInventory;
  });

  const activeFields = priceIndustryFields.filter(f => formData.customFields?.[f.name] !== undefined);

  const handleSelectField = (field: IndustryField) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [field.name]: field.dataType.toLowerCase() === 'boolean' ? false : ''
      }
    }));
  };

  const handleRemoveField = (fieldName: string) => {
    const newCustomFields = { ...formData.customFields };
    delete newCustomFields[fieldName];
    setFormData(prev => ({ ...prev, customFields: newCustomFields }));
  };

  return (
    <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <SectionHeader 
        title="Price" 
        icon={<PriceIcon fontSize="small" />} 
        allIndustryFields={industryFields}
        formData={formData}
        onSelectField={handleSelectField}
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Selling Price"
            type="number"
            value={formData.price || ''}
            onChange={onChange('price')}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="MRP"
            type="number"
            value={formData.mrp || ''}
            onChange={onChange('mrp')}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Discount"
            type="number"
            value={formData.discount || ''}
            onChange={onChange('discount')}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            label="Tax Percent"
            value={formData.taxRate || ''}
            onChange={onChange('taxRate')}
          >
            {[0, 5, 12, 18, 28].map((tax) => (
              <MenuItem key={tax} value={tax}>{tax}%</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Dynamic Industry Fields */}
        {activeFields.map((field) => (
          <Grid size={{ xs: 12, md: 4 }} key={field.id}>
            <Box sx={{ position: 'relative' }}>
              {field.dataType.toLowerCase() === 'boolean' ? (
                <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
                  <Typography variant="body2" fontWeight="medium">{field.label}</Typography>
                  <Switch 
                    checked={!!formData.customFields?.[field.name]} 
                    onChange={(e) => setFormData(p => ({ ...p, customFields: { ...p.customFields, [field.name]: e.target.checked } }))} 
                  />
                </Box>
              ) : field.dataType.toLowerCase() === 'dropdown' || field.dataType.toLowerCase() === 'select' ? (
                <TextField 
                  select 
                  fullWidth 
                  label={field.label} 
                  value={formData.customFields?.[field.name] || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, customFields: { ...p.customFields, [field.name]: e.target.value } }))} 
                >
                  {field.group?.options ? (
                    field.group.options.map((opt: IndustryDropdownOption) => <MenuItem key={opt.id} value={opt.value}>{opt.label}</MenuItem>)
                  ) : field.options ? (
                    (() => {
                      try {
                        return (JSON.parse(field.options) as string[]).map((opt: string) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>);
                      } catch (e) {
                        return null;
                      }
                    })()
                  ) : null}
                </TextField>
              ) : (
                <TextField 
                  fullWidth 
                  label={field.label} 
                  type={
                    field.dataType.toLowerCase() === 'number' || field.dataType.toLowerCase() === 'decimal' ? 'number' : 
                    field.dataType.toLowerCase() === 'date' ? 'date' :
                    field.dataType.toLowerCase() === 'datetime' ? 'datetime-local' : 'text'
                  }
                  multiline={field.dataType.toLowerCase() === 'textarea'}
                  rows={field.dataType.toLowerCase() === 'textarea' ? 3 : 1}
                  value={formData.customFields?.[field.name] || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, customFields: { ...p.customFields, [field.name]: e.target.value } }))} 
                  InputLabelProps={(field.dataType.toLowerCase() === 'date' || field.dataType.toLowerCase() === 'datetime') ? { shrink: true } : undefined}
                />
              )}
              <IconButton 
                size="small" 
                onClick={() => handleRemoveField(field.name)}
                sx={{ position: 'absolute', right: -10, top: -10, bgcolor: 'error.light', color: 'white', '&:hover': { bgcolor: 'error.main' }, width: 20, height: 20 }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
