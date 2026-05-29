import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { AppThemeProvider } from './contexts/ThemeContext';
import { AppProviders } from './contexts/AppProviders';
import Layout from './components/common/Layout';
import { VideoTourProvider } from './contexts/VideoTourContext';
import { PermissionGuard } from './contexts/PermissionsContext';
import { SectionLoader, LoadingScreen } from './components/common/LoadingScreen';
import GlobalRefreshTrigger from './components/common/GlobalRefreshTrigger';
import { Toaster } from 'sonner';

import LandingPage from './pages/LandingPage';

import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import SetupPassword from './pages/SetupPassword';
import PublicInvoice from './pages/PublicInvoice';
import SetPassword from './pages/SetPassword';
import VerifyEmail from './pages/VerifyEmail';
import SupportPage from './pages/Support';
import PaymentPage from './pages/Payment';
import PaymentResponse from './pages/PaymentResponse';
import BrandingDiagnostic from './pages/BrandingDiagnostic';



import { lazyWithRetry } from './utils/lazyRetry';

// ── Lazily loaded (code-split — only downloaded when user navigates there) ─
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Bills = lazyWithRetry(() => import('./pages/Bills'));
const POS = lazyWithRetry(() => import('./pages/POS'));
const ViewBill = lazyWithRetry(() => import('./pages/ViewBill'));
const Customers = lazyWithRetry(() => import('./pages/Customers'));
const Products = lazyWithRetry(() => import('./pages/Products'));
const Reports = lazyWithRetry(() => import('./pages/Reports'));
const Suppliers = lazyWithRetry(() => import('./pages/Suppliers'));
const Services = lazyWithRetry(() => import('./pages/Services'));
const ServiceTickets = lazyWithRetry(() => import('./pages/ServiceTickets'));
const PurchaseOrders = lazyWithRetry(() => import('./pages/PurchaseOrders'));
const ExpenseManager = lazyWithRetry(() => import('./pages/ExpenseManager'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const AdminPanel = lazyWithRetry(() => import('./pages/AdminPanel'));
const SubscriptionManagement = lazyWithRetry(() => import('./pages/SubscriptionManagement'));
const InvoiceTemplateLibrary = lazyWithRetry(() => import('./pages/InvoiceTemplateLibrary'));
const SuperAdminDashboard = lazyWithRetry(() => import('./pages/SuperAdminDashboard'));
const UserManagement = lazyWithRetry(() => import('./components/admin/UserManagement'));
const EmployeeManagement = lazyWithRetry(() => import('./components/admin/EmployeeManagement'));
const AuditLogs = lazyWithRetry(() => import('./pages/AuditLogs'));
const AdminSettings = lazyWithRetry(() => import('./pages/AdminSettings'));
const GstFiling = lazyWithRetry(() => import('./pages/GstFiling'));
const WarehouseManagement = lazyWithRetry(() => import('./pages/WarehouseManagement'));
const VideoDemoPage = lazyWithRetry(() => import('./pages/VideoDemoPage'));
const DeliveryDashboard = lazyWithRetry(() => import('./pages/DeliveryDashboard'));
const CustomerMenu = lazyWithRetry(() => import('./pages/CustomerMenu'));
const KitchenDisplay = lazyWithRetry(() => import('./pages/KitchenDisplay'));
const WaiterPanel = lazyWithRetry(() => import('./pages/WaiterPanel'));
const QrMenuAdmin = lazyWithRetry(() => import('./pages/QrMenuAdmin'));
const PharmacyPrescriptions = lazyWithRetry(() => import('./pages/PharmacyPrescriptions'));


// Industry Pages
const RetailPage = lazyWithRetry(() => import('./pages/industries/RetailPage'));
const PharmacyPage = lazyWithRetry(() => import('./pages/industries/PharmacyPage'));
const AutomobilePage = lazyWithRetry(() => import('./pages/industries/AutomobilePage'));
const ElectronicsPage = lazyWithRetry(() => import('./pages/industries/ElectronicsPage'));
const HealthcarePage = lazyWithRetry(() => import('./pages/industries/HealthcarePage'));
const EducationPage = lazyWithRetry(() => import('./pages/industries/EducationPage'));
const EducationIntake = lazyWithRetry(() => import('./pages/EducationIntake'));
const RealEstatePage = lazyWithRetry(() => import('./pages/industries/RealEstatePage'));
const LogisticsPage = lazyWithRetry(() => import('./pages/industries/LogisticsPage'));
const ManufacturingPage = lazyWithRetry(() => import('./pages/industries/ManufacturingPage'));
const HospitalityPage = lazyWithRetry(() => import('./pages/industries/HospitalityPage'));
const TextilePage = lazyWithRetry(() => import('./pages/industries/TextilePage'));
const FMCGPage = lazyWithRetry(() => import('./pages/industries/FMCGPage'));
const JewelleryPage = lazyWithRetry(() => import('./pages/industries/JewelleryPage'));
const ServicesPage = lazyWithRetry(() => import('./pages/industries/ServicesPage'));
const GroceryPage = lazyWithRetry(() => import('./pages/industries/GroceryPage'));
const GymPage = lazyWithRetry(() => import('./pages/industries/GymPage'));
const SalonPage = lazyWithRetry(() => import('./pages/industries/SalonPage'));
const RestaurantPage = lazyWithRetry(() => import('./pages/industries/RestaurantPage'));
const HardwarePage = lazyWithRetry(() => import('./pages/industries/HardwarePage'));
const FurniturePage = lazyWithRetry(() => import('./pages/industries/FurniturePage'));
const MobileShopPage = lazyWithRetry(() => import('./pages/industries/MobileShopPage'));
const IndustryDirectory = lazyWithRetry(() => import('./pages/industries/IndustryDirectory'));






const App: React.FC = () => {
  // Task 2: Persistent Theme Persistence from Backend + Fallback
  useEffect(() => {
    // 1. Instant load from LocalStorage to prevent flicker
    const currentStoredColor = localStorage.getItem('brandColor') || '#305CDE';
    document.documentElement.style.setProperty('--primary-color', currentStoredColor);

    // 3. Real-time sync handled by ThemeContext.tsx (Single Source of Truth)
  }, []);

  return (
    <AppThemeProvider>
      <CssBaseline />
      <GlobalStyles styles={{
        /* Remove all focus/touch borders from Recharts charts */
        '.recharts-wrapper': { outline: 'none !important', border: 'none !important' },
        '.recharts-wrapper *': { outline: 'none !important' },
        '.recharts-wrapper svg': { outline: 'none !important', border: 'none !important' },
        '.recharts-wrapper svg:focus': { outline: 'none !important' },
        '.recharts-surface': { outline: 'none !important', border: 'none !important' },
        '.recharts-surface:focus': { outline: 'none !important' },
        '.recharts-wrapper rect:focus': { outline: 'none !important' },
        'svg.recharts-surface': { outline: 'none !important' },
        '.recharts-wrapper, .recharts-wrapper *': {
          WebkitTapHighlightColor: 'transparent !important',
        },
      }} />
      <AppProviders>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <GlobalRefreshTrigger />
          <VideoTourProvider>
            <Suspense fallback={<LoadingScreen message="Staging your environment..." />}>
              <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/setup-password" element={<SetupPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/share/invoice/:id" element={<PublicInvoice />} />
              <Route path="/menu/:restaurantId/:tableToken" element={<CustomerMenu />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-response" element={<PaymentResponse />} />
              <Route path="/video-demo" element={<VideoDemoPage />} />

              {/* Industry Specific Routes */}
              <Route path="/industry" element={<IndustryDirectory />} />
              <Route path="/industry/retail" element={<RetailPage />} />
              <Route path="/industry/pharmacy" element={<PharmacyPage />} />
              <Route path="/industry/automobile" element={<AutomobilePage />} />
              <Route path="/industry/electronics" element={<ElectronicsPage />} />
              <Route path="/industry/healthcare" element={<HealthcarePage />} />
              <Route path="/industry/education" element={<EducationPage />} />
              <Route path="/industry/real-estate" element={<RealEstatePage />} />
              <Route path="/industry/logistics" element={<LogisticsPage />} />
              <Route path="/industry/manufacturing" element={<ManufacturingPage />} />
              <Route path="/industry/hospitality" element={<HospitalityPage />} />
              <Route path="/industry/textile" element={<TextilePage />} />
              <Route path="/industry/fmcg" element={<FMCGPage />} />
              <Route path="/industry/jewellery" element={<JewelleryPage />} />
              <Route path="/industry/services" element={<ServicesPage />} />
              <Route path="/industry/grocery" element={<GroceryPage />} />
              <Route path="/industry/gym" element={<GymPage />} />
              <Route path="/industry/salon" element={<SalonPage />} />
              <Route path="/industry/restaurant" element={<RestaurantPage />} />
              <Route path="/industry/hardware" element={<HardwarePage />} />
              <Route path="/industry/furniture" element={<FurniturePage />} />
              <Route path="/industry/mobile-shop" element={<MobileShopPage />} />



              <Route path="/*" element={
                <Layout>
                  <Suspense fallback={<SectionLoader message="Syncing records..." transparent />}>
                    <Routes>
                      <Route path="/dashboard" element={<PermissionGuard require="view_dashboard"><Dashboard /></PermissionGuard>} />
                      <Route path="/" element={<PermissionGuard require="view_dashboard"><Dashboard /></PermissionGuard>} />
                      <Route path="/super-admin" element={<PermissionGuard require="super_admin_access"><SuperAdminDashboard /></PermissionGuard>} />
                      <Route path="/bills" element={<PermissionGuard require="view_bills"><Bills /></PermissionGuard>} />
                      <Route path="/pos" element={<PermissionGuard require="create_bills"><POS /></PermissionGuard>} />
                      <Route path="/pharmacy/prescriptions" element={<PermissionGuard require="view_bills"><PharmacyPrescriptions /></PermissionGuard>} />
                      <Route path="/education/intake" element={<PermissionGuard require="view_bills"><EducationIntake /></PermissionGuard>} />

                      <Route path="/bills/new" element={<PermissionGuard require="create_bills"><Bills /></PermissionGuard>} />
                      <Route path="/bills/view/:id" element={<ViewBill />} />
                      <Route path="/customers" element={<PermissionGuard require="view_customers"><Customers /></PermissionGuard>} />
                      <Route path="/customers/new" element={<PermissionGuard require="manage_customers"><Customers /></PermissionGuard>} />
                      <Route path="/products" element={<PermissionGuard require="view_products"><Products /></PermissionGuard>} />
                      <Route path="/products/new" element={<PermissionGuard require="manage_products"><Products /></PermissionGuard>} />
                      <Route path="/reports" element={<PermissionGuard require="view_reports"><Reports /></PermissionGuard>} />
                      <Route path="/admin" element={<PermissionGuard require="admin_access"><AdminPanel /></PermissionGuard>}>
                        <Route path="subscription" element={<SubscriptionManagement />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="employees" element={<EmployeeManagement />} />
                        <Route path="audit-logs" element={<AuditLogs />} />
                        <Route path="settings/*" element={<AdminSettings />} />
                      </Route>
                      <Route path="/suppliers" element={<PermissionGuard require="view_customers"><Suppliers /></PermissionGuard>} />
                      <Route path="/services" element={<PermissionGuard require="manage_services"><Services /></PermissionGuard>} />
                      <Route path="/service-tickets" element={<PermissionGuard require="manage_services"><ServiceTickets /></PermissionGuard>} />
                      <Route path="/purchase-orders" element={<PermissionGuard require="view_products"><PurchaseOrders /></PermissionGuard>} />
                      <Route path="/expenses" element={<PermissionGuard require="manage_expenses"><ExpenseManager /></PermissionGuard>} />
                      <Route path="/gst-filing" element={<PermissionGuard require="view_reports"><GstFiling /></PermissionGuard>} />
                      <Route path="/warehouses" element={<PermissionGuard require="view_products"><WarehouseManagement /></PermissionGuard>} />
                      <Route path="/templates" element={<InvoiceTemplateLibrary />} />
                      <Route path="/delivery" element={<DeliveryDashboard />} />
                      <Route path="/kitchen" element={<KitchenDisplay />} />
                      <Route path="/waiter" element={<WaiterPanel />} />
                      <Route path="/admin/qr-menu" element={<PermissionGuard require="admin_access"><QrMenuAdmin /></PermissionGuard>} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/settings/:tab" element={<Settings />} />
                      <Route path="/branding-debug" element={<BrandingDiagnostic />} />
                    </Routes>
                  </Suspense>
                </Layout>
              } />
            </Routes>
            </Suspense>
          </VideoTourProvider>
        </Router>
      </AppProviders>
      <Toaster position="top-right" richColors closeButton />
    </AppThemeProvider>
  );
};

export default App;
