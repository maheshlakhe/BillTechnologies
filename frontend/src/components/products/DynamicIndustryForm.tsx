import React from 'react';
import { 
  Grid, 
  TextField, 
  Box, 
  MenuItem, 
  InputAdornment, 
  Switch, 
  Typography, 
  Stack, 
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Description as GeneralIcon,
  CurrencyRupee as PriceIcon,
  Inventory as InventoryIcon,
  Extension as CustomIcon
} from '@mui/icons-material';
import { Product } from '../../types/product';
import { FormStructureConfig, FormFieldConfig } from '../../hooks/useIndustryProductForm';

interface DynamicIndustryFormProps {
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  formStructure: FormStructureConfig | null;
  loading: boolean;
  industryName?: string;
}

export const DynamicIndustryForm: React.FC<DynamicIndustryFormProps> = ({
  formData,
  setFormData,
  onChange,
  formStructure,
  loading,
  industryName
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
        <CircularProgress size={32} thickness={5} />
        <Typography variant="body1" color="text.secondary" fontWeight="medium">
          Loading {industryName || 'Industry'} Form Structure...
        </Typography>
      </Box>
    );
  }

  if (!formStructure || !formStructure.sections) {
    return (
      <Box textAlign="center" py={6} bgcolor="white" borderRadius={3} border="1px dashed #cbd5e1">
        <Typography variant="body1" color="error" fontWeight="medium">
          Failed to load database-driven form layout for {industryName || 'your industry'}.
        </Typography>
      </Box>
    );
  }

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'general': return <GeneralIcon color="primary" fontSize="small" />;
      case 'price': return <PriceIcon color="primary" fontSize="small" />;
      case 'inventory': return <InventoryIcon color="primary" fontSize="small" />;
      default: return <CustomIcon color="primary" fontSize="small" />;
    }
  };

  const getGridSize = (fieldName: string, sectionId: string) => {
    if (sectionId === 'custom') {
      return { xs: 12, md: 4 }; // Standard 3-column layout for custom fields
    }
    switch (fieldName) {
      case 'name': return { xs: 12, md: 6 };
      case 'sku': return { xs: 12, md: 3 };
      case 'status': return { xs: 12, md: 3 };
      case 'description': return { xs: 12 };
      case 'price': return { xs: 12, md: 3 };
      case 'mrp': return { xs: 12, md: 3 };
      case 'discount': return { xs: 12, md: 3 };
      case 'taxRate': return { xs: 12, md: 3 };
      case 'stock': return { xs: 12, md: 6 };
      case 'minStockLevel': return { xs: 12, md: 6 };
      default: return { xs: 12, md: 6 };
    }
  };

  const handleCustomFieldChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: value
      }
    }));
  };

  const renderField = (field: FormFieldConfig, sectionId: string) => {
    const isCustom = sectionId === 'custom' || !(field.name in formData);
    
    // Determine the value and change handler
    let value = '';
    let handler: (e: any) => void = () => {};

    if (isCustom) {
      value = formData.customFields?.[field.name] !== undefined ? formData.customFields[field.name] : '';
      handler = (e: any) => handleCustomFieldChange(field.name, e.target.value);
    } else {
      value = (formData as any)[field.name] !== undefined ? (formData as any)[field.name] : '';
      handler = onChange(field.name as keyof Product);
    }

    const label = field.label;
    const required = !!field.required;

    // 1. Boolean Switch Field
    if (field.dataType.toLowerCase() === 'boolean') {
      const checkedValue = isCustom 
        ? !!formData.customFields?.[field.name] 
        : !!(formData as any)[field.name];
        
      const toggleHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCustom) {
          handleCustomFieldChange(field.name, e.target.checked);
        } else {
          setFormData(prev => ({ ...prev, [field.name]: e.target.checked }));
        }
      };

      return (
        <Box 
          sx={{ 
            bgcolor: '#f8fafc', 
            p: 1.5, 
            borderRadius: 2.5, 
            border: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '56px' 
          }}
        >
          <Typography variant="body2" fontWeight="medium" color="text.primary">
            {label}
          </Typography>
          <Switch 
            checked={checkedValue} 
            onChange={toggleHandler} 
            color="primary"
          />
        </Box>
      );
    }

    // 2. Select Dropdown Field
    if (field.dataType.toLowerCase() === 'select' || field.dataType.toLowerCase() === 'dropdown') {
      const selectOptions = field.options || [];
      return (
        <TextField
          select
          fullWidth
          label={label}
          value={value}
          onChange={handler}
          required={required}
        >
          {selectOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    // 3. Number / Numeric Field
    if (field.dataType.toLowerCase() === 'number' || field.dataType.toLowerCase() === 'decimal') {
      const isPriceAdornment = field.name === 'price' || field.name === 'mrp';
      const isDiscountAdornment = field.name === 'discount';

      return (
        <TextField
          fullWidth
          type="number"
          label={label}
          value={value}
          onChange={handler}
          required={required}
          InputProps={{
            startAdornment: isPriceAdornment ? <InputAdornment position="start">₹</InputAdornment> : undefined,
            endAdornment: isDiscountAdornment ? <InputAdornment position="end">%</InputAdornment> : undefined,
          }}
        />
      );
    }

    // 4. Expiry / Date Fields
    if (field.dataType.toLowerCase() === 'date') {
      return (
        <TextField
          fullWidth
          type="date"
          label={label}
          value={value}
          onChange={handler}
          required={required}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    // 5. Textarea Fields
    if (field.dataType.toLowerCase() === 'textarea') {
      return (
        <TextField
          fullWidth
          multiline
          rows={2}
          label={label}
          value={value}
          onChange={handler}
          required={required}
        />
      );
    }

    // 6. Image Field
    if (field.dataType.toLowerCase() === 'image') {
      return (
        <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
          <Typography variant="body2" fontWeight="medium" color="text.primary" mb={1}>
            {label}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Paste Image URL here..."
            value={value}
            onChange={handler}
            InputProps={{
              startAdornment: <InputAdornment position="start">🔗</InputAdornment>,
            }}
          />
          {value && (
            <Box mt={1} borderRadius={1} overflow="hidden" height={100} display="flex" justifyContent="center" alignItems="center" bgcolor="#e2e8f0">
              <img src={value as string} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
            </Box>
          )}
        </Box>
      );
    }

    // 7. Default Text Field
    return (
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={handler}
        required={required}
      />
    );
  };

  return (
    <Stack spacing={3.5}>
      {formStructure.sections.map((section) => (
        <Paper
          key={section.id}
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid #e2e8f0', 
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}
        >
          {/* Section Header */}
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              width={32} 
              height={32} 
              borderRadius={2} 
              bgcolor="#eff6ff"
            >
              {getSectionIcon(section.id)}
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              {section.title}
            </Typography>
          </Box>

          {/* Section Fields Grid */}
          <Grid container spacing={2.5}>
            {section.fields.map((field) => (
              <Grid 
                key={field.name}
                size={getGridSize(field.name, section.id)}
              >
                {renderField(field, section.id)}
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Stack>
  );
};
