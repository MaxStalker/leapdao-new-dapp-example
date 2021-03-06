const ethers = require("ethers");
const { Tx, Output, Outpoint } = require("leap-core");

// RPC Calls
const GET_COLOR = "plasma_getColor";
const GET_UNSPENT = "plasma_unspent";
const RAW = "eth_sendRawTransaction";
const GET_TX = "eth_getTransactionByHash";
const GET_RECEIPT = "eth_getTransactionReceipt";
const CHECK_CONDITION = "checkSpendingCondition";
const rpcMessages = {
  RAW,
  GET_COLOR,
  GET_UNSPENT,
  GET_TX,
  GET_RECEIPT,
  CHECK_CONDITION
};

// ABI
const erc20Abi = require("./abis/erc20Abi");

const colors = {};
const contracts = {};

const getTokenColor = async (tokenAddress, plasma) => {
  const storedColor = colors[tokenAddress];
  if (storedColor) {
    return storedColor;
  }
  const tokenColor = parseInt(await plasma.send(GET_COLOR, [tokenAddress], 16));
  colors[tokenAddress] = tokenColor;
  return tokenColor;
};
const getTokenContract = (tokenAddress, plasma) => {
  const storedContract = contracts[tokenAddress];
  if (storedContract) {
    return storedContract;
  }
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, plasma);
  contracts[tokenAddress] = tokenContract;
  return tokenContract;
};
const getBalance = (tokenAddress, plasma) => {
  return async function(address) {
    const contract = getTokenContract(tokenAddress, plasma);
    return await contract.balanceOf(address);
  };
};
const getTransaction = async (txHash, plasma) => {
  return plasma.send(GET_TX, [txHash]);
};
const getUnspentOutputs = async (from, color, plasma) => {
  const raw = await plasma.send(GET_UNSPENT, [from, color]);
  return raw.map(utxo => ({
    output: Output.fromJSON(utxo.output),
    outpoint: Outpoint.fromRaw(utxo.outpoint) // TODO check if we can use JSON
  }));
};
const makeTransfer = async (options, plasma) => {
  const { from, to, color, amount, privateKey } = options;
  const utxos = await getUnspentOutputs(from, color, plasma);
  const rawTx = Tx.transferFromUtxos(utxos, from, to, amount, color)
    .signAll(privateKey)
    .hex();
  try {
    return await plasma.send(RAW, [rawTx]);
  } catch (e) {
    console.log("Error during send");
    console.log(e.message);
  }
};
const tokenBalanceChange = async options => {
  const {
    contract,
    address,
    prevBalance,
    showProgress = true,
    maxTries = 15
  } = options;

  let currentBalance;
  let tempBalance;

  if (prevBalance) {
    tempBalance = prevBalance.toString();
    currentBalance = prevBalance;
  } else {
    tempBalance = (await contract.balanceOf(address)).toString();
    currentBalance = tempBalance;
  }

  let i = 0;
  do {
    i++;
    await new Promise(resolve => setInterval(resolve, 1000));
    currentBalance = (await contract.balanceOf(address)).toString();
    if (showProgress) {
      if (process && process.stdout) {
        process.stdout.write(
          `\r   🕐 Waiting for balance change. Seconds passed: ${i}`
        );
      } else {
        console.log(`🕐 Waiting for balance change. Seconds passed: ${i}`);
      }
    }
  } while (currentBalance === tempBalance && i < maxTries);

  const formattedBalance = currentBalance.toString();
  showProgress && console.log(`\n   ✅ Balance changed: ${formattedBalance}`);

  return currentBalance;
};

const checkCondition = async options => {
  // Add actual code for spending condition
  return true;
};

module.exports = {
  rpcMessages,
  getTokenColor,
  getTokenContract,
  getBalance,
  getTransaction,
  getUnspentOutputs,
  makeTransfer,
  tokenBalanceChange
};
