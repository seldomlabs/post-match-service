const { createClient } = require('redis');
const logger = require('../utils/logger');
const config = require('../config');
const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

/**
 * Handles connection, disconnection, and error handling for Redis
 */
class RedisClient {
  constructor() {
    this.pubClient = null;
    this.subClient = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis and create publisher and subscriber clients
   * @returns {Promise<{pubClient: RedisClient, subClient: RedisClient}>} 
   * @throws {AppError}
   */
  async connect() {
    try {
      if (this.isConnected) {
        logger.info('Using existing Redis connection');
        return { pubClient: this.pubClient, subClient: this.subClient };
      }

      this.pubClient = createClient({ 
        url: config.redis.url, 
        socket: {
          reconnectStrategy: config.redis.reconnectStrategy
        }
      });
      
      // Create a duplicate client for subscription
      this.subClient = this.pubClient.duplicate();

      // Register event handlers for both clients
      this.pubClient.on('error', (err) => {
        logger.error(`Redis Publisher Error: ${err.message}`);
      });

      this.pubClient.on('reconnecting', () => {
        logger.warn('Redis Publisher reconnecting...');
      });

      this.subClient.on('error', (err) => {
        logger.error(`Redis Subscriber Error: ${err.message}`);
      });

      this.subClient.on('reconnecting', () => {
        logger.warn('Redis Subscriber reconnecting...');
      });

      // Connect to Redis
      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
      this.isConnected = true;
      logger.info('Connected to Redis successfully');

      return { pubClient: this.pubClient, subClient: this.subClient };
    } catch (error) {
      logger.error(`Failed to connect to Redis: ${error.message}`);
      throw new AppError(
        'Redis connection failed',
        StatusCodes.INTERNAL_SERVER_ERROR,
        errorCodes.REDIS_CONNECTION_ERROR,
        true
      );
    }
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    
    try {
      if (this.pubClient) await this.pubClient.disconnect();
      if (this.subClient) await this.subClient.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from Redis');
    } catch (error) {
      logger.error(`Error disconnecting from Redis: ${error.message}`);
    }
  }
}

module.exports = new RedisClient(); 