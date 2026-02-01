const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    likes: [{ type: String }], // Array of usernames
    isPinned: { type: Boolean, default: false },
    replies: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            username: { type: String, required: true },
            text: { type: String, required: true },
            likes: [{ type: String }],
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    title: { type: String },
    text: { type: String },
    mediaUrl: { type: String }, // Can be image or video URL
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
    likes: [{ type: String }], // Array of usernames
    comments: [CommentSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
