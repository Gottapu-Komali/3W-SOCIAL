const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = `test_${Date.now()}@example.com`;
        const newUser = new User({
            username: `testuser_${Date.now()}`,
            email: testEmail,
            password: 'password123'
        });

        await newUser.save();
        console.log('User created successfully:', testEmail);

        await User.deleteOne({ email: testEmail });
        console.log('Test user cleaned up');

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
