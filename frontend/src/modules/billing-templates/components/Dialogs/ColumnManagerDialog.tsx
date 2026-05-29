import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Tune as TuneIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  TextFields as TextIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Link as LinkIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import {
  InvoiceTemplate,
  SIZE_CONFIG,
  BILL_SIZE_COLUMN_LIMITS,
} from '../../core';

const AVAILABLE_DB_FIELDS = [
  { label: 'Product Name', value: 'productName' },
  { label: 'HSN/SAC', value: 'product.hsn' },
  { label: 'Quantity', value: 'quantity' },
  { label: 'Unit Rate', value: 'price' },
  { label: 'Tax %', value: 'taxRate' },
  { label: 'Tax Amount', value: 'taxAmount' },
  { label: 'Item Total', value: 'total' },
  { label: 'Batch Number', value: 'product.batchNumber' },
  { label: 'Expiry Date', value: 'product.expiryDate' },
  { label: 'Description', value: 'product.description' },
  { label: 'SKU', value: 'product.sku' },
  { label: 'Category', value: 'product.category' }
];

const detectTypeFromName = (name: string): string => {
  const n = name.toLowerCase();
  if (
    n.includes('date') || n.includes('mfg') || n.includes('exp') || 
    n.includes('time') || n.includes('dob') || n.includes('day') || 
    n.includes('anniversary') || n.includes('billing')
  ) return 'DATE';
  
  if (
    n.includes('qty') || n.includes('price') || n.includes('amount') || 
    n.includes('cost') || n.includes('total') || n.includes('count') || 
    n.includes('id') || n.includes('num')
  ) return 'INTEGER';

  if (
    n.includes('name') || n.includes('description') || n.includes('label') || 
    n.includes('title') || n.includes('note') || n.includes('comment') || 
    n.includes('msg') || n.includes('address')
  ) return 'TEXT';

  return 'TEXT';
};

interface ColumnManagerDialogProps {
  open: boolean;
  onClose: () => void;
  template: InvoiceTemplate;
  onSave: (template: InvoiceTemplate, stayOpen?: boolean) => void;
  showNotification: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const ColumnManagerDialog: React.FC<ColumnManagerDialogProps> = ({
  open,
  onClose,
  template,
  onSave,
  showNotification,
}) => {
  const [dynamicColumns, setDynamicColumns] = useState<any[]>([]);

  const currentSize = template.settings.billSize;
  const limits = BILL_SIZE_COLUMN_LIMITS[currentSize] || { min: 1, max: 12, default: 5 };

  useEffect(() => {
    if (open && template) {
      if (template.settings.dynamicColumns) {
        // Ensure defaults for new fields
        const hydrated = template.settings.dynamicColumns.map(c => ({
          ...c,
          visible: c.visible !== undefined ? c.visible : true,
          autoCapitalize: c.autoCapitalize !== undefined ? c.autoCapitalize : false
        }));
        setDynamicColumns(hydrated);
      } else {
        const initial = (template.settings.activeColumns || []).map(col => ({
          key: col.toLowerCase().replace(/ /g, '_'),
          label: template.settings.columnLabels?.[col] || col,
          type: template.settings.columnDataTypes?.[col] || 'TEXT',
          dbField: AVAILABLE_DB_FIELDS.find(f => f.label === col)?.value || 'productName',
          visible: true,
          autoCapitalize: false
        }));
        setDynamicColumns(initial);
      }
    }
  }, [open, template]);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newCols = [...dynamicColumns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCols.length) return;
    
    [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
    setDynamicColumns(newCols);
  };

  const handleUpdateCol = (index: number, updates: any) => {
    const newCols = [...dynamicColumns];
    newCols[index] = { ...newCols[index], ...updates };
    setDynamicColumns(newCols);
  };

  const handleRemoveCol = (index: number) => {
    if (dynamicColumns.filter(c => c.visible).length <= limits.min && dynamicColumns[index].visible) {
      showNotification(`Minimum ${limits.min} visible columns required`, 'warning');
      return;
    }
    setDynamicColumns(dynamicColumns.filter((_, i) => i !== index));
  };

  const handleAddCol = () => {
    if (dynamicColumns.length >= limits.max) {
      showNotification(`Maximum ${limits.max} total columns allowed`, 'warning');
      return;
    }
    setDynamicColumns([...dynamicColumns, {
      key: `custom_${Date.now()}`,
      label: 'New Column',
      type: 'TEXT',
      dbField: 'productName',
      visible: true,
      autoCapitalize: false
    }]);
  };

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      settings: {
        ...template.settings,
        activeColumns: dynamicColumns.filter(c => c.visible).map(c => c.label),
        dynamicColumns: dynamicColumns,
        // Sync labels and types for legacy compatibility
        columnLabels: dynamicColumns.reduce((acc, c) => ({ ...acc, [c.label]: c.label }), {}),
        columnDataTypes: dynamicColumns.reduce((acc, c) => ({ ...acc, [c.label]: c.type }), {}),
      }
    };
    onSave(updatedTemplate);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 3,
        background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: '#fff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1.2 }}>Manage PO Columns</Typography>
            <Typography variant="caption" color="text.secondary">Customize your layout for {currentSize} paper</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="900" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DragIcon sx={{ fontSize: 18 }} /> COLUMN HIERARCHY & SETTINGS
            </Typography>
            <Typography variant="caption" color="text.secondary">Reorder columns and configure text formatting.</Typography>
          </Box>
          <Button 
            startIcon={<AddIcon />} 
            size="medium" 
            variant="contained" 
            onClick={handleAddCol} 
            disabled={dynamicColumns.length >= limits.max}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Add New Column
          </Button>
        </Box>

