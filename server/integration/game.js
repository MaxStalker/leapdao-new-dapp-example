const got = require("got");
const ethers = require("ethers");
const { Tx, Input, Output } = require("leap-core");
const {
  HOUSE_WALLET_MNEMONIC,
  PLAYER_WALLET_MNEMONIC
} = require("./mnemonics");
const { showLog, toEth } = require("../utils/generic");
const {
  rpcMessages,
  getBalance,
  getTokenColor,
  getTokenContract,
  tokenBalanceChange,
  makeTransfer,
  getUnspentOutputs
} = require("../wallet/rpc-proxy");
const { RPC_URL, TOKEN_ADDRESS } = require("../wallet/config");
const { generateNewRound } = require("../game");
const wordGame = require("../build/contracts/WordGame");

const { CHECK_CONDITION, RAW } = rpcMessages;

// Faucet
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

// Game Loop
async function checkBalances(balanceOf, { playerAddress, houseAddress }) {
  const initialHouseBalance = await balanceOf(houseAddress);
  const initialPlayerBalance = await balanceOf(playerAddress);
  showLog({ playerAddress, houseAddress }, "Addresses");
  showLog(
    { house: toEth(initialHouseBalance), player: toEth(initialPlayerBalance) },
    "Initial Balances"
  );

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

// Main Loop
async function main() {
  // Setup RPC and plasma
  const plasma = new ethers.providers.JsonRpcProvider(RPC_URL);
  const tokenContract = await getTokenContract(TOKEN_ADDRESS, plasma);
  const tokenColor = await getTokenColor(TOKEN_ADDRESS, plasma);
  const balanceOf = getBalance(TOKEN_ADDRESS, plasma);

  // Setup House Wallet
  const houseWallet = new ethers.Wallet.fromMnemonic(HOUSE_WALLET_MNEMONIC);
  const houseAddress = houseWallet.address;
  const housePrivateKey = houseWallet.privateKey;

  // Setup Player Wallet
  const playerWallet = new ethers.Wallet.fromMnemonic(PLAYER_WALLET_MNEMONIC);
  const playerAddress = playerWallet.address;
  const playerPrivateKey = playerWallet.privateKey;

  await checkBalances(balanceOf, { playerAddress, houseAddress });
  const roundBet = 100000000;
  const round = await generateNewRound(
    { houseWallet, playerAddress, roundBet, tokenAddress: TOKEN_ADDRESS },
    plasma
  );
  const { roundScript, ...rest } = round;
  const { answer, roundId, roundAddress, roundBalance } = rest;
  showLog(rest, "Round generated");

  // Prepare Player Answer
  const wordGameABI = new ethers.utils.Interface(wordGame.abi);
  const answerBytes32 = ethers.utils.formatBytes32String(answer);
  const msgData = wordGameABI.functions.roundResult.encode([
    answerBytes32,
    roundId
  ]);

  // Now Player deposits his part of the bet
  const playerTransfer = await makeTransfer(
    {
      from: playerAddress,
      to: roundAddress,
      color: tokenColor,
      amount: roundBet,
      privateKey: playerPrivateKey
    },
    plasma
  );

  const roundBalanceAfterPlayer = await tokenBalanceChange(
    {
      contract: tokenContract,
      address: roundAddress,
      prevBalance: roundBalance
    },
    plasma
  );

  console.log("\n Player funded his part. Now processing house bet \n");

  const houseTransfer = await makeTransfer(
    {
      from: houseAddress,
      to: roundAddress,
      color: tokenColor,
      amount: roundBet,
      privateKey: housePrivateKey
    },
    plasma
  );

  const roundBalanceAfterHouse = await tokenBalanceChange(
    {
      contract: tokenContract,
      address: roundAddress,
      prevBalance: roundBalanceAfterPlayer
    },
    plasma
  );

  // Now we run spending condition
  const utxos = await getUnspentOutputs(roundAddress, tokenColor, plasma);
  const inputs = [
    new Input({
      prevout: utxos[0].outpoint,
      script: roundScript
    }),
    new Input({
      prevout: utxos[1].outpoint
    }),
    new Input({
      prevout: utxos[2].outpoint
    })
  ];
  const outputs = [];
  const unlockTransaction = Tx.spendCond(inputs, outputs);
  unlockTransaction.inputs[0].setMsgData(msgData);
  unlockTransaction.signAll(playerPrivateKey); // TODO: check if we need sign here at all

  const checkUnlockTransaction = await plasma.send(CHECK_CONDITION, [
    unlockTransaction.hex()
  ]);
  showLog(checkUnlockTransaction, "Condition Check Result");
  for (let i = 0; i < checkUnlockTransaction.outputs.length; i++) {
    unlockTransaction.outputs[i] = new Output.fromJSON(
      checkUnlockTransaction.outputs[i]
    );
  }

  const checkUnlockingScriptNew = await plasma.send(CHECK_CONDITION, [
    unlockTransaction.hex()
  ]);
  showLog(checkUnlockingScriptNew, "New Check");
  const finalHash = await plasma.send(RAW, [unlockTransaction.hex()]);
  console.log(finalHash);
  const newRoundBalance = await tokenBalanceChange({
    contract: tokenContract,
    address: roundAddress,
    prevBalance: roundBalanceAfterHouse
  });


  //const fundTxHash = await fundCondition(roundHash, plasma);
  //const resultTxHash = await sendAnswer(plasma);
  process.exit(0);
}

// TODO: Catch errors in main
main();
