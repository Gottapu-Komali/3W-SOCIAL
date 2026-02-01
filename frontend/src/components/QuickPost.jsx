import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { AddPhotoAlternate, Movie, TextFields } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickPost = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) return null;

    return (
        <Paper
            className="glass-panel"
            onClick={() => navigate('/create-post')}
            sx={{
                p: 2,
                mb: 4,
                borderRadius: '24px',
                cursor: 'pointer',
                transition: '0.3s ease',
                '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #EC4899, #6366F1)',
                        fontWeight: 900
                    }}
                >
                    {user.username[0].toUpperCase()}
                </Avatar>
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '100px',
                        px: 3,
                        py: 1.2,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                            bgcolor: 'rgba(15, 23, 42, 0.7)'
                        }
                    }}
                >
                    <Typography sx={{ color: '#94A3B8', fontWeight: 500 }}>
                        What's on your mind, {user.username}?
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#F472B6' }}>
                    <AddPhotoAlternate sx={{ fontSize: 22 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>Image</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#818CF8' }}>
                    <Movie sx={{ fontSize: 22 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>Video</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#10B981' }}>
                    <TextFields sx={{ fontSize: 22 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>Write Post</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default QuickPost;
