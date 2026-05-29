import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Badge,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert,
  alpha
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  RoomService as RoomServiceIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { qrMenuService } from '../services/qrMenuService';
import { useQrMenuSocket } from '../hooks/useQrMenuSocket';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export const CustomerMenu: React.FC = () => {
  const { restaurantId, tableToken } = useParams<{ restaurantId: string; tableToken: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [table, setTable] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cookingInstruction, setCookingInstruction] = useState('');

  // Active Orders (Live tracking)
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Name popup for session setup
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Feedback Dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [remarks, setRemarks] = useState('');

  // Notification Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Socket for live tracking
  const { isConnected, on } = useQrMenuSocket(restaurantId);

  useEffect(() => {
    fetchMenuData();
  }, [restaurantId, tableToken]);

  // Handle socket order updates
  useEffect(() => {
    if (isConnected) {
      on('order_status_updated', ({ orderId, status }: { orderId: string; status: string }) => {
        setToast({
          open: true,
          message: `Your order status has been updated to: ${status}!`,
          severity: 'info'
        });
        // Refetch orders for this session
        if (session?.id) {
          qrMenuService.getPublicOrders(session.id).then((res) => {
            if (res.success) {
              setActiveOrders(res.orders);
            }
          });
        }
      });
    }
  }, [isConnected, session]);

  const fetchMenuData = async () => {
    if (!restaurantId || !tableToken) return;
    try {
      setLoading(true);
      const res = await qrMenuService.getPublicMenu(restaurantId, tableToken);
      if (res.success) {
        setTable(res.table);
        setSession(res.session);
        setBranding(res.branding);
        setProducts(res.products);

        // Extract unique categories
        const cats = Array.from(new Set(res.products.map((p: any) => p.category || 'General'))) as string[];
        setCategories(['All', ...cats]);

        // If Guest Session and no name entered yet, show name popup
        if (res.session && res.session.customerName === 'Guest Customer') {
          setShowNamePopup(true);
        }

        // Fetch existing orders for tracking
        if (res.session?.id) {
          const orderRes = await qrMenuService.getPublicOrders(res.session.id);
          if (orderRes.success) {
            setActiveOrders(orderRes.orders);
          }
        }
      } else {
        setError(res.error || 'Failed to load menu');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading the QR menu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSessionName = async () => {
    if (!table || !restaurantId) return;
    try {
      const res = await qrMenuService.createPublicSession({
        tableId: table.id,
        customerName: custName || 'Guest Customer',
        customerPhone: custPhone || undefined,
        restaurantId
      });
      if (res.success) {
        setSession(res.session);
        setShowNamePopup(false);
        setToast({
          open: true,
          message: `Welcome, ${res.session.customerName}!`,
          severity: 'success'
        });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ open: true, message: 'Failed to save customer name', severity: 'error' });
    }
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, change: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (!existing) return prev;
      const newQty = existing.quantity + change;
      if (newQty <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!restaurantId || !table || cart.length === 0) return;
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
        notes: item.notes || cookingInstruction || undefined
      }));

      const res = await qrMenuService.placePublicOrder({
        sessionId: session?.id,
        tableId: table.id,
        items: itemsPayload,
        notes: cookingInstruction || undefined,
        restaurantId
      });

      if (res.success) {
        setCart([]);
        setCartOpen(false);
        setCookingInstruction('');
        // Update active orders
        setActiveOrders((prev) => [res.order, ...prev]);
        setTrackingOpen(true);
        setToast({
          open: true,
          message: 'Order placed successfully! Sent to kitchen.',
          severity: 'success'
        });
      } else {
        setToast({ open: true, message: res.error || 'Failed to place order', severity: 'error' });
      }
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Error placing order', severity: 'error' });
    }
  };

  const handleCallWaiter = async () => {
    if (!table || !restaurantId) return;
    try {
      const res = await qrMenuService.callWaiter({
        tableId: table.id,
        sessionId: session?.id,
        restaurantId
      });
      if (res.success) {
        setToast({
          open: true,
          message: 'Waiter called! Someone will be here shortly.',
          severity: 'success'
        });
      }
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to call waiter', severity: 'error' });
    }
  };

  const handleRequestBill = async () => {
    if (!table || !restaurantId) return;
    try {
      const res = await qrMenuService.requestBill({
        tableId: table.id,
        sessionId: session?.id,
        restaurantId
      });
      if (res.success) {
        setToast({
          open: true,
          message: 'Bill requested! Cashier has been notified.',
          severity: 'success'
        });
      }
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to request bill', severity: 'error' });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!table || !restaurantId) return;
    try {
      const res = await qrMenuService.submitFeedback({
        tableId: table.id,
        rating,
        remarks,
        restaurantId
      });
      if (res.success) {
        setFeedbackOpen(false);
        setRating(5);
        setRemarks('');
        setToast({
          open: true,
          message: 'Thank you for your valuable feedback!',
          severity: 'success'
        });
      }
    } catch (err: any) {
      setToast({ open: true, message: 'Failed to submit feedback', severity: 'error' });
    }
  };

  // Helper to resolve order status to stepper index
  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'SERVED':
      case 'SETTLED':
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress size={50} sx={{ color: branding?.primaryColor || '#6366f1' }} />
        <Typography variant="body1" mt={2} color="textSecondary">
          Loading restaurant menu...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 3 }} onClick={fetchMenuData}>
          Retry
        </Button>
      </Container>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const themeColor = branding?.primaryColor || '#b91c1c'; // Default to a gorgeous restaurant red

  const getCategoryEmoji = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'pizza': return '🍕';
      case 'burgers': case 'burger': return '🍔';
      case 'main course': return '🍲';
      case 'beverages': case 'drinks': return '🥤';
      case 'sides': case 'starters': return '🍟';
      case 'breads': case 'bread': return '🫓';
      case 'desserts': return '🍰';
      default: return '🍽️';
    }
  };

  const isVegProduct = (name: string, description: string) => {
    const keywords = ['chicken', 'mutton', 'fish', 'egg', 'pork', 'beef', 'non-veg', 'meat', 'kebab', 'tikka chicken', 'wings'];
    const text = `${name} ${description}`.toLowerCase();
    return !keywords.some(kw => text.includes(kw));
  };

  return (
    <Box sx={{ pb: 12, bgcolor: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      {/* Branded Premium Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${themeColor} 0%, ${alpha(themeColor, 0.85)} 100%)`,
          color: '#fff',
          pt: 5,
          pb: 6,
          px: 3,
          textAlign: 'center',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          boxShadow: `0 10px 30px ${alpha(themeColor, 0.15)}`,
          position: 'relative'
        }}
      >
        <Typography variant="h4" fontWeight="900" sx={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.5px' }}>
          {branding?.companyName || 'Welcome to our Restaurant'}
        </Typography>
        
        {/* Frozen-glass Table pill */}
        {table && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mt: 1.5,
              px: 2,
              py: 0.5,
              borderRadius: '20px',
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
              📍 {table.name} ({table.section})
            </Typography>
          </Box>
        )}

        {/* Action Quick Bar */}
        <Grid container spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
          <Grid size="auto">
            <Button
              variant="contained"
              size="medium"
              startIcon={<RoomServiceIcon />}
              onClick={handleCallWaiter}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '20px',
                px: 2.5,
                boxShadow: 'none',
                backdropFilter: 'blur(5px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', boxShadow: 'none' }
              }}
            >
              Call Waiter
            </Button>
          </Grid>
          <Grid size="auto">
            <Button
              variant="contained"
              size="medium"
              startIcon={<ReceiptIcon />}
              onClick={handleRequestBill}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '20px',
                px: 2.5,
                boxShadow: 'none',
                backdropFilter: 'blur(5px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', boxShadow: 'none' }
              }}
            >
              Request Bill
            </Button>
          </Grid>
          {activeOrders.length > 0 && (
            <Grid size="auto">
              <Button
                variant="contained"
                size="medium"
                onClick={() => setTrackingOpen(true)}
                sx={{
                  bgcolor: '#10b981',
                  color: '#fff',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: '20px',
                  px: 2.5,
                  boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                  '&:hover': { bgcolor: '#059669', boxShadow: 'none' }
                }}
              >
                Track Orders ({activeOrders.length})
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: -3, px: 2, position: 'relative', zIndex: 5 }}>
        {/* Search Bar Card */}
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', mb: 2 }}>
          <CardContent sx={{ p: '12px !important' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search dishes, drinks, pizzas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: themeColor },
                  '&.Mui-focused fieldset': { borderColor: themeColor }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Categories Tab Pill Bar */}
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 1.2,
            py: 1,
            mb: 2,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Box
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2.5,
                  py: 1,
                  borderRadius: '24px',
                  cursor: 'pointer',
                  border: `1.5px solid ${isSelected ? themeColor : '#e2e8f0'}`,
                  bgcolor: isSelected ? themeColor : '#fff',
                  color: isSelected ? '#fff' : 'text.primary',
                  fontWeight: isSelected ? 'bold' : 500,
                  boxShadow: isSelected ? `0 4px 12px ${alpha(themeColor, 0.25)}` : '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: themeColor,
                    bgcolor: isSelected ? themeColor : alpha(themeColor, 0.03)
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{getCategoryEmoji(cat)}</span>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{cat}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Products Grid */}
        <Grid container spacing={2}>
          {filteredProducts.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1">No matching menu items found.</Typography>
              </Box>
            </Grid>
          ) : (
            filteredProducts.map((product) => {
              const isVeg = isVegProduct(product.name, product.description || '');
              const cartItem = cart.find(item => item.productId === product.id);
              const qty = cartItem ? cartItem.quantity : 0;

              return (
                <Grid size={{ xs: 12 }} key={product.id}>
                  <Card
                    sx={{
                      display: 'flex',
                      borderRadius: 5,
                      boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                      border: '1px solid #f1f5f9',
                      overflow: 'visible',
                      p: 2,
                      bgcolor: '#fff',
                      position: 'relative'
                    }}
                  >
                    {/* Left: Food details */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, pr: 1.5 }}>
                      {/* Veg / Non-Veg Indicator */}
                      <Box
                        sx={{
                          border: `1.5px solid ${isVeg ? '#10b981' : '#ef4444'}`,
                          width: 15,
                          height: 15,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '3px',
                          mb: 1
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: isVeg ? '#10b981' : '#ef4444',
                            width: 7,
                            height: 7,
                            borderRadius: isVeg ? '50%' : '0' // Square for non-veg, dot for veg
                          }}
                        />
                      </Box>

                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1e293b', lineHeight: 1.25 }}>
                        {product.name}
                      </Typography>

                      <Typography variant="body2" fontWeight="800" color="text.primary" sx={{ mt: 0.5, fontSize: '0.95rem' }}>
                        ₹{product.price.toFixed(2)}
                      </Typography>

                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                        {product.description || 'Delicious freshly prepared signature dish.'}
                      </Typography>
                    </Box>

                    {/* Right: Food image + anchored ADD stepper */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {product.imageUrl ? (
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.name}
                          sx={{
                            width: 110,
                            height: 110,
                            borderRadius: 4,
                            objectFit: 'cover',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 110,
                            height: 110,
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${alpha(themeColor, 0.05)} 0%, ${alpha(themeColor, 0.15)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: themeColor,
                            fontSize: '2rem'
                          }}
                        >
                          {getCategoryEmoji(product.category || '')}
                        </Box>
                      )}

                      {/* Overlaid Pill Stepper */}
                      <Box sx={{ position: 'absolute', bottom: -10, zIndex: 10 }}>
                        {qty > 0 ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: '#fff',
                              border: `1.5px solid ${themeColor}`,
                              borderRadius: '8px',
                              height: 30,
                              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => updateCartQty(product.id, -1)}
                              sx={{ color: themeColor, px: 1, py: 0.5 }}
                            >
                              <RemoveIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Typography sx={{ mx: 0.5, fontWeight: 'bold', minWidth: 16, textAlign: 'center', color: '#1e293b' }} variant="body2">
                              {qty}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => addToCart(product)}
                              sx={{ color: themeColor, px: 1, py: 0.5 }}
                            >
                              <AddIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => addToCart(product)}
                            sx={{
                              height: 30,
                              px: 3,
                              borderRadius: '8px',
                              bgcolor: '#fff',
                              color: themeColor,
                              border: `1.5px solid ${alpha(themeColor, 0.3)}`,
                              fontWeight: '900',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                              textTransform: 'none',
                              fontSize: '0.85rem',
                              '&:hover': {
                                bgcolor: alpha(themeColor, 0.03),
                                borderColor: themeColor,
                              }
                            }}
                          >
                            ADD
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 18, right: 16, left: 16, zIndex: 100 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCartOpen(true)}
            sx={{
              borderRadius: '24px',
              py: 1.5,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 10px 30px rgba(16,185,129,0.35)',
              textTransform: 'none',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              px: 3,
              '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', boxShadow: 'none' }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items selected
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              View Cart • ₹{getCartTotal().toFixed(2)}
            </Typography>
          </Button>
        </Box>
      )}

      {/* Cart Dialog Drawer (Zomato Style) */}
      <Dialog fullWidth open={cartOpen} onClose={() => setCartOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 6 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">My Cart Basket</Typography>
          <IconButton onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
          {cart.map((item) => (
            <Card key={item.productId} sx={{ p: 2, mb: 1.5, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight="bold" variant="body1">{item.name}</Typography>
                  <Typography variant="caption" color="textSecondary">₹{item.price.toFixed(2)} each</Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    height: 28
                  }}
                >
                  <IconButton size="small" onClick={() => updateCartQty(item.productId, -1)} sx={{ px: 0.8 }}>
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography sx={{ mx: 0.5, fontWeight: 'bold', fontSize: '0.85rem' }}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => updateCartQty(item.productId, 1)} sx={{ px: 0.8 }}>
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Any special cooking requests?"
            placeholder="E.g., No spicy/no onions, child friendly"
            value={cookingInstruction}
            onChange={(e) => setCookingInstruction(e.target.value)}
            sx={{
              mt: 2.5,
              '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' }
            }}
          />

          <Box display="flex" justifyContent="space-between" sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="bold">Bill Grand Total:</Typography>
            <Typography variant="h6" fontWeight="900" color="text.primary">₹{getCartTotal().toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handlePlaceOrder}
            sx={{
              bgcolor: themeColor,
              py: 1.25,
              borderRadius: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: `0 4px 15px ${alpha(themeColor, 0.3)}`,
              '&:hover': { bgcolor: themeColor }
            }}
          >
            Confirm & Send to Kitchen KOT
          </Button>
        </DialogActions>
      </Dialog>

      {/* Live Order Tracking Modal */}
      <Dialog fullWidth open={trackingOpen} onClose={() => setTrackingOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 6 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Live Order Tracker</Typography>
          <IconButton onClick={() => setTrackingOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 4 }}>
          {activeOrders.length === 0 ? (
            <Typography color="textSecondary" align="center" py={4}>No active orders placed yet.</Typography>
          ) : (
            activeOrders.map((order, idx) => (
              <Box key={order.id} sx={{ mb: 4, pb: 4, borderBottom: idx < activeOrders.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Order #{order.orderNumber}
                  </Typography>
                  <Chip
                    label={order.status}
                    color={order.status === 'SERVED' || order.status === 'SETTLED' ? 'success' : 'primary'}
                    size="small"
                  />
                </Box>

                <Stepper activeStep={getStatusStepIndex(order.status)} alternativeLabel sx={{ mb: 3 }}>
                  <Step>
                    <StepLabel>Sent</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Accepted</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Preparing</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Ready</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Served</StepLabel>
                  </Step>
                </Stepper>

                {order.items.map((item: any) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2">{item.name} x {item.quantity}</Typography>
                    <Typography variant="body2">₹{item.totalPrice.toFixed(2)}</Typography>
                  </Box>
                ))}
              </Box>
            ))
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setFeedbackOpen(true)}
            sx={{ mt: 2, borderColor: themeColor, color: themeColor }}
          >
            Leave Feedback
          </Button>
        </DialogContent>
      </Dialog>

      {/* Name Input Dialog (Session initialization) */}
      <Dialog open={showNamePopup} disableEscapeKeyDown sx={{ '& .MuiDialog-paper': { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Let us know you!</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Please provide your details for KOT ordering and invoice matching.
          </Typography>
          <TextField
            fullWidth
            margin="dense"
            label="Your Name"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Mobile Number (Optional)"
            placeholder="For notifications"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button fullWidth variant="contained" onClick={handleUpdateSessionName} sx={{ bgcolor: themeColor }}>
            Proceed to Menu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rate Your Experience</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            How was your dine-in experience today? Rate us out of 5.
          </Typography>
          <Box display="flex" justifyContent="center" gap={1} mb={3}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton key={star} onClick={() => setRating(star)}>
                <StarIcon sx={{ fontSize: 36, color: star <= rating ? '#fbbf24' : '#d1d5db' }} />
              </IconButton>
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Your Comments"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitFeedback} sx={{ bgcolor: themeColor }}>
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default CustomerMenu;
