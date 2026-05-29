import React from 'react';
import { 
    Box, 
    Drawer, 
    Typography, 
    IconButton, 
    Stack,
    useTheme
} from '@mui/material';
import { 
    Close as CloseIcon,
    ChevronRight as MinimizeIcon,
    ChevronLeft as MaximizeIcon,
} from '@mui/icons-material';

const VideoGuideSidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const theme = useTheme();
    const [isMinimized, setIsMinimized] = React.useState(false);

    React.useEffect(() => {
        if (!open) setIsMinimized(false);
    }, [open]);

    const Content = (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            bgcolor: 'background.paper',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ p: '16px 20px', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary' }}>
                        Video Guide
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={() => setIsMinimized(true)} size="small" sx={{ color: 'text.secondary' }}>
                            <MinimizeIcon />
                        </IconButton>
                        <IconButton 
                            onClick={onClose} 
                            size="small" 
                            sx={{ color: 'text.secondary' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            {/* Video Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                    position: 'relative', 
                    paddingBottom: '56.25%', /* 16:9 aspect ratio */
                    height: 0, 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    bgcolor: 'black',
                    boxShadow: theme.shadows[3]
                }}>
                    {open && !isMinimized && (
                        <video
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            src="/marketing.mp4"
                            title="BillSoft Video Guide"
                            controls
                            autoPlay
                        />
                    )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                    Watch this quick video tutorial to learn how to navigate BillSoft, manage your inventory, generate invoices, and handle your daily business operations efficiently.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    You can keep this sidebar open and watch the guide while you work on your dashboard!
                </Typography>
            </Box>
        </Box>
    );

    return (
        <>
            <Drawer
                anchor="right"
                open={open && !isMinimized}
                onClose={onClose}
                sx={{
                    zIndex: 2100,
                    '& .MuiDrawer-paper': {
                        width: { xs: '100%', sm: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
                        borderLeft: '1px solid',
                        borderColor: 'divider'
                    },
                }}
            >
                {Content}
            </Drawer>

            {open && isMinimized && (
                <Box sx={{
                    position: 'fixed',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 0,
                    zIndex: 2100,
                    bgcolor: 'background.paper',
                    boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRight: 'none',
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    py: 1,
                    px: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }} onClick={() => setIsMinimized(false)}>
                    <MaximizeIcon color="primary" />
                </Box>
            )}
        </>
    );
};

export default VideoGuideSidebar;
