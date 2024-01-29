const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");

/**
 * Generates a seed phrase
 *
 * @param {12 | 15 | 18 | 21 | 24} length The amount of words the seed has
 * @returns {Promise<string>} Returns the seed
 */
async function generateSeed(length) {
  const wallet = await DirectSecp256k1HdWallet.generate(length);
  return wallet.mnemonic;
}

module.exports = { generateSeed };
