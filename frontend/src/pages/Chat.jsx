import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Grid, Paper, Box, Typography, Avatar, TextField, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider, Badge, Menu, CircularProgress } from '@mui/material';
import { Send, ArrowBack, MoreVert, Chat as ChatIcon, AutoAwesome, AttachFile, Image as ImageIcon, SentimentSatisfiedAlt, Download, InsertDriveFile, Close, Mic, MicOff, Reply, PlayArrow, Pause, Delete, Call, Videocam, CallEnd, VolumeUp, VolumeOff, VideocamOff, FlipCameraIos, ScreenShare, Settings } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API, { BASE_URL } from '../api/axios';
import MediaElement from '../components/MediaElement';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Chat = () => {
    const { user: currentUser } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [attachmentType, setAttachmentType] = useState(null);
    const [emojiAnchor, setEmojiAnchor] = useState(null);
    const [stickerAnchor, setStickerAnchor] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [friends, setFriends] = useState([]);

    // Call state
    const [callData, setCallData] = useState({ active: false, type: 'audio', status: 'idle', duration: 0 });
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isSpeakerOff, setIsSpeakerOff] = useState(false);
    const callIntervalRef = useRef(null);

    // Initial user from query params
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userId = queryParams.get('userId');
        const username = queryParams.get('username');

        if (userId && username && conversations.length > 0) {
            const existing = conversations.find(c => c._id === userId);
            setSelectedUser(existing || { _id: userId, username: username });
        } else if (userId && username && !selectedUser) {
            setSelectedUser({ _id: userId, username: username });
        }
    }, [location.search, conversations]);

    const STICKERS = [
        { id: 's1', url: 'https://cdn-icons-png.flaticon.com/512/2274/2274543.png' },
        { id: 's2', url: 'https://cdn-icons-png.flaticon.com/512/2274/2274551.png' },
        { id: 's3', url: 'https://cdn-icons-png.flaticon.com/512/2274/2274556.png' },
        { id: 's4', url: 'https://cdn-icons-png.flaticon.com/512/4359/4359657.png' },
        { id: 's5', url: 'https://cdn-icons-png.flaticon.com/512/4359/4359674.png' },
    ];

    const EMOJIS = ['❤️', '🔥', '✨', '🚀', '🙌', '😂', '😍', '🤔', '👀', '💯', '🌈', '🍭'];

    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await API.get('/messages/conversations');
            setConversations(data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFriends = useCallback(async () => {
        try {
            const { data } = await API.get('/users/friends');
            setFriends(data);
        } catch (err) {
            console.error('Error fetching friends:', err);
        }
    }, []);

    const fetchMessages = useCallback(async (userId) => {
        try {
            const { data } = await API.get(`/messages/${userId}`);
            setMessages(data);
            scrollToBottom();
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        fetchFriends();
    }, [fetchConversations, fetchFriends]);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser, fetchMessages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAttachment(file);
        const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
        setAttachmentType(type);
        if (type !== 'document') {
            setAttachmentPreview(URL.createObjectURL(file));
        } else {
            setAttachmentPreview(null);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        setAttachmentType(null);
    };

    const handleEmojiClick = (emoji) => {
        setMessageText(prev => prev + emoji);
        setEmojiAnchor(null);
    };

    const handleStickerSelect = async (sticker) => {
        setStickerAnchor(null);
        try {
            const response = await API.post('/messages', {
                recipientId: selectedUser._id,
                text: sticker.url,
                mediaType: 'sticker'
            });
            setMessages(prev => [...prev, response.data]);
            scrollToBottom();
        } catch (err) {
            console.error('Sticker send failed', err);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
                setAttachment(file);
                setAttachmentType('audio');
                setAttachmentPreview(null);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error starting recording:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const confirmDeleteMessage = (messageId) => {
        setMessageToDelete(messageId);
    };

    const handleDeleteMessage = async () => {
        if (!messageToDelete) return;
        try {
            await API.delete(`/messages/${messageToDelete}`);
            setMessages(prev => prev.filter(m => m._id !== messageToDelete));
            setMessageToDelete(null);
        } catch (err) {
            console.error('Delete message failed', err);
        }
    };

    const handleClearChat = async () => {
        if (!selectedUser) return;
        try {
            await API.delete(`/messages/conversation/${selectedUser._id}`);
            setMessages([]);
            setClearConfirmOpen(false);
            setHeaderMenuAnchor(null);
            fetchConversations();
        } catch (err) {
            console.error('Clear chat failed', err);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if ((!messageText.trim() && !attachment) || !selectedUser) return;

        const formData = new FormData();
        formData.append('recipientId', selectedUser._id);
        formData.append('text', messageText.trim());
        if (attachment) {
            formData.append('media', attachment);
        }
        if (replyingTo) {
            formData.append('replyToId', replyingTo._id);
        }

        setMessageText('');
        removeAttachment();
        setReplyingTo(null);

        try {
            const { data } = await API.post('/messages', formData);
            setMessages(prev => [...prev, data]);
            fetchConversations();
            scrollToBottom();
        } catch (err) {
            console.error('Send failed', err);
        }
    };

    // Call Controls Implementation
    const startCall = async (type) => {
        setCallData({ active: true, type, status: 'dialing', duration: 0 });

        // Log to history
        try {
            await API.post('/notifications/call', {
                recipientId: selectedUser._id,
                type: 'CALL_OUTGOING'
            });
        } catch (err) {
            console.error('Failed to log call', err);
        }

        setTimeout(() => {
            setCallData(prev => ({ ...prev, status: 'connected' }));
            callIntervalRef.current = setInterval(() => {
                setCallData(prev => ({ ...prev, duration: prev.duration + 1 }));
            }, 1000);
        }, 2000);
    };

    const endCall = () => {
        setCallData(prev => ({ ...prev, status: 'ended' }));
        clearInterval(callIntervalRef.current);
        setTimeout(() => {
            setCallData({ active: false, type: 'audio', status: 'idle', duration: 0 });
        }, 1500);
    };

    const CallOverlay = () => {
        if (!callData.active) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2500,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(30px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                }}
            >
                <AnimatePresence mode="wait">
                    {callData.status === 'dialing' ? (
                        <motion.div
                            key="dialing"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            style={{ textAlign: 'center' }}
                        >
                            <Box sx={{ position: 'relative', mb: 4, width: 160, height: 160, mx: 'auto' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        border: '4px solid rgba(99, 102, 241, 0.5)',
                                        borderRadius: '50%'
                                    }}
                                />
                                <Avatar sx={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)', fontSize: '3.5rem', fontWeight: 900 }}>
                                    {selectedUser?.username[0].toUpperCase()}
                                </Avatar>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{selectedUser?.username}</Typography>
                            <Typography sx={{ color: 'primary.light', fontWeight: 800, letterSpacing: 2 }}>{callData.type === 'video' ? 'VIDEO CALLING...' : 'CALLING...'}</Typography>
                        </motion.div>
                    ) : callData.status === 'connected' ? (
                        <motion.div
                            key="connected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {callData.type === 'video' ? (
                                <Box sx={{ position: 'absolute', inset: 0 }}>
                                    <Box sx={{ height: '100%', width: '100%', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        <Avatar sx={{ width: 120, height: 120, opacity: 0.1, background: '#fff' }}>{selectedUser?.username[0]}</Avatar>
                                        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.8))' }} />
                                        <Typography sx={{ position: 'absolute', bottom: 180, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{selectedUser?.username} is in the call</Typography>
                                    </Box>
                                    <Paper sx={{ position: 'absolute', top: 40, right: 30, width: 140, height: 200, borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: 24, bgcolor: '#111' }}>
                                        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>Your Camera</Typography>
                                        </Box>
                                    </Paper>
                                    <Box sx={{ position: 'absolute', top: 40, left: 30, textAlign: 'left' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedUser?.username}</Typography>
                                        <Typography sx={{ color: 'primary.light', fontWeight: 700 }}>{formatDuration(callData.duration)}</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar sx={{ width: 120, height: 120, mb: 4, mx: 'auto', background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)', boxShadow: '0 20px 50px rgba(79, 70, 229, 0.4)' }}>
                                        {selectedUser?.username[0].toUpperCase()}
                                    </Avatar>
                                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>{selectedUser?.username}</Typography>
                                    <Typography sx={{ color: 'primary.light', fontSize: '1.5rem', fontWeight: 800 }}>{formatDuration(callData.duration)}</Typography>
                                </Box>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ended"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 900, color: '#F43F5E' }}>CALL ENDED</Typography>
                            <Typography sx={{ mt: 2, color: '#94A3B8' }}>Total duration: {formatDuration(callData.duration)}</Typography>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Box sx={{ position: 'absolute', bottom: 60, display: 'flex', gap: 2.5, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', p: 2, borderRadius: '40px', backdropFilter: 'blur(20px)' }}>
                    <IconButton
                        onClick={() => setIsMicMuted(!isMicMuted)}
                        sx={{ bgcolor: isMicMuted ? '#F43F5E' : 'rgba(255,255,255,0.1)', color: '#fff', p: 2, '&:hover': { bgcolor: isMicMuted ? '#E11D48' : 'rgba(255,255,255,0.2)' } }}
                    >
                        {isMicMuted ? <MicOff sx={{ fontSize: 24 }} /> : <Mic sx={{ fontSize: 24 }} />}
                    </IconButton>

                    <IconButton
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        sx={{ bgcolor: isCameraOff ? '#F43F5E' : 'rgba(255,255,255,0.1)', color: '#fff', p: 2, display: callData.type === 'video' ? 'flex' : 'none', '&:hover': { bgcolor: isCameraOff ? '#E11D48' : 'rgba(255,255,255,0.2)' } }}
                    >
                        {isCameraOff ? <VideocamOff sx={{ fontSize: 24 }} /> : <Videocam sx={{ fontSize: 24 }} />}
                    </IconButton>

                    <IconButton onClick={endCall} sx={{ bgcolor: '#F43F5E', color: '#fff', p: 3, boxShadow: '0 10px 30px rgba(244, 63, 94, 0.4)', '&:hover': { bgcolor: '#E11D48', scale: 1.1 } }}>
                        <CallEnd sx={{ fontSize: 32 }} />
                    </IconButton>

                    <IconButton
                        onClick={() => setIsSpeakerOff(!isSpeakerOff)}
                        sx={{ bgcolor: isSpeakerOff ? '#F43F5E' : 'rgba(255,255,255,0.1)', color: '#fff', p: 2, '&:hover': { bgcolor: isSpeakerOff ? '#E11D48' : 'rgba(255,255,255,0.2)' } }}
                    >
                        {isSpeakerOff ? <VolumeOff sx={{ fontSize: 24 }} /> : <VolumeUp sx={{ fontSize: 24 }} />}
                    </IconButton>

                    <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', p: 2, display: callData.type === 'video' ? 'flex' : 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <FlipCameraIos sx={{ fontSize: 24 }} />
                    </IconButton>
                </Box>

                <Box sx={{ position: 'absolute', bottom: 160, display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<ScreenShare />}
                        sx={{ color: '#94A3B8', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2 }}
                    >
                        Share Screen
                    </Button>
                    <IconButton sx={{ color: '#94A3B8' }}><Settings /></IconButton>
                </Box>
            </motion.div>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 0, md: 4 }, px: { xs: 0, md: 2 }, height: { xs: 'calc(100vh - 136px)', md: '800px' } }}>
            <Grid container spacing={0} sx={{ height: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Conversations Sidebar */}
                <Grid item xs={12} md={4} sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: { xs: selectedUser ? 'none' : 'block', md: 'block' }
                }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 1000, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <ChatIcon sx={{ color: 'primary.main' }} /> Messages
                        </Typography>
                    </Box>
                    <List sx={{ pt: 0, height: 'calc(100% - 73px)', overflowY: 'auto' }}>
                        {conversations.length > 0 ? conversations.map((conv) => (
                            <ListItem
                                key={conv._id}
                                button
                                onClick={() => setSelectedUser(conv)}
                                sx={{
                                    py: 2,
                                    px: 3,
                                    bgcolor: selectedUser?._id === conv._id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge color="error" variant="dot" invisible={!conv.unread}>
                                        <Avatar sx={{ background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)' }}>
                                            {conv.username[0].toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={conv.username}
                                    secondary={conv.lastMessage}
                                    primaryTypographyProps={{ fontWeight: 800, color: '#F8FAFC' }}
                                    secondaryTypographyProps={{
                                        noWrap: true,
                                        color: conv.unread ? 'primary.light' : '#64748B',
                                        fontWeight: conv.unread ? 800 : 400
                                    }}
                                />
                                <Box sx={{ textAlign: 'right', ml: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </ListItem>
                        )) : (
                            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                                <Typography variant="body2">No conversations yet</Typography>
                            </Box>
                        )}
                    </List>
                </Grid>

                {/* Chat Window */}
                <Grid item xs={12} md={8} sx={{
                    bgcolor: 'rgba(30, 41, 59, 0.2)',
                    display: { xs: selectedUser ? 'flex' : 'none', md: 'flex' },
                    flexDirection: 'column'
                }}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <Box sx={{ p: 2, px: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconButton onClick={() => setSelectedUser(null)} sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}>
                                        <ArrowBack />
                                    </IconButton>
                                    <Avatar sx={{ background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)' }}>{selectedUser.username[0].toUpperCase()}</Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{selectedUser.username}</Typography>
                                        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 700 }}>Active Now</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                    {friends.some(f => f._id === selectedUser?._id) && (
                                        <>
                                            <IconButton onClick={() => startCall('audio')} sx={{ color: '#94A3B8', '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                                <Call />
                                            </IconButton>
                                            <IconButton onClick={() => startCall('video')} sx={{ color: '#94A3B8', '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.1)' } }}>
                                                <Videocam />
                                            </IconButton>
                                        </>
                                    )}
                                    <IconButton
                                        sx={{ color: '#64748B' }}
                                        onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </Box>
                                <Menu
                                    anchorEl={headerMenuAnchor}
                                    open={Boolean(headerMenuAnchor)}
                                    onClose={() => setHeaderMenuAnchor(null)}
                                    PaperProps={{
                                        sx: {
                                            bgcolor: 'rgba(15,23,42,0.95)',
                                            backdropFilter: 'blur(16px)',
                                            borderRadius: '16px',
                                            mt: 1,
                                            minWidth: 160
                                        }
                                    }}
                                >
                                    <ListItem button onClick={() => setClearConfirmOpen(true)} sx={{ color: '#F43F5E' }}>
                                        <ListItemText
                                            primary="Clear Chat"
                                            primaryTypographyProps={{ fontWeight: 800 }}
                                        />
                                    </ListItem>
                                </Menu>
                            </Box>

                            {/* Messages Area */}
                            <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
                                <AnimatePresence initial={false}>
                                    {messages.map((m) => (
                                        <Box
                                            key={m._id}
                                            sx={{
                                                display: 'flex',
                                                justifyItems: m.sender === currentUser.id ? 'flex-end' : 'flex-start',
                                                mb: 2,
                                                flexDirection: 'column',
                                                alignItems: m.sender === currentUser.id ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                style={{ position: 'relative', maxWidth: '85%' }}
                                            >
                                                <Paper sx={{
                                                    p: '10px 18px',
                                                    borderRadius: m.sender === currentUser.id ? '18px 18px 0 18px' : '18px 18px 18px 0',
                                                    background: m.sender === currentUser.id ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.05)',
                                                    border: m.sender === currentUser.id ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                                    overflow: 'hidden'
                                                }}>
                                                    {m.text && <Typography variant="body1">{m.text}</Typography>}
                                                    {m.mediaUrl && <MediaElement src={`${BASE_URL}${m.mediaUrl}`} type={m.mediaType} />}
                                                </Paper>
                                            </motion.div>
                                        </Box>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </AnimatePresence>
                            </Box>

                            {/* Input Area */}
                            <Box sx={{ p: 2, bgcolor: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <IconButton component="label">
                                        <input type="file" hidden onChange={handleFileSelect} />
                                        <AttachFile sx={{ color: '#94A3B8' }} />
                                    </IconButton>
                                    <TextField
                                        fullWidth
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '100px',
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                color: '#fff'
                                            }
                                        }}
                                    />
                                    <IconButton type="submit" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}>
                                        <Send />
                                    </IconButton>
                                </form>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                            <ChatIcon sx={{ fontSize: 100, mb: 2 }} />
                            <Typography variant="h5">Select a conversation</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* Clear Confirm Dialog */}
            <ConfirmationDialog
                open={clearConfirmOpen}
                title="Clear Conversation?"
                message="This will delete all messages in this chat permanently."
                onConfirm={handleClearChat}
                onCancel={() => setClearConfirmOpen(false)}
                confirmText="Clear All"
            />

            <CallOverlay />
        </Container>
    );
};

export default Chat;
