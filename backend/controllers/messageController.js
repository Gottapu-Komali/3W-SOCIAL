const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
    try {
        const { recipientId, text, mediaType: customMediaType, replyToId } = req.body;
        const senderId = req.user.id;

        if (!text && !req.file && !customMediaType === 'sticker') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        let mediaUrl = null;
        let mediaType = customMediaType || null;
        let originalName = null;

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            originalName = req.file.originalname;

            if (!mediaType) {
                if (req.file.mimetype.startsWith('image')) mediaType = 'image';
                else if (req.file.mimetype.startsWith('video')) mediaType = 'video';
                else if (req.file.mimetype.startsWith('audio')) mediaType = 'audio';
                else mediaType = 'document';
            }
        }

        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            text,
            mediaUrl,
            mediaType,
            originalName,
            replyTo: replyToId || null
        });

        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('replyTo', 'text mediaUrl mediaType sender');

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('SEND MESSAGE ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        })
            .populate('replyTo', 'text mediaUrl mediaType sender')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await User.findById(userId).populate('friends', 'username');
        const friendIds = currentUser.friends.map(f => f._id.toString());

        // Find all users current user has messaged or received messages from
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        }).sort({ createdAt: -1 });

        const conversationPartners = new Set(friendIds);
        messages.forEach(m => {
            const partnerId = m.sender.toString() === userId ? m.recipient.toString() : m.sender.toString();
            conversationPartners.add(partnerId);
        });

        const users = await User.find({ _id: { $in: Array.from(conversationPartners) } })
            .select('username');

        // Enhance with last message
        const enhancedConversations = users.map(user => {
            const lastMessage = messages.find(m =>
                m.sender.toString() === user._id.toString() ||
                m.recipient.toString() === user._id.toString()
            );

            let previewText = lastMessage ? (lastMessage.text || '') : 'Start a conversation';
            let lastMessageTime = lastMessage ? lastMessage.createdAt : new Date(0);
            let unread = lastMessage ? (lastMessage.recipient.toString() === userId && !lastMessage.read) : false;

            if (lastMessage && !previewText && lastMessage.mediaType) {
                if (lastMessage.mediaType === 'image') previewText = '📷 Image';
                else if (lastMessage.mediaType === 'video') previewText = '🎥 Video';
                else if (lastMessage.mediaType === 'sticker') previewText = '✨ Sticker';
                else previewText = '📄 Document';
            }

            return {
                _id: user._id,
                username: user.username,
                lastMessage: previewText,
                lastMessageTime: lastMessageTime,
                unread: unread
            };
        });

        res.json(enhancedConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // Only sender can delete their message
        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this message' });
        }

        await Message.findByIdAndDelete(messageId);
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.clearConversation = async (req, res) => {
    try {
        const { userId: otherUserId } = req.params;
        const userId = req.user.id;

        await Message.deleteMany({
            $or: [
                { sender: userId, recipient: otherUserId },
                { sender: otherUserId, recipient: userId }
            ]
        });

        res.json({ message: 'Conversation cleared successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
