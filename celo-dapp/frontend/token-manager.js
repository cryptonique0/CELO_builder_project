/**
 * Token Manager
 * Support for multiple Celo tokens (CELO, cUSD, cEUR, cREAL)
 */

class TokenManager {
  constructor() {
    this.tokens = {
      CELO: {
        symbol: 'CELO',
        name: 'Celo Native Asset',
        address: 'native',
        decimals: 18,
        icon: '💚',
        color: '#35D07F'
      },
      cUSD: {
        symbol: 'cUSD',
        name: 'Celo Dollar',
        address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
        decimals: 18,
        icon: '💵',
        color: '#46CD85'
      },
      cEUR: {
        symbol: 'cEUR',
        name: 'Celo Euro',
        address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
        decimals: 18,
        icon: '💶',
        color: '#8B5CF6'
      },
      cREAL: {
        symbol: 'cREAL',
        name: 'Celo Real',
        address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
        decimals: 18,
        icon: '💷',
        color: '#F59E0B'
      }
    };

    this.selectedToken = 'CELO';
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.balances = {};

    // ERC-20 ABI for token interactions
    this.erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function transfer(address to, uint amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)'
    ];
  }

  // Initialize with provider
  init(provider, signer, userAddress) {
    this.provider = provider;
    this.signer = signer;
    this.userAddress = userAddress;
  }

  // Get all available tokens
  getAllTokens() {
    return Object.values(this.tokens);
  }

  // Get token by symbol
  getToken(symbol) {
    return this.tokens[symbol];
  }

  // Select token
  selectToken(symbol) {
    if (!this.tokens[symbol]) {
      throw new Error(`Token ${symbol} not supported`);
    }
    this.selectedToken = symbol;
    window.dispatchEvent(new CustomEvent('tokenChanged', {
      detail: this.tokens[symbol]
    }));
  }

  // Get selected token
  getSelectedToken() {
    return this.tokens[this.selectedToken];
  }

  // Get token balance
  async getBalance(symbol, address = null) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const token = this.tokens[symbol];
    if (!token) {
      throw new Error(`Token ${symbol} not found`);
    }

    const userAddr = address || this.userAddress;
    if (!userAddr) {
      throw new Error('No address provided');
    }

    try {
      if (token.address === 'native') {
        // Get native CELO balance
        const balance = await this.provider.getBalance(userAddr);
        return ethers.utils.formatEther(balance);
      } else {
        // Get ERC-20 token balance
        const contract = new ethers.Contract(token.address, this.erc20Abi, this.provider);
        const balance = await contract.balanceOf(userAddr);
        return ethers.utils.formatUnits(balance, token.decimals);
      }
    } catch (error) {
      console.error(`Error fetching ${symbol} balance:`, error);
      return '0';
    }
  }

  // Get all token balances
  async getAllBalances(address = null) {
    const userAddr = address || this.userAddress;
    const balances = {};

    const promises = Object.keys(this.tokens).map(async (symbol) => {
      try {
        balances[symbol] = await this.getBalance(symbol, userAddr);
      } catch (error) {
        balances[symbol] = '0';
      }
    });

    await Promise.all(promises);
    this.balances = balances;
    return balances;
  }

  // Transfer tokens
  async transfer(toAddress, amount, symbol = null) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const token = this.tokens[symbol || this.selectedToken];
    if (!token) {
      throw new Error('Token not found');
    }

    try {
      if (token.address === 'native') {
        // Send native CELO
        const tx = await this.signer.sendTransaction({
          to: toAddress,
          value: ethers.utils.parseEther(amount)
        });
        return tx;
      } else {
        // Send ERC-20 token
        const contract = new ethers.Contract(token.address, this.erc20Abi, this.signer);
        const amountWei = ethers.utils.parseUnits(amount, token.decimals);
        const tx = await contract.transfer(toAddress, amountWei);
        return tx;
      }
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  // Approve token spending
  async approve(spenderAddress, amount, symbol = null) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const token = this.tokens[symbol || this.selectedToken];
    if (!token || token.address === 'native') {
      throw new Error('Cannot approve native token');
    }

    try {
      const contract = new ethers.Contract(token.address, this.erc20Abi, this.signer);
      const amountWei = ethers.utils.parseUnits(amount, token.decimals);
      const tx = await contract.approve(spenderAddress, amountWei);
      return tx;
    } catch (error) {
      console.error('Approve error:', error);
      throw error;
    }
  }

  // Check allowance
  async getAllowance(ownerAddress, spenderAddress, symbol = null) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const token = this.tokens[symbol || this.selectedToken];
    if (!token || token.address === 'native') {
      return ethers.constants.MaxUint256; // Native token doesn't need approval
    }

    try {
      const contract = new ethers.Contract(token.address, this.erc20Abi, this.provider);
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      return ethers.utils.formatUnits(allowance, token.decimals);
    } catch (error) {
      console.error('Allowance check error:', error);
      return '0';
    }
  }

  // Add custom token
  addCustomToken(tokenData) {
    const { symbol, name, address, decimals, icon, color } = tokenData;
    
    if (!symbol || !address) {
      throw new Error('Symbol and address are required');
    }

    this.tokens[symbol] = {
      symbol,
      name: name || symbol,
      address,
      decimals: decimals || 18,
      icon: icon || '🪙',
      color: color || '#667eea'
    };

    window.dispatchEvent(new CustomEvent('tokenAdded', {
      detail: this.tokens[symbol]
    }));

    return this.tokens[symbol];
  }

  // Validate token address
  async validateToken(address) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const contract = new ethers.Contract(address, this.erc20Abi, this.provider);
      const [symbol, decimals] = await Promise.all([
        contract.symbol(),
        contract.decimals()
      ]);

      return {
        valid: true,
        symbol,
        decimals
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid token address'
      };
    }
  }

  // Format amount with token symbol
  formatAmount(amount, symbol = null) {
    const token = this.tokens[symbol || this.selectedToken];
    if (!token) return amount;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';

    return `${numAmount.toFixed(4)} ${token.symbol}`;
  }

  // Get token icon
  getIcon(symbol = null) {
    const token = this.tokens[symbol || this.selectedToken];
    return token ? token.icon : '🪙';
  }

  // Get token color
  getColor(symbol = null) {
    const token = this.tokens[symbol || this.selectedToken];
    return token ? token.color : '#667eea';
  }

  // Export token list for display
  exportTokenList() {
    return Object.values(this.tokens).map(token => ({
      symbol: token.symbol,
      name: token.name,
      icon: token.icon,
      balance: this.balances[token.symbol] || '0'
    }));
  }

  // Get total portfolio value (in USD equivalent)
  async getPortfolioValue() {
    // This would require price oracle integration
    // For now, return token balances
    return this.balances;
  }

  // Check if token is native
  isNativeToken(symbol = null) {
    const token = this.tokens[symbol || this.selectedToken];
    return token && token.address === 'native';
  }

  // Get token swap information (placeholder for DEX integration)
  async getSwapRoute(fromSymbol, toSymbol, amount) {
    // This would integrate with Uniswap/SushiSwap or other DEX
    // For now, return mock data
    return {
      from: fromSymbol,
      to: toSymbol,
      amount: amount,
      estimatedOutput: (parseFloat(amount) * 0.98).toFixed(4),
      fee: '0.3%',
      slippage: '0.5%'
    };
  }

  // Get historical token prices (placeholder for price oracle)
  async getHistoricalPrices(symbol) {
    // This would integrate with CoinGecko or similar API
    return {
      symbol,
      current: '2.50',
      day: '2.45',
      week: '2.40',
      month: '2.35'
    };
  }

  // Calculate conversion between tokens (using price data)
  async convertBetweenTokens(amount, fromSymbol, toSymbol) {
    try {
      // This would use actual price data from an oracle
      // For now, return mock conversion
      return {
        from: amount,
        fromSymbol,
        to: (parseFloat(amount) * 1.05).toFixed(4),
        toSymbol,
        rate: '1.05'
      };
    } catch (error) {
      console.error('Conversion error:', error);
      throw error;
    }
  }

  // Get staking opportunities for tokens
  async getStakingInfo() {
    return {
      CELO: {
        apy: '5.5%',
        minAmount: '1',
        lockPeriod: '60 days'
      },
      cUSD: {
        apy: '3.0%',
        minAmount: '100',
        lockPeriod: '30 days'
      }
    };
  }

  // Batch transfer to multiple recipients
  async batchTransfer(recipients, symbol = null) {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const token = this.tokens[symbol || this.selectedToken];
    const results = [];

    for (const recipient of recipients) {
      try {
        const tx = await this.transfer(recipient.address, recipient.amount, symbol);
        results.push({
          recipient: recipient.address,
          amount: recipient.amount,
          txHash: tx.hash,
          status: 'pending'
        });
      } catch (error) {
        results.push({
          recipient: recipient.address,
          amount: recipient.amount,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }
}

// Export singleton instance
const tokenManager = new TokenManager();
