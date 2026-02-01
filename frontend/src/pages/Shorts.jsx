import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Container, Box, Typography, IconButton, Avatar, CircularProgress,
    Drawer, TextField, List, ListItem, ListItemAvatar, ListItemText,
    Divider, Dialog, DialogTitle, DialogContent, Button, Badge
} from '@mui/material';
import {
    Favorite, FavoriteBorder, ChatBubbleOutline, Share, ArrowBack,
    MusicNote, Bookmark, BookmarkBorder, Send, ContentCopy,
    MoreVert, Close, Article
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API, { BASE_URL } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ShortItem = ({ post, isActive, onUpdate }) => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [liked, setLiked] = useState(post.likes.includes(user?.username));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [saved, setSaved] = useState(false);

    // UI State
    const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        if (videoRef.current && post.mediaType === 'video') {
            if (isActive) {
                videoRef.current.play().catch(e => console.log('Autoplay blocked'));
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isActive, post.mediaType]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await API.get(`/users/profile/${user.username}`);
                setSaved(data.savedPosts?.includes(post._id));
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchUserData();
    }, [user, post._id]);

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            const { data } = await API.put(`/posts/${post._id}/like`);
            setLiked(data.likes.includes(user?.username));
            setLikesCount(data.likes.length);
            onUpdate(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            await API.put(`/posts/${post._id}/save`);
            setSaved(!saved);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;
        setSendingComment(true);
        try {
            const { data } = await API.post(`/posts/${post._id}/comment`, { text: newComment });
            onUpdate(data);
            setNewComment('');
            setSendingComment(false);
        } catch (err) {
            console.error(err);
            setSendingComment(false);
        }
    };

    const handleShareExternal = async () => {
        const shareData = {
            title: `Check out ${post.username}'s Short`,
            text: post.text,
            url: window.location.origin + `/shorts`
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleShareToFriend = async (friendId) => {
        try {
            await API.post('/messages', {
                recipientId: friendId,
                text: `Hey! Check out this post: ${window.location.origin}/shorts`
            });
            alert('Shared successfully!');
            setShareDialogOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFriends = async () => {
        try {
            const { data } = await API.get('/users/friends');
            setFriends(data);
        } catch (err) {
            console.error(err);
        }
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = getYouTubeId(post.mediaUrl);

    const renderMedia = () => {
        if (ytId) {
            return (
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&mute=0&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ height: '100%', width: '100%', border: 'none' }}
                />
            );
        }

        if (post.mediaType === 'video') {
            return (
                <video
                    ref={videoRef}
                    src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BASE_URL}${post.mediaUrl}`}
                    loop
                    playsInline
                    style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                    onClick={() => {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                    }}
                />
            );
        }

        if (post.mediaType === 'image') {
            const imgSrc = post.mediaUrl.startsWith('http') ? post.mediaUrl : `${BASE_URL}${post.mediaUrl}`;
            return (
                <Box sx={{ height: '100%', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${imgSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(40px) brightness(0.4)',
                        transform: 'scale(1.1)'
                    }} />
                    <img
                        src={imgSrc}
                        alt=""
                        style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', zIndex: 1 }}
                    />
                </Box>
            );
        }

        // Text Only (YouTube-style Community Post)
        return (
            <Box sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                textAlign: 'center'
            }}>
                <Article sx={{ fontSize: 80, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 2, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    {post.title || "Note"}
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.6, maxWidth: '80%' }}>
                    {post.text}
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            position: 'relative',
            scrollSnapAlign: 'start',
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {renderMedia()}

            {/* Overlays */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                pb: 5,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                zIndex: 10
            }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>@{post.username}</Typography>
                {post.mediaUrl && <Typography variant="body2" sx={{ color: '#fff', mb: 2, opacity: 0.9 }}>{post.text}</Typography>}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MusicNote sx={{ fontSize: 16, color: '#fff' }} />
                    <Typography variant="caption" sx={{ color: '#fff' }}>Social Short - {post.username}</Typography>
                </Box>
            </Box>

            {/* Sidebar Actions */}
            <Box sx={{
                position: 'absolute',
                right: 16,
                bottom: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2.5,
                zIndex: 20
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                        src={`${BASE_URL}/uploads/avatar-${post.userId}.png`}
                        sx={{ width: 44, height: 44, border: '2px solid #fff', mb: 1 }}
                    >
                        {post.username[0].toUpperCase()}
                    </Avatar>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <IconButton onClick={handleLike} sx={{ color: liked ? '#F43F5E' : '#fff', p: 1 }}>
                        {liked ? <Favorite sx={{ fontSize: 32 }} /> : <FavoriteBorder sx={{ fontSize: 32 }} />}
                    </IconButton>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>{likesCount}</Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <IconButton onClick={() => setCommentDrawerOpen(true)} sx={{ color: '#fff', p: 1 }}>
                        <ChatBubbleOutline sx={{ fontSize: 32 }} />
                    </IconButton>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>{post.comments.length}</Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <IconButton onClick={handleSave} sx={{ color: saved ? '#FBBF24' : '#fff', p: 1 }}>
                        {saved ? <Bookmark sx={{ fontSize: 32 }} /> : <BookmarkBorder sx={{ fontSize: 32 }} />}
                    </IconButton>
                    <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>{saved ? 'Saved' : 'Save'}</Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <IconButton
                        onClick={() => {
                            setShareDialogOpen(true);
                            fetchFriends();
                        }}
                        sx={{ color: '#fff', p: 1 }}
                    >
                        <Share sx={{ fontSize: 32 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* Comment Drawer */}
            <Drawer
                anchor="bottom"
                open={commentDrawerOpen}
                onClose={() => setCommentDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        height: '70%',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        color: '#fff'
                    }
                }}
            >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Comments</Typography>
                        <IconButton onClick={() => setCommentDrawerOpen(false)} sx={{ color: '#fff' }}>
                            <Close />
                        </IconButton>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {post.comments.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', mt: 4, color: '#94A3B8' }}>No comments yet. Be the first!</Typography>
                        ) : (
                            <List>
                                {post.comments.map((comment) => (
                                    <ListItem key={comment._id} alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32 }}>{comment.username[0]}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.light' }}>
                                                    {comment.username}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" sx={{ color: '#F8FAFC' }}>
                                                    {comment.text}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    '& fieldset': { borderColor: 'transparent' }
                                }
                            }}
                        />
                        <IconButton
                            onClick={handleComment}
                            disabled={sendingComment || !newComment.trim()}
                            sx={{ color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.1)' }}
                        >
                            {sendingComment ? <CircularProgress size={24} /> : <Send />}
                        </IconButton>
                    </Box>
                </Box>
            </Drawer>

            {/* Share Dialog */}
            <Dialog
                open={shareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        color: '#fff',
                        minWidth: '320px'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, textAlign: 'center' }}>Share to</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopy />}
                            onClick={handleShareExternal}
                            sx={{ borderRadius: '12px', py: 1.5 }}
                        >
                            Copy Link / Share to Apps
                        </Button>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>SHARE TO FRIENDS</Typography>
                        </Divider>

                        <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {friends.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', p: 2, color: '#94A3B8' }}>No friends found</Typography>
                            ) : (
                                friends.map((friend) => (
                                    <ListItem
                                        key={friend._id}
                                        button
                                        onClick={() => handleShareToFriend(friend._id)}
                                        sx={{ borderRadius: '12px', mb: 1, bgcolor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={`${BASE_URL}/uploads/avatar-${friend._id}.png`} />
                                        </ListItemAvatar>
                                        <ListItemText primary={friend.username} />
                                        <Send sx={{ color: 'primary.main', fontSize: 20 }} />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

const Shorts = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        fetchShorts();
    }, []);

    const fetchShorts = async () => {
        try {
            const { data } = await API.get('/posts?filter=shorts&limit=20');
            setPosts(data.posts);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const handleUpdatePost = (updatedPost) => {
        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    if (loading) return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
            <CircularProgress color="primary" />
        </Box>
    );

    return (
        <Box sx={{
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            bgcolor: '#000',
            zIndex: 1300,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 2, display: 'flex', alignItems: 'center', zIndex: 30 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, ml: 2 }}>Shorts</Typography>
            </Box>

            {/* Shorts Container */}
            <Box
                ref={containerRef}
                onScroll={handleScroll}
                sx={{
                    height: '100%',
                    width: '100%',
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    '&::-webkit-scrollbar': { display: 'none' }
                }}
            >
                {posts.map((post, index) => (
                    <ShortItem
                        key={post._id}
                        post={post}
                        isActive={index === activeIndex}
                        onUpdate={handleUpdatePost}
                    />
                ))}

                {posts.length === 0 && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                        <Typography variant="h5" sx={{ color: '#64748B', fontWeight: 800, mb: 1 }}>No Activity Yet</Typography>
                        <Typography variant="body2" sx={{ color: '#475569' }}>Be the first to share a moment!</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Shorts;
