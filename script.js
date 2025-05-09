const express = require('express');
const session = require('express-session');
const OAuth = require('oauth').OAuth;
const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'temp_session_secret',
  resave: false,
  saveUninitialized: true
}));

const oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  '1.0A',
  process.env.CALLBACK_URL || 'https://5f901225-7357-46a2-8838-d8c120a93a57-00-1kte8uzx4mpim.riker.replit.dev/twitter/callback',
  'HMAC-SHA1'
);

app.get('/', (req, res) => {
  res.send(`<a href="/twitter/login">Login with Twitter</a>`);
});

app.get('/twitter/login', (req, res) => {
  oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      console.error('Error getting OAuth request token:', error);
      return res.status(500).send('Authentication failed');
    }

    // Store token secret in session
    req.session.oauthTokenSecret = oauthTokenSecret;
    res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`);
  });
});

app.get('/twitter/callback', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  const oauthTokenSecret = req.session.oauthTokenSecret;

  if (!oauthTokenSecret) {
    return res.status(400).send('No OAuth token found in session');
  }

  oauth.getOAuthAccessToken(
    oauth_token,
    oauthTokenSecret,
    oauth_verifier,
    (error, accessToken, accessTokenSecret) => {
      if (error) {
        console.error('OAuth access token error:', error);
        return res.status(500).send('Authentication failed');
      }

      // Store tokens securely in session
      req.session.accessToken = accessToken;
      req.session.accessTokenSecret = accessTokenSecret;

      res.redirect('/dashboard'); // Redirect to dashboard instead of showing tokens
    }
  );
});

app.get('/dashboard', (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect('/');
  }
  res.send('Successfully authenticated with Twitter!');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
});