const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String },
    imageUrl: { type: String },
    likes: [{ type: String }], // Array of usernames
    comments: [
        {
            username: { type: String, required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
