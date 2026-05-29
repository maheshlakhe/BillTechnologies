import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, useTheme, Avatar } from '@mui/material';
import { Build, Save, AddCircleOutline, Handyman, BugReport } from '@mui/icons-material';

const MockServiceTicket: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [issue, setIssue] = useState('');
  const [assignee, setAssignee] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setIssue(''); setAssignee(''); setShowSuccess(false); setIsSaving(false); setIsOpen(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      setIsOpen(true);
      await new Promise(r => setTimeout(r, 1000));
      if (!isMounted) return;

      const tIssue = "Server Maintenance & Optimization";
      for (let i = 0; i <= tIssue.length; i++) {
        setIssue(tIssue.substring(0, i));
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      const tAssignee = "John Doe (Lead Tech)";
      for (let i = 0; i <= tAssignee.length; i++) {
        setAssignee(tAssignee.substring(0, i));
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
        <Typography variant="h4" fontWeight="bold">Service Tickets</Typography>
        <Button variant="contained" startIcon={<AddCircleOutline />} sx={{ borderRadius: 2 }}>New Ticket</Button>
      </Box>

      {isOpen ? (
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto', width: '100%', mt: 4, animation: 'fadeIn 0.3s ease-in-out' }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>Create Service Ticket</Typography>
          <TextField fullWidth label="Issue Description" value={issue} sx={{ mb: 3 }} InputProps={{
            startAdornment: <InputAdornment position="start"><BugReport color="primary" /></InputAdornment>
          }}/>
          <TextField fullWidth label="Assign To" value={assignee} sx={{ mb: 4 }} InputProps={{
            startAdornment: <InputAdornment position="start"><Handyman color="primary" /></InputAdornment>
          }}/>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="contained" color={showSuccess ? "success" : "primary"} startIcon={<Save />} sx={{ width: 160 }}>
              {showSuccess ? 'Assigned!' : (isSaving ? 'Assigning...' : 'Create Ticket')}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {showSuccess && (
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: 350, border: '1px solid', borderColor: 'warning.main', animation: 'fadeIn 0.5s ease' }}>
              <Avatar sx={{ bgcolor: '#fff3e0', color: 'warning.main' }}><Build /></Avatar>
              <Box><Typography variant="h6" fontWeight="bold" color="warning.main">TKT-890</Typography><Typography variant="body2">{issue}</Typography></Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};
export default MockServiceTicket;
