
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
  
  const updateAll = () => {
    Promise.allSettled([
      updateBridgeStats(),
      updateGasPrices(),
      updateTwitterMetrics()
    ]).catch(console.error);
  };

  updateAll();
  setInterval(updateAll, updateInterval);
});
