// backend/controllers/dashboardController.js

exports.getDashboard = async (req, res) => {
  try {
    // if req.user isn’t set (e.g. protect didn’t run), bail out
    const user = req.user || {};
    const balance = typeof user.balance === 'number' ? user.balance : 0;

    // stubbed metrics until you define Trade model
    const totalTrades = 0;
    const wins24      = 0;
    const livePlayers = 0;
    const winsPaid    = 0;
    const allTimeWins = 0;

    return res.json({
      data: {
        trades: totalTrades,
        wins:   wins24,
        player: livePlayers,
        paid:   winsPaid,
        total:  allTimeWins,
        balance,         // add your balance here too
      }
    });
  } catch (err) {
    console.error('dashboardController error:', err);
    res.status(500).json({ error: 'Server error fetching dashboard' });
  }
};