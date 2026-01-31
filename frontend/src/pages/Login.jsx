import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3 }}>Login</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
                    <Button fullWidth type="submit" variant="contained" color="primary" sx={{ mt: 3, py: 1.5 }}>
                        Login
                    </Button>
                </form>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account? <MuiLink component={Link} to="/signup">Sign Up</MuiLink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
