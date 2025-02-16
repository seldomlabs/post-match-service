const { createRoom, removeUserFromRoom } = require('./roomManager');
const logger = require('../utils/logger');
const { saveMessage, getMessagesForRoom } = require('./messageMananger');
const axios = require('axios');
const Room = require('../models/Room');




/**
 * Initializes the WebSocket server.
 * @param {Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
    io.on('connection', async (socket) => {
        logger.info(`New client connected: ${socket.id}`);
        const { meetId, userId ,coordinates} = socket.handshake.query;

        if (!meetId || !userId || !coordinates) {
            socket.disconnect(true);
            logger.error("Missing meetingId or userId, disconnecting...");
            return;
        }

        try {
            await createRoom(meetId, userId, coordinates);
            socket.join(meetId);
            logger.info(`User ${userId} joined room ${meetId}`);
            const messages = await getMessagesForRoom(meetId);
            socket.emit("chatHistory", messages);
            io.to(meetId).emit("userJoined", { userId });

        socket.on('message', async ({ roomId, userId, text }) => {
            if(!roomId || !userId || !text){
                return;
            }
            logger.info(`Message from ${userId} in room ${roomId}: ${text}`);
            const message = await saveMessage(roomId, userId, text);
            socket.broadcast.to(roomId).emit('message', { userId, message });
        });
        socket.on("location", ({ latitude, longitude, roomId, userId}) => {
          if (!latitude || !longitude) return;
          
          const locationData = { userId, latitude, longitude, timestamp: Date.now() };
          socket.broadcast.to(roomId).emit("location", locationData);
          
          logger.info(`${userId} shared location: (${latitude}, ${longitude})`);
      });
      } catch (error) {
        await removeUserFromRoom(meetId, userId)
        socket.disconnect(true)
    }

        socket.on('disconnect', async (e) => {
            try{
            await removeUserFromRoom(meetId, userId)
            logger.info(`Client disconnected: ${socket.id}`);
            }
            catch(err){
                logger.info(`Error while removing user from the room: ${socket.id}`);
            }
        });

        ['SIGINT', 'SIGTERM', 'SIGQUIT']
        .forEach(signal => process.on(signal, () => {
          socket.disconnect(true)
        }));

    });
}

module.exports = { initializeSocket };
