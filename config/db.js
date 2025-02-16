const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectToDatabase() {
    const uri = process.env.MONGO_URI;
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
