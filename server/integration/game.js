const got = require("got");
const ethers = require("ethers");
const { ripemd160 } = require("ethereumjs-util");
const {
  HOUSE_WALLET_MNEMONIC,
  PLAYER_WALLET_MNEMONIC
} = require("./mnemonics");
const { showLog, replaceAll, toEth } = require("../utils/utility");
const { fundGas } = require("../wallet/wallet");
const {
  getBalance,
  getTokenColor,
  tokenBalanceChange,
  makeTransfer,
  getUnspentOutputs
} = require("../wallet/rpc-proxy");
const { RPC_URL, TOKEN_ADDRESS } = require("../wallet/config");

async function requestFaucet(address, color) {
  /*
  * curl -X POST -H 'Content-Type: application/json'
  * -d '{"address":"0x8db6B632D743aef641146DC943acb64957155388",
  * "color": 2}'
  *
  * */
  console.log(`Requesting faucet for ${address} token ${color}`);
  const faucet =
    "https://dlsb7da2r7.execute-api.eu-west-1.amazonaws.com/staging/address";
  try {
    const response = await got(faucet, {
      method: "POST",
      json: true,
      body: {
        address,
        color
      }
    });
    console.log(response.body);
    return response.body;
  } catch (error) {
    console.log(error.body.errorMessage);
    return false;
  }
}

async function checkBalances({ playerAddress, houseAddress }) {
  if (parseInt(initialPlayerBalance) === 0) {
    console.log("Player Balance is zero, requesting faucet...");
    const faucetResponse = await requestFaucet(playerAddress, 0);
    showLog({ faucetResponse }, "Player Faucet");
  }

  if (parseInt(initialHouseBalance) === 0) {
    console.log("House Balance is zero, requesting faucet...");
    const faucetResponse = await requestFaucet(houseAddress, 0);
    showLog({ faucetResponse }, "Player Faucet");
  }
}
async function createRound() {
  return {
    words: [],
    roundHash: "0x1111111111111111111111111111111111111337"
  };
}
async function fundCondition() {
  return "";
}
async function sendAnswer() {
  return "";
}

async function main() {
  // Setup RPC and plasma
  const plasma = new ethers.providers.JsonRpcProvider(RPC_URL);
  const tokenColor = await getTokenColor(TOKEN_ADDRESS, plasma);
  console.log("Token Color", tokenColor);
  const balanceOf = getBalance(TOKEN_ADDRESS, plasma);

  // Setup House Wallet
  const houseWallet = new ethers.Wallet.fromMnemonic(HOUSE_WALLET_MNEMONIC);
  const houseAddress = houseWallet.address;
  const initialHouseBalance = await balanceOf(houseAddress);

  // Setup Player Wallet
  const playerWallet = new ethers.Wallet.fromMnemonic(PLAYER_WALLET_MNEMONIC);
  const playerAddress = playerWallet.address;
  const initialPlayerBalance = await balanceOf(playerAddress);

  showLog({ playerAddress, houseAddress }, "Addresses");
  showLog(
    { house: toEth(initialHouseBalance), player: toEth(initialPlayerBalance) },
    "Initial Balances"
  );

  await checkBalances({ playerAddress, houseAddress });
  const { words, roundHash } = await createRound();
  const fundTxHash = await fundCondition(roundHash, plasma);
  const resultTxHash = await sendAnswer(plasma);
}

// TODO: Catch errors in main
main();
