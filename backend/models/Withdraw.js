// backend/models/Withdraw.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number,               required: true },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Withdraw', withdrawSchema);

