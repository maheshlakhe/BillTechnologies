import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Paper,
    Alert,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Snackbar,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Security as SecurityIcon,
    ArrowBack as ArrowBackIcon,
    Key as ApiKeyIcon,
    VpnKey as RbacIcon,
    History as LogsIcon,
    Shield as ShieldIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    CheckCircle as CheckIcon,
    Code as CodeIcon,
    Terminal as TerminalIcon,
    Info as InfoIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SecurityTab from '../components/settings/SecurityTab';
import { useAuth } from '../contexts/AuthContext';
import { useRoleBasedAccess } from '../hooks/useRoleBasedAccess';
import { api } from '../services/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface ApiKeyData {
    id: string;
    name: string;
    key: string;
    scope: string;
    expiresAt: string | null;
    createdAt: string;
}

const SecuritySettings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const permissions = useRoleBasedAccess();
    const [tabValue, setTabValue] = useState(0);
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // Live API Key States
    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

    // Form States
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyScope, setNewKeyScope] = useState('READ_WRITE');
    const [newKeyExpiry, setNewKeyExpiry] = useState('0'); // Days (0 = No Expiration)

    // Result Dialog States
    const [generatedKey, setGeneratedKey] = useState<any | null>(null);
    const [generatedKeyDialogOpen, setGeneratedKeyDialogOpen] = useState(false);

    // Feedback States
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('success');
    const [toastOpen, setToastOpen] = useState(false);

    // Playground Interactive States
    const [selectedKeyForSnippet, setSelectedKeyForSnippet] = useState<string>('placeholder');
    const [selectedEndpoint, setSelectedEndpoint] = useState<string>('me');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('curl');

    const [mockLogs] = useState([
        { id: 1, event: 'User Login', user: user?.email || 'admin@billsoft.com', ip: '192.168.31.132', time: new Date().toLocaleString() },
        { id: 2, event: 'API Key Generated', user: user?.email || 'admin@billsoft.com', ip: '192.168.31.132', time: new Date(Date.now() - 60000).toLocaleString() },
        { id: 3, event: 'System Config Synced', user: user?.email || 'admin@billsoft.com', ip: '127.0.0.1', time: new Date(Date.now() - 3600000).toLocaleString() },
    ]);

    // Security tab settings
    const [securitySettings, setSecuritySettings] = useState({
        password_strength: 'strong',
        login_attempts_limit: 5,
        session_timeout: 30
    });

    const handleSettingChange = (key: string, value: any) => {
        setSecuritySettings(prev => ({ ...prev, [key]: value }));
    };

    // Load Live API Keys
    const fetchApiKeys = async () => {
        setLoadingKeys(true);
        try {
            const response = await api.get('/developer/keys');
            if (response.data && response.data.success) {
                setApiKeys(response.data.apiKeys);
            }
        } catch (error: any) {
            console.error('Failed to load API keys:', error);
            showToast(error.response?.data?.error || 'Failed to fetch API keys', 'error');
        } finally {
            setLoadingKeys(false);
        }
    };

    useEffect(() => {
        if (tabValue === 2) {
            fetchApiKeys();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabValue]);

    const showToast = (msg: string, severity: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(msg);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    // Create API Key
    const handleCreateApiKey = async () => {
        if (!newKeyName.trim()) {
            showToast('Key name is required', 'error');
            return;
        }

        try {
            const response = await api.post('/developer/keys', {
                name: newKeyName,
                scope: newKeyScope,
                expiresDays: parseInt(newKeyExpiry, 10)
            });

            if (response.data && response.data.success) {
                setGeneratedKey(response.data.apiKey);
                setCreateDialogOpen(false);
                setGeneratedKeyDialogOpen(true);
                // Refresh list
                fetchApiKeys();
                showToast('API Key generated successfully!', 'success');
                // Reset form
                setNewKeyName('');
                setNewKeyScope('READ_WRITE');
                setNewKeyExpiry('0');
            }
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Failed to generate API Key', 'error');
        }
    };

    // Revoke API Key
    const handleDeleteConfirm = async () => {
        if (!selectedKeyId) return;

        try {
            const response = await api.delete(`/developer/keys/${selectedKeyId}`);
            if (response.data && response.data.success) {
                showToast('API Key successfully revoked', 'success');
                fetchApiKeys();
            }
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Failed to revoke API Key', 'error');
        } finally {
            setDeleteConfirmOpen(false);
            setSelectedKeyId(null);
        }
    };

    const copyToClipboard = (text: string, subject: string = 'Content') => {
        navigator.clipboard.writeText(text);
        showToast(`${subject} copied to clipboard!`, 'success');
    };

    if (!permissions.canManageSettings && user?.role?.toUpperCase() !== 'ADMIN') {
        return (
            <Box sx={{ p: 5, textAlign: 'center', mt: 10 }}>
                <Paper sx={{ p: 5, borderRadius: 3 }}>
                    <Typography variant="h5" color="error">Access Denied</Typography>
                    <Typography color="text.secondary" sx={{ mt: 2 }}>You do not have permission to access security settings.</Typography>
                    <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate('/admin')}>Back to Admin</Button>
                </Paper>
            </Box>
        );
    }

    // Code Snippet Definitions for Playground
    const endpoints = {
        me: {
            title: 'Verify Connection (GET /me)',
            path: '/api/developer/v1/me',
            method: 'GET',
            desc: 'Check connection credentials and inspect scope permissions.',
            curl: (key: string) => `curl -X GET "http://localhost:5000/api/developer/v1/me" \\\n  -H "Authorization: Bearer ${key}"`,
            node: (key: string) => `const axios = require('axios');\n\naxios.get('http://localhost:5000/api/developer/v1/me', {\n  headers: { 'Authorization': 'Bearer ${key}' }\n})\n.then(res => console.log(res.data))\n.catch(err => console.error(err));`,
            python: (key: string) => `import requests\n\nurl = "http://localhost:5000/api/developer/v1/me"\nheaders = { "Authorization": "Bearer ${key}" }\n\nres = requests.get(url, headers=headers)\nprint(res.json())`,
            response: `{\n  "success": true,\n  "auth": {\n    "apiKeyName": "E-commerce Sync",\n    "scope": "READ_WRITE",\n    "authorizedUser": "admin@billsoft.com",\n    "organizationId": "cly23p892x0001...",\n    "role": "ADMIN"\n  }\n}`
        },
        products: {
            title: 'List Inventory (GET /products)',
            path: '/api/developer/v1/products',
            method: 'GET',
            desc: 'Fetch a paginated list of active inventory products.',
            curl: (key: string) => `curl -X GET "http://localhost:5000/api/developer/v1/products?limit=10" \\\n  -H "Authorization: Bearer ${key}"`,
            node: (key: string) => `const axios = require('axios');\n\naxios.get('http://localhost:5000/api/developer/v1/products', {\n  params: { limit: 10 },\n  headers: { 'Authorization': 'Bearer ${key}' }\n})\n.then(res => console.log(res.data))\n.catch(err => console.error(err));`,
            python: (key: string) => `import requests\n\nurl = "http://localhost:5000/api/developer/v1/products"\nheaders = { "Authorization": "Bearer ${key}" }\nparams = { "limit": 10 }\n\nres = requests.get(url, headers=headers, params=params)\nprint(res.json())`,
            response: `{\n  "success": true,\n  "products": [\n    {\n      "id": "cld23j892x...",\n      "name": "Wireless Gaming Mouse",\n      "price": 1299.00,\n      "taxRate": 18.0,\n      "stock": 42,\n      "sku": "MS-WIRE-01",\n      "category": "Electronics",\n      "unit": "Pcs"\n    }\n  ],\n  "pagination": {\n    "total": 1,\n    "page": 1,\n    "limit": 10,\n    "totalPages": 1\n  }\n}`
        },
        create_product: {
            title: 'Create Product (POST /products)',
            path: '/api/developer/v1/products',
            method: 'POST',
            desc: 'Insert a new item with dynamic tax rates and initial stock balance.',
            curl: (key: string) => `curl -X POST "http://localhost:5000/api/developer/v1/products" \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "Smart Water Bottle",\n    "price": 999.00,\n    "taxRate": 12.0,\n    "stock": 50,\n    "sku": "BT-SMART-09",\n    "category": "Lifestyle"\n  }'`,
            node: (key: string) => `const axios = require('axios');\n\naxios.post('http://localhost:5000/api/developer/v1/products', {\n  name: 'Smart Water Bottle',\n  price: 999.00,\n  taxRate: 12.0,\n  stock: 50,\n  sku: 'BT-SMART-09',\n  category: 'Lifestyle'\n}, {\n  headers: { 'Authorization': 'Bearer ${key}' }\n})\n.then(res => console.log(res.data))\n.catch(err => console.error(err));`,
            python: (key: string) => `import requests\n\nurl = "http://localhost:5000/api/developer/v1/products"\nheaders = {\n    "Authorization": "Bearer ${key}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "name": "Smart Water Bottle",\n    "price": 999.00,\n    "taxRate": 12.0,\n    "stock": 50,\n    "sku": "BT-SMART-09",\n    "category": "Lifestyle"\n}\n\nres = requests.post(url, headers=headers, json=payload)\nprint(res.json())`,
            response: `{\n  "success": true,\n  "message": "Product created successfully",\n  "product": {\n    "id": "clx23p912a...",\n    "name": "Smart Water Bottle",\n    "price": 999.00,\n    "taxRate": 12.0,\n    "stock": 50,\n    "sku": "BT-SMART-09",\n    "category": "Lifestyle"\n  }\n}`
        },
        create_bill: {
            title: 'Generate Invoice (POST /bills)',
            path: '/api/developer/v1/bills',
            method: 'POST',
            desc: 'Generate a GST compliant invoice. Automatically deducts stock and logs alerts.',
            curl: (key: string) => `curl -X POST "http://localhost:5000/api/developer/v1/bills" \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "customerId": "clz89n231k...",\n    "customerName": "Jane Cooper",\n    "customerEmail": "jane@example.com",\n    "paymentMode": "Card",\n    "paidAmount": 1178.82,\n    "items": [\n      {\n        "productId": "clx23p912a...",\n        "quantity": 1,\n        "price": 999.00\n      }\n    ]\n  }'`,
            node: (key: string) => `const axios = require('axios');\n\naxios.post('http://localhost:5000/api/developer/v1/bills', {\n  customerId: 'clz89n231k...',\n  customerName: 'Jane Cooper',\n  customerEmail: 'jane@example.com',\n  paymentMode: 'Card',\n  paidAmount: 1178.82,\n  items: [\n    {\n      productId: 'clx23p912a...',\n      quantity: 1,\n      price: 999.00\n    }\n  ]\n}, {\n  headers: { 'Authorization': 'Bearer ${key}' }\n})\n.then(res => console.log(res.data))\n.catch(err => console.error(err));`,
            python: (key: string) => `import requests\n\nurl = "http://localhost:5000/api/developer/v1/bills"\nheaders = {\n    "Authorization": "Bearer ${key}",\n    "Content-Type": "application/json"\n}\npayload = {\n    "customerId": "clz89n231k...",\n    "customerName": "Jane Cooper",\n    "customerEmail": "jane@example.com",\n    "paymentMode": "Card",\n    "paidAmount": 1178.82,\n    "items": [\n        {\n            "productId": "clx23p912a...",\n            "quantity": 1,\n            "price": 999.00\n        }\n    ]\n}\n\nres = requests.post(url, headers=headers, json=payload)\nprint(res.json())`,
            response: `{\n  "success": true,\n  "message": "Invoice created and finalized successfully",\n  "invoice": {\n    "id": "inv_cld82u...",\n    "billNumber": "INV-DEV-17182910-K29F",\n    "customerName": "Jane Cooper",\n    "subtotal": 999.00,\n    "taxAmount": 179.82,\n    "totalAmount": 1178.82,\n    "paidAmount": 1178.82,\n    "dueAmount": 0.00,\n    "status": "PAID",\n    "paymentStatus": "PAID"\n  }\n}`
        }
    };

    // Get Active Snippet Code
    const activeEndpointData = endpoints[selectedEndpoint as keyof typeof endpoints];
    const keyToUse = selectedKeyForSnippet === 'placeholder' ? 'YOUR_API_KEY' : selectedKeyForSnippet;
    const snippetCode = activeEndpointData[selectedLanguage as 'curl' | 'node' | 'python'](keyToUse);

    return (
        <Box sx={{ pb: 6 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin')}
                    sx={{ borderRadius: 2 }}
                >
                    Back
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold">
                        Security Settings
                    </Typography>
                </Box>
            </Box>

            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab icon={<ShieldIcon />} label="Account Protection" iconPosition="start" />
                        <Tab icon={<RbacIcon />} label="Roles & RBAC" iconPosition="start" />
                        <Tab icon={<ApiKeyIcon />} label="API Credentials" iconPosition="start" />
                        <Tab icon={<LogsIcon />} label="Security Logs" iconPosition="start" />
                    </Tabs>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    {/* Tab 1: Account Protection */}
                    <TabPanel value={tabValue} index={0}>
                        <SecurityTab settings={securitySettings} onSettingChange={handleSettingChange} />
                    </TabPanel>

                    {/* Tab 2: RBAC */}
                    <TabPanel value={tabValue} index={1}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Role-Based Access Control</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Define granular permissions for different user roles in your organization.
                            </Typography>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                RBAC configurations are currently managed at the organization level. Customize roles below.
                            </Alert>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Permissions</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Members</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><Chip label="Super Admin" color="primary" /></TableCell>
                                            <TableCell>Full System Access</TableCell>
                                            <TableCell align="right">2</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><Chip label="Manager" color="secondary" /></TableCell>
                                            <TableCell>Inventory, Billing, Reports</TableCell>
                                            <TableCell align="right">5</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>

                    {/* Tab 3: API Keys & Live Hub */}
                    <TabPanel value={tabValue} index={2}>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">API Access Credentials</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Use these cryptographically secure tokens to integrate BillSoft inventory and invoice generators with your external tools.
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<ApiKeyIcon />}
                                    onClick={() => setCreateDialogOpen(true)}
                                    sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
                                >
                                    Generate New Key
                                </Button>
                            </Box>

                            {loadingKeys ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                    <CircularProgress size={40} />
                                </Box>
                            ) : apiKeys.length === 0 ? (
                                <Paper sx={{ py: 6, px: 3, textAlign: 'center', border: '1px dashed divider', borderRadius: 3 }}>
                                    <TerminalIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" fontWeight="bold">No Active API Credentials</Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1, maxW: 400, mx: 'auto' }}>
                                        Establish developer credentials by generating your first secure API key above. Once active, copy the token to start writing custom integrations.
                                    </Typography>
                                </Paper>
                            ) : (
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Scope</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Token Mask</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Expiration</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {apiKeys.map(key => (
                                                <TableRow key={key.id}>
                                                    <TableCell sx={{ fontWeight: '600' }}>{key.name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={key.scope === 'READ_WRITE' ? 'Read-Write' : 'Read-Only'}
                                                            size="small"
                                                            color={key.scope === 'READ_WRITE' ? 'primary' : 'default'}
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 1 }}>{key.key}</TableCell>
                                                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell sx={{ color: key.expiresAt ? 'warning.main' : 'success.main', fontWeight: '500' }}>
                                                        {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Revoke API Key">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {
                                                                    setSelectedKeyId(key.id);
                                                                    setDeleteConfirmOpen(true);
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Dynamic Code Playground & Docs Hub */}
                            <Box sx={{ mt: 6 }}>
                                <Divider sx={{ my: 4 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <CodeIcon color="primary" sx={{ fontSize: 28 }} />
                                    <Typography variant="h5" fontWeight="bold">Developer Console & Playground</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Choose an endpoint and language to immediately generate copyable code snippets. If you have generated keys, they will bind directly into the source code below.
                                </Typography>

                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                                    gap: 3
                                }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Card sx={{ borderRadius: 3, border: '1px solid divider', height: '100%' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>Configure Playground</Typography>
                                                
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
                                                    {/* Key Dropdown */}
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id="playground-key-label">Choose API Credentials</InputLabel>
                                                        <Select
                                                            labelId="playground-key-label"
                                                            label="Choose API Credentials"
                                                            value={selectedKeyForSnippet}
                                                            onChange={(e) => setSelectedKeyForSnippet(e.target.value)}
                                                        >
                                                            <MenuItem value="placeholder">
                                                                <em>Use Placeholder (YOUR_API_KEY)</em>
                                                            </MenuItem>
                                                            {apiKeys.map(k => (
                                                                <MenuItem key={k.id} value={`bs_live_...${k.key.split('...')[1]}`}>
                                                                    {k.name} ({k.key})
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    {/* Endpoint Dropdown */}
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id="playground-endpoint-label">Select Endpoint</InputLabel>
                                                        <Select
                                                            labelId="playground-endpoint-label"
                                                            label="Select Endpoint"
                                                            value={selectedEndpoint}
                                                            onChange={(e) => setSelectedEndpoint(e.target.value)}
                                                        >
                                                            <MenuItem value="me">Verify Credentials (GET /me)</MenuItem>
                                                            <MenuItem value="products">List Products (GET /products)</MenuItem>
                                                            <MenuItem value="create_product">Create Product (POST /products)</MenuItem>
                                                            <MenuItem value="create_bill">Record Invoice Sales (POST /bills)</MenuItem>
                                                        </Select>
                                                    </FormControl>

                                                    {/* Language Dropdown */}
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id="playground-lang-label">Programming Client</InputLabel>
                                                        <Select
                                                            labelId="playground-lang-label"
                                                            label="Programming Client"
                                                            value={selectedLanguage}
                                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                                        >
                                                            <MenuItem value="curl">cURL Shell</MenuItem>
                                                            <MenuItem value="node">Node.js (Axios)</MenuItem>
                                                            <MenuItem value="python">Python 3 (Requests)</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Box>

                                                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <InfoIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                        <Typography variant="subtitle2" fontWeight="bold">Endpoint Metadata</Typography>
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        <strong>Method:</strong> {activeEndpointData.method}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        <strong>Route Path:</strong> <code>{activeEndpointData.path}</code>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        <strong>Description:</strong> {activeEndpointData.desc}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>

                                    <Box sx={{ minWidth: 0 }}>
                                        <Card sx={{ bgcolor: '#1e293b', color: '#f8fafc', borderRadius: 3, border: '1px solid #334155', position: 'relative' }}>
                                            {/* Code Snippet Box */}
                                            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: '#94a3b8' }}>
                                                    {selectedLanguage === 'curl' ? 'Terminal' : selectedLanguage === 'node' ? 'Javascript' : 'Python'}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<CopyIcon />}
                                                    onClick={() => copyToClipboard(snippetCode, 'Code snippet')}
                                                    sx={{ color: '#cbd5e1', borderColor: '#475569', '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                                >
                                                    Copy Code
                                                </Button>
                                            </Box>
                                            <Box sx={{ p: 3, maxHeight: 300, overflow: 'auto' }}>
                                                <pre style={{ margin: 0, fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', lineHeight: '1.6', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                                    {snippetCode}
                                                </pre>
                                            </Box>
                                        </Card>

                                        {/* Expected response panel */}
                                        <Card sx={{ mt: 3, bgcolor: '#0f172a', color: '#f8fafc', borderRadius: 3, border: '1px solid #334155' }}>
                                            <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label="200 OK" color="success" size="small" variant="outlined" sx={{ borderColor: 'success.dark', color: 'success.light' }} />
                                                <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>Expected Response JSON</Typography>
                                            </Box>
                                            <Box sx={{ p: 3, maxHeight: 220, overflow: 'auto' }}>
                                                <pre style={{ margin: 0, fontFamily: 'Consolas, Monaco, monospace', fontSize: '12px', lineHeight: '1.5', color: '#a7f3d0' }}>
                                                    {activeEndpointData.response}
                                                </pre>
                                            </Box>
                                        </Card>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </TabPanel>

                    {/* Tab 4: Logs */}
                    <TabPanel value={tabValue} index={3}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>Security Activity Logs</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Audit trail of all sensitive activities within your organization.</Typography>

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'grey.100' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockLogs.map(log => (
                                            <TableRow key={log.id}>
                                                <TableCell sx={{ fontWeight: '600' }}>{log.event}</TableCell>
                                                <TableCell>{log.user}</TableCell>
                                                <TableCell>{log.ip}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>{log.time}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>
                </CardContent>
            </Card>

            {/* Dialog: Create API Key */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ApiKeyIcon color="primary" /> Generate API Key
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Establish developer connection credentials. Fill in structural metadata below.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            label="Key Name"
                            placeholder="e.g. WooCommerce Sync, Mobile App client"
                            fullWidth
                            size="small"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel id="dialog-scope-label">Key Permission Scope</InputLabel>
                            <Select
                                labelId="dialog-scope-label"
                                label="Key Permission Scope"
                                value={newKeyScope}
                                onChange={(e) => setNewKeyScope(e.target.value)}
                            >
                                <MenuItem value="READ_WRITE">Full Read/Write Access</MenuItem>
                                <MenuItem value="READ_ONLY">Read Only Access</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel id="dialog-expiry-label">Key Expiration</InputLabel>
                            <Select
                                labelId="dialog-expiry-label"
                                label="Key Expiration"
                                value={newKeyExpiry}
                                onChange={(e) => setNewKeyExpiry(e.target.value)}
                            >
                                <MenuItem value="0">Never Expires (Recommended for integrations)</MenuItem>
                                <MenuItem value="7">7 Days</MenuItem>
                                <MenuItem value="30">30 Days</MenuItem>
                                <MenuItem value="90">90 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateApiKey} sx={{ borderRadius: 2 }}>Generate Key</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Generated API Key Presentation */}
            <Dialog
                open={generatedKeyDialogOpen}
                onClose={() => setGeneratedKeyDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiPaper-root': { borderRadius: 4, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5, color: 'success.main' }}>
                    <CheckIcon /> API Key Generated Successfully
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2, mb: 3 }}>
                        Copy this credential token immediately. For compliance and security reasons, it cannot be recovered or displayed again.
                    </Alert>

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Key Name:</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{generatedKey?.name}</Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Your Secret Token:</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', p: 2, borderRadius: 2.5, border: '1px solid divider', gap: 1.5 }}>
                        <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '13px', fontWeight: 'bold', flexGrow: 1 }}>
                            {generatedKey?.key}
                        </Typography>
                        <Tooltip title="Copy Token">
                            <IconButton onClick={() => copyToClipboard(generatedKey?.key, 'API Token')} color="primary">
                                <CopyIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button variant="contained" onClick={() => setGeneratedKeyDialogOpen(false)} sx={{ borderRadius: 2, px: 3 }}>
                        I have saved this key
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Revocation Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <WarningIcon /> Revoke API Key?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        Are you sure you want to revoke this API credential? Any external scripts or automation tools using this key will immediately fail with a 401 Unauthorized error. This action is permanent.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteConfirm} sx={{ borderRadius: 2 }}>
                        Revoke Key
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dynamic Toast feedback */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={4000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SecuritySettings;
