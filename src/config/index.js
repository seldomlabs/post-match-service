const dotenv = require('dotenv');
const Joi = require('joi');
const path = require('path');
const logger = require('../utils/logger');

const envFile = process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV || 'development'}`;
const envPath = path.resolve(process.cwd(), envFile);

logger.info(`Loading environment from ${envPath}`);
dotenv.config({ path: envPath });

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(8001),
    MONGO_URI: Joi.string().required().description('MongoDB connection string'),
    REDIS_URL: Joi.string().required().description('Redis connection string'),
    MAP_SERVICE_URL: Joi.string().required().description('Map service URL'),
  })
  .unknown();

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongo: {
    uri: envVars.MONGO_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redis: {
    url: envVars.REDIS_URL,
    reconnectStrategy: (retries) => Math.min(retries * 1000, 5000),
  },
  mapService: {
    url: envVars.MAP_SERVICE_URL,
    timeout: 5000,
  },
};

module.exports = config; 