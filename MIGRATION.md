# Celo → Base Migration Guide

This document details the complete migration of the dApp scaffold from Celo (Alfajores testnet) to Base (Sepolia testnet & mainnet).

## Summary of Changes

### 1. **Smart Contracts**
- ✅ [contracts/SimplePayments.sol](contracts/SimplePayments.sol)
  - Updated contract comment: Celo → Base
  - No contract logic changes (already EVM-compatible)
  - Native ETH payments work identically

### 2. **Hardhat Configuration**
- ✅ [hardhat.config.js](hardhat.config.js)
  - **Removed:** `alfajores` network (Celo testnet)
  - **Added:** `base-sepolia` network (Base testnet, chain ID 84532)
  - **Added:** `base` network (Base mainnet, chain ID 8453)
  - Updated RPC environment variable: `CELO_RPC` → `BASE_RPC`
  - Defaults to Base Sepolia RPC: `https://sepolia.base.org`

### 3. **Deployment Scripts**
- ✅ [scripts/deploy.js](scripts/deploy.js)
  - Updated usage comment: `--network alfajores` → `--network base-sepolia`
  - Added BaseScan explorer URL mapping for both testnet & mainnet
  - Enhanced logging with network info and explorer links
  - Added timestamp to deployment output (`deployed-address.json`)
  - Improved error messages and formatting

### 4. **Tests**
- ✅ [test/simplepayments-test.js](test/simplepayments-test.js)
  - Fixed balance assertions (BigNumber comparison)
  - Changed from reading provider balance to contract's `balance()` method
  - Tests remain chain-agnostic and work on any EVM network
  - All tests passing ✓

### 5. **Frontend**
- ✅ [frontend/index.html](frontend/index.html)
  - Updated title: "Celo SimplePayments" → "Base SimplePayments"
  - Updated description: Mentions Base instead of Celo, MetaMask instead of Celo Extension
  - Changed currency labels: "CELO" → "ETH"
  - Changed variable names: `inCelo` → `inEth`
  - Wallet selection now supports any EVM wallet (MetaMask, WalletConnect, etc.)
  - ABI and contract logic remain unchanged

### 6. **GitHub Actions CI/CD**

#### Deploy Workflow
- ✅ Renamed: `.github/workflows/deploy-alfajores.yml` → `.github/workflows/deploy-base-sepolia.yml`
- ✅ Updated name: "Deploy to Alfajores" → "Deploy to Base Sepolia"
- ✅ Removed hardcoded directory `celo-dapp` (now works at repo root)
- ✅ Changed environment variable: `CELO_RPC` removed (uses hardhat.config.js default)
- ✅ Updated network: `--network alfajores` → `--network base-sepolia`
- ✅ Updated commit message: `(alfajores)` → `(base-sepolia)`

#### Pages Workflow
- ✅ [.github/workflows/pages.yml](.github/workflows/pages.yml)
  - Fixed hardcoded path references (was looking for non-existent `celo-dapp` directory)
  - Now correctly publishes `frontend/` to GitHub Pages
  - Simplified install step

### 7. **Package Configuration**
- ✅ [package.json](package.json)
  - Updated `name`: "celo-dapp" → "base-dapp"
  - Updated `description`: Celo → Base
  - Updated npm script: `deploy:alfajores` → `deploy:base-sepolia`
  - **Removed dependency:** `@celo/contractkit` (not needed for Base)
  - **Added dependencies:**
    - `dotenv@^16.0.0` (for environment variable loading)
    - `chai@^4.3.7` (for testing)

### 8. **Documentation**
- ✅ [README.md](README.md)
  - Complete rewrite as "Base Builder – Minimal dApp Scaffold"
  - Added quick start guide
  - Updated project structure documentation
  - Added Base network details (chain IDs, RPCs)
  - Updated deployment instructions for both testnet & mainnet
  - Added CI/GitHub Actions documentation
  - Added links to Base docs, explorers, and faucets
  - Included customization ideas for builders

### 9. **Environment Configuration**
- ✅ [.env.example](.env.example) (new file)
  - Template for developers to configure local deployments
  - Documents `BASE_RPC` and `PRIVATE_KEY` variables
  - Includes safety warnings about testnet-only keys

## Network Details

| Network | Chain ID | RPC Endpoint | Explorer |
|---------|----------|--------------|----------|
| Base Sepolia (Testnet) | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |
| Base Mainnet | 8453 | https://mainnet.base.org | https://basescan.org |

## Deployment Instructions

### Local Deployment (Testnet)
```bash
npm install
npx hardhat compile
npx hardhat test

# Deploy to Base Sepolia
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base-sepolia
```

### GitHub Actions (Testnet)
1. Add `PRIVATE_KEY` as a repository secret (Settings → Secrets and variables → Actions)
2. Push to `main` branch
3. Workflow automatically compiles, tests, and deploys to Base Sepolia

### Production (Mainnet - Manual Only)
```bash
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network base
```

⚠️ **Security:** Never use mainnet private keys in CI. Always use a testnet account.

## Verification

All components tested and verified:
- ✅ Contracts compile without errors
- ✅ Tests pass (SimplePayments test suite)
- ✅ Deployment script produces proper output
- ✅ Frontend compatible with MetaMask on Base
- ✅ GitHub Actions workflows properly configured
- ✅ Documentation complete and accurate

## Files Changed

```
Modified:
  - .github/workflows/pages.yml
  - .github/workflows/deploy-alfajores.yml (→ deploy-base-sepolia.yml)
  - contracts/SimplePayments.sol
  - frontend/index.html
  - hardhat.config.js
  - package.json
  - scripts/deploy.js
  - test/simplepayments-test.js
  - README.md

Created:
  - .env.example
  - MIGRATION.md (this file)

Unchanged (EVM-compatible):
  - LICENSE
  - .gitignore
```

## Next Steps for Users

1. **Clone & Setup:**
   ```bash
   git clone <your-repo>
   cd <repo>
   npm install
   cp .env.example .env
   # Edit .env with your settings
   ```

2. **Test Locally:**
   ```bash
   npx hardhat test
   ```

3. **Deploy to Base Sepolia:**
   ```bash
   npx hardhat run scripts/deploy.js --network base-sepolia
   ```

4. **Connect Frontend:**
   - Open `frontend/index.html` in browser
   - Paste deployed contract address
   - Use MetaMask connected to Base Sepolia

5. **Deploy to GitHub:**
   - Add `PRIVATE_KEY` secret to repository
   - Push to `main` branch
   - CI automatically compiles, tests, and deploys

## Customization Ideas

- Implement additional payment methods (USDC, etc.)
- Add contract verification to deployment script
- Integrate with Alchemy or Infura for RPC redundancy
- Create a Next.js/React frontend wrapper
- Add gas optimization profiling
- Implement multichain deployment support

## Resources

- **Base Documentation:** https://docs.base.org/
- **Base Sepolia Faucet:** https://coinbase.com/faucets/base-ethereum-sepolia-faucet
- **BaseScan Testnet Explorer:** https://sepolia.basescan.org/
- **BaseScan Mainnet Explorer:** https://basescan.org/
- **Hardhat Docs:** https://hardhat.org/docs
- **ethers.js Docs:** https://docs.ethers.org/

---

**Migration completed:** January 3, 2026
**Status:** ✅ Production-ready
