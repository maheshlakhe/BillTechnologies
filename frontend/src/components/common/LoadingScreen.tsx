import React from 'react';
import { Box, Typography, keyframes, CircularProgress, alpha } from '@mui/material';

// --- PREMIUM NEOMORPHIC ANIMATIONS ---

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/**
 * Premium Full Page Circular Loading Screen
 * Guaranteed perfectly round indicators using aspect-ratio and CircularProgress.
 */
export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Excellence in Every Transaction' }) => {

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        background: 'linear-gradient(135deg, #020617 0%, #0c121e 100%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '150%',
          height: '155%',
          background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.03) 0%, transparent 60%)',
          animation: `${pulse} 10s infinite ease-in-out`,
        }
      }}
    >
      {/* PERFECT CIRCULAR CORE */}
      <Box sx={{ 
        position: 'relative', 
        width: 220, 
        height: 220, 
        flexShrink: 0,
        aspectRatio: '1/1',
        animation: `${float} 6s infinite ease-in-out` 
      }}>
        {/* Outer Orbital Ring */}
        <CircularProgress
          variant="determinate"
          value={30}
          size={220}
          thickness={1}
          sx={{
            position: 'absolute',
            color: alpha('#FFD700', 0.2),
            transform: 'rotate(0deg)',
          }}
        />
        <CircularProgress
          variant="indeterminate"
          size={220}
          thickness={1}
          sx={{
            position: 'absolute',
            color: '#FFD700',
            animationDuration: '3s',
            strokeLinecap: 'round',
            '& .MuiCircularProgress-circle': {
              strokeDasharray: '80px, 200px',
            },
          }}
        />

        {/* Inner Counter-Rotating Ring */}
        <Box sx={{ 
          position: 'absolute', 
          top: 30, left: 30, right: 30, bottom: 30, 
          borderRadius: '50%',
          border: '1px dashed rgba(255,255,255,0.1)',
          animation: `${rotate} 10s linear infinite reverse`
        }} />

        {/* LOGO BOX - Guaranteed Square for Perfect Circle */}
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 40,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(255, 215, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            aspectRatio: '1/1' // FORCE SQUARE
          }}
        >
           <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              transform: 'scale(1)',
              animation: `${pulse} 4s infinite ease-in-out`
            }}
          >
            <img 
              src="/logo.svg" 
              alt="Logo" 
              style={{ width: '70%', height: '70%', objectFit: 'contain' }} 
            />
          </Box>
        </Box>
      </Box>

      {/* BRANDING TEXT */}
      <Box sx={{ mt: 6, textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: 10,
            color: '#fff',
            textTransform: 'uppercase',
            mb: 1.5,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            fontFamily: 'Outfit, sans-serif',
            background: 'linear-gradient(to right, #fff, #FFD700, #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            animation: `${shimmer} 4s linear infinite`,
          }}
        >
          BillSoft
        </Typography>
        
        <Typography
          variant="subtitle2"
          sx={{
            color: alpha('#fff', 0.5),
            letterSpacing: 4,
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
          }}
        >
          {message}
        </Typography>

        {/* LOADING DOTS */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 3 }}>
           {[0, 1, 2].map((i) => (
             <Box 
               key={i}
               sx={{ 
                 width: 8, 
                 height: 8, 
                 borderRadius: '50%', 
                 bgcolor: '#FFD700',
                 animation: `${pulse} 1.5s infinite ease-in-out`,
                 animationDelay: `${i * 0.25}s`,
                 boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
               }} 
             />
           ))}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Modern Circular Section Loader
 */
export const SectionLoader: React.FC<{ message?: string; transparent?: boolean }> = ({ 
  message = 'Processing Data...', 
  transparent = false 
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        minHeight: '350px',
        bgcolor: transparent ? 'transparent' : alpha('#fff', 0.01),
        borderRadius: 4,
        position: 'relative'
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        width: 90, 
        height: 90, 
        flexShrink: 0,
        aspectRatio: '1/1',
        mb: 4 
      }}>
        {/* Main Circular Spinner - Guaranteed Square */}
        <CircularProgress
          size={90}
          thickness={3}
          sx={{
            color: '#FFD700',
            strokeLinecap: 'round',
            '& .MuiCircularProgress-circle': {
              animationDuration: '1.5s',
            },
          }}
        />
        
        {/* Pulsing Center Icon/Logo Backdrop */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: alpha('#FFD700', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${pulse} 2s infinite ease-in-out`,
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}
        >
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
             <img src="/logo.svg" alt="" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
          </Box>
        </Box>
      </Box>
      
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 800,
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontSize: '0.65rem',
          opacity: 0.6
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;

