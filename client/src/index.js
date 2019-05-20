const selectStep = step => {
  return document.querySelector(`.step[data-step="${step}"]`);
};

const showStep = (allSteps, activeStep) => {
  console.log('Show active step:', activeStep);
  allSteps.forEach(step => {
    const stepName = step.dataset.step;
    if (stepName === activeStep){
      step.classList.add('step--active');
    } else {
      step.classList.remove('step--active');
    }
  });
};

const main = async () => {
  console.log("Start Application");

  const allStepsDOM = document.querySelectorAll(".step");
  const allSteps = [].slice.call(allStepsDOM);

  const buttonsDOM = document.querySelectorAll("button");
  const buttons = [].slice.call(buttonsDOM);

  showStep(allSteps, "intro");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const parent = button.parentElement;
      const currentStep = parent.dataset.step;

      switch (currentStep) {
        case "intro": {
          showStep(allSteps, "connect-wallet");
          break;
        }
        case "connect-wallet": {
          // Activate Metamask here

          //showStep(allSteps, "connect-wallet");
          break;
        }
        case "win": {
          showStep(allSteps, "game-rules");
          break;
        }
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
