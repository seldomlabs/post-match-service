const { StatusCodes } = require('http-status-codes');
const logger = require('../../utils/logger');
const AppError = require('../../errors/AppError');
const errorCodes = require('../../errors/errorCodes');

/**
 * Global error handler middleware
 * @param {Error} err 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}${err.stack ? `\nStack: ${err.stack}` : ''}`);
  
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let errorCode = errorCodes.UNKNOWN_ERROR;
  let message = 'An unexpected error occurred';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    isOperational = err.isOperational;
  } 
  else if (err.name === 'ValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    errorCode = errorCodes.INVALID_PARAMETERS;
    message = err.message;
    isOperational = true;
  } 
  else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    errorCode = errorCodes.DATABASE_ERROR;
    message = 'Duplicate key error';
    isOperational = true;
  }

  const errorResponse = {
    status: 'error',
    error: {
      code: errorCode,
      message: isOperational ? message : 'An unexpected error occurred',
    }
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.error.stack = err.stack.split('\n');
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler; 