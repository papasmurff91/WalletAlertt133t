// Server-side code
const express = require('express');
const session = require('express-session');
const { OAuth } = require('oauth');
const path = require('path');

const app = express();

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Twitter OAuth configuration
const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A',
  'http://localhost:5000/twitter/callback',
  'HMAC-SHA1'
);

// Twitter OAuth routes
app.get('/twitter/login', (req, res) => {
  oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error('Request Token Error:', error);
      return res.status(500).send('Error getting OAuth request token');
    }
    req.session.oauthTokenSecret = oauthTokenSecret;
    const authURL = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
    res.redirect(authURL);
  });
});

app.get('/twitter/callback', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const oauthTokenSecret = req.session.oauthTokenSecret;

  oauth.getOAuthAccessToken(
    oauth_token,
    oauthTokenSecret,
    oauth_verifier,
    (error, accessToken, accessTokenSecret, results) => {
      if (error) {
        console.error('Access Token Error:', error);
        return res.status(500).send('Error getting OAuth access token');
      }
      req.session.accessToken = accessToken;
      req.session.accessTokenSecret = accessTokenSecret;
      res.redirect('/');
    }
  );
});

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// API routes
// Secure Twitter metrics request
async function getTwitterMetrics() {
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;
  const accountName = process.env.TWITTER_ACCOUNT_NAME;
  
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  try {
    const response = await fetch(
      `https://gnip-api.x.com/metrics/usage/accounts/${accountName}.json?bucket=month`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Twitter metrics request failed:', error);
    throw error;
  }
}

const { findSuspiciousAddresses } = require('./twitter_monitor');

app.get('/api/suspicious-addresses', async (req, res) => {
  try {
    const addresses = await findSuspiciousAddresses();
    res.json(addresses);
  } catch (err) {
    console.error('Suspicious addresses error:', err);
    res.status(500).json({ error: 'Failed to fetch suspicious addresses' });
  }
});

app.get('/api/track-transaction/:address', async (req, res) => {
  try {
    const { trackTransaction } = require('./transaction_tracker');
    const result = await trackTransaction(null, req.params.address);
    if (!result) {
      return res.status(404).json({ error: 'Transaction tracking failed' });
    }
    res.json(result);
  } catch (err) {
    console.error('Transaction tracking error:', err);
    res.status(500).json({ error: 'Failed to track transaction' });
  }
});

  }
});

app.get('/api/suspicious-actors', async (req, res) => {
  try {
    const { getSuspiciousActors } = require('./twitter_monitor');
    const actors = await getSuspiciousActors();
    res.json(actors);
  } catch (error) {
    console.error('Suspicious actors error:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious actors' });
  }
});

app.get('/api/twitter-metrics', async (req, res) => {
  try {
    const { findSuspiciousAddresses, analyzeSentiment } = require('./twitter_monitor');
    const suspiciousAddresses = await findSuspiciousAddresses();
    
    const metrics = {
      suspiciousAddresses: suspiciousAddresses.length,
      sentimentBreakdown: suspiciousAddresses.reduce((acc, curr) => {
        acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
        return acc;
      }, {}),
      topEngagement: suspiciousAddresses
        .sort((a, b) => (b.engagement.likes + b.engagement.retweets) - 
                       (a.engagement.likes + a.engagement.retweets))
        .slice(0, 5),
      trendingTags: [...new Set(suspiciousAddresses.flatMap(a => a.relatedTags))]
    };
    
    if (!username || !password || !accountName) {
      return res.status(400).json({ error: 'Missing Twitter credentials' });
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(
        `https://gnip-api.x.com/metrics/usage/accounts/${accountName}.json?bucket=month`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metrics = await response.json();
      res.json(metrics);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Twitter metrics error:', error);
    res.status(error.message === 'Request timeout' ? 504 : 500)
       .json({ error: error.message || 'Failed to fetch Twitter metrics' });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/api/bridge-stats', (req, res) => {
  const volume = Math.floor(Math.random() * 1000000);
  const tx = Math.floor(Math.random() * 100);
  res.set('Cache-Control', 'no-store');
  res.json({ volume, tx, timestamp: Date.now() });
});

app.get('/api/gas-prices', (req, res) => {
  const networks = {
    'ethGas': { price: '50-60', trend: Math.random() > 0.5 ? 1 : -1 },
    'bscGas': { price: '5-7', trend: Math.random() > 0.5 ? 1 : -1 },
    'solGas': { price: '0.001', trend: Math.random() > 0.5 ? 1 : -1 },
    'timestamp': Date.now()
  };
  res.set('Cache-Control', 'no-store');
  res.json(networks);
});

app.get('/api/check-contract/:address', (req, res) => {
  const address = req.params.address;
  // Simple validation for Solana address format
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    res.json({ valid: true, message: 'Contract address is valid' });
  } else {
    res.status(400).json({ valid: false, message: 'Invalid contract address format' });
  }
});

app.get('/api/swap-stats', (req, res) => {
  const swapStats = {
    'radium': { volume: Math.floor(Math.random() * 50000), trend: Math.random() > 0.5 ? 1 : -1 },
    'jupiter': { volume: Math.floor(Math.random() * 100000), trend: Math.random() > 0.5 ? 1 : -1 },
    'timestamp': Date.now()
  };
  res.set('Cache-Control', 'no-store');
  res.json(swapStats);
});

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});