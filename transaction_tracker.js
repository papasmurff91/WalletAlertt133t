
const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection('https://api.mainnet-beta.solana.com');

// Known mixer addresses
const MIXER_ADDRESSES = [
  // Add known mixer contract addresses
  'Mixer111111111111111111111111111111111111111',
  'Tornado111111111111111111111111111111111111'
];

// Tracking patterns
const SUSPICIOUS_PATTERNS = {
  MULTIPLE_HOPS: 'multiple_hops',
  MIXER_INTERACTION: 'mixer_interaction',
  QUICK_SPLITS: 'quick_splits',
  UNUSUAL_AMOUNTS: 'unusual_amounts'
};

async function trackTransaction(transaction, fromAddress) {
  if (!transaction || !fromAddress) {
    console.error('Invalid transaction or address');
    return null;
  }
  
  const patterns = [];
  const hops = new Set();
  let mixerInteraction = false;
  
  try {
    // Get transaction history
    const history = await connection.getConfirmedSignaturesForAddress2(
      new PublicKey(fromAddress),
      { limit: 20 }
    );

    // Track transaction hops
    for (const tx of history) {
      const txInfo = await connection.getTransaction(tx.signature);
      if (!txInfo?.meta?.postTokenBalances) continue;

      txInfo.meta.postTokenBalances.forEach(balance => {
        hops.add(balance.owner);
        
        // Check for mixer interaction
        if (MIXER_ADDRESSES.includes(balance.owner)) {
          mixerInteraction = true;
          patterns.push({
            type: SUSPICIOUS_PATTERNS.MIXER_INTERACTION,
            mixerAddress: balance.owner,
            timestamp: txInfo.blockTime
          });
        }
      });
    }

    // Analyze patterns
    if (hops.size > 3) {
      patterns.push({
        type: SUSPICIOUS_PATTERNS.MULTIPLE_HOPS,
        hopCount: hops.size,
        addresses: Array.from(hops)
      });
    }

    // Check for quick splits
    const quickSplits = history.filter((tx, i, arr) => {
      if (i === 0) return false;
      const timeDiff = arr[i-1].blockTime - tx.blockTime;
      return timeDiff < 60; // Less than 1 minute apart
    });

    if (quickSplits.length > 2) {
      patterns.push({
        type: SUSPICIOUS_PATTERNS.QUICK_SPLITS,
        count: quickSplits.length,
        timestamps: quickSplits.map(tx => tx.blockTime)
      });
    }

    return {
      fromAddress,
      patterns,
      mixerDetected: mixerInteraction,
      timestamp: Date.now(),
      transactionCount: history.length
    };
  } catch (err) {
    console.error('Transaction tracking error:', err);
    return null;
  }
}

module.exports = {
  trackTransaction,
  SUSPICIOUS_PATTERNS
};
