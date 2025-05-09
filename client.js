// Client-side code with enhanced mobile support
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add mobile touch handling
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', e => {
  touchEndY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
  const swipeDistance = touchEndY - touchStartY;
  if (swipeDistance > minSwipeDistance && window.scrollY === 0) {
    updateAll();
  }
}, { passive: true });

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) {
        console.error(`Failed to fetch ${url}:`, err);
        return { error: 'Service unavailable' };
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const updateFunctions = {
  async bridgeStats() {
    const data = await fetchWithRetry('/api/bridge-stats');
    const element = document.getElementById('bridgeVolume');
    if (element && data?.volume) {
      element.textContent = `$${data.volume.toLocaleString()}`;
    }
  },

  async gasPrices() {
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
  },

  async twitterMetrics() {
    const data = await fetchWithRetry('/api/twitter-metrics');
    const element = document.getElementById('twitterMetrics');
    if (element && data) {
      element.textContent = JSON.stringify(data, null, 2);
    }
  },
  async suspiciousActors() {
      const data = await fetchWithRetry('/api/suspicious-actors');
      const actorsElement = document.getElementById('suspiciousActors');
      if (actorsElement && data) {
        actorsElement.innerHTML = data.length ? data.map(actor => `
          <div class="actor-item">
            <span class="actor-handle">@${actor.authorId}</span>
            <span class="actor-score">Risk Score: ${actor.score}</span>
          </div>
        `).join('') : 'No suspicious activity detected';
      }
    },
    async swapStats() {
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
};

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Copy failed:', error);
    }
    textArea.remove();
  }
}

const debouncedUpdate = debounce(() => updateAll(), 500);

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login');
  const tweetBtn = document.getElementById('tweet');
  const tweetInput = document.getElementById('tweetText');
  const statusDiv = document.getElementById('status');

  loginBtn.addEventListener('click', () => {
    window.location.href = '/twitter/login';
  });

  tweetBtn.addEventListener('click', async () => {
    const tweetText = tweetInput.value.trim();
    if (!tweetText) {
      statusDiv.textContent = 'Please enter a tweet';
      return;
    }

    try {
      const response = await fetch('/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: tweetText })
      });
      
      const result = await response.text();
      statusDiv.textContent = result;
      if (response.ok) {
        tweetInput.value = '';
      }
    } catch (error) {
      statusDiv.textContent = 'Failed to send tweet';
      console.error('Tweet error:', error);
    }
  });

  const updateInterval = 30000;

  // Theme handling
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeToggle = document.getElementById('themeToggle');

  function setTheme(isDark) {
    document.body.classList.toggle('light-theme', !isDark);
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  themeToggle?.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('light-theme');
    setTheme(!isDark);
  });

  // Initialize theme
  const savedTheme = localStorage.getItem('theme');
  setTheme(savedTheme ? savedTheme === 'dark' : prefersDark.matches);

  // Handle tweets
  document.querySelectorAll('.tweet-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const response = await fetch('/tweet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: btn.dataset.text })
        });
        const result = await response.text();
        alert(result);
      } catch (error) {
        console.error('Tweet failed:', error);
        alert('Failed to tweet. Please try again.');
      }
    });
  });

  // Start updates
  updateAll();
  const intervalId = setInterval(updateAll, updateInterval);
  window.addEventListener('unload', () => clearInterval(intervalId));
});

async function updateAll() {
  await Promise.allSettled(
    Object.values(updateFunctions).map(async (fn) => {
      try {
        await fn();
      } catch (err) {
        console.error(`${fn.name} error:`, err);
        const elementId = fn.name === 'bridgeStats' ? 'bridgeVolume' :
                          fn.name === 'gasPrices' ? ['ethGas', 'bscGas', 'solGas'] :
                          fn.name === 'twitterMetrics' ? 'twitterMetrics' :
                          fn.name === 'suspiciousActors' ? 'suspiciousActors' :
                          fn.name === 'swapStats' ? ['radiumSwaps', 'jupiterSwaps'] : null;

        const displayError = (elementId, message = 'Service unavailable') => {
          if (Array.isArray(elementId)) {
            elementId.forEach(id => {
              const element = document.getElementById(id);
              if (element) {
                element.textContent = message;
                element.classList.add('error');
              }
            });
          } else if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
              element.textContent = message;
              element.classList.add('error');
            }
          }
        };

        if (elementId) {
          if (Array.isArray(elementId)) {
            elementId.forEach(id => displayError(id));
          } else {
            displayError(elementId);
          }
        }

        if (fn.name === 'swapStats') {
          document.querySelectorAll('.alert-content').forEach(el => {
            el.textContent = 'Service unavailable';
          });
        }
      }
    })
  );
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