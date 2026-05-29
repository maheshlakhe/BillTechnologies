import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Badge,
  Typography,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Fastfood as FastfoodIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Check as CheckIcon,
  DeliveryDining as DeliveryIcon,
  Receipt as SettleIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { thirdPartyOrdersAPI } from '../../services/api';
import { toast } from 'sonner';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
  taxRate?: number;
}

interface ThirdPartyOrder {
  id: string;
  orderId: string;
  platform: 'ZOMATO' | 'SWIGGY';
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'SETTLED' | 'CANCELLED';
  createdAt: string;
}

const CHIME_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav';

export const FoodIntegrationCenter: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<ThirdPartyOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(10); // in seconds
  const [zomatoConnected, setZomatoConnected] = useState(true);
  const [swiggyConnected, setSwiggyConnected] = useState(true);

  // Refs for tracking order counts and sound playing
  const prevOrdersCountRef = useRef<number>(0);
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(659.25, now, 0.6);
      playTone(880, now + 0.08, 0.9);
    } catch (e) {
      console.error('Failed to play synthesized chime:', e);
    }
  };

  const playChime = () => {
    if (soundEnabled) {
      playSynthesizedChime();
    }
  };

  // Fetch orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await thirdPartyOrdersAPI.getOrders();
      if (res.success) {
        setOrders(res.orders || []);
        
        // If there is a new order added and we aren't loading for the first time
        if (res.orders && res.orders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
          const newOrder = res.orders[0]; // orders are ordered desc by createdAt
          toast.success(`🍔 Incoming ${newOrder.platform} order #${newOrder.orderId} from ${newOrder.customerName}!`);
          playChime();
        }
        
        prevOrdersCountRef.current = res.orders ? res.orders.length : 0;
      }
    } catch (error: any) {
      console.error('Fetch active orders failed:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll orders
  useEffect(() => {
    fetchOrders(true);
    const interval = setInterval(() => {
      if (zomatoConnected || swiggyConnected) {
        fetchOrders(true);
      }
    }, pollingInterval * 1000);

    return () => clearInterval(interval);
  }, [pollingInterval, zomatoConnected, swiggyConnected]);

  // Simulate order
  const handleSimulate = async (platform: 'ZOMATO' | 'SWIGGY') => {
    setLoading(true);
    try {
      const res = await thirdPartyOrdersAPI.simulateOrder(platform);
      if (res.success) {
        toast.success(`✅ Simulated ${platform} order generated: ${res.order.orderId}`);
        await fetchOrders();
        playChime();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await thirdPartyOrdersAPI.updateStatus(id, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: res.order.status } : o));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  // Settle Bill
  const handleSettle = async (id: string) => {
    setLoading(true);
    try {
      const res = await thirdPartyOrdersAPI.settleOrder(id);
      if (res.success) {
        toast.success(`💰 Order settled! Invoice #${res.bill.billNumber} created.`);
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to settle order');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformColor = (platform: 'ZOMATO' | 'SWIGGY') => {
    return platform === 'ZOMATO' ? '#E23744' : '#FC8019';
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Incoming" color="warning" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />;
      case 'PREPARING':
        return <Chip label="Preparing" color="primary" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'DISPATCHED':
        return <Chip label="On the Way" color="secondary" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'DELIVERED':
        return <Chip label="Delivered" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'SETTLED' && o.status !== 'CANCELLED');

  return (
    <>
      {/* Header action button */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          color: activeOrders.length > 0 ? '#ff9800' : 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.15)
          },
          transition: 'all 0.3s ease',
          animation: activeOrders.length > 0 ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.4)' },
            '70%': { boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)' },
            '10%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0)' }
          }
        }}
        title="Food Delivery Integrations (Zomato & Swiggy)"
      >
        <Badge badgeContent={activeOrders.length} color="error" overlap="rectangular">
          <FastfoodIcon />
        </Badge>
      </IconButton>

      {/* Slide-over Drawer panel */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            borderLeft: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FastfoodIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">Delivery Channels</Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: (zomatoConnected || swiggyConnected) ? '#4caf50' : '#f44336',
                boxShadow: (zomatoConnected || swiggyConnected) ? '0 0 8px #4caf50' : 'none',
                ml: 1
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={() => fetchOrders()} title="Force Refresh">
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute Alerts' : 'Unmute Alerts'}>
              {soundEnabled ? <SoundIcon fontSize="small" /> : <MuteIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Channels Summary Panel */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              border: `1px solid ${alpha('#E23744', 0.2)}`,
              bgcolor: alpha('#E23744', zomatoConnected ? 0.05 : 0),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="caption" fontWeight="800" sx={{ color: '#E23744' }}>ZOMATO</Typography>
            <Switch
              size="small"
              checked={zomatoConnected}
              onChange={(e) => setZomatoConnected(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#E23744' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#E23744' }
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              border: `1px solid ${alpha('#FC8019', 0.2)}`,
              bgcolor: alpha('#FC8019', swiggyConnected ? 0.05 : 0),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="caption" fontWeight="800" sx={{ color: '#FC8019' }}>SWIGGY</Typography>
            <Switch
              size="small"
              checked={swiggyConnected}
              onChange={(e) => setSwiggyConnected(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#FC8019' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FC8019' }
              }}
            />
          </Box>
        </Box>

        {/* Tab System */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab label={`Live Feed (${activeOrders.length})`} sx={{ fontWeight: 'bold' }} />
          <Tab label="Simulator" sx={{ fontWeight: 'bold' }} />
          <Tab label="Settings" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        {/* Tab Content Panel */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {/* TAB 0: LIVE FEED */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeOrders.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <FastfoodIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                  <Typography variant="subtitle2" color="text.secondary">No active orders</Typography>
                  <Typography variant="caption" color="text.disabled">Use the Simulator tab to trigger test delivery orders</Typography>
                </Box>
              ) : (
                activeOrders.map((order) => (
                  <Card
                    key={order.id}
                    elevation={1}
                    sx={{
                      borderLeft: `5px solid ${getPlatformColor(order.platform)}`,
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Top Header info */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: getPlatformColor(order.platform), display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {order.platform} #{order.orderId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        {getStatusChip(order.status)}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Customer info */}
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="medium">{order.customerName}</Typography>
                        {order.deliveryAddress && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.2 }}>
                            📍 {order.deliveryAddress}
                          </Typography>
                        )}
                      </Box>

                      {/* Items list */}
                      <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1, mb: 2 }}>
                        {order.items.map((item, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: idx === order.items.length - 1 ? 0 : 0.5 }}>
                            <Typography variant="caption" color="text.primary">
                              {item.productName} <strong>× {item.quantity}</strong>
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              ₹{item.total}
                            </Typography>
                          </Box>
                        ))}
                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" fontWeight="bold">Total Amount (incl. tax)</Typography>
                          <Typography variant="caption" fontWeight="bold" color="primary.main">₹{order.totalAmount}</Typography>
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.status === 'PENDING' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            color="primary"
                            startIcon={<CheckIcon />}
                            onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          >
                            Accept Order
                          </Button>
                        )}

                        {order.status === 'PREPARING' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            color="secondary"
                            startIcon={<DeliveryIcon />}
                            onClick={() => handleUpdateStatus(order.id, 'DISPATCHED')}
                          >
                            Dispatch Delivery
                          </Button>
                        )}

                        {order.status === 'DISPATCHED' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          >
                            Mark Delivered
                          </Button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <Button
                            variant="contained"
                            fullWidth
                            size="small"
                            color="success"
                            startIcon={<SettleIcon />}
                            onClick={() => handleSettle(order.id)}
                            sx={{ fontWeight: 'bold' }}
                          >
                            Settle POS Bill
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}

          {/* TAB 1: WEBHOOK SIMULATOR */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
                  Live Webhook Emulator
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                  Simulates a third-party webhook POST request triggered when a customer orders food on Zomato or Swiggy. The application will receive the order details, raise a chime alert, and queue it in the Live Feed.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSimulate('ZOMATO')}
                  disabled={loading || !zomatoConnected}
                  sx={{
                    bgcolor: '#E23744',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#c62828' }
                  }}
                  startIcon={<PlayIcon />}
                >
                  Simulate Zomato Order
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSimulate('SWIGGY')}
                  disabled={loading || !swiggyConnected}
                  sx={{
                    bgcolor: '#FC8019',
                    color: 'white',
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#e65100' }
                  }}
                  startIcon={<PlayIcon />}
                >
                  Simulate Swiggy Order
                </Button>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Notification Options
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">Sound Alerts (Ring Chime)</Typography>
                      {soundEnabled ? <SoundIcon fontSize="small" color="primary" /> : <MuteIcon fontSize="small" color="disabled" />}
                    </Box>
                  }
                />
              </Box>
            </Box>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Auto-Polling Interval
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Set how frequently the app checks for new orders from the webhook server (currently: {pollingInterval}s)
                </Typography>
                <Slider
                  value={pollingInterval}
                  min={3}
                  max={60}
                  step={1}
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setPollingInterval(val as number)}
                />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Connection Configuration
                </Typography>

                <TextField
                  label="Zomato Webhook Receiver URL"
                  value="/api/third-party-orders/webhook/zomato"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  helperText="Platform POST Webhook Endpoint"
                />

                <TextField
                  label="Swiggy Webhook Receiver URL"
                  value="/api/third-party-orders/webhook/swiggy"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  helperText="Platform POST Webhook Endpoint"
                />

                <TextField
                  label="Merchant Integration Secret"
                  value="sec_live_zomswi_983249082309"
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled
                  type="password"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
