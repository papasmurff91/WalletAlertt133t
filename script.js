const express = require('express');
const path = require('path');
const app = express();

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