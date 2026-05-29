import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, alpha, useTheme, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import { Assessment, Download, PlayArrow, CheckCircle } from '@mui/icons-material';

const MockReportGenerator: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  useEffect(() => {
    if (!isActive) {
      setIsGenerating(false); setProgress(0); setShowResult(false);
      return;
    }

    let isMounted = true;
    
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 1500));
      if (!isMounted) return;

      // Click Generate
      setIsGenerating(true);
      
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }
      
      if (!isMounted) return;
      setIsGenerating(false);
      setShowResult(true);
    };

    sequence();

    return () => { isMounted = false; };
  }, [isActive]);

  return (
    <Box sx={{ p: 4, height: '100%', bgcolor: 'background.default', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">GST Reports & Filing</Typography>
        <Button 
          variant={isGenerating || showResult ? "outlined" : "contained"} 
          startIcon={showResult ? <CheckCircle /> : (isGenerating ? <Assessment /> : <PlayArrow />)}
          sx={{ borderRadius: 2 }}
        >
          {showResult ? 'Generated' : (isGenerating ? 'Analyzing Data...' : 'Generate GSTR-1')}
        </Button>
      </Box>

      {!showResult && !isGenerating && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Assessment sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">Ready to generate GSTR-1 for current month.</Typography>
          </Paper>
        </Box>
      )}

      {isGenerating && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', px: 10 }}>
          <Typography variant="h6" mb={2}>Compiling Invoices and Calculating Tax...</Typography>
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
            <Typography variant="body2" color="text.secondary" align="right" mt={1}>{progress}%</Typography>
          </Box>
        </Box>
      )}

      {showResult && (
        <Paper sx={{ flex: 1, p: 4, borderRadius: 3, animation: 'fadeIn 0.5s ease-in-out', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">GSTR-1 Summary (Current Month)</Typography>
            <Button variant="contained" startIcon={<Download />} size="small" sx={{ borderRadius: 2 }}>Download Excel</Button>
          </Box>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9f9f9' }}>
              <TableRow>
                <TableCell>Invoice Range</TableCell>
                <TableCell>Total Taxable Value</TableCell>
                <TableCell>IGST Amount</TableCell>
                <TableCell>CGST Amount</TableCell>
                <TableCell>SGST Amount</TableCell>
                <TableCell>Total Tax</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><Chip label="INV-001 to INV-045" size="small" /></TableCell>
                <TableCell>₹1,25,000.00</TableCell>
                <TableCell>₹12,500.00</TableCell>
                <TableCell>₹5,000.00</TableCell>
                <TableCell>₹5,000.00</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>₹22,500.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}

    </Box>
  );
};

export default MockReportGenerator;
