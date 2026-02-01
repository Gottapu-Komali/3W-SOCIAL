import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Avatar, Typography, Modal, IconButton, CircularProgress, Tooltip, Fade,
    TextField, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import {
    Add, Close, DeleteOutline, ChevronLeft, ChevronRight, Favorite,
    FavoriteBorder, MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import API, { BASE_URL } from '../api/axios';
import MediaElement from './MediaElement';
import LikeFeedback from './LikeFeedback';
import ConfirmationDialog from './ConfirmationDialog';
import { useAuth } from '../context/AuthContext';

/**
 * StoryCircle: Memoized display for each user's story group.
 */
const StoryCircle = React.memo(({ group, onClick, isCurrentUser }) => (
    <Box onClick={onClick} sx={{ textAlign: 'center', flexShrink: 0, cursor: 'pointer' }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Box sx={{ p: '2px', borderRadius: '50%', background: 'linear-gradient(45deg, #6366F1, #EC4899)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}>
                <Avatar sx={{
                    width: 72, height: 72,
                    border: '4px solid #0F172A',
                    background: 'linear-gradient(45deg, #1E293B, #0F172A)',
                    fontWeight: 800
                }}>
                    {group.username[0].toUpperCase()}
                </Avatar>
            </Box>
        </motion.div>
        <Typography variant="caption" sx={{
            color: '#F8FAFC', fontWeight: 800, mt: 1, display: 'block',
            maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
            {isCurrentUser ? 'Your Story' : group.username}
        </Typography>
    </Box>
));

const StoryTray = () => {
    const { user: currentUser } = useAuth();
    const [storyGroups, setStoryGroups] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadOverlayText, setUploadOverlayText] = useState('');
    const [replySuccess, setReplySuccess] = useState(false);

    const progressTimer = useRef(null);
    const lastTap = useRef(0);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const { data } = await API.get('/stories');
            setStoryGroups(data);
        } catch (err) { console.error('Fetch stories failed:', err); }
    };

    const handleMediaSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setUploadPreviewOpen(true);
    };

    const confirmUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setUploadPreviewOpen(false);
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('overlayText', uploadOverlayText);
        try {
            await API.post('/stories', formData);
            fetchStories();
            setUploadOverlayText('');
            setSelectedFile(null);
        } catch (err) { console.error('Upload failed:', err); }
        finally { setUploading(false); }
    };

    const handleDelete = async () => {
        try {
            const storyId = activeStory?._id;
            await API.delete(`/stories/${storyId}`);
            fetchStories();
            setViewerOpen(false);
            setMenuAnchor(null);
            setDeleteConfirmOpen(false);
        } catch (err) { console.error('Delete failed:', err); }
    };

    const handleOpenMenu = (e) => {
        setMenuAnchor(e.currentTarget);
        setIsPaused(true);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setIsPaused(false);
    };

    const handleLike = async (e) => {
        if (e) e.stopPropagation();
        if (!activeStory || !currentGroup) return;

        try {
            const { data } = await API.put(`/stories/${currentGroup.userId}/${activeStory._id}/like`);
            setStoryGroups(prev => prev.map(g => {
                if (g.userId === currentGroup.userId) {
                    return {
                        ...g,
                        stories: g.stories.map(s => s._id === activeStory._id ? data : s)
                    };
                }
                return g;
            }));
        } catch (err) { console.error('Like failed:', err); }
    };

    const handleDoubleTap = (e) => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            handleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
        }
        lastTap.current = now;
    };

    const handleReply = async (e) => {
        if (e) e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await API.post('/messages', {
                recipientId: currentGroup.userId,
                text: `Replying to story: ${replyText}`
            });
            setReplyText('');
            setReplySuccess(true);
            setIsPaused(false);
        } catch (err) { console.error('Reply failed:', err); }
    };

    useEffect(() => {
        if (viewerOpen && !isPaused) {
            progressTimer.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + 1.25;
                });
            }, 50);
        } else {
            clearInterval(progressTimer.current);
        }
        return () => clearInterval(progressTimer.current);
    }, [viewerOpen, isPaused, activeStoryIndex, activeGroupIndex]);

    const handleNext = () => {
        const currentGroup = storyGroups[activeGroupIndex];
        if (activeStoryIndex < currentGroup.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (activeGroupIndex < storyGroups.length - 1) {
            setActiveGroupIndex(prev => prev + 1);
            setActiveStoryIndex(0);
            setProgress(0);
        } else {
            setViewerOpen(false);
        }
    };

    const handlePrev = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (activeGroupIndex > 0) {
            const prevGroupIndex = activeGroupIndex - 1;
            setActiveGroupIndex(prevGroupIndex);
            setActiveStoryIndex(storyGroups[prevGroupIndex].stories.length - 1);
            setProgress(0);
        }
    };

    const openViewer = (gIdx) => {
        setActiveGroupIndex(gIdx);
        setActiveStoryIndex(0);
        setProgress(0);
        setViewerOpen(true);
    };

    const currentGroup = storyGroups[activeGroupIndex];
    const activeStory = currentGroup?.stories[activeStoryIndex];
    const isOwner = currentGroup?.userId === currentUser.id;

    return (
        <Box sx={{ mb: 4, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2.5, overflowX: 'auto', py: 1, px: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                    <input type="file" id="story-trigger" hidden accept="image/*,video/*" onChange={handleMediaSelect} />
                    <label htmlFor="story-trigger">
                        <Box sx={{ position: 'relative', cursor: 'pointer', transition: '0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                            <Avatar sx={{ width: 72, height: 72, border: '3px solid #1E293B', bgcolor: 'rgba(255,255,255,0.03)', fontSize: '1.5rem', color: 'primary.light' }}>
                                {uploading ? <CircularProgress size={24} thickness={5} /> : currentUser.username[0].toUpperCase()}
                            </Avatar>
                            <Box sx={{ position: 'absolute', bottom: 2, right: 2, bgcolor: 'primary.main', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0F172A', boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
                                <Add sx={{ fontSize: 16, color: '#fff' }} />
                            </Box>
                        </Box>
                    </label>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mt: 1, display: 'block' }}>You</Typography>
                </Box>

                {storyGroups.map((group, idx) => (
                    <StoryCircle
                        key={group.userId}
                        group={group}
                        onClick={() => openViewer(idx)}
                        isCurrentUser={group.userId === currentUser.id}
                    />
                ))}
            </Box>

            <Modal open={viewerOpen} onClose={() => setViewerOpen(false)} closeAfterTransition sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(30px)', zIndex: 1300 }}>
                <Fade in={viewerOpen}>
                    <Box sx={{ width: '100vw', height: '100vh', maxWidth: 500, bgcolor: '#000', position: 'relative', outline: 'none', overflow: 'hidden' }}>
                        {/* Progress Bars */}
                        <Box sx={{ position: 'absolute', top: 20, width: '100%', px: 2, display: 'flex', gap: 1, zIndex: 100 }}>
                            {currentGroup?.stories.map((_, i) => (
                                <Box key={i} sx={{ flex: 1, height: 3, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 10, overflow: 'hidden' }}>
                                    <Box sx={{ width: i < activeStoryIndex ? '100%' : (i === activeStoryIndex ? `${progress}%` : '0%'), height: '100%', bgcolor: '#fff', transition: i === activeStoryIndex ? 'none' : '0.3s' }} />
                                </Box>
                            ))}
                        </Box>

                        {/* Top Header */}
                        <Box sx={{ position: 'absolute', top: 40, px: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, border: '2px solid #fff', background: 'linear-gradient(45deg, #6366F1, #8B5CF6)' }}>
                                    {currentGroup?.username[0].toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ color: '#fff', fontWeight: 900, lineHeight: 1 }}>{currentGroup?.username}</Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{new Date(activeStory?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {isOwner && (
                                    <>
                                        <IconButton onClick={handleOpenMenu} sx={{ color: '#fff' }}><MoreVert /></IconButton>
                                        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu} PaperProps={{ sx: { bgcolor: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', mt: 1.5 } }}>
                                            <MenuItem onClick={() => setDeleteConfirmOpen(true)} sx={{ color: '#F43F5E' }}>
                                                <ListItemIcon><DeleteOutline sx={{ color: '#F43F5E' }} /></ListItemIcon>
                                                <ListItemText primary="Delete" primaryTypographyProps={{ fontWeight: 700 }} />
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}
                                <IconButton onClick={() => setViewerOpen(false)} sx={{ color: '#fff' }}><Close /></IconButton>
                            </Box>
                        </Box>

                        {/* Media Viewer */}
                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} onClick={handleDoubleTap}>
                            <MediaElement src={`${BASE_URL}${activeStory?.mediaUrl}`} type={activeStory?.mediaType} />
                            <LikeFeedback show={showHeart} />

                            {activeStory?.overlayText && (
                                <Box sx={{ position: 'absolute', bottom: '20%', width: '100%', px: 4, textAlign: 'center', zIndex: 10 }}>
                                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, textShadow: '0 4px 12px rgba(0,0,0,0.8)', bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>{activeStory.overlayText}</Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ position: 'absolute', bottom: { xs: 20, md: 30 }, right: 20, zIndex: 120 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <IconButton onClick={handleLike} sx={{ color: activeStory?.likes?.includes(currentUser.username) ? '#F43F5E' : '#fff', transform: 'scale(1.2)' }}>
                                    {activeStory?.likes?.includes(currentUser.username) ? <Favorite /> : <FavoriteBorder />}
                                </IconButton>
                                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>{activeStory?.likes?.length || ''}</Typography>
                            </Box>
                        </Box>

                        {!isOwner && (
                            <Box sx={{ position: 'absolute', bottom: { xs: 20, md: 30 }, left: 20, right: 80, zIndex: 120 }}>
                                <form onSubmit={handleReply}>
                                    <TextField fullWidth size="small" placeholder="Send a message..." value={replyText} onFocus={() => setIsPaused(true)} onBlur={() => !replyText && setIsPaused(false)} onChange={(e) => setReplyText(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '30px', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }, '&.Mui-focused fieldset': { borderColor: '#fff' } } }} />
                                </form>
                            </Box>
                        )}

                        {/* Navigation Regions */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', zIndex: 50, cursor: 'pointer' }} onClick={handlePrev} />
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', zIndex: 50, cursor: 'pointer' }} onClick={handleNext} />

                        <IconButton sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 110, display: { xs: 'none', md: 'flex' }, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }} onClick={handlePrev}><ChevronLeft /></IconButton>
                        <IconButton sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 110, display: { xs: 'none', md: 'flex' }, color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }} onClick={handleNext}><ChevronRight /></IconButton>
                    </Box>
                </Fade>
            </Modal>

            {/* Dialogs */}
            <Dialog open={uploadPreviewOpen} onClose={() => setUploadPreviewOpen(false)} PaperProps={{ sx: { bgcolor: '#1E293B', color: '#fff', borderRadius: '24px', minWidth: 320 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Complete Your Story</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>{selectedFile?.name}</Typography>
                    <TextField fullWidth multiline rows={2} placeholder="Add an overlay text (optional)..." value={uploadOverlayText} onChange={(e) => setUploadOverlayText(e.target.value)} sx={{ '& .MuiInputBase-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', p: 1.5 } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setUploadPreviewOpen(false)} sx={{ color: '#94A3B8' }}>Cancel</Button>
                    <Button onClick={confirmUpload} variant="contained" sx={{ borderRadius: '12px', px: 4, fontWeight: 800 }}>Share Now</Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={deleteConfirmOpen}
                title="Remove Story?"
                message="This will permanently remove this moment from your feed. This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Delete Permanently"
            />

            <Snackbar open={replySuccess} autoHideDuration={3000} onClose={() => setReplySuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>Reply sent successfully!</Alert>
            </Snackbar>
        </Box>
    );
};

export default StoryTray;
