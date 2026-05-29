import React from 'react';
import { Box } from '@mui/material';
import LogoUpload from './LogoUpload';

const BusinessProfileSettings: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <LogoUpload />
    </Box>
  );
};

export default BusinessProfileSettings;
