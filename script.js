document.addEventListener('DOMContentLoaded', () => {
  // Security: XSS prevention
  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '');
  };

  // Security: Rate limiting
  const rateLimiter = {
    lastCall: 0,
    minInterval: 1000,
    check() {
      const now = Date.now();
      if (now - this.lastCall < this.minInterval) {
        return false;
      }
      this.lastCall = now;
      return true;
    }
  };

  const createCollapsibleSection = (title, content) => {
    const section = document.createElement('div');
    section.className = 'collapsible-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `${title}<span>▼</span>`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'section-content';
    contentDiv.innerHTML = content;

    header.addEventListener('click', () => {
      contentDiv.classList.toggle('expanded');
      header.querySelector('span').textContent = 
        contentDiv.classList.contains('expanded') ? '▲' : '▼';
    });

    section.appendChild(header);
    section.appendChild(contentDiv);
    return section;
  };

  // Security: Input validation patterns
  const patterns = {
    address: {
      ETH: /^0x[a-fA-F0-9]{40}$/,
      BSC: /^0x[a-fA-F0-9]{40}$/,
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    },
    amount: /^\d+(\.\d{1,18})?$/,
    contractAddress: /^0x[a-fA-F0-9]{40}$/
  };

  const validateInput = (input, pattern) => {
    return pattern.test(input);
  };

  const container = document.createElement('div');
  container.className = 'container';

  // Main content structure
  const sections = [
    {
      title: 'Network Status',
      content: `
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
      `
    },
    {
      title: 'Bridge Monitor',
      content: `
        <div class="bridge-monitor">
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
          <input type="text" id="bridgeAmount" placeholder="Enter amount">
          <button id="validateBridge">Validate Bridge Transaction</button>
        </div>
      `
    },
    {
      title: 'Address Validator',
      content: `
        <div class="address-validator">
          <select id="chainSelect">
            <option value="ETH">Ethereum</option>
            <option value="BSC">BSC</option>
            <option value="SOL">Solana</option>
          </select>
          <input type="text" id="addressInput" placeholder="Enter address">
          <button id="validateAddress">Validate Address</button>
        </div>
      `
    }
  ];

  // Create and append sections
  sections.forEach(section => {
    container.appendChild(
      createCollapsibleSection(section.title, section.content)
    );
  });

  document.body.appendChild(container);

  // Event listeners with security checks
  document.getElementById('validateAddress')?.addEventListener('click', () => {
    if (!rateLimiter.check()) {
      displayResult('Please wait before making another request', true);
      return;
    }

    const chain = document.getElementById('chainSelect').value;
    const address = sanitizeInput(document.getElementById('addressInput').value);

    if (!validateInput(address, patterns.address[chain])) {
      displayResult('Invalid address format', true);
      return;
    }

    displayResult('Valid address format');
  });

  document.getElementById('validateBridge')?.addEventListener('click', () => {
    if (!rateLimiter.check()) {
      displayResult('Please wait before making another request', true);
      return;
    }

    const amount = sanitizeInput(document.getElementById('bridgeAmount').value);

    if (!validateInput(amount, patterns.amount)) {
      displayResult('Invalid amount format', true);
      return;
    }

    displayResult('Bridge transaction validated');
  });

  function displayResult(message, isError = false) {
    const resultArea = document.getElementById('resultArea') || 
      (() => {
        const div = document.createElement('div');
        div.id = 'resultArea';
        container.appendChild(div);
        return div;
      })();

    resultArea.textContent = message;
    resultArea.className = isError ? 'error' : 'success';
  }

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

  const analyzeTokenBtn = document.getElementById('analyzeTokenBtn');
  const validateBridgeBtn = document.getElementById('validateBridge');

  function verifySolanaTransaction(fromChain, toChain, amount) {
    const SOLANA_BRIDGE_PROGRAMS = {
      ETH: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
      BSC: 'WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrjnMRXY',
      AVAX: 'KdNhxoXZxX5DqE5RG7qxPvQdeh623P46wGLBQKXNPwn'
    };

    const bridgeProgram = SOLANA_BRIDGE_PROGRAMS[toChain];
    return {
      isValid: bridgeProgram && amount <= 1000000,
      programId: bridgeProgram || 'Unknown',
      estimatedTime: '2-5 minutes',
      fee: (amount * 0.001).toFixed(4)
    };
  }
});