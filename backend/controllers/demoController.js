// backend/controllers/demoController.js
const { v4: uuidv4 } = require('uuid');
const jwt  = require('jsonwebtoken');
const User = require('../models/userModel');
const DemoSession = require('../models/DemoSession');
const demoService = require('../services/demoService');
const AuditLog = require('../models/AuditLog');

// POST /api/auth/demo
exports.startDemo = async (req, res, next) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const userAgent = req.get('User-Agent') || 'unknown';
    const cookieGuestId = req.signedCookies?.gid;
    const providedGuestId = req.body?.guestId;

    // Create or resume demo session
    const session = await demoService.createOrResumeSession(
      ip, 
      userAgent, 
      cookieGuestId || providedGuestId
    );

    // Set signed httpOnly cookie for persistence
    res.cookie('gid', session.guestId, { 
      httpOnly: true, 
      sameSite: 'lax', 
      signed: true, 
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Create JWT token for demo session
    const token = jwt.sign({ 
      sub: session.guestId, 
      type: 'demo',
      isDemo: true 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Log demo start
    await AuditLog.create({ 
      userId: null,
      guestId: session.guestId, 
      eventType: 'demo_start', 
      amount: 0, 
      beforeBal: session.currentBalance, 
      afterBal: session.currentBalance, 
      metadata: { ip, userAgent, sessionId: session._id } 
    });

    return res.json({ 
      token, 
      user: { 
        id: session.guestId, 
        balance: session.currentBalance, 
        isDemo: true, 
        guestId: session.guestId,
        sessionStats: {
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses
        }
      } 
    });
  } catch (err) {
    console.error('Demo start error:', err);
    if (err.message.includes('Too many demo sessions')) {
      return res.status(429).json({ error: err.message });
    }
    next(err);
  }
};

// GET /api/auth/demo/status
exports.getDemoStatus = async (req, res, next) => {
  try {
    const guestId = req.signedCookies?.gid || req.query.guestId;
    
    if (!guestId) {
      return res.status(400).json({ error: 'No demo session found' });
    }

    const stats = await demoService.getSessionStats(guestId);
    
    if (!stats) {
      return res.status(404).json({ error: 'Demo session not found or expired' });
    }

    res.json(stats);
  } catch (err) {
    console.error('Get demo status error:', err);
    next(err);
  }
};

// POST /api/auth/demo/reset
exports.resetDemo = async (req, res, next) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Create new demo session (this will check IP limits)
    const session = await demoService.createOrResumeSession(ip, userAgent);

    // Update cookie
    res.cookie('gid', session.guestId, { 
      httpOnly: true, 
      sameSite: 'lax', 
      signed: true, 
      maxAge: 24 * 60 * 60 * 1000 
    });

    // Create new JWT token
    const token = jwt.sign({ 
      sub: session.guestId, 
      type: 'demo',
      isDemo: true 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: session.guestId, 
        balance: session.currentBalance, 
        isDemo: true, 
        guestId: session.guestId,
        sessionStats: {
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses
        }
      } 
    });
  } catch (err) {
    console.error('Reset demo error:', err);
    if (err.message.includes('Too many demo sessions')) {
      return res.status(429).json({ error: err.message });
    }
    next(err);
  }
};
