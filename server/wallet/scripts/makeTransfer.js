const ethers = require("ethers");
const {
  getBalance,
  getTokenColor,
  getTokenContract,
  makeTransfer,
  tokenBalanceChange
} = require("../rpc-proxy");
const { HOUSE_WALLET_MNEMONIC } = require("../../integration/mnemonics");
const { RPC_URL, TOKEN_ADDRESS } = require("../config");
const { showLog } = require("../../utils/utility");
const { parseEther } = ethers.utils;

async function main() {
  const plasma = new ethers.providers.JsonRpcProvider(RPC_URL);
  const fundWallet = new ethers.Wallet.fromMnemonic(HOUSE_WALLET_MNEMONIC);
  const tokenContract = await getTokenContract(TOKEN_ADDRESS, plasma);
  const balanceOf = getBalance(TOKEN_ADDRESS, plasma);
  const recipient = "0xF9f6607C019CcE7222815C04C303099527FF4A38";

  const initialRecipientBalance = await balanceOf(recipient);
  showLog(initialRecipientBalance.toString(), "Initial Balance");

  const transferOptions = {
    privateKey: fundWallet.privateKey,
    from: fundWallet.address,
    to: recipient,
    color: await getTokenColor(TOKEN_ADDRESS, plasma),
    amount: parseEther("0.00001").toString()
  };
  const transactionHash = await makeTransfer(transferOptions, plasma);
  showLog(transactionHash, "Transfer Transaction Hash");

  const options = {
    contract: tokenContract,
    address: recipient,
    prevBalance: initialRecipientBalance
  };
  const newRecipientBalance = await tokenBalanceChange(options);
  showLog(newRecipientBalance.toString(), "New Balance");
  process.exit(0);
}

main();
