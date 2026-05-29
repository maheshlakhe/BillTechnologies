import React from 'react';
import { Box, Card, CardContent, Skeleton, Paper } from '@mui/material';

export const MetricSkeleton: React.FC = () => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ textAlign: 'right', flex: 1, ml: 2 }}>
                        <Skeleton variant="text" width="60%" sx={{ ml: 'auto' }} />
                        <Skeleton variant="text" width="40%" sx={{ ml: 'auto' }} />
                    </Box>
                </Box>
                <Skeleton variant="text" width="50%" />
            </CardContent>
        </Card>
    );
};

export const DashboardSkeleton: React.FC = () => {
    return (
        <Box>
            {/* Header Skeleton */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Skeleton variant="text" width={250} height={40} />
                    <Skeleton variant="text" width={350} height={20} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="text" width={150} />
                </Box>
            </Box>

            {/* Metrics Grid Skeleton */}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, 
                gap: 2, 
                mb: 4 
            }}>
                {[...Array(6)].map((_, i) => (
                    <MetricSkeleton key={i} />
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                {/* Recent Bills Skeleton */}
                <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Skeleton variant="text" width={150} height={30} />
                        <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1 }} />
                    </Box>
                    {[...Array(5)].map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        </Box>
                    ))}
                </Paper>

                {/* Quick Actions Skeleton */}
                <Paper sx={{ p: 2 }}>
                    <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1.5, borderRadius: 1 }} />
                    ))}
                </Paper>
            </Box>
        </Box>
    );
};
