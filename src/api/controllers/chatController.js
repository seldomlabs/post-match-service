const AppError = require('../../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../../errors/errorCodes');

class ChatController {
  /**
   * @param {Object} dependencies
   * @param {Object} dependencies.messageService
   * @param {Object} dependencies.roomService
   * @param {Object} dependencies.logger
   */
  constructor({ messageService, roomService, logger }) {
    this.messageService = messageService;
    this.roomService = roomService;
    this.logger = logger;
  }

  /**
   * Get chat info with paginated messages
   * @param {Object} req 
   * @param {Object} res 
   * @param {Function} next
   */
  async getChatInfo(req, res, next) {
    try {
      const { match_id: matchId } = req.params;
      const { offset, limit = 10 } = req.query;

      if (!matchId) {
        throw new AppError(
          'Match ID is required',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const chatInfo = await this.messageService.getChatInfo(matchId, {
        offset,
        limit: parseInt(limit, 10)
      });

      res.status(StatusCodes.OK).json(chatInfo);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController; 