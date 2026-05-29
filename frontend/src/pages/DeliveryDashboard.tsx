import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  IconButton, Divider, Switch, FormControlLabel, Slider,
  TextField, Avatar, LinearProgress, Tooltip, alpha, useTheme,
  Tab, Tabs, Badge, CircularProgress
} from '@mui/material';
import {
  Fastfood as FastfoodIcon,
  DeliveryDining as DeliveryIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  LocalShipping as ShipIcon,
  MonetizationOn as MoneyIcon,
  FiberManualRecord as DotIcon,
  AccessTime as ClockIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  OpenInNew as LinkIcon,
} from '@mui/icons-material';
import { thirdPartyOrdersAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useIndustryLayout } from '../hooks/useIndustryLayout';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
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
  billId?: string;
  updatedAt?: string;
}

const ZOMATO_COLOR = '#E23744';
const SWIGGY_COLOR = '#FC8019';
const CHIME_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav';

const STATUS_PIPELINE: ThirdPartyOrder['status'][] = ['PENDING', 'PREPARING', 'DISPATCHED', 'DELIVERED'];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode; next?: string; nextLabel?: string }> = {
  PENDING:    { label: 'Incoming',    color: '#f59e0b', icon: <FastfoodIcon />,  next: 'PREPARING',  nextLabel: 'Accept Order' },
  PREPARING:  { label: 'Preparing',  color: '#3b82f6', icon: <RestaurantIcon />, next: 'DISPATCHED', nextLabel: 'Dispatch' },
  DISPATCHED: { label: 'On the Way', color: '#8b5cf6', icon: <DeliveryIcon />,   next: 'DELIVERED',  nextLabel: 'Mark Delivered' },
  DELIVERED:  { label: 'Delivered',  color: '#10b981', icon: <CheckIcon />,       next: 'SETTLED',    nextLabel: 'Settle Bill' },
  SETTLED:    { label: 'Settled',    color: '#6b7280', icon: <ReceiptIcon /> },
  CANCELLED:  { label: 'Cancelled',  color: '#ef4444', icon: <DotIcon /> },
};

function useElapsedTime(createdAt: string) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      if (diff < 60) setElapsed(`${diff}s`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m ${diff % 60}s`);
      else setElapsed(`${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdAt]);
  return elapsed;
}

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }> = ({ label, value, sub, color, icon }) => {
  const theme = useTheme();
  return (
    <Card elevation={0} sx={{ border: `1px solid ${alpha(color, 0.2)}`, borderRadius: 3, bgcolor: alpha(color, 0.04), height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5} sx={{ textTransform: 'uppercase' }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.12), color, width: 44, height: 44 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// ── Platform Badge ─────────────────────────────────────────────────
const PlatformBadge: React.FC<{ platform: 'ZOMATO' | 'SWIGGY' }> = ({ platform }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', gap: 0.5,
    px: 1, py: 0.3, borderRadius: 1,
    bgcolor: alpha(platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR, 0.1),
    border: `1px solid ${alpha(platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR, 0.3)}`,
  }}>
    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR }} />
    <Typography variant="caption" fontWeight={800} sx={{ color: platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR, letterSpacing: 0.5 }}>
      {platform}
    </Typography>
  </Box>
);

// ── Order Timer ─────────────────────────────────────────────────────
const OrderTimer: React.FC<{ createdAt: string; status: string }> = ({ createdAt, status }) => {
  const elapsed = useElapsedTime(createdAt);
  const isUrgent = (Date.now() - new Date(createdAt).getTime()) > 10 * 60 * 1000 && status === 'PENDING';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ClockIcon sx={{ fontSize: 13, color: isUrgent ? '#ef4444' : 'text.disabled' }} />
      <Typography variant="caption" sx={{ color: isUrgent ? '#ef4444' : 'text.secondary', fontWeight: isUrgent ? 700 : 400 }}>
        {elapsed}
      </Typography>
    </Box>
  );
};

