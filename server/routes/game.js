const express = require("express");
const router = express.Router();
const ethers = require('ethers');
const getWords = require("random-words");
const { fundGas, fundCondition } = require("../wallet/wallet");

const newRoundAddress = (words, lockWord) =>{
  const lockBytes32 = ethers.utils.formatBytes32String(lockWord);
  console.log(lockBytes32);

  return ""
};

/* GET home page. */
router.get("/startRound", (req, res) => {
  const words = getWords({ exactly: 4, maxLength: 8 });
  const pick = Math.floor(Math.random() * 4);
  const lockWord = words[pick];
  const roundAddress = newRoundAddress(words, lockWord);
  console.log({roundAddress});
  // 1) fund transaction
  // 2) send transaction address

  res.status(200).send({ roundAddress, words });
});

module.exports = router;
