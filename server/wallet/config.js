const dotenv = require("dotenv");
dotenv.config();

// RPC URL: STAGING
const RPC_URL = "https://staging-testnet.leapdao.org/rpc";
//const RPC_URL = "https://testnet-node1.leapdao.org";

// TOKEN ADDRESS: STAGING LEAP
const TOKEN_ADDRESS = "0x0666eBbF26CDE07EA79FeCAe15e5f18394EBC149";

// TOKEN ADDRESS: TESTNET LEAP
//const TOKEN_ADDRESS = "0xD2D0F8a6ADfF16C2098101087f9548465EC96C98";

// Get WALLET_MNEMONI from .env file
const { WALLET_MNEMONIC } = process.env;

module.exports = {
  WALLET_MNEMONIC,
  TOKEN_ADDRESS,
  RPC_URL
};
