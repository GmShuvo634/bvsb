// backend/controllers/priceController.js
const contractService = require('../services/contractService');

/**
 * Fetch the current ETH/USD price from Chainlink price feeds
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
exports.getPrice = async (req, res, next) => {
  try {
    // Get chain ID from query params or use default (Sepolia)
    const chainId = parseInt(req.query.chainId) || parseInt(process.env.DEFAULT_CHAIN_ID) || 11155111;

    const price = await contractService.getCurrentPrice(chainId);

    res.json({
      price,
      chainId,
      timestamp: Date.now(),
      source: 'chainlink'
    });
  } catch (err) {
    console.error('getPrice error:', err.message || err);
    next(new Error('Failed to fetch price'));
  }
};

/**
 * Get supported chains and their configurations
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
exports.getSupportedChains = async (req, res, next) => {
  try {
    const chains = contractService.getSupportedChains();

    // Remove sensitive information like RPC URLs
    const publicChains = Object.entries(chains).reduce((acc, [chainId, config]) => {
      acc[chainId] = {
        name: config.name,
        chainId: parseInt(chainId),
        contractAddress: config.contractAddress
      };
      return acc;
    }, {});

    res.json({ chains: publicChains });
  } catch (err) {
    console.error('getSupportedChains error:', err.message || err);
    next(new Error('Failed to fetch supported chains'));
  }
};

