// bluetube-chain/hardhat.config.cjs
require("@nomicfoundation/hardhat-toolbox");

// force dotenv to load the .env that lives in THIS folder,
// even if you run commands from somewhere else
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const PRIVATE_KEY        = process.env.PRIVATE_KEY || "";
const RPC_BASE           = process.env.RPC_BASE || "https://mainnet.base.org";
const RPC_BASE_SEPOLIA   = process.env.RPC_BASE_SEPOLIA || "https://sepolia.base.org";

const getAccounts = () =>
  PRIVATE_KEY.startsWith("0x") && PRIVATE_KEY.length > 2 ? [PRIVATE_KEY] : [];

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},                                // in-process
    localhost: { url: "http://127.0.0.1:8545" },// external node from step 1
    base:        { url: RPC_BASE,         accounts: ACCOUNTS },
    baseSepolia: { url: RPC_BASE_SEPOLIA, accounts: ACCOUNTS },
  },
};