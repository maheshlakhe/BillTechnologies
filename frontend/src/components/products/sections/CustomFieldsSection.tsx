import React from 'react';
import { Box, Typography, Stack, TextField, IconButton, Button } from '@mui/material';
import { Settings as SettingsIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface CustomFieldsSectionProps {
  customFields: Array<{ key: string, value: string }>;
  setCustomFields: React.Dispatch<React.SetStateAction<Array<{ key: string, value: string }>>>;
}

export const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({ customFields, setCustomFields }) => (
  <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <Box display="flex" justifyContent="space-between" mb={2.5}>
      <Typography variant="subtitle2" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#475569' }}>
        <SettingsIcon fontSize="small" sx={{ color: 'primary.main' }} /> Extended Properties
      </Typography>
      <Button
        size="small"
        variant="text"
        startIcon={<AddIcon />}
        onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
      >
        Add Metadata
      </Button>
    </Box>
    <Stack spacing={2}>
      {customFields.map((cf, idx) => (
        <Box key={idx} display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Property Label (e.g. Material)"
            value={cf.key}
            onChange={(e) => setCustomFields(prev => prev.map((item, i) => i === idx ? { ...item, key: e.target.value } : item))}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            placeholder="Value"
            value={cf.value}
            onChange={(e) => setCustomFields(prev => prev.map((item, i) => i === idx ? { ...item, value: e.target.value } : item))}
            sx={{ flex: 1 }}
          />
          <IconButton
            size="small"
            color="error"
            onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Stack>
  </Box>
);
