import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    IconButton,
    Typography,
    alpha,
    useTheme,
    Stack,
    Slider,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    PlayArrowRounded as PlayIcon,
    PauseRounded as PauseIcon,
    SkipNextRounded as NextIcon,
    VolumeUpRounded as VolumeIcon,
    VolumeOffRounded as MuteIcon,
    SettingsRounded as SettingsIcon,
    FullscreenRounded as FullscreenIcon,
    FullscreenExitRounded as FullscreenExitIcon,
    ClosedCaptionRounded as CCIcon,
    StopRounded as StopIcon,
    Language as LanguageIcon,
    Check as CheckIcon,
    ShuffleRounded as ShuffleIcon,
} from '@mui/icons-material';
import { useVideoTour } from '../contexts/VideoTourContext';
import { videoTranslations } from '../utils/videoTranslations';

const VideoTourControls: React.FC = () => {
    const theme = useTheme();
    const {
        isActive,
        currentStep,
        language,
        isPlaying,
        togglePlay,
        setStep,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        stopTour,
        setLanguage,
        changeVoice,
    } = useVideoTour();

    const [showControls, setShowControls] = useState(true);
    const [simulatedTime, setSimulatedTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLanguageClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageSelect = (lang: string) => {
        setStep(currentStep); // Restart current step narration in new language
        // setLanguage is called inside the Menu items
        handleLanguageClose();
    };

    const scenes = videoTranslations[language]?.scenes || videoTranslations['English'].scenes;
    const totalDurationSeconds = scenes.length * 30; // 30s per scene approx
    const baseTime = currentStep * 30;
    
    // Smooth progress simulation
    useEffect(() => {
        setSimulatedTime(baseTime);
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setSimulatedTime(prev => Math.min(prev + 1, baseTime + 29));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentStep, isPlaying, baseTime]);

    const progress = (simulatedTime / totalDurationSeconds) * 100;

    // Auto-hide controls
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
            controlsTimeout.current = setTimeout(() => {
                if (isPlaying) setShowControls(false);
            }, 4000);
        };

        if (isActive) {
            window.addEventListener('mousemove', handleMouseMove);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        };
    }, [isActive, isPlaying]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    if (!isActive) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = formatTime(totalDurationSeconds);
    const currentTimeStr = formatTime(simulatedTime);
    const currentScene = scenes[currentStep];

    return (
        <Box sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2200,
            width: 'calc(100% - 48px)',
            maxWidth: 1200,
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: showControls ? 'auto' : 'none',
        }}>
            
            {/* Subtitles / Narration Bubble */}
            {showSubtitles && (
                <Box sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <Box sx={{ 
                        bgcolor: 'transparent',
                        px: 3, 
                        py: 1, 
                        maxWidth: '80%',
                        textAlign: 'center',
                    }}>
                        <Typography sx={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 400, 
                            lineHeight: 1.5,
                            color: '#000',
                            letterSpacing: '0.01em'
                        }}>
                            {currentScene?.narration}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Box sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(16px)',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                {/* Info Header inside controls */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {currentScene?.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>
                        {currentTimeStr} / {totalTime}
                    </Typography>
                </Stack>

                {/* Progress Bar */}
                <Box sx={{ px: 1 }}>
                    <Slider
                        size="small"
                        value={progress}
                        onChange={(_, val) => {
                            const step = Math.round((val as number / 100) * (scenes.length - 1));
                            setStep(step);
                            setSimulatedTime(step * 30);
                        }}
                        sx={{
                            color: 'primary.main',
                            height: 6,
                            padding: '8px 0',
                            '& .MuiSlider-thumb': {
                                width: 16,
                                height: 16,
                                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                '&:before': { boxShadow: '0 2px 12px 0 rgba(0,0,0,0.2)' },
                                '&:hover, &.Mui-focusVisible': { boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}` },
                            },
                            '& .MuiSlider-track': { border: 'none' },
                            '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: 'primary.main' },
                        }}
                    />
                </Box>

                {/* Control Bar */}
                <Stack direction="row" alignItems="center" spacing={1}>
                    {/* Left Controls */}
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Tooltip title={isPlaying ? "Pause" : "Play"}>
                            <IconButton onClick={togglePlay} sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Next Step">
                            <IconButton 
                                onClick={() => { setStep(Math.min(currentStep + 1, scenes.length - 1)); setSimulatedTime((currentStep + 1) * 30); }}
                                disabled={currentStep === scenes.length - 1}
                                sx={{ color: 'text.primary' }}
                            >
                                <NextIcon />
                            </IconButton>
                        </Tooltip>

                        <Stack direction="row" alignItems="center" sx={{ ml: 1, '&:hover .volume-slider': { width: 80, ml: 1, opacity: 1 } }}>
                            <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ color: 'text.primary' }}>
                                {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                            </IconButton>
                            <Slider
                                className="volume-slider"
                                size="small"
                                value={isMuted ? 0 : volume * 100}
                                onChange={(_, val) => {
                                    setVolume((val as number) / 100);
                                    if (val > 0) setIsMuted(false);
                                }}
                                sx={{ width: 0, ml: 0, opacity: 0, transition: 'all 0.3s ease', color: 'primary.main' }}
                            />
                        </Stack>
                    </Stack>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Right Controls */}
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Tooltip title="Toggle Subtitles">
                            <IconButton onClick={() => setShowSubtitles(!showSubtitles)} sx={{ color: showSubtitles ? 'primary.main' : 'text.secondary' }}>
                                <CCIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Full screen">
                            <IconButton onClick={toggleFullscreen} sx={{ color: 'text.primary' }}>
                                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Stop Tour">
                            <IconButton onClick={() => stopTour()} sx={{ color: 'error.main' }}>
                                <StopIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
};

export default VideoTourControls;
