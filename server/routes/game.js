var express = require('express');
var router = express.Router();
const getWords = require('random-words');

/* GET home page. */
router.get('/startRound', (req, res) =>{
  const words = getWords({exactly: 4, maxLength: 8});

  // 1) fund transaction
  // 2) send transaction address

  res.status(200).send({words});
});

module.exports = router;
