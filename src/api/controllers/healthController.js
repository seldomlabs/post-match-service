const { StatusCodes } = require('http-status-codes');

class HealthController {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.logger 
   */
  constructor({ logger }) {
    this.logger = logger;
  }

  /**
   * Health check endpoint controller
   * @param {Object} req 
   * @param {Object} res
   */
  check(req, res) {
    this.logger.info('Health check request received');
    
    return res.status(StatusCodes.OK).json({ 
      status: 'success',
      service: 'chat-service',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`
    });
  }
}

module.exports = HealthController; 