import React from 'react';
import { Grid, TextField, Box, MenuItem, IconButton, Switch, Typography } from '@mui/material';
import { TrendingUp as StockIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Product } from '../../../types/product';
import { SectionHeader } from './SectionHeader';
import { useWarehouses } from '../../../hooks/useWarehouses';
import { IndustryField, IndustryDropdownOption } from '../../../hooks/useIndustryFields';

interface InventorySectionProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  industryFields?: IndustryField[];
}

const INVENTORY_KEYWORDS = ['stock', 'quantity', 'warehouse', 'rack', 'bin', 'shelf', 'expiry', 'batch', 'serial', 'unit', 'reorder', 'supplier', 'inventory', 'location', 'aisle', 'level', 'weight', 'dimension', 'volume'];

export const InventorySection: React.FC<InventorySectionProps> = ({ formData, setFormData, onChange, industryFields = [] }) => {
  const { warehouses } = useWarehouses();

  const inventoryIndustryFields = industryFields.filter(f => {
    const name = (f.name + ' ' + f.label).toLowerCase();
    const isInventory = INVENTORY_KEYWORDS.some(k => name.includes(k));
    // Inventory fields take precedence if matched
    return isInventory;
  });

  const activeFields = inventoryIndustryFields.filter(f => formData.customFields?.[f.name] !== undefined);

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
        title="Inventory" 
        icon={<StockIcon fontSize="small" />} 
        allIndustryFields={industryFields}
        formData={formData}
        onSelectField={handleSelectField}
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            value={formData.stock || ''}
            onChange={onChange('stock')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Minimum Stock"
            type="number"
            value={formData.minStockLevel || ''}
            onChange={onChange('minStockLevel')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            label="Unit"
            value={formData.unit || ''}
            onChange={onChange('unit')}
          >
            {['Piece', 'Kg', 'Gram', 'Liter', 'ml', 'Meter', 'Feet', 'Box', 'Packet', 'Set'].map((unit) => (
              <MenuItem key={unit} value={unit}>{unit}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            select
            label="Warehouse"
            value={formData.warehouse || ''}
            onChange={onChange('warehouse')}
          >
            {warehouses.length > 0 ? (
              warehouses.map((wh) => (
                <MenuItem key={wh.id} value={wh.name}>{wh.name}</MenuItem>
              ))
            ) : (
              <MenuItem value="Main Warehouse">Main Warehouse</MenuItem>
            )}
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
