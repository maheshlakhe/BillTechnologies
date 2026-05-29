import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, List, ListItem, ListItemButton, 
  ListItemText, Divider, alpha, useTheme 
} from '@mui/material';
import { Add as AddIcon, ContactSupport as SupportIcon } from '@mui/icons-material';
import { IndustryField } from '../../../hooks/useIndustryFields';
import { Product } from '../../../types/product';

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  allIndustryFields?: IndustryField[];
  formData: Product;
  onSelectField?: (field: IndustryField) => void;
}

const PRICE_KEYWORDS = ['price', 'mrp', 'discount', 'tax', 'cost', 'gst', 'billing', 'commercial', 'hsn', 'currency', 'rate', 'charge', 'fee', 'vat', 'amount', 'payment', 'sale'];
const INVENTORY_KEYWORDS = ['stock', 'quantity', 'warehouse', 'rack', 'bin', 'shelf', 'expiry', 'batch', 'serial', 'unit', 'reorder', 'supplier', 'inventory', 'location', 'aisle', 'level', 'weight', 'dimension', 'volume'];

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  icon, 
  allIndustryFields = [], 
  formData,
  onSelectField 
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleRequestNew = () => {
    window.location.href = `mailto:support@agbtechnologies.com?subject=Custom Column Request - ${title}&body=I need a new column for ${title} section. Details:`;
  };

  // Filter out fields already in the form
  const availableFields = allIndustryFields.filter(f => !formData.customFields?.[f.name]);

  // Cluster fields
  const priceFields = availableFields.filter(f => {
    const name = (f.name + ' ' + f.label).toLowerCase();
    return PRICE_KEYWORDS.some(k => name.includes(k)) && !INVENTORY_KEYWORDS.some(k => name.includes(k));
  });

  const inventoryFields = availableFields.filter(f => {
    const name = (f.name + ' ' + f.label).toLowerCase();
    return INVENTORY_KEYWORDS.some(k => name.includes(k));
  });

  const generalFields = availableFields.filter(f => {
    const name = (f.name + ' ' + f.label).toLowerCase();
    const isPrice = PRICE_KEYWORDS.some(k => name.includes(k));
    const isInventory = INVENTORY_KEYWORDS.some(k => name.includes(k));
    return !isPrice && !isInventory;
  });

  const renderFieldList = (fields: IndustryField[], groupLabel: string) => (
    <>
      <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', bgcolor: '#f8fafc', color: 'text.secondary', fontWeight: 'bold' }}>
        {groupLabel.toUpperCase()}
      </Typography>
      <List sx={{ pt: 0 }}>
        {fields.map((field) => (
          <ListItem key={field.id} disablePadding>
            <ListItemButton onClick={() => { onSelectField?.(field); setOpen(false); }}>
              <ListItemText 
                primary={field.label} 
                secondary={field.dataType} 
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </>
  );

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
      <Typography variant="subtitle2" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569' }}>
        <Box component="span" sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        {title}
      </Typography>
      
      <Box display="flex" gap={1}>
        {onSelectField && (
          <Tooltip title={`Add Industry Field to ${title}`}>
            <IconButton 
              size="small" 
              onClick={() => setOpen(true)}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 24,
                height: 24
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
          <AddIcon color="primary" /> Add Column
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: '60vh' }}>
          {priceFields.length > 0 && renderFieldList(priceFields, 'Commercials / Price')}
          {inventoryFields.length > 0 && renderFieldList(inventoryFields, 'Inventory / Stock')}
          {generalFields.length > 0 && renderFieldList(generalFields, 'General Details')}
          
          {availableFields.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No more industry-specific fields available to add.
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Can't find what you're looking for?
            </Typography>
            <Button 
              fullWidth 
              size="small" 
              startIcon={<SupportIcon />} 
              onClick={handleRequestNew}
              sx={{ justifyContent: 'flex-start' }}
            >
              Contact Admin for Custom Column
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
