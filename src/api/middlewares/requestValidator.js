const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../../errors/AppError');
const errorCodes = require('../../errors/errorCodes');

/**
 * Middleware to validate requests using express-validator
 * @param {Object} req 
 * @param {Object} res
 * @param {Function} next
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      return {
        param: error.param,
        message: error.msg,
        value: error.value
      };
    });
    
    const firstError = errors.array()[0];
    
    throw new AppError(
      `Validation failed: ${firstError.msg}`,
      StatusCodes.BAD_REQUEST,
      errorCodes.INVALID_PARAMETERS,
      true
    );
  }
  
  next();
};

module.exports = validateRequest; 