import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Stack } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { resolveFileUrl } from '../utils/url';
import { API_URL } from '../config/api';

const BrandingDiagnostic: React.FC = () => {
    const { user } = useAuth();
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        const tests = [
            { name: 'Raw User LogoUrl', value: user?.logoUrl },
            { name: 'API_URL Config', value: API_URL },
            { name: 'Generated Resolver URL', value: user?.logoUrl ? resolveFileUrl(user.logoUrl) : 'N/A' },
            { name: 'Manual API Uploads URL', value: user?.logoUrl ? `${API_URL}/uploads/${user.logoUrl.split('/').pop()}` : 'N/A' },
            { name: 'Manual Root Uploads URL', value: user?.logoUrl ? `${API_URL.replace('/api', '')}/uploads/${user.logoUrl.split('/').pop()}` : 'N/A' },
            { name: 'Public Fallback', value: '/logo.svg' }
        ];
        setResults(tests);
    }, [user]);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Branding Diagnostic</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" color="primary">User Context</Typography>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </Paper>

            <Stack spacing={2}>
                {results.map((res, i) => (
                    <Paper key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">{res.name}</Typography>
                            <Typography variant="body1" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                {res.value || 'NULL'}
                            </Typography>
                        </Box>
                        <Box sx={{ width: 100, height: 100, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                            {res.value ? (
                                <img 
                                    src={res.value} 
                                    alt="Test" 
                                    style={{ maxWidth: '100%', maxHeight: '100%' }} 
                                    onError={(e) => (e.currentTarget.style.border = '2px solid red')}
                                />
                            ) : 'No URL'}
                        </Box>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
};

export default BrandingDiagnostic;
