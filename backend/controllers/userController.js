const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Get all users (except current) to discover people
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get user by ID for chat initialization
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email createdAt friends');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get current user's profile with populated fields
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('friends', 'username email')
            .populate('friendRequestsReceived', 'username email')
            .populate('friendRequestsSent', 'username email');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get public profile based on username or ID
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                friendsCount: user.friends.length,
                createdAt: user.createdAt
            },
            posts
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Send connection request
exports.sendRequest = async (req, res) => {
    try {
        const targetId = req.params.id;
        const senderId = req.user.id;

        if (targetId === senderId) return res.status(400).json({ message: 'Cannot send request to yourself' });

        const targetUser = await User.findById(targetId);
        const senderUser = await User.findById(senderId);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Check if already connected or request pending
        if (senderUser.friends.includes(targetId)) return res.status(400).json({ message: 'Already connected' });
        if (senderUser.friendRequestsSent.includes(targetId)) return res.status(400).json({ message: 'Request already sent' });

        // Update sender
        senderUser.friendRequestsSent.push(targetId);
        await senderUser.save();

        // Update receiver
        targetUser.friendRequestsReceived.push(senderId);
        await targetUser.save();

        // Notify receiver
        await new Notification({
            recipient: targetId,
            sender: senderId,
            type: 'FRIEND_REQUEST'
        }).save();

        res.json({ message: 'Connection request sent' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Cancel sent request
exports.cancelRequest = async (req, res) => {
    try {
        const targetId = req.params.id;
        const senderId = req.user.id;

        const senderUser = await User.findById(senderId);
        const targetUser = await User.findById(targetId);

        senderUser.friendRequestsSent = senderUser.friendRequestsSent.filter(id => id.toString() !== targetId);
        await senderUser.save();

        if (targetUser) {
            targetUser.friendRequestsReceived = targetUser.friendRequestsReceived.filter(id => id.toString() !== senderId);
            await targetUser.save();

            // Optionally delete the notification
            await Notification.deleteOne({ sender: senderId, recipient: targetId, type: 'FRIEND_REQUEST' });
        }

        res.json({ message: 'Request cancelled' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Accept connection request
exports.acceptRequest = async (req, res) => {
    try {
        const targetId = req.params.id; // User who sent the request
        const userId = req.user.id; // Current user accepting it

        const user = await User.findById(userId);
        const sender = await User.findById(targetId);

        if (!sender) return res.status(404).json({ message: 'User not found' });

        // Verify request exists
        if (!user.friendRequestsReceived.includes(targetId)) {
            return res.status(400).json({ message: 'No request from this user' });
        }

        // Add to friends
        user.friends.push(targetId);
        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== targetId);
        await user.save();

        sender.friends.push(userId);
        sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id.toString() !== userId);
        await sender.save();

        // Notify sender that their request was accepted
        await new Notification({
            recipient: targetId,
            sender: userId,
            type: 'FRIEND_ACCEPT'
        }).save();

        res.json({ message: 'Connection accepted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Reject connection request
exports.rejectRequest = async (req, res) => {
    try {
        const targetId = req.params.id;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const sender = await User.findById(targetId);

        user.friendRequestsReceived = user.friendRequestsReceived.filter(id => id.toString() !== targetId);
        await user.save();

        if (sender) {
            sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id.toString() !== userId);
            await sender.save();
        }

        res.json({ message: 'Connection rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Remove connection (Unfriend)
exports.removeFriend = async (req, res) => {
    try {
        const targetId = req.params.id;
        const userId = req.user.id;

        const user = await User.findById(userId);
        const friend = await User.findById(targetId);

        user.friends = user.friends.filter(id => id.toString() !== targetId);
        await user.save();

        if (friend) {
            friend.friends = friend.friends.filter(id => id.toString() !== userId);
            await friend.save();
        }

        res.json({ message: 'Connection removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', 'username _id email');
        res.json(user.friends);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
