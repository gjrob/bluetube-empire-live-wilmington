async function main() {
  const [me] = await ethers.getSigners();
  console.log("Deployer:", me.address);

  const payout = process.env.NEXT_PUBLIC_PAYOUT_ADDRESS || me.address;

  const BLU = await ethers.getContractFactory("BlueTubeCoin");
  const blu = await BLU.deploy(); await blu.deployed();

  const NFT = await ethers.getContractFactory("MomentMint");
  const nft = await NFT.deploy(payout); await nft.deployed();

  const TIP = await ethers.getContractFactory("TipJar");
  const tip = await TIP.deploy(payout); await tip.deployed();

  console.log("BLU:", blu.address);
  console.log("MomentMint:", nft.address);
  console.log("TipJar:", tip.address);
}
main().catch(e => { console.error(e); process.exit(1); });
