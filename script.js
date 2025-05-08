
document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Cross-Chain Protection System</h1>
    <div class="protection-features">
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
  const scamPatterns = [
    /urgent/i,
    /limited time/i,
    /guarantee/i,
    /double your/i
  ];

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
    resultArea.innerHTML = message;
    resultArea.className = isError ? 'error' : 'success';
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
});
