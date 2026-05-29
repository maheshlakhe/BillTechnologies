import React, { useCallback, useRef, useState, useEffect, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Skeleton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Share as ShareIcon,
  Download as DownloadIcon,
  ChevronLeft,
  ChevronRight,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import useEmblaCarousel from 'embla-carousel-react';
import { domToPng } from 'modern-screenshot';
import { resolveFileUrl } from '../../utils/url';
import { useNotification } from '../../contexts/NotificationContext';

// --- Types & Constants ---
interface BusinessCardProps {
  user: any;
  design: string;
  cardRef?: (el: HTMLDivElement | null) => void;
}

const DESIGNS = [
  { id: 'vyapar-maroon', name: 'Mandala Maroon' },
  { id: 'vyapar-navy', name: 'Royal Navy' },
  { id: 'vyapar-emerald', name: 'Forest Emerald' },
  { id: 'vyapar-gold', name: 'Traditional Gold' },
  { id: 'vyapar-purple', name: 'Imperial Purple' },
  { id: 'vyapar-black', name: 'Stealth Black' },
  { id: 'vyapar-cyan', name: 'Oceanic Cyan' },
  { id: 'vyapar-rose', name: 'Ruby Rose' },
  { id: 'vyapar-teal', name: 'Modern Teal' },

];

const PRE_RENDER_DELAY = 1500; // Delay after mount to start pre-rendering
const GENERATION_TIMEOUT = 10000; // 10s timeout for generation

// --- Memoized UI Patterns ---

const MandalaPattern = memo(({ color }: { color: string }) => (
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.15 }}>
    <Box sx={{ position: 'absolute', left: '-80px', top: '50%', transform: 'translateY(-50%)', width: '220px', height: '220px', borderRadius: '50%', border: `4px solid ${color}`, opacity: 0.8 }} />
    <Box sx={{ position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)', width: '220px', height: '220px', borderRadius: '50%', border: `4px solid ${color}`, opacity: 0.8 }} />
  </Box>
));

const FloralPattern = memo(({ color }: { color: string }) => (
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.1, backgroundImage: `radial-gradient(circle at 2px 2px, ${color} 1.5px, transparent 0)`, backgroundSize: '20px 20px' }} />
));

// --- Share Fallback Modal ---

