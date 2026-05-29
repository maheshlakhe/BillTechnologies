import React, { useState } from 'react';
import axios from 'axios';
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
  Stepper,
  Step,
  StepLabel,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Email,
  Person,
  Phone as PhoneIcon,
  Google,
  Apple,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { validatePassword } from '../utils/validatePassword';
import { emailSchema, nameSchema, personalNameSchema, mobileSchema } from '../utils/validation';

// Base schema without password regex
const signupSchemaBase = z.object({
  name: personalNameSchema,
  email: emailSchema,
  phone: mobileSchema,
  password: z.string().superRefine((val, ctx) => {
    const result = validatePassword(val);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error,
      });
    }
  }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  companyName: nameSchema,
  industryId: z.string().min(1, 'Please select your industry'),
  organizationSize: z.string()
    .regex(/^\d*$/, 'Only numbers are allowed')
    .optional()
});

const Signup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState<'strong' | 'weak'>('strong');
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);
  const { isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic Schema
  const dynamicSignupSchema = React.useMemo(() => {
    let passSchema = z.string().max(16, 'Password must be 16 characters or less');
    
    if (passwordPolicy === 'strong') {
      passSchema = passSchema
        .min(8, 'Password must be at least 8 characters long')
        .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Password must contain at least one number and one special character');
    } else {
      passSchema = passSchema.min(3, 'Password must be at least 3 characters');
    }

    return signupSchemaBase.extend({
      password: passSchema
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
  }, [passwordPolicy]);

  type SignupFormData = z.infer<typeof dynamicSignupSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(dynamicSignupSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      industryId: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      organizationSize: ''
    }
  });

  // Fetch policy and industries
  React.useEffect(() => {
    axios.get(`${API_URL}/public/password-policy`).then(res => {
      if (res.data.success) setPasswordPolicy(res.data.strength);
    }).catch(() => setPasswordPolicy('strong'));

    axios.get(`${API_URL}/public/industries`).then(res => {
      if (res.data.success) {
        setIndustries(res.data.industries);
        
        // Auto-select industry if passed in URL
        const params = new URLSearchParams(location.search);
        const industrySlug = params.get('industry');
        if (industrySlug) {
          const matched = res.data.industries.find((i: any) => i.slug === industrySlug);
          if (matched) {
            setValue('industryId', matched.id);
          }
        }
      }
    }).catch(err => console.error('Failed to fetch industries', err));
  }, [location.search, setValue]);

  React.useEffect(() => {
    if (!isAuthLoading && localStorage.getItem('authToken')) {
      navigate('/dashboard');
    }
  }, [isAuthLoading, navigate]);

  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setServerError('Please enter a valid 10-digit phone number');
      return;
    }
    setServerError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      if (res.data.success) {
        setActiveStep(1);
        if (res.data.debug_code) {
          console.log('DEBUG OTP:', res.data.debug_code);
          setServerError(`DEBUG: OTP is ${res.data.debug_code}`);
        }
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setServerError('Please enter the 6-digit OTP');
      return;
    }
    setServerError('');
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { phone, code: otp });
      if (res.data.success) {
        setValue('phone', phone);
        setActiveStep(2);
      }
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setServerError('');
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        industryId: data.industryId,
        name: data.name,
        phone: data.phone,
        organizationSize: data.organizationSize
      });

      navigate(`/login?signup=success&email=${encodeURIComponent(data.email)}`);

    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Verify Phone', 'Enter OTP', 'Account Details'];

  return (
    <Container component="main" maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ marginTop: { xs: 4, sm: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: { xs: 'none', sm: 3 },
          border: { xs: 'none', sm: '1px solid rgba(0,0,0,0.05)' }
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <img src="/logo.svg" alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
              <Typography variant="h4" fontWeight="bold">BillSoft</Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {serverError && <Alert severity={serverError.includes('DEBUG') ? 'info' : 'error'} sx={{ mb: 2 }}>{serverError}</Alert>}

            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Verify Your Phone</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start by verifying your mobile number to secure your account.
                </Typography>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                  }}
                  placeholder="10-digit mobile number"
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendOtp}
                  disabled={isLoading || phone.length !== 10}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
                  <Divider sx={{ flexGrow: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>OR SIGN UP WITH</Typography>
                  <Divider sx={{ flexGrow: 1 }} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button fullWidth variant="outlined" startIcon={<Google />} onClick={() => console.log('Google Signup')}>Google</Button>
                  <Button fullWidth variant="contained" startIcon={<Apple />} sx={{ bgcolor: '#000' }} onClick={() => console.log('Apple Signup')}>Apple</Button>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Enter Verification Code</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  We've sent a 6-digit code to <b>{phone}</b>.
                </Typography>
                <TextField
                  fullWidth
                  label="6-Digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => setActiveStep(0)}>Change Phone Number</Button>
              </Box>
            )}

            {activeStep === 2 && (
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>Finalize Your Account</Typography>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Company Name"
                  {...register('companyName')}
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                />

                <Controller
                  name="industryId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      margin="normal"
                      required
                      fullWidth
                      label="Industry"
                      error={!!errors.industryId}
                      helperText={errors.industryId?.message}
                    >
                      <MenuItem value="" disabled>Select your industry</MenuItem>
                      {industries.map((industry) => (
                        <MenuItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading || !isValid}
                  size="large"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Signup'}
                </Button>
              </Box>
            )}

            <Box textAlign="center" mt={3}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component="button" variant="body2" onClick={() => navigate('/login')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Signup;
