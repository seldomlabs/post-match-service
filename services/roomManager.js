const Room = require('../models/Room');

/**
 * Creates or retrieves a room for the given meetingId.
 * @param {string} meetingId - Unique meeting identifier
 * @param {string} userId - Unique user identifier
 * @returns {Promise<string>} roomId - ID of the room created or retrieved
 */
async function createRoom(meetingId, userId, coordinates) {
  try{
    let room = await Room.findOne({ meetingId });

    if (!room) {
        const roomId = `room-${meetingId}`;
        room = await Room.create({ meetingId, roomId, users: [{id: userId, coordinates: coordinates}] });
    } else if (!room.users.includes(userId)) {
        if (room.users.length >= 2) {
            throw new Error('Room already has two participants');
        }
        room.users.push({id: userId, coordinates: coordinates});
        await room.save();
    }
    return room
  }
  catch(err){
    console.log(err)
  }
}

/**
 * Gets users in a specific room.
 * @param {string} roomId - ID of the room
 * @returns {Promise<string[]>} - Array of user IDs
 */
async function getUsersInRoom(roomId) {
    const room = await Room.findOne({ roomId });
    return room ? room.users : [];
}


/**
 * Remove user from a specific room.
 * @param {string} roomId - ID of the room
 * @param {string} userId - ID of the user
 */
async function removeUserFromRoom(roomId, userId) {
  await Room.findOneAndUpdate({meetingId: roomId}, {$pull: {
    users: { id: userId } 
    }})
}

module.exports = { createRoom, getUsersInRoom,removeUserFromRoom };
