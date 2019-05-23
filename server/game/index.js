const ethers = require("ethers");
const { ripemd160 } = require("ethereumjs-util");
const wordGame = require("../build/contracts/WordGame");
const getWords = require("random-words");
const { replaceAll, sliceZero } = require("../utils/generic");
const {
  getTokenContract,
  getTokenColor,
  makeTransfer,
  tokenBalanceChange
} = require("../wallet/rpc-proxy");
const { TOKEN_ADDR, ROUND_ID, PLAYER, HOUSE, ANSWER } = require("./masks");

const generateNewRound = async (
  { houseWallet, playerAddress, tokenAddress, roundBet = 100000000 },
  plasma
) => {
  const { utils } = ethers;

  // House params
  const houseAddress = houseWallet.address;
  const housePrivateKey = houseWallet.privateKey;

  // Token Color
  const tokenColor = await getTokenColor(tokenAddress, plasma);
  const tokenContract = await getTokenContract(tokenAddress, plasma);

  // We gonna use timestamp for a nounce
  const time = new Date().getTime().toString();
  const roundId = utils.formatBytes32String(time);
  const words = getWords({ exactly: 4, maxLength: 8 });
  const pick = Math.floor(Math.random() * 4);
  const answer = words[pick];
  const answerBytes32 = utils.formatBytes32String(answer);

  // Prepare Game
  let codeBuffer = wordGame.deployedBytecode;
  codeBuffer = replaceAll(codeBuffer, ROUND_ID, sliceZero(roundId));
  codeBuffer = replaceAll(codeBuffer, TOKEN_ADDR, sliceZero(tokenAddress));
  codeBuffer = replaceAll(codeBuffer, ANSWER, sliceZero(answerBytes32));
  codeBuffer = replaceAll(codeBuffer, PLAYER, sliceZero(playerAddress));
  codeBuffer = replaceAll(codeBuffer, HOUSE, sliceZero(houseAddress));

  const roundScript = Buffer.from(codeBuffer.replace("0x", ""), "hex");
  const roundBuffer = ripemd160(codeBuffer, false);
  const roundAddress = `0x${roundBuffer.toString("hex")}`;

  // Fund round condition
  // Please note, that currently funding transaction need to be paid in LEAP
  //const gasFee = 15000000; // set any number here we can get proper value here later
  const gasFee = 5890000;
  const gasTransaction = await makeTransfer(
    {
      privateKey: housePrivateKey,
      color: tokenColor,
      from: houseAddress,
      to: roundAddress,
      amount: gasFee
    },
    plasma
  );
  const roundBalance = await tokenBalanceChange({
    contract: tokenContract,
    address: roundAddress,
    prevBalance: 0
  });

  return {
    words,
    answer,
    roundId,
    roundAddress,
    roundScript,
    roundBalance
  };
};

module.exports = {
  generateNewRound
};
