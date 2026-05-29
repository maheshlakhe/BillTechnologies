import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config/api';

import { initiatePayment } from '../../utils/paymentUtils';

interface PaymentButtonProps {
  bill: any;
  onSuccess?: () => void;
  variant?: 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

declare global {
  interface Window {
    Juspay: any;
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  bill, 
  onSuccess, 
  variant = 'contained', 
  size = 'medium',
  fullWidth = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handlePayment = async () => {
    if (!window.Juspay) {
      setSnackbar({ open: true, message: 'Payment SDK not loaded. Please refresh.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      // 1. Create session on backend
      const response = await axios.post(`${API_URL}/payments/create-session`, {
        billId: bill.id
      });

      const { sdk_payload, order_id } = response.data;

      // 2. Open Payment Gateway using utility
      initiatePayment(sdk_payload, order_id, { billId: bill.id, type: 'BILL' });

    } catch (error: any) {
      console.error("[PaymentButton] Initiation failed", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to initiate payment.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        color="primary" 
        size={size}
        fullWidth={fullWidth}
        onClick={handlePayment} 
        disabled={loading || bill.status === 'PAID'}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
        sx={{ 
          fontWeight: 'bold',
          borderRadius: 2,
          boxShadow: variant === 'contained' ? 2 : 0
        }}
      >
        {bill.status === 'PAID' ? 'Paid' : (loading ? 'Processing...' : 'Pay Now')}
      </Button>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentButton;
