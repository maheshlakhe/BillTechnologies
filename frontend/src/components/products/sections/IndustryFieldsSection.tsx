import React from 'react';
import { Box, Typography, Chip, Grid, Switch, TextField, MenuItem, alpha } from '@mui/material';
import { Translate as TranslateIcon } from '@mui/icons-material';
import { Product } from '../../../types/product';
import { IndustryField, IndustryDropdownOption } from '../../../hooks/useIndustryFields';
import { useAuth } from '../../../contexts/AuthContext';
import { useIndustryLayout } from '../../../hooks/useIndustryLayout';

interface IndustryFieldsSectionProps {
  industryName?: string;
  industryFields: IndustryField[];
  formData: Product;
  setFormData: React.Dispatch<React.SetStateAction<Product>>;
  industrySlug?: string;
}

export const IndustryFieldsSection: React.FC<IndustryFieldsSectionProps> = ({ 
  industryName, 
  industryFields, 
  formData, 
  setFormData,
  industrySlug
}) => {
  const { user } = useAuth();
  const { layout: industryConf } = useIndustryLayout(user?.industryId);
  const style = industryConf.themeStyle;

  if (industryFields.length === 0) return null;

  // Compute dynamic colors and themes
  const primaryBg = alpha(style.primaryAccent, 0.05);
  const borderStyle = `1px solid ${alpha(style.primaryAccent, 0.2)}`;
  const pillShape = style.componentShape === 'pill' ? '24px' : `${style.borderRadius}px`;

  return (
    <Box sx={{ 
      p: style.cardSpacing * 1.5, 
      bgcolor: primaryBg, 
      borderRadius: `${style.borderRadius}px`, 
      border: borderStyle,
      transition: 'all 0.3s ease'
    }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Typography variant="subtitle2" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: style.primaryAccent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <TranslateIcon fontSize="small" /> {industryName || 'Specialized'} Fields
        </Typography>
        <Chip 
          label={industryName} 
          size="small" 
          sx={{ 
            bgcolor: alpha(style.primaryAccent, 0.15), 
            color: style.primaryAccent, 
            fontWeight: 'bold',
            borderRadius: pillShape
          }} 
        />
      </Box>
      <Grid container spacing={2.5}>
        {industryFields.map((field: IndustryField) => (
          <Grid size={{ xs: 12, sm: 6 }} key={field.id}>
            {field.dataType.toLowerCase() === 'boolean' ? (
              <Box sx={{ 
                bgcolor: 'white', 
                p: 1.5, 
                borderRadius: `${style.borderRadius / 1.5}px`, 
                border: '1px solid #e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: style.primaryAccent,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }
              }}>
                <Typography variant="body2" fontWeight="medium">{field.label}</Typography>
                <Switch 
                  checked={!!formData.customFields?.[field.name] || formData.customFields?.[field.name] === 'true'} 
                  onChange={(e) => setFormData(p => ({ ...p, customFields: { ...p.customFields, [field.name]: e.target.checked } }))} 
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: style.primaryAccent,
                      '& + .MuiSwitch-track': {
                        backgroundColor: style.primaryAccent,
                      },
                    },
                  }}
                />
              </Box>
            ) : field.dataType.toLowerCase() === 'dropdown' || field.dataType.toLowerCase() === 'select' ? (
              <TextField 
                select 
                fullWidth 
                label={field.label} 
                value={formData.customFields?.[field.name] || ''} 
                onChange={(e) => setFormData(p => ({ ...p, customFields: { ...p.customFields, [field.name]: e.target.value } }))} 
                placeholder={field.placeholder}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${style.borderRadius / 1.5}px`,
                    '&:hover fieldset': {
                      borderColor: style.primaryAccent,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: style.primaryAccent,
                    },
                  },
                }}
              >
                <MenuItem value="">Select {field.label}</MenuItem>
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
                placeholder={field.placeholder}
                InputLabelProps={
                  (field.dataType.toLowerCase() === 'date' || field.dataType.toLowerCase() === 'datetime') 
                  ? { shrink: true } : undefined
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: `${style.borderRadius / 1.5}px`,
                    '&:hover fieldset': {
                      borderColor: style.primaryAccent,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: style.primaryAccent,
                    },
                  },
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
