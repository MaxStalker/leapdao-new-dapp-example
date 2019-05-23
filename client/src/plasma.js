import Web3 from "web3";
import * as ethers from "ethers";
import { helpers } from "leap-core";
import { PLASMA_PROVIDER, TOKEN_ADDRESS } from "./const";
import TOKEN_ABI from "./contracts/erc20Abi";

let tokenColor = null;
export const rpc = new ethers.providers.JsonRpcProvider(PLASMA_PROVIDER);
export const plasma = helpers.extendWeb3(new Web3(PLASMA_PROVIDER));
const tokenContract = new plasma.eth.Contract(TOKEN_ABI, TOKEN_ADDRESS);

// If installed, Metamask will expose ethereum object on window
const { ethereum } = window;
//const wallet = ethereum ? new Web3(ethereum) : null;

export const getBalance = async account => {
  const balance = await tokenContract.methods.balanceOf(account).call();
  console.log("Balance:", balance);
  return balance;
};

export const getColor = async () => {
  if (!tokenColor) {
    tokenColor = await plasma.getColor(TOKEN_ADDRESS);
  }
  return tokenColor;
};

export const activateWallet = async () => {
  return await ethereum.enable();
};
