import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: '#ffffff' }}>
            <Container maxWidth="md">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ fontWeight: 800, textDecoration: 'none', color: 'primary.main', letterSpacing: '-0.5px' }}
                    >
                        3W SOCIAL
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button component={Link} to="/" color="inherit">Feed</Button>
                        {user ? (
                            <>
                                <Button component={Link} to="/create-post" variant="contained" color="primary">Post</Button>
                                <Typography variant="body2" sx={{ fontWeight: 500, mx: 1 }}>{user.username}</Typography>
                                <Button onClick={handleLogout} variant="outlined" color="primary" size="small">Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button component={Link} to="/login" color="inherit">Login</Button>
                                <Button component={Link} to="/signup" variant="contained" color="primary">Sign Up</Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
