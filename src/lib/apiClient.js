const axios = require('axios');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');
const { StatusCodes } = require('http-status-codes');
const errorCodes = require('../errors/errorCodes');

/**
 * API Client with Circuit Breaker pattern
 */
class ApiClient {
  /**
   * @param {string} baseURL 
   * @param {number} timeout
   */
  constructor(baseURL, timeout = 5000) {
    this.client = axios.create({
      baseURL,
      timeout,
    });
    
    this.failureCount = 0;
    this.circuitOpen = false;
    this.lastAttemptTime = 0;
    this.MAX_FAILURES = 3;
    this.RESET_TIMEOUT = 30000; // 30 seconds
  }

  /**
   * @param {string} method 
   * @param {string} url 
   * @param {Object} data
   * @param {Object} headers
   * @returns {Promise<any>} 
   * @throws {AppError} 
   */
  async request(method, url, data = null, headers = {}) {
    if (this.circuitOpen) {
      const now = Date.now();
      if (now - this.lastAttemptTime < this.RESET_TIMEOUT) {
        throw new AppError(
          'Service temporarily unavailable',
          StatusCodes.SERVICE_UNAVAILABLE,
          errorCodes.EXTERNAL_SERVICE_ERROR,
          true
        );
      }
      
      this.circuitOpen = false;
      this.failureCount = 0;
      logger.info(`Circuit reset for ${this.client.defaults.baseURL}`);
    }

    try {
      const response = await this.client.request({
        method,
        url,
        data: method !== 'get' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers,
      });

      this.failureCount = 0;
      return response.data;
    } catch (error) {
      this.lastAttemptTime = Date.now();
      this.failureCount++;
      
      if (this.failureCount >= this.MAX_FAILURES) {
        this.circuitOpen = true;
        logger.error(`Circuit opened for ${this.client.defaults.baseURL} after ${this.failureCount} failures`);
      }

      const status = error.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.message || error.message || 'External service error';
      
      logger.error(`API request failed: ${method.toUpperCase()} ${url} - ${message}`);
      
      throw new AppError(
        `External service error: ${message}`,
        status,
        errorCodes.EXTERNAL_SERVICE_ERROR,
        true
      );
    }
  }

  /**
   * Make a GET request
   * @param {string} url 
   * @param {Object} params 
   * @param {Object} headers 
   * @returns {Promise<any>} 
   */
  async get(url, params = {}, headers = {}) {
    return this.request('get', url, params, headers);
  }

  /**
   * Make a POST request
   * @param {string} url 
   * @param {Object} data 
   * @param {Object} headers 
   * @returns {Promise<any>}
   */
  async post(url, data = {}, headers = {}) {
    return this.request('post', url, data, headers);
  }
}

const mapServiceClient = new ApiClient(process.env.MAP_SERVICE_URL, 5000);

module.exports = {
  ApiClient,
  mapServiceClient,
}; 