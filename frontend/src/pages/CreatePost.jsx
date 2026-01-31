import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, IconButton } from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CreatePost = () => {
    const [text, setText] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !image) return alert('Please add some text or an image');

        setLoading(true);
        const formData = new FormData();
        formData.append('text', text);
        if (image) formData.append('image', image);

        try {
            await API.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Create Post</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="What's on your mind?"
                        variant="outlined"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <Box sx={{ mb: 3 }}>
                        {!preview ? (
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                                sx={{ py: 2, borderStyle: 'dashed' }}
                            >
                                Upload Image
                                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                            </Button>
                        ) : (
                            <Box sx={{ position: 'relative' }}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'contain' }}
                                />
                                <IconButton
                                    onClick={removeImage}
                                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                                    size="small"
                                >
                                    <Close />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ py: 1.5 }}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default CreatePost;
