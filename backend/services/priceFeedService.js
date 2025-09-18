// backend/services/priceFeedService.js
const bus = require('../sockets/bus');

class PriceFeedService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.currentPrice = 2000 * 1000000; // Start at $2000 with decimal scaling (ethPriceDecimal)
    this.priceUpdateInterval = 500; // 500ms matching frontend Config.interval.priceUpdate
  }

  /**
   * Start the continuous price feed service
   */
  start() {
    if (this.isRunning) {
      console.log('Price feed service is already running');
      return;
    }

    this.isRunning = true;
    this.interval = setInterval(() => {
      this.generateAndBroadcastPrice();
    }, this.priceUpdateInterval);

    console.log('🚀 Price feed service started - broadcasting every', this.priceUpdateInterval, 'ms');

    // Send initial price immediately
    this.generateAndBroadcastPrice();
  }

  /**
   * Generate new price using random walk algorithm and broadcast to all clients
   */
  generateAndBroadcastPrice() {
    try {
      // Random walk algorithm similar to demo simulation
      const divisor = 1000000; // ethPriceDecimal from config
      const delta = Math.round(((Math.random() - 0.5) * 5 * divisor) / 100); // ~ +/- 0.05 ETH
      this.currentPrice = Math.max(1, this.currentPrice + delta);

      // Broadcast to all connected WebSocket clients
      bus.broadcast('priceUpdate', {
        price: this.currentPrice,
        timestamp: Date.now(),
        source: 'priceFeedService'
      });

      // Optional: Log price updates (can be removed in production)
      if (Math.random() < 0.01) { // Log ~1% of updates to avoid spam
        console.log('📈 Price update:', (this.currentPrice / divisor).toFixed(4), 'ETH');
      }
    } catch (error) {
      console.error('❌ Error generating price update:', error);
    }
  }

  /**
   * Stop the price feed service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Price feed service stopped');
  }

  /**
   * Get current price
   */
  getCurrentPrice() {
    return this.currentPrice;
  }

  /**
   * Check if service is running
   */
  isServiceRunning() {
    return this.isRunning;
  }

  /**
   * Update price update interval (useful for testing or configuration changes)
   */
  setUpdateInterval(intervalMs) {
    if (intervalMs < 100) {
      console.warn('⚠️ Price update interval too low, minimum is 100ms');
      return false;
    }

    this.priceUpdateInterval = intervalMs;

    // Restart service with new interval if currently running
    if (this.isRunning) {
      this.stop();
      this.start();
    }

    console.log('⚙️ Price update interval changed to', intervalMs, 'ms');
    return true;
  }
}

// Export singleton instance
module.exports = new PriceFeedService();
