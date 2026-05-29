import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, useTheme, Avatar, Switch } from '@mui/material';
import { Security, AdminPanelSettings, PersonAdd } from '@mui/icons-material';

const MockAdminPanel: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setIsAdmin(false); setShowSuccess(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 2000));
      if (!isMounted) return;

      setIsAdmin(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      setShowSuccess(true);
    };

    sequence();
    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Admin & Team</Typography>
        <Button variant="contained" startIcon={<PersonAdd />} sx={{ borderRadius: 2 }}>Invite Member</Button>
      </Box>

      <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9f9f9', display: 'flex', gap: 2, alignItems: 'center' }}>
          <AdminPanelSettings color="primary" />
          <Typography variant="h6" fontWeight="bold">Role Management</Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>S</Avatar>
              <Box>
                <Typography fontWeight="bold">Sarah Jenkins</Typography>
                <Typography variant="body2" color="text.secondary">sarah@billsoft.com</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography fontWeight="bold" color={isAdmin ? "primary" : "text.secondary"}>
                {isAdmin ? 'Admin Access' : 'Standard User'}
              </Typography>
              <Switch checked={isAdmin} color="primary" />
            </Box>
          </Box>
          
          {showSuccess && (
            <Typography color="success.main" variant="body2" fontWeight="bold" align="right" sx={{ animation: 'fadeIn 0.3s ease' }}>
              Permissions updated successfully.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
export default MockAdminPanel;
