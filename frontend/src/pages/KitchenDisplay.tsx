import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon
} from '@mui/icons-material';
import { qrMenuService } from '../services/qrMenuService';
import { useAuth } from '../contexts/AuthContext';
import { useQrMenuSocket } from '../hooks/useQrMenuSocket';
import { useIndustryLayout } from '../hooks/useIndustryLayout';
import { toast } from 'sonner';

interface DineInOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes?: string;
}

interface KitchenQueueEntry {
  id: string;
  orderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  estimatedTime?: number;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    notes?: string;
    createdAt: string;
    table: {
      id: string;
      name: string;
      section: string;
    };
    items: DineInOrderItem[];
  };
}

function useKdsElapsedTime(createdAt: string) {
  const [elapsed, setElapsed] = useState(0); // in seconds
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      setElapsed(diff);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdAt]);
  return elapsed;
}

// Timer display widget
const KdsTimer: React.FC<{ createdAt: string }> = ({ createdAt }) => {
  const elapsedSeconds = useKdsElapsedTime(createdAt);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  let color = '#10b981'; // Green < 5 mins
  if (minutes >= 5 && minutes < 10) {
    color = '#fbbf24'; // Yellow 5-10 mins
  } else if (minutes >= 10) {
    color = '#ef4444'; // Red > 10 mins
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <TimerIcon sx={{ fontSize: 16, color }} />
      <Typography variant="caption" sx={{ color, fontWeight: 'bold', fontSize: '0.85rem' }}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Typography>
    </Box>
  );
};

