const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { SigningStargateClient } = require("@cosmjs/stargate");
const Big = require("big.js");
const Coingecko = require("coingecko-api");

/**
 * @typedef {Object} Chain
 * @property {string} RpcEndpoint - The RPC endpoint.
 * @property {string} LcdEndpoint - The LCD endpoint.
 * @property {number} decimalPrecision - The decimal precision.
 * @property {string} coingeckoId - The CoinGecko ID.
 * @property {string} bench32prefix - The Bech32 prefix.
 * @property {string} denom - The denomination.
 * @property {string} coinName - The coin name.
 * @property {Object} gasParam - The gas parameters.
 * @property {string} gasParam.gas - The gas.
 * @property {number} gasParam.amount - The amount.
 */

/**
 * @typedef {String} mnemonic
 */
/**
 * @typedef {SigningStargateClient | undefined} client
 */
/**
 * @typedef {DirectSecp256k1HdWallet | undefined} wallet
 */

/**
 * @class
 * @classdesc Bridge class for handling transactions.
 */
class Bridge {
  /**
   * @constructor
   * @param {Chain} chain - The chain object.
   * @param {mnemonic} mnemonic - The mnemonic string.
   */
  constructor(chain, mnemonic) {
    this.chain = chain;
    this.mnemonic = mnemonic;
  }

  /**
   * @async
   * @method
   * @description Initializes the wallet and client.
   * @returns {Promise<Bridge>} The Bridge instance.
   */
  async _initialize() {
    try {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: this.chain.bench32prefix,
      });

      this.client = await SigningStargateClient.connectWithSigner(
        this.chain.RpcEndpoint,
        this.wallet
      );
      return this;
    } catch (e) {
      console.log(e);
      return this;
    }
  }

  /**
   * @async
   * @method
   * @description Gets the address of the wallet.
   * @returns {Promise<string>} The address.
   */
  async getAddress() {
    try {
      let [firstAccount] = await this.wallet.getAccounts();
      let address = firstAccount.address;
      return address;
    } catch (e) {
      console.log(e);
      return "error";
    }
  }

  /**
   * @async
   * @method
   * @description Gets the balance of the wallet.
   * @param {string} adderss - The address to get the balance for.
   * @returns {Promise<Object>} The balance.
   */
  async getBalance(adderss) {
    let address = adderss ? adderss : await this.getAddress();
    let amountBase = (await this.client.getBalance(address, this.chain.denom))
      .amount;
    return {
      base: amountBase,
      asset: this.baseToAsset(amountBase),
    };
  }
  /**
   * @method
   * @description Converts base amount to asset amount.
   * @param {string} amount - The base amount.
   * @returns {string} The asset amount.
   */
  baseToAsset(amount) {
    const bigAmount = new Big(amount);
    const bigPrecision = new Big(this.chain.decimalPrecision);
    return bigAmount.div(bigPrecision).toString();
  }

  /**
   * @method
   * @description Converts asset amount to base amount.
   * @param {string} amount - The asset amount.
   * @returns {string} The base amount.
   */
  assetToBase(amount) {
    const bigAmount = new Big(amount);
    const bigPrecision = new Big(this.chain.decimalPrecision);
    return bigAmount.times(bigPrecision).toString();
  }

  /**
   * @async
   * @method
   * @description Gets the USD value of the asset amount.
   * @param {number} amount - The asset amount.
   * @returns {Promise<number>} The USD value.
   */
  async getUsdByAsset(amount) {
    const CoinGeckoClient = new Coingecko();
    let data = await CoinGeckoClient.simple.price({
      ids: [this.chain.coingeckoId],
      vs_currencies: ["usd"],
    });

    let price = data.data[this.chain.coingeckoId].usd;

    return amount * price;
  }

  /**
   * @async
   * @method
   * @description Sends tokens to a recipient.
   * @param {string} amountToSend - The amount to send.
   * @param {string} recipient - The recipient address.
   * @param {string} memo - The memo for the transaction.
   * @returns {Promise<string|Object>} The transaction hash or an error object.
   */
  async tip(amountToSend, recipient, memo) {
    let address = await this.getAddress();
    let balance = await this.getBalance();

    // Create Big.js instances
    let balanceBig = new Big(balance.base);
    let amountToSendBig = new Big(amountToSend);
    let gasAmountBig = new Big(this.chain.gasParam.amount);

    // balance - sending will return the amount the user will have in the future, then if its smaller than the gas stop the tx
    if (balanceBig.minus(amountToSendBig).lt(gasAmountBig)) {
      return {
        error: "nogas",
        gas: this.chain.gasParam.amount,
        message: `You are unable to pay the ${this.baseToAsset(
          this.chain.gasParam.amount.toString()
        )} ${this.chain.coinName} gas fee`,
      };
    }

    try {
      const res = await this.client.sendTokens(
        address,
        recipient,
        [
          {
            denom: this.chain.denom,
            amount: amountToSendBig.toString(),
          },
        ],
        {
          gas: this.chain.gasParam.gas,
          amount: [
            {
              denom: this.chain.denom,
              amount: this.chain.gasParam.amount.toString(),
            },
          ],
        },
        memo
      );

      return res.transactionHash;
    } catch (e) {
      console.log(e);
      return {
        error: true,
        message: e.log,
      };
    }
  }
}

module.exports = { Bridge };
