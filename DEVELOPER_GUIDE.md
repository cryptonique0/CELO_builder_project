# 🚀 Developer Integration Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Contract Interfaces](#contract-interfaces)
- [Web3 Integration](#web3-integration)
- [SDK Examples](#sdk-examples)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security Best Practices](#security-best-practices)

## Quick Start

### Prerequisites
```bash
npm install ethers@5.7.2
# or
yarn add ethers@5.7.2
```

### Basic Integration
```javascript
const { ethers } = require('ethers');

// Connect to Celo Mainnet
const provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');

// Contract addresses
const SIMPLEPAYMENTS_ADDRESS = '0x0B33158062bEBDFc1E6Fe2fA43a6cec943331402';
const ADVANCED_ADDRESS = '0xb690E08975b20e61904E7fae6127234F4Fe6FB65';
const MULTITOKEN_ADDRESS = '0x5d0F9219728cc9110577122875966254aaA9c75D';

// Initialize contract
const contract = new ethers.Contract(
  SIMPLEPAYMENTS_ADDRESS,
  CONTRACT_ABI,
  provider
);
```

## Contract Interfaces

### SimplePayments Contract

**Address (Mainnet):** `0x0B33158062bEBDFc1E6Fe2fA43a6cec943331402`

#### Read Functions
```solidity
function getPaymentCount() external view returns (uint256)
function getPayment(uint256 index) external view returns (address, uint256, string, uint256)
function getStats() external view returns (uint256, uint256, uint256, uint256, bool)
function getUserPayments(address user) external view returns (uint256[])
function balance() external view returns (uint256)
function owner() external view returns (address)
function paused() external view returns (bool)
```

#### Write Functions
```solidity
function payWithMemo(string memory memo) external payable
function withdraw(address payable to, uint256 amount) external
function withdrawAll() external
function pause() external
function unpause() external
```

#### Events
```solidity
event Paid(address indexed payer, uint256 amount, string memo, uint256 timestamp)
event Withdrawn(address indexed to, uint256 amount)
```

### AdvancedPayments Contract

**Address (Mainnet):** `0xb690E08975b20e61904E7fae6127234F4Fe6FB65`

#### Additional Features
```solidity
// Split payments
function splitPayment(
    address[] memory recipients,
    uint256[] memory amounts,
    string memory memo
) external payable

// Batch payments (equal distribution)
function batchPayment(
    address[] memory recipients,
    string memory memo
) external payable

// Payment requests
function createPaymentRequest(
    address recipient,
    uint256 amount,
    string memory description
) external returns (bytes32)

function fulfillPaymentRequest(bytes32 requestId) external payable
```

### MultiTokenPayments Contract

**Address (Mainnet):** `0x5d0F9219728cc9110577122875966254aaA9c75D`

#### Supported Tokens
- **CELO** (native)
- **cUSD:** `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **cEUR:** `0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73`
- **cREAL:** `0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787`

#### Token Payment Functions
```solidity
function payWithCELO(string memory memo) external payable
function payWithcUSD(uint256 amount, string memory memo) external
function payWithcEUR(uint256 amount, string memory memo) external
function payWithcREAL(uint256 amount, string memory memo) external
function payWithToken(address token, uint256 amount, string memory memo) external
```

## Web3 Integration

### Simple Payment Example
```javascript
const { ethers } = require('ethers');

async function sendPayment(amount, memo) {
    // Connect wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    
    // Initialize contract
    const contract = new ethers.Contract(
        SIMPLEPAYMENTS_ADDRESS,
        SIMPLEPAYMENTS_ABI,
        signer
    );
    
    // Send payment
    const tx = await contract.payWithMemo(memo, {
        value: ethers.utils.parseEther(amount)
    });
    
    console.log('Transaction hash:', tx.hash);
    await tx.wait();
    console.log('Payment confirmed!');
}

// Usage
sendPayment('0.001', 'Payment for services');
```

### Listen to Payment Events
```javascript
// Listen for new payments
contract.on('Paid', (payer, amount, memo, timestamp, event) => {
    console.log('New payment received!');
    console.log('Payer:', payer);
    console.log('Amount:', ethers.utils.formatEther(amount), 'CELO');
    console.log('Memo:', memo);
    console.log('Time:', new Date(timestamp.toNumber() * 1000));
});

// Get historical payments
const filter = contract.filters.Paid();
const events = await contract.queryFilter(filter, -10000); // Last 10k blocks

events.forEach(event => {
    console.log('Payment:', {
        payer: event.args.payer,
        amount: ethers.utils.formatEther(event.args.amount),
        memo: event.args.memo,
        timestamp: new Date(event.args.timestamp.toNumber() * 1000)
    });
});
```

### Split Payment Example
```javascript
async function sendSplitPayment(recipients, amounts, memo) {
    const contract = new ethers.Contract(
        ADVANCED_ADDRESS,
        ADVANCED_ABI,
        signer
    );
    
    const totalAmount = amounts.reduce((a, b) => a.add(b), ethers.BigNumber.from(0));
    
    const tx = await contract.splitPayment(
        recipients,
        amounts,
        memo,
        { value: totalAmount }
    );
    
    await tx.wait();
    console.log('Split payment sent to', recipients.length, 'recipients');
}

// Usage
sendSplitPayment(
    ['0xAddress1...', '0xAddress2...'],
    [ethers.utils.parseEther('0.001'), ethers.utils.parseEther('0.002')],
    'Team payment'
);
```

### Multi-Token Payment Example
```javascript
async function sendcUSDPayment(amount, memo) {
    const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';
    
    // Approve contract to spend cUSD
    const cUSD = new ethers.Contract(
        cUSD_ADDRESS,
        ['function approve(address spender, uint256 amount) external returns (bool)'],
        signer
    );
    
    await cUSD.approve(MULTITOKEN_ADDRESS, ethers.utils.parseEther(amount));
    
    // Send payment
    const contract = new ethers.Contract(
        MULTITOKEN_ADDRESS,
        MULTITOKEN_ABI,
        signer
    );
    
    const tx = await contract.payWithcUSD(ethers.utils.parseEther(amount), memo);
    await tx.wait();
    console.log('cUSD payment sent!');
}

// Usage
sendcUSDPayment('10', 'Payment in stable currency');
```

## SDK Examples

### React Integration
```jsx
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

function PaymentComponent() {
    const [contract, setContract] = useState(null);
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        async function init() {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(ADDRESS, ABI, signer);
                setContract(contract);
                
                const stats = await contract.getStats();
                setStats(stats);
            }
        }
        init();
    }, []);
    
    async function handlePayment() {
        const tx = await contract.payWithMemo('Payment from React', {
            value: ethers.utils.parseEther('0.001')
        });
        await tx.wait();
        alert('Payment successful!');
    }
    
    return (
        <div>
            <h2>Contract Stats</h2>
            <p>Total Received: {stats ? ethers.utils.formatEther(stats[1]) : '0'} CELO</p>
            <button onClick={handlePayment}>Send Payment</button>
        </div>
    );
}
```

### Node.js Backend Integration
```javascript
const { ethers } = require('ethers');

