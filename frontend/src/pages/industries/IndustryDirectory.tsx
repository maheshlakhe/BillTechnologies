import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    InputAdornment, 
    Tab, 
    Tabs, 
    Card, 
    CardContent, 
    Button, 
    Chip, 
    Divider, 
    IconButton,
    Paper,
    Grow
} from '@mui/material';
import { 
    Search as SearchIcon, 
    ArrowForward, 
    Storefront,
    LocalPharmacy,
    DirectionsCar,
    Devices,
    HealthAndSafety,
    School,
    HomeWork,
    LocalShipping,
    PrecisionManufacturing,
    Hotel,
    Checkroom,
    ShoppingBasket,
    Diamond,
    Engineering,
    LocalGroceryStore,
    FitnessCenter,
    ContentCut,
    Handyman,
    Chair,
    Smartphone,
    HelpOutline,
    Print as PrintIcon,
    DoubleArrow
} from '@mui/icons-material';
import { INDUSTRIES, IndustryConfig } from '../../constants/industries';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/landing.css';

// Icon Renderer Mapper
const renderIndustryIcon = (iconName: string, sxProps = {}) => {
    const map: Record<string, React.ComponentType<any>> = {
        Restaurant: ContentCut,
        LocalPharmacy,
        DirectionsCar,
        Storefront,
        Devices,
        HealthAndSafety,
        School,
        HomeWork,
        LocalShipping,
        PrecisionManufacturing,
        Hotel,
        Checkroom,
        ShoppingBasket,
        Diamond,
        Engineering,
        LocalGroceryStore,
        FitnessCenter,
        ContentCut,
        Handyman,
        Chair,
        Smartphone
    };
    const Component = map[iconName] || HelpOutline;
    return <Component sx={sxProps} />;
};

// Sector definitions
const SECTORS = [
    { value: 'all', label: 'All 21 Industries' },
    { value: 'retail', label: 'Retail & Goods' },
    { value: 'services', label: 'Food & Services' },
    { value: 'specialized', label: 'Tech & Manufacturing' },
    { value: 'professional', label: 'Health & Professional' }
];

