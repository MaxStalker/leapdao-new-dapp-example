const ethers = require('ethers/index');
const clipboardy = require('clipboardy/index');

async function main() {
  let wallet = ethers.Wallet.createRandom();
  clipboardy.writeSync(wallet.mnemonic);
  console.log("Mnemonic:", wallet.mnemonic);
  console.log("We also wrote put in your clipboard. You welcome :)");
}

main();
