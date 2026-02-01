const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedCallHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found');
            process.exit(1);
        }

        const otherUser = await User.findOne({ _id: { $ne: user._id } }) || user;

        const callNotifs = [
            {
                recipient: user._id,
                sender: otherUser._id,
                type: 'CALL_INCOMING',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
            },
            {
                recipient: user._id,
                sender: otherUser._id,
                type: 'CALL_MISSED',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                recipient: user._id,
                sender: otherUser._id,
                type: 'CALL_OUTGOING',
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
            }
        ];

        await Notification.insertMany(callNotifs);
        console.log('Call history notifications seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding call history:', err);
        process.exit(1);
    }
};

seedCallHistory();
