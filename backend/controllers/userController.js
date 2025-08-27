// GET /api/user/me
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    const { _id, email, balance, createdAt } = req.user;
    res.json({ id: _id, email, balance, createdAt });
  } catch (err) {
    next(err);
  }
};

