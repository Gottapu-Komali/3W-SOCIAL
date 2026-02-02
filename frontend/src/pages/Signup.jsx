import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link as MuiLink, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AutoAwesome, FlashOn } from '@mui/icons-material';
import API from '../api/axios';

import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Sending signup request...', formData);
            const { data } = await API.post('/auth/signup', formData);
            console.log('Signup Response Received:', data);

            if (data.token && data.user) {
                login(data.user, data.token);
                console.log('Login context updated, navigating to home...');
                navigate('/');
            } else {
                console.error('Data received but missing token/user:', data);
                setError('Received invalid response from server');
            }
        } catch (err) {
            console.error('Signup Error Full Object:', err);
            const msg = err.response?.data?.message || err.message || 'Something went wrong';
            setError(msg);
        }
    };

    return (
        <Container maxWidth="xs" className="page-enter">
            <Box sx={{ mt: { xs: 6, md: 10 }, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Brand Accent */}
                <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                    animation: 'glowPulse 3s infinite'
                }}>
                    <FlashOn sx={{ color: '#fff', fontSize: 32 }} />
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-2px', textAlign: 'center' }}>
                    Elevate your feed.
                </Typography>
                <Typography variant="body1" sx={{ mb: 6, color: 'text.secondary', textAlign: 'center', px: 2 }}>
                    Join a community of modern creators and share your story.
                </Typography>

                <Paper
                    elevation={0}
                    className="glass-panel"
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Choose a Username"
                            placeholder="johndoe"
                            margin="dense"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            placeholder="you@example.com"
                            margin="dense"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            label="Create Password"
                            type="password"
                            placeholder="••••••••"
                            margin="dense"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            sx={{ mb: 1.5 }}
                        />

                        {error && (
                            <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1.5, borderRadius: '12px', mb: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <Typography color="error" variant="caption" sx={{ fontWeight: 700, display: 'block', textAlign: 'center' }}>
                                    {error}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 3,
                                py: 2,
                                fontSize: '1rem',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                fontWeight: 800,
                                letterSpacing: '0.5px'
                            }}
                        >
                            Create Account
                        </Button>
                    </form>
                </Paper>

                <Box sx={{ mt: 5, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Already part of the community?{' '}
                        <MuiLink
                            component={Link}
                            to="/login"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 800,
                                textDecoration: 'none',
                                borderBottom: '2px solid rgba(129, 140, 248, 0.3)',
                                pb: '2px',
                                transition: 'all 0.2s',
                                '&:hover': { borderBottomColor: 'primary.main' }
                            }}
                        >
                            Sign In
                        </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Signup;
