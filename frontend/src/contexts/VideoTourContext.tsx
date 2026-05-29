import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoTranslations } from '../utils/videoTranslations';

const sceneRoutes = [
    '/dashboard',       // 0: Welcome
    '/dashboard',       // 1: Dashboard
    '/bills',           // 2: Billing
    '/bills',           // 3: Bill Management
    '/customers',       // 4: CRM
    '/products',        // 5: Inventory
    '/expenses',        // 6: Expenses
    '/purchase-orders', // 7: PO
    '/reports',         // 8: GST
    '/service-tickets', // 9: Service
    '/settings',        // 10: Branding
    '/admin'            // 11: Admin
];

interface VideoTourContextType {
    isActive: boolean;
    currentStep: number;
    language: string;
    isPlaying: boolean;
    isFinished: boolean;
    isSimulating: boolean;
    volume: number;
    isMuted: boolean;
    setVolume: (vol: number) => void;
    setIsMuted: (muted: boolean) => void;
    startTour: (step?: number) => void;
    stopTour: () => void;
    setStep: (step: number) => void;
    setLanguage: (lang: string) => void;
    togglePlay: () => void;
    changeVoice: () => void;
}

const VideoTourContext = createContext<VideoTourContextType | undefined>(undefined);

export const VideoTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [language, setLanguage] = useState('English');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [volume, setVolume] = useState(1); // 0 to 1
    const [isMuted, setIsMuted] = useState(false);
    const [voiceIndex, setVoiceIndex] = useState(0);
    
    const isPlayingRef = useRef(isPlaying);
    const volumeRef = useRef(volume);
    const isMutedRef = useRef(isMuted);
    const speechTimeout = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    // Sync refs with state
    useEffect(() => {
        isPlayingRef.current = isPlaying;
        volumeRef.current = volume;
        isMutedRef.current = isMuted;
    }, [isPlaying, volume, isMuted]);

    // Ensure voices are loaded
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = useCallback((text: string) => {
        if (speechTimeout.current) clearTimeout(speechTimeout.current);
        window.speechSynthesis.cancel();

        // Trigger simulation events based on the current scene
        if (isActive) {
            if (currentStep === 2) { // Billing
                window.dispatchEvent(new CustomEvent('tour-simulate-bill'));
            } else if (currentStep === 4) { // CRM
                window.dispatchEvent(new CustomEvent('tour-simulate-customer'));
            } else if (currentStep === 5) { // Inventory
                window.dispatchEvent(new CustomEvent('tour-simulate-product'));
            }
        }

        speechTimeout.current = setTimeout(() => {
            let langCode = videoTranslations[language]?.langCode || 'en-IN';
            
            const langMap: Record<string, string> = {
                'hi-IN': 'hi', 'bn-IN': 'bn', 'mr-IN': 'mr', 'te-IN': 'te',
                'ta-IN': 'ta', 'gu-IN': 'gu', 'pa-IN': 'pa', 'kn-IN': 'kn',
                'or-IN': 'or', 'ml-IN': 'ml'
            };
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langCode;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                setTimeout(() => speak(text), 200);
                return;
            }

            const langPrefix = langCode.split('-')[0].toLowerCase();
            const shortCode = langMap[langCode] || langPrefix;

            const isHindi = langPrefix === 'hi';
            const suitableVoices = voices.filter(v => {
                const name = v.name.toLowerCase();
                const vLang = v.lang.toLowerCase();
                const isMatch = (vLang.startsWith(langPrefix) || vLang.startsWith(shortCode));
                if (!isMatch) return false;

                // For Hindi, we strictly want high-quality female voices if possible
                if (isHindi) {
                    const priorityNames = ['natural', 'online', 'kalpana', 'pallavi', 'neerja', 'vani', 'google', 'swara'];
                    return name.includes('female') || name.includes('woman') || priorityNames.some(p => name.includes(p));
                }

                const priorityNames = ['kalpana', 'pallavi', 'neerja', 'vani', 'ananya', 'heera', 'geeta', 'swara', 'lekha', 'google', 'hindi'];
                return name.includes('female') || name.includes('woman') || priorityNames.some(p => name.includes(p));
            });

            // Sort so 'Natural' or 'Online' voices are first for Hindi
            if (isHindi) {
                suitableVoices.sort((a, b) => {
                    const aName = a.name.toLowerCase();
                    const bName = b.name.toLowerCase();
                    const aScore = (aName.includes('natural') ? 2 : 0) + (aName.includes('online') ? 1 : 0);
                    const bScore = (bName.includes('natural') ? 2 : 0) + (bName.includes('online') ? 1 : 0);
                    return bScore - aScore;
                });
            }

            const selectedVoice = suitableVoices[voiceIndex % (suitableVoices.length || 1)];
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            } else {
                utterance.lang = langCode;
            }

            // Fine-tune Hindi playback to sound more human
            if (isHindi) {
                utterance.rate = 0.95; // Slightly slower for clarity
                utterance.pitch = 1.05; // Slightly warmer pitch
            } else {
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
            }

            utterance.volume = isMutedRef.current ? 0 : volumeRef.current;
            
            utterance.onend = () => {
                if (isPlayingRef.current) {
                    // Optimized pause for practical simulation steps
                    const isSimStep = [2, 4, 5].includes(currentStep);
                    setTimeout(() => {
                        if (!isPlayingRef.current) return;
                        const scenes = videoTranslations[language].scenes;
                        setCurrentStep(prev => {
                            const nextStep = prev + 1;
                            if (nextStep < scenes.length) {
                                const targetRoute = sceneRoutes[nextStep];
                                if (targetRoute) navigate(targetRoute);
                                return nextStep;
                            } else {
                                // Tour ended: show finished state
                                setIsFinished(true);
                                setIsPlaying(false);
                                return prev;
                            }
                        });
                    }, isSimStep ? 1000 : 500); // Reduced from 4000/2000 to 1000/500
                }
            };

            window.speechSynthesis.speak(utterance);
        }, 100);
    }, [language, currentStep, isActive, navigate]);

    const startTour = (step: number = 0) => {
        setIsActive(true);
        setIsFinished(false);
        setCurrentStep(step);
        setIsPlaying(true);
    };

    const stopTour = useCallback(() => {
        setIsActive(false);
        setIsPlaying(false);
        setIsFinished(false);
        window.speechSynthesis.cancel();
        if (speechTimeout.current) clearTimeout(speechTimeout.current);
    }, []);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => {
            const next = !prev;
            if (!next) {
                window.speechSynthesis.cancel();
                if (speechTimeout.current) clearTimeout(speechTimeout.current);
            } else {
                const text = videoTranslations[language].scenes[currentStep].narration;
                speak(text);
            }
            return next;
        });
    }, [language, currentStep, speak]);

    const setStep = useCallback((step: number) => {
        setCurrentStep(step);
        if (isActive) {
            const targetRoute = sceneRoutes[step];
            if (targetRoute) navigate(targetRoute);

            if (isPlayingRef.current) {
                const text = videoTranslations[language].scenes[step].narration;
                speak(text);
            }
        }
    }, [isActive, navigate, language, speak]);

    // Handle initial speech and state changes
    useEffect(() => {
        if (isActive && isPlaying) {
            const text = videoTranslations[language].scenes[currentStep].narration;
            speak(text);
        }
    }, [isActive, currentStep, language, isPlaying, speak]);

    // Listen for external tour triggers
    useEffect(() => {
        const handleStartTour = (e: any) => {
            const { step } = e.detail;
            startTour(step);
        };
        window.addEventListener('start-video-tour', handleStartTour);
        return () => window.removeEventListener('start-video-tour', handleStartTour);
    }, []);

    return (
        <VideoTourContext.Provider value={{ 
            isActive, 
            currentStep, 
            language, 
            isPlaying, 
            isFinished,
            isSimulating,
            volume,
            isMuted,
            setVolume,
            setIsMuted,
            startTour, 
            stopTour, 
            setStep, 
            setLanguage, 
            togglePlay,
            changeVoice: () => {
                setVoiceIndex(prev => prev + 1);
                if (isActive && isPlaying) {
                    const text = videoTranslations[language].scenes[currentStep].narration;
                    speak(text);
                }
            }
        }}>
            {children}
        </VideoTourContext.Provider>
    );
};

export const useVideoTour = () => {
    const context = useContext(VideoTourContext);
    if (!context) throw new Error('useVideoTour must be used within a VideoTourProvider');
    return context;
};
