// bluetube-chain/hardhat.config.cjs
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").trim();
const RPC_BASE = process.env.RPC_BASE || "https://mainnet.base.org";
const RPC_BASE_SEPOLIA = process.env.RPC_BASE_SEPOLIA || "https://sepolia.base.org";

// helper: return [pk] only when it's valid (0x + 64 hex)
function getAccounts() {
  return /^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY) ? [PRIVATE_KEY] : [];
}

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    base:        { url: RPC_BASE,         accounts: getAccounts() },
    baseSepolia: { url: RPC_BASE_SEPOLIA, accounts: getAccounts() },
  },
};
