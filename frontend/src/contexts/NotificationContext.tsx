import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography,
  useTheme
} from '@mui/material';
import { 
  WarningAmber as WarningIcon, 
  InfoOutlined as InfoIcon, 
  CheckCircleOutline as SuccessIcon, 
  ErrorOutline as ErrorIcon,
  SearchOff as NoDataIcon
} from '@mui/icons-material';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'no-data';

interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  variant?: 'toast' | 'modal';
  onConfirm?: () => void;
  confirmLabel?: string;
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showNoData: (message?: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const [toast, setToast] = useState<{ open: boolean; options: NotificationOptions }>({
    open: false,
    options: { message: '', type: 'info' }
  });
  const [modal, setModal] = useState<{ open: boolean; options: NotificationOptions }>({
    open: false,
    options: { message: '', type: 'info' }
  });

  const showNotification = useCallback((options: NotificationOptions) => {
    const { variant = 'toast' } = options;
    if (variant === 'toast') {
      setToast({ open: true, options });
    } else {
      setModal({ open: true, options });
    }
  }, []);

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleCloseModal = () => {
    setModal(prev => ({ ...prev, open: false }));
    if (modal.options.onConfirm) modal.options.onConfirm();
  };

  const showSuccess = (message: string, title?: string) => 
    showNotification({ message, title, type: 'success', variant: 'toast' });

  const showError = (message: string, title?: string) => 
    showNotification({ message, title, type: 'error', variant: 'toast' });

  const showWarning = (message: string, title?: string) => 
    showNotification({ message, title, type: 'warning', variant: 'toast' });

  const showNoData = (
    message = "It looks like there are no records available to export at the moment. Please add some entries or adjust your filters and try again.", 
    title = "No Records Found"
  ) => 
    showNotification({ 
      message, 
      title, 
      type: 'no-data', 
      variant: 'modal',
      confirmLabel: 'Understood'
    });

  const getIcon = (type?: NotificationType) => {
    switch (type) {
      case 'success': return <SuccessIcon sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'error': return <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'no-data': return <NoDataIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />;
      default: return <InfoIcon sx={{ fontSize: 40, color: 'info.main' }} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showWarning, showNoData }}>
      {children}

      {/* Reusable Toast (Option A style) */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={(toast.options.type === 'no-data' ? 'warning' : toast.options.type) as any} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: theme.shadows[6],
            fontWeight: 500
          }}
        >
          {toast.options.title && <strong>{toast.options.title}: </strong>}
          {toast.options.message}
        </Alert>
      </Snackbar>

      {/* Reusable Modal (Option B style - Centered Popup) */}
      <Dialog
        open={modal.open}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            maxWidth: 400,
            textAlign: 'center'
          }
        }}
      >
        <DialogContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
            {getIcon(modal.options.type)}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {modal.options.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {modal.options.message}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseModal} 
            variant="contained" 
            sx={{ 
              borderRadius: 2, 
              px: 4, 
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            {modal.options.confirmLabel || 'OK'}
          </Button>
        </DialogActions>
      </Dialog>

    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
