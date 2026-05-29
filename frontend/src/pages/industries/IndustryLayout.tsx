import React, { useState, useMemo } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    Button, 
    Divider, 
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Card
} from '@mui/material';
import { 
    Star,
    FormatQuote,
    CompareArrows,
    ThumbUp,
    ArrowBack,
    Code as CodeIcon,
    Settings as SettingsIcon,
    Dns as DnsIcon
} from '@mui/icons-material';
import { IndustryConfig } from '../../constants/industries';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/landing.css';

// Custom dynamic icon component mapper
import {
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
    Smartphone,
    HelpOutline
} from '@mui/icons-material';

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

interface IndustryLayoutProps {
    config: IndustryConfig;
}

const IndustryLayout: React.FC<IndustryLayoutProps> = ({ config }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Header dropdown / drawer states
    const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form simulation states
    const [simulatedCustomer, setSimulatedCustomer] = useState('John Doe');
    const [simulatedProduct, setSimulatedProduct] = useState(
        config.slug === 'restaurant' ? 'Veg Schezwan Noodles' :
        config.slug === 'pharmacy' ? 'Amoxicillin 500mg' :
        config.slug === 'automobile' ? 'Synthetic Engine Oil 4L' :
        config.slug === 'textile' ? 'Slim Fit Cotton Shirt' :
        config.slug === 'jewellery' ? '22K Gold Chain' :
        `${config.name} Core Offering`
    );
    const [simulatedPrice, setSimulatedPrice] = useState(
        config.slug === 'restaurant' ? 180.00 :
        config.slug === 'pharmacy' ? 142.00 :
        config.slug === 'automobile' ? 3200.00 :
        config.slug === 'textile' ? 1199.00 :
        config.slug === 'jewellery' ? 46200.00 :
        499.00
    );
    const [simulatedQty, setSimulatedQty] = useState(1);

    // Setup initial state for dynamic parameters
    const initialFieldValues = useMemo(() => {
        const defaults: Record<string, string> = {};
        if (config.dynamicFields) {
            config.dynamicFields.forEach(f => {
                if (f.dataType === 'select' && f.options) {
                    defaults[f.name] = f.options[0];
                } else if (f.dataType === 'boolean') {
                    defaults[f.name] = 'Yes';
                } else {
                    defaults[f.name] = f.name === 'engine_no' ? 'E3G8B9201' : 
                                      f.name === 'chassis_no' ? 'C4D7E2091A' : 
                                      f.name === 'imei_no' ? '869201948201948' :
                                      f.name === 'gold_rate' ? '₹7,210/g' : 
                                      f.name === 'purity' ? '91.6% Hallmark' :
                                      f.name === 'drug_license_no' ? 'DL-20839/21' : 'DEMO-VAL';
                }
            });
        }
        return defaults;
    }, [config]);

    const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(initialFieldValues);

    const handleDynamicChange = (name: string, val: string) => {
        setDynamicValues(prev => ({ ...prev, [name]: val }));
    };

    // Calculate totals for mock bill
    const calculatedBill = useMemo(() => {
        const itemTotal = simulatedPrice * simulatedQty;
        const taxRate = config.slug === 'restaurant' ? 5 : config.slug === 'pharmacy' ? 12 : 18;
        const taxAmount = itemTotal * (taxRate / 100);
        const grandTotal = itemTotal + taxAmount;
        return { itemTotal, taxRate, taxAmount, grandTotal };
    }, [simulatedPrice, simulatedQty, config]);

    const mockTestimonial = {
        quote: `BillSoft transformed our ${config.name.toLowerCase()} operations. The ${config.billSize} billing is exactly what we needed for our professional look.`,
        author: "Aditya Sharma",
        company: `${config.name} Hub Solutions`
    };

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
                                <li><a className="dropdown-item py-2 fw-bold text-primary" href="/industry" onClick={(e) => { e.preventDefault(); navigate('/industry'); }}>View All 21 Industries</a></li>
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

            {/* Back Navigation Bar */}
            <Box sx={{ borderBottom: '1px solid #f1f5f9', bgcolor: '#ffffff', py: 1.5 }}>
                <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3.5 }}>
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={() => navigate('/industry')}
                        sx={{ 
                            color: '#64748b', 
                            fontWeight: 700, 
                            textTransform: 'none', 
                            '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } 
                        }}
                    >
                        Back to Directory
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                            label={`${config.name} Cloud ERP`} 
                            size="small" 
                            sx={{ 
                                bgcolor: `${config.themeColor}12`, 
                                color: config.themeColor, 
                                fontWeight: 800,
                                border: `1px solid ${config.themeColor}20`
                            }} 
                        />
                    </Box>
                </Container>
            </Box>

            {/* Ambient Background Glow */}
            <Box 
                sx={{ 
                    position: 'absolute',
                    top: '12%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${config.themeColor}05 0%, rgba(0,0,0,0) 75%)`,
                    filter: 'blur(100px)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} 
            />

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ pt: 8, pb: 6, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 8, alignItems: 'center' }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{ 
                                p: 1.5, 
                                borderRadius: '16px', 
                                bgcolor: `${config.themeColor}12`, 
                                color: config.themeColor,
                                border: `1px solid ${config.themeColor}20`,
                                display: 'flex'
                            }}>
                                {renderIndustryIcon(config.icon, { fontSize: 32 })}
                            </Box>
                            <Typography 
                                variant="overline" 
                                sx={{ 
                                    letterSpacing: 3, 
                                    fontWeight: 900, 
                                    color: config.themeColor,
                                    fontSize: '0.8rem'
                                }}
                            >
                                Vertical Sandbox Playground
                            </Typography>
                        </Box>

                        <Typography 
                            variant="h1" 
                            sx={{ 
                                fontSize: { xs: '2.5rem', md: '3.6rem' }, 
                                fontWeight: 900, 
                                color: '#0f172a',
                                mb: 3,
                                letterSpacing: -1
                            }}
                        >
                            Tailored ERP for {config.name}.
                        </Typography>

                        <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, mb: 4 }}>
                            {config.description} Built from the ground up for operational efficiency, item tracking, GST-compliance, and modular schema flexibility. Try our real-time interactive receipt simulator on the right.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <button 
                                className="btn"
                                onClick={() => {
                                    const demoEmail = `support_${config.slug.replace(/-/g, '_')}@agbtechnologies.com`;
                                    navigate(`/login?email=${demoEmail}&password=Shubham@143`);
                                }}
                                style={{ 
                                    background: 'linear-gradient(135deg, #3157a2 0%, #00dfd8 100%)', 
                                    color: 'white',
                                    fontWeight: 800,
                                    padding: '12px 32px',
                                    borderRadius: '30px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(49,87,162,0.2)'
                                }}
                            >
                                Launch Active {config.name} Sandbox
                            </button>
                        </Box>
                    </Box>

                    {/* Key Metrics Panel */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: 1 }}>STANDARD TAX RATE</Typography>
                            <Typography variant="h4" fontWeight="900" sx={{ color: config.themeColor, mt: 0.5 }}>
                                {config.slug === 'restaurant' ? '5% GST' : config.slug === 'pharmacy' ? '12% GST' : '18% GST'}
                            </Typography>
                        </Card>
                        <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: 1 }}>LAYOUT STRUCTURE</Typography>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', mt: 0.5 }}>
                                {config.billSize} Standard
                            </Typography>
                        </Card>
                        <Card sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, letterSpacing: 1 }}>DATABASE STRUCTURE</Typography>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', mt: 0.5 }}>
                                Relational JSON
                            </Typography>
                        </Card>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: '#e2e8f0', my: 10 }} />

                {/* Master Interactive Workspace Desk */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 8, mb: 12 }}>
                    {/* Control Panel Panel */}
                    <Card sx={{ p: { xs: 4, md: 5 }, borderRadius: '24px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <SettingsIcon sx={{ color: config.themeColor }} />
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>Billing Simulation Control Panel</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                            <TextField 
                                label="Customer Name"
                                fullWidth
                                value={simulatedCustomer}
                                onChange={(e) => setSimulatedCustomer(e.target.value)}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#f8fafc',
                                        color: '#0f172a',
                                        '& fieldset': { borderColor: '#cbd5e1' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#64748b' }
                                }}
                            />

                            <TextField 
                                label="Line Product Name"
                                fullWidth
                                value={simulatedProduct}
                                onChange={(e) => setSimulatedProduct(e.target.value)}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: '#f8fafc',
                                        color: '#0f172a',
                                        '& fieldset': { borderColor: '#cbd5e1' }
                                    },
                                    '& .MuiInputLabel-root': { color: '#64748b' }
                                }}
                            />

                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3.5 }}>
                                <TextField 
                                    label="Price (₹)"
                                    type="number"
                                    value={simulatedPrice}
                                    onChange={(e) => setSimulatedPrice(parseFloat(e.target.value) || 0)}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#f8fafc',
                                            color: '#0f172a',
                                            '& fieldset': { borderColor: '#cbd5e1' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#64748b' }
                                    }}
                                />
                                <TextField 
                                    label="Quantity"
                                    type="number"
                                    value={simulatedQty}
                                    onChange={(e) => setSimulatedQty(parseInt(e.target.value, 10) || 1)}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#f8fafc',
                                            color: '#0f172a',
                                            '& fieldset': { borderColor: '#cbd5e1' }
                                        },
                                        '& .MuiInputLabel-root': { color: '#64748b' }
                                    }}
                                />
                            </Box>

                            {/* Render specialized dynamic industry fields inside form */}
                            {config.dynamicFields && config.dynamicFields.length > 0 && (
                                <Box>
                                    <Divider sx={{ borderColor: '#f1f5f9', my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ color: config.themeColor, fontWeight: 800, mb: 3, fontSize: '0.75rem', letterSpacing: 1 }}>
                                        INDUSTRY SPECIFIC PARAMETERS
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {config.dynamicFields.map((field) => (
                                            <Box key={field.name}>
                                                {field.dataType === 'select' && field.options ? (
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id={`label-${field.name}`} sx={{ color: '#64748b' }}>{field.label}</InputLabel>
                                                        <Select
                                                            labelId={`label-${field.name}`}
                                                            value={dynamicValues[field.name] || ''}
                                                            label={field.label}
                                                            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                                            sx={{ 
                                                                bgcolor: '#f8fafc',
                                                                color: '#0f172a',
                                                                '& fieldset': { borderColor: '#cbd5e1 !important' }
                                                            }}
                                                        >
                                                            {field.options.map(opt => (
                                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : field.dataType === 'boolean' ? (
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel id={`label-${field.name}`} sx={{ color: '#64748b' }}>{field.label}</InputLabel>
                                                        <Select
                                                            labelId={`label-${field.name}`}
                                                            value={dynamicValues[field.name] || 'Yes'}
                                                            label={field.label}
                                                            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                                            sx={{ 
                                                                bgcolor: '#f8fafc',
                                                                color: '#0f172a',
                                                                '& fieldset': { borderColor: '#cbd5e1 !important' }
                                                            }}
                                                        >
                                                            <MenuItem value="Yes">Yes</MenuItem>
                                                            <MenuItem value="No">No</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <TextField 
                                                        label={field.label}
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        value={dynamicValues[field.name] || ''}
                                                        onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                                                        sx={{ 
                                                            '& .MuiOutlinedInput-root': {
                                                                bgcolor: '#f8fafc',
                                                                color: '#0f172a',
                                                                '& fieldset': { borderColor: '#cbd5e1' }
                                                            },
                                                            '& .MuiInputLabel-root': { color: '#64748b' }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Card>

                    {/* Invoice Printed Result Simulation */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '380px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.75rem' }}>LIVE RECEIPT PREVIEW</Typography>
                                <Chip label={config.billSize} size="small" variant="outlined" sx={{ color: config.themeColor, borderColor: config.themeColor }} />
                            </Box>

                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 4, 
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
                                        {config.name.toUpperCase()} SHREE
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
                                        <span>Cust: {simulatedCustomer}</span>
                                        <span>Type: RETAIL SALE</span>
                                    </Box>

                                    {/* Render specialized dynamic industry fields */}
                                    {Object.entries(dynamicValues).map(([key, val]) => {
                                        const fieldLabel = config.dynamicFields?.find(f => f.name === key)?.label || key;
                                        return (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: config.themeColor, fontWeight: 'bold' }} key={key}>
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
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', mb: 0.5 }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{simulatedProduct}</span>
                                        <span style={{ textAlign: 'right' }}>{simulatedQty}</span>
                                        <span style={{ textAlign: 'right' }}>{simulatedPrice.toFixed(2)}</span>
                                        <span style={{ textAlign: 'right' }}>{calculatedBill.itemTotal.toFixed(2)}</span>
                                    </Box>
                                </Box>

                                <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#cbd5e1' }} />

                                {/* Totals */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end', fontWeight: 900 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <span>Subtotal:</span>
                                        <span>₹{calculatedBill.itemTotal.toFixed(2)}</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, color: '#64748b' }}>
                                        <span>GST ({calculatedBill.taxRate}%):</span>
                                        <span>₹{calculatedBill.taxAmount.toFixed(2)}</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, fontSize: '12px', borderTop: '1px solid #e2e8f0', pt: 0.5, mt: 0.5 }}>
                                        <span>GRAND TOTAL:</span>
                                        <span style={{ color: config.themeColor }}>₹{calculatedBill.grandTotal.toFixed(2)}</span>
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

                <Divider sx={{ borderColor: '#e2e8f0', mb: 8 }} />

                {/* Relational Database Prisma Integration Block */}
                <Box sx={{ mb: 12 }}>
                    <Card sx={{ p: { xs: 4, md: 5 }, borderRadius: '24px', border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <DnsIcon sx={{ color: config.themeColor }} />
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: -0.5 }}>Prisma Database Relational Engine</Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#475569', mb: 4, lineHeight: 1.6 }}>
                            BillSoft stores your custom parameters inside a highly optimized SQLite JSON structure. This prevents database schema bloating while allowing fast, strongly-typed access on the backend. Here is the relational model representation:
                        </Typography>

                        {/* Editor Layout Block */}
                        <Box sx={{ bgcolor: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Box sx={{ px: 3, py: 1.5, bgcolor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CodeIcon sx={{ color: '#00dfd8', fontSize: 16 }} />
                                <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700, fontFamily: 'monospace' }}>schema.prisma</Typography>
                            </Box>
                            <Box sx={{ p: 3, overflowX: 'auto' }}>
                                <pre style={{ margin: 0, color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6 }}>
{`model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  industryId  String
  industry    Industry @relation(fields: [industryId], references: [id])
  
  // High fidelity relational JSON column containing dynamic fields
  // e.g. ${config.dynamicFields?.map(f => `"${f.name}"`).join(', ') || '"table_no", "waiter"'}
  metadata    Json     @default("{}") 
}`}
                                </pre>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* Trust/Testimonials Segment */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 5, mb: 10 }}>
                    <Card sx={{ p: 4, borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} sx={{ color: '#ffb020', fontSize: 20 }} />
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <FormatQuote sx={{ color: config.themeColor, fontSize: 32 }} />
                            <Typography variant="body1" sx={{ color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                                {mockTestimonial.quote}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="900" sx={{ color: '#0f172a' }}>{mockTestimonial.author}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>{mockTestimonial.company}</Typography>
                        </Box>
                    </Card>

                    <Card sx={{ p: 4, borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <CompareArrows sx={{ color: config.themeColor }} />
                            <Typography variant="h6" fontWeight="900" sx={{ color: '#0f172a' }}>Unified Integration Advantage</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 3 }}>
                            Avoid running separate billing software packages. BillSoft matches the exact workflow of {config.name} operations while syncing your financials directly to your master accounts ledger, all under a single dashboard login.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <ThumbUp sx={{ color: config.themeColor, fontSize: 18 }} />
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>TRUSTED BY over 10,000+ businesses across India</Typography>
                        </Box>
                    </Card>
                </Box>
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

export default IndustryLayout;