const ShareFallbackModal = memo(({
  open,
  onClose,
  onDownload,
  file,
  companyName,
  designId
}: {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  file: File | null;
  companyName: string;
  designId: string | null;
}) => {
  const { showSuccess } = useNotification();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file && open) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }
  }, [file, open]);

  const copyToClipboard = async () => {
    if (!file) return;
    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [file.type]: file })
        ]);
        showSuccess('Card image copied to clipboard!');
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (err) {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      showSuccess('Profile link copied to clipboard!');
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out the digital visiting card for ${companyName}!`);
    const url = window.location.href;
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: '24px', width: '100%', maxWidth: '400px', p: 1, overflow: 'hidden' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>Share Your Card</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2 }}>
        {previewUrl && (
          <Box sx={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid #eee'
          }}>
            <Box component="img" src={previewUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', fontWeight: 500 }}>
          Native sharing is limited on this browser. Use the options below to share your card.
        </Typography>

        <Stack spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<WhatsAppIcon />}
            onClick={shareToWhatsApp}
            sx={{
              bgcolor: '#25D366',
              '&:hover': { bgcolor: '#128C7E' },
              borderRadius: '14px',
              py: 1.5,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Share on WhatsApp
          </Button>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              sx={{ borderRadius: '14px', py: 1.5, fontWeight: 700, textTransform: 'none' }}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={copyToClipboard}
              sx={{ borderRadius: '14px', py: 1.5, fontWeight: 700, textTransform: 'none' }}
            >
              Copy
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: 'text.secondary' }}>Close</Button>
      </Box>
    </Dialog>
  );
});

// --- Main Card Design Component ---

const CardDesign = memo(({ user, design, cardRef }: BusinessCardProps) => {
  const businessName = user?.companyName || 'BUSINESS NAME';
  const ownerName = user?.name || 'Owner Name';
  const phone = user?.phone || '9999999999';
  const email = user?.email || 'email@example.com';
  const address = user?.address || 'Business Address';
  const gst = user?.gstNumber || '';
  const logo = user?.avatar;

  const commonStyles = useMemo(() => ({
    width: '100%',
    maxWidth: '400px',
    aspectRatio: '1.58/1',
    borderRadius: '16px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
    flexShrink: 0,
    margin: '0 auto',
    cursor: 'default',
    userSelect: 'none' as const,
    fontFamily: '"Outfit", sans-serif',
    backgroundColor: '#fff',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, opacity',
    textRendering: 'optimizeLegibility' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    '@media (hover: hover)': {
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
      }
    }
  }), []);

  const renderLogo = () => {
    if (logo) {
      return (
        <Box
          component="img"
          src={resolveFileUrl(logo)}
          alt="Logo"
          crossOrigin="anonymous"
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
          sx={{ width: 44, height: 44, borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.3)', bgcolor: '#fff', zIndex: 10 }}
        />
      );
    }
    return (
      <Box sx={{
        width: 44, height: 44, borderRadius: '4px', bgcolor: 'rgba(255,255,255,0.1)',
        border: '1.5px dashed rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 10
      }}>
        <AddIcon sx={{ color: '#fff', fontSize: 14 }} />
        <Typography sx={{ color: '#fff', fontSize: '0.4rem', fontWeight: 700 }}>Logo</Typography>
      </Box>
    );
  };

  const renderTraditionalCard = (primary: string, pattern: 'mandala' | 'floral') => {
    return (
      <Box ref={cardRef} sx={{ ...commonStyles, bgcolor: primary }} data-design-id={design}>
        {pattern === 'mandala' && <MandalaPattern color="#fff" />}
        {pattern === 'floral' && <FloralPattern color="#fff" />}
        <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${primary} 0%, rgba(0,0,0,0.4) 100%)`, zIndex: 0 }} />

        <Box sx={{ p: '20px 25px', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            {renderLogo()}
            <Typography sx={{ fontWeight: 950, fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: '#fff', letterSpacing: 1, textTransform: 'uppercase', flex: 1, px: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {businessName}
            </Typography>
            <Box sx={{ width: 44 }} />
          </Box>

          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', width: '60%', mx: 'auto', mb: 2 }} />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: '#fff', fontWeight: 800, mb: 0.5, letterSpacing: 0.5 }}>{ownerName}</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 'clamp(10px, 2vw, 14px)', color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#fff', fontWeight: 600 }}>{phone}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 'clamp(10px, 2vw, 14px)', color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#fff', fontWeight: 600 }}>{email}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '90%' }}>
              <LocationIcon sx={{ fontSize: 'clamp(10px, 2vw, 14px)', color: 'rgba(255,255,255,0.8)' }} />
              <Typography sx={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.8rem)', color: '#fff', fontWeight: 600, lineHeight: 1.2 }}>{address}</Typography>
            </Box>
          </Box>

          {gst && (
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', mt: 1 }}>
              GSTIN: {gst}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  switch (design) {
    case 'vyapar-maroon': return renderTraditionalCard('#5d1111', 'mandala');
    case 'vyapar-navy': return renderTraditionalCard('#0f205a', 'mandala');
    case 'vyapar-emerald': return renderTraditionalCard('#115a35', 'floral');
    case 'vyapar-gold': return renderTraditionalCard('#5a4811', 'mandala');
    case 'vyapar-purple': return renderTraditionalCard('#35115a', 'floral');
    case 'vyapar-black': return renderTraditionalCard('#1a1a1a', 'mandala');
    case 'vyapar-cyan': return renderTraditionalCard('#007175', 'floral');
    case 'vyapar-rose': return renderTraditionalCard('#9c105a', 'mandala');
    case 'vyapar-teal': return renderTraditionalCard('#005d4e', 'floral');
    case 'vyapar-classic':
      return (
        <Box ref={cardRef} sx={{ ...commonStyles, bgcolor: '#fff', border: '1px solid #eee' }} data-design-id={design}>
          <Box sx={{ height: '45px', bgcolor: '#d32f2f', width: '100%', display: 'flex', alignItems: 'center', px: 3, justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 950, fontSize: '1.2rem', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{businessName}</Typography>
          </Box>
          <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'center' }}>
              {logo ? (
                <Box
                  component="img"
                  src={resolveFileUrl(logo)}
                  crossOrigin="anonymous"
                  sx={{ width: 44, height: 44, borderRadius: '4px', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ width: 44, height: 44, bgcolor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BusinessIcon sx={{ color: '#ccc' }} />
                </Box>
              )}
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#333' }}>{ownerName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#555', display: 'flex', alignItems: 'center', gap: 0.8 }}><PhoneIcon sx={{ fontSize: 'clamp(10px, 2vw, 12px)' }} /> {phone}</Typography>
              <Typography sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#555', display: 'flex', alignItems: 'center', gap: 0.8 }}><EmailIcon sx={{ fontSize: 'clamp(10px, 2vw, 12px)' }} /> {email}</Typography>
              <Typography sx={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#555', display: 'flex', alignItems: 'center', gap: 0.8 }}><LocationIcon sx={{ fontSize: 'clamp(10px, 2vw, 12px)' }} /> {address}</Typography>
            </Box>
          </Box>
        </Box>
      );
    default: return null;
  }
});

// --- Main Slider Component ---

export const BusinessCardSlider: React.FC<{ user: any }> = ({ user }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', containScroll: 'trimSnaps', dragFree: true });
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [preRenderedFiles, setPreRenderedFiles] = useState<Record<string, File>>({});
  const [isPreRendering, setIsPreRendering] = useState(false);
  const [fallbackModal, setFallbackModal] = useState<{ open: boolean; designId: string | null }>({ open: false, designId: null });

  const { showSuccess, showError } = useNotification();

  const generationQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);
  const processedIds = useRef<Set<string>>(new Set());
  const abortControllers = useRef<Record<string, AbortController>>({});

  /**
   * Generates a high-quality PNG image from a DOM element.
   * Uses html-to-image with proper synchronization and scale.
   */
  const generateCardImage = useCallback(async (designId: string, retryCount = 0): Promise<File | null> => {
    const element = cardRefs.current[designId];
    if (!element) return null;

    // Use AbortController for cancellation
    const controller = new AbortController();
    abortControllers.current[designId] = controller;

    try {
      // Ensure fonts are loaded before generation
      if (typeof document !== 'undefined' && (document as any).fonts) {
        await (document as any).fonts.ready;
      }

      // Add a small safety delay for any pending re-renders
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await Promise.race([
        domToPng(element, {
          scale: 4, // Ultra HD (4x original size)
          quality: 1,
          onCloneNode: (node) => {
            if (node instanceof HTMLCanvasElement) {
              const ctx = node.getContext('2d');
              if (ctx) {
                ctx.imageSmoothingEnabled = false;
                // @ts-ignore
                ctx.webkitImageSmoothingEnabled = false;
                // @ts-ignore
                ctx.mozImageSmoothingEnabled = false;
              }
            }
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), GENERATION_TIMEOUT))
      ]);

      if (!dataUrl) {
        throw new Error('Generated image is invalid or empty');
      }

      // Convert dataUrl to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName = `${user?.companyName?.replace(/[^a-z0-9]/gi, '_') || 'Business'}_Card_${designId}.png`;
      return new File([blob], fileName, { type: 'image/png' });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn(`[BusinessCard] Generation failed (Attempt ${retryCount + 1}):`, err);
        if (retryCount < 2) {
          // Automatic retry once
          await new Promise(resolve => setTimeout(resolve, 500));
          return generateCardImage(designId, retryCount + 1);
        }
      }
      return null;
    } finally {
      delete abortControllers.current[designId];
    }
  }, [user?.companyName]);

  /**
   * Pre-generates images in the background when the page is idle.
   */
  const preloadCardImage = useCallback(async () => {
    if (isProcessing.current || generationQueue.current.length === 0) return;

    isProcessing.current = true;
    setIsPreRendering(true);

    const processNext = async () => {
      if (generationQueue.current.length === 0) {
        isProcessing.current = false;
        setIsPreRendering(false);
        return;
      }

      const designId = generationQueue.current.shift();
      if (designId && !processedIds.current.has(designId)) {
        const file = await generateCardImage(designId);
        if (file) {
          processedIds.current.add(designId);
          setPreRenderedFiles(prev => ({ ...prev, [designId]: file }));
        }
      }

      // Schedule next item on next idle or after a short break
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => processNext());
      } else {
        setTimeout(processNext, 500); // 500ms between background generations to keep UI smooth
      }
    };

    processNext();
  }, [generateCardImage]);

  /**
   * Cleans up memory used by pre-rendered files if needed.
   */
  const cleanupBlobUrls = useCallback(() => {
    // In this implementation, we store File objects (blobs) in state.
    // They are automatically garbage collected by the browser when the component unmounts.
    // However, if we were using URL.createObjectURL for caching, we would revoke them here.
    processedIds.current.clear();
    setPreRenderedFiles({});
    generationQueue.current = [];
  }, []);

  // Initial Pre-render trigger
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      const toQueue = DESIGNS.map(d => d.id).filter(id => !processedIds.current.has(id));
      if (toQueue.length > 0) {
        generationQueue.current = [...generationQueue.current, ...toQueue];
        preloadCardImage();
      }
    }, PRE_RENDER_DELAY);

    return () => {
      clearTimeout(timer);
      cleanupBlobUrls();
      Object.values(abortControllers.current).forEach(c => c.abort());
    };
  }, [user, preloadCardImage, cleanupBlobUrls]);

  // --- Handlers ---

  const downloadFallback = useCallback((designId: string) => {
    const file = preRenderedFiles[designId];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.download = file.name;
    link.href = url;
    link.click();

    // Safety delay before revoking
    setTimeout(() => URL.revokeObjectURL(url), 200);
    showSuccess('Card downloaded successfully!');
  }, [preRenderedFiles, showSuccess]);

  /**
   * Handles the sharing action. Tries native share first, then falls back to modal.
   */
  const shareCard = useCallback(async (designId: string, action: 'download' | 'share') => {
    let file: File | null = preRenderedFiles[designId] || null;

    // On-demand generation if not ready
    if (!file) {
      setGenerating(designId);
      try {
        const generatedFile = await generateCardImage(designId);
        if (generatedFile) {
          file = generatedFile;
          setPreRenderedFiles(prev => ({ ...prev, [designId]: generatedFile }));
          processedIds.current.add(designId);
        }
      } finally {
        setGenerating(null);
      }
    }

    if (!file) {
      showError('Unable to prepare card. Please check your connection.');
      return;
    }

    if (action === 'download') {
      downloadFallback(designId);
      return;
    }

    // Attempt Native Share
    const shareData: any = {
      files: [file],
      title: `${user?.companyName || 'Business'} Visiting Card`,
      text: `Digital Visiting Card for ${user?.companyName || 'Business'}.`,
    };

    // Use typeof check to avoid TS warning about functions that are "always defined"
    const hasShare = typeof navigator !== 'undefined' && !!navigator.share;
    const hasCanShare = typeof navigator !== 'undefined' && !!navigator.canShare;
    const isSupported = hasShare && hasCanShare && navigator.canShare(shareData);

    if (isSupported) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Share] Native share failed:', err);
          setFallbackModal({ open: true, designId });
        }
      }
    } else {
      setFallbackModal({ open: true, designId });
    }
  }, [generateCardImage, preRenderedFiles, user?.companyName, downloadFallback, showError]);

  const onPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <Box sx={{ position: 'relative', width: '100%', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, px: { xs: 2, sm: 0 } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 950, color: 'text.primary', letterSpacing: -1.5 }}>
            PREMIUM VISITING CARDS
          </Typography>
          {isPreRendering && (
            <Fade in={isPreRendering}>
              <Typography variant="caption" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, fontWeight: 700 }}>
                <CircularProgress size={12} thickness={6} color="inherit" /> OPTIMIZING HD DESIGNS...
              </Typography>
            </Fade>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton
            onClick={onPrev}
            size="medium"
            sx={{
              border: '2px solid #eee',
              transition: 'all 0.2s',
              p: 1.25, // Ensures ~44px
              '@media (hover: hover)': {
                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.1)' }
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={onNext}
            size="medium"
            sx={{
              border: '2px solid #eee',
              transition: 'all 0.2s',
              p: 1.25, // Ensures ~44px
              '@media (hover: hover)': {
                '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.1)' }
              }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <Box ref={emblaRef} sx={{ overflow: 'hidden', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {DESIGNS.map((design) => (
            <Box key={design.id} sx={{ flex: '0 0 auto', position: 'relative', py: 1 }}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'transparent', position: 'relative' }}>
                {generating === design.id && (
                  <Box sx={{
                    position: 'absolute', inset: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '16px',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <CircularProgress size={44} thickness={4} />
                  </Box>
                )}

                <CardDesign
                  user={user}
                  design={design.id}
                  cardRef={(el) => { cardRefs.current[design.id] = el; }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, px: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {design.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Tooltip title="Download HD">
                      <IconButton
                        size="small"
                        onClick={() => shareCard(design.id, 'download')}
                        disabled={generating === design.id}
                        sx={{
                          border: '1.5px solid #eee',
                          p: 1.25, // Ensures ~44px for touch
                          transition: 'none',
                          willChange: 'transform, opacity',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          '@media (hover: hover)': {
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: '#fff',
                              borderColor: 'primary.main',
                              transition: 'all 100ms ease-out'
                            }
                          }
                        }}
                      >
                        <DownloadIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Card">
                      <IconButton
                        size="small"
                        onClick={() => shareCard(design.id, 'share')}
                        disabled={generating === design.id}
                        sx={{
                          border: '1.5px solid #eee',
                          p: 1.25, // Ensures ~44px for touch
                          transition: 'none',
                          willChange: 'transform, opacity',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          '@media (hover: hover)': {
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: '#fff',
                              borderColor: 'primary.main',
                              transition: 'all 100ms ease-out'
                            }
                          }
                        }}
                      >
                        <ShareIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Fallback Share Modal */}
      <ShareFallbackModal
        open={fallbackModal.open}
        designId={fallbackModal.designId}
        onClose={() => setFallbackModal({ open: false, designId: null })}
        onDownload={() => fallbackModal.designId && downloadFallback(fallbackModal.designId)}
        file={fallbackModal.designId ? preRenderedFiles[fallbackModal.designId] : null}
        companyName={user?.companyName || 'Business'}
      />
    </Box>
  );
};

export default memo(BusinessCardSlider);
