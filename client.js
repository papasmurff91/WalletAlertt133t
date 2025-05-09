
// Client-side code
function initializeUI() {
  // Bridge volume update
  fetch('/api/bridge-stats')
    .then(res => res.json())
    .then(data => {
      const volumeElement = document.getElementById('bridgeVolume');
      if (volumeElement) {
        volumeElement.textContent = `$${data.volume.toLocaleString()}`;
      }
    })
    .catch(err => console.error('Error fetching bridge stats:', err));

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
    })
    .catch(err => console.error('Error fetching gas prices:', err));
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);
