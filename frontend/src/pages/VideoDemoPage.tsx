import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, 
  RotateCcw, SkipForward, ArrowRight
} from 'lucide-react';
import { Box, Typography, Button, IconButton, Paper, Slider, useTheme, alpha, Fade } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { videoTranslations } from '../utils/videoTranslations';

const VideoDemoPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [language, setLanguage] = useState('English');

  // Translations are imported from utils

  const scenes = [
    { 
      duration: 12000,
      route: "/",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/dashboard",
      scrollPattern: [{ time: 3000, y: 400 }, { time: 7000, y: 800 }],
      type: 'iframe'
    },
    { 
      duration: 12000,
      route: "/bills/new",
      type: 'iframe'
    },
    { 
      duration: 8000,
      route: "/bills",
      scrollPattern: [{ time: 3000, y: 300 }],
      type: 'iframe'
    },
    { 
      duration: 11000,
      route: "/customers",
      type: 'iframe'
    },
    { 
      duration: 11000,
      route: "/products",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/expenses",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/purchase-orders",
      type: 'iframe'
    },
    { 
      duration: 12000,
      route: "/reports",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/service-tickets",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/templates",
      type: 'iframe'
    },
    { 
      duration: 10000,
      route: "/admin",
      type: 'iframe'
    }
  ];

  const currentSceneText = videoTranslations[language].scenes[step];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sceneParam = params.get('scene');
    if (sceneParam !== null) {
      const sceneIndex = parseInt(sceneParam);
      if (!isNaN(sceneIndex) && sceneIndex >= 0 && sceneIndex < 12) {
        setStep(sceneIndex);
        setIsPlaying(true);
      }
    }
  }, [location.search]);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled) return;
    
    // Clear the current queue
    window.speechSynthesis.cancel();
    
    // Add a small buffer delay. In React 18 Strict Mode and modern Chrome, 
    // rapidly calling cancel() and speak() locks up the Web Speech API.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = videoTranslations[language].langCode;
      utterance.lang = langCode;
      
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = langCode.split('-')[0];

      // 1. Find a voice that STRICTLY matches the target language (e.g., 'mr', 'ta', 'te')
      let suitableVoice = voices.find(v => 
        v.lang.startsWith(langPrefix) && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('neerja'))
      ) || voices.find(v => v.lang.startsWith(langPrefix));

      // 2. ONLY assign the voice if it is a native match for the selected language.
      // If we don't find a native voice, we intentionally DO NOT assign a fallback voice.
      // This forces the browser (Chrome/Edge) to use its own cloud-based native voice for `utterance.lang`.
      if (suitableVoice) {
        utterance.voice = suitableVoice;
      }

      // Adjust rate based on language for better clarity
      utterance.rate = langCode === 'en-IN' ? 0.85 : 0.80;
      utterance.pitch = 1.0; 
      utterance.volume = 0.95;
      
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [isVoiceEnabled, language]);

  useEffect(() => {
    if (isPlaying) {
      speak(currentSceneText.narration);
      
      const sceneDuration = scenes[step].duration;
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / sceneDuration) * 100);

        const currentScene = scenes[step];
        if (currentScene.type === 'iframe' && currentScene.scrollPattern && iframeRef.current && iframeRef.current.contentWindow) {
          const matchedScroll = currentScene.scrollPattern.find(p => Math.abs(p.time - elapsed) < interval);
          if (matchedScroll) {
            try {
              iframeRef.current.contentWindow.scrollTo({ top: matchedScroll.y, behavior: 'smooth' });
            } catch (e) {
              console.log("Iframe cross-origin block or not ready");
            }
          }
        }

        if (elapsed >= sceneDuration) {
          clearInterval(timer);
          if (step < scenes.length - 1) {
            setStep(prev => prev + 1);
            setProgress(0);
          } else {
            setIsPlaying(false);
          }
        }
      }, interval);

      return () => {
        clearInterval(timer);
        window.speechSynthesis.cancel();
      };
    }
  }, [isPlaying, step, language]);

  const handleTogglePlay = () => {
    if (!isPlaying && step === scenes.length - 1) {
      setStep(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const renderSceneContent = () => {
    const scene = scenes[step];
    
    return (
      <Box sx={{ width: '100%', height: '100%', bgcolor: '#fff', position: 'relative' }}>
        <iframe 
          ref={iframeRef}
          src={scene.route} 
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            pointerEvents: 'none',
            backgroundColor: '#ffffff'
          }} 
          title="Live App Demo"
        />
        {/* Anti-Interference Layer */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 2,
          cursor: 'default'
        }} />
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#000',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Massive Immersive Viewport */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Fade in={true} key={step} timeout={1000}>
          <Box sx={{ width: '100%', height: '100%', position: 'absolute' }}>
            {renderSceneContent()}
          </Box>
        </Fade>

        {/* Cinematic Gradient Overlays */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '150px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5
        }}/>
        
        <Box sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: '250px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5
        }}/>
      </Box>

      {/* Header Title Layered on Top */}
      <Box sx={{ position: 'absolute', top: 30, left: 40, zIndex: 10 }}>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
          {currentSceneText.title}
        </Typography>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          SCENE {step + 1} OF {scenes.length}
        </Typography>
      </Box>

      {/* Modern Control Bar & Subtitles */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        p: 3,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        
        {/* Subtitles */}
        <Typography variant="h5" sx={{ 
          color: '#fff', 
          fontWeight: 500, 
          textAlign: 'center',
          maxWidth: '1000px',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          mb: 2
        }}>
          "{currentSceneText.narration}"
        </Typography>

        {/* Controls */}
        <Paper sx={{ 
          p: 1.5,
          px: 3, 
          borderRadius: '100px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 4,
          bgcolor: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: '100%',
          maxWidth: '800px'
        }}>
          <IconButton onClick={() => setStep(0)} disabled={step === 0} sx={{ color: 'white' }}>
            <RotateCcw size={22} />
          </IconButton>

          {/* Language Selector */}
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                window.speechSynthesis.cancel();
                // Restart video from the beginning with the new language
                setStep(0);
                setProgress(0);
                setIsPlaying(true);
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                outline: 'none',
                WebkitAppearance: 'none'
              }}
            >
              {Object.keys(videoTranslations).map(lang => (
                <option key={lang} value={lang} style={{ color: 'black' }}>{lang}</option>
              ))}
            </select>
          </Box>
          
          <IconButton 
            onClick={handleTogglePlay}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              '&:hover': { bgcolor: 'primary.dark' },
              width: 56,
              height: 56,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.5)}`
            }}
          >
            {isPlaying ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} />}
          </IconButton>
          
          <IconButton onClick={() => step < scenes.length - 1 && setStep(step + 1)} sx={{ color: 'white' }}>
            <SkipForward size={22} />
          </IconButton>

          <Box sx={{ flex: 1, mx: 2 }}>
            <Slider 
              value={progress} 
              onChange={(_, val) => setProgress(val as number)}
              sx={{ 
                height: 6,
                color: 'primary.main',
                '& .MuiSlider-thumb': { display: 'none' }
              }} 
            />
          </Box>

          <IconButton onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} sx={{ color: 'white' }}>
            {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} color={theme.palette.error.main} />}
          </IconButton>

          <Button 
            variant="contained" 
            endIcon={<ArrowRight size={18} />}
            onClick={() => navigate('/')}
            sx={{ borderRadius: '100px', textTransform: 'none', px: 3, fontWeight: 'bold' }}
          >
            Exit
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default VideoDemoPage;
