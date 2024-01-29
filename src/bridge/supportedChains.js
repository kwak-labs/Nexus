const ChainData = {
  Cosmos: {
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
  Secret: {
    RpcEndpoint: "https://secret-4.api.trivium.network:26657",
    LcdEndpoint: "https://secret-4.api.trivium.network:1317",
    decimalPrecision: 1000000,
    coingeckoId: "secret",
    bench32prefix: "secret",
    denom: "uscrt",
    coinName: "SCRT",
    gasParam: {
      gas: "180000",
      amount: 4500,
    },
  },
  Stargaze: {
    RpcEndpoint: "https://stargaze-rpc.polkachu.com",
    LcdEndpoint: "https://api-stargaze-ia.cosmosia.notional.ventures/",
    decimalPrecision: 1000000,
    coingeckoId: "stargaze",
    bench32prefix: "stars",
    denom: "ustars",
    coinName: "Stars",
    gasParam: {
      gas: "180000",
      amount: 180000,
    },
  },
  Vidulum: {
    RpcEndpoint: "https://mainnet-rpc.vidulum.app/",
    LcdEndpoint: "https://mainnet-lcd.vidulum.app",
    decimalPrecision: 1000000,
    coingeckoId: "vidulum",
    bench32prefix: "vdl",
    denom: "uvdl",
    coinName: "VDL",
    gasParam: {
      gas: "300000",
      amount: 50000,
    },
  },
};

const OptionBuilder = [
  {
    name: "Atom",
    value: "Cosmos",
  },
  {
    name: "Stars",
    value: "Stargaze",
  },
  {
    name: "Scrt",
    value: "Secret",
  },
  {
    name: "VDL",
    value: "Vidulum",
  },
  {
    name: "Kava",
    value: "Kava",
  },
  {
    name: "Juno",
    value: "Juno",
  },
];

module.exports = { OptionBuilder, ChainData };
