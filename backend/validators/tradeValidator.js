// backend/validators/tradeValidator.js
const Joi = require('joi');

const tradeSchema = Joi.object({
  amount:    Joi.number().integer().min(1).required(),
  direction: Joi.string().valid('Up','Down').required(),
  expiry:    Joi.number().integer().required(),
});

exports.validateTrade = (req, res, next) => {
  const { error } = tradeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

