const express = require("express");
const router = express.Router();
const ethers = require("ethers");
const { generateNewRound } = require("../game");
const { getPlasma, getWallet } = require("../wallet/wallet");
const { TOKEN_ADDRESS } = require("../wallet/config");

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
  console.log(round);
  const { roundAddress, roundId, words, codeBuffer } = round;
  console.log({ codeBuffer });
  // 1) fund transaction
  // 2) send transaction address

  res.status(200).send({ roundAddress, words, roundId, codeBuffer });
});

module.exports = router;
