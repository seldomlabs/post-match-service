const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

class RoomService {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.roomRepository 
   * @param {Object} dependencies.logger
   */
  constructor({ roomRepository, logger }) {
    this.roomRepository = roomRepository;
    this.logger = logger;
  }

  /**
   * @param {string} meetingId 
   * @param {string} userId 
  //  * @param {string} coordinates
   * @returns {Promise<Object>} 
   * @throws {AppError} 
   */
  async createOrJoinRoom(meetingId, userId) {
    try {
      if (!meetingId || !userId 
        // || !coordinates
      ) {
        throw new AppError(
          'Missing required parameters',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      let room = await this.roomRepository.findByMeetingId(meetingId);

      if (!room) {
        const roomId = `room-${meetingId}`;
        room = await this.roomRepository.create({
          meetingId,
          roomId,
          users: [{ id: userId, 
            // coordinates 
          }],
        });
        this.logger.info(`Created new room: ${roomId} for meeting: ${meetingId}`);
      } else {
        const userExists = room.users.some(user => user.id === userId);
        
        if (!userExists) {
          if (room.users.length >= 2) {
            throw new AppError(
              'Room already has two participants',
              StatusCodes.BAD_REQUEST,
              errorCodes.ROOM_FULL,
              true
            );
          }
          
          room = await this.roomRepository.addUserToRoom(meetingId, { id: userId
            //  ,coordinates 
            });
          this.logger.info(`User ${userId} joined room for meeting: ${meetingId}`);
        } else {
          // room = await this.roomRepository.updateUserCoordinates(meetingId, userId,coordinates);
          this.logger.info(`Updated coordinates for user ${userId} in meeting: ${meetingId}`);
        }
      }
      return room;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error in createOrJoinRoom: ${error.message}`);
      throw new AppError(
        'Failed to create or join room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * @param {string} meetingId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   * @throws {AppError}
   */
  async removeUserFromRoom(meetingId, userId) {
    try {
      if (!meetingId || !userId) {
        throw new AppError(
          'Missing required parameters',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const room = await this.roomRepository.removeUserFromRoom(meetingId, userId);
      
      if (!room) {
        throw new AppError(
          'Room not found',
          StatusCodes.NOT_FOUND,
          errorCodes.ROOM_NOT_FOUND,
          true
        );
      }
      
      this.logger.info(`Removed user ${userId} from meeting: ${meetingId}`);
      return room;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error removing user from room: ${error.message}`);
      throw new AppError(
        'Failed to remove user from room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * @param {string} meetingId 
   * @returns {Promise<Object>} 
   * @throws {AppError} 
   */
  async updateCommonPoint(meetingId
    // , coordinates
  ) {
    try {
      if (!meetingId 
        // || !coordinates
      ) {
        throw new AppError(
          'Missing required parameters',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const room = await this.roomRepository.updateCommonPoint(meetingId
        // ,coordinates
        );
      
      if (!room) {
        throw new AppError(
          'Room not found',
          StatusCodes.NOT_FOUND,
          errorCodes.ROOM_NOT_FOUND,
          true
        );
      }
      
      this.logger.info(`Updated common point for meeting: ${meetingId}`);
      return room;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error updating common point: ${error.message}`);
      throw new AppError(
        'Failed to update common point',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }
}

module.exports = RoomService; 