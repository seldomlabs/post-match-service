const Message = require('../models/Message');

/**
 * Saves a message to the database.
 * @param {string} roomId - ID of the room
 * @param {string} sender - Sender's user ID
 * @param {string} text - Message content
 * @returns {Promise<Message>} - Saved message document
 */
async function saveMessage(roomId, sender, text) {
    const message = new Message({ roomId, sender, text });
    return await message.save();
}

/**
 * Retrieves messages for a specific room.
 * @param {string} roomId - ID of the room
 * @param {number} limit - Number of messages to retrieve (default: 50)
 * @returns {Promise<Message[]>} - List of messages
 */
async function getMessagesForRoom(roomId, limit = 50) {
    return await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
}

module.exports = { saveMessage, getMessagesForRoom };
