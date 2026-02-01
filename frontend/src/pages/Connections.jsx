import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Box, Typography, Paper, Tab, Tabs,
    Avatar, Button, Grid, IconButton, Skeleton,
    TextField, InputAdornment, Chip, Badge, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    PeopleAlt, PersonAdd, Check, Close, Search,
    PersonOutline, GroupAdd, MoreHoriz, AutoAwesome,
    HistoryEdu, Bolt, RemoveCircleOutline, Undo
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const Connections = () => {
    const [tab, setTab] = useState(0);
    const [allUsers, setAllUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Privacy state
    const [removeTarget, setRemoveTarget] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, meRes] = await Promise.all([
                API.get('/users'),
                API.get('/users/me')
            ]);
            setAllUsers(usersRes.data);
            setCurrentUser(meRes.data);
        } catch (err) {
            console.error('Error fetching connection data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (action, userId) => {
        try {
            if (action === 'request') await API.post(`/users/request/${userId}`);
            if (action === 'cancel') await API.delete(`/users/request/${userId}`);
            if (action === 'accept') await API.put(`/users/accept/${userId}`);
            if (action === 'reject') await API.put(`/users/reject/${userId}`);
            if (action === 'remove') {
                await API.delete(`/users/remove/${userId}`);
                setRemoveTarget(null);
            }
            fetchData(); // Refresh data
        } catch (err) { console.error(`Action ${action} failed:`, err); }
    };

    const getConnectionStatus = (userId) => {
        if (!currentUser) return 'none';
        if (currentUser.friends.some(f => (f._id || f) === userId)) return 'connected';
        if (currentUser.friendRequestsSent.some(id => (id._id || id) === userId)) return 'sent';
        if (currentUser.friendRequestsReceived.some(f => (f._id || f) === userId)) return 'received';
        return 'none';
    };

    const UserCard = ({ user, status }) => (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #6366F1, #EC4899)' }} />
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                        component={Link}
                        to={`/profile/${user.username}`}
                        sx={{ width: 80, height: 80, mx: 'auto', mb: 2, background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)', border: '4px solid rgba(255,255,255,0.05)', cursor: 'pointer', '&:hover': { scale: 1.1 } }}
                    >
                        {user.username[0].toUpperCase()}
                    </Avatar>
                    <Typography component={Link} to={`/profile/${user.username}`} sx={{ fontWeight: 900, mb: 0.5, color: '#fff', textDecoration: 'none', '&:hover': { color: 'primary.light' } }}>{user.username}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</Typography>

                    {status === 'none' && (
                        <Button fullWidth variant="contained" startIcon={<PersonAdd />} onClick={() => handleAction('request', user._id)} sx={{ borderRadius: '12px' }}>
                            Connect
                        </Button>
                    )}
                    {status === 'sent' && (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Undo />}
                            onClick={() => handleAction('cancel', user._id)}
                            sx={{ borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1) !important', color: '#94A3B8' }}
                        >
                            Cancel
                        </Button>
                    )}
                    {status === 'received' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button fullWidth variant="contained" color="success" onClick={() => handleAction('accept', user._id)} sx={{ borderRadius: '12px', bgcolor: '#10B981' }}>
                                Accept
                            </Button>
                            <IconButton onClick={() => handleAction('reject', user._id)} sx={{ borderRadius: '12px', bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E' }}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                    {status === 'connected' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip icon={<Check fontSize="small" sx={{ color: '#10B981 !important' }} />} label="Connected" sx={{ flex: 1, height: 36, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontWeight: 700 }} />
                            <IconButton onClick={() => setRemoveTarget(user)} sx={{ borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)', color: '#64748B', '&:hover': { color: '#F43F5E' } }}>
                                <RemoveCircleOutline fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );

    const filteredDiscover = allUsers.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        getConnectionStatus(u._id) === 'none'
    );

    const filteredRequests = allUsers.filter(u => getConnectionStatus(u._id) === 'received');
    const filteredSent = allUsers.filter(u => getConnectionStatus(u._id) === 'sent');
    const filteredFriends = currentUser?.friends || [];

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Box sx={{ p: 2, borderRadius: '24px', background: 'rgba(99, 102, 241, 0.1)', mb: 2, display: 'inline-block', color: 'primary.main' }}>
                    <PeopleAlt sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 1000, mb: 1.5, letterSpacing: '-2px' }}>Connections.</Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8' }}>Expand your network and protect your privacy.</Typography>
            </Box>

            <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                centered
                sx={{
                    mb: 5,
                    '& .MuiTabs-indicator': { height: 4, borderRadius: '4px', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' },
                    '& .MuiTab-root': { fontWeight: 800, fontSize: '1rem', color: '#64748B', px: 3 },
                    '& .Mui-selected': { color: 'primary.main !important' }
                }}
            >
                <Tab label="Discover" />
                <Tab label={
                    <Badge badgeContent={filteredRequests.length} color="error">
                        Inbox
                    </Badge>
                } />
                <Tab label="Net" />
            </Tabs>

            <AnimatePresence mode="wait">
                {tab === 0 && (
                    <motion.div key="discover" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <TextField
                            fullWidth
                            placeholder="Find people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 4 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                sx: { borderRadius: '100px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }
                            }}
                        />
                        <Grid container spacing={3}>
                            {loading ? [1, 2, 3].map(i => <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rectangular" height={220} sx={{ borderRadius: '24px' }} /></Grid>) :
                                filteredDiscover.length > 0 ? filteredDiscover.map(u => (
                                    <Grid item xs={12} sm={6} md={4} key={u._id}><UserCard user={u} status="none" /></Grid>
                                )) : (
                                    <Box sx={{ width: '100%', py: 10, textAlign: 'center', opacity: 0.5 }}>
                                        <PersonOutline sx={{ fontSize: 60, mb: 2 }} />
                                        <Typography variant="h6">No new people found</Typography>
                                    </Box>
                                )}
                        </Grid>
                    </motion.div>
                )}

                {tab === 1 && (
                    <motion.div key="requests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Grid container spacing={3}>
                            {filteredRequests.map(u => <Grid item xs={12} sm={6} md={4} key={u._id}><UserCard user={u} status="received" /></Grid>)}
                            {filteredSent.map(u => <Grid item xs={12} sm={6} md={4} key={u._id}><UserCard user={u} status="sent" /></Grid>)}
                            {filteredRequests.length === 0 && filteredSent.length === 0 && (
                                <Box sx={{ width: '100%', py: 10, textAlign: 'center', opacity: 0.5 }}>
                                    <AutoAwesome sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h6">No pending activity</Typography>
                                </Box>
                            )}
                        </Grid>
                    </motion.div>
                )}

                {tab === 2 && (
                    <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Grid container spacing={3}>
                            {filteredFriends.length > 0 ? filteredFriends.map(u => (
                                <Grid item xs={12} sm={6} md={4} key={u._id}><UserCard user={u} status="connected" /></Grid>
                            )) : (
                                <Box sx={{ width: '100%', py: 10, textAlign: 'center', opacity: 0.5 }}>
                                    <GroupAdd sx={{ fontSize: 60, mb: 2 }} />
                                    <Typography variant="h6">Your network is empty</Typography>
                                </Box>
                            )}
                        </Grid>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)} PaperProps={{ className: 'glass-panel', sx: { borderRadius: '24px' } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Remove connection?</DialogTitle>
                <DialogContent><Typography variant="body2" color="text.secondary">You will stop seeing {removeTarget?.username}'s stories in your network feed.</Typography></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRemoveTarget(null)} sx={{ color: '#fff' }}>Stay Connected</Button>
                    <Button onClick={() => handleAction('remove', removeTarget._id)} variant="contained" color="error" sx={{ bgcolor: '#F43F5E' }}>Remove</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Connections;
