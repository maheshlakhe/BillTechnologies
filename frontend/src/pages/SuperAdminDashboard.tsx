/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Business as OrgIcon,
    ContactSupport as LeadIcon,
    PlayCircleOutline as DemoIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    ConfirmationNumber as TicketIcon,
    MoreVert as MoreIcon,
    Block as BlockIcon,
    VpnKey as PasswordIcon,
    VerifiedUser as VerifiedIcon,
    CloudUpload as BackupIcon,
    Storage as StorageIcon,
    ErrorOutline as ErrorIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { superAdminService } from '../services/superAdminService';
import { format } from 'date-fns';
import { formatCompactCurrency, formatCompactNumber } from '../utils/currency';

interface Stats {
    totalBills: number;
    totalRevenue: number;
    totalUsers: number;
    totalLeads: number;
    totalDemoRequests: number;
    newLeads: number;
    pendingDemos: number;
    pendingUsers: number;
}

const SuperAdminDashboard: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [demos, setDemos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [backupLogs, setBackupLogs] = useState<any[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    
    // Organization actions state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true);
        try {
            const statsRes = await superAdminService.getStats();
            setStats(statsRes.stats);

            if (activeTab === 0) {
                const orgsRes = await superAdminService.getOrganizations();
                setOrganizations(orgsRes.organizations);
            } else if (activeTab === 1) {
                const leadsRes = await superAdminService.getLeads(searchTerm);
                setLeads(leadsRes.leads);
            } else if (activeTab === 2) {
                const demosRes = await superAdminService.getDemoRequests(searchTerm);
                setDemos(demosRes.demoRequests);
            } else if (activeTab === 3) {
                const backupsRes = await superAdminService.getBackupLogs();
                setBackupLogs(backupsRes.data);
            }
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to load super admin data:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => {
        const hash = location.hash;
        if (hash === '#organizations') setActiveTab(0);
        else if (hash === '#tickets') setActiveTab(1);
        else if (hash === '#demos') setActiveTab(2);
        else if (hash === '#backups') setActiveTab(3);
        
        setSearchTerm('');
        loadData();
    }, [activeTab, location.hash]); // Sync with hash changes

    // Auto-refresh interval (30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            loadData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [loadData]);

    const handleUpdateLead = async (id: string, status: string) => {
        try {
            await superAdminService.updateLeadStatus(id, status);
            loadData(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateDemo = async (id: string, status: string) => {
        try {
            await superAdminService.updateDemoStatus(id, status);
            loadData(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleOrgMenuOpen = (event: React.MouseEvent<HTMLElement>, org: any) => {
        setAnchorEl(event.currentTarget);
        setSelectedOrg(org);
    };

    const handleOrgMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleOrgStatus = async (specificOrg?: any) => {
        const org = specificOrg || selectedOrg;
        if (!org) {
            console.log('No organization selected for status toggle');
            return;
        }
        console.log(`Toggling status for ${org.companyName} (ID: ${org.id}). New status: ${!org.isActive}`);
        try {
            const res = await superAdminService.updateOrganizationStatus(org.id, !org.isActive);
            console.log('Status update result:', res);
            handleOrgMenuClose();
            loadData(true);
        } catch (e) {
            console.error('Failed to toggle status:', e);
            alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const handleToggleOrgVerify = async (specificOrg?: any) => {
        const org = specificOrg || selectedOrg;
        if (!org) {
            console.log('No organization selected for verification toggle');
            return;
        }
        console.log(`Toggling verification for ${org.companyName} (ID: ${org.id}). New status: ${!org.isVerified}`);
        try {
            const res = await superAdminService.verifyOrganization(org.id, !org.isVerified);
            console.log('Verification update result:', res);
            handleOrgMenuClose();
            loadData(true);
        } catch (e) {
            console.error('Failed to toggle verification:', e);
            alert(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedOrg || !newPassword) return;
        try {
            await superAdminService.resetOrganizationPassword(selectedOrg.id, newPassword);
            setPasswordDialogOpen(false);
            setNewPassword('');
            handleOrgMenuClose();
            alert('Password reset successfully and sent to user logic here (if email implemented)');
        } catch (e) {
            console.error(e);
            alert('Failed to reset password');
        }
    };

    const handleResendVerification = async () => {
        if (!selectedOrg) return;
        try {
            await superAdminService.resendVerification(selectedOrg.id);
            handleOrgMenuClose();
            alert('Verification email resent successfully!');
        } catch (e: any) {
            console.error(e);
            alert(`Failed to resend verification: ${e.response?.data?.error || e.message}`);
        }
    };

    const handleTriggerBackup = async () => {
        if (!window.confirm('This will create a new database backup and sync it to the cloud. Proceed?')) return;
        
        setIsBackingUp(true);
        try {
            const res = await superAdminService.triggerBackup();
            if (res.success) {
                alert('Backup initiated successfully!');
                loadData(true);
            }
        } catch (e) {
            console.error('Backup trigger failed:', e);
            alert('Failed to trigger backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    const renderStats = () => {
        if (!stats) return null;

        const cards = [
            { label: 'Pending Approvals', value: stats.pendingUsers || 0, icon: <VerifiedIcon color="info" />, color: '#e6f7ff' },
            { label: 'New Tickets', value: stats.newLeads, icon: <TicketIcon color="warning" />, color: '#fffbe6' },
            { label: 'Pending Demo Requests', value: stats.pendingDemos, icon: <DemoIcon color="error" />, color: '#fff1f0' },
        ];

        return (
            <Box sx={{
                display: 'flex',
                gap: 3,
                mb: 4
            }}>
                {cards.map((card, index) => (
                    <Card key={index} sx={{ bgcolor: card.color, borderRadius: 3, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.05)', minWidth: 240 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {card.icon}
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 600, color: 'text.secondary' }}>
                                    {card.label}
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {card.value}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                        <SecurityIcon sx={{ mr: 1.5, fontSize: 35 }} /> System Control Panel
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Platform Management & Lead Handling
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 2, px: 1, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 1.5, color: '#64748b' }}>
                            Last updated: {format(lastUpdated, 'HH:mm:ss')}
                        </Typography>
                        {isRefreshing && (
                            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={12} thickness={6} />
                                <Typography variant="caption" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 600 }}>Syncing...</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon sx={{ animation: isRefreshing ? 'spin 2s linear infinite' : 'none' }} />}
                    onClick={() => loadData()}
                    disabled={isRefreshing}
                    sx={{
                        borderRadius: 2,
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        }
                    }}
                >
                    Refresh Data
                </Button>
            </Box>

            {renderStats()}

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
                >
                    <Tab label="Active Organizations" icon={<OrgIcon />} iconPosition="start" />
                    <Tab label="Support Tickets" icon={<TicketIcon />} iconPosition="start" />
                    <Tab label="Demo Requests" icon={<DemoIcon />} iconPosition="start" />
                    <Tab label="System Backups" icon={<BackupIcon />} iconPosition="start" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    placeholder="Search organizations..."
                                    fullWidth
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Company / Organization</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Admin Email</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="center">Bill Count</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="center">Total Revenue</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Plan Expiry</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Onboarded</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : organizations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                                    No organizations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            organizations
                                                .filter(org =>
                                                    org.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    org.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((org) => (
                                                    <TableRow key={org.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{org.companyName || 'Unknown Business'}</Typography>
                                                            <Typography variant="caption" color="text.secondary">ID: {org.id.substring(0, 8)}...</Typography>
                                                        </TableCell>
                                                        <TableCell>{org.email}</TableCell>
                                                         <TableCell align="center">
                                                            <Chip label={formatCompactNumber(org.billCount)} size="small" color="primary" sx={{ fontWeight: 700, minWidth: 50 }} />
                                                         </TableCell>
                                                         <TableCell align="center" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                            {formatCompactCurrency(org.totalRevenue)}
                                                         </TableCell>
                                                         <TableCell>
                                                            <Chip 
                                                                label={org.planType} 
                                                                size="small" 
                                                                color={org.planType === 'FREE' ? 'default' : 'secondary'} 
                                                                sx={{ fontWeight: 700, fontSize: 10 }} 
                                                            />
                                                         </TableCell>
                                                         <TableCell>
                                                            {org.planExpiresAt ? (
                                                                <Typography variant="body2" sx={{ 
                                                                    color: new Date(org.planExpiresAt) < new Date() ? 'error.main' : 'text.primary',
                                                                    fontWeight: 500
                                                                }}>
                                                                    {format(new Date(org.planExpiresAt), 'dd MMM yyyy')}
                                                                </Typography>
                                                            ) : (
                                                                <Typography variant="caption" color="text.secondary">N/A</Typography>
                                                            )}
                                                         </TableCell>
                                                        <TableCell>{format(new Date(org.createdAt), 'dd MMM yyyy')}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                <Chip 
                                                                    label={org.isActive ? "ACTIVE" : "INACTIVE"} 
                                                                    size="small" 
                                                                    variant={org.isActive ? "filled" : "outlined"} 
                                                                    color={org.isActive ? "success" : "error"} 
                                                                    sx={{ fontWeight: 700, fontSize: 10 }} 
                                                                />
                                                                 <Chip 
                                                                    label={org.isVerified ? "VERIFIED" : "PENDING"} 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    color={org.isVerified ? "info" : "warning"} 
                                                                    sx={{ fontWeight: 700, fontSize: 10 }} 
                                                                />
                                                                {!org.isVerified && (
                                                                    <Button 
                                                                        size="small" 
                                                                        onClick={() => handleToggleOrgVerify(org)}
                                                                        startIcon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                                                                        sx={{ fontSize: '10px', py: 0, minHeight: '24px' }}
                                                                    >
                                                                        Verify Now
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" onClick={(e) => handleOrgMenuOpen(e, org)}>
                                                                <MoreIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {activeTab === 1 && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    placeholder="Search leads by name, email, phone or message..."
                                    fullWidth
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && loadData()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : leads.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    No leads found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leads.map((lead) => (
                                                <TableRow key={lead.id} hover>
                                                    <TableCell>{format(new Date(lead.createdAt), 'dd MMM HH:mm')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>{lead.name}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{lead.email}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{lead.phone || 'No Phone'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ maxWidth: 300 }}>
                                                        <Typography variant="body2" noWrap sx={{ cursor: 'help' }} title={lead.message}>
                                                            {lead.message || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={lead.status}
                                                            size="small"
                                                            color={lead.status === 'NEW' ? 'error' : 'info'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title="Mark Contacted">
                                                            <IconButton onClick={() => handleUpdateLead(lead.id, 'CONTACTED')} color="primary">
                                                                <CheckIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Spam/Lost">
                                                            <IconButton onClick={() => handleUpdateLead(lead.id, 'LOST')} color="error">
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {activeTab === 2 && (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    placeholder="Search demo requests by name, company, email or phone..."
                                    fullWidth
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && loadData()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : demos.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    No demo requests found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            demos.map((demo) => (
                                                <TableRow key={demo.id} hover>
                                                    <TableCell>{format(new Date(demo.createdAt), 'dd MMM HH:mm')}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>{demo.name}</TableCell>
                                                    <TableCell>{demo.companyName || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{demo.email}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{demo.phone || 'No Phone'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={demo.status}
                                                            size="small"
                                                            variant="filled"
                                                            color={demo.status === 'PENDING' ? 'warning' : 'success'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            disabled={demo.status === 'COMPLETED'}
                                                            onClick={() => handleUpdateDemo(demo.id, 'SCHEDULED')}
                                                            sx={{ mr: 1, textTransform: 'none', borderRadius: 2 }}
                                                        >
                                                            Schedule
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            disabled={demo.status === 'COMPLETED'}
                                                            onClick={() => handleUpdateDemo(demo.id, 'COMPLETED')}
                                                            sx={{ textTransform: 'none', borderRadius: 2 }}
                                                        >
                                                            Done
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {activeTab === 3 && (
                        <>
                            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Backup History</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Monitor automated backups and cloud sync status (rclone).
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={isBackingUp ? <CircularProgress size={20} color="inherit" /> : <BackupIcon />}
                                    onClick={handleTriggerBackup}
                                    disabled={isBackingUp}
                                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                                >
                                    {isBackingUp ? 'Processing...' : 'Run Manual Backup'}
                                </Button>
                            </Box>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Started At</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Filename</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Destination</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                    <CircularProgress size={24} />
                                                </TableCell>
                                            </TableRow>
                                        ) : backupLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                                        <StorageIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                                                        <Typography variant="body2">No backup logs available yet.</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            backupLogs.map((log) => {
                                                const duration = log.completedAt 
                                                    ? Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                                                    : null;
                                                
                                                return (
                                                    <TableRow key={log.id} hover>
                                                        <TableCell sx={{ fontWeight: 500 }}>
                                                            {format(new Date(log.startedAt), 'dd MMM yyyy, HH:mm:ss')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                                                {log.filename}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <StorageIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                                                <Typography variant="body2">{log.location}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.size ? `${(log.size / (1024 * 1024)).toFixed(2)} MB` : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip
                                                                    label={log.status}
                                                                    size="small"
                                                                    color={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'error' : 'warning'}
                                                                    sx={{ fontWeight: 700, fontSize: 10, minWidth: 80 }}
                                                                />
                                                                {log.errorMessage && (
                                                                    <Tooltip title={log.errorMessage}>
                                                                        <IconButton size="small" color="error">
                                                                            <ErrorIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {duration !== null ? `${duration}s` : <Typography variant="caption" color="text.secondary">In Progress...</Typography>}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Organization Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleOrgMenuClose}
            >
                <MenuItem onClick={handleToggleOrgVerify}>
                    <ListItemIcon>
                        <VerifiedIcon fontSize="small" color={selectedOrg?.isVerified ? "warning" : "info"} />
                    </ListItemIcon>
                    {selectedOrg?.isVerified ? "Unverify Account" : "Verify Account"}
                </MenuItem>
                <MenuItem onClick={handleToggleOrgStatus}>
                    <ListItemIcon>
                        <BlockIcon fontSize="small" color={selectedOrg?.isActive ? "error" : "success"} />
                    </ListItemIcon>
                    {selectedOrg?.isActive ? "Deactivate Account" : "Activate Account"}
                </MenuItem>
                {!selectedOrg?.isVerified && (
                    <MenuItem onClick={handleResendVerification}>
                        <ListItemIcon>
                            <EmailIcon fontSize="small" />
                        </ListItemIcon>
                        Resend Verification Email
                    </MenuItem>
                )}
                <MenuItem onClick={() => { setPasswordDialogOpen(true); handleOrgMenuClose(); }}>
                    <ListItemIcon>
                        <PasswordIcon fontSize="small" />
                    </ListItemIcon>
                    Reset Password
                </MenuItem>
            </Menu>

            {/* Reset Password Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
                <DialogTitle>Reset Password for {selectedOrg?.companyName}</DialogTitle>
                <DialogContent sx={{ minWidth: 400, pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter a new password for the administrator of this organization.
                    </Typography>
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleResetPassword} 
                        variant="contained" 
                        disabled={!newPassword || newPassword.length < 8}
                    >
                        Set Password
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SuperAdminDashboard;
