const Message = require('../models/Message');


exports.getConversationMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await Message.find({ conversation: conversationId }).sort('createdAt');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};