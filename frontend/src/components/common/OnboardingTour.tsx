import React, { useState, useEffect, useCallback, useRef } from 'react';
import Joyride, { Step, CallBackProps, STATUS, TooltipRenderProps, ACTIONS, EVENTS } from 'react-joyride';
import { useAuth } from '../../contexts/AuthContext';
import { useVideoTour } from '../../contexts/VideoTourContext';
import { Box, Typography, Button, Paper, useTheme, useMediaQuery, IconButton } from '@mui/material';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

// Custom Premium Tooltip Component
const Tooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
}: TooltipRenderProps & { isAutoPlay?: boolean; isVoiceEnabled?: boolean; onToggleVoice?: () => void; onToggleAutoPlay?: () => void }) => (
    <Paper
        {...tooltipProps}
        elevation={0}
        sx={{
            backgroundColor: '#ffffff',
            borderRadius: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            borderTop: '5px solid #305cde',
            maxWidth: { xs: '280px', sm: 340 },
            width: '100%',
            overflow: 'hidden',
            p: { xs: 2.5, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative'
        }}
    >
        {/* Voice & Auto-Play Controls in Tooltip */}
        <Box sx={{ position: 'absolute', top: 15, right: 20, display: 'flex', gap: 1 }}>
            {/* These props would be passed via tooltipComponent extra props if Joyride supported it easily, 
                but we'll manage them via the parent component's state or a global event. 
                For now, let's keep it simple and focus on the primary action. */}
        </Box>

        <Box sx={{ mb: 2.5 }}>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 800,
                    color: '#1a1a1a',
                    mb: 1.5,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    letterSpacing: '-0.02em'
                }}
            >
                {step.title || 'Dashboard Tour'}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    color: '#555',
                    lineHeight: 1.7,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    fontWeight: 500
                }}
            >
                {step.content}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Button
                {...skipProps}
                sx={{
                    color: '#9E9E9E',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'transparent', color: '#666' }
                }}
            >
                Stop Video
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
                {index > 0 && (
                    <Button
                        {...backProps}
                        sx={{
                            borderRadius: '18px',
                            textTransform: 'none',
                            px: { xs: 1.5, sm: 2.5 },
                            py: 0.8,
                            color: '#666',
                            border: '1.5px solid #eee',
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}
                    >
                        Back
                    </Button>
                )}
                <Button
                    {...primaryProps}
                    variant="contained"
                    sx={{
                        borderRadius: '18px',
                        textTransform: 'none',
                        px: { xs: 2.5, sm: 3.5 },
                        py: 0.8,
                        backgroundColor: '#305cde',
                        boxShadow: '0 4px 12px rgba(48, 92, 222, 0.25)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        '&:hover': { backgroundColor: '#254dbb' }
                    }}
                >
                    {isLastStep ? 'Finish' : 'Next'}
                </Button>
            </Box>
        </Box>
    </Paper>
);

