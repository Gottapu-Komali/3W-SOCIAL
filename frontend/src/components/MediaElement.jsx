import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton, IconButton } from '@mui/material';
import { PlayArrowRounded, VolumeOffRounded, VolumeUpRounded } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MediaElement: A production-ready, unified media handler
 * Features: Lazy loading, Skeletons, Autoplay logic, Mute controls, and Layout stability.
 */
const MediaElement = ({ src, type, isMuted = true, autoPlay = true, onClick, priority = false }) => {
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [localMuted, setLocalMuted] = useState(isMuted);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current || type !== 'video') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (autoPlay) {
                        videoRef.current.play().catch(() => { });
                        setPlaying(true);
                    }
                } else {
                    videoRef.current.pause();
                    setPlaying(false);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, [type, autoPlay]);

    const handleTogglePlay = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setPlaying(!playing);
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = getYouTubeId(src);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: 'inherit',
                overflow: 'hidden',
                aspectRatio: ytId ? '16/9' : (type === 'video' ? 'unset' : 'auto'),
                minHeight: loading ? 300 : 'auto'
            }}
            onClick={onClick}
        >
            <AnimatePresence>
                {loading && !ytId && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }}
                    >
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {ytId ? (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
            ) : type === 'video' ? (
                <Box sx={{ position: 'relative', width: '100%', display: 'flex' }}>
                    <video
                        ref={videoRef}
                        src={src}
                        muted={localMuted}
                        loop
                        playsInline
                        onLoadedData={() => setLoading(false)}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        style={{
                            width: '100%',
                            maxHeight: '70vh',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />

                    {!playing && !loading && (
                        <Box
                            onClick={handleTogglePlay}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'rgba(0,0,0,0.4)',
                                p: 2,
                                borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            <PlayArrowRounded sx={{ fontSize: 48, color: '#fff' }} />
                        </Box>
                    )}

                    <IconButton
                        onClick={(e) => { e.stopPropagation(); setLocalMuted(!localMuted); }}
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            color: '#fff',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 10,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                        }}
                    >
                        {localMuted ? <VolumeOffRounded /> : <VolumeUpRounded />}
                    </IconButton>
                </Box>
            ) : (
                <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loading ? 0 : 1 }}
                    src={src}
                    alt=""
                    onLoad={() => setLoading(false)}
                    style={{
                        width: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                />
            )}
        </Box>
    );
};

export default MediaElement;
