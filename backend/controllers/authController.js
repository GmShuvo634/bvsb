// backend/controllers/authController.js
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User   = require('../models/userModel');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email & password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    // Map guestId -> userId if present (from signed cookie or body)
    try {
      const providedGuestId = req.signedCookies?.gid || req.body?.guestId;
      if (providedGuestId) {
        const GuestUserMap = require('../models/GuestUserMap');
        await GuestUserMap.findOneAndUpdate(
          { guestId: providedGuestId },
          { $set: { userId: user._id } },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.warn('GuestUserMap upsert failed:', e?.message || e);
    }

    // Generate JWT token for immediate login after registration
    const token = jwt.sign(
      { sub: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      message: 'Registered',
      token,
      user: {
        id: user._id,
        email: user.email,
        balance: user.balance,
        avatar: user.avatar || '',
        country: user.country || '',
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email & password required' });
    }

    // 1️⃣ Look up the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3️⃣ Sign a JWT embedding their ID & admin flag
    const token = jwt.sign(
      { sub: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4️⃣ Return the token and user data
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        balance: user.balance,
        avatar: user.avatar || '',
        country: user.country || '',
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    next(err);
  }
};


