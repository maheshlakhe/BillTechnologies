import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  alpha, 
  TextField, 
  InputAdornment, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlayCircleOutline, 
  MenuBook, 
  AutoGraph, 
  Search, 
  HelpOutline, 
  ArrowForward, 
  Computer, 
  Speed, 
  SupportAgent,
  CheckCircle,
  VideoLibrary,
  Terminal,
  Code
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const courses = [
  {
    title: 'Core Billing Flow & Counter Operations',
    description: 'Understand POS cashier workflows, sales checkout logs, invoice generation, dynamic tax adjustments, and thermal print layouts.',
    duration: '15m Tutorial',
    level: 'Interactive',
    category: 'Application Workflows',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#305CDE'
  },
  {
    title: 'Entity-Relationship & Relational ERP Schema',
    description: 'A deep-dive walkthrough of our relational database models, dynamic custom field mappings, and multi-tenant data isolation.',
    duration: '20m Tutorial',
    level: 'Schema Walkthrough',
    category: 'Database & Models',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#10B981'
  },
  {
    title: 'Developer REST API & Token Authorization',
    description: 'Learn how to generate secure API credentials, manage authorization headers, query endpoints, and integrate ERP features programmatically.',
    duration: 'Developer Preview',
    level: 'API Reference',
    category: 'API Integration',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#8B5CF6'
  },
  {
    title: 'Supermarket FastPOS Checkout Hardware',
    description: 'Learn barcode scanner integrations, high-frequency counter setup, digital weighing scales, and dual-customer displays.',
    duration: '12m Tutorial',
    level: 'Hardware Setup',
    category: 'POS Devices',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#EC4899'
  },
  {
    title: 'Multi-Outlet Inventory Sync Mechanics',
    description: 'Walkthrough of central warehouse catalog synchronization, automated inter-outlet stock transfers, and low-stock alert triggers.',
    duration: '18m Tutorial',
    level: 'System Walkthrough',
    category: 'Inventory Controls',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#06B6D4'
  },
  {
    title: 'Webhook Subscriptions & Checkout Triggers',
    description: 'Subscribe to active payment webhooks to stream live counter transactions directly to external business portals and accounting desks.',
    duration: 'Developer Preview',
    level: 'API Reference',
    category: 'API Integration',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    color: '#F59E0B'
  }
];

const faqs = [
  {
    question: "How do we authenticate requests against the BillSoft ERP engine?",
    answer: "API access is secured using 256-bit AES JWT bearer tokens. You can provision API keys directly inside the Developer settings panel of your Admin console."
  },
  {
    question: "Does the API support complex, industry-specific custom fields?",
    answer: "Yes, absolutely! The product and sales response objects dynamically contain `industryFields` representing vertical-specific metadata fields like expiry dates for Pharmacies or vehicle numbers for Garages."
  },
  {
    question: "Can we sync third-party checkouts or offline POS cash counters?",
    answer: "Yes. Our sync endpoints are designed specifically to support batch-syncing sales logs and receipts from legacy terminal nodes directly into the central cloud warehouse."
  }
];

const apiCodeSnippets: Record<string, { code: string; desc: string }> = {
  'GET /products': {
    desc: 'Retrieve a paginated list of tailored products matching your active industry schema with real-time stock counts.',
    code: `{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "prod_8f1a2e3b",
      "name": "Amoxicillin 500mg",
      "sku": "SKU-PHARM-108",
      "price": 149.50,
      "stock": 420,
      "industryFields": {
        "batchNumber": "B-AMX-2026",
        "expiryDate": "2027-12-31",
        "prescriptionRequired": true
      }
    },
    {
      "id": "prod_4c9d8e7a",
      "name": "Premium Brake Pads",
      "sku": "SKU-AUTO-056",
      "price": 2499.00,
      "stock": 15,
      "industryFields": {
        "vehicleModel": "Sedan 2024",
        "warrantyMonths": 24,
        "oemNumber": "OEM-BPD-99"
      }
    }
  ]
}`
  },
  'POST /invoices': {
    desc: 'Programmatically dispatch a fully tax-compliant digital invoice with real-time SGST/CGST split ledger automation.',
    code: `// POST /api/v1/invoices
{
  "customerId": "cust_1a9b8c7d",
  "items": [
    { "productId": "prod_8f1a2e3b", "quantity": 10, "discount": 5.0 }
  ],
  "taxRate": 18.0,
  "paymentMode": "UPI"
}

// Response (201 Created)
{
  "success": true,
  "invoiceNumber": "INV-2026-0042",
  "taxableAmount": 1420.25,
  "gstDetails": {
    "cgst": 127.82,
    "sgst": 127.82,
    "totalGst": 255.64
  },
  "grandTotal": 1675.89,
  "pdfUrl": "https://api.billsoft.com/pdf/INV-2026-0042.pdf"
}`
  },
  'GET /inventory': {
    desc: 'Query multi-outlet primary warehouses, active branch inventory allocations, and stock level thresholds.',
    code: `{
  "success": true,
  "outlets": {
    "warehouse_primary": { "id": "wh_01", "name": "Mumbai HQ", "stockOnHand": 8500 },
    "outlet_suburb": { "id": "wh_02", "name": "Bandra POS Counter", "stockOnHand": 1200 }
  },
  "lowStockAlerts": [
    { "productId": "prod_4c9d8e7a", "sku": "SKU-AUTO-056", "currentStock": 2, "threshold": 5 }
  ]
}`
  }
};

