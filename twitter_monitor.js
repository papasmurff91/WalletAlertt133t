
const { TwitterApi } = require('twitter-api-v2');
const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://api.mainnet-beta.solana.com');

async function isSuspiciousAddress(address) {
  try {
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    const history = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
    
    // Criteria for suspicious activity
    const highBalance = balance > 1000000000; // 1 SOL
    const highTxVolume = history.length >= 5;
    const recentActivity = history.length > 0 && 
      (Date.now() - history[0].blockTime * 1000) < 3600000; // Last hour
    
    return highBalance && highTxVolume && recentActivity;
  } catch (err) {
    return false;
  }
}

async function findSuspiciousAddresses() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const tweets = await client.v2.search('solana');
    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const suspiciousAddresses = [];

    for (const tweet of tweets.data) {
      const matches = tweet.text.match(addressRegex) || [];
      for (const address of matches) {
        if (await isSuspiciousAddress(address)) {
          suspiciousAddresses.push({
            address,
            tweet: tweet.text,
            timestamp: tweet.created_at
          });
        }
      }
    }

    return suspiciousAddresses;
  } catch (err) {
    console.error('Twitter API error:', err);
    return [];
  }
}

module.exports = { findSuspiciousAddresses };
