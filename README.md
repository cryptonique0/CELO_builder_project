# Base Builder – Minimal dApp Scaffold

A clean, production-ready **Base dApp starter** for hackathons, builder contests, and rapid MVPs. This scaffold provides everything needed to deploy smart contracts and interact with them via a minimal web frontend, all optimized for the Base blockchain.

## Features

- **SimplePayments.sol** — Battle-tested contract for native ETH payments with owner-controlled withdrawals
- **Hardhat** — Professional Solidity development environment with testing and deployment
- **EVM-Compatible** — Works seamlessly on Base and other EVM chains
- **GitHub Actions CI** — Automatic compilation, testing, and deployment to Base mainnet
- **Minimal Frontend** — Pure HTML/ethers.js demo (no frameworks, easy to customize)
- **Production-Ready** — Configured for Base mainnet with testnet available for testing

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (local hardhat network)
npx hardhat test

# Deploy to Base mainnet (production)
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base
# Or use the npm script:
npm run deploy:base

# Deploy to Base Sepolia testnet (for testing)
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base-sepolia
```

## Project Structure

```
├── contracts/
│   └── SimplePayments.sol      # Core payment contract (EVM-compatible)
├── scripts/
│   └── deploy.js               # Deployment script with BaseScan logging
├── test/
│   └── simplepayments-test.js  # Hardhat tests using ethers.js + Chai
├── frontend/
│   └── index.html              # Minimal web3 UI (ethers.js + MetaMask)
├── .github/workflows/
│   ├── deploy-base-mainnet.yml # CI: Compile, test, deploy to Base mainnet
│   └── pages.yml               # Deploy frontend to GitHub Pages
├── hardhat.config.js           # Hardhat config for Base networks
└── package.json                # Dependencies and scripts
```

## Smart Contract (SimplePayments)

A minimal contract that:
1. Accepts native ETH payments via `receive()` and `fallback()`
2. Tracks owner (deployer)
3. Allows owner to withdraw ETH to any address
4. Emits `Paid` and `Withdraw` events

**Key functions:**
- `receive() payable` — Accept payments
- `withdraw(address to, uint256 amount)` — Owner withdrawal
- `balance()` — View contract balance
- `owner` — View current owner

## Deployment

### Networks Configured

- **Base Mainnet (Production)** — Chain ID `8453`, RPC: https://mainnet.base.org
- **Base Sepolia (Testnet)** — Chain ID `84532`, RPC: https://sepolia.base.org

### Deploy Locally

```bash
# Base Mainnet (production)
npx hardhat run scripts/deploy.js --network base
# Or use:
npm run deploy:base

# Base Sepolia (for testing only)
npx hardhat run scripts/deploy.js --network base-sepolia
```

The script outputs:
- Deployed contract address
- BaseScan explorer link (automatically generated)
- Saves address to `deployed-address.json` for frontend integration

### Deploy via GitHub Actions (CI)

To enable automatic deployments to Base mainnet:

1. Go to **Settings → Secrets and variables → Actions**
2. Add secret: `PRIVATE_KEY=0x...` (secure mainnet deployer key)
3. Push to `main` branch or trigger workflow manually
4. Workflow runs and deploys to Base mainnet

⚠️ **IMPORTANT SECURITY:**
- Use a dedicated deployment wallet with minimal funds
- Never commit private keys to the repository
- Consider using a hardware wallet or secure key management service for production
- Test on Base Sepolia first before mainnet deployment

## Switching Between Testnet & Mainnet

### Quick Switch

**Deploy to Base Sepolia (Testnet):**
```bash
# Using npm script
PRIVATE_KEY=0x... npm run deploy:base-sepolia

# Or direct Hardhat command
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base-sepolia
```

**Deploy to Base Mainnet (Production):**
```bash
# Using npm script (primary)
PRIVATE_KEY=0x... npm run deploy:base

