/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { validatePassword } from '../utils/validatePassword';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  AccountTree as RoleIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Summarize as SummarizeIcon,
  QueryStats as OperatorIcon,
  VisibilityOff,
  Lock as LockIcon,
  Check as CheckIcon,
  LocationOn as MapPinIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authAPI, api as apiClient } from '../infrastructure/api';
import { resolveFileUrl } from '../utils/url';
import { LoadingScreen, SectionLoader } from '../components/common/LoadingScreen';
import { ActiveSessions } from '../components/security/ActiveSessions';
import { StateCitySelector } from '../components/common/StateCitySelector';
import { API_URL } from '../config/api';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import { Autocomplete } from '@mui/material';
import stateCityData from '../data/state_city.json';
import { validateAddressField } from '../utils/addressValidation';
import { validateGST, validatePAN } from '../utils/validation';
import SecureActionDialog from '../components/shared/SecureActionDialog';
import PendingSetupTasks from '../components/profile/PendingSetupTasks';



import { emailSchema, nameSchema, personalNameSchema, mobileSchema, addressSchema, stateSchema, citySchema, pincodeSchema } from '../utils/validation';

const profileSchema = z.object({
  name: personalNameSchema,
  email: emailSchema,
  phone: mobileSchema,
  company: nameSchema,
  address: addressSchema,
  city: citySchema,
  state: stateSchema,
  pincode: pincodeSchema.optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface OrganizationData {
  companyName: string;
  organizationSize: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, switchRole, availableRoles, refreshUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();

  // If we are still initializing auth, or have no user, show a stable loader
  if (isLoading || !user) {
    return <SectionLoader message="Readying your cockpit..." transparent={false} />;
  }
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationData | null>(null);

  // Change Password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({ current: '', newPw: '', confirm: '', api: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Setup Checklist State
  const [setupStatus, setSetupStatus] = useState({
    customers: true,
    products: true,
    address: !!user?.address,
    phone: !!user?.phone,
    loading: true
  });

  // Business Identity Form Logic (Relocated from Settings)
  const [bizSaving, setBizSaving] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);
  const [bizSuccess, setBizSuccess] = useState(false);
  const [bizFieldErrors, setBizFieldErrors] = useState<Record<string, string | null>>({});
  const [bizFormData, setBizFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    gstNumber: user?.gstNumber || '',
    panNumber: user?.panNumber || ''
  });
  const [secureDialogOpen, setSecureDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setBizFormData({
        name: user.name || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        gstNumber: user.gstNumber || '',
        panNumber: user.panNumber || ''
      });
    }
  }, [user]);

  const handleBizInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBizFormData(prev => ({ ...prev, [name]: value }));
    if (bizFieldErrors[name]) {
      setBizFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateBizForm = () => {
    const errors: Record<string, string | null> = {
      address: validateAddressField('address', bizFormData.address),
      city: validateAddressField('city', bizFormData.city),
      state: validateAddressField('state', bizFormData.state),
      pincode: validateAddressField('pincode', bizFormData.pincode)
    };
    
    if (bizFormData.phone && !/^[6-9]\d{9}$/.test(bizFormData.phone)) {
      errors.phone = 'Phone must be 10 digits and start with 6, 7, 8, or 9';
    }

    const gstRes = validateGST(bizFormData.gstNumber);
    if (!gstRes.isValid) errors.gstNumber = gstRes.error || 'Invalid GST';

    const panRes = validatePAN(bizFormData.panNumber);
    if (!panRes.isValid) errors.panNumber = panRes.error || 'Invalid PAN';

    setBizFieldErrors(errors);
    return !Object.values(errors).some(v => v !== null);
  };

  const handleBizSaveTrigger = () => {
    const isSecure = localStorage.getItem('secureActionsEnabled') === 'true';
    if (isSecure) {
      setSecureDialogOpen(true);
    } else {
      handleBizSave();
    }
  };

  const handleBizSave = async () => {
    if (!validateBizForm()) {
      setBizError('Please fix the validation errors below.');
      return;
    }

    setBizSaving(true);
    setBizError(null);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/auth/profile`, {
        name: bizFormData.name,
        companyName: bizFormData.companyName,
        phone: bizFormData.phone,
        address: bizFormData.address,
        city: bizFormData.city,
        state: bizFormData.state,
        pincode: bizFormData.pincode,
        gstNumber: bizFormData.gstNumber,
        panNumber: bizFormData.panNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await refreshUser?.();
      setBizSuccess(true);
      setIsEditingAddress(false);
      setTimeout(() => setBizSuccess(false), 4000);
      setBizFieldErrors({});
    } catch (err: any) {
      setBizError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setBizSaving(false);
      setSecureDialogOpen(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwErrors({ current: '', newPw: '', confirm: '', api: '' });
    setPwSuccess(false);
    setShowPasswordDialog(true);
  };

  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    const errs = { current: '', newPw: '', confirm: '', api: '' };
    if (!pwForm.current) errs.current = 'Current password is required';

    // Central validation (respects strong/weak mode setting)
    const strengthCheck = validatePassword(pwForm.newPw);
    if (!strengthCheck.valid) {
      errs.newPw = strengthCheck.error;
    }
    
    if (pwForm.newPw && pwForm.confirm !== pwForm.newPw) errs.confirm = 'Passwords do not match';

    if (errs.current || errs.newPw || errs.confirm) {
        setPwErrors(errs);
        return;
    }

    setPwLoading(true);
    setPwErrors({ current: '', newPw: '', confirm: '', api: '' });

    try {
        const res = await apiClient.post('/auth/change-password', 
            { currentPassword: pwForm.current, newPassword: pwForm.newPw }
        );

        // Backend returns status 200 on success, without an explicit success:true field
        if (res.status === 200 || res.status === 201) {
            setPwSuccess(true);
            setPwForm({ current: '', newPw: '', confirm: '' });
            
            setTimeout(() => {
              showSuccess('Password updated successfully!');
            }, 2000);
        }
    } catch (err: any) {
        const msg = err.response?.data?.error || 'Failed to change password';
        if (err.response?.status === 401) {
            setPwErrors(prev => ({ ...prev, current: msg }));
        } else {
            setPwErrors(prev => ({ ...prev, api: msg }));
        }
    } finally {
        setPwLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.companyName || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    }
  });

  useEffect(() => {
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.companyName || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
    });
    
    const storedData = localStorage.getItem('organizationData');
    if (storedData) {
      setOrgData(JSON.parse(storedData));
    }

    // Refresh Setup Status
    const checkSetupStatus = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          apiClient.get('/customers'),
          apiClient.get('/products')
        ]);
        
        setSetupStatus({
          customers: custRes.data.customers?.length > 0,
          products: prodRes.data.products?.length > 0,
          address: !!user?.address,
          phone: !!user?.phone,
          loading: false
        });
      } catch (err) {
        console.error('Failed to fetch setup status:', err);
        setSetupStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkSetupStatus();
  }, [reset, user]);

  const onSave = (data: ProfileFormData) => {
    updateProfile(data as any);

    // Update organization data in localStorage
    if (orgData) {
      const updatedOrgData = {
        ...orgData,
        adminName: data.name,
        adminEmail: data.email,
        adminPhone: data.phone,
        companyName: data.company,
      };
      localStorage.setItem('organizationData', JSON.stringify(updatedOrgData));
      setOrgData(updatedOrgData);
    }

    setIsEditing(false);
    showSuccess('Profile updated successfully!');
  };

  const handleCancel = () => {
    if (orgData) {
      reset({
        name: orgData.adminName || user?.name || '',
        email: orgData.adminEmail || user?.email || '',
        phone: orgData.adminPhone || '',
        company: orgData.companyName || '',
      });
    }
    setIsEditing(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const response = await authAPI.uploadImage(file, 'avatars');
      if (response.success && response.imageUrl) {
        await updateProfile({ avatarUrl: response.imageUrl } as any);
        showSuccess('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Failed to upload avatar', error);
      showError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (event.target) {
        event.target.value = ''; // Reset input
      }
    }
  };

  return (
    <Box sx={{ maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 4, px: { xs: 1, sm: 0 } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          My Profile
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>


      {/* Setup Progress Checklist */}
      <PendingSetupTasks setupStatus={setupStatus} setIsEditing={setIsEditing} />



      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Profile Information */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between', 
                gap: 2,
                mb: 3 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Profile Information
                  </Typography>
                </Box>
                {!isEditing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                    size="small"
                    fullWidth={false}
                    sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit(onSave)}
                      variant="contained"
                      size="small"
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      variant="outlined"
                      size="small"
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Box component="form" onSubmit={handleSubmit(onSave)}>
                {/* Organization Info */}
                {orgData && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" color="primary" />
                      Organization Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Company:</strong> {orgData.companyName}
                    </Typography>
                    {orgData.organizationSize && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Size:</strong> {orgData.organizationSize} employees
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('name')}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={!isEditing}
                      variant="outlined"
                      inputProps={{ maxLength: 30 }}
                      InputProps={{
                        startAdornment: (<IconButton size="small" sx={{ mr: 1, pointerEvents: 'none' }}><PersonIcon fontSize="small" /></IconButton>),
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Email Address"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={!isEditing}
                      variant="outlined"
                      type="email"
                      inputProps={{ maxLength: 50 }}
                      InputProps={{
                        startAdornment: (<IconButton size="small" sx={{ mr: 1, pointerEvents: 'none' }}><EmailIcon fontSize="small" /></IconButton>),
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...register('phone', {
                        onChange: (e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          e.target.value = val.slice(0, 10);
                        }
                      })}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={!isEditing}
                      variant="outlined"
                      placeholder="9876543210"
                      inputProps={{ maxLength: 10, pattern: '[0-9]*' }}
                      InputProps={{
                        startAdornment: (<IconButton size="small" sx={{ mr: 1, pointerEvents: 'none' }}><PhoneIcon fontSize="small" /></IconButton>),
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Company"
                      {...register('company')}
                      error={!!errors.company}
                      helperText={errors.company?.message}
                      disabled={!isEditing}
                      variant="outlined"
                      inputProps={{ maxLength: 30 }}
                      InputProps={{
                        startAdornment: (<IconButton size="small" sx={{ mr: 1, pointerEvents: 'none' }}><BusinessIcon fontSize="small" /></IconButton>),
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user?.role || 'ADMIN'}
                      disabled
                      size="medium"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Business Identity / Address Section (Relocated from Settings) */}
          <Box sx={{ mt: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              justifyContent: 'space-between', 
              gap: 2,
              mb: 2 
            }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Business Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This information will be displayed on your generated invoices and official documents.
                </Typography>
              </Box>
              {!isEditingAddress ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingAddress(true)}
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, borderRadius: '10px' }}
                >
                  Edit Address
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleBizSaveTrigger}
                    variant="contained"
                    size="small"
                    sx={{ flex: { xs: 1, sm: 'none' }, borderRadius: '10px' }}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditingAddress(false);
                      setBizFormData({
                        name: user?.name || '',
                        companyName: user?.companyName || '',
                        phone: user?.phone || '',
                        email: user?.email || '',
                        address: user?.address || '',
                        city: user?.city || '',
                        state: user?.state || '',
                        pincode: user?.pincode || '',
                        gstNumber: user?.gstNumber || '',
                        panNumber: user?.panNumber || ''
                      });
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ flex: { xs: 1, sm: 'none' }, borderRadius: '10px' }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: isEditingAddress ? '1px solid' : '1px solid transparent',
              borderColor: 'primary.light',
              transition: 'all 0.3s ease',
              bgcolor: isEditingAddress ? 'rgba(37, 99, 235, 0.01)' : 'background.paper'
            }}>
              <CardContent sx={{ p: 4 }}>
                {bizError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{bizError}</Alert>}
                {bizSuccess && <Alert severity="success" variant="filled" sx={{ mb: 3, borderRadius: 2 }}>Business address updated successfully!</Alert>}
                
                {!isEditingAddress ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Company Details</Typography>
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <BusinessIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Company Name</Typography>
                            <Typography variant="body1" fontWeight={600}>{bizFormData.companyName || 'Not Set'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <PersonIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Business / Owner Name</Typography>
                            <Typography variant="body1" fontWeight={600}>{bizFormData.name || 'Not Set'}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Contact & Location</Typography>
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <MapPinIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Address</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {bizFormData.address || 'No address set'}, {bizFormData.city}, {bizFormData.state} - {bizFormData.pincode}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <PhoneIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                            <Typography variant="body1" fontWeight={600}>{bizFormData.phone || 'Not Set'}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Divider sx={{ my: 1 }} />
                    </Box>

                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Tax Information</Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">GST Number</Typography>
                          <Chip label={bizFormData.gstNumber || 'NOT ADDED'} size="small" color={bizFormData.gstNumber ? "primary" : "default"} variant="outlined" sx={{ fontWeight: 'bold', mt: 0.5 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">PAN Number</Typography>
                          <Chip label={bizFormData.panNumber || 'NOT ADDED'} size="small" color={bizFormData.panNumber ? "primary" : "default"} variant="outlined" sx={{ fontWeight: 'bold', mt: 0.5 }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={bizFormData.companyName}
                      onChange={handleBizInputChange}
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Business Name / Owner Name"
                      name="name"
                      value={bizFormData.name}
                      onChange={handleBizInputChange}
                      variant="outlined"
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Street Address / Area"
                    name="address"
                    value={bizFormData.address}
                    onChange={handleBizInputChange}
                    multiline
                    rows={3}
                    variant="outlined"
                    error={!!bizFieldErrors.address}
                    helperText={bizFieldErrors.address}
                    inputProps={{ maxLength: 80 }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                    <Autocomplete
                      options={stateCityData.states.map((s: { name: string }) => s.name)}
                      value={bizFormData.state}
                      onChange={(_, newValue) => {
                        setBizFormData({ ...bizFormData, state: newValue || '', city: '' });
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="State" 
                          variant="outlined"
                          error={!!bizFieldErrors.state}
                          helperText={bizFieldErrors.state}
                        />
                      )}
                    />
                    <Autocomplete
                      options={stateCityData.states.find((s: { name: string }) => s.name === bizFormData.state)?.cities || []}
                      value={bizFormData.city}
                      disabled={!bizFormData.state}
                      onChange={(_, newValue) => {
                        setBizFormData({ ...bizFormData, city: newValue || '' });
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="City" 
                          variant="outlined"
                          error={!!bizFieldErrors.city}
                          helperText={bizFieldErrors.city}
                        />
                      )}
                    />
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={bizFormData.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setBizFormData({ ...bizFormData, pincode: val.slice(0, 6) });
                      }}
                      variant="outlined"
                      error={!!bizFieldErrors.pincode}
                      helperText={bizFieldErrors.pincode}
                      inputProps={{ maxLength: 6 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={bizFormData.phone}
                        onChange={handleBizInputChange}
                        variant="outlined"
                        error={!!bizFieldErrors.phone}
                        helperText={bizFieldErrors.phone}
                      />
                      <Box sx={{ position: 'absolute', top: '28px', right: '14px', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'success.main', zIndex: 2 }}>
                        <CheckIcon fontSize="small" />
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <TextField
                        fullWidth
                        label="Email Address (Login)"
                        value={bizFormData.email}
                        disabled
                        variant="outlined"
                        helperText="Email cannot be changed"
                      />
                      <Box sx={{ position: 'absolute', top: '28px', right: '14px', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'success.main', zIndex: 2 }}>
                        <CheckIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      name="gstNumber"
                      value={bizFormData.gstNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
                        setBizFormData({ ...bizFormData, gstNumber: val });
                      }}
                      variant="outlined"
                      error={!!bizFieldErrors.gstNumber}
                      helperText={bizFieldErrors.gstNumber}
                      inputProps={{ maxLength: 15 }}
                    />
                    <TextField
                      fullWidth
                      label="PAN Number"
                      name="panNumber"
                      value={bizFormData.panNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                        setBizFormData({ ...bizFormData, panNumber: val });
                      }}
                      variant="outlined"
                      error={!!bizFieldErrors.panNumber}
                      helperText={bizFieldErrors.panNumber}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleBizSaveTrigger} 
                      disabled={bizSaving}
                      size="large"
                      sx={{ px: 4, py: 1.5, fontWeight: 'bold', borderRadius: 2 }}
                    >
                      {bizSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Business Address'}
                    </Button>
                  </Box>
                </Box>
              )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Profile Picture & Account Info */}
        <Box>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    color="primary"
                    component="label"
                    size="small"
                    sx={{
                      bgcolor: 'background.paper',
                      border: 2,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                  </IconButton>
                }
              >
                <Avatar
                  src={user?.avatar ? resolveFileUrl(user.avatar) : undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2,
                    opacity: isUploadingAvatar ? 0.5 : 1
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email || 'admin@admin.com'}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="medium">
                {user?.plan || 'Enterprise Plan'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account Status
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium" gutterBottom>
                  ✓ Active
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Member Since
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Join date unknown'}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Last Login
                </Typography>
                <Typography variant="body2">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'First time login'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  startIcon={<SecurityIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={handleOpenPasswordDialog}
                >
                  Change Password
                </Button>
                <Button
                  startIcon={<PersonIcon />}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={() => navigate('/settings/privacy')}
                >
                  Privacy Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ── Security & Active Sessions ── */}
      <ActiveSessions />

      {/* Role Testing & Application Views */}
      {user?.realRole === 'ADMIN' && !user?.parentId && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Application Views & Role Testing
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            As an administrator, you can switch between different roles to test how the application appears for different types of users.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            {/* Role Switching */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Switch User Role
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Experience the application from different user perspectives. Your current role affects which features and data you can access.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Role: <Chip label={user?.role?.toUpperCase()} color="primary" size="small" />
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {availableRoles.map((roleOption) => (
                    <Card
                      key={roleOption.name}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: user?.role === roleOption.name ? '2px solid' : '1px solid',
                        borderColor: user?.role === roleOption.name ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1
                        }
                      }}
                      onClick={() => switchRole(roleOption.name as any)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {roleOption.name === 'ADMIN' && <AdminIcon color="primary" />}
                          {roleOption.name === 'MANAGER' && <RoleIcon color="primary" />}
                          {roleOption.name === 'ACCOUNTANT' && <SummarizeIcon color="primary" />}
                          {roleOption.name === 'FINANCE' && <SummarizeIcon color="primary" />}
                          {roleOption.name === 'OPERATOR' && <OperatorIcon color="primary" />}
                          {(roleOption.name === 'STAFF' || roleOption.name === 'VIEWER') && <ViewIcon color="primary" />}
                          <Typography variant="subtitle2" fontWeight="bold">
                            {roleOption.displayName}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {roleOption.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Current Permissions */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Current Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your current role grants you the following permissions:
                </Typography>

                <List dense>
                  {Array.isArray(user?.permissions) ? user.permissions.map((permission, index) => (
                    permission && (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={permission === 'all' || permission === 'all_access' 
                            ? 'Full System Access' 
                            : String(permission)
                                .replace(/_/g, ' ')
                                .replace(/([A-Z])/g, ' $1')
                                .trim()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ')
                          }
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    )
                  )) : Object.entries(user?.permissions || {}).map(([permission, value], index) => (
                    value ? (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={String(permission).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ) : null
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Role Description
                </Typography>
                <Typography variant="body2">
                  {availableRoles.find(r => r.name === user?.role)?.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Change Password Dialog */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={() => !pwLoading && setShowPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 3 }}>
          <LockIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Change Password</Typography>
        </DialogTitle>
        <DialogContent>
          <Box 
            component="form" 
            onSubmit={handleChangePassword}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}
          >
            {pwSuccess && <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>Password updated successfully!</Alert>}
            {pwErrors.api && <Alert severity="error">{pwErrors.api}</Alert>}

            <TextField
              fullWidth
              label="Current Password"
              type={pwShow.current ? 'text' : 'password'}
              value={pwForm.current}
              onChange={(e) => setPwForm(p => ({ ...p, current: e.target.value }))}
              error={!!pwErrors.current}
              helperText={pwErrors.current}
              disabled={pwLoading || pwSuccess}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setPwShow(p => ({ ...p, current: !p.current }))} size="small">
                      {pwShow.current ? <VisibilityOff /> : <ViewIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={pwShow.newPw ? 'text' : 'password'}
              value={pwForm.newPw}
              onChange={(e) => setPwForm(p => ({ ...p, newPw: e.target.value }))}
              error={!!pwErrors.newPw}
              helperText={pwErrors.newPw}
              disabled={pwLoading || pwSuccess}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setPwShow(p => ({ ...p, newPw: !p.newPw }))} size="small">
                      {pwShow.newPw ? <VisibilityOff /> : <ViewIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={pwShow.confirm ? 'text' : 'password'}
              value={pwForm.confirm}
              onChange={(e) => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              error={!!pwErrors.confirm}
              helperText={pwErrors.confirm}
              disabled={pwLoading || pwSuccess}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setPwShow(p => ({ ...p, confirm: !p.confirm }))} size="small">
                      {pwShow.confirm ? <VisibilityOff /> : <ViewIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setShowPasswordDialog(false)} disabled={pwLoading} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            type="submit"
            variant="contained" 
            disabled={pwLoading || pwSuccess}
            startIcon={pwLoading ? <CircularProgress size={16} color="inherit" /> : (pwSuccess ? <CheckIcon /> : null)}
            color={pwSuccess ? 'success' : 'primary'}
            sx={{ fontWeight: 'bold', minWidth: 150 }}
          >
            {pwSuccess ? 'Updated!' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>


      <SecureActionDialog 
        open={secureDialogOpen}
        onClose={() => setSecureDialogOpen(false)}
        onConfirm={() => handleBizSave()}
        title="Authorize Profile Update"
        message="Updating your business profile is a critical action. Enter your security PIN to proceed."
        actionLabel="Update Profile"
      />
    </Box>
  );
};

export default Profile;
