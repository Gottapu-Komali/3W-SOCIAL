const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
    try {
        const { title, text } = req.body;
        let mediaUrl = null;
        let mediaType = null;

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
        }

        if (!title && !text && !mediaUrl) {
            return res.status(400).json({ message: 'Post cannot be empty.' });
        }

        const newPost = new Post({
            userId: req.user.id,
            username: req.user.username,
            title,
            text,
            mediaUrl,
            mediaType
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 5, filter = 'all' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (filter === 'network') {
            const user = await User.findById(req.user.id);
            query = { userId: { $in: [...user.friends, req.user.id] } };
        } else if (filter === 'popular') {
            const posts = await Post.find()
                .sort({ 'likes.length': -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum);
            const total = await Post.countDocuments();
            return res.json({ posts, total, hasMore: total > skip + posts.length });
        } else if (filter === 'shorts') {
            query = { mediaType: { $in: ['video', 'image', null] } };
        }

        const posts = await Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
        const total = await Post.countDocuments(query);

        res.json({
            posts,
            total,
            hasMore: total > skip + posts.length
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { title, text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        post.title = title || post.title;
        post.text = text || post.text;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const username = req.user.username;
        const userId = req.user.id;

        const isLiking = !post.likes.includes(username);

        if (isLiking) {
            post.likes.push(username);
            // Notify post owner
            if (post.userId.toString() !== userId) {
                await new Notification({
                    recipient: post.userId,
                    sender: userId,
                    type: 'LIKE',
                    post: post._id
                }).save();
            }
        } else {
            post.likes = post.likes.filter(name => name !== username);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// --- Comment Controllers ---

exports.commentPost = async (req, res) => {
    try {
        const { text, parentCommentId } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user.id;

        if (parentCommentId) {
            const comment = post.comments.id(parentCommentId);
            if (!comment) return res.status(404).json({ message: 'Parent comment not found' });

            comment.replies.push({
                userId: userId,
                username: req.user.username,
                text
            });

            // Notify comment owner
            if (comment.userId.toString() !== userId) {
                await new Notification({
                    recipient: comment.userId,
                    sender: userId,
                    type: 'REPLY',
                    post: post._id
                }).save();
            }
        } else {
            post.comments.push({
                userId: userId,
                username: req.user.username,
                text
            });

            // Notify post owner
            if (post.userId.toString() !== userId) {
                await new Notification({
                    recipient: post.userId,
                    sender: userId,
                    type: 'COMMENT',
                    post: post._id
                }).save();
            }
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const { commentId, replyId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const target = replyId ? comment.replies.id(replyId) : comment;
        if (!target) return res.status(404).json({ message: 'Target not found' });

        const username = req.user.username;
        const userId = req.user.id;

        if (target.likes.includes(username)) {
            target.likes = target.likes.filter(u => u !== username);
        } else {
            target.likes.push(username);
            // Notify target owner
            if (target.userId.toString() !== userId) {
                await new Notification({
                    recipient: target.userId,
                    sender: userId,
                    type: 'LIKE', // Or specific type like 'COMMENT_LIKE' if we had it
                    post: post._id
                }).save();
            }
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId, replyId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (replyId) {
            const reply = comment.replies.id(replyId);
            if (!reply) return res.status(404).json({ message: 'Reply not found' });
            if (reply.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            reply.deleteOne();
        } else {
            if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            comment.deleteOne();
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.pinComment = async (req, res) => {
    try {
        const { commentId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        post.comments.forEach(c => {
            if (c._id.toString() === commentId) {
                c.isPinned = !c.isPinned;
            } else {
                c.isPinned = false;
            }
        });

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.toggleSavePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isSaved = user.savedPosts.includes(postId);

        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id && id.toString() !== postId);
        } else {
            user.savedPosts.push(postId);
        }

        await user.save();
        res.json({ message: isSaved ? 'Post unsaved' : 'Post saved', savedPosts: user.savedPosts });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
