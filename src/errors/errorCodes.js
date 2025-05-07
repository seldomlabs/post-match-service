/**
 * Application-specific error codes
 * These codes are used to identify specific error scenarios in the application
 */
module.exports = {
  // Room related errors
  ROOM_FULL: 'ROOM_FULL',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  
  // Database related errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Connection related errors
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR',
  
  // Validation errors
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  MAP_SERVICE_ERROR: 'MAP_SERVICE_ERROR',
  
  // Socket errors
  SOCKET_ERROR: 'SOCKET_ERROR',
  
  // Authentication errors
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}; 