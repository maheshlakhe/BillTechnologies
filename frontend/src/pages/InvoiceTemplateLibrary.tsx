import React from 'react';
import { Box } from '@mui/material';
import POTemplateLibrary from '../modules/billing-templates/POTemplateLibrary';

/**
 * Invoice Template Library Page
 * Standalone page for managing templates (Invoices & POs)
 */
const InvoiceTemplateLibraryPage: React.FC = () => {
  return (
    <Box>
      <POTemplateLibrary initialTab="Invoice" />
    </Box>
  );
};

export default InvoiceTemplateLibraryPage;
