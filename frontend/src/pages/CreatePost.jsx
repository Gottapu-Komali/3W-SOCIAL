import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, IconButton, Paper, Divider, LinearProgress, Alert, Collapse } from '@mui/material';
import { AddPhotoAlternate, Close, AutoAwesome, Send, Movie, WarningAmberOutlined } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation: Max 50MB
            if (file.size > 50 * 1024 * 1024) {
                setError('Media size exceeds 50MB limit.');
                return;
            }
            setError(null);
            setMedia(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';
            setMediaType(type);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        setMedia(null);
        setPreview(null);
        setMediaType(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() && !text.trim() && !media) {
            setError('Your story needs at least a title, some text, or a media file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('text', text.trim());
        if (media) formData.append('media', media);

        try {
            await API.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            console.error('Post creation error:', err);
            let msg = 'The server encountered an issue while publishing your story.';
            if (err.response) {
                msg = err.response.data?.message || msg;
            } else if (err.request) {
                msg = 'Cannot reach the server. Please check your connection.';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Box sx={{ p: 2, borderRadius: '24px', background: 'rgba(129, 140, 248, 0.1)', mb: 2, display: 'inline-block', color: 'primary.main' }}>
                        <AutoAwesome sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 1000, mb: 1.5, letterSpacing: '-2px' }}>Create a Story.</Typography>
                    <Typography variant="body1" sx={{ color: '#94A3B8' }}>Your unique vision, shared instantly.</Typography>
                </Box>

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <Alert
                                severity="error"
                                icon={<WarningAmberOutlined />}
                                onClose={() => setError(null)}
                                sx={{
                                    mb: 4,
                                    borderRadius: '16px',
                                    bgcolor: 'rgba(244, 63, 94, 0.1)',
                                    color: '#FB7185',
                                    border: '1px solid rgba(244, 63, 94, 0.2)',
                                    '& .MuiAlert-icon': { color: '#FB7185' }
                                }}
                            >
                                {error}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Paper elevation={0} className="glass-panel" sx={{ p: { xs: 3, md: 5 }, borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            placeholder="A compelling title..."
                            variant="standard"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.25rem', fontWeight: 800, color: 'primary.light', mb: 1 } }}
                        />
                        <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="What's happening?"
                            variant="standard"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { fontSize: '1.4rem', fontWeight: 500, lineHeight: 1.6, color: '#F8FAFC' } }}
                            sx={{ mb: 4 }}
                        />

                        <Box sx={{ mb: 5 }}>
                            {!preview ? (
                                <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '32px', cursor: 'pointer', transition: '0.4s', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(99,102,241,0.05)', transform: 'scale(1.01)' } }}>
                                    <Box sx={{ p: 2, borderRadius: '100%', bgcolor: 'rgba(129,140,248,0.1)', mb: 2, color: 'primary.main' }}>
                                        <Movie sx={{ fontSize: 36 }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 800 }}>Add High-Res Media</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>MP4, WebM, PNG, JPG (Max 50MB)</Typography>
                                    <input type="file" hidden accept="image/*,video/*" onChange={handleMediaChange} />
                                </Box>
                            ) : (
                                <Box sx={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                                    {mediaType === 'video' ? (
                                        <video src={preview} controls style={{ width: '100%', maxHeight: 450, display: 'block', backgroundColor: '#000' }} />
                                    ) : (
                                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 450, objectFit: 'cover', display: 'block' }} />
                                    )}
                                    <IconButton onClick={removeMedia} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(10px)', '&:hover': { bgcolor: '#ef4444' } }}>
                                        <Close />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            endIcon={!loading && <Send />}
                            sx={{
                                py: 2.2,
                                fontSize: '1.2rem',
                                fontWeight: 900,
                                borderRadius: '24px',
                                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)',
                                mb: 1
                            }}
                        >
                            {loading ? 'Publishing Your Vision...' : 'Share with the World'}
                        </Button>
                        {loading && (
                            <Box sx={{ px: 2 }}>
                                <LinearProgress sx={{ height: 6, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { borderRadius: 5 } }} />
                            </Box>
                        )}
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CreatePost;
