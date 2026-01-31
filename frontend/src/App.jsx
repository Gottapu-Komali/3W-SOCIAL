import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000',
        },
        background: {
            default: '#f8f9fa',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Navbar user={user} setUser={setUser} />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Feed />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/signup" element={<Signup setUser={setUser} />} />
                    <Route
                        path="/create-post"
                        element={
                            <ProtectedRoute>
                                <CreatePost />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
