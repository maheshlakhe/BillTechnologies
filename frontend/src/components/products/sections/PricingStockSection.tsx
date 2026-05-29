import React from 'react';
import { Grid, TextField, Box, Typography, Stack, InputAdornment } from '@mui/material';
import { CurrencyRupee as PriceIcon, TrendingUp as StockIcon } from '@mui/icons-material';
import { Product } from '../../../types/product';

interface PricingStockSectionProps {
  formData: Product;
  onChange: (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PricingStockSection: React.FC<PricingStockSectionProps> = ({ formData, onChange }) => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
        <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569' }}>
          <PriceIcon fontSize="small" sx={{ color: 'primary.main' }} /> Commercials
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Selling Price"
            type="number"
            value={formData.price}
            onChange={onChange('price')}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            fullWidth
            label="GST Rate"
            type="number"
            value={formData.taxRate}
            onChange={onChange('taxRate')}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          />
        </Stack>
      </Box>
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
        <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569' }}>
          <StockIcon fontSize="small" sx={{ color: 'primary.main' }} /> Inventory Policy
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Current Stock Level"
            type="number"
            value={formData.stock}
            onChange={onChange('stock')}
          />
          <TextField
            fullWidth
            label="Low Stock Warning Threshold"
            type="number"
            value={formData.quantity}
            onChange={onChange('quantity')}
          />
        </Stack>
      </Box>
    </Grid>
  </Grid>
);
