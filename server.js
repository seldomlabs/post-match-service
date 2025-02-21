require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require("redis");
const { createShardedAdapter } = require("@socket.io/redis-adapter");
const connectToDatabase = require('./config/db');
const { initializeSocket } = require('./services/socketManager');
const Room = require('./models/Room');
const logger = require('./utils/logger');
const { default: axios } = require('axios');

// Initialize express app and HTTP server
const app = express();
const server = http.createServer(app);

let pubClient, subClient, redisClient;
let io;

// Function to initialize Redis
async function connectRedis() {
    pubClient = createClient({ url: process.env.REDIS_URL, socket: {
        reconnectStrategy: (retries) => {
            console.warn(`Redis reconnect attempt #${retries}`);
            return Math.min(retries * 1000, 5000); 
        }
    }});
    subClient = pubClient.duplicate();

    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        console.info('Connected to Redis successfully');
        pubClient.on('error', (err) => {
        console.error(`Redis Error: ${err.message}`);
        });

        subClient.on('error', (err) => {
        console.error(`Redis Subscriber Error: ${err.message}`);
        });
        return true;
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
}

// Function to initialize WebSocket server
async function startServer() {
    await connectRedis()
    const isRedisConnected = await connectRedis();

    io = new Server(server, {
        cors: { origin: '*' },
        transports: ["websocket", "polling"],
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    });

    // If Redis connected successfully, use the Redis adapter
    if (isRedisConnected) {
        io.adapter(createShardedAdapter(pubClient, subClient, { subscriptionMode: 'dynamic-private' }));
    } else {
        console.warn('WebSocket running without Redis adapter');
    }

    connectToDatabase();

    app.use(express.json());

    initializeSocket(io);

    app.get("/health", (req, res) => {
        res.status(200).json({ status: "WebSocket server is running" });
      });

    app.post("/broadcast", async (req, res) => {
        const { meetId, radius} = req.body;

        if (!meetId || !radius) {
          return res.status(400).json({ error: "Missing meetId or radius in the request body" });
        }
        const room = await Room.findOne({meetingId: meetId})
        let placesOfInterest = [];
        if(room?.users?.length == 2){
            try{
            const response = await axios.post(`${process.env.MAP_SERVICE_URL}/api/computeMeetupPoint`,{
                userA: {coordinates: room.users[0]?.coordinates},
                userB: {coordinates: room.users[1]?.coordinates}
            })
            const cords = response?.data?.coordinates
            if(cords){
                const response = await axios.get(`${process.env.MAP_SERVICE_URL}/api/getPOI?coordinates=${cords}&radius=${radius}`)
                placesOfInterest = response?.data;
            }
            else{
            logger.error("Mapbox Service Error",err);
            }
        }
        catch(err){
            logger.error("Mapbox Service Error",err);
        }
        }
        io.to(meetId).emit("message", {  placesOfInterest: placesOfInterest});
        return res.status(200).json({ success: true, message: "Broadcast sent" });
      });

    // Start HTTP server
    const PORT = process.env.PORT || 8001;
    server.listen(PORT, () => {
        console.info(`Server running on port ${PORT}`);
    });
}

// Start the server
startServer();
