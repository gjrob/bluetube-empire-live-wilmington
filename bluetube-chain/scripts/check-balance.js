// scripts/check-balance.js
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const bal = await ethers.provider.getBalance(address);
  const net = await ethers.provider.getNetwork();

  console.log("Network:", net.name || net.chainId.toString());
  console.log("Deployer:", address);
  console.log("Balance:", ethers.formatEther(bal), "ETH");
}

main().catch((e) => { console.error(e); process.exit(1); });
