import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import Connections from './pages/Connections';
import Profile from './pages/Profile';
import Shorts from './pages/Shorts';

import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#818CF8', // Electric Indigo
            light: '#A5B4FC',
            dark: '#4F46E5',
        },
        secondary: {
            main: '#F472B6', // Vibrant Pink
            light: '#FB923C', // Warm accent
        },
        background: {
            default: '#0F172A',
            paper: '#1E293B',
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#94A3B8',
        },
        action: {
            hover: 'rgba(255, 255, 255, 0.05)',
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        h4: {
            fontWeight: 800,
            letterSpacing: '-0.04em',
        },
        h6: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#334155 transparent",
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        width: 8,
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "#334155",
                        border: "2px solid transparent",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 0 15px rgba(129, 140, 248, 0.3)',
                    },
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 24,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s ease',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(129, 140, 248, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#818CF8',
                            boxShadow: '0 0 0 4px rgba(129, 140, 248, 0.15)',
                        },
                    },
                },
            },
        },
    },
});

import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Navbar />
                    <IncomingCallOverlay />
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Feed />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/create-post"
                            element={
                                <ProtectedRoute>
                                    <CreatePost />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/connections"
                            element={
                                <ProtectedRoute>
                                    <Connections />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/:username"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shorts"
                            element={
                                <ProtectedRoute>
                                    <Shorts />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <MobileNav />
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
