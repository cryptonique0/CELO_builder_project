/**
 * Gas Estimation & Speed Selector
 * Provides gas price estimation with slow/average/fast options
 */

class GasEstimator {
  constructor() {
    this.provider = null;
    this.speeds = {
      slow: { multiplier: 0.8, label: '🐌 Slow', time: '~30s' },
      average: { multiplier: 1.0, label: '⚡ Average', time: '~15s' },
      fast: { multiplier: 1.2, label: '🚀 Fast', time: '~5s' }
    };
    this.selectedSpeed = 'average';
    this.baseGasPrice = null;
    this.updateInterval = null;
  }

  // Initialize with provider
  init(provider) {
    this.provider = provider;
    this.startAutoUpdate();
  }

  // Get current gas price
  async getGasPrice() {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const gasPrice = await this.provider.getGasPrice();
      this.baseGasPrice = gasPrice;
      return gasPrice;
    } catch (error) {
      console.error('Error fetching gas price:', error);
      throw error;
    }
  }

  // Get gas price for selected speed
  async getGasPriceForSpeed(speed = null) {
    const selectedSpeed = speed || this.selectedSpeed;
    const speedConfig = this.speeds[selectedSpeed];
    
    if (!speedConfig) {
      throw new Error('Invalid speed selected');
    }

    const basePrice = await this.getGasPrice();
    const adjustedPrice = basePrice.mul(Math.floor(speedConfig.multiplier * 100)).div(100);
    
    return adjustedPrice;
  }

  // Estimate gas for transaction
  async estimateGas(transaction) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const gasLimit = await this.provider.estimateGas(transaction);
      return gasLimit;
    } catch (error) {
      console.error('Error estimating gas:', error);
      // Return a safe default
      return ethers.BigNumber.from('100000');
    }
  }

  // Get complete gas estimation with all speeds
  async getCompleteEstimation(transaction) {
    try {
      const [gasLimit, baseGasPrice] = await Promise.all([
        this.estimateGas(transaction),
        this.getGasPrice()
      ]);

      const estimations = {};

      for (const [speed, config] of Object.entries(this.speeds)) {
        const gasPrice = baseGasPrice.mul(Math.floor(config.multiplier * 100)).div(100);
        const totalCost = gasLimit.mul(gasPrice);
        
        estimations[speed] = {
          speed,
          label: config.label,
          time: config.time,
          gasLimit: gasLimit.toString(),
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          gasPriceWei: gasPrice.toString(),
          totalCost: ethers.utils.formatEther(totalCost),
          totalCostWei: totalCost.toString()
        };
      }

      return {
        gasLimit: gasLimit.toString(),
        baseGasPrice: ethers.utils.formatUnits(baseGasPrice, 'gwei'),
        estimations
      };
    } catch (error) {
      console.error('Error getting complete estimation:', error);
      throw error;
    }
  }

  // Select gas speed
  selectSpeed(speed) {
    if (!this.speeds[speed]) {
      throw new Error('Invalid speed');
    }
    
    this.selectedSpeed = speed;
    window.dispatchEvent(new CustomEvent('gasSpeedChanged', {
      detail: { speed, config: this.speeds[speed] }
    }));
  }

  // Get selected speed
  getSelectedSpeed() {
    return this.selectedSpeed;
  }

  // Get speed config
  getSpeedConfig(speed = null) {
    return this.speeds[speed || this.selectedSpeed];
  }

  // Format gas price for display
  formatGasPrice(gasPrice) {
    if (typeof gasPrice === 'string' || typeof gasPrice === 'number') {
      return `${parseFloat(gasPrice).toFixed(2)} Gwei`;
    }
    return `${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`;
  }

  // Format total cost for display
  formatTotalCost(cost) {
    if (typeof cost === 'string' || typeof cost === 'number') {
      return `${parseFloat(cost).toFixed(6)} CELO`;
    }
    return `${ethers.utils.formatEther(cost)} CELO`;
  }

  // Calculate savings between speeds
  calculateSavings(slowCost, fastCost) {
    const slow = typeof slowCost === 'string' ? parseFloat(slowCost) : parseFloat(ethers.utils.formatEther(slowCost));
    const fast = typeof fastCost === 'string' ? parseFloat(fastCost) : parseFloat(ethers.utils.formatEther(fastCost));
    
    const savings = fast - slow;
    const percentage = ((savings / fast) * 100).toFixed(1);
    
    return {
      amount: savings.toFixed(6),
      percentage: percentage
    };
  }

  // Get network congestion level
  async getNetworkCongestion() {
    try {
      const gasPrice = await this.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));

      // Celo typical gas prices (in Gwei)
      if (gasPriceGwei < 1) {
        return { level: 'low', color: '#4CAF50', icon: '🟢', message: 'Network is quiet' };
      } else if (gasPriceGwei < 5) {
        return { level: 'medium', color: '#FF9800', icon: '🟡', message: 'Moderate activity' };
      } else {
        return { level: 'high', color: '#F44336', icon: '🔴', message: 'High congestion' };
      }
    } catch (error) {
      return { level: 'unknown', color: '#999', icon: '❓', message: 'Unable to determine' };
    }
  }

  // Start auto-updating gas prices
  startAutoUpdate(interval = 15000) {
    this.stopAutoUpdate();
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.getGasPrice();
        window.dispatchEvent(new CustomEvent('gasPriceUpdated', {
          detail: { gasPrice: this.baseGasPrice }
        }));
      } catch (error) {
        console.error('Error updating gas price:', error);
      }
    }, interval);
  }

  // Stop auto-updating
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Build transaction with gas settings
  async buildTransaction(baseTx, speed = null) {
    const selectedSpeed = speed || this.selectedSpeed;
    const gasPrice = await this.getGasPriceForSpeed(selectedSpeed);
    const gasLimit = await this.estimateGas(baseTx);

    return {
      ...baseTx,
      gasPrice: gasPrice,
      gasLimit: gasLimit
    };
  }

  // Estimate cost in USD (requires price oracle)
  async estimateCostInUSD(celoPrice, transaction) {
    try {
      const estimation = await this.getCompleteEstimation(transaction);
      const costInCELO = parseFloat(estimation.estimations[this.selectedSpeed].totalCost);
      const costInUSD = costInCELO * celoPrice;
      
      return {
        celo: costInCELO.toFixed(6),
        usd: costInUSD.toFixed(2)
      };
    } catch (error) {
      console.error('Error estimating cost in USD:', error);
      return { celo: '0', usd: '0' };
    }
  }

  // Get historical gas data (mock - would need backend)
  getHistoricalData() {
    return {
      current: this.baseGasPrice ? ethers.utils.formatUnits(this.baseGasPrice, 'gwei') : '0',
      average24h: '1.2',
      lowest24h: '0.5',
      highest24h: '3.5'
    };
  }

  // Advanced: Calculate optimal gas price using EIP-1559 (if supported)
  async calculateOptimalGasPrice() {
    try {
      const block = await this.provider.getBlock('latest');
      if (block.baseFeePerGas) {
        // EIP-1559 supported
        const baseFee = block.baseFeePerGas;
        const maxPriorityFee = ethers.utils.parseUnits('2', 'gwei');
        const maxFeePerGas = baseFee.mul(2).add(maxPriorityFee);
        
        return {
          baseFeePerGas: ethers.utils.formatUnits(baseFee, 'gwei'),
          maxPriorityFeePerGas: ethers.utils.formatUnits(maxPriorityFee, 'gwei'),
          maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'gwei')
        };
      }
    } catch (error) {
      console.warn('EIP-1559 not supported or error:', error);
    }
    return null;
  }

  // Estimate gas with batching optimization
  async estimateGasBatch(transactions) {
    try {
      const estimates = await Promise.all(
        transactions.map(tx => this.estimateGas(tx))
      );
      return estimates;
    } catch (error) {
      console.error('Error estimating batch gas:', error);
      return transactions.map(() => ethers.BigNumber.from('100000'));
    }
  }

  // Calculate gas savings by using batching
  calculateBatchSavings(singleGasCosts, batchGasCost) {
    const totalSingle = singleGasCosts.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const savings = totalSingle - parseFloat(batchGasCost);
    const percentage = ((savings / totalSingle) * 100).toFixed(1);
    
    return {
      singleTotal: totalSingle.toFixed(6),
      batchTotal: parseFloat(batchGasCost).toFixed(6),
      savings: savings.toFixed(6),
      percentage: percentage
    };
  }

  // Generate gas estimation UI HTML
  generateEstimationUI(estimations) {
    return `
      <div class="gas-estimation-panel">
        <h3>⛽ Gas Estimation</h3>
        ${Object.values(estimations).map(est => `
          <div class="gas-option ${est.speed === this.selectedSpeed ? 'selected' : ''}" 
               data-speed="${est.speed}">
            <div class="gas-speed">
              ${est.label}
              <span class="gas-time">${est.time}</span>
            </div>
            <div class="gas-details">
              <div class="gas-price">${parseFloat(est.gasPrice).toFixed(2)} Gwei</div>
              <div class="gas-cost">${parseFloat(est.totalCost).toFixed(6)} CELO</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Export singleton instance
const gasEstimator = new GasEstimator();
