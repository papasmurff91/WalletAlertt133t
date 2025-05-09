
// Client-side code
async function updateBridgeStats() {
  try {
    const response = await fetch('/api/bridge-stats');
    const data = await response.json();
    const volumeElement = document.getElementById('bridgeVolume');
    if (volumeElement) {
      volumeElement.textContent = `$${data.volume.toLocaleString()}`;
    }
  } catch (err) {
    console.error('Bridge stats update failed:', err);
  }
}

async function updateGasPrices() {
  try {
    const response = await fetch('/api/gas-prices');
    const networks = await response.json();
    Object.entries(networks).forEach(([network, gas]) => {
      const element = document.getElementById(network);
      if (element) {
        element.textContent = gas;
      }
    });
  } catch (err) {
    console.error('Gas prices update failed:', err);
  }
}

// Initialize UI when DOM is loaded
async function updateTwitterMetrics() {
  try {
    const response = await fetch('/api/twitter-metrics');
    const data = await response.json();
    const metricsElement = document.getElementById('twitterMetrics');
    if (metricsElement && data) {
      metricsElement.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error('Twitter metrics update failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateBridgeStats();
  updateGasPrices();
  updateTwitterMetrics();
  // Update every 30 seconds
  setInterval(() => {
    updateBridgeStats();
    updateGasPrices();
    updateTwitterMetrics();
  }, 30000);
});
