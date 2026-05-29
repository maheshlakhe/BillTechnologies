import React from 'react';
import { Grid, TextField, Box, Typography } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { Product } from '../../../types/product';

interface BasicInfoSectionProps {
  formData: Product;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onChange }) => (
  <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569' }}>
      <DescriptionIcon fontSize="small" sx={{ color: 'primary.main' }} /> General Details
    </Typography>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 8 }}>
        <TextField
          fullWidth
          label="Product/Service Name"
          value={formData.name}
          onChange={onChange('name')}
          variant="outlined"
          placeholder="e.g. Premium Coffee Beans"
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="SKU / Barcode"
          value={formData.sku}
          onChange={onChange('sku')}
          variant="outlined"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Detailed Description"
          value={formData.description}
          onChange={onChange('description')}
          multiline
          rows={2}
          variant="outlined"
        />
      </Grid>
    </Grid>
  </Box>
);
