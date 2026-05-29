import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  alpha, // Added alpha for dynamic sidebar colors
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AdminPanelSettings as AdminIcon,
  GroupWork as GroupWorkIcon,
  CurrencyRupee as MoneyIcon,
  DesignServices as ServicesIcon,
  Security as SecurityIcon,
  ConfirmationNumber as TicketIcon,
  ShoppingCart as PurchaseOrderIcon,
  ExpandLess,
  ExpandMore,
  SpaceDashboard as GSTDashboardIcon,
  ReceiptLong as GSTInvoiceIcon,
  ShoppingCartCheckout as GSTPurchaseIcon,
  Description as GSTR1Icon,
  Summarize as GSTR3BIcon,
  Analytics as OverviewIcon,
  FiberManualRecord as DotIcon,
  Business as OrgIcon,
  PlayCircleOutline as DemoIcon,
  Restaurant as RestaurantIcon,
  MedicalServices as PharmacyIcon,
  Healing as HealthcareIcon,
  School as EducationIcon,
  Domain as RealEstateIcon,
  LocalShipping as LogisticsIcon,
  PrecisionManufacturing as ManufacturingIcon,
  Hotel as HospitalityIcon,
  Checkroom as TextileIcon,
  Fastfood as FmcgIcon,
  WorkspacePremium as JewelleryIcon,
  BusinessCenter as ServicesBusinessIcon,
  LocalGroceryStore as GroceryIcon,
  FitnessCenter as GymIcon,
  Face as SalonIcon,
  DirectionsCar as AutomobileIcon,
  Devices as ElectronicsIcon,
  Construction as HardwareIcon,
  Weekend as FurnitureIcon,
  PhoneAndroid as MobileShopIcon,
  Store as DefaultStoreIcon,
  PointOfSale as POSIcon,
  DeliveryDining as DeliveryHubIcon,
  RoomService as WaiterIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useRoleBasedAccess } from '../../hooks/useRoleBasedAccess';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { resolveFileUrl } from '../../utils/url';
import { useIndustryLayout } from '../../hooks/useIndustryLayout';

const getIndustryIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'restaurant': return <RestaurantIcon />;
    case 'medical_services': return <PharmacyIcon />;
    case 'healing': return <HealthcareIcon />;
    case 'school': return <EducationIcon />;
    case 'domain': return <RealEstateIcon />;
    case 'local_shipping': return <LogisticsIcon />;
    case 'precision_manufacturing': return <ManufacturingIcon />;
    case 'hotel': return <HospitalityIcon />;
    case 'checkroom': return <TextileIcon />;
    case 'fastfood': return <FmcgIcon />;
    case 'workspace_premium': return <JewelleryIcon />;
    case 'business_center': return <ServicesBusinessIcon />;
    case 'local_grocery_store': return <GroceryIcon />;
    case 'fitness_center': return <GymIcon />;
    case 'face': return <SalonIcon />;
    case 'directions_car': return <AutomobileIcon />;
    case 'devices': return <ElectronicsIcon />;
    case 'construction': return <HardwareIcon />;
    case 'weekend': return <FurnitureIcon />;
    case 'phone_android': return <MobileShopIcon />;
    default: return <DefaultStoreIcon />;
  }
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const drawerWidth = 280;
const collapsedWidth = 70;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileToggle
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const permissions = useRoleBasedAccess();
  const { user } = useAuth();
  const { permissions: livePermissions, isAdmin, role } = usePermissions();

  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [superAdminOpen, setSuperAdminOpen] = React.useState(false);

  React.useEffect(() => {
    if (location.pathname === '/reports' && location.hash) {
      setReportsOpen(true);
    }
    if (location.pathname === '/super-admin') {
      setSuperAdminOpen(true);
    }
  }, [location.pathname, location.hash]);

  const isSubUserWithNoPerms = !isAdmin && role !== 'ADMIN' && livePermissions.length === 0;
  const { layout: industryConf } = useIndustryLayout();

  const mainMenuItems = isSubUserWithNoPerms ? [] : [
    { 
      text: 'Control Panel', 
      icon: <SecurityIcon />, 
      path: '/super-admin', 
      visible: permissions.canViewSuperAdmin, 
      id: 'tour-nav-super-admin',
      subItems: [
        { text: 'Organizations', path: '/super-admin#organizations', icon: <OrgIcon fontSize="small" /> },
        { text: 'Support Tickets', path: '/super-admin#tickets', icon: <TicketIcon fontSize="small" /> },
        { text: 'Demo Requests', path: '/super-admin#demos', icon: <DemoIcon fontSize="small" /> },
      ]
    },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', visible: permissions.canViewDashboard, id: 'tour-nav-dashboard' },
    { text: industryConf.billsLabel, icon: <ReceiptIcon />, path: '/bills', visible: permissions.canViewBills, id: 'tour-nav-bills' },
    { text: 'POS Billing', icon: <POSIcon />, path: '/pos', visible: permissions.canViewBills, id: 'tour-nav-pos' },
    { text: 'Prescriptions & Expiry', icon: <PharmacyIcon />, path: '/pharmacy/prescriptions', visible: permissions.canViewBills && industryConf.isPharmacy, id: 'tour-nav-pharmacy-prescriptions' },
    { text: 'Student Intake Hub', icon: <EducationIcon />, path: '/education/intake', visible: permissions.canViewBills && industryConf.isEducation, id: 'tour-nav-education-intake' },
    { text: 'Delivery Hub', icon: <DeliveryHubIcon />, path: '/delivery', visible: permissions.canViewBills && industryConf.isRestaurant, id: 'tour-nav-delivery' },
    { text: 'Dine-In Hub', icon: <QrCodeIcon />, path: '/admin/qr-menu', visible: permissions.canViewAdminPanel && industryConf.isRestaurant, id: 'tour-nav-qr-menu' },
    { text: industryConf.customersLabel, icon: <PeopleIcon />, path: '/customers', visible: permissions.canViewCustomers, id: 'tour-nav-customers' },
    { text: industryConf.productsLabel, icon: <InventoryIcon />, path: '/products', visible: permissions.canViewProducts, id: 'tour-nav-products' },
    { text: 'Warehouses', icon: <WarehouseIcon />, path: '/warehouses', visible: permissions.canViewProducts && industryConf.isDetailedInventory && !industryConf.hideWarehouses, id: 'tour-nav-warehouses' },
    { text: 'Suppliers', icon: <GroupWorkIcon />, path: '/suppliers', visible: permissions.canViewSuppliers && industryConf.isDetailedInventory, id: 'tour-nav-suppliers' },
    { text: 'Services', icon: <ServicesIcon />, path: '/services', visible: permissions.canManageServices && industryConf.isServiceOriented, id: 'tour-nav-services' },
    { text: 'Service Tickets', icon: <TicketIcon />, path: '/service-tickets', visible: permissions.canManageServiceTickets && industryConf.isServiceOriented, id: 'tour-nav-service-tickets' },
    { text: 'Purchase Orders', icon: <PurchaseOrderIcon />, path: '/purchase-orders', visible: permissions.canManagePurchaseOrders && industryConf.isDetailedInventory, id: 'tour-nav-purchase-orders' },
    { text: 'Expenses', icon: <MoneyIcon />, path: '/expenses', visible: permissions.canManageExpenses, id: 'tour-nav-expenses' },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      visible: permissions.canViewReports,
      id: 'tour-nav-reports',
      subItems: [
        { text: 'Business Overview', path: '/reports', icon: <OverviewIcon fontSize="small" /> },
        { text: 'GST Dashboard', path: '/reports#dashboard', icon: <GSTDashboardIcon fontSize="small" /> },
        { text: 'GST Invoices', path: '/reports#invoices', icon: <GSTInvoiceIcon fontSize="small" /> },
        { text: 'GST Purchases', path: '/reports#purchases', icon: <GSTPurchaseIcon fontSize="small" /> },
        { text: 'GSTR-1 Report', path: '/reports#gstr1', icon: <GSTR1Icon fontSize="small" /> },
        { text: 'GSTR-3B Report', path: '/reports#gstr3b', icon: <GSTR3BIcon fontSize="small" /> },
        { text: 'GST Filing Hub', path: '/gst-filing', icon: <GSTR1Icon fontSize="small" /> }
      ]
    },

    { text: 'Admin Panel', icon: <AdminIcon />, path: '/admin', visible: permissions.canViewAdminPanel, id: 'tour-nav-admin' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', visible: permissions.canManageSettings, id: 'tour-nav-settings' }
  ];

  const visibleMenuItems = mainMenuItems.filter(item => item.visible);

  const renderMenuItem = (item: { text: string; icon: JSX.Element; path: string; id: string; subItems?: Array<{ text: string; path: string; icon?: JSX.Element }> }) => {
    // Check if the current path matches the menu item's path
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ px: collapsed && !isMobile ? 0.5 : 1 }} id={item.id}>
          <ListItemButton
            component={hasSubItems ? "div" : Link}
            to={hasSubItems ? undefined : item.path}
            selected={isActive && !hasSubItems}
            sx={{
              minHeight: 48,
              justifyContent: collapsed && !isMobile ? 'center' : 'initial',
              px: collapsed && !isMobile ? 0 : 2.5,
              borderRadius: collapsed && !isMobile ? '50%' : `${industryConf.themeStyle.borderRadius}px`,
              mx: collapsed && !isMobile ? 'auto' : 1,
              width: collapsed && !isMobile ? 44 : 'auto',
              my: 0.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiListItemIcon-root': {
                color: `${theme.palette.text.secondary} !important`,
                '& .icon-bg': {
                  backgroundColor: 'transparent',
                  borderRadius: industryConf.themeStyle.componentShape === 'pill' ? '24px' : '50%',
                }
              },
              '&.Mui-selected': {
                backgroundColor: alpha(industryConf.themeStyle.primaryAccent, 0.08),
                borderLeft: collapsed && !isMobile ? 'none' : `5px solid ${industryConf.themeStyle.primaryAccent}`,
                border: collapsed && !isMobile ? `1.5px solid ${industryConf.themeStyle.primaryAccent}` : 'none',
                marginLeft: collapsed && !isMobile ? 'auto' : '-1px',
                borderRadius: collapsed && !isMobile ? '50%' : `${industryConf.themeStyle.borderRadius}px`,
                '&:hover': {
                  backgroundColor: alpha(industryConf.themeStyle.primaryAccent, 0.12)
                },
                '& .MuiListItemIcon-root': {
                  color: `${industryConf.themeStyle.primaryAccent} !important`,
                  '& .icon-bg': {
                    backgroundColor: alpha(industryConf.themeStyle.primaryAccent, 0.1),
                    borderRadius: industryConf.themeStyle.componentShape === 'pill' ? '24px' : '50%',
                  }
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 700,
                  color: `${theme.palette.text.primary} !important`,
                },
              },
              '&:hover': {
                backgroundColor: alpha(industryConf.themeStyle.primaryAccent, 0.03),
                '& .MuiListItemIcon-root': { color: industryConf.themeStyle.primaryAccent }
              },
            }}
            onClick={() => {
              if (hasSubItems) {
                if (item.text === 'Reports') setReportsOpen(!reportsOpen);
                if (item.text === 'Control Panel') setSuperAdminOpen(!superAdminOpen);
              } else if (isMobile) {
                onMobileToggle();
              }
            }}
          >
            <ListItemIcon sx={{
              minWidth: collapsed && !isMobile ? 40 : 0,
              width: collapsed && !isMobile ? 40 : 'auto',
              mr: collapsed && !isMobile ? 0 : 3,
              justifyContent: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
              flexShrink: 0,
            }}>
              <Box
                className="icon-bg"
                sx={{
                  position: 'absolute',
                  width: 32,
                  height: 32,
                  zIndex: 0,
                  transition: 'all 0.2s ease',
                }}
              />
              <Box sx={{ zIndex: 1, display: 'flex' }}>
                {item.icon}
              </Box>
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText primary={item.text} sx={{ opacity: collapsed && !isMobile ? 0 : 1 }} />
            )}
            {hasSubItems && (!collapsed || isMobile) && (
              ((item.text === 'Reports' && reportsOpen) || (item.text === 'Control Panel' && superAdminOpen)) ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {hasSubItems && (!collapsed || isMobile) && (
          <Collapse in={(item.text === 'Reports' && reportsOpen) || (item.text === 'Control Panel' && superAdminOpen)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pb: 1 }}>
              {item.subItems?.map((subItem) => {
                const currentHash = location.hash || '';
                const subHash = subItem.path.split('#')[1] ? '#' + subItem.path.split('#')[1] : '';
                const isSubSelected = location.pathname === item.path && currentHash === subHash;
                return (
                  <ListItemButton
                    key={subItem.text}
                    component={Link}
                    to={subItem.path}
                    selected={isSubSelected}
                    onClick={isMobile ? onMobileToggle : undefined}
                    sx={{
                      pl: 6,
                      my: 0.25,
                      mx: 2,
                      borderRadius: `${industryConf.themeStyle.borderRadius}px`,
                      minHeight: 38,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      '&.Mui-selected': {
                        bgcolor: alpha(industryConf.themeStyle.primaryAccent, 0.08),
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -4,
                          top: '15%',
                          height: '70%',
                          width: 3,
                          borderRadius: 3,
                          bgcolor: industryConf.themeStyle.primaryAccent,
                        },
                      },
                      '&:hover': { bgcolor: alpha(industryConf.themeStyle.primaryAccent, 0.04) }
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 36,
                      color: isSubSelected ? industryConf.themeStyle.primaryAccent : alpha(theme.palette.text.secondary, 0.7),
                      transition: 'color 0.2s ease',
                      '& svg': { fontSize: '1.25rem' }
                    }}>
                      {subItem.icon || <DotIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={subItem.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: isSubSelected ? theme.palette.primary.main : 'text.secondary',
                        fontWeight: isSubSelected ? 600 : 500,
                        letterSpacing: '0.2px'
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <Box className="tour-sidebar" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: collapsed && !isMobile ? 'center' : 'space-between', minHeight: 64, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            {user?.logoUrl ? (
              <img
                src={resolveFileUrl(user.logoUrl)}
                alt="Logo"
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
              />
            ) : (
              <Box sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: alpha(industryConf.themeStyle.primaryAccent || theme.palette.primary.main, 0.1), 
                borderRadius: 1.5, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${alpha(industryConf.themeStyle.primaryAccent || theme.palette.primary.main, 0.2)}`,
                color: industryConf.themeStyle.primaryAccent || theme.palette.primary.main
              }}>
                {getIndustryIcon(industryConf.iconName)}
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                fontSize: '1.15rem',
                fontFamily: 'Outfit, sans-serif',
                color: 'text.primary',
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}
            >
              {user?.companyName || 'My Business'}
            </Typography>
          </Box>
        )}
        {collapsed && !isMobile && (
          user?.logoUrl ? (
            <img
              src={resolveFileUrl(user.logoUrl)}
              alt="Logo"
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
            />
          ) : (
            <Box sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: alpha(industryConf.themeStyle.primaryAccent || theme.palette.primary.main, 0.1), 
              borderRadius: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `1px solid ${alpha(industryConf.themeStyle.primaryAccent || theme.palette.primary.main, 0.2)}`,
              color: industryConf.themeStyle.primaryAccent || theme.palette.primary.main,
              mr: 1
            }}>
              {getIndustryIcon(industryConf.iconName)}
            </Box>
          )
        )}
        <IconButton onClick={isMobile ? onMobileToggle : onToggle} size="small">
          {collapsed && !isMobile ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, pt: 1, overflowY: 'auto' }}>
        {visibleMenuItems.map(renderMenuItem)}
      </List>

      <Box sx={{ p: 2, textAlign: 'center', mt: 'auto', borderTop: `1px solid ${theme.palette.divider}` }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
              <img src="/logo.svg" alt="BillSoft" style={{ height: '14px', opacity: 0.6 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                © 2025 BillSoft
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem', opacity: 0.7 }}>
              Powered by AGB Technologies
            </Typography>
          </Box>
        )}
        {collapsed && !isMobile && (
          <img src="/logo.svg" alt="BS" style={{ height: '14px', opacity: 0.4 }} />
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '@media print': { display: 'none !important' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper, // Solid white/background for mobile sidebar
              backgroundImage: 'none',
              '@media print': { display: 'none !important' }
            }
          }}
        >
          {drawer}
        </Drawer>
      )}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? collapsedWidth : drawerWidth,
            flexShrink: 0,
            '@media print': { display: 'none !important' },
            '& .MuiDrawer-paper': {
              width: collapsed ? collapsedWidth : drawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              backgroundColor: alpha(theme.palette.primary.main, 0.02), // "Dudhiya" tint background
              backgroundImage: 'none',
              borderRight: `1px solid ${theme.palette.divider}`,
              '@media print': { display: 'none !important' }
            }
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
