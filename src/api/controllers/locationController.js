const { StatusCodes } = require('http-status-codes');
const AppError = require('../../errors/AppError');
const errorCodes = require('../../errors/errorCodes');

class LocationController {
  /**
   * @param {Object} dependencies
   * @param {Object} dependencies.locationService
   * @param {Object} dependencies.logger
   */
  constructor({ locationService, logger }) {
    this.locationService = locationService;
    this.logger = logger;
  }

  /**
   * Get points of interest for a meetup
   * @param {Object} req 
   * @param {Object} res
   * @param {Function} next
   */
  async getPointsOfInterest(req, res, next) {
    try {
      const { meetId, radius } = req.body;

      if (!meetId || !radius) {
        throw new AppError(
          'Missing meetId or radius in the request body',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const meetupPoint = await this.locationService.computeMeetupPoint(meetId);
      
      if (!meetupPoint) {
        return res.status(StatusCodes.OK).json({ 
          success: true, 
          message: 'Cannot compute meetup point yet',
          placesOfInterest: []
        });
      }
      
      const placesOfInterest = await this.locationService.getPointsOfInterest(meetupPoint, radius);
      
      req.io.to(meetId).emit("pointsOfInterest", { placesOfInterest });
      
      this.logger.info(`Sent ${placesOfInterest.length} POIs to room ${meetId}`);
      
      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: 'Points of interest broadcast sent',
        placesOfInterest
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController; 