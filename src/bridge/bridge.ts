import { DirectSecp256k1HdWallet, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Coin, SigningStargateClient } from '@cosmjs/stargate';

import Coingecko from 'coingecko-api';
import { Console } from 'console';

interface IBridge {
  chain: Chain;
  mnemonic: string;
  wallet: DirectSecp256k1HdWallet | undefined;
  client: SigningStargateClient | undefined;

  _initialize: () => Promise<{ coinname: string; success: boolean }>;
  getAddress: () => Promise<string>;
  baseToAsset: (amount: string) => string;
  assetToBase: (amount: string) => number;
  getUsdByAsset: (amount: number) => Promise<number>;
  tip: (amountToSend: string, recipient: string, memo?: string) => Promise<string | NoGas>;
  rain: (messages: [], amount: string, memo: string) => Promise<string | NoGas>;
}

export class Bridge implements IBridge {
  chain: Chain;
  mnemonic: string;
  client: SigningStargateClient | undefined;
  wallet: DirectSecp256k1HdWallet | undefined;

  constructor(chain: Chain, mnemonic: string) {
    this.chain = chain;
    this.mnemonic = mnemonic;
  }

  // ! Why cant a constructor be async
  public async _initialize(): Promise<{ coinname: string; success: boolean }> {
    try {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, {
        prefix: this.chain.bench32prefix,
      });

      this.client = await SigningStargateClient.connectWithSigner(
        this.chain.RpcEndpoint,
        this.wallet,
      );
      return {
        coinname: this.chain.coinName,
        success: true,
      };
    } catch (e) {
      console.log(e);
      return {
        coinname: this.chain.coinName,
        success: false,
      };
    }
  }

  public async getAddress(): Promise<string> {
    try {
      let [firstAccount] = await this.wallet!.getAccounts();
      let address = firstAccount.address;
      return address;
    } catch (e) {
      console.log(e);
      return 'error';
    }
  }

  public async getBalance(adderss?: string): Promise<Amount> {
    let address = adderss ? adderss : await this.getAddress();
    let amountBase = (await this.client!.getBalance(address, this.chain.denom)).amount;
    return {
      base: amountBase,
      asset: this.baseToAsset(amountBase),
    };
  }

  public baseToAsset(amount: string): string {
    return (parseInt(amount) / this.chain.decimalPrecision).toString();
  }

  public assetToBase(amount: string): number {
    return parseFloat(amount) * this.chain.decimalPrecision;
  }

  public async getUsdByAsset(amount: number): Promise<number> {
    const CoinGeckoClient = new Coingecko();
    let data = await CoinGeckoClient.simple.price({
      ids: [this.chain.coingeckoId],
      vs_currencies: ['usd'],
    });

    let price = data.data[this.chain.coingeckoId].usd;

    return amount * price;
  }

  public async tip(amountToSend: string, recipient: string, memo?: string): Promise<string | any> {
    let address = await this.getAddress();
    let balance: Amount = await this.getBalance();

    // balance - sending will return the amount the user will have in the future, then if its smaller than the gas stop the tx
    if (parseInt(balance.base) - parseInt(amountToSend) < this.chain.gasParam.amount) {
      return {
        error: 'nogas',
        gas: this.chain.gasParam.amount,
        message: `You are unable to pay the ${this.baseToAsset(
          this.chain.gasParam.amount.toString(),
        )} ${this.chain.coinName} gas fee`,
      };
    }

    const res = await this.client!.sendTokens(
      address,
      recipient,
      [
        {
          denom: this.chain.denom,
          amount: amountToSend,
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
      memo,
    );
    return res.transactionHash;
  }

  public async rain(messages: [], amount: string, memo: string): Promise<string | any> {
    let address = await this.getAddress();
    let balance: Amount = await this.getBalance();

    let amountOfMessages = messages.length;

    if (parseInt(balance.base) - parseInt(amount) < this.chain.gasParam.amount) {
      return {
        error: 'nogas',
        gas: this.chain.gasParam.amount,
        message: `You are unable to pay the ${this.baseToAsset(
          this.chain.gasParam.amount.toString(),
        )} ${this.chain.coinName} gas fee`,
      };
    }

    const fee = {
      amount: [
        {
          denom: this.chain.denom,
          amount: this.chain.gasParam.amount.toString(),
        },
      ],
      gas: (parseInt(this.chain.gasParam.gas) * amountOfMessages).toString(),
    };

    const res = await this.client!.signAndBroadcast(address, messages, fee, 'Nexus Rain');
    return res.transactionHash;
  }
}

type Chain = {
  RpcEndpoint: string;
  LcdEndpoint: string;
  decimalPrecision: number;
  coingeckoId: string;
  bench32prefix: string;
  denom: string;
  coinName: string;
  gasParam: {
    gas: string;
    amount: number;
  };
};

type Amount = {
  base: string;
  asset: string;
};

type NoGas = { error: string; gas: number; message: string };
