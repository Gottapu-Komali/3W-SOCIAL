import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Paper, Avatar, IconButton, Badge, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, Button } from '@mui/material';
import { Notifications as NotifIcon, Favorite, ChatBubble, PersonAdd, Check, DeleteOutline, ClearAll, AutoAwesome, Call, CallMade, CallReceived, CallMissed } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Mark as read when viewing
        API.put('/notifications/read').catch(e => console.error(e));
    }, [fetchNotifications]);

    const handleDelete = async (id) => {
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <Favorite sx={{ color: 'secondary.main' }} />;
            case 'COMMENT':
            case 'REPLY': return <ChatBubble sx={{ color: 'primary.main' }} />;
            case 'FRIEND_REQUEST': return <PersonAdd sx={{ color: 'info.main' }} />;
            case 'FRIEND_ACCEPT': return <Check sx={{ color: 'success.main' }} />;
            case 'CALL_OUTGOING': return <CallMade sx={{ color: 'primary.main', fontSize: '1rem' }} />;
            case 'CALL_INCOMING': return <CallReceived sx={{ color: 'success.main', fontSize: '1rem' }} />;
            case 'CALL_MISSED': return <CallMissed sx={{ color: 'error.main', fontSize: '1rem' }} />;
            default: return <NotifIcon />;
        }
    };

    const getMessage = (n) => {
        switch (n.type) {
            case 'LIKE': return `liked your story ${n.post?.title ? `"${n.post.title}"` : ''}`;
            case 'COMMENT': return `commented on your story ${n.post?.title ? `"${n.post.title}"` : ''}`;
            case 'REPLY': return 'replied to your comment';
            case 'FRIEND_REQUEST': return 'sent you a connection request';
            case 'FRIEND_ACCEPT': return 'accepted your connection request';
            case 'CALL_OUTGOING': return 'Outgoing call';
            case 'CALL_INCOMING': return 'Incoming call';
            case 'CALL_MISSED': return 'Missed call';
            default: return 'sent you a notification';
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}>
                        <NotifIcon />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 1000, letterSpacing: '-1.5px' }}>Activity.</Typography>
                </Box>
                {notifications.length > 0 && (
                    <Button startIcon={<ClearAll />} size="small" sx={{ color: '#64748B' }}>Clear All</Button>
                )}
            </Box>

            <Paper className="glass-card" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>Loading...</Box>
                    ) : notifications.length > 0 ? (
                        <List disablePadding>
                            {notifications.map((n, index) => (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ListItem
                                        divider={index !== notifications.length - 1}
                                        sx={{
                                            py: 2.5,
                                            px: 3,
                                            bgcolor: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.03)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                                        }}
                                    >
                                        <ListItemAvatar sx={{ minWidth: 60 }}>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    <Box sx={{
                                                        bgcolor: 'background.paper',
                                                        borderRadius: '50%',
                                                        p: 0.2,
                                                        display: 'flex',
                                                        border: '2px solid #1E293B'
                                                    }}>
                                                        {getIcon(n.type)}
                                                    </Box>
                                                }
                                                sx={{ '& .MuiBadge-badge': { width: 24, height: 24 } }}
                                            >
                                                <Avatar
                                                    component={Link}
                                                    to={`/profile/${n.sender.username}`}
                                                    sx={{ width: 44, height: 44, background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)' }}
                                                >
                                                    {n.sender.username[0].toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap' }}>
                                                    <Typography component={Link} to={`/profile/${n.sender.username}`} variant="subtitle2" sx={{ fontWeight: 900, color: '#F8FAFC', textDecoration: 'none' }}>
                                                        {n.sender.username}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                                        {getMessage(n)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton size="small" onClick={() => handleDelete(n._id)} sx={{ color: '#334155', '&:hover': { color: '#F43F5E' } }}>
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </motion.div>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                            <AutoAwesome sx={{ fontSize: 48, mb: 2 }} />
                            <Typography variant="h6">No activity yet</Typography>
                            <Typography variant="body2">When people interact with you, it'll show up here.</Typography>
                        </Box>
                    )}
                </AnimatePresence>
            </Paper>
        </Container>
    );
};

export default Notifications;
