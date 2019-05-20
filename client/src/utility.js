export const selectActiveStep = () => {
  return document.querySelector(".step--active");
};

export const selectStep = step => {
  return document.querySelector(`.step[data-step="${step}"]`);
};

export const showStep = activeStep => {
  selectActiveStep().classList.remove("step--active");
  selectStep(activeStep).classList.add("step--active");
};

const renderWord = word => `<button class="word-toast">${word}</button>`;
const renderWordSet = words =>
  words.reduce((acc, word) => acc + renderWord(word), "");

//export const gameField = document.querySelector(".game-field");
export const clearGameField = () => {
  document.querySelector(".game-field").innerHTML = "";
};

export const setGameField = words =>
  (document.querySelector(".game-field").innerHTML = renderWordSet(words));

export const turn = (state, node) => {
  if (state === "on") {
    node.style.display = "block";
  } else {
    node.style.display = "none";
  }
};
