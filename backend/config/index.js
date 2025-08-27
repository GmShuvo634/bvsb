// backend/config/index.js
require('dotenv').config();
const Joi = require('joi');

const schema = Joi.object({
  MONGODB_URI:    Joi.string().uri().required(),
  JWT_SECRET:     Joi.string().min(32).required(),
  ETH_RPC_URL:    Joi.string().uri().required(),
  CONTRACT_ADDRESS: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  PRIVATE_KEY:    Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(),
  ADMIN_ADDRESS:  Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  NODE_ENV:       Joi.string().valid('development','production').default('development'),
  PORT:           Joi.number().default(5002),
}).unknown();

const { error, value: env } = schema.validate(process.env);
if (error) {
  console.error('❌ Config validation error:', error.message);
  process.exit(1);
}
console.log('✅ Config validated');
module.exports = env;

