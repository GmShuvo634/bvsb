const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  at:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fund', schema);

