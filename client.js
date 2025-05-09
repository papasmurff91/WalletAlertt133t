// Client-side code with retry logic
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (i === retries - 1) {
        console.error(`Failed to fetch ${url}:`, err);
        return { error: 'Service unavailable' };
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function updateBridgeStats() {
  try {
    const data = await fetchWithRetry('/api/bridge-stats');
    const volumeElement = document.getElementById('bridgeVolume');
    if (volumeElement && data?.volume) {
      volumeElement.textContent = `$${data.volume.toLocaleString()}`;
    }
  } catch (err) {
    console.error('Bridge stats update failed:', err);
  }
}

async function updateGasPrices() {
  try {
    const networks = await fetchWithRetry('/api/gas-prices');
    if (!networks) return;

    Object.entries(networks).forEach(([network, gas]) => {
      const element = document.getElementById(network);
      if (element && gas) {
        const trend = gas.trend > 0 ? '↗️' : gas.trend < 0 ? '↘️' : '↔️';
        element.innerHTML = `${gas.price} ${trend}`;
        element.classList.toggle('price-up', gas.trend > 0);
        element.classList.toggle('price-down', gas.trend < 0);
      }
    });
  } catch (err) {
    console.error('Gas prices update failed:', err);
  }
}

async function updateTwitterMetrics() {
  try {
    const data = await fetchWithRetry('/api/twitter-metrics');
    const metricsElement = document.getElementById('twitterMetrics');
    if (metricsElement && data) {
      metricsElement.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error('Twitter metrics update failed:', err);
  }
}

// Initialize UI with error boundary
async function checkContract() {
  const input = document.getElementById('contractInput');
  const result = document.getElementById('contractResult');
  const address = input.value.trim();

  if (!address) {
    result.textContent = 'Please enter a contract address';
    result.style.display = 'block';
    return;
  }

  try {
    const data = await fetchWithRetry(`/api/check-contract/${address}`);
    result.textContent = data.message || 'Contract verified';
    result.style.display = 'block';
  } catch (err) {
    result.textContent = 'Invalid contract address';
    result.style.display = 'block';
  }
}

function copyAddress() {
  const address = document.querySelector('#solanaAddress code').textContent;
  navigator.clipboard.writeText(address)
    .then(() => {
      const btn = document.querySelector('.copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    })
    .catch(err => console.error('Failed to copy:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const updateInterval = 30000; // 30 seconds

  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  let isDark = true;

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('light-theme', !isDark);
    themeToggle.textContent = isDark ? '🌙' : '☀️';
  });

  const displayError = (elementId, message = 'Unavailable') => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.classList.add('error');
    }
  };

  const clearError = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('error');
    }
  };

  const priceAlerts = new Set();

  function setPriceAlert() {
    const price = document.getElementById('alertPrice').value;
    const direction = document.getElementById('alertDirection').value;
    const alertsDiv = document.getElementById('activeAlerts');

    if (!price) return;

    const alert = {
      price: parseFloat(price),
      direction,
      id: Date.now()
    };

    priceAlerts.add(alert);
    alertsDiv.innerHTML = Array.from(priceAlerts)
      .map(a => `${a.direction === 'above' ? '↗️' : '↘️'} Alert when price ${a.direction} $${a.price}`)
      .join('<br>');
  }

  async function updateSwapStats() {
    try {
      const data = await fetchWithRetry('/api/swap-stats');
      if (!data) return;

      // Check price alerts
      const currentPrice = (data.radium?.volume || 0) / 100; // Example price calculation
      priceAlerts.forEach(alert => {
        if ((alert.direction === 'above' && currentPrice > alert.price) ||
            (alert.direction === 'below' && currentPrice < alert.price)) {
          new Notification(`Price Alert: $${currentPrice}`, {
            body: `Price is ${alert.direction} your target of $${alert.price}`,
            icon: '/generated-icon.png'
          });
        }
      });

      const radiumElement = document.getElementById('radiumSwaps');
      const jupiterElement = document.getElementById('jupiterSwaps');

      if (radiumElement && data.radium) {
        const trend = data.radium.trend > 0 ? '↗️' : '↘️';
        radiumElement.textContent = `$${data.radium.volume.toLocaleString()} ${trend}`;
      }

      if (jupiterElement && data.jupiter) {
        const trend = data.jupiter.trend > 0 ? '↗️' : '↘️';
        jupiterElement.textContent = `$${data.jupiter.volume.toLocaleString()} ${trend}`;
      }
    } catch (err) {
      console.error('Swap stats update failed:', err);
    }
  }

  // Update metrics at regular intervals
  const updateAll = async () => {
    try {
      await Promise.allSettled([
        updateBridgeStats().catch(err => {
          console.error('Bridge stats error:', err);
          displayError('bridgeVolume', 'Service unavailable');
        }),
        updateGasPrices().catch(err => {
          console.error('Gas prices error:', err);
          ['ethGas', 'bscGas', 'solGas'].forEach(id => displayError(id, 'Service unavailable'));
        }),
        updateTwitterMetrics().catch(err => {
          console.error('Twitter metrics error:', err);
          displayError('twitterMetrics', 'Service unavailable');
        }),
        updateSwapStats().catch(err => {
          console.error('Swap stats error:', err);
          ['radiumSwaps', 'jupiterSwaps'].forEach(id => displayError(id, 'Service unavailable'));
          document.querySelectorAll('.alert-content').forEach(el => {
            el.textContent = 'Service unavailable';
          });
        })
      ]);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  updateAll();
  const intervalId = setInterval(updateAll, updateInterval);

  // Cleanup interval on page unload
  window.addEventListener('unload', () => clearInterval(intervalId));
});