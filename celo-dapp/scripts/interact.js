// Simple script to interact with SimplePayments to generate on-chain activity
// Usage examples:
//   PAY_AMOUNT=0.001 MEMO="Hello Celo" npx hardhat run scripts/interact.js --network alfajores
require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const outPath = path.resolve(__dirname, "../../deployed-address.json");
  const out = JSON.parse(fs.readFileSync(outPath, "utf8"));
  const address = out.address;
  if (!address) throw new Error("Contract address not found. Deploy first.");

  const payAmount = process.env.PAY_AMOUNT || "0.001"; // in CELO
  const memo = process.env.MEMO || `auto-payment-${Date.now()}`;

  const [signer] = await hre.ethers.getSigners();
  console.log("Using signer:", await signer.getAddress());

  const contract = await hre.ethers.getContractAt("SimplePayments", address, signer);

  console.log(`Sending ${payAmount} CELO with memo '${memo}' to ${address} ...`);
  const tx = await contract.payWithMemo(memo, {
    value: hre.ethers.utils.parseEther(payAmount.toString()),
  });
  console.log("Tx sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed in block:", receipt.blockNumber);

  const stats = await contract.getStats();
  console.log("Stats:", {
    balance: hre.ethers.utils.formatEther(stats[0]),
    totalReceived: hre.ethers.utils.formatEther(stats[1]),
    totalWithdrawn: hre.ethers.utils.formatEther(stats[2]),
    paymentCount: stats[3].toString(),
    paused: stats[4],
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
