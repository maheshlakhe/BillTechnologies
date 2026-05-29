import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Divider,
    TextField,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Custom Native Switch Component for guaranteed click response
const NativeSwitch = ({ checked, onChange, label, disabled = false }: { checked: boolean, onChange: (checked: boolean) => void, label: string, disabled?: boolean }) => {
    return (
        <div 
            onClick={() => {
                if (disabled) return;
                const newValue = !checked;
                console.log(`[TOGGLE CLICKED] ${label}:`, newValue);
                onChange(newValue);
            }}
            style={{ 
                cursor: disabled ? "not-allowed" : "pointer",
                width: '46px',
                height: '24px',
                backgroundColor: checked ? '#2563eb' : '#cbd5e1',
                borderRadius: '12px',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-block',
                flexShrink: 0,
                opacity: disabled ? 0.6 : 1,
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
            }}
            id={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
            <div style={{
                width: '18px',
                height: '18px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: checked ? '25px' : '3px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }} />
        </div>
    );
};

interface NotificationsTabProps {
    settings: any;
    onSettingChange: (key: string, value: any) => void;
}

const isTrue = (val: any) => val === true || String(val).toLowerCase() === 'true';

const NotificationsTab: React.FC<NotificationsTabProps> = ({ settings, onSettingChange }) => {
    // 1. Initialize local state from props
    const lastPersistedState = useRef({
        lowStockAlertEnabled: isTrue(settings.lowStockAlertEnabled),
        enableDashboardLowStockAlerts: isTrue(settings.enableDashboardLowStockAlerts),
        invoice_due_alerts: isTrue(settings.invoice_due_alerts),
        payment_received_alerts: isTrue(settings.payment_received_alerts),
        admin_system_alerts: isTrue(settings.admin_system_alerts),
        lowStockThreshold: settings.lowStockThreshold
    });

    const [lowStockEnabled, setLowStockEnabled] = useState<boolean>(lastPersistedState.current.lowStockAlertEnabled);
    const [dashboardAlertsEnabled, setDashboardAlertsEnabled] = useState<boolean>(lastPersistedState.current.enableDashboardLowStockAlerts);
    const [invoiceDueAlerts, setInvoiceDueAlerts] = useState<boolean>(lastPersistedState.current.invoice_due_alerts);
    const [paymentReceivedAlerts, setPaymentReceivedAlerts] = useState<boolean>(lastPersistedState.current.payment_received_alerts);
    const [adminSystemAlerts, setAdminSystemAlerts] = useState<boolean>(lastPersistedState.current.admin_system_alerts);

    const getInitialThreshold = (val: any) => {
        if (val === undefined || val === null || val === '0' || val === 0 || String(val) === '') return null;
        return String(val);
    };
    const [threshold, setThreshold] = useState<string | null>(getInitialThreshold(settings.lowStockThreshold));

    const [isSaving, setIsSaving] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // 2. Sync state from props when parent re-fetches settings
    useEffect(() => {
        if (isSaving) {
            console.log('[NotificationsTab] Skipping props sync during active save');
            return;
        }

        console.log('[NotificationsTab] Settings Props Updated:', settings);
        if (settings.lowStockAlertEnabled !== undefined) setLowStockEnabled(isTrue(settings.lowStockAlertEnabled));
        if (settings.enableDashboardLowStockAlerts !== undefined) setDashboardAlertsEnabled(isTrue(settings.enableDashboardLowStockAlerts));
        if (settings.invoice_due_alerts !== undefined) setInvoiceDueAlerts(isTrue(settings.invoice_due_alerts));
        if (settings.payment_received_alerts !== undefined) setPaymentReceivedAlerts(isTrue(settings.payment_received_alerts));
        if (settings.admin_system_alerts !== undefined) setAdminSystemAlerts(isTrue(settings.admin_system_alerts));
        if (settings.lowStockThreshold !== undefined) setThreshold(getInitialThreshold(settings.lowStockThreshold));

        lastPersistedState.current = {
            lowStockAlertEnabled: isTrue(settings.lowStockAlertEnabled),
            enableDashboardLowStockAlerts: isTrue(settings.enableDashboardLowStockAlerts),
            invoice_due_alerts: isTrue(settings.invoice_due_alerts),
            payment_received_alerts: isTrue(settings.payment_received_alerts),
            admin_system_alerts: isTrue(settings.admin_system_alerts),
            lowStockThreshold: settings.lowStockThreshold
        };
    }, [settings, isSaving]);

    // 3. Robust Persistence Handler
    const persistSetting = async (key: string, value: any, setter: (val: any) => void, prevValue: any) => {
        console.log(`[NotificationsTab] [SYNC START] Setting ${key} to:`, value);

        // Optimistic Update
        setter(value);
        onSettingChange(key, value);

        try {
            setIsSaving(true);
            const response = await axios.patch(`${API_URL}/admin/settings`, { [key]: value }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                console.log(`[NotificationsTab] [SUCCESS] ${key} saved successfully.`);
                (lastPersistedState.current as any)[key] = value;
                
                // Broadcast for instant UI reaction on dashboard
                window.dispatchEvent(new Event('refresh-notifications'));
                window.dispatchEvent(new Event('storage')); // Re-sync SettingsMap in Settings.tsx
            } else {
                throw new Error(response.data.error || "Backend reported failure");
            }
        } catch (error: any) {
            console.error(`[NotificationsTab] [ERROR] Failed to persist ${key}:`, error);
            // Rollback Logic
            setter(prevValue);
            onSettingChange(key, prevValue);
            alert(`Failed to save setting: ${error.message || 'Server error'}. The toggle has been rolled back.`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = (key: string, checked: boolean, setter: (val: boolean) => void) => {
        const prevValue = (lastPersistedState.current as any)[key];
        persistSetting(key, checked, setter, prevValue);
    };

    const handleThresholdChange = (val: string) => {
        const integerVal = val.replace(/[^0-9]/g, '');
        const newThreshold = integerVal === '' ? null : integerVal;
        const prevThreshold = lastPersistedState.current.lowStockThreshold;

        setThreshold(newThreshold);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            console.log(`[NotificationsTab] [SYNC START] Threshold change saved:`, newThreshold);
            try {
                setIsSaving(true);
                const response = await axios.patch(`${API_URL}/admin/settings`, { lowStockThreshold: newThreshold }, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                if (response.data.success) {
                    console.log(`[NotificationsTab] [SUCCESS] Threshold saved.`);
                    lastPersistedState.current.lowStockThreshold = newThreshold;
                    onSettingChange('lowStockThreshold', newThreshold);
                    
                    // Trigger immediate re-evaluation of entire inventory against new threshold
                    window.dispatchEvent(new Event('refresh-notifications'));
                    window.dispatchEvent(new Event('inventory-updated'));
                    window.dispatchEvent(new Event('storage'));
                } else {
                    throw new Error("Failed to save threshold");
                }
            } catch (error) {
                console.error(`[NotificationsTab] [ERROR] Threshold persistence failed:`, error);
                setThreshold(getInitialThreshold(prevThreshold));
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>
            {isSaving && (
                <Box sx={{ position: 'absolute', top: -35, right: 0, display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, zIndex: 10 }}>
                    <CircularProgress size={14} thickness={5} />
                    <Typography variant="caption" fontWeight="bold" color="primary">Syncing...</Typography>
                </Box>
            )}

            <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                        System Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Manage alert preferences. Changes are saved automatically.
                    </Typography>

                    <Stack spacing={3}>
                        {/* Invoice Due Alerts */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                    Invoice Due Alerts
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Get notified when an invoice is approaching its due date
                                </Typography>
                            </Box>
                            <NativeSwitch
                                checked={invoiceDueAlerts}
                                onChange={(val) => handleToggle('invoice_due_alerts', val, setInvoiceDueAlerts)}
                                label="Invoice Due Alerts"
                            />
                        </Box>

                        <Divider />

                        {/* Payment Received Alerts */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                    Payment Received Alerts
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Receive a confirmation when a client completes a payment
                                </Typography>
                            </Box>
                            <NativeSwitch
                                checked={paymentReceivedAlerts}
                                onChange={(val) => handleToggle('payment_received_alerts', val, setPaymentReceivedAlerts)}
                                label="Payment Received Alerts"
                            />
                        </Box>

                        <Divider />

                        {/* Admin System Alerts */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                    Admin System Alerts
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Crucial alerts about system health and administrative changes
                                </Typography>
                            </Box>
                            <NativeSwitch
                                checked={adminSystemAlerts}
                                onChange={(val) => handleToggle('admin_system_alerts', val, setAdminSystemAlerts)}
                                label="Admin System Alerts"
                            />
                        </Box>

                        <Divider />

                        {/* Low Stock Alerts Section */}
                        <Card variant="outlined" sx={{ bgcolor: 'rgba(37, 99, 235, 0.02)', borderStyle: 'solid', borderRadius: 2, borderColor: 'primary.light' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InventoryIcon color="primary" fontSize="small" />
                                            Enable System Low Stock Alerts
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                                            Background notifications trigger when stock level {'<'} threshold.
                                        </Typography>
                                    </Box>
                                    <NativeSwitch
                                        checked={lowStockEnabled}
                                        onChange={(val) => handleToggle('lowStockAlertEnabled', val, setLowStockEnabled)}
                                        label="System Low Stock Alerts"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InventoryIcon color="primary" fontSize="small" />
                                            Dashboard Alert Visibility
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                                            Show low stock warning badges dynamically directly on the dashboard.
                                        </Typography>
                                    </Box>
                                    <NativeSwitch
                                        checked={dashboardAlertsEnabled}
                                        onChange={(val) => handleToggle('enableDashboardLowStockAlerts', val, setDashboardAlertsEnabled)}
                                        label="Dashboard Alert Visibility"
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        bgcolor: 'background.paper',
                                        p: 2,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" fontWeight="600" color="text.primary">
                                            Stock Threshold Value
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Alerts trigger when stock is strictly less than this value (independent of toggles).
                                        </Typography>
                                    </Box>
                                    <TextField
                                        type="number"
                                        size="small"
                                        placeholder="e.g. 5"
                                        value={threshold ?? ''}
                                        onChange={(e) => handleThresholdChange(e.target.value)}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">units</InputAdornment>,
                                        }}
                                        sx={{ width: 140 }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default NotificationsTab;




