const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST: Send a message from institute to student
router.post('/send', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});
// GET: Get all messages between two users (institute <-> student)
router.get('/chat/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 }); // sort by time (oldest to newest)

    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});


module.exports = router;
