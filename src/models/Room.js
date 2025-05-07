const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { 
    type: String, 
    required: [true, 'User ID is required'] 
  },
  // coordinates: { 
  //   type: String, 
  //   required: [true, 'User coordinates are required'] 
  // },
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const RoomSchema = new Schema({
  meetingId: { 
    type: String, 
    required: [true, 'Meeting ID is required'], 
    unique: true,
    trim: true,
    index: true
  },
  roomId: { 
    type: String, 
    required: [true, 'Room ID is required'],
    trim: true 
  },
  users: [UserSchema],
  commonPoint: { 
    type: String,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  versionKey: false
});

RoomSchema.index({ meetingId: 'text', roomId: 'text' });

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room; 