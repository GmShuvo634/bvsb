// backend/scripts/testMultiChain.js
const contractService = require('../services/contractService');

async function testPriceFeeds() {
  console.log('🧪 Testing Chainlink Price Feeds...\n');
  
  const chains = contractService.getSupportedChains();
  
  for (const [chainId, config] of Object.entries(chains)) {
    console.log(`📊 Testing ${config.name} (Chain ID: ${chainId})`);
    
    try {
      const price = await contractService.getCurrentPrice(parseInt(chainId));
      console.log(`✅ Price: $${price.toFixed(2)}`);
      
      // Validate price is reasonable (between $500 and $10,000)
      if (price > 500 && price < 10000) {
        console.log(`✅ Price validation passed`);
      } else {
        console.log(`⚠️  Price seems unusual: $${price}`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testProviders() {
  console.log('🔗 Testing RPC Providers...\n');
  
  const chains = contractService.getSupportedChains();
  
  for (const [chainId, config] of Object.entries(chains)) {
    console.log(`🌐 Testing ${config.name} provider`);
    
    try {
      const provider = contractService.getProvider(parseInt(chainId));
      if (provider) {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        console.log(`✅ Network: ${network.name} (${network.chainId})`);
        console.log(`✅ Latest block: ${blockNumber}`);
      } else {
        console.log(`❌ Provider not available`);
      }
    } catch (error) {
      console.log(`❌ Provider test failed: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testBackendEndpoints() {
  console.log('🚀 Testing Backend Endpoints...\n');
  
  const axios = require('axios');
  const baseUrl = 'http://localhost:5001';
  
  try {
    // Test price endpoint
    console.log('📊 Testing /api/price endpoint...');
    const priceResponse = await axios.get(`${baseUrl}/api/price`);
    console.log(`✅ Price response:`, priceResponse.data);
    
    // Test price with specific chain
    console.log('📊 Testing /api/price with chainId...');
    const sepoliaPriceResponse = await axios.get(`${baseUrl}/api/price?chainId=11155111`);
    console.log(`✅ Sepolia price response:`, sepoliaPriceResponse.data);
    
    // Test supported chains endpoint
    console.log('🔗 Testing /api/price/chains endpoint...');
    const chainsResponse = await axios.get(`${baseUrl}/api/price/chains`);
    console.log(`✅ Chains response:`, chainsResponse.data);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running. Start with: bun dev');
    } else {
      console.log(`❌ Endpoint test failed: ${error.message}`);
    }
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('🎯 Multi-Chain Integration Test Suite\n');
  console.log('=====================================\n');
  
  try {
    await testProviders();
    await testPriceFeeds();
    await testBackendEndpoints();
    
    console.log('🎉 Test suite completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy contracts to testnets using: cd chain && NETWORK=sepolia npx hardhat run scripts/deploy.js --network sepolia');
    console.log('2. Update .env files with deployed contract addresses');
    console.log('3. Test frontend integration with MetaMask');
    console.log('4. Test token approvals and transfers');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testPriceFeeds,
  testProviders,
  testBackendEndpoints,
  runAllTests
};
