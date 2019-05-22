const { TOKEN_ADDRESS } = require("./config");
const { getTokenColor, getTokenContract, makeTransfer, tokenBalanceChange } = require("./rpc-proxy");


const fundGas = async ({roundAddress, wallet, plasma})=>{
  const baseTokenAddress = TOKEN_ADDRESS;
  const color = getTokenColor(baseTokenAddress);
  const gasFee = 15000000;
  const from = wallet.address;
  const to =  roundAddress;
  const privateKey = wallet.privateKey;
  let gasTxHash;
  try {
    gasTxHash = await makeTransfer({
      privateKey,
      from,
      to,
      amount: gasFee,
      plasma,
      color,
      logResult: true
    });
  } catch (e) {
    console.log('Error during transfer');
    console.log(e.message);
  }
  const contract = await getTokenContract(baseTokenAddress);
  await tokenBalanceChange({contract, address: roundAddress});
  return gasTxHash;
};

module.exports = {
  fundGas,
  //fundCondition
};
