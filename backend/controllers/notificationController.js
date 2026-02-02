const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'username')
            .populate('post', 'title mediaUrl');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        if (notif.recipient.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createCallNotification = async (req, res) => {
    try {
        const { recipientId } = req.body;

        // 1. Create INCOMING notification for the receiver
        const incomingNotif = new Notification({
            recipient: recipientId,
            sender: req.user.id,
            type: 'CALL_INCOMING',
            read: false
        });

        // 2. Create OUTGOING record for the caller (already read)
        const outgoingNotif = new Notification({
            recipient: req.user.id,
            sender: recipientId,
            type: 'CALL_OUTGOING',
            read: true
        });

        await Promise.all([incomingNotif.save(), outgoingNotif.save()]);

        res.status(201).json(outgoingNotif);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
