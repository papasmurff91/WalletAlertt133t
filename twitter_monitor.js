
const { TwitterApi } = require('twitter-api-v2');
const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://api.mainnet-beta.solana.com', {
  commitment: 'confirmed',
  timeout: 30000
});

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

const { trackTransaction, SUSPICIOUS_PATTERNS } = require('./transaction_tracker');

async function isSuspiciousAddress(address) {
  try {
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    const history = await connection.getSignaturesForAddress(pubkey, { limit: 10 });
    
    const highBalance = balance > 1000000000;
    const highTxVolume = history.length >= 5;
    const recentActivity = history.length > 0 && 
      (Date.now() - history[0].blockTime * 1000) < 3600000;

    // Track suspicious transaction patterns
    const trackingResult = await trackTransaction(history[0], address);
    const suspiciousPatterns = trackingResult?.patterns?.length > 0;
    const mixerDetected = trackingResult?.mixerDetected;
    
    return highBalance && highTxVolume && recentActivity || suspiciousPatterns || mixerDetected;
  } catch (err) {
    console.error('Address check error:', err);
    return false;
  }
}

async function getSuspiciousActors() {
  const actorsMap = new Map();
  
  function calculateSuspiciousScore(tweet, engagement) {
    let score = 0;
    // Check for suspicious patterns
    if (tweet.toLowerCase().includes('airdrop') && tweet.toLowerCase().includes('free')) score += 2;
    if (tweet.match(/(0x|sol:)[a-zA-Z0-9]{32,}/g)) score += 3;
    if (engagement.likes < 2 && tweet.includes('http')) score += 2;
    if (tweet.match(/@\w+/g)?.length > 5) score += 2;
    return score;
  }

  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const tweets = await client.v2.search('solana scam OR hack OR fake', {
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['username'],
      max_results: 100
    });

    for (const tweet of tweets.data || []) {
      const engagement = await getEngagementMetrics(tweet);
      const suspiciousScore = calculateSuspiciousScore(tweet.text, engagement);
      
      if (suspiciousScore > 4) {
        if (!actorsMap.has(tweet.author_id)) {
          actorsMap.set(tweet.author_id, {
            score: suspiciousScore,
            tweets: [],
            engagementTotal: 0
          });
        }
        
        const actor = actorsMap.get(tweet.author_id);
        actor.tweets.push(tweet.text);
        actor.engagementTotal += engagement.likes + engagement.retweets;
        actor.score += suspiciousScore;
      }
    }

    return Array.from(actorsMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 5)
      .map(([authorId, data]) => ({
        authorId,
        score: data.score,
        tweets: data.tweets,
        engagement: data.engagementTotal
      }));
  } catch (err) {
    console.error('Error getting suspicious actors:', err);
    return [];
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
