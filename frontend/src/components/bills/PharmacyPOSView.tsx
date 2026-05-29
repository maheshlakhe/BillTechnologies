/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalPharmacy as PharmacyIcon,
  ShoppingCart as CartIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  MedicalServices as DoctorIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  Healing as SaltIcon
} from '@mui/icons-material';
import { useBills } from '../../hooks/useBills';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import { useNotification } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/currency';
import { useIndustryLayout } from '../../hooks/useIndustryLayout';

interface PharmacyPOSViewProps {
  onClose: () => void;
  initialBill?: any;
}

interface PharmacyCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  taxRate: number;
  batchNumber: string;
  expiryDate: string;
  dosage: string; // e.g. "1-0-1"
  composition?: string; // generic name
  isScheduleH?: boolean;
}

export const PharmacyPOSView: React.FC<PharmacyPOSViewProps> = ({ onClose, initialBill }) => {
  const theme = useTheme();
  const { layout: industryConf } = useIndustryLayout();
  const { createBill, updateBill } = useBills();
  const { products, loading: productsLoading } = useProducts();
  const { customers } = useCustomers();
  const { showSuccess, showError, showWarning } = useNotification();


  // Patients (Customers) & Doctors details
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [prescriptionVerified, setPrescriptionVerified] = useState(false);

  // Search & Cart states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<PharmacyCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories based on common Pharmacy sections
  const categories = ['All', 'Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'OTC'];

  // Map default walk-in customer
  useEffect(() => {
    if (customers && customers.length > 0) {
      const def = customers.find(c => c.name.toLowerCase().includes('walk-in') || c.name.toLowerCase().includes('general')) || customers[0];
      setSelectedCustomer(def);
    }
  }, [customers]);

  // Load initial bill data if editing
  useEffect(() => {
    if (initialBill) {
      setCart(
        initialBill.items.map((item: any) => ({
          productId: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          taxRate: item.taxRate || 0,
          batchNumber: item.batchNumber || 'B-BATCH99',
          expiryDate: item.expiryDate || '12/2027',
          dosage: item.dosage || '1-0-1',
          composition: item.composition || 'Generic Salt',
          isScheduleH: !!item.isScheduleH
        }))
      );
      if (initialBill.customerId) {
        const cust = customers.find(c => c.id === initialBill.customerId);
        if (cust) setSelectedCustomer(cust);
      }
      if (initialBill.doctorName) setDoctorName(initialBill.doctorName);
    }
  }, [initialBill, customers]);

  // Check if cart contains any Schedule H drugs
  const hasScheduleHDrugs = useMemo(() => {
    return cart.some(item => item.isScheduleH);
  }, [cart]);

  // Filtered Products for Pharmacy display
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: any) => {
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    const mockBatch = product.batchNumber || `B-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockExpiry = product.expiryDate ? new Date(product.expiryDate).toLocaleDateString(undefined, {month: 'numeric', year: 'numeric'}) : '09/2028';
    
    // Simulate Schedule H categorization based on names for demo richness
    const isScheduleH = product.name.toLowerCase().includes('amoxicillin') || 
                       product.name.toLowerCase().includes('paracetamol') ||
                       product.name.toLowerCase().includes('rx') ||
                       product.name.toLowerCase().includes('schedule');

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
          taxRate: product.taxRate || 12, // Default standard medical GST in India
          batchNumber: mockBatch,
          expiryDate: mockExpiry,
          dosage: '1-0-1',
          composition: product.description || 'Generic Salt Composition',
          isScheduleH
        }
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, val: number) => {
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + val);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateDosage = (productId: string, dosage: string) => {
    setCart(
      cart.map(item => {
        if (item.productId === productId) {
          return { ...item, dosage };
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

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

    if (hasScheduleHDrugs && !prescriptionVerified) {
      showError('Schedule H drugs require prescription verification!');
      return;
    }

    setIsSubmitting(true);
    try {
      const billData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || 'Walk-in Patient',
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
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          taxRate: item.taxRate,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          dosage: item.dosage
        })),
        doctorName: doctorName || undefined,
        doctorLicense: doctorLicense || undefined
      };

      let response;
      if (initialBill) {
        response = await updateBill({ ...billData, id: initialBill.id } as any);
        showSuccess('Prescription bill updated successfully!');
      } else {
        response = await createBill(billData as any);
        showSuccess('Prescription bill generated successfully!');
      }

      setCreatedBill(response);
      setCheckoutOpen(true);
    } catch (err: any) {
      showError(err.message || 'Failed to complete transaction');
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
          <title>Medical Invoice - ${createdBill?.billNumber || 'Receipt'}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { text-align: left; padding: 5px; font-size: 14px; }
            th { border-bottom: 1px dashed #000; }
            .total-section { border-top: 2px dashed #000; padding-top: 10px; text-align: right; }
            .dosage { font-size: 11px; color: #666; font-style: italic; }
            .warning-msg { text-align: center; border: 1px solid red; color: red; font-size: 11px; padding: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BILLSOFT PHARMACY</h2>
            <p>12/A Health Boulevard, MedCity</p>
            <p>Tel: +91 98765 43210 | GSTIN: 27AAAAA1111A1Z1</p>
          </div>
          <div class="meta">
            <div>
              <strong>Patient:</strong> ${createdBill?.customerName || 'Walk-in Patient'}<br/>
              <strong>Doctor:</strong> ${doctorName || 'Self / General'}
            </div>
            <div>
              <strong>Bill No:</strong> ${createdBill?.billNumber || 'TEMP-01'}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Medicine [Batch]</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>
                    ${item.name} [${item.batchNumber}] (Exp: ${item.expiryDate})<br/>
                    <span class="dosage">Dosage: ${item.dosage}</span>
                  </td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <p>Subtotal: ${formatCurrency(subtotal)}</p>
            ${discountPercent > 0 ? `<p>Discount (${discountPercent}%): -${formatCurrency(discountAmount)}</p>` : ''}
            <p>GST / Cess: ${formatCurrency(taxAmount)}</p>
            <h3>Net Payable: ${formatCurrency(totalAmount)}</h3>
          </div>
          ${hasScheduleHDrugs ? `
            <div class="warning-msg">
              WARNING: Schedule H Prescription Drug - Caution to be taken. Not to be sold without medical prescription.
            </div>
          ` : ''}
          <div style="text-align: center; margin-top: 30px; font-size: 12px;">
            <p>Get well soon!</p>
            <p>Thank you for choosing BillSoft Pharmacy.</p>
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

  return (
    <Box sx={{
      height: '100%',
      bgcolor: theme.palette.mode === 'dark' ? '#0a0e1a' : '#f5f7fa',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Title Bar */}
      <Paper elevation={1} sx={{
        p: 2,
        bgcolor: industryConf.themeStyle.primaryAccent,
        color: 'white',
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PharmacyIcon fontSize="large" />
          <Box>
            <Typography variant="h5" fontWeight="bold">BillSoft Pharmacy POS</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>Smart Medical Billing & Batch Control</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Grid */}
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Side: Product catalog */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid', borderColor: 'divider', p: 2, overflow: 'hidden' }}>
          {/* Filters & Search */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search Medicine name, formulation, generic composition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: industryConf.themeStyle.primaryAccent }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: `${industryConf.themeStyle.borderRadius}px` }
                }}
              />
            </Stack>
            <Tabs
              value={selectedCategory}
              onChange={(_, val) => setSelectedCategory(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {categories.map(cat => (
                <Tab key={cat} label={cat} value={cat} sx={{ fontWeight: 'bold' }} />
              ))}
            </Tabs>
          </Box>

          {/* Product Cards Grid */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            {productsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </Box>
            ) : filteredProducts.length > 0 ? (
              <Grid container spacing={2}>
                {filteredProducts.map((product) => {
                  const isLow = Number(product.stock) < 10;
                  const isScheduleH = product.name.toLowerCase().includes('amoxicillin') || 
                                     product.name.toLowerCase().includes('paracetamol') ||
                                     product.name.toLowerCase().includes('rx') ||
                                     product.name.toLowerCase().includes('schedule');
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={product.id}>
                      <Card sx={{
                        cursor: 'pointer',
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 },
                        border: isScheduleH ? '1px solid' : 'none',
                        borderColor: alpha(theme.palette.error.main, 0.4)
                      }} onClick={() => addToCart(product)}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '80%' }}>
                              {product.name}
                            </Typography>
                            {isScheduleH && (
                              <Chip label="Rx / Sch H" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, height: 16, overflow: 'hidden' }}>
                            {product.description || 'Formula composition not specified'}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                            <Chip size="small" label={`Batch: ${product.batchNumber || 'B-9021'}`} sx={{ fontSize: '0.65rem' }} />
                            <Chip size="small" label={`Exp: ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString(undefined, {month: 'numeric', year: 'numeric'}) : '09/2028'}`} variant="outlined" sx={{ fontSize: '0.65rem' }} />
                          </Stack>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ color: industryConf.themeStyle.primaryAccent }} fontWeight="bold">
                              {formatCurrency(product.price)}
                            </Typography>
                            <Chip
                              label={isLow ? `Low Stock: ${Number(product.stock)}` : `Stock: ${Number(product.stock)}`}
                              size="small"
                              color={isLow ? 'warning' : 'success'}
                              sx={{ height: 20, fontSize: '0.65rem' }}
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
                <Typography color="text.secondary" sx={{ mb: 2 }}>No medicine matching search criteria found.</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: industryConf.themeStyle.primaryAccent,
                    borderRadius: `${industryConf.themeStyle.borderRadius}px`,
                    '&:hover': {
                      bgcolor: alpha(industryConf.themeStyle.primaryAccent, 0.85)
                    }
                  }}
                  onClick={() => {
                    const defaultMedicine = {
                      id: 'custom-' + Date.now(),
                      name: searchTerm.trim() || 'General Medicine (OTC)',
                      price: 120,
                      taxRate: 12,
                      stock: 100,
                      description: 'Added as default/custom medicine',
                      category: selectedCategory !== 'All' ? selectedCategory : 'OTC'
                    };
                    addToCart(defaultMedicine);
                    showSuccess(`Added "${defaultMedicine.name}" to billing cart!`);
                  }}
                >
                  Quick Add "{searchTerm.trim() || 'General Medicine'}" to Cart
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right Side: Billing Cart */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, overflow: 'hidden' }}>
          {/* Patient Selector */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: industryConf.themeStyle.primaryAccent }} /> Patient Information
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Patient</InputLabel>
                <Select
                  value={selectedCustomer?.id || ''}
                  label="Select Patient"
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

            {/* Doctor & Prescription Inputs */}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DoctorIcon sx={{ color: industryConf.themeStyle.primaryAccent }} /> Prescribing Medical Practitioner
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Dr. Name"
                placeholder="e.g. Dr. A. K. Roy"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                label="License/Reg No."
                placeholder="e.g. MCI-90210"
                value={doctorLicense}
                onChange={(e) => setDoctorLicense(e.target.value)}
              />
            </Stack>
          </Paper>

          {/* Cart Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CartIcon sx={{ color: industryConf.themeStyle.primaryAccent }} /> Medicine Cart ({cart.length})
            </Typography>
            {cart.length > 0 && (
              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setCart([])}>
                Clear
              </Button>
            )}
          </Box>

          {/* Cart Items List */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 1.5 }}>
            {cart.length > 0 ? (
              <Stack spacing={2}>
                {cart.map((item) => (
                  <Paper key={item.productId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Batch: {item.batchNumber} | Exp: {item.expiryDate}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(item.productId)} sx={{ alignSelf: 'flex-start' }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Dosage Instructions and Qty selector */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Dosage: 1-0-1 (e.g. Morning-Night)"
                        value={item.dosage}
                        onChange={(e) => updateDosage(item.productId, e.target.value)}
                        sx={{ width: '55%', '& .MuiInputBase-input': { py: 0.5, fontSize: '0.75rem' } }}
                      />
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 0.5 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.productId, -1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.productId, 1)}>
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
                <Typography color="text.secondary">Your prescription cart is empty.</Typography>
              </Box>
            )}
          </Box>

          {/* Warnings Banner for Schedule H */}
          {hasScheduleHDrugs && (
            <Paper sx={{
              p: 1.5,
              mb: 2,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              border: '1px solid',
              borderColor: 'error.main',
              borderRadius: 3
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <WarningIcon color="error" />
                <Box>
                  <Typography variant="caption" fontWeight="bold" color="error.main" display="block">Prescription Drug Warning</Typography>
                  <Typography variant="caption" color="text.secondary">This cart contains Schedule H/X medications. Prescription checking is mandatory.</Typography>
                </Box>
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={prescriptionVerified}
                    onChange={(e) => setPrescriptionVerified(e.target.checked)}
                    color="error"
                    size="small"
                  />
                }
                label={<Typography variant="caption" fontWeight="bold">I certify that a valid doctor prescription has been checked and verified.</Typography>}
                sx={{ mt: 1, ml: 0.5 }}
              />
            </Paper>
          )}

          {/* Pricing Panel */}
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Gross Subtotal:</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Discount Discount (%):</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  sx={{ width: 80, '& .MuiInputBase-input': { py: 0.25, textAlign: 'right' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Medical GST/Tax Amount:</Typography>
                <Typography variant="body2" fontWeight="bold">{formatCurrency(taxAmount)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">Net Payable Amount:</Typography>
                <Typography variant="h5" sx={{ color: industryConf.themeStyle.primaryAccent }} fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Action Buttons */}
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
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
                onClick={handleCheckoutSubmit}
                disabled={cart.length === 0 || isSubmitting || (hasScheduleHDrugs && !prescriptionVerified)}
                sx={{ 
                  borderRadius: `${industryConf.themeStyle.borderRadius}px`, 
                  py: 1.25,
                  bgcolor: industryConf.themeStyle.primaryAccent,
                  '&:hover': { bgcolor: industryConf.themeStyle.accentHover }
                }}
              >
                Checkout & Generate Invoice
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Invoice Success Dialog */}
      <Dialog open={checkoutOpen} onClose={() => { setCheckoutOpen(false); setCart([]); onClose(); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <PharmacyIcon color="success" sx={{ fontSize: 50, mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">Invoice Generated Successfully!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bill <strong>{createdBill?.billNumber || 'TEMP-01'}</strong> has been securely logged to the system.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block">Net Payable</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ flexGrow: 1, borderRadius: `${industryConf.themeStyle.borderRadius}px` }}>
            Thermal Print
          </Button>
          <Button 
            variant="contained" 
            onClick={() => { setCheckoutOpen(false); setCart([]); onClose(); }} 
            sx={{ 
              flexGrow: 1, 
              borderRadius: `${industryConf.themeStyle.borderRadius}px`,
              bgcolor: industryConf.themeStyle.primaryAccent,
              '&:hover': { bgcolor: industryConf.themeStyle.accentHover }
            }}
          >
            New Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
