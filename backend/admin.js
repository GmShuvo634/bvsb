// middleware/admin.js
const { adminAddress } = require('../config/index');

module.exports = (req, res, next) => {
  // req.user.address was normalized to lowercase in auth middleware
  if (req.user.address.toLowerCase() !== adminAddress) {
    return res.status(403).json({ message: 'Admin only.' });
  }
  next();
};

