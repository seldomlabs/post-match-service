require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createShardedAdapter } = require("@socket.io/redis-adapter");
const cors = require('cors');
const helmet = require('helmet');

const setupContainer = require('./lib/container');
const container = setupContainer();

const logger = container.resolve('logger');
const config = container.resolve('config');
const database = container.resolve('database');
const redisClient = container.resolve('redisClient');
const socketHandler = container.resolve('socketHandler');

const routes = require('./api/routes');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

const io = new Server(server, {
  cors: { origin: '*' },
  transports: ["websocket", "polling"],
  maxDisconnectionDuration: 2 * 60 * 1000,
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', routes(container));

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route not found: ${req.originalUrl}`
    }
  });
});

async function startServer() {
  try {
    await database.connect();
    
    const { pubClient, subClient } = await redisClient.connect();
    
    io.adapter(createShardedAdapter(pubClient, subClient, { 
      subscriptionMode: 'dynamic-private' 
    }));

    socketHandler.initialize(io);
    
    const PORT = config.port || 8001;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    setupGracefulShutdown();
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Set up graceful shutdown handlers
 */
function setupGracefulShutdown() {
  const signals = ['SIGTERM', 'SIGINT', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`${signal} signal received: closing HTTP server`);
      
      try {
        await database.disconnect();
        await redisClient.disconnect();
        server.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      } catch (error) {
        logger.error(`Error during graceful shutdown: ${error.message}`);
        process.exit(1);
      }
    });
  });
}

// Start the server
startServer(); 