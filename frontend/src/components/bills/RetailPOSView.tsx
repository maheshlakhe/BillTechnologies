/* eslint-disable */
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  useTheme,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  QrCodeScanner as BarcodeIcon,
  ShoppingCart as CartIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CardGiftcard as GiftIcon,
  Star as StarIcon,
  CreditCard as CardIconPay,
  Money as CashIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useBills } from '../../hooks/useBills';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/currency';

interface RetailPOSViewProps {
  onClose: () => void;
  initialBill?: any;
}

interface RetailCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  size: string; // "S", "M", "L", "XL", "Free"
  color: string; // "Red", "Blue", "Black", "None"
  sku?: string;
}

export const RetailPOSView: React.FC<RetailPOSViewProps> = ({ onClose, initialBill }) => {
  const theme = useTheme();
  const { createBill, updateBill } = useBills();
  const { products, loading: productsLoading } = useProducts();
  const { customers } = useCustomers();
  const { showSuccess, showError, showWarning } = useNotification();

  // Active customer & rewards
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(120); // Default simulated rewards points
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Variants modal
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');

  // Search & Cart states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<RetailCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Success dialog
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Groceries', 'Accessories'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Grey', 'None'];

  // Map default walk-in customer
  useEffect(() => {
    if (customers && customers.length > 0) {
      const def = customers.find(c => c.name.toLowerCase().includes('walk-in') || c.name.toLowerCase().includes('general')) || customers[0];
      setSelectedCustomer(def);
    }
  }, [customers]);

  // Sync rewards points based on selected customer
  useEffect(() => {
    if (selectedCustomer) {
      // Simulate unique loyalty points based on customer name length
      setLoyaltyPoints((selectedCustomer.name.length * 15) + 40);
      setPointsToRedeem(0);
    }
  }, [selectedCustomer]);

  // Focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle manual barcode scanner input submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find(p => p.sku && p.sku.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (matchedProduct) {
      addToCartWithVariants(matchedProduct);
      showSuccess(`Scanned: ${matchedProduct.name}`);
    } else {
      showWarning(`No product found with SKU/Barcode: "${barcodeInput}"`);
    }
    setBarcodeInput('');
  };

  const addToCartWithVariants = (product: any) => {
    // Check if product belongs to category that usually needs size/color (like Fashion/Clothing)
    const needsVariants = product.category?.toLowerCase() === 'retail' || 
                          product.category?.toLowerCase() === 'men' ||
                          product.category?.toLowerCase() === 'women' ||
                          product.category?.toLowerCase() === 'clothing' ||
                          product.name.toLowerCase().includes('shirt') ||
                          product.name.toLowerCase().includes('pants') ||
                          product.name.toLowerCase().includes('shoe');

    if (needsVariants) {
      setPendingProduct(product);
      setSelectedSize('M');
      setSelectedColor('Black');
      setVariantDialogOpen(true);
    } else {
      // Direct add
      addDirect(product, 'Free', 'None');
    }
  };

  const confirmVariantSelection = () => {
    if (pendingProduct) {
      addDirect(pendingProduct, selectedSize, selectedColor);
      setVariantDialogOpen(false);
      setPendingProduct(null);
    }
  };

  const addDirect = (product: any, size: string, color: string) => {
    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          taxRate: product.taxRate || 18, // Standard retail GST
          size,
          color,
          sku: product.sku
        }
      ]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, val: number) => {
    setCart(
      cart.map((item, i) => {
        if (i === index) {
          return { ...item, quantity: Math.max(1, item.quantity + val) };
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  // Loyalty points redemption: 1 Point = ₹0.5 Discount
  const loyaltyDiscount = useMemo(() => {
    return pointsToRedeem * 0.5;
  }, [pointsToRedeem]);

  const discountAmount = useMemo(() => {
    const primaryDiscount = (subtotal * discountPercent) / 100;
    return primaryDiscount + loyaltyDiscount;
  }, [subtotal, discountPercent, loyaltyDiscount]);

  const taxAmount = useMemo(() => {
    return cart.reduce((acc, item) => {
      const itemSubtotal = item.price * item.quantity;
      const proportionalDiscount = (itemSubtotal / (subtotal || 1)) * discountAmount;
      const taxableAmount = Math.max(0, itemSubtotal - proportionalDiscount);
      return acc + (taxableAmount * (item.taxRate / 100));
    }, 0);
  }, [cart, subtotal, discountAmount]);

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      showWarning('Cart is empty!');
      return;
    }

    setIsSubmitting(true);
    try {
      const billData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        status: 'PAID',
        paymentMethod,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        dueDate: new Date().toISOString(),
        items: cart.map(item => ({
          productId: item.productId,
          productName: `${item.name} (${item.size}/${item.color})`,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          taxRate: item.taxRate
        }))
      };

      let response;
      if (initialBill) {
        response = await updateBill({ ...billData, id: initialBill.id } as any);
        showSuccess('Retail invoice updated successfully!');
      } else {
        response = await createBill(billData as any);
        showSuccess('Retail invoice processed successfully!');
      }

      setCreatedBill(response);
      setCheckoutOpen(true);
    } catch (err: any) {
      showError(err.message || 'Failed to process retail sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Retail Receipt - ${createdBill?.billNumber || 'Receipt'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
            .receipt { width: 300px; margin: 0 auto; border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .meta { font-size: 12px; margin-bottom: 10px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { text-align: left; padding: 5px; font-size: 12px; }
            th { border-bottom: 1px dashed #000; }
            .total-section { border-top: 1px solid #000; padding-top: 5px; text-align: right; font-size: 13px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #555; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h3>BILLSOFT RETAIL MART</h3>
              <p style="font-size: 11px; margin: 0;">Supermarket Block C, Trade Plaza</p>
              <p style="font-size: 11px; margin: 0;">GSTIN: 27RETAIL2233M1Z4</p>
            </div>
            <div class="meta">
              <strong>Bill No:</strong> ${createdBill?.billNumber || 'RET-TEMP'}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br/>
              <strong>Customer:</strong> ${selectedCustomer?.name || 'Walk-in'}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${cart.map(item => `
                  <tr>
                    <td>${item.name} (${item.size}/${item.color})</td>
                    <td>${item.quantity} x ${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <p>Subtotal: ${formatCurrency(subtotal)}</p>
              ${discountAmount > 0 ? `<p>Discount: -${formatCurrency(discountAmount)}</p>` : ''}
              <p>GST / Tax: ${formatCurrency(taxAmount)}</p>
              <h4 style="margin: 5px 0;">Paid Amount: ${formatCurrency(totalAmount)}</h4>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>Exchange policy: 7 days with original tag & invoice copy.</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <Box sx={{
      height: '100%',
      bgcolor: theme.palette.mode === 'dark' ? '#0d0d0d' : '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Title Panel */}
      <Paper elevation={2} sx={{
        p: 2,
        bgcolor: 'secondary.main',
        color: 'white',
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BarcodeIcon fontSize="large" />
          <Box>
            <Typography variant="h5" fontWeight="bold">BillSoft Retail SmartPOS</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>High-Speed Barcode Scanning & Variant Control</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Grid split */}
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Grid: Catalog & Barcode input */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid', borderColor: 'divider', p: 2, overflow: 'hidden' }}>
          
          {/* Barcode Form */}
          <form onSubmit={handleBarcodeSubmit}>
            <TextField
              fullWidth
              inputRef={barcodeInputRef}
              placeholder="📌 Focus & Scan barcode / Enter SKU code and hit Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BarcodeIcon color="secondary" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, mb: 1.5 }
              }}
            />
          </form>

          {/* Categories Tab selector */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Or manually search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="secondary" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2.5 }
                }}
              />
            </Stack>
            <Tabs
              value={selectedCategory}
              onChange={(_, val) => setSelectedCategory(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              textColor="secondary"
              indicatorColor="secondary"
            >
              {categories.map(cat => (
                <Tab key={cat} label={cat} value={cat} sx={{ fontWeight: 'bold' }} />
              ))}
            </Tabs>
          </Box>

          {/* Cards Grid */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                <CircularProgress color="secondary" />
              </Box>
            ) : filteredProducts.length > 0 ? (
              <Grid container spacing={2}>
                {filteredProducts.map((product) => {
                  const isLow = Number(product.stock) < 10;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                      <Card sx={{
                        cursor: 'pointer',
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                      }} onClick={() => addToCartWithVariants(product)}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ height: 16, overflow: 'hidden', mb: 1.5 }}>
                            SKU: {product.sku || 'N/A'} | Cat: {product.category || 'General'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="secondary.main" fontWeight="bold">
                              {formatCurrency(product.price)}
                            </Typography>
                            <Chip
                              label={isLow ? `Low Stock` : `In Stock`}
                              size="small"
                              color={isLow ? 'warning' : 'success'}
                              sx={{ height: 18, fontSize: '0.6rem' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">No items found matching criteria.</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right Grid: Checkout & rewards redemption details */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, overflow: 'hidden' }}>
          
          {/* Customer Loyalty Selector */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="secondary" /> Customer & Rewards Ledger
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Customer</InputLabel>
                <Select
                  value={selectedCustomer?.id || ''}
                  label="Select Customer"
                  onChange={(e) => {
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setSelectedCustomer(cust);
                  }}
                >
                  {customers.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Loyalty Redemption Calculator */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), p: 1.5, borderRadius: 2 }}>
              <StarIcon color="warning" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary">Available Rewards Points</Typography>
                <Typography variant="body2" fontWeight="bold">{loyaltyPoints} Points (Value: {formatCurrency(loyaltyPoints * 0.5)})</Typography>
              </Box>
              <TextField
                type="number"
                size="small"
                label="Redeem"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Math.min(loyaltyPoints, Math.max(0, parseInt(e.target.value) || 0)))}
                sx={{ width: 85, '& .MuiInputBase-input': { py: 0.5, fontSize: '0.8rem' } }}
              />
            </Stack>
          </Paper>

          {/* Cart Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CartIcon color="secondary" /> Checkout Cart ({cart.length})
            </Typography>
            {cart.length > 0 && (
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setCart([])}>
                Clear
              </Button>
            )}
          </Box>

          {/* Cart List */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1.5 }}>
            {cart.length > 0 ? (
              <Stack spacing={1.5}>
                {cart.map((item, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip size="small" label={`Size: ${item.size}`} variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                          <Chip size="small" label={`Color: ${item.color}`} variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Stack>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(index)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="subtitle2" color="secondary" fontWeight="bold">
                        {formatCurrency(item.price)}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 0.5 }}>
                        <IconButton size="small" onClick={() => updateQuantity(index, -1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(index, 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 5 }}>
                <CartIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">Scan barcode or select manually to populate checkout cart.</Typography>
              </Box>
            )}
          </Box>

          {/* Pricing Ledger */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Retail Subtotal:</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(subtotal)}</Typography>
              </Box>
              {loyaltyDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="success.main">Points Loyalty Discount:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="bold">-{formatCurrency(loyaltyDiscount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Coupon/Store Promo (%):</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  sx={{ width: 80, '& .MuiInputBase-input': { py: 0.25, textAlign: 'right' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Standard GST / Sales Tax:</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(taxAmount)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">Net Cash Payable:</Typography>
                <Typography variant="h5" color="secondary.main" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Checkout Triggers */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small">
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <MenuItem value="CASH">💵 Cash</MenuItem>
                  <MenuItem value="CARD">💳 Card</MenuItem>
                  <MenuItem value="UPI">📱 UPI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 8 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                color="secondary"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0 || isSubmitting}
                sx={{ borderRadius: 3, py: 1.25 }}
              >
                Checkout & Print Invoice
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Retail Variants Dialog */}
      <Dialog open={variantDialogOpen} onClose={() => setVariantDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Size & Color Variant</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 2 }}>{pendingProduct?.name}</Typography>
          
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Select Apparel Size:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
            {sizes.map(size => (
              <Chip
                key={size}
                label={size}
                onClick={() => setSelectedSize(size)}
                color={selectedSize === size ? 'secondary' : 'default'}
                variant={selectedSize === size ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Select Apparel Color:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {colors.map(col => (
              <Chip
                key={col}
                label={col}
                onClick={() => setSelectedColor(col)}
                color={selectedColor === col ? 'secondary' : 'default'}
                variant={selectedColor === col ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setVariantDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={confirmVariantSelection}>Add to Cart</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Success Dialog */}
      <Dialog open={checkoutOpen} onClose={() => { setCheckoutOpen(false); setCart([]); onClose(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <BarcodeIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">Retail Sale Completed!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bill <strong>{createdBill?.billNumber || 'RET-01'}</strong> has been registered successfully.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">Paid Net Total</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ flexGrow: 1, borderRadius: 2 }}>
            Print Receipt
          </Button>
          <Button variant="contained" color="secondary" onClick={() => { setCheckoutOpen(false); setCart([]); onClose(); }} sx={{ flexGrow: 1, borderRadius: 2 }}>
            New Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
