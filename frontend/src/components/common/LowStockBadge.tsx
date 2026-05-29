import React, { useEffect, useState } from 'react';
import { Badge, Box, Tooltip } from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import { API_URL } from '../../config/api';

interface LowStockBadgeProps {
    showIcon?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const LowStockBadge: React.FC<LowStockBadgeProps> = ({ showIcon = true, size = 'medium' }) => {
    const [lowStockCount, setLowStockCount] = useState(0);
    const [threshold, setThreshold] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLowStockCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchLowStockCount, 30000);

        // Listen for ALL relevant change events
        const handleRefresh = () => setTimeout(fetchLowStockCount, 300);
        window.addEventListener('inventory-updated', handleRefresh);
        window.addEventListener('refresh-notifications', handleRefresh);
        window.addEventListener('settings-changed', handleRefresh);
        window.addEventListener('storage', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('inventory-updated', handleRefresh);
            window.removeEventListener('refresh-notifications', handleRefresh);
            window.removeEventListener('settings-changed', handleRefresh);
            window.removeEventListener('storage', handleRefresh);
        };
    }, []);

    const fetchLowStockCount = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            // Cache-buster ensures we never get a stale response
            const response = await fetch(`${API_URL}/inventory/alerts?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // Use the authoritative summary count from the API (matches database SELECT COUNT(*))
                const count = data.summary?.lowStockCount ?? data.lowStock?.length ?? 0;
                setLowStockCount(count);
                setThreshold(data.effectiveThreshold || 0);
                console.log('[LowStockBadge] Fetched count:', count, '| threshold:', data.effectiveThreshold);
            }
        } catch (error) {
            console.error('[LowStockBadge] Failed to fetch low stock count:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || lowStockCount === 0) {
        return null;
    }

    const badgeContent = (
        <Badge
            badgeContent={lowStockCount}
            color="error"
            sx={{
                '& .MuiBadge-badge': {
                    animation: lowStockCount > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                        '0%': {
                            transform: 'scale(1)',
                            opacity: 1,
                        },
                        '50%': {
                            transform: 'scale(1.1)',
                            opacity: 0.8,
                        },
                        '100%': {
                            transform: 'scale(1)',
                            opacity: 1,
                        },
                    },
                },
            }}
        >
            {showIcon && <InventoryIcon color="error" fontSize={size} />}
        </Badge>
    );

    return (
        <Tooltip title={`${lowStockCount} product${lowStockCount > 1 ? 's' : ''} with low stock (< ${threshold} units)`}>
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 1,
                    borderRadius: 1,
                    '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    },
                }}
            >
                {badgeContent}
            </Box>
        </Tooltip>
    );
};

export default LowStockBadge;
