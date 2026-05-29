/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  useTheme,
  useMediaQuery,
  MenuItem,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import { SectionLoader } from '../components/common/LoadingScreen';
import {
  Add as AddIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  FilterList as FilterListIcon,
  GetApp as ExportIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import CustomerForm from '../components/customers/CustomerForm';
import { useCustomers } from '../hooks/useCustomers';
import { useAuth } from '../contexts/AuthContext';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';
import SecureActionDialog from '../components/shared/SecureActionDialog';
import { useNotification } from '../contexts/NotificationContext';
import { useIndustryLayout } from '../hooks/useIndustryLayout';

const Customers: React.FC = () => {
  const { layout: industryConf } = useIndustryLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('preferredView_Customers') as 'list' | 'grid') || 'list');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateRange, setDateRange] = useState('All Time');
  const { showNoData, showWarning, showSuccess, showError } = useNotification();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { customers, deleteCustomer, exportCustomers, loading } = useCustomers();
  const { user } = useAuth();
  const navigate = useNavigate();
  const permissions = useRoleBasedAccess();
  const canView = permissions.canViewCustomers;
  const canCreate = permissions.canManageCustomers;
  const canEdit = permissions.canManageCustomers;
  const canDelete = permissions.canManageCustomers;

  // Practical Demo Simulation Trigger
  React.useEffect(() => {
    const triggerSimulation = () => {
      if (canCreate) {
        handleOpen();
      }
    };
    window.addEventListener('tour-simulate-customer', triggerSimulation);
    return () => window.removeEventListener('tour-simulate-customer', triggerSimulation);
  }, [canCreate]);

  // Secure Actions
  const [secureDialogOpen, setSecureDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [pendingEditCustomer, setPendingEditCustomer] = useState<any>(null);
  const isSecureEnabled = localStorage.getItem('secureActionsEnabled') === 'true';

  if (!canView) {
    return (
      <Box sx={{ p: 5, textAlign: 'center', mt: 10 }}>
        <Paper sx={{ p: 5, borderRadius: 3 }}>
          <Typography variant="h5" color="error">Access Denied</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>You do not have permission to view customers.</Typography>
          <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Paper>
      </Box>
    );
  }

  const handleClose = () => {
    setOpen(false);
    setSelectedCustomer(null);
  };

  const handleOpen = (customer?: any) => {
    if (customer && customer.id) {
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
    setOpen(true);
  };

  // Local showMessage removed in favor of useNotification

  const handleDelete = (customerId: string) => {
    const isSecure = localStorage.getItem('secureActionsEnabled') === 'true';
    if (isSecure) {
      setCustomerToDelete(customerId);
      setSecureDialogOpen(true);
    } else {
      if (window.confirm('Are you sure you want to delete this customer?')) {
        handleConfirmDelete(customerId);
      }
    }
  };

  const handleEditTrigger = (customer: any) => {
    const isSecure = localStorage.getItem('secureActionsEnabled') === 'true';
    if (isSecure) {
      setPendingEditCustomer(customer);
      setSecureDialogOpen(true);
    } else {
      setSelectedCustomer(customer);
      setOpen(true);
    }
  };

  const handleSecureActionConfirm = () => {
    if (pendingEditCustomer) {
      setSelectedCustomer(pendingEditCustomer);
      setOpen(true);
      setPendingEditCustomer(null);
      setSecureDialogOpen(false);
    } else {
      handleConfirmDelete();
    }
  };

  const handleConfirmDelete = async (id?: string) => {
    const targetId = id || customerToDelete;
    if (!targetId) return;
    try {
      await deleteCustomer(targetId);
      showSuccess('Customer Deleted Successfully');
      setSearchTerm(''); // Clear search box after deletion to prevent browser side-effects
    } catch (err: any) {
      showError(err?.message || 'Failed to delete customer');
    } finally {
      setSecureDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid') => {
    if (newView !== null) {
      setViewMode(newView);
      localStorage.setItem('preferredView_Customers', newView);
    }
  };

  const handleExport = async () => {
    if (customers.length === 0) {
      showNoData();
      return;
    }
    try {
      const blob = await exportCustomers('excel');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('Export Started');
    } catch (err: any) {
      showError(err.message || 'Failed to export customers');
    }
  };

  const mappedCustomers = React.useMemo(() => {
    const orgNames = [
      'Max Grocery Supermarket',
      'Elite Salon & Spa Lounge',
      'Nexa Furniture Mart',
      'Grand Palace Hotel & Suites',
      'Vanguard Logistics Services',
      'Zenith Education Group',
      'Galaxy Electronics Hub',
      'Apex Automobile Distributors',
      'Wellness Pharmacy & Labs',
      'Aura Retail Outlet'
    ];

    // Check if user has added their own customer records (records not matching seeded orgNames)
    const hasUserData = customers.some(c => !orgNames.includes(c.name));

    if (hasUserData) {
      // Hide all default mock data when user has added their first data
      return customers.filter(c => !orgNames.includes(c.name));
    }

    // Determine mock dataset based on current industry layout
    let mockDataset = [
      { name: 'Anil Ambani', email: 'anil@ambani.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
      { name: 'Gautam Adani', email: 'gautam@adani.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
      { name: 'Ratan Tata', email: 'ratan@tata.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
      { name: 'Radhika Merchant', email: 'radhika@merchant.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
      { name: 'Isha Ambani', email: 'isha@ambani.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
      { name: 'Anand Mahindra', email: 'anand@mahindra.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
      { name: 'Azim Premji', email: 'azim@premji.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
      { name: 'Lakshmi Mittal', email: 'lakshmi@mittal.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
      { name: 'Shiv Nadar', email: 'shiv@nadar.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
      { name: 'Nandan Nilekani', email: 'nandan@nilekani.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
    ];

    if (industryConf?.isEducation) {
      mockDataset = [
        { name: 'Rahul Kumar', email: 'rahul.kumar@gmail.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
        { name: 'Sneha Patel', email: 'sneha.patel@yahoo.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
        { name: 'Aman Singh', email: 'aman.singh@outlook.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
        { name: 'Pooja Mehta', email: 'pooja.mehta@gmail.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
        { name: 'Vikram Chawla', email: 'vikram.c@gmail.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
        { name: 'Kunal Shah', email: 'kunal.shah@gmail.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
        { name: 'Tanvi Sharma', email: 'tanvi.sharma@gmail.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
        { name: 'Kabir Mehta', email: 'kabir.mehta@gmail.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
        { name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
        { name: 'Rajesh Koothrapali', email: 'rajesh.k@gmail.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
      ];
    } else if (industryConf?.isPharmacy || industryConf?.isHealthcare) {
      mockDataset = [
        { name: 'Rohan Sharma', email: 'rohan.sharma@gmail.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
        { name: 'Priya Patel', email: 'priya.patel@yahoo.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
        { name: 'Amit Verma', email: 'amit.verma@outlook.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
        { name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
        { name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
        { name: 'Ananya Sen', email: 'ananya.sen@gmail.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
        { name: 'Rajesh Nair', email: 'rajesh.nair@gmail.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
        { name: 'Meera Iyer', email: 'meera.iyer@gmail.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
        { name: 'Kabir Mehta', email: 'kabir.mehta@gmail.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
        { name: 'Neha Gupta', email: 'neha.gupta@gmail.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
      ];
    } else if (industryConf?.isRestaurant || industryConf?.isHospitality) {
      mockDataset = [
        { name: 'Arjun Mehta', email: 'arjun@gmail.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
        { name: 'Deepika Padukone', email: 'deepika@gmail.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
        { name: 'Karan Johar', email: 'karan@gmail.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
        { name: 'Ranveer Singh', email: 'ranveer@gmail.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
        { name: 'Vijay Mallya', email: 'vijay@gmail.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
        { name: 'Aditi Rao', email: 'aditi@gmail.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
        { name: 'Sidharth Malhotra', email: 'sidharth@gmail.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
        { name: 'Katrina Kaif', email: 'katrina@gmail.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
        { name: 'Ranbir Kapoor', email: 'ranbir@gmail.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
        { name: 'Alia Bhatt', email: 'alia@gmail.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
      ];
    } else if (industryConf?.isRealEstate) {
      mockDataset = [
        { name: 'Ramesh Shah', email: 'ramesh@shah.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
        { name: 'Suresh Gupta', email: 'suresh@gupta.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
        { name: 'Ajay Singhal', email: 'ajay@singhal.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
        { name: 'Rajiv Khanna', email: 'rajiv@khanna.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
        { name: 'Devendra Yadav', email: 'devendra@yadav.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
        { name: 'Sunita Rao', email: 'sunita@rao.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
        { name: 'Naman Sharma', email: 'naman@sharma.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
        { name: 'Manoj Tiwari', email: 'manoj@tiwari.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
        { name: 'Preeti Desai', email: 'preeti@desai.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
        { name: 'Vikram Rathore', email: 'vikram@rathore.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
      ];
    } else if (industryConf?.isAutomobile) {
      mockDataset = [
        { name: 'Kabir Singh', email: 'kabir@singh.com', phone: '9812345679', address: 'DLF Phase 3, Gurgaon', loyaltyPoints: 120 },
        { name: 'Simran Kaur', email: 'simran@kaur.com', phone: '9812345678', address: 'C-Scheme, Jaipur', loyaltyPoints: 85 },
        { name: 'Jaideep Ahlawat', email: 'jaideep@ahlawat.com', phone: '9812345677', address: 'Hazratganj, Lucknow', loyaltyPoints: 240 },
        { name: 'Manpreet Sodhi', email: 'manpreet@sodhi.com', phone: '9812345676', address: 'Sector 5, Salt Lake, Kolkata', loyaltyPoints: 50 },
        { name: 'Diljit Dosanjh', email: 'diljit@dosanjh.com', phone: '9812345675', address: 'Gachibowli, Hyderabad', loyaltyPoints: 95 },
        { name: 'Gurpreet Singh', email: 'gurpreet@singh.com', phone: '9812345674', address: 'Ashram Road, Ahmedabad', loyaltyPoints: 110 },
        { name: 'Harbhajan Singh', email: 'harbhajan@singh.com', phone: '9812345673', address: 'T-Nagar, Chennai', loyaltyPoints: 30 },
        { name: 'Jaspreet Bumrah', email: 'jaspreet@bumrah.com', phone: '9812345672', address: 'Connaught Place, New Delhi', loyaltyPoints: 150 },
        { name: 'Yuvraj Singh', email: 'yuvraj@singh.com', phone: '9812345671', address: 'MG Road, Indiranagar, Bangalore', loyaltyPoints: 75 },
        { name: 'Virat Kohli', email: 'virat@kohli.com', phone: '9812345670', address: 'Fashion Street, Bandra, Mumbai', loyaltyPoints: 180 }
      ];
    }

    return customers.map(c => {
      const idx = orgNames.indexOf(c.name);
      if (idx !== -1 && idx < mockDataset.length) {
        return {
          ...c,
          name: mockDataset[idx].name,
          email: mockDataset[idx].email,
          phone: mockDataset[idx].phone,
          address: mockDataset[idx].address,
          loyaltyPoints: mockDataset[idx].loyaltyPoints
        };
      }
      return c;
    });
  }, [customers, industryConf]);

  const filteredCustomers = mappedCustomers.filter(customer => {
    // Search Term Filter
    const searchMatch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Status Filter
    if (statusFilter !== 'All Status') {
      const customerStatus = customer.isActive !== false ? 'Active' : 'Inactive';
      if (customerStatus !== statusFilter) return false;
    }

    // Date Range Filter
    if (dateRange !== 'All Time') {
      const createdAt = new Date(customer.createdAt);
      const now = new Date();
      if (dateRange === 'This Month') {
        if (createdAt.getMonth() !== now.getMonth() || createdAt.getFullYear() !== now.getFullYear()) return false;
      } else if (dateRange === 'Last Month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (createdAt.getMonth() !== lastMonth.getMonth() || createdAt.getFullYear() !== lastMonth.getFullYear()) return false;
      }
    }

    return true;
  });

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {industryConf.customersLabel} Management
        </Typography>
        <Typography variant={isMobile ? "body2" : "subtitle1"} color="text.secondary">
          Manage your {industryConf.customersLabel.toLowerCase()} database and contact information
        </Typography>
      </Box>

      {/* Controls Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexWrap: 'wrap'
        }}>
          {/* Left Side: Search & Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
            <TextField
              placeholder={`Search ${industryConf.customersLabel.toLowerCase()}...`}
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              name="customer-search-main"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                autoComplete: 'off'
              }}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 } }}
            />

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
              label="Status"
            >
              <MenuItem key="all" value="All Status">All Status</MenuItem>
              <MenuItem key="active" value="Active">Active</MenuItem>
              <MenuItem key="inactive" value="Inactive">Inactive</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 150 } }}
              label="Date Range"
            >
              <MenuItem key="all" value="All Time">All Time</MenuItem>
              <MenuItem key="month" value="This Month">This Month</MenuItem>
              <MenuItem key="last-month" value="Last Month">Last Month</MenuItem>
            </TextField>
          </Box>

          {/* Right Side: Actions */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-end' },
            flexWrap: 'wrap'
          }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              aria-label="view mode"
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Filters
            </Button> */}
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              sx={{ flexGrow: { xs: 1, sm: 0 } }}
            >
              Export
            </Button>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
              >
                Add {industryConf.customersLabel}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Content Area */}
      {loading && (
        <Box sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SectionLoader message={loading ? 'Processing...' : 'Syncing records...'} />    
        </Box>
      )}

      {filteredCustomers.length > 0 && !loading ? (
        <>
          {viewMode === 'list' ? (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{industryConf.customersLabel} Name</TableCell>
                    <TableCell>Contact Info</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="center">Loyalty Points</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography fontWeight="medium">{customer.name}</Typography>
                          {customer.isMarkedRed && (
                            <FlagIcon sx={{ color: 'error.main', fontSize: 18, ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexDirection="column">
                          {customer.email && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{customer.email}</Typography>
                            </Box>
                          )}
                          {customer.phone && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{customer.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }} noWrap>
                          {customer.address || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={customer.loyaltyPoints || 0}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={customer.isActive !== false ? 'Active' : 'Inactive'}
                          color={customer.isActive !== false ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {canEdit && (
                            <IconButton size="small" onClick={() => handleEditTrigger(customer)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {canDelete && (
                            <IconButton size="small" color="error" onClick={() => handleDelete(customer.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)'
              },
              gap: 3
            }}>
              {filteredCustomers.map((customer) => (
                <Card sx={{ height: '100%', position: 'relative' }} key={customer.id}>
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {customer.name}
                        {customer.isMarkedRed && (
                          <FlagIcon sx={{ color: 'error.main', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {canEdit && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditTrigger(customer)}
                            sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                          >
                            <EditIcon fontSize="small" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(customer.id)}
                            sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {customer.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {customer.email}
                          </Typography>
                        </Box>
                      )}

                      {customer.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                      )}

                      {customer.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" sx={{ mt: 0.25 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {customer.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {customer.loyaltyPoints !== undefined && customer.loyaltyPoints > 0 && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="primary.dark" fontWeight="medium" display="block">
                          Loyalty Points
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {customer.loyaltyPoints}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={customer.isActive !== false ? 'Active' : 'Inactive'}
                          size="small"
                          color={customer.isActive !== false ? 'success' : 'error'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Added {new Date(customer.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      ) : (
        !loading && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? `No ${industryConf.customersLabel.toLowerCase()} found` : `No ${industryConf.customersLabel.toLowerCase()} yet`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm
                ? 'Try adjusting your search terms'
                : `Start by adding your first ${industryConf.customersLabel.toLowerCase()} to get started`
              }
            </Typography>
            {!searchTerm && canCreate && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                Add Your First {industryConf.customersLabel}
              </Button>
            )}
          </Paper>
        )
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && canCreate && (
        <Fab
          color="primary"
          aria-label={`add ${industryConf.customersLabel.toLowerCase()}`}
          onClick={() => handleOpen()}
          sx={{
            position: 'fixed',
            bottom: 85,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Customer Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedCustomer ? `Edit ${industryConf.customersLabel}` : `Add New ${industryConf.customersLabel}`}
          {isMobile && (
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent dividers={isMobile}>
          <CustomerForm customer={selectedCustomer} onClose={handleClose} />
        </DialogContent>
      </Dialog>

      {/* Feedback Snackbars are now handled globally */}

      <SecureActionDialog
        open={secureDialogOpen}
        onClose={() => setSecureDialogOpen(false)}
        onConfirm={handleSecureActionConfirm}
        title={pendingEditCustomer ? `Authorize ${industryConf.customersLabel} Edit` : `Authorize ${industryConf.customersLabel} Deletion`}
        message={pendingEditCustomer ? `Editing a ${industryConf.customersLabel.toLowerCase()} profile is a critical action. Enter your security PIN to proceed.` : `Deleting a ${industryConf.customersLabel.toLowerCase()} is a critical action. Enter your security PIN to proceed.`}
        actionLabel={pendingEditCustomer ? `Edit ${industryConf.customersLabel}` : `Delete ${industryConf.customersLabel}`}
      />
    </Box>
  );
};

export default Customers;
