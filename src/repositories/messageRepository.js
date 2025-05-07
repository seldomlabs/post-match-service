const Message = require('../models/Message');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

class MessageRepository {
  /**
   * @param {Object} messageData
   * @returns {Promise<Message>} 
   * @throws {AppError} 
   */
  async create(messageData) {
    try {
      return await Message.create(messageData);
    } catch (error) {
      logger.error(`Error creating message: ${error.message}`);
      throw new AppError(
        'Failed to create message',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Find messages by room ID
   * @param {string} roomId
   * @param {number} limit 
   * @returns {Promise<Message[]>}
   * @throws {AppError} 
   */
  async findByRoomId(roomId, limit = 50) {
    try {
      return await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      logger.error(`Error finding messages by roomId: ${error.message}`);
      throw new AppError(
        'Failed to retrieve messages',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * @param {string} roomId 
   * @param {string} text 
   * @returns {Promise<Message>} 
   * @throws {AppError} 
   */
  async createSystemMessage(roomId, data) {
    try {
      return await Message.create({
        roomId,
        sender: 'system',
        data,
        isSystemMessage: true
      });
    } catch (error) {
      logger.error(`Error creating system message: ${error.message}`);
      throw new AppError(
        'Failed to create system message',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Find messages by room ID with pagination
   * @param {string} roomId
   * @param {Object} options
   * @param {number} [options.offset=0] - Number of messages to skip
   * @param {number} [options.limit=10] - Number of messages to return
   * @returns {Promise<Message[]>}
   * @throws {AppError} 
   */
  async findByRoomIdWithPagination(roomId, { offset = 0, limit = 10 }) {
    try {
      return await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .skip(parseInt(offset, 10))
        .limit(parseInt(limit, 10))
        .exec();
    } catch (error) {
      logger.error(`Error finding messages by roomId with pagination: ${error.message}`);
      throw new AppError(
        'Failed to retrieve messages',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }
}

module.exports = new MessageRepository(); 