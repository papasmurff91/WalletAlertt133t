document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h1>Welcome to Your App</h1>
    <button id="actionButton">Click Me!</button>
  `;

  document.body.appendChild(container);

  const button = document.getElementById('actionButton');
  const walletInput = document.createElement('input');
  walletInput.type = 'text';
  walletInput.placeholder = 'Enter Wallet Address';
  walletInput.id = 'walletInput';
  container.insertBefore(walletInput, button);

  button.addEventListener('click', () => {
    const walletAddress = walletInput.value;
    if (validateWalletAddress(walletAddress)) {
      alert('Wallet address is valid. Proceeding with the transaction...');
    } else {
      alert('Warning: Invalid wallet address detected!');
    }
  });

  function validateWalletAddress(address) {
    const regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // Basic RegEx for BTC addresses
    return regex.test(address);
  }
});