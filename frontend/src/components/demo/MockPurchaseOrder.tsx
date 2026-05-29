import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, useTheme, Avatar } from '@mui/material';
import { LocalShipping, Save, AddCircleOutline, Store } from '@mui/icons-material';

const MockPurchaseOrder: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [vendor, setVendor] = useState('');
  const [item, setItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setVendor(''); setItem(''); setShowSuccess(false); setIsSaving(false); setIsOpen(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      setIsOpen(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      const tVendor = "Tech Supplier Inc.";
      for (let i = 0; i <= tVendor.length; i++) {
        setVendor(tVendor.substring(0, i));
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      const tItem = "50x Dell Monitors";
      for (let i = 0; i <= tItem.length; i++) {
        setItem(tItem.substring(0, i));
        await new Promise(r => setTimeout(r, 30));
      }
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      setIsSaving(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      
      setIsSaving(false);
      setShowSuccess(true);
      
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      setIsOpen(false);
    };

    sequence();
    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Purchase Orders</Typography>
        <Button variant="contained" startIcon={<AddCircleOutline />} sx={{ borderRadius: 2 }}>Create PO</Button>
      </Box>

      {isOpen ? (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto', width: '100%', mt: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>New Purchase Order</Typography>
          <TextField fullWidth label="Supplier Name" value={vendor} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Store color="primary" /></InputAdornment>
          }}/>
          <TextField fullWidth label="Order Details" value={item} sx={{ mb: 4 }} InputProps={{
            startAdornment: <InputAdornment position="start"><LocalShipping color="primary" /></InputAdornment>
          }}/>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="contained" color={showSuccess ? "success" : "primary"} startIcon={<Save />} sx={{ width: 160 }}>
              {showSuccess ? 'PO Created!' : (isSaving ? 'Processing...' : 'Send Order')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {showSuccess && (
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: 350, border: '1px solid', borderColor: 'primary.main', animation: 'fadeIn 0.5s ease' }}>
              <Avatar sx={{ bgcolor: '#e3f2fd', color: 'primary.main' }}><LocalShipping /></Avatar>
              <Box><Typography variant="h6" fontWeight="bold" color="primary">PO-1002</Typography><Typography variant="body2">{vendor}</Typography></Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
export default MockPurchaseOrder;
