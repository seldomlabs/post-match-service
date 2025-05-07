const express = require('express');
const router = express.Router();

const setupHealthRoutes = require('./healthRoutes');
const setupLocationRoutes = require('./locationRoutes');
const setupChatRoutes = require('./chatRoutes');

/**
 * @param {Object} dependencies
 * @param {Object} dependencies.healthController
 * @param {Object} dependencies.locationController
 * @param {Object} dependencies.chatController
 */
function setupRoutes(container) {
  // Health check route
  router.use('/health', setupHealthRoutes(container));
  
  // Location routes
  router.use('/location', setupLocationRoutes(container));
  
  // Chat routes
  router.use('/chat', setupChatRoutes({ chatController: container.resolve('chatController') }));

  return router;
}

module.exports = setupRoutes; 