/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Paper,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as DrinkIcon,
  ShoppingCart as CartIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  TableBar as TableIcon,
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Money as CashIcon,
  CreditCard as CardIconPay,
  DinnerDining as FoodIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useBills } from '../../hooks/useBills';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useNotification } from '../../contexts/NotificationContext';
import { processSaleData } from '../../utils/billingUtils';
import RealRestaurantThermal from '../../modules/billing-templates/RealRestaurantThermal';
import BillTemplateRenderer from '../../modules/billing-templates/BillTemplateRenderer';

interface RestaurantPOSViewProps {
  onClose: () => void;
  initialBill?: any;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  remarks?: string;
  category?: string;
  emoji?: string;
}

interface TableState {
  id: string;
  name: string;
  section: 'AC' | 'Garden' | 'Hall' | 'Family';
  status: 'available' | 'occupied' | 'selected';
  cart: CartItem[];
  kot: CartItem[];
}

export const RestaurantPOSView: React.FC<RestaurantPOSViewProps> = ({ onClose, initialBill }) => {
  const theme = useTheme();
  const { createBill, updateBill } = useBills();
  const { products, loading: productsLoading } = useProducts();
  const { customers } = useCustomers();
  const { appearanceSettings } = useSettingsContext();
  const { showSuccess, showError, showWarning } = useNotification();

  // Selected customer for the bill
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Set default customer
  useEffect(() => {
    if (customers && customers.length > 0) {
      // Find default walk-in or general customer, or pick the first one
      const def = customers.find(c => c.name.toLowerCase().includes('walk-in') || c.name.toLowerCase().includes('general')) || customers[0];
      setSelectedCustomer(def);
    }
  }, [customers]);

  // Table Management State
  const [tables, setTables] = useState<TableState[]>([
    // AC Section
    { id: 'AC-1', name: 'AC 1', section: 'AC', status: 'available', cart: [], kot: [] },
    { id: 'AC-2', name: 'AC 2', section: 'AC', status: 'available', cart: [], kot: [] },
    { id: 'AC-3', name: 'AC 3', section: 'AC', status: 'available', cart: [], kot: [] },
    { id: 'AC-4', name: 'AC 4', section: 'AC', status: 'available', cart: [], kot: [] },
    { id: 'AC-5', name: 'AC 5', section: 'AC', status: 'available', cart: [], kot: [] },
    { id: 'AC-6', name: 'AC 6', section: 'AC', status: 'available', cart: [], kot: [] },
    // Garden Section
    { id: 'G-1', name: 'G 1', section: 'Garden', status: 'available', cart: [], kot: [] },
    { id: 'G-2', name: 'G 2', section: 'Garden', status: 'available', cart: [], kot: [] },
    { id: 'G-3', name: 'G 3', section: 'Garden', status: 'available', cart: [], kot: [] },
    { id: 'G-4', name: 'G 4', section: 'Garden', status: 'available', cart: [], kot: [] },
    // Hall Section
    { id: 'H-1', name: 'H 1', section: 'Hall', status: 'available', cart: [], kot: [] },
    { id: 'H-2', name: 'H 2', section: 'Hall', status: 'available', cart: [], kot: [] },
    { id: 'H-3', name: 'H 3', section: 'Hall', status: 'available', cart: [], kot: [] },
    { id: 'H-4', name: 'H 4', section: 'Hall', status: 'available', cart: [], kot: [] },
    { id: 'H-5', name: 'H 5', section: 'Hall', status: 'available', cart: [], kot: [] },
    { id: 'H-6', name: 'H 6', section: 'Hall', status: 'available', cart: [], kot: [] },
    // Family Section
    { id: 'F-1', name: 'F 1', section: 'Family', status: 'available', cart: [], kot: [] },
    { id: 'F-2', name: 'F 2', section: 'Family', status: 'available', cart: [], kot: [] },
    { id: 'F-3', name: 'F 3', section: 'Family', status: 'available', cart: [], kot: [] },
    { id: 'F-4', name: 'F 4', section: 'Family', status: 'available', cart: [], kot: [] },
  ]);

  const [activeTableId, setActiveTableId] = useState<string>('AC-1');
  const [activeSectionTab, setActiveSectionTab] = useState<string>('AC');

  const activeTable = useMemo(() => {
    return tables.find(t => t.id === activeTableId) || tables[0];
  }, [tables, activeTableId]);

  // Product Category & Search States
  const [menuTab, setMenuTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart-specific options
  const [taxRate, setTaxRate] = useState<number>(5); // 5% GST standard for restaurants
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');

  // Dialog State
  const [billReceiptOpen, setBillReceiptOpen] = useState(false);
  const [generatedBillData, setGeneratedBillData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: generatedBillData?.billNumber || 'Receipt',
  });

  // Preloaded Restaurant Menu Items (used if user has no products)
  const defaultRestaurantItems = useMemo(() => [
    { id: 'd1', name: 'Paneer Tikka', price: 280, taxRate: 5, category: 'Starters', emoji: '🍢', imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop&q=80' },
    { id: 'd2', name: 'Chicken Tikka', price: 340, taxRate: 5, category: 'Starters', emoji: '🍗', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop&q=80' },
    { id: 'd3', name: 'Veg Biryani', price: 220, taxRate: 5, category: 'Main Course', emoji: '🍛', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop&q=80' },
    { id: 'd4', name: 'Butter Chicken', price: 380, taxRate: 5, category: 'Main Course', emoji: '🍛', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop&q=80' },
    { id: 'd5', name: 'Dal Tadka', price: 160, taxRate: 5, category: 'Main Course', emoji: '🥣', imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&h=300&fit=crop&q=80' },
    { id: 'd6', name: 'Garlic Naan', price: 60, taxRate: 5, category: 'Breads', emoji: '🫓', imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&h=300&fit=crop&q=80' },
    { id: 'd7', name: 'Masala Papad', price: 40, taxRate: 5, category: 'Starters', emoji: '🫓', imageUrl: '/masala_papad.png' },
    { id: 'd8', name: 'French Fries', price: 120, taxRate: 5, category: 'Starters', emoji: '🍟', imageUrl: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=300&fit=crop&q=80' },
    { id: 'd9', name: 'Virgin Mojito', price: 110, taxRate: 5, category: 'Beverages', emoji: '🍹', imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop&q=80' },
    { id: 'd10', name: 'Iced Tea', price: 90, taxRate: 5, category: 'Beverages', emoji: '🥤', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&q=80' },
    { id: 'd11', name: 'Blenders Pride', price: 210, taxRate: 5, category: 'Liquor', emoji: '🥃', imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop&q=80' },
    { id: 'd12', name: 'Kingfisher', price: 180, taxRate: 5, category: 'Liquor', emoji: '🍺', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop&q=80' },
    { id: 'd13', name: 'Hot Fudge Sundae', price: 150, taxRate: 5, category: 'Desserts', emoji: '🍨', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&q=80' },
    { id: 'd14', name: 'Sizzling Brownie', price: 180, taxRate: 5, category: 'Desserts', emoji: '🍰', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&q=80' },
  ], []);

  // Map user products or fallback to preloaded items
  const menuItems = useMemo(() => {
    if (products && products.length > 0) {
      return products.map(p => {
        // Guess category or assign to Main Course
        let cat = p.category || 'Main Course';
        if (p.name.toLowerCase().includes('beer') || p.name.toLowerCase().includes('drink') || p.name.toLowerCase().includes('whisky') || p.name.toLowerCase().includes('monk') || p.name.toLowerCase().includes('kingfisher') || p.name.toLowerCase().includes('pride')) {
          cat = 'Liquor';
        } else if (p.name.toLowerCase().includes('mojito') || p.name.toLowerCase().includes('tea') || p.name.toLowerCase().includes('juice') || p.name.toLowerCase().includes('water') || p.name.toLowerCase().includes('coke')) {
          cat = 'Beverages';
        } else if (p.name.toLowerCase().includes('papad') || p.name.toLowerCase().includes('tikka') || p.name.toLowerCase().includes('fries') || p.name.toLowerCase().includes('wings') || p.name.toLowerCase().includes('chilli')) {
          cat = 'Starters';
        } else if (p.name.toLowerCase().includes('ice') || p.name.toLowerCase().includes('brownie') || p.name.toLowerCase().includes('cake') || p.name.toLowerCase().includes('jamun') || p.name.toLowerCase().includes('halwa')) {
          cat = 'Desserts';
        } else if (p.name.toLowerCase().includes('naan') || p.name.toLowerCase().includes('roti') || p.name.toLowerCase().includes('paratha')) {
          cat = 'Breads';
        }

        // Assign emojis for delightful UI
        let emoji = '🍛';
        if (cat === 'Beverages') emoji = '🍹';
        else if (cat === 'Liquor') emoji = '🥃';
        else if (cat === 'Desserts') emoji = '🍨';
        else if (cat === 'Starters') emoji = '🍢';
        else if (cat === 'Breads') emoji = '🫓';

        return {
          id: p.id,
          name: p.name,
          price: p.price,
          taxRate: p.taxRate || 5,
          category: cat,
          emoji: emoji,
          imageUrl: (p as any).imageUrl || ''
        };
      });
    }
    return defaultRestaurantItems;
  }, [products, defaultRestaurantItems]);

  const scrollbarStyle = {
    '&::-webkit-scrollbar': { width: '5px', height: '5px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#94A3B8' }
  };

  // Unique categories list
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [menuItems]);

  // Filter menu items by search query & category tab
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = menuTab === 'all' || item.category === menuTab;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, menuTab]);

  // Table status and selection
  const handleSelectTable = (tableId: string) => {
    setActiveTableId(tableId);
  };

  // Add Item to active table's cart
  const handleAddToOrder = (item: typeof menuItems[0]) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t;

      const existingIndex = t.cart.findIndex(c => c.productId === item.id);
      let updatedCart = [...t.cart];

      if (existingIndex > -1) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
      } else {
        updatedCart.push({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          taxRate: item.taxRate,
          emoji: item.emoji,
          category: item.category
        });
      }

      return {
        ...t,
        status: t.kot.length > 0 || updatedCart.length > 0 ? 'occupied' : 'available',
        cart: updatedCart
      };
    }));
  };

  // Adjust item quantity in active table's cart
  const handleAdjustQuantity = (productId: string, amount: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t;

      const updatedCart = t.cart.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];

      return {
        ...t,
        cart: updatedCart,
        status: t.kot.length > 0 || updatedCart.length > 0 ? 'occupied' : 'available'
      };
    }));
  };

  // Remove Item completely from active table's cart
  const handleRemoveFromCart = (productId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t;

      const updatedCart = t.cart.filter(item => item.productId !== productId);
      return {
        ...t,
        cart: updatedCart,
        status: t.kot.length > 0 || updatedCart.length > 0 ? 'occupied' : 'available'
      };
    }));
  };

  // Add order remarks (spicy, less oil, etc.)
  const handleUpdateRemarks = (productId: string, remarks: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t;
      const updatedCart = t.cart.map(item => 
        item.productId === productId ? { ...item, remarks } : item
      );
      return { ...t, cart: updatedCart };
    }));
  };

  // Send Items to Kitchen (Generate Kitchen Order Ticket - KOT)
  const handleSendToKitchen = () => {
    if (activeTable.cart.length === 0) {
      showWarning('Cart is empty. Add items to send KOT.');
      return;
    }

    setTables(prev => prev.map(t => {
      if (t.id !== activeTableId) return t;

      // Merge current cart items into KOT list
      const mergedKot = [...t.kot];
      t.cart.forEach(cartItem => {
        const existingIdx = mergedKot.findIndex(k => k.productId === cartItem.productId);
        if (existingIdx > -1) {
          mergedKot[existingIdx] = {
            ...mergedKot[existingIdx],
            quantity: mergedKot[existingIdx].quantity + cartItem.quantity
          };
        } else {
          mergedKot.push({ ...cartItem });
        }
      });

      return {
        ...t,
        kot: mergedKot,
        cart: [], // Clear temporary cart
        status: 'occupied'
      };
    }));

    showSuccess(`KOT Sent for ${activeTable.name} successfully!`);
  };

  // Total Calculations
  const calculations = useMemo(() => {
    // We calculate based on both KOT and temporary cart items
    const allItems = [...activeTable.kot];
    
    // Add cart items (if any, merge them for billing)
    activeTable.cart.forEach(cartItem => {
      const idx = allItems.findIndex(i => i.productId === cartItem.productId);
      if (idx > -1) {
        allItems[idx] = {
          ...allItems[idx],
          quantity: allItems[idx].quantity + cartItem.quantity
        };
      } else {
        allItems.push({ ...cartItem });
      }
    });

    const subtotal = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    
    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

    return {
      allItems,
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal
    };
  }, [activeTable, taxRate, discountType, discountValue]);

  // Complete Payment & Save Bill to Database
  const handleGenerateBill = async () => {
    const { allItems, grandTotal, subtotal, taxAmount, discountAmount } = calculations;

    if (allItems.length === 0) {
      showError('Please add items or send KOT to generate bill.');
      return;
    }

    if (!selectedCustomer) {
      showError('Please select a customer for the bill.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare items payload for DB
      const itemsPayload = allItems.map(item => ({
        productId: item.productId.startsWith('d') ? null : item.productId, // Null if default mock item
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        taxRate: item.taxRate,
        customFields: {
          remarks: item.remarks || '',
          category: item.category || 'Main Course',
          table_no: activeTable.name
        }
      }));

      // 2. Prepare overall bill payload
      const billPayload = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email || null,
        items: itemsPayload,
        status: 'PAID',
        paymentStatus: 'PAID',
        templateId: appearanceSettings?.activeTemplateId || 'thermal_58mm',
        dueDate: new Date().toISOString().split('T')[0],
        paymentMode: paymentMode,
        branchId: localStorage.getItem('currentBranchId') || null,
        customFields: {
          table_no: activeTable.name,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          subtotal: subtotal
        }
      };

      console.log('[POS POS] Generating Bill payload:', billPayload);
      const result = await createBill(billPayload as any);

      // Store generated data for preview
      setGeneratedBillData({
        ...result,
        saleData: {
          templateId: result?.templateId || appearanceSettings?.activeTemplateId || 'thermal_58mm',
          items: allItems.map(i => ({
            name: i.name,
            qty: i.quantity,
            rate: i.price,
            total: i.price * i.quantity,
            taxRate: i.taxRate,
            remarks: i.remarks || ''
          })),
          tableNo: activeTable.name,
          storeName: localStorage.getItem('billsoft_store_name') || 'ACME RESTAURANT & BAR',
          storeAddress: 'Hinjewadi Phase 1, Pune',
          storeGSTIN: '27AADCB2342G1Z2',
          billNo: (result as any)?.billNumber || 'KOT-' + Math.floor(Math.random() * 1000),
          billDate: new Date().toLocaleDateString(),
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone || 'Walk-in',
          discountAmount: discountAmount,
          taxAmount: taxAmount,
          grandTotal: grandTotal,
          paymentMode: paymentMode
        }
      });

      // Clear Table states
      setTables(prev => prev.map(t => {
        if (t.id !== activeTableId) return t;
        return {
          ...t,
          cart: [],
          kot: [],
          status: 'available'
        };
      }));

      // Reset cart states
      setDiscountValue(0);
      showSuccess(`Bill generated successfully for ${activeTable.name}!`);
      setBillReceiptOpen(true);

      // Dispatch refresh events
      window.dispatchEvent(new Event('bill-created'));
      window.dispatchEvent(new Event('bills-updated'));

    } catch (err: any) {
      console.error('[POS POS Error] Submission failed:', err);
      showError(err.response?.data?.error || err.message || 'Failed to generate restaurant bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Table Cart/Order completely
  const handleCancelOrder = (tableIdToCancel = activeTableId) => {
    const tableToCancel = tables.find(t => t.id === tableIdToCancel) || activeTable;
    if (window.confirm(`Are you sure you want to cancel the order for ${tableToCancel.name}? This will clear all items and KOT.`)) {
      setTables(prev => prev.map(t => {
        if (t.id !== tableIdToCancel) return t;
        return {
          ...t,
          cart: [],
          kot: [],
          status: 'available'
        };
      }));
      if (tableIdToCancel === activeTableId) {
        setDiscountValue(0);
      }
      showWarning(`Order cancelled for ${tableToCancel.name}.`);
    }
  };

  // Pre-configured Section Filter
  const activeTablesList = useMemo(() => {
    return tables.filter(t => t.section === activeSectionTab);
  }, [tables, activeSectionTab]);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('app-header-portal-target'));
  }, []);

  const topBarContent = (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 700, gap: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#0D6EFD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
          <RestaurantIcon sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
          New Order <Chip label="LIVE" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }} />
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search dish or category (Alt + S)"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} /></InputAdornment>,
          sx: { bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC', borderRadius: 2, '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: theme.palette.divider }, '&.Mui-focused fieldset': { borderColor: '#0D6EFD' } }
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', bgcolor: theme.palette.background.default, color: theme.palette.text.primary, overflow: 'hidden' }}>
      {portalTarget && ReactDOM.createPortal(topBarContent, portalTarget)}
      {/* TOP BAR REMOVED AND MOVED TO PORTAL */}

      {/* --- MAIN LAYOUT --- */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* LEFT AREA: Tables, KOT, Items */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 3, gap: 3 }}>
          
          {/* Top Row: Table Management & KOT */}
          <Box sx={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {/* Table Management */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 2, height: 260, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableIcon sx={{ color: '#0D6EFD' }} /> Table Management
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} /><Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary }}>FREE</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B' }} /><Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary }}>PENDING</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EF4444' }} /><Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary }}>OCCUPIED</Typography></Box>
                  </Stack>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: theme.palette.text.secondary, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    — AC SECTION —
                  </Typography>
                </Box>

                <Box sx={{ overflowY: 'auto', flexGrow: 1, pr: 1, ...scrollbarStyle }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {activeTablesList.map(table => {
                      const isSelected = activeTableId === table.id;
                      const hasKOT = table.kot.length > 0;
                      let statusColor = '#10B981'; // Free
                      let statusBg = 'rgba(16, 185, 129, 0.1)';
                      if (table.status === 'occupied') {
                        statusColor = '#EF4444'; // Occupied
                        statusBg = 'rgba(239, 68, 68, 0.1)';
                      } else if (table.cart.length > 0) {
                        statusColor = '#F59E0B'; // Pending
                        statusBg = 'rgba(245, 158, 11, 0.1)';
                      }

                      return (
                        <Box sx={{ width: "calc(33.333% - 8px)" }} key={table.id}>
                          <Box
                            onClick={() => handleSelectTable(table.id)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: isSelected ? '2px solid #0D6EFD' : `1px solid ${statusBg}`,
                              bgcolor: isSelected ? 'rgba(13, 110, 253, 0.05)' : '#FFF',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 4px 12px rgba(13, 110, 253, 0.15)' : 'none',
                              '&:hover': { borderColor: isSelected ? '#0D6EFD' : '#CBD5E1' }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor }} />
                              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: statusColor, textTransform: 'uppercase' }}>
                                {table.status === 'occupied' ? 'OCCUPIED' : table.cart.length > 0 ? 'PENDING' : 'AVAILABLE'}
                              </Typography>
                            </Box>
                            {(table.status === 'occupied' || table.cart.length > 0) && (
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); handleCancelOrder(table.id); }}
                                sx={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                                title="Clear Table"
                              >
                                <DeleteIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            )}
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: isSelected ? '#0D6EFD' : '#1E293B', mb: 0.2 }}>
                              {table.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary, fontWeight: 600, mb: 1 }}>
                              AC SECTION
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary }}>
                              <PersonIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>4 Seater</Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Kitchen Order Tickets */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 2, height: 260, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ReceiptIcon sx={{ color: '#0D6EFD' }} /> Kitchen Order Tickets
                </Typography>
                <Box sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, pr: 1, ...scrollbarStyle }}>
                  {tables.filter(t => t.kot.length > 0).map((t, idx) => (
                    <Box key={idx} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: theme.palette.text.primary }}>TABLE: {t.name}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: theme.palette.text.secondary }}>KOT-00{idx + 1}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: theme.palette.text.primary }}>10:52 AM</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0D6EFD', mb: 1.5 }}>
                        {t.kot.map(k => `${k.name} x ${k.quantity}`).join(', ')}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: theme.palette.text.secondary }}>Billed to: Admin</Typography>
                        <Chip label={idx === 0 ? "FOOD IS READY" : "READY FOR PICKUP"} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: idx === 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: idx === 0 ? '#F59E0B' : '#10B981' }} />
                      </Box>
                    </Box>
                  ))}
                  {tables.filter(t => t.kot.length > 0).length === 0 && (
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                       <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem', fontWeight: 600 }}>No active Kitchen Orders.</Typography>
                     </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Bottom Row: Food Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                Current Order: {activeTable.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                {['All', 'Drinks', 'Snacks', 'Veg', 'Non Veg'].map((cat, i) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onClick={() => setMenuTab(cat === 'All' ? 'all' : cat)}
                    sx={{
                      bgcolor: (menuTab === 'all' && cat === 'All') || menuTab === cat ? '#0F172A' : '#FFF',
                      color: (menuTab === 'all' && cat === 'All') || menuTab === cat ? '#FFF' : '#64748B',
                      border: `1px solid ${theme.palette.divider}`,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: theme.palette.text.primary, color: '#FFF' }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Item Grid */}
            <Box sx={{ overflowY: 'auto', flexGrow: 1, pb: 2, pr: 1, ...scrollbarStyle }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {filteredMenuItems.map(item => {
                  // Vibrant fallback styling for items based on category
                  const getTagProps = () => {
                    if (item.category === 'Starters') return { label: 'CRUNCHY', color: '#F59E0B', bg: theme.palette.mode === 'dark' ? '#451a03' : '#FFFBEB' };
                    if (item.category === 'Main Course') return { label: 'CHEF\'S SPECIAL', color: '#0D6EFD', bg: theme.palette.mode === 'dark' ? '#1e3a8a' : '#EFF6FF' };
                    if (item.category === 'Breads' || item.category === 'Veg') return { label: 'VEG', color: '#10B981', bg: theme.palette.mode === 'dark' ? '#064e3b' : '#ECFDF5' };
                    if (item.category === 'Non Veg') return { label: 'NON-VEG', color: '#EF4444', bg: theme.palette.mode === 'dark' ? '#7f1d1d' : '#FEF2F2' };
                    return { label: 'POPULAR', color: '#8B5CF6', bg: theme.palette.mode === 'dark' ? '#4c1d95' : '#F5F3FF' };
                  };
                  const tag = getTagProps();
                  
                  // Vibrant gradient backgrounds for the image area
                  const bgGradients = [
                    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
                    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                  ];
                  const grad = bgGradients[item.id.charCodeAt(item.id.length-1) % bgGradients.length];

                  return (
                    <Box sx={{ width: { xs: "48%", sm: "31%", md: "23%", lg: "18%" } }} key={item.id}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${tag.color}40`,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }
                        }}
                      >
                        {/* Image Area */}
                        <Box sx={{ height: 120, width: '100%', borderRadius: '12px 12px 0 0', position: 'relative', overflow: 'hidden', bgcolor: theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9' }}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <Box sx={{ display: item.imageUrl ? 'none' : 'flex', width: '100%', height: '100%', background: grad, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0 }}>
                            <Typography sx={{ fontSize: '3rem' }}>{item.emoji}</Typography>
                          </Box>
                          <Chip 
                            label={tag.label} 
                            size="small" 
                            sx={{ position: 'absolute', top: 8, left: 8, height: 20, fontSize: '0.6rem', fontWeight: 900, bgcolor: tag.color, color: '#FFF', borderRadius: 1 }} 
                          />
                        </Box>
                        
                        <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2, mb: 1, flexGrow: 1 }}>
                            {item.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: theme.palette.text.primary }}>
                              ₹{item.price}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleAddToOrder(item)}
                              sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5, color: '#0D6EFD', bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC', width: 28, height: 28, '&:hover': { bgcolor: '#0D6EFD', color: '#FFF' } }}
                            >
                              <AddIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDEBAR: Bill Area */}
        <Box sx={{ width: 380, bgcolor: theme.palette.background.paper, borderLeft: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, ...scrollbarStyle }}>
            
            {/* Tax & Discount Controls */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary, mb: 1 }}>CUSTOMISE TAX</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                  <Button variant="contained" size="small" disableElevation sx={{ flex: 1, minWidth: 0, bgcolor: '#0D6EFD', fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5, p: 0.5 }}>%</Button>
                  <Button variant="outlined" size="small" sx={{ flex: 1, minWidth: 0, borderColor: theme.palette.divider, color: theme.palette.text.secondary, fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5, p: 0.5 }}>Fixed</Button>
                </Box>
                <TextField
                  size="small"
                  fullWidth
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  InputProps={{ sx: { fontSize: '0.85rem', fontWeight: 700, borderRadius: 1.5, height: 36 } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.secondary, mb: 1 }}>MANUAL DISCOUNT</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                  <Button variant="contained" size="small" disableElevation sx={{ flex: 1, minWidth: 0, bgcolor: '#10B981', fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5, p: 0.5 }}>%</Button>
                  <Button variant="outlined" size="small" sx={{ flex: 1, minWidth: 0, borderColor: theme.palette.divider, color: theme.palette.text.secondary, fontSize: '0.7rem', fontWeight: 700, borderRadius: 1.5, p: 0.5 }}>Fixed</Button>
                </Box>
                <TextField
                  size="small"
                  fullWidth
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  InputProps={{ sx: { fontSize: '0.85rem', fontWeight: 700, borderRadius: 1.5, height: 36 } }}
                />
              </Box>
            </Box>

            {/* Bill Preview Box (Thermal Receipt Style) */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, p: 2, bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#FAFAFA', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box sx={{ width: 45, height: 45, border: '1px dashed #CBD5E1', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.5rem', color: theme.palette.text.secondary, textAlign: 'center', fontWeight: 700 }}>YOUR LOGO</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: theme.palette.text.primary, letterSpacing: '0.5px' }}>ACME RESTAURANT</Typography>
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: theme.palette.text.secondary }}>GST - 12A1B4C9D77F2</Typography>
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: theme.palette.text.secondary }}>FSSAI - ABC12345XYZ</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.primary }}>TABLE: {activeTable.name}</Typography>
                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: theme.palette.text.secondary }}>TOKEN NO. 7</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: theme.palette.text.secondary }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>
              </Box>

              <Box sx={{ flexGrow: 1, borderTop: '1px dashed #CBD5E1', borderBottom: '1px dashed #CBD5E1', py: 1.5, mb: 2 }}>
                <Box sx={{ display: "flex", mb: 1, pb: 1, borderBottom: `1px dashed ${theme.palette.divider}` }}>
                  <Box sx={{ flex: 5 }}><Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: theme.palette.text.secondary }}>Item</Typography></Box>
                  <Box sx={{ flex: 2, textAlign: 'center' }}><Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: theme.palette.text.secondary }}>Qty</Typography></Box>
                  <Box sx={{ flex: 2, textAlign: 'center' }}><Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: theme.palette.text.secondary }}>Price</Typography></Box>
                  <Box sx={{ flex: 2, textAlign: 'center' }}><Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: theme.palette.text.secondary }}>Amt</Typography></Box>
                  <Box sx={{ flex: 1.5, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: theme.palette.text.secondary }}>Action</Typography>
                    <DeleteIcon sx={{ fontSize: 10, color: theme.palette.text.secondary }} />
                  </Box>
                </Box>
                
                {calculations.allItems.map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", py: 1, alignItems: "center", borderBottom: `1px dashed ${theme.palette.divider}` }}>
                    <Box sx={{ flex: 5, pr: 0.5, overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {idx + 1}. {item.name}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.2 }}>
                        <IconButton size="small" onClick={() => handleAdjustQuantity(item.productId, -1)} sx={{ p: 0 }}><RemoveIcon sx={{ fontSize: 10 }} /></IconButton>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.primary, width: '16px', textAlign: 'center' }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => handleAdjustQuantity(item.productId, 1)} sx={{ p: 0 }}><AddIcon sx={{ fontSize: 10 }} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 2, textAlign: 'center' }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.primary }}>{item.price}</Typography></Box>
                    <Box sx={{ flex: 2, textAlign: 'center' }}><Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.primary }}>{item.price * item.quantity}</Typography></Box>
                    <Box sx={{ flex: 1.5, textAlign: 'right' }}>
                      <IconButton size="small" onClick={() => handleRemoveFromCart(item.productId)} sx={{ p: 0, color: '#EF4444', '&:hover': { color: '#DC2626' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
                
                {calculations.allItems.length === 0 && (
                  <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, textAlign: 'center', mt: 4, fontWeight: 600 }}>Cart is empty</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '55%' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.secondary }}>Sub-total:</Typography>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.primary }}>₹{calculations.subtotal.toFixed(2)}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '55%' }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.palette.text.secondary }}>Tax ({taxRate}%):</Typography>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: theme.palette.text.primary }}>₹{calculations.taxAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: theme.palette.text.primary }}>GRAND TOTAL:</Typography>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0D6EFD' }}>₹{calculations.grandTotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ mt: 'auto', p: 1.5, bgcolor: theme.palette.background.paper, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${theme.palette.divider}` }}>
                <Box>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: theme.palette.text.primary }}>UPI PAYMENT</Typography>
                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: theme.palette.text.secondary }}>Scan to pay directly</Typography>
                </Box>
                <QrCodeIcon sx={{ color: theme.palette.text.secondary, fontSize: 24 }} />
              </Box>

            </Paper>

          </Box>

          {/* Bottom Actions */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper, pb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                onClick={handleSendToKitchen}
                sx={{ borderRadius: 2, color: theme.palette.text.primary, borderColor: theme.palette.divider, fontWeight: 800, fontSize: '0.75rem', py: 1 }}
              >
                PRINT KOT
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  if (calculations.allItems.length === 0) {
                    showWarning('No items to print.');
                    return;
                  }
                  setGeneratedBillData({
                    billNumber: 'DRAFT',
                    saleData: {
                      templateId: appearanceSettings?.activeTemplateId || 'thermal_58mm',
                      items: calculations.allItems.map(i => ({
                        name: i.name,
                        qty: i.quantity,
                        rate: i.price,
                        total: i.price * i.quantity,
                        taxRate: i.taxRate,
                        remarks: i.remarks || ''
                      })),
                      tableNo: activeTable.name,
                      storeName: localStorage.getItem('billsoft_store_name') || 'ACME RESTAURANT & BAR',
                      storeAddress: 'Hinjewadi Phase 1, Pune',
                      storeGSTIN: '27AADCB2342G1Z2',
                      billNo: 'DRAFT',
                      billDate: new Date().toLocaleDateString(),
                      customerName: selectedCustomer?.name || 'Walk-in',
                      customerPhone: selectedCustomer?.phone || 'Walk-in',
                      discountAmount: calculations.discountAmount,
                      taxAmount: calculations.taxAmount,
                      grandTotal: calculations.grandTotal,
                      paymentMode: paymentMode
                    }
                  });
                  setBillReceiptOpen(true);
                }}
                sx={{ borderRadius: 2, color: theme.palette.text.primary, borderColor: theme.palette.divider, fontWeight: 800, fontSize: '0.75rem', py: 1 }}
              >
                PRINT BILL
              </Button>
            </Box>
            <Button
              variant="contained"
              fullWidth
              disabled={isSubmitting || calculations.allItems.length === 0}
              onClick={handleGenerateBill}
              sx={{ 
                borderRadius: 2, 
                bgcolor: '#0D6EFD', 
                color: '#FFF', 
                fontWeight: 900, 
                fontSize: '0.9rem', 
                py: 1.5,
                boxShadow: '0 4px 14px rgba(13, 110, 253, 0.4)',
                '&:hover': { bgcolor: '#0b5ed7' }
              }}
            >
              {isSubmitting ? 'PROCESSING...' : 'SETTLEMENT >'}
            </Button>
          </Box>
        </Box>

      </Box>

      {/* Bill Preview Dialog */}
      <Dialog open={billReceiptOpen} onClose={() => setBillReceiptOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', borderBottom: '1px solid #F1F5F9' }}>
          Bill Generated
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC' }}>
          <Box ref={receiptRef} sx={{ p: 0 }}>
            {generatedBillData && <BillTemplateRenderer saleData={generatedBillData.saleData} />}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: theme.palette.background.paper, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setBillReceiptOpen(false)} variant="outlined" sx={{ fontWeight: 700, borderRadius: 2 }}>Close</Button>
          <Button onClick={handlePrintReceipt} variant="contained" startIcon={<PrintIcon />} sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>Print Receipt</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
