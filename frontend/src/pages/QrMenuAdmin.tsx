import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  RoomService as TableIcon,
  Receipt as BillIcon,
  Add as AddIcon,
  Print as PrintIcon,
  TrendingUp as ChartIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Restaurant as KitchenIcon,
  RoomService as WaiterIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { qrMenuService } from '../services/qrMenuService';
import { useAuth } from '../contexts/AuthContext';
import { useQrMenuSocket } from '../hooks/useQrMenuSocket';
import { useIndustryLayout } from '../hooks/useIndustryLayout';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Alert as MuiAlert } from '@mui/material';

import KitchenDisplay from './KitchenDisplay';
import WaiterPanel from './WaiterPanel';


// QrMenuAdmin inner component — contains all hooks, only rendered for restaurant industry
const QrMenuAdminInner: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.parentId || user?.id || '';

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    activeTables: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    todayRevenue: 0
  });

  // Table & QR Lists
  const [tables, setTables] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Modals
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [qrPrintModalOpen, setQrPrintModalOpen] = useState(false);

  // Form Fields
  const [tableName, setTableName] = useState('');
  const [tableSection, setTableSection] = useState('General');
  const [tableCapacity, setTableCapacity] = useState(4);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  // Bulk Form Fields
  const [bulkTotal, setBulkTotal] = useState(5);
  const [bulkPrefix, setBulkPrefix] = useState('Table');
  const [bulkStartNum, setBulkStartNum] = useState(1);

  // Printing configurations
  const [selectedQrPrint, setSelectedQrPrint] = useState<any>(null);
  const [printLayout, setPrintLayout] = useState<'card' | 'tent' | 'sticker' | 'plate'>('card');

  // Socket
  const { isConnected, on } = useQrMenuSocket(orgId);

  useEffect(() => {
    fetchDashboardStats();
    fetchTablesData();
    fetchOrdersData();
    fetchQrCodesData();
    fetchAnalyticsData();
  }, [orgId]);

  // Real-time updates
  useEffect(() => {
    if (isConnected) {
      on('table_status_updated', () => {
        fetchDashboardStats();
        fetchTablesData();
      });
      on('new_dine_in_order', () => {
        fetchDashboardStats();
        fetchOrdersData();
      });
      on('order_status_updated', () => {
        fetchDashboardStats();
        fetchOrdersData();
      });
    }
  }, [isConnected]);

  const fetchDashboardStats = async () => {
    try {
      const res = await qrMenuService.getDashboard();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTablesData = async () => {
    try {
      const res = await qrMenuService.getTables();
      if (res.success) {
        setTables(res.tables || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQrCodesData = async () => {
    try {
      const res = await qrMenuService.getQrCodes();
      if (res.success) {
        setQrCodes(res.qrCodes || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrdersData = async () => {
    try {
      const res = await qrMenuService.getOrders({ history: false });
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const res = await qrMenuService.getAnalytics();
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTable = async () => {
    if (!tableName) return;
    try {
      setLoading(true);
      if (editingTableId) {
        // Edit Mode
        const res = await qrMenuService.updateTable(editingTableId, tableName, tableSection, tableCapacity);
        if (res.success) {
          toast.success('Table details updated successfully');
          setTableModalOpen(false);
          setEditingTableId(null);
          setTableName('');
          fetchTablesData();
        }
      } else {
        // Create Mode
        const res = await qrMenuService.createTable(tableName, tableSection, tableCapacity);
        if (res.success) {
          toast.success('Table created and QR Code generated');
          setTableModalOpen(false);
          setTableName('');
          fetchTablesData();
          fetchQrCodesData();
        }
      }
    } catch (err: any) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      setLoading(true);
      const res = await qrMenuService.bulkCreateTables({
        totalTables: bulkTotal,
        prefix: bulkPrefix,
        startNumber: bulkStartNum,
        section: tableSection,
        capacity: tableCapacity
      });
      if (res.success) {
        toast.success(`${res.count} tables created successfully with QR codes`);
        setBulkModalOpen(false);
        fetchTablesData();
        fetchQrCodesData();
      }
    } catch (err) {
      toast.error('Bulk creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this table? This will disable its QR menu.')) return;
    try {
      const res = await qrMenuService.deleteTable(id);
      if (res.success) {
        toast.success('Table deleted successfully');
        fetchTablesData();
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleRegenerateQr = async (tableId: string) => {
    if (!window.confirm('Regenerating QR will invalidate the previous printed QR tag. Proceed?')) return;
    try {
      const res = await qrMenuService.generateQrCode(tableId);
      if (res.success) {
        toast.success('QR Code token regenerated');
        fetchQrCodesData();
      }
    } catch (err) {
      toast.error('Regeneration failed');
    }
  };

  const handleSettleOrder = async (orderId: string) => {
    const paymentMode = window.prompt('Enter payment mode (Cash/Card/UPI):', 'Cash');
    if (paymentMode === null) return; // cancelled
    try {
      const res = await qrMenuService.settleOrder(orderId, paymentMode);
      if (res.success) {
        toast.success(`Order settled! Invoice created: ${res.bill.billNumber}`);
        fetchOrdersData();
        fetchDashboardStats();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Settlement failed');
    }
  };

  const handleMergeSettle = async (tableId: string) => {
    const paymentMode = window.prompt('Enter payment mode (Cash/Card/UPI) for all merged orders:', 'Cash');
    if (paymentMode === null) return; // cancelled
    try {
      const res = await qrMenuService.mergeSettleOrders(tableId, paymentMode);
      if (res.success) {
        toast.success(`Merged and settled! Invoice created: ${res.bill.billNumber}`);
        fetchOrdersData();
        fetchDashboardStats();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Merge settlement failed');
    }
  };

  const printQrCode = () => {
    const printContent = document.getElementById('qr-print-area');
    if (!printContent) return;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    window.location.reload(); // Reload to restore React app state
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Module Title */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)'
            }}
          >
            <QrCodeIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" letterSpacing={-0.5}>
              Dine-In Hub
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage physical tables, print tags, monitor active sales, and analyze peak order patterns.
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingTableId(null);
              setTableName('');
              setTableModalOpen(true);
            }}
            sx={{ borderRadius: 2.5, textTransform: 'none' }}
          >
            Add Table
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setBulkModalOpen(true)}
            sx={{ borderRadius: 2.5, textTransform: 'none', bgcolor: '#4f46e5' }}
          >
            Bulk Create Tables
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        sx={{
          mb: 4,
          borderBottom: '1px solid #cbd5e1',
          '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', fontSize: '0.95rem' }
        }}
      >
        <Tab label="Dining-In Order Logs" icon={<BillIcon />} iconPosition="start" />
        <Tab label="Tables Setup" icon={<SettingsIcon />} iconPosition="start" />
        <Tab label="QR Codes & Printing" icon={<QrCodeIcon />} iconPosition="start" />
        <Tab label="Live Kitchen Queue (KDS)" icon={<KitchenIcon />} iconPosition="start" />
        <Tab label="Live Waiter Actions" icon={<WaiterIcon />} iconPosition="start" />
      </Tabs>

      {/* ─────────────────────────────────────────────────────────────
          TAB 0: DASHBOARD
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <Box>
          {/* Stats Bar */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Active Tables', value: stats.activeTables, color: '#3b82f6' },
              { label: 'Pending KOTs', value: stats.pendingOrders, color: '#ef4444' },
              { label: 'Preparing', value: stats.preparingOrders, color: '#f59e0b' },
              { label: 'Ready KOTs', value: stats.readyOrders, color: '#10b981' },
              { label: "Today's QR Revenue", value: `₹${stats.todayRevenue.toFixed(2)}`, color: '#6366f1' }
            ].map((stat, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                  <CardContent sx={{ py: 2.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color, mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Active Orders List */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Live Dine-In Orders & KOTs
              </Typography>
              {orders.length === 0 ? (
                <Typography color="textSecondary" align="center" py={6}>
                  No active dine-in orders at the moment.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Table</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Session Customer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((ord) => (
                        <TableRow key={ord.id} hover>
                          <TableCell sx={{ fontWeight: 'bold', color: '#4f46e5' }}>{ord.orderNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 'semibold' }}>{ord.table.name} ({ord.table.section})</TableCell>
                          <TableCell>{ord.session?.customerName || 'Walk-in Guest'}</TableCell>
                          <TableCell>
                            <Chip
                              label={ord.status}
                              size="small"
                              sx={{
                                fontWeight: 'bold',
                                bgcolor:
                                  ord.status === 'PENDING'
                                    ? '#fee2e2'
                                    : ord.status === 'PREPARING'
                                    ? '#dbeafe'
                                    : ord.status === 'READY'
                                    ? '#d1fae5'
                                    : '#f3f4f6',
                                color:
                                  ord.status === 'PENDING'
                                    ? '#ef4444'
                                    : ord.status === 'PREPARING'
                                    ? '#2563eb'
                                    : ord.status === 'READY'
                                    ? '#059669'
                                    : '#4b5563'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>₹{ord.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            {ord.items.map((i: any) => `${i.name} (${i.quantity})`).join(', ')}
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              {ord.status === 'SERVED' && (
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  startIcon={<BillIcon />}
                                  onClick={() => handleSettleOrder(ord.id)}
                                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                  Settle Bill
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleMergeSettle(ord.tableId)}
                                sx={{ textTransform: 'none', borderRadius: 1.5 }}
                              >
                                Merge All & Settle
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: TABLES SETUP
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Restaurant Table Grid list
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name / Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Live Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Enabled</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tables.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell sx={{ fontWeight: 'semibold' }}>{t.name}</TableCell>
                      <TableCell>{t.section}</TableCell>
                      <TableCell>{t.capacity} Persons</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          size="small"
                          color={t.status === 'AVAILABLE' ? 'success' : t.status === 'OCCUPIED' ? 'primary' : 'warning'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={t.isActive}
                          onChange={(e) => qrMenuService.patchTableStatus(t.id, { isActive: e.target.checked }).then(fetchTablesData)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setEditingTableId(t.id);
                              setTableName(t.name);
                              setTableSection(t.section);
                              setTableCapacity(t.capacity);
                              setTableModalOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteTable(t.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: QR CODES & PRINTING TEMPLATES
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {tables.map((table) => {
            const qr = qrCodes.find((q) => q.tableId === table.id);
            const menuLink = qr ? `${window.location.origin}${qr.qrCodeUrl}` : '';

            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={table.id}>
                <Card sx={{ borderRadius: 3, border: '1px solid #cbd5e1', textAlign: 'center', p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {table.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" mb={2} display="block">
                    Section: {table.section}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    {menuLink ? (
                      <QRCodeSVG value={menuLink} size={130} />
                    ) : (
                      <CircularProgress size={30} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }} />

                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<PrintIcon />}
                      onClick={() => {
                        setSelectedQrPrint({ table, menuLink });
                        setQrPrintModalOpen(true);
                      }}
                      sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#4f46e5' }}
                    >
                      Print
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleRegenerateQr(table.id)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Reset Token
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {activeTab === 3 && <KitchenDisplay />}
      {activeTab === 4 && <WaiterPanel />}

      {/* Table CRUD Modal */}
      <Dialog open={tableModalOpen} onClose={() => setTableModalOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingTableId ? 'Edit Table' : 'Add New Table'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Table Name / Number"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="table-section-label">Section</InputLabel>
            <Select
              labelId="table-section-label"
              value={tableSection}
              label="Section"
              onChange={(e) => setTableSection(e.target.value)}
            >
              <MenuItem value="General">General / Main Hall</MenuItem>
              <MenuItem value="AC Section">AC Room</MenuItem>
              <MenuItem value="Rooftop">Rooftop Lounge</MenuItem>
              <MenuItem value="Family Section">Family Cabin</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Seating Capacity (persons)"
            value={tableCapacity}
            onChange={(e) => setTableCapacity(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setTableModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTable} disabled={loading} sx={{ bgcolor: '#4f46e5' }}>
            {loading ? <CircularProgress size={20} /> : 'Save Table'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Setup Modal */}
      <Dialog open={bulkModalOpen} onClose={() => setBulkModalOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Bulk Create Tables</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            type="number"
            label="Total number of tables to create"
            value={bulkTotal}
            onChange={(e) => setBulkTotal(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Table Name Prefix"
            placeholder="e.g. Table, Room, Cabin"
            value={bulkPrefix}
            onChange={(e) => setBulkPrefix(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="number"
            label="Starting Number"
            value={bulkStartNum}
            onChange={(e) => setBulkStartNum(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="bulk-section-label">Section</InputLabel>
            <Select
              labelId="bulk-section-label"
              value={tableSection}
              label="Section"
              onChange={(e) => setTableSection(e.target.value)}
            >
              <MenuItem value="General">General / Main Hall</MenuItem>
              <MenuItem value="AC Section">AC Room</MenuItem>
              <MenuItem value="Rooftop">Rooftop Lounge</MenuItem>
              <MenuItem value="Family Section">Family Cabin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Capacity (persons)"
            value={tableCapacity}
            onChange={(e) => setTableCapacity(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkCreate} disabled={loading} sx={{ bgcolor: '#4f46e5' }}>
            {loading ? <CircularProgress size={20} /> : 'Create Tables'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Printing Template Dialog */}
      <Dialog open={qrPrintModalOpen} onClose={() => setQrPrintModalOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 4, width: 450 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Select Tag Layout</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="print-layout-label">Design Template</InputLabel>
            <Select
              labelId="print-layout-label"
              value={printLayout}
              label="Design Template"
              onChange={(e: any) => setPrintLayout(e.target.value)}
            >
              <MenuItem value="card">Premium Card (Tent Card / Standee)</MenuItem>
              <MenuItem value="sticker">Sticker Label (Square Plate)</MenuItem>
              <MenuItem value="tent">Table Tent (Foldable Card)</MenuItem>
              <MenuItem value="plate">Metal Plate Tag</MenuItem>
            </Select>
          </FormControl>

          {/* Real-time preview inside dialog */}
          <Box
            id="qr-print-area"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              border: '2px solid #000',
              borderRadius: printLayout === 'sticker' ? '50%' : '16px',
              bgcolor: '#fff',
              color: '#000',
              width: 320,
              mx: 'auto',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, letterSpacing: -0.5 }}>
              {selectedQrPrint?.table?.section || 'OUR RESTAURANT'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, fontSize: '0.8rem' }}>
              SCAN ME TO ORDER ONLINE
            </Typography>

            {selectedQrPrint?.menuLink && (
              <QRCodeSVG value={selectedQrPrint.menuLink} size={160} />
            )}

            <Typography variant="h4" fontWeight="black" sx={{ mt: 3, textTransform: 'uppercase' }}>
              {selectedQrPrint?.table.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 1, fontSize: '0.65rem' }}>
              Self-ordering Dine-in system powered by BillSoft
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQrPrintModalOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={printQrCode} sx={{ bgcolor: '#4f46e5' }}>
            Print Tag
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Exported wrapper: checks industry before rendering the full admin
export const QrMenuAdmin: React.FC = () => {
  const { layout: industryConf } = useIndustryLayout();

  if (!industryConf.isRestaurant) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <MuiAlert severity="info" sx={{ maxWidth: 520, mx: 'auto', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Restaurant Feature Only</Typography>
          <Typography variant="body2" color="text.secondary">
            The Dine-In &amp; QR Menu system is available exclusively for Restaurant businesses.
            Switch your industry to <strong>Restaurant</strong> in Settings to access this feature.
          </Typography>
        </MuiAlert>
      </Box>
    );
  }

  return <QrMenuAdminInner />;
};

export default QrMenuAdmin;
