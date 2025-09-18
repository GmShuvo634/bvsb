// backend/controllers/demoController.js
const jwt = require('jsonwebtoken');
const demoService = require('../services/demoService');

/**
 * Start demo mode - create a demo session and return JWT token
 */
exports.startDemo = async (req, res, next) => {
  try {
    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    // Create demo session
    const sessionData = await demoService.createSession(ipAddress, userAgent);

    // Create JWT token for demo user
    const token = jwt.sign(
      { 
        sub: sessionData.guestId,
        type: 'demo',
        isDemo: true,
        isAdmin: false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set guest ID cookie for session tracking
    res.cookie('gid', sessionData.guestId, {
      signed: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: {
        guestId: sessionData.guestId,
        id: sessionData.guestId,
        balance: sessionData.balance,
        isDemo: true
      },
      sessionExpiry: sessionData.sessionExpiry
    });

  } catch (error) {
    console.error('Start demo error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to start demo mode' 
    });
  }
};

/**
 * Get demo session status
 */
exports.getDemoStatus = async (req, res, next) => {
  try {
    const guestId = req.signedCookies?.gid || req.query.guestId;
    
    if (!guestId) {
      return res.status(400).json({ error: 'No demo session found' });
    }

    const session = await demoService.getSession(guestId);
    
    if (!session) {
      return res.status(404).json({ error: 'Demo session not found or expired' });
    }

    res.json({
      success: true,
      session: {
        guestId: session.guestId,
        balance: session.currentBalance,
        totalBets: session.totalBets,
        totalWins: session.totalWins,
        totalLosses: session.totalLosses,
        sessionExpiry: session.sessionExpiry,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error('Get demo status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get demo status' 
    });
  }
};

/**
 * Reset demo session
 */
exports.resetDemo = async (req, res, next) => {
  try {
    const guestId = req.signedCookies?.gid || req.body.guestId;
    
    if (!guestId) {
      return res.status(400).json({ error: 'No demo session found' });
    }

    const result = await demoService.resetSession(guestId);

    // Create new JWT token
    const token = jwt.sign(
      { 
        sub: guestId,
        type: 'demo',
        isDemo: true,
        isAdmin: false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        guestId: guestId,
        id: guestId,
        balance: result.newBalance,
        isDemo: true
      },
      message: 'Demo session reset successfully'
    });

  } catch (error) {
    console.error('Reset demo error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to reset demo session' 
    });
  }
};
