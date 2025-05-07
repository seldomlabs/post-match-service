const awilix = require('awilix');
const logger = require('../utils/logger');
const config = require('../config');
const database = require('./database');
const redisClient = require('./redisClient');
const { mapServiceClient } = require('./apiClient');
const roomRepository = require('../repositories/roomRepository');
const messageRepository = require('../repositories/messageRepository');

const RoomService = require('../services/RoomService');
const MessageService = require('../services/MessageService');
const LocationService = require('../services/LocationService');

const SocketHandler = require('../socket/socketHandler');

const HealthController = require('../api/controllers/healthController');
const LocationController = require('../api/controllers/locationController');
const ChatController = require('../api/controllers/chatController');

/**
 * Set up the dependency injection container
 * @returns {Object}
 */
function setupContainer() {
  const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({
    logger: awilix.asValue(logger),
    config: awilix.asValue(config),
    
    database: awilix.asValue(database),
    redisClient: awilix.asValue(redisClient),
    mapServiceClient: awilix.asValue(mapServiceClient),
    
    roomRepository: awilix.asValue(roomRepository),
    messageRepository: awilix.asValue(messageRepository),
    
    roomService: awilix.asClass(RoomService).singleton(),
    messageService: awilix.asClass(MessageService).singleton(),
    locationService: awilix.asClass(LocationService).singleton(),
    
    socketHandler: awilix.asClass(SocketHandler).singleton(),
    
    healthController: awilix.asClass(HealthController).singleton(),
    locationController: awilix.asClass(LocationController).singleton(),
    chatController: awilix.asClass(ChatController).singleton(),
  });

  return container;
}

module.exports = setupContainer; 