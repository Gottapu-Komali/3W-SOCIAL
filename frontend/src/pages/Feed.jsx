import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Tabs, Tab, Fade } from '@mui/material';
import { AutoAwesome, Refresh, HistoryEdu, Bolt, Public, People, Whatshot } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import StoryTray from '../components/StoryTray';
import QuickPost from '../components/QuickPost';
import EmptyState from '../components/EmptyState';

const Feed = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'network', 'popular'
    const observer = useRef();

    const fetchPosts = useCallback(async (pageNum = 1, isInitial = false, activeFilter = filter) => {
        if (isInitial) {
            setLoading(true);
            setPosts([]);
        } else {
            setLoadingMore(true);
        }

        try {
            const { data } = await API.get(`/posts?page=${pageNum}&limit=5&filter=${activeFilter}`);
            if (pageNum === 1) {
                setPosts(data.posts);
            } else {
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p._id));
                    const newPosts = data.posts.filter(p => !existingIds.has(p._id));
                    return [...prev, ...newPosts];
                });
            }
            setHasMore(data.hasMore);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter]);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, true, filter);
    }, [filter, fetchPosts]);

    const lastPostRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchPosts(nextPage);
                    return nextPage;
                });
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, fetchPosts]);

    const handleUpdatePost = (updatedPost) => {
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    const handleDeletePost = (postId) => {
        setPosts(posts.filter(post => post._id !== postId));
    };

    const handleFilterChange = (event, newValue) => {
        setFilter(newValue);
    };

    const SkeletonLoader = () => (
        <Box sx={{ mt: 2 }}>
            {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 6, opacity: 1 - i * 0.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box className="skeleton-box" sx={{ width: 48, height: 48, borderRadius: '50%', mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                            <Box className="skeleton-box" sx={{ width: '140px', height: 16, mb: 1, borderRadius: '4px' }} />
                            <Box className="skeleton-box" sx={{ width: '100px', height: 10, borderRadius: '4px' }} />
                        </Box>
                    </Box>
                    <Box className="skeleton-box" sx={{ width: '100%', height: 400, borderRadius: '32px' }} />
                </Box>
            ))}
        </Box>
    );

    return (
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
            <StoryTray />
            <QuickPost />
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                    value={filter}
                    onChange={handleFilterChange}
                    sx={{
                        bgcolor: 'rgba(15,23,42,0.4)',
                        p: 0.5,
                        borderRadius: '100px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            minWidth: 120,
                            borderRadius: '100px',
                            color: '#94A3B8',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            textTransform: 'none',
                            transition: '0.3s',
                            '&.Mui-selected': {
                                color: '#fff',
                                bgcolor: 'primary.main',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                            }
                        }
                    }}
                >
                    <Tab value="all" icon={<Public sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Public" />
                    <Tab value="network" icon={<People sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Network" />
                    <Tab value="popular" icon={<Whatshot sx={{ fontSize: 18, mr: 1 }} />} iconPosition="start" label="Hot" />
                </Tabs>
            </Box>

            <AnimatePresence mode="wait">
                {loading && page === 1 ? (
                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SkeletonLoader />
                    </motion.div>
                ) : posts.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}>
                        <EmptyState
                            title="Pure Silence"
                            message={filter === 'network' ? "Your network is quiet. Connect with more creators to fill your feed with inspiration." : "The horizon is clear. Be the first to ignite the feed with your moment."}
                            actionText={filter === 'network' ? "Discover People" : "Share a Moment"}
                            onAction={() => navigate(filter === 'network' ? '/connections' : '/create-post')}
                            icon={<HistoryEdu sx={{ fontSize: 40 }} />}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        {posts.map((post, index) => (
                            <div key={post._id} ref={index === posts.length - 1 ? lastPostRef : null}>
                                <PostCard post={post} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />
                            </div>
                        ))}

                        {loadingMore && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                <CircularProgress size={44} thickness={4} />
                            </Box>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </Container>
    );
};

export default Feed;
