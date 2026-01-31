const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const { createPost, getPosts, likePost, commentPost } = require('../controllers/postController');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/', getPosts);
router.post('/', auth, upload.single('image'), createPost);
router.put('/:id/like', auth, likePost);
router.post('/:id/comment', auth, commentPost);

module.exports = router;
