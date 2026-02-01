const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    getAllUsers,
    getMe,
    getUserProfile,
    getUserById,
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    getFriends
} = require('../controllers/userController');

router.get('/', auth, getAllUsers);
router.get('/friends', auth, getFriends);
router.get('/me', auth, getMe);
router.get('/profile/:username', auth, getUserProfile);
router.get('/:id', auth, getUserById);
router.post('/request/:id', auth, sendRequest);
router.delete('/request/:id', auth, cancelRequest);
router.put('/accept/:id', auth, acceptRequest);
router.put('/reject/:id', auth, rejectRequest);
router.delete('/remove/:id', auth, removeFriend);

module.exports = router;
