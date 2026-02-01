require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

const addYouTubeShort = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to assign the short to.');
            process.exit();
        }

        const newShort = new Post({
            userId: user._id,
            username: user.username,
            title: 'Featured Short',
            text: 'Check out this amazing video! 🎥 #featured #shorts',
            mediaUrl: 'https://youtu.be/U-MPyvz9RhE',
            mediaType: 'video',
            likes: [],
            comments: []
        });

        await newShort.save();
        console.log('YouTube Short successfully added to the database!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addYouTubeShort();
