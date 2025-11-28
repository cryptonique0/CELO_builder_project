/**
 * Transaction History Manager
 * Tracks and displays user transactions with real-time status updates
 */

class TransactionHistory {
  constructor() {
    this.storageKey = 'celo_tx_history';
    this.transactions = this.loadFromStorage();
    this.provider = null;
    this.maxTransactions = 100;
  }

  // Initialize with provider
  init(provider) {
    this.provider = provider;
  }

  // Load transactions from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return [];
    }
  }

  // Save transactions to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  }

  // Add new transaction
  addTransaction(txData) {
    const transaction = {
      hash: txData.hash,
      from: txData.from,
      to: txData.to,
      value: txData.value || '0',
      memo: txData.memo || '',
      timestamp: Date.now(),
      status: 'pending',
      confirmations: 0,
      gasUsed: null,
      gasPrice: txData.gasPrice || null,
      blockNumber: null,
      type: txData.type || 'payment'
    };

    this.transactions.unshift(transaction);

    // Keep only recent transactions
    if (this.transactions.length > this.maxTransactions) {
      this.transactions = this.transactions.slice(0, this.maxTransactions);
    }

    this.saveToStorage();

    // Start monitoring transaction
    this.monitorTransaction(transaction.hash);

    return transaction;
  }

  // Monitor transaction status
  async monitorTransaction(txHash) {
    if (!this.provider) {
      console.warn('Provider not initialized');
      return;
    }

    try {
      // Wait for transaction receipt
      const receipt = await this.provider.waitForTransaction(txHash, 1);

      // Update transaction with receipt data
      const txIndex = this.transactions.findIndex(tx => tx.hash === txHash);
      if (txIndex !== -1) {
        this.transactions[txIndex].status = receipt.status === 1 ? 'confirmed' : 'failed';
        this.transactions[txIndex].blockNumber = receipt.blockNumber;
        this.transactions[txIndex].gasUsed = receipt.gasUsed.toString();
        this.transactions[txIndex].confirmations = 1;
        this.saveToStorage();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('transactionUpdated', {
          detail: this.transactions[txIndex]
        }));

        // Continue monitoring for more confirmations
        this.monitorConfirmations(txHash);
      }
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      
      // Mark as failed
      const txIndex = this.transactions.findIndex(tx => tx.hash === txHash);
      if (txIndex !== -1) {
        this.transactions[txIndex].status = 'failed';
        this.saveToStorage();
        
        window.dispatchEvent(new CustomEvent('transactionUpdated', {
          detail: this.transactions[txIndex]
        }));
      }
    }
  }

  // Monitor confirmation count
  async monitorConfirmations(txHash) {
    if (!this.provider) return;

    const maxConfirmations = 12;
    const txIndex = this.transactions.findIndex(tx => tx.hash === txHash);
    
    if (txIndex === -1) return;

    try {
      const interval = setInterval(async () => {
        try {
          const receipt = await this.provider.getTransactionReceipt(txHash);
          if (!receipt) {
            clearInterval(interval);
            return;
          }

          const currentBlock = await this.provider.getBlockNumber();
          const confirmations = currentBlock - receipt.blockNumber;

          if (txIndex !== -1) {
            this.transactions[txIndex].confirmations = confirmations;
            this.saveToStorage();

            window.dispatchEvent(new CustomEvent('transactionUpdated', {
              detail: this.transactions[txIndex]
            }));
          }

          if (confirmations >= maxConfirmations) {
            clearInterval(interval);
          }
        } catch (error) {
          clearInterval(interval);
        }
      }, 3000); // Check every 3 seconds

      // Stop monitoring after 5 minutes
      setTimeout(() => clearInterval(interval), 300000);

    } catch (error) {
      console.error('Error monitoring confirmations:', error);
    }
  }

  // Get all transactions
  getAll() {
    return this.transactions;
  }

  // Get recent transactions
  getRecent(count = 10) {
    return this.transactions.slice(0, count);
  }

  // Get transaction by hash
  getByHash(txHash) {
    return this.transactions.find(tx => tx.hash === txHash);
  }

  // Get transactions by status
  getByStatus(status) {
    return this.transactions.filter(tx => tx.status === status);
  }

  // Get transactions by address
  getByAddress(address) {
    address = address.toLowerCase();
    return this.transactions.filter(tx => 
      tx.from.toLowerCase() === address || 
      tx.to.toLowerCase() === address
    );
  }

  // Clear all transactions
  clear() {
    this.transactions = [];
    this.saveToStorage();
  }

  // Remove old transactions (older than 30 days)
  cleanOld() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.transactions = this.transactions.filter(tx => tx.timestamp > thirtyDaysAgo);
    this.saveToStorage();
  }

  // Export to CSV
  exportToCSV() {
    const headers = ['Hash', 'From', 'To', 'Value (CELO)', 'Status', 'Confirmations', 'Timestamp', 'Block', 'Gas Used', 'Memo'];
    
    const rows = this.transactions.map(tx => [
      tx.hash,
      tx.from,
      tx.to,
      ethers.utils.formatEther(tx.value),
      tx.status,
      tx.confirmations,
      new Date(tx.timestamp).toLocaleString(),
      tx.blockNumber || 'Pending',
      tx.gasUsed || 'Pending',
      tx.memo || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Download CSV
  downloadCSV() {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celo-transactions-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Get statistics
  getStats() {
    const total = this.transactions.length;
    const pending = this.transactions.filter(tx => tx.status === 'pending').length;
    const confirmed = this.transactions.filter(tx => tx.status === 'confirmed').length;
    const failed = this.transactions.filter(tx => tx.status === 'failed').length;

    const totalValue = this.transactions
      .filter(tx => tx.status === 'confirmed')
      .reduce((sum, tx) => sum + parseFloat(ethers.utils.formatEther(tx.value)), 0);

    const totalGasUsed = this.transactions
      .filter(tx => tx.gasUsed)
      .reduce((sum, tx) => sum + parseFloat(tx.gasUsed), 0);

    return {
      total,
      pending,
      confirmed,
      failed,
      totalValue: totalValue.toFixed(4),
      totalGasUsed: totalGasUsed.toString(),
      successRate: total > 0 ? ((confirmed / total) * 100).toFixed(2) : 0
    };
  }

  // Format transaction for display
  formatTransaction(tx) {
    return {
      ...tx,
      valueFormatted: ethers.utils.formatEther(tx.value),
      timestampFormatted: new Date(tx.timestamp).toLocaleString(),
      statusIcon: this.getStatusIcon(tx.status, tx.confirmations),
      statusColor: this.getStatusColor(tx.status),
      explorerUrl: this.getExplorerUrl(tx.hash, tx.blockNumber)
    };
  }

  // Get status icon
  getStatusIcon(status, confirmations) {
    if (status === 'pending') return '⏳';
    if (status === 'failed') return '❌';
    if (confirmations < 3) return '🔄';
    if (confirmations < 12) return '⚡';
    return '✅';
  }

  // Get status color
  getStatusColor(status) {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#4CAF50';
      case 'failed': return '#F44336';
      default: return '#666';
    }
  }

  // Get explorer URL
  getExplorerUrl(txHash, blockNumber) {
    const baseUrl = 'https://celoscan.io';
    return `${baseUrl}/tx/${txHash}`;
  }
}

// Export singleton instance
const txHistory = new TransactionHistory();