// KitchenDisplay inner component — contains all hooks, only rendered for restaurant industry
const KitchenDisplayInner: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const orgId = user?.parentId || user?.id || '';

  const [queue, setQueue] = useState<KitchenQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Socket
  const { isConnected, on } = useQrMenuSocket(orgId);

  const prevCount = useRef(0);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error('Failed to play KDS chime:', e);
    }
  }, [soundEnabled]);

  const fetchKdsQueue = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await qrMenuService.getKitchenQueue();
      if (res.success) {
        const all: KitchenQueueEntry[] = res.queue || [];
        setQueue(all);

        // Check if there are new orders
        const pendingCount = all.filter((o) => o.status === 'PENDING').length;
        if (pendingCount > prevCount.current && prevCount.current >= 0) {
          toast.info('🍳 New incoming KOT order received!');
          playChime();
        }
        prevCount.current = pendingCount;
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to reload Kitchen queue');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [playChime]);

  useEffect(() => {
    fetchKdsQueue();
  }, [fetchKdsQueue]);

  // Real-time socket bindings
  useEffect(() => {
    if (isConnected) {
      on('new_dine_in_order', () => {
        fetchKdsQueue(true);
      });
      on('order_status_updated', () => {
        fetchKdsQueue(true);
      });
      on('kitchen_kot_updated', () => {
        fetchKdsQueue(true);
      });
    }
  }, [isConnected, fetchKdsQueue]);

  const handleAccept = async (orderId: string) => {
    try {
      const res = await qrMenuService.acceptKitchenOrder(orderId);
      if (res.success) {
        toast.success('Order accepted! Moved to preparation.');
        fetchKdsQueue(true);
      }
    } catch (err: any) {
      toast.error('Failed to accept order');
    }
  };

  const handlePreparing = async (orderId: string, estTime?: number) => {
    try {
      const res = await qrMenuService.markOrderPreparing(orderId, estTime);
      if (res.success) {
        toast.success('Order marked as PREPARING');
        fetchKdsQueue(true);
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleReady = async (orderId: string) => {
    try {
      const res = await qrMenuService.markOrderReady(orderId);
      if (res.success) {
        toast.success('Order is READY! Waiter notified.');
        fetchKdsQueue(true);
      }
    } catch (err: any) {
      toast.error('Failed to mark order ready');
    }
  };

  const getStatusColumnData = (status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY') => {
    return queue.filter((item) => item.status === status);
  };

  const COLUMN_META = [
    {
      status: 'PENDING' as const,
      label: 'New KOTs',
      color: '#ef4444',
      bgColor: alpha('#ef4444', 0.06),
      borderColor: alpha('#ef4444', 0.2)
    },
    {
      status: 'ACCEPTED' as const,
      label: 'Accepted',
      color: '#f59e0b',
      bgColor: alpha('#f59e0b', 0.06),
      borderColor: alpha('#f59e0b', 0.2)
    },
    {
      status: 'PREPARING' as const,
      label: 'Preparing',
      color: '#3b82f6',
      bgColor: alpha('#3b82f6', 0.06),
      borderColor: alpha('#3b82f6', 0.2)
    },
    {
      status: 'READY' as const,
      label: 'Ready / Serving',
      color: '#10b981',
      bgColor: alpha('#10b981', 0.06),
      borderColor: alpha('#10b981', 0.2)
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100%' }}>
      {/* KDS Control Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RestaurantIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="black" letterSpacing={-0.5} sx={{ color: theme.palette.text.primary }}>
              Kitchen Display System (KDS)
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Real-time Dine-in Order KOT Queue
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          {isConnected ? (
            <Chip
              label="Connected"
              size="small"
              sx={{ bgcolor: alpha('#10b981', 0.15), color: '#10b981', fontWeight: 'bold' }}
            />
          ) : (
            <Chip
              label="Disconnected"
              size="small"
              sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444', fontWeight: 'bold' }}
            />
          )}

          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            sx={{ border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}
          >
            {soundEnabled ? <SoundIcon /> : <MuteIcon color="disabled" />}
          </IconButton>

          <IconButton onClick={() => fetchKdsQueue()} sx={{ border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && <LinearProgress color="warning" sx={{ mb: 2, borderRadius: 2 }} />}

      {/* KDS Kanban Columns */}
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
        {COLUMN_META.map((col) => {
          const items = getStatusColumnData(col.status);
          return (
            <Grid size={{ xs: 12, md: 3 }} key={col.status} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  bgcolor: col.bgColor,
                  border: `1.5px solid ${col.borderColor}`,
                  px: 2,
                  py: 1.5,
                  borderRadius: 3,
                  mb: 2
                }}
              >
                <Typography fontWeight="bold" style={{ color: col.color }}>
                  {col.label}
                </Typography>
                <Chip
                  label={items.length}
                  size="small"
                  sx={{
                    bgcolor: col.color,
                    color: '#fff',
                    fontWeight: 'bold',
                    height: 20,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>

              {/* Order Cards Container */}
              <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 2, pr: 1 }}>
                {items.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      border: `2px dashed ${theme.palette.divider}`,
                      borderRadius: 3,
                      color: theme.palette.text.disabled
                    }}
                  >
                    <Typography variant="body2">No orders in this stage</Typography>
                  </Box>
                ) : (
                  items.map((entry) => (
                    <Card
                      key={entry.id}
                      sx={{
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1.5px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Order info */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                            {entry.order.orderNumber}
                          </Typography>
                          <KdsTimer createdAt={entry.order.createdAt} />
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={1.5}>
                          <Chip
                            label={`Table: ${entry.order.table.name}`}
                            size="small"
                            sx={{ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary, fontWeight: 'bold' }}
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Section: {entry.order.table.section}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Items list */}
                        <Box sx={{ my: 1.5 }}>
                          {entry.order.items.map((item) => (
                            <Box key={item.id} sx={{ mb: 1 }}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" fontWeight="semibold">
                                  {item.name} <span style={{ color: '#ef4444' }}>x{item.quantity}</span>
                                </Typography>
                              </Box>
                              {item.notes && (
                                <Typography variant="caption" sx={{ color: '#f87171', display: 'block', mt: 0.25 }}>
                                  * Note: {item.notes}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>

                        {entry.order.notes && (
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              borderRadius: 1.5,
                              mb: 2
                            }}
                          >
                            <Typography variant="caption" color="#f87171">
                              General Instructions: {entry.order.notes}
                            </Typography>
                          </Box>
                        )}

                        {/* Actions */}
                        <Box mt={2}>
                          {entry.status === 'PENDING' && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              startIcon={<PlayIcon />}
                              onClick={() => handleAccept(entry.orderId)}
                              sx={{
                                bgcolor: '#ef4444',
                                '&:hover': { bgcolor: '#dc2626' },
                                borderRadius: 2,
                                fontWeight: 'bold'
                              }}
                            >
                              Accept Order
                            </Button>
                          )}

                          {entry.status === 'ACCEPTED' && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              startIcon={<RestaurantIcon />}
                              onClick={() => handlePreparing(entry.orderId, 15)}
                              sx={{
                                bgcolor: '#f59e0b',
                                '&:hover': { bgcolor: '#d97706' },
                                borderRadius: 2,
                                fontWeight: 'bold'
                              }}
                            >
                              Start Cooking
                            </Button>
                          )}

                          {entry.status === 'PREPARING' && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleReady(entry.orderId)}
                              sx={{
                                bgcolor: '#10b981',
                                '&:hover': { bgcolor: '#059669' },
                                borderRadius: 2,
                                fontWeight: 'bold'
                              }}
                            >
                              Mark Ready
                            </Button>
                          )}

                          {entry.status === 'READY' && (
                            <Typography align="center" variant="caption" sx={{ color: '#10b981', display: 'block', py: 1 }}>
                              Waiting for Waiter to Serve
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Exported wrapper: checks industry before rendering the full display
export const KitchenDisplay: React.FC = () => {
  const { layout: industryConf } = useIndustryLayout();

  if (!industryConf.isRestaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          🍽️ Kitchen Display is available for Restaurant businesses only.
        </Typography>
      </Box>
    );
  }

  return <KitchenDisplayInner />;
};

export default KitchenDisplay;
