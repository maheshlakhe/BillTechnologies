import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, alpha, useTheme, Card, CardContent, Avatar } from '@mui/material';
import { Inventory, Save, AddCircleOutline, Category, LocalOffer, ConfirmationNumber } from '@mui/icons-material';

const MockProductForm: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setName(''); setPrice(''); setStock(''); setShowSuccess(false); setIsSaving(false); setIsOpen(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Click Add Product
      setIsOpen(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Type Name
      const tName = "Premium Cloud Hosting";
      for (let i = 0; i <= tName.length; i++) {
        setName(tName.substring(0, i));
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // Type Price
      const tPrice = "4500.00";
      for (let i = 0; i <= tPrice.length; i++) {
        setPrice(tPrice.substring(0, i));
        await new Promise(r => setTimeout(r, 30));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // Type Stock
      const tStock = "99";
      for (let i = 0; i <= tStock.length; i++) {
        setStock(tStock.substring(0, i));
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Click Save
      setIsSaving(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      
      setIsSaving(false);
      setShowSuccess(true);
      
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      setIsOpen(false); // Close modal and show list
    };

    sequence();

    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Inventory Control</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutline />}
          sx={{ borderRadius: 2, transform: isOpen ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          Add New Product
        </Button>
      </Box>

      {isOpen ? (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto', width: '100%', mt: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>Add Product Details</Typography>
          
          <TextField fullWidth label="Product Name" value={name} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Inventory color="primary" /></InputAdornment>
          }}/>
          
          <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
            <TextField fullWidth label="Selling Price" value={price} InputProps={{
              startAdornment: <InputAdornment position="start"><LocalOffer color="primary" /></InputAdornment>
            }}/>
            
            <TextField fullWidth label="Initial Stock" value={stock} InputProps={{
              startAdornment: <InputAdornment position="start"><ConfirmationNumber color="primary" /></InputAdornment>
            }}/>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit">Cancel</Button>
            <Button 
              variant="contained" 
              color={showSuccess ? "success" : "primary"}
              startIcon={<Save />}
              sx={{ width: 160 }}
            >
              {showSuccess ? 'Saved!' : (isSaving ? 'Saving...' : 'Save Product')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {showSuccess && (
            <Card sx={{ width: 300, borderRadius: 3, border: '1px solid', borderColor: 'primary.main', animation: 'fadeIn 0.5s ease' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main' }}><Inventory /></Avatar>
                  <Typography variant="h6" color="primary" fontWeight="bold">₹{price}</Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">{name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Stock: {stock} units</Typography>
              </CardContent>
            </Card>
          )}
          <Card sx={{ width: 300, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#eee', color: '#666' }}><Inventory /></Avatar>
                <Typography variant="h6" fontWeight="bold">₹2500.00</Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold">Web Development</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Stock: Unlimited</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

    </Box>
  );
};

export default MockProductForm;
