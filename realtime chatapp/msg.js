const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
});


module.exports = mongoose.model('Message', MessageSchema);