const getCourseIcon = (category: string) => {
  switch (category) {
    case 'Application Workflows': return <MenuBook sx={{ fontSize: 32 }} />;
    case 'Database & Models': return <AutoGraph sx={{ fontSize: 32 }} />;
    case 'API Integration': return <Code sx={{ fontSize: 32 }} />;
    case 'POS Devices': return <Computer sx={{ fontSize: 32 }} />;
    case 'Inventory Controls': return <Speed sx={{ fontSize: 32 }} />;
    default: return <SupportAgent sx={{ fontSize: 32 }} />;
  }
};

const Academy: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /products');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || course.level === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fdfdfd', fontFamily: "'Outfit', sans-serif" }}>
      {/* NAVBAR - Integrated and shared globally */}
      <nav className="navbar navbar-expand-lg" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1080,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 0',
          display: 'block',
          width: '100%'
      }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              {/* Brand/Logo */}
              <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <img src="/Bill (1).svg" alt="BillSoft Logo" style={{ height: '50px', marginRight: '12px' }} />
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000000', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px', display: 'flex' }}>
                      Bill<span style={{ color: '#3157a2' }}>Soft</span>
                  </span>
              </a>

              {/* Desktop Navigation Links */}
              <div className="d-none d-lg-flex" style={{ flexGrow: 1, justifyContent: 'center', gap: '35px' }}>
                  <div 
                      className="dropdown"
                      onMouseEnter={() => setIsSolutionsOpen(true)}
                      onMouseLeave={() => setIsSolutionsOpen(false)}
                      style={{ position: 'relative' }}
                  >
                      <a href="/" className="dropdown-toggle" onClick={(e) => e.preventDefault()} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>
                          Solutions
                      </a>
                      <ul className={`dropdown-menu border-0 shadow-lg p-3 ${isSolutionsOpen ? 'show' : ''}`} style={{ borderRadius: '15px', minWidth: '250px', position: 'absolute', display: isSolutionsOpen ? 'block' : 'none', top: '100%', left: 0 }}>
                          <li><h6 className="dropdown-header text-primary fw-bold">By Industry</h6></li>
                          <li><a className="dropdown-item py-2" href="/" onClick={(e) => { e.preventDefault(); navigate('/industry/retail'); }}>Retail & Supermarket</a></li>
                          <li><a className="dropdown-item py-2" href="/" onClick={(e) => { e.preventDefault(); navigate('/industry/restaurant'); }}>Restaurant & Cafe</a></li>
                          <li><a className="dropdown-item py-2" href="/" onClick={(e) => { e.preventDefault(); navigate('/industry/pharmacy'); }}>Pharmacy & Healthcare</a></li>
                          <li><a className="dropdown-item py-2" href="/" onClick={(e) => { e.preventDefault(); navigate('/industry/automobile'); }}>Automobile & Garage</a></li>
                          <li><a className="dropdown-item py-2" href="/" onClick={(e) => { e.preventDefault(); navigate('/industry/textile'); }}>Textile & Apparel</a></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><a className="dropdown-item py-2 fw-bold text-primary" href="/industry" onClick={(e) => { e.preventDefault(); navigate('/industry'); }}>View All 21 Industries</a></li>
                      </ul>
                  </div>
                  <a href="/#about" onClick={(e) => { e.preventDefault(); navigate('/#about'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>About</a>
                  <a href="/#features" onClick={(e) => { e.preventDefault(); navigate('/#features'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Features</a>
                  <a href="/#pricing" onClick={(e) => { e.preventDefault(); navigate('/#pricing'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Pricing</a>
                  <a href="/academy" onClick={(e) => { e.preventDefault(); navigate('/academy'); }} style={{ textDecoration: 'none', color: '#3157a2', fontWeight: 700, fontSize: '15px' }}>Academy</a>
                  <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-headset"></i> Support
                  </a>
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center" style={{ gap: '15px' }}>
                  {user ? (
                      <button
                          className="btn"
                          style={{
                              borderRadius: '50px',
                              background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 28px',
                              fontWeight: 700,
                              fontSize: '15px',
                              boxShadow: '0 4px 12px rgba(49, 87, 162, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                          }}
                          onClick={() => navigate(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard')}
                      >
                          <i className="bi bi-speedometer2"></i> Dashboard
                      </button>
                  ) : (
                      <>
                          <button
                              className="btn"
                              style={{
                                  borderRadius: '50px',
                                  border: '1.5px solid #3157a2',
                                  color: '#3157a2',
                                  padding: '8px 24px',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  backgroundColor: 'transparent'
                              }}
                              onClick={() => navigate('/login')}
                          >
                              Sign In
                          </button>
                          <button
                              className="btn"
                              style={{
                                  borderRadius: '50px',
                                  background: '#3157a2',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '8px 28px',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  boxShadow: '0 4px 12px rgba(49, 87, 162, 0.2)'
                              }}
                              onClick={() => navigate('/signup')}
                          >
                              Try Now
                          </button>
                      </>
                  )}
                  {/* Mobile Toggle */}
                  <button
                      className="btn d-lg-none ms-2 p-1"
                      onClick={() => setIsMobileMenuOpen(true)}
                      aria-label="Open mobile menu"
                      style={{ color: '#3157a2', backgroundColor: 'transparent', border: 'none' }}
                  >
                      <i className="bi bi-list fs-1"></i>
                  </button>
              </div>
          </div>
      </nav>

      {/* Premium Hero Section */}
      <Box sx={{ 
        bgcolor: '#0f172a', 
        color: 'white', 
        py: { xs: 8, md: 12 }, 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: "url('/Untitled design (2).svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.85) 50%, rgba(49,87,162,0.7) 100%)',
          backdropFilter: 'blur(4px)',
          zIndex: 1
        }
      }}>
        {/* Neon Aura Blob */}
        <Box sx={{
          position: 'absolute',
          top: -150,
          left: '25%',
          width: 500,
          height: 500,
          bgcolor: alpha('#00dfd8', 0.15),
          filter: 'blur(120px)',
          borderRadius: '50%',
          zIndex: 1
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1, 
            px: 3, 
            py: 1, 
            borderRadius: 20, 
            bgcolor: 'rgba(255,255,255,0.08)', 
            border: '1px solid rgba(255,255,255,0.18)', 
            mb: 4 
          }}>
            <Terminal sx={{ fontSize: 16, color: '#00dfd8' }} />
            <Typography variant="overline" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 1.5, lineHeight: 1 }}>
              Developer & Integration Center
            </Typography>
          </Box>

          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              mb: 3, 
              fontFamily: "'Outfit', sans-serif",
              fontSize: { xs: '2.5rem', md: '3.8rem' },
              lineHeight: 1.15,
              letterSpacing: '-1.5px'
            }}
          >
            Understand the Architecture. <br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #00dfd8 0%, #3bbbff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Integrate the BillSoft Engine.
            </Box>
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              mb: 5, 
              fontWeight: 400, 
              lineHeight: 1.7,
              maxWidth: '650px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}
          >
            Explore core application walkthroughs, technical database schema deep-dives, and learn how to programmatically execute billing triggers with our robust upcoming REST API.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => {
                const element = document.getElementById('featured-tutorials');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ 
                bgcolor: '#00dfd8', 
                color: '#0f172a', 
                fontWeight: 800, 
                px: 5, 
                py: 2, 
                borderRadius: 10,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0, 223, 216, 0.3)',
                '&:hover': { bgcolor: '#00c4bd' }
              }}
            >
              System Tutorials
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => {
                const element = document.getElementById('api-playground');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)', 
                color: '#fff', 
                fontWeight: 700, 
                px: 5, 
                py: 2, 
                borderRadius: 10,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }
              }}
            >
              Developer REST API
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Developer API Playground Section */}
      <Box id="api-playground" sx={{ bgcolor: '#0b0f19', py: 10, borderBottom: '1px solid #1e293b' }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1, 
                px: 2, 
                py: 0.5, 
                borderRadius: 20, 
                bgcolor: 'rgba(0, 223, 216, 0.1)', 
                border: '1px solid rgba(0, 223, 216, 0.2)', 
                mb: 3 
              }}>
                <Code sx={{ fontSize: 14, color: '#00dfd8' }} />
                <Typography variant="overline" sx={{ color: '#00dfd8', fontWeight: 800, letterSpacing: 1.5, lineHeight: 1 }}>
                  Live API Previewer
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 2, letterSpacing: '-0.8px', fontFamily: "'Outfit', sans-serif" }}>
                Integrate Our Complex Relational Database
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', mb: 5, lineHeight: 1.7 }}>
                BillSoft has constructed a dynamic industry-agnostic schema engine. Provision tokens to directly inject new sales counters, pull inventory batches, or record compliance tallies programmatically.
              </Typography>

              {/* Endpoint selection tabs */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.keys(apiCodeSnippets).map((endpoint) => (
                  <Button
                    key={endpoint}
                    variant="contained"
                    onClick={() => setSelectedEndpoint(endpoint)}
                    sx={{
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      textAlign: 'left',
                      px: 3,
                      py: 2,
                      borderRadius: 4,
                      textTransform: 'none',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: selectedEndpoint === endpoint ? '#00dfd8' : 'rgba(255,255,255,0.08)',
                      bgcolor: selectedEndpoint === endpoint ? 'rgba(0, 223, 216, 0.08)' : 'rgba(255,255,255,0.02)',
                      color: selectedEndpoint === endpoint ? '#00dfd8' : '#cbd5e1',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderColor: selectedEndpoint === endpoint ? '#00dfd8' : 'rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    <Box component="span" sx={{ 
                      color: endpoint.startsWith('GET') ? '#10b981' : '#8b5cf6', 
                      mr: 2,
                      fontWeight: 900
                    }}>
                      {endpoint.split(' ')[0]}
                    </Box>
                    {endpoint.split(' ')[1]}
                  </Button>
                ))}
              </Box>
            </Grid>

            {/* Dark Interactive Terminal Preview */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ 
                bgcolor: '#030712', 
                borderRadius: 5, 
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden'
              }}>
                {/* Window header */}
                <Box sx={{ 
                  bgcolor: '#0f172a', 
                  px: 3, 
                  py: 1.8, 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
                    response_payload.json
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, fontStyle: 'italic' }}>
                    {"// "}{apiCodeSnippets[selectedEndpoint].desc}
                  </Typography>
                  <Box sx={{ 
                    bgcolor: '#0c101d', 
                    p: 2.5, 
                    borderRadius: 3, 
                    overflowX: 'auto',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <pre style={{ margin: 0, color: '#a7f3d0', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {apiCodeSnippets[selectedEndpoint].code}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tutorials Search and Filter Hub */}
      <Container id="featured-tutorials" maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.8px', fontFamily: "'Outfit', sans-serif" }}>
            Application & Schema Walkthroughs
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px', mb: 4 }}>
            Detailed, architectural video guides helping you master both counter layouts and REST API calls.
          </Typography>

          {/* Search and Filters */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2, 
            width: '100%', 
            maxWidth: '850px',
            bgcolor: 'background.paper',
            p: 1.5,
            borderRadius: 5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <TextField 
              placeholder="Search by topic, database model, or workflow..."
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: 'none',
                  '& fieldset': { border: 'none' }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: { xs: 1, md: 0 }, minWidth: { md: '360px' }, alignItems: 'center' }}>
              {['All', 'Interactive', 'Schema Walkthrough', 'API Reference'].map((level) => (
                <Button 
                  key={level}
                  variant={activeFilter === level ? 'contained' : 'text'}
                  onClick={() => setActiveFilter(level)}
                  sx={{ 
                    borderRadius: 3, 
                    px: 2.5, 
                    py: 1, 
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: activeFilter === level ? '#3157a2' : 'transparent',
                    color: activeFilter === level ? '#fff' : 'text.secondary',
                    '&:hover': {
                      bgcolor: activeFilter === level ? '#1e3a8a' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Dynamic Card Grid */}
        <Grid container spacing={4}>
          {filteredCourses.map((course, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: 5,
                boxShadow: '0 12px 30px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(49, 87, 162, 0.08)',
                  borderColor: alpha(course.color, 0.3),
                  '& .course-play-icon': {
                    transform: 'scale(1.1)',
                    color: course.color
                  }
                }
              }}>
                <Box sx={{ 
                  bgcolor: alpha(course.color, 0.08), 
                  py: 4, 
                  px: 3,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(0,0,0,0.02)'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: 56, 
                    height: 56, 
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    color: course.color,
                    boxShadow: '0 6px 15px rgba(0,0,0,0.04)'
                  }}>
                    {getCourseIcon(course.category)}
                  </Box>
                  <Chip 
                    label={course.category} 
                    size="small"
                    sx={{ 
                      fontWeight: 800, 
                      fontSize: '0.68rem', 
                      bgcolor: course.color, 
                      color: '#fff',
                      px: 0.5
                    }} 
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3.5, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 800, 
                        color: course.color, 
                        bgcolor: alpha(course.color, 0.12), 
                        px: 1.8, 
                        py: 0.5, 
                        borderRadius: 2,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {course.level}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      ⏱ {course.duration}
                    </Typography>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', color: '#1e293b' }}>
                    {course.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3, flexGrow: 1 }}>
                    {course.description}
                  </Typography>

                  <Box sx={{ pt: 2, borderTop: '1px solid rgba(0,0,0,0.05)', mt: 'auto' }}>
                    <Button 
                      variant="text" 
                      onClick={() => setActiveVideo(course.videoUrl)}
                      startIcon={<PlayCircleOutline className="course-play-icon" sx={{ transition: 'all 0.2s ease-in-out' }} />} 
                      sx={{ 
                        fontWeight: 800, 
                        p: 0, 
                        color: '#1e293b', 
                        textTransform: 'none',
                        '&:hover': { color: course.color, backgroundColor: 'transparent' }
                      }}
                    >
                      Play Video Walkthrough
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredCourses.length === 0 && (
            <Grid size={{ xs: 12 }} sx={{ textAlign: 'center', py: 6 }}>
              <HelpOutline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">No walkthroughs found</Typography>
              <Typography variant="body2" color="text.secondary">Try searching another keyword or clearing the filters.</Typography>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Architectural & Integration FAQ */}
      <Box sx={{ bgcolor: '#f8fafc', py: 10, borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.8px', fontFamily: "'Outfit', sans-serif" }}>
            Integration & Schema FAQ
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: 'text.secondary', mb: 6 }}>
            Understanding developer configurations and low-level data structure triggers.
          </Typography>

          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid size={{ xs: 12 }} key={index}>
                <Card sx={{ 
                  borderRadius: 4, 
                  boxShadow: 'none', 
                  border: '1px solid #e2e8f0', 
                  p: 3 
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <CheckCircle sx={{ color: '#3157a2', mt: 0.3 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                        {faq.question}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {faq.answer}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Breathtaking Call to Action */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#fff',
          borderRadius: 6,
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)'
        }}>
          {/* Cyan Blob */}
          <Box sx={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 300,
            height: 300,
            bgcolor: alpha('#00dfd8', 0.1),
            filter: 'blur(80px)',
            borderRadius: '50%'
          }} />

          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.8px' }}>
            Ready to integrate the core ERP engine?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, fontWeight: 400, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Set up your developer API tokens, review relational field mappings, and stream transaction tallies instantly.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/signup')}
              sx={{ 
                bgcolor: '#00dfd8', 
                color: '#0f172a', 
                fontWeight: 800, 
                px: 5, 
                py: 2, 
                borderRadius: 10,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0, 223, 216, 0.3)',
                '&:hover': { bgcolor: '#00c4bd' }
              }}
            >
              Sign Up For Dev Sandbox <ArrowForward sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Card>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#0f172a', py: 6, color: 'white', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px' }}>BillSoft DevHub & Tutorials</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
            Elevating retail intelligence through high-performance REST APIs and real-time database schema sync.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block' }}>
            © 2026 BillSoft Technologies. All rights reserved. Registered trademark of AGB Technologies.
          </Typography>
        </Container>
      </Box>

      {/* Interactive Video Player Dialog */}
      <Dialog 
        open={!!activeVideo} 
        onClose={() => setActiveVideo(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#0f172a', 
          color: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 3,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibrary sx={{ color: '#00dfd8' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
              BillSoft Video Guide
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveVideo(null)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {activeVideo && (
            <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', flexGrow: 1 }}>
              <iframe
                src={activeVideo}
                title="BillSoft Academy Training Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Menu Backdrop */}
      <div 
          className={`landing-mobile-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Premium Mobile Menu Drawer */}
      <div className={`landing-mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="drawer-header">
              <img src="/Bill (1).svg" alt="BillSoft Logo" style={{ height: '40px' }} />
              <button className="close-drawer" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="bi bi-x-lg"></i>
              </button>
          </div>
          <div className="drawer-body">
              <a href="/#hero" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="/#about" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
              <a href="/#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="/#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
              <a href="/academy" onClick={() => setIsMobileMenuOpen(false)}>Academy</a>
              <hr />
              <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); setIsMobileMenuOpen(false); }}>Support Hub</a>
              <div className="mt-auto pt-4">
                  <button className="btn btn-try-now w-100 py-3" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Try BillSoft For Free</button>
              </div>
          </div>
      </div>
    </Box>
  );
};

export default Academy;
