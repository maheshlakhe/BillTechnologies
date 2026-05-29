import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  LockOutlined, 
  Google, 
  Apple,
  Storefront,
  LocalPharmacy,
  DirectionsCar,
  Devices,
  LocalHospital,
  School,
  Home,
  LocalShipping,
  PrecisionManufacturing,
  Hotel,
  Checkroom,
  ShoppingBasket,
  Diamond,
  Engineering,
  LocalGroceryStore,
  FitnessCenter,
  ContentCut,
  Restaurant,
  Construction,
  Weekend,
  Smartphone,
  Star
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config/api';
import { getIndustryUiConfig } from '../utils/industryUiConfig';

const getIndustryIcon = (slug?: string | null) => {
  switch (slug?.toLowerCase()) {
    case 'restaurant': return <Restaurant sx={{ fontSize: 36 }} />;
    case 'pharmacy': return <LocalPharmacy sx={{ fontSize: 36 }} />;
    case 'healthcare': return <LocalHospital sx={{ fontSize: 36 }} />;
    case 'education': return <School sx={{ fontSize: 36 }} />;
    case 'real-estate': return <Home sx={{ fontSize: 36 }} />;
    case 'logistics': return <LocalShipping sx={{ fontSize: 36 }} />;
    case 'manufacturing': return <PrecisionManufacturing sx={{ fontSize: 36 }} />;
    case 'hospitality': return <Hotel sx={{ fontSize: 36 }} />;
    case 'textile': return <Checkroom sx={{ fontSize: 36 }} />;
    case 'fmcg': return <ShoppingBasket sx={{ fontSize: 36 }} />;
    case 'jewellery': return <Diamond sx={{ fontSize: 36 }} />;
    case 'services': return <Engineering sx={{ fontSize: 36 }} />;
    case 'grocery': return <LocalGroceryStore sx={{ fontSize: 36 }} />;
    case 'gym': return <FitnessCenter sx={{ fontSize: 36 }} />;
    case 'salon': return <ContentCut sx={{ fontSize: 36 }} />;
    case 'automobile': return <DirectionsCar sx={{ fontSize: 36 }} />;
    case 'electronics': return <Devices sx={{ fontSize: 36 }} />;
    case 'hardware': return <Construction sx={{ fontSize: 36 }} />;
    case 'furniture': return <Weekend sx={{ fontSize: 36 }} />;
    case 'mobile-shop': return <Smartphone sx={{ fontSize: 36 }} />;
    default: return <Storefront sx={{ fontSize: 36 }} />;
  }
};

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openForgotModal, setOpenForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ind = params.get('industry');
    if (ind) {
      setSelectedIndustry(ind.toLowerCase());
    }
  }, [location.search]);
  const [justVerified, setJustVerified] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  // Hide signup toggle if this is an invited user
  const [isInvite, setIsInvite] = useState<boolean>(() => {
    return searchParams.get('invite') === 'true' ||
      !!searchParams.get('token') ||
      !!searchParams.get('invitationToken') ||
      localStorage.getItem('isInvitedSession') === 'true';
  });

  // --- AUTO-FILL CREDENTIALS ---
  React.useEffect(() => {
    const email = searchParams.get('email') || (location.state as any)?.email;
    const password = searchParams.get('password') || (location.state as any)?.password;
    const verifiedFlag = searchParams.get('verified') === 'true';

    if (email || password) {
      setFormData(prev => ({
        ...prev,
        email: email || prev.email,
        password: password || prev.password
      }));
      if (verifiedFlag) setJustVerified(true);
      if (searchParams.get('signup') === 'success') setJustSignedUp(true);
    } else if (verifiedFlag) {
      setJustVerified(true);
    } else if (searchParams.get('signup') === 'success') {
      setJustSignedUp(true);
    }
  }, [searchParams, location.state]);

  React.useEffect(() => {
    if (searchParams.get('invite') === 'true' || !!searchParams.get('token') || !!searchParams.get('invitationToken')) {
      localStorage.setItem('isInvitedSession', 'true');
      setIsInvite(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (user?.role?.toUpperCase() === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAuthLoading, navigate, user?.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setOpenErrorSnackbar(true);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      if (user?.role?.toUpperCase() === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // The error is already set in context by the login function, 
      // but we explicitly call it here just in case or for custom messages
      setError(err.message || 'Invalid ID or Password');
      setOpenErrorSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };


  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setOtpLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      if (res.data.success) {
        setOtpSent(true);
        if (res.data.debug_code) {
          console.log('DEBUG OTP:', res.data.debug_code);
          setError(`DEBUG: OTP is ${res.data.debug_code}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLoginWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login-otp`, { phone, code: otp });
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        // Trigger manual refresh or use login from context if it supports token directly
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setResetSent(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      // Still show success to avoid email enumeration attacks
      setResetSent(true);
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleCloseForgotModal = () => {
    setOpenForgotModal(false);
    setForgotEmail('');
    setResetSent(false);
  };

  const uiConfig = selectedIndustry ? getIndustryUiConfig(selectedIndustry) : null;
  const primaryAccent = uiConfig ? uiConfig.themeStyle.primaryAccent : '#3b82f6';
  const accentHover = uiConfig ? uiConfig.themeStyle.accentHover : '#2563eb';
  const borderRadius = uiConfig ? `${uiConfig.themeStyle.borderRadius}px` : '16px';
  const shadowStyle = uiConfig?.themeStyle.shadowDepth === 'elevated'
    ? '0 20px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)'
    : uiConfig?.themeStyle.shadowDepth === 'glass'
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.08)'
    : '0 4px 20px rgba(0,0,0,0.05)';

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius,
      transition: 'all 0.2s',
      '&.Mui-focused fieldset': {
        borderColor: primaryAccent,
        borderWidth: '2px'
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: primaryAccent,
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        background: uiConfig 
          ? `radial-gradient(circle at 50% 50%, ${uiConfig.themeStyle.primaryAccent}15 0%, rgba(255,255,255,1) 85%)`
          : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card sx={{
            width: '100%',
            maxWidth: { xs: '100%', sm: 400 },
            borderRadius: borderRadius,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: shadowStyle,
            backdropFilter: uiConfig?.themeStyle.glassmorphism ? 'blur(10px)' : 'none',
            border: uiConfig?.themeStyle.glassmorphism 
              ? '1px solid rgba(255,255,255,0.4)' 
              : '1px solid rgba(0,0,0,0.06)',
            backgroundColor: uiConfig?.themeStyle.glassmorphism
              ? 'rgba(255,255,255,0.85)'
              : 'background.paper',
          }}>
            <CardContent sx={{ p: 4 }}>
              {uiConfig ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: 64, 
                      height: 64, 
                      borderRadius: borderRadius,
                      backgroundColor: `${primaryAccent}15`,
                      color: primaryAccent,
                      mb: 1.5,
                      border: '1px solid',
                      borderColor: `${primaryAccent}30`,
                      boxShadow: `0 8px 24px ${primaryAccent}10`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {getIndustryIcon(selectedIndustry)}
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      px: 1.5, 
                      py: 0.4, 
                      borderRadius: 20, 
                      backgroundColor: `${primaryAccent}08`, 
                      border: '1px solid',
                      borderColor: `${primaryAccent}20`,
                      mb: 1.5
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        backgroundColor: primaryAccent, 
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.85)', opacity: 0.5 },
                          '50%': { transform: 'scale(1.2)', opacity: 1 },
                          '100%': { transform: 'scale(0.85)', opacity: 0.5 }
                        }
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      fontWeight="bold" 
                      sx={{ 
                        color: primaryAccent, 
                        letterSpacing: '1px', 
                        textTransform: 'uppercase', 
                        fontSize: '0.62rem' 
                      }}
                    >
                      {selectedIndustry?.replace(/-/g, ' ')} Terminal Active
                    </Typography>
                  </Box>

                  <Typography component="h1" variant="h5" fontWeight="bold" align="center" sx={{ color: 'text.primary', mb: 0.5 }}>
                    {uiConfig.productsLabel.split(' ')[0]} Billing Till
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Designed for high-velocity transaction counters
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                  <img
                    src="/logo.svg"
                    alt="BillSoft Logo"
                    style={{ height: '50px', width: 'auto', marginRight: '16px' }}
                  />
                  <Typography component="h1" variant="h4" fontWeight="bold">
                    BillSoft
                  </Typography>
                </Box>
              )}

              {!uiConfig && (
                <>
                  <Typography component="h2" variant="h5" align="center" gutterBottom>
                    Welcome Back
                  </Typography>

                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Sign in to your account
                  </Typography>
                </>
              )}

              {justVerified && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Account verified successfully! Your details are pre-filled below.
                </Alert>
              )}

              {justSignedUp && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <b>Registration initiated!</b> Please check your email inbox to verify your account. You will be able to log in once you verify your email address.
                </Alert>
              )}

              {searchParams.get('deactivated') === 'true' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Your account has been deactivated. Please contact customer support for more information.
                </Alert>
              )}

              {error && (
                <Alert severity={error.includes('DEBUG') ? 'info' : 'error'} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loginMethod === 'phone' ? (
                <Box component="form" onSubmit={handleLoginWithOtp}>
                  {!otpSent ? (
                    <>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                        }}
                        placeholder="10-digit mobile number"
                        sx={textFieldStyle}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ 
                          mt: 2,
                          borderRadius: borderRadius,
                          backgroundColor: primaryAccent,
                          '&:hover': {
                            backgroundColor: accentHover,
                            boxShadow: `0 4px 12px ${primaryAccent}40`
                          }
                        }}
                        onClick={handleSendOtp}
                        disabled={otpLoading || phone.length !== 10}
                      >
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                        Code sent to <b>{phone}</b>
                      </Typography>
                      <TextField
                        margin="normal"
                        fullWidth
                        label="6-Digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        autoFocus
                        sx={textFieldStyle}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ 
                          mt: 2,
                          borderRadius: borderRadius,
                          backgroundColor: primaryAccent,
                          '&:hover': {
                            backgroundColor: accentHover,
                            boxShadow: `0 4px 12px ${primaryAccent}40`
                          }
                        }}
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                      </Button>
                      <Button 
                        fullWidth 
                        variant="text" 
                        sx={{ mt: 1, textTransform: 'none', color: primaryAccent }} 
                        onClick={() => setOtpSent(false)}
                      >
                        Change Phone Number
                      </Button>
                    </>
                  )}
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus={!formData.email}
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldStyle}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={textFieldStyle}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Link
                      component="button"
                      variant="body2"
                      type="button"
                      onClick={() => setOpenForgotModal(true)}
                      sx={{ cursor: 'pointer', color: primaryAccent, '&:hover': { color: accentHover } }}
                    >
                      Forgot Password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 1,
                      borderRadius: borderRadius,
                      backgroundColor: primaryAccent,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: accentHover,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${primaryAccent}40`
                      }
                    }}
                    disabled={isLoading}
                    size="large"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center', mb: 1.5, fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    — OR QUICK LOGIN —
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: 1, 
                      mb: 1, 
                      maxHeight: '260px', 
                      overflowY: 'auto', 
                      p: 1.5, 
                      border: '1px solid rgba(0,0,0,0.06)', 
                      borderRadius: 3,
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'rgba(0,0,0,0.12)',
                        borderRadius: '4px',
                        '&:hover': {
                          background: 'rgba(0,0,0,0.24)',
                        }
                      }
                    }}
                  >
                    {[
                      { label: 'Main Demo', email: 'support@agbtechnologies.com', icon: Star, primary: true },
                      { label: 'Retail', email: 'support_retail@agbtechnologies.com', icon: Storefront },
                      { label: 'Pharmacy', email: 'support_pharmacy@agbtechnologies.com', icon: LocalPharmacy },
                      { label: 'Automobile', email: 'support_automobile@agbtechnologies.com', icon: DirectionsCar },
                      { label: 'Electronics', email: 'support_electronics@agbtechnologies.com', icon: Devices },
                      { label: 'Healthcare', email: 'support_healthcare@agbtechnologies.com', icon: LocalHospital },
                      { label: 'Education', email: 'support_education@agbtechnologies.com', icon: School },
                      { label: 'Real Estate', email: 'support_real_estate@agbtechnologies.com', icon: Home },
                      { label: 'Logistics', email: 'support_logistics@agbtechnologies.com', icon: LocalShipping },
                      { label: 'Manufacturing', email: 'support_manufacturing@agbtechnologies.com', icon: PrecisionManufacturing },
                      { label: 'Hospitality', email: 'support_hospitality@agbtechnologies.com', icon: Hotel },
                      { label: 'Textile', email: 'support_textile@agbtechnologies.com', icon: Checkroom },
                      { label: 'FMCG', email: 'support_fmcg@agbtechnologies.com', icon: ShoppingBasket },
                      { label: 'Jewellery', email: 'support_jewellery@agbtechnologies.com', icon: Diamond },
                      { label: 'Services', email: 'support_services@agbtechnologies.com', icon: Engineering },
                      { label: 'Grocery', email: 'support_grocery@agbtechnologies.com', icon: LocalGroceryStore },
                      { label: 'Gym', email: 'support_gym@agbtechnologies.com', icon: FitnessCenter },
                      { label: 'Salon', email: 'support_salon@agbtechnologies.com', icon: ContentCut },
                      { label: 'Restaurant', email: 'support_restaurant@agbtechnologies.com', icon: Restaurant },
                      { label: 'Hardware', email: 'support_hardware@agbtechnologies.com', icon: Construction },
                      { label: 'Furniture', email: 'support_furniture@agbtechnologies.com', icon: Weekend },
                      { label: 'Mobile Shop', email: 'support_mobile_shop@agbtechnologies.com', icon: Smartphone },
                    ].map((demo) => {
                      const DemoIcon = demo.icon;
                      return (
                        <Box
                          key={demo.email + demo.label}
                          onClick={() => {
                            setLoginMethod('email');
                            setFormData({ email: demo.email, password: 'Shubham@143' });
                            const slug = demo.label === 'Main Demo'
                              ? null
                              : demo.label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                            setSelectedIndustry(slug);
                          }}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 1.2,
                            px: 0.8,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: demo.primary ? primaryAccent : 'rgba(0,0,0,0.06)',
                            backgroundColor: demo.primary ? `${primaryAccent}08` : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: primaryAccent,
                              backgroundColor: demo.primary ? `${primaryAccent}15` : 'rgba(59, 130, 246, 0.04)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
                              '& .industry-icon': {
                                transform: 'scale(1.15)',
                                color: primaryAccent
                              }
                            }
                          }}
                        >
                          <DemoIcon 
                            className="industry-icon"
                            sx={{ 
                              fontSize: 20, 
                              color: demo.primary ? primaryAccent : 'text.secondary',
                              transition: 'all 0.2s ease-in-out',
                              mb: 0.5
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            fontWeight={demo.primary ? 'bold' : 500}
                            sx={{ 
                              fontSize: '0.62rem', 
                              color: demo.primary ? primaryAccent : 'text.primary',
                              textAlign: 'center',
                              lineHeight: 1.2,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%'
                            }}
                          >
                            {demo.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                  OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => {
                    setLoginMethod(loginMethod === 'phone' ? 'email' : 'phone');
                    setError('');
                  }}
                  sx={{ 
                    borderColor: '#ddd', 
                    color: '#555',
                    borderRadius: borderRadius,
                    '&:hover': { borderColor: primaryAccent, backgroundColor: '#f8f9fa' }
                  }}
                >
                  {loginMethod === 'phone' ? 'Sign in with Email' : 'Sign in with Phone'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={() => console.log('Google Login')}
                  sx={{ 
                    borderColor: '#ddd', 
                    color: '#555',
                    borderRadius: borderRadius,
                    '&:hover': { borderColor: '#4285F4', backgroundColor: '#f8f9fa' }
                  }}
                >
                  Sign in with Google
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Apple />}
                  onClick={() => console.log('Apple Login')}
                  sx={{ 
                    backgroundColor: '#000', 
                    color: '#fff',
                    borderRadius: borderRadius,
                    '&:hover': { backgroundColor: '#333' }
                  }}
                >
                  Sign in with Apple
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {!isInvite && (
                <Box textAlign="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an Admin account?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      type="button"
                      onClick={handleSignupRedirect}
                      sx={{ cursor: 'pointer', fontWeight: 'bold', color: primaryAccent, '&:hover': { color: accentHover } }}
                    >
                      Create one here
                    </Link>
                  </Typography>
                </Box>
              )}

              <Box textAlign="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Need help?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    type="button"
                    onClick={() => navigate('/support')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold', color: primaryAccent, '&:hover': { color: accentHover } }}
                  >
                    Contact Support
                  </Link>
                </Typography>
              </Box>

              {uiConfig && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={() => setSelectedIndustry(null)}
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: '0.75rem', 
                      textTransform: 'none',
                      '&:hover': { color: primaryAccent }
                    }}
                  >
                    ← Exit {selectedIndustry?.replace(/-/g, ' ')} Mode
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Dialog open={openForgotModal} onClose={handleCloseForgotModal} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }} component="div">
            <LockOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="div" variant="h5" fontWeight="bold">Forgot Password</Typography>
          </DialogTitle>
          <DialogContent>
            {!resetSent ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
                <Box component="form" onSubmit={handleForgotPassword}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    size="large"
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Reset link sent! Please check your email inbox.
                </Alert>
                <Button fullWidth variant="outlined" onClick={handleCloseForgotModal}>
                  Back to Login
                </Button>
              </Box>
            )}
          </DialogContent>
          {!resetSent && (
            <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button onClick={handleCloseForgotModal} color="inherit">Cancel</Button>
            </DialogActions>
          )}
        </Dialog>

        <Snackbar
          open={openErrorSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenErrorSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error" sx={{ width: '100%' }} variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;

