const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/authMiddleware');
const {
    createPost,
    getPosts,
    updatePost,
    likePost,
    commentPost,
    deletePost,
    likeComment,
    deleteComment,
    pinComment,
    toggleSavePost
} = require('../controllers/postController');

// Multer Setup for Rich Media
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'media-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|quicktime/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

router.get('/', getPosts);
router.post('/', auth, upload.single('media'), createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, likePost);

// Enhanced Comment Routes
router.post('/:id/comment', auth, commentPost);
router.put('/:id/comment/like', auth, likeComment);
router.delete('/:id/comment', auth, deleteComment);
router.put('/:id/comment/pin', auth, pinComment);
router.put('/:id/save', auth, toggleSavePost);

module.exports = router;
