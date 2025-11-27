// Verify the deployed SimplePayments contract on CeloScan
// Usage: npx hardhat run scripts/verify.js --network alfajores
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const outPath = path.resolve(__dirname, "../../deployed-address.json");
  if (!fs.existsSync(outPath)) {
    throw new Error(`deployed-address.json not found at ${outPath}. Deploy first.`);
  }
  const { address } = JSON.parse(fs.readFileSync(outPath, "utf8"));
  if (!address) throw new Error("No address in deployed-address.json");

  console.log(`Verifying SimplePayments at ${address} on ${hre.network.name}...`);

  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("Verification submitted to explorer.");
  } catch (err) {
    if ((err.message || "").includes("Already Verified")) {
      console.log("Contract is already verified.");
    } else {
      console.error("Verification failed:", err.message || err);
      process.exitCode = 1;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
