import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, useTheme, Avatar } from '@mui/material';
import { AccountBalanceWallet, Save, AddCircleOutline, Description, AttachMoney } from '@mui/icons-material';

const MockExpenseForm: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setAmount(''); setDesc(''); setShowSuccess(false); setIsSaving(false); setIsOpen(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      setIsOpen(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      const tAmount = "1500.00";
      for (let i = 0; i <= tAmount.length; i++) {
        setAmount(tAmount.substring(0, i));
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      const tDesc = "Office Supplies & Marketing";
      for (let i = 0; i <= tDesc.length; i++) {
        setDesc(tDesc.substring(0, i));
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
        <Typography variant="h4" fontWeight="bold">Expense Management</Typography>
        <Button variant="contained" startIcon={<AddCircleOutline />} sx={{ borderRadius: 2 }}>Add Expense</Button>
      </Box>

      {isOpen ? (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto', width: '100%', mt: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>Record New Expense</Typography>
          <TextField fullWidth label="Amount" value={amount} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><AttachMoney color="primary" /></InputAdornment>
          }}/>
          <TextField fullWidth label="Description" value={desc} sx={{ mb: 4 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Description color="primary" /></InputAdornment>
          }}/>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="contained" color={showSuccess ? "success" : "primary"} startIcon={<Save />} sx={{ width: 160 }}>
              {showSuccess ? 'Recorded!' : (isSaving ? 'Saving...' : 'Save Expense')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {showSuccess && (
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: 350, border: '1px solid', borderColor: 'error.main', animation: 'fadeIn 0.5s ease' }}>
              <Avatar sx={{ bgcolor: '#ffebee', color: 'error.main' }}><AccountBalanceWallet /></Avatar>
              <Box><Typography variant="h6" fontWeight="bold" color="error">₹{amount}</Typography><Typography variant="body2">{desc}</Typography></Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
export default MockExpenseForm;
