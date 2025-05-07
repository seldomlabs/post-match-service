const Room = require('../models/Room');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

class RoomRepository {
  /**
   * Find a room by meeting ID
   * @param {string} meetingId 
   * @returns {Promise<Room|null>} 
   * @throws {AppError} 
   */
  async findByMeetingId(meetingId) {
    try {
      return await Room.findOne({ meetingId });
    } catch (error) {
      logger.error(`Error finding room by meetingId: ${error.message}`);
      throw new AppError(
        'Failed to find room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Create a new room
   * @param {Object} roomData 
   * @returns {Promise<Room>} 
   * @throws {AppError} 
   */
  async create(roomData) {
    try {
      return await Room.create(roomData);
    } catch (error) {
      logger.error(`Error creating room: ${error.message}`);
      throw new AppError(
        'Failed to create room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Update user coordinates in a room
   * @param {string} meetingId 
   * @param {string} userId 
   * @param {string} coordinates 
   * @returns {Promise<Room|null>} 
   * @throws {AppError} 
   */
  // async updateUserCoordinates(meetingId, userId, coordinates) {
  //   try {
  //     return await Room.findOneAndUpdate(
  //       { meetingId, 'users.id': userId },
  //       { 
  //         $set: { 
  //           'users.$.coordinates': coordinates,
  //           'users.$.lastActive': new Date()
  //         } 
  //       },
  //       { new: true }
  //     );
  //   } catch (error) {
  //     logger.error(`Error updating user coordinates: ${error.message}`);
  //     throw new AppError(
  //       'Failed to update user coordinates',
  //       StatusCodes.INTERNAL_SERVER_ERROR,
  //       errorCodes.DATABASE_ERROR,
  //       true
  //     );
  //   }
  // }

  /**
   * Add a user to a room
   * @param {string} meetingId 
   * @param {Object} user 
   * @returns {Promise<Room|null>}
   * @throws {AppError}
   */
  async addUserToRoom(meetingId, user) {
    try {
      return await Room.findOneAndUpdate(
        { meetingId },
        { $push: { users: user } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error adding user to room: ${error.message}`);
      throw new AppError(
        'Failed to add user to room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Remove a user from a room
   * @param {string} meetingId 
   * @param {string} userId 
   * @returns {Promise<Room|null>} 
   * @throws {AppError} 
   */
  async removeUserFromRoom(meetingId, userId) {
    try {
      return await Room.findOneAndUpdate(
        { meetingId },
        { $pull: { users: { id: userId } } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error removing user from room: ${error.message}`);
      throw new AppError(
        'Failed to remove user from room',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }
  
  /**
   * Update the common point for a room
   * @param {string} meetingId
   * @param {string} coordinates 
   * @returns {Promise<Room|null>} 
   * @throws {AppError}
   */
  async updateCommonPoint(meetingId, coordinates) {
    try {
      return await Room.findOneAndUpdate(
        { meetingId },
        { commonPoint: coordinates },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error updating common point: ${error.message}`);
      throw new AppError(
        'Failed to update common point',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }
}

module.exports = new RoomRepository(); 