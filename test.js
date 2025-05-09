
const assert = require('assert');
const { analyzeSentiment, getTrendingHashtags } = require('./twitter_monitor');
const { trackTransaction, SUSPICIOUS_PATTERNS } = require('./transaction_tracker');

async function runTests() {
  console.log('Starting test suite...\n');

  // Test sentiment analysis
  console.log('Testing sentiment analysis...');
  assert.equal(analyzeSentiment('this is great and bullish'), 'positive', 'Should detect positive sentiment');
  assert.equal(analyzeSentiment('this is a scam and fake'), 'negative', 'Should detect negative sentiment');
  assert.equal(analyzeSentiment('normal tweet here'), 'neutral', 'Should detect neutral sentiment');
  console.log('✓ Sentiment analysis tests passed\n');

  // Test transaction tracking
  console.log('Testing transaction tracking...');
  const mockTx = {
    signature: 'mock_sig',
    blockTime: Date.now() / 1000
  };
  const mockAddress = '8ZnYJ2VKXuKvGajniM5YQbf9Q1mBgzVyCNau4AWbDHpB';

  const trackingResult = await trackTransaction(mockTx, mockAddress);
  assert(trackingResult === null || typeof trackingResult === 'object', 'Should return null or tracking object');
  console.log('✓ Transaction tracking tests passed\n');

  // Test suspicious patterns
  console.log('Testing suspicious patterns...');
  assert(SUSPICIOUS_PATTERNS.MULTIPLE_HOPS === 'multiple_hops', 'Should have multiple hops pattern');
  assert(SUSPICIOUS_PATTERNS.MIXER_INTERACTION === 'mixer_interaction', 'Should have mixer interaction pattern');
  console.log('✓ Suspicious patterns tests passed\n');

  // Test input validation
  console.log('Testing input validation...');
  const invalidResult = await trackTransaction(null, 'invalid_address');
  assert(invalidResult === null, 'Should handle invalid input gracefully');
  console.log('✓ Input validation tests passed\n');

  console.log('All tests completed successfully! ✨');
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
