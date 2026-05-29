import React, { useState } from 'react';
import {
    IconButton,
    Typography,
    Box,
    Drawer,
    Card,
    CardContent,
    Button,
    Stack,
    useTheme,
    alpha,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip
} from '@mui/material';
import {
    PlayCircleOutline as PlayIcon,
    Close as CloseIcon,
    ArrowForward as ArrowIcon,
    SlowMotionVideo as VideoIcon,
    Dashboard as DashboardIcon,
    Receipt as BillingIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    CurrencyRupee as ExpenseIcon,
    ShoppingCart as POIcon,
    Assessment as ReportIcon,
    Build as ServiceIcon,
    Palette as BrandingIcon,
    AdminPanelSettings as AdminIcon,
    PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const scenes = [
    { id: 0, title: "Welcome to BillSoft", timestamp: "00:00", icon: <PlayIcon /> },
    { id: 1, title: "Real-time Dashboard", timestamp: "00:12", icon: <DashboardIcon /> },
    { id: 2, title: "Smart Billing & Invoicing", timestamp: "00:22", icon: <BillingIcon /> },
    { id: 3, title: "Bill Management", timestamp: "00:34", icon: <BillingIcon /> },
    { id: 4, title: "Customer CRM", timestamp: "00:42", icon: <PeopleIcon /> },
    { id: 5, title: "Inventory Control", timestamp: "00:53", icon: <InventoryIcon /> },
    { id: 6, title: "Expense Management", timestamp: "01:04", icon: <ExpenseIcon /> },
    { id: 7, title: "Purchase Orders", timestamp: "01:14", icon: <POIcon /> },
    { id: 8, title: "GST Reports & Filing", timestamp: "01:24", icon: <ReportIcon /> },
    { id: 9, title: "Service Ticket System", timestamp: "01:36", icon: <ServiceIcon /> },
    { id: 10, title: "Custom Branding", timestamp: "01:46", icon: <BrandingIcon /> },
    { id: 11, title: "Admin & Team Management", timestamp: "01:56", icon: <AdminIcon /> }
];

const VideoDemoSidebar: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    const handleSceneClick = (sceneId: number) => {
        setDrawerOpen(false);
        navigate(`/video-demo?scene=${sceneId}`);
    };

    return (
        <>
            <Tooltip title="Video Tour Chapters">
                <Button
                    variant="outlined"
                    startIcon={<VideoIcon />}
                    onClick={toggleDrawer(true)}
                    sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        height: 32,
                        px: 2,
                        borderColor: alpha(theme.palette.primary.main, 0.4),
                        color: 'primary.main',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: theme.palette.primary.main,
                        }
                    }}
                >
                    Video Guide
                </Button>
            </Tooltip>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 360 },
                        bgcolor: isDarkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        backgroundImage: 'none',
                        boxShadow: isDarkMode ? '0 0 40px rgba(0,0,0,0.6)' : '0 0 40px rgba(0,0,0,0.1)',
                        borderLeft: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>Video Tour</Typography>
                        <Typography variant="caption" color="text.secondary">12 Interactive Chapters</Typography>
                    </Box>
                    <IconButton onClick={toggleDrawer(false)} size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, py: 1, overflowY: 'auto' }}>
                    <List sx={{ px: 2 }}>
                        {scenes.map((scene, index) => (
                            <ListItem key={scene.id} disablePadding sx={{ mb: 1.5 }}>
                                <ListItemButton
                                    onClick={() => handleSceneClick(scene.id)}
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                        border: '1px solid',
                                        borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateX(-4px)',
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                            '& .play-icon': { opacity: 1, transform: 'scale(1)' }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 45, color: 'primary.main' }}>
                                        {scene.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight="700">
                                                {scene.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', px: 1, borderRadius: 1, fontWeight: 'bold' }}>
                                                    {scene.timestamp}
                                                </Typography>
                                                <Typography variant="caption" sx={{ ml: 1, opacity: 0.6 }}>
                                                    Part {index + 1}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <PlayArrowIcon className="play-icon" sx={{ opacity: 0, transform: 'scale(0.5)', transition: 'all 0.2s', color: 'primary.main' }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleSceneClick(0)}
                        startIcon={<PlayIcon />}
                        sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                        }}
                    >
                        Start Full Video Tour
                    </Button>
                </Box>
            </Drawer>
        </>
    );
};

export default VideoDemoSidebar;
