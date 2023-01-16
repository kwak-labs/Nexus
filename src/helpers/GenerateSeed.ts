import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

/**
 *
 * Generates a seed phrase
 *
 *  @param {number} length The amount of words the seed has
 * @returns {string} Returns the seed

 *
 */
export async function generateSeed(length: 12 | 15 | 18 | 21 | 24): Promise<string> {
  const wallet = await DirectSecp256k1HdWallet.generate(length);
  return wallet.mnemonic;
}
