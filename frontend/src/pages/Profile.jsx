import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Avatar, Grid, Paper, Divider, Button, Skeleton } from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AccountCircle, DateRange, GridView, List, People, PostAdd, ChatBubbleOutline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/users/profile/${username}`);
            setProfileData(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleUpdatePost = (updatedPost) => {
        setProfileData(prev => ({
            ...prev,
            posts: prev.posts.map(p => p._id === updatedPost._id ? updatedPost : p)
        }));
    };

    const handleDeletePost = (postId) => {
        setProfileData(prev => ({
            ...prev,
            posts: prev.posts.filter(p => p._id !== postId),
            user: { ...prev.user, postsCount: (prev.posts.length - 1) }
        }));
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '32px', mb: 4 }} />
                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 4 }} />
                <Grid container spacing={2}>
                    {[1, 2, 3].map(i => <Grid item xs={12} key={i}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: '24px' }} /></Grid>)}
                </Grid>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h4">User Not Found</Typography>
                <Button component={Link} to="/" sx={{ mt: 2 }}>Back to Feed</Button>
            </Container>
        );
    }

    const { user, posts } = profileData;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper className="glass-card" sx={{ p: { xs: 3, md: 5 }, borderRadius: '32px', mb: 6, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(135deg, #6366F1, #EC4899)', opacity: 0.2 }} />

                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-end' }, gap: 3, mt: 4 }}>
                        <Avatar sx={{ width: 120, height: 120, border: '6px solid rgba(15,23,42,0.8)', background: 'linear-gradient(45deg, #4F46E5, #8B5CF6)', fontSize: '3rem', fontWeight: 900 }}>
                            {user.username[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, pb: 1 }}>
                            <Typography variant="h3" sx={{ fontWeight: 1000, letterSpacing: '-2px', mb: 0.5 }}>{user.username}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, color: '#94A3B8' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DateRange sx={{ fontSize: 18 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Joined {new Date(user.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                                    {currentUser?.username !== user.username && (
                                        <Button
                                            variant="contained"
                                            startIcon={<ChatBubbleOutline />}
                                            onClick={() => navigate(`/chat?userId=${user._id}&username=${user.username}`)}
                                            size="small"
                                            sx={{
                                                borderRadius: '100px',
                                                px: 3,
                                                background: 'rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(10px)',
                                                '&:hover': { background: 'rgba(255,255,255,0.2)' }
                                            }}
                                        >
                                            Message
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

                    <Grid container spacing={4} sx={{ textAlign: 'center' }}>
                        <Grid item xs={6}>
                            <Typography variant="h4" sx={{ fontWeight: 1000, color: 'primary.light' }}>{posts.length}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '1px' }}>STORIES</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h4" sx={{ fontWeight: 1000, color: 'secondary.main' }}>{user.friendsCount}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: '1px' }}>CONNECTIONS</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>Moments Shared</Typography>
                </Box>

                <AnimatePresence mode="wait">
                    {posts.length > 0 ? (
                        <Grid container spacing={4}>
                            {posts.map(post => (
                                <Grid item xs={12} key={post._id}>
                                    <PostCard post={post} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                            <PostAdd sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6">No stories shared yet.</Typography>
                        </Box>
                    )}
                </AnimatePresence>
            </motion.div>
        </Container>
    );
};

export default Profile;