class CeloPaymentService {
    constructor(privateKey) {
        this.provider = new ethers.providers.JsonRpcProvider('https://forno.celo.org');
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(ADDRESS, ABI, this.wallet);
    }
    
    async sendPayment(amount, memo) {
        const tx = await this.contract.payWithMemo(memo, {
            value: ethers.utils.parseEther(amount)
        });
        return await tx.wait();
    }
    
    async getPaymentHistory(user) {
        const indices = await this.contract.getUserPayments(user);
        const payments = [];
        
        for (const index of indices) {
            const payment = await this.contract.getPayment(index);
            payments.push({
                payer: payment[0],
                amount: ethers.utils.formatEther(payment[1]),
                memo: payment[2],
                timestamp: new Date(payment[3].toNumber() * 1000)
            });
        }
        
        return payments;
    }
    
    async monitorPayments(callback) {
        this.contract.on('Paid', (payer, amount, memo, timestamp) => {
            callback({
                payer,
                amount: ethers.utils.formatEther(amount),
                memo,
                timestamp: new Date(timestamp.toNumber() * 1000)
            });
        });
    }
}

// Usage
const service = new CeloPaymentService(process.env.PRIVATE_KEY);

service.monitorPayments((payment) => {
    console.log('New payment:', payment);
    // Send webhook, update database, etc.
});
```

## API Reference

### Complete ABI
```javascript
const SIMPLEPAYMENTS_ABI = [
    "function payWithMemo(string memory memo) external payable",
    "function withdraw(address payable to, uint256 amount) external",
    "function withdrawAll() external",
    "function pause() external",
    "function unpause() external",
    "function balance() external view returns (uint256)",
    "function getStats() external view returns (uint256, uint256, uint256, uint256, bool)",
    "function getPaymentCount() external view returns (uint256)",
    "function getPayment(uint256 index) external view returns (address, uint256, string, uint256)",
    "function getUserPayments(address user) external view returns (uint256[])",
    "function owner() external view returns (address)",
    "function paused() external view returns (bool)",
    "event Paid(address indexed payer, uint256 amount, string memo, uint256 timestamp)",
    "event Withdrawn(address indexed to, uint256 amount)"
];
```

## Testing

### Hardhat Test Example
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimplePayments Integration", function () {
    it("Should accept payments", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const SimplePayments = await ethers.getContractFactory("SimplePayments");
        const contract = await SimplePayments.deploy();
        await contract.deployed();
        
        await expect(
            contract.connect(addr1).payWithMemo("Test", {
                value: ethers.utils.parseEther("0.001")
            })
        ).to.emit(contract, "Paid");
        
        expect(await contract.paymentCount()).to.equal(1);
    });
});
```

