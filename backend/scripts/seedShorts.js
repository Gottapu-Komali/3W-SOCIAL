require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

const seedShorts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found to assign shorts to. Please create a user first.');
            process.exit();
        }

        const shorts = [
            {
                userId: user._id,
                username: user.username,
                title: 'Neon Nights',
                text: 'Living for the aesthetic ✨ #neon #vibes',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1300-large.mp4',
                mediaType: 'video',
                likes: [],
                comments: []
            },
            {
                userId: user._id,
                username: user.username,
                title: 'Summer Blooms',
                text: 'Nature is the best artist 🌼 #nature #summer',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
                mediaType: 'video',
                likes: [],
                comments: []
            },
            {
                userId: user._id,
                username: user.username,
                title: 'Galaxy Dreams',
                text: 'Lost in the stars 🌠 #galaxy #space',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-118-large.mp4',
                mediaType: 'video',
                likes: [],
                comments: []
            },
            {
                userId: user._id,
                username: user.username,
                title: 'Ocean Breeze',
                text: 'Take me to the ocean 🌊 #sea #ocean',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-1227-large.mp4',
                mediaType: 'video',
                likes: [],
                comments: []
            },
            {
                userId: user._id,
                username: user.username,
                title: 'Skater Life',
                text: 'Keep rolling 🛹 #skate #lifestyle',
                mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-man-skating-on-the-road-1317-large.mp4',
                mediaType: 'video',
                likes: [],
                comments: []
            }
        ];

        await Post.insertMany(shorts);
        console.log('5 Shorts successfully added to the database!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedShorts();
