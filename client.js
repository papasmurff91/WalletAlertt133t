
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
document.addEventListener('DOMContentLoaded', () => {
  updateBridgeStats();
  updateGasPrices();
  // Update every 30 seconds
  setInterval(() => {
    updateBridgeStats();
    updateGasPrices();
  }, 30000);
});
