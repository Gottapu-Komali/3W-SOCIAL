const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { createStory, getStories, deleteStory, expireStories, likeStory } = require('../controllers/storyController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'story-' + Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', auth, getStories);
router.post('/', auth, upload.single('media'), createStory);
router.delete('/:storyId', auth, deleteStory);
router.put('/:targetUserId/:storyId/like', auth, likeStory);
router.post('/expire-cleanup', auth, expireStories); // Manual trigger or cron job endpoint

module.exports = router;
