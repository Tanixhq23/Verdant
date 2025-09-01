require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require("./utils/logger");
const { mongoURI } = require('./config/config');
const auditRoutes = require('./routes/auditRoutes');
const footprintRoutes = require('./routes/footprintRoutes');
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// --- Set the port from environment variables ---
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// HTTP request logging via morgan + winston
app.use(
    morgan("combined", {
        skip: (req, res) => res.statusCode >= 400,
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

app.use(
    morgan("combined", {
        skip: (req, res) => res.statusCode < 400,
        stream: {
            write: (message) => logger.error(message.trim()),
        },
    })
);

// Proxy to FastAPI
app.use('/report', createProxyMiddleware({
    target: 'https://verdant-1-iyd7.onrender.com/',
    changeOrigin: true,
    pathRewrite: { '^/report': '/' } 
}));

// --- API routes ---
app.use('/api', auditRoutes);
app.use('/api/v1/footprint', footprintRoutes);

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, '../', 'Frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'Frontend', 'index.html'));
});

// Route for serving the website tracker HTML
app.get('/websiteTracker', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'Frontend', 'websiteTracker', 'index.html'));
});

// New route to handle POST requests from the website tracker
app.post('/websiteTracker', (req, res) => {
    // Process the data sent from the frontend
    logger.info('Received data from /websiteTracker POST:', { data: req.body });
    
    // Respond with a success message
    res.status(200).json({ message: "Tracker data received successfully." });
});

// --- Error Handling Middleware (LAST) ---
// 1. Inline unhandled error logger
app.use((err, req, res, next) => {
    logger.error('🔥 Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl
    });
    res.status(500).json({ error: "Internal Server Error" });
});

// 2. Centralized error handler (custom middleware)
app.use(errorHandler);

// --- Debugging Mongo URI ---
logger.debug(`DEBUG: mongoURI from config: ${mongoURI}`);
if (!mongoURI) {
    logger.error('CRITICAL ERROR: MONGODB_URI is not defined in your .env file or config.js');
    process.exit(1);
}

// --- Connect to MongoDB ---
mongoose.connect(mongoURI)
    .then(() => logger.info('✅ MongoDB connected'))
    .catch(err => logger.error(`❌ MongoDB connection error: ${err.message}`, { error: err }));

// --- Start Server ---
app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
});