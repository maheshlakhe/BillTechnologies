import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { InvoiceTemplate, BILL_SIZE_DIMENSIONS, BillSize } from '../core';
import { MOCK_BILL, MOCK_PO } from '../core/mockData';
import BillTemplateRenderer from '../BillTemplateRenderer';

interface PreviewCanvasProps {
  template: InvoiceTemplate | null;
  selectedSize: BillSize | '';
  isSaving: boolean;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  template,
  selectedSize,
  isSaving
}) => {
  if (!selectedSize) {
    return (
      <Box sx={{
        flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9',
        borderRadius: 4, border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <SettingsIcon sx={{ fontSize: 120, color: 'rgba(0,0,0,0.1)', mb: 3 }} />
        <Typography variant="h4" fontWeight="950" color="text.secondary">
          Select a Page Size
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Choose a configuration from the sidebar to begin previewing designs.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>


      {/* CANVAS AREA */}
      <Box sx={{
        flexGrow: 1,
        bgcolor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        p: 1,
        pt: 0.5,
        border: '1px solid rgba(0,0,0,0.04)',
        position: 'relative',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <Paper elevation={6} sx={{
          width: BILL_SIZE_DIMENSIONS[selectedSize as BillSize]?.width || '210mm',
          height: BILL_SIZE_DIMENSIONS[selectedSize as BillSize]?.height === 'auto' ? 'auto' : BILL_SIZE_DIMENSIONS[selectedSize as BillSize]?.height,
          minHeight: BILL_SIZE_DIMENSIONS[selectedSize as BillSize]?.height || '297mm',
          bgcolor: '#fff',
          borderRadius: 1,
          overflow: 'hidden',
          transition: 'all 0.5s ease',
          boxShadow: '0 20px 50px rgba(0,0,0,0.12)'
        }}>
          {template ? (
            <BillTemplateRenderer
              template={template}
              bill={(template.id.includes('purchase_order') || template.name.toLowerCase().includes('purchase order')) ? MOCK_PO : MOCK_BILL}
              size={selectedSize as BillSize}
              billType={template.name}
            />
          ) : (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography color="text.secondary">No template selected for this size.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PreviewCanvas;
