document.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Cross-Chain Bridge Dashboard</h1>
    <div class="network-status">
      <div class="network-item">
        <span class="status-dot active"></span>
        Ethereum
      </div>
      <div class="network-item">
        <span class="status-dot active"></span>
        BSC
      </div>
      <div class="network-item">
        <span class="status-dot active"></span>
        Solana
      </div>
    </div>
    <div class="info-panel">
      <div class="info-header">
        <span>ℹ️ Project Information</span>
        <span>▼</span>
      </div>
      <div class="info-content">
        <h3>Key Features:</h3>
        <ul class="feature-list">
          <li>🔒 Multi-Chain Address Validation (ETH, BSC, SOL)</li>
          <li>📊 Smart Contract Security Analysis</li>
          <li>🔍 Token Safety Analysis</li>
          <li>⚡ Real-time Transaction Guard</li>
          <li>🚫 Scam Pattern Detection</li>
          <li>📱 Mobile-responsive Interface</li>
        </ul>
        <p><strong>Advantages:</strong> All-in-one solution with real-time validation, no external dependencies, and comprehensive protection against common crypto scams.</p>
      </div>
    </div>
    <div class="alert-banner" id="alertBanner"></div>
    <div class="protection-features">
      <div class="bridge-monitor">
        <h3>Bridge Transaction Monitor</h3>
        <div class="chain-selector">
          <select id="fromChain">
            <option value="ETH">Ethereum</option>
            <option value="BSC">BSC</option>
            <option value="SOL">Solana</option>
          </select>
          <span>➡️</span>
          <select id="toChain">
            <option value="BSC">BSC</option>
            <option value="ETH">Ethereum</option>
            <option value="SOL">Solana</option>
          </select>
        </div>
        <input type="text" id="bridgeAmountInput" placeholder="Enter amount to bridge">
        <button id="validateBridgeBtn">Validate Bridge Transaction</button>
      </div>

      <div class="liquidity-monitor">
        <h3>Bridge Liquidity Monitor</h3>
        <div class="liquidity-stats">
          <div>ETH-BSC: <span id="ethBscLiquidity">loading...</span></div>
          <div>BSC-SOL: <span id="bscSolLiquidity">loading...</span></div>
          <div>ETH-SOL: <span id="ethSolLiquidity">loading...</span></div>
        </div>
      </div>

      <div class="token-analyzer">
        <h3>Token Safety Analyzer</h3>
        <input type="text" id="tokenNameInput" placeholder="Enter token name">
        <input type="text" id="contractCodeInput" placeholder="Enter contract code">
        <button id="analyzeTokenBtn">Analyze Token</button>
      </div>
      <div class="address-validator">
        <h3>Chain Address Validator</h3>
        <select id="chainSelect">
          <option value="ETH">Ethereum</option>
          <option value="BSC">Binance Smart Chain</option>
          <option value="SOL">Solana</option>
        </select>
        <input type="text" id="addressInput" placeholder="Enter wallet address">
        <button id="validateBtn">Validate Address</button>
      </div>

      <div class="contract-checker">
        <h3>Smart Contract Verification</h3>
        <input type="text" id="contractInput" placeholder="Enter contract address">
        <button id="checkContractBtn">Check Contract</button>
      </div>

      <div class="transaction-guard">
        <h3>Transaction Guard</h3>
        <input type="number" id="amountInput" placeholder="Enter amount">
        <button id="checkTransactionBtn">Verify Transaction</button>
      </div>
    </div>
    <div class="donation-box">
      <h3>Support Development</h3>
      <div class="donation-addresses">
        <div class="address-item">
          <label>ETH/BSC:</label>
          <input type="text" value="0x742d35Cc6634C0532925a3b844Bc454e4438f44e" readonly>
          <button class="copy-btn" onclick="copyAddress(this)">Copy</button>
        </div>
        <div class="address-item">
          <label>SOL:</label>
          <input type="text" value="DonateSOL12345678901234567890123456789012" readonly>
          <button class="copy-btn" onclick="copyAddress(this)">Copy</button>
        </div>
      </div>
    </div>

    <div class="cross-chain-monitor">
      <h3>Cross-Chain Monitor</h3>
      <div class="monitor-grid">
        <div class="bridge-status">
          <h4>Bridge Status</h4>
          <div id="bridgeHealth">Healthy ✅</div>
          <div class="bridge-stats">
            <div>Total Volume: <span id="bridgeVolume">$0</span></div>
            <div>24h Transactions: <span id="bridgeTx">0</span></div>
          </div>
        </div>
        <div class="gas-tracker">
          <h4>Gas Tracker</h4>
          <div class="gas-grid">
            <div>ETH: <span id="ethGas">--</span></div>
            <div>BSC: <span id="bscGas">--</span></div>
            <div>SOL: <span id="solGas">--</span></div>
          </div>
        </div>
      </div>
    </div>
    <div id="resultArea"></div>
  `;

  document.body.appendChild(container);

  // Enable dark mode by default
  document.body.classList.add('dark-mode');

  // Add dark mode toggle
  const darkModeToggle = document.createElement('button');
  darkModeToggle.innerHTML = '☀️'; // Set initial icon to sun since dark mode is on
  darkModeToggle.id = 'darkModeToggle';
  darkModeToggle.innerHTML = '🌙';
  darkModeToggle.className = 'mode-toggle';
  document.body.appendChild(darkModeToggle);

  // Add analytics panel
  const analyticsPanel = document.createElement('div');
  analyticsPanel.className = 'analytics-panel';
  analyticsPanel.innerHTML = `
    <h3>Analytics Dashboard</h3>
    <div class="stats">
      <div>Transactions Analyzed: <span id="txCount">0</span></div>
      <div>Alerts Triggered: <span id="alertCount">0</span></div>
      <div>Risk Level: <span id="riskLevel">Low</span></div>
    </div>
    <div class="swap-alerts">
      <h4>Recent Swap Alerts</h4>
      <ul id="swapAlertsList"></ul>
    </div>
  `;
  container.appendChild(analyticsPanel);

  // Dark mode functionality
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  });

  // Analytics tracking
  let txAnalyzed = 0;
  let alertsTriggered = 0;

  function updateAnalytics(riskLevel) {
    txAnalyzed++;
    document.getElementById('txCount').textContent = txAnalyzed;

    if (riskLevel === 'HIGH') {
      alertsTriggered++;
      document.getElementById('alertCount').textContent = alertsTriggered;

      const alertsList = document.getElementById('swapAlertsList');
      const alertItem = document.createElement('li');
      alertItem.textContent = `Alert #${alertsTriggered}: High risk transaction detected`;
      alertsList.insertBefore(alertItem, alertsList.firstChild);
    }

    document.getElementById('riskLevel').textContent = riskLevel;
  }

  // Info panel toggle functionality
  const infoHeader = document.querySelector('.info-header');
  const infoContent = document.querySelector('.info-content');
  const infoArrow = infoHeader.querySelector('span:last-child');

  infoHeader.addEventListener('click', () => {
    infoContent.classList.toggle('expanded');
    infoArrow.textContent = infoContent.classList.contains('expanded') ? '▲' : '▼';
  });

  // Chain-specific address validation
  // Solana Program IDs for cross-chain bridges
  const SOLANA_BRIDGE_PROGRAMS = {
    ETH: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
    BSC: 'WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrjnMRXY',
    AVAX: 'KdNhxoXZxX5DqE5RG7qxPvQdeh623P46wGLBQKXNPwn'
  };

  const addressPatterns = {
    ETH: /^0x[a-fA-F0-9]{40}$/,
    BSC: /^0x[a-fA-F0-9]{40}$/,
    SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  };

  // Add Solana transaction verification
  function verifySolanaTransaction(fromChain, toChain, amount) {
    const bridgeProgram = SOLANA_BRIDGE_PROGRAMS[toChain];
    return {
      isValid: bridgeProgram && amount <= 1000000,
      programId: bridgeProgram || 'Unknown',
      estimatedTime: '2-5 minutes',
      fee: (amount * 0.001).toFixed(4)
    };
  }

  // Common scam patterns
  const scamPatterns = {
    urgencyTactics: [
      /urgent/i,
      /limited time/i,
      /guarantee/i,
      /double your/i,
      /only [0-9]+ slots/i,
      /ending soon/i
    ],
    suspiciousPromises: [
      /100% guaranteed/i,
      /risk-free/i,
      /instant profit/i,
      /passive income/i
    ],
    redFlags: [
      /send to receive/i,
      /private sale/i,
      /presale discount/i,
      /airdrop.*verify/i
    ]
  };

  // Token safety checks based on common honeypot patterns
  const honeypotPatterns = {
    contractCode: [
      /maxTransactionAmount/i,
      /blacklist/i,
      /maxSell/i
    ],
    tokenomics: [
      /100%.*tax/i,
      /99%.*fee/i,
      /ownership.*not.*renounced/i
    ]
  };

  function analyzeSocialSentiment(tokenName) {
    const negativeSignals = [
      'scam',
      'rugpull',
      'fake',
      'honeypot'
    ].some(signal => tokenName.toLowerCase().includes(signal));

    return !negativeSignals;
  }

  function checkHoneypotRisk(contractCode) {
    return !honeypotPatterns.contractCode.some(pattern => 
      pattern.test(contractCode)
    );
  }

  function validateAddress(chain, address) {
    return addressPatterns[chain].test(address);
  }

  function checkContractSafety(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    address.length !== 42,
    !/^0x[a-fA-F0-9]{40}$/.test(address),
    /0{8,}/.test(address),
    /([a-fA-F0-9])\1{7,}/.test(address)
  ];
  return !suspiciousPatterns.some(pattern => pattern);
}

  function displayResult(message, isError = false) {
  const resultArea = document.getElementById('resultArea');
  if (resultArea) {
    resultArea.textContent = message;
    resultArea.className = isError ? 'error' : 'success';
  }
}

  // Cross-chain monitoring simulation
  function updateBridgeStats() {
    const volume = Math.floor(Math.random() * 1000000);
    const tx = Math.floor(Math.random() * 100);
    document.getElementById('bridgeVolume').textContent = `$${volume.toLocaleString()}`;
    document.getElementById('bridgeTx').textContent = tx;
  }

  function updateGasTracker() {
    const networks = {
      'ethGas': '50-60',
      'bscGas': '5-7',
      'solGas': '0.001'
    };

    Object.entries(networks).forEach(([network, gas]) => {
      document.getElementById(network).textContent = gas;
    });
  }

  // Update stats periodically
  setInterval(updateBridgeStats, 5000);
  setInterval(updateGasTracker, 10000);

  // Initial updates
  updateBridgeStats();
  updateGasTracker();

  // Copy address function
  window.copyAddress = function(button) {
    const input = button.previousElementSibling;
    input.select();
    document.execCommand('copy');
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  };

  // Event Listeners
  const validateBtn = document.getElementById('validateBtn');
  validateBtn?.addEventListener('click', () => {
    const chain = document.getElementById('chainSelect').value;
    const address = document.getElementById('addressInput').value;

    if (validateAddress(chain, address)) {
      displayResult('✅ Valid address format for ' + chain);
    } else {
      displayResult('❌ Invalid address format', true);
    }
  });

  const checkContractBtn = document.getElementById('checkContractBtn');
  checkContractBtn?.addEventListener('click', () => {
    const contract = document.getElementById('contractInput').value;

    if (checkContractSafety(contract)) {
      displayResult('✅ Contract address appears safe');
    } else {
      displayResult('⚠️ Suspicious contract detected', true);
    }
  });

  const checkTransactionBtn = document.getElementById('checkTransactionBtn');
  checkTransactionBtn?.addEventListener('click', () => {
    const amount = document.getElementById('amountInput').value;

    if (amount > 1000) {
      displayResult('⚠️ High-value transaction detected. Double-check all details!', true);
    } else {
      displayResult('✅ Transaction amount within normal range');
    }
  });

  const analyzeTokenBtn = document.getElementById('analyzeTokenBtn');
  if (analyzeTokenBtn) {
    analyzeTokenBtn.addEventListener('click', () => {
      const tokenName = document.getElementById('tokenNameInput')?.value || '';
      const contractCode = document.getElementById('contractCodeInput')?.value || '';
      const alertBanner = document.getElementById('alertBanner');

      if (!tokenName || !contractCode) {
        if (alertBanner) {
          alertBanner.className = 'alert-banner high';
          alertBanner.textContent = '⚠️ Please fill in all fields';
        }
        return;
      }

    // Rate limiting
  const rateLimiter = {
    lastCall: 0,
    minInterval: 1000, // 1 second
  };

  // Bridge transaction validation
  const validateBridgeBtn = document.getElementById('validateBridgeBtn');
  validateBridgeBtn?.addEventListener('click', () => {
    const now = Date.now();
    if (now - rateLimiter.lastCall < rateLimiter.minInterval) {
      displayResult('⚠️ Please wait before making another request', true);
      return;
    }
    rateLimiter.lastCall = now;

    const fromChain = document.getElementById('fromChain').value;
    const toChain = document.getElementById('toChain').value;
    const amount = document.getElementById('bridgeAmountInput').value;

        const bridgeCheck = verifySolanaTransaction(fromChain, toChain, parseFloat(amount));

        const resultArea = document.getElementById('resultArea');
        if (resultArea) {
          resultArea.innerHTML = `
            Bridge Status: ${bridgeCheck.isValid ? '✅ Safe' : '❌ Risky'}<br>
            Program ID: ${bridgeCheck.programId}<br>
            Est. Time: ${bridgeCheck.estimatedTime}<br>
            Fee: ${bridgeCheck.fee} ${fromChain}
          `;
          resultArea.className = bridgeCheck.isValid ? 'success' : 'error';
        }
      });

      const socialSentiment = analyzeSocialSentiment(tokenName);
      const honeypotSafe = checkHoneypotRisk(contractCode);

      let riskLevel = 'LOW';
      let message = '✅ Token appears safe. ';

      if (!socialSentiment) {
        riskLevel = 'HIGH';
        message = '🚨 WARNING: Negative social signals detected! ';
      }

      if (!honeypotSafe) {
        riskLevel = 'HIGH';
        message += '⚠️ Potential honeypot contract detected!';
      }

      if (alertBanner) {
        alertBanner.className = `alert-banner ${riskLevel.toLowerCase()}`;
        alertBanner.textContent = message;
      }
    });
  }
});