export const IndustryDirectory: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Header dropdown / drawer states
    const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSector, setActiveSector] = useState('all');
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryConfig>(
        INDUSTRIES.find(i => i.slug === 'retail') || INDUSTRIES[0]
    );

    // Map industry to sector helper
    const getIndustrySector = (slug: string): string => {
        const retailSlugs = ['retail', 'fmcg', 'jewellery', 'grocery', 'mobile-shop'];
        const serviceSlugs = ['restaurant', 'hospitality', 'salon', 'gym', 'services'];
        const techSlugs = ['electronics', 'manufacturing', 'logistics', 'hardware', 'furniture', 'automobile'];
        const professionalSlugs = ['pharmacy', 'healthcare', 'education', 'real-estate'];
        
        if (retailSlugs.includes(slug)) return 'retail';
        if (serviceSlugs.includes(slug)) return 'services';
        if (techSlugs.includes(slug)) return 'specialized';
        if (professionalSlugs.includes(slug)) return 'professional';
        return 'retail';
    };

    // Filtered lists
    const filteredIndustries = useMemo(() => {
        return INDUSTRIES.filter(i => {
            const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  i.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const sector = getIndustrySector(i.slug);
            const matchesSector = activeSector === 'all' || sector === activeSector;
            
            return matchesSearch && matchesSector;
        });
    }, [searchQuery, activeSector]);

    // Simulated invoice values depending on industry type
    const simulatedInvoice = useMemo(() => {
        const ind = selectedIndustry;
        const baseItems = [
            { name: `${ind.name} Core Package`, qty: 1, price: 1250.00, tax: 18 },
            { name: `${ind.name} Auxiliary Option`, qty: 2, price: 420.00, tax: 18 }
        ];

        let specificItems = [...baseItems];
        let dynamicValues: Record<string, string> = {};

        if (ind.slug === 'restaurant') {
            specificItems = [
                { name: 'Veg Schezwan Noodles', qty: 2, price: 180.00, tax: 5 },
                { name: 'Paneer Butter Masala', qty: 1, price: 240.00, tax: 5 },
                { name: 'Butter Naan', qty: 4, price: 40.00, tax: 5 }
            ];
            dynamicValues = { 'table_no': 'Table #12', 'waiter_name': 'Rohan K.' };
        } else if (ind.slug === 'pharmacy') {
            specificItems = [
                { name: 'Amoxicillin 500mg (Batch AX-92)', qty: 1, price: 142.00, tax: 12 },
                { name: 'Paracetamol 650mg (Batch PC-40)', qty: 3, price: 28.50, tax: 12 }
            ];
            dynamicValues = { 'prescription_required': 'Yes (Verified)', 'drug_license_no': 'DL-20839/21' };
        } else if (ind.slug === 'automobile') {
            specificItems = [
                { name: 'Synthetic Engine Oil 4L', qty: 1, price: 3200.00, tax: 18 },
                { name: 'Oil Filter Replacement', qty: 1, price: 650.00, tax: 18 },
                { name: 'Front Brake Pad Kit', qty: 1, price: 1850.00, tax: 18 }
            ];
            dynamicValues = { 'engine_no': 'E3G8B9201', 'chassis_no': 'C4D7E2091A' };
        } else if (ind.slug === 'mobile-shop') {
            specificItems = [
                { name: 'SmartPhone X10 (8GB/256GB)', qty: 1, price: 24999.00, tax: 18 },
                { name: 'Tempered Glass Shield', qty: 1, price: 299.00, tax: 18 }
            ];
            dynamicValues = { 'imei_no': '869201948201948' };
        } else if (ind.slug === 'jewellery') {
            specificItems = [
                { name: '22K Gold Chain (6.4g)', qty: 1, price: 46200.00, tax: 3 },
                { name: 'Making Charges', qty: 1, price: 3800.00, tax: 18 }
            ];
            dynamicValues = { 'gold_rate': '₹7,210/g', 'purity': '91.6% Hallmark' };
        } else if (ind.slug === 'textile') {
            specificItems = [
                { name: 'Slim Fit Cotton Shirt (Blue - L)', qty: 2, price: 1199.00, tax: 5 },
                { name: 'Premium Denim Jeans (32)', qty: 1, price: 2499.00, tax: 12 }
            ];
            dynamicValues = { 'fabric_type': '100% Pure Cotton', 'size_chart': 'Standard Men L' };
        }

        const subtotal = specificItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
        const taxAmount = specificItems.reduce((acc, item) => acc + (item.qty * item.price * (item.tax / 100)), 0);
        const total = subtotal + taxAmount;

        return { items: specificItems, subtotal, taxAmount, total, dynamicValues };
    }, [selectedIndustry]);

    return (
        <Box sx={{ bgcolor: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            {/* NAVBAR - Replicated Shared Visuals */}
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
                            <a href="/" className="dropdown-toggle" onClick={(e) => e.preventDefault()} style={{ textDecoration: 'none', color: '#3157a2', fontWeight: 700, fontSize: '15px' }}>
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
                                <li><a className="dropdown-item py-2 fw-bold text-primary active" href="/industry" onClick={(e) => { e.preventDefault(); navigate('/industry'); }}>View All 21 Industries</a></li>
                            </ul>
                        </div>
                        <a href="/#about" onClick={(e) => { e.preventDefault(); navigate('/#about'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>About</a>
                        <a href="/#features" onClick={(e) => { e.preventDefault(); navigate('/#features'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Features</a>
                        <a href="/#pricing" onClick={(e) => { e.preventDefault(); navigate('/#pricing'); }} style={{ textDecoration: 'none', color: '#000', fontWeight: 700, fontSize: '15px' }}>Pricing</a>

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
                                <button onClick={() => navigate('/login')} className="btn btn-link text-decoration-none text-dark fw-bold pe-2" style={{ fontSize: '15px' }}>Log In</button>
                                <button
                                    className="btn d-none d-sm-block"
                                    style={{
                                        borderRadius: '50px',
                                        background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '8px 28px',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        boxShadow: '0 4px 12px rgba(49, 87, 162, 0.3)'
                                    }}
                                    onClick={() => navigate('/signup')}
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                        <button 
                            className="btn d-lg-none p-1" 
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Toggle Navigation"
                        >
                            <i className="bi bi-list fs-2 text-dark"></i>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Soft Ambient Background Aesthetics */}
            <Box sx={{ position: 'absolute', top: '15%', left: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(49,87,162,0.04) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(85px)', pointerEvents: 'none', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', top: '45%', right: '2%', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${selectedIndustry.themeColor}05 0%, rgba(0,0,0,0) 70%)`, filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ pt: 10, pb: 6, position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Chip 
                        label="Unified Industry Master Framework" 
                        color="primary"
                        sx={{ 
                            letterSpacing: 2, 
                            fontWeight: 800, 
                            bgcolor: 'rgba(49, 87, 162, 0.08)',
                            color: '#3157a2',
                            mb: 3,
                            px: 1,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem'
                        }}
                    />
                    <Typography 
                        variant="h1" 
                        sx={{ 
                            fontSize: { xs: '2.5rem', md: '4rem' }, 
                            fontWeight: 900, 
                            lineHeight: 1.1, 
                            mb: 2.5,
                            color: '#0f172a',
                            letterSpacing: -1
                        }}
                    >
                        Specialized cloud engines for 21 verticals.
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#475569', 
                            maxWidth: '780px', 
                            mx: 'auto', 
                            lineHeight: 1.6, 
                            fontWeight: 400 
                        }}
                    >
                        Click any industry block below to see its customized POS invoice model, unique database tags, and custom settings immediately simulated in real-time.
                    </Typography>
                </Box>

                {/* Live Sandbox Simulator Showcase */}
                <Card 
                    sx={{ 
                        borderRadius: '24px', 
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
                        overflow: 'hidden',
                        mb: 10
                    }}
                >
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' } }}>
                        {/* Simulation Workspace Panel */}
                        <Box sx={{ p: { xs: 4, md: 5 }, borderRight: '1px solid #f1f5f9' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
                                <Box sx={{ 
                                    p: 1.5, 
                                    borderRadius: '16px', 
                                    bgcolor: `${selectedIndustry.themeColor}12`, 
                                    color: selectedIndustry.themeColor,
                                    border: `1px solid ${selectedIndustry.themeColor}20`,
                                    display: 'flex'
                                }}>
                                    {renderIndustryIcon(selectedIndustry.icon, { fontSize: 32 })}
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: -0.5, color: '#0f172a' }}>{selectedIndustry.name} Hub</Typography>
                                        <Chip 
                                            label={selectedIndustry.billSize + ' Print'} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: '#f1f5f9', 
                                                color: '#475569', 
                                                fontWeight: 700,
                                                border: '1px solid #e2e8f0'
                                            }} 
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>{selectedIndustry.description}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: '#f1f5f9', my: 3 }} />

                            {/* Features Spec List */}
                            <Typography variant="subtitle2" sx={{ color: '#3157a2', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: 1.5, fontSize: '0.75rem' }}>
                                Core Operational Workflows
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
                                {selectedIndustry.features.map((feat, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: selectedIndustry.themeColor }} />
                                        <Typography variant="body2" fontWeight="700" sx={{ color: '#334155' }}>{feat}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Schema Attributes and Custom Input Fields */}
                            <Typography variant="subtitle2" sx={{ color: '#3157a2', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: 1.5, fontSize: '0.75rem' }}>
                                Custom Data Engine Mappings (Prisma Schema Relational fields)
                            </Typography>
                            {selectedIndustry.dynamicFields && selectedIndustry.dynamicFields.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                                    {selectedIndustry.dynamicFields.map((field, idx) => (
                                        <Paper 
                                            key={idx}
                                            variant="outlined" 
                                            sx={{ 
                                                p: 2, 
                                                borderRadius: '12px', 
                                                bgcolor: '#f8fafc', 
                                                borderColor: '#e2e8f0',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#1e293b' }}>{field.label}</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>Database field: <code>{field.name}</code></Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip label={field.dataType.toUpperCase()} size="small" variant="outlined" sx={{ color: '#475569', borderColor: '#cbd5e1' }} />
                                                {field.required && (
                                                    <Chip label="Required" size="small" color="error" variant="outlined" />
                                                )}
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 4, fontStyle: 'italic' }}>
                                    Uses standard relational unified model (No specialized columns required)
                                </Typography>
                            )}

                            {/* Core Action Mappings */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/industry/${selectedIndustry.slug}`)}
                                    style={{ 
                                        backgroundColor: selectedIndustry.themeColor, 
                                        borderColor: selectedIndustry.themeColor,
                                        color: 'white',
                                        fontWeight: 800,
                                        padding: '12px 30px',
                                        borderRadius: '30px',
                                        border: 'none',
                                        boxShadow: `0 4px 14px ${selectedIndustry.themeColor}30`
                                    }}
                                >
                                    Explore Detailed Portal
                                </button>
                                <button 
                                    className="btn btn-outline-dark"
                                    onClick={() => {
                                        const demoEmail = `support_${selectedIndustry.slug.replace(/-/g, '_')}@agbtechnologies.com`;
                                        navigate(`/login?email=${demoEmail}&password=Shubham@143`);
                                    }}
                                    style={{ 
                                        borderColor: '#cbd5e1',
                                        color: '#334155',
                                        fontWeight: 700,
                                        padding: '12px 30px',
                                        borderRadius: '30px',
                                        background: 'transparent'
                                    }}
                                >
                                    Login to {selectedIndustry.name} Sandbox
                                </button>
                            </Box>
                        </Box>

                        {/* Interactive Digital Invoice Simulator */}
                        <Box sx={{ p: { xs: 4, md: 5 }, bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #f1f5f9' }}>
                            <Box sx={{ width: '100%', maxWidth: '380px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.75rem' }}>LIVE INVOICE SIMULATION</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PrintIcon sx={{ color: '#64748b', fontSize: 16 }} />
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>{selectedIndustry.billSize}</Typography>
                                    </Box>
                                </Box>

                                {/* Mock Receipt Wrapper */}
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 3, 
                                        bgcolor: '#ffffff', 
                                        color: '#0f172a', 
                                        fontFamily: 'monospace',
                                        fontSize: '11px',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    {/* Header */}
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 900, fontFamily: 'monospace', textTransform: 'uppercase' }}>
                                            {selectedIndustry.name.toUpperCase()} SHREE
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                                            102, Business Arcade, Delhi<br/>
                                            GSTIN: 07AAAAA0000A1Z5
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#cbd5e1' }} />

                                    {/* Bill info */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Bill No: INV-SIM-2931</span>
                                            <span>Date: 17-May-2026</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Cust: Walk-In Client</span>
                                            <span>Type: RETAIL SALE</span>
                                        </Box>

                                        {/* Render specialized dynamic custom fields */}
                                        {Object.entries(simulatedInvoice.dynamicValues).map(([key, val]) => {
                                            const fieldLabel = selectedIndustry.dynamicFields?.find(f => f.name === key)?.label || key;
                                            return (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: selectedIndustry.themeColor, fontWeight: 'bold' }} key={key}>
                                                    <span>{fieldLabel}:</span>
                                                    <span>{val}</span>
                                                </Box>
                                            );
                                        })}
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#cbd5e1' }} />

                                    {/* Items Table */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontWeight: 900, mb: 0.5 }}>
                                            <span>Item</span>
                                            <span style={{ textAlign: 'right' }}>Qty</span>
                                            <span style={{ textAlign: 'right' }}>Price</span>
                                            <span style={{ textAlign: 'right' }}>Total</span>
                                        </Box>
                                        {simulatedInvoice.items.map((item, idx) => (
                                            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', mb: 0.5 }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                                <span style={{ textAlign: 'right' }}>{item.qty}</span>
                                                <span style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</span>
                                                <span style={{ textAlign: 'right' }}>{(item.qty * item.price).toFixed(2)}</span>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#cbd5e1' }} />

                                    {/* Totals */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end', fontWeight: 900 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <span>Subtotal:</span>
                                            <span>₹{simulatedInvoice.subtotal.toFixed(2)}</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, color: '#64748b' }}>
                                            <span>GST Amt:</span>
                                            <span>₹{simulatedInvoice.taxAmount.toFixed(2)}</span>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2, fontSize: '12px', borderTop: '1px solid #e2e8f0', pt: 0.5, mt: 0.5 }}>
                                            <span>GRAND TOTAL:</span>
                                            <span style={{ color: selectedIndustry.themeColor }}>₹{simulatedInvoice.total.toFixed(2)}</span>
                                        </Box>
                                    </Box>

                                    {/* Footer */}
                                    <Box sx={{ textAlign: 'center', mt: 3, fontSize: '9px', color: '#64748b' }}>
                                        Thank you! Visit Again.<br/>
                                        Powered by BillSoft ERP Cloud.
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                </Card>

                <Divider sx={{ borderColor: '#e2e8f0', mb: 8 }} />

                {/* Filter / Search Bar */}
                <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Tabs 
                        value={activeSector} 
                        onChange={(e, val) => setActiveSector(val)}
                        sx={{ 
                            '& .MuiTabs-indicator': { bgcolor: '#3157a2', height: '3px' },
                            '& .MuiTab-root': { 
                                color: '#64748b', 
                                fontWeight: 700, 
                                textTransform: 'none', 
                                fontSize: '1rem',
                                '&.Mui-selected': { color: '#0f172a' }
                            }
                        }}
                    >
                        {SECTORS.map(sec => (
                            <Tab key={sec.value} value={sec.value} label={sec.label} />
                        ))}
                    </Tabs>

                    <TextField 
                        variant="outlined" 
                        size="small" 
                        placeholder="Search industries, features, fields..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ 
                            width: { xs: '100%', md: '350px' },
                            '& .MuiOutlinedInput-root': {
                                bgcolor: '#ffffff',
                                borderRadius: '30px',
                                border: '1px solid #cbd5e1',
                                color: '#0f172a',
                                '& fieldset': { border: 'none' },
                                '&:hover': { border: '1px solid #94a3b8' },
                                '&.Mui-focused': { border: '1px solid #3157a2' }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: '#64748b' }} />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                {/* Grid List */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4.5 }}>
                    {filteredIndustries.map((ind) => {
                        const isSelected = selectedIndustry.slug === ind.slug;
                        
                        return (
                            <Grow in={true} key={ind.slug}>
                                <Card 
                                    onClick={() => setSelectedIndustry(ind)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        borderRadius: '20px',
                                        border: `1px solid ${isSelected ? ind.themeColor : '#e2e8f0'}`,
                                        background: '#ffffff',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isSelected 
                                            ? `0 10px 30px ${ind.themeColor}10` 
                                            : '0 4px 20px rgba(0,0,0,0.02)',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            borderColor: ind.themeColor,
                                            boxShadow: `0 15px 40px ${ind.themeColor}12`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        {/* Top Header Card */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Box sx={{ 
                                                p: 1.5, 
                                                borderRadius: '12px', 
                                                bgcolor: `${ind.themeColor}12`, 
                                                color: ind.themeColor,
                                                border: `1px solid ${ind.themeColor}20`,
                                                display: 'flex'
                                            }}>
                                                {renderIndustryIcon(ind.icon, { fontSize: 24 })}
                                            </Box>
                                            <Chip 
                                                label={ind.billSize} 
                                                size="small" 
                                                sx={{ 
                                                    fontSize: '10px', 
                                                    bgcolor: '#f1f5f9', 
                                                    color: '#475569', 
                                                    fontWeight: 700 
                                                }} 
                                            />
                                        </Box>

                                        <Typography variant="h5" fontWeight="800" sx={{ mb: 1.5, letterSpacing: -0.5, color: '#0f172a' }}>
                                            {ind.name}
                                        </Typography>
                                        
                                        <Typography variant="body2" sx={{ color: '#475569', mb: 3, flexGrow: 1, lineHeight: 1.5 }}>
                                            {ind.description}
                                        </Typography>

                                        <Divider sx={{ borderColor: '#f1f5f9', my: 2 }} />

                                        {/* Featured Chips */}
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                            {ind.features.slice(0, 2).map((feat, fIdx) => (
                                                <Chip 
                                                    key={fIdx} 
                                                    label={feat} 
                                                    size="small" 
                                                    sx={{ 
                                                        fontSize: '10px', 
                                                        bgcolor: '#f8fafc', 
                                                        color: '#475569',
                                                        border: '1px solid #cbd5e1'
                                                    }} 
                                                />
                                            ))}
                                            {ind.features.length > 2 && (
                                                <Chip 
                                                    label={`+${ind.features.length - 2} more`} 
                                                    size="small" 
                                                    sx={{ fontSize: '10px', bgcolor: 'transparent', color: ind.themeColor }} 
                                                />
                                            )}
                                        </Box>

                                        {/* Bottom Action Arrows */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                fontWeight="800" 
                                                sx={{ 
                                                    color: isSelected ? ind.themeColor : '#64748b', 
                                                    transition: 'color 0.2s', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 0.5 
                                                }}
                                            >
                                                {isSelected ? 'Currently Selected' : 'Simulate Workspace'}
                                                {isSelected && <DoubleArrow sx={{ fontSize: 14 }} />}
                                            </Typography>
                                            
                                            <IconButton 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/industry/${ind.slug}`);
                                                }}
                                                sx={{ 
                                                    bgcolor: '#f1f5f9', 
                                                    color: ind.themeColor,
                                                    border: '1px solid #e2e8f0',
                                                    '&:hover': { bgcolor: ind.themeColor, color: 'white' }
                                                }}
                                            >
                                                <ArrowForward sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grow>
                        );
                    })}
                </Box>

                {/* Empty State */}
                {filteredIndustries.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Typography variant="h5" sx={{ color: '#64748b', mb: 2 }}>No matching industries found</Typography>
                        <Typography variant="body2" sx={{ color: '#475569' }}>Try resetting filters or adjusting search parameters</Typography>
                        <Button 
                            variant="outlined" 
                            onClick={() => { setSearchQuery(''); setActiveSector('all'); }}
                            sx={{ mt: 3, borderColor: '#3157a2', color: '#3157a2' }}
                        >
                            Reset Parameters
                        </Button>
                    </Box>
                )}
            </Container>

            {/* Premium Integrated CTA Panel matching Landing Page branding */}
            <Container maxWidth="md" sx={{ mt: 12, mb: 10, position: 'relative', zIndex: 1 }}>
                <Paper 
                    sx={{ 
                        p: { xs: 4, md: 8 }, 
                        borderRadius: '24px', 
                        background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)', 
                        boxShadow: '0 30px 60px rgba(49, 87, 162, 0.2)', 
                        textAlign: 'center',
                        color: 'white',
                        border: 'none'
                    }}
                >
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2rem', md: '3rem' }, color: 'white' }}>
                        Transform Your Business Architecture
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 5, fontWeight: 400, maxWidth: '600px', mx: 'auto', lineHeight: 1.5 }}>
                        Create a free account in 30 seconds and test all 21 specialized ERP configurations under one unified control panel.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                        <button 
                            className="btn"
                            onClick={() => navigate('/signup')}
                            style={{ 
                                background: '#ffffff',
                                color: '#3157a2', 
                                fontWeight: 900,
                                padding: '15px 40px',
                                borderRadius: '50px',
                                fontSize: '1rem',
                                border: 'none',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            Create Free Account
                        </button>
                        <button 
                            className="btn"
                            onClick={() => navigate('/')}
                            style={{ 
                                border: '2px solid rgba(255,255,255,0.4)',
                                background: 'transparent',
                                color: 'white', 
                                fontWeight: 800,
                                padding: '15px 40px',
                                borderRadius: '50px',
                                fontSize: '1rem'
                            }}
                        >
                            Back to Home
                        </button>
                    </Box>
                </Paper>
            </Container>

            {/* SHARED GLOBALLY INTEGRATED FOOTER */}
            <footer className="footer bg-dark text-white py-5">
                <div className="container text-center">
                    <p className="mb-3 opacity-50 small">&copy; 2026 BillSoft India. Powered by AGB TECHNOLOGIES LLP</p>
                    <div className="d-flex justify-content-center flex-wrap gap-4">
                        <a href="/privacy-policy.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Privacy Policy</a>
                        <a href="/refund-policy.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Refund Policy</a>
                        <a href="/terms-of-use.html" target="_blank" className="text-white text-decoration-none opacity-50" style={{ fontSize: '0.7rem' }}>Terms of Use</a>
                    </div>
                </div>
            </footer>

            {/* MOBILE MENU DRAWER (Integrated responsiveness matching LandingPage / Academy) */}
            {isMobileMenuOpen && (
                <>
                    <div 
                        className="landing-mobile-backdrop active"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    <div className="landing-mobile-drawer active">
                        <div className="drawer-header">
                            <img src="/logo.svg" alt="BillSoft Logo" style={{ height: '40px' }} />
                            <button className="close-drawer" onClick={() => setIsMobileMenuOpen(false)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="drawer-body">
                            <a href="/" onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}>Home</a>
                            <a href="/#about" onClick={() => { setIsMobileMenuOpen(false); navigate('/#about'); }}>About Us</a>
                            <a href="/#features" onClick={() => { setIsMobileMenuOpen(false); navigate('/#features'); }}>Features</a>
                            <a href="/#pricing" onClick={() => { setIsMobileMenuOpen(false); navigate('/#pricing'); }}>Pricing</a>
                            <hr />

                            <a href="/support" onClick={() => { setIsMobileMenuOpen(false); navigate('/support'); }}>Support</a>
                            <div className="mt-auto pt-4">
                                <button className="btn btn-try-now w-100 py-3" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Try BillSoft For Free</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Box>
    );
};

export default IndustryDirectory;
