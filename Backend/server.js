// server.js
require('dotenv').config(); // Load environment variables FIRST

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const { port, mongoURI } = require('./config/config');

// --- Routes ---
const auditRoutes = require('./routes/auditRoutes');
const footprintRoutes = require('./routes/footprintRoutes');
const reportRoutes = require('./routes/reportRoutes');

// --- Middlewares ---
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// --- Core Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'Frontend')));


// --- Logging (Morgan + Winston) ---
app.use(
  morgan('combined', {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(
  morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) },
  })
);

// --- API Routes ---
app.use('/api/reports', reportRoutes);
app.use('/api', auditRoutes);
app.use('/api/v1/footprint', footprintRoutes);

// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, '../', 'Frontend')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'Frontend', 'index.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'Frontend','websiteTracker', 'report.html'));
});

app.get('/websiteTracker', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'Frontend', 'websiteTracker', 'index.html'));
});

// --- Error Handling ---
// Inline fallback logger for unhandled errors
app.use((err, req, res, next) => {
  logger.error('🔥 Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Centralized custom error handler
app.use(errorHandler);

// --- MongoDB Connection ---
logger.debug(`DEBUG: mongoURI from config`);
if (!mongoURI) {
  logger.error('CRITICAL ERROR: MONGODB_URI is not defined in .env or config.js');
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`, { error: err }));

// --- Start Server ---
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
