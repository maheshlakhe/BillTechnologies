import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Divider, Chip } from '@mui/material';
import { CheckCircle, Cancel, ArrowBack, SupportAgent, Replay, Home, Receipt } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/api';

/* ─── Confetti Effect ───────────────────────────────────────────────── */
const ConfettiCanvas: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ffd700'];
        const confetti: { x: number; y: number; w: number; h: number; color: string; vy: number; vx: number; rot: number; rotSpeed: number; opacity: number }[] = [];

        for (let i = 0; i < 120; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: Math.random() * 3 + 2,
                vx: (Math.random() - 0.5) * 2,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                opacity: Math.random() * 0.5 + 0.5,
            });
        }

        let animationId: number;
        let frame = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            confetti.forEach((p) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();

                p.y += p.vy;
                p.x += p.vx;
                p.rot += p.rotSpeed;

                // Fade out after a while
                if (frame > 150) {
                    p.opacity -= 0.005;
                }

                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            });

            if (frame < 300) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

/* ─── CSS Keyframes ─────────────────────────────────────────────────── */
const keyframes = `
@keyframes scaleIn {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes fadeInUp {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes checkPop {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes failShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(76, 175, 80, 0); }
}
@keyframes pulseGlowRed {
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(244, 67, 54, 0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes spinLoader {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const PaymentResponse: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const orderId = searchParams.get('order_id');
    const urlStatus = searchParams.get('status');

    useEffect(() => {
        const verifyPayment = async () => {
            // If the URL explicitly says failed, show failure immediately
            if (urlStatus === 'failed') {
                setStatus('failure');
                setErrorMessage('Your payment was not completed. Please try again.');
                return;
            }

            if (!orderId) {
                setStatus('failure');
                setErrorMessage('No order information found. Please try again.');
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/payments/verify/${orderId}`);
                if (response.data.success && response.data.status === 'PAID') {
                    setStatus('success');
                    setOrderDetails(response.data);
                } else {
                    setStatus('failure');
                    setErrorMessage(
                        response.data.status === 'PENDING'
                            ? 'Your payment is being processed. Please check back in a few minutes.'
                            : 'Payment could not be verified. If money was deducted, it will be refunded within 5-7 business days.'
                    );
                    setOrderDetails(response.data);
                }
            } catch (err: any) {
                console.error('Payment verification failed:', err);
                setStatus('failure');
                setErrorMessage('We encountered an error verifying your payment. Please contact support if money was deducted.');
            }
        };

        // Small delay for UX (the spinner feels more trustworthy)
        const timer = setTimeout(verifyPayment, 1500);
        return () => clearTimeout(timer);
    }, [orderId, urlStatus]);

    // Automatic redirect to dashboard after success
    useEffect(() => {
        if (status === 'success') {
            const redirectTimer = setTimeout(() => {
                navigate('/dashboard');
            }, 6000); // Give them 6 seconds to see the confetti and success message
            return () => clearTimeout(redirectTimer);
        }
    }, [status, navigate]);

    const getPlanName = useCallback(() => {
        if (!orderId) return '';
        if (orderId.startsWith('SUB-')) {
            const plan = orderId.split('-')[1];
            return plan.charAt(0) + plan.slice(1).toLowerCase();
        }
        return '';
    }, [orderId]);

    return (
        <>
            <style>{keyframes}</style>

            {/* Show confetti only on success */}
            {status === 'success' && <ConfettiCanvas />}

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: status === 'success'
                        ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #f0f9ff 100%)'
                        : status === 'failure'
                            ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 30%, #fff7ed 100%)'
                            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    p: { xs: 2, sm: 3 },
                    transition: 'background 0.8s ease',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decorative circles */}
                <Box sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: status === 'success'
                        ? 'radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(244,67,54,0.06) 0%, transparent 70%)',
                    top: -100,
                    right: -100,
                }} />
                <Box sx={{
                    position: 'absolute',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(49,87,162,0.06) 0%, transparent 70%)',
                    bottom: -80,
                    left: -80,
                }} />

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        maxWidth: 520,
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: '28px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255,255,255,0.95)',
                        animation: status !== 'loading' ? 'scaleIn 0.5s ease-out' : 'none',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* ─── LOADING STATE ───────────────────────────── */}
                    {status === 'loading' && (
                        <Box py={5}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: 90,
                                    height: 90,
                                    mx: 'auto',
                                    mb: 4,
                                }}
                            >
                                <CircularProgress
                                    size={90}
                                    thickness={3}
                                    sx={{
                                        color: '#3157a2',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3157a2, #5b8def)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Receipt sx={{ color: '#fff', fontSize: 24 }} />
                                </Box>
                            </Box>
                            <Typography
                                variant="h5"
                                fontWeight="800"
                                sx={{ color: '#1e293b', mb: 1 }}
                            >
                                Verifying Payment
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{ fontSize: '0.95rem', maxWidth: 300, mx: 'auto' }}
                            >
                                Please wait while we securely confirm your transaction...
                            </Typography>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                {[0, 1, 2].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: '#3157a2',
                                            animation: `pulseGlow 1.5s ease-in-out ${i * 0.3}s infinite`,
                                            opacity: 0.6,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* ─── SUCCESS STATE ───────────────────────────── */}
                    {status === 'success' && (
                        <Box py={2}>
                            {/* Success Icon */}
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    animation: 'checkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                    boxShadow: '0 10px 30px rgba(76,175,80,0.3)',
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 56, color: '#fff' }} />
                            </Box>

                            <Typography
                                variant="h4"
                                fontWeight="900"
                                sx={{
                                    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    animation: 'fadeInUp 0.5s ease-out 0.3s both',
                                }}
                            >
                                Payment Successful!
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mb: 3,
                                    fontSize: '1rem',
                                    animation: 'fadeInUp 0.5s ease-out 0.4s both',
                                }}
                            >
                                Your transaction has been processed securely.
                            </Typography>

                            {/* Order Details Card */}
                            <Box
                                sx={{
                                    bgcolor: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    p: 2.5,
                                    borderRadius: '16px',
                                    mb: 3,
                                    textAlign: 'left',
                                    animation: 'fadeInUp 0.5s ease-out 0.5s both',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Order ID
                                    </Typography>
                                    <Chip
                                        label="PAID"
                                        size="small"
                                        sx={{
                                            bgcolor: '#4caf50',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            height: 24,
                                        }}
                                    />
                                </Box>
                                <Typography
                                    variant="body1"
                                    fontWeight="700"
                                    sx={{
                                        color: '#1e293b',
                                        fontSize: '0.9rem',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {orderId}
                                </Typography>

                                {getPlanName() && (
                                    <>
                                        <Divider sx={{ my: 1.5, borderColor: '#bbf7d0' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                Plan Activated
                                            </Typography>
                                            <Typography variant="body1" fontWeight="700" sx={{ color: '#2e7d32' }}>
                                                {getPlanName()}
                                            </Typography>
                                        </Box>
                                    </>
                                )}

                                {orderDetails?.plan && (
                                    <>
                                        <Divider sx={{ my: 1.5, borderColor: '#bbf7d0' }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                Type
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{ color: '#1e293b' }}>
                                                Subscription
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ animation: 'fadeInUp 0.5s ease-out 0.6s both' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={<Home />}
                                    onClick={() => navigate('/dashboard')}
                                    sx={{
                                        background: 'linear-gradient(135deg, #3157a2 0%, #5b8def 100%)',
                                        borderRadius: '14px',
                                        py: 1.6,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 25px rgba(49,87,162,0.35)',
                                        mb: 1.5,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2a4e8f 0%, #4a7ae0 100%)',
                                            boxShadow: '0 10px 30px rgba(49,87,162,0.45)',
                                        },
                                    }}
                                >
                                    Go to Dashboard
                                </Button>

                                <Button
                                    component={Link}
                                    to="/"
                                    fullWidth
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: '#64748b',
                                        fontSize: '0.9rem',
                                        borderRadius: '12px',
                                        py: 1,
                                        '&:hover': {
                                            bgcolor: '#f1f5f9',
                                            color: '#3157a2',
                                        },
                                    }}
                                >
                                    Back to Home
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* ─── FAILURE STATE ───────────────────────────── */}
                    {status === 'failure' && (
                        <Box py={2}>
                            {/* Failure Icon */}
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    animation: 'failShake 0.6s ease-out, checkPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                    boxShadow: '0 10px 30px rgba(239,68,68,0.3)',
                                }}
                            >
                                <Cancel sx={{ fontSize: 56, color: '#fff' }} />
                            </Box>

                            <Typography
                                variant="h4"
                                fontWeight="900"
                                sx={{
                                    color: '#dc2626',
                                    mb: 1,
                                    animation: 'fadeInUp 0.5s ease-out 0.3s both',
                                }}
                            >
                                Payment Failed
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mb: 3,
                                    fontSize: '0.95rem',
                                    maxWidth: 380,
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                    animation: 'fadeInUp 0.5s ease-out 0.4s both',
                                }}
                            >
                                {errorMessage || "We couldn't verify your payment. If money was deducted, it will be refunded automatically within 5-7 business days."}
                            </Typography>

                            {/* Order Info (if available) */}
                            {orderId && (
                                <Box
                                    sx={{
                                        bgcolor: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        p: 2,
                                        borderRadius: '14px',
                                        mb: 3,
                                        textAlign: 'left',
                                        animation: 'fadeInUp 0.5s ease-out 0.5s both',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                            Order ID
                                        </Typography>
                                        <Chip
                                            label="FAILED"
                                            size="small"
                                            sx={{
                                                bgcolor: '#ef4444',
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                height: 24,
                                            }}
                                        />
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight="600"
                                        sx={{
                                            color: '#64748b',
                                            fontSize: '0.85rem',
                                            mt: 0.5,
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {orderId}
                                    </Typography>
                                </Box>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ animation: 'fadeInUp 0.5s ease-out 0.6s both' }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={<Replay />}
                                    onClick={() => navigate('/pricing')}
                                    sx={{
                                        background: 'linear-gradient(135deg, #3157a2 0%, #5b8def 100%)',
                                        borderRadius: '14px',
                                        py: 1.6,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 8px 25px rgba(49,87,162,0.35)',
                                        mb: 1.5,
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #2a4e8f 0%, #4a7ae0 100%)',
                                            boxShadow: '0 10px 30px rgba(49,87,162,0.45)',
                                        },
                                    }}
                                >
                                    Try Again
                                </Button>

                                <Button
                                    component={Link}
                                    to="/support"
                                    fullWidth
                                    size="large"
                                    startIcon={<SupportAgent />}
                                    sx={{
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '14px',
                                        py: 1.4,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: '#475569',
                                        mb: 1.5,
                                        '&:hover': {
                                            bgcolor: '#f8fafc',
                                            borderColor: '#3157a2',
                                            color: '#3157a2',
                                        },
                                    }}
                                >
                                    Contact Support
                                </Button>

                                <Button
                                    component={Link}
                                    to="/"
                                    fullWidth
                                    startIcon={<ArrowBack />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: '#94a3b8',
                                        fontSize: '0.9rem',
                                        borderRadius: '12px',
                                        py: 1,
                                        '&:hover': {
                                            bgcolor: '#f1f5f9',
                                            color: '#64748b',
                                        },
                                    }}
                                >
                                    Back to Home
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Footer branding */}
                    <Box
                        sx={{
                            mt: 3,
                            pt: 2,
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            opacity: 0.5,
                        }}
                    >
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            Secured by
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#3157a2', fontWeight: 800, letterSpacing: '0.5px' }}>
                            BillSoft
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </>
    );
};

export default PaymentResponse;
