const express = require('express');
const path = require('path');
const { OAuth } = require('oauth');
const app = express();

// OAuth Configuration
const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A',
  'https://YOUR-REPL-NAME.YOUR-USERNAME.repl.co/twitter/callback',
  'HMAC-SHA1'
);

// Twitter OAuth routes
app.get('/twitter/auth', (req, res) => {
  oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
    if (error) {
      console.error('Request token error:', error);
      return res.status(500).send('OAuth request failed');
    }
    res.redirect(`https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
  });
});

app.get('/twitter/callback', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  
  oauth.getOAuthAccessToken(
    oauth_token,
    null,
    oauth_verifier,
    (error, accessToken, accessTokenSecret, results) => {
      if (error) {
        console.error('Access token error:', error);
        return res.status(500).send('OAuth failed');
      }
      res.send('Twitter authentication successful!');
    }
  );
});

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Routes
app.get('/api/bridge-stats', (req, res) => {
  const volume = Math.floor(Math.random() * 1000000);
  const tx = Math.floor(Math.random() * 100);
  res.json({ volume, tx });
});

app.get('/api/gas-prices', (req, res) => {
  const networks = {
    'ethGas': '50-60',
    'bscGas': '5-7',
    'solGas': '0.001'
  };
  res.json(networks);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});