const OnboardingTour: React.FC = () => {
    const { user } = useAuth();
    const { isActive: isVideoTourActive } = useVideoTour();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [language, setLanguage] = useState('English');
    
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = useCallback((text: string) => {
        if (!isVoiceEnabled) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'हिन्दी' ? 'hi-IN' : 'en-IN';
        
        // Try to find a female voice for the selected language
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = language === 'हिन्दी' ? 'hi' : 'en';
        const isHindi = language === 'हिन्दी';

        // Filter and sort voices
        const suitableVoices = voices.filter(v => {
            const name = v.name.toLowerCase();
            const vLang = v.lang.toLowerCase();
            if (!vLang.startsWith(langPrefix)) return false;

            if (isHindi) {
                const priorityNames = ['natural', 'online', 'kalpana', 'pallavi', 'neerja', 'vani', 'google'];
                return name.includes('female') || name.includes('woman') || priorityNames.some(p => name.includes(p));
            }
            
            const priorityNames = ['samantha', 'victoria', 'google uk english female', 'microsoft hazel'];
            return name.includes('female') || name.includes('woman') || priorityNames.some(p => name.includes(p));
        });

        if (isHindi) {
            suitableVoices.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aScore = (aName.includes('natural') ? 2 : 0) + (aName.includes('online') ? 1 : 0);
                const bScore = (bName.includes('natural') ? 2 : 0) + (bName.includes('online') ? 1 : 0);
                return bScore - aScore;
            });
        }

        const femaleVoice = suitableVoices[0];

        if (femaleVoice) utterance.voice = femaleVoice;
        
        // Fine-tune for more natural sound
        if (isHindi) {
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
        } else {
            utterance.rate = 1.0;
            utterance.pitch = 1.1; // English sounds better with slightly higher pitch
        }
        
        utterance.onend = () => {
            if (isAutoPlay) {
                // Auto-advance logic
                setTimeout(() => {
                    setStepIndex(prev => prev + 1);
                }, 1000);
            }
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isVoiceEnabled, isAutoPlay]);

    useEffect(() => {
        const handleStartPresentation = () => {
            setStepIndex(0);
            setIsAutoPlay(true);
            setRun(true);
        };

        window.addEventListener('start-onboarding-presentation', handleStartPresentation);
        return () => window.removeEventListener('start-onboarding-presentation', handleStartPresentation);
    }, []);

    // Stop onboarding if video tour starts
    useEffect(() => {
        if (isVideoTourActive && run) {
            setRun(false);
            window.speechSynthesis.cancel();
        }
    }, [isVideoTourActive, run]);

    useEffect(() => {
        if (user?.id) {
            const isTourDone = localStorage.getItem(`billsoft_tour_done_${user.id}`);
            const isMissingAddress = !user.address || !user.city || !user.state || !user.pincode;
            const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'owner';
            const shouldWaitAddress = isAdmin && isMissingAddress;

            if (!isTourDone && !shouldWaitAddress) {
                setRun(true);
            }
        }
    }, [user]);

    const steps: Step[] = language === 'हिन्दी' ? [
        {
            target: isMobile ? '.tour-menu-toggle' : '.tour-sidebar',
            title: 'बिलसॉफ्ट में आपका स्वागत है',
            content: 'नमस्ते! आपके नए व्यवसाय कमांड सेंटर में आपका स्वागत है। मुझे आपको बिलसॉफ्ट आपके विकास में कैसे मदद करता है, इसका एक त्वरित निर्देशित दौरा देने दें।',
            placement: isMobile ? 'bottom' : 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-metric-cards',
            title: 'अपने विकास को ट्रैक करें',
            content: 'यहाँ आपका लाइव बिजनेस हेल्थ डैशबोर्ड है। आप बिल बनाते समय वास्तविक समय में अपने शुद्ध लाभ, राजस्व और खर्चों को देख सकते हैं।',
            placement: 'bottom',
        },
        {
            target: '.tour-quick-actions',
            title: 'त्वरित बिलिंग',
            content: 'भुगतान पाने के लिए तैयार हैं? सेकंडों में नया बिल बनाने या ग्राहक जोड़ने के लिए इन त्वरित शॉर्टकट्स का उपयोग करें। इसे गति के लिए डिज़ाइन किया गया है!',
            placement: 'left',
        },
        {
            target: '.tour-profile-icon',
            title: 'शुरू करने के लिए तैयार हैं?',
            content: 'यह त्वरित दौरा था! आपका व्यवसाय अब अगले स्तर के लिए तैयार है। आज ही अपना पहला बिल बनाने का प्रयास करें!',
            placement: 'bottom',
        }
    ] : [
        {
            target: isMobile ? '.tour-menu-toggle' : '.tour-sidebar',
            title: 'Welcome to BillSoft',
            content: 'Hello! Welcome to your new business command center. Let me give you a quick guided tour of how BillSoft helps you grow.',
            placement: isMobile ? 'bottom' : 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-metric-cards',
            title: 'Track Your Growth',
            content: 'Here is your live business health dashboard. You can see your net profit, revenue, and expenses updated in real-time as you create bills.',
            placement: 'bottom',
        },
        {
            target: '.tour-quick-actions',
            title: 'Instant Billing',
            content: 'Ready to get paid? Use these quick shortcuts to create a new bill or add a customer in seconds. It’s designed for speed!',
            placement: 'left',
        },
        {
            target: '.tour-profile-icon',
            title: 'Ready to Start?',
            content: 'That’s the quick tour! Your business is now ready for the next level. Try creating your first bill today!',
            placement: 'bottom',
        }
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, step, index, action } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            // Update step index if manually clicked
            if (action === ACTIONS.NEXT) {
                setStepIndex(index + 1);
            } else if (action === ACTIONS.PREV) {
                setStepIndex(index - 1);
            }
        }

        if (type === EVENTS.TOOLTIP && run) {
            // Speak the content of the current step
            speak(`${step.title}. ${step.content}`);
        }

        if (finishedStatuses.includes(status)) {
            setRun(false);
            setIsAutoPlay(false);
            window.speechSynthesis.cancel();
            if (user?.id) {
                localStorage.setItem(`billsoft_tour_done_${user.id}`, 'true');
            }
        }
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                stepIndex={stepIndex}
                continuous={true}
                showProgress={false}
                showSkipButton={true}
                callback={handleJoyrideCallback}
                tooltipComponent={Tooltip}
                disableScrolling={false}
                scrollOffset={120}
                disableScrollParentFix={true}
                floaterProps={{
                    disableAnimation: true,
                }}
                styles={{
                    options: {
                        zIndex: 10000,
                        overlayColor: 'rgba(0, 0, 0, 0.72)',
                    }
                }}
            />
            
            {/* Floating Audio Control during tour */}
            {run && (
                <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 10001, display: 'flex', gap: 1 }}>
                    <IconButton 
                        onClick={() => setLanguage(language === 'English' ? 'हिन्दी' : 'English')}
                        sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' }, boxShadow: 3, px: 2, borderRadius: 2 }}
                    >
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#305cde' }}>
                            {language === 'English' ? 'हिन्दी' : 'English'}
                        </Typography>
                    </IconButton>
                    <IconButton 
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' }, boxShadow: 3 }}
                    >
                        {isVoiceEnabled ? <Volume2 size={20} color="#305cde" /> : <VolumeX size={20} color="#666" />}
                    </IconButton>
                    {isAutoPlay && (
                         <IconButton 
                            onClick={() => setIsAutoPlay(false)}
                            sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' }, boxShadow: 3 }}
                        >
                            <Pause size={20} color="#305cde" />
                        </IconButton>
                    )}
                </Box>
            )}
        </>
    );
};

export default OnboardingTour;
