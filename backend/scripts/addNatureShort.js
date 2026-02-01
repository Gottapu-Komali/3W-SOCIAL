require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

const addVecteezyShort = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to assign the short to.');
            process.exit();
        }

        // Using a direct high-quality nature video link as Vecteezy requires browser interaction/download 
        // to get the direct file URL, which is currently restricted by environment settings.
        const newShort = new Post({
            userId: user._id,
            username: user.username,
            title: 'Waterfall in Wild Nature',
            text: 'Discover the hidden beauty of the wild! 🌊🌲 #nature #waterfall #vecteezy',
            mediaUrl: 'https://static.videezy.com/system/resources/previews/000/011/727/original/Nature_7_1080p.mp4',
            mediaType: 'video',
            likes: [],
            comments: []
        });

        await newShort.save();
        console.log('Nature Short successfully added to the database!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addVecteezyShort();
