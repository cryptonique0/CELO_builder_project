// Hardhat deployment script that writes deployed address to repository root.
// Usage: npx hardhat run scripts/deploy.js --network alfajores
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying SimplePayments with account:', deployer.address);

  const Factory = await hre.ethers.getContractFactory('SimplePayments');
  const contract = await Factory.deploy();
  await contract.deployed();

  console.log('SimplePayments deployed to:', contract.address);

  // write deployed address to repo root so workflows or frontend can pick it up
  try {
    const out = { network: hre.network.name, address: contract.address, deployer: deployer.address };
    const root = path.resolve(__dirname, '..'); // repo root relative to scripts/
    const filePath = path.join(root, 'deployed-address.json');
    fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
    console.log('Wrote deployed address to', filePath);
  } catch (err) {
    console.warn('Failed to write deployed address:', err && err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
