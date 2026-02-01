const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { sendMessage, getMessages, getConversations, deleteMessage, clearConversation } = require('../controllers/messageController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'msg-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);
router.post('/', auth, upload.single('media'), sendMessage);
router.delete('/:messageId', auth, deleteMessage);
router.delete('/conversation/:userId', auth, clearConversation);

module.exports = router;
