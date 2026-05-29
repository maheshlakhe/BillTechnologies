import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { ArrowRight, CheckCircle } from '@mui/icons-material';

const MockLandingHero: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0a0f1c', // Dark modern landing background
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Fake Header */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="h5" fontWeight="900" sx={{ color: 'white', letterSpacing: '-0.5px' }}>
          Bill<Typography component="span" color="primary" fontWeight="900">Soft</Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Typography color="text.secondary" fontWeight="600">Features</Typography>
          <Typography color="text.secondary" fontWeight="600">Pricing</Typography>
          <Typography color="text.secondary" fontWeight="600">About</Typography>
          <Button variant="outlined" color="primary" sx={{ borderRadius: 8, px: 3 }}>Login</Button>
          <Button variant="contained" color="primary" sx={{ borderRadius: 8, px: 3 }}>Get Started</Button>
        </Box>
      </Box>

      {/* Hero Content */}
      <Box sx={{ textAlign: 'center', maxWidth: 900, px: 4, zIndex: 10, animation: isActive ? 'slideUp 1s ease-out' : 'none', mt: 8 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2, mb: 2, display: 'inline-block', bgcolor: alpha(theme.palette.primary.main, 0.1), px: 2, py: 0.5, borderRadius: 10 }}>
          THE ULTIMATE BUSINESS SUITE
        </Typography>
        <Typography variant="h1" sx={{ color: 'white', fontWeight: 900, fontSize: '4.5rem', lineHeight: 1.1, mb: 3, letterSpacing: '-2px' }}>
          Master Your Billing <br/>
          <Typography component="span" variant="h1" sx={{ color: 'primary.main', fontWeight: 900 }}>Like a Pro.</Typography>
        </Typography>
        <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', mb: 5, lineHeight: 1.6, maxWidth: 700, mx: 'auto' }}>
          Create GST invoices in 60 seconds, track your inventory automatically, and watch your profits grow in real-time.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          <Button variant="contained" size="large" sx={{ height: 60, px: 5, fontSize: '1.2rem', borderRadius: 2, fontWeight: 'bold' }}>
            Start Free Trial
          </Button>
          <Button variant="outlined" size="large" endIcon={<ArrowRight />} sx={{ height: 60, px: 5, fontSize: '1.2rem', borderRadius: 2, fontWeight: 'bold', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            See How It Works
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 6 }}>
          {['100% GST Compliant', 'Bank-Grade Security', '24/7 Support'].map(feature => (
            <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" fontSize="small" />
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{feature}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Abstract Background Elements */}
      <Box sx={{ position: 'absolute', top: '10%', left: '-10%', width: 600, height: 600, bgcolor: alpha(theme.palette.primary.main, 0.2), filter: 'blur(150px)', borderRadius: '50%' }} />
      <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 800, height: 800, bgcolor: alpha(theme.palette.secondary.main || '#e91e63', 0.15), filter: 'blur(200px)', borderRadius: '50%' }} />

      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default MockLandingHero;
