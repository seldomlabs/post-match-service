const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

/**
 * Contains business logic for managing messages
 */
class MessageService {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.messageRepository 
   * @param {Object} dependencies.logger
   */
  constructor({ messageRepository, logger }) {
    this.messageRepository = messageRepository;
    this.logger = logger;
  }

  /**
   * @param {string} roomId 
   * @param {string} sender
   * @param {string} text 
   * @returns {Promise<Object>} 
   * @throws {AppError} 
   */
  async saveMessage(roomId, sender, data, type) {
    try {
      if (!roomId || !sender || !data || !type) {
        throw new AppError(
          'Missing required message parameters',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }
      
      const message = await this.messageRepository.create({ roomId, sender, data, type });
      this.logger.info(`Message saved for room ${roomId} from sender ${sender}`);
      return message;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error saving message: ${error.message}`);
      throw new AppError(
        'Failed to save message',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * @param {string} roomId 
   * @param {number} limit 
   * @returns {Promise<Object[]>} 
   * @throws {AppError} 
   */
  async getMessagesForRoom(roomId, limit = 50) {
    try {
      if (!roomId) {
        throw new AppError(
          'Missing roomId parameter',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }
      
      const messages = await this.messageRepository.findByRoomId(roomId, limit);
      this.logger.info(`Retrieved ${messages.length} messages for room ${roomId}`);
      return messages;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error retrieving messages: ${error.message}`);
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
   * @returns {Promise<Object>} 
   * @throws {AppError}
   */
  async addSystemMessage(roomId, data) {
    try {
      if (!roomId || !data) {
        throw new AppError(
          'Missing required parameters',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }
      
      const message = await this.messageRepository.createSystemMessage(roomId, data);
      this.logger.info(`System message added to room ${roomId}: ${data}`);
      return message;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error adding system message: ${error.message}`);
      throw new AppError(
        'Failed to add system message',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Get chat info with paginated messages
   * @param {string} matchId - The match ID
   * @param {Object} options - Pagination options
   * @param {string} [options.offset] - ISO timestamp to start from
   * @param {number} [options.limit=10] - Number of messages to return
   * @returns {Promise<Object>} Chat info with messages
   * @throws {AppError}
   */
  async getChatInfo(matchId, { offset, limit = 10 }) {
    try {
      if (!matchId) {
        throw new AppError(
          'Match ID is required',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const roomId = matchId;
      const messages = await this.messageRepository.findByRoomIdWithPagination(roomId, {
        offset,
        limit
      });

      const nextOffset = messages.length === limit 
        ? messages[messages.length - 1].timestamp.toISOString() 
        : -1;

      const matchedUser = {
        name: "Avantika",
        profile_url: "url",
        status: "online"
      };

      return {
        chat_id: matchId,
        matched_user: matchedUser,
        meet_factor: 0.5,
        match_expiry_time: "2025-05-01T14:30:00.000Z",
        time_to_meet: "2025-05-01T14:30:00.000Z",
        suggest_messages: [
          "Hi what are you upto?",
          "What's up for meals",
          "Hi what are you upto?"
        ],
        chat_intro: true,
        offset: nextOffset,
        messages: messages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          type: msg.type,
          data: msg.data,
          timestamp: msg.timestamp,
          is_system_message: msg.isSystemMessage
        }))
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error getting chat info: ${error.message}`);
      throw new AppError(
        'Failed to get chat info',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }
}

module.exports = MessageService; 