
const { TwitterApi } = require('twitter-api-v2');
const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Simple sentiment analysis
function analyzeSentiment(text) {
  const positiveWords = ['bullish', 'moon', 'up', 'gain', 'profit', 'good', 'great'];
  const negativeWords = ['bearish', 'down', 'loss', 'bad', 'scam', 'fake'];
  
  const words = text.toLowerCase().split(' ');
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });
  
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

async function getTrendingHashtags(client) {
  const trends = await client.v2.trendingHashtags();
  return trends.data.filter(tag => 
    tag.toLowerCase().includes('solana') ||
    tag.toLowerCase().includes('crypto') ||
    tag.toLowerCase().includes('blockchain')
  );
}

async function getEngagementMetrics(tweet) {
  return {
    likes: tweet.public_metrics?.like_count || 0,
    retweets: tweet.public_metrics?.retweet_count || 0,
    replies: tweet.public_metrics?.reply_count || 0
  };
}

async function isSuspiciousAddress(address) {
  try {
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    const history = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
    
    const highBalance = balance > 1000000000;
    const highTxVolume = history.length >= 5;
    const recentActivity = history.length > 0 && 
      (Date.now() - history[0].blockTime * 1000) < 3600000;
    
    return highBalance && highTxVolume && recentActivity;
  } catch (err) {
    console.error('Address check error:', err);
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
    const tweets = await client.v2.search('solana', {
      'tweet.fields': ['created_at', 'public_metrics'],
      max_results: 100
    });

    const addressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    const suspiciousAddresses = [];
    const trendingTags = await getTrendingHashtags(client);

    for (const tweet of tweets.data || []) {
      const matches = tweet.text.match(addressRegex) || [];
      const sentiment = analyzeSentiment(tweet.text);
      const engagement = await getEngagementMetrics(tweet);

      for (const address of matches) {
        if (await isSuspiciousAddress(address)) {
          suspiciousAddresses.push({
            address,
            tweet: tweet.text,
            timestamp: tweet.created_at,
            sentiment,
            engagement,
            relatedTags: trendingTags
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

module.exports = { 
  findSuspiciousAddresses,
  analyzeSentiment,
  getTrendingHashtags,
  getEngagementMetrics
};
