const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config');
const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

/**
 * Database connection manager class
 * Handles connection, disconnection, and error handling for MongoDB
 */
class Database {
  constructor() {
    this.mongoose = mongoose;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<mongoose.Connection>} Mongoose connection object
   * @throws {AppError} If connection fails
   */
  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Using existing database connection');
        return this.mongoose.connection;
      }

      // Add event listeners for connection events
      this.mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err}`);
      });
      
      this.mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      // Connect to MongoDB
      const connection = await this.mongoose.connect(config.mongo.uri, config.mongo.options);
      this.isConnected = true;
      logger.info('Connected to MongoDB successfully');
      
      return connection;
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      throw new AppError(
        'Database connection failed',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.DATABASE_ERROR,
        true
      );
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    
    try {
      await this.mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error(`Error disconnecting from MongoDB: ${error.message}`);
    }
  }
}

module.exports = new Database(); 