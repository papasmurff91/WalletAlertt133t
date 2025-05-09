// Server-side code
const express = require('express');
const session = require('express-session');
const { OAuth } = require('oauth');
const path = require('path');

const app = express();

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

// API routes
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

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});