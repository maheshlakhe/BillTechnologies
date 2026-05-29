import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  alpha,
  GlobalStyles,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Settings,
  Logout,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import RoleIndicator from './RoleIndicator';
import NotificationCenter from './NotificationCenter';
import MobileBottomNav from './MobileBottomNav';
import VideoGuideSidebar from './VideoGuideSidebar';
import { FoodIntegrationCenter } from './FoodIntegrationCenter';
import { VideoLibrary as VideoIcon } from '@mui/icons-material';
import { AddressVerificationShield } from './AddressVerificationShield';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { API_URL } from '../../config/api';
import { useAppTheme } from '../../contexts/ThemeContext';

import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { useIndustryLayout } from '../../hooks/useIndustryLayout';


// Preloads customers & products into shared context as soon as user is logged in
const DataPreloader: React.FC = () => {
  const { refetch: refetchCustomers, customers } = useCustomers();
  const { refetch: refetchProducts, products } = useProducts();
  useEffect(() => {
    if (customers.length === 0) refetchCustomers();
    if (products.length === 0) refetchProducts();
  }, [customers.length, products.length, refetchCustomers, refetchProducts]);
  return null;
};


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isLoading } = useAuth();
  const { layout: industryConf } = useIndustryLayout();
  const navigate = useNavigate();



  const { mode, setMode } = useAppTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [videoGuideOpen, setVideoGuideOpen] = useState(false);

  // Removed auto-close logic for tour

  React.useEffect(() => {
    if (!isLoading && !user) {
      const isInvited = localStorage.getItem('isInvitedSession') === 'true';
      navigate(isInvited ? '/login' : '/signup');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || (!user)) {
    return <LoadingScreen message="Initializing session..." />;
  }

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleNavigateToUserSettings = () => {
    navigate('/settings');
    handleProfileMenuClose();
  };

  // We removed the separate YouTube-style layout.
  // The tour will now overlay directly on top of the full dashboard.

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      bgcolor: 'background.default',
      overflow: 'hidden',
      '@media print': { display: 'none !important' }
    }}>
      <CssBaseline />
      <GlobalStyles styles={{
        html: { overflow: 'hidden !important' },
        body: { overflow: 'hidden !important' }
      }} />
      <AddressVerificationShield />
      <DataPreloader />

      {/* Removed Tour Finished Overlay and Active Indicator */}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        mobileOpen={mobileDrawerOpen}
        onMobileToggle={handleMobileDrawerToggle}
      />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minWidth: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
            zIndex: theme.zIndex.appBar,
            flexShrink: 0,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                className="tour-menu-toggle"
                color="inherit"
                edge="start"
                aria-label="Toggle navigation menu"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box id="app-header-portal-target" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, px: 2, justifyContent: 'space-between' }}>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, ml: 'auto' }}>
              <IconButton
                onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                sx={{ 
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15)
                  }
                }}
                title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>

              {!isMobile && (
                <IconButton
                    onClick={() => setVideoGuideOpen(true)}
                    sx={{ 
                        color: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.15)
                        }
                    }}
                    title="Video Guide"
                >
                    <VideoIcon />
                </IconButton>
              )}
              <NotificationCenter />
              {industryConf.isRestaurant && <FoodIntegrationCenter />}
              <RoleIndicator size="small" />

              <Chip
                label={isMobile
                  ? (user?.planType || 'FREE')
                  : `${user?.planType || 'FREE'} ↑`}
                size="small"
                onClick={() => navigate('/payment')}
                sx={{
                  height: 26,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                  border: '1.5px solid',
                  borderColor: (user?.planType || 'FREE') === 'FREE'
                    ? 'warning.main'
                    : (user?.planType) === 'STARTER'
                      ? 'info.main'
                      : 'success.main',
                  color: (user?.planType || 'FREE') === 'FREE'
                    ? 'warning.dark'
                    : (user?.planType) === 'STARTER'
                      ? 'info.dark'
                      : 'success.dark',
                  background: (user?.planType || 'FREE') === 'FREE'
                    ? alpha('#f59e0b', 0.1)
                    : alpha('#22c55e', 0.1),
                  '& .MuiChip-label': { px: { xs: 0.8, sm: 1.2 } },
                  minWidth: { xs: 'auto', sm: 80 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }
                }}
              />

              <IconButton className="tour-profile-icon" onClick={handleProfileMenuOpen} sx={{ p: 0.25 }}>
                <Avatar
                  src={user?.avatar ? `${API_URL.replace('/api', '')}${user.avatar}` : (user?.logoUrl || undefined)}
                  sx={{
                    width: { xs: 28, sm: 35 },
                    height: { xs: 28, sm: 35 },
                    bgcolor: theme.palette.primary.main,
                    fontSize: { xs: '0.75rem', sm: '1rem' },
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          role="main"
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            overflow: 'auto',
            pb: isMobile ? 7 : 0,
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 }, width: '100%', pb: isMobile ? 8 : 1 }}>{children}</Box>
        </Box>

        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{ elevation: 3, sx: { overflow: 'visible', mt: 1.5, minWidth: 200 } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" fontWeight="bold">{user?.name || 'Admin User'}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email || 'admin@admin.com'}</Typography>
          </Box>
          <MenuItem onClick={handleNavigateToProfile} sx={{ py: 1 }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleNavigateToUserSettings} sx={{ py: 1 }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            <ListItemText>User Settings</ListItemText>
          </MenuItem>
          <Divider sx={{ my: '0 !important' }} />
          <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        {isMobile && <MobileBottomNav />}

        {/* Video Guide Sidebar */}
        <VideoGuideSidebar 
          open={videoGuideOpen} 
          onClose={() => setVideoGuideOpen(false)} 
        />
      </Box>

    </Box>
  );
};

export default Layout;
