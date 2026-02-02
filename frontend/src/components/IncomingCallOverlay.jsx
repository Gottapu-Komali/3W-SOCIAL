import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Paper, Fab } from '@mui/material';
import { Call, CallEnd, Videocam } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const IncomingCallOverlay = () => {
    const { user } = useAuth();
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        if (!user) return;

        const checkCalls = async () => {
            try {
                const { data } = await API.get('/notifications');
                // Find a CALL_INCOMING notification created in the last 20 seconds that is unread
                const recentCall = data.find(n =>
                    n.type === 'CALL_INCOMING' &&
                    !n.read &&
                    (new Date() - new Date(n.createdAt)) < 20000
                );

                if (recentCall && (!activeCall || activeCall._id !== recentCall._id)) {
                    setActiveCall(recentCall);
                }
            } catch (err) {
                console.error('Call check failed', err);
            }
        };

        const interval = setInterval(checkCalls, 4000); // Check every 4 seconds for a "live" feel
        return () => clearInterval(interval);
    }, [user, activeCall]);

    const handleDecline = async () => {
        if (!activeCall) return;
        try {
            await API.put(`/notifications/${activeCall._id}/read`); // Simple way to "dismiss"
            setActiveCall(null);
        } catch (err) {
            setActiveCall(null);
        }
    };

    const handleAccept = () => {
        // In a real app, this would connect the WebRTC stream
        // For now, it takes you to the chat to "talk"
        window.location.href = `/chat?userId=${activeCall.sender._id}&username=${activeCall.sender.username}`;
    };

    if (!activeCall) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 20, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}
            >
                <Paper
                    sx={{
                        p: 2,
                        width: '90%',
                        maxWidth: 400,
                        borderRadius: '24px',
                        bgcolor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        pointerEvents: 'auto'
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                position: 'absolute',
                                inset: -4,
                                border: '2px solid #818CF8',
                                borderRadius: '50%'
                            }}
                        />
                        <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', fontWeight: 900 }}>
                            {activeCall.sender.username[0].toUpperCase()}
                        </Avatar>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                            {activeCall.sender.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 800, animation: 'pulse 1.5s infinite' }}>
                            RINGING...
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Fab
                            size="small"
                            color="error"
                            onClick={handleDecline}
                            sx={{ width: 40, height: 40, minHeight: 40 }}
                        >
                            <CallEnd />
                        </Fab>
                        <Fab
                            size="small"
                            color="success"
                            onClick={handleAccept}
                            sx={{ width: 40, height: 40, minHeight: 40, bgcolor: '#10B981' }}
                        >
                            <Call />
                        </Fab>
                    </Box>
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
};

export default IncomingCallOverlay;
