const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        username = username.trim();
        email = email.trim().toLowerCase();

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ WARNING: JWT_SECRET is missing. Using fallback for demo. Set this in Render dashboard!');
        }

        const secret = process.env.JWT_SECRET || '3w_social_fallback_secret_2024';
        const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username, email } });
    } catch (err) {
        console.error('SIGNUP ERROR:', err);
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login attempt failed: User not found for email ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login attempt failed: Password mismatch for email ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ WARNING: JWT_SECRET is missing. Using fallback for demo. Set this in Render dashboard!');
        }

        const secret = process.env.JWT_SECRET || '3w_social_fallback_secret_2024';
        const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