# Or direct Hardhat command
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base
```

### Frontend Configuration

To switch your frontend between networks:

1. **MetaMask Network Selection:**
   - Testnet: Switch MetaMask to "Base Sepolia" (Chain ID: 84532)
   - Mainnet: Switch MetaMask to "Base" (Chain ID: 8453)

2. **Contract Address:**
   - Update the contract address in `frontend/index.html` after deployment
   - Each network has its own deployed contract address

3. **Testing Flow:**
   ```bash
   # 1. Get testnet ETH
   # Visit: https://coinbase.com/faucets/base-ethereum-sepolia-faucet
   
   # 2. Deploy to testnet
   PRIVATE_KEY=0x... npm run deploy:base-sepolia
   
   # 3. Test your contract on testnet
   # Switch MetaMask to Base Sepolia
   # Update frontend with contract address
   # Test all functionality
   
   # 4. When ready, deploy to mainnet
   PRIVATE_KEY=0x... npm run deploy:base
   
   # 5. Update frontend with mainnet contract address
   # Switch MetaMask to Base mainnet
   ```

### Network Information

| Aspect | Base Sepolia (Testnet) | Base Mainnet |
|--------|------------------------|--------------|
| Chain ID | 84532 | 8453 |
| RPC Endpoint | https://sepolia.base.org | https://mainnet.base.org |
| Explorer | https://sepolia.basescan.org | https://basescan.org |
| Currency | Testnet ETH | Real ETH |
| Faucet | [Coinbase Faucet](https://coinbase.com/faucets/base-ethereum-sepolia-faucet) | N/A (use bridge) |
| Bridge | N/A | [Base Bridge](https://bridge.base.org) |
| Gas Costs | Free/minimal | Real costs |

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# For testnet deployment
BASE_RPC=https://sepolia.base.org
PRIVATE_KEY=0x...  # testnet deployer key

# For mainnet deployment
BASE_RPC=https://mainnet.base.org
PRIVATE_KEY=0x...  # mainnet deployer key
```

### CI/CD Pipeline

The GitHub Actions workflow (`test-compile.yml`) automatically:
- ✅ Compiles contracts on every push
- ✅ Runs tests on every push
- ❌ Does **not** deploy automatically

You deploy manually using the commands above.

### Deployment Checklist

**Before Testnet Deployment:**
- [ ] Get testnet ETH from faucet
- [ ] Review contract code
- [ ] Run local tests: `npm test`
- [ ] Set `PRIVATE_KEY` environment variable

**Before Mainnet Deployment:**
- [ ] Test thoroughly on Base Sepolia
- [ ] Verify contract behavior
- [ ] Bridge real ETH to Base
- [ ] Double-check contract addresses and configurations
- [ ] Use a secure deployment wallet with minimal funds
- [ ] Consider contract verification on BaseScan



Located in `frontend/index.html`, a standalone HTML demo that:
- Connects to MetaMask or any EVM wallet
- Sends native ETH payments to contract
- Checks contract balance
- Allows owner to withdraw funds
- Works on Base mainnet and Sepolia testnet

**To use with your deployed contract:**
1. Ensure MetaMask is connected to Base mainnet (Chain ID: 8453)
2. Open `frontend/index.html` in a browser
3. Paste the deployed contract address
4. Interact with the contract

**For testing:** Switch MetaMask to Base Sepolia testnet first

## CI / GitHub Actions

One workflow included:

### `test-compile.yml`
Runs on every push to `main` and pull requests:
1. Checkout code
2. Install dependencies
3. Compile Solidity contracts
4. Run tests

**Note:** This workflow does not deploy automatically. You deploy manually using the commands in the "Deployment" section.

### `pages.yml`
Publishes `frontend/` to GitHub Pages on successful push to `main`.

## Links & Resources

- **Base Docs** — https://docs.base.org/
- **Base Mainnet Explorer** — https://basescan.org/
- **Base Sepolia Testnet Explorer** — https://sepolia.basescan.org/
- **Hardhat Docs** — https://hardhat.org/docs
- **ethers.js Docs** — https://docs.ethers.org/
- **Bridge to Base** — https://bridge.base.org/ (for ETH)
- **Testnet Faucet** — https://coinbase.com/faucets/base-ethereum-sepolia-faucet (for testing)

## Customization Ideas

- Replace `SimplePayments` with your own contract logic
- Add [wagmi](https://wagmi.sh/) or [Web3Modal](https://web3modal.com/) to frontend
- Integrate with [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) for additional RPC redundancy
- Add contract verification step to deployment script
- Extend tests with gas profiling or fuzzing

## License

ISC

## Contributing

This is a minimal scaffold designed for rapid development. Suggestions and PRs welcome!
