import web3 from "web3";
import { showStep, turn, clearGameField, setGameField } from "./utility";
import { activateWallet } from "./plasma";

const GAME_SERVER = 'http://localhost:3000/game';

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
          const response = await fetch(GAME_SERVER+'/startRound')
          const {words} = await response.json();
          setGameField(words);
          turn('off',progress);
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
