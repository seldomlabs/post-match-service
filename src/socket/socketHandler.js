const AppError = require('../errors/AppError');
const errorCodes = require('../errors/errorCodes');

class SocketHandler {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.roomService 
   * @param {Object} dependencies.messageService 
   * @param {Object} dependencies.locationService 
   * @param {Object} dependencies.logger
   */
  constructor({ roomService, messageService, locationService, logger }) {
    this.roomService = roomService;
    this.messageService = messageService;
    this.locationService = locationService;
    this.logger = logger;
    this.io = null;
  }

  /**
   * Initialize the Socket.io server
   * @param {Object} io 
   */
  initialize(io) {
    this.io = io;
    this.setupConnectionHandlers();
    this.logger.info('Socket.io handler initialized');
  }

  setupConnectionHandlers() {
    this.io.on('connection', async (socket) => {
      this.logger.info(`New client connected: ${socket.id}`);
      
      try {
        const { meetId, userId
          // , coordinates
         }
           = socket.handshake.query;

        if (!meetId || !userId 
          // || !coordinates
        ) {
          socket.disconnect(true);
          this.logger.error(`Missing required connection parameters for socket: ${socket.id}`);
          return;
        }

        await this.handleConnection(socket, meetId, userId
          // , coordinates
        );
        
        this.setupMessageHandler(socket);
        this.setupLocationHandler(socket);
        this.setupDisconnectHandler(socket, meetId, userId);
        
      } catch (error) {
        this.logger.error(`Error handling socket connection: ${error.message}`);
        socket.disconnect(true);
      }
    });
  }

  /**
   * Handle a new connection
   * @param {Object} socket 
   * @param {string} meetId 
   * @param {string} userId 
   */
  async handleConnection(socket, meetId, userId
    // , coordinates
  ) {
    try {
      await this.roomService.createOrJoinRoom(meetId, userId
        // , coordinates
      );
      socket.join(meetId);
      this.logger.info(`User ${userId} joined room ${meetId}`);
      
      // const messages = await this.messageService.getMessagesForRoom(meetId);
      // socket.emit("chatHistory", messages);
      
      this.io.to(meetId).emit("userJoined", { userId });
      
      // await this.messageService.addSystemMessage(meetId, `User ${userId} joined the room`);
    } catch (error) {
      if (error instanceof AppError && error.errorCode === errorCodes.ROOM_FULL) {
        socket.emit('error', { 
          code: error.errorCode, 
          message: error.message 
        });
        socket.disconnect(true);
      }
      throw error;
    }
  }

  /**
   * Set up message event handler
   * @param {Object} socket - Socket.io socket
   */
  setupMessageHandler(socket) {
    socket.on('message', async (response) => {
      try {
        const { roomId, userId, data ,type} = response;
        
        if (!roomId || !userId || !data) {
          socket.emit('error', { 
            code: errorCodes.INVALID_PARAMETERS, 
            message: 'Missing required message parameters' 
          });
          return;
        }
        
        this.logger.info(`Message from ${userId} in room ${roomId}: ${data}`);
        const message = await this.messageService.saveMessage(roomId, userId, data,type);
        
        socket.broadcast.to(roomId).emit('message', { userId, message });
      } catch (error) {
        this.logger.error(`Error handling message: ${error.message}`);
        socket.emit('error', { 
          code: error.errorCode || errorCodes.UNKNOWN_ERROR, 
          message: error.message 
        });
      }
    });
  }

  /**
   * Set up location event handler
   * @param {Object} socket 
   */
  setupLocationHandler(socket) {
    socket.on("location", async (data) => {
      try {
        const { latitude, longitude, roomId, userId } = data;
        
        if (!latitude || !longitude || !roomId || !userId) {
          socket.emit('error', { 
            code: errorCodes.INVALID_PARAMETERS, 
            message: 'Missing required location parameters' 
          });
          return;
        }
        
        const coordinates = `${latitude},${longitude}`;
        
        await this.roomService.createOrJoinRoom(roomId, userId, coordinates);
        
        const locationData = { 
          userId, 
          latitude, 
          longitude, 
          timestamp: Date.now() 
        };
        
        socket.broadcast.to(roomId).emit("location", locationData);
        
        this.logger.info(`${userId} shared location: (${latitude}, ${longitude})`);
      } catch (error) {
        this.logger.error(`Error handling location update: ${error.message}`);
        socket.emit('error', { 
          code: error.errorCode || errorCodes.UNKNOWN_ERROR, 
          message: error.message 
        });
      }
    });
  }

  /**
   * Set up disconnect event handler
   * @param {Object} socket 
   * @param {string} meetId 
   * @param {string} userId 
   */
  setupDisconnectHandler(socket, meetId, userId) {
  
    socket.on('disconnect', async () => {
      try {
        await this.roomService.removeUserFromRoom(meetId, userId);
        this.logger.info(`Client disconnected: ${socket.id}, user: ${userId}`);
        
        socket.broadcast.to(meetId).emit('userLeft', { userId });
        
        // await this.messageService.addSystemMessage(meetId, `User ${userId} left the room`);
      } catch (error) {
        this.logger.error(`Error handling disconnect: ${error.message}`);
      }
    });

    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
      process.on(signal, () => {
        this.logger.info(`Signal ${signal} received, disconnecting socket: ${socket.id}`);
        socket.disconnect(true);
      });
    });
  }
}

module.exports = SocketHandler; 