
import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    CircularProgress,
    Badge,
    Button,
    Drawer,
    IconButton,
    Divider,
    useTheme,
    Chip
} from '@mui/material';
import {
    Warning as WarningIcon,
    Event as EventIcon,
    Close as CloseIcon,
    Inventory as InventoryIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

interface InventoryAlertsProps {
    data?: any;
    visible?: boolean;
    threshold?: number;
    onRestock?: (productId: string) => void;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ data: propData, visible: propVisible, threshold: propThreshold, onRestock }) => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<any>({ lowStock: [], expiringSoon: [] });
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // Use effectiveThreshold from API response, fallback to prop, then 0
    const effectiveThreshold = alerts.effectiveThreshold ?? propThreshold ?? 0;

    // ALWAYS fetch fresh data from the API — never rely solely on propData
    const fetchFreshAlerts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            const res = await fetch(`${API_URL}/inventory/alerts?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const fetchedData = await res.json();
                setAlerts(fetchedData);
                console.log('[InventoryAlerts] Fresh data fetched. lowStockCount:', fetchedData?.summary?.lowStockCount, 'lowStock.length:', fetchedData?.lowStock?.length);
            }
        } catch (e) {
            console.error('[InventoryAlerts] Load error:', e);
        } finally {
            setLoading(false);
        }
    };

    // On mount: always fetch fresh data
    useEffect(() => {
        fetchFreshAlerts();
    }, [propVisible, propThreshold]);

    // Listen for all inventory/settings change events and auto-refresh
    useEffect(() => {
        const handleUpdate = () => {
            setTimeout(fetchFreshAlerts, 300);
        };

        window.addEventListener('inventory-updated', handleUpdate);
        window.addEventListener('bill-created', handleUpdate);
        window.addEventListener('refresh-notifications', handleUpdate);
        window.addEventListener('settings-changed', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        // Poll every 30 seconds to catch any missed updates
        const interval = setInterval(fetchFreshAlerts, 30000);

        return () => {
            window.removeEventListener('inventory-updated', handleUpdate);
            window.removeEventListener('bill-created', handleUpdate);
            window.removeEventListener('refresh-notifications', handleUpdate);
            window.removeEventListener('settings-changed', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
            clearInterval(interval);
        };
    }, []);

    const [expanded, setExpanded] = useState(false);

    // Return null only if visibility is explicitly false
    if (!propVisible) {
        return null;
    }

    if (loading) {
        return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}><CircularProgress size={16} /><Typography variant="caption">Checking inventory...</Typography></Box>;
    }

    const hasLowStock = alerts?.lowStock && alerts.lowStock.length > 0;
    const hasExpiring = alerts?.expiringSoon && alerts.expiringSoon.length > 0;

    // CRITICAL: Use summary.lowStockCount from the API (the authoritative DB count)
    // This ensures the badge always matches SELECT COUNT(*) from the database
    const lowStockCount = alerts?.summary?.lowStockCount ?? 0;
    const expiringCount = alerts?.summary?.expiringCount ?? 0;
    
    // DEBUG LOGS (TEMPORARY)
    console.log("LOW STOCK COUNT:", lowStockCount);
    console.log("ALERTS RESPONSE:", alerts);

    const totalAlerts = lowStockCount + expiringCount;

    return (
        <Box sx={{ mb: 3 }}>
            <Badge badgeContent={lowStockCount} color="error" sx={{ '& .MuiBadge-badge': { right: 5, top: 4 } }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<WarningIcon />}
                    onClick={() => setExpanded(true)}
                    sx={{
                        fontWeight: 'bold',
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.1)' : 'error.lighter',
                        borderColor: 'error.main'
                    }}
                >
                    Stock Alerts
                </Button>
            </Badge>

            <Drawer
                anchor="right"
                open={expanded}
                onClose={() => setExpanded(false)}
                sx={{
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(3px)'
                    },
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 480 },
                        bgcolor: 'background.default',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(211, 47, 47, 0.15) 0%, rgba(211, 47, 47, 0.05) 100%)'
                        : 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
                    borderBottom: '1px solid',
                    borderColor: isDarkMode ? 'rgba(211, 47, 47, 0.3)' : 'error.light'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)',
                        }}>
                            <WarningIcon sx={{ color: 'error.main', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="error.dark">
                                Low Stock Inventory History
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {totalAlerts} item{totalAlerts !== 1 ? 's' : ''} need attention
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={() => setExpanded(false)} size="small" sx={{
                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }
                    }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />

                {/* Content */}
                <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                    {/* Low Stock Items — Alert Card Table */}
                    {hasLowStock && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                    <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                                        Low Stock Items
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`Threshold: < ${effectiveThreshold}`}
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                />
                            </Box>

                            {/* Table Header */}
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 90px 90px 80px',
                                gap: 1,
                                px: 2,
                                py: 1,
                                bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'grey.50',
                                borderRadius: '10px 10px 0 0',
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'grey.200',
                                borderBottom: 'none'
                            }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                                    Product
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', textAlign: 'center' }}>
                                    Stock
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', textAlign: 'center' }}>
                                    Min Req.
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem', textAlign: 'center' }}>
                                    Action
                                </Typography>
                            </Box>

                            {/* Table Rows */}
                            <Box sx={{
                                border: '1px solid',
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'grey.200',
                                borderRadius: '0 0 10px 10px',
                                overflow: 'hidden'
                            }}>
                                {alerts.lowStock.map((item: any, index: number) => {
                                    const itemThreshold = Number(effectiveThreshold);
                                    const isOutOfStock = Number(item.stock) <= 0;
                                    // Mandatory Debug Logging
                                    console.log(`[UI Alert Logic Eval] product=${item.name}, product.stock=${Number(item.stock)}, lowStockThreshold=${itemThreshold}, condition result=${Number(item.stock) <= itemThreshold}`);

                                    return (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 90px 90px 80px',
                                                gap: 1,
                                                px: 2,
                                                py: 1.5,
                                                alignItems: 'center',
                                                bgcolor: isDarkMode
                                                    ? (index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
                                                    : (index % 2 === 0 ? 'white' : 'grey.50'),
                                                borderBottom: index < alerts.lowStock.length - 1 ? '1px solid' : 'none',
                                                borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'grey.100',
                                                transition: 'background-color 0.15s ease',
                                                '&:hover': {
                                                    bgcolor: isDarkMode ? 'rgba(211, 47, 47, 0.06)' : 'rgba(211, 47, 47, 0.03)'
                                                }
                                            }}
                                        >
                                            {/* Product Name */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isOutOfStock
                                                        ? (isDarkMode ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.08)')
                                                        : (isDarkMode ? 'rgba(237,108,2,0.15)' : 'rgba(237,108,2,0.08)'),
                                                    flexShrink: 0
                                                }}>
                                                    <InventoryIcon sx={{
                                                        fontSize: 16,
                                                        color: isOutOfStock ? 'error.main' : 'warning.main'
                                                    }} />
                                                </Box>
                                                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0, wordBreak: 'break-word' }}>
                                                    {item.name}
                                                </Typography>
                                            </Box>

                                            {/* Current Stock — Highlighted in Red */}
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: isOutOfStock
                                                        ? (isDarkMode ? 'rgba(211,47,47,0.2)' : 'rgba(211,47,47,0.1)')
                                                        : (isDarkMode ? 'rgba(237,108,2,0.2)' : 'rgba(237,108,2,0.1)'),
                                                    color: isOutOfStock ? 'error.main' : 'warning.dark',
                                                    borderRadius: '6px',
                                                    px: 1.5,
                                                    py: 0.3,
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    minWidth: 40,
                                                    border: '1px solid',
                                                    borderColor: isOutOfStock
                                                        ? (isDarkMode ? 'rgba(211,47,47,0.3)' : 'rgba(211,47,47,0.2)')
                                                        : (isDarkMode ? 'rgba(237,108,2,0.3)' : 'rgba(237,108,2,0.2)')
                                                }}>
                                                    {Number(item.stock)}
                                                </Box>
                                            </Box>

                                            {/* Threshold / Min Required */}
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" fontWeight={500} color="text.secondary">
                                                    {itemThreshold}
                                                </Typography>
                                            </Box>

                                            {/* Restock Button */}
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color={isOutOfStock ? 'error' : 'warning'}
                                                    onClick={() => {
                                                        if (onRestock) {
                                                            onRestock(item.id);
                                                        } else {
                                                            setExpanded(false);
                                                            navigate('/products', { state: { searchProduct: item.name, triggerEditId: item.id } });
                                                        }
                                                    }}
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        py: 0.3,
                                                        px: 1,
                                                        minWidth: 0,
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    Restock
                                                </Button>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Expiring Soon Section */}
                    {hasExpiring && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <EventIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                                    Expiring Soon
                                </Typography>
                            </Box>

                            {alerts.expiringSoon.slice(0, 5).map((item: any, index: number) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        px: 2,
                                        py: 1.5,
                                        mb: 1,
                                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'white',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: isDarkMode ? 'rgba(237,108,2,0.2)' : 'warning.light',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            bgcolor: isDarkMode ? 'rgba(237,108,2,0.06)' : 'rgba(237,108,2,0.03)',
                                            borderColor: 'warning.main'
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isDarkMode ? 'rgba(237,108,2,0.12)' : 'rgba(237,108,2,0.08)',
                                        flexShrink: 0
                                    }}>
                                        <EventIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight={600} noWrap>{item.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default InventoryAlerts;
