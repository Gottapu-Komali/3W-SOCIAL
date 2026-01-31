import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Divider, TextField, Button, Avatar } from '@mui/material';
import { Favorite, FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import API, { BASE_URL } from '../api/axios';

const PostCard = ({ post, onUpdate }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const isLiked = user && post.likes.includes(user.username);

    const handleLike = async () => {
        if (!user) return alert('Please login to like posts');
        try {
            const { data } = await API.put(`/posts/${post._id}/like`);
            onUpdate(data);
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment');
        if (!commentText.trim()) return;

        try {
            const { data } = await API.post(`/posts/${post._id}/comment`, { text: commentText });
            onUpdate(data);
            setCommentText('');
        } catch (err) {
            console.error('Error commenting:', err);
        }
    };

    return (
        <Card sx={{ mb: 4, overflow: 'visible' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {post.username[0].toUpperCase()}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {post.username}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
            </Box>

            {post.imageUrl && (
                <CardMedia
                    component="img"
                    image={`${BASE_URL}${post.imageUrl}`}
                    alt="Post content"
                    sx={{ maxHeight: 500, objectFit: 'contain', backgroundColor: '#f0f0f0' }}
                />
            )}

            <CardContent>
                {post.text && (
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {post.text}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={handleLike} size="small" color={isLiked ? "error" : "default"}>
                            {isLiked ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.likes.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => setShowComments(!showComments)} size="small">
                            <ChatBubbleOutline />
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.comments.length}</Typography>
                    </Box>
                </Box>

                {showComments && (
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        {post.comments.map((comment, idx) => (
                            <Box key={idx} sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, mr: 1 }}>
                                    {comment.username}
                                </Typography>
                                <Typography variant="body2" component="span">
                                    {comment.text}
                                </Typography>
                            </Box>
                        ))}

                        <Box component="form" onSubmit={handleComment} sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <Button type="submit" variant="text" size="small" sx={{ fontWeight: 700 }}>
                                Post
                            </Button>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default PostCard;
