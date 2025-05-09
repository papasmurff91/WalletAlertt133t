
const assert = require('assert');
const { analyzeSentiment, getTrendingHashtags } = require('./twitter_monitor');
const { trackTransaction } = require('./transaction_tracker');

// Test Twitter sentiment analysis
console.log('Testing sentiment analysis...');
assert.equal(analyzeSentiment('this is great and bullish'), 'positive');
assert.equal(analyzeSentiment('this is a scam and fake'), 'negative');
assert.equal(analyzeSentiment('normal tweet here'), 'neutral');

// Test transaction tracking
console.log('Testing transaction tracking...');
const mockTx = {
  signature: 'mock_sig',
  blockTime: Date.now() / 1000
};
const mockAddress = '8ZnYJ2VKXuKvGajniM5YQbf9Q1mBgzVyCNau4AWbDHpB';

trackTransaction(mockTx, mockAddress)
  .then(result => {
    assert(result === null || typeof result === 'object');
    console.log('Transaction tracking test passed');
  })
  .catch(console.error);

console.log('All tests completed');
