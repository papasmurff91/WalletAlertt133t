
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

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Initialize UI elements after DOM is loaded
function initializeUI() {
  // Bridge volume update
  fetch('/api/bridge-stats')
    .then(res => res.json())
    .then(data => {
      const volumeElement = document.getElementById('bridgeVolume');
      if (volumeElement) {
        volumeElement.textContent = `$${data.volume.toLocaleString()}`;
      }
    });

  // Gas prices update
  fetch('/api/gas-prices')
    .then(res => res.json())
    .then(networks => {
      Object.entries(networks).forEach(([network, gas]) => {
        const element = document.getElementById(network);
        if (element) {
          element.textContent = gas;
        }
      });
    });
}

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

// Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Add script to index.html to initialize UI
document.addEventListener('DOMContentLoaded', initializeUI);
