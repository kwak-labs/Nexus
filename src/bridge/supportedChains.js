const ChainData = {
  Atom: {
    RpcEndpoint: "https://cosmos-rpc.polkachu.com",
    LcdEndpoint: "https://cosmos-lcd.polkachu.com",
    decimalPrecision: 1000000,
    coingeckoId: "cosmos",
    bench32prefix: "cosmos",
    denom: "uatom",
    coinName: "ATOM",
    gasParam: {
      gas: "180000",
      amount: 900,
    },
  },
  Juno: {
    RpcEndpoint: "https://rpc-juno-ia.cosmosia.notional.ventures/",
    LcdEndpoint: "https://api-juno-ia.cosmosia.notional.ventures/",
    decimalPrecision: 1000000,
    coingeckoId: "juno-network",
    bench32prefix: "juno",
    denom: "ujuno",
    coinName: "Juno",
    gasParam: {
      gas: "180000",
      amount: 350,
    },
  },
  Kava: {
    RpcEndpoint: "https://rpc-kava-ia.cosmosia.notional.ventures/",
    LcdEndpoint: "https://api-kava-ia.cosmosia.notional.ventures/",
    decimalPrecision: 1000000,
    coingeckoId: "kava",
    bench32prefix: "kava",
    denom: "ukava",
    coinName: "Kava",
    gasParam: {
      gas: "180000",
      amount: 8500,
    },
  },
  Stars: {
    RpcEndpoint: "https://stargaze-rpc.polkachu.com",
    LcdEndpoint: "https://api-stargaze-ia.cosmosia.notional.ventures/",
    decimalPrecision: 1000000,
    coingeckoId: "stargaze",
    bench32prefix: "stars",
    denom: "ustars",
    coinName: "Stars",
    gasParam: {
      gas: "180000",
      amount: 100000,
    },
  },
  // Testnet
  Elys: {
    RpcEndpoint: "https://rpc.testnet.elys.network/",
    LcdEndpoint: "https://api.testnet.elys.network/",
    decimalPrecision: 1000000,
    coingeckoId: "none",
    bench32prefix: "elys",
    denom: "uelys",
    coinName: "tELYS",
    gasParam: {
      gas: "180000",
      amount: 8500,
    },
  },

  // Testnet USDC for Elys
  "Elys USDC": {
    RpcEndpoint: "https://rpc.testnet.elys.network/",
    LcdEndpoint: "https://api.testnet.elys.network/",
    decimalPrecision: 1000000,
    coingeckoId: "none",
    bench32prefix: "elys",
    denom:
      "ibc/2180E84E20F5679FCC760D8C165B60F42065DEF7F46A72B447CFF1B7DC6C0A65",
    coinName: "elys_USDC",
    gasParam: {
      gas: "180000",
      amount: 8500,
    },
  },
};

const OptionBuilder = [
  {
    name: "Atom",
    value: "Atom",
  },
  {
    name: "Stars",
    value: "Stars",
  },
  {
    name: "Scrt",
    value: "Secret",
  },
  {
    name: "Kava",
    value: "Kava",
  },
  {
    name: "Juno",
    value: "Juno",
  },
  {
    name: "Elys",
    value: "Elys",
  },
  {
    name: "Elys USDC",
    value: "Elys USDC",
  },
];

module.exports = { OptionBuilder, ChainData };
