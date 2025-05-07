const express = require('express');
const router = express.Router();

/**
 * @param {Object} dependencies
 * @param {Object} dependencies.chatController
 */
function setupChatRoutes({ chatController }) {
  router.get('/:match_id', (req, res, next) => chatController.getChatInfo(req, res, next));

  return router;
}

module.exports = setupChatRoutes; 