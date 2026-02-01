const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getNotifications, markAsRead, deleteNotification, createCallNotification } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.post('/call', auth, createCallNotification);
router.put('/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;
