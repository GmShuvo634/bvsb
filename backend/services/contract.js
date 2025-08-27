// backend/services/contract.js
// All on‐chain interactions are stubbed for testing

module.exports = {
  placeBet: async (tradeId, amount, direction, expiry) => {
    console.log(`> [MOCK] placeBet called: trade=${tradeId}, amount=${amount}, dir=${direction}, expiry=${expiry}`);
  },
  withdraw: async (address, amount) => {
    console.log(`> [MOCK] withdraw called: to=${address}, amount=${amount}`);
  },
  onBetResolved: (callback) => {
    // no-op in mock
  }
};

