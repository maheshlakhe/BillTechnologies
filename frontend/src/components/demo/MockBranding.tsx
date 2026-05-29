import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, alpha, useTheme, Card, Avatar } from '@mui/material';
import { Palette, Save, Check } from '@mui/icons-material';

const MockBranding: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [selectedColor, setSelectedColor] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const colors = ['#305cde', '#e91e63', '#009688', '#ff9800', '#673ab7'];

  useEffect(() => {
    if (!isActive) {
      setSelectedColor(0); setShowSuccess(false); setIsSaving(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;

      // Click color 2
      setSelectedColor(2);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      // Click color 4
      setSelectedColor(4);
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;

      // Click Save
      setIsSaving(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;
      
      setIsSaving(false);
      setShowSuccess(true);
    };

    sequence();

    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Custom Branding</Typography>
        <Button 
          variant="contained" 
          startIcon={<Save />}
          color={showSuccess ? "success" : "primary"}
          sx={{ borderRadius: 2 }}
        >
          {showSuccess ? 'Saved' : (isSaving ? 'Saving...' : 'Save Brand Settings')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flex: 1 }}>
        <Paper sx={{ p: 4, borderRadius: 3, flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Palette color="primary" /> Select Brand Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {colors.map((color, index) => (
              <Box 
                key={color}
                sx={{ 
                  width: 60, height: 60, borderRadius: '50%', bgcolor: color, 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: selectedColor === index ? '4px solid' : 'none',
                  borderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
                  transform: selectedColor === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: 3
                }}
              >
                {selectedColor === index && <Check sx={{ color: '#fff' }} />}
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ bgcolor: colors[selectedColor], p: 3, color: '#fff', transition: 'background-color 0.5s ease' }}>
            <Typography variant="h6" fontWeight="bold">Invoice Preview</Typography>
          </Box>
          <Box sx={{ p: 4, flex: 1, bgcolor: '#f5f5f5' }}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 2, borderTop: `8px solid ${colors[selectedColor]}`, transition: 'border-color 0.5s ease' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Avatar sx={{ bgcolor: alpha(colors[selectedColor], 0.2), color: colors[selectedColor], width: 60, height: 60 }}>LOGO</Avatar>
                <Typography variant="h4" fontWeight="bold" sx={{ color: colors[selectedColor] }}>INVOICE</Typography>
              </Box>
              <Box sx={{ height: 20, bgcolor: '#eee', width: '60%', mb: 2, borderRadius: 1 }} />
              <Box sx={{ height: 20, bgcolor: '#eee', width: '40%', mb: 4, borderRadius: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                <Button variant="contained" sx={{ bgcolor: colors[selectedColor], '&:hover': { bgcolor: colors[selectedColor] } }}>Pay Now</Button>
              </Box>
            </Card>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};

export default MockBranding;
