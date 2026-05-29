import React from 'react';
import { 
    Box, 
    Drawer, 
    Typography, 
    List, 
    ListItem, 
    ListItemButton, 
    IconButton, 
    Stack,
    useTheme,
    alpha,
    Tooltip
} from '@mui/material';
import { 
    Close as CloseIcon,
    MoreVert as MoreIcon,
    Shuffle as ShuffleIcon,
    Repeat as RepeatIcon,
    PlayArrow as ActivePlayIcon,
    ChevronRight as MinimizeIcon,
    ChevronLeft as MaximizeIcon,
} from '@mui/icons-material';
import { videoTranslations } from '../utils/videoTranslations';
import { useVideoTour } from '../contexts/VideoTourContext';

const VideoTourSidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const theme = useTheme();
    const { currentStep, language, setStep, isActive, stopTour, setLanguage, changeVoice } = useVideoTour();
    const scenes = videoTranslations[language]?.scenes || videoTranslations['English'].scenes;
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
            {/* Playlist Header */}
            <Box sx={{ p: '16px 20px', bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary' }}>
                            Interactive Tour
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                            <Box 
                                onClick={() => setLanguage('English')}
                                sx={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 800, 
                                    px: 1, 
                                    py: 0.3, 
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    bgcolor: language === 'English' ? 'primary.main' : 'transparent',
                                    color: language === 'English' ? 'white' : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: language === 'English' ? 'primary.main' : 'divider',
                                    transition: 'all 0.2s',
                                    textTransform: 'uppercase'
                                }}
                            >
                                EN
                            </Box>
                            <Box 
                                onClick={() => setLanguage('हिन्दी')}
                                sx={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 800, 
                                    px: 1, 
                                    py: 0.3, 
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    bgcolor: language === 'हिन्दी' ? 'primary.main' : 'transparent',
                                    color: language === 'हिन्दी' ? 'white' : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: language === 'हिन्दी' ? 'primary.main' : 'divider',
                                    transition: 'all 0.2s'
                                }}
                            >
                                हिन्दी
                            </Box>

                            <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: 12, mx: 0.5 }} />

                            <Tooltip title="Change Voice">
                                <IconButton 
                                    onClick={changeVoice} 
                                    size="small" 
                                    sx={{ 
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                    }}
                                >
                                    <ShuffleIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={() => setIsMinimized(true)} size="small" sx={{ color: 'text.secondary' }}>
                            <MinimizeIcon />
                        </IconButton>
                        <IconButton 
                            onClick={() => {
                                if (isActive) stopTour();
                                onClose();
                            }} 
                            size="small" 
                            sx={{ color: 'text.secondary' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
            </Box>

            {/* Playlist Items */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                <List sx={{ p: 0 }}>
                    {scenes.map((scene: any, index: number) => {
                        const isCurrent = currentStep === index && isActive;
                        return (
                            <ListItem key={index} disablePadding>
                                    <ListItemButton
                                        onClick={() => setStep(index)}
                                        selected={isCurrent}
                                        sx={{
                                            mb: 0.5,
                                            borderRadius: 2,
                                            p: '10px 14px',
                                            alignItems: 'center',
                                            '&.Mui-selected': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                                            },
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                        }}
                                    >
                                        {/* Left: Index or Play Icon */}
                                        <Box sx={{ minWidth: 28, display: 'flex', justifyContent: 'flex-start', mr: 1 }}>
                                            {isCurrent ? (
                                                <ActivePlayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                                            ) : (
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'text.secondary' }}>
                                                    {index + 1}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Scene Info */}
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography sx={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: isCurrent ? 700 : 500, 
                                                color: isCurrent ? 'primary.main' : 'text.primary',
                                                lineHeight: 1.3
                                            }}>
                                                {scene.title}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.3 }}>
                                                30 secs
                                            </Typography>
                                        </Box>

                                    {/* Right: Menu */}
                                    <IconButton size="small" sx={{ ml: 0.5 }}>
                                        <MoreIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
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
                        width: 340,
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

export default VideoTourSidebar;
