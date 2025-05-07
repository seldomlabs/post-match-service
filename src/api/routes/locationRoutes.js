const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middlewares/requestValidator');

/**
 * Configure location-related routes
 * @param {Object} container - Dependency injection container
 * @returns {Object} Express router with location routes
 */
const setupLocationRoutes = (container) => {
  const router = express.Router();
  const locationController = container.resolve('locationController');
  
  /**
   * @route POST /api/location/points-of-interest
   * @description Get points of interest for a meetup
   * @access Public
   */
  router.post(
    '/points-of-interest',
    [
      body('meetId').notEmpty().withMessage('meetId is required'),
      body('radius').isNumeric().withMessage('radius must be a number'),
      validateRequest
    ],
    (req, res, next) => locationController.getPointsOfInterest(req, res, next)
  );
  
  return router;
};

module.exports = setupLocationRoutes; 