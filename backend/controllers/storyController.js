const User = require('../models/User');

// Add a new story to the current user's document
exports.createStory = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Media file is required for stories' });

        const { overlayText } = req.body;
        const user = await User.findById(req.user.id);

        const newStory = {
            mediaUrl: `/uploads/${req.file.filename}`,
            mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
            overlayText: overlayText || '',
            createdAt: new Date()
        };

        user.stories.push(newStory);
        await user.save();

        res.status(201).json(newStory);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Fetch stories from personal and connections circle
exports.getStories = async (req, res) => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Auto-cleanup database: Remove stories older than 24h from all users
        // This ensures the DB stays clean even without a separate cron job
        await User.updateMany(
            {},
            { $pull: { stories: { createdAt: { $lt: twentyFourHoursAgo } } } }
        );

        const user = await User.findById(req.user.id);
        const connectionIds = [...user.friends, req.user.id];

        // Fetch all users in my circle who have active stories
        const usersWithStories = await User.find({
            _id: { $in: connectionIds },
            'stories.0': { $exists: true }
        }).select('username stories');

        // Filter out expired stories for the response (redundant but safe)
        const trayData = usersWithStories.map(u => ({
            userId: u._id,
            username: u.username,
            stories: u.stories.filter(s => s.createdAt > twentyFourHoursAgo)
        })).filter(u => u.stories.length > 0);

        res.json(trayData);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a specific story
exports.deleteStory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const storyId = req.params.storyId;

        user.stories = user.stories.filter(s => s._id.toString() !== storyId);
        await user.save();

        res.json({ message: 'Story deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Toggle like on a story
exports.likeStory = async (req, res) => {
    try {
        const { targetUserId, storyId } = req.params;
        const myUsername = req.user.username;

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const story = targetUser.stories.id(storyId);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        if (story.likes.includes(myUsername)) {
            story.likes = story.likes.filter(name => name !== myUsername);
        } else {
            story.likes.push(myUsername);
        }

        await targetUser.save();
        res.json(story);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Periodic Cleanup (Expiring stories manually if needed, though filtered in fetch)
exports.expireStories = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        await User.updateMany(
            {},
            { $pull: { stories: { createdAt: { $lt: twentyFourHoursAgo } } } }
        );

        res.json({ message: 'Expired stories cleared from database' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
