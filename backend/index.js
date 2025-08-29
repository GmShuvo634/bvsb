// backend/index.js

require('dotenv').config();
const express  = require('express');
const http = require('http');const mongoose = require('mongoose');
const cors     = require('cors');
const { Server: WebSocketServer } = require('ws');
const authRoutes  = require('./routes/auth');
const userRoutes  = require('./routes/user');
const fundRoutes  = require('./routes/fund');
const tradeRoutes = require('./routes/trade');
const betRoutes   = require('./routes/bet');
const adminRoutes = require('./routes/admin');
const dashRoutes  = require('./routes/dashboard');
const ethRoutes   = require('./routes/eth');
const statsRoutes = require('./routes/stats');
const leaderboardRoutes = require('./routes/leaderboard');
const startCron   = require('./cron');

const app = express();
const cookieParser = require('cookie-parser');
app.use(cors({ origin: ["http://localhost:3000","http://localhost:3001"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev_cookie_secret'));

// ─── Static file serving for avatars ──────────────────────────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// ─── Route mounts ───────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/fund',      fundRoutes);
app.use('/api/trade',     tradeRoutes);
app.use('/api/bet',       betRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/dashboard', dashRoutes);
app.use('/api/eth',       ethRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/pool',      require('./routes/pool'));

// ─── Health‑check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'API OK' }));

// ─── Database connection ───────────────────────────────────────────────────────
mongoose.set('strictQuery', false);
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('MongoDB connected');
      startCron();
    })
    .catch(err => console.error('MongoDB connection error:', err));
}

// ─── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

// ─── Create one HTTP server for both Express and WebSocket ────────────────────
const server = http.createServer(app);

// ─── Mount WebSocket on the same server, under “/ws” ───────────────────────────
const wss = new WebSocketServer({ server, path: '/ws' });
const bus = require('./sockets/bus');
bus.setWss(wss);

wss.on('connection', ws => {
  console.log('[WS] client connected');

  ws.on('message', async (message) => {
    try {
      console.log('[WS] received:', message.toString());

      // Try to decode the message
      let payload;
      try {
        payload = JSON.parse(Buffer.from(message.toString(), 'base64').toString());
      } catch (decodeError) {
        console.warn('[WS] Failed to decode message:', message.toString());
        return;
      }

      const { type, data } = payload;

      switch (type) {
        case 'bet': {
          // Handle betting through WebSocket
          const gameService = require('./services/gameService');
          const { address, isUpPool, bettedBalance, isDemo, guestId } = data;

          try {
            const result = await gameService.placeBet(
              isDemo ? null : data.userId,
              isDemo ? guestId : null,
              address,
              bettedBalance,
              isUpPool ? 'up' : 'down',
              isDemo
            );

            // Broadcast success (already handled by gameService)
            console.log(`[WS] Bet placed successfully: ${bettedBalance} on ${isUpPool ? 'up' : 'down'}`);
          } catch (error) {
            console.error('[WS] Bet placement failed:', error.message);
            // Could send error back to specific client if needed
          }
          break;
        }

        case 'getRoundInfo': {
          // Send current round info to client
          const gameService = require('./services/gameService');
          const roundInfo = gameService.getCurrentRound();

          const response = {
            message: {
              id: Date.now(),
              type: 'roundInfo',
              data: roundInfo
            }
          };

          ws.send(Buffer.from(JSON.stringify(response)).toString('base64'));
          break;
        }

        default:
          console.log(`[WS] Unknown message type: ${type}`);
          break;
      }
    } catch (error) {
      console.error('[WS] Message handling error:', error);
    }
  });

  // Send welcome message and current round info
  const gameService = require('./services/gameService');
  const roundInfo = gameService.getCurrentRound();

  // Send initial pool update to new client
  if (roundInfo) {
    const poolUpdateMessage = {
      message: {
        id: Date.now(),
        type: 'poolUpdate',
        data: {
          roundId: roundInfo.roundId,
          upTreasury: roundInfo.upPoolTotal || 0,
          downTreasury: roundInfo.downPoolTotal || 0,
          upPlayers: roundInfo.upPoolPlayers || 0,
          downPlayers: roundInfo.downPoolPlayers || 0
        }
      }
    };

    try {
      ws.send(Buffer.from(JSON.stringify(poolUpdateMessage)).toString('base64'));
    } catch (error) {
      console.error('[WS] Failed to send initial pool update:', error);
    }
  }

  const welcomeMessage = {
    message: {
      id: Date.now(),
      type: 'welcome',
      data: {
        message: 'Connected to BvsB WebSocket',
        roundInfo
      }
    }
  };

  ws.send(Buffer.from(JSON.stringify(welcomeMessage)).toString('base64'));
});

// ─── Initialize Price Feed Service ────────────────────────────────────────────
const priceFeedService = require('./services/priceFeedService');

// ─── Start listening ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
if (!process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`HTTP + WS server listening on http://localhost:${PORT}`);

    // Start the continuous price feed service
    priceFeedService.start();
  });
}

// Export app for testing
module.exports = app;
