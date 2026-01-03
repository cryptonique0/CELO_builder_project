// Hardhat deployment script that writes deployed address to repository root.
// Usage: npx hardhat run scripts/deploy.js --network base-sepolia
// Or: npx hardhat run scripts/deploy.js --network base
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

// BaseScan explorer URLs for different networks
const BASESCAN_URLS = {
  'base-sepolia': 'https://sepolia.basescan.org',
  'base': 'https://basescan.org',
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('\n=== SimplePayments Deployment (Base) ===');
  console.log('Network:', hre.network.name);
  console.log('Deployer:', deployer.address);
  console.log('');

  const Factory = await hre.ethers.getContractFactory('SimplePayments');
  const contract = await Factory.deploy();
  await contract.deployed();

  console.log('✓ SimplePayments deployed to:', contract.address);

  const basescanUrl = BASESCAN_URLS[hre.network.name];
  if (basescanUrl) {
    console.log(`📖 View on BaseScan: ${basescanUrl}/address/${contract.address}`);
  }
  console.log('');

  // write deployed address to repo root so workflows or frontend can pick it up
  try {
    const out = {
      network: hre.network.name,
      address: contract.address,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
    };
    const root = path.resolve(__dirname, '..');
    const filePath = path.join(root, 'deployed-address.json');
    fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
    console.log('✓ Deployment info saved to deployed-address.json');
  } catch (err) {
    console.warn('⚠ Failed to write deployed address:', err && err.message);
  }

  console.log('\n=== Deployment Complete ===\n');
}

main().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exitCode = 1;
});
