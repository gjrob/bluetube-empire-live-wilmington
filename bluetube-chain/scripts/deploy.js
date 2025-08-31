// scripts/deploy.js
const { ethers } = require("hardhat");

function cleanAddr(s) {
  if (!s) return null;
  const t = s.trim();
  return /^0x[0-9a-fA-F]{40}$/.test(t) ? t : null;
}

async function main() {
  const [me] = await ethers.getSigners();

  // Only trust NEXT_PUBLIC_PAYOUT_ADDRESS if it’s a real 0x… address; otherwise use deployer
  const envPayout = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS || "";
  const payout = cleanAddr(envPayout) || me.address;

  console.log("Deployer:", me.address);
  console.log("Payout:", payout, cleanAddr(envPayout) ? "" : "(using deployer; invalid or missing NEXT_PUBLIC_PAYOUT_ADDRESS)");

  // --- BLU (ERC20)
  const BLU = await ethers.getContractFactory("BlueTubeCoin");
  const blu = await BLU.deploy();
  await blu.waitForDeployment();
  const bluAddr = await blu.getAddress();
  console.log("BLU:", bluAddr);

  // --- NFT (MomentMint)
  const NFT = await ethers.getContractFactory("MomentMint");
  const nft = await NFT.deploy(payout);
  await nft.waitForDeployment();
  const nftAddr = await nft.getAddress();
  console.log("MomentMint:", nftAddr);

  // --- TipJar
  const TIP = await ethers.getContractFactory("TipJar");
  const tip = await TIP.deploy(payout);
  await tip.waitForDeployment();
  const tipAddr = await tip.getAddress();
  console.log("TipJar:", tipAddr);
}

main().catch((e) => { console.error(e); process.exit(1); });

