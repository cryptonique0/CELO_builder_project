#!/bin/bash

# 🚀 Quick Setup Script for Celo Builder Rewards
# This script helps you set up and test your deployment

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Celo SimplePayments - Quick Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Your wallet info
WALLET_ADDRESS="0x88caA52f0a22698f3d47704361Dc0d0cC0295AF5"
CONTRACT_ADDRESS="0x0B33158062bEBDFc1E6Fe2fA43a6cec943331402"

echo "📋 Your Test Wallet:"
echo "   Address: $WALLET_ADDRESS"
echo ""
echo "📋 Your Contract:"
echo "   Address: $CONTRACT_ADDRESS"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "   ⚠️  Please edit .env and add your CELOSCAN_API_KEY"
    exit 1
fi

# Check if funded
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Check Wallet Funding"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  MAINNET - Real CELO Required!"
echo "   Purchase CELO and send to: $WALLET_ADDRESS"
echo ""
echo "   Your address: $WALLET_ADDRESS"
echo ""
echo "   Check balance: https://celoscan.io/address/$WALLET_ADDRESS"
echo ""
read -p "Press Enter once you've funded your wallet..."

# Verify contract
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Verify Contract (if not already done)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Do you want to verify the contract? (y/N): " verify
if [[ $verify == "y" || $verify == "Y" ]]; then
    echo "Verifying contract..."
    npm run verify:celo
fi

# Generate transactions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Generate Test Transactions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "How many transactions do you want to generate? (1-20): " num_tx

if [ -z "$num_tx" ]; then
    num_tx=10
fi

echo ""
echo "Generating $num_tx transactions..."
echo ""

for i in $(seq 1 $num_tx); do
    amount=$(echo "scale=4; 0.001 + ($i % 5) * 0.001" | bc)
    memo="Transaction #$i - Celo Builder Rewards - $(date +%H:%M:%S)"
    
    echo "[$i/$num_tx] Sending $amount CELO with memo: $memo"
    PAY_AMOUNT=$amount MEMO="$memo" npm run interact:pay
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Transaction sent successfully"
    else
        echo "   ❌ Transaction failed"
    fi
    
    # Small delay between transactions
    sleep 2
    echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Next Steps:"
echo ""
echo "1. View your transactions:"
echo "   https://celoscan.io/address/$WALLET_ADDRESS"
echo ""
echo "2. View your contract:"
echo "   https://celoscan.io/address/$CONTRACT_ADDRESS"
echo ""
echo "3. Test the frontend:"
echo "   cd frontend && python3 -m http.server 8000"
echo "   Then open: http://localhost:8000"
echo ""
echo "4. Create GitHub release:"
echo "   git tag -a v1.0.0 -m 'Release v1.0.0'"
echo "   git push origin v1.0.0"
echo ""
echo "5. View live site:"
echo "   https://cryptonique0.github.io/CELO_builder_project/"
echo ""
echo "🎉 Keep generating transactions daily to boost your metrics!"
echo ""
