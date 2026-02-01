const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String }, // 'image', 'video', 'document', 'sticker'
    originalName: { type: String },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
