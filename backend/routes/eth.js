// backend/routes/eth.js
const router = require('express').Router();
// If you installed node-fetch:
const fetch = require('node-fetch');
// ——— OR ———
// If you prefer the built-in Node 18+ global fetch, comment the line above
// and uncomment the line below:
// const fetch = global.fetch;

router.get('/price', async (req, res, next) => {
  try {
    // fetch the ETH/USD price from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const json = await response.json();
    if (!json.ethereum || json.ethereum.usd == null) {
      throw new Error('Invalid price response');
    }
    res.json({ price: json.ethereum.usd });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

