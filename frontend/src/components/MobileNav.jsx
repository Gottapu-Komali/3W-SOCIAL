import React, { useState, useEffect } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge, Box } from '@mui/material';
import { Home, People, AddCircle, PlayCircleOutline, ChatBubble } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        if (user) {
            const fetchUnread = async () => {
                try {
                    const { data: convs } = await API.get('/messages/conversations');
                    setUnreadMessages(convs.filter(c => c.unread).length);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchUnread();
            const interval = setInterval(fetchUnread, 15000); // Poll more frequently on mobile for responsiveness
            return () => clearInterval(interval);
        }
    }, [user, location.pathname]);

    if (!user) return null;

    // Map pathnames to index values
    const getTabValue = () => {
        const path = location.pathname;
        if (path === '/') return 0;
        if (path === '/connections') return 1;
        if (path === '/create-post') return 2;
        if (path === '/shorts') return 3;
        if (path === '/chat') return 4;
        return false;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                display: { xs: 'block', md: 'none' },
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
            elevation={0}
        >
            <BottomNavigation
                showLabels={false}
                value={getTabValue()}
                onChange={(event, newValue) => {
                    const paths = ['/', '/connections', '/create-post', '/shorts', '/chat'];
                    navigate(paths[newValue]);
                }}
                sx={{
                    bgcolor: 'transparent',
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        color: '#94A3B8',
                        minWidth: 'auto',
                        padding: '12px 0'
                    },
                    '& .Mui-selected': {
                        color: 'primary.main',
                        '& .MuiSvgIcon-root': {
                            transform: 'scale(1.2)'
                        }
                    }
                }}
            >
                <BottomNavigationAction icon={<Home />} />
                <BottomNavigationAction icon={<People />} />
                <BottomNavigationAction
                    icon={
                        <Box sx={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            borderRadius: '16px',
                            width: 44,
                            height: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                            mt: -2
                        }}>
                            <AddCircle sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                    }
                />
                <BottomNavigationAction icon={<PlayCircleOutline />} />
                <BottomNavigationAction icon={
                    <Badge badgeContent={unreadMessages} color="error">
                        <ChatBubble />
                    </Badge>
                } />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNav;
