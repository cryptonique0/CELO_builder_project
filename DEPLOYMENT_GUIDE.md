# DEPLOYMENT_GUIDE.md

## 🚀 Complete Deployment & Verification Guide

### Step 1: Prepare Your Environment

1. **Get test CELO tokens**
   - Visit: https://faucet.celo.org
   - Select "Alfajores Testnet"
   - Enter your wallet address
   - Click "Get Started" to receive test CELO

2. **Get CeloScan API Key**
   - Visit: https://celoscan.io/myapikey
   - Sign up/login
   - Create new API key
   - Copy the key (works for both mainnet and Alfajores)

3. **Configure local environment**
   ```bash
   cd celo-dapp
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   CELO_RPC=https://alfajores-forno.celo-testnet.org
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   CELOSCAN_API_KEY=YOUR_CELOSCAN_KEY_HERE
   ```

### Step 2: Deploy and Verify Contract

```bash
# Install dependencies (if not done)
npm install

# Deploy and verify in one command
npm run deploy:verify:alfajores
```

This will:
- Deploy `SimplePayments.sol` to Alfajores
- Save address to `deployed-address.json`
- Automatically verify on CeloScan
- Display the contract address

**Expected Output:**
```
Deploying SimplePayments with account: 0x...
SimplePayments deployed to: 0xABCDEF...
Wrote deployed-address.json to /path/to/repo/deployed-address.json
Verifying SimplePayments at 0xABCDEF... on alfajores...
Verification submitted to explorer.
```

### Step 3: Update Frontend

Open `celo-dapp/frontend/index.html` and replace line 224:
```javascript
let CONTRACT_ADDR = '0xd42db19569aBA76023A75A512aa22Ea12B4eAa77'; // OLD
```

With your deployed address:
```javascript
let CONTRACT_ADDR = '0xYOUR_DEPLOYED_ADDRESS'; // NEW
```

### Step 4: Generate On-Chain Activity

Run multiple transactions to boost your metrics:

```bash
# Send different payment amounts with unique memos
PAY_AMOUNT=0.001 MEMO="first-transaction" npm run interact:pay
PAY_AMOUNT=0.002 MEMO="second-transaction" npm run interact:pay
PAY_AMOUNT=0.003 MEMO="testing-contract" npm run interact:pay
PAY_AMOUNT=0.005 MEMO="demo-payment" npm run interact:pay
PAY_AMOUNT=0.001 MEMO="final-test" npm run interact:pay

# Repeat with variations (10+ transactions recommended)
```

**Each transaction:**
- Increases "Verified Contracts Usage" 
- Adds to "Celo Network" activity
- Creates events visible on CeloScan

### Step 5: Set Up GitHub Actions

1. **Go to your repo settings**
   - Navigate to: https://github.com/cryptonique0/CELO_builder_project/settings/secrets/actions

2. **Add three secrets:**
   
   | Name | Value |
   |------|-------|
   | `CELO_RPC` | `https://alfajores-forno.celo-testnet.org` |
   | `PRIVATE_KEY` | Your wallet private key (starts with 0x) |
   | `CELOSCAN_API_KEY` | Your CeloScan API key |

3. **Enable GitHub Pages**
   - Go to: Settings → Pages
   - Source: "GitHub Actions"
   - Save

4. **Trigger workflows**
   - Go to: Actions tab
   - Select "Deploy and Verify (Alfajores)"
   - Click "Run workflow"
   - Select "Deploy Frontend to GitHub Pages" after frontend update

### Step 6: Verify Everything Works

1. **Check your contract on CeloScan**
   ```
   https://alfajores.celoscan.io/address/YOUR_CONTRACT_ADDRESS
   ```
   - Verify "Contract" tab shows verified source code ✅
   - Check "Events" tab for Paid events ✅
   - Review "Read Contract" and "Write Contract" tabs ✅

2. **Test frontend**
   - Local: http://localhost:8000
   - Live: https://cryptonique0.github.io/CELO_builder_project/
   - Connect MetaMask
   - Send test payment
   - Check stats update

3. **Verify transactions**
   - Each transaction should appear on CeloScan
   - Events should show correct amounts and memos
   - Contract balance should increase

### Step 7: Add Proof to README

Update your README with:

```markdown
## 📺 Live Demo

- **Frontend**: https://cryptonique0.github.io/CELO_builder_project/
- **Contract**: https://alfajores.celoscan.io/address/0xYOUR_ADDRESS
- **Video Walkthrough**: [Add Loom link]

## 🎯 Activity Proof

Recent transactions:
- Payment 1: https://alfajores.celoscan.io/tx/0xTX_HASH_1
- Payment 2: https://alfajores.celoscan.io/tx/0xTX_HASH_2
- Payment 3: https://alfajores.celoscan.io/tx/0xTX_HASH_3

Stats as of [DATE]:
- Total Payments Received: 15
- Total Value: 0.05 CELO
- Unique Users: 3
- Verified on CeloScan: ✅
```

### Step 8: Boost Metrics Further

**Verified Contracts Usage (Goal: High)**
- ✅ Deploy and verify contract
- ✅ Generate 10+ transactions
- ✅ Use from 2-3 different wallets
- ✅ Call multiple functions (pay, withdraw, pause)

**Proof Of Ship (Goal: Complete)**
- ✅ Live demo URL working
- ✅ Contract verified and visible
- ✅ Transaction history on explorer
- ✅ Screenshots or video
- ✅ Tagged release (v1.0.0)

**Celo Network (Goal: Higher)**
- ✅ Multiple transactions daily
- ✅ Diverse function calls
- ✅ Multiple user addresses interacting

**Public GitHub Contributions (Goal: Higher)**
- ✅ Daily commits
- ✅ Open/close issues
- ✅ Create releases
- ✅ Update documentation
- ✅ Share on Celo Forum/Discord

### Troubleshooting

**"Insufficient funds" error**
- Get more test CELO from faucet
- Check wallet has at least 0.1 CELO for gas

**"Contract not verified" on CeloScan**
- Wait 1-2 minutes after deployment
- Re-run: `npm run verify:alfajores`
- Check CELOSCAN_API_KEY is correct

**Frontend can't connect**
- Ensure MetaMask is on Alfajores (Chain ID: 44787)
- Add network manually if needed:
  - Network Name: Celo Alfajores Testnet
  - RPC: https://alfajores-forno.celo-testnet.org
  - Chain ID: 44787
  - Currency: CELO
  - Explorer: https://alfajores.celoscan.io

**GitHub Actions failing**
- Verify all three secrets are added correctly
- Check secrets don't have extra spaces
- Ensure PRIVATE_KEY starts with 0x
- Confirm wallet has sufficient CELO

### Quick Commands Reference

```bash
# Deploy to Alfajores
npm run deploy:alfajores

# Verify on CeloScan
npm run verify:alfajores

# Deploy + Verify (combined)
npm run deploy:verify:alfajores

# Send test payment
PAY_AMOUNT=0.001 MEMO="test" npm run interact:pay

# Start local frontend
cd frontend && python3 -m http.server 8000

# Compile contract
npm run compile

# Run tests
npm test
```

### What's Next?

1. ✅ Keep generating transactions (aim for 20-30 total)
2. ✅ Create GitHub release v1.0.0
3. ✅ Record Loom walkthrough (3-5 minutes)
4. ✅ Share on Celo Discord/Forum
5. ✅ Document learnings in blog post
6. ✅ Monitor metrics daily

---

**Need Help?**
- Celo Discord: https://discord.gg/celo
- Celo Forum: https://forum.celo.org
- GitHub Issues: Open an issue in this repo
