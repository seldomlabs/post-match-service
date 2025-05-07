const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

/**
 * Service for location-related operations
 * Contains business logic for managing locations and points of interest
 */
class LocationService {
  /**
   * Create a new LocationService
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.mapServiceClient - Map service client
   * @param {Object} dependencies.roomRepository - Room repository
   * @param {Object} dependencies.logger - Logger instance
   */
  constructor({ mapServiceClient, roomRepository, logger }) {
    this.mapServiceClient = mapServiceClient;
    this.roomRepository = roomRepository;
    this.logger = logger;
  }

  /**
   * Compute the meetup point between two users
   * @param {string} meetingId
   * @returns {Promise<string|null>} 
   * @throws {AppError}
   */
  async computeMeetupPoint(meetingId) {
    try {
      if (!meetingId) {
        throw new AppError(
          'Missing meetingId parameter',
          StatusCodes.BAD_REQUEST,
          errorCodes.INVALID_PARAMETERS,
          true
        );
      }

      const room = await this.roomRepository.findByMeetingId(meetingId);
      
      if (!room) {
        throw new AppError(
          'Room not found',
          StatusCodes.NOT_FOUND,
          errorCodes.ROOM_NOT_FOUND,
          true
        );
      }
      
      if (room.users.length !== 2) {
        this.logger.info(`Cannot compute meetup point: room has ${room.users.length} users, need exactly 2`);
        return null;
      }
      
      try {
        // const response = await this.mapServiceClient.post('/api/computeMeetupPoint', {
        //   userA: { coordinates: room.users[0]?.coordinates },
        //   userB: { coordinates: room.users[1]?.coordinates }
        // });
        
        // if (response && response.coordinates) {
        //   // Save the computed common point to the room
        //   await this.roomRepository.updateCommonPoint(meetingId, response.coordinates);
        //   this.logger.info(`Computed meetup point for meeting ${meetingId}: ${response.coordinates}`);
        //   return response.coordinates;
        // }
        
        // return null;
      } catch (error) {
        this.logger.error(`Map service error: ${error.message}`);
        throw new AppError(
          'Failed to compute meetup point from map service',
          StatusCodes.INTERNAL_SERVER_ERROR,
          errorCodes.MAP_SERVICE_ERROR,
          true
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      this.logger.error(`Error computing meetup point: ${error.message}`);
      throw new AppError(
        'Failed to compute meetup point',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.EXTERNAL_SERVICE_ERROR,
        true
      );
    }
  }

  /**
   * Get points of interest around a location
   * @param {string} coordinates 
   * @param {number|string} radius 
   * @returns {Promise<Array>} 
   * @throws {AppError} 
   */
  // async getPointsOfInterest(coordinates, radius) {
  //   try {
  //     if (!coordinates || !radius) {
  //       throw new AppError(
  //         'Missing coordinates or radius parameters',
  //         StatusCodes.BAD_REQUEST,
  //         errorCodes.INVALID_PARAMETERS,
  //         true
  //       );
  //     }
      
  //     try {
  //       const response = await this.mapServiceClient.get(
  //         `/api/getPOI?coordinates=${coordinates}&radius=${radius}`
  //       );
        
  //       this.logger.info(`Retrieved ${response?.length || 0} POIs for coordinates ${coordinates}`);
  //       return response || [];
  //     } catch (error) {
  //       this.logger.error(`Map service error getting POIs: ${error.message}`);
  //       throw new AppError(
  //         'Failed to get points of interest from map service',
  //         StatusCodes.INTERNAL_SERVER_ERROR,
  //         errorCodes.MAP_SERVICE_ERROR,
  //         true
  //       );
  //     }
  //   } catch (error) {
  //     if (error instanceof AppError) {
  //       throw error;
  //     }
      
  //     this.logger.error(`Error getting points of interest: ${error.message}`);
  //     throw new AppError(
  //       'Failed to get points of interest',
  //       StatusCodes.INTERNAL_SERVER_ERROR,
  //       errorCodes.EXTERNAL_SERVICE_ERROR,
  //       true
  //     );
  //   }
  // }
}

module.exports = LocationService; 