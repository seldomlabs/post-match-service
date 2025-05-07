const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MESSAGE_TYPES = Object.freeze({
  TEXT: 'text',
  CALL: 'call',
  LOCATION: 'location',
});

const MessageSchema = new Schema({
  roomId: { 
    type: String, 
    required: [true, 'Room ID is required'],
    index: true
  },
  sender: { 
    type: String, 
    required: [true, 'Sender ID is required'] 
  },
  type: {
    type: String,
    enum: Object.values(MESSAGE_TYPES),
    default: MESSAGE_TYPES.TEXT,
  },
  
  data: { 
    type: Object, 
    required: [true, 'Message data is required'],
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false
});

MessageSchema.index({ roomId: 1, timestamp: -1 });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message; 
 