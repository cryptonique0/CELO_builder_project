# CELO_builder_project

🎯 **Enhanced Payment Contract on Celo Blockchain**

A production-ready Solidity smart contract with full frontend integration for accepting payments, tracking history, and managing withdrawals on the Celo network.

## ✨ Features

- **Smart Contract (SimplePayments.sol)**
  - Accept native CELO payments with optional memos
  - Payment history tracking with timestamps
  - Multi-recipient batch withdrawals
  - Emergency pause/unpause functionality
  - Owner access controls
  - Comprehensive statistics and query functions

- **Modern Frontend**
  - MetaMask/Web3 wallet integration
  - Real-time contract interaction
  - Live stats dashboard
  - Beautiful gradient UI
  - Mobile responsive design

- **CI/CD Automation**
  - GitHub Actions for deployment
  - Automated contract verification on CeloScan
  - GitHub Pages deployment for frontend

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- Celo Alfajores testnet CELO (from [faucet](https://faucet.celo.org))
- CeloScan API key (from [celoscan.io](https://celoscan.io/myapikey))

### Local Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/cryptonique0/CELO_builder_project.git
   cd CELO_builder_project/celo-dapp
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your keys:
   # CELO_RPC=https://alfajores-forno.celo-testnet.org
   # PRIVATE_KEY=0x...
   # CELOSCAN_API_KEY=...
   ```

3. **Deploy and verify contract**
   ```bash
   npm run deploy:verify:alfajores
   ```
   This will:
   - Deploy SimplePayments to Alfajores
   - Write `deployed-address.json` to repo root
   - Verify the contract on CeloScan

4. **Interact with contract**
   ```bash
   # Send a payment
   PAY_AMOUNT=0.002 MEMO="hello celo" npm run interact:pay
   
   # Send another payment
   PAY_AMOUNT=0.005 MEMO="second payment" npm run interact:pay
   ```

5. **Test frontend locally**
   ```bash
   cd frontend
   python3 -m http.server 8000
   # Open http://localhost:8000 in browser with MetaMask
   ```

## 📊 Activity Metrics Guide

### Verified Contracts Usage (0.0% → Target: High)
1. Deploy and verify your contract:
   ```bash
   cd celo-dapp
   npm run deploy:verify:alfajores
   ```
2. Generate on-chain usage:
   ```bash
   # Send multiple payments with different memos
   PAY_AMOUNT=0.001 MEMO="tx-1" npm run interact:pay
   PAY_AMOUNT=0.002 MEMO="tx-2" npm run interact:pay
   PAY_AMOUNT=0.003 MEMO="tx-3" npm run interact:pay
   ```
3. View your verified contract on [Alfajores CeloScan](https://alfajores.celoscan.io)

### Proof Of Ship (0.0% → Target: Complete)
1. **Update frontend with your deployed address**
   - Edit `celo-dapp/frontend/index.html`
   - Replace `CONTRACT_ADDR` with your address from `deployed-address.json`
   - Commit and push

2. **Enable GitHub Pages**
   - Go to: Settings → Pages → Source: "GitHub Actions"
   - Frontend will auto-deploy on push to main

3. **Add proof to README**
   - Paste 2-3 transaction URLs from CeloScan
   - Add screenshot or Loom video showing usage
   - Tag release as v1.0.0

### Celo Network (1.5% → Target: Higher)
- Fund 2+ test wallets from [Celo Faucet](https://faucet.celo.org)
- Generate diverse transactions:
  - Payments with memos from multiple addresses
  - Owner withdrawals
  - Pause/unpause operations
  - Batch withdrawals

### Public GitHub Contributions (6.0% → Target: Higher)
- Maintain daily commit cadence
- Create/close issues for roadmap items
- Open PRs for features
- Cut releases (v0.1.0, v1.0.0)
- Contribute to other Celo repos (docs, examples)

## 🔧 GitHub Actions Setup

### Required Secrets

Add these in: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Where to Get |
|------------|-------|--------------|
| `CELO_RPC` | `https://alfajores-forno.celo-testnet.org` | Public endpoint |
| `PRIVATE_KEY` | `0x...` | Your test wallet (fund via faucet) |
| `CELOSCAN_API_KEY` | `YOUR_KEY` | [celoscan.io/myapikey](https://celoscan.io/myapikey) |

### Available Workflows

1. **Deploy and Verify (Alfajores)**
   - Manual trigger: Actions → Deploy and Verify → Run workflow
   - Deploys contract and verifies on CeloScan
   - Uploads `deployed-address.json` artifact

2. **Deploy Frontend to GitHub Pages**
   - Auto-triggers on push to `main` when frontend changes
   - Publishes to GitHub Pages
   - Your live URL: `https://cryptonique0.github.io/CELO_builder_project/`

## 📦 Available Scripts

```bash
# In celo-dapp/

# Compile contract
npm run compile

# Run tests
npm test

# Deploy to Alfajores
npm run deploy:alfajores

# Verify on CeloScan
npm run verify:alfajores

# Deploy + Verify (one command)
npm run deploy:verify:alfajores

# Send test payment
PAY_AMOUNT=0.001 MEMO="test" npm run interact:pay
```

## 📁 Project Structure

```
CELO_builder_project/
├── celo-dapp/
│   ├── contracts/
│   │   └── SimplePayments.sol     # Enhanced payment contract
│   ├── scripts/
│   │   ├── deploy.js              # Deployment script
│   │   ├── verify.js              # CeloScan verification
│   │   └── interact.js            # Interaction examples
│   ├── test/
│   │   └── simplepayments-test.js # Contract tests
│   ├── frontend/
│   │   └── index.html             # Web3 frontend
│   ├── hardhat.config.js          # Hardhat + CeloScan config
│   ├── package.json
│   └── .env.example
├── .github/
│   └── workflows/
│       ├── deploy-alfajores.yml   # Deploy automation
│       └── pages.yml              # GitHub Pages
├── deployed-address.json          # Deployment record
└── README.md
```

## 🔗 Useful Links

- **Celo Alfajores Faucet**: https://faucet.celo.org
- **Alfajores Explorer**: https://alfajores.celoscan.io
- **CeloScan API Keys**: https://celoscan.io/myapikey
- **Celo Docs**: https://docs.celo.org
- **Celo Forum**: https://forum.celo.org

## 🎯 Next Steps After Deployment

1. ✅ Update `frontend/index.html` with your deployed contract address
2. ✅ Push to GitHub to trigger Pages deployment
3. ✅ Generate 10+ transactions using `interact:pay`
4. ✅ Add transaction URLs to README as proof
5. ✅ Create GitHub release (v1.0.0)
6. ✅ Share live demo link on Celo Forum/Discord
7. ✅ Record a short Loom walkthrough

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Built for Celo Builder Rewards** 🚀
