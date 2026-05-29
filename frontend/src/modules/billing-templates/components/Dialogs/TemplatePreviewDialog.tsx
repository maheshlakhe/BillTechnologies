import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { modernTheme } from '../../../../theme/theme';
import { InvoiceTemplate, BILL_SIZE_DIMENSIONS, BillSize } from '../../core';
import { MOCK_BILL, MOCK_PO } from '../../core/mockData';
import BillTemplateRenderer from '../../BillTemplateRenderer';

interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  template: InvoiceTemplate | null;
  onSelect: (id: string) => void;
}

const TemplatePreviewDialog: React.FC<TemplatePreviewDialogProps> = ({
  open,
  onClose,
  template,
  onSelect,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      setRenderKey(prev => prev + 1);
      setIsReady(false);
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      return () => {
        clearTimeout(timer);
        setIsReady(false);
      };
    }
  }, [open, template]);

  if (!template) return null;

  return (
    <Dialog
      key={`${template.id}-${renderKey}`}
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: '#fff',
          backgroundImage: 'none',
          color: '#0F172A',
        }
      }}
    >
      <ThemeProvider theme={modernTheme}>
        <DialogTitle sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          color: '#0F172A',
          zIndex: 10
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight="bold">Design Preview: {template.name}</Typography>
            {template.isDefault && (
              <Chip label="Current Default" size="small" color="success" icon={<CheckIcon />} />
            )}
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: '#0F172A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{
          p: { xs: 0, sm: 4 },
          bgcolor: '#f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100%'
        }}>
          {isReady ? (
            <Paper elevation={isMobile ? 0 : 6} sx={{
              width: isMobile ? '100%' : BILL_SIZE_DIMENSIONS[(template.settings.billSize as BillSize) || 'A4'].width,
              height: isMobile ? 'auto' : BILL_SIZE_DIMENSIONS[(template.settings.billSize as BillSize) || 'A4'].height,
              minHeight: isMobile ? 'auto' : BILL_SIZE_DIMENSIONS[(template.settings.billSize as BillSize) || 'A4'].height,
              bgcolor: '#fff',
              my: { xs: 0, sm: 4 },
              borderRadius: isMobile ? 0 : 1,
              overflow: 'hidden',
              boxShadow: isMobile ? 'none' : '0 10px 40px rgba(0,0,0,0.1)'
            }}>
              <BillTemplateRenderer
                template={template}
                saleData={template.id.toLowerCase().includes('po_') || template.name.toLowerCase().includes('purchase order') ? MOCK_PO : undefined}
                bill={!(template.id.toLowerCase().includes('po_') || template.name.toLowerCase().includes('purchase order')) ? MOCK_BILL : undefined}
                size={template.settings.billSize}
                billType={template.name}
              />
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <CircularProgress size={32} />
              <Typography sx={{ mt: 2 }} color="text.secondary">Preparing HD Preview...</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1
        }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth={isMobile}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          {!template.isDefault && (
            <Button
              variant="contained"
              onClick={() => { onSelect(template.id); onClose(); }}
              fullWidth={isMobile}
              sx={{ borderRadius: 2 }}
            >
              Set as Default Template
            </Button>
          )}
        </DialogActions>
      </ThemeProvider>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
