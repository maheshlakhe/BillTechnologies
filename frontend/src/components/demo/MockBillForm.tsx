import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Divider, Card, InputAdornment, alpha, useTheme
} from '@mui/material';
import { Add, Delete, Save, Person, Receipt } from '@mui/icons-material';

const MockBillForm: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState<{name: string, qty: number, price: number}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation Sequence
  useEffect(() => {
    if (!isActive) {
      setCustomer('');
      setItems([]);
      setShowSuccess(false);
      setIsSaving(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      // 1. Wait a bit
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // 2. Type customer name "Acme Corporation"
      const customerName = "Acme Corporation";
      for (let i = 0; i <= customerName.length; i++) {
        setCustomer(customerName.substring(0, i));
        await new Promise(r => setTimeout(r, 50));
      }

      await new Promise(r => setTimeout(r, 800));
      if (!isMounted) return;

      // 3. Add first item
      setItems([{ name: 'Web Development Service', qty: 1, price: 2500 }]);
      
      await new Promise(r => setTimeout(r, 1200));
      if (!isMounted) return;

      // 4. Add second item
      setItems(prev => [...prev, { name: 'Hosting (Annual)', qty: 1, price: 150 }]);

      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;

      // 5. Click Save
      setIsSaving(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      
      setIsSaving(false);
      setShowSuccess(true);
    };

    sequence();

    return () => { isMounted = false; };
  }, [isActive]);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt color="primary" /> New Invoice
        </Typography>
        <Button 
          variant={showSuccess ? "contained" : "contained"}
          color={showSuccess ? "success" : "primary"}
          startIcon={<Save />}
          sx={{ 
            boxShadow: isSaving ? 'none' : `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: isSaving ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s',
            fontWeight: 'bold',
            borderRadius: 2
          }}
        >
          {showSuccess ? 'Invoice Saved' : (isSaving ? 'Saving...' : 'Save & Generate PDF')}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <Typography variant="subtitle2" color="primary" gutterBottom fontWeight="bold">CUSTOMER DETAILS</Typography>
        <TextField 
          fullWidth 
          variant="outlined" 
          placeholder="Search or enter customer name..."
          value={customer}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
            sx: { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 2 }
          }}
          sx={{ 
            boxShadow: customer.length > 0 && customer.length < 16 ? `0 0 0 2px ${theme.palette.primary.main}` : 'none',
            transition: 'box-shadow 0.2s'
          }}
        />
      </Paper>

      <Paper sx={{ p: 0, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', flex: 1 }} elevation={0}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product/Service</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index} sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <TableCell><Typography fontWeight="bold">{item.name}</Typography></TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>₹{item.price.toFixed(2)}</TableCell>
                <TableCell>₹{(item.qty * item.price).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No items added yet. Click 'Add Item' to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            startIcon={<Add />} 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Add New Item
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Card sx={{ minWidth: 300, p: 3, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f9f9f9' }} elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography color="text.secondary">Subtotal:</Typography>
            <Typography fontWeight="bold">₹{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary">GST (18%):</Typography>
            <Typography fontWeight="bold">₹{tax.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">Total Amount:</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">₹{total.toFixed(2)}</Typography>
          </Box>
        </Card>
      </Box>

    </Box>
  );
};

export default MockBillForm;
