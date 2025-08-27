// backend/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestId:    { type: String },
  eventType:  { type: String, enum: ['login','demo_start','bet','payout','settlement','price_selection','deposit','withdraw','session'] },
  amount:     { type: Number }, // signed amount for balance changes
  beforeBal:  { type: Number },
  afterBal:   { type: Number },
  metadata:   { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
