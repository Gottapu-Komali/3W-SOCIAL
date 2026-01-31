import React, { useState, useEffect } from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import API from '../api/axios';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data } = await API.get('/posts');
            setPosts(data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleUpdatePost = (updatedPost) => {
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {posts.length === 0 ? (
                <Typography variant="body1" align="center" color="textSecondary">
                    No posts yet. Be the first to share something!
                </Typography>
            ) : (
                posts.map((post) => (
                    <PostCard key={post._id} post={post} onUpdate={handleUpdatePost} />
                ))
            )}
        </Container>
    );
};

export default Feed;
