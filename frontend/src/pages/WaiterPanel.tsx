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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  TextField,
  Alert
} from '@mui/material';
import {
  RoomService as RoomServiceIcon,
  CheckCircle as CheckIcon,
  Receipt as ReceiptIcon,
  SwapHoriz as SwapIcon,
  Add as AddIcon,
  NotificationImportant as NotificationIcon,
  VolumeUp as SoundIcon,
  VolumeOff as MuteIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { qrMenuService } from '../services/qrMenuService';
import { fetchProducts } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useQrMenuSocket } from '../hooks/useQrMenuSocket';
import { useIndustryLayout } from '../hooks/useIndustryLayout';
import { toast } from 'sonner';

interface WaiterActionEntry {
  id: string;
  tableId: string;
  actionType: 'CALL_WAITER' | 'REQUEST_BILL' | 'OTHER';
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
  table: {
    name: string;
  };
}

interface TableOrderSummary {
  id: string;
  name: string;
  section: string;
  status: string;
  dineInOrders: any[];
  qrSessions: any[];
}

// WaiterPanel inner component — contains all hooks, only rendered for restaurant industry
const WaiterPanelInner: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const orgId = user?.parentId || user?.id || '';

  const [tables, setTables] = useState<TableOrderSummary[]>([]);
  const [actions, setActions] = useState<WaiterActionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [selectedTable, setSelectedTable] = useState<TableOrderSummary | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');

  // Add Items Modal
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [addedItems, setAddedItems] = useState<any[]>([]);

  const { isConnected, on } = useQrMenuSocket(orgId);

  const prevActionsCount = useRef(0);

  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Double note beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 200);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }, [soundEnabled]);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [tableRes, actionRes] = await Promise.all([
        qrMenuService.getWaiterTables(),
        qrMenuService.getWaiterActions()
      ]);

      if (tableRes.success) {
        setTables(tableRes.tables || []);
      }
      if (actionRes.success) {
        const activeActions = actionRes.actions || [];
        setActions(activeActions);

        // Sound alert if new waiter action arrives
        if (activeActions.length > prevActionsCount.current && prevActionsCount.current >= 0) {
          const newest = activeActions[activeActions.length - 1];
          toast.warning(`🔔 Table ${newest.table.name} requests: ${newest.actionType === 'CALL_WAITER' ? 'Waiter Call' : 'Request Bill'}`);
          playAlertSound();
        }
        prevActionsCount.current = activeActions.length;
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to refresh waiter panel');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [playAlertSound]);

  useEffect(() => {
    fetchData();
    // Load products list for add items modal
    fetchProducts().then((prods) => {
      setAvailableProducts(prods || []);
    });
  }, [fetchData]);

  // Socket triggers
  useEffect(() => {
    if (isConnected) {
      on('waiter_called', () => {
        fetchData(true);
      });
      on('waiter_resolved', () => {
        fetchData(true);
      });
      on('new_dine_in_order', () => {
        fetchData(true);
      });
      on('order_status_updated', () => {
        fetchData(true);
      });
      on('kot_ready_alert', ({ tableName }: { tableName: string }) => {
        toast.success(`🍳 KOT is ready for Table ${tableName}!`);
        playAlertSound();
        fetchData(true);
      });
    }
  }, [isConnected, fetchData, playAlertSound]);

  const handleResolveAction = async (actionId: string) => {
    try {
      const res = await qrMenuService.resolveWaiterAction(actionId);
      if (res.success) {
        toast.success('Request marked resolved.');
        fetchData(true);
      }
    } catch (err) {
      toast.error('Failed to resolve request');
    }
  };

  const handleMarkServed = async (orderId: string) => {
    try {
      const res = await qrMenuService.markOrderServed(orderId);
      if (res.success) {
        toast.success('Order marked as served.');
        fetchData(true);
      }
    } catch (err) {
      toast.error('Failed to serve order');
    }
  };

  const handleTransferTable = async () => {
    if (!selectedTable || !targetTableId) return;
    try {
      const res = await qrMenuService.transferTable(selectedTable.id, targetTableId);
      if (res.success) {
        toast.success('Active table session transferred successfully');
        setTransferOpen(false);
        setSelectedTable(null);
        setTargetTableId('');
        fetchData(true);
      }
    } catch (err) {
      toast.error('Transfer failed');
    }
  };

  const handleAddItems = async () => {
    if (!selectedTable || addedItems.length === 0) return;
    try {
      const res = await qrMenuService.waiterAddItems(selectedTable.id, {
        items: addedItems.map((i) => ({ productId: i.productId, quantity: i.quantity, name: i.name })),
        notes: 'Added by Waiter'
      });
      if (res.success) {
        toast.success('KOT placed for newly added items!');
        setAddItemsOpen(false);
        setAddedItems([]);
        setSelectedTable(null);
        fetchData(true);
      }
    } catch (err) {
      toast.error('Failed to add items');
    }
  };

  const addToLocalList = () => {
    if (!selectedProduct) return;
    const prod = availableProducts.find((p) => p.id === selectedProduct);
    if (!prod) return;

    setAddedItems((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) => (i.productId === prod.id ? { ...i, quantity: i.quantity + orderQuantity } : i));
      }
      return [...prev, { productId: prod.id, name: prod.name, price: prod.price, quantity: orderQuantity }];
    });
    setSelectedProduct('');
    setOrderQuantity(1);
  };

  const removeLocalItem = (prodId: string) => {
    setAddedItems((prev) => prev.filter((i) => i.productId !== prodId));
  };

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, color: theme.palette.text.primary, minHeight: '100%' }}>
      {/* Header bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
            }}
          >
            <RoomServiceIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              Waiter Service Terminal
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Manage live tables, requests, and serves
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} alignItems="center">
          <IconButton
            onClick={() => setSoundEnabled(!soundEnabled)}
            sx={{ bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}
          >
            {soundEnabled ? <SoundIcon /> : <MuteIcon color="disabled" />}
          </IconButton>
          <IconButton onClick={() => fetchData()} sx={{ bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, color: theme.palette.text.primary }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && <CircularProgress color="primary" sx={{ display: 'block', mx: 'auto', mb: 3 }} />}

      {/* Customer Request Alerts Bar */}
      {actions.length > 0 && (
        <Card sx={{ mb: 3, borderColor: '#fbbf24', borderWidth: 2, borderStyle: 'solid', borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <NotificationIcon sx={{ color: '#fbbf24' }} />
              <Typography variant="h6" fontWeight="bold" color="warning.dark">
                Pending Customer Requests ({actions.length})
              </Typography>
            </Box>
            <Divider />
            <List dense>
              {actions.map((act) => (
                <ListItem key={act.id} sx={{ bgcolor: '#fef3c7', my: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold">
                        Table {act.table.name} —{' '}
                        {act.actionType === 'CALL_WAITER' ? '🔔 Waiter Requested' : '💰 Bill Requested'}
                      </Typography>
                    }
                    secondary={`Time: ${new Date(act.createdAt).toLocaleTimeString()}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() => handleResolveAction(act.id)}
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                    >
                      Resolve
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Table Grid list */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Tables & Dine-In Sessions
      </Typography>

      <Grid container spacing={3}>
        {tables.map((table) => {
          const activeOrders = table.dineInOrders || [];
          const hasReadyKot = activeOrders.some((o) => o.status === 'READY');
          const isOccupied = table.status === 'OCCUPIED' || activeOrders.length > 0;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={table.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: hasReadyKot ? '2px solid #10b981' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      {table.name}
                    </Typography>
                    <Chip
                      label={isOccupied ? 'Occupied' : 'Available'}
                      size="small"
                      color={isOccupied ? 'primary' : 'success'}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={1.5}>
                    Section: {table.section}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  {activeOrders.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center" py={2}>
                      No active orders.
                    </Typography>
                  ) : (
                    <Box sx={{ my: 1.5 }}>
                      <Typography variant="caption" fontWeight="bold" display="block" mb={1} color="textSecondary">
                        KOT ITEMS:
                      </Typography>
                      {activeOrders.map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            mb: 1.5,
                            p: 1,
                            bgcolor: '#f8fafc',
                            borderRadius: 2,
                            border: order.status === 'READY' ? '1.5px solid #10b981' : 'none'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="caption" fontWeight="bold" color="primary">
                              #{order.orderNumber}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={order.status === 'READY' ? 'success' : 'default'}
                              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 'bold' }}
                            />
                          </Box>
                          {order.items.map((item: any) => (
                            <Typography key={item.id} variant="body2">
                              {item.name} x {item.quantity}
                            </Typography>
                          ))}

                          {order.status === 'READY' && (
                            <Button
                              fullWidth
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleMarkServed(order.id)}
                              sx={{ mt: 1, borderRadius: 1.5, fontWeight: 'bold', fontSize: '0.72rem' }}
                            >
                              Mark Served
                            </Button>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Actions footer */}
                  {isOccupied && (
                    <Box display="flex" gap={1} mt={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<SwapIcon />}
                        onClick={() => {
                          setSelectedTable(table);
                          setTransferOpen(true);
                        }}
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                      >
                        Transfer
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedTable(table);
                          setAddItemsOpen(true);
                        }}
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                      >
                        Add Items
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Transfer Table Dialog */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Transfer Table Session</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Transfer all active orders and customer session from{' '}
            <strong>{selectedTable?.name}</strong> to:
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="target-table-label">Select Target Table</InputLabel>
            <Select
              labelId="target-table-label"
              value={targetTableId}
              label="Select Target Table"
              onChange={(e) => setTargetTableId(e.target.value)}
            >
              {tables
                .filter((t) => t.id !== selectedTable?.id && t.status !== 'OCCUPIED')
                .map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} ({t.section})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTransferOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTransferTable} disabled={!targetTableId}>
            Transfer Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Items Dialog */}
      <Dialog fullWidth open={addItemsOpen} onClose={() => setAddItemsOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Items — {selectedTable?.name}</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 300 }}>
          <Box display="flex" gap={2} mb={3} alignItems="center">
            <FormControl fullWidth size="small">
              <InputLabel id="select-product-label">Select Dish / Item</InputLabel>
              <Select
                labelId="select-product-label"
                value={selectedProduct}
                label="Select Dish / Item"
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {availableProducts.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} — ₹{p.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Qty"
              size="small"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
              sx={{ width: 80 }}
            />

            <Button variant="contained" startIcon={<AddIcon />} onClick={addToLocalList} disabled={!selectedProduct}>
              Add
            </Button>
          </Box>

          <Typography fontWeight="bold" variant="subtitle2" mb={1}>
            ITEMS TO ORDER:
          </Typography>

          {addedItems.length === 0 ? (
            <Typography color="textSecondary" align="center" py={4}>
              No items added to KOT list.
            </Typography>
          ) : (
            <List dense>
              {addedItems.map((item) => (
                <ListItem key={item.productId} divider>
                  <ListItemText
                    primary={item.name}
                    secondary={`₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="error" onClick={() => removeLocalItem(item.productId)}>
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddItemsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddItems} disabled={addedItems.length === 0}>
            Submit KOT
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Exported wrapper: checks industry before rendering the full panel
export const WaiterPanel: React.FC = () => {
  const { layout: industryConf } = useIndustryLayout();

  if (!industryConf.isRestaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          🍽️ Waiter Panel is available for Restaurant businesses only.
        </Typography>
      </Box>
    );
  }

  return <WaiterPanelInner />;
};

export default WaiterPanel;