### Run Tests
```bash
cd celo-dapp
npm test
```

## Security Best Practices

### ✅ Do's
1. **Always validate input amounts**
   ```javascript
   if (amount <= 0) throw new Error('Invalid amount');
   ```

2. **Use try-catch for transactions**
   ```javascript
   try {
       const tx = await contract.payWithMemo(memo, { value });
       await tx.wait();
   } catch (error) {
       console.error('Transaction failed:', error);
   }
   ```

3. **Check network before transactions**
   ```javascript
   const network = await provider.getNetwork();
   if (network.chainId !== 42220) {
       throw new Error('Wrong network');
   }
   ```

4. **Verify contract addresses**
   ```javascript
   const CODE = await provider.getCode(CONTRACT_ADDRESS);
   if (CODE === '0x') throw new Error('Invalid contract');
   ```

### ❌ Don'ts
1. **Never expose private keys in frontend code**
2. **Don't trust user input without validation**
3. **Don't skip error handling**
4. **Don't hardcode gas limits (use estimation)**

### Gas Optimization
```javascript
// Estimate gas before sending
const gasEstimate = await contract.estimateGas.payWithMemo(memo, {
    value: ethers.utils.parseEther(amount)
});

const tx = await contract.payWithMemo(memo, {
    value: ethers.utils.parseEther(amount),
    gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
});
```

## Support

- **Documentation:** [GitHub README](https://github.com/cryptonique0/CELO_builder_project)
- **Issues:** [GitHub Issues](https://github.com/cryptonique0/CELO_builder_project/issues)
- **CeloScan:** 
  - [SimplePayments](https://celoscan.io/address/0x0B33158062bEBDFc1E6Fe2fA43a6cec943331402)
  - [AdvancedPayments](https://celoscan.io/address/0xb690E08975b20e61904E7fae6127234F4Fe6FB65)
  - [MultiTokenPayments](https://celoscan.io/address/0x5d0F9219728cc9110577122875966254aaA9c75D)

## License
MIT - See LICENSE file for details

---

**Built with ❤️ on Celo**
