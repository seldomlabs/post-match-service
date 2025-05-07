const express = require('express');

/**
 * Configure health-related routes
 * @param {Object} container 
 * @returns {Object} 
 */
const setupHealthRoutes = (container) => {
  const router = express.Router();
  const healthController = container.resolve('healthController');
  
  /**
   * @route GET /api/health
   * @description Health check endpoint
   * @access Public
   */
  router.get('/', (req, res) => healthController.check(req, res));
  
  return router;
};

module.exports = setupHealthRoutes; 