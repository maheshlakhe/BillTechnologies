import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, alpha, useTheme, Avatar } from '@mui/material';
import { Person, Email, Phone, Business, Save, AddCircleOutline } from '@mui/icons-material';

const MockCustomerForm: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setName(''); setEmail(''); setPhone(''); setShowSuccess(false); setIsSaving(false); setIsOpen(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Click Add Customer
      setIsOpen(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Type Name
      const tName = "Global Tech Industries";
      for (let i = 0; i <= tName.length; i++) {
        setName(tName.substring(0, i));
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // Type Email
      const tEmail = "billing@globaltech.com";
      for (let i = 0; i <= tEmail.length; i++) {
        setEmail(tEmail.substring(0, i));
        await new Promise(r => setTimeout(r, 30));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // Type Phone
      const tPhone = "+91 98765 43210";
      for (let i = 0; i <= tPhone.length; i++) {
        setPhone(tPhone.substring(0, i));
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
        <Typography variant="h4" fontWeight="bold">Customer Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutline />}
          sx={{ borderRadius: 2, transform: isOpen ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.2s' }}
        >
          Add New Customer
        </Button>
      </Box>

      {isOpen ? (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto', width: '100%', mt: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>Add Customer Details</Typography>
          
          <TextField fullWidth label="Business Name" value={name} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Business color="primary" /></InputAdornment>
          }}/>
          
          <TextField fullWidth label="Email Address" value={email} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment>
          }}/>
          
          <TextField fullWidth label="Phone Number" value={phone} sx={{ mb: 4 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Phone color="primary" /></InputAdornment>
          }}/>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit">Cancel</Button>
            <Button 
              variant="contained" 
              color={showSuccess ? "success" : "primary"}
              startIcon={<Save />}
              sx={{ width: 150 }}
            >
              {showSuccess ? 'Saved!' : (isSaving ? 'Saving...' : 'Save Customer')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {showSuccess && (
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: 350, border: '1px solid', borderColor: 'primary.main', animation: 'fadeIn 0.5s ease' }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: 'primary.main', width: 56, height: 56 }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">{name}</Typography>
                <Typography variant="body2" color="text.secondary">{email}</Typography>
              </Box>
            </Paper>
          )}
          <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: 350 }}>
            <Avatar sx={{ bgcolor: '#eee', color: '#666', width: 56, height: 56 }}><Person /></Avatar>
            <Box><Typography variant="h6" fontWeight="bold">Acme Corp</Typography><Typography variant="body2" color="text.secondary">billing@acme.com</Typography></Box>
          </Paper>
        </Box>
      )}

    </Box>
  );
};

export default MockCustomerForm;
