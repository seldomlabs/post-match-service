const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    meetingId: { type: String, required: true, unique: true },
    roomId: { type: String, required: true },
    users: [{ 
        _id: false,
        id: { type: String, required: true }, 
        coordinates: { type: String, required: true } 
    }],
    commonPoint: {type: String}
});

module.exports = mongoose.model('Room', RoomSchema);
