import Web3 from "web3";
import { makeTransfer, getBalance, getTokenContract, tokenBalanceChange } from '../../server/wallet/rpc-proxy';
import { TOKEN_ADDRESS } from '../../server/wallet/config';
import { showStep, turn, clearGameField, setGameField, hideGameField, showGameField } from "./utility";
import { activateWallet, plasma, rpc } from "./plasma";
import {helpers, Tx, Input, Output, Outpoint} from "leap-core";

const GAME_SERVER = 'http://localhost:3000/game';

export const fetchPost = async (endpoint, payload) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  const transport = {
    method: "POST",
    mode: "cors",
    cache: "default",
    headers,
    body: JSON.stringify(payload)
  };
  return await fetch(endpoint, transport).then(async response => {
    return await response.json().then(json => json);
  });
};

const wallet = window.ethereum ? new Web3(window.ethereum) : null;
const balanceOf = getBalance(TOKEN_ADDRESS, rpc);
const tokenContract = getTokenContract(TOKEN_ADDRESS, rpc);

const completeRound = async (word, wallet, account, currentRound) => {
  console.log(word, wallet, account, currentRound);
  const roundBet = 100000000;
  const color = 0;
  const { roundAddress } = currentRound;
  const utxos = await plasma.getUnspent(account);
  const inputs = helpers.calcInputs(utxos, account, roundBet, color);
  const outputs = helpers.calcOutputs(utxos, inputs, account, roundAddress, roundBet, color);
  const playerTransaction = Tx.transfer(inputs, outputs);
  const signedTransaction = await playerTransaction.signWeb3(wallet);
  const receipt = await plasma.eth.sendSignedTransaction(signedTransaction.hex());
  console.log(receipt);

  return receipt;
};

const main = async () => {
  console.log("Start Application");

  const allStepsDOM = document.querySelectorAll(".step");
  const allSteps = [].slice.call(allStepsDOM);

  const buttonsDOM = document.querySelectorAll("button");
  const buttons = [].slice.call(buttonsDOM);

  let account = null;

  showStep("intro");
  // showStep("game-round");

  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      const parent = button.parentElement;
      const currentStep = parent.dataset.step;
      const progress = parent.querySelector('.progress');

      switch (currentStep) {
        case "intro": {
          showStep("connect-wallet");
          break;
        }
        case "connect-wallet": {
          turn('off', button);
          turn('on', progress);
          const accounts = await activateWallet();
          turn('off', progress);
          if (!accounts){
            turn('on', button);
          } else {
            account = accounts[0]; // take first account
            console.log(account);
            showStep("game-rules");
          }
          break;
        }

        case "game-rules": {
          showStep("game-round");
          break;
        }

        case "game-round": {
          turn('off',button);
          turn('on', progress);
          clearGameField();
          const endpoint = GAME_SERVER+'/startRound';
          const round = await fetchPost(endpoint, {playerAddress: account});
          const { words, roundAddress } = round;
          console.log(round);
          //const words = ['kind', 'fur', 'captain', 'halfway'];
          setGameField(words);
          turn('off',progress);

          const wordsButtonsDOM = document.querySelectorAll('.word-toast');
          const wordsButtons = [].slice.call(wordsButtonsDOM);
          console.log(wordsButtons.length);
          wordsButtons.forEach(wordButton => {
            wordButton.addEventListener("click", async () => {
              const selectedWord = wordButton.innerHTML;
              const progress = parent.querySelector('.progress');
              hideGameField();
              turn('on', progress);
              const roundBalance = (await balanceOf(roundAddress)).toString();
              console.log('Round Balance:', roundBalance);
              const roundHash = await completeRound(selectedWord, wallet, account, round);
              const newRoundBalance = await tokenBalanceChange({
                contract: tokenContract,
                address: roundAddress,
                prevBalance: roundBalance,
              }, plasma);
              console.log('New Round Balance:', newRoundBalance);

              // Try to sign spending condition right here
              

              console.log(roundHash);
            })
          });
        }

        case "win":
        case "lose":
          showStep("game-round");
          break;

        default: {
          return;
        }
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  main();
});
