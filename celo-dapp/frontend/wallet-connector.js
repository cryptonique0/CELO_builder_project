/**
 * Multi-Wallet Connector
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and more
 */

class WalletConnector {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.walletType = null;
    this.chainId = null;
  }

  // Detect available wallets
  detectWallets() {
    const wallets = [];
    
    if (typeof window.ethereum !== 'undefined') {
      if (window.ethereum.isMetaMask) {
        wallets.push({ id: 'metamask', name: 'MetaMask', icon: '🦊' });
      }
      if (window.ethereum.isCoinbaseWallet) {
        wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: '💎' });
      }
      if (!window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
        wallets.push({ id: 'injected', name: 'Browser Wallet', icon: '🔌' });
      }
    }
    
    // WalletConnect is always available
    wallets.push({ id: 'walletconnect', name: 'WalletConnect', icon: '📱' });
    
    return wallets;
  }

  // Connect to MetaMask
  async connectMetaMask() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.address = accounts[0];
      this.walletType = 'metamask';
      
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId;

      // Setup listeners
      this.setupEventListeners();

      return {
        provider: this.provider,
        signer: this.signer,
        address: this.address,
        chainId: this.chainId,
        walletType: this.walletType
      };
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  }

  // Connect to Coinbase Wallet
  async connectCoinbase() {
    try {
      if (typeof window.ethereum === 'undefined' || !window.ethereum.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet not installed');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      this.address = accounts[0];
      this.walletType = 'coinbase';
      
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId;

      this.setupEventListeners();

      return {
        provider: this.provider,
        signer: this.signer,
        address: this.address,
        chainId: this.chainId,
        walletType: this.walletType
      };
    } catch (error) {
      console.error('Coinbase Wallet connection error:', error);
      throw error;
    }
  }

  // Connect to WalletConnect
  async connectWalletConnect() {
    try {
      // For WalletConnect, we'll need to include the library
      // This is a placeholder - in production, you'd use @walletconnect/web3-provider
      throw new Error('WalletConnect requires additional setup. Please use MetaMask or Coinbase Wallet for now.');
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      throw error;
    }
  }

  // Generic connect method
  async connect(walletId) {
    switch (walletId) {
      case 'metamask':
        return await this.connectMetaMask();
      case 'coinbase':
        return await this.connectCoinbase();
      case 'walletconnect':
        return await this.connectWalletConnect();
      case 'injected':
        return await this.connectMetaMask(); // Use generic web3 provider
      default:
        throw new Error('Unknown wallet type');
    }
  }

  // Switch network
  async switchNetwork(chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId;
      
      return this.chainId;
    } catch (error) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        return await this.addNetwork(chainId);
      }
      throw error;
    }
  }

  // Add Celo network
  async addNetwork(chainId) {
    const networks = {
      42220: {
        chainId: '0xa4ec',
        chainName: 'Celo Mainnet',
        nativeCurrency: {
          name: 'CELO',
          symbol: 'CELO',
          decimals: 18
        },
        rpcUrls: ['https://forno.celo.org'],
        blockExplorerUrls: ['https://celoscan.io']
      },
      44787: {
        chainId: '0xaef3',
        chainName: 'Celo Alfajores Testnet',
        nativeCurrency: {
          name: 'CELO',
          symbol: 'CELO',
          decimals: 18
        },
        rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
        blockExplorerUrls: ['https://alfajores.celoscan.io']
      }
    };

    const networkConfig = networks[chainId];
    if (!networkConfig) {
      throw new Error('Network not supported');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      
      const network = await this.provider.getNetwork();
      this.chainId = network.chainId;
      
      return this.chainId;
    } catch (error) {
      console.error('Error adding network:', error);
      throw error;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (window.ethereum) {
      // Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.address = accounts[0];
          window.dispatchEvent(new CustomEvent('walletAccountChanged', { 
            detail: { address: this.address } 
          }));
        }
      });

      // Chain changed
      window.ethereum.on('chainChanged', (chainIdHex) => {
        this.chainId = parseInt(chainIdHex, 16);
        window.dispatchEvent(new CustomEvent('walletChainChanged', { 
          detail: { chainId: this.chainId } 
        }));
        // Reload page on chain change (recommended by MetaMask)
        window.location.reload();
      });

      // Disconnect
      window.ethereum.on('disconnect', () => {
        this.disconnect();
      });
    }
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.walletType = null;
    this.chainId = null;
    
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
  }

  // Get current connection status
  isConnected() {
    return this.provider !== null && this.address !== null;
  }

  // Get network name
  getNetworkName(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      42220: 'Celo Mainnet',
      44787: 'Celo Alfajores Testnet',
      137: 'Polygon',
      80001: 'Mumbai Testnet',
      42161: 'Arbitrum One',
      10: 'Optimism'
    };
    return networks[chainId] || `Chain ${chainId}`;
  }
}

// Export singleton instance
const walletConnector = new WalletConnector();
