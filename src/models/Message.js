const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: String,         // institute ID
  receiverId: String,       // student ID
  message: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
