import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Badge, Tooltip } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AutoAwesome, AddCircleOutline, Logout, AccountCircleOutlined, PeopleAlt, PlayCircleOutline, ChatBubbleOutline, Notifications } from '@mui/icons-material';
import API from '../api/axios';

import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMesages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (user) {
            const fetchUnread = async () => {
                try {
                    const [{ data: notifs }, { data: convs }] = await Promise.all([
                        API.get('/notifications'),
                        API.get('/messages/conversations')
                    ]);
                    setUnreadCount(notifs.filter(n => !n.read).length);
                    setUnreadMessages(convs.filter(c => c.unread).length);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchUnread();
            const interval = setInterval(fetchUnread, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]);
    const open = Boolean(anchorEl);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleCloseMenu();
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                zIndex: 1100,
            }}
        >
            <Container maxWidth="md">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 72 }}>
                    <Box
                        component={Link}
                        to="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            textDecoration: 'none',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                    >
                        <Box sx={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                            borderRadius: '12px',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                        }}>
                            <AutoAwesome sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 900,
                                color: '#F8FAFC',
                                letterSpacing: '-1.2px',
                                fontSize: '1.4rem',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            3W SOCIAL
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1.5 }, alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Tooltip title="Messages">
                                    <IconButton component={Link} to="/chat" sx={{ color: location.pathname === '/chat' ? 'primary.main' : '#94A3B8', display: { xs: 'none', md: 'inline-flex' } }}>
                                        <Badge badgeContent={unreadMesages} color="error">
                                            <ChatBubbleOutline />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Shorts">
                                    <IconButton component={Link} to="/shorts" sx={{ color: location.pathname === '/shorts' ? 'primary.main' : '#94A3B8', display: { xs: 'none', md: 'inline-flex' } }}>
                                        <PlayCircleOutline />
                                    </IconButton>
                                </Tooltip>



                                <Button
                                    component={Link}
                                    to="/connections"
                                    variant="text"
                                    startIcon={<PeopleAlt />}
                                    sx={{
                                        borderRadius: '100px',
                                        color: location.pathname === '/connections' ? 'primary.main' : '#F8FAFC',
                                        mr: 1,
                                        display: { xs: 'none', md: 'inline-flex' }
                                    }}
                                >
                                    Network
                                </Button>
                                <Button
                                    component={Link}
                                    to="/create-post"
                                    variant="contained"
                                    startIcon={<AddCircleOutline />}
                                    sx={{
                                        borderRadius: '100px',
                                        display: { xs: 'none', sm: 'inline-flex' }
                                    }}
                                >
                                    Create
                                </Button>
                                <IconButton
                                    component={Link}
                                    to="/create-post"
                                    sx={{ display: { xs: 'none', sm: 'none' }, color: 'primary.main' }}
                                >
                                    <AddCircleOutline />
                                </IconButton>

                                <Tooltip title="Notifications">
                                    <IconButton component={Link} to="/notifications" sx={{ color: location.pathname === '/notifications' ? 'primary.main' : '#94A3B8', mr: 1 }}>
                                        <Badge badgeContent={unreadCount} color="error">
                                            <Notifications />
                                        </Badge>
                                    </IconButton>
                                </Tooltip>

                                <Box
                                    onClick={handleOpenMenu}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        p: '4px 12px 4px 4px',
                                        borderRadius: '100px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderColor: 'rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    <Avatar sx={{
                                        width: 32,
                                        height: 32,
                                        background: 'linear-gradient(45deg, #6366F1, #8B5CF6)',
                                        fontSize: '0.8rem',
                                        fontWeight: 800
                                    }}>
                                        {user.username[0].toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 700, ml: 1, display: { xs: 'none', md: 'block' } }}>
                                        {user.username}
                                    </Typography>
                                </Box>

                                <Tooltip title="Logout">
                                    <IconButton
                                        onClick={handleLogout}
                                        sx={{
                                            ml: 1,
                                            color: '#94A3B8',
                                            '&:hover': { color: '#F43F5E', bgcolor: 'rgba(244, 63, 94, 0.1)' },
                                            display: { xs: 'none', md: 'inline-flex' }
                                        }}
                                    >
                                        <Logout fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleCloseMenu}
                                    onClick={handleCloseMenu}
                                    PaperProps={{
                                        elevation: 0,
                                        className: 'glass-panel',
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            minWidth: 180,
                                            borderRadius: '16px',
                                            backgroundColor: 'rgba(15, 23, 42, 0.9) !important',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'rgba(15, 23, 42, 0.9)',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
                                            {user.username}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                            {user.email}
                                        </Typography>
                                    </Box>

                                    <MenuItem
                                        component={Link}
                                        to={`/profile/${user.username}`}
                                        onClick={handleCloseMenu}
                                        sx={{ borderRadius: '8px', mx: 1, mb: 0.5 }}
                                    >
                                        <ListItemIcon>
                                            <AccountCircleOutlined fontSize="small" sx={{ color: '#F8FAFC' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Profile" sx={{ '& .MuiTypography-root': { fontWeight: 600 } }} />
                                    </MenuItem>

                                    <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', mx: 1, color: '#F43F5E', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.1)' } }}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" sx={{ color: '#F43F5E' }} />
                                        </ListItemIcon>
                                        <ListItemText primary="Logout" sx={{ '& .MuiTypography-root': { fontWeight: 700 } }} />
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button component={Link} to="/login" variant="text" color="inherit">Login</Button>
                                <Button
                                    component={Link}
                                    to="/signup"
                                    variant="contained"
                                    sx={{
                                        borderRadius: '100px',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Get Started
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar >
    );
};

export default Navbar;
