import React, { useState, useRef, useEffect } from 'react';
import { Typography, IconButton, Box, Divider, TextField, Avatar, Collapse, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Fade, Skeleton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
    Favorite, FavoriteBorder, ChatBubbleOutline, Send, MoreHoriz,
    ShareOutlined, DeleteOutline, PushPin, PushPinOutlined,
    ReplyOutlined, FavoriteRounded, PlayArrowRounded, VolumeOffRounded, VolumeUpRounded,
    EditOutlined, CloseRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API, { BASE_URL } from '../api/axios';
import MediaElement from './MediaElement';
import LikeFeedback from './LikeFeedback';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

const PostCard = React.memo(({ post, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showHeart, setShowHeart] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: post.title || '', text: post.text || '' });
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const lastTap = useRef(0);

    const isLiked = user && post.likes.includes(user.username);
    const isOwner = user && (post.userId === user.id || post.username === user.username);

    const handleLike = async () => {
        if (!user) return;
        const originalPost = { ...post };
        const optimisticLikes = isLiked
            ? post.likes.filter(u => u !== user.username)
            : [...post.likes, user.username];

        onUpdate({ ...post, likes: optimisticLikes });

        try {
            const { data } = await API.put(`/posts/${post._id}/like`);
            onUpdate(data);
        } catch (err) {
            onUpdate(originalPost); // Rollback
        }
    };

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            handleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
        }
        lastTap.current = now;
    };

    const handleEditSubmit = async () => {
        try {
            const { data } = await API.put(`/posts/${post._id}`, editForm);
            onUpdate(data);
            setIsEditing(false);
        } catch (err) { console.error('Edit failed', err); }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/posts/${post._id}`);
            onDelete(post._id);
            setDeleteConfirm(false);
        } catch (err) { console.error('Delete failed', err); }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user || !commentText.trim()) return;
        const text = commentText;
        setCommentText('');
        const parentId = replyingTo?.id;
        setReplyingTo(null);
        try {
            const { data } = await API.post(`/posts/${post._id}/comment`, { text, parentCommentId: parentId });
            onUpdate(data);
        } catch (err) { console.error(err); }
    };

    const CommentItem = ({ comment, isReply = false, parentId = null }) => {
        const cLiked = user && comment.likes.includes(user.username);
        return (
            <Box sx={{ mb: 2, ml: isReply ? 5 : 0 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Avatar
                        component={Link}
                        to={`/profile/${comment.username}`}
                        sx={{ width: isReply ? 24 : 32, height: isReply ? 24 : 32, cursor: 'pointer', transition: '0.2s', '&:hover': { opacity: 0.8 }, background: 'linear-gradient(45deg, #6366F1, #8B5CF6)' }}
                    >
                        {comment.username[0].toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Box className="glass-panel" sx={{ p: '10px 14px', borderRadius: '18px', bgcolor: comment.isPinned ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)', position: 'relative' }}>
                            {comment.isPinned && <Box sx={{ position: 'absolute', top: -10, right: 10, display: 'flex', alignItems: 'center', bgcolor: 'primary.main', px: 1, py: 0.2, borderRadius: '20px' }}><PushPin sx={{ fontSize: 10, color: '#fff' }} /><Typography sx={{ fontSize: '0.55rem', fontWeight: 900, ml: 0.5 }}>PINNED</Typography></Box>}
                            <Typography component={Link} to={`/profile/${comment.username}`} variant="caption" sx={{ fontWeight: 900, color: 'primary.light', mb: 0.5, display: 'block', textDecoration: 'none' }}>{comment.username}</Typography>
                            <Typography variant="body2" sx={{ color: '#E2E8F0', lineHeight: 1.5 }}>{comment.text}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, ml: 1, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, cursor: 'pointer' }} onClick={() => API.put(`/posts/${post._id}/comment/like`, { commentId: parentId || comment._id, replyId: isReply ? comment._id : null }).then(({ data }) => onUpdate(data))}>
                                {cLiked ? <FavoriteRounded sx={{ fontSize: 14, color: 'secondary.main' }} /> : <FavoriteBorder sx={{ fontSize: 14, color: '#64748B' }} />}
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: cLiked ? 'secondary.main' : '#64748B' }}>{comment.likes.length || ''}</Typography>
                            </Box>
                            {!isReply && <Typography variant="caption" onClick={() => setReplyingTo({ id: comment._id, username: comment.username })} sx={{ fontWeight: 800, color: '#64748B', cursor: 'pointer' }}>Reply</Typography>}
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    const sortedComments = [...(post.comments || [])].sort((a, b) => b.isPinned - a.isPinned);

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Box className="glass-card" sx={{ mb: 5, width: '100%', maxWidth: 620, mx: 'auto', borderRadius: '32px', overflow: 'hidden' }}>
                <Box sx={{ p: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            component={Link}
                            to={`/profile/${post.username}`}
                            sx={{ width: 44, height: 44, cursor: 'pointer', transition: '0.2s', '&:hover': { scale: 1.1 }, background: 'linear-gradient(135deg, #EC4899, #6366F1)' }}
                        >
                            {post.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography component={Link} to={`/profile/${post.username}`} sx={{ fontWeight: 900, color: '#F8FAFC', textDecoration: 'none', '&:hover': { color: 'primary.light' } }}>{post.username}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>{new Date(post.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#64748B' }}><MoreHoriz /></IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { bgcolor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px' } }}>
                        {isOwner && [
                            <MenuItem key="edit" onClick={() => { setIsEditing(true); setAnchorEl(null); }} sx={{ color: '#F8FAFC' }}><EditOutlined sx={{ mr: 1, fontSize: 20 }} /> Edit</MenuItem>,
                            <MenuItem key="delete" onClick={() => { setDeleteConfirm(true); setAnchorEl(null); }} sx={{ color: '#F43F5E' }}><DeleteOutline sx={{ mr: 1, fontSize: 20 }} /> Delete</MenuItem>
                        ]}
                        <MenuItem sx={{ color: '#94A3B8' }}><ShareOutlined sx={{ mr: 1, fontSize: 20 }} /> Share</MenuItem>
                    </Menu>
                </Box>

                <Box sx={{ px: 3, pb: post.mediaUrl ? 2 : 3 }}>
                    {isEditing ? (
                        <Box sx={{ py: 1 }}>
                            <TextField fullWidth placeholder="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} variant="standard" InputProps={{ sx: { fontWeight: 900, fontSize: '1.2rem', color: 'primary.light' } }} sx={{ mb: 1 }} />
                            <TextField fullWidth multiline rows={3} placeholder="Tell your story..." value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} variant="standard" />
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button onClick={handleEditSubmit} variant="contained" size="small">Save</Button>
                                <Button onClick={() => setIsEditing(false)} variant="outlined" size="small">Cancel</Button>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            {post.title && <Typography variant="h5" sx={{ fontWeight: 1000, color: 'primary.light', mb: 1 }}>{post.title}</Typography>}
                            {post.text && <Typography variant="body1" sx={{ color: '#CBD5E1', lineHeight: 1.7 }}>{post.text}</Typography>}
                        </>
                    )}
                </Box>

                {post.mediaUrl && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <MediaElement
                            src={`${BASE_URL}${post.mediaUrl}`}
                            type={post.mediaType}
                            onClick={handleDoubleTap}
                        />
                        <LikeFeedback show={showHeart} />
                    </Box>
                )}

                <Box sx={{ px: 3, py: 2, display: 'flex', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <IconButton onClick={handleLike} sx={{ p: 0, color: isLiked ? '#F472B6' : '#94A3B8' }}><Favorite sx={{ fontSize: 28 }} /></IconButton>
                        <Typography sx={{ fontWeight: 800 }}>{post.likes.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <IconButton onClick={() => setShowComments(!showComments)} sx={{ p: 0, color: showComments ? 'primary.main' : '#94A3B8' }}><ChatBubbleOutline sx={{ fontSize: 26 }} /></IconButton>
                        <Typography sx={{ fontWeight: 800 }}>{post.comments.length}</Typography>
                    </Box>
                </Box>

                <AnimatePresence>
                    {showComments && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <Box sx={{ px: 4, pb: 4, pt: 1 }}>
                                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
                                    {sortedComments.map(c => <CommentItem key={c._id} comment={c} />)}
                                </Box>
                                <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', gap: 1.5, bgcolor: 'rgba(15,23,42,0.4)', p: '8px 10px 8px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <TextField fullWidth placeholder="Add to the story..." variant="standard" value={commentText} onChange={(e) => setCommentText(e.target.value)} InputProps={{ disableUnderline: true, sx: { color: '#fff', fontSize: '0.95rem' } }} />
                                    <IconButton type="submit" disabled={!commentText.trim()} sx={{ bgcolor: 'primary.main', color: '#fff' }}><Send sx={{ fontSize: 20 }} /></IconButton>
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ConfirmationDialog
                    open={deleteConfirm}
                    title="Erase this story?"
                    message="This action is permanent and cannot be undone. Every comment and like will be lost."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(false)}
                    confirmText="Delete Forever"
                />
            </Box>
        </motion.div>
    );
});

export default PostCard;
