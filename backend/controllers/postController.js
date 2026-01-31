const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!text && !imageUrl) {
            return res.status(400).json({ message: 'Post cannot be empty. Add text or an image.' });
        }

        const newPost = new Post({
            userId: req.user.id,
            username: req.user.username,
            text,
            imageUrl
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const username = req.user.username;
        if (post.likes.includes(username)) {
            // Unlike
            post.likes = post.likes.filter(name => name !== username);
        } else {
            // Like
            post.likes.push(username);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            username: req.user.username,
            text
        });

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
