// backend/index.js

console.log('🚀 index.js has started loading!');

const express = require('express');
const app = express();

const connectDB = require('./config/database');   // MongoDB connection
require('./cron');                                // kick off your cron jobs

// --- connect to MongoDB ---
connectDB();

// --- middleware ---
app.use(express.json()); // parse JSON bodies

// --- routes ---
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/price',   require('./routes/price'));
app.use('/api/trade',   require('./routes/trade'));
app.use('/api/withdraw',require('./routes/withdraw'));
app.use('/api/user',    require('./routes/user'));
app.use('/api/fund',    require('./routes/fund'));
app.use('/api/admin',   require('./routes/admin'));

// --- error handler for 404 on APIs ---
app.use((req, res) => {
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// --- start server ---
const PORT = config.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.NODE_ENV} mode`);
});

module.exports = app;