// ── Order Card ─────────────────────────────────────────────────────
const OrderCard: React.FC<{
  order: ThirdPartyOrder;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onSettle: (id: string) => Promise<void>;
}> = ({ order, onUpdateStatus, onSettle }) => {
  const theme = useTheme();
  const meta = STATUS_META[order.status];
  const [busy, setBusy] = useState(false);

  const handleAction = async () => {
    if (!meta.next) return;
    setBusy(true);
    try {
      if (meta.next === 'SETTLED') await onSettle(order.id);
      else await onUpdateStatus(order.id, meta.next);
    } finally {
      setBusy(false);
    }
  };

  const pColor = order.platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR;

  return (
    <Card elevation={0} sx={{
      border: `1px solid ${alpha(meta.color, 0.25)}`,
      borderLeft: `4px solid ${pColor}`,
      borderRadius: 2.5,
      transition: 'all 0.2s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(pColor, 0.12)}` },
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Glowing status dot */}
      <Box sx={{
        position: 'absolute', top: 12, right: 12,
        width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color,
        boxShadow: `0 0 8px ${meta.color}`,
        animation: order.status === 'PENDING' ? 'glow 1.5s infinite' : 'none',
        '@keyframes glow': {
          '0%': { boxShadow: `0 0 4px ${meta.color}` },
          '50%': { boxShadow: `0 0 12px ${meta.color}` },
          '100%': { boxShadow: `0 0 4px ${meta.color}` },
        }
      }} />

      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PlatformBadge platform={order.platform} />
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>#{order.orderId}</Typography>
          <OrderTimer createdAt={order.createdAt} status={order.status} />
        </Box>

        {/* Customer */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(pColor, 0.1), color: pColor, fontSize: 14, flexShrink: 0 }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>{order.customerName}</Typography>
            {order.deliveryAddress && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.25, lineHeight: 1.3 }}>
                <PlaceIcon sx={{ fontSize: 11 }} />{order.deliveryAddress}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />

        {/* Items */}
        <Box sx={{ mb: 1.5 }}>
          {order.items.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {item.productName} <strong>×{item.quantity}</strong>
              </Typography>
              <Typography variant="caption" fontWeight={600}>₹{item.total}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: `1px dashed ${alpha('#000', 0.08)}` }}>
            <Typography variant="caption" fontWeight={700}>Total</Typography>
            <Typography variant="caption" fontWeight={800} color="primary.main">₹{order.totalAmount}</Typography>
          </Box>
        </Box>

        {/* Action */}
        {meta.next && (
          <Button
            variant="contained"
            fullWidth
            size="small"
            disabled={busy}
            onClick={handleAction}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: meta.next === 'SETTLED' ? '#10b981' : undefined,
              '&:hover': { bgcolor: meta.next === 'SETTLED' ? '#059669' : undefined },
              py: 0.8
            }}
          >
            {busy ? <CircularProgress size={16} color="inherit" /> : (meta.next === 'SETTLED' ? '💰 ' : '') + meta.nextLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// ── Kanban Column ─────────────────────────────────────────────────
const KanbanCol: React.FC<{
  status: ThirdPartyOrder['status'];
  orders: ThirdPartyOrder[];
  onUpdateStatus: (id: string, s: string) => Promise<void>;
  onSettle: (id: string) => Promise<void>;
}> = ({ status, orders, onUpdateStatus, onSettle }) => {
  const meta = STATUS_META[status];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 260, flex: 1 }}>
      {/* Column Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1, mb: 2,
        px: 1.5, py: 1, borderRadius: 2,
        bgcolor: alpha(meta.color, 0.08),
        border: `1px solid ${alpha(meta.color, 0.2)}`
      }}>
        <Box sx={{ color: meta.color, display: 'flex', alignItems: 'center' }}>{meta.icon}</Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>{meta.label}</Typography>
        <Chip label={orders.length} size="small" sx={{ bgcolor: alpha(meta.color, 0.15), color: meta.color, fontWeight: 800, height: 20, fontSize: '0.7rem' }} />
      </Box>
      {/* Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
        {orders.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled', border: '2px dashed', borderColor: alpha(meta.color, 0.15), borderRadius: 2 }}>
            <Typography variant="caption">No {meta.label} orders</Typography>
          </Box>
        ) : (
          orders.map(o => (
            <OrderCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} onSettle={onSettle} />
          ))
        )}
      </Box>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════
const DeliveryDashboardInner: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const orgId = user?.parentId || user?.id || '';

  const [orders, setOrders] = useState<ThirdPartyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<'ZOMATO' | 'SWIGGY' | null>(null);
  const [tab, setTab] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(10);
  const [zomatoOn, setZomatoOn] = useState(true);
  const [swiggyOn, setSwiggyOn] = useState(true);

  // History state
  const [historyOrders, setHistoryOrders] = useState<ThirdPartyOrder[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [todayRev, setTodayRev] = useState(0);

  const prevCount = useRef(0);

  const playSynthesizedChime = useCallback(() => {
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
  }, []);

  const playChime = useCallback(() => {
    if (soundEnabled) {
      playSynthesizedChime();
    }
  }, [soundEnabled, playSynthesizedChime]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await thirdPartyOrdersAPI.getOrders();
      if (res.success) {
        const all: ThirdPartyOrder[] = res.orders || [];
        setOrders(all);
        if (res.todayRevenue !== undefined) {
          setTodayRev(res.todayRevenue);
        }
        if (all.length > prevCount.current && prevCount.current > 0) {
          const newest = all[0];
          toast.success(`🍔 New ${newest.platform} order from ${newest.customerName}!`);
          playChime();
        }
        prevCount.current = all.length;
      }
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false); }
  }, [soundEnabled]);

  const fetchHistoryOrders = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await thirdPartyOrdersAPI.getOrders(true);
      if (res.success) {
        setHistoryOrders(res.orders || []);
      }
    } catch {
      toast.error('Failed to load order history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => {
      if (zomatoOn || swiggyOn) fetchOrders(true);
    }, pollingInterval * 1000);
    return () => clearInterval(iv);
  }, [pollingInterval, zomatoOn, swiggyOn, fetchOrders]);

  useEffect(() => {
    if (tab === 3) {
      fetchHistoryOrders();
    }
  }, [tab, fetchHistoryOrders]);

  const handleSimulate = async (platform: 'ZOMATO' | 'SWIGGY') => {
    setSimulating(platform);
    try {
      const res = await thirdPartyOrdersAPI.simulateOrder(platform);
      if (res.success) {
        toast.success(`✅ ${platform} order #${res.order.orderId} simulated!`);
        playChime();
        await fetchOrders();
        if (tab === 3) {
          await fetchHistoryOrders();
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Simulation failed');
    } finally { setSimulating(null); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await thirdPartyOrdersAPI.updateStatus(id, newStatus);
    if (res.success) {
      toast.success(`Order → ${STATUS_META[newStatus]?.label || newStatus}`);
      await fetchOrders();
      if (tab === 3) {
        await fetchHistoryOrders();
      }
    }
  };

  const handleSettle = async (id: string) => {
    const res = await thirdPartyOrdersAPI.settleOrder(id);
    if (res.success) {
      toast.success(`💰 Invoice #${res.bill.billNumber} created!`);
      await fetchOrders();
      if (tab === 3) {
        await fetchHistoryOrders();
      }
    }
  };

  // ── Derived stats ──────────────────────────────────────────────
  const activeOrders = orders.filter(o => !['SETTLED', 'CANCELLED'].includes(o.status));
  const zomatoOrders = activeOrders.filter(o => o.platform === 'ZOMATO');
  const swiggyOrders = activeOrders.filter(o => o.platform === 'SWIGGY');
  const todayRevenue = todayRev;
  const pendingCount = activeOrders.filter(o => o.status === 'PENDING').length;

  const colOrders = (status: ThirdPartyOrder['status']) =>
    activeOrders.filter(o => o.status === status);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied!');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: 2,
              background: 'linear-gradient(135deg, #E23744 0%, #FC8019 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(226,55,68,0.3)'
            }}>
              <FastfoodIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={-0.5}>Delivery Hub</Typography>
              <Typography variant="caption" color="text.secondary">Zomato & Swiggy live integration</Typography>
            </Box>
          </Box>
        </Box>

        {/* Channel toggles + Refresh */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Live pulse */}
          {(zomatoOn || swiggyOn) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50',
                boxShadow: '0 0 0 0 rgba(76,175,80,0.4)',
                animation: 'ping 1.5s ease infinite',
                '@keyframes ping': {
                  '0%': { boxShadow: '0 0 0 0 rgba(76,175,80,0.5)' },
                  '100%': { boxShadow: '0 0 0 8px rgba(76,175,80,0)' },
                }
              }} />
              <Typography variant="caption" fontWeight={600} color="#4caf50">Live</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {[{ label: 'ZOMATO', color: ZOMATO_COLOR, on: zomatoOn, setOn: setZomatoOn },
              { label: 'SWIGGY', color: SWIGGY_COLOR, on: swiggyOn, setOn: setSwiggyOn }].map(p => (
              <Box
                key={p.label}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  px: 1.5, py: 0.5, borderRadius: 2,
                  border: `1.5px solid ${alpha(p.color, p.on ? 0.5 : 0.2)}`,
                  bgcolor: alpha(p.color, p.on ? 0.08 : 0.02),
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => p.setOn(!p.on)}
              >
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: p.on ? p.color : 'text.disabled' }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: p.on ? p.color : 'text.disabled', letterSpacing: 0.5 }}>
                  {p.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Tooltip title={soundEnabled ? 'Mute chime' : 'Unmute chime'}>
            <IconButton size="small" onClick={() => {
              const nextVal = !soundEnabled;
              setSoundEnabled(nextVal);
              if (nextVal) playSynthesizedChime();
            }} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 1.5 }}>
              {soundEnabled ? <SoundIcon fontSize="small" /> : <MuteIcon fontSize="small" color="disabled" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh orders">
            <IconButton size="small" onClick={() => fetchOrders()} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 1.5 }}>
              {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* ── Stats Row ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Active Orders" value={activeOrders.length} sub="In pipeline" color="#3b82f6" icon={<FastfoodIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Pending Accept" value={pendingCount} sub="Needs action" color="#f59e0b" icon={<TimerIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Today Revenue" value={`₹${todayRevenue.toLocaleString('en-IN')}`} sub="Settled bills" color="#10b981" icon={<MoneyIcon />} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            label="Channels"
            value={`${(zomatoOn ? 1 : 0) + (swiggyOn ? 1 : 0)}/2`}
            sub={`${zomatoOrders.length} Zomato · ${swiggyOrders.length} Swiggy`}
            color="#8b5cf6"
            icon={<ShipIcon />}
          />
        </Grid>
      </Grid>

      {/* ── Tabs ── */}
      <Box sx={{ borderBottom: `1px solid ${alpha('#000', 0.08)}`, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', minHeight: 44 },
            '& .MuiTabs-indicator': { height: 3, borderRadius: '2px 2px 0 0' }
          }}
        >
          <Tab label={
            <Badge badgeContent={activeOrders.length} color="error" max={99}>
              <Box sx={{ pr: activeOrders.length > 0 ? 1.5 : 0 }}>📋 Live Orders</Box>
            </Badge>
          } />
          <Tab label="🚀 Simulator" />
          <Tab label="⚙️ Settings" />
          <Tab label="📜 History" />
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          TAB 0: KANBAN ORDER PIPELINE
         ══════════════════════════════════════════════════════════ */}
      {tab === 0 && (
        <Box>
          {activeOrders.length === 0 ? (
            <Box sx={{
              py: 10, textAlign: 'center',
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 4
            }}>
              <Box sx={{ fontSize: 56, mb: 1 }}>🍽️</Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>No active delivery orders</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Waiting for orders from Zomato & Swiggy...
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={simulating === 'ZOMATO' ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                  onClick={() => handleSimulate('ZOMATO')}
                  disabled={!!simulating || !zomatoOn}
                  sx={{ bgcolor: ZOMATO_COLOR, '&:hover': { bgcolor: '#c62828' }, fontWeight: 700, borderRadius: 2 }}
                >
                  Simulate Zomato Order
                </Button>
                <Button
                  variant="contained"
                  startIcon={simulating === 'SWIGGY' ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                  onClick={() => handleSimulate('SWIGGY')}
                  disabled={!!simulating || !swiggyOn}
                  sx={{ bgcolor: SWIGGY_COLOR, '&:hover': { bgcolor: '#e65100' }, fontWeight: 700, borderRadius: 2 }}
                >
                  Simulate Swiggy Order
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto', pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, minWidth: 900 }}>
                {STATUS_PIPELINE.map(st => (
                  <KanbanCol
                    key={st}
                    status={st}
                    orders={colOrders(st)}
                    onUpdateStatus={handleUpdateStatus}
                    onSettle={handleSettle}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 1: SIMULATOR
         ══════════════════════════════════════════════════════════ */}
      {tab === 1 && (
        <Grid container spacing={3}>
          {/* How it works */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>How It Works</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                  {[
                    { step: '1', color: '#3b82f6', title: 'Customer places order', desc: 'On Zomato or Swiggy app, customer selects your restaurant and places an order.' },
                    { step: '2', color: '#8b5cf6', title: 'Webhook fires to BillSoft', desc: 'The platform sends a POST webhook to your BillSoft receiver URL instantly.' },
                    { step: '3', color: '#f59e0b', title: 'Chime & notification', desc: 'BillSoft plays a chime alert and shows the order in the Live Orders pipeline.' },
                    { step: '4', color: '#10b981', title: 'Accept → Prepare → Deliver', desc: 'Track the order through the kanban stages. At delivery, settle to create a POS invoice.' },
                  ].map(s => (
                    <Box key={s.step} sx={{ display: 'flex', gap: 1.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(s.color, 0.12), color: s.color, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {s.step}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{s.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Simulator buttons */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Card elevation={0} sx={{ border: `1.5px solid ${alpha(ZOMATO_COLOR, 0.3)}`, borderRadius: 3, bgcolor: alpha(ZOMATO_COLOR, 0.03) }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 38, height: 38, bgcolor: ZOMATO_COLOR, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>Z</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: ZOMATO_COLOR }}>Zomato Integration</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DotIcon sx={{ fontSize: 8, color: zomatoOn ? '#4caf50' : 'text.disabled' }} />
                        <Typography variant="caption" color={zomatoOn ? '#4caf50' : 'text.disabled'}>{zomatoOn ? 'Active' : 'Inactive'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleSimulate('ZOMATO')}
                    disabled={!!simulating || !zomatoOn}
                    startIcon={simulating === 'ZOMATO' ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
                    sx={{ bgcolor: ZOMATO_COLOR, '&:hover': { bgcolor: '#c62828' }, fontWeight: 800, borderRadius: 2, py: 1.5 }}
                  >
                    {simulating === 'ZOMATO' ? 'Generating...' : 'Fire Zomato Test Order'}
                  </Button>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ border: `1.5px solid ${alpha(SWIGGY_COLOR, 0.3)}`, borderRadius: 3, bgcolor: alpha(SWIGGY_COLOR, 0.03) }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ width: 38, height: 38, bgcolor: SWIGGY_COLOR, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>S</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: SWIGGY_COLOR }}>Swiggy Integration</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DotIcon sx={{ fontSize: 8, color: swiggyOn ? '#4caf50' : 'text.disabled' }} />
                        <Typography variant="caption" color={swiggyOn ? '#4caf50' : 'text.disabled'}>{swiggyOn ? 'Active' : 'Inactive'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleSimulate('SWIGGY')}
                    disabled={!!simulating || !swiggyOn}
                    startIcon={simulating === 'SWIGGY' ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
                    sx={{ bgcolor: SWIGGY_COLOR, '&:hover': { bgcolor: '#e65100' }, fontWeight: 800, borderRadius: 2, py: 1.5 }}
                  >
                    {simulating === 'SWIGGY' ? 'Generating...' : 'Fire Swiggy Test Order'}
                  </Button>
                </CardContent>
              </Card>

              {/* Performance stat */}
              <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={900} color="primary.main">{zomatoOrders.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Zomato</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={900} sx={{ color: SWIGGY_COLOR }}>{swiggyOrders.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Swiggy</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={900} color="success.main">{activeOrders.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Total Active</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: SETTINGS
         ══════════════════════════════════════════════════════════ */}
      {tab === 2 && (
        <Grid container spacing={3}>
          {/* Channel Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Channel Settings</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(ZOMATO_COLOR, 0.04), borderRadius: 2, border: `1px solid ${alpha(ZOMATO_COLOR, 0.2)}` }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: ZOMATO_COLOR }}>Zomato</Typography>
                      <Typography variant="caption" color="text.secondary">Accept orders from Zomato</Typography>
                    </Box>
                    <Switch checked={zomatoOn} onChange={e => setZomatoOn(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ZOMATO_COLOR }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ZOMATO_COLOR } }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(SWIGGY_COLOR, 0.04), borderRadius: 2, border: `1px solid ${alpha(SWIGGY_COLOR, 0.2)}` }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: SWIGGY_COLOR }}>Swiggy</Typography>
                      <Typography variant="caption" color="text.secondary">Accept orders from Swiggy</Typography>
                    </Box>
                    <Switch checked={swiggyOn} onChange={e => setSwiggyOn(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SWIGGY_COLOR }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: SWIGGY_COLOR } }} />
                  </Box>

                  <Divider />

                  <FormControlLabel
                    control={<Switch checked={soundEnabled} onChange={e => {
                      const nextVal = e.target.checked;
                      setSoundEnabled(nextVal);
                      if (nextVal) playSynthesizedChime();
                    }} color="primary" />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {soundEnabled ? <SoundIcon fontSize="small" color="primary" /> : <MuteIcon fontSize="small" />}
                        <Typography variant="body2" fontWeight={600}>Sound Alert on New Order</Typography>
                      </Box>
                    }
                  />

                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Poll Interval: <span style={{ color: theme.palette.primary.main }}>{pollingInterval}s</span>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>How often to check for new orders</Typography>
                    <Slider value={pollingInterval} min={3} max={60} step={1} valueLabelDisplay="auto" onChange={(_, v) => setPollingInterval(v as number)} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Webhook Endpoints */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Webhook Endpoints</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.5 }}>
                  Register these URLs in your Zomato/Swiggy merchant dashboard to receive real-time order webhooks.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'Zomato Webhook', url: `${window.location.origin.replace(':3001', ':5001')}/api/third-party-orders/webhook/zomato/${orgId}`, color: ZOMATO_COLOR },
                    { label: 'Swiggy Webhook', url: `${window.location.origin.replace(':3001', ':5001')}/api/third-party-orders/webhook/swiggy/${orgId}`, color: SWIGGY_COLOR },
                  ].map(w => (
                    <Box key={w.label}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: w.color }}>{w.label}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <TextField
                          value={w.url}
                          size="small"
                          fullWidth
                          inputProps={{ readOnly: true, style: { fontSize: '0.72rem', fontFamily: 'monospace' } }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                        <Tooltip title="Copy URL">
                          <IconButton size="small" onClick={() => copyUrl(w.url)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}

                  <Divider />

                  <Box>
                    <Typography variant="caption" fontWeight={700}>Merchant Secret Key</Typography>
                    <TextField
                      value="sec_live_zomswi_983249082309"
                      size="small"
                      fullWidth
                      type="password"
                      inputProps={{ readOnly: true }}
                      sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.05), border: `1px solid ${alpha('#10b981', 0.2)}`, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight={700} color="#10b981">💡 How to connect</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      1. Login to your Zomato/Swiggy merchant portal<br />
                      2. Go to Settings → Integrations → Webhooks<br />
                      3. Paste your webhook URL above<br />
                      4. Add the secret key for HMAC signature validation
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── TAB 3: HISTORY ── */}
      {tab === 3 && (
        <Card elevation={0} sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 3, mt: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Settle & Cancellation History</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchHistoryOrders}
                disabled={historyLoading}
                sx={{ borderRadius: 2 }}
              >
                Refresh History
              </Button>
            </Box>

            {historyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : historyOrders.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>
                <Typography variant="body2">No historical orders found</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${alpha('#000', 0.08)}` }}>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>DATE/TIME</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>ORDER ID</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>CHANNEL</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>CUSTOMER</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>ITEMS</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>TOTAL AMOUNT</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>STATUS</th>
                      <th style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>POS BILL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.map((order) => {
                      const pColor = order.platform === 'ZOMATO' ? ZOMATO_COLOR : SWIGGY_COLOR;
                      const statusMeta = STATUS_META[order.status];
                      return (
                        <tr key={order.id} style={{ borderBottom: `1px dashed ${alpha('#000', 0.05)}` }}>
                          <td style={{ padding: '12px 8px', fontSize: '0.8rem' }}>
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700 }}>
                            #{order.orderId}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <PlatformBadge platform={order.platform} />
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.8rem' }}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>{order.customerName}</Typography>
                            {order.customerPhone && <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>}
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.75rem', color: 'text.secondary', maxWidth: 200 }}>
                            {order.items.map((i, idx) => (
                              <div key={idx}>{i.productName} × {i.quantity}</div>
                            ))}
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 700, color: theme.palette.primary.main }}>
                            ₹{order.totalAmount}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <Chip
                              label={statusMeta?.label || order.status}
                              size="small"
                              sx={{
                                bgcolor: alpha(statusMeta?.color || '#6b7280', 0.1),
                                color: statusMeta?.color || '#6b7280',
                                fontWeight: 700,
                                fontSize: '0.7rem'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            {order.status === 'SETTLED' && order.billId ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<LinkIcon fontSize="small" />}
                                onClick={() => window.open(`/bills/view/${order.billId}`, '_blank')}
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  py: 0.3
                                }}
                              >
                                View POS Bill
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Exported wrapper: restaurant-only guard for delivery dashboard
const DeliveryDashboard: React.FC = () => {
  const { layout: industryConf } = useIndustryLayout();

  if (!industryConf.isRestaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          🛵 Delivery Hub is available for Restaurant businesses only.
        </Typography>
      </Box>
    );
  }

  return <DeliveryDashboardInner />;
};

export default DeliveryDashboard;
