import React from 'react';
import { Box, Typography, Avatar, useTheme, alpha } from '@mui/material';
import { 
  Dashboard, Receipt, People, Inventory, Assessment, 
  Settings, Notifications, Search 
} from '@mui/icons-material';

const MockAppWrapper: React.FC<{ children: React.ReactNode, activeRoute: string }> = ({ children, activeRoute }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const menuItems = [
    { name: 'Dashboard', icon: <Dashboard />, route: '/dashboard' },
    { name: 'Bills', icon: <Receipt />, route: '/bills/new' },
    { name: 'Customers', icon: <People />, route: '/customers' },
    { name: 'Products', icon: <Inventory />, route: '/products' },
    { name: 'Reports', icon: <Assessment />, route: '/reports' },
    { name: 'Templates', icon: <Settings />, route: '/templates' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: isDark ? '#121212' : '#f4f6f8' }}>
      
      {/* Sidebar */}
      <Box sx={{ 
        width: 260, 
        bgcolor: isDark ? '#1e1e1e' : '#ffffff', 
        borderRight: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}>
        <Box sx={{ px: 2, py: 3, mb: 2 }}>
          <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
            Bill<Typography component="span" color="primary" fontWeight="900">Soft</Typography>
          </Typography>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          {menuItems.map(item => {
            const isActive = activeRoute === item.route;
            return (
              <Box 
                key={item.name}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5, mb: 1,
                  borderRadius: 2, cursor: 'default',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s'
                }}
              >
                {React.cloneElement(item.icon as React.ReactElement, { 
                  sx: { fontSize: 22, color: isActive ? 'primary.main' : 'text.secondary' } 
                })}
                <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>{item.name}</Typography>
              </Box>
            );
          })}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}` }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>A</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">Admin User</Typography>
            <Typography variant="caption" color="text.secondary">admin@billsoft.com</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <Box sx={{ 
          height: 70, 
          bgcolor: isDark ? '#1e1e1e' : '#ffffff', 
          borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          px: 4, gap: 3
        }}>
          <Search sx={{ color: 'text.secondary', fontSize: 24 }} />
          <Notifications sx={{ color: 'text.secondary', fontSize: 24 }} />
        </Box>

        {/* Dynamic Mock Content */}
        <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
      
    </Box>
  );
};

export default MockAppWrapper;