        <Stack spacing={2}>
          {dynamicColumns.map((col, index) => (
            <Paper 
              key={col.key || index} 
              elevation={0} 
              sx={{ 
                p: (theme) => theme.spacing(2, 3), 
                border: '1px solid',
                borderColor: col.visible ? '#e2e8f0' : '#cbd5e1',
                borderRadius: 4,
                bgcolor: col.visible ? '#fff' : '#f1f5f9',
                opacity: col.visible ? 1 : 0.8,
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: 'primary.light' }
              }}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                {/* REORDER CONTROLS */}
                <Stack spacing={0.5}>
                  <IconButton size="small" onClick={() => handleMove(index, 'up')} disabled={index === 0} sx={{ border: '1px solid #e2e8f0' }}>
                    <UpIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleMove(index, 'down')} disabled={index === dynamicColumns.length - 1} sx={{ border: '1px solid #e2e8f0' }}>
                    <DownIcon fontSize="inherit" />
                  </IconButton>
                </Stack>

                {/* MAIN CONFIG */}
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                      variant="standard"
                      placeholder="Column Header"
                      value={col.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateCol(index, { 
                          label: val,
                          type: detectTypeFromName(val)
                        });
                      }}
                      sx={{ 
                        flexGrow: 1,
                        '& .MuiInput-root': { fontSize: '1.1rem', fontWeight: 700 }
                      }}
                    />
                    <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
                      <Select
                        value={col.type || 'TEXT'}
                        onChange={(e) => handleUpdateCol(index, { type: e.target.value })}
                        sx={{ borderRadius: 2, fontSize: '0.875rem', height: 32 }}
                      >
                        <MenuItem value="TEXT">Text</MenuItem>
                        <MenuItem value="INTEGER">Quantity/Number</MenuItem>
                        <MenuItem value="DATE">Dates</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack direction="row" spacing={4} alignItems="center">
                    <FormControl size="small" sx={{ flexGrow: 1 }}>
                      <Select
                        value={col.dbField || ''}
                        displayEmpty
                        onChange={(e) => handleUpdateCol(index, { dbField: e.target.value })}
                        sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32, bgcolor: 'rgba(59, 130, 246, 0.04)' }}
                        renderValue={(selected) => (
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <LinkIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                             {selected ? AVAILABLE_DB_FIELDS.find(f => f.value === selected)?.label : 'Select Data Source'}
                           </Box>
                        )}
                      >
                        {AVAILABLE_DB_FIELDS.map(f => (
                          <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.875rem' }}>{f.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Tooltip title="Auto-Capitalize First Letter">
                        <FormControlLabel
                          control={
                            <Switch 
                              size="small" 
                              checked={col.autoCapitalize} 
                              onChange={(e) => handleUpdateCol(index, { autoCapitalize: e.target.checked })}
                            />
                          }
                          label={<TextIcon sx={{ fontSize: 18, color: col.autoCapitalize ? 'primary.main' : 'text.disabled' }} />}
                        />
                      </Tooltip>

                      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />

                      <Tooltip title={col.visible ? 'Visible on PO' : 'Hidden on PO'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateCol(index, { visible: !col.visible })}
                          color={col.visible ? 'primary' : 'default'}
                          sx={{ border: '1px solid #e2e8f0' }}
                        >
                          {col.visible ? <VisibleIcon fontSize="small" /> : <HiddenIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleRemoveCol(index)}
                        sx={{ border: '1px solid #fed7d7' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} variant="text" color="inherit" sx={{ fontWeight: 600 }}>Discard Changes</Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          sx={{ 
            px: 4, 
            borderRadius: 3, 
            fontWeight: 800, 
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' 
          }}
        >
          Save & Apply Layout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnManagerDialog;
