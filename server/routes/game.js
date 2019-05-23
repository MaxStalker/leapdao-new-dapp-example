const express = require("express");
const router = express.Router();
const { generateNewRound, finishRound } = require("../game");
const { getPlasma, getWallet } = require("../wallet/wallet");
const { TOKEN_ADDRESS } = require("../wallet/config");

const rounds = {};

/* GET home page. */
router.post("/startRound", async (req, res) => {
  const { playerAddress } = req.body;
  const plasma = getPlasma();
  const houseWallet = getWallet();
  const tokenAddress = TOKEN_ADDRESS;
  const roundBet = 100000000;
  const round = await generateNewRound(
    { houseWallet, playerAddress, tokenAddress, roundBet },
    plasma
  );
  const { roundAddress } = round;
  rounds[roundAddress] = round;

  res.status(200).send(round);
});

router.post("/finishRound", async (req, res) => {
  const { roundAddress } = req.body;
  const round = rounds[roundAddress];
  if (!round) {
    res.status(500).send(JSON.stringify({ message: "Round does not exist" }));
  }
  const roundBet = 100000000;
  const plasma = getPlasma();
  const houseWallet = getWallet();
  const tokenAddress = TOKEN_ADDRESS;
  const { word } = req.body;
  const roundStatus = await finishRound(
    { word, round, roundBet, houseWallet, tokenAddress },
    plasma
  );
  const {answer} = round;
  res.status(200).send({...roundStatus, answer});
});

module.exports = router;
