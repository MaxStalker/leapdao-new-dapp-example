const ethers = require("ethers");
const { TOKEN_ADDRESS, RPC_URL, WALLET_MNEMONIC } = require("./config");
const { getTokenColor, getTokenContract, makeTransfer, tokenBalanceChange } = require("./rpc-proxy");

const plasma = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet.fromMnemonic(WALLET_MNEMONIC);
let tokenContract;
let tokenColor;

const getPlasma = () => plasma;
const getWallet = () => wallet;

module.exports = {
  getWallet,
  getPlasma
};
