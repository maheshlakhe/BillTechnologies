import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../config/api';
import { initiatePayment } from '../utils/paymentUtils';
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Chip,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const allPlans = [
    {
        id: 'FREE',
        name: 'Free Plan',
        price: '₹0',
        period: 'Forever',
        priceNum: 0,
        description: 'Lead Engine Plan',
        color: '#6b7280',
        features: ['50 invoices/mo', 'Basic billing', 'Limited inventory', '1 user'],
        buttonLabel: 'Current / Downgrade',
        isEnterprise: false,
        popular: false,
    },
    {
        id: 'STARTER',
        name: 'Starter',
        price: '₹399',
        period: '/mo',
        priceNum: 399,
        description: 'For small businesses getting started',
        color: '#3b82f6',
        features: ['500 invoices', 'Basic reports', '3 users', 'Email support'],
        buttonLabel: 'Upgrade to Starter',
        isEnterprise: false,
        popular: false,
    },
    {
        id: 'GROWTH',
        name: 'Growth',
        price: '₹999',
        period: '/mo',
        priceNum: 999,
        description: 'Best for growing businesses',
        color: '#3b82f6',
        features: [
            'Unlimited invoices',
            'Inventory management',
            'Customer tracking',
            'Desktop + Mobile',
            'GST Ready (Advantage)',
            'Basic analytics',
        ],
        buttonLabel: 'Upgrade to Growth',
        isEnterprise: false,
        popular: true,
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: '₹2,499',
        period: '/mo',
        priceNum: 2499,
        description: 'Advanced features for power users',
        color: '#1e293b',
        features: [
            'Advanced analytics',
            'Multi-user roles',
            'Audit logs',
            'Automation',
            'API access',
        ],
        buttonLabel: 'Upgrade to Pro',
        isEnterprise: false,
        popular: false,
    },
    {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        priceNum: 999999,
        description: 'Scale as you go',
        color: '#7c3aed',
        features: ['Dedicated infra', 'SLA + Priority', 'Custom features', 'Training'],
        buttonLabel: 'Contact Sales',
        isEnterprise: true,
        popular: false,
    },
];

const planHierarchy: Record<string, number> = {
    FREE: 0,
    STARTER: 1,
    GROWTH: 2,
    PRO: 3,
    ENTERPRISE: 4,
};

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const currentPlanLevel = planHierarchy[(user as any)?.planType?.toUpperCase() || 'FREE'] ?? 0;
    // Show plans at or above current level (allow renewal + upgrade)
    const availablePlans = allPlans.filter(p => planHierarchy[p.id] >= currentPlanLevel);

    const handleSelectPlan = async (planId: string) => {
        if (!user) {
            navigate('/login', { state: { from: '/payment' } });
            return;
        }

        // Enterprise → contact sales
        if (planId === 'ENTERPRISE') {
            window.location.href = 'mailto:agbitsolutions247@gmail.com?subject=Enterprise Plan Inquiry';
            return;
        }

        // Free → no charge
        if (planId === 'FREE') {
            navigate('/dashboard');
            return;
        }

        setLoadingPlan(planId);
        setError(null);

        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.post(
                `${API_URL}/payments/create-subscription-session`,
                { plan: planId, origin: window.location.origin },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const { sdk_payload, payment_links, order_id } = response.data;
            await initiatePayment(sdk_payload, order_id, { type: 'SUBSCRIPTION' }, payment_links);
        } catch (err: any) {
            console.error('[PaymentPage] Failed:', err);
            setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
            setLoadingPlan(null);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: '#f0f4ff', py: 6 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/subscription')}
                    sx={{ borderRadius: 2 }}
                >
                    Back
                </Button>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 5, textAlign: 'center', background: '#fff' }}>
                    <Typography variant="h4" fontWeight={900} gutterBottom sx={{ color: '#1e293b' }}>
                        Upgrade Your Plan
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Choose the perfect plan for your business and unlock premium features instantly.
                    </Typography>
                    {(user as any)?.planType && (
                        <Chip
                            label={`Current Plan: ${(user as any).planType}`}
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 2, fontWeight: 700, textTransform: 'capitalize' }}
                        />
                    )}
                </Paper>

                {/* Plan Cards */}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                }}>
                    {availablePlans.map((plan) => (
                        <Box key={plan.id} sx={{ position: 'relative' }}>
                            {/* Popular badge */}
                            {plan.popular && (
                                <Box sx={{
                                    textAlign: 'center',
                                    mb: '-1px',
                                    zIndex: 2,
                                    position: 'relative',
                                }}>
                                    <Chip
                                        label="MOST POPULAR"
                                        size="small"
                                        sx={{
                                            background: 'linear-gradient(90deg, #38bdf8, #3b82f6)',
                                            color: '#fff',
                                            fontWeight: 800,
                                            fontSize: '11px',
                                            letterSpacing: '0.5px',
                                            boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                                        }}
                                    />
                                </Box>
                            )}

                            <Card sx={{
                                p: 3,
                                borderRadius: 4,
                                width: 205,
                                display: 'flex',
                                flexDirection: 'column',
                                border: plan.popular ? '2.5px solid #38bdf8' : '1.5px solid #e2e8f0',
                                boxShadow: plan.popular
                                    ? '0 8px 32px rgba(59,130,246,0.15)'
                                    : '0 2px 12px rgba(0,0,0,0.04)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                },
                            }}>
                                {/* Plan name */}
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                    sx={{ color: plan.popular ? '#3b82f6' : '#374151', mb: 0.5 }}
                                >
                                    {plan.name}
                                </Typography>

                                {/* Price */}
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                                    <Typography
                                        sx={{
                                            fontSize: plan.isEnterprise ? '2rem' : '1.7rem',
                                            fontWeight: 900,
                                            color: '#1e293b',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {plan.price}
                                    </Typography>
                                    {plan.period && (
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            {plan.period}
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                                    {plan.description}
                                </Typography>

                                <Box sx={{ borderTop: '1px solid #f1f5f9', my: 1.5 }} />

                                {/* Features */}
                                <Box sx={{ flexGrow: 1, mb: 2 }}>
                                    {plan.features.map((f, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                                            <CheckCircle sx={{ fontSize: 14, color: '#22c55e', mt: '2px', flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ color: '#374151', fontSize: '12px' }}>
                                                {f}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Button */}
                                <Button
                                    fullWidth
                                    variant={plan.popular ? 'contained' : 'outlined'}
                                    size="medium"
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={loadingPlan === plan.id}
                                    sx={{
                                        borderRadius: 10,
                                        py: 1,
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        textTransform: 'none',
                                        ...(plan.popular ? {
                                            background: 'linear-gradient(90deg, #38bdf8, #3b82f6)',
                                            boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                                            '&:hover': { opacity: 0.9 },
                                        } : {
                                            borderColor: '#d1d5db',
                                            color: '#374151',
                                            '&:hover': { borderColor: '#3b82f6', color: '#3b82f6' },
                                        }),
                                    }}
                                >
                                    {loadingPlan === plan.id
                                        ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} /> Processing...</>
                                        : plan.buttonLabel
                                    }
                                </Button>
                            </Card>
                        </Box>
                    ))}
                </Box>

                {/* Trust note */}
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <i className="bi bi-shield-lock-fill text-success"></i>
                        Secure payment processed via HDFC Smartgateway (Juspay)
                    </Typography>
                </Box>
            </Container>

            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                <Alert severity="error" variant="filled" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PaymentPage;
