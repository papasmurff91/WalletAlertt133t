
document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Cross-Chain Protection System</h1>
    <div class="alert-banner" id="alertBanner"></div>
    <div class="protection-features">
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
    <div id="resultArea"></div>
  `;

  document.body.appendChild(container);

  // Chain-specific address validation
  const addressPatterns = {
    ETH: /^0x[a-fA-F0-9]{40}$/,
    BSC: /^0x[a-fA-F0-9]{40}$/,
    SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  };

  // Common scam patterns
  // Enhanced scam detection patterns based on user reports
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
    // Simulated social sentiment check
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
    // Basic contract safety checks
    const suspiciousPatterns = [
      address.length !== 42,
      !/^0x/.test(address),
      /0000/.test(address)
    ];
    return !suspiciousPatterns.some(pattern => pattern);
  }

  function displayResult(message, isError = false) {
    const resultArea = document.getElementById('resultArea');
    if (resultArea) {
      resultArea.innerHTML = message;
      resultArea.className = isError ? 'error' : 'success';
    }
  }

  // Event Listeners
  document.getElementById('validateBtn').addEventListener('click', () => {
    const chain = document.getElementById('chainSelect').value;
    const address = document.getElementById('addressInput').value;
    
    if (validateAddress(chain, address)) {
      displayResult('✅ Valid address format for ' + chain);
    } else {
      displayResult('❌ Invalid address format', true);
    }
  });

  document.getElementById('checkContractBtn').addEventListener('click', () => {
    const contract = document.getElementById('contractInput').value;
    
    if (checkContractSafety(contract)) {
      displayResult('✅ Contract address appears safe');
    } else {
      displayResult('⚠️ Suspicious contract detected', true);
    }
  });

  document.getElementById('checkTransactionBtn').addEventListener('click', () => {
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
      
      if (!tokenName || !contractCode) {
        const alertBanner = document.getElementById('alertBanner');
        if (alertBanner) {
          alertBanner.className = 'alert-banner high';
          alertBanner.textContent = '⚠️ Please fill in all fields';
        }
        return;
      }
    
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
    
    const alertBanner = document.getElementById('alertBanner');
    alertBanner.className = `alert-banner ${riskLevel.toLowerCase()}`;
    alertBanner.textContent = message;
  });
});
