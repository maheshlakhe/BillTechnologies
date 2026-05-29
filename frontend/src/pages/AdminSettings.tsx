/* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Build as MaintenanceIcon,
  AdminPanelSettings as AdminIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Palette as PaletteIcon,
  ShoppingBag as POIcon,
} from '@mui/icons-material';
import BusinessProfileSettings from '../components/settings/BusinessProfileSettings';
import NotificationsTab from '../components/settings/NotificationsTab';
import MaintenanceTab from '../components/settings/MaintenanceTab';
import BrandingSettings from '../components/settings/BrandingSettings';
import POTemplateLibrary from '../modules/billing-templates/POTemplateLibrary';
import { useAuth } from '../contexts/AuthContext';
import useRoleBasedAccess from '../hooks/useRoleBasedAccess';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-settings-tabpanel-${index}`}
      aria-labelledby={`admin-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminSettings: React.FC = () => {
  const permissions = useRoleBasedAccess();
  const navigate = useNavigate();

  if (!permissions.canManageSettings) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access Denied: You don't have permission to manage templates.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/admin')}
          sx={{ borderRadius: 2 }}
        >
          Back to Panel
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PaletteIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">Invoice Template Library</Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <Box sx={{ p: 0 }}>
          <POTemplateLibrary />
        </Box>
      </Card>
    </Box>
  );
};

export default AdminSettings;
