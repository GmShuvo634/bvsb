// backend/middleware/isAdmin.js
module.exports = (req, res, next) => {
  // Only allow if the JWT-authenticated address matches the ADMIN_ADDRESS env var
  if (
    !req.user ||
    req.user.address.toLowerCase() !== process.env.ADMIN_ADDRESS.toLowerCase()
  ) {
    return res.status(403).json({ message: 'Forbidden: admin only' });
  }
  next();
};

