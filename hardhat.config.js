require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

// NOTE: Private key removed for security
// Deploy using: npx hardhat run scripts/deploy.js --network <network-name>
// You will need to add your private key when deploying

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.0" }],
  },
  networks: {
    // Base Sepolia Testnet
    // To deploy: npx hardhat run scripts/deploy.js --network base-sepolia
    'base-sepolia': {
      url: "https://sepolia.base.org",
      accounts: [], // Add your private key here when deploying
      chainId: 84532,
    },
    // Base Mainnet
    // To deploy: npx hardhat run scripts/deploy.js --network base
    'base': {
      url: "https://mainnet.base.org",
      accounts: [], // Add your private key here when deploying
      chainId: 8453,
    },
  },
};
